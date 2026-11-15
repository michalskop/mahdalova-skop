"""Kapitola „Bydlení“ speciálu Jací jsme byli, jací jsme (1989 × 2026) – všechna čísla do textu.

Vstupy (archiv csu-data = statisticka-data/cesko, u každé sady ZDROJ.txt s URL):
  souhrn/cesko-od-1989/20260827/data/   ČSÚ Česko od roku 1989 v číslech (aktualizace 27. 8. 2026)
      Tab. 11.01 bytová výstavba, 11.03 kvalitativní ukazatele bydlení (sčítání 1961–2021),
      13.07 průměrná mzda, 01.01 počet obyvatel
      https://csu.gov.cz/docs/107508/bd0a22e6-1df1-a4f1-86db-dcbcba592a0a/320181260827_data.zip?version=1.2
  scitani/sldb2021-byty/20261114/       SLDB 2021, otevřená data: právní důvod užívání, vybavení, vlastník domu
      https://csu.gov.cz/produkty/vysledky-scitani-2021-otevrena-data
  scitani/sldb1991-byty/20261114/       SLDB 1991, Tab. 3.2.1 a 3.2.2 trvale obydlené byty podle právního důvodu užívání
      https://csu.gov.cz/docs/107508/b6572b80-7764-9edc-4de2-fb29747532a8/4131_3_2_1.pdf
  ceny/nemovitosti-datastat/20261114/   ČSÚ DataStat CEN0402T02 průměrné kupní ceny nemovitostí (ČÚZK, od 2019)
      https://data.csu.gov.cz/api/dotaz/v1/data/vybery/CEN0402T02?format=CSV

Spuštění: python vypocet.py  (grafy.py ho importuje). Výstup: cisla.json + vystup.txt.
"""
import csv
import json
import os
import re
import sys
from pathlib import Path

import openpyxl
import pypdf

sys.stdout.reconfigure(encoding="utf-8")
HERE = Path(__file__).resolve().parent


def najdi_archiv() -> Path:
    if os.environ.get("CSU_DATA"):
        return Path(os.environ["CSU_DATA"])
    for p in Path(__file__).resolve().parents:
        for kandidat in (p / "csu-data", p / "statisticka-data" / "cesko"):
            if kandidat.exists():
                return kandidat
    raise SystemExit("Archiv csu-data nenalezen – nastav CSU_DATA")


A = najdi_archiv()
DATA = A / "souhrn/cesko-od-1989/20260827/data"
_cache = {}


def list_(tab):
    if tab not in _cache:
        wb = openpyxl.load_workbook(DATA / f"32018126_{tab}.xlsx", data_only=True)
        _cache[tab] = [list(r) for r in wb.worksheets[0].iter_rows(values_only=True)]
    return _cache[tab]


def num(v):
    return float(v) if isinstance(v, (int, float)) and not isinstance(v, bool) else None


def rok_hlavicky(v):
    """Rok v záhlaví sloupce: 1989, ale i „20251)“ (rok + číslo poznámky)."""
    if isinstance(v, int) and 1900 < v < 2030:
        return v
    m = re.match(r"\s*((19|20)\d\d)\d?\)?\s*$", str(v)) if isinstance(v, str) else None
    return int(m.group(1)) if m else None


def radek(tab, popisek, n=0, po=None):
    """Tabulka s roky v záhlaví sloupců. Vrátí {rok: hodnota} n-tého řádku, jehož popisek
    začíná textem `popisek` (volitelně až za řádkem začínajícím `po`)."""
    rows = list_(tab)
    hlav = max(rows, key=lambda r: sum(rok_hlavicky(v) is not None for v in r))
    roky = {j: rok_hlavicky(v) for j, v in enumerate(hlav) if rok_hlavicky(v) is not None}
    prvni = min(roky)
    sp = lambda s: re.sub(r"\s+", " ", s).strip()
    popisek, po = sp(popisek), sp(po) if po else None
    aktivni, shody = po is None, []
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
    out = {}
    for r in list_(tab):
        m = re.match(r"\s*((19|20)\d\d)\s*$", str(r[0])) if r and r[0] is not None else None
        if m and len(r) > j and num(r[j]) is not None:
            out[int(m.group(1))] = num(r[j])
    return out


C, LOG = {}, []


def zapis(klic, hodnota, popis):
    C[klic] = hodnota
    LOG.append(f"{klic} = {hodnota}   # {popis}")


def pct(a, b, d=1):
    return round(100 * a / b, d)


