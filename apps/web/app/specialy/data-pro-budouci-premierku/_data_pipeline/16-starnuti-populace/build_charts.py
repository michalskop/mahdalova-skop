"""Sestaví čtyři grafy článku 16 (Stárnutí populace) do apps/web/public/specialy/dpbp/charts/:
  GRAF_16_POMER.json     – poměr lidí ve věku 15–64 let k seniorům (65+), střední varianta 2023–2060, pás 2038–2043
  GRAF_16_ROCNIKY.json   – velikost ročníků narozených 1923–2022 (stav k 1. 1. 2023), ročníky 70. let zvýrazněny
  GRAF_16_VARIANTY.json  – poměr 15–64 : 65+ ve třech variantách projekce, shodný v roce 2040
  GRAF_16_OBYVATELE.json – počet obyvatel ve třech variantách projekce (rozjíždí se, na rozdíl od poměru)
Data: data/vek_*2023.csv (ČSÚ, Projekce obyvatelstva ČR 2023–2100, viz README.md). Spuštění: python -X utf8 -I build_charts.py"""
import csv, json, os

here = os.path.dirname(os.path.abspath(__file__))
outdir = os.path.normpath(os.path.join(here, "../../../../../public/specialy/dpbp/charts"))
INK, RED, NAVY, TEAL, BEIGE, GRID = "#101432", "#de1743", "#2f325c", "#0e8aab", "#bcbcb0", "#e8e8dc"
MINUS = "−"
NB = " "


def cz(x, nd=1):
    t = f"{abs(x):.{nd}f}".replace(".", ",")
    return (MINUS + t) if x < 0 else t


def load(name):
    d = {}
    for r in csv.DictReader(open(os.path.join(here, "data", name), encoding="utf-8")):
        d.setdefault(int(r["rok"]), {})[r["vek"]] = int(r["pocet"])
    return d


def groups(d, yr):
    ages = {int(k.rstrip("+")): v for k, v in d[yr].items() if k != "celkem"}
    work = sum(v for a, v in ages.items() if 15 <= a <= 64)
    sen = sum(v for a, v in ages.items() if a >= 65)
    return work, sen, sum(ages.values())


VAR = {"nízká": load("vek_nizka2023.csv"), "střední": load("vek_stredni2023.csv"), "vysoká": load("vek_vysoka2023.csv")}
Y0, Y1 = 2023, 2060
mil = lambda n: cz(n / 1e6, 2) + NB + "mil."


def kind(yr):
    return "skutečnost" if yr == 2023 else "projekce"


