"""Všechna čísla článku 13 (generace Z, slabé ročníky) počítá tento skript z data/*.csv (původ viz README.md).
Výstup se vypisuje a ukládá do vypocet_vystup.txt. Spuštění: python -X utf8 -I vypocet.py"""
import csv, io, os

here = os.path.dirname(os.path.abspath(__file__))
out = io.StringIO()


def p(*a):
    print(*a)
    print(*a, file=out)


def rd(name):
    return list(csv.DictReader(open(os.path.join(here, "data", name), encoding="utf-8")))


cz = lambda x, nd=1: f"{x:.{nd}f}".replace(".", ",")
sp = lambda x: f"{x:,.0f}".replace(",", " ")  # tisíce s mezerou
nar = {int(r["rok"]): r for r in rd("narozeni.csv")}
zn = {y: int(float(r["zive_narozeni"])) for y, r in nar.items()}

p("== Živě narození (ČSÚ, OBY01CR) ==")
for y in (1974, 1975, 1999, 2008, 2016, 2017, 2021, 2024, 2025):
    p(f"  {y}: {zn[y]:,}".replace(",", " "))
p(f"  1999 / 1974: {cz(100 * zn[1999] / zn[1974], 0)} %;  2025 / 1974: {cz(100 * zn[2025] / zn[1974], 0)} %")
p("  roky od 1920 s méně než 91 000 narozených:", sorted(y for y in zn if zn[y] < 91000))
p("  nejnižší roky celkem:", sorted(zn.items(), key=lambda x: x[1])[:6])
p("  nejmenší počet narozených před rokem 1994 (od 1920):", min((v, y) for y, v in zn.items() if 1920 <= y < 1994))
p("  věk matky při narození 1. dítěte:", {y: round(float(nar[y]["vek_matky_1_dite"]), 1) for y in (2000, 2010, 2015, 2020, 2025) if nar[y]["vek_matky_1_dite"]})
p("  roky 1994–2002 (nejmenší, kromě 2024–2025):", [(y, zn[y]) for y in range(1993, 2004)])


def soucet(a, b):
    return sum(zn[y] for y in range(a, b + 1))


for a, b, lab in ((1986, 1995, "1986–1995"), (1996, 2005, "1996–2005"), (2006, 2015, "2006–2015"), (1993, 2002, "1993–2002")):
    p(f"  součet narozených {lab}: {soucet(a, b):,}".replace(",", " "))
p(f"  2006–2015 proti 1996–2005: {cz(100 * (soucet(2006, 2015) / soucet(1996, 2005) - 1))} %")
p("  úhrnná plodnost: 1999", nar[1999]["uhrnna_plodnost"], " 2021", nar[2021]["uhrnna_plodnost"], " 2024", nar[2024]["uhrnna_plodnost"], " 2025", nar[2025]["uhrnna_plodnost"])
p("  průměrný věk matek při narození 1. dítěte 2025:", nar[2025]["vek_matky_1_dite"])

# ---------------------------------------------------------------- ženy podle věku, projekce ČSÚ
zeny = {}
for v in ("stredni", "nizka", "vysoka"):
    d = {}
    for r in rd(f"proj_zeny_{v}.csv"):
        if r["vek"] != "celkem":
            d.setdefault(int(r["rok"]), {})[int(r["vek"].rstrip("+"))] = int(r["pocet"])
    zeny[v] = d


def z(v, y, lo, hi):
    return sum(zeny[v][y][a] for a in range(lo, hi + 1))


p("\n== Ženy ve věku 25–34 let k 1. 1. (projekce ČSÚ 2023–2100; rok 2023 = skutečnost) ==")
for v in ("stredni", "nizka", "vysoka"):
    s = {y: z(v, y, 25, 34) for y in zeny[v] if y <= 2045}  # okno 2023–2045: první dno a následný vrchol
    ymin = min(s, key=s.get)
    ymax = max((y for y in s if y > ymin), key=s.get)
    p(f"  {v}: 2023 {s[2023]:,}; 2025 {s[2025]:,}; 2026 {s[2026]:,}; první minimum {ymin}: {s[ymin]:,}; 2035 {s[2035]:,}; 2040 {s[2040]:,}; maximum do 2045 {ymax}: {s[ymax]:,}".replace(",", " "))
s = {y: z("stredni", y, 25, 34) for y in zeny["stredni"]}
p(f"  střední: 2026 → 2030 {cz(100 * (s[2030] / s[2026] - 1))} %;  2025 → 2030 {cz(100 * (s[2030] / s[2025] - 1))} %;  2030 → 2040 {cz(100 * (s[2040] / s[2030] - 1))} %;  2026 → 2040 {cz(100 * (s[2040] / s[2026] - 1))} %")
p(f"  střední: 2030 proti 2023: {cz(100 * (s[2030] / s[2023] - 1))} %")
p("  rozpětí variant v roce 2030:", z("nizka", 2030, 25, 34), "až", z("vysoka", 2030, 25, 34), "; v roce 2040:", z("nizka", 2040, 25, 34), "až", z("vysoka", 2040, 25, 34))
p("  ženy věku 30 let: 2026", zeny["stredni"][2026][30], " 2030", zeny["stredni"][2030][30], " 2040", zeny["stredni"][2040][30])
p("  ženy 25–34: 2030 jsou narozené v letech 1995/96–2005, tj. věk 25 v 2030 = ročník 2004/05 (1. 1.)")

