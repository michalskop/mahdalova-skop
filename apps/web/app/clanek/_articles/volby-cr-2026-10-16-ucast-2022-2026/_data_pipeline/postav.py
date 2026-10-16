# Volební účast v komunálních volbách 2026 vs. 2022 po obcích – všechna čísla článku a data mapy.
#
# Zdroj: ČSÚ, otevřená data volby.gov.cz (staženo 15.–16. 10. 2026):
#   https://volby.gov.cz/opendata/kv2026/KV2026_data_20261011_csv.zip   – kvt3.csv (okrsky KV 2026)
#   https://volby.gov.cz/opendata/kv2022/KV2022_data_20260328_csv.zip   – kvt3.csv (okrsky KV 2022)
#   https://volby.gov.cz/opendata/se2026/SE2026data20261011_csv.zip     – set5.csv (okrsky Senát 2026)
#   https://volby.gov.cz/opendata/se2022/SE2022_data_20221001_k2_csv.zip – set5.csv (okrsky Senát 2022)
# Účast obce = vydané úřední obálky / voliči v seznamu, sečteno přes okrsky zastupitelstva obce
# (TYPZASTUP 1, klíč KODZASTUP – Praha a statutární města s městskými částmi za celé město).
# 2022 jen řádné volby 23.–24. 9. 2022 (opakované a nové volby se vynechávají).
# Rozdíl = účast 2026 − účast 2022 v procentních bodech.
# Senát: okrsek KV patří k senátní volbě, pokud se v něm týž den hlasovalo i v 1. kole senátních voleb
# (stejné okrsky, párování OBEC + OKRSEK). Obec = „se senátem“, když tam hlasovala většina voličů.
#
# python postav.py <slozka_se_stazenymi_baliky>
#   → ../images/ucast-mapa.html (mapa s vloženými daty), vystup.json (čísla do textu), výpis na konzoli
import csv, json, os, sys, collections

sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
ART = os.path.dirname(HERE)
GEO = os.path.join(ART, "..", "volby-cr-2026-09-24-mista-kde-neexistuje-politicka-konkurence")
SRC = sys.argv[1]
P = lambda *a: os.path.join(SRC, *a)


def kv(path, datum=None):
    """KODZASTUP → [voliči, obálky]; navíc okrsky (OBEC, OKRSEK) → KODZASTUP s počtem voličů."""
    s = collections.defaultdict(lambda: [0, 0])
    okr = {}
    for x in csv.DictReader(open(path, encoding="utf-8")):
        if x["TYPZASTUP"] != "1" or (datum and x["DATUMVOLEB"] != datum):
            continue
        a = s[x["KODZASTUP"]]
        a[0] += int(x["VOL_SEZNAM"]); a[1] += int(x["VYD_OBALKY"])
        okr[(x["OBEC"], x["OKRSEK"])] = (x["KODZASTUP"], int(x["VOL_SEZNAM"]))
    return s, okr


def senat(path):
    """(OBEC, OKRSEK) → obvod pro 1. kolo senátních voleb."""
    return {(x["OBEC"], x["OKRSEK"]): x["OBVOD"] for x in csv.DictReader(open(path, encoding="utf-8")) if x["KOLO"] == "1"}


a22, ok22 = kv(P("KV2022_data_20260328_csv", "csv_od", "kvt3.csv"), "20220923")
a26, ok26 = kv(P("KV2026_data_20261011_csv", "csv_od", "kvt3.csv"))
se22 = senat(P("SE2022_data_20221001_k2_csv", "csv_od", "set5.csv"))
se26 = senat(P("SE2026data20261011_csv", "csv_od", "set5.csv"))


def podil_senat(okrsky, se):
    """KODZASTUP → podíl voličů obce v okrscích se souběžnou senátní volbou."""
    v = collections.defaultdict(lambda: [0, 0])
    for key, (kod, n) in okrsky.items():
        v[kod][0] += n
        if key in se:
            v[kod][1] += n
    return {k: (b / a if a else 0) for k, (a, b) in v.items()}


