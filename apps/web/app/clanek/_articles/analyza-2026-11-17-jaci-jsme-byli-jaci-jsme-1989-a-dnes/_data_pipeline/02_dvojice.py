"""Jádro bloku „Česko 1989 × dnes“ – dvojice čísel spočítané z primárních tabulek ČSÚ.

Zdroj: ČSÚ, Česko od roku 1989 v číslech, aktualizace 27. 8. 2026
  https://csu.gov.cz/produkty/cesko-od-roku-1989-v-cislech-aktualizace-27-8-2026
  balík: https://csu.gov.cz/docs/107508/bd0a22e6-1df1-a4f1-86db-dcbcba592a0a/320181260827_data.zip?version=1.2
Archiv: csu-data/souhrn/cesko-od-1989/20260827/data/

Výstup: dvojice.json (stroj) + dvojice.md (přehled pro redakci).
Každá dvojice nese tabulku, přesný řádek, rok „tehdy“ a rok „dnes“ – „dnes“ je vždy
poslední rok, za který ČSÚ hodnotu vydal (u některých ukazatelů 2024 nebo 2023).
"""
import json
import os
import re
from pathlib import Path

import openpyxl

SADA = Path("souhrn/cesko-od-1989/20260827/data")
TEHDY = 1989


def najdi_archiv() -> Path:
    if os.environ.get("CSU_DATA"):
        return Path(os.environ["CSU_DATA"])
    for p in Path(__file__).resolve().parents:
        for kandidat in (p / "csu-data", p / "statisticka-data" / "cesko"):
            if kandidat.exists():
                return kandidat
    raise SystemExit("Archiv csu-data nenalezen – nastav CSU_DATA")


DATA = najdi_archiv() / SADA
_cache = {}


def list_(tab):
    if tab not in _cache:
        wb = openpyxl.load_workbook(DATA / f"32018126_{tab}.xlsx", data_only=True)
        _cache[tab] = [list(r) for r in wb.worksheets[0].iter_rows(values_only=True)]
    return _cache[tab]


def rok(v):
    m = re.match(r"\s*((19|20)\d\d)", str(v)) if v is not None else None
    return int(m.group(1)) if m else None


def num(v):
    return float(v) if isinstance(v, (int, float)) and not isinstance(v, bool) else None


def radek(tab, popisek, n=0, po=None):
    """Tabulka s roky v záhlaví sloupců. Vrátí {rok: hodnota} n-tého řádku, jehož
    popisek začíná textem `popisek` (volitelně až za řádkem začínajícím `po`)."""
    rows = list_(tab)
    # rok v záhlaví může být číslo i text s poznámkou („20251)“) – bereme oba
    jerok = lambda v: (isinstance(v, int) and 1900 < v < 2030) or (isinstance(v, str) and rok(v) is not None and 1900 < rok(v) < 2030 and len(v.strip()) <= 7)
    hlav = max(rows, key=lambda r: sum(jerok(v) for v in r))
    roky = {j: (v if isinstance(v, int) else rok(v)) for j, v in enumerate(hlav) if jerok(v)}
    aktivni = po is None
    shody = []
    prvni = min(roky)
    sp = lambda s: re.sub(r"\s+", " ", s).strip()
    popisek, po = sp(popisek), sp(po) if po else None
    for r in rows:
        lab = sp(next((str(v) for v in r[:prvni] if v not in (None, "")), ""))
        if not aktivni:
            aktivni = lab.startswith(po)
            continue
        if lab.startswith(popisek):
            shody.append(r)
    r = shody[n]
    return {roky[j]: num(r[j]) for j in roky if j < len(r) and num(r[j]) is not None}


def sloupec(tab, j):
    """Tabulka s roky v prvním sloupci. Vrátí {rok: hodnota} sloupce j."""
    out = {}
    for r in list_(tab):
        y = rok(r[0]) if r and not isinstance(r[0], float) else None
        if y and len(r) > j and num(r[j]) is not None:
            out[y] = num(r[j])
    return out


DVOJICE = []


