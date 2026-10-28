"""Sestaví graf GRAF_12_PLODNOST.json (úhrnná plodnost Švédska, Francie, Maďarska, Kanady a Česka 2000–2024)
→ apps/web/public/specialy/dpbp/charts/. Data: data/plodnost_eurostat.csv, data/plodnost_kanada_okna.csv (viz README.md).
Spuštění: python -X utf8 -I build_chart.py"""
import csv, json, os

here = os.path.dirname(os.path.abspath(__file__))
outdir = os.path.normpath(os.path.join(here, "../../../../../public/specialy/dpbp/charts"))
INK, NAVY, TEAL, RED, ORANGE, GRID = "#101432", "#2f325c", "#0e8aab", "#de1743", "#f76800", "#e8e8dc"
NAMES = {"SE": "Švédsko", "FR": "Francie", "HU": "Maďarsko", "CA": "Kanada", "CZ": "Česko"}
tfr = {}
for r in csv.DictReader(open(os.path.join(here, "data", "plodnost_eurostat.csv"), encoding="utf-8")):
    if r["geo"] in NAMES:
        tfr.setdefault(r["geo"], {})[int(r["rok"])] = float(r["uhrnna_plodnost"])
tfr["CA"] = {int(r["rok"]): float(r["uhrnna_plodnost"]) for r in csv.DictReader(open(os.path.join(here, "data", "plodnost_kanada_okna.csv"), encoding="utf-8"))}
cz = lambda x: f"{x:.2f}".replace(".", ",")
rows = []
for g, nm in NAMES.items():
    for yr in range(2000, 2025):
        v = tfr[g][yr]
        rows.append({"zeme": nm, "rok": yr, "tfr": v, "label": cz(v)})
domain = list(NAMES.values())
rng = [NAVY, TEAL, RED, ORANGE, INK]
x = {"field": "rok", "type": "quantitative", "title": None, "scale": {"domain": [2000, 2027], "nice": False},
     "axis": {"values": [2000, 2005, 2010, 2015, 2020, 2024], "format": "d", "grid": False, "domain": False, "ticks": False, "labelAngle": 0}}
y = {"field": "tfr", "type": "quantitative", "title": None, "scale": {"domain": [1.0, 2.1]},
     "axis": {"values": [1.0, 1.25, 1.5, 1.75, 2.0], "format": ".2f", "grid": True, "gridColor": GRID, "domain": False, "ticks": False,
              "labelExpr": "replace(format(datum.value, '.2f'), '.', ',')"}}
col = {"field": "zeme", "type": "nominal", "scale": {"domain": domain, "range": rng}, "legend": None}
spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": {"text": "Plodnost klesla po roce 2021 o 0,2 dítěte na ženu ve Švédsku, Francii, Maďarsku i Kanadě",
              "subtitle": "Úhrnná plodnost, 2000–2024; Česko pro srovnání (od roku 2021 −0,47)"},
    "_source": "[Fertility indicators (demo_find), Eurostat](https://ec.europa.eu/eurostat/databrowser/view/demo_find/default/table?lang=en) · Kanada: Světová banka a OSN, 2024 [Statistics Canada](https://www150.statcan.gc.ca/n1/daily-quotidien/250924/dq250924d-eng.htm)\n"
               "Plodnost je počet dětí na jednu ženu při věkově specifických plodnostech daného roku, ne skutečný počet dětí žen určitého ročníku.",
    "_toggle_legend": True,
    "height": 330,
    "data": {"values": rows},
    "layer": [
        {"mark": {"type": "line", "strokeWidth": 2.5, "strokeJoin": "round", "interpolate": "monotone"},
         "encoding": {"x": x, "y": y, "color": col,
                      "tooltip": [{"field": "zeme", "title": "Země"}, {"field": "rok", "type": "quantitative", "title": "Rok", "format": "d"},
                                  {"field": "label", "title": "Úhrnná plodnost"}]}},
        {"transform": [{"filter": "datum.rok == 2024"}], "mark": {"type": "text", "align": "left", "dx": 7, "fontSize": 12.5, "fontWeight": "bold"},
         "encoding": {"x": x, "y": y, "color": col, "text": {"field": "label"}}},
    ],
    "config": {"view": {"stroke": None}},
}
path = os.path.join(outdir, "GRAF_12_PLODNOST.json")
json.dump(spec, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(path)
