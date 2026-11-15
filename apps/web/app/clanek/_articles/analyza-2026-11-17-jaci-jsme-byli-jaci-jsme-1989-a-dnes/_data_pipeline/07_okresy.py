"""
Malé mapy okresů 1991 × 2021 (komponenta <OkresyMalemapy dataFile="data/okresy-1991-2021.json" />).

Primární data (archiv statisticka-data/cesko, najde se sám, nebo proměnná CSU_DATA):
  scitani/sldb1991-okresy/20261114/   ČSÚ, Územní přehledy 1991 (SLDB 1991 podle okresů), XLS
      https://csu.gov.cz/uzemni-prehledy1991  – tab. 79/1 věk, 80/1 vzdělání, 81 vyznání,
      84/1 národnost, 86 ekonomicky aktivní (podíl hledajících zaměstnání)
  scitani/sldb2021-okresy/20261114/   ČSÚ, Výsledky sčítání 2021 – otevřená data, CSV
      https://csu.gov.cz/produkty/vysledky-scitani-2021-otevrena-data
      sldb2021_vek.csv, sldb2021_vzdelani.csv, sldb2021_vira.csv, sldb2021_narodnost.csv,
      sldb2021_aktivita_pohlavi.csv
  hranice/cuzk-ruian-shp-stat/20261113/  ČÚZK RÚIAN, OKRESY_P (S-JTSK) – geometrie dnešních 77 okresů
  hranice/okresy-zmeny-2007/20261114/    ČSÚ, meziokresní přesuny obcí ve Středočeském kraji k 1. 1. 2007

Výstupy:
  ../data/okresy-1991-2021.json   data komponenty (hodnoty, škály, míry rozptylu)
  ../okresy-geo.json              zjednodušená geometrie okresů (GeoJSON v S-JTSK, kopíruje se do public/)
  vystup_okresy.txt               všechna čísla pro text

Sjednocení okresů: mapa má dnešních 77 okresů (RÚIAN). Okres Jeseník vznikl 1. 1. 1996 z okresu
Šumperk, v roce 1991 proto mapa u Jeseníku ukazuje hodnotu tehdejšího okresu Šumperk. Míry rozptylu
počítáme na 76 okresech, tedy s Jeseníkem a Šumperkem sloučenými i v roce 2021 (součet počtů).
K 1. 1. 2007 změnilo okres 119 malých obcí (sladění s obvody ORP); hodnoty 1991 jsou v tehdejších
hranicích. Dopad změny ukazujeme na Středočeském kraji (36 obcí, jediný seznam, který ČSÚ zveřejnil
v tabulce), přepočtem 2021 na hranice před rokem 2007.
"""
import csv
import json
import os
import statistics
import sys
import warnings
from pathlib import Path

warnings.filterwarnings("ignore")
import pandas as pd  # noqa: E402
import shapefile  # noqa: E402
from shapely.geometry import shape, mapping  # noqa: E402

sys.stdout.reconfigure(encoding="utf-8")
HERE = Path(__file__).resolve().parent
CLANEK = HERE.parent
SLUG = CLANEK.name


def najdi_archiv() -> Path:
    if os.environ.get("CSU_DATA"):
        return Path(os.environ["CSU_DATA"])
    for p in Path(__file__).resolve().parents:
        for kandidat in (p / "csu-data", p / "statisticka-data" / "cesko"):
            if kandidat.exists():
                return kandidat
    raise SystemExit("Archiv csu-data nenalezen – nastav CSU_DATA")


A = najdi_archiv()
D91 = A / "scitani/sldb1991-okresy/20261114"
D21 = A / "scitani/sldb2021-okresy/20261114"
SHP = A / "hranice/cuzk-ruian-shp-stat/20261113/data/1/OKRESY_P.shp"
ZMENY07 = A / "hranice/okresy-zmeny-2007/20261114/zmenyokresu.xls"

LOG = []


def out(*a):
    s = " ".join(str(x) for x in a)
    print(s)
    LOG.append(s)


