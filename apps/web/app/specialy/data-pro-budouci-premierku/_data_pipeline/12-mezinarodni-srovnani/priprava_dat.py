"""Příprava dat pro článek 12 (mezinárodní srovnání): ze stažených zdrojů vytvoří malé CSV v data/.
Vstupy (stažení 28. 10. 2026, SHA-256 v README.md):
  eurostat_tfr.json   – Eurostat demo_find, úhrnná plodnost (TOTFERRT), geo=SE,FR,HU,CZ,EU27_2020
  childcare.json      – Eurostat ilc_caindformal, děti do 3 let podle hodin formální péče (H0 = žádná)
  eu_age.json         – Eurostat demo_pjanind, střední věk a podíl 65+ (1. 1. 2024, 2025)
  pf11.xlsx           – OECD Family Database PF1.1, veřejné výdaje na rodinné dávky 2021 (% HDP)
  oby01cr.csv         – ČSÚ OBY01CR, podíl živě narozených mimo manželství
  FertilityFanScrolly/data.json – okna změn plodnosti (Světová banka/OSN), pro Kanadu
Použití: python -X utf8 -I priprava_dat.py <složka_se_stazenymi_soubory> <cesta k FertilityFanScrolly/data.json>"""
import csv, json, os, sys
import openpyxl

here = os.path.dirname(os.path.abspath(__file__))
src, fan = sys.argv[1:3]
D = os.path.join(here, "data")


def eurostat(path):
    d = json.load(open(path, encoding="utf-8"))
    ids, sizes, dm, vals = d["id"], d["size"], d["dimension"], d["value"]
    cats = {k: list(dm[k]["category"]["index"].keys()) for k in ids}
    import itertools
    for combo in itertools.product(*[range(s) for s in sizes]):
        n = 0
        for c, s in zip(combo, sizes):
            n = n * s + c
        if str(n) in vals:
            yield {k: cats[k][c] for k, c in zip(ids, combo)}, vals[str(n)]


# plodnost
with open(os.path.join(D, "plodnost_eurostat.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["geo", "rok", "uhrnna_plodnost"])
    for k, v in eurostat(os.path.join(src, "eurostat_tfr.json")):
        if int(k["time"]) >= 1995:
            w.writerow([k["geo"], k["time"], v])
# formální péče do 3 let = 100 − podíl dětí bez formální péče (H0)
with open(os.path.join(D, "pece_do_3_let_eurostat.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["geo", "rok", "bez_formalni_pece_pct", "formalni_pece_pct"])
    for k, v in eurostat(os.path.join(src, "childcare.json")):
        if k["duration"] == "H0":
            w.writerow([k["geo"], k["time"], v, round(100 - v, 1)])
with open(os.path.join(D, "vek_eurostat.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["geo", "rok", "ukazatel", "hodnota"])
    for k, v in eurostat(os.path.join(src, "eu_age.json")):
        w.writerow([k["geo"], k["time"], k["indic_de"], v])
# OECD PF1.1 (graf 2021)
ws = openpyxl.load_workbook(os.path.join(src, "pf11.xlsx"), data_only=True)["Chart PF1.1.A"]
with open(os.path.join(D, "vydaje_oecd_pf11_2021.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["zeme", "celkem_pct_hdp", "davky_pct_hdp", "sluzby_pct_hdp", "dan_pct_hdp"])
    for r in ws.iter_rows(min_row=5, values_only=True):
        if r[11] and isinstance(r[12], (int, float)):
            w.writerow([r[11]] + [round(x, 3) for x in r[12:16]])
# podíl dětí mimo manželství (ČR)
rows = list(csv.DictReader(open(os.path.join(src, "oby01cr.csv"), encoding="utf-8")))
with open(os.path.join(D, "mimo_manzelstvi_cr.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["rok", "podil_mimo_manzelstvi_pct", "zive_narozeni"])
    zn = {int(r["Roky"]): r["Hodnota"] for r in rows if r["IndicatorType"] == "4355ZN"}
    for r in rows:
        if r["IndicatorType"] == "4355WPZNMM" and int(r["Roky"]) >= 2010:
            w.writerow([r["Roky"], round(float(r["Hodnota"]), 2), zn[int(r["Roky"])]])
# Kanada z oken změn (Světová banka / OSN) – hodnoty na začátku a konci desetiletých oken
d = json.load(open(fan, encoding="utf-8-sig"))
with open(os.path.join(D, "plodnost_kanada_okna.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["rok", "uhrnna_plodnost"])
    pts = {}
    for x in d:
        if x["country"] == "Canada":
            pts[x["startYear"]] = x["start"]
            pts[x["endYear"]] = x["end"]
    for y in sorted(pts):
        w.writerow([y, pts[y]])
print("hotovo")
