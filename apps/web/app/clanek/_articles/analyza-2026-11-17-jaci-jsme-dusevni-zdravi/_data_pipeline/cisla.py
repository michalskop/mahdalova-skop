"""Kapitola „Duševní zdraví“ speciálu Jací jsme byli, jací jsme (1989 × 2026).

Počítá všechna čísla kapitoly z primárních souborů v archivu statisticka-data/cesko
(sady v zdravotnictvi/<sada>/20261114/ se ZDROJ.txt, ČSÚ souhrn/cesko-od-1989/20260827).
Hodnoty opsané z PDF ročenek ÚZIS a z odborných textů jsou níže v bloku RUCNE
s odkazem na tabulku nebo stránku.

Spuštění:  python cisla.py && python grafy.py
Výstup:    cisla.json (pro grafy.py) + vystup.txt (každé číslo z textu, grafů a titulku)
"""
import csv
import collections
import json
import os
import re
import sys
from pathlib import Path

import openpyxl

sys.stdout.reconfigure(encoding="utf-8")
HERE = Path(__file__).resolve().parent
DAT = "20261114"


def najdi_archiv() -> Path:
    if os.environ.get("CSU_DATA"):
        return Path(os.environ["CSU_DATA"])
    for p in Path(__file__).resolve().parents:
        for kandidat in (p / "csu-data", p / "statisticka-data" / "cesko"):
            if kandidat.exists():
                return kandidat
    raise SystemExit("Archiv csu-data nenalezen – nastav CSU_DATA")


ARCH = najdi_archiv()
ZDR = ARCH / "zdravotnictvi"
CSU = ARCH / "souhrn" / "cesko-od-1989" / "20260827" / "data"
out = []
C = {}  # čísla pro grafy


def log(*a):
    out.append(" ".join(str(x) for x in a))


def cz(x, d=1):
    return f"{x:,.{d}f}".replace(",", " ").replace(".", ",")


# ---------- ČSÚ Tab. 01.01: obyvatelé k 31. 12. a sebevraždy (funkce radek jako v pilotu) ----------
_cache = {}


def list_(tab):
    if tab not in _cache:
        wb = openpyxl.load_workbook(CSU / f"32018126_{tab}.xlsx", data_only=True)
        _cache[tab] = [list(r) for r in wb.worksheets[0].iter_rows(values_only=True)]
    return _cache[tab]


def num(v):
    return float(v) if isinstance(v, (int, float)) and not isinstance(v, bool) else None


def radek(tab, popisek, n=0):
    """Tabulka s roky v záhlaví sloupců. Vrátí {rok: hodnota} n-tého řádku, jehož popisek začíná `popisek`."""
    rows = list_(tab)
    hlav = max(rows, key=lambda r: sum(isinstance(v, int) and 1900 < v < 2030 for v in r))
    roky = {j: v for j, v in enumerate(hlav) if isinstance(v, int) and 1900 < v < 2030}
    prvni = min(roky)
    sp = lambda s: re.sub(r"\s+", " ", s).strip()
    shody = [r for r in rows if sp(next((str(v) for v in r[:prvni] if v not in (None, "")), "")).startswith(sp(popisek))]
    r = shody[n]
    return {roky[j]: num(r[j]) for j in roky if j < len(r) and num(r[j]) is not None}


POP = {y: v * 1000 for y, v in radek("0101", "Počet obyvatel k 31. 12.").items()}
SEB = {**radek("0101", "Sebevraždy a sebepoškození"), **radek("0101", "Úmyslné sebepoškození")}
na100k = lambda n, y: n / POP[y] * 1e5

log("== SEBEVRAŽDY (ČSÚ Tab. 01.01; do 1993 MKN-9, od 1994 MKN-10 X60–X84, Y87.0)")
sy = max(SEB)
log("sebevrazdy pocet", 1989, int(SEB[1989]), "→", sy, int(SEB[sy]), "| 2023", int(SEB[2023]),
    "| skok 2023→2024 %", round(100 * (SEB[2024] / SEB[2023] - 1), 1))
log("sebevrazdy pokles 1989→2024 pocet %", round(100 * (1 - SEB[sy] / SEB[1989]), 1))
log("sebevrazdy minimum po 1989", min((v, y) for y, v in SEB.items() if y >= 1989))


