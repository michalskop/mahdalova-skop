"""Kapitola „Volný čas a spotřeba“ speciálu Jací jsme byli, jací jsme (1989 × 2026).

Všechna čísla v textu i v grafech počítá tenhle skript z primárních tabulek ČSÚ:
  ČSÚ, Česko od roku 1989 v číslech, aktualizace 27. 8. 2026
  https://csu.gov.cz/produkty/cesko-od-roku-1989-v-cislech-aktualizace-27-8-2026
  archiv: csu-data/souhrn/cesko-od-1989/20260827/data/32018126_XXXX.xlsx
Tabulky: 03.02 (spotřeba potravin a nealko nápojů), 12.09 (kultura), 12.10 (noviny, časopisy, knihy),
12.11 a 12.12 (rozhlasové a televizní vysílání), 08.02 a 08.03 (telefony, počítač a internet),
10.01 (ubytovací zařízení a hosté), 01.01 (počet obyvatel).

Další vstupy z archivu (u každé složky ZDROJ.txt s URL a datem stažení):
  cestovani/csu-cestovani-rezidentu/20261114/   ČSÚ Cestovní ruch – časové řady, tab. 4.1.0, 4.2.0, 4.2.2 (cesty rezidentů 15+, 2011–2025)
                                                https://csu.gov.cz/produkty/cru_cr
  cestovani/eurostat-ilc_mdes02/20261114/       Eurostat EU-SILC ilc_mdes02 (nemůže si dovolit týden dovolené, 2005–2025)
  pruzkumy/nk-ctenari-a-cteni/20261114/         Národní knihovna ČR + ÚČL AV ČR, Čtenáři a čtení v ČR 2007–2023 (PDF)
  kultura/eurostat-ilc_scp27/20261114/          Eurostat EU-SILC 2022, počet přečtených knih za 12 měsíců
  zdravotnictvi/eurostat-hlth_ehis_pe2e/20261114/ Eurostat EHIS 2014 a 2019, čas na sport a jízdu na kole mimo práci

Spuštění:  python grafy.py   → ../data/*.json (Vega-Lite) + vystup.txt (čísla do textu)
"""
import csv
import json
import os
import re
import sys
from pathlib import Path

import openpyxl
import pypdf

sys.stdout.reconfigure(encoding="utf-8")


SADA = Path("souhrn/cesko-od-1989/20260827/data")
HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "data"
CRIMSON, BLUE, INK, MUTED, GRID = "#de1743", "#6267a3", "#101432", "#c9c9bd", "#d4d4c8"
NBSP = " "
ZDROJ_URL = "https://csu.gov.cz/produkty/cesko-od-roku-1989-v-cislech-aktualizace-27-8-2026"


# ---------- načtení dat (funkce převzaté z pilota 02_dvojice.py) ----------
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


def list_(tab, sheet=0):
    k = (tab, sheet)
    if k not in _cache:
        wb = openpyxl.load_workbook(DATA / f"32018126_{tab}.xlsx", data_only=True)
        _cache[k] = [list(r) for r in wb.worksheets[sheet].iter_rows(values_only=True)]
    return _cache[k]


def rok(v):
    m = re.match(r"\s*((19|20)\d\d)", str(v)) if v is not None else None
    return int(m.group(1)) if m else None


def num(v):
    return float(v) if isinstance(v, (int, float)) and not isinstance(v, bool) else None


def radek(tab, popisek, n=0, po=None):
    """Tabulka s roky v záhlaví sloupců. Vrátí {rok: hodnota} n-tého řádku, jehož
    popisek začíná textem `popisek` (volitelně až za řádkem začínajícím `po`)."""
    rows = list_(tab)
    # záhlaví s roky; rok může být i text s poznámkou („20251)“ = 2025, předběžně)
    jako_rok = lambda v: v if isinstance(v, int) and 1900 < v < 2030 else (
        rok(v) if isinstance(v, str) and re.fullmatch(r"\s*(19|20)\d\d\d?\)?\s*", v) else None)
    hlav = max(rows, key=lambda r: sum(jako_rok(v) is not None for v in r))
    roky = {j: jako_rok(v) for j, v in enumerate(hlav) if jako_rok(v) is not None}
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


def sloupec(tab, j, od_radku=0, do_radku=None):
    """Tabulka s roky v prvním sloupci. Vrátí {rok: hodnota} sloupce j."""
    out = {}
    for r in list_(tab)[od_radku:do_radku]:
        y = rok(r[0]) if r and not isinstance(r[0], float) else None
        if y and len(r) > j and num(r[j]) is not None:
            out[y] = num(r[j])
    return out


# ---------- formátování a výpis ----------
vystup = []


def log(*a):
    vystup.append(" ".join(str(x) for x in a))


def cz(x, d=0):
    s = f"{x:,.{d}f}".replace(",", NBSP).replace(".", ",")
    return s


def spec(title, subtitle, values, layers, source, height=None, step=None, **extra):
    s = {"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
         "title": {"text": title, "subtitle": subtitle},
         "width": "container",
         "config": {"view": {"stroke": None}}, "data": {"values": values}, "layer": layers, "_source": source}
    if height is not None:
        s["height"] = height
    if step is not None:
        s["height"] = {"step": step}
    s.update(extra)
    return s