def save(name, spec):
    p = os.path.join(outdir, name)
    json.dump(spec, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(p)


def hover_layers(rows, keys, ymax, xfield="rok", half=0.5, xdomain=None, head="hlavicka", ymin=0):
    """Neviditelné pásy pro tooltip za celé datum (béžová hlavička, DESIGN.md) + tenká přerušovaná svislice na hovernutém datu."""
    bands = [dict(r, od=r[xfield] - half, do=r[xfield] + half) for r in rows]
    sc = {"domain": xdomain, "nice": False} if xdomain else {}
    guide = {"data": {"values": rows}, "mark": {"type": "rule", "strokeWidth": 1, "strokeDash": [3, 3], "color": INK},
             "encoding": {"x": {"field": xfield, "type": "quantitative", "scale": sc},
                          "y": {"datum": ymin}, "y2": {"datum": ymax},
                          "strokeOpacity": {"condition": {"param": "hov", "empty": False, "value": 0.6}, "value": 0}}}
    band = {"data": {"values": bands},
            "params": [{"name": "hov", "select": {"type": "point", "fields": [head], "on": "mouseover", "clear": "mouseout"}}],
            "mark": {"type": "rect", "fill": BEIGE, "cursor": "default"},
            "encoding": {"x": {"field": "od", "type": "quantitative", "scale": sc}, "x2": {"field": "do"},
                         "y": {"datum": ymin}, "y2": {"datum": ymax}, "fillOpacity": {"value": 0},
                         "tooltip": [{"field": k, "title": k} for k in [head] + keys]}}
    return [guide, band]


XDOM = [2022, 2061]
XAX = {"values": [2023, 2030, 2040, 2050, 2060], "format": "d", "grid": False, "domain": False, "ticks": False, "labelAngle": 0}
xq = {"field": "rok", "type": "quantitative", "title": None, "scale": {"domain": XDOM, "nice": False}, "axis": XAX}

# ---------------------------------------------------------------- A: poměr 15–64 : 65+
st = VAR["střední"]
rowsA = []
for yr in range(Y0, Y1 + 1):
    w, s, t = groups(st, yr)
    rowsA.append({"rok": yr, "pomer": round(w / s, 3), "hlavicka": f"K{NB}1.{NB}1.{NB}{yr} ({kind(yr)})",
                  "Lidí ve věku 15–64 let na jednoho seniora": cz(w / s, 1),
                  "Lidé ve věku 15–64 let": mil(w), "Senioři (65 a více let)": mil(s)})
ptsA = [r for r in rowsA if r["rok"] in (2023, 2040, 2050, 2060)]
for r in ptsA:
    r["label"] = r["Lidí ve věku 15–64 let na jednoho seniora"]
yA = {"field": "pomer", "type": "quantitative", "title": None, "scale": {"domain": [0, 3.7]},
      "axis": {"values": [0, 1, 2, 3], "grid": True, "gridColor": GRID, "domain": False, "ticks": False}}
keysA = ["Lidí ve věku 15–64 let na jednoho seniora", "Lidé ve věku 15–64 let", "Senioři (65 a více let)"]
specA = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": {"text": "Na jednoho seniora dnes připadají tři lidé ve věku 15–64 let, v roce 2050 dva",
              "subtitle": "Počet lidí ve věku 15–64 let na jednoho člověka ve věku 65 a více let k 1. 1., střední varianta projekce ČSÚ; červeně pás 2038–2043"},
    "_source": "[Projekce obyvatelstva ČR 2023–2100, střední varianta, ČSÚ](https://csu.gov.cz/produkty/projekce-obyvatelstva-ceske-republiky-2023-2100) · vlastní výpočet\nSkupina 15–64 let není počet pracujících, zahrnuje i studenty a lidi, kteří nepracují.",
    "height": 260,
    "data": {"values": rowsA},
    "layer": [
        {"data": {"values": [{"od": 2038, "do": 2043}]}, "mark": {"type": "rect", "fill": RED, "opacity": 0.12},
         "encoding": {"x": {"field": "od", "type": "quantitative", "scale": {"domain": XDOM, "nice": False}}, "x2": {"field": "do"}, "y": {"datum": 0}, "y2": {"datum": 3.7}}},
        {"mark": {"type": "area", "color": NAVY, "opacity": 0.14, "line": False}, "encoding": {"x": xq, "y": yA}},
        {"mark": {"type": "line", "color": NAVY, "strokeWidth": 2.5, "strokeJoin": "round"}, "encoding": {"x": xq, "y": yA}},
        {"data": {"values": ptsA}, "mark": {"type": "point", "filled": True, "color": NAVY, "size": 70, "opacity": 1}, "encoding": {"x": xq, "y": yA}},
        {"data": {"values": ptsA}, "mark": {"type": "text", "dy": -13, "fontSize": 13, "fontWeight": "bold", "color": NAVY}, "encoding": {"x": xq, "y": yA, "text": {"field": "label"}}},
        {"data": {"values": [{"rok": 2040.5, "pomer": 3.55, "t": "2038–2043: nejrychlejší pokles"}]},
         "mark": {"type": "text", "fontSize": 12, "fontWeight": "bold", "color": RED, "align": "center"},
         "encoding": {"x": xq, "y": yA, "text": {"field": "t"}}},
        *hover_layers(rowsA, keysA, 3.7, xdomain=XDOM),
    ],
    "config": {"view": {"stroke": None}},
}
save("GRAF_16_POMER.json", specA)

# ---------------------------------------------------------------- C: ročníky
d23 = VAR["střední"][2023]
rowsC = []
for k, v in d23.items():
    if k == "celkem":
        continue
    a = int(k.rstrip("+"))
    if k.endswith("+"):
        continue  # 100+ není jeden ročník
    born = 2022 - a
    seventies = 1970 <= born <= 1979
    rowsC.append({"rocnik": born, "tis": round(v / 1000, 1), "skupina": "70. léta" if seventies else "ostatní",
                  "hlavicka": f"Ročník {born}", "Lidí v lednu 2023": f"{cz(v / 1000, 0)}{NB}tis.", "Dosáhne 65 let": f"v roce {born + 65}"})
rowsC.sort(key=lambda r: r["rocnik"])
top = max(rowsC, key=lambda r: r["tis"])
avg70 = sum(r["tis"] for r in rowsC if r["skupina"] == "70. léta") / 10
print("největší ročník", top["rocnik"], top["tis"], "průměr 70. let", round(avg70, 1))
xC = {"field": "rocnik", "type": "ordinal", "title": None, "sort": [r["rocnik"] for r in rowsC],
      "axis": {"values": list(range(1930, 2021, 10)), "labelAngle": 0, "grid": False, "domain": False, "ticks": False}}
