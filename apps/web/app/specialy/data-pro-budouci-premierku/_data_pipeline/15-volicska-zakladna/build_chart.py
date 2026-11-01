"""Sestaví Vega-Lite spec grafu GRAF_15_VEKOVE_SKUPINY (podíl věkových skupin z obyvatel 18+ k 1. 1.)
→ apps/web/public/specialy/dpbp/charts/GRAF_15_VEKOVE_SKUPINY.json. Spuštění: python -X utf8 -I build_chart.py"""
import csv, json, os
here = os.path.dirname(os.path.abspath(__file__))
out = os.path.normpath(os.path.join(here, "../../../../../public/specialy/dpbp/charts/GRAF_15_VEKOVE_SKUPINY.json"))

def load(name):
    d = {}
    for r in csv.DictReader(open(os.path.join(here, "data", name), encoding="utf-8")):
        if r["vek"] != "celkem":
            d.setdefault(int(r["rok"]), {})[int(r["vek"].rstrip("+"))] = int(r["pocet"])
    return d
stredni, p2018 = load("proj_stredni.csv"), load("proj2018_stredni.csv")
GROUPS = (("18–29 let", 18, 29), ("30–49 let", 30, 49), ("50 let a více", 50, 200))
YEARS = ((2018, p2018, "skutečnost"), (2023, stredni, "skutečnost"), (2026, stredni, "projekce"), (2030, stredni, "projekce"), (2035, stredni, "projekce"), (2040, stredni, "projekce"))
rows = []
for y, src, typ in YEARS:
    adult = sum(v for k, v in src[y].items() if k >= 18)
    for name, lo, hi in GROUPS:
        n = sum(v for k, v in src[y].items() if lo <= k <= hi)
        p = 100 * n / adult
        rows.append({"rok": y, "skupina": name, "podil": round(p, 1), "label": f"{p:.1f}".replace(".", ",") + " %", "typ": typ, "pocet": n})
colors = {"18–29 let": "#0e8aab", "30–49 let": "#2f325c", "50 let a více": "#de1743"}
x = {"field": "rok", "type": "quantitative", "title": None, "scale": {"domain": [2016, 2041.5], "nice": False},
     "axis": {"values": [2018, 2023, 2026, 2030, 2035, 2040], "format": "d", "grid": False, "domain": False, "ticks": False, "labelAngle": 0}}
y = {"field": "podil", "type": "quantitative", "title": None, "scale": {"domain": [0, 62]},
     "axis": {"values": [0, 20, 40, 60], "grid": True, "gridColor": "#e8e8dc", "domain": False, "ticks": False, "labelExpr": "datum.value + ' %'"}}
def tint(h, k=0.4):
    r, g, b = (int(h[i:i + 2], 16) for i in (1, 3, 5))
    return "#%02x%02x%02x" % tuple(round(c * k + 255 * (1 - k)) for c in (r, g, b))
col = {"field": "skupina", "type": "nominal", "scale": {"domain": list(colors), "range": list(colors.values())}, "legend": None}
# Neviditelný pás za každé datum (viz DESIGN.md → Tooltip follows what the chart compares): jeden tooltip se všemi třemi
# skupinami; hlavička v nejtmavší béžové palety (background.9 #bcbcb0), řádky pojmenované podle skupin dostanou čtvereček v barvě čáry.
def mil(n): return f"{n / 1e6:.2f}".replace(".", ",") + " mil."
bands = []
yrs = [r[0] for r in YEARS]
for i, (yr, _, typ) in enumerate(YEARS):
    lo = 2016 if i == 0 else (yrs[i - 1] + yr) / 2
    hi = 2041.5 if i == len(YEARS) - 1 else (yr + yrs[i + 1]) / 2
    rec = {"hlavicka": f"K 1. 1. {yr} ({typ})", "od": lo, "do": hi}
    for g in ["50 let a více", "30–49 let", "18–29 let"]:
        r = next(r for r in rows if r["rok"] == yr and r["skupina"] == g)
        rec[g] = f"{r['label']} ({mil(r['pocet'])})"
    bands.append(rec)
band_layer = {
    "data": {"values": bands},
    "params": [{"name": "hov", "select": {"type": "point", "fields": ["hlavicka"], "on": "mouseover", "clear": "mouseout"}}],
    "mark": {"type": "rect", "fill": "#bcbcb0", "cursor": "default"},
    "encoding": {
        "x": {"field": "od", "type": "quantitative", "scale": x["scale"]}, "x2": {"field": "do"},
        "y": {"datum": 0}, "y2": {"datum": 62},
        "fillOpacity": {"value": 0},
        "tooltip": [{"field": k, "title": k} for k in ["hlavicka", "50 let a více", "30–49 let", "18–29 let"]],
    },
}

