"""Kapitola „Rodina“ speciálu Jací jsme byli, jací jsme – 1989 × 2026.

Všechna čísla v textu a v grafech počítá tenhle skript z primárních tabulek ČSÚ.

Zdroj: ČSÚ, Česko od roku 1989 v číslech, aktualizace 27. 8. 2026
  https://csu.gov.cz/produkty/cesko-od-roku-1989-v-cislech-aktualizace-27-8-2026
  balík: https://csu.gov.cz/docs/107508/bd0a22e6-1df1-a4f1-86db-dcbcba592a0a/320181260827_data.zip?version=1.2
  Tab. 01.01 Vybrané demografické údaje (1989–2025)
  Tab. 11.03 Kvalitativní ukazatele bydlení podle sčítání lidu, domů a bytů (1961–2021)
Archiv: csu-data/souhrn/cesko-od-1989/20260827/data/

Spuštění:  python cisla.py && python grafy.py
Výstup:    cisla.json (řady pro grafy) + vystup.txt (každé číslo použité v textu).
"""
import json
from decimal import ROUND_HALF_UP, Decimal
import os
import re
from pathlib import Path

import openpyxl

HERE = Path(__file__).resolve().parent
SADA = Path("souhrn/cesko-od-1989/20260827/data")


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


def list_(tab):
    if tab not in _cache:
        wb = openpyxl.load_workbook(DATA / f"32018126_{tab}.xlsx", data_only=True)
        _cache[tab] = [list(r) for r in wb.worksheets[0].iter_rows(values_only=True)]
    return _cache[tab]


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


# ---------------------------------------------------------------- řady
R = {
    "snatky": radek("0101", "Sňatky"),
    "snatky_na_1000": radek("0101", "Sňatky na 1 000"),
    "vek_nevest": radek("0101", "Průměrný věk svobodných nevěst"),
    "vek_zenichu": radek("0101", "Průměrný věk svobodných ženichů"),
    "rozvody": radek("0101", "Rozvody"),
    "rozv_0_1": radek("0101", "0-1"),
    "rozv_20plus": radek("0101", "20 a více"),
    "delka_manzelstvi": radek("0101", "Průměrná délka trvání manželství"),
    "rozv_s_detmi_pct": radek("0101", "Podíl rozvedených manželství"),
    "rozvodovost_pct": radek("0101", "Úhrnná rozvodovost"),
    "narozeni": radek("0101", "Živě narození"),
    "mimo_n": radek("0101", "z toho mimo manželství"),
    "mimo_pct": radek("0101", "z toho mimo manželství (v %)"),
    "matky_do19": radek("0101", "do 19 let"),
    "matky_nad40": radek("0101", "nad 40 let"),
    "vek_matky_prvni": radek("0101", "Průměrný věk matky při narození prvního"),
    "plodnost": radek("0101", "Úhrnná plodnost"),
    "upt": radek("0101", "z toho umělá přerušení těhotenství"),
    "stav_svobodni": radek("0101", "svobodní/é"),
    "stav_zenati": radek("0101", "ženatí/vdané"),
    "stav_rozvedeni": radek("0101", "rozvedení/é"),
    "stav_ovdoveli": radek("0101", "ovdovělí/é"),
    "deti_0_14_pct": radek("0101", "0 - 14", 1),
    # sčítání lidu (Tab. 11.03)
    "dom_jednotlivcu_pct": radek("1103", "Podíl domácností jednotlivců"),
    "osob_na_domacnost": radek("1103", "Průměrný počet osob v hospodařící domácnosti"),
}
# „z toho mimo manželství“ (počet) se nesmí splést s řádkem v % – kontrola:
assert R["mimo_n"][1989] == 10141 and round(R["mimo_pct"][1989], 1) == 7.9

out = []


def hr(x, d=1):
    """Zaokrouhlení half-up z desítkového zápisu hodnoty ČSÚ (19,45 → 19,5), stejně jako v textu."""
    return str(Decimal(str(x)).quantize(Decimal(1).scaleb(-d), rounding=ROUND_HALF_UP))


def log(*a):
    out.append(" ".join(str(x) for x in a))


def r1(x, d=1):
    return round(x, d)


def tehdy_dnes(klic, d=1, od=1989):
    s = R[klic]
    r0 = od if od in s else min(s)
    rN = max(s)
    log(f"{klic}: {r0} = {hr(s[r0], d)} → {rN} = {hr(s[rN], d)}")
    return r0, s[r0], rN, s[rN]


