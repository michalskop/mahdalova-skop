"""Ženy mezi zvolenými poslanci Poslanecké sněmovny 2002-2025 a podle stran 2025.

Vstup: registry kandidátů z otevřených dat ČSÚ (volby.cz), soubory psrk.csv (kandidáti, příznak MANDAT = zvolen) a psrkl.csv
(kandidátní listiny, název strany) z archivů PS<rok>_reg*_csv.zip (viz README.md). Otevřená data neobsahují pohlaví, proto
se žena určuje podle koncovky příjmení -ová/-á (u cizích a nepřechýlených jmen ručně ověřená výjimka v EXTRA).
Kontrola: výsledné počty (2010: 44, 2017: 44, 2021: 50, 2025: 67 žen) souhlasí s údaji ČSÚ a IPU.
Použití: python -X utf8 -I zeny_snemovna.py <adresář se staženými a rozbalenými registry: ps2002/csv ... ps25/csv>
"""
import csv, os, sys

here = os.path.dirname(os.path.abspath(__file__))
raw = sys.argv[1] if len(sys.argv) > 1 else "C:/tmp/dpbp-06/raw"
FILES = {2002: "ps2002/csv", 2006: "ps2006/csv", 2010: "ps2010/csv", 2013: "ps2013/csv", 2017: "ps2017", 2021: "ps2021/csv", 2025: "ps25/csv"}
# ženy bez příjmení na -á, ověřeno podle křestního jména a veřejně známých poslankyň
EXTRA = {"Peake", "Filipi", "Kočí", "Jacques", "Decroix", "Němečková Crkvenjaš", "Demetrashvili", "Rázga"}


def load(path):
    for enc in ("utf-8", "cp1250"):
        try:
            with open(path, encoding=enc, newline="") as f:
                return list(csv.DictReader(f, delimiter=";"))
        except UnicodeDecodeError:
            pass
    raise SystemExit(path)


def is_f(r):
    s = r["PRIJMENI"].strip()
    return s.endswith("á") or s in EXTRA


L = []
p = L.append
out = []
for y, d in FILES.items():
    rows = load(os.path.join(raw, d, "psrk.csv"))
    el = [r for r in rows if r["MANDAT"].strip() == "A"]
    fe = [r for r in el if is_f(r)]
    out.append((y, len(fe), len(el)))
    p(f"{y}: zvoleno {len(el)}, z toho žen {len(fe)} ({100 * len(fe) / len(el):.1f} %)")
with open(os.path.join(here, "data", "snemovna_zeny_podle_voleb.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["rok", "zeny", "zvoleno", "podil_pct"])
    for y, a, b in out:
        w.writerow([y, a, b, f"{100 * a / b:.1f}"])
p("Největší meziroční skok v počtu žen: " + ", ".join(f"{b[0]}: {b[1] - a[1]:+d}" for a, b in zip(out, out[1:])))

# podle stran 2025
d = FILES[2025]
rows = load(os.path.join(raw, d, "psrk.csv"))
lst = {r["KSTRANA"]: r for r in load(os.path.join(raw, d, "psrkl.csv"))}
by = {}
for r in rows:
    k = r["KSTRANA"]
    b = by.setdefault(k, {"kand": 0, "kand_z": 0, "zvol": 0, "zvol_z": 0})
    b["kand"] += 1
    b["kand_z"] += is_f(r)
    if r["MANDAT"].strip() == "A":
        b["zvol"] += 1
        b["zvol_z"] += is_f(r)
p("\nPodle stran 2025 (strany se zvolenými poslanci): zvolení / z toho ženy / podíl žen mezi kandidáty (podle příjmení)")
rowsout = []
for k, b in sorted(by.items(), key=lambda kv: -kv[1]["zvol"]):
    if b["zvol"]:
        name = lst[k]["ZKRATKAK8"].strip('"')
        p(f"{name}: {b['zvol']} zvolených, {b['zvol_z']} žen ({100 * b['zvol_z'] / b['zvol']:.0f} %); mezi kandidáty {100 * b['kand_z'] / b['kand']:.0f} % žen")
        rowsout.append([name, b["zvol"], b["zvol_z"], f"{100 * b['zvol_z'] / b['zvol']:.1f}", b["kand"], b["kand_z"], f"{100 * b['kand_z'] / b['kand']:.1f}"])
with open(os.path.join(here, "data", "snemovna_2025_strany.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["strana", "zvoleno", "zvoleno_zeny", "zvoleno_podil_pct", "kandidatu", "kandidatu_zeny", "kandidatu_podil_pct"])
    w.writerows(rowsout)
allk = sum(b["kand"] for b in by.values())
allz = sum(b["kand_z"] for b in by.values())
p(f"\nVšichni kandidáti 2025: {allk}, žen {allz} ({100 * allz / allk:.1f} %)")
open(os.path.join(here, "vystup_snemovna.txt"), "w", encoding="utf-8").write("\n".join(L) + "\n")
print("\n".join(L))
