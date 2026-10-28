"""Kohortní (generační) plodnost žen z věkových měr plodnosti ČSÚ.

Vstup: ČSÚ, Demografická příručka (data za rok 2024, vydáno 25. 11. 2025, kód 130055-25), tabulka 6.11
"Míry plodnosti žen podle věku v letech 1950-2024" (soubor 130055250611.xlsx; živě narození na 1 000 žen
v daném věku, věk = rozdíl kalendářního roku porodu a roku narození ženy).
Postup: kumulovaná plodnost generace narozené v roce C do věku A = součet měr plodnosti v letech C+15 ... C+A, děleno 1 000
(řádek "15" znamená 15 let a méně; skupina 45-49 je míra za jeden rok věku, proto se násobí pěti).
Výstup: data/kohorty_kumul.csv (generace, vek, plodnost), data/kohorty_prirustky.csv, vystup.txt.
Použití: python -X utf8 -I kohorty.py <130055250611.xlsx>
"""
import csv, os, sys
import openpyxl

here = os.path.dirname(os.path.abspath(__file__))
src = sys.argv[1] if len(sys.argv) > 1 else "C:/tmp/dpbp-05-07/raw/zip/130055250611.xlsx"
rows = list(openpyxl.load_workbook(src, data_only=True).worksheets[0].iter_rows(values_only=True))
years = [y for y in rows[3][1:] if isinstance(y, int)]
A = {}
for r in rows[4:35]:
    a = r[0]
    age = a if isinstance(a, int) else (15 if str(a).startswith("15") else 45)
    for y, v in zip(years, r[1:1 + len(years)]):
        A[(age, y)] = v
LAST = max(years)  # 2024


def tfr(y):
    return sum(A[(a, y)] * (5 if a == 45 else 1) for a in range(15, 46)) / 1000


assert abs(tfr(2024) - 1.3679350549) < 1e-3, "kontrola: úhrnná plodnost 2024 musí sedět s tabulkou 6.12 (1,368)"


def cum(c, upto):
    """kumulovaná plodnost generace c do věku upto (včetně); None, pokud data do roku 2024 nestačí"""
    if c + upto > LAST:
        return None
    return sum(A[(a, c + a)] * (5 if a == 45 else 1) for a in range(15, min(upto, 45) + 1)) / 1000


COHORTS = list(range(1940, 1996, 5))
out = []
with open(os.path.join(here, "data", "kohorty_kumul.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["generace", "vek", "plodnost"])
    for c in COHORTS:
        for a in range(15, 50):
            v = cum(c, a)
            if v is not None:
                w.writerow([c, a, f"{v:.4f}"])
L = []
p = L.append
p(f"Poslední rok v tabulce: {LAST}; kontrola TFR 2024 = {tfr(2024):.4f}")
p("\nKumulovaná plodnost generace do věku (roky):")
for c in [1940, 1945, 1950, 1955, 1960, 1965, 1970, 1971, 1975, 1980, 1985, 1990, 1995]:
    p(f"{c}: " + ", ".join(f"{u}: {cum(c, u):.2f}" if cum(c, u) is not None else f"{u}: -" for u in (29, 34, 39, 44, 49)))
p("\nPřírůstky plodnosti generace mezi věky (od věku+1 do věku):")
for c in range(1960, 1996, 5):
    parts = []
    for lo, hi in [(29, 39), (34, 39), (34, 44), (39, 44)]:
        a, b = cum(c, lo), cum(c, hi)
        parts.append(f"{lo + 1}-{hi}: " + (f"{b - a:.3f}" if a is not None and b is not None else "-"))
    p(f"{c}: " + "; ".join(parts))
p("\nGenerace 1990: kumulovaná plodnost do 34 let (stav konce roku 2024) = %.3f" % cum(1990, 34))
fro = sum(A[(a, 2024)] * (5 if a == 45 else 1) for a in range(35, 46)) / 1000
p("Scénář A (od 35 let míry plodnosti roku 2024 beze změny): přírůstek %.3f -> %.2f" % (fro, cum(1990, 34) + fro))
add80 = cum(1980, 44) - cum(1980, 34)
p("Scénář B (přírůstek po 34. roce jako u generace 1980): %.3f -> %.2f" % (add80, cum(1990, 34) + add80))
p("Scénář C (míry plodnosti po 34 letech o čtvrtinu nižší než v roce 2024): %.3f -> %.2f" % (fro * 0.75, cum(1990, 34) + fro * 0.75))
p("\nPodíl dětí z úhrnné plodnosti podle věku matky (míry roku, na jednu ženu):")
for y in (1990, 2000, 2010, 2019, 2021, 2024):
    t = tfr(y)
    g = lambda lo, hi: sum(A[(a, y)] * (5 if a == 45 else 1) for a in range(lo, min(hi, 45) + 1)) / 1000
    p(f"{y}: TFR {t:.3f}; do 24 let {g(15, 24):.3f} ({100 * g(15, 24) / t:.0f} %); 25-29 {g(25, 29):.3f}; 30-34 {g(30, 34):.3f}; 35-39 {g(35, 39):.3f}; 40+ {g(40, 49):.3f}; 30+ celkem {100 * g(30, 49) / t:.0f} %")
p("\nZměna věkových měr plodnosti (součet měr ve skupině) 2021 -> 2024 a 2019 -> 2024:")
for lo, hi in [(15, 19), (20, 24), (25, 29), (30, 34), (35, 39), (40, 44)]:
    g = lambda y: sum(A[(a, y)] for a in range(lo, hi + 1))
    p(f"{lo}-{hi}: 2021 {g(2021)/1000:.3f} -> 2024 {g(2024)/1000:.3f} ({100*(g(2024)/g(2021)-1):+.0f} %); 2019 {g(2019)/1000:.3f} ({100*(g(2024)/g(2019)-1):+.0f} %)")
open(os.path.join(here, "vystup.txt"), "w", encoding="utf-8").write("\n".join(L) + "\n")
print("\n".join(L))
