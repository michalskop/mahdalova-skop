"""Kapitola „Peníze“ – oddíl „Kdo si od roku 1989 polepšil víc – senioři, nebo mladí?“

Čísla v textu i v grafu data/chudoba-vek.json počítá tenhle skript z primárních dat:

1) ČSÚ, Retrospektivní údaje statistiky rodinných účtů za období 1989–2003 (e-3011-05, 31. 5. 2005)
   https://csu.gov.cz/produkty/retrospektivni-udaje-statistiky-rodinnych-uctu-za-obdobi-1989-2003-n-r6nbs0a4kp
   Tab. 2/2 domácnosti zaměstnanců, 5/2 domácnosti důchodců, 8/2 domácnosti zaměstnanců s dětmi
   (čisté peněžní příjmy, průměr na osobu a rok v Kč), Tab. x/1 složení domácností
   archiv: csu-data/prijmy/sru-retrospektiva-1989-2003/20261114/301105{21,22,51,52,81,82}.xls
2) ČSÚ, Příjmy a životní podmínky domácností – data za rok 2025 (EU-SILC 2025, příjmy za rok 2024)
   https://csu.gov.cz/produkty/prijmy-a-zivotni-podminky-domacnosti-2025
   Tab. 1a (podle postavení osoby v čele), Tab. 7a (podle počtu nezaopatřených dětí)
   archiv: csu-data/prijmy/csu-silc-prijmy-domacnosti-2025/20261114/data/16002126{01a,07a}.xlsx
3) Eurostat ilc_li02, míra ohrožení příjmovou chudobou (pod 60 % mediánu ekvivalizovaného příjmu) podle věku
   https://ec.europa.eu/eurostat/databrowser/view/ilc_li02/default/table
   archiv: csu-data/prijmy/eurostat-ilc_li02/20261114/ilc_li02_CZ.json

Spuštění:  python senori_mladi.py  → ../data/chudoba-vek.json + vystup_senori_mladi.txt
"""
import json
import os
import re
from pathlib import Path

import pandas as pd

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "data"
CRIMSON, BLUE, INK, GRID, LIGHT = "#de1743", "#6267a3", "#101432", "#d4d4c8", "#ff8099"
LIGHT_TXT = "#ff4d70"  # brand[3], popisky řady 18–24
NBSP = " "


def najdi_archiv() -> Path:
    if os.environ.get("CSU_DATA"):
        return Path(os.environ["CSU_DATA"])
    for p in Path(__file__).resolve().parents:
        for kandidat in (p / "csu-data", p / "statisticka-data" / "cesko"):
            if kandidat.exists():
                return kandidat
    raise SystemExit("Archiv csu-data nenalezen – nastav CSU_DATA")


ARCH = najdi_archiv() / "prijmy"
vystup = []


def log(*a):
    vystup.append(" ".join(str(x) for x in a))


def cz(x, d=0):
    return f"{x:,.{d}f}".replace(",", NBSP).replace(".", ",")


# ---------------- 1. SRÚ 1989–2003 ----------------
SRU = ARCH / "sru-retrospektiva-1989-2003" / "20261114"


def sru_radek(soubor, popisek):
    d = pd.read_excel(SRU / soubor, header=None)
    hlav = d.iloc[2].tolist()
    roky = {j: int(float(v)) for j, v in enumerate(hlav) if str(v).replace(".0", "").isdigit()}
    for _, r in d.iterrows():
        lab = " ".join(str(v) for v in r.tolist()[:5] if str(v) != "nan")
        if re.sub(r"\s+", " ", lab).strip().startswith(popisek):
            return {y: float(r.iloc[j]) for j, y in roky.items()}
    raise KeyError(popisek)


cist_zam = sru_radek("30110522.xls", "ČISTÉ PENĚŽNÍ PŘÍJMY CELKEM")
cist_duch = sru_radek("30110552.xls", "ČISTÉ PENĚŽNÍ PŘÍJMY CELKEM")
cist_deti = sru_radek("30110582.xls", "ČISTÉ PENĚŽNÍ PŘÍJMY CELKEM")
cl_zam = sru_radek("30110521.xls", "členů")
cl_duch = sru_radek("30110551.xls", "členů")
cl_deti = sru_radek("30110581.xls", "členů")

