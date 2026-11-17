"""Grafy kapitoly „Rodina“ (Vega-Lite → ../data/*.json).

Čísla bere jen z cisla.json, které z primárních tabulek ČSÚ počítá cisla.py.
Spuštění:  python cisla.py && python grafy.py
"""
import json
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path

HERE = Path(__file__).resolve().parent
DATA = HERE.parent / "data"
CRIMSON, BLUE, INK, GRID, MUTED = "#de1743", "#6267a3", "#101432", "#d4d4c8", "#bcbcb0"
PUB = "https://csu.gov.cz/produkty/cesko-od-roku-1989-v-cislech-aktualizace-27-8-2026"

C = {k: {int(y): v for y, v in s.items()} for k, s in json.loads((HERE / "cisla.json").read_text(encoding="utf-8")).items()}
out = []


def log(*a):
    out.append(" ".join(str(x) for x in a))


def cz(x, d=1):
    """Česky formátované číslo, zaokrouhlení half-up z desítkového zápisu (19,45 → 19,5)."""
    q = Decimal(str(x)).quantize(Decimal(1).scaleb(-d), rounding=ROUND_HALF_UP)
    return f"{q:,.{d}f}".replace(",", " ").replace(".", ",")


def base(title, subtitle, source, layers, height=260, values=None):
    s = {"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
         "title": {"text": title, "subtitle": subtitle},
         "width": "container", "height": height,
         "config": {"view": {"stroke": None}, "scale": {"zero": False}},
         "layer": layers, "_source": source}
    if values is not None:
        s["data"] = {"values": values}
    return s


def osa_x(domena=(1989, 2025), hodnoty=(1989, 2000, 2010, 2025)):
    return {"field": "rok", "type": "quantitative", "scale": {"domain": list(domena)},
            "axis": {"title": None, "format": "d", "grid": False, "domain": False, "ticks": False,
                     "values": list(hodnoty), "labelFontSize": 11}}


def osa_y(domena, hodnoty, pripona=""):
    a = {"title": None, "grid": True, "gridColor": GRID, "domain": False, "ticks": False, "values": list(hodnoty)}
    if pripona:
        a["labelExpr"] = f"datum.value + '{pripona}'"
    return {"field": "v", "type": "quantitative", "scale": {"domain": list(domena)}, "axis": a}


def rada(nazev, s, fmt, jednotka):
    return [{"rada": nazev, "rok": y, "v": v, "t": f"{cz(v, fmt)}{jednotka}"} for y, v in sorted(s.items())]


def cara(nazev, barva, ydom, yval, pripona="", dash=None, width=2.5):
    mark = {"type": "line", "color": barva, "strokeWidth": width, "interpolate": "monotone",
            "point": {"filled": True, "size": 16, "color": barva}}
    if dash:
        mark["strokeDash"] = dash
    return {"transform": [{"filter": f"datum.rada == '{nazev}'"}], "mark": mark,
            "encoding": {"x": osa_x(), "y": osa_y(ydom, yval, pripona),
                         "tooltip": [{"field": "rada", "title": "Řada"}, {"field": "rok", "title": "Rok"},
                                     {"field": "t", "title": "Hodnota"}]}}


def popisek(rok, v, text, barva=INK, align="left", baseline="bottom", dx=0, dy=-6, bold=True, size=11.5):
    return {"data": {"values": [{"rok": rok, "v": v, "text": text}]},
            "mark": {"type": "text", "align": align, "baseline": baseline, "dx": dx, "dy": dy,
                     "fontSize": size, "fontWeight": 700 if bold else 400, "color": barva},
            "encoding": {"x": {"field": "rok", "type": "quantitative"}, "y": {"field": "v", "type": "quantitative"},
                         "text": {"field": "text"}}}


def pas(od, do, barva, text, ytext):
    return [{"data": {"values": [{"od": od, "do": do}]},
             "mark": {"type": "rect", "color": barva, "opacity": 0.1},
             "encoding": {"x": {"field": "od", "type": "quantitative"}, "x2": {"field": "do"}}},
            {"data": {"values": [{"rok": (od + do) / 2, "v": ytext, "text": text}]},
             "mark": {"type": "text", "align": "center", "baseline": "top", "fontSize": 11, "fontWeight": 700, "color": barva},
             "encoding": {"x": {"field": "rok", "type": "quantitative"}, "y": {"field": "v", "type": "quantitative"},
                          "text": {"field": "text"}}}]