# ---------- WHO Europe HFA ----------
def hfa(code):
    s = {}
    for r in csv.reader(open(ZDR / "who-europe-hfa" / DAT / f"{code}.csv", encoding="utf-8-sig")):
        if r and r[0] == "CZE":
            s[int(r[-2])] = float(r[-1])
    return s


sdr, sdr_m, sdr_z = hfa("HFA_176"), hfa("HFA_177"), hfa("HFA_178")
C["sdr"], C["sdr_m"], C["sdr_z"] = sdr, sdr_m, sdr_z
log("sebevrazdy SDR (WHO HFA_176) 1989", sdr[1989], "→ 2024", sdr[2024], "| 2023", sdr[2023], "| 2019", sdr[2019],
    "| pokles 1989→2024 %", round(100 * (1 - sdr[2024] / sdr[1989]), 1))
log("sebevrazdy SDR muzi 1989", sdr_m[1989], "→ 2024", sdr_m[2024], "| zeny", sdr_z[1989], "→", sdr_z[2024])
log("minimum SDR od 1989", min((v, y) for y, v in sdr.items() if y >= 1989))

inc = hfa("HFA_387")
prev = hfa("HFA_391")
C["incidence"], C["prevalence"] = inc, prev
log("== NOVE ZJISTENE DUSEVNI PORUCHY (WHO HFA_387 z dat ÚZIS, na 100 000)")
log("incidence 1993", inc[1993], "| 1994 (MKN-10)", inc[1994], "| 2023", inc[2023], "| násobek 1993→2023", round(inc[2023] / inc[1993], 2),
    "| 1994→2023", round(inc[2023] / inc[1994], 2))
log("prevalence lecenych % 2017 (srovnání s průzkumem NUDZ)", prev[2017])
log("prevalence lecenych % (HFA_391) 1998", prev[1998], "→ 2023", prev[2023], "| násobek", round(prev[2023] / prev[1998], 2))

# ---------- OECD Health Statistics ----------
OE = ZDR / "oecd-health-statistics" / DAT


def oecd(fn, **flt):
    s = {}
    for r in csv.DictReader(open(OE / fn, encoding="utf-8-sig")):
        if all(r[k] == v for k, v in flt.items()) and r["OBS_VALUE"]:
            s[int(r["TIME_PERIOD"])] = float(r["OBS_VALUE"])
    return s


ad = oecd("oecd_pharma_consumption_CZE.csv", PHARMACEUTICAL="N06A", UNIT_MEASURE="DDD_10P3HB")
C["antidepresiva"] = ad
log("== ANTIDEPRESIVA (OECD, DDD na 1 000 obyvatel a den)")
log("N06A 1989", ad[1989], "| 1993", ad[1993], "| 1994", ad[1994], "| 2000", ad[2000], "| 2010", ad[2010], "| 2024", ad[2024],
    "| násobek 1989→2024", round(ad[2024] / ad[1989], 1))
log("N06A 2024 = denní dávka pro % obyvatel", round(ad[2024] / 10, 1))
log("N06A roste každý rok od 1994:", all(ad[y] > ad[y - 1] for y in range(1994, max(ad) + 1)), "| 1989–1993", [ad[y] for y in range(1989, 1994)])
for atc, nm in [("N05B", "anxiolytika"), ("N05C", "hypnotika a sedativa")]:
    s = oecd("oecd_pharma_consumption_CZE.csv", PHARMACEUTICAL=atc, UNIT_MEASURE="DDD_10P3HB")
    log(atc, nm, 1989, s[1989], "→ 2024", s[2024])

