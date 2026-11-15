"""Kapitola „Peníze“ speciálu Jací jsme byli, jací jsme (1989 × 2026).

Všechna čísla v textu i v grafech počítá tenhle skript z primárních tabulek ČSÚ:
  ČSÚ, Česko od roku 1989 v číslech, aktualizace 27. 8. 2026
  https://csu.gov.cz/produkty/cesko-od-roku-1989-v-cislech-aktualizace-27-8-2026
  archiv: csu-data/souhrn/cesko-od-1989/20260827/data/32018126_XXXX.xlsx
Tabulky: 13.07 (mzdy, důchody), 13.08 (indexy reálné mzdy a důchodu), 13.11 (minimální mzda),
05.04 (rozdělení mezd), 03.01 (struktura výdajů domácností), 03.04 (inflace a ceny).

Spuštění:  python grafy.py   → ../data/*.json (Vega-Lite) + vystup.txt (čísla do textu)
"""
import json
import os
import re
from pathlib import Path

import openpyxl

from ikony import tvar

SADA = Path("souhrn/cesko-od-1989/20260827/data")
HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "data"
CRIMSON, BLUE, INK, MUTED, GRID = "#de1743", "#6267a3", "#101432", "#c9c9bd", "#d4d4c8"
NBSP = " "
ZDROJ_URL = "https://csu.gov.cz/produkty/cesko-od-roku-1989-v-cislech-aktualizace-27-8-2026"


# ---------- načtení dat (funkce převzaté z pilota 02_dvojice.py) ----------
def najdi_archiv() -> Path:
    if os.environ.get("CSU_DATA"):
        return Path(os.environ["CSU_DATA"])
    for p in Path(__file__).resolve().parents:
        for kandidat in (p / "csu-data", p / "statisticka-data" / "cesko"):
            if kandidat.exists():
                return kandidat
    raise SystemExit("Archiv csu-data nenalezen – nastav CSU_DATA")


DATA = najdi_archiv() / SADA
_cache = {}


def list_(tab, sheet=0):
    k = (tab, sheet)
    if k not in _cache:
        wb = openpyxl.load_workbook(DATA / f"32018126_{tab}.xlsx", data_only=True)
        _cache[k] = [list(r) for r in wb.worksheets[sheet].iter_rows(values_only=True)]
    return _cache[k]


def rok(v):
    m = re.match(r"\s*((19|20)\d\d)", str(v)) if v is not None else None
    return int(m.group(1)) if m else None


def num(v):
    return float(v) if isinstance(v, (int, float)) and not isinstance(v, bool) else None


def radek(tab, popisek, n=0, po=None):
    """Tabulka s roky v záhlaví sloupců. Vrátí {rok: hodnota} n-tého řádku, jehož
    popisek začíná textem `popisek` (volitelně až za řádkem začínajícím `po`)."""
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


def sloupec(tab, j, od_radku=0, do_radku=None):
    """Tabulka s roky v prvním sloupci. Vrátí {rok: hodnota} sloupce j."""
    out = {}
    for r in list_(tab)[od_radku:do_radku]:
        y = rok(r[0]) if r and not isinstance(r[0], float) else None
        if y and len(r) > j and num(r[j]) is not None:
            out[y] = num(r[j])
    return out


# ---------- formátování a výpis ----------
vystup = []


def log(*a):
    vystup.append(" ".join(str(x) for x in a))


def cz(x, d=0):
    s = f"{x:,.{d}f}".replace(",", NBSP).replace(".", ",")
    return s


def spec(title, subtitle, values, layers, source, height=None, step=None, **extra):
    s = {"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
         "title": {"text": title, "subtitle": subtitle},
         "width": "container",
         "config": {"view": {"stroke": None}}, "data": {"values": values}, "layer": layers, "_source": source}
    if height is not None:
        s["height"] = height
    if step is not None:
        s["height"] = {"step": step}
    s.update(extra)
    return s


ZDROJ = lambda tabs: f"ČSÚ, [Česko od roku 1989 v číslech, Tab. {tabs}]({ZDROJ_URL}); výpočet DataTimes"

# =====================================================================
# 1. Mzdy, reálná mzda, důchody (Tab. 13.07, 13.08)
# =====================================================================
hruba = sloupec("1307", 2)
cista = sloupec("1307", 3)
duchod = sloupec("1307", 1)
rel_hruba = sloupec("1307", 4)
rel_cista = sloupec("1307", 5)
R0, R1 = 1989, max(cista)

log("== MZDY A DŮCHODY (Tab. 13.07) ==")
log("Hrubá mzda", R0, hruba[R0], "→", R1, hruba[R1], "nominálně ×", round(hruba[R1] / hruba[R0], 2))
log("Čistá mzda", R0, cista[R0], "→", R1, cista[R1], "nominálně ×", round(cista[R1] / cista[R0], 2))
log("Průměrný starobní důchod", R0, duchod[R0], "→", R1, duchod[R1], "nominálně ×", round(duchod[R1] / duchod[R0], 2))
log("Důchod / hrubá mzda %", R0, rel_hruba[R0], "→", R1, rel_hruba[R1],
    "| minimum", min(rel_hruba, key=rel_hruba.get), min(rel_hruba.values()),
    "| maximum", max(rel_hruba, key=rel_hruba.get), max(rel_hruba.values()))
log("Důchod / čistá mzda %", R0, rel_cista[R0], "→", R1, rel_cista[R1],
    "| minimum", min(rel_cista, key=rel_cista.get), min(rel_cista.values()))
log("Důchod / hrubá mzda %, roky 2021–2025:", {y: rel_hruba[y] for y in range(2021, 2026)})

