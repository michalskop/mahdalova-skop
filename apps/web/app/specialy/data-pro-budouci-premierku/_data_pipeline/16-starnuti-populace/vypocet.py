"""Čísla pro článek 16-starnuti-populace (Jeden senior na dva lidi v produktivním věku).
Vstup: data/*.csv (ČSÚ, Projekce obyvatelstva ČR 2023–2100, Tab. 1, 4, 5, 8, 9, 12; a 2018–2100, Tab. 1).
Spuštění: python -X utf8 -I vypocet.py   (z této složky)"""
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


st, ni, vy, p18 = (load_age(f) for f in ("vek_stredni2023.csv", "vek_nizka2023.csv", "vek_vysoka2023.csv", "vek_stredni2018.csv"))
ind = load_ind("ukazatele_stredni2023.csv")
ind_n, ind_v = load_ind("ukazatele_nizka2023.csv"), load_ind("ukazatele_vysoka2023.csv")


def pick(d, section, prefix):
    """Ukazatel podle začátku názvu (v CSV je za českým názvem připojen anglický)."""
    return next(v for (s, k), v in d.items() if s == section and k.startswith(prefix))


def grp(ages, lo, hi=200):
    return sum(v for k, v in ages.items() if lo <= k <= hi)


def tot(ages):
    return sum(ages.values())


print("== Kontrola: věkové skupiny z Tab. 1 se shodují s Tab. 4 ==")
for y in (2023, 2040, 2060, 2100):
    a = st[y]
    t4 = [ind[("Počet obyvatel ve věku", k)][y] for k in ("0–14", "15–64", "65+")]
    mine = [grp(a, 0, 14), grp(a, 15, 64), grp(a, 65)]
    assert t4 == mine, (y, t4, mine)
print("OK")

print("\n== Počet obyvatel (střední varianta, k 1. 1.) ==")
for y in (2023, 2024, 2025, 2026, 2030, 2040, 2050, 2060, 2080, 2100, 2101):
    print(y, f"{tot(st[y]):,}", f"{tot(st[y])/1e6:.3f} mil.")
print("2050 vs 2023:", tot(st[2050]) - tot(st[2023]), f"{100*(tot(st[2050])/tot(st[2023])-1):.1f} %")
print("minimum počtu obyvatel (rok):", min((tot(a), y) for y, a in st.items()))

print("\n== Podíl 0–14 / 15–64 / 65+ a poměr 15–64 : 65+ (střední) ==")
for y in (2023, 2026, 2030, 2035, 2040, 2045, 2050, 2055, 2060, 2070, 2080, 2090, 2100, 2101):
    a = st[y]; t = tot(a)
    c, w, s = grp(a, 0, 14), grp(a, 15, 64), grp(a, 65)
    print(y, f"0–14 {100*c/t:.1f} | 15–64 {100*w/t:.1f} | 65+ {100*s/t:.1f} % ({s:,}) | 15–64 = {w:,} | na 1 seniora {w/s:.2f} lidí 15–64 | 65+ na 100 dětí {100*s/c:.0f}")

print("\n== Kdy poměr 15–64 : 65+ klesne pod 3,0 / 2,5 / 2,0 / 1,8 ==")
ratio = {y: grp(a, 15, 64) / grp(a, 65) for y, a in st.items()}
for thr in (3.0, 2.5, 2.0, 1.8):
    print(thr, next(y for y in sorted(ratio) if ratio[y] < thr))
print("minimum poměru:", min((r, y) for y, r in ratio.items()))

print("\n== Nejrychlejší změna: přírůstek podílu 65+ v p. b. za rok a za 5 let ==")
share = {y: 100 * grp(a, 65) / tot(a) for y, a in st.items()}
yrs = sorted(share)
ch1 = {y: share[y] - share[y - 1] for y in yrs[1:]}
print("největší roční přírůstek podílu 65+:", max((v, y) for y, v in ch1.items()))
for lo in range(2023, 2100, 5):
    hi = lo + 5
    if hi in share:
        s0, s1 = grp(st[lo], 65), grp(st[hi], 65)
        w0, w1 = grp(st[lo], 15, 64), grp(st[hi], 15, 64)
        print(f"{lo}→{hi}: podíl 65+ {share[lo]:.1f}→{share[hi]:.1f} ({share[hi]-share[lo]:+.1f} p. b.), 65+ {s1-s0:+,}, 15–64 {w1-w0:+,}")
print("největší roční přírůstek počtu 65+:", max((grp(st[y], 65) - grp(st[y - 1], 65), y) for y in yrs[1:]))
print("největší roční úbytek počtu 15–64:", min((grp(st[y], 15, 64) - grp(st[y - 1], 15, 64), y) for y in yrs[1:]))
print("počet 15–64 v 2023, nejvyšší (rok):", grp(st[2023], 15, 64), max((grp(a, 15, 64), y) for y, a in st.items()))

print("\n== Varianty projekce: podíl 65+ ==")
for y in (2040, 2050, 2060, 2100):
    out = []
    for lab, src in (("nízká", ni), ("střední", st), ("vysoká", vy)):
        a = src[y]; out.append(f"{lab} {100*grp(a,65)/tot(a):.1f} % (celkem {tot(a)/1e6:.2f} mil.; 15–64 : 65+ = {grp(a,15,64)/grp(a,65):.2f})")
    print(y, " | ".join(out))

