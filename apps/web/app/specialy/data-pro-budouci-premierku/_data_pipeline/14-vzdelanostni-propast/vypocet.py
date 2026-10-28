"""Čísla pro článek 14-vzdelanostni-propast.

Vstupy (stažené z ČSÚ, v repozitáři nejsou; názvy, adresy a SHA-256 viz README.md):
  sldb2021_vzdelani_vek_pohlavi.csv        SLDB 2021, obyvatelé s obvyklým pobytem podle nejvyššího vzdělání, jednotek věku, pohlaví a kraje
  sldb2021_zeny_stav_vzdelani_vek_deti.csv SLDB 2021, ženy podle vzdělání, věkové skupiny a počtu dětí (ČR a kraje)
  13006926p.xlsx                           Vývoj obyvatelstva ČR 2025, krajské srovnání (Tab. 4.2, 4.3, 4.4, 4.6)

Spuštění: python -X utf8 -I vypocet.py <složka se staženými soubory>
Zapisuje data/vzdelani_kraje.csv, data/zeny_deti.csv, data/plodnost_kraje_2025.csv a tiskne čísla použitá v textu.

Definice (shodné s ČSÚ): „základní vč. neukončeného“ = kódy 002 + 003 (neúplné základní + základní); „bez vzdělání“ (001) se počítá zvlášť.
Podíly se počítají ze osob se zjištěným vzděláním (bez kódu 900 „nezjištěno“), jak to dělá ČSÚ (15+: 13,3 % ČR, kontrola níže)."""
import collections
import csv
import os
import sys

import openpyxl

src = sys.argv[1] if len(sys.argv) > 1 else "C:/tmp/dpbp-14"
here = os.path.dirname(os.path.abspath(__file__))
BASIC, UNI = {"002", "003"}, {"012", "013", "014"}
GROUPS = (("15+", 15, 200), ("25-64", 25, 64), ("25-34", 25, 34), ("55-64", 55, 64))

# ---------- 1) vzdělání podle krajů a věku ----------
agg = collections.defaultdict(collections.Counter)
for r in csv.DictReader(open(os.path.join(src, "sldb2021_vzdelani_vek_pohlavi.csv"), encoding="utf-8")):
    if r["pohlavi_kod"] != "" or r["uzemi_cis"] not in ("97", "100"):
        continue
    t = r["vek_txt"]
    a = 100 if t.startswith("100") else int(t.split()[0])
    n = int(r["hodnota"])
    for lab, lo, hi in GROUPS:
        if lo <= a <= hi:
            c = agg[(r["uzemi_txt"], lab)]
            c["celkem"] += n
            if r["vzdelani_kod"] == "900":
                c["nezjisteno"] += n
            elif r["vzdelani_kod"] == "001":
                c["bez"] += n
            elif r["vzdelani_kod"] in BASIC:
                c["zakladni"] += n
            elif r["vzdelani_kod"] in UNI:
                c["vs"] += n
