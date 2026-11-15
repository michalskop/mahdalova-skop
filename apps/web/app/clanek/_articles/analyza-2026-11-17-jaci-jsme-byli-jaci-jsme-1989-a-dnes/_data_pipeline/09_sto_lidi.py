"""„Česko jako 100 lidí“ – piktogramová mřížka 1991 × 2021 (sčítání lidu) pro pilot speciálu.

Kolik ze 100 lidí: má vysokou školu, je ženatých/vdaných, hlásí se k víře, je starších 65 let
a kolik ze 100 dětí se narodí mimo manželství. Každé číslo počítá tento skript z primárních dat:

  1. Vzdělání 15+ (sčítání 1991, 2021): ČSÚ, Česko od roku 1989 v číslech, Tab. 01.03
     https://csu.gov.cz/produkty/cesko-od-roku-1989-v-cislech-aktualizace-27-8-2026
     archiv: csu-data/souhrn/cesko-od-1989/20260827/data/32018126_0103.xlsx
     (podíl ze zjištěných hodnot, stejně jako ČSÚ a kapitola Vzdělávání)
  2. Rodinný stav a věk 1991: ČSÚ, SLDB 1991, Tab. 5 Obyvatelstvo podle věkových skupin, pohlaví a rodinného stavu
     https://csu.gov.cz/docs/107516/d6d49e81-fb9b-6db7-34a3-c453a9d3ac55/tab05.xls?version=1.0 (stránka https://csu.gov.cz/obyvatelstvo1991)
     archiv: csu-data/scitani/sldb1991-rodinny-stav/20261114/tab05.xls
  3. Rodinný stav a věk 2021: ČSÚ, SLDB 2021 otevřená data, sldb2021_stav_vek5_pohlavi.csv
     https://csu.gov.cz/docs/107508/af602742-107a-be03-6cb9-5fa581419b92/sldb2021_stav_vek5_pohlavi.csv?version=1.0
     archiv: csu-data/scitani/sldb2021-vek/20261114/
  4. Víra 1991 × 2021 a děti mimo manželství 1989 × 2025: výstupy pilota doplnky.json (03_doplnky.py)
     a dvojice.json (02_dvojice.py), které je počítají z primárních dat ČSÚ.

Výstup: ../data/sto-lidi.json (Vega-Lite), vystup_sto_lidi.txt (všechna čísla).
Spuštění: python 09_sto_lidi.py (po 02_dvojice.py a 03_doplnky.py)
"""
import csv
import json
import os
import re
import sys
from pathlib import Path

import openpyxl
import xlrd

sys.stdout.reconfigure(encoding="utf-8")
HERE = Path(__file__).resolve().parent
DATA_OUT = HERE.parent / "data"
CRIMSON, MUTED, INK = "#de1743", "#d4d4c8", "#101432"
NB = " "


def najdi_archiv() -> Path:
    if os.environ.get("CSU_DATA"):
        return Path(os.environ["CSU_DATA"])
    for p in Path(__file__).resolve().parents:
        for kandidat in (p / "csu-data", p / "statisticka-data" / "cesko"):
            if kandidat.exists():
                return kandidat
    raise SystemExit("Archiv csu-data nenalezen – nastav CSU_DATA")


ARCHIV = najdi_archiv()
out = []


def log(*a):
    out.append(" ".join(str(x) for x in a))


def num(v):
    return float(v) if isinstance(v, (int, float)) and not isinstance(v, bool) else None


def ze_sta(x):
    """Zaokrouhlení podílu v % na celé „lidi ze 100“ (půlka nahoru)."""
    return int(x + 0.5)


# ---------- 1. Vysokoškoláci 15+ (Tab. 01.03) ----------
wb = openpyxl.load_workbook(ARCHIV / "souhrn/cesko-od-1989/20260827/data/32018126_0103.xlsx", data_only=True)
rows = [list(r) for r in wb.worksheets[0].iter_rows(values_only=True)]
ROKY_SC = [1980, 1991, 2001, 2011, 2021]
blok, aktivni = {}, False
for r in rows:
    if r[1] and str(r[1]).strip().startswith("Obyvatelstvo celkem"):
        aktivni = True
        continue
    if aktivni and r[1] and str(r[1]).strip() in ("Muži", "Ženy"):
        break
    if aktivni and r[0]:
        lab = re.sub(r"\s*\d\)$", "", str(r[0]).strip())
        blok[lab] = {y: num(r[1 + 2 * i]) for i, y in enumerate(ROKY_SC)}
