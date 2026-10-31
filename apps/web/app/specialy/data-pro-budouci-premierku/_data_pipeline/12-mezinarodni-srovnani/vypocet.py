"""Všechna čísla článku 12 (mezinárodní srovnání) počítá tento skript z data/*.csv (původ viz README.md).
Výstup se vypisuje a ukládá do vypocet_vystup.txt. Spuštění: python -X utf8 -I vypocet.py"""
import csv, io, json, os

here = os.path.dirname(os.path.abspath(__file__))
out = io.StringIO()


def p(*a):
    print(*a)
    print(*a, file=out)


def rd(name):
    return list(csv.DictReader(open(os.path.join(here, "data", name), encoding="utf-8")))


cz = lambda x, nd=2: f"{x:.{nd}f}".replace(".", ",")

tfr = {}
for r in rd("plodnost_eurostat.csv"):
    tfr.setdefault(r["geo"], {})[int(r["rok"])] = float(r["uhrnna_plodnost"])
kan = {int(r["rok"]): float(r["uhrnna_plodnost"]) for r in rd("plodnost_kanada_okna.csv")}
tfr["CA"] = kan  # Světová banka / OSN (okna ve FertilityFanScrolly), 2023–2024 shodné se Statistics Canada (1,27; 1,25)

p("== Úhrnná plodnost (Eurostat demo_find; Kanada: Světová banka/OSN v datech vějíře, StatCan 2023 1,27 a 2024 1,25) ==")
for g in ("SE", "FR", "HU", "CA", "CZ", "EU27_2020"):
    if g in tfr:
        p(" ", g, {y: tfr[g][y] for y in (2000, 2005, 2010, 2011, 2014, 2015, 2021, 2023, 2024) if y in tfr[g]})

p("\n== Švédsko ==")
s = tfr["SE"]
p(f"  2000 → 2010: {cz(s[2000])} → {cz(s[2010])} ({cz(s[2010] - s[2000])}); 2010 → 2024: {cz(s[2010])} → {cz(s[2024])} ({cz(s[2024] - s[2010])}); 2023: {cz(s[2023])}")
p("  nejvyšší hodnota řady 1995–2024:", max(s.items(), key=lambda x: x[1]))

p("\n== Francie ==")
f = tfr["FR"]
p("  roky s plodností aspoň 1,95:", [y for y in sorted(f) if f[y] >= 1.95], " maximum:", max(f.items(), key=lambda x: x[1]))
p(f"  2010: {cz(f[2010])}; 2014: {cz(f[2014])}; 2021: {cz(f[2021])}; 2024: {cz(f[2024])}; 2025 (INSEE Première č. 2087): 1,56 (metropolitní Francie 1,53)")
p("  roky 1995–2024 s plodností pod 1,7:", [y for y in sorted(f) if f[y] < 1.7])

p("\n== Maďarsko ==")
h = tfr["HU"]
p(f"  2011: {cz(h[2011])}; 2021: {cz(h[2021])} (+{cz(h[2021] - h[2011])}); 2023: {cz(h[2023])}; 2024: {cz(h[2024])} ({cz(h[2024] - h[2021])} od 2021); podíl nárůstu 2011–2021, který zmizel do 2024: {cz(100 * (h[2021] - h[2024]) / (h[2021] - h[2011]), 0)} %")

p("\n== Kanada ==")
k = tfr["CA"]
p(f"  2000: {cz(k[2000])}; 2008 (max.): {cz(k[2008])}; 2021: {cz(k[2021])}; 2023: {cz(k[2023])}; 2024: {cz(k[2024])}")
# kontrola z procentních změn ze StatCan Daily (24. 9. 2025): 2022 −6,9 %, 2023 −5,2 %, 2024 −1,6 %
v24 = 1.25
v23 = v24 / (1 - 0.016)
v22 = v23 / (1 - 0.052)
v21 = v22 / (1 - 0.069)
p(f"  zpětný přepočet ze změn StatCan (−1,6 %, −5,2 %, −6,9 %): 2023 {cz(v23)}, 2022 {cz(v22)}, 2021 {cz(v21)}")

p("\n== Změna 2021 → 2024 ==")
for g, nm in (("SE", "Švédsko"), ("FR", "Francie"), ("HU", "Maďarsko"), ("CA", "Kanada"), ("CZ", "Česko"), ("EU27_2020", "EU")):
    a, b = tfr[g][2021], tfr[g][2024]
    p(f"  {nm}: {cz(a)} → {cz(b)} ({cz(b - a)})")