ZDROJ = lambda tabs: f"ČSÚ, [Česko od roku 1989 v číslech, Tab. {tabs}]({ZDROJ_URL}); výpočet DataTimes"


def radek_blok(tab, popisek, rok_hlavicky, n=0):
    """Jako radek(), ale pro tabulky s více bloky: vezme blok, jehož záhlaví obsahuje rok_hlavicky,
    a hledá řádek jen v tomto bloku (do dalšího záhlaví)."""
    rows = list_(tab)
    i_hl = next(i for i, r in enumerate(rows) if rok_hlavicky in [rok(v) for v in r[1:] if v is not None])
    roky = {j: rok(v) for j, v in enumerate(rows[i_hl]) if j > 0 and rok(v)}
    sp = lambda x: re.sub(r"\s+", " ", str(x or "")).strip()
    shody = []
    for r in rows[i_hl + 1:]:
        if sum(1 for v in r[1:] if rok(v)) > 3:
            break
        if sp(r[0]).startswith(popisek):
            shody.append(r)
    r = shody[n]
    return {roky[j]: num(r[j]) for j in roky if j < len(r) and num(r[j]) is not None}


def vysilani(tab, popisky):
    """Tab. 12.11/12.12: roky v záhlaví mají někdy dva sloupce (veřejnoprávní a soukromé).
    Vrátí {popisek: {rok: součet obou sloupců}}."""
    out = {p: {} for p in popisky}
    mapa = {}
    for r in list_(tab):
        if sum(1 for v in r[1:] if v is not None and rok(v)) > 3:  # nové záhlaví bloku
            mapa, posl = {}, None
            for j, v in enumerate(r):
                if j == 0:
                    continue
                if v is not None and rok(v):
                    posl = rok(v)
                if posl:
                    mapa[j] = posl
            continue
        lab = re.sub(r"\s+", " ", str(r[0] or "")).strip()
        for p in popisky:
            if lab.startswith(p):
                for j, y in mapa.items():
                    if j < len(r) and num(r[j]) is not None:
                        out[p][y] = out[p].get(y, 0) + num(r[j])
    return out


def par(rada, od=1989):
    r0 = od if od in rada else min(rada)
    r1 = max(rada)
    return r0, rada[r0], r1, rada[r1]


def zapis(nazev, rada, jedn, od=1989, d=1):
    r0, v0, r1, v1 = par(rada, od)
    log(f"  {nazev}: {r0} {cz(v0, d)} → {r1} {cz(v1, d)} {jedn} (× {v1 / v0:.2f})")
    return r0, v0, r1, v1


obyv = radek("0101", "Počet obyvatel")

# =====================================================================
# 1. Co jíme (Tab. 03.02, kg nebo litry na obyvatele za rok)
# =====================================================================
log("== SPOTŘEBA POTRAVIN NA OBYVATELE (Tab. 03.02) ==")
JIDLO = [  # (popisek v grafu, začátek řádku v tabulce)
    ("Brambory", "Brambory"), ("Zelenina", "Zelenina v hodnotě čerstvé"), ("Chléb", "chléb"),
    ("Pšeničné pečivo", "pšeničné pečivo"), ("Vepřové maso", "vepřové maso"), ("Cukr", "Cukr"),
    ("Jižní ovoce", "Jižní ovoce"), ("Drůbež", "drůbeží"), ("Sýry", "Sýry celkem"), ("Banány", "banány"),
    ("Hovězí maso", "hovězí maso"), ("Máslo", "Máslo"),
]
jidlo = {lab: zapis(lab, radek("0302", rad), "kg") for lab, rad in JIDLO}
for lab, rad, j in [("Maso celkem", "Maso celkem", "kg"), ("Konzumní mléko", "mléko konzumní celkem", "kg"),
                    ("Vejce", "Vejce", "ks"), ("Ovoce celkem", "Ovoce celkem", "kg"), ("Rajčata", "rajčata", "kg"),
                    ("Rýže", "rýže", "kg"), ("Minerální a nealko nápoje celkem", "CELKEM", "l"),
                    ("Minerální vody", "Minerální vody", "l"), ("Limonády", "Limonády", "l")]:
    zapis(lab, radek("0302", rad), j)
nealko = radek("0302", "CELKEM")
log("  nealko maximum:", max(nealko, key=nealko.get), nealko[max(nealko, key=nealko.get)])
_sl = [radek("0302", "čokoláda"), radek("0302", "čokoládové cukrovinky"), radek("0302", "Nečokoládové cukrovinky"),
       radek("0302", "Cukrářské výrobky")]
sladke = {y: sum(r[y] for r in _sl) for y in _sl[0]}
zapis("Sladkosti (čokoláda, čokoládové a jiné cukrovinky, cukrářské výrobky)", sladke, "kg")


