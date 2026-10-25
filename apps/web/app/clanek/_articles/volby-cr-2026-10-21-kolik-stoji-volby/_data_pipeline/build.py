# Kolik stojí volby: náklady voleb do obcí a Senátu 2014–2026 a odměny okrskových komisí podle velikosti okrsku.
#
# Vstupy (raw/ – stažené 23.–24. 10. 2026, v gitu nejsou, viz .gitignore):
#   raw/volby_cz_kv2026/KV2026_data_20261011_csv.zip, KV2026reg20261011_csv.zip  – volby.gov.cz/opendata/kv2026
#   raw/volby_cz_kv2022/KV2022_data_20260328_csv.zip                              – volby.gov.cz/opendata/kv2022 (jen DATUMVOLEB 20220923)
#   raw/volby_cz_senat2026/vysledky_20261009.xml, obvody/vysledky_obce_obvod_N.xml, SE2026reg20261017_csv.zip
#                                                                                 – volby.gov.cz/opendata/se2026
#   raw/csu_cpi_CEN0101E/CEN0101E_uhrn_domacnosti_celkem_CZ.csv                   – ČSÚ, index spotřebitelských cen (úhrn, domácnosti celkem)
#   vstupy/naklady_mf.csv – ručně opsané částky ze závěrečných účtů kapitoly 398 VPS (MF) a ze Zprávy o plnění SR
#                           za 1. pololetí 2026; odkazy a čísla tabulek jsou v souboru.
#
# Odměny členů okrskových komisí (OVK): 2026 vyhláška MV č. 353/2025 Sb., § 5 – předseda a zapisovatel 3 500 Kč,
# místopředseda 3 000 Kč, člen 2 500 Kč; souběh dalších voleb +800 Kč každému. 2022 vyhláška 59/2002 Sb., § 1 –
# předseda 2 200, místopředseda a zapisovatel 2 100, člen 1 800 Kč; souběh +400 Kč.
# Nejmenší komise: 2026 (zákon 88/2024 Sb., § 18) 4 členové v okrscích do 400 voličů, jinak 5;
#                  2022 (491/2001 Sb., § 15) 4 členové v okrscích do 300 voličů, jinak 6.
# Zapisovatel je členem komise. Každá volební strana s kandidátkou v obci (a v senátním obvodu každý kandidát)
# smí do komise delegovat jednoho člena, chybějící místa do minima doplní starosta.
#
# python build.py   → vypíše vystup.txt a zapíše grafy do ../data/
import csv, io, json, os, re, statistics, sys, zipfile, collections

sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "raw")
DATA = os.path.join(os.path.dirname(HERE), "data")
os.makedirs(DATA, exist_ok=True)
OUT = []


def say(*a):
    s = " ".join(str(x) for x in a)
    OUT.append(s)
    print(s)


def cz(x, d=0):
    """Číslo v české sazbě: mezera po tisících, desetinná čárka."""
    s = f"{x:,.{d}f}".replace(",", " ").replace(".", ",")
    return s


def zcsv(zpath, name):
    with zipfile.ZipFile(zpath) as z:
        with z.open(name) as f:
            yield from csv.DictReader(io.TextIOWrapper(f, encoding="utf-8"))


# ---------------------------------------------------------------- ceny (ČSÚ)
# bazický index 2015 = 100 (řada začíná lednem 2015); září 2014 = září 2015 / meziroční index září 2015
cpi, mezirocni = {}, {}
for r in csv.DictReader(open(os.path.join(RAW, "csu_cpi_CEN0101E", "CEN0101E_uhrn_domacnosti_celkem_CZ.csv"), encoding="utf-8")):
    if re.fullmatch(r"\d{4}-\d{2}", r["CASMKMQRM12"]):
        if r["TYPUDAJE4A"] == "IZ2015":
            cpi[r["CASMKMQRM12"]] = float(r["Hodnota"])
        elif r["TYPUDAJE4A"] == "IR":
            mezirocni[r["CASMKMQRM12"]] = float(r["Hodnota"])
