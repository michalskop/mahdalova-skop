"""Kapitola „Svoboda“ – postoje Čechů a Slováků k přechodu po roce 1989 (Pew 2019, trend 1991/2009/2019).

Zdroj: Pew Research Center, European Public Opinion Three Decades After the Fall of Communism (15. 10. 2019),
topline: https://www.pewresearch.org/global/wp-content/uploads/sites/2/2019/10/Pew-Research-Center-Value-of-Europe-Topline-for-Release-FINAL.pdf
archiv: csu-data/pruzkumy/pew-2019-30-let-po-komunismu/20261114/Pew-Value-of-Europe-topline-2019.pdf
Otázky Q15b (systém více stran), Q16b (tržní ekonomika), Q17 (ekonomická situace proti komunismu).
Rok 1991 = průzkum Times Mirror v Československu, Pew ukazuje zvlášť českou (n = 638) a slovenskou část (n = 282).

Tabulky v PDF mají popisky řádků (země, období) posunuté o pár bodů proti číslům, proto řádky skládáme
podle souřadnic slov (PyMuPDF): číselný řádek patří k nejbližšímu popisku období do 6 bodů svisle.

Spuštění:  python pew_cr_sk.py  → ../data/pew-cr-sk.json + vystup_pew.txt
"""
import json
import os
import re
from pathlib import Path

import pymupdf

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "data"
CRIMSON, BLUE, INK, GREY = "#de1743", "#6267a3", "#101432", "#bcbcb0"
NBSP = " "


def najdi_archiv() -> Path:  # zkopírováno z pilota (02_dvojice.py)
    if os.environ.get("CSU_DATA"):
        return Path(os.environ["CSU_DATA"])
    for p in Path(__file__).resolve().parents:
        for kandidat in (p / "csu-data", p / "statisticka-data" / "cesko"):
            if kandidat.exists():
                return kandidat
    raise SystemExit("Archiv csu-data nenalezen – nastav CSU_DATA")


PDF = najdi_archiv() / "pruzkumy/pew-2019-30-let-po-komunismu/20261114/Pew-Value-of-Europe-topline-2019.pdf"
vystup = []


def log(*a):
    vystup.append(" ".join(str(x) for x in a))


ZEME = ["Bulgaria", "Czech Republic", "Hungary", "Lithuania", "Poland", "Slovakia", "Russia", "Ukraine",
        "East Germany", "Germany"]


def tabulka(zacatek, konec):
    """Vrátí {(země, rok): [čísla]} pro tabulku otázky od textu `zacatek` po `konec` (na stejné stránce)."""
    doc = pymupdf.open(PDF)
    for page in doc:
        text = page.get_text()
        if zacatek not in text:
            continue
        slova = page.get_text("words")
        y0 = min(w[1] for w in slova if w[4] == zacatek.split()[0])
        y1 = min([w[1] for w in slova if w[4] == konec.split()[0] and w[1] > y0] or [1e9])
        radky = {}
        for w in slova:
            if y0 < w[1] < y1:
                radky.setdefault(round(w[1], 1), []).append(w)
        stitky, cisla = [], []
        for y, ws in sorted(radky.items()):
            t = " ".join(w[4] for w in sorted(ws, key=lambda w: w[0]))
            m = re.match(r"^(.*?)(Spring|Fall), (\d{4})\s*(.*)$", t)
            if m:
                stitky.append(dict(y=y, zeme=m.group(1).strip(), rok=int(m.group(3))))
                zbytek = m.group(4).split()
                if zbytek and all(z.isdigit() for z in zbytek):
                    cisla.append(dict(y=y, v=[int(z) for z in zbytek]))
            elif t and all(z.isdigit() for z in t.split()) and len(t.split()) >= 4:
                cisla.append(dict(y=y, v=[int(z) for z in t.split()]))
        # země se v popisku uvádí jen u prvního období – doplnit dolů
        zeme = None
        for s in stitky:
            zeme = s["zeme"] if s["zeme"] in ZEME else zeme
            s["zeme"] = zeme
        out = {}
        for c in cisla:
            s = min(stitky, key=lambda s: abs(s["y"] - c["y"]))
            assert abs(s["y"] - c["y"]) <= 6, (zacatek, c)
            key = (s["zeme"], s["rok"])
            assert key not in out, (zacatek, key)
            out[key] = c["v"]
        assert len(out) == len(stitky), (zacatek, len(out), len(stitky))
        for v in out.values():
            assert sum(v[:-1]) in range(98, 103) and v[-1] == 100 or v[-2] == 100, v  # součet řádku ≈ 100
        return out
    raise KeyError(zacatek)


q15 = tabulka("Q15b. Starting in late 1989", "Q15e.")
q16 = tabulka("Q16b. Again, thinking back to 1989", "Q16c.")
q17 = tabulka("Q17. Would you say that the economic situation", "In Fall 2009")

