"""Kapitola „Zdraví a délka života“ speciálu Jací jsme byli, jací jsme – 1989 × 2026.

Všechna čísla v textu a v grafech počítá tenhle skript z primárních tabulek ČSÚ.

Zdroj: ČSÚ, Česko od roku 1989 v číslech, aktualizace 27. 8. 2026
  https://csu.gov.cz/produkty/cesko-od-roku-1989-v-cislech-aktualizace-27-8-2026
  balík: https://csu.gov.cz/docs/107508/bd0a22e6-1df1-a4f1-86db-dcbcba592a0a/320181260827_data.zip?version=1.2
  Tab. 01.01 Vybrané demografické údaje (naděje dožití, úmrtnost, zemřelí podle příčin)
  Tab. 03.03 Spotřeba alkoholických nápojů a cigaret na 1 obyvatele (1989–2024, cigarety do 2020)
  Tab. 13.01 Zdravotnictví – vybrané ukazatele (pramen ÚZIS ČR)
Archiv: csu-data/souhrn/cesko-od-1989/20260827/data/

Pozor: příčiny smrti jsou v letech 1989–1993 podle 9. revize Mezinárodní klasifikace nemocí
(MKN-9), od roku 1994 podle MKN-10. Skupiny si odpovídají jen přibližně, proto srovnáváme
hlavně podíly na všech zemřelých a hodnoty na švu 1993/1994 vypisujeme zvlášť.

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


def spoj(a, b):
    out = dict(a)
    out.update(b)
    return out


R = {
    "dozit_muzi": radek("0101", "muži", 0, po="Naděje dožití při narození"),
    "dozit_zeny": radek("0101", "ženy", 0, po="Naděje dožití při narození"),
    "dozit65_muzi": radek("0101", "muži", 0, po="Naděje dožití ve věku 65"),
    "dozit65_zeny": radek("0101", "ženy", 0, po="Naděje dožití ve věku 65"),
    "kojenecka": radek("0101", "Kojenecká úmrtnost"),
    "novorozenecka": radek("0101", "Novorozenecká úmrtnost"),
    "zemreli": radek("0101", "Zemřelí"),
    # MKN-9 (1989–1993) a MKN-10 (1994–)
    "novotvary_mkn9": radek("0101", "II. Novotvary", 0),
    "novotvary_mkn10": radek("0101", "II. Novotvary", 1),
    "obeh_mkn9": radek("0101", "VII. Nemoci cévního ústrojí"),
    "obeh_mkn10": radek("0101", "IX. Nemoci oběhové soustavy"),
    "infarkt_mkn9": radek("0101", "Akutní infarkt myokardu (410)"),
    "infarkt_mkn10": radek("0101", "Akutní infarkt myokardu (I21"),
    "dych_mkn9": radek("0101", "VIII. Nemoci ústrojí dýchacího"),
    "dych_mkn10": radek("0101", "X. Nemoci dýchací soustavy"),
    "sebevrazdy_mkn9": radek("0101", "Sebevraždy a sebepoškození"),
    "sebevrazdy_mkn10": radek("0101", "Úmyslné sebepoškození"),
    "pocet_obyvatel_tis": radek("0101", "Počet obyvatel"),
    "podil_65plus": radek("0101", "65 a více", 1),
    # Tab. 13.01 (ÚZIS)
    "osetrovaci_doba": radek("1301", "prům. délka ošetřovací doby"),
    "luzka_na_1000": radek("1301", "lůžka v nemocnicích na 1 000"),
    "lekari_uvazky": radek("1301", "lékaři (státní i nestátní"),
    "obyv_na_lekare": radek("1301", "počet obyvatel na 1 lékaře"),
    "obyv_na_zubare": radek("1301", "počet obyvatel na 1 zubního lékaře"),
    "diabetici_tis": radek("1301", "léčení diabetici"),
    "zn_incidence": radek("1301", "incidence zhoubných novotvarů"),
    "zn_incidence_100k": radek("1301", "na 100 000 obyvatel", 0, po="incidence zhoubných novotvarů"),
    "tbc": radek("1301", "tuberkulóza dýchacího ústrojí"),
    # Tab. 03.03
    "pivo": radek("0303", "Pivo"),
    "vino": radek("0303", "Víno"),
    "lihoviny": radek("0303", "Lihoviny (40%)"),
    "alkohol_cisty_lih": radek("0303", "v hodnotě čistého lihu", 0),
    "cigarety": radek("0303", "Cigarety celkem"),
}
R["novotvary"] = spoj(R["novotvary_mkn9"], R["novotvary_mkn10"])
R["obeh"] = spoj(R["obeh_mkn9"], R["obeh_mkn10"])
R["infarkt"] = spoj(R["infarkt_mkn9"], R["infarkt_mkn10"])
R["dych"] = spoj(R["dych_mkn9"], R["dych_mkn10"])
R["sebevrazdy"] = spoj(R["sebevrazdy_mkn9"], R["sebevrazdy_mkn10"])
assert max(R["obeh_mkn9"]) == 1993 and min(R["obeh_mkn10"]) == 1994
assert R["pivo"][1989] == 151 and R["cigarety"][1989] == 1776

out = []


def hr(x, d=1):
    """Zaokrouhlení half-up z desítkového zápisu hodnoty ČSÚ (19,45 → 19,5), stejně jako v textu."""
    return str(Decimal(str(x)).quantize(Decimal(1).scaleb(-d), rounding=ROUND_HALF_UP))


def log(*a):
    out.append(" ".join(str(x) for x in a))


def td(klic, d=1, od=1989):
    s = R[klic]
    r0 = od if od in s else min(s)
    rN = max(s)
    log(f"{klic}: {r0} = {hr(s[r0], d)} → {rN} = {hr(s[rN], d)}")
    return r0, rN


log("== TEHDY × DNES ==")
for k, d in [("dozit_muzi", 1), ("dozit_zeny", 1), ("dozit65_muzi", 1), ("dozit65_zeny", 1), ("kojenecka", 2),
             ("novorozenecka", 2), ("zemreli", 0), ("novotvary", 0), ("obeh", 0), ("infarkt", 0), ("sebevrazdy", 0),
             ("osetrovaci_doba", 1), ("luzka_na_1000", 1), ("lekari_uvazky", 0), ("obyv_na_lekare", 0),
             ("obyv_na_zubare", 0), ("diabetici_tis", 0), ("zn_incidence", 0), ("zn_incidence_100k", 1), ("tbc", 0),
             ("pivo", 1), ("vino", 1), ("lihoviny", 1), ("alkohol_cisty_lih", 1), ("cigarety", 0)]:
    td(k, d)

log("")
log("== NADĚJE DOŽITÍ ==")
M, Z = R["dozit_muzi"], R["dozit_zeny"]
M65, Z65 = R["dozit65_muzi"], R["dozit65_zeny"]
log(f"přírůstek při narození: muži +{M[2025] - M[1989]:.1f}, ženy +{Z[2025] - Z[1989]:.1f} let")
log(f"rozdíl ženy − muži: 1989 {Z[1989] - M[1989]:.1f}, 2025 {Z[2025] - M[2025]:.1f} let")
rok_m = min(y for y in M if M[y] > Z[1989])
log(f"muži poprvé nad úrovní žen z roku 1989 ({Z[1989]:.1f}): {rok_m} ({M[rok_m]:.1f})")
log(f"muži 1990 = {M[1990]:.1f} (pokles proti 1989 o {M[1989] - M[1990]:.1f}); muži 2000 = {M[2000]:.1f} (+{M[2000] - M[1990]:.1f} za 90. léta)")
log(f"muži 1990→2000 +{M[2000] - M[1990]:.1f}, 2000→2010 +{M[2010] - M[2000]:.1f}, 2010→2019 +{M[2019] - M[2010]:.1f}")
log(f"ženy 1990→2000 +{Z[2000] - Z[1990]:.1f}, 2000→2010 +{Z[2010] - Z[2000]:.1f}, 2010→2019 +{Z[2019] - Z[2010]:.1f}")
log(f"covid: muži 2019 {M[2019]:.1f} → 2021 {M[2021]:.1f} (−{M[2019] - M[2021]:.1f}); ženy 2019 {Z[2019]:.1f} → 2021 {Z[2021]:.1f} (−{Z[2019] - Z[2021]:.1f})")
rok_m_zpet = min(y for y in M if y > 2021 and M[y] > M[2019])
log(f"muži poprvé nad úrovní 2019: {rok_m_zpet} ({M[rok_m_zpet]:.2f})")
rok_z_zpet = [y for y in Z if y > 2021 and Z[y] > Z[2019]]
log(f"ženy nad úrovní 2019: {rok_z_zpet[0] if rok_z_zpet else 'zatím ne'} ({Z[2025]:.2f} v 2025 proti {Z[2019]:.2f})")
log(f"v 65 letech: muži {M65[1989]:.1f} → {M65[2025]:.1f} (+{M65[2025] - M65[1989]:.1f}), ženy {Z65[1989]:.1f} → {Z65[2025]:.1f} (+{Z65[2025] - Z65[1989]:.1f})")
log(f"podíl přírůstku po 65 na celkovém přírůstku: muži {100 * (M65[2025] - M65[1989]) / (M[2025] - M[1989]):.0f} %, ženy {100 * (Z65[2025] - Z65[1989]) / (Z[2025] - Z[1989]):.0f} % (orientačně, nejde o rozklad)")

log("")
log("== KOJENCI ==")
K, N = R["kojenecka"], R["novorozenecka"]
log(f"kojenecká 1989 {K[1989]:.2f} ‰, 1990 {K[1990]:.2f} ‰, 2000 {K[2000]:.2f} ‰, 2025 {K[2025]:.2f} ‰; minimum {min(K, key=K.get)} = {min(K.values()):.2f}")
log(f"pokles kojenecké 1989→2000 o {100 * (1 - K[2000] / K[1989]):.0f} %; 1989→2025 o {100 * (1 - K[2025] / K[1989]):.0f} %")
rok_pod5 = min(y for y in K if K[y] < 5)
log(f"kojenecká poprvé pod 5 ‰: {rok_pod5} ({K[rok_pod5]:.2f})")
log(f"novorozenecká 1989 {N[1989]:.2f} ‰ → 2025 {N[2025]:.2f} ‰")
log(f"orientačně zemřelých kojenců (míra × živě narození / 1000): 1989 ≈ {K[1989] * 128356 / 1000:.0f}, 2025 ≈ {K[2025] * 77636 / 1000:.0f}")

log("")
log("== PŘÍČINY SMRTI (MKN-9 do 1993, MKN-10 od 1994) ==")
Zm = R["zemreli"]
posl = max(R["obeh"])
for k, nazev in [("obeh", "oběhová soustava"), ("novotvary", "novotvary"), ("infarkt", "akutní infarkt"), ("sebevrazdy", "sebevraždy"), ("dych", "dýchací soustava")]:
    s = R[k]
    log(f"{nazev}: 1989 {s[1989]:.0f} ({100 * s[1989] / Zm[1989]:.1f} % zemřelých) → {posl} {s[posl]:.0f} ({100 * s[posl] / Zm[posl]:.1f} %); "
        f"šev 1993 {s[1993]:.0f} / 1994 {s[1994]:.0f}")
P65 = R["podil_65plus"]
log(f"podíl lidí 65+: 1989 {P65[1989]:.1f} %, {posl} {P65[posl]:.1f} %, 2025 {P65[2025]:.1f} %")
log(f"oběhová 1989→2000: {R['obeh'][1989]:.0f} → {R['obeh'][2000]:.0f} (−{100 * (1 - R['obeh'][2000] / R['obeh'][1989]):.0f} %)")
log(f"zemřelí celkem 1989 {Zm[1989]:.0f}, {posl} {Zm[posl]:.0f}")
O, I = R["obeh"], R["infarkt"]
log(f"oběhová: úbytek 1989→{posl} o {O[1989] - O[posl]:.0f} úmrtí ({100 * (1 - O[posl] / O[1989]):.0f} %)")
log(f"infarkt: 1994 {I[1994]:.0f} → {posl} {I[posl]:.0f} (jen MKN-10, pokles o {100 * (1 - I[posl] / I[1994]):.0f} %)")
log(f"infarkt: 1989 {I[1989]:.0f} → {posl} {I[posl]:.0f} (přes šev, pokles o {100 * (1 - I[posl] / I[1989]):.0f} %)")
D_ = R["dych"]
log(f"dýchací soustava: 1989 {D_[1989]:.0f} → {posl} {D_[posl]:.0f} (+{100 * (D_[posl] / D_[1989] - 1):.0f} %), "
    f"maximum {max(D_, key=D_.get)} = {max(D_.values()):.0f}; 2019 {D_[2019]:.0f}")
rok_nad = [y for y in O if R["novotvary"][y] > O[y]]
log(f"roky, kdy nádory zabily víc lidí než oběhová soustava: {rok_nad or 'žádný'}")
log(f"oběhová / novotvary {posl}: {O[posl] / R['novotvary'][posl]:.2f}; 1989: {O[1989] / R['novotvary'][1989]:.2f}")
S = R["sebevrazdy"]
pop = R["pocet_obyvatel_tis"]
for y in (1989, 2023, posl):
    stred = (pop[y] + pop[y - 1]) / 2 if y - 1 in pop else pop[y]
    log(f"sebevraždy {y}: {S[y]:.0f}, ≈ {S[y] / stred * 100:.1f} na 100 000 obyvatel (průměr stavů k 31. 12.)")
log(f"sebevraždy minimum {min(S, key=S.get)} = {min(S.values()):.0f}")

log("")
log("== ZDRAVOTNICTVÍ (Tab. 13.01, ÚZIS) ==")
OD = R["osetrovaci_doba"]
log(f"ošetřovací doba: 1989 {OD[1989]:.1f} dne → {max(OD)} {OD[max(OD)]:.1f} dne; 2000 {OD[2000]:.1f}")
L = R["luzka_na_1000"]
log(f"lůžka na 1 000 obyv.: {min(L)} {L[min(L)]:.1f} → {max(L)} {L[max(L)]:.1f}; skok 2009→2010 {L[2009]:.2f} → {L[2010]:.2f} (od 2010 jen nemocnice akutní péče? viz pozn.)")
OL = R["obyv_na_lekare"]
log(f"obyvatel na 1 lékaře: {min(OL)} {OL[min(OL)]:.0f} → {max(OL)} {OL[max(OL)]:.0f}")
OZ = R["obyv_na_zubare"]
zmin = min(OZ, key=OZ.get)
log(f"obyvatel na 1 zubaře: {min(OZ)} {OZ[min(OZ)]:.0f} → {max(OZ)} {OZ[max(OZ)]:.0f}; nejlépe {zmin} ({OZ[zmin]:.0f}); 2019 {OZ[2019]:.0f} → 2020 {OZ[2020]:.0f}")
LU = R["lekari_uvazky"]
log(f"lékaři (přepočtení na úvazky): {min(LU)} {LU[min(LU)]:.0f} → {max(LU)} {LU[max(LU)]:.0f} (+{100 * (LU[max(LU)] / LU[min(LU)] - 1):.0f} %)")
DB = R["diabetici_tis"]
log(f"léčení diabetici (tis.): 1989 {DB[1989]:.0f}, 2009 {DB[2009]:.0f}, 2010 {DB[2010]:.0f} (od 2010 bez léčených jen dietou), {max(DB)} {DB[max(DB)]:.0f}; 2010→{max(DB)} +{100 * (DB[max(DB)] / DB[2010] - 1):.0f} %")
ZN, ZN1 = R["zn_incidence"], R["zn_incidence_100k"]
log(f"nově zjištěné zhoubné nádory: 1989 {ZN[1989]:.0f} ({ZN1[1989]:.0f} na 100 tis.) → {max(ZN)} {ZN[max(ZN)]:.0f} ({ZN1[max(ZN1)]:.0f} na 100 tis.), ×{ZN[max(ZN)] / ZN[1989]:.2f}")
T = R["tbc"]
log(f"tuberkulóza dýchacího ústrojí: 1989 {T[1989]:.0f} → {max(T)} {T[max(T)]:.0f}")

log("")
log("== ALKOHOL A CIGARETY NA OBYVATELE (Tab. 03.03) ==")
for k in ("pivo", "vino", "lihoviny", "alkohol_cisty_lih"):
    s = R[k]
    mx = max(s, key=s.get)
    log(f"{k}: 1989 {s[1989]:.2f} l → {max(s)} {s[max(s)]:.2f} l; maximum {mx} = {s[mx]:.2f}; změna {100 * (s[max(s)] / s[1989] - 1):+.0f} %")
C_ = R["cigarety"]
mx = max(C_, key=C_.get)
log(f"cigarety: 1989 {C_[1989]:.0f} ks → {max(C_)} {C_[max(C_)]:.0f} ks (poslední rok s údajem; 2021–2023 „-“, 2024 „.“); maximum {mx} = {C_[mx]:.0f}")
log(f"cigarety 2020 v krabičkách po 20: {C_[2020] / 20:.0f} (1989: {C_[1989] / 20:.0f}); denně {C_[2020] / 366:.1f} ks na obyvatele (1989: {C_[1989] / 365:.1f})")
log(f"pivo v půllitrech: 1989 {R['pivo'][1989] * 2:.0f}, {max(R['pivo'])} {R['pivo'][max(R['pivo'])] * 2:.0f}")

(HERE / "cisla.json").write_text(json.dumps({k: {str(y): v for y, v in sorted(s.items())} for k, s in R.items()},
                                            ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
(HERE / "vystup.txt").write_text("\n".join(out) + "\n", encoding="utf-8")
print("\n".join(out))