hruba = sloupec("1307", 2)  # průměrná hrubá měsíční mzda (Kčs / Kč), Tab. 13.07
assert hruba[1989] == 3170 and hruba[2025] == 48670, "kontrola Tab. 13.07"

# ---------- 1. Bytová výstavba (Tab. 11.01) ----------
dokonc = radek("1101", "Dokončené byty celkem")
plocha_byt = radek("1101", "Obytná plocha 1 dokončeného bytu v m2", 0)  # všechny byty
plocha_rd = radek("1101", "Obytná plocha 1 dokončeného bytu v m2", 1)  # nové rodinné domy
podil_rd = radek("1101", "Podíl bytů v nových rodinných domech v %")
intenzita = radek("1101", "Intenzita bytové výstavby")
naklad_rd = radek("1101", "Investiční náklady na výstavbu 1 bytu v tis. Kč", 0)  # 1. výskyt = rodinné domy
naklad_rd_m2 = radek("1101", "Investiční náklady na výstavbu 1 m2 užitné plochy v Kč", 0)
POSL = 2024     # poslední definitivní rok; 2025 je předběžný (od 2025 data z RÚIAN)
PRED = 2025
assert dokonc[1989] == 55073 and dokonc[POSL] == 30274, "kontrola Tab. 11.01"
zapis("byty_1989", int(dokonc[1989]), "dokončené byty 1989")
zapis("byty_posl", int(dokonc[POSL]), f"dokončené byty {POSL}")
zapis("byty_pred", int(dokonc[PRED]), f"dokončené byty {PRED} (předběžně, RÚIAN)")
zapis("byty_zmena_pct", round(100 * (dokonc[POSL] / dokonc[1989] - 1), 1), f"změna dokončených bytů 1989→{POSL}, %")
mn = min(dokonc, key=dokonc.get)
zapis("byty_min_rok", mn, "rok s nejméně dokončenými byty")
zapis("byty_min", int(dokonc[mn]), "nejméně dokončených bytů")
vr = max((y for y in dokonc if y > 1990), key=dokonc.get)
zapis("byty_max_po1990_rok", vr, "rok s nejvíc dokončenými byty po roce 1990")
zapis("byty_max_po1990", int(dokonc[vr]), "nejvíc dokončených bytů po roce 1990")
zapis("intenzita_1989", round(intenzita[1989], 1), "dokončené byty na 1 000 obyvatel 1989")
zapis("intenzita_posl", round(intenzita[POSL], 1), f"dokončené byty na 1 000 obyvatel {POSL}")
zapis("plocha_byt_1989", round(plocha_byt[1989], 1), "obytná plocha dokončeného bytu 1989, m²")
zapis("plocha_byt_posl", round(plocha_byt[POSL], 1), f"obytná plocha dokončeného bytu {POSL}, m²")
zapis("podil_rd_1989", round(podil_rd[1989], 1), "podíl bytů v nových RD 1989, %")
zapis("podil_rd_posl", round(podil_rd[POSL], 1), f"podíl bytů v nových RD {POSL}, %")
zapis("plocha_rd_1989", round(plocha_rd[1989], 1), "obytná plocha bytu v novém RD 1989, m²")
zapis("plocha_rd_posl", round(plocha_rd[POSL], 1), f"obytná plocha bytu v novém RD {POSL}, m²")
BYTY_RADA = {y: int(v) for y, v in dokonc.items()}

# ---------- 2. Náklady na stavbu rodinného domu v hrubých mzdách (Tab. 11.01 + 13.07) ----------
for rok, k in ((1989, "1989"), (POSL, "posl"), (PRED, "pred")):
    zapis(f"rd_naklad_{k}_tis", round(naklad_rd[rok]), f"investiční náklady na byt v novém RD {rok}, tis. Kč")
    zapis(f"rd_mezd_{k}", round(naklad_rd[rok] * 1000 / hruba[rok], 1), f"RD v hrubých měsíčních mzdách {rok}")
    zapis(f"rd_let_{k}", round(naklad_rd[rok] * 1000 / hruba[rok] / 12, 1), f"RD v ročních hrubých mzdách {rok}")
for rok, k in ((1989, "1989"), (POSL, "posl")):
    zapis(f"rd_m2_{k}", round(naklad_rd_m2[rok]), f"náklady na 1 m² užitné plochy RD {rok}, Kč")
    zapis(f"rd_m2_mezd_{k}", round(naklad_rd_m2[rok] / hruba[rok], 2), f"1 m² RD v hrubých mzdách {rok}")
    # užitná plocha = náklady na byt / náklady na m² užitné plochy (odvozeno, ČSÚ ji v tabulce neuvádí)
    zapis(f"rd_uzitna_{k}", round(naklad_rd[rok] * 1000 / naklad_rd_m2[rok]), f"odvozená užitná plocha nového RD {rok}, m²")