# ---------------------------------------------------------------- narození v projekci
pr = {}
for r in rd("proj_pohyb.csv"):
    pr.setdefault(r["varianta"], {})[int(r["rok"])] = (int(r["zive_narozeni"]), float(r["uhrnna_plodnost"]))
p("\n== Živě narození v projekci ČSÚ (střední varianta, plodnost 1,50) a skutečnost ==")
for y in (2025, 2026, 2030, 2035, 2040, 2045):
    p(f"  {y}: projekce střední {pr['stredni'][y][0]:,} (plodnost {pr['stredni'][y][1]}); nízká {pr['nizka'][y][0]:,} ({pr['nizka'][y][1]}); vysoká {pr['vysoka'][y][0]:,} ({pr['vysoka'][y][1]})".replace(",", " "))
miny = min((y for y in pr["stredni"] if y <= 2045), key=lambda y: pr["stredni"][y][0])
p(f"  minimum střední varianty v letech 2023–2045: {miny}: {pr['stredni'][miny][0]:,}".replace(",", " "))
p(f"  skutečnost 2025: {sp(zn[2025])} proti projekci {sp(pr['stredni'][2025][0])}: {cz(100 * (zn[2025] / pr['stredni'][2025][0] - 1))} %")
tfr25 = float(nar[2025]["uhrnna_plodnost"])
p(f"  skutečná plodnost 2025 {cz(tfr25, 2)} proti předpokladu 1,50")
for y in (2030, 2040):
    sc = pr["stredni"][y][0] * tfr25 / 1.5
    p(f"  hrubý přepočet na plodnost {cz(tfr25, 2)} (úměrně): {y}: {sp(sc)}")

# ---------------------------------------------------------------- velikost ročníků (obě pohlaví, k 1. 1. 2030) a účast
obe = {}
for r in rd("proj_stredni_obe_pohlavi.csv"):
    if r["vek"] != "celkem":
        obe.setdefault(int(r["rok"]), {})[int(r["vek"].rstrip("+"))] = int(r["pocet"])
p("\n== Průměrná velikost ročníku podle věkových skupin (obě pohlaví, 1. 1. 2030, střední varianta) ==")
a = obe[2030]
for lo, hi in ((18, 24), (25, 34), (35, 44), (45, 54), (55, 64)):
    sz = [a[k] for k in range(lo, hi + 1)]
    p(f"  věk {lo}–{hi}: průměr na ročník {sum(sz) / len(sz):,.0f}; nejmenší ročník {min(sz):,} (věk {lo + sz.index(min(sz))})".replace(",", " "))
a26 = obe[2026]
p("  největší ročník k 1. 1. 2026 (obě pohlaví, projekce):", max((v, k) for k, v in a26.items()))
p("  k 1. 1. 2026: věk 25–34 průměr na ročník", f"{sum(a26[k] for k in range(25, 35)) / 10:,.0f}".replace(",", " "), "; věk 18–24", f"{sum(a26[k] for k in range(18, 25)) / 7:,.0f}".replace(",", " "), "; věk 35–44", f"{sum(a26[k] for k in range(35, 45)) / 10:,.0f}".replace(",", " "))

uc = {r["skupina"]: int(r["ucast_pct"]) for r in rd("ucast_hlavni_vekove_skupiny_simar_s12.csv")}
p("\n== Účast ve volbách 2025 podle věku (SIMAR, s. 12) ==", uc)
for yr in (2025, 2026):
    pop = obe[yr]
    grp = {"18–24": (18, 24), "25–34": (25, 34), "35–44": (35, 44), "45–54": (45, 54), "55–64": (55, 64), "65–74": (65, 74), "75+": (75, 200)}
    adults = sum(v for k, v in pop.items() if k >= 18)
    voters = sum(sum(pop[k] for k in pop if lo <= k <= hi) * uc[g] / 100 for g, (lo, hi) in grp.items())
    p(f"  1. 1. {yr}: odhad účasti z věkových skupin {cz(100 * voters / adults)} % (skutečná účast 68,95 %)")
    for g in ("18–24", "25–34", "35–44"):
        lo, hi = grp[g]
        n = sum(pop[k] for k in pop if lo <= k <= hi)
        p(f"    {g}: {sp(n)} lidí, {cz(100 * n / adults)} % dospělých, odhadem {cz(100 * n * uc[g] / 100 / voters)} % voličů")

open(os.path.join(here, "vypocet_vystup.txt"), "w", encoding="utf-8").write(out.getvalue())
