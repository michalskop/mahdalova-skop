"""Vyrobí Vega-Lite specifikace grafů do ../data/ z čísel zprávy komise OSN A/81/430.

Každé číslo je ověřené proti textu zprávy skriptem overit_cisla.py (odstavce uvedené u dat).
Grafika podle docs/design/DESIGN.md §10: bez rámečku plochy a bez osových čar, hodnoty přímo u pruhů
(uvnitř, když se vejdou, jinak vpravo za pruhem), zdroj v patičce na jeden řádek.
Spuštění: python -I grafy.py
"""
import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
OUT = Path(__file__).parent.parent / "data"
OUT.mkdir(exist_ok=True)

# barvy jen z palety (apps/web/app/providers/ThemeProvider.tsx)
KARMIN = "#de1743"     # brand.6
TMAVA = "#8b0e2b"      # brand.9
SVETLA = "#ff8099"     # brand.2
RUZOVA = "#e87c91"     # brandDeepRed.3
SEDA = "#bcbcb0"       # background.9
INK = "#101432"        # brandNavy.9
ZPRAVA = "[Zpráva komise OSN A/81/430](https://www.ohchr.org/sites/default/files/documents/hrbodies/hrcouncil/coiopt/ga-81-430-auv.pdf)"
NBSP = " "


def cz(n):
    return f"{n:,}".replace(",", NBSP)


def uloz(nazev, spec):
    # data a jednopísmenná slova nesmí zůstat na konci řádku
    for k in ("text", "subtitle"):
        t = re.sub(r"(\d{1,2})\. (\d{1,2})\. (\d{4})", lambda m: NBSP.join([m[1] + ".", m[2] + ".", m[3]]), spec["title"][k])
        t = re.sub(r"(?<=\d) (?=[^\s\d–-])", NBSP, t)  # číslo a jednotka/slovo za ním na jednom řádku (16 let, 60 %)
        spec["title"][k] = re.sub(r"(?<=\s)([vkszouaiVKSZOUAI]) ", lambda m: m[1] + NBSP, t)
    spec.setdefault("config", {})["view"] = {"stroke": None}
    (OUT / nazev).write_text(json.dumps(spec, ensure_ascii=False, indent=2), encoding="utf-8")
    print("zapsáno", nazev)


OSA_Y = {"title": None, "labelLimit": 240, "domain": False, "ticks": False, "labelFontSize": 12, "labelPadding": 8}


def pruhy(hodnoty, osa_max, vyska, tooltip_titul):
    """Vodorovné pruhy, jedna řada; hodnota uvnitř pruhu, když se na dané šířce vejde, jinak vpravo za ním.
    Barva popisku uvnitř: bílá na sytém pruhu, ink na světlém (pole tbarva)."""
    for h in hodnoty:
        h["minpx"] = len(h["t"]) * 7.2 + 18
    vejde = f"datum.n / {osa_max} * width > datum.minpx"
    return {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "width": "container",
        "height": vyska,
        "data": {"values": hodnoty},
        "encoding": {
            "y": {"field": "kat", "type": "nominal", "sort": None, "scale": {"paddingInner": 0.3}, "axis": OSA_Y},
            "x": {"field": "n", "type": "quantitative", "scale": {"domain": [0, osa_max], "nice": False}, "axis": None},
        },
        "layer": [
            {"mark": {"type": "bar", "cornerRadiusEnd": 3},
             "encoding": {"color": {"field": "barva", "type": "nominal", "scale": None},
                          "tooltip": [{"field": "kat", "title": tooltip_titul}, {"field": "t", "title": "Hodnota"}]}},
            {"mark": {"type": "text", "align": "right", "dx": -9, "fontSize": 12.5, "fontWeight": 700},
             "encoding": {"text": {"value": {"expr": f"{vejde} ? datum.t : ''"}},
                          "color": {"field": "tbarva", "type": "nominal", "scale": None}}},
            {"mark": {"type": "text", "align": "left", "dx": 6, "fontSize": 12.5, "fontWeight": 700, "color": INK},
             "encoding": {"text": {"value": {"expr": f"{vejde} ? '' : datum.t"}}}},
        ],
    }


# 1) Nálety na Západním břehu (odst. 27)
nalety = [
    {"kat": "Předchozích 16 let", "n": 6, "t": "6", "barva": SEDA, "tbarva": INK},
    {"kat": "Od 7. 10. 2023", "n": 254, "t": "254", "barva": KARMIN, "tbarva": "#ffffff"},
]
s = pruhy(nalety, 300, 110, "Období")
s["title"] = {
    "text": "Při náletech na Západním břehu zemřelo za necelé tři roky {254|#de1743} Palestinců, za předchozích téměř 16 let šest",
    "subtitle": "Palestinci zabití izraelskými leteckými údery na Západním břehu (počet lidí, data OCHA): 2008 – 6. 10. 2023 a 7. 10. 2023 – 30. 9. 2026",
}
s["_source"] = f"{ZPRAVA}, odst. 27"
uloz("nalety-zapadni-breh.json", s)

