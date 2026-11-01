"""Hrubý odhad podílu lidí od 50 let mezi voliči voleb 2025: dotazníková účast podle věku (SIMAR, s. 13; data/ucast_vek.csv)
vynásobená počtem lidí daného věku z projekce ČSÚ k 1. 1. (data/proj_stredni.csv, střední varianta).
Kontrola: odhadnutá celková účast vyjde 69,3 % (skutečná účast voleb 2025 byla 68,95 %).
Spuštění: python -X utf8 -I volici_odhad.py"""
import csv, os
here = os.path.dirname(os.path.abspath(__file__))
pop = {}
for r in csv.DictReader(open(os.path.join(here, "data", "proj_stredni.csv"), encoding="utf-8")):
    if r["vek"] != "celkem" and int(r["rok"]) in (2025, 2026):
        pop.setdefault(int(r["rok"]), {})[int(r["vek"].rstrip("+"))] = int(r["pocet"])
turnout = {}
for r in csv.DictReader(open(os.path.join(here, "data", "ucast_vek.csv"), encoding="utf-8")):
    v = r["vek"]
    lo, hi = (78, 200) if v == "78+" else map(int, v.split("–"))
    for a in range(lo, hi + 1):
        turnout[a] = int(r["ucast"]) / 100
for yr in (2025, 2026):
    p = pop[yr]
    adults = sum(v for a, v in p.items() if a >= 18)
    voters = sum(p[a] * turnout[a] for a in p if a >= 18)
    v50 = sum(p[a] * turnout[a] for a in p if a >= 50)
    a50 = sum(v for a, v in p.items() if a >= 50)
    print(f"1. 1. {yr}: od 50 let tvoří {100 * a50 / adults:.1f} % dospělých a odhadem {100 * v50 / voters:.1f} % voličů; odhadnutá účast {100 * voters / adults:.1f} %")