vs = {}
for rok in (1991, 2021):
    zjisteno = blok["Celkem"][rok] - blok["Nezjištěno"][rok]
    vs[rok] = 100 * blok["Vysokoškolské"][rok] / zjisteno
    log(f"VŠ {rok}: {int(blok['Vysokoškolské'][rok])} z {int(zjisteno)} se zjištěným vzděláním (15+) = {vs[rok]:.2f} %")

# ---------- 2. Rodinný stav a věk 1991 (SLDB 1991, Tab. 5) ----------
sh = xlrd.open_workbook(ARCHIV / "scitani/sldb1991-rodinny-stav/20261114/tab05.xls").sheet_by_index(0)
r91, v_bloku = {}, False
for i in range(sh.nrows):
    row = sh.row_values(i)
    if any(str(c).strip() == "OBYVATELSTVO CELKEM" for c in row):
        v_bloku = True
        continue
    if v_bloku and str(row[0]).strip():
        vals = [c for c in row[1:] if c != ""]
        r91[str(row[0]).strip()] = vals
celkem91 = r91["úhrn"][0]
deti91 = sum(r91[k][0] for k in ("0 -  4", "5 -  9", "10 - 14"))
dosp91 = celkem91 - deti91          # 15+ včetně nezjištěného věku (1 357 osob)
zenati91 = r91["úhrn"][2]
nezj_stav91 = r91["úhrn"][5]
seniori91 = sum(v[0] for k, v in r91.items() if re.match(r"^(\d+)", k) and int(re.match(r"^(\d+)", k).group(1)) >= 65)
log(f"1991: obyvatel {int(celkem91)}, 0–14 let {int(deti91)}, 15+ (vč. nezjištěného věku) {int(dosp91)}")
log(f"1991: ženatí/vdané {int(zenati91)} = {100 * zenati91 / dosp91:.2f} % lidí 15+ (rodinný stav nezjištěn {int(nezj_stav91)})")
log(f"1991: 65+ {int(seniori91)} = {100 * seniori91 / celkem91:.2f} % obyvatel")

# ---------- 3. Rodinný stav a věk 2021 (SLDB 2021 otevřená data) ----------
celkem21 = deti21 = zenati21 = seniori21 = nezj_stav21 = partnerstvi21 = 0
with open(ARCHIV / "scitani/sldb2021-vek/20261114/sldb2021_stav_vek5_pohlavi.csv", encoding="utf-8-sig") as f:
    for r in csv.DictReader(f):
        if r["pohlavi_kod"] or r["uzemi_txt"] != "Česká republika":
            continue
        n = int(r["hodnota"])
        vek = int(re.match(r"(\d+)", r["vek_txt"]).group(1))
        celkem21 += n
        if vek < 15:
            deti21 += n
        if vek >= 65:
            seniori21 += n
        if r["stav_kod"] == "2":
            zenati21 += n
        if r["stav_kod"] == "99" and vek >= 15:
            nezj_stav21 += n
        if r["stav_kod"] == "5":
            partnerstvi21 += n
dosp21 = celkem21 - deti21
log(f"2021: obyvatel {celkem21}, 0–14 let {deti21}, 15+ {dosp21}")
log(f"2021: ženatí/vdané {zenati21} = {100 * zenati21 / dosp21:.2f} % lidí 15+ "
    f"(rodinný stav nezjištěn {nezj_stav21} = {100 * nezj_stav21 / dosp21:.2f} %; trvající registrované partnerství {partnerstvi21}, nepočítáno)")
log(f"2021: 65+ {seniori21} = {100 * seniori21 / celkem21:.2f} % obyvatel")

# ---------- 4. Víra a děti mimo manželství z výstupů pilota ----------
X = {d["ukazatel"]: d for d in json.loads((HERE / "doplnky.json").read_text(encoding="utf-8"))}
D = {d["ukazatel"]: d for d in json.loads((HERE / "dvojice.json").read_text(encoding="utf-8"))}
vira = X["Věřící (všichni, kdo víru uvedli)"]
mimo = D["Děti narozené mimo manželství"]
mimo_t, mimo_d = mimo["rada"][str(mimo["rok_tehdy"])], mimo["rada"][str(mimo["rok_dnes"])]
log(f"víra {vira['rok_tehdy']}: {vira['tehdy']} %, {vira['rok_dnes']}: {vira['dnes']} % ({vira['pozn']})")
log(f"mimo manželství {mimo['rok_tehdy']}: {mimo_t:.2f} %, {mimo['rok_dnes']}: {mimo_d:.2f} %")