zapis("rd_mezd_zmena_pct", round(100 * (C["rd_mezd_posl"] / C["rd_mezd_1989"] - 1), 1), f"o kolik % víc mezd stojí RD {POSL} než 1989")
zapis("rd_uzitna_zmena_pct", round(100 * (C["rd_uzitna_posl"] / C["rd_uzitna_1989"] - 1), 1), "o kolik % větší užitná plocha")
zapis("hruba_1989", int(hruba[1989]), "průměrná hrubá mzda 1989, Kčs")
zapis("hruba_2019", int(hruba[2019]), "průměrná hrubá mzda 2019, Kč")
zapis("hruba_posl", int(hruba[POSL]), f"průměrná hrubá mzda {POSL}, Kč")
zapis("hruba_2025", int(hruba[2025]), "průměrná hrubá mzda 2025, Kč")

# ---------- 3. Ceny bytů na trhu (ČSÚ DataStat CEN0402T02, data ČÚZK, od 2019) ----------
ceny = {}
with open(A / "ceny/nemovitosti-datastat/20261114/CEN0402T02.csv", encoding="utf-8-sig") as f:
    for r in csv.DictReader(f):
        if r["Území-Stát"] == "Česko" and not r["Území-Kraj"] and not r["Území-Okres"] and r["Druh nemovitosti"].startswith("Byty"):
            ceny[int(r["Roky"])] = float(r["Hodnota"])
praha = {}
with open(A / "ceny/nemovitosti-datastat/20261114/CEN0402T02.csv", encoding="utf-8-sig") as f:
    for r in csv.DictReader(f):
        if r["Území-Kraj"] == "Hlavní město Praha" and not r["Území-Okres"] and r["Druh nemovitosti"].startswith("Byty"):
            praha[int(r["Roky"])] = float(r["Hodnota"])
assert ceny[2025] == 72410, "cena bytu 2025 nesedí se ZDROJ.txt (72 410 Kč/m²)"
M2 = 60
C0, C1 = min(ceny), max(ceny)
zapis("cena_rok_od", C0, "první rok řady ČÚZK")
zapis("cena_m2_od", int(ceny[C0]), f"průměrná kupní cena bytu {C0}, Kč/m²")
zapis("cena_m2_dnes", int(ceny[C1]), f"průměrná kupní cena bytu {C1}, Kč/m²")
zapis("cena_zmena_pct", round(100 * (ceny[C1] / ceny[C0] - 1)), f"růst ceny bytu {C0}→{C1}, %")
zapis("mzda_zmena_pct", round(100 * (hruba[C1] / hruba[C0] - 1)), f"růst hrubé mzdy {C0}→{C1}, %")
zapis("byt60_kc_dnes", int(M2 * ceny[C1]), f"byt 60 m² za průměrnou cenu {C1}, Kč")
zapis("cena_m2_praha_dnes", int(praha[C1]), f"průměrná kupní cena bytu v Praze {C1}, Kč/m²")
zapis("byt60_praha_mezd_dnes", round(M2 * praha[C1] / hruba[C1], 1), f"byt 60 m² v Praze v hrubých mzdách {C1}")
BYT60 = {}
for y in sorted(ceny):
    BYT60[y] = M2 * ceny[y] / hruba[y]
    zapis(f"byt60_mezd_{y}", round(BYT60[y], 1), f"byt 60 m² v hrubých měsíčních mzdách {y}")
zapis("byt60_let_od", round(BYT60[C0] / 12, 1), f"byt 60 m² v ročních hrubých mzdách {C0}")
zapis("byt60_let_dnes", round(BYT60[C1] / 12, 1), f"byt 60 m² v ročních hrubých mzdách {C1}")
zapis("byt60_vs_rd_pomer", round(BYT60[C1] / (naklad_rd[PRED] * 1000 / hruba[PRED]), 2), "byt 60 m² / stavba RD (2025, obojí v mzdách)")

# ---------- 4. Kvalita bydlení podle sčítání (Tab. 11.03 + SLDB 2021) ----------
kv = {k: radek("1103", k) for k in ["Obydlené byty celkem", "z toho byty v rodinných domech", "vodovodem v bytě", "plynem ze sítě",
                                     "ústředním nebo etážovým topením", "Celková plocha bytu v m2 na 1 osobu",
                                     "Celková plocha v m2 na 1 obydlený byt", "Počet osob na 1 obydlený byt",
                                     "Průměrný počet osob v hospodařící domácnosti", "Podíl domácností jednotlivců"]}
