"""Tabulky ČSÚ 'Projekce obyvatelstva ČR' (XLSX) → CSV.

Dva režimy:
  vek   <vstup.xlsx> <varianta> <vystup.csv>   Tab. 1 / Tab. 5: počet obyvatel podle věku k 1. 1. (obě pohlaví)
  ukaz  <vstup.xlsx> <varianta> <vystup.csv>   Tab. 4 / Tab. 8: ukazatele věkového složení, pohyb obyvatel, předpoklady

Spuštění z této složky: python -X utf8 -I xlsx_to_csv.py vek C:/tmp/dpbp-16/1301392301.xlsx stredni2023 data/vek_stredni2023.csv
(XLSX nejsou v repozitáři; zdroje a kontrolní součty viz README.md)."""
import csv
import sys

import openpyxl

mode, src, variant, dst = sys.argv[1:5]
rows = list(openpyxl.load_workbook(src, data_only=True).worksheets[0].iter_rows(values_only=True))

if mode == "vek":
    hdr_i = next(i for i, r in enumerate(rows) if r[0] and str(r[0]).startswith("Věk"))
    years = [int(str(y).rstrip("*")) for y in rows[hdr_i][1:] if y]
    with open(dst, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["varianta", "rok", "vek", "pocet"])
        for r in rows[hdr_i + 1:]:
            if r[0] is None or r[1] is None:
                continue
            age = "celkem" if str(r[0]).startswith("Celkem") else str(r[0])
            for y, v in zip(years, r[1:]):
                if v is not None:
                    w.writerow([variant, y, age, int(v)])
elif mode == "ukaz":
    hdr_i = next(i for i, r in enumerate(rows) if r[0] and str(r[0]).startswith("Ukazatel"))
    years = [int(str(y).rstrip("*")) for y in rows[hdr_i][1:] if y]
    section = ""
    with open(dst, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["varianta", "rok", "oddil", "ukazatel", "hodnota"])
        for r in rows[hdr_i + 1:]:
            if r[0] is None:
                continue
            label = " ".join(str(r[0]).split())
            if str(r[0]).startswith("Vysvětlivky"):
                break
            if r[1] is None:
                section = label.split(" / ")[0].split(" Population")[0].split(" Proportion")[0].split(" Projection")[0]
                continue
            for y, v in zip(years, r[1:]):
                if v is not None:
                    w.writerow([variant, y, section, label, v])
else:
    raise SystemExit("režim: vek | ukaz")
