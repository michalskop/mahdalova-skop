"""Kapitola „Kriminalita a bezpečnost“ speciálu Jací jsme byli, jací jsme (1989 × 2026).

Jediný skript kapitoly: počítá všechna čísla z primárních dat v archivu csu-data
(statisticka-data/cesko), zapisuje Vega-Lite grafy do ../data/*.json a všechna čísla
použitá v textu do vystup.txt. Spouštění: python grafy.py

Vstupy (u každé složky je ZDROJ.txt s URL a datem stažení):
  kriminalita/iksp-trendy-kriminality-2023/20261114/  IKSP, Trendy kriminality 2023, příloha 1
                                                       (zjištěné a objasněné trestné činy od 1973, data Policie ČR)
  kriminalita/policie-statistiky/20261114/            Policie ČR, výkaz 2000 (00_12_1.xls) a sestava TSK 2025
  kriminalita/policie-vrazdy/20261114/                Policie ČR, vraždy 1989–2019 s objasněností
  kriminalita/csu-kriminalita/20261114/               ČSÚ Kriminalita 2025 (vězni a vraždy v sousedních zemích)
  kriminalita/vezenska-sluzba/20261114/               Historická penologie 1/2019 (amnestie 1. 1. 1990)
  pruzkumy/cvvm-pocit-bezpeci/20261114/               CVVM ob250711 (pocit bezpečí, květen–červen 2025)
  pruzkumy/cvvm-listopad-1989/20261114/               CVVM pd241111 (tab. 4, bezpečnost lepší/horší než před 1989)
  souhrn/cesko-od-1989/20260827/                      ČSÚ Česko od roku 1989 v číslech, tab. 01.01, 14.01–14.03
"""
import glob
import json
import os
import re
import sys
from pathlib import Path

import openpyxl
import pypdf
import xlrd

sys.stdout.reconfigure(encoding="utf-8")
HERE = Path(__file__).resolve().parent
DATA = HERE.parent / "data"
CRIMSON, BLUE, GREY, INK, MUTED = "#de1743", "#6267a3", "#bcbcb0", "#101432", "#d4d4c8"
NBSP = " "
out = []


def log(*a):
    out.append(" ".join(str(x) for x in a))


# ---------- pomocné funkce zkopírované z pilota (02_dvojice.py) ----------
def najdi_archiv() -> Path:
    if os.environ.get("CSU_DATA"):
        return Path(os.environ["CSU_DATA"])
    for p in Path(__file__).resolve().parents:
        for kandidat in (p / "csu-data", p / "statisticka-data" / "cesko"):
            if kandidat.exists():
                return kandidat
    raise SystemExit("Archiv csu-data nenalezen – nastav CSU_DATA")


A = najdi_archiv()
SOUHRN = A / "souhrn/cesko-od-1989/20260827/data"
_cache = {}


def list_(tab):
    if tab not in _cache:
        wb = openpyxl.load_workbook(SOUHRN / f"32018126_{tab}.xlsx", data_only=True)
        _cache[tab] = [list(r) for r in wb.worksheets[0].iter_rows(values_only=True)]
    return _cache[tab]


def rok(v):
    m = re.match(r"\s*((19|20)\d\d)", str(v)) if v is not None else None
    return int(m.group(1)) if m else None


def num(v):
    return float(v) if isinstance(v, (int, float)) and not isinstance(v, bool) else None


def radek(tab, popisek, n=0, po=None):
    """Tabulka s roky v záhlaví sloupců. Vrátí {rok: hodnota} n-tého řádku s daným popiskem."""
    rows = list_(tab)
    hlav = max(rows, key=lambda r: sum(isinstance(v, int) and 1900 < v < 2030 for v in r))
    roky = {j: v for j, v in enumerate(hlav) if isinstance(v, int) and 1900 < v < 2030}
    aktivni = po is None
    shody = []
    prvni = min(roky)
    sp = lambda s: re.sub(r"\s+", " ", s).strip()
    popisek, po = sp(popisek), sp(po) if po else None
    for r in rows:
        lab = sp(next((str(v) for v in r[:prvni] if v not in (None, "")), ""))
        if not aktivni:
            aktivni = lab.startswith(po)
            continue
        if lab.startswith(popisek):
            shody.append(r)
    r = shody[n]
    return {roky[j]: num(r[j]) for j in roky if j < len(r) and num(r[j]) is not None}


