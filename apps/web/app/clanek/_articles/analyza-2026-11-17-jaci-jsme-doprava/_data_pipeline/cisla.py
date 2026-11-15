"""Kapitola „Doprava“ speciálu Jací jsme byli, jací jsme (1989 × 2026) – všechna čísla do textu.

Čte jen primární data v archivu statisticka-data\\cesko (mimo git), nic v archivu nepřepisuje:
  doprava/eurostat-road_eqs_carhab/20261114/   Eurostat road_eqs_carhab, osobní auta na 1 000 obyvatel (1990–2025)
      https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/road_eqs_carhab?geo=CZ&format=JSON&lang=EN
  doprava/sru-vybavenost-1989-2003/20261114/  ČSÚ statistika rodinných účtů 1989–2003, Tab. 1/5 (auta na 100 domácností)
      https://csu.gov.cz/docs/107508/6a21a7be-35c1-90b1-f32b-756646d09fb6/30110515.xls
  doprava/silc-vybavenost-2025/20261114/      ČSÚ Životní podmínky 2025 (SILC), Tab. 1d a 12d (domácnosti s autem)
      https://csu.gov.cz/produkty/prijmy-a-zivotni-podminky-domacnosti-2025
  doprava/rocenka-dopravy-1998/20261114/      Ročenka dopravy 1998 (MD), tab. 422, 522, 611 – HTML windows-1250
      https://www.sydos.cz/cs/rocenka-1998/cze/<kód>.htm
  doprava/rocenka-dopravy-2006/20261114/      Ročenka dopravy 2006, tab. 5.1.3 a 5.1.5 (obsluha obcí 2000)
  doprava/rocenka-dopravy-2025/20261114/excel Ročenka dopravy 2025, tab. 3.1.2, 4.2.3, 5.1.1–5.1.5
      https://www.sydos.cz/cs/rocenka-2025/rocenka/excel_cz/<kód>.xls
  doprava/csu-osobni-doprava-casove-rady/20240404/  ČSÚ Osobní doprava – časové řady (kód 030018-23), Tab. 1 a 2
      https://csu.gov.cz/produkty/osobni_doprava_casove_rady
  doprava/registr-vozidel/20261101/vystup/    (volitelně) výstup vypocet.py jiného agenta z Registru silničních vozidel
  souhrn/cesko-od-1989/20260827/data/32018126_1403.xlsx  ČSÚ Česko od roku 1989 v číslech, Tab. 14.03 (nehody)
Spuštění:  python cisla.py   → cisla.json (pro grafy.py) a vystup.txt
"""
import csv
import html
import json
import os
import re
from pathlib import Path

import openpyxl
import xlrd

HERE = Path(__file__).resolve().parent


def najdi_archiv() -> Path:
    if os.environ.get("CSU_DATA"):
        return Path(os.environ["CSU_DATA"])
    for p in Path(__file__).resolve().parents:
        for kandidat in (p / "csu-data", p / "statisticka-data" / "cesko"):
            if kandidat.exists():
                return kandidat
    raise SystemExit("Archiv csu-data nenalezen – nastav CSU_DATA")


A = najdi_archiv()
D = A / "doprava"
OUT = []
C = {}


def log(*a):
    OUT.append(" ".join(str(x) for x in a))


def uloz(klic, hodnota, popis=""):
    C[klic] = hodnota
    log(f"{klic} = {hodnota}  {popis}")


def num(v):
    return float(v) if isinstance(v, (int, float)) and not isinstance(v, bool) else None


# ---------- Ročenky MD (xls): {popisek: {rok: hodnota}} ----------
def xls_tab(path, n=0):
    """Vrátí seznam (popisek, {rok: hodnota}) v pořadí řádků; roky ze záhlaví."""
    s = xlrd.open_workbook(str(path)).sheet_by_index(0)
    hlav, roky = None, {}
    rows = []
    for r in range(s.nrows):
        v = s.row_values(r)
        if hlav is None:
            ys = {j: int(str(x)[:4]) for j, x in enumerate(v) if re.match(r"^\s*(19|20)\d\d", str(x))}
            if len(ys) >= 5:
                hlav, roky = r, ys
            continue
        lab = re.sub(r"\s+", " ", str(v[0])).strip()
        vals = {roky[j]: num(v[j]) for j in roky if j < len(v) and num(v[j]) is not None}
        if lab:
            rows.append((lab, vals))
    return rows


