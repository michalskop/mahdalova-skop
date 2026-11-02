"""Článek 09 – Páry a partnerství: čísla z Eurostatu (stažení 28. 10. 2026).

Spuštění: python -X utf8 -I vypocet.py
Výstup: data/*.csv a data/vypis.txt (všechna čísla použitá v textu).

Zdroje (veřejné JSON API Eurostatu):
  lfst_hhaceday  – dospělí podle složení domácnosti (výběrové šetření pracovních sil)
  demo_pjanmarsta – obyvatelstvo k 1. 1. podle věku, pohlaví a právního rodinného stavu
  tps00014       – průměrný věk při prvním sňatku
  demo_find      – plodnost (průměrný věk matky při 1. dítěti, podíl narozených mimo manželství, TFR)
  edat_lfse_03   – podíl lidí s terciárním vzděláním (ISCED 5–8)
"""
import json
import os
import urllib.request

BASE = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
os.makedirs(OUT, exist_ok=True)


def fetch(dataset, query):
    with urllib.request.urlopen(f"{BASE}{dataset}?format=JSON&lang=en&{query}", timeout=180) as r:
        return json.load(r)


def rows(d):
    dims, sizes = d["id"], d["size"]
    cats = {k: list(d["dimension"][k]["category"]["index"].keys()) for k in dims}
    for idx, v in d["value"].items():
        idx = int(idx)
        pos = []
        for s in reversed(sizes):
            pos.append(idx % s)
            idx //= s
        pos = pos[::-1]
        yield {dims[i]: cats[dims[i]][pos[i]] for i in range(len(dims))}, v


L = []

# 1) Podíl dospělých žijících v páru (LFS; „adult living in a couple“ = ve stejné domácnosti žije partner/ka)
d = fetch("lfst_hhaceday", "geo=CZ&geo=EU27_2020&sex=T&age=Y25-49&age=Y18-24&agechild=TOTAL&n_child=TOTAL&phhcomp=TOTAL&phhcomp=A_CPL")
t = {}
for lab, v in rows(d):
    t[(lab["geo"], lab["age"], lab["phhcomp"], lab["time"])] = v
with open(os.path.join(OUT, "zijici_v_paru_LFS.csv"), "w", encoding="utf-8") as f:
    f.write("geo,vek,rok,podil_zijicich_v_paru_pct\n")
    for (geo, age, ph, yr), v in sorted(t.items()):
        if ph == "A_CPL" and (geo, age, "TOTAL", yr) in t:
            f.write(f"{geo},{age},{yr},{100 * v / t[(geo, age, 'TOTAL', yr)]:.1f}\n")
for geo in ("CZ", "EU27_2020"):
    for age in ("Y25-49", "Y18-24"):
        yrs = sorted({k[3] for k in t if k[0] == geo and k[1] == age and k[2] == "A_CPL"})
        ser = {y: 100 * t[(geo, age, "A_CPL", y)] / t[(geo, age, "TOTAL", y)] for y in yrs}
        L.append(f"V páru, {geo}, věk {age}: " + ", ".join(f"{y} {ser[y]:.1f} %" for y in (yrs[0], "2015", "2020", yrs[-1])))

# 2) Rodinný stav lidí ve věku 25–34 let (k 1. 1.; jednoleté věky dostupné od 2014)
d = fetch("demo_pjanmarsta", "geo=CZ&sex=T&sinceTimePeriod=2014")
tab = {}
for lab, v in rows(d):
    tab[(lab["age"], lab["marsta"], lab["time"])] = v
ages = [f"Y{a}" for a in range(25, 35)]
with open(os.path.join(OUT, "rodinny_stav_25_34.csv"), "w", encoding="utf-8") as f:
    f.write("rok,obyvatel_25_34,podil_svobodnych_pct,podil_zenatych_vdanych_pct\n")
    for yr in range(2014, 2026):
        y = str(yr)
        tot = sum(tab[(a, "TOTAL", y)] for a in ages)
        sin = sum(tab[(a, "SIN", y)] for a in ages)
        mar = sum(tab[(a, "MAR", y)] for a in ages)
        f.write(f"{y},{tot},{100 * sin / tot:.1f},{100 * mar / tot:.1f}\n")
        if y in ("2014", "2025"):
            L.append(f"CZ, věk 25–34, 1. 1. {y}: svobodných {100 * sin / tot:.1f} %, ženatých/vdaných {100 * mar / tot:.1f} % (z {tot})")

# 3) Průměrný věk při prvním sňatku
d = fetch("tps00014", "geo=CZ&geo=EU27_2020")
ms = {}
for lab, v in rows(d):
    ms[(lab["indic_de"], lab["geo"], lab["time"])] = v
L.append("Průměrný věk při 1. sňatku CZ: muži " + ", ".join(f"{y} {ms[('MAGEMAR1', 'CZ', y)]}" for y in ("2013", "2023", "2024")) +
         "; ženy " + ", ".join(f"{y} {ms[('FAGEMAR1', 'CZ', y)]}" for y in ("2013", "2023", "2024")))

# 4) Plodnost
d = fetch("demo_find", "geo=CZ&geo=EU27_2020&sinceTimePeriod=1990")
fi = {}
for lab, v in rows(d):
    fi[(lab["indic_de"], lab["geo"], lab["time"])] = v
with open(os.path.join(OUT, "plodnost_CZ.csv"), "w", encoding="utf-8") as f:
    f.write("rok,vek_matky_1_dite,vek_matky_celkem,podil_mimo_manzelstvi_pct,TFR\n")
    for yr in range(1990, 2025):
        y = str(yr)
        f.write(f"{y},{fi.get(('AGEMOTH1', 'CZ', y), '')},{fi.get(('AGEMOTH', 'CZ', y), '')},{fi.get(('NMARPCT', 'CZ', y), '')},{fi.get(('TOTFERRT', 'CZ', y), '')}\n")
L.append("Věk matky při 1. dítěti CZ: " + ", ".join(f"{y} {fi[('AGEMOTH1', 'CZ', y)]}" for y in ("2000", "2010", "2020", "2024")) +
         f"; EU27 2024 {fi[('AGEMOTH1', 'EU27_2020', '2024')]}")
L.append("Mimo manželství CZ: " + ", ".join(f"{y} {fi[('NMARPCT', 'CZ', y)]} %" for y in ("2000", "2010", "2020", "2024")) +
         f"; EU27 2024 {fi[('NMARPCT', 'EU27_2020', '2024')]} %")

# 5) Vysokoškolsky vzdělané ženy
d = fetch("edat_lfse_03", "geo=CZ&sex=F&isced11=ED5-8&age=Y25-64&age=Y25-34")
ed = {}
for lab, v in rows(d):
    ed[(lab["age"], lab["time"])] = v
L.append("Ženy s terciárním vzděláním CZ, věk 25–64: " + ", ".join(f"{y} {ed[('Y25-64', y)]} %" for y in ("2001", "2007", "2021", "2025")) +
         "; věk 25–34: " + ", ".join(f"{y} {ed[('Y25-34', y)]} %" for y in ("2001", "2021", "2025")))

with open(os.path.join(OUT, "vypis.txt"), "w", encoding="utf-8") as f:
    f.write("\n".join(L) + "\n")
print("\n".join(L))