yC = {"field": "tis", "type": "quantitative", "title": None, "scale": {"domain": [0, 215]},
      "axis": {"values": [0, 50, 100, 150, 200], "grid": True, "gridColor": GRID, "domain": False, "ticks": False}}
cC = {"field": "skupina", "type": "nominal", "scale": {"domain": ["70. léta", "ostatní"], "range": [RED, NAVY]}, "legend": None}
specC = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": {"text": "Nejsilnější ročníky jsou z 70. let a 65 let jim bude v letech 2035 až 2044",
              "subtitle": "Počet lidí podle roku narození (tisíce) k 1. 1. 2023; červeně ročníky 1970–1979"},
    "_source": "[Projekce obyvatelstva ČR 2023–2100, tabulka 1, ČSÚ](https://csu.gov.cz/produkty/projekce-obyvatelstva-ceske-republiky-2023-2100) · vlastní výpočet\nRok narození je odvozen z věku k 1. 1. 2023; lidé starší 99 let nejsou zahrnuti.",
    "height": 260,
    "data": {"values": rowsC},
    "layer": [
        {"mark": {"type": "bar", "width": {"band": 0.9}}, "encoding": {"x": xC, "y": yC, "color": cC}},
        {"data": {"values": [dict(top, t=f"nejsilnější ročník {top['rocnik']}: {cz(top['tis'], 0)}{NB}tis.")]},
         "mark": {"type": "text", "dy": -9, "fontSize": 12.5, "fontWeight": "bold", "color": RED, "align": "right", "dx": 36},
         "encoding": {"x": xC, "y": yC, "text": {"field": "t"}}},
        {"mark": {"type": "rect", "fill": BEIGE, "cursor": "default"},
         "encoding": {"x": xC, "y": {"datum": 0}, "y2": {"datum": 215}, "fillOpacity": {"value": 0},
                      "tooltip": [{"field": k, "title": k} for k in ["hlavicka", "Lidí v lednu 2023", "Dosáhne 65 let"]]}},
    ],
    "config": {"view": {"stroke": None}},
}
save("GRAF_16_ROCNIKY.json", specC)

# ---------------------------------------------------------------- D, E: varianty
COL = {"nízká": TEAL, "střední": NAVY, "vysoká": RED}
rowsD, rowsE, recD, recE = [], [], [], []
for yr in range(Y0, Y1 + 1):
    rd = {"rok": yr, "hlavicka": f"K{NB}1.{NB}1.{NB}{yr} ({kind(yr)})"}
    re = dict(rd)
    for v in ("nízká", "střední", "vysoká"):
        w, s, t = groups(VAR[v], yr)
        rowsD.append({"rok": yr, "varianta": v, "pomer": round(w / s, 3), "label": cz(w / s, 1)})
        rowsE.append({"rok": yr, "varianta": v, "obyv": round(t / 1e6, 3), "label": cz(t / 1e6, 2)})
        rd[f"{v} varianta"] = cz(w / s, 2)
        re[f"{v} varianta"] = mil(t)
    recD.append(rd)
    recE.append(re)
colV = {"field": "varianta", "type": "nominal", "scale": {"domain": list(COL), "range": list(COL.values())}, "legend": None}
keysV = [f"{v} varianta" for v in ("vysoká", "střední", "nízká")]
yD = {"field": "pomer", "type": "quantitative", "title": None, "scale": {"domain": [0, 3.7]},
      "axis": {"values": [0, 1, 2, 3], "grid": True, "gridColor": GRID, "domain": False, "ticks": False}}