def najdi(rows, zacatek, n=0, po=None):
    akt = po is None
    shody = []
    for lab, vals in rows:
        if not akt:
            akt = lab.startswith(po)
            continue
        if lab.startswith(zacatek):
            shody.append(vals)
    return shody[n]


R25 = D / "rocenka-dopravy-2025" / "20261114" / "excel"
R06 = D / "rocenka-dopravy-2006" / "20261114"


# ---------- Ročenka 1998 (HTML): čísla za popiskem ----------
def htm_cisla(kod):
    t = (D / "rocenka-dopravy-1998" / "20261114" / f"{kod}.htm").read_bytes().decode("windows-1250")
    # buňky tabulky: text mezi tagy, prázdné vynechat (hranice buněk drží čísla od sebe)
    bunky = [re.sub(r"\s+", " ", html.unescape(x).replace("\xa0", " ")).strip() for x in re.split(r"<[^>]*>", t)]
    return [b for b in bunky if b]


def za_popiskem(bunky, popisek, pocet=2):
    i = next(k for k, b in enumerate(bunky) if b == popisek or b.startswith(popisek))
    cisla = [b for b in bunky[i + 1:] if re.fullmatch(r"\d{1,3}(?: \d{3})*(?:,\d+)?", b)]
    return [float(c.replace(" ", "").replace(",", ".")) for c in cisla[:pocet]]


# =====================================================================
# 1. Auta na obyvatele a v domácnostech
# =====================================================================
j = json.loads((D / "eurostat-road_eqs_carhab" / "20261114" / "road_eqs_carhab_CZ.json").read_text(encoding="utf-8"))
inv = {str(i): k for k, i in j["dimension"]["time"]["category"]["index"].items()}
AUTA_1000 = {int(inv[k]): v for k, v in j["value"].items()}
C["auta_1000_rada"] = AUTA_1000
r0, r1 = min(AUTA_1000), max(AUTA_1000)
uloz("auta_1000_tehdy", [r0, AUTA_1000[r0]], "Eurostat road_eqs_carhab, osobní auta na 1 000 obyvatel")
uloz("auta_1000_dnes", [r1, AUTA_1000[r1]])
uloz("auta_1000_pomer", round(AUTA_1000[r1] / AUTA_1000[r0], 2))

s = xlrd.open_workbook(str(D / "sru-vybavenost-1989-2003" / "20261114" / "30110515.xls")).sheet_by_index(0)
roky_sru = {j: int(x) for j, x in enumerate(s.row_values(2)) if isinstance(x, float) and x > 1900}
for r in range(s.nrows):
    v = s.row_values(r)
    if str(v[1]).strip() == "Osobní automobil":
        sru = {roky_sru[j]: v[j] for j in roky_sru}
uloz("sru_auta_na_100_domacnosti_1989", sru[1989], "ČSÚ SRÚ Tab. 1/5, POČET aut na 100 domácností")
uloz("sru_auta_na_100_domacnosti_2003", sru[2003])


def silc(soubor, popisek, kolikaty=0):
    ws = openpyxl.load_workbook(D / "silc-vybavenost-2025" / "20261114" / soubor, data_only=True).worksheets[0]
    shody = [[x for x in r if x is not None] for r in ws.iter_rows(values_only=True)
             if r and any(str(x).strip() == popisek for x in r if x is not None)]
    return shody[kolikaty]


