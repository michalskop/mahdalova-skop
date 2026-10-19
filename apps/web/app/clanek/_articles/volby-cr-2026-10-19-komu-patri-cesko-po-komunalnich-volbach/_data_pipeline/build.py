# Komu patří Česko po komunálních volbách: kolik voličů zastupují zastupitelé jednotlivých stran.
#
# Vstupy (ČSÚ open data, https://volby.gov.cz/opendata/kv2026/kv2026_opendata.htm, a obdobně pro KV 2022):
#   KV2026reg20261011_csv/csv_od/kvrzcoco.csv, kvros.csv, kvrk.csv   – zastupitelstva (obyvatelé, mandáty), kandidátky, kandidáti
#   KV2026_data_20261011_csv/csv_od/kvt3.csv                          – zápisy okrsků: voliči v seznamu (VOL_SEZNAM)
#   KV2026ciselniky20261011_csv/csv_od/cvs.csv                       – typ volební strany (koalice K)
#   KV2022reg20260328_csv/…, KV2022_data_20260328_csv/…, KV2022ciselniky20260328_csv/…
#                                                                    – totéž pro 2022 (jen řádné volby 23.–24. 9. 2022)
#   Stažené balíky leží v raw/ článku volby-cr-2026-10-11-komunalni-volby-jak-volili-vasi-sousede (gitignore).
#
# Metoda (Kateřina a Michal 19. 10.: přepočet na oprávněné voliče, ne na obyvatele):
#   váha mandátu = voliči v seznamu zastupitelstva (součet VOL_SEZNAM okrsků) / počet zvolených zastupitelů,
#   jen zastupitelstva obcí (TYPZASTUP 1: obce, města, statutární města a Praha jako celek, bez městských částí a obvodů),
#   strana mandátu = kandidátka: strana nebo sdružení strany s nezávislými → ta strana (u víc stran ta první podle PARTY),
#   sdružení nezávislých kandidátů a nezávislý kandidát → NK, kandidátka bez celostátní strany → ostatní,
#   mandát z koalice (TYPVS K) nebo ze sdružení aspoň dvou celostátních stran → navrhující strana zvoleného
#   (zvolený navržený jako nezávislý → NK, navržený místním hnutím → ostatní).
#   Srovnání 2022 × 2026 jen na zastupitelstvech, kde se zvolilo v obou letech.
#
# python build.py [cesta_k_raw]
import csv, collections, json, os, sys

sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
ART = os.path.dirname(HERE)
RAW = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
    ART, "..", "volby-cr-2026-10-11-komunalni-volby-jak-volili-vasi-sousede", "_pipeline", "raw")

YEARS = {
    2022: dict(reg="KV2022reg20260328_csv", dat="KV2022_data_20260328_csv", cis="KV2022ciselniky20260328_csv", date="20220923"),
    2026: dict(reg="KV2026reg20261011_csv", dat="KV2026_data_20261011_csv", cis="KV2026ciselniky20261011_csv", date=None),
}
PARTY = [  # (kód, zkratka, barva) – barvy jako v ostatních volebních článcích; pořadí = priorita u sdružení
    (768, "ANO", "#272a59"), (1114, "SPD", "#a47d03"), (166, "STAN", "#ff1a4a"), (53, "ODS", "#5e66d5"),
    (720, "Piráti", "#111111"), (1, "KDU-ČSL", "#ffcf02"), (721, "TOP 09", "#812840"), (1178, "Motoristé", "#1a9fbd"),
    (7, "SOCDEM", "#f76800"), (47, "KSČM", "#c5143c"), (5, "Zelení", "#639e0a"), (714, "Svobodní", "#0e926a"),
    (1265, "PRO", "#8cdfef"), (1245, "Přísaha", "#a9b5f0"), (1227, "Trikolora", "#ffb3c0"), (1298, "Stačilo!", "#c5143c"),
]
NAME = {c: z for c, z, _ in PARTY}
COLOR = {z: col for _, z, col in PARTY}
PRIO = {c: i for i, (c, _, _) in enumerate(PARTY)}
NK, OST = "nezávislí", "místní a ostatní"
COLOR[NK], COLOR[OST] = "#8a8fb0", "#c3c6d8"
NK_CODE, OST_CODE = 80, -1


