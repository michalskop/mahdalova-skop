"""Extra článek 19: Plodnost mužů v Česku 2024 (úhrnná plodnost mužů × žen, stejným postupem).

Spuštění: python -X utf8 -I plodnost_muzu.py <13006725_data.zip>
Vstup (archiv Zdrojová data/CSU/demograficka-rocenka-2024, viz ZDROJE.md): ČSÚ, Demografická ročenka ČR 2024
  D.10 Narození podle legitimity, věku otce a věku matky (2024)
  I.01 Věkové složení obyvatel podle pohlaví (k 1. 7. 2024)
  I.10 Míry plodnosti podle věku žen (na 1 000 žen) – kontrola úhrnné plodnosti žen
Výstupy: data/plodnost_muzu_2024.csv, data/plodnost_muzu_vypis.txt

Postup: míra plodnosti věkové skupiny = narozené děti / počet osob stejného pohlaví a věku k 1. 7. 2024; úhrnná plodnost
= součet mír × délka skupiny. Matky: 15–19 (včetně do 14) … 45–49 (včetně 50+). Otcové: do 19, 20–24, …, 55–59, 60+ (60+ dělíme počtem mužů ve věku 60–69
a násobíme 10 letech).
Děti s neuvedeným věkem otce (v D.10 řádek „nezjištěn“, většinou děti, u nichž otec není uveden) nelze jednoznačně přiřadit.
Tři varianty: (A) jen děti s uvedeným věkem otce = dolní mez; (B) neuvedené děti rozdělené podle rozložení věku otců u dětí se stejným věkem matky;
(C) totéž, ale podle rozložení u dětí narozených mimo manželství. Věk matky se tím nemění.
D.10 zahrnuje i mrtvě narozené, proto úhrnná plodnost žen z D.10 mírně převyšuje oficiální (I.10); rozdíl je ve výpisu.
"""
import csv
import io
import os
import sys
import zipfile

import openpyxl

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
os.makedirs(DATA, exist_ok=True)
z = zipfile.ZipFile(sys.argv[1])
L = []


def sheet(name):
    wb = openpyxl.load_workbook(io.BytesIO(z.read(name)), data_only=True)
    return [list(r) for r in wb.worksheets[0].iter_rows(values_only=True)]


def num(x):
    if x is None:
        return 0.0
    s = str(x).strip()
    return 0.0 if s in ("", "-") else float(s.replace("\xa0", "").replace(" ", ""))


# --- D.10
rows = sheet("13006725d10.xlsx")
MCOLS = ["-14", "15-19", "20-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50+"]
mar, out, unk = {}, {}, None
mode = None
for r in rows:
    lab = str(r[0] or "").replace("\n", " ").strip()
    if lab.startswith("Narození v manželství"):
        mode = mar
        continue
    if lab.startswith("Narození mimo manželství"):
        mode = out
        continue
    if lab.startswith("nezjištěn"):
        unk = [num(x) for x in r[2:11]]
        mode = None
        continue
    if mode is not None and lab and lab[0].isdigit() or (mode is not None and lab.startswith("–")):
        key = lab.replace("–", "-").replace("–", "-")
        mode[key] = [num(x) for x in r[2:11]]
FATHER_GROUPS = ["do19", "20-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54", "55-59", "60+"]


def grp(k):
    return "do19" if k in ("16-19", "-19") else k


def fa_table(d):
    t = {g: [0.0] * 9 for g in FATHER_GROUPS}
    for k, v in d.items():
        g = grp(k)
        t[g] = [a + b for a, b in zip(t[g], v)]
    return t


tm, to = fa_table(mar), fa_table(out)
known = {g: [a + b for a, b in zip(tm[g], to[g])] for g in FATHER_GROUPS}  # [otec][věk matky]
tot_m = [sum(known[g][j] for g in FATHER_GROUPS) + unk[j] for j in range(9)]  # děti podle věku matky (včetně neuvedeného otce)

# --- populace k 1. 7.
pop_rows = sheet("13006725i01.xlsx")
men, women = {}, {}
for r in pop_rows:
    if isinstance(r[0], (int, float)) and r[0] < 150:
        men[int(r[0])] = num(r[5])
        women[int(r[0])] = num(r[6])


def psum(d, a, b):
    return sum(d[x] for x in range(a, b + 1))


# --- ženy
wgroups = [(15, 19, [0, 1]), (20, 24, [2]), (25, 29, [3]), (30, 34, [4]), (35, 39, [5]), (40, 44, [6]), (45, 49, [7, 8])]
w_asfr, w_births, w_tfr = {}, {}, 0.0
for a, b, cols in wgroups:
    births = sum(tot_m[j] for j in cols)
    w_births[a] = births
    w_asfr[a] = births / psum(women, a, b)
    w_tfr += 5 * w_asfr[a]