def cinka(radky, osa, jednotka, title, subtitle, source, fmt=1, krok=20):
    """Činkový graf: šedomodrá tečka = tehdy, karmínová = dnes, název řádku nad řádkem (mobil)."""
    vals = []
    for lab, (r0, v0, r1, v1) in radky:
        vals.append(dict(ukazatel=lab, tehdy=v0, dnes=v1,
                         t_tehdy=f"{cz(v0, fmt)} {jednotka} ({r0})", t_dnes=f"{cz(v1, fmt)} {jednotka} ({r1})",
                         l_tehdy=cz(v0, fmt), l_dnes=cz(v1, fmt), vlevo_dnes=v1 < v0))
    y = {"field": "ukazatel", "type": "nominal", "sort": None, "axis": None,
         "scale": {"paddingInner": 0.55, "paddingOuter": 0.6}}
    x = {"type": "quantitative", "scale": {"domain": osa},
         "axis": {"title": None, "grid": True, "gridColor": GRID, "domain": False, "ticks": False,
                  "values": list(range(0, osa[1] + 1, krok))}}
    tt = [{"field": "ukazatel", "title": "Ukazatel"}, {"field": "t_tehdy", "title": "Tehdy"}, {"field": "t_dnes", "title": "Dnes"}]
    layers = [
        {"mark": {"type": "text", "align": "left", "baseline": "bottom", "dy": -11, "fontSize": 12, "color": "#333333"},
         "encoding": {"y": y, "x": {"datum": osa[0], "type": "quantitative", "scale": {"domain": osa}}, "text": {"field": "ukazatel"}}},
        {"mark": {"type": "rule", "strokeWidth": 3, "color": "#bcbcb0"},
         "encoding": {"y": y, "x": {**x, "field": "tehdy"}, "x2": {"field": "dnes"}, "tooltip": tt}},
        {"mark": {"type": "circle", "size": 150, "opacity": 1, "color": BLUE},
         "encoding": {"y": y, "x": {**x, "field": "tehdy"}, "tooltip": tt}},
        {"mark": {"type": "circle", "size": 150, "opacity": 1, "color": CRIMSON},
         "encoding": {"y": y, "x": {**x, "field": "dnes"}, "tooltip": tt}},
    ]
    for vlevo in (False, True):
        f = "datum.vlevo_dnes" if vlevo else "!datum.vlevo_dnes"
        layers += [
            {"transform": [{"filter": f}], "mark": {"type": "text", "align": "left" if vlevo else "right", "dx": 10 if vlevo else -10, "fontSize": 11, "color": BLUE},
             "encoding": {"y": y, "x": {**x, "field": "tehdy"}, "text": {"field": "l_tehdy"}}},
            {"transform": [{"filter": f}], "mark": {"type": "text", "align": "right" if vlevo else "left", "dx": -10 if vlevo else 10, "fontSize": 11, "fontWeight": 700, "color": CRIMSON},
             "encoding": {"y": y, "x": {**x, "field": "dnes"}, "text": {"field": "l_dnes"}}},
        ]
    return spec(title, subtitle, vals, layers, source, step=52)


g_jidlo = cinka(
    [(lab, jidlo[lab]) for lab in ["Drůbež", "Jižní ovoce", "Banány", "Zelenina", "Sýry", "Pšeničné pečivo",
                                   "Hovězí maso", "Chléb", "Brambory", "Máslo", "Cukr"]],
    [-10, 105], "kg",
    f"Češi jedí {{dnes|{CRIMSON}}} víc drůbeže a jižního ovoce, hovězího ubylo na třetinu",
    "Spotřeba na obyvatele v kilogramech za rok; modře 1989, červeně 2024",
    ZDROJ("03.02"))

# =====================================================================
# 2. Kultura (Tab. 12.09)
# =====================================================================
log("== KULTURA (Tab. 12.09) ==")
kina = radek("1209", "KINA celkem")
kina_nav = radek("1209", "Návštěvníci v tis.", 0, po="KINA celkem")
zapis("Kina (počet)", kina, "", d=0)
zapis("Návštěvy kin (tis.)", kina_nav, "tis.", d=0)
zapis("Představení v kinech (tis.)", radek("1209", "Představení v tis.", 0, po="KINA celkem"), "tis.", d=0)
log("  minimum kin:", min(kina, key=kina.get), kina[min(kina, key=kina.get)],
    "| minimum návštěv mimo 2020–21:", min((v, y) for y, v in kina_nav.items() if y not in (2020, 2021)),
    "| 2019:", kina_nav[2019])
K1 = max(kina_nav)
log("  návštěvy kina na obyvatele: 1989", round(kina_nav[1989] / obyv[1989], 2), "|", K1,
    round(kina_nav[K1] / obyv[K1], 2), "| 2019:", round(kina_nav[2019] / obyv[2019], 2))
div_nav_st = radek("1209", "státní, krajská a městská divadla", 2)
zapis("Návštěvníci státních, krajských a městských divadel (tis.)", div_nav_st, "tis.", d=0)
zapis("Návštěvníci všech divadel (tis., od 1995)", radek("1209", "Návštěvníci v tis.", 0, po="DIVADLA"), "tis.", d=0)
zapis("Divadla se stálým souborem (do 2002 jen státní)", radek("1209", "DIVADLA"), "", d=0)
zapis("Veřejné knihovny", radek("1209", "KNIHOVNY VEŘEJNĚ PŘÍSTUPNÉ"), "", d=0)
zapis("Registrovaní čtenáři (tis.)", radek("1209", "Registrovaní čtenáři"), "tis.", d=0)
vypujcky = radek("1209", "Výpůjčky celkem")
zapis("Výpůjčky (tis.)", vypujcky, "tis.", d=0)
log("  výpůjčky 2024:", vypujcky[2024], "| maximum:", max(vypujcky, key=vypujcky.get), vypujcky[max(vypujcky, key=vypujcky.get)],
    "| 2025 nová metodika bez prodloužení výpůjček (pozn. 3 tabulky)")