def norm(n: str) -> str:
    n = " ".join(str(n).split()).replace(" - ", "-")
    return {"Hl. m. Praha": "Praha", "území Hlavního města Prahy": "Praha", "Ústí n. Orl.": "Ústí nad Orlicí"}.get(n, n)


# ---------- 1991: XLS územní přehledy ----------
def tab91(nazev, sloupce):
    df = pd.read_excel(D91 / f"{nazev}.xls", header=None)
    res = {}
    for _, r in df.iterrows():
        if not isinstance(r[0], str) or pd.isna(r[1]) or not str(r[1]).replace(".", "").isdigit():
            continue
        res[norm(r[0])] = [float(r[c]) for c in sloupce]
    return res


vek91 = tab91("tab79_1", [1, 2])            # celkem, 0–14
vzd91 = tab91("tab80_1", [1, 7])            # 15+, vysokoškolské
vir91 = tab91("tab81", [1, 6, 7])           # celkem, bez vyznání, nezjištěno
nar91 = tab91("tab84_1", [1, 4])            # celkem, moravská
ekon91 = tab91("tab86", [1, 6])             # ek. aktivní, % hledajících zaměstnání (z ek. aktivních)
CR91 = "ČR celkem"


# ---------- 2021: otevřená data SLDB (okresy = uzemi_cis 101, obce = 43, ČR = 97) ----------
def csv21(soubor, kat_sloupec):
    """{(uzemi_cis, nazev nebo kod): {kategorie or '': hodnota}}; jen řádky bez pohlaví."""
    res = {}
    with open(D21 / soubor, encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            if r.get("pohlavi_kod"):
                continue
            if r["uzemi_cis"] not in ("101", "97", "43"):
                continue
            klic = (r["uzemi_cis"], r["uzemi_kod"] if r["uzemi_cis"] == "43" else norm(r["uzemi_txt"]))
            res.setdefault(klic, {})[r[kat_sloupec] or ""] = res.get(klic, {}).get(r[kat_sloupec] or "", 0) + int(r["hodnota"])
    return res


vek21 = csv21("sldb2021_vek.csv", "vek_txt")
vzd21 = csv21("sldb2021_vzdelani.csv", "vzdelani_txt")
vir21 = csv21("sldb2021_vira.csv", "vira_txt")
nar21 = csv21("sldb2021_narodnost.csv", "narodnost_txt")
ekon21 = csv21("sldb2021_aktivita_pohlavi.csv", "ekonaktiv_txt")


# čitatel / jmenovatel pro každý ukazatel a rok (počty, aby šly okresy sčítat)
def pocty91(uk, n):
    if uk == "vs":
        return vzd91[n][1], vzd91[n][0]
    if uk == "deti":
        return vek91[n][1], vek91[n][0]
    if uk == "verici":
        c, bez, nezj = vir91[n]
        return c - bez - nezj, c
    if uk == "nezam":
        ea, pct = ekon91[n]
        return ea * pct / 100, ea  # tabulka dává jen podíl v % (1 desetinné místo)
    if uk == "morav":
        return nar91[n][1], nar91[n][0]


def pocty21(uk, k):
    if uk == "vs":
        d = vzd21[k]
        return d["Vysokoškolské"], d[""]
    if uk == "deti":
        d = vek21[k]
        return d["0 - 14 let"], d[""]
    if uk == "verici":
        d = vir21[k]
        return d[""] - d["Bez náboženské víry"] - d["Neuvedeno"], d[""]
    if uk == "nezam":
        d = ekon21[k]
        return d["Nezaměstnaní"], d["Pracovní síla"]
    if uk == "morav":
        d = nar21[k]
        return d["Moravská celkem"], d[""]


UKAZATELE = [
    dict(id="vs", hranice=[5, 7, 9, 12, 15, 20], nazev="Vysokoškoláci", popis="podíl lidí s vysokou školou mezi obyvateli staršími 15 let",
         proc="Ve sčítání 1991 i 2021 stejná otázka na nejvyšší dokončené vzdělání; jmenovatel jsou všichni od 15 let včetně nezjištěných."),
    dict(id="deti", hranice=[16, 17, 18, 19, 20, 22], nazev="Děti do 15 let", popis="podíl dětí ve věku 0–14 let na všech obyvatelích",
         proc="Věk je v obou sčítáních přesný. Podíl lidí nad 65 let za okresy 1991 ČSÚ nevydal (jen „poproduktivní věk“ 60+ u mužů a 55+ u žen), proto stárnutí ukazujeme přes děti."),
    dict(id="verici", hranice=[15, 20, 30, 40, 50, 60], nazev="Věřící", popis="podíl lidí, kteří uvedli víru (s církví i bez ní), na všech obyvatelích",
         proc="Otázka na víru byla v roce 2021 dobrovolná a neodpovědělo na ni víc lidí; 2021 jsou mezi věřícími i ti, kdo se nehlásí k žádné církvi."),
    dict(id="nezam", hranice=[1.5, 2, 3, 4, 5, 7], nazev="Nezaměstnaní", popis="podíl nezaměstnaných (1991 „hledajících zaměstnání“) na ekonomicky aktivních",
         proc="Obě čísla jsou ze sčítání (co lidé sami uvedli), ne z evidence úřadů práce; 1991 je zachycen březen, na samém začátku transformace, 2021 rok covidu."),
    dict(id="morav", hranice=[1, 3, 5, 10, 20, 40], nazev="Moravská národnost", popis="podíl lidí, kteří uvedli moravskou národnost",
         proc="V roce 2021 šlo uvést dvě národnosti a otázka byla dobrovolná; počítáme každého, kdo uvedl moravskou národnost (i jako druhou)."),
]

# ---------- geometrie a propojení názvů ----------
r = shapefile.Reader(str(SHP), encoding="cp1250")
okresy, features = {}, []
for s, rec in zip(r.shapes(), r.records()):
    kod, nazev = rec["LAU1_KOD"], norm(rec["NAZEV"])
    okresy[kod] = nazev
    g = shape(s.__geo_interface__).simplify(300, preserve_topology=True)
    gm = mapping(g)

    def rnd(c):
        if isinstance(c[0], (int, float)):
            return [round(c[0] / 50) * 50, round(c[1] / 50) * 50]
        return [rnd(x) for x in c]

    features.append({"type": "Feature", "id": kod, "properties": {}, "geometry": {"type": gm["type"], "coordinates": rnd(gm["coordinates"])}})
kod_podle_nazvu = {v: k for k, v in okresy.items()}
assert len(okresy) == 77
JESENIK, SUMPERK = kod_podle_nazvu["Jeseník"], kod_podle_nazvu["Šumperk"]
geo = {"type": "FeatureCollection", "features": features}
(CLANEK / "okresy-geo.json").write_text(json.dumps(geo, separators=(",", ":")), encoding="utf-8")
out(f"Geometrie: 77 okresů, {sum(len(json.dumps(f['geometry'])) for f in features) / 1000:.0f} kB, okresy-geo.json "
    f"{(CLANEK / 'okresy-geo.json').stat().st_size / 1000:.0f} kB")

for n in okresy.values():
    if n != "Jeseník":
        assert n in vek91 and n in vzd91 and n in vir91 and n in nar91 and n in ekon91, n
    assert ("101", n) in vek21, n

# ---------- 2007: přesuny obcí ve Středočeském kraji ----------
z = pd.read_excel(ZMENY07, header=None)
presuny = []
for _, row in z.iterrows():
    if str(row[1]).startswith("CZ0") and str(row[5]).startswith("CZ0"):
        presuny.append(dict(z=str(row[1]), obec=str(row[3]), kod=str(int(row[4])), do=str(row[5])))
out(f"Přesuny obcí k 1. 1. 2007 ve Středočeském kraji (tabulka ČSÚ): {len(presuny)} obcí")

# ---------- výpočet ----------
data_uk = []
for U in UKAZATELE:
    uk = U["id"]
    hod = {}
    for kod, n in okresy.items():
        n91 = "Šumperk" if n == "Jeseník" else n
        c91, j91 = pocty91(uk, n91)
        c21, j21 = pocty21(uk, ("101", n))
        hod[kod] = [round(c91 / j91 * 100, 2), round(c21 / j21 * 100, 2)]
    c, j = pocty91(uk, CR91)
    cr91 = c / j * 100
    c, j = pocty21(uk, ("97", "Česká republika"))
    cr21 = c / j * 100

    # 76 srovnatelných okresů: Jeseník + Šumperk sloučené i v roce 2021
    def podily(rok):
        res = {}
        for kod, n in okresy.items():
            if kod == JESENIK:
                continue
            if rok == 1991:
                res[kod] = hod[kod][0]
            elif kod == SUMPERK:
                a, b = pocty21(uk, ("101", "Šumperk")), pocty21(uk, ("101", "Jeseník"))
                res[kod] = (a[0] + b[0]) / (a[1] + b[1]) * 100
            else:
                res[kod] = hod[kod][1]
        return res

    mira = {}
    for rok in (1991, 2021):
        p = podily(rok)
        v = list(p.values())
        mean = statistics.mean(v)
        cv = statistics.pstdev(v) / mean * 100
        mx = max(p, key=p.get)
        mn = min(p, key=p.get)
        bez_prahy = [x for k, x in p.items() if okresy[k] != "Praha"]
        mira[rok] = dict(cv=cv, pomer=p[mx] / p[mn], max=(okresy[mx], p[mx]), min=(okresy[mn], p[mn]),
                         cv_bez_prahy=statistics.pstdev(bez_prahy) / statistics.mean(bez_prahy) * 100,
                         rozpeti=p[mx] - p[mn])

    # dopad změn hranic 2007 (Středočeský kraj): 2021 přepočtené na hranice před rokem 2007
    upr = {}
    for kod in {x["z"] for x in presuny} | {x["do"] for x in presuny}:
        c, j = pocty21(uk, ("101", okresy[kod]))
        for x in presuny:
            cc, jj = pocty21(uk, ("43", x["kod"]))
            if x["do"] == kod:
                c, j = c - cc, j - jj
            if x["z"] == kod:
                c, j = c + cc, j + jj
        upr[kod] = abs(c / j * 100 - hod[kod][1])
    max07 = max(upr, key=upr.get)

    # společná škála obou let z palety (brand, světlá → tmavá); hranice tříd jsou ruční volba
    # (kulatá čísla pokrývající hodnoty obou let), čísla v datech se jimi nemění
    barvy = ["#fff4f6", "#ffb3c0", "#ff8099", "#ff4d70", "#de1743", "#a81134", "#8b0e2b"]
    hranice = U["hranice"]
    assert len(hranice) + 1 == len(barvy)

    m1, m2 = mira[1991], mira[2021]
    smer = "zmenšily" if m2["cv"] < m1["cv"] else "zvětšily"
    out("")
    out(f"== {U['nazev']} ({U['popis']})")
    out(f"   ČR: 1991 {cr91:.1f} %, 2021 {cr21:.1f} %")
    for rok, m in mira.items():
        out(f"   {rok}: max {m['max'][0]} {m['max'][1]:.1f} %, min {m['min'][0]} {m['min'][1]:.1f} %, "
            f"poměr max/min {m['pomer']:.2f}, rozpětí {m['rozpeti']:.1f} p. b., variační koeficient {m['cv']:.1f} % "
            f"(bez Prahy {m['cv_bez_prahy']:.1f} %)")
    out(f"   Rozdíly mezi okresy se {smer} (variační koeficient {m1['cv']:.1f} → {m2['cv']:.1f} %)")
    out(f"   Změna hranic 2007 (Středočeský kraj): největší posun hodnoty 2021 v okrese {okresy[max07]} o {upr[max07]:.2f} p. b.")
    for rok, i in ((1991, 0), (2021, 1)):
        p = sorted(((v, okresy[k]) for k, v in podily(rok).items()), reverse=True)
        out(f"   {rok} nejvyšší: " + ", ".join(f"{n} {v:.1f}" for v, n in p[:5]) + " | nejnižší: " + ", ".join(f"{n} {v:.1f}" for v, n in p[-5:]))
    cz = lambda x, d=1: f"{x:.{d}f}".replace(".", ",")
    if uk == "morav":
        zjisteni = (f"Nejvíc v okrese {m1['max'][0]}: {cz(m1['max'][1])} % (1991) a {cz(m2['max'][1])} % (2021). "
                    f"Pod 1 % je v {sum(v < 1 for v in podily(1991).values())} okresech (1991) a v {sum(v < 1 for v in podily(2021).values())} okresech (2021) ze 76.")
    else:
        zjisteni = (f"Rozdíly mezi okresy se {smer}: okres se od průměru typicky lišil o {cz(m1['cv'], 0)} % (1991), "
                    f"dnes o {cz(m2['cv'], 0)} %. Rozpětí {cz(m1['min'][1])}–{cz(m1['max'][1])} % proti {cz(m2['min'][1])}–{cz(m2['max'][1])} %.")
    out("   zjištění: " + zjisteni)
    data_uk.append(dict(
        id=uk, zjisteni=zjisteni, nazev=U["nazev"], popis=U["popis"], proc=U["proc"], jednotka="%", desetinna=1,
        cr=[round(cr91, 1), round(cr21, 1)],
        rozptyl=dict(cv=[round(m1["cv"], 1), round(m2["cv"], 1)], pomer=[round(m1["pomer"], 2), round(m2["pomer"], 2)],
                     max=[[m1["max"][0], round(m1["max"][1], 1)], [m2["max"][0], round(m2["max"][1], 1)]],
                     min=[[m1["min"][0], round(m1["min"][1], 1)], [m2["min"][0], round(m2["min"][1], 1)]]),
        skala=dict(hranice=hranice, barvy=barvy),
        hodnoty=hod,
    ))

# ---------- souhrnné kontroly ----------
pop07 = sum(pocty21("deti", ("43", x["kod"]))[1] for x in presuny)
out("")
out(f"Obyvatelé 36 středočeských obcí, které 2007 změnily okres (sčítání 2021): {pop07:,}".replace(",", " ", 1) if False else f"Obyvatelé 36 středočeských obcí, které 2007 změnily okres (sčítání 2021): {pop07}")
out("Jeseník 1991 = hodnota tehdejšího okresu Šumperk; míry rozptylu na 76 okresech (Šumperk + Jeseník sloučené).")

data = dict(
    title="Víra a nezaměstnanost dělí okresy {víc|#de1743} než v roce 1991",
    subtitle="Pět ukazatelů ze sčítání lidu 1991 a 2021 podle okresů, v %. Obě mapy každého ukazatele mají stejnou barevnou škálu. Najeďte na okres nebo na něj ťukněte",
    zdroj="ČSÚ, [Sčítání 1991 podle okresů](https://csu.gov.cz/uzemni-prehledy1991) a [Sčítání 2021, otevřená data](https://csu.gov.cz/produkty/vysledky-scitani-2021-otevrena-data); hranice ČÚZK RÚIAN; výpočet DataTimes",
    poznamka="Mapy ukazují dnešních 77 okresů. Okres Jeseník vznikl v roce 1996 z okresu Šumperk, v mapě 1991 proto má hodnotu tehdejšího Šumperka. „Rozdíly mezi okresy“ = o kolik procent se okresy typicky liší od svého průměru (variační koeficient, 76 okresů).",
    geo=f"/clanek/_articles/{SLUG}/okresy-geo.json",
    roky=["1991", "2021"],
    okresy=okresy,
    pozn_okres={JESENIK: "1991 součást okresu Šumperk, hodnota za tehdejší Šumperk"},
    ukazatele=data_uk,
)
(CLANEK / "data").mkdir(exist_ok=True)
(CLANEK / "data/okresy-1991-2021.json").write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
(HERE / "vystup_okresy.txt").write_text("\n".join(LOG) + "\n", encoding="utf-8")
