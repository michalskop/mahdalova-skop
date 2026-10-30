"""Článek 08 – Politické sliby: čísla z Eurostatu (stažení 28. 10. 2026).

Spuštění: python -X utf8 -I vypocet.py
Stáhne přes veřejné JSON API Eurostatu:
  - ilc_caindformal: děti v formální péči nebo vzdělávání podle věku a počtu hodin (EU-SILC), % dětí věkové skupiny
  - lfst_hheredch: míra zaměstnanosti žen 20–49 let podle počtu dětí a věku nejmladšího dítěte (LFS)
  - demo_find: úhrnná plodnost (TOTFERRT)
a zapíše CSV do data/ a výpis čísel použitých v textu do data/vypis.txt.
"""
import json
import os
import urllib.request

BASE = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
os.makedirs(OUT, exist_ok=True)


def fetch(dataset, query):
    url = f"{BASE}{dataset}?format=JSON&lang=en&{query}"
    with urllib.request.urlopen(url, timeout=120) as r:
        return json.load(r)


def rows(d):
    dims, sizes = d["id"], d["size"]
    cats = {k: list(d["dimension"][k]["category"]["index"].keys()) for k in dims}
    for idx, v in d["value"].items():
        idx = int(idx)
        pos = []
        for s in reversed(sizes):
            pos.append(idx % s)
            idx //= s
        pos = pos[::-1]
        yield {dims[i]: cats[dims[i]][pos[i]] for i in range(len(dims))}, v


lines = []

# 1) Péče o děti do 3 let (podíl dětí, které tráví v formální péči aspoň hodinu týdně = 100 – podíl s 0 hodin)
d = fetch("ilc_caindformal", "age=Y_LT3&duration=H0&duration=H_GE30&sinceTimePeriod=2019")
tab = {}
for lab, v in rows(d):
    tab.setdefault((lab["geo"], lab["time"]), {})[lab["duration"]] = v
with open(os.path.join(OUT, "pece_do_3_let.csv"), "w", encoding="utf-8") as f:
    f.write("geo,rok,podil_v_peci_aspon_1_hod_pct,podil_30_hod_a_vice_pct\n")
    for (geo, rok), x in sorted(tab.items()):
        f.write(f"{geo},{rok},{100 - x['H0']:.1f},{x.get('H_GE30', float('nan')):.1f}\n")
for geo in ("CZ", "EU27_2020"):
    x = tab[(geo, "2025")]
    lines.append(f"Péče o děti do 3 let 2025, {geo}: aspoň 1 hod týdně {100 - x['H0']:.1f} %, 30 h a více {x['H_GE30']:.1f} %")
cz, eu = 100 - tab[("CZ", "2025")]["H0"], 100 - tab[("EU27_2020", "2025")]["H0"]
lines.append(f"Poměr EU/CZ 2025: {eu / cz:.2f}")

# pořadí zemí EU27 2025
d = fetch("ilc_caindformal", "age=Y_LT3&duration=H0&time=2025")
eu27 = {"BE","BG","CZ","DK","DE","EE","IE","EL","ES","FR","HR","IT","CY","LV","LT","LU","HU","MT","NL","AT","PL","PT","RO","SI","SK","FI","SE"}
pece = {lab["geo"]: 100 - v for lab, v in rows(d) if lab["geo"] in eu27}
nejnizsi = sorted(pece.items(), key=lambda x: x[1])[:4]
lines.append("Nejnižší pokrytí péčí do 3 let v EU27, 2025: " + ", ".join(f"{g} {v:.1f} %" for g, v in nejnizsi))

# 2) Zaměstnanost žen 20–49 s nejmladším dítětem do 6 let
d = fetch("lfst_hheredch", "sex=F&age=Y20-49&n_child=TOTAL&agechild=Y_LT6&isced11=TOTAL&time=2024&time=2025")
zam = {}
for lab, v in rows(d):
    zam.setdefault(lab["time"], {})[lab["geo"]] = v
with open(os.path.join(OUT, "zamestnanost_matek_do_6_let.csv"), "w", encoding="utf-8") as f:
    f.write("rok,geo,zamestnanost_zen_20_49_nejmladsi_dite_do_6_let_pct\n")
    for rok in sorted(zam):
        for geo, v in sorted(zam[rok].items()):
            f.write(f"{rok},{geo},{v}\n")
for rok in ("2024", "2025"):
    z = {g: v for g, v in zam[rok].items() if g in eu27}
    poradi = sorted(z.items(), key=lambda x: x[1])[:3]
    lines.append(f"Zaměstnanost žen 20–49 s dítětem do 6 let {rok}: CZ {zam[rok]['CZ']} %, EU27 {zam[rok]['EU27_2020']} %; nejnižší v EU27: " + ", ".join(f"{g} {v}" for g, v in poradi))

# 3) Úhrnná plodnost
d = fetch("demo_find", "indic_de=TOTFERRT&geo=PL&geo=CZ&sinceTimePeriod=2013")
tfr = {}
for lab, v in rows(d):
    tfr.setdefault(lab["geo"], {})[lab["time"]] = v
with open(os.path.join(OUT, "plodnost_PL_CZ.csv"), "w", encoding="utf-8") as f:
    f.write("geo,rok,uhrnna_plodnost\n")
    for geo in sorted(tfr):
        for rok, v in sorted(tfr[geo].items()):
            f.write(f"{geo},{rok},{v}\n")
lines.append("Polsko, úhrnná plodnost: " + ", ".join(f"{r} {tfr['PL'][r]}" for r in ("2015", "2016", "2017", "2019", "2024")))

with open(os.path.join(OUT, "vypis.txt"), "w", encoding="utf-8") as f:
    f.write("\n".join(lines) + "\n")
print("\n".join(lines))