ps = oecd("oecd_phys_cat_CZE.csv", HEALTH_PROF="EMPLPSYS", UNIT_MEASURE="PS")
dn = oecd("oecd_dentists_CZE.csv", UNIT_MEASURE="PS")
ph = oecd("oecd_physicians_CZE.csv", HEALTH_PROF="PHYS", UNIT_MEASURE="PS", HEALTH_PROF_ACTIVITY_STATUS="P")
bd = oecd("oecd_beds_function_CZE.csv", HEALTH_FUNCTION="_T", CARE_TYPE="PSY", UNIT_MEASURE="BD")
log("== PÉČE (OECD počet fyzických osob / lůžek ÷ ČSÚ obyvatelé k 31. 12. × 100 000)")
pece = []
for nazev, s, y0 in [("Psychiatři", ps, 1995), ("Zubní lékaři", dn, 1989), ("Lékaři celkem", ph, 1989),
                     ("Psychiatrická lůžka", bd, 1990)]:
    y1 = max(s)
    a, b = na100k(s[y0], y0), na100k(s[y1], y1)
    log(nazev, y0, int(s[y0]), f"({a:.1f}/100k)", "→", y1, int(s[y1]), f"({b:.1f}/100k)", "| změna %", round(100 * (b / a - 1), 1))
    pece.append(dict(nazev=nazev, r0=y0, v0=round(a, 1), r1=y1, v1=round(b, 1), zmena=round(100 * (b / a - 1), 1)))

# ČSÚ Tab. 13.01 – zubaři jinou metodikou (ÚZIS), řada od 1993
zub = radek("1301", "počet obyvatel na 1 zubního lékaře")
log("ČSÚ 13.01 obyvatel na 1 zubaře", min(zub), zub[min(zub)], f"(= {1e5 / zub[min(zub)]:.1f}/100k)", "→", max(zub),
    round(zub[max(zub)]), f"(= {1e5 / zub[max(zub)]:.1f}/100k)",
    "| OECD 1993 pro srovnání", f"{na100k(dn[1993], 1993):.1f}/100k")

# ---------- RUČNĚ OPSANÉ HODNOTY Z PDF (s odkazem) ----------
RUCNE = {
    # ÚZIS, Psychiatrická péče 2000 (uzis-psychiatricka-pece/20261114/psych2000.pdf)
    "hosp_1989": 50776,            # tab. 4.1, str. 27: propuštění a zemřelí z psych. lůžkových zařízení 1989
    "hosp_1989_100k": 490.0,       # tab. 4.1: totéž na 100 000 obyvatel
    "luzka_1990_lecebny": 12859,   # tab. 1.1, str. 18: lůžka psychiatrických léčeben 1990
    "luzka_1990_oddeleni": 1649,   # tab. 1.1, str. 19: lůžka psychiatrických oddělení nemocnic 1990
    "amb_uvazky_1990": 418.00,     # tab. 1.2, str. 20: lékařská místa v ambulantních psych. odděleních 1990 (vč. AT)
    # ÚZIS, Psychiatrická ročenka 2022 (uzis-psychiatricka-pece/20261114/psych2022.pdf)
    "hosp_2022_dlouhodobe": 25318,  # tab. 2.2: ukončené dlouhodobé hospitalizace 2022
    "hosp_2022_akutni": 31107,      # tab. 3.2/3.3: hospitalizační případy na akutních psych. lůžkách 2022
    "amb_uvazky_2022": 726.0,       # tab. 1.8: suma úvazků lékařů v psych. ambulancích 2022
    "amb_lekari_2022": 1298,        # tab. 1.8: unikátní počet lékařů v psych. ambulancích 2022
    "detsti_psych_lekari_2010": 127, "detsti_psych_lekari_2022": 151,  # tab. 1.8: dětská a dorostová psychiatrie
    "cdz_klienti_2022": 6257,       # kap. 6, tab. 6.1: unikátní klienti CDZ 2022; první CDZ od července 2018
    # ÚZIS, Dostupnost péče v CDZ (uzis-psychiatrie-analyzy/20261114/dostupnost-pece-cdz.pdf), kap. 2
    "cdz_pocet_2021": 29,           # „K 31. 8. 2021 bylo v ČR zřízeno 29 CDZ“
    # ČSÚ infografika Zdravotní péče (csu-infografika-zdravotni-pece/20261114/zdravotni pece.pdf)
    "obyv_na_klin_psychologa_2023": 5548,
    # Winkler a kol. 2020, Epidemiology and Psychiatric Sciences 29:e173 (nudz-prevalence-winkler2020), abstrakt
    "nudz_2017": 20.02, "nudz_2020": 29.63,
}
for k, v in RUCNE.items():
    log("RUČNĚ", k, v)