sen22, sen26 = podil_senat(ok22, se22), podil_senat(ok26, se26)
info = json.load(open(os.path.join(GEO, "obce-data.json"), encoding="utf-8"))["obce"]

oba = sorted(k for k in a22.keys() & a26.keys() if a22[k][0] and a26[k][0])
t = lambda a: a[1] / a[0] * 100
d = {k: t(a26[k]) - t(a22[k]) for k in oba}


def souhrn(keys):
    s22 = sum(a22[k][0] for k in keys); v22 = sum(a22[k][1] for k in keys)
    s26 = sum(a26[k][0] for k in keys); v26 = sum(a26[k][1] for k in keys)
    return {"obci": len(keys), "volicu22": s22, "volicu26": s26, "u22": round(v22 / s22 * 100, 2),
            "u26": round(v26 / s26 * 100, 2), "zmena": round((v26 / s26 - v22 / s22) * 100, 2),
            "vyssi": sum(d[k] > 0 for k in keys), "nizsi": sum(d[k] < 0 for k in keys)}


def sk(k):
    s2, s6 = sen22.get(k, 0) > 0.5, sen26.get(k, 0) > 0.5
    return {(False, True): "jen 2026", (True, False): "jen 2022", (True, True): "v obou letech", (False, False): "ani jednou"}[(s2, s6)]


out = {"celkem": souhrn(oba)}
# celostátní účast za všechny obce, kde se v daném roce volilo (kontrola proti ČSÚ)
out["vsechny_2022"] = round(sum(v[1] for v in a22.values()) / sum(v[0] for v in a22.values()) * 100, 2)
out["vsechny_2026"] = round(sum(v[1] for v in a26.values()) / sum(v[0] for v in a26.values()) * 100, 2)
out["obci_2022"], out["obci_2026"] = len(a22), len(a26)

skup = collections.defaultdict(list)
for k in oba:
    skup[sk(k)].append(k)