xv = dict(xq, scale={"domain": [2022, 2063], "nice": False})
w40 = {v: groups(VAR[v], 2040) for v in COL}
r40 = {v: w40[v][0] / w40[v][1] for v in COL}
print("poměr 2040:", {v: round(r, 3) for v, r in r40.items()})
end60 = [r for r in rowsD if r["rok"] == 2060]
specD = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": {"text": "Ať se rodí víc, nebo méně, v roce 2040 vychází na jednoho seniora stejně 2,5 člověka ve věku 15–64 let",
              "subtitle": "Lidí ve věku 15–64 let na jednoho seniora k 1. 1. ve třech variantách projekce (úhrnná plodnost 1,25 / 1,5 / 1,75)"},
    "_source": "[Projekce obyvatelstva ČR 2023–2100, nízká, střední a vysoká varianta, ČSÚ](https://csu.gov.cz/produkty/projekce-obyvatelstva-ceske-republiky-2023-2100) · vlastní výpočet\nDítě narozené dnes bude mít v roce 2040 čtrnáct let, do skupiny 15–64 let vstoupí až později.",
    "height": 260,
    "data": {"values": rowsD},
    "layer": [
        {"mark": {"type": "line", "strokeWidth": 2.5, "strokeJoin": "round"}, "encoding": {"x": xv, "y": yD, "color": colV, "detail": {"field": "varianta"}}},
        {"mark": {"type": "rule", "strokeDash": [4, 4], "strokeWidth": 1, "color": INK, "opacity": 0.55}, "encoding": {"x": {"datum": 2040}}},
        {"data": {"values": [{"rok": 2040, "pomer": 3.45, "t": "2040: ve všech variantách 2,5"}]},
         "mark": {"type": "text", "fontSize": 12, "fontWeight": "bold", "color": INK, "align": "left", "dx": 7},
         "encoding": {"x": xv, "y": yD, "text": {"field": "t"}}},
        {"data": {"values": end60}, "mark": {"type": "text", "align": "left", "dx": 6, "fontSize": 12.5, "fontWeight": "bold"},
         "encoding": {"x": xv, "y": yD, "color": colV, "text": {"field": "label"}}},
        *hover_layers(recD, keysV, 3.7, xdomain=[2022, 2063]),
    ],
    "config": {"view": {"stroke": None}},
}
save("GRAF_16_VARIANTY.json", specD)

yE = {"field": "obyv", "type": "quantitative", "title": None, "scale": {"domain": [8.5, 12]},
      "axis": {"values": [9, 10, 11, 12], "grid": True, "gridColor": GRID, "domain": False, "ticks": False,
               "labelExpr": "datum.value + ' mil.'"}}
end40 = [dict(r, t=r["label"] + " mil.") for r in rowsE if r["rok"] == 2040]
end60 = [dict(r, t=f"{r['varianta']} varianta: {r['label']} mil.") for r in rowsE if r["rok"] == 2060]
XDE = [2022, 2076]
xvE = dict(xq, scale={"domain": XDE, "nice": False})
specE = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": {"text": "V roce 2040 se varianty liší o 0,7 milionu lidí, ale poměr lidí ve věku 15–64 let k seniorům je stejný",
              "subtitle": "Počet obyvatel Česka k 1. 1. ve třech variantách projekce ČSÚ: nejnižší má v roce 2040 10,3 milionu lidí, nejvyšší 11,0 milionu"},
    "_source": "[Projekce obyvatelstva ČR 2023–2100, nízká, střední a vysoká varianta, ČSÚ](https://csu.gov.cz/produkty/projekce-obyvatelstva-ceske-republiky-2023-2100) · vlastní výpočet\nVarianty se liší plodností, úmrtností a saldem migrace; stárnutí do čtyřicátých let ovlivňují málo.",
    "height": 260,
    "data": {"values": rowsE},
    "layer": [
        {"mark": {"type": "line", "strokeWidth": 2.5, "strokeJoin": "round"}, "encoding": {"x": xvE, "y": yE, "color": colV, "detail": {"field": "varianta"}}},
        {"mark": {"type": "rule", "strokeDash": [4, 4], "strokeWidth": 1, "color": INK, "opacity": 0.55}, "encoding": {"x": {"datum": 2040}}},
        {"data": {"values": end40}, "mark": {"type": "point", "filled": True, "size": 70, "opacity": 1},
         "encoding": {"x": xvE, "y": yE, "color": colV}},
        # hodnoty v roce 2040 vpravo od svislice, s jednotkou a nad / pod čarou, aby je čára neprotínala a nevypadaly jako čas
        *[{"data": {"values": [r for r in end40 if r["varianta"] == v]}, "mark": {"type": "text", "align": "left", "dx": 12, "dy": dy, "fontSize": 12.5, "fontWeight": "bold"},
           "encoding": {"x": xvE, "y": yE, "color": colV, "text": {"field": "t"}}} for v, dy in (("vysoká", -12), ("střední", 14), ("nízká", 14))],
        {"data": {"values": [{"rok": 2040, "obyv": 11.85, "t": "rok 2040"}]}, "mark": {"type": "text", "align": "left", "dx": 6, "fontSize": 12, "fontWeight": "bold", "color": INK},
         "encoding": {"x": xvE, "y": yE, "text": {"field": "t"}}},
        # názvy čar na jejich konci (rok 2060)
        {"data": {"values": end60}, "mark": {"type": "text", "align": "left", "dx": 7, "fontSize": 12.5, "fontWeight": "bold"},
         "encoding": {"x": xvE, "y": yE, "color": colV, "text": {"field": "t"}}},
        *hover_layers(recE, keysV, 12, xdomain=XDE, ymin=8.5),
    ],
    "config": {"view": {"stroke": None}},
}
save("GRAF_16_OBYVATELE.json", specE)
