"""Výřez z ČSÚ 130181 (obyvatelstvo podle jednotek věku a pohlaví k 31. 12.) pro celé Česko, věk 0–19.

Plné soubory mají kolem 13 MB na rok, proto je v repu jen tenhle výřez.
Zdroj: https://csu.gov.cz/produkty/obyvatelstvo-podle-jednotek-veku-a-pohlavi-ve-spravnich-obvodech-obci-s-rozsirenou-pusobnosti
(soubory 130181-23data2009.csv … 130181-25data2024.csv, stažené 24. 10. 2026; rok 2025 ČSÚ k 25. 10. 2026 nezveřejnil).

Spuštění: python -I extract_obyvatelstvo.py <složka se soubory 130181-*data*.csv>
Výstup: vstupy/obyvatelstvo_0_19_csu.csv
"""
import csv
import os
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
src = Path(sys.argv[1])
out = Path(__file__).parent / "vstupy" / "obyvatelstvo_0_19_csu.csv"
rows = []
for fn in sorted(os.listdir(src)):
    if not fn.endswith(".csv") or "data" not in fn:
        continue
    with open(src / fn, encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            if r["uzemi_typ"] != "stát" or not r["pohlavi_txt"] or not r["vek_txt"].isdigit():
                continue
            vek = int(r["vek_txt"])
            if vek > 19:
                continue
            rows.append((r["obdobi"], "dívky" if r["pohlavi_txt"] == "žena" else "chlapci", vek, int(r["hodnota"])))
rows.sort()
with open(out, "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["stav_k", "pohlavi", "vek", "pocet"])
    w.writerows(rows)
print(f"{len(rows)} řádků → {out}")