for k, s in kv.items():
    for rok in (1961, 1970, 1991, 2021):
        if rok in s:
            zapis(f"sc_{re.sub(r'[^a-z]+', '_', k.lower()[:22]).strip('_')}_{rok}", round(s[rok], 2), f"{k}, sčítání {rok}")
obyv = radek("0101", "Počet obyvatel")
zapis("obyv_1991_tis", round(obyv[1991]), "počet obyvatel 1991, tis.")
zapis("obyv_2021_tis", round(obyv[2021]), "počet obyvatel 2021, tis.")
zapis("obyv_zmena_pct", round(100 * (obyv[2021] / obyv[1991] - 1), 1), "změna počtu obyvatel 1991→2021, %")
ob = kv["Obydlené byty celkem"]
zapis("obydlene_zmena_pct", round(100 * (ob[2021] / ob[1991] - 1), 1), "změna počtu obydlených bytů 1991→2021, %")


def sldb(soubor, sloupec_txt):
    out = {}
    with open(A / "scitani/sldb2021-byty/20261114" / soubor, encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            if r["uzemi_txt"] == "Česká republika":
                out[(r[sloupec_txt] or "celkem").replace("\u00a0", " ")] = int(r["hodnota"])  # popisky ČSÚ obsahují i pevné mezery
    return out


vod = sldb("sldb2021_byty_vodovod.csv", "vodovod_txt")
ply = sldb("sldb2021_byty_plyn.csv", "plyn_txt")
vyt = sldb("sldb2021_byty_vytapeni.csv", "vytapeni_txt")
uzi = sldb("sldb2021_byty_uzivani.csv", "uzivani_txt")
vla = {}
with open(A / "scitani/sldb2021-byty/20261114/sldb2021_obybyty_vlastnik_druhdomu.csv", encoding="utf-8-sig") as f:
    for r in csv.DictReader(f):
        if r["uzemi_txt"] == "Česká republika" and not r["druhdomu_txt"]:
            vla[r["vlastnik_txt"]] = int(r["hodnota"])
CELK21 = vod["celkem"]
assert CELK21 == int(ob[2021]) == ply["celkem"] == vyt["celkem"] == uzi["celkem"], "počet obydlených bytů 2021 nesedí"
vod_v_byte = sum(v for k, v in vod.items() if k.startswith("V bytě"))
ust = vyt["Ústřední dálkové"] + vyt["Ústřední domovní"] + vyt["Ústřední s vlastním zdrojem (v bytě)"]
# kontrola: Tab. 11.03 počítá podíl ze všech bytů včetně nezjištěných
assert abs(100 * vod_v_byte / CELK21 - kv["vodovodem v bytě"][2021]) < 0.01
assert abs(100 * ply["Z veřejné sítě"] / CELK21 - kv["plynem ze sítě"][2021]) < 0.01
assert abs(100 * ust / CELK21 - kv["ústředním nebo etážovým topením"][2021]) < 0.01
zapis("vodovod_2021_zjist", pct(vod_v_byte, CELK21 - vod["Nezjištěno"]), "vodovod v bytě 2021, % ze zjištěných")
zapis("vodovod_2021_nezj", pct(vod["Nezjištěno"], CELK21), "vodovod nezjištěn 2021, %")
zapis("plyn_2021_zjist", pct(ply["Z veřejné sítě"], CELK21 - ply["Nezjištěno"]), "plyn ze sítě 2021, % ze zjištěných")
zapis("topeni_2021_zjist", pct(ust, CELK21 - vyt["Nezjištěno"]), "ústřední (vč. etážového) topení 2021, % ze zjištěných")
zapis("topeni_2021_nezj", pct(vyt["Nezjištěno"], CELK21), "vytápění nezjištěno 2021, %")
zapis("kamna_2021", pct(vyt["Lokální topidla (kamna)"], CELK21 - vyt["Nezjištěno"]), "lokální topidla (kamna) 2021, % ze zjištěných")
zapis("kamna_2021_abs", vyt["Lokální topidla (kamna)"], "byty s kamny 2021")

# ---------- 5. Právní důvod užívání bytu 1991 × 2021 ----------
# SLDB 1991, Tab. 3.2.1 (ČR celkem). Čísla v PDF mají mezeru jako oddělovač tisíců, proto je zapisujeme
# ručně a skript ověří, že v textu PDF stojí přesně v tomto pořadí a že dávají dohromady úhrn.
U91 = {"ve vlastním domě": 1367027, "v osobním vlastnictví": 31164, "jiné bezplatné užívání": 94875,
       "nájemní (vč. lidových bytových družstev)": 1465231, "družstevní (stavební bytová družstva)": 697829,
       "domovnický, služební, naturální": 45586, "jiný důvod": 473, "nezjištěno": 3496}
CELK91 = 3705681
pdf = pypdf.PdfReader(A / "scitani/sldb1991-byty/20261114/4131_3_2_1.pdf").pages[0].extract_text()
fmt = lambda n: f"{n:,}".replace(",", " ")
assert " ".join(fmt(v) for v in list(U91.values()) + [CELK91]) in pdf, "Tab. 3.2.1 (1991) – čísla v PDF nesedí"
assert sum(U91.values()) == CELK91 == int(ob[1991])
for k, v in U91.items():
    zapis(f"uziv91_{k.split()[0]}_{k.split()[1] if len(k.split()) > 1 else ''}".rstrip("_"), pct(v, CELK91), f"1991 {k}, % obydlených bytů")
for k, v in uzi.items():
    if k != "celkem":
        zapis(f"uziv21_{k.split()[0].split('/')[0]}_{k.split()[1] if len(k.split()) > 1 else ''}".rstrip("_"), pct(v, CELK21), f"2021 {k}, % obydlených bytů (vč. nezjištěných)")
zapis("tri_formy_1991", pct(U91["ve vlastním domě"] + U91["nájemní (vč. lidových bytových družstev)"] + U91["družstevní (stavební bytová družstva)"], CELK91), "vlastní dům + nájemní + družstevní 1991, %")
zapis("ov_1991_abs", U91["v osobním vlastnictví"], "byty v osobním vlastnictví 1991")
zapis("ov_2021_abs", uzi["v osobním vlastnictví"], "byty v osobním vlastnictví 2021")
zapis("najem_1991_abs", U91["nájemní (vč. lidových bytových družstev)"], "nájemní byty 1991")
zapis("najem_2021_abs", uzi["nájemní/pronajatý"], "nájemní byty 2021")
zapis("druz_1991_abs", U91["družstevní (stavební bytová družstva)"], "družstevní byty 1991")
zapis("druz_2021_abs", uzi["družstevní"], "družstevní byty 2021")
zapis("vlast_dum_1991_abs", U91["ve vlastním domě"], "byty ve vlastním domě 1991")
zapis("vlast_dum_2021_abs", uzi["ve vlastním domě"], "byty ve vlastním domě 2021")
zapis("vlastnicke_1991", pct(U91["ve vlastním domě"] + U91["v osobním vlastnictví"], CELK91), "vlastní dům + osobní vlastnictví 1991, %")
zapis("vlastnicke_2021", pct(uzi["ve vlastním domě"] + uzi["v osobním vlastnictví"], CELK21), "vlastní dům + osobní vlastnictví 2021, % (vč. nezj.)")
zapis("vlastnicke_2021_zjist", pct(uzi["ve vlastním domě"] + uzi["v osobním vlastnictví"], CELK21 - uzi["nezjištěno"]), "totéž 2021, % ze zjištěných")
zapis("najem_2021_zjist", pct(uzi["nájemní/pronajatý"], CELK21 - uzi["nezjištěno"]), "nájemní 2021, % ze zjištěných")
zapis("obec_stat_vlastnik_2021", pct(vla["Obec, stát"], CELK21), "obydlené byty v domech obce nebo státu 2021, %")
zapis("obec_stat_vlastnik_2021_abs", vla["Obec, stát"], "obydlené byty v domech obce nebo státu 2021")
UZIV = [  # pro graf: popisek, 1991, 2021
    ("Byt ve vlastním domě", U91["ve vlastním domě"], uzi["ve vlastním domě"]),
    ("Byt v osobním vlastnictví", U91["v osobním vlastnictví"], uzi["v osobním vlastnictví"]),
    ("Nájemní byt", U91["nájemní (vč. lidových bytových družstev)"], uzi["nájemní/pronajatý"]),
    ("Družstevní byt", U91["družstevní (stavební bytová družstva)"], uzi["družstevní"]),
]
UZIV_CELK = (CELK91, CELK21)

(HERE / "cisla.json").write_text(json.dumps(C, ensure_ascii=False, indent=1), encoding="utf-8")
if __name__ == "__main__":
    (HERE / "vystup.txt").write_text("\n".join(LOG) + "\n", encoding="utf-8")
    print("\n".join(LOG))