log("== SRÚ: čisté peněžní příjmy na osobu a rok (Kč) ==")
for y in (1989, 2003):
    log(f"{y}: zaměstnanci {cz(cist_zam[y])} | důchodci {cz(cist_duch[y])} | zaměstnanci s dětmi {cz(cist_deti[y])}")
    log(f"   důchodci / zaměstnanci = {cz(cist_duch[y] / cist_zam[y] * 100, 1)} %; "
        f"důchodci / zaměstnanci s dětmi = {cz(cist_duch[y] / cist_deti[y] * 100, 1)} %")
    log(f"   členů na domácnost: zaměstnanci {cz(cl_zam[y], 2)}, důchodci {cz(cl_duch[y], 2)}, s dětmi {cz(cl_deti[y], 2)}")

# ---------------- 2. SILC 2025 (příjmy 2024) ----------------
SILC = ARCH / "csu-silc-prijmy-domacnosti-2025" / "20261114" / "data"


def silc_radek(soubor, popisek):
    d = pd.read_excel(SILC / soubor, header=None)
    for _, r in d.iterrows():
        vals = r.tolist()
        lab = str(vals[0]) if str(vals[0]) != "nan" else ""
        if lab.strip().startswith(popisek):
            return [v for v in vals[1:] if isinstance(v, (int, float)) and str(v) != "nan"]
    raise KeyError(popisek)


s1 = silc_radek("1600212601a.xlsx", "F. Čisté peněžní příjmy")
s1_cl = silc_radek("1600212601a.xlsx", "Členů")
# sloupce Tab. 1a: celkem, zaměstnanci celkem, s nižším vzd., s vyšším vzd., samostatně činní, důchodci celkem, nezaměstnaní, ostatní
silc_celkem, silc_zam, silc_duch = s1[0], s1[1], s1[5]
s7 = silc_radek("1600212607a.xlsx", "E. Čisté peněžní příj")
s7_cl = silc_radek("1600212607a.xlsx", "Členů")
# sloupce Tab. 7a: s dětmi celkem, 1, 2, 3+ dětí, bez dětí, s pracujícími celkem, 1, 2, 3+, bez pracujících
silc_deti = s7[0]
log("== SILC 2025 (příjmy za rok 2024): čisté peněžní příjmy na osobu a rok (Kč) ==")
log(f"všechny domácnosti {cz(silc_celkem)} | zaměstnanci {cz(silc_zam)} | důchodci {cz(silc_duch)} | s dětmi {cz(silc_deti)}")
log(f"   důchodci / zaměstnanci = {cz(silc_duch / silc_zam * 100, 1)} %; důchodci / s dětmi = {cz(silc_duch / silc_deti * 100, 1)} %")
log(f"   členů na domácnost: zaměstnanci {cz(s1_cl[1], 2)}, důchodci {cz(s1_cl[5], 2)}, s dětmi {cz(s7_cl[0], 2)}")
log(f"   měsíčně na osobu: důchodci {cz(silc_duch / 12)} Kč, zaměstnanci {cz(silc_zam / 12)} Kč, s dětmi {cz(silc_deti / 12)} Kč")
log(f"   1989 měsíčně na osobu: důchodci {cz(cist_duch[1989] / 12)} Kčs, zaměstnanci {cz(cist_zam[1989] / 12)} Kčs, "
    f"zaměstnanci s dětmi {cz(cist_deti[1989] / 12)} Kčs")

# ---------------- 3. Eurostat ilc_li02 ----------------
E = json.loads((ARCH / "eurostat-ilc_li02" / "20261114" / "ilc_li02_CZ.json").read_text(encoding="utf-8"))
dims, size = E["id"], E["size"]
idx = {k: E["dimension"][k]["category"]["index"] for k in dims}


def pos(**kw):
    p = 0
    for k, s in zip(dims, size):
        p = p * s + idx[k][kw[k]]
    return str(p)


def chud(age, t, geo="CZ"):
    kw = dict(freq="A", statinfo="MED_EI", unit="PC", rskpovth="B_60", sex="T", age=age, geo=geo, time=t)
    return E["value"].get(pos(**kw)), E.get("status", {}).get(pos(**kw))


VEKY = [("Y_LT18", "děti do 18 let"), ("Y18-24", "18–24 let"), ("Y_GE65", "65 a více let"), ("TOTAL", "všichni")]
roky = [t for t in idx["time"] if int(t) >= 2005]
log("== Eurostat ilc_li02: míra ohrožení příjmovou chudobou (%), CZ; příznak b = zlom řady ==")
rady = {}
for a, nazev in VEKY:
    rady[a] = {}
    for t in roky:
        v, st = chud(a, t)
        if v is not None:
            rady[a][int(t)] = v
    zlomy = [t for t in roky if chud(a, t)[1] == "b"]
    log(f"{nazev}: " + ", ".join(f"{y} {cz(v, 1)}" for y, v in rady[a].items()) + (f"  | zlom: {zlomy}" if zlomy else ""))
