"""Interaktivní činkové grafy (2022 → 2026) pro článek „Velká města se přelila ke Starostům“.

Nahrazují statické SVG z matplotlibu (sila-stran-kv/grafy_30.py). Vega-Lite spec pro <VegaChart>:
web je vysází do ChartCard (titulek s barevným štítkem strany, podpis DataTimes, autoři a zdroj pod grafem),
hub v náhledu Articles je kreslí živě stejnou knihovnou.

Vstup: koalice30_detail.csv ze sila-stran-kv/koalice_30.py (podíl hlasů, koalice rozděleny podle zvolených).
Spuštění: python _data_pipeline/grafy_vega.py [cesta/ke/koalice30_detail.csv]
Výstup: data/graf-<strana>.json
"""
import csv
import json
import math
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "data"
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / (
    "Desktop/Mahdalova & Skop/Volby/Volby - predikce/Predikce - komunální a senát 2026/"
    "sila-stran-kv/vystupy/koalice30_detail.csv")

INK, MUTED, GRID, BG = "#101432", "#666666", "#d9d6cb", "#f8f6f0"

# stranické barvy jako v ostatních volebních grafech webu (components/politics/PartyFace.tsx a spol.)
STRANY = [
    # klíč v CSV, soubor, barva, titulek (před, štítek, za)
    ("ANO", "ano", "#272a59", ("Změna podpory hnutí ", "ANO", " ve 30 největších městech")),
    ("STAN", "stan", "#ff1a4a", ("Změna podpory ", "STAN", " ve 30 největších městech")),
    ("ODS", "ods", "#5e66d5", ("Změna podpory ", "ODS", " ve 30 největších městech")),
    ("SPOLU (ODS+KDU+TOP)", "spolu", "#5e66d5",
     ("Změna podpory stran ", "Spolu", " (ODS, KDU-ČSL, TOP 09) ve 30 největších městech")),
    ("KDU-ČSL", "kdu-csl", "#ffcf02", ("Změna podpory ", "KDU-ČSL", " ve 30 největších městech")),
    ("TOP 09", "top09", "#812840", ("Změna podpory ", "TOP 09", " ve 30 největších městech")),
    ("Piráti", "pirati", "#111111", ("Změna podpory ", "Pirátů", " ve 30 největších městech")),
    ("Zelení", "zeleni", "#639e0a", ("Změna podpory ", "Zelených", " ve 30 největších městech")),
    ("SPD", "spd", "#a47d03", ("Změna podpory ", "SPD", " ve 30 největších městech")),
    ("Motoristé", "motoriste", "#1a9fbd", ("Změna podpory ", "Motoristů", " ve 30 největších městech")),
    ("Naše Česko", "nase-cesko", "#009cff", ("Podpora ", "Našeho Česka", " ve 30 největších městech v roce 2026")),
]

SOURCE = ("ČSÚ, volby.cz – registry kandidátů a výsledky komunálních voleb 2022 a 2026; "
          "hlasy koalic rozděleny podle toho, koho ze zvolených navrhla která strana")


def num(v):
    return None if v in ("", None) else float(v)


def cz(v, sign=False):
    s = f"{v:+.1f}" if sign else f"{v:.1f}"
    return s.replace(".", ",").replace("-", "−")


def rows_for(all_rows, strana):
    out = []
    for r in all_rows:
        if r["strana"] != strana:
            continue
        k22, k26 = bool(r["kandidatky_22"]), bool(r["kandidatky_26"])
        if not (k22 or k26):
            continue
        out.append({**r, "k22": k22, "k26": k26})
    oba = sorted([r for r in out if r["k22"] and r["k26"]], key=lambda r: float(r["zmena_pct_mand"]))
    jen = sorted([r for r in out if not (r["k22"] and r["k26"])],
                 key=lambda r: -(num(r["pct_mand_26"]) or num(r["pct_mand_22"]) or 0))
    return oba, jen


def jak(r, rok):
    sam, koal = num(r[f"pct_samostatne_{rok}"]) or 0, num(r[f"pct_z_koalic_{rok}"]) or 0
    if not r[f"k{rok}"]:
        return "nekandidovala"
    if sam > 0 and koal > 0:
        return "samostatně i v koalici"
    return "v koalici" if koal > 0 else "samostatně"


