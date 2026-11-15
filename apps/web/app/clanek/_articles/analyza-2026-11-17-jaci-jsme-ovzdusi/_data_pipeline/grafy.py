"""Grafy kapitoly „Ovzduší“. Čísla bere jen z cisla.json (spočítal cisla.py z archivu).
Pořadí:  python cisla.py && python grafy.py   → ../data/*.json (Vega-Lite), řádky GRAF připíše do vystup.txt
"""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
DATA = HERE.parent / "data"
CRIMSON, BLUE, INK, MUTED = "#de1743", "#6267a3", "#101432", "#d4d4c8"
NB = " "
C = json.loads((HERE / "cisla.json").read_text(encoding="utf-8"))
out = []


def log(*a):
    out.append(" ".join(str(x) for x in a))


def cz(x, d=1):
    return f"{x:,.{d}f}".replace(",", NB).replace(".", ",")


def spec(title, subtitle, values, layers, source, height=None, step=None):
    s = {"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
         "title": {"text": title, "subtitle": subtitle},
         "width": "container",
         "config": {"view": {"stroke": None}}, "data": {"values": values}, "layer": layers, "_source": source}
    if height:
        s["height"] = height
    if step:
        s["height"] = {"step": step}
    return s


INV = ("ČHMÚ, [emisní inventura](https://opendata.chmi.cz/air_quality/products/emissions/inventory/"
       "CZ-Annex-I-rev18-11-1990-2023-v11.xlsx); výpočet DataTimes")

# ---------- Graf 1: emise SO2 a BaP, 1990 = 100 ----------
em = C["emise"]
b0 = next(r for r in em if r["rok"] == 1990)
v1 = []
for r in em:
    for lat, key in [("oxid siřičitý", "SO2_kt"), ("benzo[a]pyren", "BaP_t")]:
        idx = 100 * r[key] / b0[key]
        jedn = "tis. t" if key == "SO2_kt" else "t"
        v1.append({"rok": r["rok"], "latka": lat, "index": round(idx, 1),
                   "t": f"{cz(r[key], 1)} {jedn} ({cz(idx, 0)} % roku 1990)"})
konec = [x for x in v1 if x["rok"] == 2023]
for x in konec:
    x["popisek"] = f"{x['latka']} {cz(x['index'], 0)}{NB}%"
    log("GRAF emise 2023 index", x["latka"], x["index"])
log("GRAF emise BaP 2000 index", next(x["index"] for x in v1 if x["rok"] == 2000 and x["latka"] == "benzo[a]pyren"))
col = {"field": "latka", "type": "nominal", "legend": None,
       "scale": {"domain": ["oxid siřičitý", "benzo[a]pyren"], "range": [BLUE, CRIMSON]}}
x1 = {"field": "rok", "type": "quantitative", "scale": {"domain": [1990, 2023]},
      "axis": {"title": None, "format": "d", "grid": False, "domain": False, "ticks": False, "values": [1990, 2000, 2010, 2023]}}
y1 = {"field": "index", "type": "quantitative", "scale": {"domain": [0, 110]},
      "axis": {"title": None, "grid": True, "gridColor": MUTED, "domain": False, "ticks": False, "values": [0, 25, 50, 75, 100],
               "labelExpr": "datum.value + ' %'"}}
g1 = spec(f"Emise oxidu siřičitého skoro zmizely, {{benzo[a]pyrenu|{CRIMSON}}} se vypouští stejně jako v roce 2000",
          "Roční emise v Česku v % roku 1990 (100 % = 1 754 tis. t oxidu siřičitého, 79,7 t benzo[a]pyrenu); 1990–2023",
          v1, [
              {"mark": {"type": "line", "strokeWidth": 2.5},
               "encoding": {"x": x1, "y": y1, "color": col,
                            "tooltip": [{"field": "latka", "title": "Látka"}, {"field": "rok", "title": "Rok"}, {"field": "t", "title": "Emise"}]}},
              {"transform": [{"filter": "datum.rok == 2023"}],
               "mark": {"type": "text", "align": "right", "baseline": "bottom", "dy": -8, "fontSize": 12, "fontWeight": 700},
               "encoding": {"x": x1, "y": y1, "text": {"field": "popisek"}, "color": col}},
          ], INV, height=260)
g1["data"]["values"] = v1