log("  výpůjčky na obyvatele 1989:", round(vypujcky[1989] / obyv[1989], 1), "2024:", round(vypujcky[2024] / obyv[2024], 1))
muzea_nav = radek("1209", "Návštěvníci celkem v tis.", 0, po="MUZEA A GALERIE")
zapis("Muzea a galerie", radek("1209", "MUZEA A GALERIE"), "", d=0)
zapis("Návštěvníci muzeí a galerií (tis.)", muzea_nav, "tis.", d=0)
log("  muzea návštěvy na obyvatele 1989:", round(muzea_nav[1989] / obyv[1989], 2), "2025:", round(muzea_nav[2025] / obyv[2025], 2))
pamatky_nav = radek("1209", "Návštěvníci celkem v tis.", 0, po="PAMÁTKOVÉ OBJEKTY")
zapis("Návštěvníci památkových objektů (tis., od 1990)", pamatky_nav, "tis.", d=0)
zapis("Památkové objekty zpřístupněné (od 1990)", radek("1209", "PAMÁTKOVÉ OBJEKTY CELKEM"), "", d=0)
koncerty = radek("1209", "Koncerty celkem")
zapis("Koncerty hudebních souborů (orchestry, komorní soubory, sbory)", koncerty, "", d=0)
zapis("Návštěvníci vlastních koncertů hudebních souborů (tis., od 2001)", radek("1209", "Návštěvníci vlastních koncertů"), "tis.", od=2001, d=1)
log("  koncerty 2019:", koncerty[2019])
zapis("Výstavy muzeí a galerií", radek("1209", "Výstavy celkem"), "", d=0)
log("  kino minus: pokles návštěv 1989 → posl. %:", round(100 * (1 - kina_nav[max(kina_nav)] / kina_nav[1989]), 1))

mil = lambda d, do=9999: {k: v / 1000 for k, v in d.items() if k <= do}
g_kultura = cinka(
    [("Výpůjčky ve veřejných knihovnách", par(mil(vypujcky, 2024))),
     ("Návštěvy kin", par(mil(kina_nav))),
     ("Návštěvy hradů, zámků a dalších památek", par(mil(pamatky_nav))),
     ("Návštěvy muzeí a galerií", par(mil(muzea_nav))),
     ("Návštěvy státních, krajských a městských divadel", par(mil(div_nav_st)))],
    [-9, 75], "mil.",
    f"Kina ztratila {{tři čtvrtiny návštěv|{CRIMSON}}}, hrady a zámky jich mají víc",
    "Návštěvy a výpůjčky za rok v milionech; modře 1989 (památky 1990), červeně poslední rok "
    f"(muzea a památky 2025, ostatní 2024); v{NBSP}návštěvách jsou i turisté ze zahraničí",
    ZDROJ("12.09") + " (NIK, Státní fond kinematografie)")

# =====================================================================
# 3. Noviny, knihy, televize, rozhlas (Tab. 12.10–12.12)
# =====================================================================
log("== TISK A KNIHY (Tab. 12.10) ==")
knihy_stara = radek_blok("1210", "Knihy (tituly)", 1989)
knihy_nova = radek_blok("1210", "Knihy (tituly)", 2025)
log("  Knihy (tituly) 1989:", knihy_stara[1989], "| 2000 stará/nová řada:", knihy_stara[2000], knihy_nova[2000],
    "| 2025:", knihy_nova[2025], "| maximum:", max(knihy_nova, key=knihy_nova.get), knihy_nova[max(knihy_nova, key=knihy_nova.get)])
for p in ["Noviny a časopisy", "deníky", "týdeníky", "čtrnáctideníky", "ostatní", "dětské knihy", "beletrie"]:
    zapis(f"{p} (nové členění)", radek_blok("1210", p, 2025), "titulů", od=2000, d=0)
log("== ROZHLAS A TELEVIZE (Tab. 12.11, 12.12) ==")
roz = vysilani("1211", ["Rozhlasové vysílání", "Rozhlasové programy", "s celostátním pokrytím"])
tv = vysilani("1212", ["Televizní vysílání", "Televizní programy", "s celostátním pokrytím"])
for nazev, d in [("Rozhlas: hodiny vysílání (veřejnoprávní + soukromé)", roz["Rozhlasové vysílání"]),
                 ("TV: hodiny vysílání (veřejnoprávní + soukromé)", tv["Televizní vysílání"])]:
    log(f"  {nazev}: 1989 {cz(d[1989])} | 2005 {cz(d[2005])} | {max(d)} {cz(d[max(d)])} | × {d[max(d)] / d[1989]:.0f}"
        f" | hodin denně 1989 {d[1989] / 365:.1f}, {max(d)} {d[max(d)] / 366:.0f}")
