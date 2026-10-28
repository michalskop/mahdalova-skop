"""Počet lidí ve věku 20–64 let k 1. 1. podle tří variant projekce ČSÚ 2023–2100 (Tab. 1, 5, 9) → data/pracovni_vek_projekce.csv.
Vstup: ../15-volicska-zakladna/data/proj_{stredni,nizka,vysoka}.csv (vznikly z XLSX ČSÚ skriptem 15-volicska-zakladna/xlsx_to_csv.py,
SHA-256 XLSX viz README článku 15). Použití: python -X utf8 -I pracovni_vek.py"""
import csv, os
here = os.path.dirname(os.path.abspath(__file__))
src = os.path.normpath(os.path.join(here, "..", "15-volicska-zakladna", "data"))
with open(os.path.join(here, "data", "pracovni_vek_projekce.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["varianta", "rok", "pocet_20_64"])
    for v in ("nizka", "stredni", "vysoka"):
        s = {}
        for r in csv.DictReader(open(os.path.join(src, f"proj_{v}.csv"), encoding="utf-8")):
            if r["vek"] != "celkem" and 20 <= int(r["vek"].rstrip("+")) <= 64:
                s[int(r["rok"])] = s.get(int(r["rok"]), 0) + int(r["pocet"])
        for y in sorted(s):
            if y <= 2060:
                w.writerow([v, y, s[y]])
