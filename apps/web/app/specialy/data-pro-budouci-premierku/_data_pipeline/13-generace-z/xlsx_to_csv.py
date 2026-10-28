"""Tabulky ČSÚ 'Projekce obyvatelstva ČR 2023–2100' (XLSX, počet obyvatel podle věku k 1. 1.) → dlouhý CSV.
Použití: python -X utf8 -I xlsx_to_csv.py <vstup.xlsx> <varianta> <pohlaví> <výstup.csv>
(varianta: stredni/nizka/vysoka; pohlaví: zeny/obe). Sloupce: varianta, pohlavi, rok, vek, pocet; rok 2023 je skutečnost."""
import csv, sys
import openpyxl

src, variant, sex, dst = sys.argv[1:5]
ws = openpyxl.load_workbook(src, data_only=True).worksheets[0]
rows = list(ws.iter_rows(values_only=True))
hdr_i = next(i for i, r in enumerate(rows) if r[0] and str(r[0]).startswith("Věk"))
years = [int(str(y).rstrip("*")) for y in rows[hdr_i][1:] if y]
with open(dst, "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["varianta", "pohlavi", "rok", "vek", "pocet"])
    for r in rows[hdr_i + 1:]:
        if r[0] is None or r[1] is None:
            continue
        age = "celkem" if str(r[0]).startswith("Celkem") else str(r[0])
        for y, v in zip(years, r[1:]):
            if v is not None:
                w.writerow([variant, sex, y, age, int(v)])