for nazev, d in [("Rozhlas: programy", roz["Rozhlasové programy"]), ("Rozhlas: celostátní", roz["s celostátním pokrytím"]),
                 ("TV: programy", tv["Televizní programy"]), ("TV: celostátní", tv["s celostátním pokrytím"])]:
    log(f"  {nazev}: první rok {min(d)} {cz(d[min(d)])} | {max(d)} {cz(d[max(d)])}")

# =====================================================================
# 4. Telefony, počítač a internet (Tab. 08.02, 08.03)
# =====================================================================
log("== TELEFONY, POČÍTAČ, INTERNET (Tab. 08.02, 08.03) ==")
pevne100 = sloupec("0802", 2)
mobil100 = sloupec("0802", 4)
zapis("Pevné linky na 100 obyvatel", pevne100, "")
log("  pevné linky maximum:", max(pevne100, key=pevne100.get), pevne100[max(pevne100, key=pevne100.get)])
zapis("Aktivní SIM karty na 100 obyvatel", mobil100, "")
predstih = next(y for y in sorted(mobil100) if mobil100[y] > pevne100.get(y, 1e9))
log("  mobilů víc než pevných linek poprvé:", predstih, mobil100[predstih], "vs", pevne100[predstih])
pc = radek("0803", "Domácnosti s osobním počítačem")
net = radek("0803", "Domácnosti s připojením")
zapis("Domácnosti s počítačem %", pc, "%")
zapis("Domácnosti s internetem %", net, "%")
zapis("Domácnosti seniorů 65+ s internetem %", radek("0803", "domácnosti osob starších 65 let", 1), "%")
zapis("Domácnosti s dětmi s internetem %", radek("0803", "domácnosti s dětmi", 1), "%")
pul = next(y for y in sorted(net) if net[y] >= 50)
log("  internet má aspoň polovina domácností od roku", pul, net[pul])

# =====================================================================
# 5. Domácí cestovní ruch (Tab. 10.01)
# =====================================================================
log("== UBYTOVACÍ ZAŘÍZENÍ A HOSTÉ (Tab. 10.01) ==")
zapis("Ubytovací zařízení", radek("1001", "Ubytovací zařízení"), "", d=0)
zapis("Lůžka", radek("1001", "Lůžka"), "", d=0)
hoste = radek("1001", "Hosté v tis. osob")
rez = radek("1001", "rezidenti", 0)
zapis("Hosté (tis.)", hoste, "tis.", d=0)
zapis("Hosté rezidenti (tis.)", rez, "tis.", d=0)
zapis("Hosté nerezidenti (tis.)", radek("1001", "nerezidenti", 0), "tis.", d=0)
zapis("Přenocování (tis.)", radek("1001", "Přenocování v tis."), "tis.", d=0)
zapis("Přenocování rezidentů (tis., od 1995)", radek("1001", "rezidenti", 1), "tis.", od=1995, d=0)
zapis("Průměrný počet přenocování", radek("1001", "Průměrný počet přenocování"), "", d=2)
zapis("Průměrný počet přenocování rezidentů (od 1995)", radek("1001", "rezidenti", 2), "", od=1995, d=2)
log("  rezidenti 2019:", rez[2019], "| 2020:", rez[2020], "| podíl rezidentů na hostech 1989:",
    round(100 * rez[1989] / hoste[1989], 1), "% 2025:", round(100 * rez[2025] / hoste[2025], 1), "%")
log("  počet obyvatel (tis.) 1989:", obyv[1989], "2024:", obyv[2024], "2025:", obyv[2025])

# =====================================================================
# 6. Dovolené a cesty (ČSÚ výběrové šetření o cestovním ruchu, Eurostat)
# =====================================================================
A = najdi_archiv()
C = A / "cestovani/csu-cestovani-rezidentu/20261114"


def xrows(path, sheet):
    wb = openpyxl.load_workbook(path, data_only=True, read_only=True)
    return [list(r) for r in wb[sheet].iter_rows(values_only=True)]


log("== CESTY REZIDENTŮ 15+ (ČSÚ tab. 4.1.0, 4.2.0, 4.2.2) ==")
cesty = {}
for r in xrows(C / "crucr033126_410.xlsx", "Roky"):
    if isinstance(r[0], int) and 2000 < r[0] < 2100:
        cesty[r[0]] = dict(dl=r[2], dl_cr=r[3], dl_z=r[4], kr=r[5], kr_cr=r[6], kr_z=r[7])
Y0, Y1 = min(cesty), max(cesty)
for k, nazev in [("dl", "delší cesty celkem"), ("dl_cr", "delší cesty v ČR"), ("dl_z", "delší cesty do zahraničí"),
                 ("kr", "kratší cesty celkem"), ("kr_cr", "kratší cesty v ČR"), ("kr_z", "kratší cesty do zahraničí")]:
    a, b = cesty[Y0][k], cesty[Y1][k]
    log(f"  {nazev} (tis.): {Y0} {cz(a)} → {Y1} {cz(b)} ({(b / a - 1) * 100:+.1f} %)")