def pridej(okruh, ukazatel, jednotka, rada, tab, pozn="", od=TEHDY, des=1):
    r0 = od if od in rada else min(rada)
    r1 = max(rada)
    v0, v1 = rada[r0], rada[r1]
    DVOJICE.append(
        dict(okruh=okruh, ukazatel=ukazatel, jednotka=jednotka, rok_tehdy=r0, tehdy=round(v0, des),
             rok_dnes=r1, dnes=round(v1, des), zmena_pomer=round(v1 / v0, 2) if v0 else None,
             tabulka=f"Tab. {tab[:2]}.{tab[2:]}", pozn=pozn, rada={k: round(v, 3) for k, v in sorted(rada.items())})
    )


# ---------- 1. Jak žijeme a umíráme (Tab. 01.01) ----------
O = "Jak žijeme a umíráme"
pridej(O, "Počet obyvatel", "tis.", radek("0101", "Počet  obyvatel"), "0101")
pridej(O, "Průměrný věk", "roky", radek("0101", "Průměrný věk"), "0101")
pridej(O, "Naděje dožití při narození – muži", "roky", radek("0101", "muži", 0, po="Naděje dožití při narození"), "0101")
pridej(O, "Naděje dožití při narození – ženy", "roky", radek("0101", "ženy", 0, po="Naděje dožití při narození"), "0101")
pridej(O, "Podíl lidí 65+", "%", radek("0101", "65 a více", 1), "0101")
pridej(O, "Podíl dětí do 14 let", "%", radek("0101", "0 - 14", 1), "0101")
pridej(O, "Kojenecká úmrtnost", "‰ (na 1 000 živě narozených)", radek("0101", "Kojenecká úmrtnost"), "0101")
pridej(O, "Cizinci trvale a dlouhodobě žijící v ČR", "osob", sloupec("0102", 1), "0102",
      pozn="sloupec Celkem (k 31. 12.); co zahrnuje (dočasná ochrana?) ověřit v pozn. 1) tabulky", des=0)

O = "Svatby, rozvody, děti"
pridej(O, "Sňatky", "počet", radek("0101", "Sňatky"), "0101", des=0)
pridej(O, "Sňatky na 1 000 obyvatel", "‰", radek("0101", "Sňatky na 1 000"), "0101")
pridej(O, "Věk svobodných nevěst", "roky", radek("0101", "Průměrný věk svobodných nevěst"), "0101")
pridej(O, "Věk svobodných ženichů", "roky", radek("0101", "Průměrný věk svobodných ženichů"), "0101")
pridej(O, "Úhrnná rozvodovost", "% manželství, která skončí rozvodem", radek("0101", "Úhrnná rozvodovost"), "0101")
pridej(O, "Rozvody", "počet", radek("0101", "Rozvody"), "0101", des=0)
pridej(O, "Živě narozené děti", "počet", radek("0101", "Živě narození"), "0101", des=0)
pridej(O, "Děti narozené mimo manželství", "%", radek("0101", "z toho mimo manželství (v %)"), "0101")
pridej(O, "Věk matky při prvním dítěti", "roky", radek("0101", "Průměrný věk matky při narození prvního"), "0101")
pridej(O, "Úhrnná plodnost", "dětí na ženu", radek("0101", "Úhrnná plodnost"), "0101", des=2)
pridej(O, "Umělá přerušení těhotenství", "počet", radek("0101", "z toho umělá přerušení"), "0101", des=0,
      pozn="poslední zveřejněný rok je dřív než u ostatních řad")
pridej(O, "Matky do 19 let", "porodů", radek("0101", "do 19 let"), "0101", des=0)

# ---------- 2. Vzdělání a práce ----------
O = "Vzdělání a práce"
pridej(O, "Studenti vysokých škol", "osob", radek("1206", "Studenti veřejných a soukromých VŠ celkem"), "1206", des=0)
pridej(O, "Veřejné vysoké školy", "počet", radek("1206", "z toho: vysoké školy veřejné"), "1206", des=0)
pridej(O, "Soukromé vysoké školy", "počet", radek("1206", "vysoké školy soukromé"), "1206", des=0,
      pozn="řada až od roku 1999; v roce 1989 soukromé VŠ neexistovaly (první vznikly po zákoně 1998)")