def sloupec(tab, j):
    """Tabulka s roky v prvním sloupci. Vrátí {rok: hodnota} sloupce j."""
    o = {}
    for r in list_(tab):
        y = rok(r[0]) if r and not isinstance(r[0], float) else None
        if y and len(r) > j and num(r[j]) is not None:
            o[y] = num(r[j])
    return o


def cz(x, d=0):
    s = f"{x:,.{d}f}".replace(",", " ").replace(".", ",")
    return s.replace(" ", NBSP)


def pdf_text(path):
    return [p.extract_text() for p in pypdf.PdfReader(path).pages]


# ---------- obyvatelstvo k 31. 12. (ČSÚ Tab. 01.01, tis.) ----------
obyv = {y: v * 1000 for y, v in radek("0101", "Počet obyvatel k 31. 12.").items()}

# ---------- 1) trestné činy od 1973 (IKSP příloha 1) + ČSÚ Tab. 14.01 pro 2024–2025 ----------
pdf_iksp = A / "kriminalita/iksp-trendy-kriminality-2023/20261114/Trendy-kriminality-v-CR-v-roce-2023-IKSP-Diblikova.pdf"
p1 = next(t for t in pdf_text(pdf_iksp) if "Příloha č. 1: Celková kriminalita" in t and "1973 109" in t)
CIS = r"(\d{1,3}(?: \d{3})?)"
iksp = {}
for m in re.finditer(r"\b(19[789]\d|20[0-2]\d)\s+" + CIS + r"\s+" + CIS + r"\s+(\d{2},\d{2})", p1):
    iksp[int(m.group(1))] = dict(zjisteno=int(m.group(2).replace(" ", "")), objasneno=int(m.group(3).replace(" ", "")),
                                 objasnenost=float(m.group(4).replace(",", ".")))
assert len(iksp) == 51 and iksp[1989]["zjisteno"] == 120768 and iksp[1999]["zjisteno"] == 426626 \
    and iksp[2023]["zjisteno"] == 181417 and iksp[2018]["objasneno"] == 92795, "kontrola přílohy IKSP selhala"
tc_csu = sloupec("1401", 1)
vrazdy = {y: int(v) for y, v in sloupec("1401", 2).items()}
tc = {y: d["zjisteno"] for y, d in iksp.items()}
for y in (2024, 2025):
    tc[y] = int(tc_csu[y])
rozdily = {y: (tc[y], int(tc_csu[y])) for y in tc_csu if y <= 2023 and tc[y] != int(tc_csu[y])}
log("KONTROLA IKSP × ČSÚ 14.01 (roky, kde se řady liší):", rozdily)

R0, RV, R1 = 1989, max(iksp, key=lambda y: iksp[y]["zjisteno"]), max(tc)
log("TC", R0, tc[R0], "vrchol", RV, tc[RV], "posl", R1, tc[R1])
log("TC 1990", tc[1990], "1991", tc[1991], "1993", tc[1993])
log("TC pokles od vrcholu %", round(100 * (1 - tc[R1] / tc[RV]), 1))
log("TC narust proti 1989 %", round(100 * (tc[R1] / tc[R0] - 1), 1))
log("TC nasobek 1989→vrchol", round(tc[RV] / tc[R0], 2))
for y in (R0, RV, R1):
    log("TC na 1000 obyv", y, round(tc[y] / obyv[y] * 1000, 1))
log("TC 2021 (covid)", tc[2021])
objmin = min((y for y in iksp if y >= 1989), key=lambda y: iksp[y]["objasnenost"])
log("OBJASNENOST", 1989, iksp[1989]["objasnenost"], 1990, iksp[1990]["objasnenost"], "min", objmin,
    iksp[objmin]["objasnenost"], 2023, iksp[2023]["objasnenost"])
log("OBJASNENOST 1973–1988 rozpeti", min(iksp[y]["objasnenost"] for y in range(1973, 1989)),
    max(iksp[y]["objasnenost"] for y in range(1973, 1989)))
