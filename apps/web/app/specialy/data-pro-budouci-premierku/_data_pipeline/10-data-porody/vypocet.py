"""Článek 10 – Data o porodech: čísla ze sčítání 2021 a z projekce ČSÚ.

Spuštění: python -X utf8 -I vypocet.py <sldb2021_zeny_stav_vzdelani_vek_deti.csv> [data/zeny_stredni.csv]
Vstupy:
  1) ČSÚ, Výsledky sčítání 2021 – otevřená data, „Ženy ve věku 15 a více let podle rodinného stavu, vzdělání, věku a počtu dětí“
     (sldb2021_zeny_stav_vzdelani_vek_deti.csv, stav k 26. 3. 2021; počet dětí = počet dětí narozených ženě)
  2) data/zeny_stredni.csv z xlsx_to_csv.py (Projekce obyvatelstva ČR 2023–2100, Tab. 3 Střední varianta – ženy)
Výstupy: data/vzdelani_deti_sldb2021.csv, data/kohorty_zen.csv, data/vypis.txt
"""
import csv
import os
import sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
os.makedirs(DATA, exist_ok=True)
census_csv = sys.argv[1]
proj_csv = sys.argv[2] if len(sys.argv) > 2 else os.path.join(DATA, "zeny_stredni.csv")

L = []

# --- 1) sčítání 2021: děti podle vzdělání a věku žen (jen Česká republika, všechny rodinné stavy)
EDU = {
    "Základní vč. neukončeného": "základní",
    "Střední vč. vyučení (bez maturity)": "střední bez maturity",
    "Úplné střední (s maturitou), vč. nástavbového a pomaturitního": "střední s maturitou",
    "Vyšší odborné, konzervatoř": "vyšší odborné",
    "Vysokoškolské": "vysokoškolské",
}
cnt = defaultdict(Counter)
with open(census_csv, encoding="utf-8", newline="") as f:
    for r in csv.DictReader(f):
        if r["uzemi_cis"] != "97" or r["uzemi_kod"] != "19":
            continue
        if r["stav_txt"] != "" or r["vzdelani_txt"] not in EDU or r["pocet_deti_txt"] in ("", "Nezjištěno"):
            continue
        cnt[(r["vek_txt"], EDU[r["vzdelani_txt"]])][r["pocet_deti_txt"]] += int(r["hodnota"])

with open(os.path.join(DATA, "vzdelani_deti_sldb2021.csv"), "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f)
    w.writerow(["vek", "vzdelani", "zen", "prumer_deti", "podil_bezdetnych_pct"])
    for (vek, edu), c in sorted(cnt.items()):
        n = sum(c.values())
        if n == 0:
            continue
        mean = sum((10 if k == "10 a více" else int(k)) * x for k, x in c.items()) / n
        w.writerow([vek, edu, n, f"{mean:.2f}", f"{100 * c['0'] / n:.1f}"])
        if vek in ("25 - 29 let", "30 - 34 let", "35 - 39 let", "45 - 49 let"):
            L.append(f"SLDB 2021, ženy {vek}, {edu}: n={n}, průměr dětí {mean:.2f}, bezdětných {100 * c['0'] / n:.1f} %")

# --- 2) projekce ČSÚ: ženy podle věku (stav k 1. 1.; 2023 skutečnost, od 2024 projekce)
d = {}
with open(proj_csv, encoding="utf-8") as f:
    for r in csv.DictReader(f):
        d[(int(r["rok"]), r["vek"])] = int(r["pocet"])
coh = {x: d[(2023, str(2022 - x))] for x in range(1950, 2023)}  # kohorta = rok narození; věk k 1. 1. 2023 = 2022 – rok narození
with open(os.path.join(DATA, "kohorty_zen.csv"), "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f)
    w.writerow(["rok_narozeni", "zen_k_1_1_2023"])
    for x, v in coh.items():
        w.writerow([x, v])
top = sorted(coh.items(), key=lambda x: -x[1])[:5]
L.append("Nejpočetnější ročníky žen (k 1. 1. 2023): " + ", ".join(f"{x} {v}" for x, v in top))
for a, b in ((1980, 1984), (1985, 1989), (1990, 1994), (1995, 1999), (2000, 2004), (2005, 2009)):
    L.append(f"Ženy narozené {a}–{b}: průměr na ročník {sum(coh[x] for x in range(a, b + 1)) / 5:.0f}")


def women(y, a, b):
    return sum(d[(y, str(v))] for v in range(a, b + 1))


for y in (2023, 2025, 2030, 2035, 2040):
    L.append(f"Ženy 26–33 let k 1. 1. {y}: {women(y, 26, 33)}; ženy 23–37 let: {women(y, 23, 37)}")
L.append(f"Změna počtu žen 26–33 let 2025 → 2030: {100 * (women(2030, 26, 33) / women(2025, 26, 33) - 1):.1f} %")
L.append(f"Změna počtu žen 23–37 let 2025 → 2030: {100 * (women(2030, 23, 37) / women(2025, 23, 37) - 1):.1f} %")

open(os.path.join(DATA, "vypis.txt"), "w", encoding="utf-8").write("\n".join(L) + "\n")
print("\n".join(L))