# reálná mzda a reálný důchod: řetězení meziročních indexů (předchozí rok = 100), 1989 = 100
idx_mzda = sloupec("1308", 1)
idx_duch = sloupec("1308", 2)


def retez(idx):
    out = {1989: 100.0}
    for y in sorted(idx):
        out[y] = out[y - 1] * idx[y] / 100
    return out


real_mzda, real_duch = retez(idx_mzda), retez(idx_duch)
log("== REÁLNÁ MZDA (Tab. 13.08, 1989 = 100) ==")
for y in (1990, 1991, 1992, 1993, 2000, 2008, 2019, 2021, 2022, 2023, 2024, 2025):
    log("  ", y, "mzda", round(real_mzda[y], 1), "| důchod", round(real_duch[y], 1),
        "| meziročně mzda", idx_mzda.get(y), "důchod", idx_duch.get(y))
navrat = next(y for y in sorted(real_mzda) if y > 1991 and real_mzda[y] >= 100)
log("Reálná mzda se poprvé vrátila na úroveň 1989 v roce", navrat, round(real_mzda[navrat], 1))
log("Pokles reálné mzdy 1991: ", round(idx_mzda[1991] - 100, 1), "%; 1990–1991 celkem",
    round(real_mzda[1991] - 100, 1), "% proti 1989")
pokles_2223 = real_mzda[2023] / real_mzda[2021] - 1
log("Pokles reálné mzdy 2022–2023 proti 2021:", round(100 * pokles_2223, 1), "%")
navrat2 = next((y for y in sorted(real_mzda) if y > 2023 and real_mzda[y] >= real_mzda[2021]), None)
log("Reálná mzda 2025 vs. 2021:", round(real_mzda[2025] / real_mzda[2021], 3), "| návrat na úroveň 2021:", navrat2)
navrat_d = next(y for y in sorted(real_duch) if y > 1991 and real_duch[y] >= 100)
log("Reálný důchod: minimum", min(real_duch, key=real_duch.get), round(min(real_duch.values()), 1),
    "| poprvé zpět na úrovni 1989 v roce", navrat_d, round(real_duch[navrat_d], 1))
log("Reálná mzda 2025 = násobek 1989:", round(real_mzda[2025] / 100, 2), "| reálný důchod:", round(real_duch[2025] / 100, 2))

# inflace (Tab. 03.04, řádek Míra inflace v %)
infl = radek("0304", "Míra inflace")
cenova_hladina = 1.0
for y in range(1990, R1 + 1):
    cenova_hladina *= 1 + infl[y] / 100
log("== INFLACE (Tab. 03.04) ==")
log("Inflace 1991:", infl[1991], "| 2022:", infl[2022], "| 2023:", infl[2023], "| 2024:", infl[2024], "| 2025:", infl[2025])
log("Ceny 1989→2025 (součin ročních měr inflace 1990–2025): ×", round(cenova_hladina, 2))
top_infl = sorted(infl.items(), key=lambda kv: -kv[1])[:4]
log("Nejvyšší roční inflace:", top_infl)

# minimální mzda (Tab. 13.11): výše platná na konci roku (poslední úprava v roce) proti průměrné hrubé mzdě
minimalni = {}
for r in list_("1311"):
    y = rok(r[0])
    if y and num(r[1]):
        minimalni[y] = num(r[1])  # pozdější úprava v témž roce přepíše dřívější
roky_min = sorted(minimalni)
min_rok = {}
akt = None
for y in range(1991, R1 + 2):
    if y in minimalni:
        akt = minimalni[y]
    min_rok[y] = akt
pomer_min = {y: 100 * min_rok[y] / hruba[y] for y in range(1991, R1 + 1)}
log("== MINIMÁLNÍ MZDA (Tab. 13.11) ==")
log("Zavedena 1991 (únor):", minimalni[1991], "Kč | 1991 vůči průměrné hrubé mzdě", round(pomer_min[1991], 1), "%")
y_min = min(pomer_min, key=pomer_min.get)
log("Nejnižší poměr k průměrné mzdě:", y_min, round(pomer_min[y_min], 1), "% (", min_rok[y_min], "Kč vs.", hruba[y_min], ")")
log("Minimální mzda beze změny 2007–2013 (srpen):", min_rok[2007], min_rok[2012])
log(R1, ":", min_rok[R1], "Kč =", round(pomer_min[R1], 1), "% průměrné hrubé mzdy | 2026:", minimalni[2026], "Kč")

# =====================================================================
# 2. Rozdělení mezd (Tab. 05.04, Strukturální šetření mezd, od 1996)
# =====================================================================
log("== ROZDĚLENÍ MEZD (Tab. 05.04) ==")
rows = list_("0504")
# druhý blok tabulky (2010–2025) – záhlaví na řádku s „20102)“
i_hl = next(i for i, r in enumerate(rows) if r[1] is not None and str(r[1]).startswith("2010"))
hl = rows[i_hl]
sl = {rok(v): j for j, v in enumerate(hl) if rok(v)}
pasma = []
for r in rows[i_hl + 1:]:
    lab = str(r[0] or "").strip()
    m = re.match(r"(do|\d[\d ]*)\s*(?:až\s*([\d ]+)|10 000|a více)?", lab)
    if not lab or not (lab.startswith("do") or lab[0].isdigit()):
        if pasma:
            break
        continue
    nums = [int(x.replace(" ", "")) for x in re.findall(r"\d[\d ]*\d|\d", lab)]
    if lab.startswith("do"):
        lo, hi = 0, nums[0]
    elif "více" in lab:
        lo, hi = nums[0] - 1, None
    else:
        lo, hi = nums[0] - 1, nums[1]
    pasma.append((lab, lo, hi, {y: (num(r[j]) or 0.0) for y, j in sl.items()}))


