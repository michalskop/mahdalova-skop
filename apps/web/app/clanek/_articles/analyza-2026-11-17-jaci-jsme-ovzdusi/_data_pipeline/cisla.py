"""Kapitola „Ovzduší“ speciálu Jací jsme byli, jací jsme (1989 × 2026) – všechna čísla do textu.

Čte jen primární data a výstupy výpočtu v archivu statisticka-data\\cesko (mimo git), nic nekopíruje:
  ovzdusi/ovzdusi-obce-vypocet/20261114/   vypocet.py: ČHMÚ pětiletý průměr 2021–2025 v síti 1 km × obce ČÚZK
                                            × obyvatelé Eurostat Census grid 2021 × vytápění SLDB 2021
  ovzdusi/chmu-openisko-1969-2025/20260710/ roční průměry stanic (OpenISKO)
  ovzdusi/chmu-emisni-inventura-1990-2023/  národní emisní inventura (CLRTAP Annex I)
  ovzdusi/chmu-graficka-rocenka-2025/       ročenka ČHMÚ 2025 (PDF) – jen kontrolní věty
  ovzdusi/kotlikove-dotace-sfzp/            prezentace SFŽP 5. 4. 2023 (PDF) – počet vyměněných kotlů
  souhrn/cesko-od-1989/20260827/            ČSÚ Česko od roku 1989 v číslech, Tab. 02.04 (emise REZZO 1–4)
  ovzdusi/chmu-emisni-inventura-1990-2023/20251202/EBCRREZZO1-4Kraj*.xls(x)  emisní bilance krajů ČHMÚ 2005–2023
      https://opendata.chmi.cz/air_quality/products/emissions/inventory/EBCRREZZO1-4Kraj2021-2023.xlsx (a …2005-2020%282%29.xls)
  zdravotnictvi/studie-ostrava-deti-dostal-2013/  Dostál a kol., Environmental Health 2013, 12:74 (PDF, open access)
      https://ehjournal.biomedcentral.com/articles/10.1186/1476-069X-12-74
  ovzdusi/clairo-ostrava-studie/            Studie CLAIRO (Ostrava 2021), průzkumy 2019 a 2020 (PDF)
      https://clairo.ostrava.cz/wp-content/uploads/2021/07/Studie_CLAIRO_final.pdf
  obyvatelstvo/csu-vnitrni-stehovani-mezi-kraji-oby06c/  https://data.csu.gov.cz/opendata/sady/OBY06C/distribuce/csv
  obyvatelstvo/csu-stehovani-podle-veku-oby06a/          https://data.csu.gov.cz/opendata/sady/OBY06A/distribuce/csv
  obyvatelstvo/csu-obyvatele-petilete-skupiny-oby02d/    https://data.csu.gov.cz/opendata/sady/OBY02D/distribuce/csv
  zdravotnictvi/nzis-vykazane-diagnozy-3znaky/  ÚZIS NR-04-05 https://datanzis.uzis.gov.cz/data/NR-04-NRHZS/NR-04-05/Otevrena-data-NR-04-05-diagnozy-triznakove-mkn-10.csv.gz
  zdravotnictvi/nzis-hospitalizace-dg4znaky/    ÚZIS NR-04-40 https://datanzis.uzis.gov.cz/data/NR-04-NRHZS/NR-04-40/Otevrena-data-NR-04-40-hospitalizacni-pripady-akutni-pece-dg4znaky.csv.gz
Spuštění:  python cisla.py   → cisla.json (pro grafy.py), ../data/obce-bap.json (mapa), vystup.txt
"""
import json
import os
import re
from pathlib import Path

import sys

import fitz  # PyMuPDF
import openpyxl
import pandas as pd
from pyproj import Transformer

HERE = Path(__file__).resolve().parent
DATA = HERE.parent / "data"


def najdi_archiv() -> Path:
    if os.environ.get("CSU_DATA"):
        return Path(os.environ["CSU_DATA"])
    for p in Path(__file__).resolve().parents:
        for kandidat in (p / "csu-data", p / "statisticka-data" / "cesko"):
            if kandidat.exists():
                return kandidat
    raise SystemExit("Archiv csu-data nenalezen – nastav CSU_DATA")


