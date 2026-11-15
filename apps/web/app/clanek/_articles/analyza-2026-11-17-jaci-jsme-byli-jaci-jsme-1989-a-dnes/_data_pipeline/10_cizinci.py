"""Cizinci v Česku podle státního občanství 2004–2025 (vrstvený plošný graf) – přehled speciálu.

Primární data (archiv csu-data, mimo git):
  1) ČSÚ, Cizinci v ČR – 2025, Tab. 1.4 Cizinci podle státní příslušnosti (k 31. 12.), roky 2004–2024
     https://csu.gov.cz/produkty/cizinci-v-cr2025  (balík 29002725_data.zip, verze 1.2)
     archiv: csu-data/obyvatelstvo/csu-cizinci-v-cr-2025/20261114/data/290027250104.xlsx
  2) ČSÚ DataStat, sada CIZ002 Cizinci podle typu pobytu, pohlaví a státního občanství, stav k 31. 12. 2025
     https://data.csu.gov.cz/opendata/sady/CIZ002/distribuce/csv
     archiv: csu-data/obyvatelstvo/csu-cizinci-obcanstvi-ciz002/20261114/CIZ002.csv
  3) kontrola součtu a rok 1989: ČSÚ, Česko od roku 1989 v číslech, Tab. 01.02 (poznámka 2: od roku 2004
     je v dlouhodobých pobytech zahrnut i pobyt v rámci dočasné ochrany)
     archiv: csu-data/souhrn/cesko-od-1989/20260827/data/32018126_0102.xlsx

Zdrojem údajů je Ředitelství služby cizinecké policie (cizinci s trvalým a přechodným/dlouhodobým pobytem).
Řada podle občanství v publikaci Cizinci v ČR začíná rokem 2004; starší roky podle občanství
v aktuálních tabulkách ČSÚ nejsou (rok 1989 jen celkem).

Spuštění:  python 10_cizinci.py  → ../data/cizinci-zeme.json + vystup_cizinci.txt
"""
import json
import os
from pathlib import Path

import openpyxl
import pandas as pd

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "data"
NBSP = " "


def najdi_archiv() -> Path:
    if os.environ.get("CSU_DATA"):
        return Path(os.environ["CSU_DATA"])
    for p in Path(__file__).resolve().parents:
        for kandidat in (p / "csu-data", p / "statisticka-data" / "cesko"):
            if kandidat.exists():
                return kandidat
    raise SystemExit("Archiv csu-data nenalezen – nastav CSU_DATA")


A = najdi_archiv()
vystup = []


def log(*a):
    vystup.append(" ".join(str(x) for x in a))


def cz(x, d=0):
    return f"{x:,.{d}f}".replace(",", NBSP).replace(".", ",")


# země: (název v Tab. 1.4 a v CIZ002, popisek v grafu, barva z palety)
ZEME = [
    ("Ukrajina", "Ukrajina", "#de1743"),        # brand.6
    ("Slovensko", "Slovensko", "#6267a3"),      # brandNavy.6
    ("Vietnam", "Vietnam", "#0e839e"),          # brandTeal.6
    ("Rusko", "Rusko", "#9f319e"),              # brandAmethyst.6
    ("Německo", "Německo", "#efb704"),          # brandYellow.7
    ("Polsko", "Polsko", "#8b6240"),            # brandChocolate.5
]
OSTATNI = ("ostatní", "#d4d4c8")              # background.7

# ---------- 1) Cizinci v ČR 2025, Tab. 1.4 (2004–2024) ----------
ws = openpyxl.load_workbook(A / "obyvatelstvo/csu-cizinci-v-cr-2025/20261114/data/290027250104.xlsx",
                            data_only=True).worksheets[0]
rows = [list(r) for r in ws.iter_rows(values_only=True)]
hlav = next(r for r in rows if r[0] and str(r[0]).startswith("Státní příslušnost"))
roky = {j: int(str(v).strip()) for j, v in enumerate(hlav) if str(v).strip().isdigit()}  # roky jsou v záhlaví zčásti jako text
tab = {}
for r in rows:
    lab = str(r[0]).strip() if r[0] else ""
    if lab in ("Celkem cizinci",) + tuple(z for z, _, _ in ZEME):
        tab[lab] = {y: float(r[j]) for j, y in roky.items()}