def rows(path):
    with open(path, encoding="utf-8") as f:
        yield from csv.DictReader(f)


def label(code):
    return NK if code == NK_CODE else NAME.get(code, OST)


def load(y):
    c = YEARS[y]
    reg = os.path.join(RAW, c["reg"], "csv_od")
    ok = lambda r: not c["date"] or r["DATUMVOLEB"] == c["date"]
    typvs = {r["VSTRANA"]: r["TYPVS"] for r in rows(os.path.join(RAW, c["cis"], "csv_od", "cvs.csv"))}
    zast = {}
    for r in rows(os.path.join(reg, "kvrzcoco.csv")):
        if ok(r) and r["TYPZASTUP"] == "1":
            zast[(r["KODZASTUP"], r["COBVODU"])] = dict(nazev=r["NAZEVZAST"], obyv=int(r["POCOBYV"]), mand=int(r["MANDATY"]), vol=0)
    for r in rows(os.path.join(RAW, c["dat"], "csv_od", "kvt3.csv")):
        k = (r["KODZASTUP"], r["COBVODU"])
        if ok(r) and r["TYPZASTUP"] == "1" and k in zast:
            zast[k]["vol"] += int(r["VOL_SEZNAM"])
    lists, coal = {}, set()
    for r in rows(os.path.join(reg, "kvros.csv")):
        if not ok(r):
            continue
        key = (r["KODZASTUP"], r["COBVODU"], r["POR_STR_HL"])
        codes = [int(r["VSTRANA"])] + [int(x) for x in r["SLOZENI"].split(",") if x.strip()]
        hits = [x for x in codes if x in NAME]
        lists[key] = min(hits, key=PRIO.get) if hits else (NK_CODE if int(r["VSTRANA"]) in (80, 90) else OST_CODE)
        if typvs.get(r["VSTRANA"]) == "K" or len(set(hits)) >= 2:  # koalice nebo sdružení víc celostátních stran (Jedno Ústí)
            coal.add(key)
        # kde strana vůbec kandidovala (sama, v koalici nebo ve sdružení)
        z = key[:2]
        RAN[y][z].update(NAME[x] for x in hits)
        if int(r["VSTRANA"]) in (80, 90) or 80 in codes:
            RAN[y][z].add(NK)
        if any(x not in NAME and x not in (80, 90, 99) for x in codes):
            RAN[y][z].add(OST)
    # Společné kandidátky (koalice, sdružení víc celostátních stran) se dělí mezi strany podle preferenčních hlasů
    # kandidátů, které jednotlivé strany navrhly (Kateřina a Michal 19. 10.: ODS 6 000 hlasů, TOP 09 4 000 → 6 : 4).
    # Kandidáti navržení jako nezávislí → NK, navržení místním hnutím → ostatní.
    grp = lambda n: label(n if n in NAME else (NK_CODE if n in (80, 99) else OST_CODE))
    hlasy = collections.defaultdict(collections.Counter)
    zvoleni = []
    for r in rows(os.path.join(reg, "kvrk.csv")):
        if not ok(r):
            continue
        z = (r["KODZASTUP"], r["COBVODU"])
        if z not in zast:
            continue
        key = z + (r["POR_STR_HL"],)
        if key in coal:
            hlasy[key][grp(int(r["NSTRANA"]))] += int(r["POCHLASU"] or 0)
        if r["MANDAT"] == "A":
            zvoleni.append((key, int(r["NSTRANA"]), int(r["PSTRANA"])))
    elected = collections.defaultdict(list)  # zastupitelstvo -> [({strana: podíl křesla}, členství)]
    for key, n, p in zvoleni:
        h = hlasy.get(key)
        if key in coal and h and sum(h.values()):
            d = {g: v / sum(h.values()) for g, v in h.items() if v}
        else:
            d = {grp(n) if key in coal else label(lists[key]): 1.0}
        elected[key[:2]].append((d, p))
    return zast, elected


RAN = {y: collections.defaultdict(set) for y in YEARS}  # zastupitelstvo -> strany, které tam kandidovaly
data = {y: load(y) for y in YEARS}
same = sorted(set(k for k in data[2022][0] if data[2022][1].get(k)) & set(k for k in data[2026][0] if data[2026][1].get(k)))


