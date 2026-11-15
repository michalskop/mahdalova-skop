"""Grafy kapitoly „Duševní zdraví“ (Vega-Lite → ../data/*.json).

Čísla bere jen z cisla.json, které z primárních souborů počítá cisla.py.
Spuštění:  python cisla.py && python grafy.py   (grafy.py připíše své hodnoty na konec vystup.txt)
"""
import json
import sys

sys.stdout.reconfigure(encoding="utf-8")
from pathlib import Path

HERE = Path(__file__).resolve().parent
DATA = HERE.parent / "data"
CRIMSON, BLUE, INK, GRID, MUTED = "#de1743", "#6267a3", "#101432", "#d4d4c8", "#bcbcb0"
NBSP = " "

C = json.loads((HERE / "cisla.json").read_text(encoding="utf-8"))
ser = lambda k: {int(y): v for y, v in C[k].items()}
out = []


def log(*a):
    out.append(" ".join(str(x) for x in a))


def cz(x, d=1):
    return f"{x:,.{d}f}".replace(",", NBSP).replace(".", ",")


def spec(title, subtitle, source, layers, values, height=None, step=None):
    s = {"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
         "title": {"text": title, "subtitle": subtitle},
         "width": "container",
         "config": {"view": {"stroke": None}},
         "data": {"values": values}, "layer": layers, "_source": source}
    s["height"] = {"step": step} if step else height
    return s


def pruhy_s_popiskem_nad(values, xfield, domain, xvalues, xlabel_expr, barva_field, barvy, popisek_field, hodnota_field, tt, step=50):
    """Vodorovné pruhy, název kategorie nad pruhem (mobil 390 px), hodnota za koncem pruhu."""
    y = {"field": "kat", "type": "nominal", "sort": None, "axis": None, "scale": {"paddingInner": 0.5, "paddingOuter": 0.45}}
    x = {"field": xfield, "type": "quantitative", "scale": {"domain": domain},
         "axis": {"title": None, "grid": True, "gridColor": GRID, "domain": False, "ticks": False, "values": xvalues,
                  "labelExpr": xlabel_expr, "labelFontSize": 10.5}}
    return [
        {"mark": {"type": "bar", "cornerRadiusEnd": 3, "height": {"band": 0.55}},
         "encoding": {"y": y, "x": x, "x2": {"datum": 0} if domain[0] < 0 else {"datum": 0},
                      "color": {"field": barva_field, "type": "nominal", "legend": None, "scale": {"domain": barvy[0], "range": barvy[1]}},
                      "tooltip": tt}},
        {"transform": [{"filter": f"datum.{xfield} >= 0"}],
         "mark": {"type": "text", "align": "left", "dx": 5, "fontSize": 12, "fontWeight": 700, "color": INK},
         "encoding": {"y": y, "x": {"field": xfield, "type": "quantitative"}, "text": {"field": hodnota_field}, "tooltip": tt}},
        {"transform": [{"filter": f"datum.{xfield} < 0"}],
         "mark": {"type": "text", "align": "right", "dx": -5, "fontSize": 12, "fontWeight": 700, "color": INK},
         "encoding": {"y": y, "x": {"field": xfield, "type": "quantitative"}, "text": {"field": hodnota_field}, "tooltip": tt}},
        {"mark": {"type": "text", "align": "left", "baseline": "bottom", "dy": -9, "fontSize": 12, "color": "#333333"},
         "encoding": {"y": y, "x": {"datum": domain[0], "type": "quantitative", "scale": {"domain": domain}}, "text": {"field": popisek_field}}},
    ]


# ---------- Graf 1: diagnózy 2010 × 2025 ----------
y0, y1 = C["roky_dg"]
v1 = []
for d in C["diagnozy"]:
    roste = d["pomer"] >= 1.1
    v1.append(dict(kat=d["diagnoza"], pomer=d["pomer"], skup="roste" if roste else "stejně nebo méně",
                   popisek=f"{d['diagnoza']} ({d['kod']})", hodnota=f"{cz(d['pomer'], 1)}×",
                   t0=f"{cz(d['n0'], 0)} pacientů ({cz(d['r0'], 0)} na 100{NBSP}000)",
                   t1=f"{cz(d['n1'], 0)} pacientů ({cz(d['r1'], 0)} na 100{NBSP}000)"))
    log("graf diagnozy", d["diagnoza"], d["pomer"], d["n0"], d["n1"])
tt1 = [{"field": "kat", "title": "Diagnóza"}, {"field": "t0", "title": str(y0)}, {"field": "t1", "title": str(y1)},
       {"field": "hodnota", "title": "Na 100 000 obyvatel"}]
