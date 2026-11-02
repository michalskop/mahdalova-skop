"""Sestaví dva další grafy článku 15 (voličská základna):
  GRAF_15_UCAST_VEK.json     – účast ve volbách 2025 podle věku (Ozvěny voleb 2025, SIMAR, s. 13)
  GRAF_15_KRAJE_PROJEKCE.json – změna počtu obyvatel krajů 2024 → 2081 (ČSÚ, Projekce obyvatelstva v krajích ČR 2024–2080)
→ apps/web/public/specialy/dpbp/charts/. Spuštění: python -X utf8 -I build_charts_extra.py
Data jsou v data/ucast_vek.csv a data/kraje_projekce.csv (původ viz README.md)."""
import csv, json, os
here = os.path.dirname(os.path.abspath(__file__))
outdir = os.path.normpath(os.path.join(here, "../../../../../public/specialy/dpbp/charts"))
INK, RED, NAVY, BEIGE, GRID = "#101432", "#de1743", "#2f325c", "#bcbcb0", "#e8e8dc"
MINUS = "−"


def cz(x, nd=1, sign=False):
    t = f"{abs(x):.{nd}f}".replace(".", ",")
    if x < 0:
        return MINUS + t
    return ("+" + t) if sign else t


def read(name):
    return list(csv.DictReader(open(os.path.join(here, "data", name), encoding="utf-8")))


# ---------------------------------------------------------------- účast podle věku
ucast = read("ucast_vek.csv")
CELKEM = 69
vals = [int(r["ucast"]) for r in ucast]
lowest = {r["vek"] for r in ucast if int(r["ucast"]) == min(vals) or int(r["ucast"]) == min(v for v in vals if v > min(vals))}
rows = []
for r in ucast:
    u = int(r["ucast"])
    rows.append({"vek": r["vek"], "ucast": u, "label": f"{u} %", "skupina": "nejnižší účast" if r["vek"] in lowest else "ostatní",
                 "hlavicka": f"Věk {r['vek']} let" if r["vek"] != "78+" else "Věk 78 a více let",
                 "Účast": f"{u} %", "Proti průměru": f"{u - CELKEM:+d} p. b.".replace("-", MINUS) if u != CELKEM else "0 p. b."})
order = [r["vek"] for r in rows]
y = {"field": "vek", "type": "ordinal", "sort": order, "title": "Věk (roky)",
     "axis": {"grid": False, "domain": False, "ticks": False, "labelPadding": 8, "labelFontSize": 12,
              "titleAngle": 0, "titleAlign": "left", "titleX": -70, "titleY": -8, "titleFontSize": 11.5, "titleFontWeight": "normal"}}
x = {"field": "ucast", "type": "quantitative", "title": None, "scale": {"domain": [0, 90]},
     "axis": {"values": [0, 20, 40, 60, 80], "grid": True, "gridColor": GRID, "domain": False, "ticks": False, "labelExpr": "datum.value + '\u00a0%'"}}
col = {"field": "skupina", "type": "nominal", "scale": {"domain": ["nejnižší účast", "ostatní"], "range": [RED, NAVY]}, "legend": None}
ucast_spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": {"text": "Účast ve volbách 2025 byla nejnižší mezi 33 a 42 lety, nejvyšší od 68 let",
              "subtitle": "Podíl lidí, kteří uvedli, že se voleb 3.–4. října 2025 zúčastnili; všechny věky dohromady 69\u00a0%"},
    "_source": "[Ozvěny voleb 2025, společná povolební studie STEM, Kantar, Ipsos, Median, NMS a Data Collect (SIMAR), s. 13](https://www.stem.cz/wp-content/uploads/2026/01/SIMAR_spolecna_povolebni_studie.pdf)\nVýzkum na vzorku 7 738 lidí, údaje jsou z dotazníku, ne z volebních seznamů; v pětiletých skupinách se výsledky mohou lišit o několik bodů.",
    "height": 360,
    "data": {"values": rows},
    "layer": [
        {"mark": {"type": "bar", "cornerRadiusEnd": 2, "height": {"band": 0.72}}, "encoding": {"y": y, "x": x, "color": col}},
        {"mark": {"type": "rule", "strokeDash": [4, 4], "strokeWidth": 1, "color": INK, "opacity": 0.6}, "encoding": {"x": {"datum": CELKEM}}},
        {"mark": {"type": "text", "align": "right", "dx": -7, "fontSize": 13, "fontWeight": "bold", "color": "#ffffff"}, "encoding": {"y": y, "x": x, "text": {"field": "label"}}},
        {"data": {"values": [{"vek": order[0], "ucast": CELKEM, "t": "všechny věky: 69\u00a0%"}]},
         "mark": {"type": "text", "align": "left", "baseline": "bottom", "dx": 6, "dy": -14, "fontSize": 12, "color": INK},
         "encoding": {"y": y, "x": x, "text": {"field": "t"}}},
        {"mark": {"type": "rect", "fill": BEIGE, "cursor": "default"},
         "encoding": {"y": y, "x": {"datum": 0}, "x2": {"datum": 90}, "fillOpacity": {"value": 0},
                      "tooltip": [{"field": k, "title": k} for k in ["hlavicka", "Účast", "Proti průměru"]]}},
    ],
    "config": {"view": {"stroke": None}},
}