h22 = RUCNE["hosp_2022_dlouhodobe"] + RUCNE["hosp_2022_akutni"]
log("hospitalizace 1989", RUCNE["hosp_1989"], f"({RUCNE['hosp_1989_100k']}/100k) → 2022", h22, f"({na100k(h22, 2022):.1f}/100k)",
    "| změna na 100k %", round(100 * (na100k(h22, 2022) / RUCNE["hosp_1989_100k"] - 1), 1))
log("lůžka 1990 ročenka (léčebny + oddělení)", RUCNE["luzka_1990_lecebny"] + RUCNE["luzka_1990_oddeleni"], "× OECD", int(bd[1990]))
log("ambulantní úvazky psychiatrů 1990", RUCNE["amb_uvazky_1990"], "→ 2022", RUCNE["amb_uvazky_2022"],
    "| změna %", round(100 * (RUCNE["amb_uvazky_2022"] / RUCNE["amb_uvazky_1990"] - 1), 1))
pece.append(dict(nazev="Hospitalizace v psychiatrii", r0=1989, v0=RUCNE["hosp_1989_100k"], r1=2022, v1=round(na100k(h22, 2022), 1),
                 zmena=round(100 * (na100k(h22, 2022) / RUCNE["hosp_1989_100k"] - 1), 1)))
C["pece"] = pece

# ---------- NRHZS: pacienti psychiatrických ambulancí podle diagnóz ----------
amb = collections.defaultdict(int)       # (rok, skupina)
amb8 = collections.defaultdict(int)      # (rok, F80..F99 podrobně)
amb8v = collections.defaultdict(int)     # (rok, F84/F90, děti 0–17 / dospělí 18+)
DETI = {"66000003", "66004006", "66007010", "66011015", "66016017"}  # vek_kod_deti do 17 let
for r in csv.DictReader(open(ZDR / "nzis-ambulantni-pece-psychiatrie" / DAT / "Otevrena-data-OIS-04-03-ambulantni-pece-psychiatrie.csv",
                             encoding="utf-8-sig")):
    y, n = int(r["rok"]), int(r["pocet_pacientu"] or 0)
    amb[(y, r["zakladni_diagnoza"])] += n
    d8 = r["zakladni_diagnoza_podrobne_F8_F9"]
    if d8:
        amb8[(y, d8)] += n
        if d8 in ("F84", "F90"):
            amb8v[(y, d8, "0–17" if r["vek_kod_deti"] in DETI else "18+")] += n
Y0, Y1 = 2010, max(y for y, _ in amb)
celk = {y: sum(v for (yy, _), v in amb.items() if yy == y) for y in (Y0, 2023, Y1)}
log("== AMBULANTNÍ PSYCHIATRIE (NRHZS OIS-04-03, součet přes kraje poskytovatele)")
log("součet pacientů všech skupin", Y0, celk[Y0], "| 2023", celk[2023], f"({100 * celk[2023] / POP[2023]:.2f} % obyv.)", "|", Y1, celk[Y1],
    f"({100 * celk[Y1] / POP[Y1]:.2f} % obyv.)")
SKUP = [  # (popisek do grafu, klíč, zdroj)
    ("Poruchy autistického spektra", "F84", amb8),
    ("ADHD (hyperkinetické poruchy)", "F90", amb8),
    ("Obsedantně-kompulzivní porucha", "F42", amb),
    ("Demence a organické poruchy", "F00 a G30", amb),
    ("Poruchy příjmu potravy, spánku aj.", "F50–F59", amb),
    ("Úzkostné a stresové poruchy", "F40–F49 bez F42", amb),
    ("Drogy a jiné látky kromě alkoholu", "F11–F19", amb),
    ("Deprese", "F32–F33", amb),
    ("Schizofrenie a psychózy", "F20–F29", amb),
    ("Alkohol", "F10", amb),
]
diag = []
for lab, k, src in SKUP:
    a, b = src[(Y0, k)], src[(Y1, k)]
    ra, rb = na100k(a, Y0), na100k(b, Y1)
    diag.append(dict(diagnoza=lab, kod=k.replace(" a ", ", ").replace(" bez ", " bez "), n0=a, n1=b, r0=round(ra, 1), r1=round(rb, 1),
                     pomer=round(rb / ra, 2)))
    log("dg", k, lab, Y0, a, f"({ra:.1f}/100k)", "→", Y1, b, f"({rb:.1f}/100k)", "| poměr na 100k", round(rb / ra, 2),
        "| poměr počtů", round(b / a, 2))
