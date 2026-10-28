"""Článek 10 – součet narozených za obce ČSÚ po letech 1971–2025.

Zdroj: ČSÚ, Databáze demografických údajů za obce ČR, část 1 (pohyb25.zip, stažení 28. 10. 2026),
https://csu.gov.cz/databaze-demografickych-udaju-za-obce-cr
Spuštění: python -X utf8 -I obce_porody.py <cesta k pohyb25.zip>
Výstup: data/porodnost_obce_soucet.csv (rok, počet obcí v souboru, narození celkem) a výpis.
Kontrola: součet za rok 2025 musí být 77 636 (ČSÚ, Statistika&My).
"""
import csv
import os
import sys
import zipfile
from collections import defaultdict
from io import BytesIO

import openpyxl

zpath = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "porodnost_obce_soucet.csv")
births = defaultdict(int)
obce = defaultdict(set)
with zipfile.ZipFile(zpath) as z:
    for name in sorted(z.namelist()):
        if not name.lower().endswith(".xlsx"):
            continue
        wb = openpyxl.load_workbook(BytesIO(z.read(name)), read_only=True, data_only=True)
        ws = wb.worksheets[0]
        for i, r in enumerate(ws.iter_rows(values_only=True)):
            if i == 0 or r[0] is None:
                continue
            try:
                y = int(r[0])
            except (TypeError, ValueError):
                continue
            v = r[5]
            if isinstance(v, (int, float)):
                births[y] += int(v)
                obce[y].add(r[1])
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["rok", "pocet_obci_v_souboru", "narozeni_soucet_obci"])
    for y in sorted(births):
        w.writerow([y, len(obce[y]), births[y]])
for y in (1971, 2000, 2021, 2024, 2025):
    print(y, len(obce[y]), births[y])