p("\n== Veřejné výdaje na rodinné dávky 2021, % HDP (OECD PF1.1, aktualizace únor 2025) ==")
ox = {r["zeme"]: r for r in rd("vydaje_oecd_pf11_2021.csv")}
order = sorted(ox.items(), key=lambda x: -float(x[1]["celkem_pct_hdp"]))
for z in ("France", "Sweden", "Hungary", "Czechia", "Canada", "EU Average", "OECD Average"):
    p(f"  {z}: {cz(float(ox[z]['celkem_pct_hdp']))} (dávky {cz(float(ox[z]['davky_pct_hdp']))}, služby {cz(float(ox[z]['sluzby_pct_hdp']))}, daně {cz(float(ox[z]['dan_pct_hdp']))})")
rank = [z for z, _ in order if z not in ("EU Average", "OECD Average")]
p("  pořadí:", [(i + 1, z) for i, z in enumerate(rank[:8])])
p("  Francie je v pořadí OECD:", rank.index("France") + 1, "z", len(rank))

p("\n== Formální péče o děti do 3 let (Eurostat ilc_caindformal; 100 − podíl bez formální péče) ==")
pe = {}
for r in rd("pece_do_3_let_eurostat.csv"):
    pe.setdefault(r["geo"], {})[int(r["rok"])] = float(r["formalni_pece_pct"])
for g, nm in (("CZ", "Česko"), ("SE", "Švédsko"), ("FR", "Francie"), ("HU", "Maďarsko"), ("EU27_2020", "EU")):
    p(f"  {nm}: " + ", ".join(f"{y} {pe[g][y]:.1f} %".replace(".", ",") for y in (2021, 2022, 2023, 2024)))

p("\n== Střední věk a podíl 65+ (Eurostat demo_pjanind, 1. 1.) ==")
for r in rd("vek_eurostat.csv"):
    if r["rok"] == "2025":
        p(f"  {r['geo']} {r['ukazatel']}: {r['hodnota']}")
p("  Kanada: střední věk 40,6 roku a 19,5 % obyvatel od 65 let k 1. 7. 2025 (Statistics Canada, převzato ze sekundárních zdrojů – neověřeno na primárním odkazu)")

p("\n== Podíl dětí narozených mimo manželství v ČR (ČSÚ OBY01CR) ==")
mm = rd("mimo_manzelstvi_cr.csv")
p("  ", {r["rok"]: r["podil_mimo_manzelstvi_pct"] for r in mm if r["rok"] in ("2017", "2021", "2023", "2024", "2025")})
p("  maximum od roku 2010:", max(mm, key=lambda r: float(r["podil_mimo_manzelstvi_pct"])))

p("\n== Okna změn plodnosti ve FertilityFanScrolly (Světová banka / OSN) ==")
fan = json.load(open(os.path.join(here, "../../../../../components/dpbp/FertilityFanScrolly/data.json"), encoding="utf-8-sig"))
w10 = [x for x in fan if x["window"] == 10]
top = sorted(w10, key=lambda x: -x["change"])[:7]
for x in top:
    p(f"  {x['country']} {x['startYear']}–{x['endYear']}: {x['start']} → {x['end']} (+{x['change']:.2f})")
sw = [x for x in w10 if x["country"] == "Sweden" and x["startYear"] == 2000][0]
p("  Švédsko 2000–2010:", sw["start"], sw["end"], sw["change"], "; pořadí mezi", len(w10), "okny:", 1 + sum(1 for x in w10 if x["change"] > sw["change"]))
p("  počet oken s nárůstem aspoň 0,40:", sum(1 for x in w10 if x["change"] >= 0.395))
p("  okna, v nichž plodnost začínala pod 1,7 a skončila na 2,1 a víc:", [(x["country"], x["startYear"]) for x in w10 if x["start"] < 1.7 and x["end"] >= 2.1])
p("  země souboru s plodností 2,1 a víc na konci posledního okna (2024):", sorted((x["country"], x["end"]) for x in w10 if x["endYear"] == 2024 and x["end"] >= 2.1))

p("\n== Obyvatelé ve věku 20–64 let k 1. 1. (projekce ČSÚ 2023–2100, tři varianty) ==")
pv = {}
for r in rd("pracovni_vek_projekce.csv"):
    pv.setdefault(r["varianta"], {})[int(r["rok"])] = int(r["pocet_20_64"])
for v in ("nizka", "stredni", "vysoka"):
    p(f"  {v}: 2026 {pv[v][2026]:,}; 2036 {pv[v][2036]:,}; 2046 {pv[v][2046]:,}".replace(",", " "))
p("  rozdíl střední 2046 − 2026:", pv["stredni"][2046] - pv["stredni"][2026])

open(os.path.join(here, "vypocet_vystup.txt"), "w", encoding="utf-8").write(out.getvalue())
