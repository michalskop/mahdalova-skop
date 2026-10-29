"""Vyrobí Vega-Lite specifikace grafů do ../data/.

Čísla bere z krivky.py (World Bank) a z cisla.py (ručně ověřená čísla z primárních zdrojů s odkazem u každého).
Grafika podle docs/design/DESIGN.md §10: bez rámečku plochy a bez osových čar, hodnoty přímo u značek,
zdroj v patičce na jeden řádek. Spuštění: python -I grafy.py
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from krivky import PRIPADY, rady  # noqa: E402
import cisla as C  # noqa: E402

sys.stdout.reconfigure(encoding="utf-8")
OUT = Path(__file__).parent.parent / "data"
OUT.mkdir(exist_ok=True)

# barvy jen z palety (apps/web/app/providers/ThemeProvider.tsx)
ORANZOVA = "#f76800"   # brandOrange.6
HNEDA = "#994800"      # brandOrange.8
TEAL = "#06677d"       # brandTeal.7
TEAL_SV = "#1a9fbd"    # brandTeal.5
TEAL_TM = "#023440"    # brandTeal.9
INK = "#101432"        # brandNavy.9
MRIZKA = "#d4d4c8"
NBSP = " "
WB_ODKAZ = "[World Bank, Population total (UN WPP 2024)](https://data.worldbank.org/indicator/SP.POP.TOTL)"


def uloz(nazev, spec):
    # data, čísla s jednotkou a jednopísmenná slova nesmí zůstat na konci řádku
    for k in ("text", "subtitle"):
        t = re.sub(r"(\d{1,2})\. (\d{1,2})\. (\d{4})", lambda m: NBSP.join([m[1] + ".", m[2] + ".", m[3]]), spec["title"][k])
        t = re.sub(r"(?<=\d) (?=[^\s\d–-])", NBSP, t)
        spec["title"][k] = re.sub(r"(?<=\s)([vkszouaiVKSZOUAI]) ", lambda m: m[1] + NBSP, t)
    spec.setdefault("config", {})["view"] = {"stroke": None}
    (OUT / nazev).write_text(json.dumps(spec, ensure_ascii=False, indent=2), encoding="utf-8")
    print("zapsáno", nazev)


# 1) Křivky obyvatel kolem začátku genocidy (index, rok před začátkem = 100)
BARVY = {"Kambodža": HNEDA, "Rwanda": ORANZOVA, "Guatemala": TEAL_SV, "Irák": TEAL, "Myanmar": TEAL_TM}
data = rady()
for x in data:
    x["barva"] = BARVY[x["zeme"]]
    x["popis"] = f"{x['zeme']} {x['rok']}"
    x["obyv_t"] = f"{x['obyv'] / 1e6:.2f}".replace(".", ",") + f"{NBSP}mil."
konce = [x for x in data if x["t"] == max(d["t"] for d in data)]
for x in konce:
    x["stitek"] = x["zeme"]
# Guatemala a Irák (120,2 a 119,4), Myanmar a Rwanda (105,1 a 102,9) končí blízko sebe: popisky rozestoupit svisle
POSUN = {"Guatemala": -7, "Irák": 7, "Myanmar": -5, "Rwanda": 5}
for x in konce:
    x["dy"] = POSUN.get(x["zeme"], 0)
X = {"field": "t", "type": "quantitative", "scale": {"domain": [-5, 6], "nice": False},
     "axis": {"title": None, "values": [-5, 0, 5], "domain": False, "ticks": False, "grid": False, "labelFontSize": 12,
              "labelExpr": "datum.value == 0 ? 'začátek' : (datum.value < 0 ? '−5 let' : '+5 let')"}}
Y = {"field": "index", "type": "quantitative", "scale": {"domain": [70, 125], "nice": False},
     "axis": {"title": None, "values": [75, 100, 125], "domain": False, "ticks": False, "gridColor": MRIZKA, "labelFontSize": 12}}
s = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "width": "container",
    "height": 300,
    "padding": {"right": 76},
    "layer": [
        {"data": {"values": [{"t": 0}]}, "mark": {"type": "rule", "color": INK, "strokeDash": [3, 3], "opacity": 0.5},
         "encoding": {"x": {"field": "t", "type": "quantitative"}}},
        {"data": {"values": data},
         "mark": {"type": "line", "strokeWidth": 2.5},
         "encoding": {"x": X, "y": Y, "detail": {"field": "zeme"},
                      "color": {"field": "barva", "type": "nominal", "scale": None}}},
        {"data": {"values": data},
         "mark": {"type": "point", "filled": True, "size": 60, "opacity": 0},
         "encoding": {"x": X, "y": Y, "color": {"field": "barva", "type": "nominal", "scale": None},
                      "tooltip": [{"field": "popis", "title": "Země a rok"}, {"field": "skupina", "title": "Genocida"},
                                  {"field": "obyv_t", "title": "Obyvatel"}, {"field": "index", "title": "Index (rok před = 100)"}]}},
    ] + [
        # popisek na konci čáry; blízké konce (Guatemala, Irák) rozestoupené svisle o dy px
        {"data": {"values": [x]},
         "mark": {"type": "text", "align": "left", "dx": 6, "dy": x["dy"], "fontSize": 12.5, "fontWeight": 700, "color": x["barva"]},
         "encoding": {"x": X, "y": Y, "text": {"field": "stitek"}}}
        for x in konce
    ],
}
s["title"] = {
    "text": "Ve Rwandě a Kambodži počet obyvatel spadl, u Jezídů, Rohingů a Ixilů {rostl dál|#06677d}",
    "subtitle": "Celkový počet obyvatel země pět let před začátkem genocidy a šest let po něm (rok před začátkem = 100): "
                "Kambodža 1975, Rwanda 1994, Guatemala 1981 (Ixilové), Irák 2014 (Jezídové), Myanmar 2017 (Rohingové). "
                "Propad ve Rwandě zahrnuje kromě zavražděných i přes dva miliony uprchlíků.",
}
s["_source"] = WB_ODKAZ
uloz("krivky-obyvatel.json", s)


# 2) Gaza: předválečná projekce PCBS (to kreslí graf ze sítí) proti válečným odhadům PCBS
def mil(n):
    return f"{n / 1e6:.2f}".replace(".", ",") + f"{NBSP}mil."


proj = [{"rok": r + 0.5, "n": n, "t": mil(n), "rada": "Předválečná projekce"} for r, n in C.PROJEKCE.items()]
odh = [{"rok": 2023.5, "n": C.PROJEKCE[2023], "t": mil(C.PROJEKCE[2023]), "rada": "Odhad PCBS",
        "popis": "polovina 2023"}]
odh += [{"rok": r, "n": n, "t": mil(n), "rada": "Odhad PCBS", "popis": "konec 2025" if r == 2026.0 else f"polovina {int(r)}"}
        for r, n in C.ODHAD.items()]
for x in proj:
    x["popis"] = f"polovina {int(x['rok'])}"
X2 = {"field": "rok", "type": "quantitative", "scale": {"domain": [2022.3, 2026.7], "nice": False},
      "axis": {"title": None, "values": [2022.5, 2023.5, 2024.5, 2025.5, 2026.5], "domain": False, "ticks": False, "grid": False,
               "labelFontSize": 12, "labelExpr": "floor(datum.value)"}}
Y2 = {"field": "n", "type": "quantitative", "scale": {"domain": [0, 2_500_000], "nice": False},
      "axis": {"title": None, "values": [0, 1_000_000, 2_000_000], "domain": False, "ticks": False, "gridColor": MRIZKA,
               "labelFontSize": 12, "labelExpr": "datum.value == 0 ? '0' : format(datum.value / 1e6, '.0f') + ' mil.'"}}
TT2 = [{"field": "rada", "title": "Řada"}, {"field": "popis", "title": "Období"}, {"field": "t", "title": "Obyvatel Gazy"}]
s = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "width": "container",
    "height": 220,
    "padding": {"right": 10},
    "layer": [
        {"data": {"values": [{"rok": 2023.77}]},
         "mark": {"type": "rule", "color": INK, "strokeDash": [3, 3], "opacity": 0.5}, "encoding": {"x": X2}},
        {"data": {"values": [{"rok": 2023.8, "n": 400_000, "t": "7. 10. 2023"}]},
         "mark": {"type": "text", "align": "left", "dx": 4, "fontSize": 11.5, "color": INK, "opacity": 0.75},
         "encoding": {"x": X2, "y": Y2, "text": {"field": "t"}}},
        {"data": {"values": proj}, "mark": {"type": "line", "strokeWidth": 2.5, "strokeDash": [6, 4], "color": TEAL},
         "encoding": {"x": X2, "y": Y2}},
        {"data": {"values": proj}, "mark": {"type": "point", "filled": True, "size": 45, "color": TEAL},
         "encoding": {"x": X2, "y": Y2, "tooltip": TT2}},
        {"data": {"values": odh}, "mark": {"type": "line", "strokeWidth": 3, "color": ORANZOVA},
         "encoding": {"x": X2, "y": Y2}},
        {"data": {"values": odh}, "mark": {"type": "point", "filled": True, "size": 70, "color": ORANZOVA},
         "encoding": {"x": X2, "y": Y2, "tooltip": TT2}},
        {"data": {"values": [proj[-1]]},
         "mark": {"type": "text", "align": "right", "dy": -14, "fontSize": 12.5, "fontWeight": 700, "color": TEAL},
         "encoding": {"x": X2, "y": Y2, "text": {"value": "projekce " + mil(C.PROJEKCE[2026])}}},
        {"data": {"values": [odh[-1]]},
         "mark": {"type": "text", "align": "right", "dy": 20, "dx": 8, "fontSize": 12.5, "fontWeight": 700, "color": ORANZOVA},
         "encoding": {"x": X2, "y": Y2, "text": {"value": "odhad " + "2,13" + NBSP + "mil."}}},
    ],
}
s["title"] = {
    "text": "Graf ze sítí kreslí {předválečnou projekci|#06677d}. Podle palestinských statistiků v Gaze {lidí ubylo|#f76800}",
    "subtitle": "Obyvatelé Pásma Gazy: projekce PCBS z doby před válkou (polovina roku) a válečné odhady PCBS "
                "(polovina 2024 a 2025, konec 2025)",
}
s["_source"] = "[PCBS: projekce obyvatel a zprávy 2024–2025](https://www.pcbs.gov.ps/portals/_pcbs/PressRelease/Press_En_PalPeopleEnd2025E.pdf)"
uloz("gaza-projekce-odhad.json", s)


# 3) Jaký podíl cílové skupiny byl zavražděn: uznané genocidy a Gaza
KRATKE = {
    "Tutsiové ve Rwandě, 1994": "Tutsiové, Rwanda 1994",
    "Evropští Židé, 1933–1945": "Židé v Evropě, holokaust",
    "Čamové v Kambodži, 1975–1979": "Čamové, Kambodža 1975–79",
    "Bosňáci v enklávě Srebrenica, 1995": "Srebrenica 1995",
    "Jezídové v Sindžáru, 2014": "Jezídové, Irák 2014",
}
pod = []
for nazev, z, n, zdroj, stav in C.SKUPINY:
    p = C.pct(z, n)
    pod.append({"kat": KRATKE[nazev], "n": round(p, 1), "t": (f"{p:.0f}" if p >= 1 else f"{p:.1f}".replace(".", ",")) + f"{NBSP}%",
                "barva": TEAL, "tbarva": "#ffffff", "stav": stav,
                "detail": f"{z:,}".replace(",", NBSP) + " z " + f"{n:,}".replace(",", NBSP)})
gz = C.ZABITI["21. 10. 2026"]
pg = C.pct(gz, C.GAZA_PRED_VALKOU)
pod.append({"kat": "Gaza, od 7. 10. 2023", "n": round(pg, 1), "t": f"{pg:.1f}".replace(".", ",") + f"{NBSP}%",
            "barva": ORANZOVA, "tbarva": "#ffffff", "stav": "komise OSN: genocida; Mezinárodní soudní dvůr nerozhodl",
            "detail": f"{gz:,}".replace(",", NBSP) + " z " + f"{C.GAZA_PRED_VALKOU:,}".replace(",", NBSP)})
OSA_MAX = 100
for h in pod:
    h["minpx"] = len(h["t"]) * 7.2 + 18
VEJDE = f"datum.n / {OSA_MAX} * width > datum.minpx"
s = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "width": "container",
    "height": 230,
    "data": {"values": pod},
    "encoding": {
        "y": {"field": "kat", "type": "nominal", "sort": None, "scale": {"paddingInner": 0.3},
              "axis": {"title": None, "labelLimit": 190, "domain": False, "ticks": False, "labelFontSize": 12, "labelPadding": 8}},
        "x": {"field": "n", "type": "quantitative", "scale": {"domain": [0, OSA_MAX], "nice": False}, "axis": None},
    },
    "layer": [
        {"mark": {"type": "bar", "cornerRadiusEnd": 3},
         "encoding": {"color": {"field": "barva", "type": "nominal", "scale": None},
                      "tooltip": [{"field": "kat", "title": "Skupina"}, {"field": "detail", "title": "Zavraždění"},
                                  {"field": "t", "title": "Podíl"}, {"field": "stav", "title": "Kdo to posoudil"}]}},
        {"mark": {"type": "text", "align": "right", "dx": -9, "fontSize": 12.5, "fontWeight": 700},
         "encoding": {"text": {"value": {"expr": f"{VEJDE} ? datum.t : ''"}},
                      "color": {"field": "tbarva", "type": "nominal", "scale": None}}},
        {"mark": {"type": "text", "align": "left", "dx": 6, "fontSize": 12.5, "fontWeight": 700, "color": INK},
         "encoding": {"text": {"value": {"expr": f"{VEJDE} ? '' : datum.t"}}}},
    ],
}
s["title"] = {
    "text": "Za genocidu byly uznány činy, při nichž zahynulo {necelé procento|#06677d} skupiny, i takové, při nichž zahynuly {tři čtvrtiny|#06677d}",
    "subtitle": "Podíl zavražděných z cílové skupiny (odhady historiků a soudů). Gaza: zabití podle ministerstva "
                "zdravotnictví v Gaze do 21. 10. 2026 z předválečného počtu obyvatel.",
}
s["_source"] = "odhady HRW, USHMM, B. Kiernana, ICTY a PLOS Medicine; Gaza: OCHA a PCBS"
uloz("podil-zavrazdenych.json", s)