# ---------- 2) DataStat CIZ002 (2025, a kontrola 2015–2024) ----------
d = pd.read_csv(A / "obyvatelstvo/csu-cizinci-obcanstvi-ciz002/20261114/CIZ002.csv", dtype=str)
d = d[(d["Pohlaví"] == "Celkem") & (d["Typ pobytu"] == "Celkem") & d["CASQD"].str.endswith("-12-31")]
d["rok"] = d["CASQD"].str[:4].astype(int)
d["v"] = d["Hodnota"].astype(float)
celk = d[(d["Státní občanství-Základní"] == "Cizinci celkem") & d["Státní občanství-Země"].isna()].set_index("rok")["v"]
zem = d[d["Státní občanství-Země"].notna()]
R1 = int(celk.index.max())
tab["Celkem cizinci"][R1] = celk[R1]
for z, _, _ in ZEME:
    s = zem[zem["Státní občanství-Země"] == z].set_index("rok")["v"]
    tab[z][R1] = s[R1]
    for y in range(2015, R1):  # kontrola shody obou zdrojů
        if abs(s[y] - tab[z][y]) > 0.5:
            log(f"POZOR: {z} {y} Tab. 1.4 {tab[z][y]:.0f} × CIZ002 {s[y]:.0f}")
for y in range(2015, R1):
    if abs(celk[y] - tab["Celkem cizinci"][y]) > 0.5:
        log(f"POZOR: celkem {y} Tab. 1.4 {tab['Celkem cizinci'][y]:.0f} × CIZ002 {celk[y]:.0f}")

# ---------- 3) kontrola proti Tab. 01.02 a rok 1989 ----------
ws2 = openpyxl.load_workbook(A / "souhrn/cesko-od-1989/20260827/data/32018126_0102.xlsx", data_only=True).worksheets[0]
t0102 = {}
for r in ws2.iter_rows(values_only=True):
    if isinstance(r[0], (int, float)) and isinstance(r[1], (int, float)):
        t0102[int(r[0])] = float(r[1])  # u roku 2015 dvě hodnoty: druhá (s azylanty) přepíše první
log(f"Tab. 01.02: 1989 {cz(t0102[1989])}, 2004 {cz(t0102[2004])}, {R1} {cz(t0102[R1])}; "
    f"Tab. 1.4 / CIZ002: 2004 {cz(tab['Celkem cizinci'][2004])}, {R1} {cz(tab['Celkem cizinci'][R1])}")

R0 = min(tab["Celkem cizinci"])
ROKY = sorted(tab["Celkem cizinci"])
log(f"== Cizinci podle občanství {R0}–{R1} (k 31. 12.) ==")
for y in (R0, 2021, 2022, R1):
    tot = tab["Celkem cizinci"][y]
    part = " | ".join(f"{z} {cz(tab[z][y])} ({cz(tab[z][y] / tot * 100, 1)} %)" for z, _, _ in ZEME)
    ost = tot - sum(tab[z][y] for z, _, _ in ZEME)
    log(f"{y}: celkem {cz(tot)} | {part} | ostatní {cz(ost)} ({cz(ost / tot * 100, 1)} %)")
for z, _, _ in ZEME:
    log(f"   {z}: {R0} → {R1}: {cz(tab[z][R0])} → {cz(tab[z][R1])}, ×{cz(tab[z][R1] / tab[z][R0], 1)}; "
        f"max {max(tab[z], key=tab[z].get)} {cz(max(tab[z].values()))}")
log(f"   Ukrajinci 2021 → 2022: +{cz(tab['Ukrajina'][2022] - tab['Ukrajina'][2021])}")
ost0 = tab["Celkem cizinci"][R0] - sum(tab[z][R0] for z, _, _ in ZEME)
ost1 = tab["Celkem cizinci"][R1] - sum(tab[z][R1] for z, _, _ in ZEME)
log(f"   ostatní: {cz(ost0)} → {cz(ost1)}, ×{cz(ost1 / ost0, 1)}")

# ---------- graf ----------
vals = []
poradi = {n: i for i, (_, n, _) in enumerate(ZEME)}
poradi[OSTATNI[0]] = len(ZEME)
for y in ROKY:
    tot = tab["Celkem cizinci"][y]
    for z, n, _ in ZEME:
        vals.append(dict(rok=y, zeme=n, o=poradi[n], v=tab[z][y], t=f"{cz(tab[z][y])} ({cz(tab[z][y] / tot * 100, 1)} %)"))
    ost = tot - sum(tab[z][y] for z, _, _ in ZEME)
    vals.append(dict(rok=y, zeme=OSTATNI[0], o=poradi[OSTATNI[0]], v=ost, t=f"{cz(ost)} ({cz(ost / tot * 100, 1)} %)"))