pridej(O, "Podíl zemědělství na hrubé přidané hodnotě", "%", radek("0402", "A  Zemědělství"), "0402", od=1990)
pridej(O, "Podíl zpracovatelského průmyslu na HPH", "%", radek("0402", "C Zpracovatelský"), "0402", od=1990)
pridej(O, "Podíl ICT na HPH", "%", radek("0402", "J Informační"), "0402", od=1990)
pridej(O, "Pracující na vlastní účet (živnostníci bez zaměstnanců)", "tis.", radek("0501", "pracující na vlastní účet"), "0501", od=1993,
      pozn="VŠPS až od 1993")

# ---------- 3. Peníze a bydlení ----------
O = "Peníze a bydlení"
pridej(O, "Průměrná hrubá mzda", "Kčs/Kč měsíčně", sloupec("1307", 2), "1307", des=0,
      pozn="všeobecný vyměřovací základ = průměrná mzda dle ČSÚ (MPSV)")
pridej(O, "Průměrná čistá mzda", "Kčs/Kč měsíčně", sloupec("1307", 3), "1307", des=0)
pridej(O, "Průměrný starobní důchod", "Kčs/Kč měsíčně", sloupec("1307", 1), "1307", des=0)
pridej(O, "Dokončené byty za rok", "počet", radek("1101", "Dokončené byty celkem"), "1101", des=0)
pridej(O, "Obytná plocha nového bytu", "m²", radek("1101", "Obytná plocha  1 dokončeného bytu"), "1101")
pridej(O, "Domácnosti s počítačem", "%", radek("0803", "Domácnosti s osobním počítačem"), "0803")
pridej(O, "Pevné telefonní linky na 100 obyvatel", "linek", sloupec("0802", 2), "0802")

# Kupní síla: kolik kusů koupí průměrná čistá mzda (Tab. 03.04 ceny × Tab. 13.07 čistá mzda)
cista = sloupec("1307", 3)

# Reálná mzda: řetězení meziročních indexů reálné mzdy (Tab. 13.08, předchozí rok = 100), 1989 = 100
idx = sloupec("1308", 1)
realna = {1989: 100.0}
for y in sorted(idx):
    realna[y] = realna[y - 1] * idx[y] / 100
pridej(O, "Reálná mzda (kupní síla), 1989 = 100", "index", realna, "1308",
      pozn="řetězené meziroční indexy reálné mzdy; 1990–93 civilní sektor, do 2000 na fyzickou osobu; 2025 předběžně")

ZBOZI = [  # (začátek názvu v Tab. 03.04, jednotka, trvanlivé zboží → počítat v měsíčních mzdách)
    ("Chléb konzumní kmínový", "kg chleba", False),
    ("Máslo čerstvé", "kg másla", False),
    ("Mléko polotučné", "l mléka", False),
    ("Vejce slepičí", "vajec (ks)", False),
    ("Pivo výčepní", "lahví piva", False),
    ("Benzin automobilový", "l benzinu", False),
    ("Vstupenka do kina", "lístků do kina", False),
    ("Pánský kadeřník", "stříhání", False),
    ("Jednotlivé jízdné v MHD", "jízdenek MHD", False),
    ("Elektrická chladnička", "čistých měsíčních mezd", True),
    ("Automatická bubnová pračka", "čistých měsíčních mezd", True),
    ("Jízdní kolo", "čistých měsíčních mezd", True),
    ("Automobil Škoda", "čistých měsíčních mezd", True),
]
O = "Co koupí čistá mzda"
for nazev, jedn, trvanlive in ZBOZI:
    cena = radek("0304", nazev)
    if trvanlive:
        rada = {y: c / cista[y] for y, c in cena.items() if y in cista}
        popis = f"{nazev} – kolik stojí čistých mezd"
    else:
        rada = {y: cista[y] / c for y, c in cena.items() if y in cista and c}
        popis = f"{nazev} – kolik koupí čistá mzda"
    pridej(O, popis, jedn, rada, "0304+1307", des=2 if trvanlive else 0,
          pozn=f"cena {TEHDY}: {cena.get(TEHDY)} Kčs, cena {max(cena)}: {cena[max(cena)]} Kč; výrobky se kvalitou liší")