r_ma = silc("1600212601d.xlsx", "osobní auto", 0)       # mají auto, % domácností
r_nem = silc("1600212601d.xlsx", "osobní auto", 1)      # nemohou si dovolit
hl = silc("1600212601d.xlsx", "Počet domácností                                 absol.")
uloz("silc_domacnosti_celkem", hl[2], "SILC 2025, počet domácností")
uloz("silc_ma_auto_pct", r_ma[1], "SILC 2025 Tab. 1d, % domácností s osobním autem")
uloz("silc_ma_auto_pocet", round(hl[2] * r_ma[1] / 100), "dopočet: domácnosti × podíl")
uloz("silc_nemuze_dovolit_pct", r_nem[1], "% domácností, které by auto chtěly, ale nemohou si ho dovolit")
uloz("silc_duchodci_ma_auto_pct", r_ma[6])   # sloupce: celkem, zaměstnanci, nižší vzd., vyšší vzd., OSVČ, důchodci, nezaměstnaní, ostatní
uloz("silc_nezamestnani_ma_auto_pct", r_ma[7])
uloz("silc_duchodci_nemuze_pct", r_nem[6])
r12 = silc("1600212612d.xlsx", "osobní auto", 0)
# sloupce: s pracujícími (do 999, 1–5 tis., 5–10 tis., 10–50 tis., 50–100 tis., 100 tis.+), bez pracujících (totéž)
VEL = ["do 999", "1 000–4 999", "5 000–9 999", "10 000–49 999", "50 000–99 999", "100 000 a víc"]
n12 = silc("1600212612d.xlsx", "Počet domácností                                 absol.")[2:14]
C["silc_auto_velikost_obce"] = {"s_pracujicimi": dict(zip(VEL, r12[1:7])), "bez_pracujicich": dict(zip(VEL, r12[7:13]))}
log("silc_auto_velikost_obce", C["silc_auto_velikost_obce"], "(Tab. 12d, % domácností s autem)")
# všechny domácnosti podle velikosti obce: vážený průměr obou skupin počty domácností
vsechny = {v: round((n12[k] * r12[1 + k] + n12[6 + k] * r12[7 + k]) / (n12[k] + n12[6 + k]), 1) for k, v in enumerate(VEL)}
C["silc_auto_velikost_obce"]["vsechny"] = vsechny
C["silc_domacnosti_velikost_obce"] = {v: n12[k] + n12[6 + k] for k, v in enumerate(VEL)}
log("silc_auto_velikost_obce vsechny (vážený průměr)", vsechny, C["silc_domacnosti_velikost_obce"])

# =====================================================================
# 2. Vozový park: počet, palivo, stáří 1997 × 2025
# =====================================================================
t522 = htm_cisla("522")
oa97, oa98 = za_popiskem(t522, "celkem")
prez10_97, _ = za_popiskem(t522, "přes 10 let")
benz97, _ = za_popiskem(t522, "benzínové")
dies97, _ = za_popiskem(t522, "dieselové")
el97, _ = za_popiskem(t522, "elektrické")
ost97, _ = za_popiskem(t522, "ostatní")
assert abs(benz97 + dies97 + el97 + ost97 - oa97) < 1, "1997: součet paliv nesedí"
uloz("oa_1997", oa97, "Ročenka dopravy 1998, tab. 522, OA registrované k 31. 12. 1997")
uloz("oa_1997_palivo", {"benzín": benz97, "nafta": dies97, "elektřina": el97, "ostatní": ost97})
uloz("oa_1997_pres10let_pct", round(100 * prez10_97 / oa97, 1))

t423 = xls_tab(R25 / "cz25_420300.xls")
g = lambda lab, **k: najdi(t423, lab, **k)[2025]
oa25 = g("Počet celkem")
pal25 = {"benzín": g("Benzínové celkem"), "nafta": g("Naftové celkem"), "elektřina": g("Elektrické celkem"),
         "LPG": g("LPG celkem"), "CNG/LNG": g("CNG nebo LNG celkem"), "vodík": g("Vodíkové celkem"),
         "bioethanol": g("Bioethanol celkem"), "ostatní": g("Ostatní celkem")}
assert abs(sum(pal25.values()) - oa25) < 1, "2025: součet paliv nesedí"
uloz("oa_2025", oa25, "Ročenka dopravy 2025, tab. 4.2.3")
uloz("oa_2025_palivo", pal25)
uloz("oa_2025_plugin", {"benzín": g("benzínové včetně plug-in hybrid"), "nafta": g("naftové včetně plug-in hybrid")},
     "plug-in hybridy, zahrnuté v benzínových a naftových")
uloz("oa_2025_pres10let_pct", round(100 * g("přes 10 let") / oa25, 1))
uloz("oa_2025_do2let_pct", round(100 * g("do 2 let") / oa25, 1))
uloz("oa_1997_do2let_pct", round(100 * za_popiskem(t522, "do 2 let")[0] / oa97, 1))
P97 = {k: round(100 * v / oa97, 2) for k, v in C["oa_1997_palivo"].items()}
P25 = {k: round(100 * v / oa25, 2) for k, v in pal25.items()}
uloz("palivo_podil_1997", P97)
uloz("palivo_podil_2025", P25)
uloz("plyn_2025", pal25["LPG"] + pal25["CNG/LNG"])