lay1 = pruhy_s_popiskem_nad(v1, "pomer", [0, 6.6], [0, 1, 2, 3, 4, 5, 6], "datum.value + '×'", "skup",
                            (["roste", "stejně nebo méně"], [CRIMSON, MUTED]), "popisek", "hodnota", tt1)
lay1.insert(0, {"mark": {"type": "rule", "color": INK, "strokeDash": [3, 3], "opacity": 0.5}, "data": {"values": [{"x": 1}]},
             "encoding": {"x": {"field": "x", "type": "quantitative"}}})
g1 = spec(f"Pacientů s {{autismem|{CRIMSON}}} je u psychiatrů pětkrát víc než v roce 2010, se {{schizofrenií|{BLUE}}} stejně",
          f"Kolikrát víc pacientů na 100{NBSP}000 obyvatel léčily psychiatrické ambulance v roce {y1} než v roce {y0} (1× = stejně); "
          f"kódy diagnóz podle MKN-10",
          f"ÚZIS, [NRHZS, ambulantní psychiatrie](https://www.nzip.cz/data/2058-ambulantni-pece-psychiatrie-otevrena-data)",
          lay1, v1, step=50)

# ---------- Graf 2: antidepresiva 1989–2024 ----------
ad = ser("antidepresiva")
v2 = [{"rok": y, "v": v, "t": f"{cz(v, 1)} DDD"} for y, v in sorted(ad.items()) if y >= 1989]
a0, a1 = ad[1989], ad[max(ad)]
log("graf antidepresiva", 1989, a0, max(ad), a1, "násobek", round(a1 / a0, 1))
x2 = {"field": "rok", "type": "quantitative", "scale": {"domain": [1989, 2024]},
      "axis": {"title": None, "format": "d", "grid": False, "domain": False, "ticks": False, "values": [1989, 2000, 2010, 2024], "labelFontSize": 11}}
y2 = {"field": "v", "type": "quantitative", "scale": {"domain": [0, 95]},
      "axis": {"title": None, "grid": True, "gridColor": GRID, "domain": False, "ticks": False, "values": [0, 20, 40, 60, 80]}}
g2 = spec(f"Česko spotřebuje {{25krát víc|{CRIMSON}}} antidepresiv než v roce {{1989|{BLUE}}}",
          f"Spotřeba antidepresiv v definovaných denních dávkách (DDD) na 1{NBSP}000 obyvatel a den, 1989–{max(ad)}",
          "OECD, [Health Statistics, ATC N06A](https://sdmx.oecd.org/public/rest/data/OECD.ELS.HD,HEALTH_PHMC@DF_PHMC_CONSUM,/CZE....)",
          [
              {"mark": {"type": "area", "color": CRIMSON, "opacity": 0.13, "line": {"color": CRIMSON, "strokeWidth": 2.5}, "interpolate": "monotone"},
               "encoding": {"x": x2, "y": y2, "tooltip": [{"field": "rok", "title": "Rok"}, {"field": "t", "title": "Na 1 000 obyvatel a den"}]}},
              {"transform": [{"filter": "datum.rok == 1989 || datum.rok == 2024"}],
               "mark": {"type": "circle", "size": 70, "opacity": 1},
               "encoding": {"x": x2, "y": y2, "color": {"condition": {"test": "datum.rok == 1989", "value": BLUE}, "value": CRIMSON}}},
              {"transform": [{"filter": "datum.rok == 1989"}],
               "mark": {"type": "text", "align": "left", "baseline": "bottom", "dx": 4, "dy": -8, "fontSize": 12, "fontWeight": 700, "color": BLUE},
               "encoding": {"x": x2, "y": y2, "text": {"field": "t"}}},
              {"transform": [{"filter": "datum.rok == 2024"}],
               "mark": {"type": "text", "align": "right", "baseline": "bottom", "dx": -2, "dy": -10, "fontSize": 12, "fontWeight": 700, "color": CRIMSON},
               "encoding": {"x": x2, "y": y2, "text": {"field": "t"}}},
          ], v2, height=260)

# ---------- Graf 3: sebevraždy 1989–2024 ----------
sdr = ser("sdr")
v3 = [{"rok": y, "v": v, "t": f"{cz(v, 1)} na 100{NBSP}000"} for y, v in sorted(sdr.items()) if y >= 1989]
mn = min((v, y) for y, v in sdr.items() if y >= 1989)
log("graf sebevrazdy SDR", 1989, sdr[1989], "min", mn, max(sdr), sdr[max(sdr)], "pokles %", round(100 * (1 - sdr[max(sdr)] / sdr[1989]), 1))
x3 = {**x2, "scale": {"domain": [1989, 2024]}, "axis": {**x2["axis"], "values": [1989, 2000, 2010, 2024]}}
y3 = {"field": "v", "type": "quantitative", "scale": {"domain": [0, 22]},
      "axis": {"title": None, "grid": True, "gridColor": GRID, "domain": False, "ticks": False, "values": [0, 5, 10, 15, 20]}}
