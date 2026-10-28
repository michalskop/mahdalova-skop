"""Vyrobí Vega-Lite specifikace grafů do ../data/ z čísel zprávy komise OSN A/81/430.

Každé číslo je ověřené proti textu zprávy skriptem overit_cisla.py (odstavce uvedené u dat).
Spuštění: python -I grafy.py
"""
import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
OUT = Path(__file__).parent.parent / "data"
OUT.mkdir(exist_ok=True)

KARMIN = "#de1743"   # brand.6
NAVY = "#6267a3"     # brandNavy.6
SEDA = "#bcbcb0"     # neutrální šedá používaná v grafech webu
ZPRAVA = ("[Zpráva Nezávislé mezinárodní vyšetřovací komise OSN, A/81/430]"
          "(https://www.ohchr.org/sites/default/files/documents/hrbodies/hrcouncil/coiopt/ga-81-430-auv.pdf)")


def cz(n):
    return f"{n:,}".replace(",", " ")


NBSP = "\u00a0"


def uloz(nazev, spec):
    # data a jednopísmenná slova nesmí zůstat na konci řádku
    for k in ("text", "subtitle"):
        t = re.sub(r"(\d{1,2})\. (\d{1,2})\. (\d{4})", lambda m: NBSP.join([m[1] + ".", m[2] + ".", m[3]]), spec["title"][k])
        spec["title"][k] = re.sub(r"(?<=\s)([vkszouaiVKSZOUAI]) ", lambda m: m[1] + NBSP, t)
    (OUT / nazev).write_text(json.dumps(spec, ensure_ascii=False, indent=2), encoding="utf-8")
    print("zapsáno", nazev)


def pruhy(hodnoty, pole_barvy, osa_max, vyska, tooltip_titul):
    """Vodorovné pruhy s hodnotou za pruhem."""
    return {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "width": "container",
        "height": vyska,
        "data": {"values": hodnoty},
        "encoding": {
            "y": {"field": "kat", "type": "nominal", "sort": None,
                  "scale": {"paddingInner": 0.3},
                  "axis": {"title": None, "labelLimit": 220, "domain": False, "ticks": False, "labelFontSize": 12}},
            "x": {"field": "n", "type": "quantitative", "scale": {"domain": [0, osa_max]},
                  "axis": None},
        },
        "layer": [
            {"mark": {"type": "bar", "cornerRadiusEnd": 3},
             "encoding": {"color": {"field": pole_barvy, "type": "nominal", "scale": None},
                          "tooltip": [{"field": "kat", "title": tooltip_titul}, {"field": "t", "title": "Počet"}]}},
            {"mark": {"type": "text", "align": "left", "dx": 6, "fontSize": 13, "fontWeight": 700, "color": "#333333"},
             "encoding": {"text": {"field": "t"}}},
        ],
    }


# 1) Nálety na Západním břehu (odst. 27)
nalety = [
    {"kat": "2008 – 6. 10. 2023 (téměř 16 let)", "n": 6, "t": "6", "barva": SEDA},
    {"kat": "7. 10. 2023 – 30. 9. 2026 (necelé 3 roky)", "n": 254, "t": "254", "barva": KARMIN},
]
s = pruhy(nalety, "barva", 290, 110, "Období")
s["title"] = {
    "text": "Při náletech na Západním břehu zemřelo za necelé tři roky {254|#de1743} Palestinců, za předchozích téměř 16 let šest",
    "subtitle": "Palestinci zabití izraelskými leteckými údery na Západním břehu (počet lidí)",
}
s["_source"] = f"{ZPRAVA}, odst. 27, podle dat OCHA"
uloz("nalety-zapadni-breh.json", s)

# 2) Kdo byli zabití izraelskými silami na Západním břehu (odst. 17)
CELKEM, MUZI, CHLAPCI, ZENY, DIVKY = 1080, 784, 237, 22, 7
neurceno = CELKEM - (MUZI + CHLAPCI + ZENY + DIVKY)
deti = CHLAPCI + DIVKY
podil_deti = deti / CELKEM * 100
print(f"děti {deti} z {CELKEM} = {podil_deti:.1f} %, bez určení {neurceno}")
obeti = [
    {"kat": "Muži", "n": MUZI, "t": cz(MUZI), "barva": SEDA},
    {"kat": "Chlapci", "n": CHLAPCI, "t": cz(CHLAPCI), "barva": KARMIN},
    {"kat": "Ženy", "n": ZENY, "t": cz(ZENY), "barva": SEDA},
    {"kat": "Dívky", "n": DIVKY, "t": cz(DIVKY), "barva": KARMIN},
    {"kat": "Bez určení pohlaví a věku", "n": neurceno, "t": cz(neurceno), "barva": "#dcdcd2"},
]
s = pruhy(obeti, "barva", 880, 190, "Skupina")
s["title"] = {
    "text": f"Víc než pětinu z {cz(CELKEM)} Palestinců, které izraelské síly zabily na Západním břehu, tvořily {{děti|#de1743}}",
    "subtitle": "Palestinci zabití izraelskými silami na Západním břehu včetně východního Jeruzaléma, 7. 10. 2023 – 30. 9. 2026 (počet lidí). Zpráva uvádí „nejméně“, zbytek do celku jsme dopočítali jako bez určení.",
}
s["_source"] = f"{ZPRAVA}, odst. 17, podle dat OCHA; bez obětí osadníků"
uloz("obeti-zapadni-breh.json", s)

# 3) Izraelská kontrola území Gazy (odst. 37)
kontrola = [
    {"kat": "Dohoda o příměří, říjen 2025", "n": 53, "t": "53 %", "barva": SEDA},
    {"kat": "Skutečnost, 2. 9. 2026", "n": 60, "t": "nejméně 60 %", "barva": KARMIN},
    {"kat": "Netanjahuův pokyn, květen 2026", "n": 70, "t": "70 %", "barva": "#efa0af"},
]
s = pruhy(kontrola, "barva", 100, 140, "Stav")
s["title"] = {
    "text": "Izrael podle komise kontroluje {nejméně 60 %|#de1743} Gazy, příměří počítalo s 53 %",
    "subtitle": "Podíl území Pásma Gazy pod kontrolou izraelské armády (%). Světlý pruh: premiér Netanjahu v květnu 2026 řekl, že nařídil obsadit 70 %.",
}
s["_source"] = f"{ZPRAVA}, odst. 37"
uloz("kontrola-gazy.json", s)
