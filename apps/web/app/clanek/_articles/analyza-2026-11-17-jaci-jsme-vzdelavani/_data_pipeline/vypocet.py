"""Kapitola „Vzdělávání“ speciálu Jací jsme byli, jací jsme (1989 × 2026) – všechna čísla do textu.

Zdroj: ČSÚ, Česko od roku 1989 v číslech, aktualizace 27. 8. 2026
  https://csu.gov.cz/produkty/cesko-od-roku-1989-v-cislech-aktualizace-27-8-2026
  balík: https://csu.gov.cz/docs/107508/bd0a22e6-1df1-a4f1-86db-dcbcba592a0a/320181260827_data.zip?version=1.2
Archiv: csu-data/souhrn/cesko-od-1989/20260827/data/
  Tab. 01.03 nejvyšší ukončené vzdělání podle sčítání 1980–2021
  Tab. 01.04 vzdělání podle Výběrového šetření pracovních sil (VŠPS) 1993–2025
  Tab. 12.01 předškolní vzdělávání, 12.02 základní, 12.05 vyšší odborné školy, 12.06 vysoké školy (zdroj MŠMT)
  Tab. 01.01 živě narození (pro srovnání s počty dětí v mateřských školách)

Spuštění: python vypocet.py  (grafy.py ho importuje). Výstup: cisla.json + vystup.txt.
"""
import json
import os
import re
import sys
from pathlib import Path

import openpyxl

sys.stdout.reconfigure(encoding="utf-8")
HERE = Path(__file__).resolve().parent
SADA = Path("souhrn/cesko-od-1989/20260827/data")


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


def num(v):
    return float(v) if isinstance(v, (int, float)) and not isinstance(v, bool) else None


def rok_hlavicky(v):
    """Rok v záhlaví sloupce: 1993, ale i „20011)“ (rok + číslo poznámky)."""
    if isinstance(v, int) and 1900 < v < 2030:
        return v
    m = re.match(r"\s*((19|20)\d\d)\d?\)?\s*$", str(v)) if isinstance(v, str) else None
    return int(m.group(1)) if m else None


def radek(tab, popisek, n=0, po=None):
    """Tabulka s roky v záhlaví sloupců. Vrátí {rok: hodnota} n-tého řádku, jehož popisek
    začíná textem `popisek` (volitelně až za řádkem začínajícím `po`)."""
    rows = list_(tab)
    hlav = max(rows, key=lambda r: sum(rok_hlavicky(v) is not None for v in r))
    roky = {j: rok_hlavicky(v) for j, v in enumerate(hlav) if rok_hlavicky(v) is not None}
    prvni = min(roky)
    sp = lambda s: re.sub(r"\s+", " ", s).strip()
    popisek, po = sp(popisek), sp(po) if po else None
    aktivni, shody = po is None, []
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
    """Tabulka se školními roky v prvním sloupci („1989/90“). Vrátí {rok začátku: hodnota}."""
    out = {}
    for r in list_(tab):
        m = re.match(r"\s*((19|20)\d\d)/\d\d", str(r[0])) if r and r[0] else None
        if m and len(r) > j and num(r[j]) is not None:
            out[int(m.group(1))] = num(r[j])
    return out


C = {}
LOG = []


def zapis(klic, hodnota, popis):
    C[klic] = hodnota
    LOG.append(f"{klic} = {hodnota}   # {popis}")


def pct(a, b, d=1):
    return round(100 * a / b, d)


# ---------- 1. Sčítání: nejvyšší ukončené vzdělání (Tab. 01.03) ----------
# Tabulka má tři bloky (celkem, muži, ženy); sloupce = abs. a % za 1980, 1991, 2001, 2011, 2021.
rows = list_("0103")
roky_sc = [1980, 1991, 2001, 2011, 2021]


def blok(nazev):
    """Vrátí {kategorie: {rok: absolutní počet}} pro blok Obyvatelstvo celkem / Muži / Ženy."""
    out, aktivni = {}, False
    for r in rows:
        if r[1] and str(r[1]).strip().startswith(nazev):
            aktivni = True
            continue
        if aktivni and r[1] and str(r[1]).strip() in ("Muži", "Ženy"):
            break
        if aktivni and r[0]:
            lab = re.sub(r"\s*\d\)$", "", str(r[0]).strip())
            out[lab] = {y: num(r[1 + 2 * i]) for i, y in enumerate(roky_sc)}
    return out