A = najdi_archiv()
VYP = A / "ovzdusi" / "ovzdusi-obce-vypocet" / "20261114"
ISKO = A / "ovzdusi" / "chmu-openisko-1969-2025" / "20260710" / "openisko_rocni_prumery_1969_2025.csv"
ROCENKA = A / "ovzdusi" / "chmu-graficka-rocenka-2025" / "20260925" / "CHMU_grafroc2025.pdf"
KOTLIKY = A / "ovzdusi" / "kotlikove-dotace-sfzp" / "20230405" / "SFZP_TK_Kotlikove_dotace_05-04-2023.pdf"
CSU = A / "souhrn" / "cesko-od-1989" / "20260827" / "data"
INV = A / "ovzdusi" / "chmu-emisni-inventura-1990-2023" / "20251202"
DOSTAL = A / "zdravotnictvi" / "studie-ostrava-deti-dostal-2013" / "20261114" / "Dostal2013_EnvHealth_12_74.pdf"
CLAIRO = A / "ovzdusi" / "clairo-ostrava-studie" / "20261114" / "Studie_CLAIRO_final.pdf"
OBY06C = A / "obyvatelstvo" / "csu-vnitrni-stehovani-mezi-kraji-oby06c" / "20261114" / "OBY06C.csv"
OBY06A = A / "obyvatelstvo" / "csu-stehovani-podle-veku-oby06a" / "20261114" / "OBY06A.csv"
OBY02D = A / "obyvatelstvo" / "csu-obyvatele-petilete-skupiny-oby02d" / "20261114" / "OBY02D.csv"
NR0405 = A / "zdravotnictvi" / "nzis-vykazane-diagnozy-3znaky" / "20261114" / "Otevrena-data-NR-04-05-diagnozy-triznakove-mkn-10.csv.gz"
NR0440 = A / "zdravotnictvi" / "nzis-hospitalizace-dg4znaky" / "20261114" / "Otevrena-data-NR-04-40-hospitalizacni-pripady-akutni-pece-dg4znaky.csv.gz"

out, C = [], {}


def log(*a):
    out.append(" ".join(str(x) for x in a))


def cz(x, d=1):
    return f"{x:,.{d}f}".replace(",", " ").replace(".", ",")


# ---------------------------------------------------------------- 1) emise
def sloupec(tab, j):
    wb = openpyxl.load_workbook(CSU / f"32018126_{tab}.xlsx", data_only=True)
    res = {}
    for r in wb.worksheets[0].iter_rows(values_only=True):
        m = re.match(r"\s*((19|20)\d\d)", str(r[0])) if r and r[0] is not None else None
        if m and isinstance(r[j], (int, float)):
            res[int(m.group(1))] = float(r[j])
    return res


so2 = sloupec("0204", 6)  # REZZO 1–4, oxid siřičitý, tis. t; 2024 předběžně
r0, r1 = min(so2), max(so2)
C["so2_emise"] = {str(k): round(v, 1) for k, v in sorted(so2.items())}
log("EMISE SO2 (ČSÚ Tab. 02.04, REZZO 1–4, tis. t):", r0, cz(so2[r0], 0), "→", r1, cz(so2[r1], 1),
    f"pokles {cz(100 * (1 - so2[r1] / so2[r0]), 1)} %", "| 2000:", cz(so2[2000], 1), "| 2023:", cz(so2[2023], 1))

em = pd.read_csv(VYP / "emise_cr_1990_2023.csv").set_index("rok")
C["emise"] = em.reset_index().round(3).to_dict(orient="records")
e90, e00, e23 = em.loc[1990], em.loc[2000], em.loc[2023]
log("EMISE BaP (inventura, t): 1990", cz(e90.BaP_t), "→ 2000", cz(e00.BaP_t), "→ 2023", cz(e23.BaP_t),
    f"| pokles 1990–2023 {cz(100 * (1 - e23.BaP_t / e90.BaP_t), 0)} %, 2000–2023 {cz(100 * (1 - e23.BaP_t / e00.BaP_t), 1)} %")