# 2) Kdo byli zabití izraelskými silami na Západním břehu (odst. 17): skládané pruhy, tři řádky
CELKEM, MUZI, CHLAPCI, ZENY, DIVKY = 1080, 784, 237, 22, 7
NEURCENO = CELKEM - (MUZI + CHLAPCI + ZENY + DIVKY)
deti = CHLAPCI + DIVKY
print(f"děti {deti} z {CELKEM} = {deti / CELKEM * 100:.1f} %, bez určení {NEURCENO}")
OSA_MAX = 1000
UVNITR = 90  # segment užší než tohle (v jednotkách osy) dostane popisek vpravo za řádkem
RADKY = [
    ("Dospělí", [("muži", MUZI, TMAVA), ("ženy", ZENY, RUZOVA)]),
    ("Děti", [("chlapci", CHLAPCI, KARMIN), ("dívky", DIVKY, SVETLA)]),
    ("Bez určení", [("bez určení pohlaví a věku", NEURCENO, SEDA)]),
]
segmenty, uvnitr, venku = [], [], []
sirka_textu = lambda t: len(t) * 7.2 + 18  # odhad šířky popisku v px (Roboto Condensed 12,5 bold)
for radek, casti in RADKY:
    x = 0
    souhrn = " · ".join(f"{nazev} {cz(n)}" for nazev, n, _ in casti)
    velka = casti[0] if casti[0][1] >= UVNITR else None  # největší část řádku, která se může vejít dovnitř
    for nazev, n, barva in casti:
        segmenty.append({"radek": radek, "x0": x, "x1": x + n, "barva": barva, "skupina": nazev, "pocet": cz(n), "souhrn": souhrn})
        x += n
    male = [f"{nazev} {cz(n)}" for nazev, n, _ in casti if not velka or nazev != velka[0]]
    if velka:
        t_in = f"{velka[0]} {cz(velka[1])}"
        uvnitr.append({"radek": radek, "x": 0, "text": t_in, "n": velka[1], "minpx": sirka_textu(t_in)})
        venku.append({"radek": radek, "x": x, "n": velka[1], "minpx": sirka_textu(t_in),
                      "tfit": " · ".join(male), "tnofit": " · ".join([t_in] + male)})
    else:
        venku.append({"radek": radek, "x": x, "n": 0, "minpx": 1e9, "tfit": " · ".join(male), "tnofit": " · ".join(male)})

# popisek uvnitř, jen když se do pruhu na dané šířce grafu vejde (width = šířka plochy v px), jinak vpravo za řádkem
VEJDE = f"datum.n / {OSA_MAX} * width > datum.minpx"
y = {"field": "radek", "type": "nominal", "sort": [r for r, _ in RADKY], "scale": {"paddingInner": 0.3}, "axis": OSA_Y}
s = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "width": "container",
    "height": 130,
    "layer": [
        {"data": {"values": segmenty},
         "mark": {"type": "bar", "stroke": "#f8f6f0", "strokeWidth": 1.5},
         "encoding": {"y": y,
                      "x": {"field": "x0", "type": "quantitative", "scale": {"domain": [0, OSA_MAX], "nice": False}, "axis": None},
                      "x2": {"field": "x1"},
                      "color": {"field": "barva", "type": "nominal", "scale": None},
                      "tooltip": [{"field": "radek", "title": "Skupina"}, {"field": "souhrn", "title": "Zabití"}]}},
        {"data": {"values": uvnitr},
         "mark": {"type": "text", "align": "left", "baseline": "middle", "dx": 9, "fontSize": 12.5, "fontWeight": 700, "color": "#ffffff"},
         "encoding": {"y": y, "x": {"field": "x", "type": "quantitative"},
                      "text": {"value": {"expr": f"{VEJDE} ? datum.text : ''"}}}},
        {"data": {"values": venku},
         "mark": {"type": "text", "align": "left", "baseline": "middle", "dx": 7, "fontSize": 12.5, "fontWeight": 700, "color": INK},
         "encoding": {"y": y, "x": {"field": "x", "type": "quantitative"},
                      "text": {"value": {"expr": f"{VEJDE} ? datum.tfit : datum.tnofit"}}}},
    ],
}
s["title"] = {
    "text": f"Víc než pětinu z {cz(CELKEM)} Palestinců, které izraelské síly zabily na Západním břehu, tvořily {{děti|#de1743}}",
    "subtitle": "Zabití izraelskými silami na Západním břehu včetně východního Jeruzaléma, 7. 10. 2023 – 30. 9. 2026, bez obětí osadníků (počet lidí, data OCHA). Zpráva uvádí „nejméně“, zbytek do 1 080 jsme dopočítali jako bez určení.",
}
s["_source"] = f"{ZPRAVA}, odst. 17"
uloz("obeti-zapadni-breh.json", s)

# 3) Izraelská kontrola území Gazy (odst. 37)
kontrola = [
    {"kat": "Příměří, říjen 2025", "n": 53, "t": "53 %", "barva": SEDA, "tbarva": INK},
    {"kat": "Září 2026", "n": 60, "t": "nejméně 60 %", "barva": KARMIN, "tbarva": "#ffffff"},
    {"kat": "Pokyn Netanjahua", "n": 70, "t": "70 %", "barva": SVETLA, "tbarva": INK},
]
s = pruhy(kontrola, 100, 140, "Stav")
s["title"] = {
    "text": "Izrael podle komise kontroluje {nejméně 60 %|#de1743} Gazy, příměří počítalo s 53 %",
    "subtitle": "Podíl území Pásma Gazy pod kontrolou izraelské armády (%): podle dohody o příměří z října 2025, skutečnost k 2. 9. 2026 a 70 %, která podle premiéra Netanjahua v květnu 2026 nařídil obsadit.",
}
s["_source"] = f"{ZPRAVA}, odst. 37"
uloz("kontrola-gazy.json", s)
