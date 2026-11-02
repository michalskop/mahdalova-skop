"""Sestaví graf GRAF_19_MIRY (míry plodnosti mužů a žen podle věku, Česko 2024) do apps/web/public/specialy/dpbp/charts/.
Data: data/plodnost_muzu_2024.csv z plodnost_muzu.py (ČSÚ, Demografická ročenka 2024, viz README.md).
Spuštění: python -X utf8 -I build_chart.py"""
import csv
import json
import os

here = os.path.dirname(os.path.abspath(__file__))
outdir = os.path.normpath(os.path.join(here, "../../../../../public/specialy/dpbp/charts"))
INK, RED, NAVY, TEAL, BEIGE, GRID = "#101432", "#de1743", "#2f325c", "#0e8aab", "#bcbcb0", "#e8e8dc"
NB = " "


def cz(x, nd=1):
    return f"{x:.{nd}f}".replace(".", ",")


MID = {"do19": 17.5, "15-19": 17.5, "20-24": 22.5, "25-29": 27.5, "30-34": 32.5, "35-39": 37.5, "40-44": 42.5, "45-49": 47.5,
       "50-54": 52.5, "55-59": 57.5}
LAB = {"do19": "do 19 let", "15-19": "15–19 let", "20-24": "20–24 let", "25-29": "25–29 let", "30-34": "30–34 let", "35-39": "35–39 let",
       "40-44": "40–44 let", "45-49": "45–49 let", "50-54": "50–54 let", "55-59": "55–59 let"}
rate = {"muži": {}, "ženy": {}}
for r in csv.DictReader(open(os.path.join(here, "data", "plodnost_muzu_2024.csv"), encoding="utf-8")):
    k = r["vekova_skupina"]
    if k in MID:
        rate[r["pohlavi"]][MID[k]] = float(r["mira_na_1000_varianta_B"])
# věkové skupiny 15–19 (ženy) a „do 19“ (muži) mají stejný střed
xs = sorted(set(rate["muži"]) | set(rate["ženy"]))
rows = []
for x in xs:
    m, w = rate["muži"].get(x), rate["ženy"].get(x)
    key = next(k for k, v in MID.items() if v == x and k != "15-19")
    rows.append({"vek": x, "muzi": m, "zeny": w, "hlavicka": f"Věk {LAB[key]}",
                 "Muži (dětí na 1 000 mužů)": cz(m, 1) if m is not None else "–",
                 "Ženy (dětí na 1 000 žen)": cz(w, 1) if w is not None else "–"})
long = []
for r in rows:
    for who, col in (("Muži", "muzi"), ("Ženy", "zeny")):
        if r[col] is not None:
            long.append({"vek": r["vek"], "pohlavi": who, "mira": r[col]})
YMAX = 100
sc = {"domain": [15, 60], "nice": False}
xq = {"field": "vek", "type": "quantitative", "title": "Věk (roky)", "scale": sc,
      "axis": {"values": [15, 20, 25, 30, 35, 40, 45, 50, 55, 60], "format": "d", "grid": False, "domain": False, "ticks": False, "labelAngle": 0}}
yq = {"field": "mira", "type": "quantitative", "title": None, "scale": {"domain": [0, YMAX]},
      "axis": {"values": [0, 25, 50, 75, 100], "grid": True, "gridColor": GRID, "domain": False, "ticks": False}}
col = {"field": "pohlavi", "type": "nominal", "scale": {"domain": ["Muži", "Ženy"], "range": [NAVY, TEAL]}, "legend": None}
bands = [dict(r, od=r["vek"] - 2.5, do=r["vek"] + 2.5) for r in rows]
guide = {"data": {"values": rows}, "mark": {"type": "rule", "strokeWidth": 1, "strokeDash": [3, 3], "color": INK},
         "encoding": {"x": {"field": "vek", "type": "quantitative", "scale": sc}, "y": {"datum": 0}, "y2": {"datum": YMAX},
                      "strokeOpacity": {"condition": {"param": "hov", "empty": False, "value": 0.6}, "value": 0}}}
band = {"data": {"values": bands},
        "params": [{"name": "hov", "select": {"type": "point", "fields": ["hlavicka"], "on": "mouseover", "clear": "mouseout"}}],
        "mark": {"type": "rect", "fill": BEIGE, "cursor": "default"},
        "encoding": {"x": {"field": "od", "type": "quantitative", "scale": sc}, "x2": {"field": "do"}, "y": {"datum": 0}, "y2": {"datum": YMAX},
                     "fillOpacity": {"value": 0},
                     "tooltip": [{"field": k, "title": k} for k in ["hlavicka", "Muži (dětí na 1 000 mužů)", "Ženy (dětí na 1 000 žen)"]]}}
spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": {"text": "Muži mají děti později a ve větším věkovém rozpětí než ženy",
              "subtitle": "Dětí narozených v roce 2024 na 1 000 mužů, resp. žen stejného věku (věk otce, resp. matky)"},
    "_source": "[Demografická ročenka ČR 2024, tab. D.10 a I.01, ČSÚ](https://csu.gov.cz/produkty/demograficka-rocenka-ceske-republiky-2ncey2iey2) · vlastní výpočet\nU 6,9 % narozených není věk otce uveden; rozdělili jsme je podle věku matky. Muži ve věku 60 a více let (0,2 na 1 000) nejsou v grafu.",
    "height": 280,
    "data": {"values": long},
    "layer": [
        {"mark": {"type": "line", "strokeWidth": 2.5, "strokeJoin": "round", "point": {"filled": True, "size": 55}}, "encoding": {"x": xq, "y": yq, "color": col}},
        {"data": {"values": [{"vek": 42.5, "mira": 33, "t": "muži"}]}, "mark": {"type": "text", "fontSize": 13, "fontWeight": "bold", "color": NAVY, "align": "left", "dx": 4},
         "encoding": {"x": {"field": "vek", "type": "quantitative", "scale": sc}, "y": {"field": "mira", "type": "quantitative"}, "text": {"field": "t"}}},
        {"data": {"values": [{"vek": 22.5, "mira": 46, "t": "ženy"}]}, "mark": {"type": "text", "fontSize": 13, "fontWeight": "bold", "color": TEAL, "align": "right", "dx": -4},
         "encoding": {"x": {"field": "vek", "type": "quantitative", "scale": sc}, "y": {"field": "mira", "type": "quantitative"}, "text": {"field": "t"}}},
        guide, band,
    ],
    "config": {"view": {"stroke": None}},
}
p = os.path.join(outdir, "GRAF_19_MIRY.json")
json.dump(spec, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(p)