b = em.loc[2000:2023, "BaP_t"]
log("EMISE BaP 2000–2023 rozpětí (t):", cz(b.min()), "–", cz(b.max()), "| roky", int(b.idxmin()), int(b.idxmax()))
log("EMISE BaP domácnosti (t): 1990", cz(e90.BaP_domacnosti_t), f"({cz(100 * e90.BaP_domacnosti_t / e90.BaP_t, 0)} % celku)",
    "→ 2023", cz(e23.BaP_domacnosti_t), f"({cz(100 * e23.BaP_domacnosti_t / e23.BaP_t, 0)} % celku)",
    f"| ostatní zdroje 1990 {cz(e90.BaP_t - e90.BaP_domacnosti_t)} → 2023 {cz(e23.BaP_t - e23.BaP_domacnosti_t)} t")
log("EMISE PM2,5 (kt): 2000", cz(e00.PM25_kt), "→ 2023", cz(e23.PM25_kt),
    f"| pokles {cz(100 * (1 - e23.PM25_kt / e00.PM25_kt), 0)} % | domácnosti 2023 {cz(100 * e23.PM25_domacnosti_kt / e23.PM25_kt, 0)} %")
log("EMISE SO2 domácnosti 2023 (inventura):", f"{cz(100 * e23.SO2_domacnosti_kt / e23.SO2_kt, 0)} %",
    "| SO2 mimo domácnosti 1990", cz(e90.SO2_kt - e90.SO2_domacnosti_kt, 1), "→ 2023", cz(e23.SO2_kt - e23.SO2_domacnosti_kt, 1), "kt")

# ---------------------------------------------------------------- 2) SO2 na stanicích, Ústecký kraj
rada = pd.read_csv(VYP / "so2_rada_cr_ustecky.csv").set_index("rok")
st = pd.read_csv(VYP / "so2_stanice_rocni_prumery.csv")
ust = st[st.kraj.str.startswith("Úst")]
n_ust = {int(y): int(ust[y].notna().sum()) for y in st.columns if y.isdigit()}
C["so2_ustecky"] = [{"rok": int(y), "v": round(float(v), 1), "n": n_ust.get(int(y), 0)}
                    for y, v in rada["so2_prumer_stanic_ustecky_kraj"].dropna().items() if y >= 1980]
for y in (1985, 1989, 1990, 2000, 2025):
    log(f"SO2 Ústecký kraj {y}: průměr stanic {cz(rada.loc[y, 'so2_prumer_stanic_ustecky_kraj'], 1)} µg/m³ (stanic {n_ust[y]});",
        f"medián stanic ČR {cz(rada.loc[y, 'so2_median_stanic_cr'], 1)} (N {int(rada.loc[y, 'pocet_stanic_cr'])})")
mx = ust[["lokalita", "1989"]].dropna().sort_values("1989", ascending=False).head(3)
log("SO2 1989 nejvyšší stanice Ústeckého kraje:", "; ".join(f"{r.lokalita} {cz(r['1989'], 1)}" for _, r in mx.iterrows()))

# ---------------------------------------------------------------- 3) expozice obyvatel a obce
ob = pd.read_csv(VYP / "ovzdusi_obce_2021_2025.csv", dtype={"kod_obce": str})
tot = ob.obyv_grid2021.sum()
for lab, col in [("BaP > 1 ng/m³", "obyv_bap_nad_1"), ("PM2,5 > 20 µg/m³", "obyv_pm25_nad_20"),
                 ("PM2,5 > 10 µg/m³ (EU 2030)", "obyv_pm25_nad_10"), ("PM2,5 > 5 µg/m³ (WHO)", "obyv_pm25_nad_5")]:
    p = ob[col].sum()
    C[col] = round(p)
    log(f"EXPOZICE {lab}: {cz(p, 0)} obyvatel = {cz(100 * p / tot, 1)} % (z {cz(tot, 0)})")
kr = ob.groupby("kraj").agg(obyv=("obyv_grid2021", "sum"), nad=("obyv_bap_nad_1", "sum"))
kr["podil"] = kr.nad / kr.obyv
kr = kr.sort_values("nad", ascending=False)
C["kraje"] = [{"kraj": k, "nad": round(r.nad), "obyv": round(r.obyv), "podil": round(100 * r.podil, 1)} for k, r in kr.iterrows()]
msk = kr.loc["Moravskoslezský kraj"]
log(f"KRAJ MSK: nad limitem BaP {cz(msk.nad, 0)} = {cz(100 * msk.podil, 1)} % obyvatel kraje,",
    f"{cz(100 * msk.nad / kr.nad.sum(), 1)} % všech nad limitem v ČR")
