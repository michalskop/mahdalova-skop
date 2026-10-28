"""Článek 10 – převod tabulky ČSÚ „Projekce obyvatelstva ČR 2023–2100, Tab. 3 Střední varianta – ženy“ do CSV.

Spuštění: python -X utf8 -I xlsx_to_csv.py <1301392303.xlsx> data/zeny_stredni.csv
Sloupce: rok, vek, pocet (stav k 1. 1.; 2023 = skutečnost, od 2024 projekce).
"""
import csv
import sys

import openpyxl

src, dst = sys.argv[1], sys.argv[2]
ws = openpyxl.load_workbook(src, read_only=True, data_only=True).worksheets[0]
it = ws.iter_rows(values_only=True)
rows = list(it)
head = next(i for i, r in enumerate(rows) if r[0] and str(r[0]).startswith("Věk"))
years = [int(str(c).rstrip("*")) for c in rows[head][1:] if c is not None]
with open(dst, "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["rok", "vek", "pocet"])
    for r in rows[head + 1:]:
        if r[0] is None:
            continue
        lab = str(r[0]).strip()
        if lab.startswith("Celkem"):
            vek = "celkem"
        else:
            try:
                vek = str(int(str(lab).split()[0].replace("+", "")))
            except ValueError:
                continue
            if "+" in lab:
                vek = vek + "+"
        for y, v in zip(years, r[1:]):
            if v is not None:
                w.writerow([y, vek, int(v)])
print("OK", dst)