cpi["2014-09"] = cpi["2015-09"] / (mezirocni["2015-09"] / 100)
CPI_REF = "2026-09"
say(f"CPI (2015=100): září 2014 {cpi['2014-09']:.2f} (dopočteno), 2018 {cpi['2018-09']}, 2022 {cpi['2022-09']}, 2026 {cpi[CPI_REF]}")
say(f"  růst cen září 2022 → září 2026: {cz(100 * (cpi[CPI_REF] / cpi['2022-09'] - 1), 1)} %,"
    f" září 2018 → září 2026: {cz(100 * (cpi[CPI_REF] / cpi['2018-09'] - 1), 1)} %")

# ---------------------------------------------------------------- náklady (MF)
naklady = list(csv.DictReader(open(os.path.join(HERE, "vstupy", "naklady_mf.csv"), encoding="utf-8")))
voliči = {}  # 2014 a 2018 ze souhrnných výsledků (první UCAST = zastupitelstva obcí celkem), 2022 a 2026 z okrsků níže
for y, f in ((2014, "vysledky_20141010.xml"), (2018, "vysledky_20181005.xml")):
    txt = open(os.path.join(RAW, f"volby_cz_kv{y}", f), encoding="utf-8").read()
    voliči[y] = int(re.search(r'<UCAST [^>]*ZAPSANI_VOLICI="(\d+)"', txt).group(1))


# ---------------------------------------------------------------- okrsky KV
def okrsky_kv(year):
    if year == 2026:
        rows = zcsv(os.path.join(RAW, "volby_cz_kv2026", "KV2026_data_20261011_csv.zip"), "csv_od/kvt3.csv")
        ok = lambda r: r["TYP_FORM"] == "1"
    else:
        rows = zcsv(os.path.join(RAW, "volby_cz_kv2022", "KV2022_data_20260328_csv.zip"), "csv_od/kvt3.csv")
        ok = lambda r: r["DATUMVOLEB"] == "20220923"
    d = {}
    for r in rows:
        if not ok(r):
            continue
        k = (r["OBEC"], r["OKRSEK"])
        o = d.setdefault(k, dict(obec=r["OBEC"], zastup=None, vol=0, vs_obec=0, vs_mc=0, dve=False))
        if r["TYPZASTUP"] == "1":
            o["zastup"] = r["KODZASTUP"]  # obec jako celek (u Prahy a statutárních měst celé město)
            o["vol"] = int(r["VOL_SEZNAM"])
            o["vs_obec"] = int(r["POCET_VS"])
        else:  # městská část / obvod – okrsek volí dvě zastupitelstva
            o["vs_mc"] = int(r["POCET_VS"])
            o["dve"] = True
    return d


# senátní obvody 2026: obce (u Prahy městské části) a počet kandidátů
sen_obce, sen_kand = {}, collections.Counter()
for r in zcsv(os.path.join(RAW, "volby_cz_senat2026", "SE2026reg20261017_csv.zip"), "csv_od/serk.csv"):
    if r["PLATNOST"] == "A":
        sen_kand[r["OBVOD"]] += 1
for fn in os.listdir(os.path.join(RAW, "volby_cz_senat2026", "obvody")):
    ob = re.search(r"_(\d+)\.xml$", fn).group(1)
    txt = open(os.path.join(RAW, "volby_cz_senat2026", "obvody", fn), encoding="utf-8-sig").read()
    for c in re.findall(r'CIS_OBEC="(\d+)"', txt):
        sen_obce[c] = ob
say(f"Senát 2026: {len(sen_kand)} obvodů, {sum(sen_kand.values())} kandidátů, {len(sen_obce)} obcí/MČ v obvodech")

R26 = dict(predseda=3500, zapis=3500, mistop=3000, clen=2500, soubeh=800)
R22 = dict(predseda=2200, zapis=2100, mistop=2100, clen=1800, soubeh=400)


def minimum(year, vol):
    if year == 2026:
        return 4 if vol <= 400 else 5
    return 4 if vol <= 300 else 6


def odmena(n, R, soubehy=0):
    """Základní odměny komise o n členech (předseda, zapisovatel, místopředseda, zbytek řadoví)."""
    return R["predseda"] + R["zapis"] + R["mistop"] + (n - 3) * R["clen"] + n * soubehy * R["soubeh"]