def podil_pod(y, hranice):
    """Podíl zaměstnanců s hrubou mzdou pod hranicí – lineární interpolace uvnitř pásma."""
    s = 0.0
    for lab, lo, hi, v in pasma:
        if hi is not None and hi <= hranice:
            s += v[y]
        elif lo < hranice and (hi is None or hi > hranice):
            s += v[y] * (hranice - lo) / ((hi or lo * 2) - lo)
    return s


def median(y):
    kum = 0.0
    for lab, lo, hi, v in pasma:
        if kum + v[y] >= 50:
            return lo + (50 - kum) / v[y] * ((hi or lo * 2) - lo)
        kum += v[y]


def kvantil(y, q):
    """q-tý percentil hrubé mzdy: lineární interpolace uvnitř pásma (otevřené horní pásmo se nepoužívá)."""
    kum = 0.0
    for lab, lo, hi, v in pasma:
        if v[y] and kum + v[y] >= q:
            return lo + (q - kum) / v[y] * (hi - lo) if hi else None
        kum += v[y]


Y5 = max(sl)
log("Decily a medián (interpolace v pásmech ISPV, metodika od 2010):")
for yy in (2010, 2015, 2020, Y5):
    d1, med, d9 = kvantil(yy, 10), kvantil(yy, 50), kvantil(yy, 90)
    log(f"  {yy}: součet {sum(v[yy] for *_, v in pasma):.1f} % | D1 {d1:.0f} | medián {med:.0f} | D9 {d9:.0f}"
        f" | D9/D1 {d9 / d1:.2f} | průměr 13.07 {hruba[yy]:.0f} | medián/průměr {med / hruba[yy]:.3f}")
nad100 = sum(v[Y5] for lab, lo, hi, v in pasma if hi is None)
pod_prum = podil_pod(Y5, hruba[Y5])
log(Y5, "součet pásem", round(sum(v[Y5] for *_, v in pasma), 1), "%")
log(Y5, "medián hrubé mzdy (interpolace v pásmu)", round(median(Y5)), "Kč | průměr (Tab. 13.07)", hruba[Y5])
log(Y5, "podíl zaměstnanců pod průměrnou mzdou (interpolace)", round(pod_prum, 1), "%")
kum = 0.0
for lab, lo, hi, v in pasma:
    kum += v[Y5]
    if hi in (30000, 40000, 50000):
        log(Y5, f"přesný součet pásem do {hi} Kč:", round(kum, 1), "%")
log(Y5, "podíl nad 100 000 Kč", round(nad100, 1), "% | 2020:", round(sum(v[2020] for lab, lo, hi, v in pasma if hi is None), 1), "%")
r96 = next(r for r in rows if str(r[0] or "").strip().startswith("do 10 000"))
log("1996: do 10 000 Kč bralo", round(num(r96[1]), 1), "% zaměstnanců; průměrná hrubá mzda 1996", hruba[1996],
    "(pozn.: od 2010 změna metodiky, roky před 2010 nejsou srovnatelné)")

# =====================================================================
# 3. Struktura výdajů domácností (Tab. 03.01)
# =====================================================================
log("== STRUKTURA VÝDAJŮ DOMÁCNOSTÍ (Tab. 03.01) ==")
r_v = list_("0301")
konec1 = next(i for i, r in enumerate(r_v) if str(r[0] or "").startswith("Tab. 03.01.2"))
vyd_jidlo = sloupec("0301", 1, 0, konec1)
vyd_prumysl = sloupec("0301", 2, 0, konec1)
vyd_sluzby = sloupec("0301", 3, 0, konec1)
vyd_platby = sloupec("0301", 4, 0, konec1)
V1 = max(vyd_jidlo)
log("Stará řada (čistá peněžní vydání, %) 1989 →", V1)
log("  potraviny, nápoje a veřejné stravování", vyd_jidlo[1989], "→", vyd_jidlo[V1])
log("  průmyslové zboží", vyd_prumysl[1989], "→", vyd_prumysl[V1])
log("  služby", vyd_sluzby[1989], "→", vyd_sluzby[V1])
log("  platby a jiné výdaje", vyd_platby[1989], "→", vyd_platby[V1])
coicop_jidlo = sloupec("0301", 2, konec1)
coicop_bydleni = sloupec("0301", 5, konec1)
coicop_rekreace = sloupec("0301", 10, konec1)
coicop_strav = sloupec("0301", 12, konec1)
C1 = max(coicop_jidlo)
log("Nová řada COICOP (spotřební výdaje, %) 2017 →", C1, ": potraviny a nealko", coicop_jidlo[2017], "→", coicop_jidlo[C1],
    "| bydlení, energie", coicop_bydleni[2017], "→", coicop_bydleni[C1],
    "| rekreace a kultura", coicop_rekreace[2017], "→", coicop_rekreace[C1],
    "| stravování a ubytování", coicop_strav[2017], "→", coicop_strav[C1])