# ---------- Graf 2: SO2 v Ústeckém kraji ----------
u = [r for r in C["so2_ustecky"] if r["rok"] >= 1985]
v2 = [{"rok": r["rok"], "v": r["v"], "t": f"{cz(r['v'], 1)} µg/m³ (průměr {r['n']} stanic)"} for r in u]
u89 = next(r for r in u if r["rok"] == 1989)
u25 = next(r for r in u if r["rok"] == 2025)
pom = u89["v"] / u25["v"]
log("GRAF SO2 Ústecký 1989", u89["v"], "stanic", u89["n"], "→ 2025", u25["v"], "stanic", u25["n"], "poměr", round(pom, 1))
lab = [{"rok": 1989, "v": u89["v"], "p": f"1989: {cz(u89['v'], 1)}", "barva": BLUE, "al": "left"},
       {"rok": 2025, "v": u25["v"], "p": f"2025: {cz(u25['v'], 1)}", "barva": CRIMSON, "al": "right"}]
x2 = {"field": "rok", "type": "quantitative", "scale": {"domain": [1985, 2025]},
      "axis": {"title": None, "format": "d", "grid": False, "domain": False, "ticks": False, "values": [1985, 1989, 2000, 2010, 2025]}}
y2 = {"field": "v", "type": "quantitative", "scale": {"domain": [0, 100]},
      "axis": {"title": None, "grid": True, "gridColor": MUTED, "domain": False, "ticks": False, "values": [0, 25, 50, 75]}}
g2 = spec(f"V Ústeckém kraji je ve vzduchu {{skoro osmnáctkrát|{CRIMSON}}} méně oxidu siřičitého než v roce 1989",
          "Roční průměrná koncentrace oxidu siřičitého v µg/m³, průměr měřicích stanic v kraji; 1985–2025. Počet a umístění stanic se mění (1989: 35, 2025: 11)",
          v2, [
              {"mark": {"type": "area", "color": CRIMSON, "opacity": 0.12, "line": {"color": CRIMSON, "strokeWidth": 2.5}},
               "encoding": {"x": x2, "y": y2, "tooltip": [{"field": "rok", "title": "Rok"}, {"field": "t", "title": "Oxid siřičitý"}]}},
              {"data": {"values": lab}, "mark": {"type": "circle", "size": 70, "opacity": 1},
               "encoding": {"x": x2, "y": y2, "color": {"field": "barva", "type": "nominal", "scale": None}}},
              {"data": {"values": [lab[0]]}, "mark": {"type": "text", "align": "left", "dx": 8, "dy": -10, "fontSize": 12, "fontWeight": 700, "color": BLUE},
               "encoding": {"x": x2, "y": y2, "text": {"field": "p"}}},
              {"data": {"values": [lab[1]]}, "mark": {"type": "text", "align": "right", "dy": -14, "fontSize": 12, "fontWeight": 700, "color": CRIMSON},
               "encoding": {"x": x2, "y": y2, "text": {"field": "p"}}},
          ], "ČHMÚ, [OpenISKO](https://opendata.chmi.cz/air_quality/historical/); výpočet DataTimes",
          height=250)

# ---------- Graf 3: kraje podle obyvatel nad limitem BaP ----------
kr = [k for k in C["kraje"] if k["nad"] >= 1]
nulove = [k["kraj"] for k in C["kraje"] if k["nad"] < 1]
v3 = []
for k in kr:
    nazev = k["kraj"].replace(" kraj", "").replace("Kraj ", "")
    v3.append({"kraj": nazev, "nad": k["nad"], "popisek": f"{cz(k['nad'], 0)} ({cz(k['podil'], 1)}{NB}%)",
               "t": f"{cz(k['nad'], 0)} z {cz(k['obyv'], 0)} obyvatel ({cz(k['podil'], 1)} %)", "msk": nazev == "Moravskoslezský"})
    log("GRAF kraje", nazev, k["nad"], k["podil"])