log("  delší do zahraničí 2019 / 2020 / 2022:", round(cesty[2019]["dl_z"]), round(cesty[2020]["dl_z"]), round(cesty[2022]["dl_z"]))
log("  podíl zahraničí na delších cestách:", Y0, f"{cesty[Y0]['dl_z'] / cesty[Y0]['dl'] * 100:.1f} %", Y1,
    f"{cesty[Y1]['dl_z'] / cesty[Y1]['dl'] * 100:.1f} %")
dc = {}
for r in xrows(C / "crucr033126_420.xlsx", "DC"):
    if isinstance(r[0], int) and r[1] in (None, "") and 2000 < r[0] < 2100:
        dc[r[0]] = dict(vlastni=r[13], letadlo=r[18], auto=r[16], ck=r[22], dovolena=r[7])  # sloupce dle záhlaví tab. 4.2.0
for y in (Y0, Y1):
    log(f"  {y}: vlastní rekreační zařízení {cz(dc[y]['vlastni'])} tis. = "
        f"{dc[y]['vlastni'] / cesty[y]['dl_cr'] * 100:.1f} % delších cest po ČR | letadlo {cz(dc[y]['letadlo'])} tis."
        f" | auto {cz(dc[y]['auto'])} | zájezd CK {cz(dc[y]['ck'])} | účel rekreace {cz(dc[y]['dovolena'])}")
log(f"  letadlo × {dc[Y1]['letadlo'] / dc[Y0]['letadlo']:.2f}, zájezdy × {dc[Y1]['ck'] / dc[Y0]['ck']:.2f}")

r = xrows(C / "crucr033126_422.xlsx", "ZDC Cil")
hl = next(x for x in r if x[0] == "rok")
zeme = {i: n.strip() for i, n in enumerate(hl) if isinstance(n, str) and n != "rok"}
AGREG = {"Celkem", "Evropa", "Evropská unie", "Amerika", "Asie", "Afrika"}
dest = {}
for y in (Y0, 2019, Y1):
    row = next(x for x in r if x[0] == y)
    cel = row[[k for k, v in zeme.items() if v == "Celkem"][0]]
    dest[y] = {n: (row[i], row[i] / cel * 100) for i, n in zeme.items()
               if n not in AGREG and isinstance(row[i], (int, float))}
    top = sorted(dest[y].items(), key=lambda kv: -kv[1][0])[:8]
    log("  TOP CÍLE", y, [(n, round(v), f"{p:.1f} %") for n, (v, p) in top])
vyber = [n for n, _ in sorted(dest[Y1].items(), key=lambda kv: -kv[1][0])[:8]]
assert all(n in dest[Y0] for n in vyber)

ec = list(csv.DictReader(open(A / "cestovani/eurostat-ilc_mdes02/20261114/ilc_mdes02_vse.csv", encoding="utf-8")))


def eurostat_dov(geo, hh="TOTAL", pov="TOTAL"):
    return {int(x["TIME_PERIOD"]): float(x["OBS_VALUE"]) for x in ec if x["geo"] == geo and x["hhcomp"] == hh
            and x["rskpovth"] == pov and x["unit"] == "PC" and x["OBS_VALUE"]}


dov, dov_eu = eurostat_dov("CZ"), eurostat_dov("EU27_2020")
dov_chud, dov_sam = eurostat_dov("CZ", pov="B_60"), eurostat_dov("CZ", hh="A1_DCH")
dmax, dmin = max(dov, key=dov.get), min(dov, key=dov.get)
log("== DOVOLENÁ (Eurostat ilc_mdes02, % lidí, kteří si nemohou dovolit týden dovolené mimo domov) ==")
log("  CZ:", min(dov), dov[min(dov)], "| max", dmax, dov[dmax], "| min", dmin, dov[dmin], "|", max(dov), dov[max(dov)],
    "| EU27", min(dov_eu), dov_eu[min(dov_eu)], max(dov_eu), dov_eu[max(dov_eu)])
log("  CZ pod hranicí chudoby (60 % mediánu):", 2012, dov_chud[2012], "|", max(dov_chud), dov_chud[max(dov_chud)])
log("  CZ samoživitelé s dětmi (A1_DCH):", max(dov_sam), dov_sam[max(dov_sam)])

# --- graf: dovolená
v_dov = [dict(rok=y, v=v, rada="Česko", t=f"{cz(v, 1)} %") for y, v in sorted(dov.items())] + \
        [dict(rok=y, v=v, rada="Průměr EU", t=f"{cz(v, 1)} %") for y, v in sorted(dov_eu.items())]
x_d = {"field": "rok", "type": "quantitative", "scale": {"domain": [2005, Y1]},
       "axis": {"title": None, "format": "d", "grid": False, "domain": False, "ticks": False,
                "values": [2005, 2012, 2019, Y1], "labelFlush": True}}
y_d = {"field": "v", "type": "quantitative", "scale": {"domain": [0, 50]},
       "axis": {"title": None, "grid": True, "gridColor": GRID, "domain": False, "ticks": False,
                "values": [0, 10, 20, 30, 40, 50], "labelExpr": "datum.value + ' %'"}}
SEDA = "#a8a89c"
pop_dov = [(dict(rok=dmax, v=dov[dmax], text=f"{cz(dov[dmax], 1)} %"), CRIMSON, -10, "center"),
           (dict(rok=Y1, v=dov[Y1], text=f"Česko {cz(dov[Y1], 0)} %"), CRIMSON, 16, "right"),
           (dict(rok=Y1, v=dov_eu[Y1], text=f"EU {cz(dov_eu[Y1], 1)} %"), "#7a7a70", -10, "right")]