# ---------- řádky mřížky ----------
# (klíč, věta, rok tehdy, % tehdy, rok dnes, % dnes, kdo se počítá)
RADKY = []


def radek(klic, veta_fn, r0, p0, r1, p1, kdo):
    a, b = ze_sta(p0), ze_sta(p1)
    RADKY.append(dict(klic=klic, veta=veta_fn(a, b), r0=r0, r1=r1, a=a, b=b, p0=p0, p1=p1, kdo=kdo))
    log(f"MŘÍŽKA {klic}: {r0} {p0:.2f} % → {a} ze 100 | {r1} {p1:.2f} % → {b} ze 100")


radek("vs", lambda a, b: f"Vysokou školu mělo {a} ze{NB}100 dospělých, v{NB}roce 2021 to bylo {b}", 1991, vs[1991], 2021, vs[2021], "dospělých")
radek("vira", lambda a, b: f"K{NB}víře se hlásilo {a} ze{NB}100 lidí, v{NB}roce 2021 to bylo {b}", vira["rok_tehdy"], vira["tehdy"], vira["rok_dnes"], vira["dnes"], "obyvatel")
radek("manzelstvi", lambda a, b: f"Ženatých a vdaných bylo {a} ze{NB}100 dospělých, v{NB}roce 2021 to bylo {b}", 1991, 100 * zenati91 / dosp91, 2021, 100 * zenati21 / dosp21, "dospělých")
radek("seniori", lambda a, b: f"Starších 65{NB}let bylo {a} ze{NB}100 lidí, v{NB}roce 2021 to bylo {b}", 1991, 100 * seniori91 / celkem91, 2021, 100 * seniori21 / celkem21, "obyvatel")
radek("mimo", lambda a, b: f"Mimo manželství se narodilo {a} ze{NB}100 dětí, loni {b}", mimo["rok_tehdy"], mimo_t, mimo["rok_dnes"], mimo_d, "dětí")

# ---------- Vega-Lite ----------
# Tabler icon „user“ (filled, viewBox 24) přepočtená do čtverce −1…1, jak ho chce Vega pro vlastní `shape`.
# Originál: M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z  +  M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z
def tabler_do_jednotky(d):
    """Absolutní souřadnice x' = (x − 12)/12, relativní jen /12; oblouky: poloměry /12, příznaky beze změny."""
    tokens = re.findall(r"[a-zA-Z]|-?\d*\.?\d+", d)
    res, i, cmd = [], 0, None
    nargs = {"M": 2, "L": 2, "H": 1, "V": 1, "A": 7, "Z": 0}
    while i < len(tokens):
        t = tokens[i]
        if re.match(r"[a-zA-Z]", t):
            cmd = t
            res.append(t)
            i += 1
            if cmd.upper() == "Z":
                continue
        n = nargs[cmd.upper()]
        args = [float(x) for x in tokens[i:i + n]]
        i += n
        absol = cmd.isupper()
        u = cmd.upper()
        if u in ("M", "L"):
            args = [(args[0] - 12) / 12, (args[1] - 12) / 12] if absol else [args[0] / 12, args[1] / 12]
        elif u == "H":
            args = [(args[0] - 12) / 12] if absol else [args[0] / 12]
        elif u == "V":
            args = [(args[0] - 12) / 12] if absol else [args[0] / 12]
        elif u == "A":
            rx, ry, rot, la, sw, x, y = args
            x, y = ((x - 12) / 12, (y - 12) / 12) if absol else (x / 12, y / 12)
            args = [rx / 12, ry / 12, rot, la, sw, x, y]
        res.append(" ".join(f"{a:.4f}".rstrip("0").rstrip(".") if not float(a).is_integer() else str(int(a)) for a in args))
    return " ".join(res)


IKONA = (tabler_do_jednotky("M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z") + " "
         + tabler_do_jednotky("M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z"))
log("ikona (Tabler user filled, jednotkový čtverec):", IKONA)