mx = max(k["nad"] for k in kr)
y3 = {"field": "kraj", "type": "nominal", "sort": None, "axis": None, "scale": {"paddingInner": 0.45, "paddingOuter": 0.5}}
x3 = {"field": "nad", "type": "quantitative", "scale": {"domain": [0, mx * 1.45]}, "axis": None}
tt3 = [{"field": "kraj", "title": "Kraj"}, {"field": "t", "title": "Nad limitem"}]
g3 = spec(f"Čtyři z pěti lidí, kteří dýchají nadlimitní benzo[a]pyren, žijí v {{Moravskoslezském kraji|{CRIMSON}}}",
          "Obyvatelé v místech, kde pětiletý průměr 2021–2025 překračuje limit 1 ng/m³; v závorce podíl obyvatel kraje. "
          "Praha, Vysočina, Karlovarský, Jihočeský a Liberecký kraj: nikdo",
          v3, [
              {"mark": {"type": "bar", "cornerRadiusEnd": 3, "height": {"band": 1}},
               "encoding": {"y": y3, "x": x3, "color": {"field": "msk", "type": "nominal", "legend": None,
                                                      "scale": {"domain": [True, False], "range": [CRIMSON, BLUE]}}, "tooltip": tt3}},
              {"mark": {"type": "text", "align": "left", "dx": 5, "fontSize": 12, "fontWeight": 700, "color": INK},
               "encoding": {"y": y3, "x": x3, "text": {"field": "popisek"}, "tooltip": tt3}},
              {"mark": {"type": "text", "align": "left", "baseline": "bottom", "dy": -10, "fontSize": 12, "color": "#333333"},
               "encoding": {"y": y3, "x": {"datum": 0, "type": "quantitative", "scale": {"domain": [0, mx * 1.45]}}, "text": {"field": "kraj"}}},
          ], "ČHMÚ, [model 2021–2025](https://opendata.chmi.cz/air_quality/products/5year_avg/), Eurostat; výpočet DataTimes", step=40)
log("GRAF kraje bez nadlimitních:", ", ".join(nulove))

# ---------- Graf 4: pískoty u dětí podle části Ostravy (Dostál a kol. 2013) ----------
NAZVY = {"east": "Východ (Radvanice a Bartovice)", "south": "Jih", "center": "Střed", "west": "Západ"}
v4 = []
for r in C["piskoty"]:
    v4.append({"oblast": NAZVY[r["oblast"]], "pct": r["pct"], "popisek": f"{cz(r['pct'], 1)}{NB}%",
               "t": f"{cz(r['pct'], 1)} % z {r['n']} dětí", "vychod": r["oblast"] == "east"})
    log("GRAF pískoty", r["oblast"], r["pct"], r["n"])
y4 = {"field": "oblast", "type": "nominal", "sort": None, "axis": None, "scale": {"paddingInner": 0.45, "paddingOuter": 0.5}}
x4 = {"field": "pct", "type": "quantitative", "scale": {"domain": [0, 50]}, "axis": None}
tt4 = [{"field": "oblast", "title": "Část Ostravy"}, {"field": "t", "title": "Opakované pískoty"}]
g4 = spec(f"Děti z {{nejznečištěnější části Ostravy|{CRIMSON}}} měly opakované pískoty skoro třikrát častěji",
          "Podíl dětí s opakovanými pískoty (wheezing) do 5 let podle části Ostravy, kde žily od narození; děti narozené 2001–2004",
          v4, [
              {"mark": {"type": "bar", "cornerRadiusEnd": 3, "height": {"band": 1}},
               "encoding": {"y": y4, "x": x4, "color": {"field": "vychod", "type": "nominal", "legend": None,
                                                      "scale": {"domain": [True, False], "range": [CRIMSON, BLUE]}}, "tooltip": tt4}},
              {"mark": {"type": "text", "align": "left", "dx": 5, "fontSize": 12, "fontWeight": 700, "color": INK},
               "encoding": {"y": y4, "x": x4, "text": {"field": "popisek"}, "tooltip": tt4}},
              {"mark": {"type": "text", "align": "left", "baseline": "bottom", "dy": -10, "fontSize": 12, "color": "#333333"},
               "encoding": {"y": y4, "x": {"datum": 0, "type": "quantitative", "scale": {"domain": [0, 50]}}, "text": {"field": "oblast"}}},
          ], "Dostál a kol., [Environmental Health 2013](https://ehjournal.biomedcentral.com/articles/10.1186/1476-069X-12-74)", step=40)

DATA.mkdir(exist_ok=True)
for name, s in [("emise", g1), ("so2-ustecky", g2), ("kraje-bap", g3), ("ostrava-piskoty", g4)]:
    (DATA / f"{name}.json").write_text(json.dumps(s, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
with open(HERE / "vystup.txt", "a", encoding="utf-8") as f:
    f.write("\n".join(out) + "\n")
print("\n".join(out))