for k, r in kr.iterrows():
    log(f"  kraj {k}: {cz(r.nad, 0)} ({cz(100 * r.podil, 1)} %)")
log("KRAJE bez obyvatel nad limitem:", ", ".join(kr.index[kr.nad < 1]))

ob["bap"] = ob.bap_vazeny_obyv
t20 = ob.dropna(subset=["bap"]).sort_values("bap", ascending=False).head(20)
log("TOP20 obcí podle BaP – všechny z MSK:", bool((t20.kraj == "Moravskoslezský kraj").all()))
for _, r in t20.head(6).iterrows():
    log(f"  {r.nazev}: BaP {cz(r.bap, 2)} ng/m³, obyv. {cz(r.obyv_sldb2021, 0)}, pevná paliva {cz(100 * r.podil_pevna_paliva, 0)} %, plyn z vytápění {cz(100 * r.podil_plyn_vytapeni, 0)} %")
osa = ob[ob.nazev == "Ostrava"].iloc[0]
log(f"Ostrava: BaP {cz(osa.bap, 2)}, nad limitem {cz(osa.obyv_bap_nad_1, 0)} obyv.")
n111 = ob[ob.bap > 1]
log(f"OBCE s populačně váženým BaP > 1: {len(n111)}, žije v nich {cz(n111.obyv_sldb2021.sum(), 0)} (SLDB 2021); "
    f"obcí s aspoň částí obyvatel nad limitem: {(ob.obyv_bap_nad_1 > 0.5).sum()}; obcí celkem {len(ob)}")

# hypotéza „malé obce s pevnými palivy“
c = ob.dropna(subset=["bap", "podil_pevna_paliva"])
sp = c.podil_pevna_paliva.rank().corr(c.bap.rank())
log(f"KORELACE pevná paliva × BaP (Spearman, {len(c)} obcí): {cz(sp, 2)}")
c = c.assign(kv=pd.qcut(c.podil_pevna_paliva, 5, labels=False))
kv = []
for k, s in c.groupby("kv"):
    kv.append({"kvintil": int(k) + 1, "od": round(100 * s.podil_pevna_paliva.min()), "do": round(100 * s.podil_pevna_paliva.max()),
               "median_bap": round(s.bap.median(), 2), "podil_nad": round(100 * (s.bap > 1).mean(), 1)})
    log(f"  kvintil {k + 1} ({kv[-1]['od']}–{kv[-1]['do']} % bytů na pevná paliva): medián BaP {cz(kv[-1]['median_bap'], 2)}, obcí nad limitem {cz(kv[-1]['podil_nad'], 1)} %")
C["kvintily"] = kv
vel = []
for lab, m in [("do 2 000 obyvatel", ob.obyv_sldb2021 < 2000), ("2 000–9 999", (ob.obyv_sldb2021 >= 2000) & (ob.obyv_sldb2021 < 10000)),
               ("10 000 a víc", ob.obyv_sldb2021 >= 10000)]:
    s = ob[m]
    vel.append({"skupina": lab, "obci": int(len(s)), "nad": round(s.obyv_bap_nad_1.sum()), "obyv": round(s.obyv_grid2021.sum()),
                "podil": round(100 * s.obyv_bap_nad_1.sum() / s.obyv_grid2021.sum(), 1), "pevna": round(100 * s.podil_pevna_paliva.median(), 1)})
    log(f"VELIKOST obce {lab}: {len(s)} obcí, nad limitem {cz(vel[-1]['nad'], 0)} z {cz(vel[-1]['obyv'], 0)} = {cz(vel[-1]['podil'], 1)} %, "
        f"medián bytů na pevná paliva {cz(vel[-1]['pevna'], 1)} %")
C["velikost"] = vel