ok26, ok22 = okrsky_kv(2026), okrsky_kv(2022)
for year, d in ((2022, ok22), (2026, ok26)):
    V = sum(o["vol"] for o in d.values())
    say(f"KV {year}: {cz(len(d))} okrsků, {cz(V)} voličů v seznamu, medián {cz(statistics.median(o['vol'] for o in d.values()))} voličů na okrsek")
    voliči[year] = V

# ---- 2026: komise na minimu, horní mez velikosti, odměny na voliče
n_min = n_forced = 0
sum_min_members = sum_max_members = 0
odm_min = odm_max = 0
usetri_1 = 0  # kolik okrsků může přijít o člena, aniž by klesl pod minimum (při plném obsazení stranami)
trida = collections.OrderedDict((k, dict(n=0, vol=0, odm=0, odm_max=0)) for k in
                                ["do 100", "101–200", "201–400", "401–700", "701–1 000", "nad 1 000"])


def tr(v):
    return ("do 100" if v <= 100 else "101–200" if v <= 200 else "201–400" if v <= 400 else
            "401–700" if v <= 700 else "701–1 000" if v <= 1000 else "nad 1 000")


nejmensi, po_obci = [], {}  # po_obci: obec → [voliči, odměny minimálních komisí]
for (obec, okr), o in ok26.items():
    m = minimum(2026, o["vol"])
    ob = sen_obce.get(obec)
    deleg = o["vs_obec"] + o["vs_mc"] + (sen_kand[ob] if ob else 0)  # horní mez delegovaných (bez odečtení duplicit)
    mx = max(m, deleg + 1)  # + zapisovatel jmenovaný starostou
    soub = (1 if ob else 0) + (1 if o["dve"] else 0)  # souběh voleb do Senátu / dvou zastupitelstev
    if deleg + 1 <= m:
        n_forced += 1
    else:
        usetri_1 += 1
    sum_min_members += m
    sum_max_members += mx
    om = odmena(m, R26, soub)
    odm_min += om
    odm_max += odmena(mx, R26, soub)
    t = trida[tr(o["vol"])]
    t["n"] += 1
    t["vol"] += o["vol"]
    t["odm"] += om
    t["odm_max"] += odmena(mx, R26, soub)
    nejmensi.append((o["vol"], obec, okr, o["vs_obec"]))
    ob_n = po_obci.setdefault(o["zastup"], [0, 0])
    ob_n[0] += o["vol"]
    ob_n[1] += om

N = len(ok26)
say(f"\nKOMISE 2026 ({cz(N)} okrsků)")
say(f"  zákonné minimum členů celkem: {cz(sum_min_members)}; horní mez při plném delegování: {cz(sum_max_members)}")
say(f"  základní odměny při minimálních komisích (vč. souběhu Senátu a dvou zastupitelstev): {cz(odm_min / 1e6, 1)} mil. Kč")
say(f"  základní odměny při plně obsazených komisích (horní mez): {cz(odm_max / 1e6, 1)} mil. Kč")
say(f"  okrsky, kde komise nemůže být větší než minimum (stran + zapisovatel ≤ minimum): {cz(n_forced)} = {cz(100 * n_forced / N, 1)} %")
say(f"  okrsky, kde komise může mít víc než minimum: {cz(usetri_1)}")
say(f"  Novinky: o člena méně v každé komisi = {cz(N * 2500 / 1e6, 1)} mil. Kč; jen kde je nad minimem nejvýš {cz(usetri_1 * 2500 / 1e6, 1)} mil. Kč")
say(f"  okrsky do 400 voličů: {cz(sum(1 for o in ok26.values() if o['vol'] <= 400))}; do 100: {cz(sum(1 for o in ok26.values() if o['vol'] <= 100))}")
nejmensi.sort()
nazvy = {r["OBEC"]: r["NAZEVOBCE"] for r in
         zcsv(os.path.join(RAW, "volby_cz_kv2026", "KV2026reg20261011_csv.zip"), "csv_od/kvrzcoco.csv")}
say("  nejmenší okrsky (voliči, obec, okrsek, kandidátek):",
    [(v, nazvy.get(ob, ob), okr, vs) for v, ob, okr, vs in nejmensi[:6]])

# obce s jediným okrskem: okrsek nejde sloučit se sousedním, dokud se nesloučí obce
po_obcich = collections.defaultdict(list)
for o in ok26.values():
    po_obcich[o["zastup"]].append(o["vol"])