# Rozvržení v pixelech (osy bez škály): buňka = min(šířka/21, 16) px, dvě mřížky 10 × 10 vedle sebe
# (vlevo tehdy, vpravo dnes, mezera jedna buňka). Blok = věta (2 řádky na mobilu) + roky + 10 řad.
CELL = 16
VETA_H, ROK_H = 40, 20
BLOK_H = VETA_H + ROK_H + 10 * CELL + 22
body, texty = [], []
for bi, r in enumerate(RADKY):
    y0 = bi * BLOK_H
    texty.append(dict(typ="veta", blok=bi, y=y0 + 16, x=0, text=r["veta"], strana=0))
    for strana, rok, k in ((0, r["r0"], r["a"]), (1, r["r1"], r["b"])):
        texty.append(dict(typ="rok", blok=bi, y=y0 + VETA_H + 12, x=strana * 11, strana=strana,
                          text=f"{rok}: {k} ze{NB}100"))
        for i in range(100):
            body.append(dict(blok=bi, strana=strana, sl=strana * 11 + i % 10, rad=i // 10,
                             y=y0 + VETA_H + ROK_H + (i // 10) * CELL + CELL / 2,
                             stav="ano" if i < k else "ne",
                             t_veta=r["veta"], t_rok=str(rok), t_hodnota=f"{(r['p0'] if strana == 0 else r['p1']):.1f}".replace(".", ",") + f"{NB}% {r['kdo']}"))
vyska = len(RADKY) * BLOK_H - 22
# mobil: věty dělíme na dva řádky (Vega text nezalamuje sám)
for t in texty:
    if t["typ"] == "veta":
        cast = t["text"].split(", ", 1)
        t["radky"] = [cast[0] + ",", cast[1]]

bunka = f"min(width / 21, {CELL})"
spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": {"text": f"Česko jako 100 lidí: {{dnes|{CRIMSON}}} víc vysokoškoláků a seniorů, méně věřících a manželství",
              "subtitle": f"Kolik ze 100 lidí (dospělých = 15 a více let, u porodů ze 100 dětí); sčítání lidu 1991 a 2021, porody 1989 a 2025. "
                          f"Víru v{NB}roce 2021 nevyplnilo 30{NB}% lidí"},
    "width": "container", "height": vyska,
    "config": {"view": {"stroke": None}},
    "layer": [
        {"data": {"values": body},
         "transform": [{"calculate": f"datum.sl * {bunka} + {bunka} / 2", "as": "px"}],
         "mark": {"type": "point", "filled": True, "shape": IKONA, "strokeWidth": 0,
                  "size": {"expr": f"pow({bunka} * 1.05, 2)"}},
         "encoding": {
             "x": {"field": "px", "type": "quantitative", "scale": None, "axis": None},
             "y": {"field": "y", "type": "quantitative", "scale": None, "axis": None},
             "color": {"field": "stav", "type": "nominal", "legend": None,
                       "scale": {"domain": ["ano", "ne"], "range": [CRIMSON, MUTED]}},
             "tooltip": [{"field": "t_veta", "title": "Kolik ze 100"}, {"field": "t_rok", "title": "Rok"},
                         {"field": "t_hodnota", "title": "Podíl"}]}},
        {"data": {"values": [t for t in texty if t["typ"] == "veta"]},
         "mark": {"type": "text", "align": "left", "baseline": "middle", "fontSize": 14, "fontWeight": 700,
                  "color": INK, "lineHeight": 17},
         "encoding": {"x": {"datum": 0, "type": "quantitative", "scale": None},
                      "y": {"field": "y", "type": "quantitative", "scale": None},
                      "text": {"condition": {"test": "width < 520", "field": "radky"}, "field": "text"}}},
        {"data": {"values": [t for t in texty if t["typ"] == "rok"]},
         "transform": [{"calculate": f"datum.x * {bunka}", "as": "px"}],
         "mark": {"type": "text", "align": "left", "baseline": "middle", "fontSize": 12, "color": "#333333"},
         "encoding": {"x": {"field": "px", "type": "quantitative", "scale": None},
                      "y": {"field": "y", "type": "quantitative", "scale": None},
                      "text": {"field": "text"}}},
    ],
    "_source": "ČSÚ, [sčítání 1991](https://csu.gov.cz/obyvatelstvo1991) a [2021](https://csu.gov.cz/produkty/vysledky-scitani-2021-otevrena-data), "
               "[Česko od roku 1989 v číslech](https://csu.gov.cz/produkty/cesko-od-roku-1989-v-cislech-aktualizace-27-8-2026); výpočet DataTimes",
}

DATA_OUT.mkdir(exist_ok=True)
(DATA_OUT / "sto-lidi.json").write_text(json.dumps(spec, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(HERE / "vystup_sto_lidi.txt").write_text("\n".join(out) + "\n", encoding="utf-8")
print("\n".join(out))