# střed viditelného pásu každé skupiny v roce LABEL_X (lineární interpolace mezi 2035 a 2040)
LABEL_X = 2037.5
def at(g, yr):
    return next(r["podil"] for r in rows if r["rok"] == yr and r["skupina"] == g)
def interp(g):
    a, b = at(g, 2035), at(g, 2040)
    return a + (b - a) * (LABEL_X - 2035) / 5
v18, v30, v50 = interp("18–29 let"), interp("30–49 let"), interp("50 let a více")
name_labels = [{"rok": LABEL_X, "skupina": "18–29 let", "podil": v18 / 2},
               {"rok": LABEL_X, "skupina": "30–49 let", "podil": (v18 + v30) / 2},
               {"rok": LABEL_X, "skupina": "50 let a více", "podil": (v30 + v50) / 2}]
guide_layer = {
    "data": {"values": [dict(b, rok=yrs[i]) for i, b in enumerate(bands)]},
    "mark": {"type": "rule", "strokeWidth": 1, "strokeDash": [3, 3], "color": "#101432"},
    "encoding": {
        "x": {"field": "rok", "type": "quantitative", "scale": x["scale"]},
        "y": {"datum": 0}, "y2": {"datum": 62},
        "strokeOpacity": {"condition": {"param": "hov", "empty": False, "value": 0.6}, "value": 0},
    },
}
AREA_OPACITY = {"18–29 let": 0.5, "30–49 let": 0.26, "50 let a více": 0.08}  # spodní plochy sytější, červená nahoře průsvitná, aby nezakryla ostatní
spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": {"text": "Podíl lidí od 50 let mezi dospělými stoupá, třicátníků a čtyřicátníků ubývá",
              "subtitle": "Podíl věkových skupin z obyvatel od 18 let k 1. lednu; 2018 a 2023 skutečnost, od 2026 střední varianta projekce ČSÚ"},
    "_source": "[Projekce obyvatelstva ČR 2023–2100, ČSÚ](https://csu.gov.cz/csu/czso/projekce-obyvatelstva-ceske-republiky-2023-2100) · [Projekce obyvatelstva ČR 2018–2100, ČSÚ](https://csu.gov.cz/produkty/projekce-obyvatelstva-ceske-republiky-2018-2100) · vlastní výpočet\nObyvatelé včetně cizinců; skutečná data ČSÚ k 1. 1. 2026 jsme nepoužili.",
    "_reveal_sequence": [[tint(colors[g]), colors[g]] for g in ["18–29 let", "30–49 let", "50 let a více"]],
    "height": 320,
    "data": {"values": rows},
    "layer": [
        # plochy se překrývají: dole tyrkysová, přes ni modrá, nakonec přes všechny červená; průsvitné barvy čar
        *[{"transform": [{"filter": f"datum.skupina == '{g}'"}], "mark": {"type": "area", "opacity": AREA_OPACITY[g], "line": False, "color": colors[g]},
           "encoding": {"x": x, "y": dict(y, stack=None)}} for g in ["18–29 let", "30–49 let", "50 let a více"]],
        {"mark": {"type": "line", "strokeWidth": 2.5, "strokeJoin": "round"}, "encoding": {"x": x, "y": y, "color": col}},
        {"mark": {"type": "point", "filled": True, "size": 70, "opacity": 1}, "encoding": {"x": x, "y": y, "color": col}},
        {"mark": {"type": "text", "dy": -12, "fontSize": 13, "fontWeight": "bold"}, "encoding": {"x": x, "y": y, "color": col, "text": {"field": "label"}}},
        # názvy skupin doprostřed viditelných ploch (v pravé části), ne na konec čar, kde by se potkaly s popisky hodnot
        {"data": {"values": name_labels}, "mark": {"type": "text", "align": "center", "fontSize": 13, "fontWeight": "bold"},
         "encoding": {"x": {"field": "rok", "type": "quantitative", "scale": x["scale"]}, "y": {"field": "podil", "type": "quantitative", "scale": y["scale"]},
                      "color": col, "text": {"field": "skupina"}}},
        guide_layer,
        band_layer,
    ],
    "config": {"view": {"stroke": None}},
}
json.dump(spec, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(out); [print(r["rok"], r["skupina"], r["label"], f"{r['pocet']:,}") for r in rows]