with open(os.path.join(here, "data", "vzdelani_kraje.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["uzemi", "vek", "celkem", "nezjisteno", "bez_vzdelani", "zakladni_vc_neukonceneho", "vysokoskolske", "podil_zakladni_pct", "podil_vs_pct"])
    for (u, lab), c in sorted(agg.items()):
        known = c["celkem"] - c["nezjisteno"]
        w.writerow([u, lab, c["celkem"], c["nezjisteno"], c["bez"], c["zakladni"], c["vs"], round(100 * c["zakladni"] / known, 2), round(100 * c["vs"] / known, 2)])

def pct(u, lab, key):
    c = agg[(u, lab)]
    return 100 * c[key] / (c["celkem"] - c["nezjisteno"])

kraje = sorted({u for (u, _) in agg if u != "Česká republika"})
print("== Kontrola proti ČSÚ (Vzdělanostní struktura 2021, 15+): ČR základní vč. neukončeného 13,3 %, VŠ 18,7 %; Karlovarský a Ústecký nad 18 % ==")
for lab in ("15+", "25-64"):
    print(f"\n== Základní vč. neukončeného a VŠ, věk {lab} (z osob se zjištěným vzděláním) ==")
    rows = sorted(((pct(u, lab, "zakladni"), pct(u, lab, "vs"), u, agg[(u, lab)]["zakladni"], agg[(u, lab)]["celkem"] - agg[(u, lab)]["nezjisteno"]) for u in kraje + ["Česká republika"]), reverse=True)
    for z, v, u, n, k in rows:
        print(f"{u:24s} základní {z:5.1f} % ({n:>8,} z {k:>9,}) | VŠ {v:5.1f} %")
print("\n== Poměry (25–64) ==")
for u in ("Karlovarský kraj", "Ústecký kraj", "Hlavní město Praha", "Jihomoravský kraj", "Kraj Vysočina"):
    print(u, f"{pct(u,'25-64','zakladni'):.1f} % = každý {100/pct(u,'25-64','zakladni'):.1f}.")
print("Karlovarský / Praha:", round(pct("Karlovarský kraj", "25-64", "zakladni") / pct("Hlavní město Praha", "25-64", "zakladni"), 2),
      " Ústecký / Praha:", round(pct("Ústecký kraj", "25-64", "zakladni") / pct("Hlavní město Praha", "25-64", "zakladni"), 2))
print("VŠ Praha / Ústecký (25–64):", round(pct("Hlavní město Praha", "25-64", "vs") / pct("Ústecký kraj", "25-64", "vs"), 2), "; Praha / Karlovarský:", round(pct("Hlavní město Praha", "25-64", "vs") / pct("Karlovarský kraj", "25-64", "vs"), 2))
print("\n== Rozdíl mezi generacemi: základní vč. neukončeného a VŠ, 25–34 vs 55–64 ==")
for u in ("Česká republika", "Hlavní město Praha", "Ústecký kraj", "Karlovarský kraj", "Jihomoravský kraj"):
    print(f"{u:22s} základní {pct(u,'25-34','zakladni'):4.1f} % (25–34) vs {pct(u,'55-64','zakladni'):4.1f} % (55–64) | VŠ {pct(u,'25-34','vs'):4.1f} % vs {pct(u,'55-64','vs'):4.1f} %")

# ---------- 2) ženy: děti podle vzdělání a věku ----------
D = collections.defaultdict(collections.Counter)
for r in csv.DictReader(open(os.path.join(src, "sldb2021_zeny_stav_vzdelani_vek_deti.csv"), encoding="utf-8")):
    if r["stav_txt"] or not r["vzdelani_txt"] or not r["vek_txt"] or not r["pocet_deti_txt"] or r["uzemi_cis"] not in ("97", "100"):
        continue
    D[(r["uzemi_txt"], r["vzdelani_txt"], r["vek_txt"])][r["pocet_deti_txt"]] += int(r["hodnota"])
EDU = ["Základní vč. neukončeného", "Střední vč. vyučení (bez maturity)", "Úplné střední (s maturitou), vč. nástavbového a pomaturitního", "Vyšší odborné, konzervatoř", "Vysokoškolské"]
AGES = ["25 - 29 let", "30 - 34 let", "35 - 39 let", "40 - 44 let", "45 - 49 let"]

def stats(c):
    known = {k: v for k, v in c.items() if k != "Nezjištěno"}
    n = sum(known.values())
    tot = sum((10 if k.startswith("10") else int(k)) * v for k, v in known.items())
    return n, 1 - known.get("0", 0) / n, tot / n

with open(os.path.join(here, "data", "zeny_deti.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["uzemi", "vzdelani", "vek", "zen_se_zjistenym_poctem_deti", "podil_s_aspon_1_ditetem_pct", "prumer_deti_na_zenu"])
    for e in EDU:
        for a in AGES:
            n, s, m = stats(D[("Česká republika", e, a)])
            w.writerow(["Česká republika", e, a, n, round(100 * s, 2), round(m, 3)])
    for u in kraje + ["Česká republika"]:
        c = collections.Counter()
        for e in EDU + ["Bez vzdělání"]:
            c.update(D[(u, e, "45 - 49 let")])
        n, s, m = stats(c)
        w.writerow([u, "všechna (bez nezjištěného)", "45 - 49 let", n, round(100 * s, 2), round(m, 3)])
print("\n== Ženy podle vzdělání: podíl s alespoň jedním dítětem a průměr dětí (ČR) ==")
for a in AGES:
    print(a, " | ".join(f"{e[:10]} {100*stats(D[('Česká republika', e, a)])[1]:4.1f} %" for e in EDU))
for a in ("40 - 44 let", "45 - 49 let"):
    print(a, "průměr dětí:", " | ".join(f"{e[:10]} {stats(D[('Česká republika', e, a)])[2]:.2f}" for e in EDU))
print("bezdětných 45–49:", " | ".join(f"{e[:10]} {100*(1-stats(D[('Česká republika', e, '45 - 49 let')])[1]):.1f} %" for e in EDU))
print("\n== Kraje, ženy 45–49 let (všechna vzdělání): průměrný počet dětí ==")
tmp = []
for u in kraje + ["Česká republika"]:
    c = collections.Counter()
    for e in EDU + ["Bez vzdělání"]:
        c.update(D[(u, e, "45 - 49 let")])
    n, s, m = stats(c)
    tmp.append((m, u, 100 * (1 - s)))
for m, u, z in sorted(tmp, reverse=True):
    print(f"{u:24s} {m:.2f} dítěte, bezdětných {z:.1f} %")

# ---------- 3) plodnost v krajích 2025 (ČSÚ, Vývoj obyvatelstva 2025) ----------
wb = openpyxl.load_workbook(os.path.join(src, "vyvoj2025", "13006926p.xlsx"), data_only=True)

def table(name, ncols):
    out = {}
    for r in wb[name].iter_rows(values_only=True):
        if r[0] and isinstance(r[1], (int, float)):
            out[str(r[0]).strip()] = r[1:ncols]
    return out

t44 = wb["Tab 4.4"]
tfr = {str(r[0]).strip(): r for r in t44.iter_rows(values_only=True) if r[0] and isinstance(r[1], (int, float))}
t46 = {str(r[0]).strip(): r for r in wb["Tab 4.6"].iter_rows(values_only=True) if r[0] and isinstance(r[1], (int, float))}
t42 = {str(r[0]).strip(): r for r in wb["Tab 4.2"].iter_rows(values_only=True) if r[0] and isinstance(r[1], (int, float))}
t43 = {str(r[0]).strip(): r for r in wb["Tab 4.3"].iter_rows(values_only=True) if r[0] and isinstance(r[1], (int, float))}
t41 = {str(r[0]).strip(): r for r in wb["Tab 4.1"].iter_rows(values_only=True) if r[0] and isinstance(r[1], (int, float))}
with open(os.path.join(here, "data", "plodnost_kraje_2025.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["kraj", "uhrnna_plodnost_2025", "uhrnna_plodnost_2024", "prumerny_vek_matky_2025", "prumerny_vek_matky_1_dite_2025", "zive_narozeni_2025", "z_toho_4_a_dalsi_poradi", "podil_mimo_manzelstvi_2025_pct"])
    for k in tfr:
        w.writerow([k, round(tfr[k][7], 3), round(tfr[k][6], 3), round(t46[k][7], 2), round(t46[k][10], 2), int(t41[k][7]), int(t42[k][4]), round(t43[k][7], 2)])
print("\n== Plodnost a načasování podle krajů 2025 (ČSÚ, Tab. 4.1–4.6) ==")
print(f"{'kraj':18s} TFR25  TFR24  věk matky  věk 1. dítě  4.+ pořadí z narozených  mimo manželství")
for k in sorted(tfr, key=lambda k: -tfr[k][7]):
    print(f"{k:18s} {tfr[k][7]:.3f}  {tfr[k][6]:.3f}  {t46[k][7]:6.2f}   {t46[k][10]:6.2f}      {int(t42[k][4]):5d} / {int(t41[k][7]):6d} = {100*t42[k][4]/t41[k][7]:4.1f} %   {t43[k][7]:5.1f} %")
