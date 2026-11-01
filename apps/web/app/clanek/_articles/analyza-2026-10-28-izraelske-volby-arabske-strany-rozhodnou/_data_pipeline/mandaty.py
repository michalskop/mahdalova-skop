"""Přepočet hlasů na mandáty a koaliční aritmetika – izraelské volby do 26. Knesetu (27. 10. 2026).

Zdroj: Ústřední volební komise pro volby do 26. Knesetu, výsledky po obcích expc.csv
(https://media26.bechirot.gov.il/files/expc.csv), snímek SNIMEK níže. Hlasy se sčítají přímo
ze souboru, celostátní součty se kontrolují proti přehledu na https://votes26.bechirot.gov.il/.
Výsledky jsou předběžné, definitivní vyjdou do 4. 11. 2026 – pak nahradit novým snímkem.

Metoda: uzavírací klauzule 3,25 % platných hlasů, D'Hondt (izraelsky Bader-Ofer) a dohody o přebytkových
hlasech (Likud+Náb. sionismus, Bejachad+Jisra'el bejtenu, Jašar+Demokraté, Společná kandidátka+Ra'am,
Šas+UTJ) podle Wikipedie / ÚVK.
Spuštění: python -I -X utf8 mandaty.py
"""
import csv
from pathlib import Path

# 29. 10. 2026 7:37 IST: 11 920 místností, z obálek zatím 29 253 hlasů
SNIMEK = Path(__file__).parent / "zdroj" / "vysledky_obce_2026-10-29_0737.csv"
OPRAVNENI = 7_331_981           # přehled ÚVK, beze změny od volební noci
ODEVZDANE = 5_224_730           # přehled ÚVK 29. 10. 2026 7:45
PLATNE = 5_201_559

PISMENA = {
    "מחל": "Likud", "דרך": "Jašar (Eisenkot)", "ודם": "Společná kandidátka",
    "רק": "Bejachad (Bennett)", "אמת": "Demokraté (Golan)", "ל": "Jisra'el bejtenu (Lieberman)",
    "עם": "Ra'am (Abbás)", "ג": "Sjednocený judaismus Tóry", "ב": "Ocma jehudit (Ben Gvir)",
    "שס": "Šas", "ט": "Náboženský sionismus–Zehut (Smotrič)",
    "די": "Záložníci a ekonomika (Hendel/Zelicha)", "ך": "Amcha Jisra'el (Winter)",
}
NEHLASY = {"סמל ועדה", "שם ישוב", "סמל ישוב", "בזב", "מצביעים", "פסולים", "כשרים", ""}

obce = list(csv.DictReader(open(SNIMEK, encoding="utf-8-sig")))
assert sum(int(r["מצביעים"]) for r in obce) == ODEVZDANE
assert sum(int(r["כשרים"]) for r in obce) == PLATNE
hlasy = {"ostatní": 0}
for p in obce[0]:
    if p in NEHLASY:
        continue
    n = sum(int(r[p] or 0) for r in obce)
    if p in PISMENA:
        hlasy[PISMENA[p]] = n
    else:
        hlasy["ostatní"] += n
assert sum(hlasy.values()) == PLATNE, sum(hlasy.values())
assert hlasy["Likud"] == 1_075_555 and hlasy["Ra'am (Abbás)"] == 317_999  # přehled ÚVK 7:45

prah = 0.0325 * PLATNE
nad = {k: v for k, v in hlasy.items() if v >= prah and k != "ostatní"}
DOHODY = [
    ("Likud", "Náboženský sionismus–Zehut (Smotrič)"),
    ("Bejachad (Bennett)", "Jisra'el bejtenu (Lieberman)"),
    ("Jašar (Eisenkot)", "Demokraté (Golan)"),
    ("Společná kandidátka", "Ra'am (Abbás)"),
    ("Šas", "Sjednocený judaismus Tóry"),
]


def dhondt(d, n):
    s = {k: 0 for k in d}
    for _ in range(n):
        k = max(d, key=lambda k: d[k] / (s[k] + 1))
        s[k] += 1
    return s


jednotky, vazane = {}, set()
for a, b in DOHODY:
    jednotky[f"{a} + {b}"] = {a: nad[a], b: nad[b]}
    vazane |= {a, b}
for k in nad:
    if k not in vazane:
        jednotky[k] = {k: nad[k]}
u = dhondt({k: sum(v.values()) for k, v in jednotky.items()}, 120)
mandaty = {}
for k, cl in jednotky.items():
    mandaty.update(dhondt(cl, u[k]) if len(cl) > 1 else {k: u[k]})

# mandáty podle snímku 28. 10. 2026 14:32 (shodné s médii)
OCEKAVANE = {"Likud": 26, "Jašar (Eisenkot)": 21, "Společná kandidátka": 12, "Bejachad (Bennett)": 12,
             "Demokraté (Golan)": 8, "Jisra'el bejtenu (Lieberman)": 7, "Ra'am (Abbás)": 7,
             "Sjednocený judaismus Tóry": 7, "Ocma jehudit (Ben Gvir)": 7, "Šas": 7,
             "Náboženský sionismus–Zehut (Smotrič)": 6}
print("Změny proti snímku 28. 10. 14:32:", {k: (OCEKAVANE[k], v) for k, v in mandaty.items() if OCEKAVANE.get(k) != v})

print(f"Práh 3,25 %: {prah:,.0f} hlasů")
for k, s in sorted(mandaty.items(), key=lambda x: -x[1]):
    print(f"{s:3d}  {k:42s} {hlasy[k]:>9,}  {hlasy[k] / PLATNE * 100:5.2f} %")
pod = PLATNE - sum(nad.values())
print(f"Pod prahem: {pod:,} hlasů ({pod / PLATNE * 100:.1f} %)")
print(f"Účast zatím (obálky jen zčásti): {ODEVZDANE / OPRAVNENI * 100:.1f} %")

NETANJAHU = ["Likud", "Sjednocený judaismus Tóry", "Šas", "Ocma jehudit (Ben Gvir)", "Náboženský sionismus–Zehut (Smotrič)"]
ARABSKE = ["Společná kandidátka", "Ra'am (Abbás)"]
EISENKOT = [k for k in mandaty if k not in NETANJAHU + ARABSKE]
LIEB = "Jisra'el bejtenu (Lieberman)"
m = lambda ks: sum(mandaty[k] for k in ks)
print("\nBloky:")
print(f"  Netanjahuův blok {m(NETANJAHU)} | Eisenkotův blok {m(EISENKOT)} | arabské strany {m(ARABSKE)}")
print("Scénáře (61 = většina):")
SCEN = {
    "Eisenkotův blok + obě arabské strany": EISENKOT + ARABSKE,
    "Eisenkotův blok bez Liebermana + obě arabské strany": [k for k in EISENKOT if k != LIEB] + ARABSKE,
    "Eisenkotův blok + jen Ra'am": EISENKOT + ["Ra'am (Abbás)"],
    "Netanjahuův blok + Lieberman": NETANJAHU + [LIEB],
    "Likud + Jašar (velká koalice)": ["Likud", "Jašar (Eisenkot)"],
}
for n, ks in SCEN.items():
    print(f"  {m(ks):3d}  {'ANO' if m(ks) >= 61 else 'ne '}  {n}")