jedine = [v[0] for v in po_obcich.values() if len(v) == 1]
say(f"  obcí: {cz(len(po_obcich))}, z toho s jediným okrskem {cz(len(jedine))}")
for lim in (100, 200, 400):
    sam = sum(1 for v in jedine if v <= lim)
    vse = sum(1 for o in ok26.values() if o["vol"] <= lim)
    say(f"  okrsky do {lim} voličů: {cz(vse)}, z toho jediný okrsek obce {cz(sam)} ({cz(100 * sam / vse, 0)} %),"
        f" v obcích s víc okrsky {cz(vse - sam)} → komise nejméně {cz((vse - sam) * odmena(4, R26) / 1e6, 1)} mil. Kč")
k4 = odmena(4, R26)
say(f"  čtyřčlenná komise (bez souběhu): {cz(k4)} Kč; 1 300 okrsků méně × {cz(k4)} = {cz(1300 * k4 / 1e6, 1)} mil. Kč")

say("\n  odměny minimální komise na voliče podle velikosti okrsku:")
rows_tr = []
for k, t in trida.items():
    per, pmx = t["odm"] / t["vol"], t["odm_max"] / t["vol"]
    say(f"    {k:>10}: {cz(t['n']):>6} okrsků, {cz(t['vol']):>10} voličů, {cz(per, 0)} Kč na voliče"
        f" (plně obsazené komise nejvýš {cz(pmx, 0)} Kč)")
    rows_tr.append(dict(trida=k, okrsky=t["n"], volici=t["vol"], min=round(per), max=round(pmx)))

# ---- 2022 pro srovnání (minima 4/6, sazby 2022, bez rozlišení Senátu)
odm22 = sum(odmena(minimum(2022, o["vol"]), R22) for o in ok22.values())
m22 = sum(minimum(2022, o["vol"]) for o in ok22.values())
odm26_bez = sum(odmena(minimum(2026, o["vol"]), R26) for o in ok26.values())
say(f"\n  minimální komise 2022: {cz(m22)} členů, odměny bez souběhu {cz(odm22 / 1e6, 1)} mil. Kč;"
    f" 2026: {cz(sum_min_members)} členů, {cz(odm26_bez / 1e6, 1)} mil. Kč")
say(f"  sazba řadového člena 1 800 → 2 500 Kč = +{cz(100 * (2500 / 1800 - 1), 0)} %; 1 300 (do 2018) → 2 500 = +{cz(100 * (2500 / 1300 - 1), 0)} %")
say(f"  Vysoká Lhota: čtyřčlenná komise {cz(odmena(4, R26))} Kč / 16 voličů = {cz(odmena(4, R26) / 16)} Kč na voliče")

# ---------------------------------------------------------------- časová řada nákladů
say("\nNÁKLADY VOLEB DO OBCÍ A 1/3 SENÁTU (státní rozpočet, mil. Kč)")
rada = []
for r in naklady:
    y = int(r["rok"])
    nom = float(r["mil_kc"])
    real = nom * cpi[CPI_REF] / cpi[f"{y}-09"]
    v = voliči[y]
    rada.append(dict(rok=str(y), druh=r["druh"], nominal=round(nom, 1), real=round(real, 1),
                     na_volice=round(real * 1e6 / v) if v else None))
    say(f"  {y} ({r['druh']}): {cz(nom, 1)} nominálně, {cz(real, 1)} v cenách 9/2026"
        + (f", {cz(real * 1e6 / v)} Kč na voliče (ceny 2026), {cz(nom * 1e6 / v)} Kč nominálně" if v else ""))
r22 = next(x for x in rada if x["rok"] == "2022")
r26 = next(x for x in rada if x["rok"] == "2026")
say(f"  2026 rozpočet proti 2022 skutečnosti: nominálně +{cz(100 * (r26['nominal'] / r22['nominal'] - 1), 1)} %,"
    f" reálně +{cz(100 * (r26['real'] / r22['real'] - 1), 1)} %")