# =====================================================================
# 4. Košík z jedné výplaty (Tab. 03.04 ceny v prosinci × Tab. 13.07 průměrná čistá mzda)
# =====================================================================
log("== KOŠÍK Z JEDNÉ VÝPLATY (Tab. 03.04 × 13.07) ==")
KOSIK = [  # (řádek Tab. 03.04, krátký název, jednotka množství, ikona, skupina)
    ("Kuře kuchané celé", "Kuře", "kg", "meat", "zbozi"),
    ("Vejce slepičí", "Vejce", "ks", "egg", "zbozi"),
    ("Máslo čerstvé", "Máslo", "kg", "cube", "zbozi"),
    ("Pivo výčepní", "Pivo lahvové", "lahví", "beer", "zbozi"),
    ("Konzumní brambory", "Brambory", "kg", "paper-bag", "zbozi"),
    ("Mléko polotučné", "Mléko", "l", "milk", "zbozi"),
    ("Chléb konzumní kmínový", "Chléb", "kg", "bread", "zbozi"),
    ("Jednotlivé jízdné v MHD", "Jízdenka MHD", "jízdenek", "bus", "sluzby"),
    ("Vstupenka do kina", "Kino", "vstupenek", "movie", "sluzby"),
    ("Výměna dámských patníků", "Nové podpatky (opravna obuvi)", "oprav", "shoe", "sluzby"),
    ("Pánský kadeřník", "Pánský kadeřník", "stříhání", "scissors", "sluzby"),
]
kosik = []
for radek_nazev, nazev, jedn, ikona, skup in KOSIK:
    cena = radek("0304", radek_nazev)
    nasobek = 10 if radek_nazev.startswith("Vejce") else 1  # vejce: cena za 10 ks
    q0 = cista[R0] / cena[R0] * nasobek
    q1 = cista[R1] / cena[R1] * nasobek
    kosik.append(dict(nazev=nazev, jedn=jedn, ikona=ikona, skup=skup, cena0=cena[R0], cena1=cena[R1],
                      q0=q0, q1=q1, pomer=q1 / q0))
    log(f"  {nazev}: cena {cz(cena[R0], 2)} Kčs → {cz(cena[R1], 2)} Kč | čistá mzda koupí {cz(q0)} → {cz(q1)} {jedn}"
        f" | poměr {q1 / q0:.3f} | ikon {round(10 * q1 / q0)}")