def values(oba, jen, spolu):
    vals = []
    for i, r in enumerate(oba + jen):
        both = r["k22"] and r["k26"]
        v22 = num(r["pct_mand_22"]) if r["k22"] else None
        v26 = num(r["pct_mand_26"]) if r["k26"] else None
        z = num(r["zmena_pct_mand"]) if both else None
        obec = "Praha" if r["obec"] == "Praha hl.m." else r["obec"]
        pts = [v for v in (v22, v26) if v is not None]
        lo, hi = min(pts), max(pts)
        if both:
            zmena = cz(z, sign=True) if round(z, 1) != 0 else "0,0"
        else:
            zmena = "jen 2026" if r["k26"] else "jen 2022"
        d = {
            "obec": obec, "poradi": i, "zmena": zmena,
            "v22": v22, "v26": v26, "lo": lo, "hi": hi,
            "lo_txt": cz(lo), "hi_txt": cz(hi),
            "lo_je_22": v22 is not None and lo == v22 and (v26 is None or v22 < v26),
            "hi_je_22": v22 is not None and hi == v22 and (v26 is None or v22 >= v26),
            "smer": "oba" if both else ("jen26" if r["k26"] else "jen22"),
            # texty tooltipu (česká desetinná čárka)
            "t_22": f"{cz(v22)} %" if v22 is not None else "nekandidovala",
            "t_26": f"{cz(v26)} %" if v26 is not None else "nekandidovala",
            "t_z": f"{zmena} p. b." if both else "–",
            "t_m": f"{int(float(r['mand_22']))} → {int(float(r['mand_26']))}",
        }
        if not spolu:
            d["t_jak"] = jak(r, "26") if r["k26"] else "nekandidovala"
        vals.append(d)
    return vals