# =====================================================================
# 2b. Registr silničních vozidel (RSV, stav 1. 11. 2026): značky, modely, palivo, výkon
#     Výstup vypocet.py v doprava/registr-vozidel/20261101/ (zpracování 17 GB výpisu, kategorie M1).
#     Skupiny: aktivni = Status PROVOZOVANÉ; proxy_1989 = první registrace v ČR do 31. 12. 1989
#     bez ohledu na dnešní status (i zaniklá, jen co zůstalo v elektronickém registru);
#     aktivni_prvni_registrace_pred_1990 = provozovaná s 1. registrací před 1990 (horní mez – neodhlášená auta).
# =====================================================================
RSV = D / "registr-vozidel" / "20261101" / "vystup"
SKUPINY = {"dnes": "aktivni", "1989": "proxy_1989_registrace_v_CR_do_1989", "stara": "aktivni_prvni_registrace_pred_1990"}
# značka je v registru volný text („VW“, „VOLKSWAGEN/FD SERVIS“, „LADA - VAZ“, „TRABANT.“) → první slovo + aliasy
ALIAS = {"VW": "VOLKSWAGEN", "LADA": "VAZ", "SKODA": "ŠKODA", "MERCEDES": "MERCEDES-BENZ"}
NAZEV = {"ŠKODA": "Škoda", "VOLKSWAGEN": "Volkswagen", "VAZ": "Lada (VAZ)", "FIAT": "Fiat", "TRABANT": "Trabant",
         "MOSKVIČ": "Moskvič", "WARTBURG": "Wartburg", "FORD": "Ford", "HYUNDAI": "Hyundai", "PEUGEOT": "Peugeot",
         "RENAULT": "Renault", "TOYOTA": "Toyota", "DACIA": "Dacia", "OPEL": "Opel", "VOLHA": "Volha"}


def rsv_csv(skupina, co):
    with open(RSV / f"{skupina}_{co}.csv", encoding="utf-8") as f:
        return list(csv.reader(f))[1:]


def znacka_norm(z):
    prvni = (re.split(r"[^\w]+", z.strip().upper()) + [""])[0]
    return ALIAS.get(prvni, prvni)


def model_norm(z, m):
    """Řada modelu: číselné typy podle čísla (105 L → 105), jinak první slovo (OCTAVIA COMBI → OCTAVIA)."""
    m = m.strip().upper()
    c = re.match(r"^(\d+)", m)
    slova = m.replace("-", " ").split() or [""]
    rada = c.group(1) if c else (" ".join(slova[:2]) if len(slova[0]) == 1 else slova[0])   # I 30 → I 30
    return f"{znacka_norm(z)} {rada}"


SOUHRN = (RSV / "souhrn.txt").read_text(encoding="utf-8")


def souhrn_blok(skupina):
    return SOUHRN.split(f"== {skupina}:")[1].split("\n== ")[0]


RSV_C = {}
for klic, sk in SKUPINY.items():
    zn_raw = [(r[0], int(r[1])) for r in rsv_csv(sk, "znacky")]
    n = sum(v for _, v in zn_raw)
    blok = souhrn_blok(sk)
    assert int(re.match(r"\s*(\d+) vozidel", blok).group(1)) == n, f"{sk}: součet značek ≠ počet v souhrn.txt"
    zn = {}
    for k, v in zn_raw:
        zn[znacka_norm(k)] = zn.get(znacka_norm(k), 0) + v
    mod = {}
    for z, m, v in rsv_csv(sk, "modely"):
        mod[model_norm(z, m)] = mod.get(model_norm(z, m), 0) + int(v)
    pal = {k: int(v) for k, v in rsv_csv(sk, "palivo")}
    kw = re.search(r"výkon kW: medián (\d+), průměr ([\d.]+) \(n=(\d+)\)", blok)
    vek = re.search(r"stáří od 1. registrace \(roky\): průměr ([\d.]+), medián ([\d.]+)", blok)
    d = {"n": n,
         "znacky": [(k, v, round(100 * v / n, 1)) for k, v in sorted(zn.items(), key=lambda kv: -kv[1])[:12]],
         "modely": [(k, v, round(100 * v / n, 1)) for k, v in sorted(mod.items(), key=lambda kv: -kv[1])[:8]],
         "palivo": {k: (v, round(100 * v / n, 1)) for k, v in pal.items()},
         "kw_median": int(kw.group(1)), "kw_n": int(kw.group(3)), "kw_n_pct": round(100 * int(kw.group(3)) / n, 1),
         "vek_prumer": float(vek.group(1)) if vek else None, "vek_median": float(vek.group(2)) if vek else None,
         "podil": {k: round(100 * v / n, 2) for k, v in zn.items()}}
    RSV_C[klic] = d
    log(f"\nRSV {klic} ({sk}): {n} aut")
    for k in ("znacky", "modely", "palivo", "kw_median", "kw_n", "kw_n_pct", "vek_prumer", "vek_median"):
        log(f"  {k}: {d[k]}")