diag.sort(key=lambda d: -d["pomer"])
C["diagnozy"] = diag
C["roky_dg"] = [Y0, Y1]
for k in ("F84", "F90"):
    for v in ("0–17", "18+"):
        a, b = amb8v[(Y0, k, v)], amb8v[(Y1, k, v)]
        log("dg věk", k, v, Y0, a, "→", Y1, b, "| poměr", round(b / a, 2) if a else "–")

# Antidepresiva – lidé s vydaným receptem (NRHZS OIS-04-16, unikátní pacienti)
adp = collections.defaultdict(int)
for r in csv.DictReader(open(ZDR / "nzis-lecba-psychofarmaky" / DAT / "Otevrena-data-OIS-04-16-lecba-psychofarmaky.csv", encoding="utf-8-sig")):
    if r["N06A"] == "1":
        adp[int(r["rok"])] += int(r["pocet_pacientu"] or 0)
a0, a1 = min(adp), max(adp)
log("== LIDÉ S ANTIDEPRESIVY NA RECEPT (NRHZS OIS-04-16)")
log("antidepresiva osob", a0, adp[a0], f"({100 * adp[a0] / POP[a0]:.2f} %)", "→", a1, adp[a1], f"({100 * adp[a1] / POP[a1]:.2f} %)")

# Poruchy příjmu potravy (NRHZS NR-04-25; sloupce: M 0–18, M 19+, Ž 0–18, Ž 19+, celkem 0–18, celkem 19+)
ws = openpyxl.load_workbook(ZDR / "nzis-poruchy-prijmu-potravy" / DAT / "Datovy-souhrn-NR-04-25-poruchy-prijmu-potravy-2026-02.xlsx",
                            data_only=True)["Data"]
ppp = {r[0]: [c for c in r[1:] if isinstance(c, int)] for r in ws.iter_rows(values_only=True) if isinstance(r[0], int) and 2000 < r[0] < 2030}
p0, p1 = min(ppp), max(ppp)
log("== PORUCHY PŘÍJMU POTRAVY (NRHZS NR-04-25)")
log("PPP dívky 0–18", p0, ppp[p0][2], "→", p1, ppp[p1][2], "| poměr", round(ppp[p1][2] / ppp[p0][2], 2))
log("PPP děti 0–18 celkem", p0, ppp[p0][4], "→", p1, ppp[p1][4], "| 2020", ppp[2020][4], "| 2021", ppp[2021][4])
log("PPP všichni", p0, ppp[p0][4] + ppp[p0][5], "→", p1, ppp[p1][4] + ppp[p1][5])

# Demence (NRHZS OIS-04-02, osoby 50+ s léčbou demence podle léků nebo diagnózy)
dem = collections.defaultdict(int)
for r in csv.DictReader(open(ZDR / "nzis-alzheimer-demence" / DAT / "Otevrena-data-OIS-04-02-alzheimerova-nemoc-neurcene-demence.csv",
                             encoding="utf-8-sig")):
    dem[int(r["rok"])] += int(r["demence_lecba"] or 0)
log("== DEMENCE (NRHZS OIS-04-02, osoby 50+ s léčbou)")
log("demence lecba", min(dem), dem[min(dem)], "→", max(dem), dem[max(dem)], "| poměr", round(dem[max(dem)] / dem[min(dem)], 2))
s65 = radek("0101", "Počet obyvatel k 31. 12.")  # jen kontrola, že tabulka sedí
log("kontrola obyvatelé 1989/2024 (tis.)", s65[1989], s65[2024])

(HERE / "cisla.json").write_text(json.dumps(C, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
(HERE / "vystup.txt").write_text("\n".join(out) + "\n", encoding="utf-8")
print("\n".join(out))