log("== TEHDY × DNES (Tab. 01.01, Tab. 11.03) ==")
for k, d in [("snatky", 0), ("vek_nevest", 1), ("vek_zenichu", 1), ("rozvody", 0), ("rozvodovost_pct", 1),
             ("delka_manzelstvi", 1), ("rozv_s_detmi_pct", 1), ("narozeni", 0), ("mimo_pct", 1),
             ("matky_do19", 0), ("matky_nad40", 0), ("vek_matky_prvni", 1), ("plodnost", 2), ("upt", 0),
             ("stav_svobodni", 1), ("stav_zenati", 1), ("stav_rozvedeni", 1), ("stav_ovdoveli", 1),
             ("deti_0_14_pct", 1), ("dom_jednotlivcu_pct", 1), ("osob_na_domacnost", 2)]:
    tehdy_dnes(k, d)

log("")
log("== KDY SE ZLOM STAL ==")
S = R["snatky"]
pokles = 1 - S[1995] / S[1990]
log(f"sňatky 1990 = {S[1990]:.0f} (maximum řady: {max(S, key=S.get)}), 1995 = {S[1995]:.0f}, pokles 1990→1995 o {100 * pokles:.1f} %")
log(f"sňatky 1995–2025: min {min(v for k, v in S.items() if k >= 1995):.0f} ({min((k for k in S if k >= 1995), key=S.get)}), "
    f"max {max(v for k, v in S.items() if k >= 1995):.0f} ({max((k for k in S if k >= 1995), key=S.get)})")
SN = R["snatky_na_1000"]
log(f"sňatky na 1 000 obyvatel: 1989 {SN[1989]:.1f}, 2025 {SN[2025]:.1f}")
VN = R["vek_nevest"]
log(f"věk svobodných nevěst: 1989 {VN[1989]:.1f}, 1995 {VN[1995]:.1f}, 2005 {VN[2005]:.1f}, 2015 {VN[2015]:.1f}, 2025 {VN[2025]:.1f}")
VZ = R["vek_zenichu"]
log(f"věk nevěst 1989→2005 +{VN[2005] - VN[1989]:.1f}, 2005→2025 +{VN[2025] - VN[2005]:.1f}; rozdíl ženich − nevěsta 1989 {VZ[1989] - VN[1989]:.1f}, 2025 {VZ[2025] - VN[2025]:.1f}")
log(f"sňatky 1990 − 1989 = {S[1990] - S[1989]:.0f}")
log(f"narození 1995 = {R['narozeni'][1995]:.0f}, pokles 1990→1995 o {100 * (1 - R['narozeni'][1995] / R['narozeni'][1990]):.1f} %")
log(f"sňatky 2025 = {S[2025]:.0f}; 2025 je minimum celé řady: {min(S, key=S.get) == 2025}")

N = R["narozeni"]
min90 = min((k for k in N if k <= 2005), key=N.get)
log(f"narození 1990 = {N[1990]:.0f}, minimum 90. let {min90} = {N[min90]:.0f}, pokles o {100 * (1 - N[min90] / N[1990]):.1f} %")
log(f"narození 2025 = {N[2025]:.0f}; 2025 je minimum celé řady 1989–2025: {min(N, key=N.get) == 2025}")
log(f"narození 2021 = {N[2021]:.0f} → 2025 = {N[2025]:.0f}, pokles o {100 * (1 - N[2025] / N[2021]):.1f} %")

P = R["plodnost"]
pmin = min(P, key=P.get)
log(f"plodnost minimum {pmin} = {P[pmin]:.2f}; maximum po roce 2000: {max((k for k in P if k > 2000), key=P.get)} = {max(v for k, v in P.items() if k > 2000):.2f}")
log(f"plodnost 1995 = {P[1995]:.3f}, 2025 = {P[2025]:.3f}")
log(f"plodnost 1990 = {P[1990]:.2f}, 1996 = {P[1996]:.2f}")

M = R["mimo_pct"]
for hr in (10, 20, 30, 40):
    rok = min(k for k in M if M[k] >= hr)
    log(f"mimo manželství poprvé ≥ {hr} %: {rok} ({M[rok]:.1f} %)")
mmax = max(M, key=M.get)
log(f"mimo manželství maximum {mmax} = {M[mmax]:.1f} %; od 2015 v pásmu {min(v for k, v in M.items() if k >= 2015):.1f}–{max(v for k, v in M.items() if k >= 2015):.1f} %")
log(f"mimo manželství 2025 = {R['mimo_n'][2025]:.0f} dětí z {N[2025]:.0f}")

V = R["vek_matky_prvni"]
for hr in (25, 28):
    rok = min(k for k in V if V[k] >= hr)
    log(f"věk matky při 1. dítěti poprvé ≥ {hr}: {rok} ({V[rok]:.2f})")