def piktogram(polozky, title, subtitle, source):
    """Mřížka ikon: řádek 1989 = 10 šedých ikon (desetiny tehdejšího nákupu), řádek 2025 = karmínové ikony
    ve stejné jednotce. Nad každou položkou srozumitelný nadpis s přesnými čísly."""
    SL = 20  # ikon na řádek
    vals, nadpisy, roky_lab = [], [], []
    y = 0.0
    for p in polozky:
        y += 1.15
        nadpisy.append(dict(y=y - 0.42, text=f"{p['nazev']}: {cz(p['q0'])} → {cz(p['q1'])} {p['jedn']}"))
        for rok_, n, barva in ((R0, 10, "tehdy"), (R1, round(10 * p["pomer"]), "dnes")):
            radku = max(1, -(-n // SL))
            roky_lab.append(dict(y=y + 0.5, text=str(rok_), stav=barva))
            for i in range(n):
                vals.append(dict(polozka=p["nazev"], x=i % SL, y=y + 0.5 + i // SL, stav=barva, ikona=p["ikona"],
                                 t_rok=str(rok_),
                                 t_mnozstvi=f"{cz(p['q0'] if rok_ == R0 else p['q1'])} {p['jedn']}",
                                 t_cena=f"{cz(p['cena0'] if rok_ == R0 else p['cena1'], 2)} {'Kčs' if rok_ == R0 else 'Kč'}"))
            y += radku
    vyska = y + 0.3
    xs = {"type": "quantitative", "scale": {"domain": [-2.6, SL - 0.4]}, "axis": None}
    ys = {"type": "quantitative", "scale": {"domain": [0, vyska], "reverse": True, "nice": False, "zero": False}, "axis": None}
    tt = [{"field": "polozka", "title": "Položka"}, {"field": "t_rok", "title": "Rok"},
          {"field": "t_mnozstvi", "title": "Za průměrnou čistou mzdu"}, {"field": "t_cena", "title": "Cena za jednotku"}]
    vrstvy = []
    for ikona in sorted({p["ikona"] for p in polozky}):
        vrstvy.append({
            "transform": [{"filter": f"datum.ikona == '{ikona}'"}],
            "mark": {"type": "point", "shape": tvar(ikona), "filled": False, "strokeWidth": 1.7,
                     "strokeCap": "round", "strokeJoin": "round", "opacity": 1,
                     "size": {"expr": "pow(min(width / 23 * 0.86, 22), 2)"}},
            "encoding": {"x": {**xs, "field": "x"}, "y": {**ys, "field": "y"},
                         "color": {"field": "stav", "type": "nominal", "legend": None,
                                   "scale": {"domain": ["tehdy", "dnes"], "range": [MUTED, CRIMSON]}},
                         "tooltip": tt}})
    vrstvy.append({"data": {"values": nadpisy},
                   "mark": {"type": "text", "align": "left", "baseline": "middle", "fontSize": 12.5, "fontWeight": 700, "color": INK},
                   "encoding": {"x": {"datum": -2.6, **xs}, "y": {**ys, "field": "y"}, "text": {"field": "text"}}})
    vrstvy.append({"data": {"values": roky_lab},
                   "mark": {"type": "text", "align": "left", "baseline": "middle", "fontSize": 11},
                   "encoding": {"x": {"datum": -2.6, **xs}, "y": {**ys, "field": "y"}, "text": {"field": "text"},
                                "color": {"field": "stav", "type": "nominal", "legend": None,
                                          "scale": {"domain": ["tehdy", "dnes"], "range": ["#333333", CRIMSON]}}}})
    return spec(title, subtitle, vals, vrstvy, source, height=round(vyska * 24))


zbozi = sorted([p for p in kosik if p["skup"] == "zbozi"], key=lambda p: -p["pomer"])
sluzby = sorted([p for p in kosik if p["skup"] == "sluzby"], key=lambda p: -p["pomer"])
g_kosik = piktogram(
    zbozi,
    f"Z jedné výplaty {{dnes|{CRIMSON}}} koupíme šestkrát víc kuřat, chleba zhruba stejně",
    f"Kolik koupí průměrná čistá měsíční mzda: jedna ikona = desetina nákupu z roku 1989. "
    f"Ceny v prosinci, mzda {cz(cista[R0])}{NBSP}Kčs (1989) a {cz(cista[R1])}{NBSP}Kč ({R1})",
    ZDROJ("03.04 a 13.07"))
g_sluzby = piktogram(
    sluzby,
    f"Služby {{zdražily|{CRIMSON}}} víc než mzdy: za výplatu se ostříháme víc než třikrát méně často",
    f"Kolik služeb zaplatí průměrná čistá měsíční mzda: jedna ikona = desetina toho, co zaplatila v roce 1989. "
    f"Kadeřník do roku 2010 stříhání na sucho, potom s mytím",
    ZDROJ("03.04 a 13.07"))

# =====================================================================
# 5. Graf reálné mzdy a reálného důchodu (1989 = 100)
# =====================================================================
v_real = []
for y in sorted(real_mzda):
    v_real.append(dict(rok=y, rada="Reálná mzda", v=round(real_mzda[y], 1), t=f"{cz(real_mzda[y], 1)}"))
    v_real.append(dict(rok=y, rada="Reálný starobní důchod", v=round(real_duch[y], 1), t=f"{cz(real_duch[y], 1)}"))
popisky_real = [  # (bod, barva, dy, zarovnání)
    (dict(rok=1991, v=round(real_mzda[1991], 1), text=f"1991: {cz(real_mzda[1991], 0)}"), CRIMSON, 16, "left"),
    (dict(rok=2023, v=round(real_mzda[2023], 1), text=f"2023: {cz(real_mzda[2023], 0)}"), CRIMSON, 16, "right"),
    (dict(rok=R1, v=round(real_mzda[R1], 1), text=f"{cz(real_mzda[R1], 0)}"), CRIMSON, -10, "center"),
    (dict(rok=2005, v=round(real_mzda[2005], 1), text="mzda"), CRIMSON, -12, "right"),
    (dict(rok=2005, v=round(real_duch[2005], 1), text="starobní důchod"), BLUE, 18, "left"),
    (dict(rok=R1, v=round(real_duch[R1], 1), text=f"{cz(real_duch[R1], 0)}"), BLUE, 16, "right"),
]
log("== GRAF reálná mzda: popisky ==")
for p, *_ in popisky_real:
    log("  ", p)
x_rok = {"field": "rok", "type": "quantitative",
         "scale": {"domain": [1989, R1]},
         "axis": {"title": None, "format": "d", "grid": False, "domain": False, "ticks": False,
                  "values": [1989, 2000, 2010, 2020, R1], "labelFlush": True}}
y_idx = {"field": "v", "type": "quantitative", "scale": {"domain": [50, 215]},
         "axis": {"title": None, "grid": True, "gridColor": GRID, "domain": False, "ticks": False, "values": [50, 100, 150, 200]}}
g_real = spec(
    f"Reálná mzda je {{skoro dvojnásobná|{CRIMSON}}}, i když dvakrát prudce klesla",
    "Kupní síla průměrné hrubé mzdy a průměrného starobního důchodu očištěná o inflaci, rok 1989 = 100. "
    f"{R1} předběžně",
    v_real, [
        {"mark": {"type": "rule", "color": INK, "strokeDash": [3, 3], "strokeWidth": 1},
         "data": {"values": [{"v": 100}]}, "encoding": {"y": {**y_idx}}},
        {"mark": {"type": "line", "strokeWidth": 2.5, "interpolate": "monotone"},
         "encoding": {"x": x_rok, "y": y_idx,
                      "color": {"field": "rada", "type": "nominal", "legend": None,
                                "scale": {"domain": ["Reálná mzda", "Reálný starobní důchod"], "range": [CRIMSON, BLUE]}},
                      "tooltip": [{"field": "rada", "title": "Řada"}, {"field": "rok", "title": "Rok"}, {"field": "t", "title": "Index (1989 = 100)"}]}},
    ] + [{"data": {"values": [p]}, "mark": {"type": "text", "fontSize": 11, "fontWeight": 700, "color": c, "dy": dy, "align": al},
          "encoding": {"x": {**x_rok}, "y": {**y_idx}, "text": {"field": "text"}}} for p, c, dy, al in popisky_real],
    ZDROJ("13.08") + " (řetězení meziročních indexů)", height=280)

# =====================================================================
# 6. Graf: důchod a minimální mzda vůči průměrné mzdě
# =====================================================================
v_rel = []
for y in range(1989, R1 + 1):
    v_rel.append(dict(rok=y, rada="Průměrný starobní důchod", v=rel_hruba[y], t=f"{cz(rel_hruba[y], 1)} %"))
    if y >= 1991:
        v_rel.append(dict(rok=y, rada="Minimální mzda", v=round(pomer_min[y], 1), t=f"{cz(pomer_min[y], 1)} % ({cz(min_rok[y])} Kč)"))
y_pct = {"field": "v", "type": "quantitative", "scale": {"domain": [0, 65]},
         "axis": {"title": None, "grid": True, "gridColor": GRID, "domain": False, "ticks": False,
                  "values": [0, 20, 40, 60], "labelExpr": "datum.value + ' %'"}}
pop_rel = [  # názvy řad uprostřed, kde se čáry nekříží; hodnoty na konci a v minimu
    (dict(rok=2005, v=rel_hruba[2005], text="průměrný důchod"), BLUE, -12, "center"),
    (dict(rok=2009, v=round(pomer_min[2009], 1), text="minimální mzda"), CRIMSON, 18, "center"),
    (dict(rok=y_min, v=round(pomer_min[y_min], 1), text=f"{y_min}: {cz(pomer_min[y_min], 0)} %"), CRIMSON, 16, "center"),
    (dict(rok=R1, v=rel_hruba[R1], text=f"{cz(rel_hruba[R1], 0)} %"), BLUE, -12, "right"),
    (dict(rok=R1, v=round(pomer_min[R1], 1), text=f"{cz(pomer_min[R1], 0)} %"), CRIMSON, 18, "right"),
]
g_rel = spec(
    f"{{Minimální mzda|{CRIMSON}}} klesla na necelou čtvrtinu průměrné, {{důchod|{BLUE}}} drží kolem 40{NBSP}%",
    "Průměrný starobní důchod a minimální mzda jako podíl z průměrné hrubé měsíční mzdy, v %; "
    "minimální mzda od zavedení v roce 1991, výše platná na konci roku",
    v_rel, [
        {"mark": {"type": "line", "strokeWidth": 2.5},
         "encoding": {"x": x_rok, "y": y_pct,
                      "color": {"field": "rada", "type": "nominal", "legend": None,
                                "scale": {"domain": ["Průměrný starobní důchod", "Minimální mzda"], "range": [BLUE, CRIMSON]}},
                      "tooltip": [{"field": "rada", "title": "Řada"}, {"field": "rok", "title": "Rok"}, {"field": "t", "title": "Podíl z průměrné mzdy"}]}},
    ] + [{"data": {"values": [p]}, "mark": {"type": "text", "fontSize": 11, "fontWeight": 700, "color": c, "dy": dy, "align": al},
          "encoding": {"x": {**x_rok}, "y": {**y_pct}, "text": {"field": "text"}}} for p, c, dy, al in pop_rel],
    ZDROJ("13.07 a 13.11"), height=260)
log("== GRAF důchod a minimální mzda / průměrná mzda ==")
for p, *_ in pop_rel:
    log("  ", p)

# =====================================================================
# 7. Mzdy a důchody žen a mužů
#    - 1988 a 1996–2003: ČSÚ, Vývoj mezd v letech 1993–2003 (PDF), Tab. č. 5 (strukturální šetření mezd)
#      https://csu.gov.cz/docs/107508/4cbf5cdd-7e7d-bfa3-75e5-5afb33b76161/3111rr01t.pdf?version=1.0
#      archiv: mzdy/csu-vyvoj-mezd-1993-2004/20261114/3111rr01t.pdf
#    - 2025: ČSÚ, Struktura mezd zaměstnanců 2025 (ISPV), tab. A1 – https://csu.gov.cz/aktualni-produkt/41267
#      archiv: mzdy/csu-struktura-mezd-2025/20261114/data/11002626a01.xlsx
#    - důchody: Tab. 13.05 (starobní důchod „sólo“ = bez souběhu s vdovským/vdoveckým, prosinec), od 1996
#    - Eurostat earn_gr_gpgr2 (neočištěný rozdíl hodinových výdělků), archiv mzdy/eurostat-earn_gr_gpgr2/20261114
# =====================================================================
ZENY, MUZI = "#f76800", "#06677d"
ARCH = najdi_archiv()
URL_VYVOJ = "https://csu.gov.cz/docs/107508/4cbf5cdd-7e7d-bfa3-75e5-5afb33b76161/3111rr01t.pdf?version=1.0"
URL_ISPV = "https://csu.gov.cz/aktualni-produkt/41267"
log("== MZDY A DŮCHODY ŽEN A MUŽŮ ==")

import pypdf  # noqa: E402

text = "\n".join(p.extract_text() for p in pypdf.PdfReader(ARCH / "mzdy/csu-vyvoj-mezd-1993-2004/20261114/3111rr01t.pdf").pages)
tab5 = text[text.index("Tab. č. 5"):]
tab5 = tab5[:tab5.index("zdroj:")]


def cisla_radku(radek_txt):
    """'Muži 3 968 12 245 … 21983' → [3968, 12245, …, 21983]: skupiny tisíců jsou oddělené mezerou."""
    t = radek_txt.split()
    out, i = [], 0
    while i < len(t):
        if len(t[i]) <= 2 and i + 1 < len(t) and len(t[i + 1]) == 3:
            out.append(int(t[i] + t[i + 1])); i += 2
        else:
            out.append(int(t[i])); i += 1
    return out


radky5 = [l.strip() for l in tab5.splitlines()]
roky5 = [int(x) for x in radky5[1].split()[1:]]
i_pr = next(i for i, l in enumerate(radky5) if l.startswith("Průměrné mzdy"))
m_pr = dict(zip(roky5, cisla_radku(radky5[i_pr + 1].split(" ", 1)[1])))
z_pr = dict(zip(roky5, cisla_radku(radky5[i_pr + 2].split(" ", 1)[1])))
pomer_zdroj = dict(zip(roky5, [float(x.replace(",", ".")) for x in radky5[i_pr + 3].split()[2:]]))
i_med = next(i for i, l in enumerate(radky5) if l.startswith("Mediány mezd"))
m_med = dict(zip(roky5[1:], cisla_radku(radky5[i_med + 1].split(" ", 2)[2])))
z_med = dict(zip(roky5[1:], cisla_radku(radky5[i_med + 2].split(" ", 2)[2])))
for y in roky5:  # kontrola čtení PDF proti poměru, který uvádí ČSÚ
    assert abs(100 * z_pr[y] / m_pr[y] - pomer_zdroj[y]) < 0.06, (y, z_pr[y], m_pr[y], pomer_zdroj[y])
log("Průměrná hrubá mzda 1988 (strukturální šetření, Tab. č. 5): muži", m_pr[1988], "Kčs | ženy", z_pr[1988],
    "Kčs | ženy/muži", round(100 * z_pr[1988] / m_pr[1988], 1), "% | rozdíl", round(100 - 100 * z_pr[1988] / m_pr[1988], 1), "%")
for y in roky5[1:]:
    log(f"  {y}: průměr ženy/muži {100 * z_pr[y] / m_pr[y]:.1f} % | medián ženy/muži {100 * z_med[y] / m_med[y]:.1f} %")

wb = openpyxl.load_workbook(ARCH / "mzdy/csu-struktura-mezd-2025/20261114/data/11002626a01.xlsx", data_only=True)
a1 = [list(r) for r in wb.worksheets[0].iter_rows(values_only=True)]
r_cel = next(r for r in a1 if str(r[0] or "").replace(" ", "").startswith("CELKEM"))
r_spec = next(r for r in a1 if r[1] == "Specialisté")
r_ridici = next(r for r in a1 if r[1] == "Řídící pracovníci")
I25 = dict(pr_c=r_cel[9], pr_m=r_cel[10], pr_z=r_cel[11], med_c=r_cel[12], med_m=r_cel[13], med_z=r_cel[14])
log("ISPV 2025 (tab. A1):", I25)
log("  2025 průměr ženy/muži", round(100 * I25["pr_z"] / I25["pr_m"], 1), "% | rozdíl", round(100 - 100 * I25["pr_z"] / I25["pr_m"], 1),
    "% | medián ženy/muži", round(100 * I25["med_z"] / I25["med_m"], 1), "%")
pokles_rozdilu = 1 - (100 - 100 * I25["pr_z"] / I25["pr_m"]) / (100 - 100 * z_pr[1988] / m_pr[1988])
log("  rozdíl průměrů 1988 → 2025 se zmenšil o", round(100 * pokles_rozdilu, 1), "% (z", round(100 - 100 * z_pr[1988] / m_pr[1988], 1),
    "na", round(100 - 100 * I25["pr_z"] / I25["pr_m"], 1), "p. b.)")
log("  specialisté 2025: medián muži", r_spec[13], "ženy", r_spec[14], "→", round(100 * r_spec[14] / r_spec[13], 1), "%")
log("  řídící pracovníci 2025: podíl žen", round(100 * r_ridici[5] / r_ridici[3], 1), "% | medián ženy/muži",
    round(100 * r_ridici[14] / r_ridici[13], 1), "%")
log("  placený čas 2025 h/měs.: muži", round(r_cel[7], 1), "ženy", round(r_cel[8], 1))

# důchody podle pohlaví (Tab. 13.05): řádek „starobní – sólo“ v blocích Celkem / Muži / Ženy
r1305 = list_("1305")
hl = next(r for r in r1305 if isinstance(r[2], int))
sl1305 = {v: j for j, v in enumerate(hl) if isinstance(v, int)}
blok, duch_solo = None, {}
for r in r1305:
    if r[2] in ("Celkem", "Muži", "Ženy"):
        blok = r[2]
    elif blok and str(r[0] or "").strip() == "starobní" and str(r[1] or "").strip() == "sólo":
        duch_solo[blok] = {y: num(r[j]) for y, j in sl1305.items()}
D0, D1 = min(sl1305), max(sl1305)
pomer_duch = {y: 100 * duch_solo["Ženy"][y] / duch_solo["Muži"][y] for y in sl1305}
log("Starobní důchod sólo (Tab. 13.05):", D0, "muži", round(duch_solo["Muži"][D0]), "ženy", round(duch_solo["Ženy"][D0]),
    "→", round(pomer_duch[D0], 1), "% |", D1, "muži", round(duch_solo["Muži"][D1]), "ženy", round(duch_solo["Ženy"][D1]),
    "→", round(pomer_duch[D1], 1), "%")
log("  poměr ženy/muži po letech 2019–2025:", {y: round(pomer_duch[y], 1) for y in range(2019, D1 + 1)})
skok = max(range(D0 + 1, D1 + 1), key=lambda y: pomer_duch[y] - pomer_duch[y - 1])
log("  největší meziroční nárůst poměru:", skok, round(pomer_duch[skok - 1], 1), "→", round(pomer_duch[skok], 1), "%")

# Eurostat: neočištěný rozdíl hodinových výdělků
def eurostat(soubor):
    d = json.loads((ARCH / "mzdy/eurostat-earn_gr_gpgr2/20261114" / soubor).read_text(encoding="utf-8"))
    t = d["dimension"]["time"]["category"]["index"]
    g = d["dimension"]["geo"]["category"]["index"]
    out = {}
    for geo, gi in g.items():
        for rok_, ti in t.items():
            v = d["value"].get(str(gi * len(t) + ti))
            if v is not None:
                out.setdefault(geo, {})[int(rok_)] = v
    return out


gpg = eurostat("earn_gr_gpgr2_CZ.json")
gpg_sdg = eurostat("sdg_05_20_CZ.json")
gpg_vse = {k: v[2024] for k, v in eurostat("earn_gr_gpgr2_vse.json").items()}
EU_STATY = "AT BE BG CY CZ DE DK EE EL ES FI FR HR HU IE IT LT LU LV MT NL PL PT RO SE SI SK".split()
poradi = sorted([s for s in EU_STATY if s in gpg_vse], key=lambda s: -gpg_vse[s])
E1 = max(gpg["CZ"])
log("Eurostat GPG CZ: první rok sdg_05_20", min(gpg_sdg["CZ"]), gpg_sdg["CZ"][min(gpg_sdg["CZ"])], "% | první rok earn_gr_gpgr2",
    min(gpg["CZ"]), gpg["CZ"][min(gpg["CZ"])], "% |", E1, gpg["CZ"][E1], "% | EU27", gpg["EU27_2020"][E1], "%")
log("  pořadí EU", E1, ":", [(s, gpg_vse[s]) for s in poradi[:4]], "| Česko", poradi.index("CZ") + 1, "z", len(poradi))

# graf: ženy vs. muži (muži = 100), přímé popisky
RADKY_G = [
    ("Průměrná hrubá mzda 1988", m_pr[1988], z_pr[1988], "Kčs"),
    ("Průměrná hrubá mzda 2025", I25["pr_m"], I25["pr_z"], "Kč"),
    (f"Průměrný starobní důchod {D0}", duch_solo["Muži"][D0], duch_solo["Ženy"][D0], "Kč"),
    (f"Průměrný starobní důchod {D1}", duch_solo["Muži"][D1], duch_solo["Ženy"][D1], "Kč"),
]
KROK = 3.3
v_g, nad_g = [], []
for i, (lab, m, z, mena) in enumerate(RADKY_G):
    y0 = i * KROK
    nad_g.append(dict(y=y0 + 0.2, text=lab))
    p = 100 * z / m
    for poh, hodn, pct, yy in (("muži", m, 100.0, y0 + 1.05), ("ženy", z, p, y0 + 2.1)):
        v_g.append(dict(ukazatel=lab, pohlavi=poh, y=yy - 0.45, y2=yy + 0.45, yc=yy, x=round(pct, 1),
                        uvnitr=f"{poh} {cz(hodn)}{NBSP}{mena}", ven=f"{cz(pct, 1)}{NBSP}%" if poh == "ženy" else "",
                        t_castka=f"{cz(hodn)}{NBSP}{mena}", t_pomer=f"{cz(pct, 1)}{NBSP}% mužů" if poh == "ženy" else "100 %"))
    log("  graf:", lab, "muži", round(m), "ženy", round(z), "→", round(p, 1), "%")
vyska_g = len(RADKY_G) * KROK - 0.4
xg = {"type": "quantitative", "scale": {"domain": [0, 118]}, "axis": None}
yg = {"type": "quantitative", "scale": {"domain": [-0.4, vyska_g], "reverse": True, "nice": False, "zero": False}, "axis": None}
barva_poh = {"field": "pohlavi", "type": "nominal", "legend": None, "scale": {"domain": ["muži", "ženy"], "range": [MUZI, ZENY]}}
g_zeny = spec(
    f"Rozdíl mezi mzdami {{žen|{ZENY}}} a {{mužů|{MUZI}}} se od roku 1988 zmenšil o víc než třetinu",
    "Průměrná hrubá měsíční mzda a průměrný starobní důchod žen a mužů; délka pruhu: muži = 100 %. "
    f"Důchody bez souběhu s vdovským, řada začíná rokem {D0}. Šetření mezd 1988 a 2025 mají jinou metodiku",
    v_g, [
        {"mark": {"type": "rect", "cornerRadiusEnd": 2},
         "encoding": {"x": {**xg, "field": "x"}, "x2": {"datum": 0}, "y": {**yg, "field": "y"}, "y2": {"field": "y2"},
                      "color": barva_poh,
                      "tooltip": [{"field": "ukazatel", "title": "Ukazatel"}, {"field": "pohlavi", "title": "Pohlaví"},
                                  {"field": "t_castka", "title": "Částka"}, {"field": "t_pomer", "title": "Poměr"}]}},
        {"mark": {"type": "text", "align": "left", "baseline": "middle", "dx": 7, "fontSize": 12, "fontWeight": 700, "color": "#ffffff"},
         "encoding": {"x": {**xg, "datum": 0}, "y": {**yg, "field": "yc"}, "text": {"field": "uvnitr"}}},
        {"mark": {"type": "text", "align": "left", "baseline": "middle", "dx": 6, "fontSize": 12, "fontWeight": 700, "color": ZENY},
         "encoding": {"x": {**xg, "field": "x"}, "y": {**yg, "field": "yc"}, "text": {"field": "ven"}}},
        {"data": {"values": nad_g},
         "mark": {"type": "text", "align": "left", "baseline": "middle", "fontSize": 12.5, "fontWeight": 700, "color": INK},
         "encoding": {"x": {**xg, "datum": 0}, "y": {**yg, "field": "y"}, "text": {"field": "text"}}},
    ],
    f"ČSÚ: [mzdy 1988]({URL_VYVOJ}), [mzdy 2025]({URL_ISPV}), [důchody]({ZDROJ_URL})",
    height=round((vyska_g + 0.4) * 22))

OUT.mkdir(exist_ok=True)
for name, s in [("realna-mzda", g_real), ("kosik-zbozi", g_kosik), ("kosik-sluzby", g_sluzby), ("duchod-minimalni-mzda", g_rel),
                ("mzdy-zeny-muzi", g_zeny)]:
    (OUT / f"{name}.json").write_text(json.dumps(s, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
(HERE / "vystup.txt").write_text("\n".join(vystup) + "\n", encoding="utf-8")
print("\n".join(vystup))
