"""Čísla pro článek 17-migrace-demografie.
Vstup: data/*.csv (ČSÚ, Projekce obyvatelstva ČR 2018–2100: Tab. 1, 4 = střední varianta, Tab. 5, 8 = střední varianta bez migrace;
Projekce obyvatelstva ČR 2023–2100: Tab. 1, 4 = střední varianta).
Spuštění: python -X utf8 -I vypocet.py   (z této složky)

Důležité: scénář bez migrace existuje jen v projekci 2018–2100. Projekce 2023–2100 ho nemá. Srovnávat lze proto jen dvojice ze STEJNÉ
projekce (2018 střední × 2018 bez migrace). Dřívější text srovnával bez migrace 2018 (7,40 mil.) se střední variantou 2023 (9,90 mil.),
tedy dvě různé projekce s různým výchozím stavem, plodností a migrací."""
import csv
import os

here = os.path.dirname(os.path.abspath(__file__))


def load_age(name):
    d = {}
    for r in csv.DictReader(open(os.path.join(here, "data", name), encoding="utf-8")):
        d.setdefault(int(r["rok"]), {})[r["vek"]] = int(r["pocet"])
    out = {}
    for y, a in d.items():
        ages = {int(k.rstrip("+")): v for k, v in a.items() if k != "celkem"}
        assert sum(ages.values()) == a["celkem"], (name, y)
        out[y] = ages
    return out


def load_ind(name):
    d = {}
    for r in csv.DictReader(open(os.path.join(here, "data", name), encoding="utf-8")):
        d.setdefault((r["oddil"], r["ukazatel"]), {})[int(r["rok"])] = float(r["hodnota"])
    return d


def pick(d, section, prefix):
    return next(v for (s, k), v in d.items() if s == section and k.startswith(prefix))


def grp(a, lo, hi=200):
    return sum(v for k, v in a.items() if lo <= k <= hi)


def tot(a):
    return sum(a.values())


c18, n18, c23 = (load_age(f) for f in ("vek_stredni2018.csv", "vek_bezmigrace2018.csv", "vek_stredni2023.csv"))
i18, in18, i23 = (load_ind(f) for f in ("ukazatele_stredni2018.csv", "ukazatele_bezmigrace2018.csv", "ukazatele_stredni2023.csv"))

print("== 1. 1. 2101: počet obyvatel ==")
print("2018 bez migrace:", f"{tot(n18[2101]):,}")
print("2018 střední (s migrací):", f"{tot(c18[2101]):,}")
print("2023 střední:", f"{tot(c23[2101]):,}")
print("rozdíl uvnitř projekce 2018 (s migrací − bez):", f"{tot(c18[2101]) - tot(n18[2101]):,}", f"= {100*(tot(c18[2101])/tot(n18[2101])-1):.1f} %")
print("rozdíl chybně míchaný (2023 střední − 2018 bez migrace):", f"{tot(c23[2101]) - tot(n18[2101]):,}")
print("výchozí stav: 2018:", f"{tot(c18[2018]):,}", " 2023:", f"{tot(c23[2023]):,}", " rozdíl", f"{tot(c23[2023]) - tot(c18[2018]):,}")

print("\n== Podíl věkových skupin (%) – 1. 1. 2101 a vybrané roky ==")
def sh(a, lo, hi=200):
    return 100 * grp(a, lo, hi) / tot(a)
for lab, src in (("2018 bez migrace", n18), ("2018 střední", c18), ("2023 střední", c23)):
    for y in (2018 if "2018" in lab else 2023, 2040, 2060, 2100, 2101):
        a = src[y]
        print(f"{lab} {y}: 0–14 {sh(a,0,14):.1f} | 15–64 {sh(a,15,64):.1f} | 65+ {sh(a,65):.1f} % | celkem {tot(a):,}")

print("\n== Průběh počtu obyvatel: 2018 střední × bez migrace ==")
for y in (2018, 2030, 2040, 2050, 2060, 2080, 2100, 2101):
    print(y, f"s migrací {tot(c18[y]):,} | bez {tot(n18[y]):,} | rozdíl {tot(c18[y]) - tot(n18[y]):,}")

print("\n== Migrační předpoklady ==")
s18 = pick(i18, "Pohyb obyvatel", "Saldo migrace")
s23 = pick(i23, "Pohyb obyvatel", "Saldo migrace")
print("2018 střední, saldo za rok:", {y: int(s18[y]) for y in (2018, 2019, 2020, 2030, 2060, 2100) if y in s18})
print("2018 střední, součet salda 2018–2100:", f"{int(sum(v for y, v in s18.items() if y >= 2018)):,}")
print("2023 střední, saldo za rok:", {y: int(s23[y]) for y in (2023, 2024, 2025, 2026, 2027, 2028, 2030, 2060, 2100) if y in s23})
print("2023 střední, součet salda 2023–2100:", f"{int(sum(v for y, v in s23.items() if y >= 2023)):,}")
print("TFR 2018 střední (2018, 2030, 2100):", [round(pick(i18, "Předpoklady projekce", "Úhrnná plodnost")[y], 2) for y in (2018, 2030, 2100)])
print("TFR 2018 bez migrace (2018, 2030, 2100):", [round(pick(in18, "Předpoklady projekce", "Úhrnná plodnost")[y], 2) for y in (2018, 2030, 2100)])
print("TFR 2023 střední (2023, 2030, 2100):", [round(pick(i23, "Předpoklady projekce", "Úhrnná plodnost")[y], 2) for y in (2023, 2030, 2100)])
print("živě narození v roce 2060: 2018 střední", int(pick(i18, "Pohyb obyvatel", "Živě narození")[2060]), "bez migrace", int(pick(in18, "Pohyb obyvatel", "Živě narození")[2060]), " 2023 střední", int(pick(i23, "Pohyb obyvatel", "Živě narození")[2060]))

print("\n== Průměrný věk (let) ==")
for lab, d in (("2018 střední", i18), ("2018 bez migrace", in18), ("2023 střední", i23)):
    mean = next(v for (s, k), v in d.items() if k.startswith("Průměrný věk"))
    print(lab, {y: round(mean[y], 1) for y in (2018, 2023, 2060, 2100) if y in mean})

print("\n== Skutečnost 2025 (ČSÚ, 9. 10. 2026) pro srovnání s předpokladem salda ==")
print("saldo zahraniční migrace 2025: +42,0 tis. (z toho Ukrajina +23,1 tis.); živě narození 77,6 tis., zemřelí 113,3 tis. → přirozený přírůstek ≈ −35,7 tis.; celkový přírůstek +6,3 tis.")
print("Projekce 2023–2100 (střední) předpokládala pro rok 2025 saldo", int(s23[2025]), "a pro dlouhodobý předpoklad", int(s23[2030]), "ročně.")
print("Projekce 2018–2100 předpokládala saldo 26 000 ročně dlouhodobě (viz výše).")
