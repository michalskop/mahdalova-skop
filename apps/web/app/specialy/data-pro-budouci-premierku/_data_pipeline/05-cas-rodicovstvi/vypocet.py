"""Čísla článku 05 (Čas rodičovství): věk prvorodičky, úhrnná plodnost, odklad mateřství (Bongaarts-Feeney), srovnání zemí.

Vstupy (stažené 28. 10. 2026 do C:/tmp/dpbp-05-07/raw, SHA-256 viz README.md):
  OBY01CR.csv             ČSÚ, Obyvatelstvo - roční časové řady (open data), úhrnná plodnost, průměrný věk matek (1. dítě, všechny porody)
  zip/130055250612.xlsx   ČSÚ, Demografická příručka (data za 2024), tab. 6.12 Úhrnná plodnost podle pořadí
  zip/130055250613.xlsx   totéž, tab. 6.13 Průměrný věk žen při narození dítěte podle pořadí
  eurostat_demo_find.json Eurostat, demo_find (AGEMOTH1, průměrný věk při narození 1. dítěte), stav 30. 9. 2026
Výstup: data/ukazatele_cr.csv, data/tempo_bf.csv, data/eurostat_vek_prvni.csv, vystup.txt
Použití: python -X utf8 -I vypocet.py [adresář se stažením, výchozí C:/tmp/dpbp-05-07/raw]
"""
import csv, json, os, sys
import openpyxl

here = os.path.dirname(os.path.abspath(__file__))
raw = sys.argv[1] if len(sys.argv) > 1 else "C:/tmp/dpbp-05-07/raw"
L = []
p = L.append