SC = {"celkem": blok("Obyvatelstvo celkem"), "muži": blok("Muži"), "ženy": blok("Ženy")}


def podil_sc(skup, kat, rok):
    """Podíl ze zjištěných hodnot (jako ČSÚ): kategorie / (celkem − nezjištěno)."""
    b = SC[skup]
    return 100 * b[kat][rok] / (b["Celkem"][rok] - b["Nezjištěno"][rok])


for rok in (1991, 2021):
    for skup in ("celkem", "muži", "ženy"):
        zapis(f"sc_vs_{skup}_{rok}", round(podil_sc(skup, "Vysokoškolské", rok), 1), f"podíl VŠ vzdělaných 15+, sčítání {rok}, {skup}, %")
        zapis(f"sc_vs_{skup}_{rok}_abs", int(SC[skup]["Vysokoškolské"][rok]), f"počet VŠ vzdělaných 15+, sčítání {rok}, {skup}")
    zapis(f"sc_zakladni_{rok}", round(podil_sc("celkem", "Základní", rok), 1), f"základní vč. neukončeného, sčítání {rok}, %")
    zapis(f"sc_vyuceni_{rok}", round(podil_sc("celkem", "Střední odborné", rok), 1), f"střední odborné bez maturity (vyučení), {rok}, %")
    mat = SC["celkem"]["Úplné střední všeobecné"][rok] + SC["celkem"]["Úplné střední odborné"][rok]
    zapis(f"sc_maturita_{rok}", round(100 * mat / (SC["celkem"]["Celkem"][rok] - SC["celkem"]["Nezjištěno"][rok]), 1), f"úplné střední (s maturitou), {rok}, %")
    zapis(f"sc_vyssi_{rok}", round(podil_sc("celkem", "Vyšší", rok), 1), f"vyšší (od 2001 vč. nástavbového a pomaturitního), {rok}, %")
    zapis(f"sc_nezjisteno_{rok}", pct(SC["celkem"]["Nezjištěno"][rok], SC["celkem"]["Celkem"][rok]), f"nezjištěné vzdělání, {rok}, % obyvatel 15+")
    zapis(f"sc_nezjisteno_{rok}_abs", int(SC["celkem"]["Nezjištěno"][rok]), f"nezjištěné vzdělání, {rok}, počet")
zapis("sc_vs_pomer_2021_1991", round(SC["celkem"]["Vysokoškolské"][2021] / SC["celkem"]["Vysokoškolské"][1991], 2), "kolikrát víc VŠ vzdělaných (abs.) 2021 proti 1991")
zapis("sc_vs_zeny_pomer", round(SC["ženy"]["Vysokoškolské"][2021] / SC["ženy"]["Vysokoškolské"][1991], 2), "kolikrát víc VŠ žen 2021 proti 1991")
zapis("sc_vs_muzi_pomer", round(SC["muži"]["Vysokoškolské"][2021] / SC["muži"]["Vysokoškolské"][1991], 2), "kolikrát víc VŠ mužů 2021 proti 1991")
SCITANI_STRUKTURA = [  # pro graf: kategorie, klíč
    ("Základní vzdělání", "sc_zakladni"),
    ("Vyučení bez maturity", "sc_vyuceni"),
    ("Střední s maturitou", "sc_maturita"),
    ("Vysokoškolské", "sc_vs_celkem"),
]

# ---------- 2. VŠPS 1993–2025: vysokoškoláci podle pohlaví (Tab. 01.04) ----------
vs_muzi_abs = radek("0104", "vysokoškolské", 1)
vs_zeny_abs = radek("0104", "vysokoškolské", 2)
vs_celk = radek("0104", "vysokoškolské", 3)
vs_muzi = radek("0104", "vysokoškolské", 4)
vs_zeny = radek("0104", "vysokoškolské", 5)
assert abs(vs_celk[1993] - 7.81) < 0.01 and abs(vs_zeny[2025] - 23.53) < 0.01, "kontrola řádků Tab. 01.04"
VSPS = {"muži": vs_muzi, "ženy": vs_zeny}
r0, r1 = min(vs_celk), max(vs_celk)
zapis("vsps_rok_od", r0, "první rok VŠPS")
zapis("vsps_rok_do", r1, "poslední rok VŠPS")
for k, s in (("celkem", vs_celk), ("muzi", vs_muzi), ("zeny", vs_zeny)):
    zapis(f"vsps_vs_{k}_{r0}", round(s[r0], 1), f"VŠPS podíl VŠ vzdělaných 15+, {k}, {r0}, %")
    zapis(f"vsps_vs_{k}_{r1}", round(s[r1], 1), f"VŠPS podíl VŠ vzdělaných 15+, {k}, {r1}, %")