print("\n== Předpoklady střední varianty 2023 ==")
print("TFR:", {y: round(v, 2) for y, v in pick(ind, "Předpoklady projekce", "Úhrnná plodnost").items() if y in (2023, 2030, 2050, 2100)})
print("saldo migrace:", {y: int(v) for y, v in pick(ind, "Pohyb obyvatel", "Saldo migrace").items() if y in (2023, 2024, 2025, 2026, 2028, 2030, 2050, 2100)})
print("TFR nízká/vysoká 2050:", pick(ind_n, "Předpoklady projekce", "Úhrnná plodnost")[2050], pick(ind_v, "Předpoklady projekce", "Úhrnná plodnost")[2050])
print("živě narození střední 2025, 2026:", pick(ind, "Pohyb obyvatel", "Živě narození")[2025], pick(ind, "Pohyb obyvatel", "Živě narození")[2026])

print("\n== Silné ročníky 70. let: kdy dosáhnou 65 let ==")
# věk v roce 2023 → narozen ~ 2022 − věk (stav k 1. 1. 2023 = narození v roce 2022 − věk)
byb = {y: (2022 - age) for y, age in ((2023, 0),)}
a23 = st[2023]
for born in range(1970, 1981):
    age = 2022 - born
    print(f"narození {born}: věk 1. 1. 2023 = {age}, počet {a23[age]:,}, 65 let dosáhnou v roce {born + 65}")
print("součet ročníků narozených 1970–1979 k 1. 1. 2023:", sum(a23[2022 - b] for b in range(1970, 1980)))
print("průměr ročníku 1970–1979:", sum(a23[2022 - b] for b in range(1970, 1980)) / 10, " průměr ročníků narozených 2000–2010:", sum(a23[2022 - b] for b in range(2000, 2011)) / 11)
print("nejpočetnější ročník k 1. 1. 2023:", max((v, 2022 - k) for k, v in a23.items() if k < 100), "(narození)")
print("65+ v 2035 → 2045:", grp(st[2035], 65), grp(st[2045], 65), "rozdíl", grp(st[2045], 65) - grp(st[2035], 65))
print("podíl 65+ 2035, 2045:", round(share[2035], 1), round(share[2045], 1))

print("\n== Dítě narozené v roce 2026: kdy vstoupí na trh práce ==")
print("v 15 letech:", 2026 + 15, "; v 18 letech:", 2026 + 18, "; ve 20 letech:", 2026 + 20, "; v 25 letech:", 2026 + 25)

print("\n== Souvislost s článkem 15: podíl 50+ mezi dospělými (18+) ==")
def adult_share(a, lo=50):
    return 100 * grp(a, lo) / grp(a, 18)
print("1. 1. 2018 (skutečnost, projekce 2018–2100):", round(adult_share(p18[2018]), 2))
for y in (2023, 2026, 2029, 2030, 2035, 2040):
    print(f"1. 1. {y} (projekce 2023–2100, střední):", round(adult_share(st[y]), 2))
print("počet 50+ 2018 / 2030:", grp(p18[2018], 50), grp(st[2030], 50))

print("\n== 65+ mezi dospělými ==")
print("2018:", round(100*grp(p18[2018], 65)/grp(p18[2018], 18), 1), " 2026:", round(100*grp(st[2026], 65)/grp(st[2026], 18), 1), " 2040:", round(100*grp(st[2040], 65)/grp(st[2040], 18), 1))

print("\n== Skutečnost vs projekce (ČSÚ, 31. 12. 2025 / 1. 1. 2026) ==")
print("projekce 1. 1. 2026: celkem", f"{tot(st[2026]):,}", "65+", f"{grp(st[2026],65):,}", f"{share[2026]:.1f} %")
print("skutečnost 31. 12. 2025 (ČSÚ, 18. 5. 2026): celkem 10 915 839, 65+ 2 272 755 =", round(100*2272755/10915839, 2), "%")

print("\n== Změna 2023 → 2050 (střední varianta) ==")
for lab, lo, hi in (("0–14", 0, 14), ("15–64", 15, 64), ("65+", 65, 200)):
    a, b = grp(st[2023], lo, hi), grp(st[2050], lo, hi)
    print(lab, f"{a:,} → {b:,}  ({b - a:+,}; {100*(b/a-1):+.1f} %)")
print("celkem", f"{tot(st[2023]):,} → {tot(st[2050]):,}", f"({tot(st[2050]) - tot(st[2023]):+,}; {100*(tot(st[2050])/tot(st[2023])-1):+.1f} %)")
print("TFR nízká/střední/vysoká 2030:", [round(pick(i, "Předpoklady projekce", "Úhrnná plodnost")[2030], 2) for i in (ind_n, ind, ind_v)])
print("TFR nízká/střední/vysoká 2023:", [round(pick(i, "Předpoklady projekce", "Úhrnná plodnost")[2023], 2) for i in (ind_n, ind, ind_v)])
print("saldo migrace nízká/vysoká 2030, 2050:", [(int(pick(i, "Pohyb obyvatel", "Saldo migrace")[2030]), int(pick(i, "Pohyb obyvatel", "Saldo migrace")[2050])) for i in (ind_n, ind_v)])
print("rozdíl projekce − skutečnost: narození 2025", 90582 - 77636, "; obyvatelé 1. 1. 2026", 10915839 - tot(st[2026]))
print("5letý přírůstek podílu 65+ typicky (2023–2038):", [round(share[y + 5] - share[y], 2) for y in (2023, 2028, 2033)], " v 2038–2043:", round(share[2043] - share[2038], 2))