# ---------- ČSÚ časové řady
rows = list(csv.DictReader(open(os.path.join(raw, "OBY01CR.csv"), encoding="utf-8")))
ser = lambda k: {int(r["Roky"]): float(r["Hodnota"]) for r in rows if r["Ukazatel"] == k}
tfr, a1, am, lb = ser("Úhrnná plodnost"), ser("Průměrný věk matek při narození 1. dítěte"), ser("Průměrný věk matek při narození dítěte"), ser("Živě narození")
with open(os.path.join(here, "data", "ukazatele_cr.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["rok", "tfr", "vek_1_dite", "vek_vsechny", "zive_narozeni"])
    for y in range(1990, 2026):
        w.writerow([y, round(tfr[y], 4), round(a1[y], 3), round(am[y], 3), int(lb[y])])
ymin = min(tfr, key=tfr.get)
p(f"Minimum úhrnné plodnosti: {ymin} = {tfr[ymin]:.3f}; 2000 = {tfr[2000]:.3f}; 2020 = {tfr[2020]:.3f}; 2021 = {tfr[2021]:.3f}; 2025 = {tfr[2025]:.3f}")
nxt = min((v, y) for y, v in lb.items() if y != 2025)
p(f"Narození 2025: {int(lb[2025])}, nejméně v celé řadě ČSÚ od roku {min(lb)}; druhý nejnižší rok {nxt[1]} ({int(nxt[0])})")
p(f"Věk při 1. dítěti: 1990 {a1[1990]:.2f}, 2000 {a1[2000]:.2f}, 2008 {a1[2008]:.2f}, 2015 {a1[2015]:.2f}, 2020 {a1[2020]:.2f}, 2023 {a1[2023]:.2f}, 2024 {a1[2024]:.2f}, 2025 {a1[2025]:.2f}")
p(f"Posun 1990-2025: {a1[2025] - a1[1990]:.2f} roku (1990-2008: {a1[2008] - a1[1990]:.2f}; 2008-2025: {a1[2025] - a1[2008]:.2f}; 2015-2025: {a1[2025] - a1[2015]:.2f}); 1990-2023: {a1[2023] - a1[1990]:.2f}")
p(f"Věk všech matek: 1990 {am[1990]:.2f}, 2025 {am[2025]:.2f}")

# ---------- Bongaarts-Feeney (podle pořadí narození)
Z = os.path.join(raw, "zip")
def tab(fn):
    return {r[0]: r for r in openpyxl.load_workbook(os.path.join(Z, fn), data_only=True).worksheets[0].iter_rows(values_only=True) if isinstance(r[0], int)}
t12, t13 = tab("130055250612.xlsx"), tab("130055250613.xlsx")
tfr_o = {y: [t12[y][i] for i in (2, 3, 4, 5)] for y in t12 if isinstance(t12[y][2], (int, float))}
age_o = {y: [t13[y][i] for i in (2, 3, 4, 5)] for y in t13}
def bf(y):
    s = 0
    for i in range(4):
        r = (age_o[y + 1][i] - age_o[y - 1][i]) / 2  # roční změna průměrného věku při porodu daného pořadí, centrovaná
        s += tfr_o[y][i] / (1 - r)
    return s
with open(os.path.join(here, "data", "tempo_bf.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["rok", "tfr", "tfr_upravena"])
    for y in range(1993, 2024):
        w.writerow([y, f"{sum(tfr_o[y]):.4f}", f"{bf(y):.4f}"])
p("\nÚhrnná plodnost a po odečtení odkladu (Bongaarts-Feeney):")
for y in (1995, 1999, 2000, 2005, 2010, 2015, 2018, 2019, 2022, 2023):
    p(f"{y}: {sum(tfr_o[y]):.3f} -> {bf(y):.3f}  (rozdíl {bf(y) - sum(tfr_o[y]):.3f})")
p("Průměr upravené plodnosti 2000-2019: %.2f; 2015-2019: %.2f; 2022-2023: %.2f" % (
    sum(bf(y) for y in range(2000, 2020)) / 20, sum(bf(y) for y in range(2015, 2020)) / 5, (bf(2022) + bf(2023)) / 2))

v = [bf(y) for y in range(2000, 2020)]
p("Upravená plodnost 2000-2019: min %.2f, max %.2f" % (min(v), max(v)))
p("Rozdíl průměrného věku při 2. a 1. dítěti: 1990 %.2f, 2000 %.2f, 2024 %.2f roku" % (age_o[1990][1] - age_o[1990][0], age_o[2000][1] - age_o[2000][0], age_o[2024][1] - age_o[2024][0]))
p("Změna věku při 1. dítěti 2025 proti 2024: %.2f roku; 2000 proti 1999: %.2f; 2000 (centrovaně 1999-2001): %.2f" % (a1[2025] - a1[2024], a1[2000] - a1[1999], (a1[2001] - a1[1999]) / 2))

# ---------- Eurostat
d = json.load(open(os.path.join(raw, "eurostat_demo_find.json"), encoding="utf-8"))
size, ids = d["size"], d["id"]
st = [1] * len(size)
for i in range(len(size) - 2, -1, -1):
    st[i] = st[i + 1] * size[i + 1]
gi, ti = ids.index("geo"), ids.index("time")
glist = list(d["dimension"]["geo"]["category"]["index"])
glab = d["dimension"]["geo"]["category"]["label"]
tl = {v: k for k, v in d["dimension"]["time"]["category"]["index"].items()}
S = {}
for k, v in d["value"].items():
    k = int(k)
    S.setdefault(glist[(k // st[gi]) % size[gi]], {})[int(tl[(k // st[ti]) % size[ti]])] = v
cmp = sorted(((S[g][2024] - S[g][1995], g) for g in S if len(g) == 2 and g not in ("FX", "XK") and 1995 in S[g] and 2024 in S[g]), reverse=True)
with open(os.path.join(here, "data", "eurostat_vek_prvni.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["geo", "zeme", "vek_1995", "vek_2024", "posun"])
    for dv, g in cmp:
        w.writerow([g, glab[g], S[g][1995], S[g][2024], round(dv, 1)])
p(f"\nEurostat demo_find (AGEMOTH1), aktualizováno {d['updated']}; země s údaji pro 1995 i 2024: {len(cmp)}")
for i, (dv, g) in enumerate(cmp[:6], 1):
    p(f"{i}. {glab[g]}: {S[g][1995]} -> {S[g][2024]} (+{dv:.1f})")
p("Česko v Eurostatu 1995/2024: %s / %s" % (S["CZ"][1995], S["CZ"][2024]))
open(os.path.join(here, "vystup.txt"), "w", encoding="utf-8").write("\n".join(L) + "\n")
print("\n".join(L))