zapis("vsps_vs_zeny_abs_tis_" + str(r1), round(vs_zeny_abs[r1]), f"VŠ vzdělané ženy 15+ v tis., {r1}")
zapis("vsps_vs_muzi_abs_tis_" + str(r1), round(vs_muzi_abs[r1]), f"VŠ vzdělaní muži 15+ v tis., {r1}")
prekryv_podil = min(y for y in vs_zeny if vs_zeny[y] > vs_muzi[y] and all(vs_zeny[z] > vs_muzi[z] for z in vs_zeny if z >= y))
prekryv_abs = min(y for y in vs_zeny_abs if vs_zeny_abs[y] > vs_muzi_abs[y] and all(vs_zeny_abs[z] > vs_muzi_abs[z] for z in vs_zeny_abs if z >= y))
zapis("vsps_zeny_predstihly_podil", prekryv_podil, "první rok, od kdy mají ženy trvale vyšší podíl VŠ vzdělaných než muži")
zapis("vsps_zeny_predstihly_pocet", prekryv_abs, "první rok, od kdy je VŠ vzdělaných žen trvale víc než mužů (počet)")
zapis("vsps_rozdil_pb_" + str(r1), round(vs_zeny[r1] - vs_muzi[r1], 1), f"o kolik p. b. vyšší podíl u žen, {r1}")