ZDROJ_0101 = f"ČSÚ, [Česko od roku 1989 v číslech]({PUB})"

# ---------- Graf 1: narození a sňatky ----------
nar = {y: v / 1000 for y, v in C["narozeni"].items()}
sn = {y: v / 1000 for y, v in C["snatky"].items()}
v1 = rada("Živě narozené děti", nar, 1, " tis.") + rada("Sňatky", sn, 1, " tis.")
yd, yv = (0, 150), (0, 40, 80, 120)
g1 = base(f"Dětí ubylo ve dvou vlnách: {{v 90. letech|{BLUE}}} a {{po roce 2021|{CRIMSON}}}",
          "Živě narozené děti a sňatky za rok v tisících, 1989–2025",
          ZDROJ_0101,
          pas(1990, 1999, BLUE, "1990–1999", 148) + pas(2021, 2025, CRIMSON, "2021–25", 148) + [
              cara("Živě narozené děti", INK, yd, yv),
              cara("Sňatky", INK, yd, yv, dash=[5, 3], width=2),
              popisek(2008, nar[2008], "narozené děti", dy=-8, align="center"),
              popisek(2004, sn[2004], "sňatky", baseline="top", dy=8, bold=False, align="center"),
              popisek(1999, nar[1999], f"{cz(nar[1999])} tis.", baseline="top", dy=8, align="center"),
              popisek(2025, nar[2025], f"{cz(nar[2025])} tis.", align="right", baseline="top", dy=8),
              popisek(2025, sn[2025], f"{cz(sn[2025])} tis.", align="right", baseline="top", dy=8, bold=False),
          ], values=v1)
log("G1 narození", C["narozeni"][1989], C["narozeni"][1999], C["narozeni"][2021], C["narozeni"][2025],
    "sňatky", C["snatky"][1989], C["snatky"][1990], C["snatky"][2025])

# ---------- Graf 2: děti mimo manželství ----------
M = C["mimo_pct"]
v2 = rada("Děti narozené mimo manželství", M, 1, " %")
yd, yv = (0, 60), (0, 20, 40, 50)
body = [(1989, "left", "top", 8, 0), (1999, "left", "top", 6, 6), (2010, "left", "top", 6, 6),
        (2017, "center", "bottom", -10, 0), (2025, "right", "top", 10, 0)]
g2 = base(f"Dětí mimo manželství přibývalo {{25 let|{CRIMSON}}}, od roku 2015 se drží pod polovinou",
          "Podíl živě narozených dětí, jejichž matka nebyla vdaná, v %, 1989–2025",
          ZDROJ_0101,
          [{"data": {"values": [{"v": 50}]}, "mark": {"type": "rule", "color": INK, "strokeDash": [3, 3], "opacity": 0.6},
            "encoding": {"y": {"field": "v", "type": "quantitative"}}},
           cara("Děti narozené mimo manželství", CRIMSON, yd, yv, " %")] +
          [popisek(y, M[y], f"{cz(M[y])} % ({y})", barva=CRIMSON if y == 2025 else INK, align=a, baseline=b, dy=d, dx=dx)
           for y, a, b, d, dx in body],
          values=v2)
log("G2 mimo manželství", {y: round(M[y], 1) for y, *_ in body})

# ---------- Graf 3: rodinný stav ----------
RS = [("svobodní", "stav_svobodni", CRIMSON), ("ženatí a vdané", "stav_zenati", INK),
      ("rozvedení", "stav_rozvedeni", BLUE), ("ovdovělí", "stav_ovdoveli", MUTED)]
v3 = []
for nazev, k, _ in RS:
    v3 += rada(nazev, C[k], 1, " %")
yd, yv = (0, 60), (0, 20, 40, 60)
pr = min(y for y in C["stav_svobodni"] if C["stav_svobodni"][y] > C["stav_zenati"][y])
lay3 = [{"data": {"values": [{"rok": pr}]}, "mark": {"type": "rule", "color": INK, "strokeDash": [3, 3], "opacity": 0.6},
         "encoding": {"x": {"field": "rok", "type": "quantitative"}}},
        popisek(pr, 58, str(pr), align="center", baseline="bottom", dy=0, size=11)]
