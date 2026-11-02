"""Z tabulek ČSÚ 'Ukazatele věkového složení, pohyb obyvatel, předpoklady' (Tab. 4, 8, 12 projekce 2023–2100) vybere
živě narozené a úhrnnou plodnost podle roku → data/proj_pohyb.csv.
Použití: python -X utf8 -I pohyb_z_xlsx.py <Tab4.xlsx> <Tab8.xlsx> <Tab12.xlsx>"""
import csv, os, sys
import openpyxl
here = os.path.dirname(os.path.abspath(__file__))
out = []
for src, var in zip(sys.argv[1:4], ("stredni", "nizka", "vysoka")):
    rows = list(openpyxl.load_workbook(src, data_only=True).worksheets[0].iter_rows(values_only=True))
    years = [int(str(y).rstrip("*")) for y in rows[2][1:] if y]
    for r in rows:
        if r[0] and str(r[0]).startswith("Živě narození"):
            narozeni = r[1:]
        if r[0] and str(r[0]).startswith("Úhrnná plodnost"):
            tfr = r[1:]
    for y, n, t in zip(years, narozeni, tfr):
        if n is None or t is None:
            continue
        out.append([var, y, int(n), round(t, 3)])
with open(os.path.join(here, "data", "proj_pohyb.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["varianta", "rok", "zive_narozeni", "uhrnna_plodnost"])
    w.writerows(out)
print(len(out))