# ---------- 3. Vysoké školy (Tab. 12.06) ----------
stud = radek("1206", "Studenti veřejných a soukromých VŠ celkem")
cizinci = radek("1206", "se státním občanstvím jiným")
soukr_stud = radek("1206", "soukromých vysokých škol", 0)
verej_skoly = radek("1206", "z toho: vysoké školy veřejné")
soukr_skoly = radek("1206", "vysoké školy soukromé")
fakulty = radek("1206", "Fakulty veřejných a státních VŠ")
absolv = radek("1206", "Absolventi studia na VŠ")
prezencni = radek("1206", "studium prezenční")
dalkove = radek("1206", "distanční a kombinované")
R = max(stud)
zapis("vs_rok_dnes", R, "poslední rok Tab. 12.06")
zapis("vs_studenti_1989", int(stud[1989]), "studenti VŠ 1989 (k 31. 12.)")
zapis("vs_studenti_dnes", int(stud[R]), f"studenti VŠ {R}")
zapis("vs_studenti_pomer", round(stud[R] / stud[1989], 2), "kolikrát víc studentů")
vrchol = max(stud, key=stud.get)
zapis("vs_studenti_vrchol_rok", vrchol, "rok s nejvíc studenty")
zapis("vs_studenti_vrchol", int(stud[vrchol]), "nejvíc studentů")
dno = min((y for y in stud if y > vrchol), key=stud.get)
zapis("vs_studenti_dno_rok", dno, "rok s nejméně studenty po vrcholu")
zapis("vs_studenti_dno", int(stud[dno]), "nejméně studentů po vrcholu")
zapis("vs_cizinci_1989", int(cizinci[1989]), "zahraniční studenti 1989")
zapis("vs_cizinci_dnes", int(cizinci[R]), f"zahraniční studenti {R}")
zapis("vs_cizinci_podil_1989", pct(cizinci[1989], stud[1989]), "podíl cizinců mezi studenty 1989, %")
zapis("vs_cizinci_podil_dnes", pct(cizinci[R], stud[R]), f"podíl cizinců {R}, %")
cesi = radek("1206", "se státním občanstvím ČR", 0)
zapis("vs_cesi_1989", int(cesi[1989]), "studenti s občanstvím ČR 1989")
zapis("vs_cesi_dnes", int(cesi[R]), f"studenti s občanstvím ČR {R}")
zapis("vs_cizinci_pomer", round(cizinci[R] / cizinci[1989], 1), "kolikrát víc zahraničních studentů")
zapis("vs_cesi_pomer", round(cesi[R] / cesi[1989], 2), "kolikrát víc studentů s občanstvím ČR")
zapis("vs_verejne_1989", int(verej_skoly[1989]), "veřejné VŠ 1989")
zapis("vs_verejne_dnes", int(verej_skoly[R]), f"veřejné VŠ {R}")
prvni_soukr = min(soukr_skoly)
zapis("vs_soukrome_prvni_rok", prvni_soukr, "první rok se soukromými VŠ v tabulce")
zapis("vs_soukrome_prvni", int(soukr_skoly[prvni_soukr]), "soukromé VŠ v prvním roce")
vr_s = max(soukr_skoly, key=soukr_skoly.get)
zapis("vs_soukrome_vrchol_rok", vr_s, "rok s nejvíc soukromými VŠ")
zapis("vs_soukrome_vrchol", int(soukr_skoly[vr_s]), "nejvíc soukromých VŠ")
zapis("vs_soukrome_dnes", int(soukr_skoly[R]), f"soukromé VŠ {R}")
vr_ss = max(soukr_stud, key=soukr_stud.get)
zapis("vs_soukr_stud_vrchol_rok", vr_ss, "rok s nejvíc studenty soukromých VŠ")
zapis("vs_soukr_stud_vrchol", int(soukr_stud[vr_ss]), "nejvíc studentů soukromých VŠ")
zapis("vs_soukr_stud_vrchol_podil", pct(soukr_stud[vr_ss], stud[vr_ss]), "podíl studentů soukromých VŠ ve vrcholu, %")
zapis("vs_soukr_stud_dnes", int(soukr_stud[R]), f"studenti soukromých VŠ {R}")
zapis("vs_soukr_stud_podil_dnes", pct(soukr_stud[R], stud[R]), f"podíl studentů soukromých VŠ {R}, %")
zapis("vs_fakulty_1989", int(fakulty[1989]), "fakulty veřejných a státních VŠ 1989")
zapis("vs_fakulty_dnes", int(fakulty[R]), f"fakulty {R}")
zapis("vs_absolventi_prvni_rok", min(absolv), "první rok s absolventy v tabulce")
zapis("vs_absolventi_prvni", int(absolv[min(absolv)]), "absolventi v prvním roce")
vr_a = max(absolv, key=absolv.get)
zapis("vs_absolventi_vrchol_rok", vr_a, "rok s nejvíc absolventy")
zapis("vs_absolventi_vrchol", int(absolv[vr_a]), "nejvíc absolventů")
zapis("vs_absolventi_dnes", int(absolv[R]), f"absolventi {R}")
zapis("vs_dalkove_1989", int(dalkove[1989]), "distanční a kombinované studium 1989")
zapis("vs_dalkove_vrchol_rok", max(dalkove, key=dalkove.get), "rok s nejvíc distančními/kombinovanými")
zapis("vs_dalkove_vrchol", int(max(dalkove.values())), "nejvíc distančních/kombinovaných")
zapis("vs_dalkove_dnes", int(dalkove[R]), f"distanční a kombinované {R}")
VS_RADA = {y: (stud[y] - cizinci[y], cizinci[y]) for y in stud}  # součet = zveřejněný úhrn (řádek „ČR“ se od rozdílu liší o desítky)