C["rsv"] = {k: {kk: vv for kk, vv in v.items() if kk != "podil"} for k, v in RSV_C.items()}
GRAF_ZNACKY = ["ŠKODA", "VAZ", "FIAT", "TRABANT", "VOLKSWAGEN", "FORD", "HYUNDAI"]
C["rsv_graf_znacky"] = [(NAZEV[z], RSV_C["1989"]["podil"].get(z, 0), RSV_C["dnes"]["podil"].get(z, 0)) for z in GRAF_ZNACKY]
log("rsv_graf_znacky (podíl % do 1989 → dnes):", C["rsv_graf_znacky"])
uloz("rsv_aktivni", RSV_C["dnes"]["n"], "RSV 1. 11. 2026, osobní auta (M1) ve stavu PROVOZOVANÉ")
uloz("rsv_1989_zaznamu", RSV_C["1989"]["n"], "M1 s 1. registrací v ČR do 31. 12. 1989, všechny statusy (orientační obraz)")
uloz("rsv_stara_provozovana", RSV_C["stara"]["n"], "PROVOZOVANÉ s 1. registrací před 1990 – horní mez")
uloz("rsv_stara_podil_pct", round(100 * RSV_C["stara"]["n"] / RSV_C["dnes"]["n"], 1), "podíl na autech v provozu")
uloz("rsv_skoda_dnes_pct", round(RSV_C["dnes"]["podil"]["ŠKODA"], 1))
uloz("rsv_skoda_1989_pct", round(RSV_C["1989"]["podil"]["ŠKODA"], 1))
uloz("rsv_skoda_dnes", dict((k, v) for k, v, _ in RSV_C["dnes"]["znacky"])["ŠKODA"])
uloz("rsv_benzin_1989_pct", RSV_C["1989"]["palivo"]["benzín"][1])
uloz("rsv_elektro_dnes", RSV_C["dnes"]["palivo"]["elektřina (BEV)"])
uloz("rsv_kw_median", [RSV_C["1989"]["kw_median"], RSV_C["dnes"]["kw_median"]], "medián výkonu kW: do 1989 → dnes")
uloz("rsv_kw_pomer", round(RSV_C["dnes"]["kw_median"] / RSV_C["1989"]["kw_median"], 2))
uloz("rsv_plugin_dnes", RSV_C["dnes"]["palivo"]["plug-in/hybrid (el. + spal.)"][0], "plug-in hybridy podle volného textu paliva v RSV")
uloz("oa_2025_plugin_celkem", sum(C["oa_2025_plugin"].values()), "plug-in hybridy podle Ročenky 2025 – pro srovnání, RSV je podhodnocuje")
uloz("rsv_octavia", [x for x in RSV_C["dnes"]["modely"] if x[0] == "ŠKODA OCTAVIA"][0], "všechny varianty řady (Combi, RS, Scout…)")

# =====================================================================
# 3. Cestující: vlak a autobus mimo MHD
# =====================================================================
t611 = htm_cisla("611")
vlak97, vlak98 = za_popiskem(t611, "Železniční doprava")
bus97, bus98 = za_popiskem(t611, "Silniční doprava veřejná")
iad97, _ = za_popiskem(t611, "Individuální silniční přeprava osob")
uloz("vlak_1997_mil", vlak97, "Ročenka dopravy 1998, tab. 611")
uloz("bus_1997_mil", bus97, "tab. 611, veřejná silniční doprava mimo autobusovou MHD")
uloz("iad_1997_mil", iad97, "tab. 611, individuální silniční přeprava osob (odhad MD)")