out["senat"] = {g: souhrn(v) for g, v in skup.items()}
# medián změny po obcích v každé skupině
for g, v in skup.items():
    z = sorted(d[k] for k in v)
    out["senat"][g]["median_obce"] = round(z[len(z) // 2], 2)

TRIDY = [(0, 200), (200, 500), (500, 1000), (1000, 5000), (5000, 20000), (20000, 10 ** 9)]
out["velikost"] = []
for lo, hi in TRIDY:
    v = [k for k in oba if lo <= a26[k][0] < hi]
    r = souhrn(v); r["od"], r["do"] = lo, hi
    for g in ("jen 2022", "jen 2026", "ani jednou"):
        w = [k for k in v if sk(k) == g]
        r[g] = souhrn(w)["zmena"] if w else None
    out["velikost"].append(r)

# kraje (kód kraje z KV 2022, kvt3.KRAJ)
KRAJE = {"1100": "Praha", "2100": "Středočeský", "3100": "Jihočeský", "3200": "Plzeňský", "4100": "Karlovarský", "4200": "Ústecký",
         "5100": "Liberecký", "5200": "Královéhradecký", "5300": "Pardubický", "6100": "Vysočina", "6200": "Jihomoravský",
         "7100": "Olomoucký", "7200": "Zlínský", "8100": "Moravskoslezský"}
kraj = {x["KODZASTUP"]: x["KRAJ"] for x in csv.DictReader(open(P("KV2022_data_20260328_csv", "csv_od", "kvt3.csv"), encoding="utf-8")) if x["TYPZASTUP"] == "1"}
kr = collections.defaultdict(list)
for k in oba:
    kr[KRAJE[kraj[k]]].append(k)
out["kraje"] = sorted(({"kraj": n, **souhrn(v)} for n, v in kr.items()), key=lambda r: r["zmena"])

# okresy
okr = collections.defaultdict(list)
for k in oba:
    okr[info.get(k, {}).get("o", "?")].append(k)
out["okresy"] = sorted(({"okres": o, **souhrn(v), "senat26": round(sum(a26[k][0] * sen26.get(k, 0) for k in v) / sum(a26[k][0] for k in v), 2),
                         "senat22": round(sum(a22[k][0] * sen22.get(k, 0) for k in v) / sum(a22[k][0] for k in v), 2)} for o, v in okr.items()),
                       key=lambda r: r["zmena"])
# města nad 10 000 voličů
big = [k for k in oba if a26[k][0] >= 10000]
out["mesta"] = sorted(({"obec": info.get(k, {}).get("n", k), "okres": info.get(k, {}).get("o", ""), "volicu26": a26[k][0],
                        "kraj": KRAJE[kraj[k]], "u22": round(t(a22[k]), 2), "u26": round(t(a26[k]), 2), "zmena": round(d[k], 2), "senat": sk(k)} for k in big),
                      key=lambda r: r["zmena"])

# čtvrtiny měst 10 000+ podle účasti 2022
m2 = sorted(out["mesta"], key=lambda r: r["u22"]); q = len(m2) // 4
out["ctvrtiny"] = []
for i, g in enumerate((m2[:q], m2[q:2 * q], m2[2 * q:3 * q], m2[3 * q:])):
    z = sorted(r["zmena"] for r in g)
    out["ctvrtiny"].append({"mest": len(g), "u22_od": g[0]["u22"], "u22_do": g[-1]["u22"], "pokles": sum(v < 0 for v in z),
                            "median": round((z[len(z) // 2] + z[(len(z) - 1) // 2]) / 2, 2)})
out["mesta_pod30"] = {"2022": [r["obec"] for r in m2 if r["u22"] < 30], "2026": [r["obec"] for r in sorted(out["mesta"], key=lambda r: r["u26"]) if r["u26"] < 30]}

json.dump(out, open(os.path.join(HERE, "vystup.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# graf: města 10 000+ – účast 2022 × změna (VegaChart)
POPIS = {"Sokolov", "Havířov", "Chomutov", "Jirkov", "Orlová", "Most", "Karviná", "Teplice", "Žďár nad Sázavou", "Nymburk", "Praha hl.m.", "Brno", "Ostrava", "Plzeň", "Ústí nad Labem"}
body = [{"obec": "Praha" if r["obec"] == "Praha hl.m." else r["obec"], "okres": r["okres"], "u22": round(r["u22"], 1), "u26": round(r["u26"], 1),
         "zmena": round(r["zmena"], 1), "smer": "vzrostla" if r["zmena"] > 0 else "klesla", "popis": ("Praha" if r["obec"] == "Praha hl.m." else r["obec"]) if r["obec"] in POPIS else ""}
        for r in out["mesta"]]
UP, DOWN = "#6ec53f", "#ff1a4a"  # brandForestGreen[4], brand[4] – stejné jako šipky v mapě (schválená výjimka z červené × zelené)
graf = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": {"text": "Účast klesala hlavně ve městech, kde už v roce 2022 volilo nejméně lidí",
              "subtitle": f"{len(body)} měst s 10 000 a více voliči: účast v komunálních volbách 2022 (%) a její změna do roku 2026 (p. b.)"},
    "width": 560, "height": 420,
    "data": {"values": body},
    "layer": [
        {"mark": {"type": "rule", "color": "#6267a3", "strokeDash": [4, 3]}, "encoding": {"y": {"datum": 0}}},
        {"mark": {"type": "point", "filled": True, "size": 70, "opacity": 0.9, "stroke": "#ffffff", "strokeWidth": 0.6},
         "encoding": {
             "x": {"field": "u22", "type": "quantitative", "scale": {"domain": [28, 52]}, "axis": {"title": "Účast 2022 (%)"}},
             "y": {"field": "zmena", "type": "quantitative", "scale": {"domain": [-6, 7]}, "axis": {"title": "Změna účasti 2022–2026 (p. b.)"}},
             "color": {"field": "smer", "type": "nominal", "scale": {"domain": ["vzrostla", "klesla"], "range": [UP, DOWN]}, "legend": {"title": "Účast"}},
             "tooltip": [{"field": "obec", "title": "Obec"}, {"field": "okres", "title": "Okres"}, {"field": "u22", "title": "Účast 2022 (%)"},
                         {"field": "u26", "title": "Účast 2026 (%)"}, {"field": "zmena", "title": "Změna (p. b.)"}]}},
        {"mark": {"type": "text", "align": "left", "dx": 6, "dy": -6, "fontSize": 11, "color": "#101432"},
         "transform": [{"filter": "datum.popis != ''"}],
         "encoding": {"x": {"field": "u22", "type": "quantitative"}, "y": {"field": "zmena", "type": "quantitative"}, "text": {"field": "popis"}}},
    ],
    "_source": "ČSÚ, otevřená data komunálních voleb 2022 a 2026 (volby.gov.cz); výpočet DataTimes.cz",
}
os.makedirs(os.path.join(ART, "data"), exist_ok=True)
json.dump(graf, open(os.path.join(ART, "data", "mesta.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# data mapy: id → [název, okres, voliči22, obálky22, voliči26, obálky26, senát (0 ani, 1 jen 2022, 2 jen 2026, 3 obě)]
KOD = {"ani jednou": 0, "jen 2022": 1, "jen 2026": 2, "v obou letech": 3}
obce = {}
for k in sorted(a22.keys() | a26.keys()):
    i = info.get(k, {})
    obce[k] = [i.get("n", k), i.get("o", ""), *a22.get(k, [0, 0]), *a26.get(k, [0, 0]), KOD[sk(k)]]
topo = open(os.path.join(GEO, "obce-geo.json"), encoding="utf-8").read()
sab = open(os.path.join(HERE, "sablona.html"), encoding="utf-8").read()
data = "window.TOPO=" + topo + ";window.DATA=" + json.dumps({"obce": obce}, ensure_ascii=False, separators=(",", ":")) + ";"
open(os.path.join(ART, "images", "ucast-mapa.html"), "w", encoding="utf-8").write(sab.replace("/*DATA*/", data))

c = out["celkem"]
print(f"obcí 2022 {len(a22)}, 2026 {len(a26)}, v obou {c['obci']}")
print(f"účast všech obcí: 2022 {out['vsechny_2022']} %, 2026 {out['vsechny_2026']} %")
print(f"účast (obce v obou): {c['u22']} → {c['u26']} ({c['zmena']:+} p. b.), vyšší {c['vyssi']}, nižší {c['nizsi']}")
for g, r in sorted(out["senat"].items()):
    print(f"  senát {g:14}: obcí {r['obci']:5}, voličů26 {r['volicu26']:>9,}, {r['u22']} → {r['u26']} ({r['zmena']:+}), medián obcí {r['median_obce']:+}, vyšší {r['vyssi']} nižší {r['nizsi']}")
print("velikost (voliči 2026):")
for r in out["velikost"]:
    print(f"  {r['od']:>6}–{r['do']:<10} obcí {r['obci']:5} {r['u22']} → {r['u26']} ({r['zmena']:+})  jen22 {r['jen 2022']}  jen26 {r['jen 2026']}  ani {r['ani jednou']}")
print("kraje:")
for r in out["kraje"]:
    print(f"  {r['kraj']:16} {r['u22']} → {r['u26']} ({r['zmena']:+})  obcí {r['obci']} vyšší {r['vyssi']} nižší {r['nizsi']}")
m = out["mesta"]
pokles = [r for r in m if r["zmena"] < 0]
print(f"města 10 000+: {len(m)}, s nižší účastí {len(pokles)}; z toho podle krajů {collections.Counter(r['kraj'] for r in pokles).most_common()}")
print(f"  … a podle senátu {collections.Counter(r['senat'] for r in pokles).most_common()}")
print("okresy – nejnižší / nejvyšší:")
for r in out["okresy"][:8] + [None] + out["okresy"][-6:]:
    print("  ..." if r is None else f"  {r['okres']:22} {r['u22']} → {r['u26']} ({r['zmena']:+})  senát22 {r['senat22']} senát26 {r['senat26']}")
print("města 10 000+ – nejnižší / nejvyšší:")
for r in out["mesta"][:10] + [None] + out["mesta"][-6:]:
    print("  ..." if r is None else f"  {r['obec']:22} {r['okres']:16} {r['u22']} → {r['u26']} ({r['zmena']:+})  {r['senat']}")