# ---------- 4. Mateřské a základní školy (Tab. 12.01, 12.02) ----------
ms_deti = sloupec("1201", 4)       # děti v mateřských školách (bez přípravných tříd ZŠ)
ms_skoly = sloupec("1201", 1)
ms_tridy = sloupec("1201", 2)
zs_zaci = sloupec("1202", 3)
zs_tridy = sloupec("1202", 2)
assert ms_deti[1989] == 400647 and zs_zaci[1989] == 1290518, "kontrola Tab. 12.01/12.02"
S = max(ms_deti)
zapis("ms_rok_dnes", f"{S}/{str(S + 1)[2:]}", "poslední školní rok")
zapis("ms_deti_1989", int(ms_deti[1989]), "děti v MŠ 1989/90")
zapis("ms_deti_dnes", int(ms_deti[S]), "děti v MŠ dnes")
zapis("ms_deti_zmena_pct", round(100 * (ms_deti[S] / ms_deti[1989] - 1), 1), "změna počtu dětí v MŠ, %")
dno_ms = min(ms_deti, key=ms_deti.get)
zapis("ms_deti_dno_rok", f"{dno_ms}/{str(dno_ms + 1)[2:]}", "školní rok s nejméně dětmi v MŠ")
zapis("ms_deti_dno", int(ms_deti[dno_ms]), "nejméně dětí v MŠ")
vr_ms = max((y for y in ms_deti if y > dno_ms), key=ms_deti.get)
zapis("ms_deti_vrchol_rok", f"{vr_ms}/{str(vr_ms + 1)[2:]}", "školní rok s nejvíc dětmi po dnu")
zapis("ms_deti_vrchol", int(ms_deti[vr_ms]), "nejvíc dětí v MŠ po dnu")
zapis("ms_skoly_1989", int(ms_skoly[1989]), "mateřské školy 1989/90")
zapis("ms_skoly_dnes", int(ms_skoly[S]), "mateřské školy dnes (od 2004/05 bez ohledu na počet pracovišť)")
zapis("ms_na_tridu_1989", round(ms_deti[1989] / ms_tridy[1989], 1), "dětí na třídu MŠ 1989/90")
zapis("ms_na_tridu_dnes", round(ms_deti[S] / ms_tridy[S], 1), "dětí na třídu MŠ dnes")
zapis("zs_zaci_1989", int(zs_zaci[1989]), "žáci ZŠ 1989/90")
zapis("zs_zaci_dnes", int(zs_zaci[S]), "žáci ZŠ dnes")
dno_zs = min(zs_zaci, key=zs_zaci.get)
zapis("zs_zaci_dno_rok", f"{dno_zs}/{str(dno_zs + 1)[2:]}", "školní rok s nejméně žáky ZŠ")
zapis("zs_zaci_dno", int(zs_zaci[dno_zs]), "nejméně žáků ZŠ")
zapis("zs_na_tridu_1989", round(zs_zaci[1989] / zs_tridy[1989], 1), "žáků na třídu ZŠ 1989/90")
zapis("zs_na_tridu_dnes", round(zs_zaci[S] / zs_tridy[S], 1), "žáků na třídu ZŠ dnes")

# Porodnost pro souvislost s dírou a vlnou v mateřských školách (Tab. 01.01)
nar = radek("0101", "Živě narození")
min_nar = min((y for y in nar if y <= 2005), key=nar.get)  # porodní „díra“ druhé poloviny 90. let
zapis("narozeni_1989", int(nar[1989]), "živě narození 1989")
zapis("narozeni_min_rok", min_nar, "rok s nejméně narozenými v letech 1989–2005")
zapis("narozeni_min", int(nar[min_nar]), "nejméně narozených 1989–2005")
zapis("narozeni_min_vs_1989_pct", round(100 * (nar[min_nar] / nar[1989] - 1), 1), "změna narozených 1999 proti 1989, %")
zapis("zs_na_tridu_rozdil", round(zs_zaci[1989] / zs_tridy[1989] - zs_zaci[S] / zs_tridy[S], 1), "o kolik žáků na třídu méně")
zapis("narozeni_dnes", int(nar[max(nar)]), f"živě narození {max(nar)}")

# ---------- 5. Vyšší odborné školy (Tab. 12.05) ----------
vos = sloupec("1205", 3)
vos_skoly = sloupec("1205", 1)
V0 = min(vos)
zapis("vos_rok_od", f"{V0}/{str(V0 + 1)[2:]}", "první školní rok VOŠ v tabulce")
zapis("vos_studenti_od", int(vos[V0]), "studenti VOŠ v prvním roce")
vr_v = max(vos, key=vos.get)
zapis("vos_vrchol_rok", f"{vr_v}/{str(vr_v + 1)[2:]}", "školní rok s nejvíc studenty VOŠ")
zapis("vos_vrchol", int(vos[vr_v]), "nejvíc studentů VOŠ")
dno_v = min((y for y in vos if y > vr_v), key=vos.get)
zapis("vos_dno_rok", f"{dno_v}/{str(dno_v + 1)[2:]}", "školní rok s nejméně studenty VOŠ po vrcholu")
zapis("vos_dno", int(vos[dno_v]), "nejméně studentů VOŠ po vrcholu")
zapis("vos_studenti_dnes", int(vos[max(vos)]), "studenti VOŠ dnes")
zapis("vos_skoly_dnes", int(vos_skoly[max(vos_skoly)]), "VOŠ dnes")


def uloz():
    (HERE / "cisla.json").write_text(json.dumps(C, ensure_ascii=False, indent=1), encoding="utf-8")


uloz()
if __name__ == "__main__":
    (HERE / "vystup.txt").write_text("\n".join(LOG) + "\n", encoding="utf-8")
    print("\n".join(LOG))