# ---------------------------------------------------------------- 4) stanice BaP 2025
s = pd.read_csv(ISKO, dtype=str)
s = s[(s.velicina == "BaP") & (s.rok == "2025") & ~s.metoda.str.contains("PUF")]  # PUF = plynná fáze, ne prach
s["v"] = s.rocni_prumer.astype(float)
s["lon"], s["lat"] = s.lon.astype(float), s.lat.astype(float)
stn = s.groupby(["kod_lokality", "lokalita", "kraj"]).agg(v=("v", "mean"), lon=("lon", "first"), lat=("lat", "first")).reset_index()
tr = Transformer.from_crs(4326, 5514, always_xy=True)
stn["x"], stn["y"] = tr.transform(stn.lon.values, stn.lat.values)
stn = stn.sort_values("v", ascending=False)
nad = stn[stn.v > 1]
log(f"STANICE BaP 2025: měřilo {len(stn)} stanic, nad 1 ng/m³ {len(nad)}:",
    "; ".join(f"{r.lokalita} ({r.kraj}) {cz(r.v, 2)}" for _, r in nad.iterrows()))
mimo = nad[nad.kraj != "Moravskoslezský"]
log("STANICE nad limitem mimo MSK:", "; ".join(f"{r.lokalita} {cz(r.v, 1)}" for _, r in mimo.iterrows()))
# porovnání stanic s modelem obce, kde stojí (podle bodu v polygonu není bez geometrie – přes název obce)
for nm, obec in [("Brumov-Bylnice", "Brumov-Bylnice"), ("Kladno-Švermov", "Kladno"), ("Jilemnice", "Jilemnice"), ("Bludov-hřiště", "Bludov"),
                 ("Staňkov", "Staňkov"), ("Třešť", "Třešť"), ("Broumov", "Broumov")]:
    st_v = stn[stn.lokalita == nm].v
    o = ob[ob.nazev == obec].sort_values("obyv_sldb2021", ascending=False)
    if len(st_v) and len(o):
        o = o.iloc[0]
        log(f"  stanice {nm} 2025 {cz(st_v.iloc[0], 2)} × model obce {obec} (2021–2025, vážený) {cz(o.bap, 2)}, "
            f"max buňka {cz(o.bap_max_bunka, 1)}, obyv. {cz(o.obyv_sldb2021, 0)}, pevná paliva {cz(100 * o.podil_pevna_paliva, 0)} %")

# ---------------------------------------------------------------- 5) kontrolní věty z PDF
def veta(pdf, vzor):
    t = " ".join(p.get_text() for p in fitz.open(pdf))
    t = re.sub(r"-\s*\n\s*", "", t)
    t = re.sub(r"\s+", " ", t)
    m = re.search(vzor, t)
    return m.group(0) if m else None


v1 = veta(ROCENKA, r"Plocha s nadlimitními koncentracemi benzo\[a\]pyrenu byla v roce 2025 vymezena[^.]*\.")
v2 = veta(ROCENKA, r"v aglomeraci Ostrava/Karviná/Frýdek-Místek nadlimitním koncentracím vystaveno \d+ % obyvatel")
v3 = veta(KOTLIKY, r"\d+ tisíc vyměněných starých kotlů od roku 2015")
v4 = veta(KOTLIKY, r"Od 1\. září 2024 zákaz provozu starých kotlů na pevná paliva")
v5 = veta(ROCENKA, r"Stanice v aglomeraci O/K/F-M jsou dlouhodobě ovlivněny dálkovým transportem z Polska\.")
for v in (v1, v2, v3, v4, v5):
    log("PDF:", v)

# ---------------------------------------------------------------- 7) Ostravsko: průmysl, zdraví dětí, odchod lidí
# a) velké zdroje (REZZO 1) po krajích, ČHMÚ emisní bilance 2005–2023
def rezzo(sheet):
    dd = []
    for f in ("EBCRREZZO1-4Kraj2005-2020(2).xls", "EBCRREZZO1-4Kraj2021-2023.xlsx"):
        d = pd.read_excel(INV / f, sheet_name=sheet, header=None, skiprows=2).iloc[:, :10]
        d.columns = ["rok", "kraj", "TZL", "SOx", "NOx", "CO", "NMVOC", "NH3", "PM25", "PM10"]
        d = d.dropna(subset=["kraj"])
        dd.append(d.assign(rok=d.rok.astype(int)))
    return pd.concat(dd)


