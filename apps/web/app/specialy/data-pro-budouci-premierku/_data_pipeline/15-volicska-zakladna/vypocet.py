"""Čísla pro článek 15-volicska-zakladna (Kdo bude volit příští Sněmovnu).
Vstup: data/*.csv (ČSÚ, Projekce obyvatelstva ČR 2023–2100 a 2018–2100, počet obyvatel podle věku k 1. 1.).
Spuštění: python -X utf8 -I vypocet.py   (z této složky)"""
import csv, os
here = os.path.dirname(os.path.abspath(__file__))

def load(name):
    d = {}
    for r in csv.DictReader(open(os.path.join(here, "data", name), encoding="utf-8")):
        d.setdefault(int(r["rok"]), {})[r["vek"]] = int(r["pocet"])
    out = {}
    for y, a in d.items():
        ages = {int(k.rstrip("+")): v for k, v in a.items() if k != "celkem"}
        assert sum(ages.values()) == a["celkem"], (name, y)
        out[y] = ages
    return out

stredni, nizka, vysoka, p2018 = (load(f) for f in ("proj_stredni.csv", "proj_nizka.csv", "proj_vysoka.csv", "proj2018_stredni.csv"))

def podil(ages, od, do=200, zaklad_od=18):
    z = sum(v for k, v in ages.items() if k >= zaklad_od)
    return sum(v for k, v in ages.items() if od <= k <= do), z

def pct(ages, od, do=200):
    a, b = podil(ages, od, do); return 100 * a / b

print("== Podíl 50+ mezi obyvateli od 18 let (k 1. 1.) ==")
print(f"2018 skutečnost (projekce 2018: 2018*): {pct(p2018[2018], 50):.2f} %  {podil(p2018[2018], 50)}")
print(f"2023 skutečnost: {pct(stredni[2023], 50):.2f} %")
for y in (2025, 2029, 2030, 2035, 2040):
    print(f"{y} střední: {pct(stredni[y], 50):.2f} %  {podil(stredni[y], 50)} | nízká {pct(nizka[y],50):.2f} | vysoká {pct(vysoka[y],50):.2f}")
print("rozdíl 2029 (1.1.) − 2018 (1.1.):", round(pct(stredni[2029], 50) - pct(p2018[2018], 50), 2), "p. b.")
print("rozdíl 2030 (1.1.) − 2018 (1.1.):", round(pct(stredni[2030], 50) - pct(p2018[2018], 50), 2), "p. b.")

print("\n== Věkové skupiny, podíl z obyvatel 18+ ==")
for lab, od, do in (("18–29", 18, 29), ("30–49", 30, 49), ("50–64", 50, 64), ("65+", 65, 200), ("18–34", 18, 34)):
    print(lab, f"2018: {pct(p2018[2018], od, do):.1f} %", f"2029: {pct(stredni[2029], od, do):.1f} %", f"2040: {pct(stredni[2040], od, do):.1f} %")
for lab, od, do in (("18–29", 18, 29), ("30–49", 30, 49), ("50+", 50, 200)):
    a18 = podil(p2018[2018], od, do)[0]; a29 = podil(stredni[2029], od, do)[0]
    print(lab, "absolutně 2018:", a18, "2029:", a29, "změna:", a29 - a18)

print("\n== Velikost ročníků (k 1. 1. 2029, střední varianta) ==")
a = stredni[2029]
for lo, hi in ((18, 24), (25, 34), (35, 44), (45, 54), (55, 64)):
    s = [a[k] for k in range(lo, hi + 1)]
    print(f"věk {lo}–{hi}: průměr na ročník {sum(s)/len(s):,.0f}; nejmenší ročník {min(s):,} (věk {lo + s.index(min(s))})")
print("nejmenší ročník od 18 let:", min((v, k) for k, v in a.items() if k >= 18))
print("věk 18, 19, 20, 21:", [a[k] for k in (18, 19, 20, 21)])
print("\n== Voliči od 18 let celkem ==")
print("2018:", sum(v for k, v in p2018[2018].items() if k >= 18), " 2029:", sum(v for k, v in stredni[2029].items() if k >= 18), " 2040:", sum(v for k, v in stredni[2040].items() if k >= 18))