g_dov = spec(
    f"Týden dovolené si {{dnes|{CRIMSON}}} nemůže dovolit každý pátý, v roce {dmax} skoro každý druhý",
    f"Podíl lidí, kteří si nemohou dovolit týden dovolené mimo domov, v %; Česko {min(dov)}–{Y1}, průměr EU od {min(dov_eu)}",
    v_dov, [
        {"mark": {"type": "line", "strokeWidth": 2.5},
         "encoding": {"x": x_d, "y": y_d,
                      "color": {"field": "rada", "type": "nominal", "legend": None,
                                "scale": {"domain": ["Česko", "Průměr EU"], "range": [CRIMSON, SEDA]}},
                      "tooltip": [{"field": "rada", "title": "Území"}, {"field": "rok", "title": "Rok"},
                                  {"field": "t", "title": "Nemůže si dovolit"}]}},
    ] + [{"data": {"values": [p]}, "mark": {"type": "text", "fontSize": 11, "fontWeight": 700, "color": c, "dy": dy, "align": al},
          "encoding": {"x": {**x_d}, "y": {**y_d}, "text": {"field": "text"}}} for p, c, dy, al in pop_dov],
    "Eurostat, [EU-SILC, ukazatel ilc_mdes02](https://ec.europa.eu/eurostat/databrowser/view/ilc_mdes02/default/table?lang=en)",
    height=240)

# --- graf: kam jezdíme (přesunuto z kapitoly Svoboda)
v3 = []
for nz in vyber:
    p0, p1 = dest[Y0][nz][1], dest[Y1][nz][1]
    v3.append(dict(zeme=nz, tehdy=round(p0, 1), dnes=round(p1, 1), l_t=cz(p0, 0), l_d=cz(p1, 0),
                   t_t=f"{cz(dest[Y0][nz][0] * 1000, 0)} cest ({cz(p0, 1)} %)",
                   t_d=f"{cz(dest[Y1][nz][0] * 1000, 0)} cest ({cz(p1, 1)} %)", vlevo=p1 < p0, blizko=abs(p1 - p0) < 0.8))
v3.sort(key=lambda d: -d["dnes"])
log("  GRAF destinace", [(d["zeme"], d["tehdy"], d["dnes"]) for d in v3])
y3 = {"field": "zeme", "type": "nominal", "sort": None, "axis": None, "scale": {"paddingInner": 0.5, "paddingOuter": 0.5}}
dom3 = [0, 21]
x3 = {"type": "quantitative", "scale": {"domain": dom3},
      "axis": {"title": None, "domain": False, "ticks": False, "grid": True, "gridColor": GRID,
               "values": [0, 5, 10, 15, 20], "labelExpr": "datum.value + ' %'"}}
tt3 = [{"field": "zeme", "title": "Země"}, {"field": "t_t", "title": str(Y0)}, {"field": "t_d", "title": str(Y1)}]
GREY = "#bcbcb0"
g_kam = spec(
    f"Nejvíc delších cest vedlo {{v roce {Y1}|{CRIMSON}}} do Itálie, {{v roce {Y0}|{BLUE}}} do Chorvatska",
    f"Podíl země na delších cestách do zahraničí (4 a více nocí, lidé od 15 let) v letech {Y0} a {Y1}, v %",
    v3, [
        {"mark": {"type": "text", "align": "left", "baseline": "bottom", "dy": -9, "fontSize": 12, "color": "#333333"},
         "encoding": {"y": y3, "x": {"datum": 0, "type": "quantitative", "scale": {"domain": dom3}}, "text": {"field": "zeme"}}},
        {"mark": {"type": "rule", "strokeWidth": 3, "color": GREY},
         "encoding": {"y": y3, "x": {**x3, "field": "tehdy"}, "x2": {"field": "dnes"}, "tooltip": tt3}},
        {"mark": {"type": "circle", "size": 140, "opacity": 1, "color": BLUE, "yOffset": {"expr": "datum.blizko ? -5 : 0"}},
         "encoding": {"y": y3, "x": {**x3, "field": "tehdy"}, "tooltip": tt3}},
        {"mark": {"type": "circle", "size": 140, "opacity": 1, "color": CRIMSON, "yOffset": {"expr": "datum.blizko ? 5 : 0"}},
         "encoding": {"y": y3, "x": {**x3, "field": "dnes"}, "tooltip": tt3}},
        {"transform": [{"filter": "!datum.vlevo"}], "mark": {"type": "text", "align": "right", "dx": -9, "fontSize": 11, "color": BLUE},
         "encoding": {"y": y3, "x": {**x3, "field": "tehdy"}, "text": {"field": "l_t"}}},
        {"transform": [{"filter": "!datum.vlevo"}], "mark": {"type": "text", "align": "left", "dx": 9, "fontSize": 11, "fontWeight": 700, "color": CRIMSON},
         "encoding": {"y": y3, "x": {**x3, "field": "dnes"}, "text": {"field": "l_d"}}},
        {"transform": [{"filter": "datum.vlevo"}], "mark": {"type": "text", "align": "left", "dx": 9, "fontSize": 11, "color": BLUE},
         "encoding": {"y": y3, "x": {**x3, "field": "tehdy"}, "text": {"field": "l_t"}}},
        {"transform": [{"filter": "datum.vlevo"}], "mark": {"type": "text", "align": "right", "dx": -9, "fontSize": 11, "fontWeight": 700, "color": CRIMSON},
         "encoding": {"y": y3, "x": {**x3, "field": "dnes"}, "text": {"field": "l_d"}}},
    ], "ČSÚ, [Cestovní ruch – časové řady, tab. 4.2.2](https://csu.gov.cz/produkty/cru_cr); výpočet DataTimes",
    step=46)