r1 = rezzo("R1_kr")
for y in (2005, 2023):
    t = r1[r1.rok == y].set_index("kraj")
    poradi = t.PM10.rank(ascending=False).astype(int)
    log(f"REZZO 1 (velké zdroje) PM10 {y}: MSK {cz(t.loc['CZ080', 'PM10'], 0)} t = {cz(100 * t.loc['CZ080', 'PM10'] / t.PM10.sum(), 0)} % ČR "
        f"(ČR {cz(t.PM10.sum(), 0)} t), pořadí MSK mezi kraji {poradi['CZ080']}; nejvíc {t.PM10.idxmax()}")
a5, a23 = (r1[(r1.rok == y) & (r1.kraj == "CZ080")].PM10.iloc[0] for y in (2005, 2023))
log(f"REZZO 1 PM10 MSK 2005→2023 pokles {cz(100 * (1 - a23 / a5), 0)} %")

# b) studie Dostál a kol. 2013 (ÚEM AV ČR), Environmental Health 12:74
for vz in (r"abstracted the medical records of 1878 children born in 2001[–-] ?2004",
           r"We report on the incidence of acute illnesses in 1535 children",
           r"In the first year of life, the incidence of URI in 183 children in the eastern area – 372 illnesses/100 children/year – was more than twice as high as in the other 3 areas",
           r"Most of the children in the eastern area were living in the city district Radvanice and Bartovice",
           r"The highest levels in the range 7\.9 to 11\.7 ng/ ?m3 of B\[a\]P were recorded by the monitoring station in R&B",
           r"The most important industrial sources of air pollution are metallurgy, steel plants, coke ovens and power gener-? ?ating facilities"):
    log("STUDIE Dostál 2013:", veta(DOSTAL, vz))
wh = {}
for oblast, n in (("south", 677), ("east", 170), ("center", 289), ("west", 268)):
    m = re.search(rf"O\. {oblast} {n} (\d+\.\d)", veta(DOSTAL, r"O\. south 677 .{0,400}"))
    wh[oblast] = float(m.group(1))
log("STUDIE Dostál 2013, Tab. 4 – opakované pískoty (wheezing) do 5 let, % dětí:", wh,
    f"| východ / nejvyšší z ostatních {cz(wh['east'] / max(v for k, v in wh.items() if k != 'east'), 1)}×")
C["piskoty"] = [{"oblast": k, "n": n, "pct": wh[k]} for k, n in (("east", 170), ("south", 677), ("center", 289), ("west", 268))]

# c) CLAIRO – průzkum 2019 a 2020
for vz in (r"V Ostravské aglomeraci 8-10 ?% obyvatel vážně uvažuje o přestěhování se kvůli stavu ovzduší",
           r"Výběrový vzorek tvořilo 1207 respondentů \(605 v r\. 2020\+ 602 v r\. 2019\)",
           r"Sběr dat proběhl: 15\. 10\. 2019 – 10\. 11\. 2019 a 5\. 10\. 2020 – 31\. 10\. 2020",
           r"S rostoucím věkem ochota stěhovat se \(či o tom uvažovat\) klesá"):
    log("CLAIRO:", veta(CLAIRO, vz))

# d) stěhování: vnitřní mezi kraji (OBY06C) a celkové podle pětiletých skupin (OBY06A)
v = pd.read_csv(OBY06C, dtype=str)
v.columns = ["uk", "ukk", "rok", "rk", "p", "pk", "vek", "vk", "kin", "kink", "kout", "koutk", "h"]
v = v[(v.pk == "0") & (v.kin != v.kout)].assign(h=lambda d: d.h.astype(float), rok=lambda d: d.rok.astype(int))
pri = v.groupby(["kink", "rok", "vek"]).h.sum()
vys = v.groupby(["koutk", "rok", "vek"]).h.sum()
vys.index.names = pri.index.names
sal = (pri - vys).unstack("vek")
msk = sal.loc["CZ080"]
log(f"VNITŘNÍ STĚHOVÁNÍ MSK {msk.index.min()}–{msk.index.max()}: saldo každý rok záporné: {bool((msk['Celkem'] < 0).all())}; "
    f"součet {cz(msk['Celkem'].sum(), 0)}, z toho 0–14 let {cz(msk['0 - 14 let'].sum(), 0)}, 15–64 {cz(msk['15 - 64 let'].sum(), 0)}, 65+ {cz(msk['65 a více let'].sum(), 0)}")