# ---------------------------------------------------------------- kraje
kraje = read("kraje_projekce.csv")
kraje.sort(key=lambda r: -float(r["zmena_obyv_pct"]))
rows2 = []
for r in kraje:
    z = float(r["zmena_obyv_pct"]); zd = float(r["zmena_dospeli_pct"])
    a, b = int(r["obyv_2024"]), int(r["obyv_2081"])
    mil = lambda n: (f"{n / 1e6:.2f}".replace(".", ",") + " mil.") if n >= 1e6 else (f"{round(n / 1000)} tis.")
    rows2.append({"kraj": r["kraj"], "zmena": z, "label": cz(z, 1, True) + " %", "skupina": "roste" if z > 0 else "ubývá",
                  "hlavicka": r["kraj_plny"], "Obyvatelé": f"{cz(z, 1, True)} % ({mil(a)} → {mil(b)})", "Dospělí od 18 let": cz(zd, 1, True) + " %"})
korder = [r["kraj"] for r in rows2]
ky = {"field": "kraj", "type": "nominal", "sort": korder, "title": None,
      "axis": {"grid": False, "domain": False, "ticks": False, "labelPadding": 8, "labelFontSize": 12}}
kx = {"field": "zmena", "type": "quantitative", "title": None, "scale": {"domain": [-56, 56]},
      "axis": {"values": [-40, -20, 0, 20, 40], "grid": True, "gridColor": GRID, "domain": False, "ticks": False,
               "labelExpr": "(datum.value > 0 ? '+' : datum.value < 0 ? '−' : '') + abs(datum.value) + ' %'"}}
kcol = {"field": "skupina", "type": "nominal", "scale": {"domain": ["roste", "ubývá"], "range": [RED, NAVY]}, "legend": None}
kraje_spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": {"text": "Podle projekce poroste do roku 2080 jen Praha, Středočeský a Plzeňský kraj",
              "subtitle": "Změna počtu obyvatel od 1. 1. 2024 do 1. 1. 2081, střední varianta krajské projekce ČSÚ; Karlovarský kraj ztratí 44 % obyvatel"},
    "_source": "[Projekce obyvatelstva v krajích ČR 2024–2080, ČSÚ](https://csu.gov.cz/produkty/projekce-obyvatelstva-v-krajich-cr-do-roku-2080) · vlastní výpočet\nProjekce počtu obyvatel na padesát let dopředu, ne podílu krajů mezi voliči v roce 2029; obyvatelé včetně cizinců.",
    "height": 340,
    "data": {"values": rows2},
    "layer": [
        {"mark": {"type": "bar", "cornerRadiusEnd": 2, "height": {"band": 0.7}}, "encoding": {"y": ky, "x": kx, "color": kcol}},
        {"mark": {"type": "rule", "strokeWidth": 1, "color": INK, "opacity": 0.7}, "encoding": {"x": {"datum": 0}}},
        {"transform": [{"filter": "datum.zmena > 0"}], "mark": {"type": "text", "align": "left", "dx": 5, "fontSize": 12.5, "fontWeight": "bold"},
         "encoding": {"y": ky, "x": kx, "color": kcol, "text": {"field": "label"}}},
        {"transform": [{"filter": "datum.zmena < 0"}], "mark": {"type": "text", "align": "right", "dx": -5, "fontSize": 12.5, "fontWeight": "bold"},
         "encoding": {"y": ky, "x": kx, "color": kcol, "text": {"field": "label"}}},
        {"mark": {"type": "rect", "fill": BEIGE, "cursor": "default"},
         "encoding": {"y": ky, "x": {"datum": -56}, "x2": {"datum": 56}, "fillOpacity": {"value": 0},
                      "tooltip": [{"field": k, "title": k} for k in ["hlavicka", "Obyvatelé", "Dospělí od 18 let"]]}},
    ],
    "config": {"view": {"stroke": None}},
}

for name, spec in (("GRAF_15_UCAST_VEK.json", ucast_spec), ("GRAF_15_KRAJE_PROJEKCE.json", kraje_spec)):
    path = os.path.join(outdir, name)
    json.dump(spec, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(path)
print([ (r["vek"], r["ucast"], r["skupina"]) for r in rows])
print([(r["kraj"], r["label"]) for r in rows2])