log("OBJASNENO pocty", 1989, iksp[1989]["objasneno"], 2023, iksp[2023]["objasneno"])
log("TC 1973–1989 rozpeti", min(tc[y] for y in range(1973, 1990)), max(tc[y] for y in range(1973, 1990)))
log("OBJASNENOST 1994–2023 rozpeti", min(iksp[y]["objasnenost"] for y in range(1994, 2024)),
    max(iksp[y]["objasnenost"] for y in range(1994, 2024)))
log("TC 2014", tc[2014], "→ 2024", tc[2024], f"{(tc[2024] / tc[2014] - 1) * 100:.1f} %", "→ 2025", tc[R1],
    f"{(tc[R1] / tc[2014] - 1) * 100:.1f} %")
log("TC 2022–2025", [tc[y] for y in (2022, 2023, 2024, 2025)])

# ---------- 2) druhy kriminality 2000 × 2025 (Policie ČR) ----------
POL = A / "kriminalita/policie-statistiky/20261114"
DRUHY = [  # popisek, TSK 2000, TSK 2025
    ("Prosté krádeže", "411-490", "400-499"),
    ("Krádeže vloupáním", "311-390", "300-399"),
    ("Hospodářská kriminalita", "801-890", "800-899"),
    ("Vraždy", "101-106", "100-106"),
    ("Násilná kriminalita", "101-190", "100-199"),
    ("Zbývající (např. nedbalostní dopravní nehody)", "721-790", "700-799"),
    ("Ostatní (např. drogy, výtržnictví)", "611-665", "600-699"),
    ("Mravnostní kriminalita", "201-290", "200-299"),
    ("Celkem", "101-902", "0-999"),
]
s = xlrd.open_workbook(glob.glob(str(POL / "rozbaleno" / "*" / "00_12_1.xls"))[0]).sheet_by_index(0)
r2000 = {}
for i in range(s.nrows):
    v = [c for c in s.row_values(i) if c != ""]
    if len(v) > 3 and isinstance(v[0], str) and re.fullmatch(r"\d+-\d+", v[0].strip()):
        r2000.setdefault(v[0].strip(), (int(v[2]), int(v[3])))
wb = openpyxl.load_workbook(POL / "2025_12_Prosinec_sest_01a.xlsx", data_only=True, read_only=True)
r2025 = {}
for row in wb["Česká republika"].iter_rows(values_only=True):
    v = [c for c in row if c not in (None, "")]
    if len(v) > 3 and isinstance(v[0], str) and re.fullmatch(r"\d+-\d+", v[0].strip()):
        r2025.setdefault(v[0].strip(), (int(v[2]), int(v[3])))
assert r2000["101-902"][0] == iksp[2000]["zjisteno"], "výkaz 2000 nesedí s IKSP"
assert r2025["0-999"][0] == tc[2025], "sestava 2025 nesedí s ČSÚ 14.01"
v2 = []
for lab, k0, k5 in DRUHY:
    a, b = r2000[k0], r2025[k5]
    na0, na5 = a[0] / obyv[2000] * 1e5, b[0] / obyv[2025] * 1e5
    zm = (na5 / na0 - 1) * 100
    log("DRUH", lab, "2000", a[0], "obj", a[1], f"{a[1] / a[0] * 100:.1f} %", f"{na0:.1f}/100k",
        "| 2025", b[0], "obj", b[1], f"{b[1] / b[0] * 100:.1f} %", f"{na5:.1f}/100k", "| zmena na 100k %", round(zm, 1),
        "| zmena pocet %", round((b[0] / a[0] - 1) * 100, 1))
    if k0 == "101-902":
        log("PODIL majetkove 2000 %", round(r2000["311-590"][0] / a[0] * 100, 1))
    if lab not in ("Celkem", "Vraždy"):
        v2.append(dict(druh=lab, zmena=round(zm), x0=min(0, round(zm)), x1=max(0, round(zm)),
                       smer="víc" if zm > 0 else "méně",
                       l=("+" if zm > 0 else "−") + f"{abs(round(zm))}{NBSP}%",
                       t2000=f"{cz(a[0])} činů ({cz(na0, 0)} na 100{NBSP}000 obyv.)",
                       t2025=f"{cz(b[0])} činů ({cz(na5, 0)} na 100{NBSP}000 obyv.)"))
v2.sort(key=lambda d: d["zmena"])

# ---------- 3) vraždy ----------
r = openpyxl.load_workbook(A / "kriminalita/policie-vrazdy/20261114/vrazdy-1989-2019-policie-sesit1.xlsx",
                           data_only=True)["vraždy celkem"]