def podil(el_z, lab):
    """Kolik křesel zastupitelstva připadá straně (u společných kandidátek zlomky podle hlasů)."""
    return sum(d.get(lab, 0) for d, _ in el_z)


def tally(y, keys, member=False):
    zast, el = data[y]
    vol, mand = collections.Counter(), collections.Counter()
    for k in keys:
        w = zast[k]["vol"] / len(el[k])
        for d, p in el[k]:
            if member:
                d = {(NAME.get(p, OST) if p != 99 else "bez stranické příslušnosti"): 1.0}
            for lab, f in d.items():
                vol[lab] += w * f
                mand[lab] += f
    return vol, mand


out = []
say = lambda s="": out.append(s)
fmt = lambda x: f"{x:,.0f}".replace(",", " ")
pct = lambda x: f"{x:.1f}".replace(".", ",")

for y in YEARS:
    zast, el = data[y]
    say(f"{y}: zastupitelstev obcí {len(zast)}, se zvolenými {sum(1 for k in zast if el.get(k))}, "
        f"obyvatel {fmt(sum(z['obyv'] for z in zast.values()))}, voličů v seznamu {fmt(sum(z['vol'] for z in zast.values()))}, "
        f"zvolených {sum(len(v) for v in el.values())}")
missing = {y: [data[y][0][k]["nazev"] for k in data[y][0] if not data[y][1].get(k)] for y in YEARS}
say(f"stejná zastupitelstva v obou letech: {len(same)}; bez zvolených 2022: {missing[2022]}; 2026: {missing[2026]}")

P = {y: tally(y, same) for y in YEARS}
T = {y: sum(P[y][0].values()) for y in YEARS}
M = {y: sum(P[y][1].values()) for y in YEARS}
say(f"voličů ve srovnání: 2022 {fmt(T[2022])}, 2026 {fmt(T[2026])}; mandátů 2022 {fmt(M[2022])}, 2026 {fmt(M[2026])}")
labs = sorted(set(P[2022][0]) | set(P[2026][0]), key=lambda l: -P[2026][0].get(l, 0))
say("\nPODÍL VOLIČŮ (stejná zastupitelstva)  2022 %  2026 %  změna p. b.  2022 voličů  2026 voličů  změna  | mandáty 2022 → 2026, podíl mandátů 2026")
share = {}
for l in labs:
    a, b = P[2022][0].get(l, 0), P[2026][0].get(l, 0)
    share[l] = (100 * a / T[2022], 100 * b / T[2026])
    say(f"  {l:28}{pct(share[l][0]):>7}{pct(share[l][1]):>7}{pct(share[l][1] - share[l][0]):>8}{fmt(a):>13}{fmt(b):>12}{fmt(b - a):>10}"
        f"  | {fmt(P[2022][1].get(l, 0))} → {fmt(P[2026][1].get(l, 0))}, {pct(100 * P[2026][1].get(l, 0) / M[2026])} % mandátů")