def spec(strana, barva, nazev, oba, jen):
    novacek = len(oba) <= 1
    spolu = strana.startswith("SPOLU")
    data = values(oba, jen, spolu)
    allv = [v for d in data for v in (d["v22"], d["v26"]) if v is not None]
    lo = max(0, math.floor(min(allv) / 5) * 5)
    hi = (math.floor(max(allv) / 5) + 1) * 5
    if hi - lo < 15:
        hi = lo + 15
    step = 5 if hi - lo <= 40 else 10
    ticks = list(range(int(lo), int(hi) + 1, step))
    pre, stitek, post = nazev
    if novacek and pre.startswith("Změna podpory"):
        pre, post = pre.replace("Změna podpory", "Podpora"), post + " v roce 2026"
    title = f"{pre}{{{stitek}|{barva}}}{post}"
    if novacek:
        subtitle = ("Komunální volby 2026, podíl hlasů v % jen ve městech, kde strana kandidovala. "
                    "Koalice rozděleny podle zvolených. V roce 2022 strana (téměř) nekandidovala.")
    else:
        subtitle = ("Komunální volby 2022 a 2026, podíl hlasů v %: ○ 2022, ● 2026. Koalice rozděleny podle zvolených. "
                    "Seřazeno podle změny, vpravo v procentních bodech.")
    if jen and not novacek:
        subtitle += "\n„jen 2026/2022“ = ve městě strana v druhém roce nekandidovala."

    y = {"field": "obec", "type": "nominal", "sort": {"field": "poradi"},
         "scale": {"paddingInner": 0, "paddingOuter": 0.15},
         "axis": {"title": None, "domain": False, "ticks": False, "labelPadding": 8,
                  "labelFontSize": {"expr": "width < 360 ? 11.5 : 13"}, "labelColor": INK,
                  "labelLimit": {"expr": "width < 360 ? 95 : 130"}}}
    # vpravo zůstane pás na sloupec se změnou v p. b.
    right = 0 if novacek else 58
    # vlevo rezerva na popisek hodnoty u bodu blízko nuly (jinak by se kryl s názvem města)
    x_scale = {"domain": [round(lo - (hi - lo) * 0.1, 2), hi], "nice": False, "zero": False, "clamp": True,
               "range": [0, {"expr": f"width - {right}"}]}
    x_axis = {"orient": "top", "title": None, "values": ticks, "grid": True, "gridColor": GRID, "domain": False,
              "ticks": False, "labelPadding": 4, "labelFontSize": 11, "labelColor": MUTED, "labelOverlap": True,
              "labelExpr": f"width < 300 && datum.value % {2 * step} != 0 ? '' : datum.value + ' %'"}
    # stejná osa ve všech vrstvách (axis: null v jedné vrstvě by sdílenou osu X schoval)
    x = lambda f: {"field": f, "type": "quantitative", "scale": x_scale, "axis": x_axis}
    tooltip = [{"field": "obec", "title": "Město"},
               {"field": "t_22", "title": "Podíl hlasů 2022"}, {"field": "t_26", "title": "Podíl hlasů 2026"}]
    if not novacek:
        tooltip.append({"field": "t_z", "title": "Změna"})
    tooltip.append({"field": "t_m", "title": "Zastupitelé 2022 → 2026"})
    if not spolu:
        tooltip.append({"field": "t_jak", "title": "Kandidovala v roce 2026"})
    labels_on = "width >= 380"

    layers = [
        # neviditelný pás přes celý řádek: najetí myší kamkoli na řádek ukáže detail a řádek podbarví
        {"params": [{"name": "radek", "select": {"type": "point", "fields": ["obec"], "on": "pointerover",
                                                  "clear": "pointerout"}}],
         "mark": {"type": "bar", "fill": barva, "cornerRadius": 2, "height": {"band": 1}},
         "encoding": {"y": y, "x": {"value": 0}, "x2": {"value": "width"},
                      "fillOpacity": {"condition": {"param": "radek", "empty": False, "value": 0.1}, "value": 0},
                      "tooltip": tooltip}},
        {"mark": {"type": "rule", "strokeWidth": 3.5, "strokeCap": "butt", "color": barva, "opacity": 0.4},
         "encoding": {"y": y, "x": x("v22"), "x2": {"field": "v26"}, "tooltip": tooltip}},
        {"mark": {"type": "point", "filled": True, "fill": BG, "stroke": barva, "strokeWidth": 2.2, "size": 80,
                  "opacity": 1},
         "encoding": {"y": y, "x": x("v22"), "tooltip": tooltip}},
        {"mark": {"type": "point", "filled": True, "fill": barva, "size": 100, "opacity": 1,
                  "stroke": BG, "strokeWidth": 0.8},
         "encoding": {"y": y, "x": x("v26"), "tooltip": tooltip}},
        # hodnoty u bodů: menší vlevo, větší vpravo (2022 šedě, 2026 tmavě); na úzkém displeji jen v tooltipu
        {"mark": {"type": "text", "align": "right", "dx": -9, "fontSize": 11.5,
                  "opacity": {"expr": f"{labels_on} ? 1 : 0"}},
         "transform": [{"filter": "datum.smer == 'oba'"}],
         "encoding": {"y": y, "x": x("lo"), "text": {"field": "lo_txt"},
                      "color": {"condition": {"test": "datum.lo_je_22", "value": MUTED}, "value": INK}}},
        {"mark": {"type": "text", "align": "left", "dx": 9, "fontSize": 11.5,
                  "opacity": {"expr": f"{labels_on} ? 1 : 0"}},
         "encoding": {"y": y, "x": x("hi"), "text": {"field": "hi_txt"},
                      "color": {"condition": {"test": "datum.hi_je_22", "value": MUTED}, "value": INK}}},
    ]
    if not novacek:
        layers.append({
            "mark": {"type": "text", "align": "right", "fontSize": {"expr": "width < 360 ? 11.5 : 13"}},
            "encoding": {"y": y, "x": {"value": "width"}, "text": {"field": "zmena"},
                         "fontWeight": {"condition": {"test": "datum.smer == 'oba'", "value": 700}, "value": 400},
                         "color": {"condition": {"test": "datum.smer == 'oba'", "value": INK}, "value": MUTED}}})
        layers.append({
            "data": {"values": [{"t": "změna"}]},
            "mark": {"type": "text", "align": "right", "baseline": "bottom", "fontSize": 11, "color": MUTED},
            "encoding": {"x": {"value": "width"}, "y": {"value": -4}, "text": {"field": "t"}}})

    return {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "title": {"text": title, "subtitle": subtitle},
        "_source": SOURCE,
        "width": 600,
        "height": {"step": 27},
        "data": {"values": data},
        "config": {"view": {"stroke": None}},
        "layer": layers,
    }


def main():
    with open(SRC, encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    OUT.mkdir(exist_ok=True)
    for strana, soubor, barva, nazev in STRANY:
        oba, jen = rows_for(rows, strana)
        sp = spec(strana, barva, nazev, oba, jen)
        p = OUT / f"graf-{soubor}.json"
        p.write_text(json.dumps(sp, ensure_ascii=False, indent=1), encoding="utf-8")
        print(p.name, len(oba), len(jen))


if __name__ == "__main__":
    main()
