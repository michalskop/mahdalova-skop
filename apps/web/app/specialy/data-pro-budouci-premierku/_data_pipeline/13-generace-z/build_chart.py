"""Sestaví graf GRAF_13_NAROZENI.json (živě narození v Česku 1950–2025, zvýrazněné ročníky 1996–2005 a 2006–2015)
→ apps/web/public/specialy/dpbp/charts/. Data: data/narozeni.csv (ČSÚ, OBY01CR; viz README.md).
Spuštění: python -X utf8 -I build_chart.py"""
import csv, json, os

here = os.path.dirname(os.path.abspath(__file__))
outdir = os.path.normpath(os.path.join(here, "../../../../../public/specialy/dpbp/charts"))
INK, RED, NAVY, BEIGE, GRID = "#101432", "#de1743", "#2f325c", "#bcbcb0", "#e8e8dc"
NB = " "


def fmt(n):
    return f"{int(n):,}".replace(",", NB)


rows = []
nar = {}
for r in csv.DictReader(open(os.path.join(here, "data", "narozeni.csv"), encoding="utf-8")):
    y = int(r["rok"])
    if y >= 1950:
        nar[y] = int(float(r["zive_narozeni"]))
for y, n in sorted(nar.items()):
    if 1996 <= y <= 2005:
        sk = "1996–2005"
    elif 2006 <= y <= 2015:
        sk = "2006–2015"
    else:
        sk = "ostatní"
    rows.append({"rok": y, "narozeni": n, "skupina": sk, "label": fmt(n),
                 "hlavicka": f"Rok {y}", "Živě narozených": fmt(n),
                 "Proti roku 1974": f"{round(100 * n / nar[1974])}{NB}%"})
# součty skupin pro popisek
s1 = sum(nar[y] for y in range(1996, 2006))
s2 = sum(nar[y] for y in range(2006, 2016))
order = [r["rok"] for r in rows]
x = {"field": "rok", "type": "ordinal", "sort": order, "title": None,
     "axis": {"values": [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020], "grid": False, "domain": False, "ticks": False,
              "labelAngle": 0, "labelPadding": 6, "labelFontSize": 12}}
y = {"field": "narozeni", "type": "quantitative", "title": None, "scale": {"domain": [0, 210000]},
     "axis": {"values": [0, 50000, 100000, 150000, 200000], "grid": True, "gridColor": GRID, "domain": False, "ticks": False,
              "labelExpr": "replace(format(datum.value, ','), ',', ' ')"}}
col = {"field": "skupina", "type": "nominal", "scale": {"domain": ["1996–2005", "2006–2015", "ostatní"], "range": [RED, NAVY, BEIGE]}, "legend": None}
anot = [{"rok": 1974, "narozeni": nar[1974], "t": fmt(nar[1974])}, {"rok": 1999, "narozeni": nar[1999], "t": fmt(nar[1999])},
        {"rok": 2008, "narozeni": nar[2008], "t": fmt(nar[2008])}, {"rok": 2025, "narozeni": nar[2025], "t": fmt(nar[2025])}]
spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": {"text": "Ročníky narozené v letech 2006–2015 jsou o pětinu větší než ročníky 1996–2005",
              "subtitle": f"Živě narození v Česku podle roku, 1950–2025. V letech 1996–2005 se narodilo dohromady {fmt(s1)} dětí, v letech 2006–2015 {fmt(s2)}. "
                          "Ženy z ročníků 1996–2005 budou v roce 2030 ve věku 25–34 let."},
    "_source": "[Počet obyvatel – dlouhodobé řady, roční data ČR (živě narození), ČSÚ](https://data.csu.gov.cz/opendata/sady/OBY01CR/distribuce/csv) · vlastní výpočet\n"
               "Červeně ročníky, z nichž budou v roce 2030 ženy ve věku 25–34 let; modře ročníky 2006–2015. Údaj za rok 2025 je předběžný.",
    "height": 340,
    "data": {"values": rows},
    "layer": [
        {"mark": {"type": "bar", "cornerRadiusEnd": 1, "width": {"band": 0.86}}, "encoding": {"x": x, "y": y, "color": col}},
        {"data": {"values": anot}, "mark": {"type": "text", "baseline": "bottom", "dy": -4, "fontSize": 12.5, "fontWeight": "bold", "color": INK},
         "encoding": {"x": {"field": "rok", "type": "ordinal", "sort": order}, "y": {"field": "narozeni", "type": "quantitative", "scale": {"domain": [0, 210000]}}, "text": {"field": "t"}}},
        {"mark": {"type": "rect", "fill": BEIGE, "cursor": "default"},
         "encoding": {"x": x, "y": {"datum": 0}, "y2": {"datum": 210000}, "fillOpacity": {"value": 0},
                      "tooltip": [{"field": k, "title": k} for k in ["hlavicka", "Živě narozených", "Proti roku 1974"]]}},
    ],
    "config": {"view": {"stroke": None}},
}
path = os.path.join(outdir, "GRAF_13_NAROZENI.json")
json.dump(spec, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(path, s1, s2, round(100 * (s2 / s1 - 1), 1))