R0, R1 = 2005, max(rady["Y_GE65"])
for a, nazev in VEKY:
    log(f"   {nazev}: {R0} {cz(rady[a][R0], 1)} % → {R1} {cz(rady[a][R1], 1)} %; max {max(rady[a], key=rady[a].get)} "
        f"{cz(max(rady[a].values()), 1)} %")
eu = {a: chud(a, str(R1), "EU27_2020")[0] for a, _ in VEKY}
log(f"   EU27 {R1}: " + ", ".join(f"{n} {cz(eu[a], 1)} %" for a, n in VEKY))

# ---------------- graf ----------------
BARVY = {"Y_LT18": CRIMSON, "Y18-24": LIGHT, "Y_GE65": BLUE}
NAZ = {"Y_LT18": "děti do 18 let", "Y18-24": "mladí 18–24 let", "Y_GE65": "lidé nad 65 let"}
vals = []
for a in BARVY:
    for y, v in rady[a].items():
        vals.append(dict(rok=y, rada=NAZ[a], v=v, t=f"{cz(v, 1)} %"))
x = {"field": "rok", "type": "quantitative", "scale": {"domain": [R0, R1]},
     "axis": {"title": None, "format": "d", "grid": False, "domain": False, "ticks": False,
              "values": [2005, 2010, 2015, 2020, R1], "labelFlush": True}}
y = {"field": "v", "type": "quantitative", "scale": {"domain": [0, 20]},
     "axis": {"title": None, "grid": True, "gridColor": GRID, "domain": False, "ticks": False,
              "values": [0, 5, 10, 15, 20], "labelExpr": "datum.value + ' %'"}}
popisky = [  # (bod, barva, dy, zarovnání)
    (dict(rok=2007, v=rady["Y_LT18"][2007], text="děti do 18 let"), CRIMSON, -12, "center"),
    (dict(rok=2020, v=rady["Y18-24"][2020], text="18–24 let"), LIGHT_TXT, 16, "center"),
    (dict(rok=2006, v=rady["Y_GE65"][2006], text="nad 65 let"), BLUE, -10, "center"),
    (dict(rok=2019, v=rady["Y_GE65"][2019], text=f"2019: {cz(rady['Y_GE65'][2019], 1)} %"), BLUE, -10, "center"),
    (dict(rok=R1, v=rady["Y18-24"][R1], text=f"{cz(rady['Y18-24'][R1], 1)} %"), LIGHT_TXT, -10, "right"),
    (dict(rok=R1, v=rady["Y_LT18"][R1], text=f"{cz(rady['Y_LT18'][R1], 1)} %"), CRIMSON, 14, "right"),
    (dict(rok=R1, v=rady["Y_GE65"][R1], text=f"{cz(rady['Y_GE65'][R1], 1)} %"), BLUE, 16, "right"),
]
log("== GRAF chudoba-vek: popisky ==")
for p, *_ in popisky:
    log("  ", p)
g = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": {"text": f"Chudoba dnes hrozí {{dětem a mladým|{CRIMSON}}} víc než {{seniorům|{BLUE}}}",
              "subtitle": "Podíl lidí s příjmem pod hranicí ohrožení chudobou (60 % mediánu), podle věku, v %; "
                          f"šetření EU-SILC {R0}–{R1}, příjmy vždy za předchozí rok"},
    "width": "container", "height": 260,
    "config": {"view": {"stroke": None}},
    "data": {"values": vals},
    "layer": [
        {"mark": {"type": "line", "strokeWidth": 2.5},
         "encoding": {"x": x, "y": y,
                      "color": {"field": "rada", "type": "nominal", "legend": None,
                                "scale": {"domain": [NAZ[a] for a in BARVY], "range": list(BARVY.values())}},
                      "tooltip": [{"field": "rada", "title": "Věk"}, {"field": "rok", "title": "Rok šetření"},
                                  {"field": "t", "title": "Ohroženo chudobou"}]}},
    ] + [{"data": {"values": [p]}, "mark": {"type": "text", "fontSize": 11, "fontWeight": 700, "color": c, "dy": dy, "align": al},
          "encoding": {"x": {**x}, "y": {**y}, "text": {"field": "text"}}} for p, c, dy, al in popisky],
    "_source": "Eurostat, [EU-SILC, ilc_li02](https://ec.europa.eu/eurostat/databrowser/view/ilc_li02/default/table)",
}
OUT.mkdir(exist_ok=True)
(OUT / "chudoba-vek.json").write_text(json.dumps(g, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
(HERE / "vystup_senori_mladi.txt").write_text("\n".join(vystup) + "\n", encoding="utf-8")
print("\n".join(vystup))
