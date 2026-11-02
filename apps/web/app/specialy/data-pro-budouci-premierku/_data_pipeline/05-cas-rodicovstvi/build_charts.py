"""Sestaví grafy článku 05 do apps/web/public/specialy/dpbp/charts/:
  GRAF_05_VEK_PRVNI.json  věk matek při 1. dítěti a při všech porodech 1990-2025 (ČSÚ)
  GRAF_05_TEMPO.json      úhrnná plodnost a plodnost po odečtení odkladu (Bongaarts-Feeney), 1993-2023
  GRAF_05_KOHORTY.json    kumulovaná plodnost generací podle věku (vstup: ../07-kohortni-plodnost/data/kohorty_kumul.csv)
Spuštění: python -X utf8 -I build_charts.py  (po vypocet.py a ../07-kohortni-plodnost/kohorty.py)"""
import csv, json, os
here = os.path.dirname(os.path.abspath(__file__))
outdir = os.path.normpath(os.path.join(here, "../../../../../public/specialy/dpbp/charts"))
INK, RED, NAVY, GRID = "#101432", "#de1743", "#2f325c", "#e8e8dc"


def CZ(x, nd=1):
    return f"{x:.{nd}f}".replace(".", ",")


def read(path):
    return list(csv.DictReader(open(path, encoding="utf-8")))


def dump(name, spec):
    json.dump(spec, open(os.path.join(outdir, name), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(name)


# ---------------------------------------------------------------- věk matek
uk = read(os.path.join(here, "data", "ukazatele_cr.csv"))
S1, S2 = "při prvním dítěti", "při všech porodech"
rows = []
for r in uk:
    y = int(r["rok"])
    for s, k in ((S1, "vek_1_dite"), (S2, "vek_vsechny")):
        rows.append({"rok": y, "serie": s, "vek": round(float(r[k]), 2), "label": CZ(float(r[k])) + " let",
                     "ptr": CZ(float(r[k])) + " let"})
X = {"field": "rok", "type": "quantitative", "title": None, "scale": {"domain": [1989, 2030], "nice": False},
     "axis": {"values": [1990, 1995, 2000, 2005, 2010, 2015, 2020, 2025], "format": "d", "grid": False, "domain": False, "ticks": False, "labelAngle": 0}}
Y = {"field": "vek", "type": "quantitative", "title": None, "scale": {"domain": [20, 32]},
     "axis": {"values": [20, 24, 28, 32], "grid": True, "gridColor": GRID, "domain": False, "ticks": False, "labelExpr": "datum.value + ' let'"}}
COL = {"field": "serie", "type": "nominal", "scale": {"domain": [S1, S2], "range": [RED, NAVY]}, "legend": None}
ends = [r for r in rows if r["rok"] in (1990, 2025)]
names = [{"rok": 2025, "vek": float(uk[-1]["vek_1_dite"]) - 1.2, "serie": S1, "t": "první dítě"},
         {"rok": 2025, "vek": float(uk[-1]["vek_vsechny"]) + 1.2, "serie": S2, "t": "všechny porody"}]
spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": {"text": f"Průměrná prvorodička je o {CZ(float(uk[-1]['vek_1_dite']) - float(uk[0]['vek_1_dite']))} roku starší než v roce 1990",
              "subtitle": "Průměrný věk matky při narození dítěte, Česko 1990–2025; do roku 2008 rostl o 0,3 roku ročně, od té doby o 0,1"},
    "_source": "[Obyvatelstvo – roční časové řady, ČSÚ (open data OBY01CR)](https://csu.gov.cz/produkty/obyvatelstvo_hu)\nVěk se počítá z rozdílu kalendářního roku porodu a roku narození matky; hodnoty za 2025 jsou předběžné.",
    "height": 320,
    "data": {"values": rows},
    "layer": [
        {"mark": {"type": "line", "strokeWidth": 2.5, "strokeJoin": "round"}, "encoding": {"x": X, "y": Y, "color": COL}},
        {"mark": {"type": "point", "filled": True, "size": 40, "opacity": 0}, "encoding": {
            "x": X, "y": Y, "color": COL,
            "tooltip": [{"field": "rok", "type": "quantitative", "title": "Rok", "format": "d"}, {"field": "serie", "title": "Věk matky"}, {"field": "ptr", "title": "Průměr"}]}},
        {"data": {"values": ends}, "mark": {"type": "point", "filled": True, "size": 70, "opacity": 1}, "encoding": {"x": X, "y": Y, "color": COL}},
        {"data": {"values": ends}, "mark": {"type": "text", "fontSize": 13, "fontWeight": "bold", "dy": -11}, "encoding": {
            "x": X, "y": Y, "color": COL, "text": {"field": "label"}}},
        {"data": {"values": names}, "mark": {"type": "text", "align": "left", "dx": 16, "fontSize": 12, "baseline": "middle"}, "encoding": {
            "x": {"field": "rok", "type": "quantitative", "scale": X["scale"]}, "y": {"field": "vek", "type": "quantitative", "scale": Y["scale"]}, "color": COL, "text": {"field": "t"}}},
    ],
    "config": {"view": {"stroke": None}},
}
dump("GRAF_05_VEK_PRVNI.json", spec)

# ---------------------------------------------------------------- odklad (tempo)
tb = read(os.path.join(here, "data", "tempo_bf.csv"))
T1, T2 = "úhrnná plodnost", "po odečtení odkladu mateřství"
rows = []
for r in tb:
    y = int(r["rok"])
    for s, k in ((T1, "tfr"), (T2, "tfr_upravena")):
        v = float(r[k])
        rows.append({"rok": y, "serie": s, "plodnost": round(v, 3), "label": CZ(v, 2), "ptr": CZ(v, 2) + " dítěte na ženu"})