# váha jednoho mandátu: extrémy a Praha
zast, el = data[2026]
w = sorted(((zast[k]["vol"] / len(el[k]), zast[k]["nazev"], zast[k]["vol"], len(el[k])) for k in same))
say("\nVÁHA MANDÁTU 2026 (voličů v seznamu na jednoho zastupitele)")
say(f"  nejmenší: {[(n, pct(v), o, m) for v, n, o, m in w[:3]]}")
say(f"  největší: {[(n, fmt(v), fmt(o), m) for v, n, o, m in w[-3:][::-1]]}")
say(f"  Vysoká Lhota: {[(n, pct(v), o, m) for v, n, o, m in w if n == 'Vysoká Lhota']}")
med = w[len(w) // 2]
say(f"  medián zastupitelstva: {pct(med[0])} ({med[1]}); kolik zastupitelů s mediánovou váhou dá jednoho pražského: {pct(w[-1][0] / med[0])}")

# velikost obce (podle obyvatel), podíl voličů
say("\nPODLE VELIKOSTI OBCE 2026 (obyvatelé obce; podíl voličů)")
bins = [(0, 500), (500, 2000), (2000, 10000), (10000, 50000), (50000, 10 ** 9)]
for lo, hi in bins:
    keys = [k for k in same if lo <= zast[k]["obyv"] < hi]
    vol, mand = tally(2026, keys)
    tot = sum(vol.values())
    say(f"  {lo}–{hi}: {len(keys)} obcí, {fmt(tot)} voličů ({pct(100 * tot / T[2026])} % všech), " + ", ".join(
        f"{l} {pct(100 * vol[l] / tot)} %" for l in (NK, "ANO", "STAN", "ODS", OST)))

# kde se změna stala
say("\nNEJVĚTŠÍ ZMĚNY PO ZASTUPITELSTVECH (voliči)")
per = {}
for y in YEARS:
    zz, ee = data[y]
    d = collections.defaultdict(collections.Counter)
    for k in same:
        for dd, _ in ee[k]:
            for lab, f in dd.items():
                d[lab][k] += zz[k]["vol"] / len(ee[k]) * f
    per[y] = d
for l in ("STAN", "ANO", "SPD", "Piráti", "ODS", NK):
    delta = sorted(((per[2026][l][k] - per[2022][l][k], k) for k in same))
    m = lambda k: f"{data[2022][0][k]['nazev']} {fmt(per[2026][l][k] - per[2022][l][k])} ({podil(data[2022][1][k], l):.3g} → {podil(data[2026][1][k], l):.3g} mand.)"
    say(f"  {l}: celkem {fmt(sum(d for d, _ in delta))}; ztráty " + "; ".join(m(k) for _, k in delta[:5]))
    say(f"  {l}: zisky " + "; ".join(m(k) for _, k in delta[-5:][::-1]))

# kontrolní pohled: stranická příslušnost zvoleného
Pm = {y: tally(y, same, member=True) for y in YEARS}
say("\nKONTROLA – PODLE STRANICKÉ PŘÍSLUŠNOSTI ZVOLENÉHO (2022 → 2026 % voličů)")
for l in sorted(Pm[2026][0], key=lambda l: -Pm[2026][0][l])[:8]:
    say(f"  {l}: {pct(100 * Pm[2022][0].get(l, 0) / T[2022])} → {pct(100 * Pm[2026][0][l] / T[2026])}")

# kde vůbec strana kandidovala (příklad v textu: Motoristé), obce = zastupitelstva TYPZASTUP 1
typ = {r["KODZASTUP"]: r["TYPZASTUP"] for r in rows(os.path.join(RAW, YEARS[2026]["reg"], "csv_od", "kvrzcoco.csv"))}
mot = {r["KODZASTUP"] for r in rows(os.path.join(RAW, YEARS[2026]["reg"], "csv_od", "kvros.csv"))
       if 1178 in {int(r["VSTRANA"])} | {int(x) for x in r["SLOZENI"].split(",") if x.strip()} and typ.get(r["KODZASTUP"]) == "1"}
say(f"\nMOTORISTÉ 2026: kandidátka (sami nebo ve složení) ve {len(mot)} z {sum(1 for v in typ.values() if v == '1')} obcí")

# pokrytí: kolik voličů žije v obcích, kde strana kandidovala (sama, v koalici nebo ve sdružení)
MAPA_STRANY = ["ANO", "STAN", "ODS", "KDU-ČSL", "Piráti", "TOP 09", "SPD", "SOCDEM", "Zelení", "Motoristé", NK, OST]
zast26, el26 = data[2026]
VOL26 = sum(z["vol"] for z in zast26.values())
say("\nPOKRYTÍ 2026 (všech 6 255 zastupitelstev obcí): kde strana kandidovala → podíl voličů, obcí; podíl voličů, které zastupuje, z voličů tam, kde kandidovala")
souhrn = {}
for l in MAPA_STRANY:
    ks = [k for k in zast26 if l in RAN[2026][k]]
    v_ran = sum(zast26[k]["vol"] for k in ks)
    rep = sum(zast26[k]["vol"] / len(el26[k]) * podil(el26[k], l) for k in ks if el26.get(k))
    obci = len({k[0] for k in ks})
    souhrn[l] = {"obci": obci, "pokryti": round(100 * v_ran / VOL26, 1), "tam": round(100 * rep / v_ran, 1) if v_ran else 0,
                 "celkem": round(100 * rep / VOL26, 1)}
    say(f"  {l:24} {pct(100 * v_ran / VOL26):>6} % voličů, {obci:>5} obcí; tam zastupuje {pct(souhrn[l]['tam'])} %, ze všech voličů {pct(souhrn[l]['celkem'])} %")

# data mapy stran 2026: obec → voliči, křesla, a za každou stranu, která tam kandidovala, [křesla, zastoupení voliči]
mapa = {}
for (kod, ob), z in zast26.items():
    if not el26.get((kod, ob)):
        continue
    o = mapa.setdefault(kod, {"n": z["nazev"], "v": 0, "m": 0, "s": {}})
    o["v"] += z["vol"]
    o["m"] += len(el26[(kod, ob)])
    for l in MAPA_STRANY:
        if l in RAN[2026][(kod, ob)]:
            f = podil(el26[(kod, ob)], l)
            prev = o["s"].get(l, [0, 0])
            o["s"][l] = [round(prev[0] + f, 2), round(prev[1] + z["vol"] / len(el26[(kod, ob)]) * f)]
json.dump({"strany": MAPA_STRANY, "barvy": {l: COLOR[l] for l in MAPA_STRANY}, "souhrn": souhrn, "obce": mapa},
          open(os.path.join(HERE, "mapa_data.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))

open(os.path.join(HERE, "vystup.txt"), "w", encoding="utf-8").write("\n".join(out) + "\n")

# obce 2026 pro motiv coveru: obyvatelé (velikost kolečka), zastupitelé celkem a za nezávislé (Lišov má dva obvody → součet)
obce = collections.defaultdict(lambda: {"n": "", "p": 0, "m": 0, "nk": 0})
for (kod, _), z in zast.items():
    if el.get((kod, _)):
        o = obce[kod]
        o["n"], o["p"] = z["nazev"], o["p"] + z["obyv"]
        o["m"] += len(el[(kod, _)])
        o["nk"] += podil(el[(kod, _)], NK)
json.dump(obce, open(os.path.join(HERE, "obce_2026.json"), "w", encoding="utf-8"), ensure_ascii=False)
print("\n".join(out))

# ---------- grafy (Vega-Lite pro <VegaChart>) ----------
SHOW = [NK, OST, "ANO", "STAN", "ODS", "KDU-ČSL", "Piráti", "TOP 09", "SOCDEM", "Zelení", "SPD"]
SRC = ("volby.gov.cz – otevřená data komunálních voleb 2022 (řádné volby) a 2026; zastupitelstva obcí, Praha a statutární města "
       "jako celek; voliči v seznamu podle zápisů okrskových komisí; výpočet DataTimes.cz")
AX_Y = {"title": None, "domain": False, "ticks": False, "labelFontSize": 14, "labelFontWeight": 700, "labelPadding": 10, "labelLimit": 200}


def bars(values, title, subtitle, series, fields, domain_max, height, tooltip_fields):
    """Vodorovné dvojice pruhů: první řada světlá s obrysem, druhá plná; hodnoty přímo u pruhů.
    Tooltip ukazuje obě hodnoty strany slovy (tooltip_fields = [(pole, popisek)]), ne technické názvy řad."""
    long = []
    for v in values:
        for s, f in zip(series, fields):
            long.append({"strana": v["strana"], "rada": s, "hodnota": round(v[f], 1),
                         "popis": pct(v[f]) + " %", "barva": COLOR[v["strana"]], **{k: v[k] for k in v if k.startswith("t_")}})
    enc_y = {"field": "strana", "type": "nominal", "sort": [v["strana"] for v in values], "axis": AX_Y}
    enc_off = {"field": "rada", "type": "nominal", "sort": series}
    enc_x = {"field": "hodnota", "type": "quantitative", "scale": {"domain": [0, domain_max], "nice": False},
             "axis": {"title": None, "grid": True, "tickCount": 5, "labelExpr": "datum.label + ' %'", "domain": False}}
    tooltip = [{"field": "strana", "title": "Strana"}] + [{"field": k, "title": t} for k, t in tooltip_fields]
    return {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "title": {"text": title, "subtitle": subtitle},
        "width": 600, "height": height,
        "data": {"values": long},
        "encoding": {"y": enc_y, "yOffset": enc_off},
        "layer": [
            {"transform": [{"filter": f"datum.rada == '{series[0]}'"}],
             "mark": {"type": "bar", "cornerRadiusEnd": 3, "fillOpacity": 0.25, "strokeWidth": 1.5, "height": {"band": 0.9}},
             "encoding": {"x": enc_x, "fill": {"field": "barva", "type": "nominal", "scale": None},
                          "stroke": {"field": "barva", "type": "nominal", "scale": None}, "tooltip": tooltip}},
            {"transform": [{"filter": f"datum.rada == '{series[1]}'"}],
             "mark": {"type": "bar", "cornerRadiusEnd": 3, "height": {"band": 0.9}},
             "encoding": {"x": enc_x, "fill": {"field": "barva", "type": "nominal", "scale": None}, "tooltip": tooltip}},
            {"mark": {"type": "text", "align": "left", "dx": 5, "fontSize": 12.5, "color": "#101432"},
             "encoding": {"x": {"field": "hodnota", "type": "quantitative"},
                          "text": {"condition": {"test": f"datum.rada == '{series[1]}'", "field": "popis"},
                                   "value": ""}, "fontWeight": {"value": 700}}},
            {"mark": {"type": "text", "align": "left", "dx": 5, "fontSize": 11.5, "color": "#4c4f8e"},
             "encoding": {"x": {"field": "hodnota", "type": "quantitative"},
                          "text": {"condition": {"test": f"datum.rada == '{series[0]}'", "field": "popis"},
                                   "value": ""}}},
            {"mark": {"type": "rule", "strokeWidth": 1.6}, "encoding": {"x": {"datum": 0, "type": "quantitative"}, "color": {"value": "#101432"}}},
        ],
        "config": {"legend": {"disable": True}},
        "_source": SRC,
    }


mil = lambda x: f"{x / 1e6:.2f}".replace(".", ",") + " mil." if x >= 1e6 else f"{round(x, -3) / 1000:.0f} tis."

# graf 1: 2022 × 2026
vals = []
for l in SHOW:
    a, b = share[l]
    va, vb = P[2022][0].get(l, 0), P[2026][0].get(l, 0)
    vals.append({"strana": l, "v2022": a, "v2026": b,
                 "t_2022": f"{pct(a)} % voličů ({mil(va)})", "t_2026": f"{pct(b)} % voličů ({mil(vb)})"})
g1 = bars(vals, "STAN posílil hlavně díky Praze, SPD vypadla z velkých měst",
          "Kolik procent voličů zastupují zastupitelé zvolení za danou stranu – světle 2022, plně 2026",
          ["2022", "2026"], ["v2022", "v2026"], 42, 570, [("t_2022", "Po volbách 2022"), ("t_2026", "Po volbách 2026")])
json.dump(g1, open(os.path.join(ART, "data", "graf_podil.json"), "w", encoding="utf-8"), ensure_ascii=False)

# graf 2: křesla × voliči 2026
vals = []
for l in SHOW:
    m, vb = P[2026][1].get(l, 0), P[2026][0].get(l, 0)
    vals.append({"strana": l, "mand": 100 * m / M[2026], "vol": share[l][1],
                 "t_mand": f"{pct(100 * m / M[2026])} % ({fmt(m)} z {fmt(M[2026])})",
                 "t_vol": f"{pct(share[l][1])} % ({mil(vb)} z {mil(T[2026])})"})
g2 = bars(vals, "Nezávislí mají tři čtvrtiny křesel, ale zastupují zhruba třetinu voličů",
          "Komunální volby 2026: podíl křesel v zastupitelstvech obcí (světle) a podíl voličů, které tito zastupitelé zastupují (plně)",
          ["podíl křesel", "podíl voličů"], ["mand", "vol"], 86, 570, [("t_mand", "Křesla v zastupitelstvech"), ("t_vol", "Zastupují voličů")])
json.dump(g2, open(os.path.join(ART, "data", "graf_mandaty.json"), "w", encoding="utf-8"), ensure_ascii=False)