log(f"věk matky při 1. dítěti 1992 = {V[1992]:.1f}, 2005 = {V[2005]:.1f} (+{V[2005] - V[1992]:.1f} za 13 let); 2005→2025 +{V[2025] - V[2005]:.1f}")

T = R["matky_do19"]
tmax = max(T, key=T.get)
log(f"porody do 19 let: maximum {tmax} = {T[tmax]:.0f}, 2000 = {T[2000]:.0f} (pokles o {100 * (1 - T[2000] / T[tmax]):.0f} %), 2025 = {T[2025]:.0f}")
log(f"podíl dětí matek do 19 let: 1989 {100 * T[1989] / N[1989]:.1f} %, 2025 {100 * T[2025] / N[2025]:.1f} %")
F = R["matky_nad40"]
log(f"porody nad 40 let: 1989 = {F[1989]:.0f}, 2025 = {F[2025]:.0f} (×{F[2025] / F[1989]:.1f}), maximum {max(F, key=F.get)} = {max(F.values()):.0f}")
rok_prekryv = min(k for k in F if F[k] > T[k])
log(f"matek nad 40 poprvé víc než matek do 19: {rok_prekryv} ({F[rok_prekryv]:.0f} × {T[rok_prekryv]:.0f})")

U = R["upt"]
rok_pul = min(k for k in U if U[k] <= U[1989] / 2)
log(f"UPT 1989 = {U[1989]:.0f}; poprvé pod polovinou 1989 v roce {rok_pul} ({U[rok_pul]:.0f}); 1995 = {U[1995]:.0f}; poslední {max(U)} = {U[max(U)]:.0f}")

SV, ZE = R["stav_svobodni"], R["stav_zenati"]
rok_x = min(k for k in SV if SV[k] > ZE[k])
log(f"svobodní poprvé víc než ženatí/vdané: {rok_x} (svobodní {SV[rok_x]:.2f} %, ženatí {ZE[rok_x]:.2f} %)")
log(f"rodinný stav 2025: svobodní {SV[2025]:.1f} %, ženatí {ZE[2025]:.1f} %, rozvedení {R['stav_rozvedeni'][2025]:.1f} %, ovdovělí {R['stav_ovdoveli'][2025]:.1f} %")

RO = R["rozvody"]
RV = R["rozvodovost_pct"]
rvmax = max(RV, key=RV.get)
log(f"úhrnná rozvodovost maximum {rvmax} = {RV[rvmax]:.1f} %; 1989 = {RV[1989]:.1f} %, 2025 = {RV[2025]:.1f} %")
log(f"rozvody 1999 = {RO[1999]:.0f} (výkyv; 1998 = {RO[1998]:.0f}, 2000 = {RO[2000]:.0f})")
D20 = R["rozv_20plus"]
log(f"rozvody po 20+ letech: 1989 {D20[1989]:.0f} = {100 * D20[1989] / RO[1989]:.1f} % rozvodů; 2025 {D20[2025]:.0f} = {100 * D20[2025] / RO[2025]:.1f} %")
D01 = R["rozv_0_1"]
log(f"rozvody do 1 roku: 1989 {D01[1989]:.0f} = {100 * D01[1989] / RO[1989]:.1f} %; 2025 {D01[2025]:.0f} = {100 * D01[2025] / RO[2025]:.1f} %")
DT = R["rozv_s_detmi_pct"]
log(f"rozvody s nezletilými dětmi: 1989 {DT[1989]:.1f} % (~{DT[1989] / 100 * RO[1989]:.0f} rozvodů), 2025 {DT[2025]:.1f} % (~{DT[2025] / 100 * RO[2025]:.0f} rozvodů)")

DJ = R["dom_jednotlivcu_pct"]
log(f"domácnosti jednotlivců (sčítání): " + ", ".join(f"{k} {v:.1f} %" for k, v in sorted(DJ.items())))
log(f"nárůst 2011→2021 o {DJ[2021] - DJ[2011]:.1f} p. b. (největší za desetiletí: {max(range(1, len(DJ)), key=lambda i: sorted(DJ.items())[i][1] - sorted(DJ.items())[i - 1][1])})")
OD = R["osob_na_domacnost"]
log(f"osob na hospodařící domácnost: " + ", ".join(f"{k} {v:.2f}" for k, v in sorted(OD.items())))

(HERE / "cisla.json").write_text(json.dumps({k: {str(y): v for y, v in sorted(s.items())} for k, s in R.items()},
                                            ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
(HERE / "vystup.txt").write_text("\n".join(out) + "\n", encoding="utf-8")
print("\n".join(out))