ZEMECZ = {"Czech Republic": "Česko", "Slovakia": "Slovensko"}
data = {}
log("== Pew topline: Česko a Slovensko (1991 = česká/slovenská část ČSFR) ==")
for kod, q, nazev in (("Q15b", q15, "schvaluje přechod na systém více stran (rozhodně + spíše)"),
                      ("Q16b", q16, "schvaluje přechod na tržní ekonomiku (rozhodně + spíše)")):
    for z in ZEMECZ:
        for (zz, rok), v in sorted(q.items()):
            if zz == z:
                data[(kod, z, rok)] = v[0] + v[1]
                log(f"{kod} {ZEMECZ[z]} {rok}: rozhodně {v[0]} + spíše {v[1]} = {v[0] + v[1]} % | "
                    f"neschvaluje {v[2]} + {v[3]} = {v[2] + v[3]} % | neví {v[4]} %")
for z in ZEMECZ:
    for (zz, rok), v in sorted(q17.items()):
        if zz == z:
            data[("Q17", z, rok)] = v[0]
            log(f"Q17 {ZEMECZ[z]} {rok}: lepší {v[0]} % | horší {v[1]} % | stejná {v[2]} % | neví {v[3]} %")
for kod in ("Q15b", "Q16b", "Q17"):
    for rok in (1991, 2009, 2019):
        if (kod, "Czech Republic", rok) in data:
            log(f"   rozdíl ČR − SK {kod} {rok}: {data[(kod, 'Czech Republic', rok)] - data[(kod, 'Slovakia', rok)]} p. b.")

# ---------- graf: tři bloky, v každém Česko a Slovensko po letech ----------
OTAZKY = [("Q15b", "Schvaluje přechod na systém více stran"),
          ("Q16b", "Schvaluje přechod na tržní ekonomiku"),
          ("Q17", "Ekonomická situace je lepší než za komunismu")]
BARVA = {1991: BLUE, 2009: GREY, 2019: CRIMSON}
vals, hlavicky, r = [], [], 0
for kod, nadpis in OTAZKY:
    hlavicky.append(dict(r=r, text=nadpis))
    r += 1
    for z, zcz in ZEMECZ.items():
        prvni = True
        for rok in (1991, 2009, 2019):
            if (kod, z, rok) not in data:
                continue
            v = data[(kod, z, rok)]
            vals.append(dict(r=r, zeme=zcz, rok=str(rok), v=v, popis=f"{zcz}{NBSP}{NBSP}{rok}" if prvni else str(rok),
                             t=f"{v} %", barva=BARVA[rok], txt="#ffffff" if rok != 2009 else INK,
                             otazka=nadpis))
            prvni = False
            r += 1
    r += 0.4
STEP = 18
y = {"field": "r", "type": "quantitative", "scale": {"domain": [-0.6, r - 0.4], "reverse": True, "nice": False,
                                                    "zero": False}, "axis": None}
x = {"type": "quantitative", "scale": {"domain": [-46, 100], "nice": False}, "axis": None}
g = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": {"text": f"Češi schvalují změny po roce 1989 {{víc|{CRIMSON}}} než Slováci",
              "subtitle": f"Podíl dospělých, kteří přechod rozhodně nebo spíše schvalují, a kteří hodnotí ekonomickou "
                          f"situaci většiny lidí jako lepší než za komunismu, v %; rok 1991 = česká a slovenská část "
                          f"Československa, otázku na ekonomiku se Pew poprvé ptal v roce 2009"},
    "width": "container", "height": round(r * STEP),
    "config": {"view": {"stroke": None}},
    "data": {"values": vals},
    "layer": [
        {"mark": {"type": "bar", "height": STEP - 4, "cornerRadiusEnd": 2},
         "encoding": {"x": {**x, "field": "v"}, "x2": {"datum": 0}, "y": y,
                      "color": {"field": "barva", "type": "nominal", "scale": None},
                      "tooltip": [{"field": "otazka", "title": "Otázka"}, {"field": "zeme", "title": "Země"},
                                  {"field": "rok", "title": "Rok"}, {"field": "t", "title": "Podíl"}]}},
        {"mark": {"type": "text", "align": "right", "baseline": "middle", "dx": -5, "fontSize": 11.5, "fontWeight": 700},
         "encoding": {"x": {**x, "field": "v"}, "y": y, "text": {"field": "t"},
                      "color": {"field": "txt", "type": "nominal", "scale": None}}},
        {"mark": {"type": "text", "align": "left", "baseline": "middle", "fontSize": 11.5, "color": INK},
         "encoding": {"x": {**x, "datum": -46}, "y": y, "text": {"field": "popis"}}},
        {"data": {"values": hlavicky},
         "mark": {"type": "text", "align": "left", "baseline": "middle", "fontSize": 12.5, "fontWeight": 700, "color": INK},
         "encoding": {"x": {**x, "datum": -46}, "y": y, "text": {"field": "text"}}},
    ],
    "_source": "Pew Research Center, [topline 2019, Q15b, Q16b, Q17](https://www.pewresearch.org/global/2019/10/15/"
               "european-public-opinion-three-decades-after-the-fall-of-communism/)",
}
OUT.mkdir(exist_ok=True)
(OUT / "pew-cr-sk.json").write_text(json.dumps(g, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
(HERE / "vystup_pew.txt").write_text("\n".join(vystup) + "\n", encoding="utf-8")
print("\n".join(vystup))