vr_pol = {row[0]: row for row in r.iter_rows(values_only=True) if isinstance(row[0], int)}
assert vr_pol[1989][1] == vrazdy[1989] == 126
vr100 = {y: v / obyv[y] * 1e5 for y, v in vrazdy.items()}
vmax = max(vrazdy, key=vrazdy.get)
log("VRAZDY", 1989, vrazdy[1989], round(vr100[1989], 2), "| vrchol", vmax, vrazdy[vmax], round(vr100[vmax], 2),
    "| 2025", vrazdy[2025], round(vr100[2025], 2), "| min", min(vrazdy, key=vrazdy.get), min(vrazdy.values()))
log("VRAZDY objasnenost 1989", vr_pol[1989][2], f"{vr_pol[1989][3] * 100:.1f} %",
    "| 2025", r2025["100-106"], f"{r2025['100-106'][1] / r2025['100-106'][0] * 100:.1f} %")
wbk = openpyxl.load_workbook(A / "kriminalita/csu-kriminalita/20261114/08000926t.xlsx", data_only=True, read_only=True)


def eu_tab(list_name):
    """Tab. 8.x/9.x ČSÚ: první blok počty, druhý blok na 100 tis. (2014–2024)."""
    rows = [[c for c in row if c is not None] for row in wbk[list_name].iter_rows(values_only=True)]
    rows = [x for x in rows if len(x) == 12 and isinstance(x[0], str)]
    pocty = {x[0]: x[1:] for x in rows[:len(rows) // 2]}
    na100 = {x[0]: x[1:] for x in rows[len(rows) // 2:]}
    return pocty, na100


vp, vn = eu_tab("8.1")
log("VRAZDY DOKONANE (Eurostat přes ČSÚ tab. 8.1) 2024: Česko", vp["Česko"][-1], vn["Česko"][-1], "na 100k",
    "| Německo", vn["Německo"][-1], "Polsko", vn["Polsko"][-1], "Slovensko", vn["Slovensko"][-1])

# ---------- 4) silnice (ČSÚ Tab. 14.03) ----------
usmrc30 = {y: int(v) for y, v in sloupec("1403", 2).items()}
usmrc24 = {y: int(v) for y, v in sloupec("1403", 3).items()}
u1 = max(usmrc30)
umax = max(usmrc30, key=usmrc30.get)
log("SILNICE usmrceni do 30 dnu", 1989, usmrc30[1989], f"{usmrc30[1989] / obyv[1989] * 1e5:.1f}/100k", "| vrchol", umax,
    usmrc30[umax], "|", u1, usmrc30[u1], f"{usmrc30[u1] / obyv[u1] * 1e5:.1f}/100k",
    "| pokles %", round(100 * (1 - usmrc30[u1] / usmrc30[1989]), 1))
log("SILNICE zemreli do 24 h", 1989, usmrc24[1989], "| 2025", usmrc24[2025])

# ---------- 5) vězni (ČSÚ Tab. 14.02) + amnestie 1990 ----------
vez = {y: int(v) for y, v in sloupec("1402", 3).items()}
vez100 = {y: v / obyv[y] * 1e5 for y, v in vez.items()}
vmx = max((y for y in vez if y > 1989), key=lambda y: vez100[y])
log("VEZNI k 31.12.", 1989, vez[1989], round(vez100[1989], 1), "| 1990", vez[1990], round(vez100[1990], 1),
    "| pokles 1989→1990 %", round(100 * (1 - vez[1990] / vez[1989]), 1),
    "| vrchol po 1989", vmx, vez[vmx], round(vez100[vmx], 1), "| 2025", vez[2025], round(vez100[2025], 1))
log("VEZNI 1999 vs 1989", vez[1999], ">", vez[1989], vez[1999] > vez[1989])
log("VEZNI 2025/1989 na 100k", round(vez100[2025] / vez100[1989], 3))
hp = "\n".join(pdf_text(A / "kriminalita/vezenska-sluzba/20261114/historicka-penologie-2019-1.pdf"))
hp = re.sub(r"\s+", " ", hp)
m1 = re.search(r"Do 21\. ledna 1990 bylo propuštěno celkem (\d+ \d+) obviněných a odsouzených", hp)
m2 = re.search(r"nacházelo ve vězeňských zařízeních (\d+ \d+) osob.*?poklesl celkový stav na (\d+ \d+) osob", hp)
log("AMNESTIE 1.1.1990: propusteno do 21.1.1990", m1.group(1), "| stav pred", m2.group(1), "| po", m2.group(2))
_, vzn = eu_tab("9.3")
log("VEZNI na 100k 2024 (ČSÚ tab. 9.3)", {k: v[-1] for k, v in vzn.items()})
poradi_eu = sorted(vzn, key=lambda k: -vzn[k][-1])
log("VEZNI 2024 poradi Ceska mezi", len(poradi_eu), "zememi EU v tab. 9.3:", poradi_eu.index("Česko") + 1,
    "| pred Ceskem:", poradi_eu[:poradi_eu.index("Česko")])

# ---------- 6) průzkumy CVVM ----------
ob = re.sub(r"\s+", " ", "\n".join(pdf_text(A / "pruzkumy/cvvm-pocit-bezpeci/20261114/ob250711.pdf")))
m = re.search(r"cítí téměř devět z deseti občanů \((\d+) %\), v tom (\d+) % „rozhodně ano“ a (\d+) % „spíše ano“", ob)
m2 = re.search(r"rozhodně bezpečně se v místě bydliště cítí (\d+) % respondentů a další (\d+) %", ob)
log("CVVM 2025 pocit bezpeci v CR", m.group(1), "(rozhodně", m.group(2), "spíše", m.group(3), ")",
    "| v miste bydliste", int(m2.group(1)) + int(m2.group(2)), "(rozhodně", m2.group(1), "spíše", m2.group(2), ")")
pd = "\n".join(pdf_text(A / "pruzkumy/cvvm-listopad-1989/20261114/pd241111.pdf"))
t4 = pd[pd.index("Tabulka 4: Zlepšení/zhoršení"):]
roky4 = [int(x) for x in re.search(r"\n\s*((?:\d{4} ?){5})\n", t4).group(1).split()]
tab4 = {}
for line in t4.splitlines():
    mm = re.match(r"^(.+?) ((?:\d+/\d+ ?){5})\s*$", line.strip())
    if mm:
        tab4[mm.group(1).strip()] = [tuple(int(z) for z in p.split("/")) for p in mm.group(2).split()]
bez = tab4["Bezpečnost občanů, kriminalita"]
log("CVVM tab4 bezpecnost lepsi/horsi", dict(zip(roky4, bez)))
log("CVVM tab4 2024 horsi > lepsi jen u", [k for k, v in tab4.items() if v[-1][1] > v[-1][0]])

# =================== GRAFY ===================


def spec(title, subtitle, values, layers, source, height=None, step=None):
    s = {"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
         "title": {"text": title, "subtitle": subtitle}, "width": "container",
         "config": {"view": {"stroke": None}}, "data": {"values": values}, "layer": layers, "_source": source}
    if height:
        s["height"] = height
    if step:
        s["height"] = {"step": step}
    return s


AX_NONE = {"title": None, "domain": False, "ticks": False}

# --- G1 trestné činy 1973–2025
v1 = [dict(rok=y, tc=tc[y], t=f"{cz(tc[y])} trestných činů",
           ob=(f"{iksp[y]['objasnenost']:.1f} %".replace(".", ",") if y in iksp else "–")) for y in sorted(tc)]
body = [dict(rok=R0, tc=tc[R0], l=f"1989: {cz(tc[R0])}", c="t"), dict(rok=RV, tc=tc[RV], l=f"{RV}: {cz(tc[RV])}", c="v"),
        dict(rok=R1, tc=tc[R1], l=f"{R1}: {cz(tc[R1])}", c="d")]
x1 = {"field": "rok", "type": "quantitative", "scale": {"domain": [1973, 2025]},
      "axis": {**AX_NONE, "format": "d", "grid": False, "values": [1973, 1989, 1999, 2010, 2025], "labelFontSize": 11}}
y1 = {"field": "tc", "type": "quantitative", "scale": {"domain": [0, 480000]},
      "axis": {**AX_NONE, "grid": True, "gridColor": MUTED, "values": [0, 100000, 200000, 300000, 400000],
               "labelExpr": "datum.value == 0 ? '0' : format(datum.value / 1000, 'd') + ' tis.'"}}
tt1 = [{"field": "rok", "title": "Rok"}, {"field": "t", "title": "Zjištěno"}, {"field": "ob", "title": "Objasněnost"}]
g1 = spec(f"Policie {{dnes|{CRIMSON}}} registruje o 60{NBSP}% méně trestných činů než v roce 1999, ale víc než v roce {{1989|{BLUE}}}",
          f"Trestné činy zjištěné policií v Česku za rok, 1973–{R1}; do roku 1989 je registrovala Veřejná bezpečnost podle tehdejšího trestního zákona",
          v1, [
              {"mark": {"type": "area", "color": INK, "opacity": 0.08, "line": {"color": INK, "strokeWidth": 2.2}},
               "encoding": {"x": x1, "y": y1, "tooltip": tt1}},
              {"mark": {"type": "rule", "strokeDash": [3, 3], "color": GREY}, "data": {"values": [{"rok": 1989.9}]},
               "encoding": {"x": {"field": "rok", "type": "quantitative"}}},
              {"mark": {"type": "text", "align": "left", "dx": 4, "dy": 0, "fontSize": 10, "color": "#333333"},
               "data": {"values": [{"rok": 1989.9, "tc": 30000, "l": "listopad 1989"}]},
               "encoding": {"x": {"field": "rok", "type": "quantitative"}, "y": {"field": "tc", "type": "quantitative"},
                            "text": {"field": "l"}}},
              {"mark": {"type": "circle", "size": 70, "opacity": 1}, "data": {"values": body},
               "encoding": {"x": {"field": "rok", "type": "quantitative"}, "y": {"field": "tc", "type": "quantitative"},
                            "color": {"field": "c", "type": "nominal", "legend": None,
                                      "scale": {"domain": ["t", "v", "d"], "range": [BLUE, INK, CRIMSON]}}}},
              {"mark": {"type": "text", "fontSize": 11, "fontWeight": 700, "dy": -12, "align": "center"},
               "data": {"values": body},
               "encoding": {"x": {"field": "rok", "type": "quantitative"}, "y": {"field": "tc", "type": "quantitative"},
                            "text": {"field": "l"},
                            "color": {"field": "c", "type": "nominal", "legend": None,
                                      "scale": {"domain": ["t", "v", "d"], "range": [BLUE, INK, CRIMSON]}}}},
          ], source="IKSP, [Trendy kriminality 2023, příloha 1](https://iksp.gov.cz/storage/169/Trendy-kriminality-v-Ceske-republice-v-roce-2023-z-pohledu-statistiky-Policie-CR_Diblikova.pdf); ČSÚ Tab. 14.01",
          height=260)
# popisky krajních bodů posunout dovnitř grafu, aby se na mobilu neusekly
g1["layer"][4]["encoding"]["x"] = {"field": "rok", "type": "quantitative"}
g1["layer"][4]["transform"] = [{"calculate": "datum.c == 't' ? 'left' : (datum.c == 'd' ? 'right' : 'center')", "as": "al"}]
g1["layer"][4]["mark"]["align"] = {"expr": "datum.al"}
g1["layer"][4]["transform"] = [{"calculate": "datum.c == 'v' ? 'center' : (datum.c == 'd' ? 'right' : 'center')", "as": "al"}]
g1["layer"][4]["mark"]["dx"] = {"expr": "datum.c == 'd' ? 4 : 0"}
g1["layer"][4]["mark"]["dy"] = {"expr": "datum.c == 'v' ? -12 : 18"}

# --- G2 druhy kriminality: změna na 100 000 obyvatel 2000 → 2025
y2 = {"field": "druh", "type": "nominal", "sort": None, "axis": None, "scale": {"paddingInner": 0.5, "paddingOuter": 0.5}}
dom2 = [-100, 125]
tt2 = [{"field": "druh", "title": "Druh"}, {"field": "t2000", "title": "2000"}, {"field": "t2025", "title": "2025"},
       {"field": "l", "title": "Změna na 100 000 obyv."}]
krad = next(d for d in v2 if d["druh"] == "Prosté krádeže")
mrav = next(d for d in v2 if d["druh"] == "Mravnostní kriminalita")
g2 = spec(f"Prostých krádeží je o {{{abs(krad['zmena'])}{NBSP}% méně|{BLUE}}} než v roce 2000, mravnostních činů {{víc|{CRIMSON}}}",
          f"Změna počtu registrovaných trestných činů na 100{NBSP}000 obyvatel mezi lety 2000 a {R1}; od roku 2010 platí nový trestní zákoník, skupiny se dají srovnat jen přibližně",
          v2, [
              {"mark": {"type": "bar", "height": {"band": 0.75}},
               "encoding": {"y": y2, "x": {"field": "x0", "type": "quantitative", "scale": {"domain": dom2},
                                            "axis": {**AX_NONE, "grid": True, "gridColor": MUTED, "values": [-100, -50, 0, 50, 100],
                                                     "labelExpr": "datum.value == 0 ? '0' : (datum.value > 0 ? '+' : '−') + abs(datum.value) + ' %'"}},
                            "x2": {"field": "x1"},
                            "color": {"field": "smer", "type": "nominal", "legend": None,
                                      "scale": {"domain": ["méně", "víc"], "range": [BLUE, CRIMSON]}},
                            "tooltip": tt2}},
              {"transform": [{"filter": "datum.zmena < 0"}],
               "mark": {"type": "text", "align": "left", "dx": 5, "fontSize": 11, "fontWeight": 700, "color": INK},
               "encoding": {"y": y2, "x": {"datum": 0, "type": "quantitative"}, "text": {"field": "l"}}},
              {"transform": [{"filter": "datum.zmena > 0"}],
               "mark": {"type": "text", "align": "left", "dx": 5, "fontSize": 11, "fontWeight": 700, "color": INK},
               "encoding": {"y": y2, "x": {"field": "x1", "type": "quantitative"}, "text": {"field": "l"}}},
              {"mark": {"type": "text", "align": "left", "baseline": "bottom", "dy": -9, "fontSize": 12, "color": "#333333"},
               "encoding": {"y": y2, "x": {"datum": dom2[0], "type": "quantitative"}, "text": {"field": "druh"}}},
          ], source="Policie ČR, [výkaz kriminality 2000](https://archiv.policie.gov.cz/clanek/archiv-statistiky-statisticke-prehledy-kriminality.aspx) a [sestava 2025](https://archiv.policie.gov.cz/clanek/statisticke-prehledy-kriminality-za-rok-2025.aspx)",
          step=46)

# --- G3 vězni na 100 000 obyvatel 1989–2025
v3 = [dict(rok=y, n=round(vez100[y], 1), t=f"{cz(vez[y])} vězňů", t2=f"{cz(vez100[y], 0)} na 100{NBSP}000 obyv.")
      for y in sorted(vez)]
b3 = [dict(rok=1989, n=round(vez100[1989], 1), l=f"1989: {cz(vez100[1989], 0)}", c="t", al="left", dx=-6, dy=-12),
      dict(rok=1990, n=round(vez100[1990], 1), l=f"1990: {cz(vez100[1990], 0)}", c="v", al="left", dx=8, dy=10),
      dict(rok=vmx, n=round(vez100[vmx], 1), l=f"{vmx}: {cz(vez100[vmx], 0)}", c="v", al="center", dx=0, dy=-12),
      dict(rok=2025, n=round(vez100[2025], 1), l=f"2025: {cz(vez100[2025], 0)}", c="d", al="right", dx=4, dy=-12)]
x3 = {"field": "rok", "type": "quantitative", "scale": {"domain": [1989, 2025]},
      "axis": {**AX_NONE, "format": "d", "grid": False, "values": [1989, 1999, 2010, 2025], "labelFontSize": 11}}
y3 = {"field": "n", "type": "quantitative", "scale": {"domain": [0, 270]},
      "axis": {**AX_NONE, "grid": True, "gridColor": MUTED, "values": [0, 50, 100, 150, 200, 250]}}
enc_b = {"x": {"field": "rok", "type": "quantitative"}, "y": {"field": "n", "type": "quantitative"}}
col_b = {"field": "c", "type": "nominal", "legend": None, "scale": {"domain": ["t", "v", "d"], "range": [BLUE, INK, CRIMSON]}}
g3 = spec(f"Po amnestii v roce 1990 vězňů ubylo skoro o dvě třetiny, za devět let jich bylo víc než v roce {{1989|{BLUE}}}",
          f"Vězni (obvinění ve vazbě a odsouzení) na 100{NBSP}000 obyvatel k 31. prosinci, 1989–{max(vez)}; od roku 2010 včetně chovanců v zabezpečovací detenci",
          v3, [
              {"mark": {"type": "line", "color": INK, "strokeWidth": 2.2, "point": False},
               "encoding": {"x": x3, "y": y3, "tooltip": [{"field": "rok", "title": "Rok"}, {"field": "t", "title": "Vězni"},
                                                          {"field": "t2", "title": "Na počet obyvatel"}]}},
              {"mark": {"type": "circle", "size": 70, "opacity": 1}, "data": {"values": b3},
               "encoding": {**enc_b, "color": col_b}},
              {"mark": {"type": "text", "fontSize": 11, "fontWeight": 700, "align": {"expr": "datum.al"},
                        "dx": {"expr": "datum.dx"}, "dy": {"expr": "datum.dy"}},
               "data": {"values": b3}, "encoding": {**enc_b, "text": {"field": "l"}, "color": col_b}},
          ], source="Vězeňská služba ČR podle ČSÚ, [Česko od roku 1989 v číslech, Tab. 14.02](https://csu.gov.cz/produkty/cesko-od-roku-1989-v-cislech-aktualizace-27-8-2026)",
          height=240)

# --- G4 CVVM: bezpečnost dnes lepší / horší než před 1989 (2014–2024)
v4 = []
for y, (le, ho) in zip(roky4, bez):
    v4 += [dict(rok=y, hod="lepší", p=le, l=f"{le}{NBSP}%"), dict(rok=y, hod="horší", p=ho, l=f"{ho}{NBSP}%")]
x4 = {"field": "rok", "type": "quantitative", "scale": {"domain": [2013.3, 2024.7]},
      "axis": {**AX_NONE, "format": "d", "grid": False, "values": roky4, "labelFontSize": 11}}
y4 = {"field": "p", "type": "quantitative", "scale": {"domain": [0, 75]}, "axis": None}
c4 = {"field": "hod", "type": "nominal", "legend": None, "scale": {"domain": ["lepší", "horší"], "range": [CRIMSON, BLUE]}}
g4 = spec(f"Bezpečnost proti době před rokem 1989 hodnotí {{hůř|{BLUE}}} 42{NBSP}% lidí, v roce 2014 to bylo 60{NBSP}%",
          "Je dnes situace lidí jako vy v oblasti bezpečnosti občanů a kriminality lepší, nebo horší než před rokem 1989? Odpovědi „mnohem či trochu lepší“ a „trochu či mnohem horší“ v %",
          v4, [
              {"mark": {"type": "line", "strokeWidth": 2.5, "point": {"size": 60, "filled": True}},
               "encoding": {"x": x4, "y": y4, "color": c4,
                            "tooltip": [{"field": "rok", "title": "Rok"}, {"field": "hod", "title": "Hodnocení"},
                                        {"field": "l", "title": "Podíl"}]}},
              {"mark": {"type": "text", "fontSize": 11, "fontWeight": 700, "dy": -12},
               "encoding": {"x": x4, "y": y4, "text": {"field": "l"}, "color": c4}},
              {"mark": {"type": "text", "fontSize": 12, "fontWeight": 700, "align": "center"},
               "data": {"values": [{"rok": 2021.5, "p": 51, "hod": "horší"}, {"rok": 2021.5, "p": 23, "hod": "lepší"}]},
               "encoding": {"x": {"field": "rok", "type": "quantitative"}, "y": {"field": "p", "type": "quantitative"},
                            "text": {"field": "hod"}, "color": c4}},
          ], source="CVVM SOÚ AV ČR, [Třicet pět let od sametové revoluce](https://cvvm.soc.cas.cz/images/articles/files/5889/pd241111.pdf), tab. 4; 2024: 922 respondentů 15+",
          height=220)

DATA.mkdir(exist_ok=True)
for name, sp_ in [("trestne-ciny", g1), ("druhy-kriminality", g2), ("vezni", g3), ("cvvm-bezpecnost", g4)]:
    (DATA / f"{name}.json").write_text(json.dumps(sp_, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(HERE / "vystup.txt").write_text("\n".join(out) + "\n", encoding="utf-8")
print("\n".join(out))