# ---------- 4. Volný čas a spotřeba ----------
O = "Volný čas a spotřeba"
pridej(O, "Pivo na obyvatele", "l/rok", radek("0303", "Pivo"), "0303")
pridej(O, "Víno na obyvatele", "l/rok", radek("0303", "Víno"), "0303")
pridej(O, "Hovězí maso na obyvatele", "kg/rok", radek("0302", "hovězí maso"), "0302")
pridej(O, "Drůbež na obyvatele", "kg/rok", radek("0302", "drůbeží"), "0302")
pridej(O, "Jižní ovoce na obyvatele", "kg/rok", radek("0302", "Jižní ovoce"), "0302")
pridej(O, "Banány na obyvatele", "kg/rok", radek("0302", "banány"), "0302")
pridej(O, "Návštěvy kin", "tis. za rok", radek("1209", "Návštěvníci v tis.", 0, po="KINA celkem"), "1209", des=0)
pridej(O, "Kina", "počet", radek("1209", "KINA celkem"), "1209", des=0)
pridej(O, "Divadla se stálým souborem", "počet", radek("1209", "DIVADLA"), "1209", des=0)
pridej(O, "Hosté v ubytovacích zařízeních", "tis.", radek("1001", "Hosté v tis. osob"), "1001", des=0)
pridej(O, "z toho zahraniční hosté", "tis.", radek("1001", "nerezidenti"), "1001", des=0)

# ---------- 5. Prostředí a bezpečí ----------
O = "Prostředí a bezpečí"
pridej(O, "Emise oxidu siřičitého (SO₂), všechny zdroje", "tis. t", sloupec("0204", 6), "0204", od=1990,
      pozn="REZZO 1–4, řada od 1990; poslední rok předběžný")
pridej(O, "Emise prachu (TZL), všechny zdroje", "tis. t", sloupec("0204", 5), "0204", od=1990,
      pozn="REZZO 1–4, řada od 1990; poslední rok předběžný")
pridej(O, "Národní parky", "počet", radek("0203", "národní parky"), "0203", des=0)
pridej(O, "Rozloha národních parků", "tis. ha", radek("0203", "národní parky", 1), "0203")
pridej(O, "Podíl čištěných odpadních vod", "%", radek("0207", "Podíl čištěných odpadních vod"), "0207",
      pozn="od 2024 nový zdroj dat (MZe), řady nejsou plně srovnatelné – brát poslední rok staré řady")
pridej(O, "Usmrcení na silnicích", "osob", sloupec("1403", 2), "1403", des=0, pozn="zemřelí do 30 dnů")
pridej(O, "Vraždy (registrované)", "počet", sloupec("1401", 2), "1401", des=0)
pridej(O, "Registrované trestné činy", "počet", sloupec("1401", 1), "1401", od=1991, des=0,
      pozn="řada až od 1991 (Policejní prezidium)")
pridej(O, "Vězni (k 31. 12.)", "osob", sloupec("1402", 3), "1402", des=0,
      pozn="1989 před amnestií 1990")


def main():
    here = Path(__file__).parent
    (here / "dvojice.json").write_text(json.dumps(DVOJICE, ensure_ascii=False, indent=1), encoding="utf-8")
    lines = ["# Česko 1989 × dnes – dvojice z ČSÚ", "",
             "Generováno skriptem `02_dvojice.py` z ČSÚ *Česko od roku 1989 v číslech* (aktualizace 27. 8. 2026).", ""]
    okruh = None
    for d in DVOJICE:
        if d["okruh"] != okruh:
            okruh = d["okruh"]
            lines += ["", f"## {okruh}", "", "| ukazatel | tehdy | dnes | × | jednotka | zdroj | pozn. |", "|---|---|---|---|---|---|---|"]
        fmt = lambda v: f"{v:,.{1 if abs(v) < 100 else 0}f}".replace(",", " ").replace(".", ",")
        lines.append(f"| {d['ukazatel']} | {fmt(d['tehdy'])} ({d['rok_tehdy']}) | {fmt(d['dnes'])} ({d['rok_dnes']}) | "
                     f"{str(d['zmena_pomer']).replace('.', ',')} | {d['jednotka']} | {d['tabulka']} | {d['pozn']} |")
    (here / "dvojice.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"{len(DVOJICE)} dvojic → dvojice.json, dvojice.md")


if __name__ == "__main__":
    main()