for nazev, k, barva in RS:
    lay3.append(cara(nazev, barva, yd, yv, " %", width=2.5 if barva != MUTED else 2))
s, z, r, o = (C[k] for _, k, _ in RS)
lay3 += [
    popisek(1989, z[1989], f"ženatí a vdané {cz(z[1989])} %", dy=-8),
    popisek(1989, s[1989], f"svobodní {cz(s[1989])} %", barva=CRIMSON, baseline="top", dy=8),
    popisek(2025, s[2025], f"{cz(s[2025])} %", barva=CRIMSON, align="right", dy=-8),
    popisek(2025, z[2025], f"{cz(z[2025])} %", align="right", baseline="top", dy=8),
    popisek(2025, r[2025], f"rozvedení {cz(r[2025])} %", barva=BLUE, align="right", dy=-8),
    popisek(2025, o[2025], f"ovdovělí {cz(o[2025])} %", barva="#333333", align="right", baseline="top", dy=8, bold=False),
]
g3 = base(f"Svobodných je od roku {{{pr}|{CRIMSON}}} víc než ženatých a vdaných",
          "Podíl obyvatel podle rodinného stavu v % (všichni obyvatelé včetně dětí), 1989–2025",
          ZDROJ_0101, lay3, values=v3)
log("G3 rodinný stav, překřížení", pr, {n: (round(C[k][1989], 1), round(C[k][2025], 1)) for n, k, _ in RS})

# ---------- Graf 4: domácnosti jednotlivců ----------
DJ = C["dom_jednotlivcu_pct"]
v4 = [{"rok": str(y), "v": v, "l": f"{cz(v)} %",
       "skup": "1991" if y == 1991 else ("2021" if y == 2021 else "jiný")} for y, v in sorted(DJ.items())]
xb = {"field": "rok", "type": "ordinal", "axis": {"title": None, "domain": False, "ticks": False, "labelAngle": 0, "labelFontSize": 11}}
yb = {"field": "v", "type": "quantitative", "scale": {"domain": [0, 48]}, "axis": None}
g4 = base(f"Skoro {{dvě z pěti|{CRIMSON}}} domácností tvoří jeden člověk, v roce {{1991|{BLUE}}} to byla čtvrtina",
          "Podíl domácností jednotlivců mezi hospodařícími domácnostmi v %, sčítání lidu 1961–2021",
          f"ČSÚ, sčítání lidu ([Tab. 11.03]({PUB}))",
          [{"mark": {"type": "bar", "cornerRadiusEnd": 3, "width": {"band": 0.62}},
            "encoding": {"x": xb, "y": yb,
                         "color": {"field": "skup", "type": "nominal", "legend": None,
                                   "scale": {"domain": ["1991", "2021", "jiný"], "range": [BLUE, CRIMSON, GRID]}},
                         "tooltip": [{"field": "rok", "title": "Sčítání"}, {"field": "l", "title": "Domácnosti jednotlivců"}]}},
           {"mark": {"type": "text", "baseline": "bottom", "dy": -4, "fontSize": 12, "fontWeight": 700, "color": INK},
            "encoding": {"x": xb, "y": yb, "text": {"field": "l"}}}],
          height=210, values=v4)
log("G4 domácnosti jednotlivců", {y: round(v, 1) for y, v in DJ.items()})

DATA.mkdir(exist_ok=True)
for name, s in [("narozeni-a-snatky", g1), ("deti-mimo-manzelstvi", g2), ("rodinny-stav", g3), ("domacnosti-jednotlivcu", g4)]:
    (DATA / f"{name}.json").write_text(json.dumps(s, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

vystup = (HERE / "vystup.txt").read_text(encoding="utf-8").split("\n== GRAFY ==")[0].rstrip("\n")
(HERE / "vystup.txt").write_text(vystup + "\n\n== GRAFY ==\n" + "\n".join(out) + "\n", encoding="utf-8")
print("\n".join(out))