soucty = sal["Celkem"].groupby(level=0).sum().sort_values()
log("VNITŘNÍ STĚHOVÁNÍ součet salda 2000–2025 podle krajů:", "; ".join(f"{k} {cz(x, 0)}" for k, x in soucty.items()))
C["stehovani_msk"] = [{"rok": int(r), "deti": int(x["0 - 14 let"]), "celkem": int(x["Celkem"])} for r, x in msk.iterrows()]

w = pd.read_csv(OBY06A, dtype=str, usecols=[0, 1, 2, 4, 7, 8])
w.columns = ["uk", "ukk", "vek", "rok", "uzk", "h"]
w = w[(w.uzk == "CZ080") & (w.ukk == "5402W")].assign(h=lambda d: d.h.astype(float), rok=lambda d: d.rok.astype(int))
p = w.pivot_table(index="rok", columns="vek", values="h", aggfunc="sum").loc[2003:2021]
cel, deti = p["Celkem"].sum(), p["0 - 14 let"].sum()
mladi = p[["25 - 29", "30 - 34", "35 - 39"]].sum().sum()
log(f"CELKOVÉ STĚHOVÁNÍ MSK 2003–2021 (vnitřní + zahraniční, před uprchlíky z Ukrajiny): saldo {cz(cel, 0)}; "
    f"25–39 let {cz(mladi, 0)} = {cz(100 * mladi / cel, 0)} %, 0–14 let {cz(deti, 0)} = {cz(100 * deti / cel, 0)} %")
for y in (2022, 2023):
    log(f"  celkové saldo MSK {y}: {cz(w[(w.rok == y) & (w.vek == 'Celkem')].h.iloc[0], 0)} (příchod uprchlíků z Ukrajiny)")

# e) ÚZIS: vykázaná diagnóza astmatu (J45, jakákoli pozice) u dětí 0–14 let podle okresu, na 1 000 dětí (ČSÚ, stav k 1. 7.)
pop = pd.read_csv(OBY02D, dtype=str, usecols=["IndicatorType", "POHL2", "Věkové skupiny (pětileté)", "Všechna území", "UZ01234596D", "Rok", "Hodnota"])
pop.columns = ["ind", "poh", "vek", "nazev", "uz", "rok", "h"]
pop = pop[(pop.ind == "9379") & (pop.poh == "0") & pop.vek.isin(["0", "1 - 4", "5 - 9", "10 - 14"])]
pop = pop.assign(h=pop.h.astype(float), rok=pop.rok.astype(int)).groupby(["uz", "rok"]).agg(h=("h", "sum"), nazev=("nazev", "first"))
DETI = [66000004, 66005009, 66010014]  # číselník věkových skupin NZIS: 0–4, 5–9, 10–14
dg = pd.concat(c[(c.MKN_3zn == "J45") & (c.typ_dg == "DG") & c.vek_kod.isin(DETI)] for c in pd.read_csv(
    NR0405, dtype={"pacient_id_okres": str, "MKN_3zn": str, "typ_dg": str},
    usecols=["rok", "vek_kod", "pacient_id_okres", "MKN_3zn", "typ_dg", "pacienti"], chunksize=5_000_000))
for y in (2010, 2025):
    x = dg[dg.rok == y].assign(uz="CZ" + dg.pacient_id_okres).groupby("uz").pacienti.sum()
    x = x[x.index.str.match(r"^CZ0\d\d[\dA-Z]$") & (x.index != "CZ0999")].rename({"CZ0100": "CZ010"})  # Praha: okres = kraj
    na = (x / pop.xs(y, level="rok").h.reindex(x.index) * 1000).dropna().sort_values(ascending=False)
    cr = dg[dg.rok == y].pacienti.sum() / pop.loc[("CZ", y), "h"] * 1000
    nz = pop.xs(y, level="rok").nazev
    log(f"ASTMA dětí 0–14 (vykázaná J45) {y}: ČR {cz(cr, 1)} na 1 000 dětí; okresů {len(na)}; nejvíc "
        + ", ".join(f"{nz[k]} {cz(x_, 1)}" for k, x_ in na.head(4).items())
        + " | MSK: " + ", ".join(f"{nz[k]} {cz(na[k], 1)} ({list(na.index).index(k) + 1}.)" for k in na.index if k.startswith("CZ080")))
    C[f"astma_ostrava_{y}"] = round(na["CZ0806"], 1)
    C[f"astma_cr_{y}"] = round(cr, 1)