t511 = xls_tab(R25 / "cz25_511000.xls")
vlak25 = najdi(t511, "Železniční doprava")[2025]
bus25 = najdi(t511, "Autobusová doprava")[2025]
iad25 = najdi(t511, "Individuální automobilová")[2025]
mhd25 = najdi(t511, "Městská hromadná doprava")[2025]
uloz("vlak_2025_mil", vlak25, "Ročenka dopravy 2025, tab. 5.1.1")
uloz("bus_2025_mil", bus25)
uloz("iad_2025_mil", iad25, "odhad MD, předběžně")
uloz("mhd_2025_mil", mhd25)
uloz("vlak_zmena_pct", round(100 * (vlak25 / vlak97 - 1), 1))
uloz("bus_zmena_pct", round(100 * (bus25 / bus97 - 1), 1))
uloz("iad_zmena_pct", round(100 * (iad25 / iad97 - 1), 1))

# časová řada ČSÚ (tis.), roky 1995–2023; od 2024 Ročenka 2025
def csu_rocni(soubor):
    ws = openpyxl.load_workbook(D / "csu-osobni-doprava-casove-rady" / "20240404" / soubor, data_only=True).worksheets[0]
    out = {}
    for r in ws.iter_rows(values_only=True):
        y = re.match(r"^((19|20)\d\d)", str(r[0])) if r[0] is not None else None
        if y and r[1] is None and isinstance(r[2], (int, float)):   # roční řádek: bez čtvrtletí
            out[int(y.group(1))] = r[2] / 1000
    return out


vlak_csu, bus_csu = csu_rocni("osdcr040424_1.xlsx"), csu_rocni("osdcr040424_2.xlsx")
rada = {}
for y in range(1997, 2026):
    if y in vlak_csu:
        rada[y] = {"vlak": round(vlak_csu[y], 1), "bus": round(bus_csu[y], 1), "zdroj": "ČSÚ"}
    else:
        rada[y] = {"vlak": najdi(t511, "Železniční doprava")[y], "bus": najdi(t511, "Autobusová doprava")[y], "zdroj": "MD"}
C["cestujici_rada"] = rada
log("cestujici_rada (mil.)", rada)
log("kontrola 1997 ČSÚ × MD 611:", round(vlak_csu[1997], 1), vlak97, round(bus_csu[1997], 1), bus97)
log("ČSÚ 1995/1996 bus (pravděpodobně vč. městských linek, nepoužito):", bus_csu[1995], bus_csu[1996])
vmin = min((v["vlak"], y) for y, v in rada.items() if y < 2020)
uloz("vlak_minimum_pred_covidem", [vmin[1], vmin[0]])
uloz("vlak_2019", rada[2019]["vlak"])
uloz("bus_2019", rada[2019]["bus"])

t514 = xls_tab(R25 / "cz25_514000.xls")
lin_vnitro = najdi(t514, "linková vnitrostátní")[2025]
ver_zajem = najdi(t514, "linková doprava vnitrostátní ve veřejném zájmu")[2025]
uloz("bus_linkova_vnitrostatni_2025_tis", lin_vnitro)
uloz("bus_verejny_zajem_2025_tis", ver_zajem)
uloz("bus_verejny_zajem_pct", round(100 * ver_zajem / lin_vnitro, 1), "podíl cestujících vnitrostátních linek ve veřejném zájmu")
t512 = xls_tab(R25 / "cz25_512000.xls")
uloz("vlak_ids_pct", round(100 * najdi(t512, "z toho: v rámci IDS")[2025] / najdi(t512, "vnitrostátní přeprava")[2025], 1),
     "podíl vnitrostátních cestujících vlakem v integrovaných systémech")

# =====================================================================
# 4. Obsluha obcí 2000 × 2025 (CIS podle Ročenek)
# =====================================================================
def obsluha06(kod):
    t = xls_tab(R06 / f"cz06_{kod}.xls")
    out = {}
    for den, po in (("pracovní den", "Počet obcí s dopravní obsluhou v pracovní den"),
                    ("sobota", "Počet obcí s dopravní obsluhou v sobotu"),
                    ("neděle", "Počet obcí s dopravní obsluhou v n")):
        obci = najdi(t, po)[2000]
        out[den] = {"obci": obci, "bez": najdi(t, "0 spojů", po=po)[2000], "1-4": najdi(t, "1 - 4", po=po)[2000]}
    return out