# =====================================================================
# 7. Četba (Národní knihovna ČR + ÚČL AV ČR; Eurostat ilc_scp27)
# =====================================================================
log("== ČETBA ==")
NK = A / "pruzkumy/nk-ctenari-a-cteni/20261114"
pdftxt = lambda f: re.sub(r"\s+", " ", " ".join(p.extract_text() for p in pypdf.PdfReader(NK / f).pages))
rich = pdftxt("richter_skip_2025_pruzkum_ctenarstvi.pdf")
m = re.search(r"Čtenářství obyvatel Česka se dlouhodobě zhoršuje ((?:\d+ % ){5})((?:\d+ % ){5})((?:\d{4}, N=\d+ ?){5})", rich)
ctenari = dict(zip([int(y) for y in re.findall(r"(\d{4}), N=", m.group(3))], [int(x) for x in re.findall(r"\d+", m.group(1))]))
log("  čtenáři 15+ (aspoň 1 kniha za rok), NK:", ctenari, "| N:", re.findall(r"\d{4}, N=\d+", m.group(3)))
tr = pdftxt("Travnicek_knihovna_revue_2024-2.pdf")
for vzor in [r"přečte za rok v průměru (\d+,\d) knih \(v roce 2018 to bylo (\d+,\d)\); medián1 je (\d) \(v roce 2018 byl (\d)\)",
             r"Celkem (\d+) % obyvatel České republiky starších 15 let přečetlo za rok alespoň jednu knihu \(v roce 2018 to bylo (\d+) %\)",
             r"za rok (\d+,\d) knihy . ženy (\d+,\d) knihy",
             r"elektronické knihy \((\d+) % populace; v roce 2018 to bylo (\d+) %\)",
             r"Audioknihy alespoň občas poslouchá (\d+) % populace 15\+ \(v roce 2018 to bylo (\d+) %\)",
             r"navštívilo i v roce 2023 (\d+) % obyvatel",
             r"Sběr dat realizovala mezi (.{0,40}?) společnost"]:
    mm = re.search(vzor, tr)
    assert mm, vzor
    log("  Trávníček 2024:", vzor[:45], "→", mm.groups())
sc = list(csv.DictReader(open(A / "kultura/eurostat-ilc_scp27/20261114/ilc_scp27_vse.csv", encoding="utf-8")))
kn = {(x["geo"], x["n_book"]): float(x["OBS_VALUE"]) for x in sc if x["isced11"] == "TOTAL" and x["sex"] == "T"
      and x["age"] == "Y_GE16" and x["unit"] == "PC" and x["TIME_PERIOD"] == "2022" and x["OBS_VALUE"]}
log("  Eurostat 2022, 16+, nepřečetli žádnou knihu: CZ", kn[("CZ", "0")], "EU27", kn[("EU27_2020", "0")],
    "| 10 a více knih: CZ", kn[("CZ", "GE10")], "EU27", kn[("EU27_2020", "GE10")])

# =====================================================================
# 8. Pohyb (Eurostat EHIS hlth_ehis_pe2e)
# =====================================================================
log("== POHYB (EHIS, sport a jízda na kole mimo práci, minut týdně, 15+) ==")
pe = list(csv.DictReader(open(A / "zdravotnictvi/eurostat-hlth_ehis_pe2e/20261114/hlth_ehis_pe2e_vse.csv", encoding="utf-8")))
pohyb = {(x["geo"], x["duration"], x["TIME_PERIOD"]): float(x["OBS_VALUE"]) for x in pe if x["isced11"] == "TOTAL"
         and x["sex"] == "T" and x["age"] == "TOTAL" and x["unit"] == "PC" and x["OBS_VALUE"]}
for geo in ("CZ", "EU27_2020"):
    log(f"  {geo}: 0 minut 2014 {pohyb[(geo, 'MN0', '2014')]} 2019 {pohyb[(geo, 'MN0', '2019')]} | 150+ minut 2014 "
        f"{pohyb[(geo, 'MN_GE150', '2014')]} 2019 {pohyb[(geo, 'MN_GE150', '2019')]}")

OUT.mkdir(exist_ok=True)
for name, s in [("co-jime", g_jidlo), ("kultura", g_kultura), ("kam-jezdime", g_kam), ("dovolena", g_dov)]:
    (OUT / f"{name}.json").write_text(json.dumps(s, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
(HERE / "vystup.txt").write_text("\n".join(vystup) + "\n", encoding="utf-8")
print("\n".join(vystup))
