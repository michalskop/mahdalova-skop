"""Článek 10 / cover: podíl žen s vysokoškolským vzděláním při sčítání 1991 a 2021.

Spuštění: python -X utf8 -I vysokoskolacky_1991_2021.py <tab12.xls> <sldb2021_zeny_stav_vzdelani_vek_deti.csv>
Vstupy (uložené v archivu zdrojových dat, viz Zdrojová data/CSU/ZDROJE.md):
  1) SLDB 1991, Tab. 12 „Obyvatelstvo starší 15 let podle věkových skupin, nejvyššího dokončeného stupně školního vzdělání
     a podle pohlaví“ (tab12.xls, https://csu.gov.cz/obyvatelstvo1991)
  2) SLDB 2021, otevřená data „Ženy ve věku 15 a více let podle rodinného stavu, vzdělání, věku a počtu dětí“
     (součtové řádky za Českou republiku: stav, vzdělání i počet dětí = celkem)
Výstup: data/vysokoskolacky_1991_2021.csv, data/vysokoskolacky_vypis.txt

Jmenovatel = všechny ženy dané věkové skupiny včetně těch, u nichž vzdělání nebylo zjištěno (stejně jako řádek „celkem“ ve
sčítání 1991). Věkové skupiny 1991 jsou 25–29, 30–34, 35–39, 40–49, 50–59, 60+, proto je srovnání jen v pásmech, která
se dají složit z obou sčítání (25–34, 25–59, 15 a více).
"""
import csv
import os
import sys

import xlrd

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
os.makedirs(DATA, exist_ok=True)
tab12, sldb21 = sys.argv[1], sys.argv[2]

# --- 1991: ženy podle věkových skupin (sloupce 2–9 = 15–19 … 60+, 10 = nezjištěno; 1 = celkem)
AGES91 = ["15-19", "20-24", "25-29", "30-34", "35-39", "40-49", "50-59", "60+", "nezj."]
sh = xlrd.open_workbook(tab12).sheet_by_index(0)
start = next(r for r in range(sh.nrows) if str(sh.cell_value(r, 1)).strip() == "ŽENY")
vs91 = tot91 = None
for r in range(start + 1, sh.nrows):
    label = str(sh.cell_value(r, 0)).strip()
    if label == "vysokoškolské" and vs91 is None:
        vs91 = [sh.cell_value(r, c) for c in range(1, 11)]
    if label == "celkem" and tot91 is None:
        tot91 = [sh.cell_value(r, c) for c in range(1, 11)]
        break


def num(x):
    return 0 if x in ("-", "") else float(x)


vs91 = [num(x) for x in vs91]
tot91 = [num(x) for x in tot91]
v91 = dict(zip(["celkem"] + AGES91, vs91))
t91 = dict(zip(["celkem"] + AGES91, tot91))

# --- 2021: ČR, součtové řádky (stav '' a počet dětí '')
v21, t21 = {}, {}
with open(sldb21, encoding="utf-8", newline="") as f:
    for r in csv.DictReader(f):
        if r["uzemi_cis"] != "97" or r["uzemi_kod"] != "19":
            continue
        if r["stav_txt"] != "" or r["pocet_deti_txt"] != "" or r["vek_txt"] == "":
            continue
        if r["vzdelani_txt"] == "":
            t21[r["vek_txt"]] = t21.get(r["vek_txt"], 0) + int(r["hodnota"])
        elif r["vzdelani_txt"] == "Vysokoškolské":
            v21[r["vek_txt"]] = v21.get(r["vek_txt"], 0) + int(r["hodnota"])
A21 = ["15 - 19 let", "20 - 24 let", "25 - 29 let", "30 - 34 let", "35 - 39 let", "40 - 44 let", "45 - 49 let",
       "50 - 54 let", "55 - 59 let", "60 - 64 let", "65 - 69 let", "70 - 74 let", "75 - 79 let", "80 a více let"]
assert set(A21) == set(t21), set(t21)

BANDS = {  # název: (skupiny 1991, skupiny 2021)
    "25–34 let": (["25-29", "30-34"], ["25 - 29 let", "30 - 34 let"]),
    "25–59 let": (["25-29", "30-34", "35-39", "40-49", "50-59"],
                  ["25 - 29 let", "30 - 34 let", "35 - 39 let", "40 - 44 let", "45 - 49 let", "50 - 54 let", "55 - 59 let"]),
    "15 a více let": (None, None),
}
rows, L = [], []
for name, (a91, a21) in BANDS.items():
    if a91 is None:
        n91, d91 = v91["celkem"], t91["celkem"]
        n21, d21 = sum(v21.values()), sum(t21.values())
    else:
        n91, d91 = sum(v91[a] for a in a91), sum(t91[a] for a in a91)
        n21, d21 = sum(v21[a] for a in a21), sum(t21[a] for a in a21)
    p91, p21 = 100 * n91 / d91, 100 * n21 / d21
    rows.append([name, int(n91), int(d91), f"{p91:.1f}", int(n21), int(d21), f"{p21:.1f}", f"{p21 / p91:.1f}"])
    L.append(f"Ženy {name}: 1991 {int(n91):,} z {int(d91):,} = {p91:.1f} %; 2021 {int(n21):,} z {int(d21):,} = {p21:.1f} %; "
             f"násobek {p21 / p91:.1f}×".replace(",", " "))

with open(os.path.join(DATA, "vysokoskolacky_1991_2021.csv"), "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f)
    w.writerow(["pasmo", "vs_1991", "zen_1991", "podil_1991_pct", "vs_2021", "zen_2021", "podil_2021_pct", "nasobek"])
    w.writerows(rows)

# podíl mezi ženami se známým vzděláním (kontrola citlivosti na „nezjištěno“)
nez21 = None
with open(sldb21, encoding="utf-8", newline="") as f:
    nez = 0
    for r in csv.DictReader(f):
        if (r["uzemi_cis"] == "97" and r["uzemi_kod"] == "19" and r["stav_txt"] == "" and r["pocet_deti_txt"] == ""
                and r["vzdelani_txt"] == "Nezjištěno" and r["vek_txt"] in BANDS["25–59 let"][1]):
            nez += int(r["hodnota"])
L.append(f"Kontrola: ženy 25–59 let s nezjištěným vzděláním 2021 = {nez} ({100 * nez / sum(t21[a] for a in BANDS['25–59 let'][1]):.1f} %)")
# podíly po věkových skupinách 2021 a 1991 (pro čtenáře)
for a in A21[2:9]:
    L.append(f"2021 {a}: {100 * v21[a] / t21[a]:.1f} %")
for a in AGES91[2:7]:
    L.append(f"1991 {a}: {100 * v91[a] / t91[a]:.1f} %")

open(os.path.join(DATA, "vysokoskolacky_vypis.txt"), "w", encoding="utf-8").write("\n".join(L) + "\n")
print("\n".join(L))