body = [1989, mn[1], max(sdr)]
g3 = spec(f"Sebevražd je o {{třetinu méně|{CRIMSON}}} než v roce {{1989|{BLUE}}}, v roce 2024 ale přibyly",
          f"Sebevraždy na 100{NBSP}000 obyvatel, věkově standardizováno (evropský standard WHO), 1989–{max(sdr)}",
          "WHO Europe, [Health for All, HFA_176](https://dw.euro.who.int/api/v5/export/HFA_176?lang=EN&format=csv)",
          [
              {"mark": {"type": "line", "color": CRIMSON, "strokeWidth": 2.5, "interpolate": "monotone"},
               "encoding": {"x": x3, "y": y3, "tooltip": [{"field": "rok", "title": "Rok"}, {"field": "t", "title": "Sebevraždy"}]}},
              {"transform": [{"filter": {"field": "rok", "oneOf": body}}],
               "mark": {"type": "circle", "size": 70, "opacity": 1},
               "encoding": {"x": x3, "y": y3, "color": {"condition": {"test": "datum.rok == 1989", "value": BLUE}, "value": CRIMSON}}},
              {"transform": [{"filter": "datum.rok == 1989"}],
               "mark": {"type": "text", "align": "left", "baseline": "bottom", "dx": 4, "dy": -8, "fontSize": 12, "fontWeight": 700, "color": BLUE},
               "encoding": {"x": x3, "y": y3, "text": {"field": "v", "format": ".1f"}}},
              {"transform": [{"filter": f"datum.rok == {mn[1]}"}],
               "mark": {"type": "text", "align": "center", "baseline": "top", "dy": 9, "fontSize": 12, "fontWeight": 700, "color": CRIMSON},
               "encoding": {"x": x3, "y": y3, "text": {"field": "v", "format": ".1f"}}},
              {"transform": [{"filter": f"datum.rok == {max(sdr)}"}],
               "mark": {"type": "text", "align": "right", "baseline": "bottom", "dx": -2, "dy": -10, "fontSize": 12, "fontWeight": 700, "color": CRIMSON},
               "encoding": {"x": x3, "y": y3, "text": {"field": "v", "format": ".1f"}}},
          ], v3, height=240)

# ---------- Graf 4: péče na 100 000 obyvatel ----------
v4 = []
for p in sorted(C["pece"], key=lambda p: -p["zmena"]):
    z = p["zmena"]
    v4.append(dict(kat=p["nazev"], zmena=z, skup="přibylo" if z >= 0 else "ubylo",
                   popisek=f"{p['nazev']}: {cz(p['v0'], 1)} → {cz(p['v1'], 1)} ({p['r0']}–{p['r1']})",
                   hodnota=("+" if z >= 0 else "−") + f"{cz(abs(z), 0)}{NBSP}%",
                   t0=f"{cz(p['v0'], 1)} ({p['r0']})", t1=f"{cz(p['v1'], 1)} ({p['r1']})"))
    log("graf pece", p)
tt4 = [{"field": "kat", "title": "Ukazatel"}, {"field": "t0", "title": "Tehdy na 100 000"}, {"field": "t1", "title": "Dnes na 100 000"},
       {"field": "hodnota", "title": "Změna"}]
g4 = spec(f"Psychiatrů {{přibylo|{CRIMSON}}}, psychiatrických lůžek {{ubylo|{BLUE}}} o víc než třetinu",
          f"Změna počtu na 100{NBSP}000 obyvatel v %; lékaři a zubaři fyzické osoby v praxi, hospitalizace 1989 a 2022 podle jiné metodiky",
          "OECD, ČSÚ, [ročenky ÚZIS](https://www.uzis.cz/index.php?pg=vystupy--statistika-vybranych-oboru-lekarske-pece--psychiatrie)",
          pruhy_s_popiskem_nad(v4, "zmena", [-60, 95], [-40, -20, 0, 20, 40, 60, 80], "datum.value + ' %'", "skup",
                               (["přibylo", "ubylo"], [CRIMSON, BLUE]), "popisek", "hodnota", tt4), v4, step=54)

DATA.mkdir(exist_ok=True)
for name, s in [("diagnozy", g1), ("antidepresiva", g2), ("sebevrazdy", g3), ("pece", g4)]:
    (DATA / f"{name}.json").write_text(json.dumps(s, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
vy = HERE / "vystup.txt"
base = vy.read_text(encoding="utf-8").split("== GRAFY")[0].rstrip("\n")
vy.write_text(base + "\n== GRAFY (grafy.py)\n" + "\n".join(out) + "\n", encoding="utf-8")
print("\n".join(out))