# f) ÚZIS: hospitalizace dětí 0–14 let pro nemoci dýchací soustavy (J00–J99), jen kontrolně
ho = pd.read_csv(NR0440, dtype={"zdg": str, "kraj_pacient": str}, usecols=["rok", "vek_kat", "kraj_pacient", "zdg", "pocet_hosp"])
ho = ho[ho.zdg.str.startswith("J") & ho.vek_kat.isin(DETI)]
for y in (2010, 2025):
    hk = ho[ho.rok == y].groupby("kraj_pacient").pocet_hosp.sum()
    hk = hk[hk.index != "CZ099"]
    mira = (hk / pop.xs(y, level="rok").h.reindex(hk.index) * 1000).sort_values(ascending=False)
    log(f"HOSPITALIZACE dětí 0–14, J00–J99, {y}: ČR {cz(ho[ho.rok == y].pocet_hosp.sum() / pop.loc[('CZ', y), 'h'] * 1000, 1)} na 1 000; "
        f"MSK {cz(mira['CZ080'], 1)} ({list(mira.index).index('CZ080') + 1}. ze 14); nejvíc {mira.index[0]} {cz(mira.iloc[0], 1)}")

# ---------------------------------------------------------------- 6) data mapy obcí
kraje = sorted(ob.kraj.dropna().unique())
SKALA = [  # horní mez (včetně) – barva z palety ThemeProvider.tsx – popisek
    (0.75, "#e9e9dd", "pod 0,75"), (1.0, "#d4d4c8", "0,75–1"),
    (1.5, "#ffb3c0", "1–1,5"), (2.0, "#ff4d70", "1,5–2"), (3.0, "#de1743", "2–3"), (None, "#8b0e2b", "nad 3"),
]
mapa = {
    "ukazatel": {"nazev": "Benzo[a]pyren", "jednotka": "ng/m³", "desetinna": 2,
                 "popis": "průměr 2021–2025 vážený obyvateli"},
    "limit": 1.0,
    "skala": [{"do": d, "barva": b, "popisek": p} for d, b, p in SKALA],
    "kraje": kraje,
    "doplnky": [
        {"nazev": "Obyvatel (2021)", "format": "pocet"},
        {"nazev": "Obyvatel nad limitem", "format": "procenta"},
        {"nazev": "PM2,5 µg/m³", "format": "desetinne1"},
        {"nazev": "Bytů topí pevnými palivy", "format": "procenta"},
    ],
    # kód obce: [název, index kraje, hodnota, obyvatel, % nad limitem, PM2,5, % bytů na pevná paliva]
    "obce": {},
    "body_nazev": "Měřicí stanice, rok 2025",
    "body": [{"n": r.lokalita, "x": round(r.x), "y": round(r.y), "v": round(r.v, 2)} for _, r in stn.iterrows()],
}
for _, r in ob.iterrows():
    if pd.isna(r.bap):
        continue
    mapa["obce"][r.kod_obce] = [r.nazev, kraje.index(r.kraj), round(r.bap, 2), int(r.obyv_sldb2021) if pd.notna(r.obyv_sldb2021) else round(r.obyv_grid2021),
                                round(100 * r.podil_obyv_bap_nad_limit), round(r.pm25_vazeny_obyv, 1),
                                round(100 * r.podil_pevna_paliva) if pd.notna(r.podil_pevna_paliva) else None]
DATA.mkdir(exist_ok=True)
(DATA / "obce-bap.json").write_text(json.dumps(mapa, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
counts = pd.cut(ob.bap, [0, 0.75, 1, 1.5, 2, 3, 99]).value_counts().sort_index()
log("MAPA: obcí", len(mapa["obce"]), "| v pásmech:", ", ".join(f"{k}: {v}" for k, v in counts.items()), "| stanic", len(mapa["body"]))

(HERE / "cisla.json").write_text(json.dumps(C, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
(HERE / "vystup.txt").write_text("\n".join(out) + "\n", encoding="utf-8")
sys.stdout.reconfigure(encoding="utf-8")
print("\n".join(out))