def obsluha25(kod):
    t = xls_tab(R25 / f"cz25_{kod}.xls")
    obci = najdi(t, "Počet obcí - celkem")[2025]
    out = {}
    for den, po in (("pracovní den", "Počet obcí s dopravní obsluhou v pracovní den"),
                    ("sobota", "Počet obcí s dopravní obsluhou v sobotu"),
                    ("neděle", "Počet obcí s dopravní obsluhou v neděli")):
        obsl = najdi(t, po)[2025]
        out[den] = {"obci": obci, "bez": obci - obsl, "1-4": najdi(t, "1 - 4", po=po)[2025]}
    return out


BUS = {2000: obsluha06("515000"), 2025: obsluha25("515000")}
VLAK = {2000: obsluha06("513000"), 2025: obsluha25("513000")}
C["obsluha_bus"], C["obsluha_vlak"] = BUS, VLAK
for y in (2000, 2025):
    for den in ("pracovní den", "sobota", "neděle"):
        b = BUS[y][den]
        log(f"bus {y} {den}: obcí {b['obci']:.0f}, bez spoje {b['bez']:.0f} ({100 * b['bez'] / b['obci']:.1f} %), 1–4 spoje {b['1-4']:.0f}")
    v = VLAK[y]["pracovní den"]
    log(f"vlak {y} pracovní den: obcí se spojem {v['obci'] - v['bez']:.0f} ({100 * (v['obci'] - v['bez']) / v['obci']:.1f} %)")
uloz("bus_sobota_bez_2025", BUS[2025]["sobota"]["bez"])
uloz("bus_sobota_bez_2025_pct", round(100 * BUS[2025]["sobota"]["bez"] / BUS[2025]["sobota"]["obci"], 1))
uloz("bus_sobota_bez_2000", BUS[2000]["sobota"]["bez"])
uloz("bus_sobota_bez_2000_pct", round(100 * BUS[2000]["sobota"]["bez"] / BUS[2000]["sobota"]["obci"], 1))
uloz("bus_nedele_bez_2025", BUS[2025]["neděle"]["bez"])
uloz("bus_nedele_bez_2000", BUS[2000]["neděle"]["bez"])
uloz("bus_prac_bez_2025", BUS[2025]["pracovní den"]["bez"])
uloz("bus_prac_bez_2000", BUS[2000]["pracovní den"]["bez"])
for y in (2000, 2025):
    so = BUS[y]["sobota"]
    uloz(f"bus_sobota_nejvys4_{y}", so["bez"] + so["1-4"], "obcí bez spoje nebo s 1–4 spoji v sobotu")
uloz("obci_2000", BUS[2000]["pracovní den"]["obci"])
uloz("obci_2025", BUS[2025]["pracovní den"]["obci"])
uloz("vlak_obci_2000", VLAK[2000]["pracovní den"]["obci"] - VLAK[2000]["pracovní den"]["bez"])
uloz("vlak_obci_2025", VLAK[2025]["pracovní den"]["obci"] - VLAK[2025]["pracovní den"]["bez"])

# tratě
t422 = htm_cisla("422")
trate98 = za_popiskem(t422, "Provozní délka tratí celkem k 31.12. (km)")[1]
trate25 = najdi(xls_tab(R25 / "cz25_312000.xls"), "Provozní délka tratí celkem")[2025]
uloz("trate_1998_km", trate98, "Ročenka 1998, tab. 422")
uloz("trate_2025_km", trate25, "Ročenka 2025, tab. 3.1.2")

# =====================================================================
# 5. Nehody (ČSÚ Tab. 14.03)
# =====================================================================
ws = openpyxl.load_workbook(A / "souhrn" / "cesko-od-1989" / "20260827" / "data" / "32018126_1403.xlsx", data_only=True).worksheets[0]
umrti = {}
for r in ws.iter_rows(values_only=True):
    if isinstance(r[0], int) and 1980 < r[0] < 2030 and isinstance(r[2], (int, float)):
        umrti[r[0]] = r[2]
r1 = max(umrti)
uloz("umrti_1989", umrti[1989], "ČSÚ Tab. 14.03, usmrcení do 30 dnů")
uloz("umrti_dnes", [r1, umrti[r1]])
umax = max(umrti.items(), key=lambda kv: kv[1])
uloz("umrti_max", list(umax))
(HERE / "cisla.json").write_text(json.dumps(C, ensure_ascii=False, indent=1, default=str), encoding="utf-8")
(HERE / "vystup.txt").write_text("\n".join(OUT) + "\n", encoding="utf-8")
print("\n".join(OUT))