w_mean = sum((a + 2.5) * w_births[a] * 1.0 for a, _, _ in wgroups) / sum(w_births.values())  # hrubý střed skupiny

# kontrola s I.10
i10 = sheet("13006725i10.xlsx")
tfr_off = sum(num(r[1]) for r in i10 if isinstance(r[0], (int, float)) and 15 <= r[0] <= 49) / 1000
L.append(f"Kontrola: oficiální úhrnná plodnost žen 2024 (součet měr I.10) = {tfr_off:.3f}; z D.10 (včetně mrtvě narozených) = {w_tfr:.3f}")

# --- muži: tři varianty
fa_pop = {"do19": psum(men, 15, 19), "20-24": psum(men, 20, 24), "25-29": psum(men, 25, 29), "30-34": psum(men, 30, 34),
          "35-39": psum(men, 35, 39), "40-44": psum(men, 40, 44), "45-49": psum(men, 45, 49), "50-54": psum(men, 50, 54),
          "55-59": psum(men, 55, 59), "60+": psum(men, 60, 69)}
width = {g: 5 for g in FATHER_GROUPS}
width["60+"] = 10


def male_births(variant):
    b = {g: sum(known[g]) for g in FATHER_GROUPS}
    if variant == "A":
        return b
    for j in range(9):
        if unk[j] == 0:
            continue
        if variant == "B":
            dist = {g: known[g][j] for g in FATHER_GROUPS}
        else:
            dist = {g: to[g][j] for g in FATHER_GROUPS}
        s = sum(dist.values())
        if s == 0:
            continue
        for g in FATHER_GROUPS:
            b[g] += unk[j] * dist[g] / s
    return b


res = {}
for v in ("A", "B", "C"):
    b = male_births(v)
    tfr = sum(width[g] * b[g] / fa_pop[g] for g in FATHER_GROUPS)
    mid = {"do19": 17.5, "20-24": 22.5, "25-29": 27.5, "30-34": 32.5, "35-39": 37.5, "40-44": 42.5, "45-49": 47.5, "50-54": 52.5, "55-59": 57.5, "60+": 62.5}
    rates = {g: b[g] / fa_pop[g] for g in FATHER_GROUPS}
    mean = sum(mid[g] * rates[g] * width[g] for g in FATHER_GROUPS) / sum(rates[g] * width[g] for g in FATHER_GROUPS)
    res[v] = (tfr, mean, b)
w_rates = {a: w_asfr[a] for a, _, _ in wgroups}
w_mean_asfr = sum((a + 2.5) * w_asfr[a] * 5 for a, _, _ in wgroups) / sum(w_asfr[a] * 5 for a, _, _ in wgroups)

n_unk = sum(unk)
n_all = sum(tot_m)
L.append(f"D.10: narozených celkem {int(n_all)}, z toho věk otce neuveden u {int(n_unk)} ({100 * n_unk / n_all:.1f} %)")
L.append(f"Úhrnná plodnost žen (D.10, 1. 7. 2024): {w_tfr:.2f}; průměrný věk matky při narození (z měr) {w_mean_asfr:.1f}")
for v, label in (("A", "dolní mez (jen děti s uvedeným otcem)"), ("B", "neuvedení otcové rozděleni podle věku matky"),
                 ("C", "neuvedení otcové jako u dětí mimo manželství")):
    tfr, mean, _ = res[v]
    L.append(f"Úhrnná plodnost mužů, varianta {v} ({label}): {tfr:.2f}; průměrný věk otce při narození {mean:.1f}; "
             f"poměr k ženám {100 * tfr / w_tfr:.0f} %")

# míry plodnosti podle věku (varianta B): muži vs ženy na 1 000
with open(os.path.join(DATA, "plodnost_muzu_2024.csv"), "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f)
    w.writerow(["pohlavi", "vekova_skupina", "deti_varianta_A", "deti_varianta_B", "populace_1_7_2024", "mira_na_1000_varianta_B"])
    bA, bB = res["A"][2], res["B"][2]
    for g in FATHER_GROUPS:
        w.writerow(["muži", g, round(bA[g]), round(bB[g]), int(fa_pop[g]), f"{1000 * bB[g] / fa_pop[g]:.1f}"])
    for a, bnd, cols in wgroups:
        w.writerow(["ženy", f"{a}-{bnd}", round(w_births[a]), round(w_births[a]), int(psum(women, a, bnd)), f"{1000 * w_asfr[a]:.1f}"])
for g in FATHER_GROUPS:
    L.append(f"muži {g}: míra {1000 * res['B'][2][g] / fa_pop[g]:.1f} na 1 000 (varianta B)")
for a, bnd, cols in wgroups:
    L.append(f"ženy {a}-{bnd}: míra {1000 * w_asfr[a]:.1f} na 1 000")
open(os.path.join(DATA, "plodnost_muzu_vypis.txt"), "w", encoding="utf-8").write("\n".join(L) + "\n")
print("\n".join(L))