# popisky vpravo za koncem vrstev: střed vrstvy v roce R1, rozestup aspoň MEZERA (v jednotkách osy)
MAXY = 1_250_000
MEZERA = 62_000
konec, dole = [], 0.0
for z, n, c in ZEME + [(None, OSTATNI[0], OSTATNI[1])]:
    v = tab[z][R1] if z else ost1
    konec.append(dict(zeme=n, stred=dole + v / 2, barva=c if z else "#101432"))
    dole += v
ypos = []
for k in konec:
    y = k["stred"] if not ypos else max(k["stred"], ypos[-1] + MEZERA)
    ypos.append(y)
popisky = []
for k, y in zip(konec, ypos):
    popisky.append(dict(text=k["zeme"], x0=R1, y0=k["stred"], x1=R1 + 0.6, y=y, barva=k["barva"]))
log("== GRAF cizinci-zeme: popisky (y = střed vrstvy, posunutý kvůli rozestupu) ==")
for p in popisky:
    log("  ", p["text"], round(p["y0"]), "→", round(p["y"]))

x = {"field": "rok", "type": "quantitative", "scale": {"domain": [R0, R1 + 5.2]},
     "axis": {"title": None, "format": "d", "grid": False, "domain": False, "ticks": False,
              "values": [2004, 2010, 2015, 2020, R1], "labelFlush": False}}
y = {"type": "quantitative", "scale": {"domain": [0, MAXY]},
     "axis": {"title": None, "grid": True, "gridColor": "#d4d4c8", "domain": False, "ticks": False,
              "values": [0, 250000, 500000, 750000, 1000000],
              "labelExpr": "datum.value == 0 ? '0' : format(datum.value / 1000, ',d') + ' tis.'"}}
g = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": {"text": f"{{Ukrajinci|#de1743}} jsou víc než polovina cizinců, před válkou byli necelá třetina",
              "subtitle": f"Cizinci s trvalým nebo dlouhodobým pobytem podle státního občanství, k 31.{NBSP}12. "
                          f"{R0}–{R1}; od roku 2022 včetně Ukrajinců s dočasnou ochranou"},
    "width": "container", "height": 300,
    "config": {"view": {"stroke": None}},
    "data": {"values": vals},
    "layer": [
        {"mark": {"type": "area", "opacity": 0.95, "stroke": "#f8f6f0", "strokeWidth": 0.5},
         "encoding": {
             "x": x,
             "y": {**y, "field": "v", "stack": "zero"},
             "order": {"field": "o", "type": "quantitative"},
             "color": {"field": "zeme", "type": "nominal", "legend": None,
                       "scale": {"domain": [n for _, n, _ in ZEME] + [OSTATNI[0]],
                                 "range": [c for _, _, c in ZEME] + [OSTATNI[1]]}},
             "tooltip": [{"field": "zeme", "title": "Občanství"}, {"field": "rok", "title": "Rok"},
                         {"field": "t", "title": "Cizinců"}]}},
        {"data": {"values": popisky},
         "mark": {"type": "rule", "strokeWidth": 0.8},
         "encoding": {"x": {**x, "field": "x0"}, "x2": {"field": "x1"},
                      "y": {**y, "field": "y0"}, "y2": {"field": "y"},
                      "color": {"field": "barva", "type": "nominal", "scale": None}}},
        {"data": {"values": popisky},
         "mark": {"type": "text", "align": "left", "baseline": "middle", "dx": 3, "fontSize": 11, "fontWeight": 700},
         "encoding": {"x": {**x, "field": "x1"}, "y": {**y, "field": "y"}, "text": {"field": "text"},
                      "color": {"field": "barva", "type": "nominal", "scale": None}}},
    ],
    "_source": "ČSÚ, [Cizinci v ČR 2025, tab. 1.4](https://csu.gov.cz/produkty/cizinci-v-cr2025) a "
               "[DataStat CIZ002](https://data.csu.gov.cz/datastat/info/SADA/CIZ002)",
}
OUT.mkdir(exist_ok=True)
(OUT / "cizinci-zeme.json").write_text(json.dumps(g, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
(HERE / "vystup_cizinci.txt").write_text("\n".join(vystup) + "\n", encoding="utf-8")
print("\n".join(vystup))