XT = {"field": "rok", "type": "quantitative", "title": None, "scale": {"domain": [1993, 2027], "nice": False},
      "axis": {"values": [1995, 2000, 2005, 2010, 2015, 2020], "format": "d", "grid": False, "domain": False, "ticks": False, "labelAngle": 0}}
YT = {"field": "plodnost", "type": "quantitative", "title": None, "scale": {"domain": [1.0, 2.2]},
      "axis": {"values": [1.0, 1.4, 1.8, 2.2], "grid": True, "gridColor": GRID, "domain": False, "ticks": False,
               "labelExpr": "replace(format(datum.value, '.1f'), '.', ',')"}}
CT = {"field": "serie", "type": "nominal", "scale": {"domain": [T1, T2], "range": [NAVY, RED]}, "legend": None}
pts = [r for r in rows if r["rok"] in (1999, 2023)]
v23 = {s: next(r["plodnost"] for r in rows if r["rok"] == 2023 and r["serie"] == s) for s in (T1, T2)}
nm = [{"rok": 2023, "plodnost": v23[T2] + 0.12, "serie": T2, "t": "po odečtení odkladu"},
      {"rok": 2023, "plodnost": v23[T1] - 0.12, "serie": T1, "t": "úhrnná plodnost"}]
d99 = next(r for r in tb if r["rok"] == "1999")
d23 = next(r for r in tb if r["rok"] == "2023")
spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": {"text": "Odklad mateřství vysvětluje propad kolem roku 1999, dnešní pokles už ne",
              "subtitle": f"Úhrnná plodnost a plodnost po odečtení odkladu, Česko 1993–2023; rozdíl činil v roce 1999 {CZ(float(d99['tfr_upravena']) - float(d99['tfr']), 2)} dítěte, v roce 2023 {CZ(float(d23['tfr_upravena']) - float(d23['tfr']), 2)}"},
    "_source": "[Demografická příručka (data za 2024), tab. 6.12 a 6.13, ČSÚ](https://csu.gov.cz/produkty/demograficka-prirucka-2024) · vlastní výpočet metodou Bongaarts–Feeney\nUpravená plodnost = plodnost podle pořadí dítěte dělená (1 − roční změna průměrného věku matek při porodu daného pořadí), změna je centrovaná přes sousední roky. Je to odhad, ne naměřená hodnota.",
    "height": 320,
    "data": {"values": rows},
    "layer": [
        {"mark": {"type": "line", "strokeWidth": 2.5, "strokeJoin": "round"}, "encoding": {"x": XT, "y": YT, "color": CT}},
        {"mark": {"type": "point", "filled": True, "size": 40, "opacity": 0}, "encoding": {
            "x": XT, "y": YT, "color": CT,
            "tooltip": [{"field": "rok", "type": "quantitative", "title": "Rok", "format": "d"}, {"field": "serie", "title": "Ukazatel"}, {"field": "ptr", "title": "Hodnota"}]}},
        {"data": {"values": pts}, "mark": {"type": "point", "filled": True, "size": 70, "opacity": 1}, "encoding": {"x": XT, "y": YT, "color": CT}},
        {"data": {"values": [r for r in pts if r["serie"] == T2]}, "mark": {"type": "text", "fontSize": 13, "fontWeight": "bold", "dy": -11}, "encoding": {"x": XT, "y": YT, "color": CT, "text": {"field": "label"}}},
        {"data": {"values": [r for r in pts if r["serie"] == T1]}, "mark": {"type": "text", "fontSize": 13, "fontWeight": "bold", "dy": 16}, "encoding": {"x": XT, "y": YT, "color": CT, "text": {"field": "label"}}},
        {"data": {"values": nm}, "mark": {"type": "text", "align": "left", "dx": 10, "fontSize": 12, "baseline": "middle"}, "encoding": {
            "x": {"field": "rok", "type": "quantitative", "scale": XT["scale"]}, "y": {"field": "plodnost", "type": "quantitative", "scale": YT["scale"]}, "color": CT, "text": {"field": "t"}}},
    ],
    "config": {"view": {"stroke": None}},
}
dump("GRAF_05_TEMPO.json", spec)

# ---------------------------------------------------------------- kohorty (stávající spec grafu, nová data, titulek a zdroj)
path = os.path.join(outdir, "GRAF_05_KOHORTY.json")
g = json.load(open(path, encoding="utf-8"))
koh = read(os.path.join(here, "..", "07-kohortni-plodnost", "data", "kohorty_kumul.csv"))
g["data"] = {"values": [{"vek": int(r["vek"]), "kohort": int(r["generace"]), "plodnost": round(float(r["plodnost"]), 3)} for r in koh]}
g["title"] = {"text": "Každá další generace má v každém věku méně dětí, ročník 1980 skončí kolem 1,7",
              "subtitle": "Kumulovaná plodnost podle věku matky při porodu, generace po pěti letech, stav na konci roku 2024"}
g["_source"] = "[Demografická příručka (data za 2024), tab. 6.11, ČSÚ](https://csu.gov.cz/produkty/demograficka-prirucka-2024) · vlastní výpočet\nVěk = rozdíl roku porodu a roku narození matky; křivka generace končí posledním rokem, který ČSÚ zveřejnil (2024)."
s = json.dumps(g, ensure_ascii=False)
s = s.replace("[12, 55]", "[14, 52]").replace('"datum": 12,', '"datum": 14,')
g = json.loads(s)
json.dump(g, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("GRAF_05_KOHORTY.json")
