"""Z otevřených dat ČSÚ OBY01CR (Počet obyvatel – dlouhodobé řady, roční data ČR) vybere živě narozené podle roku (1950–2025),
úhrnnou plodnost a podíl dětí narozených mimo manželství → data/narozeni.csv.
Použití: python -X utf8 -I prehled_narozenych.py <OBY01CR.csv>   (https://data.csu.gov.cz/opendata/sady/OBY01CR/distribuce/csv)"""
import csv, os, sys
here = os.path.dirname(os.path.abspath(__file__))
rows = list(csv.DictReader(open(sys.argv[1], encoding="utf-8")))
pick = {"4355ZN": "zive_narozeni", "5405W": "uhrnna_plodnost", "4355WPZNMM": "podil_mimo_manzelstvi_pct", "5426D1": "vek_matky_1_dite"}
tab = {}
for r in rows:
    if r["IndicatorType"] in pick:
        tab.setdefault(int(r["Roky"]), {})[pick[r["IndicatorType"]]] = float(r["Hodnota"])
with open(os.path.join(here, "data", "narozeni.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["rok"] + list(pick.values()))
    for y in sorted(tab):
        if y >= 1920:
            w.writerow([y] + [tab[y].get(c, "") for c in pick.values()])
print("hotovo", len(tab))