VYDAJE_SR_2026 = 2_427_837_146_587  # zákon č. 38/2026 Sb., § 1
say(f"  podíl na výdajích státního rozpočtu 2026: {cz(100 * r26['nominal'] * 1e6 / VYDAJE_SR_2026, 3)} %")
say(f"  na voliče a rok mandátu (4 roky): {cz(r26['nominal'] * 1e6 / voliči[2026] / 4)} Kč")

json.dump({k: dict(v=v, o=o) for k, (v, o) in po_obci.items()}, open(os.path.join(HERE, "obce_2026.json"), "w", encoding="utf-8"))
nad100 = [k for k, (v, o) in po_obci.items() if o / v > 100]
say(f"  obcí, kde minimální komise stojí přes 100 Kč na voliče: {cz(len(nad100))} z {cz(len(po_obci))}")
open(os.path.join(HERE, "vystup.txt"), "w", encoding="utf-8").write("\n".join(OUT) + "\n")
json.dump(dict(rada=rada, tridy=rows_tr), open(os.path.join(HERE, "mezivysledky.json"), "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)


# ---------------------------------------------------------------- grafy (Vega-Lite, styl jako ostatní volební články)
INK, NAVY, NAVY_SV, GRID, CRIMSON = "#101432", "#4c4f8e", "#bcc4df", "#d4d4c8", "#de1743"  # brandNavy.9/.7/.2, background.7, brand.6
AXIS = {"title": None, "domain": False, "ticks": False, "labelFontSize": 13, "labelPadding": 8}


def nbsp(t):
    """Jednopísmenné předložky a spojky nesmí zůstat na konci řádku (texty grafů nejdou přes fixCzechTypography)."""
    return re.sub(r"(^|[\s(])([vkszouaiVKSZOUAI]) ", lambda m: m.group(1) + m.group(2) + " ", t)


def chart(name, spec):
    spec["title"] = {k: nbsp(v) for k, v in spec["title"].items()}
    spec = {"$schema": "https://vega.github.io/schema/vega-lite/v5.json", **spec,
            "config": {"legend": {"disable": True}, "view": {"stroke": None}}}
    json.dump(spec, open(os.path.join(DATA, name), "w", encoding="utf-8"), ensure_ascii=False, indent=1)


# 1) náklady na voliče: nominálně × v cenách 2026
vals = []
for x in rada:
    y = x["rok"] + (" (rozpočet)" if x["druh"] == "rozpočet" else "")
    nom = round(x["nominal"] * 1e6 / voliči[int(x["rok"])])
    vals += [dict(rok=y, rada="v tehdejších cenách", v=nom, popis=cz(nom),
                  t_celkem=f"{cz(x['nominal'], 1)} mil. Kč", t_volici=cz(voliči[int(x['rok'])])),
             dict(rok=y, rada="v cenách roku 2026", v=x["na_volice"], popis=cz(x['na_volice']),
                  t_celkem=f"{cz(x['real'], 1)} mil. Kč v cenách 2026", t_volici=cz(voliči[int(x['rok'])]))]
TT = [{"field": "rok", "title": "Volby"}, {"field": "rada", "title": "Ceny"}, {"field": "popis", "title": "Na voliče (Kč)"},
      {"field": "t_celkem", "title": "Celkem"}, {"field": "t_volici", "title": "Voličů v seznamu"}]
chart("naklady_na_volice.json", {
    "title": {"text": "Po započtení inflace stojí volby na voliče tolik co v roce 2018",
              "subtitle": "Výdaje státního rozpočtu na volby do obcí a třetiny Senátu na jednoho voliče v seznamu – světle v tehdejších cenách, plně v cenách září 2026"},
    "width": 600, "height": 260,
    "data": {"values": vals},
    "encoding": {"x": {"field": "rok", "type": "nominal", "sort": None, "axis": {**AXIS, "labelAngle": 0, "labelFontWeight": 700}},
                 "xOffset": {"field": "rada", "type": "nominal", "sort": ["v tehdejších cenách", "v cenách roku 2026"]}},
    "layer": [
        {"mark": {"type": "bar", "cornerRadiusEnd": 3, "width": {"band": 0.9}},
         "encoding": {"y": {"field": "v", "type": "quantitative", "scale": {"domain": [0, 140]},
                            "axis": {"title": None, "domain": False, "ticks": False, "values": [0, 50, 100],
                                     "labelExpr": "datum.label + ' Kč'", "gridColor": GRID}},
                      "color": {"field": "rada", "type": "nominal", "scale": {"domain": ["v tehdejších cenách", "v cenách roku 2026"], "range": [NAVY_SV, NAVY]}},
                      "tooltip": TT}},
        {"mark": {"type": "text", "dy": -8, "fontSize": 12, "color": INK},
         "encoding": {"y": {"field": "v", "type": "quantitative"}, "text": {"field": "popis"},
                      "fontWeight": {"condition": {"test": "datum.rada == 'v cenách roku 2026'", "value": 700}, "value": 400}}}],
    "_source": "MF – závěrečné účty kapitoly 398 Všeobecná pokladní správa (uvolněné prostředky na volby do obcí a 1/3 Senátu 2014, 2018, 2022), Zpráva o plnění SR za 1. pololetí 2026 (rozpočet 2026); voliči v seznamu podle volby.gov.cz; ceny ČSÚ (index spotřebitelských cen, září); výpočet DataTimes.cz"})

# 2) odměny komise na voliče podle velikosti okrsku
vals = []
for x in rows_tr:
    lab = f"{x['trida']} voličů"
    tt = dict(t_okrsky=f"{cz(x['okrsky'])} okrsků", t_volici=f"{cz(x['volici'])} voličů",
              t_min=f"{cz(x['min'])} Kč", t_max=f"{cz(x['max'])} Kč")
    vals += [dict(trida=lab, rada="nejmenší povolená komise", v=x["min"], popis=f"{cz(x['min'])} Kč", **tt),
             dict(trida=lab, rada="plně obsazená komise", v=x["max"], popis=f"{cz(x['max'])} Kč", **tt)]
TT = [{"field": "trida", "title": "Okrsky"}, {"field": "t_okrsky", "title": "Počet"}, {"field": "t_volici", "title": "Voličů v seznamu"},
      {"field": "t_min", "title": "Nejmenší komise na voliče"}, {"field": "t_max", "title": "Plně obsazená komise na voliče"}]
order = [f"{x['trida']} voličů" for x in rows_tr]
chart("komise_podle_okrsku.json", {
    "title": {"text": "V nejmenších okrscích stojí komise na voliče mnohonásobně víc",
              "subtitle": "Základní odměny okrskové komise v Kč na voliče v seznamu, komunální a senátní volby 2026 – plně komise se zákonným minimem členů, světle komise, do které by delegovaly všechny strany a kandidáti"},
    "width": 600, "height": 330,
    "data": {"values": vals},
    "encoding": {"y": {"field": "trida", "type": "nominal", "sort": order, "axis": {**AXIS, "labelFontWeight": 700, "labelLimit": 200}},
                 "yOffset": {"field": "rada", "type": "nominal", "sort": ["nejmenší povolená komise", "plně obsazená komise"]}},
    "layer": [
        {"mark": {"type": "bar", "cornerRadiusEnd": 3, "height": {"band": 0.9}},
         "encoding": {"x": {"field": "v", "type": "quantitative", "scale": {"domain": [0, 340]},
                            "axis": {"title": None, "domain": False, "ticks": False, "values": [0, 100, 200, 300],
                                     "labelExpr": "datum.label + ' Kč'", "gridColor": GRID}},
                      "color": {"field": "rada", "type": "nominal", "scale": {"domain": ["nejmenší povolená komise", "plně obsazená komise"], "range": [NAVY, NAVY_SV]}},
                      "tooltip": TT}},
        {"mark": {"type": "text", "align": "left", "dx": 5, "fontSize": 12, "color": INK},
         "encoding": {"x": {"field": "v", "type": "quantitative"}, "text": {"field": "popis"},
                      "fontWeight": {"condition": {"test": "datum.rada == 'nejmenší povolená komise'", "value": 700}, "value": 400}}}],
    "_source": "volby.gov.cz – otevřená data komunálních voleb 2026 (zápisy okrsků, počty kandidátek) a voleb do Senátu 2026 (obce v obvodech, kandidáti); odměny podle vyhlášky MV č. 353/2025 Sb. (předseda a zapisovatel 3 500 Kč, místopředseda 3 000 Kč, člen 2 500 Kč, souběh +800 Kč); výpočet DataTimes.cz"})