print("\n\n== Srovnání ‚leden po volbách‘: 1. 1. 2018 (skutečnost) × 1. 1. 2030 (projekce) ==")
z, c = p2018[2018], stredni[2030]
for lab, od, do in (("18–29", 18, 29), ("30–49", 30, 49), ("50+", 50, 200)):
    a, za = podil(z, od, do); b, zb = podil(c, od, do)
    print(f"{lab}: 2018 {a:,} ({100*a/za:.1f} %) → 2030 {b:,} ({100*b/zb:.1f} %), změna {b-a:+,}, podíl {100*b/zb-100*a/za:+.1f} p. b.")
print("dospělí 18+: 2018", sum(v for k, v in z.items() if k >= 18), "2030", sum(v for k, v in c.items() if k >= 18), "rozdíl", sum(v for k, v in c.items() if k >= 18) - sum(v for k, v in z.items() if k >= 18))
print("50+ podíl 2026 (1. 1.):", round(pct(stredni[2026], 50), 2), " 2027:", round(pct(stredni[2027], 50), 2))
print("nejmenší ročník 18+ v lednu 2030:", min((v, k) for k, v in c.items() if 18 <= k <= 80))
for lo, hi in ((18, 24), (25, 34)):
    s = [c[k] for k in range(lo, hi + 1)]; print(f"2030 věk {lo}–{hi}: průměr na ročník {sum(s)/len(s):,.0f}")

print("\n\n== Kohorty: nejpočetnější ročníky k 1. 1. 2018 a jejich cesta přes padesátku ==")
z2018 = p2018[2018]; s2030 = stredni[2030]
top = sorted(((v, k) for k, v in z2018.items() if k < 100), reverse=True)[:6]
for v, age in top:
    print(f"věk {age} k 1. 1. 2018 (narozeni ~{2018-age-1}/{2018-age}): {v:,}; k 1. 1. 2030 věk {age+12}: {s2030.get(age+12, 0):,}")
best = top[0]
print("nejsilnější ročník 2018:", best, "→ 2030 věk", best[1] + 12)
print("součet ročníků věk 38–49 v 2018 (přejdou přes 50 do 2030):", sum(z2018[k] for k in range(38, 50)), " | věk 50+ v 2018, kteří 2030 žijí (věk 62+):", sum(s2030[k] for k in range(62, 101)))
print("věk 62+ v 2030 =", sum(v for k, v in s2030.items() if k >= 62), "; 50–61 v 2030 =", sum(s2030[k] for k in range(50, 62)))
print("na 100 dospělých nad 50: 2018", round(100*podil(z2018,50)[0]/podil(z2018,50)[1]), " 2030", round(100*podil(s2030,50)[0]/podil(s2030,50)[1]))
print("noví voliči: věk 18–21 v 2030, průměr na ročník:", sum(s2030[k] for k in range(18, 22))/4, "; věk 18–21 v 2018:", sum(z2018[k] for k in range(18, 22))/4)
print("nejsilnější ročník 2018 vs průměr 18–21 v 2030:", best[0], sum(s2030[k] for k in range(18, 22))/4)

print("\n\n== Nejsilnější ročník 2018 (věk 43 k 1. 1. 2018) v čase ==")
for y, src, lab in ((2018, p2018, "skutečnost"), (2023, stredni, "skutečnost"), (2026, stredni, "projekce"), (2029, stredni, "projekce"), (2030, stredni, "projekce")):
    print(y, "věk", 43 + y - 2018, f"{src[y][43 + y - 2018]:,}", lab)
print("nejsilnější ročník k 1. 1. 2026 (projekce):", max((v, k) for k, v in stredni[2026].items() if k < 100))
print("50+ k 1. 1. 2026:", podil(stredni[2026], 50), round(pct(stredni[2026], 50), 2))
