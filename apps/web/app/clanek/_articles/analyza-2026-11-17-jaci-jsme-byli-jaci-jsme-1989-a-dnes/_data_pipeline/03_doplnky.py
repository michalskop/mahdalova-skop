"""Doplňkové dvojice 1989 × dnes mimo publikaci ČSÚ „Česko od roku 1989 v číslech“.

Všechny vstupy leží v archivu csu-data (statisticka-data/cesko), u každého je ZDROJ.txt s URL:
  scitani/sldb2021-vira/20261114/          víra 2021 (CSV ČSÚ) + stránka ČSÚ se sčítáním 1991/2001
  volby/ucast-casova-rada/20261114/        volební účast od 1990 (ČSÚ, XLSX)
  pravo/svatky-93-1951/20261114/           znění zákona o svátcích 1988–1990 a zákon 245/2000 Sb.
  doprava/eurostat-road_eqs_carhab/20261114/  auta na 1 000 obyvatel (Eurostat)
  ceny/nemovitosti/20261114/               cena bytu za m² 2025 (ČSÚ)
  pruzkumy/cvvm-listopad-1989/20261114/    CVVM 2024, hodnocení změn po listopadu 1989
  souhrn/cesko-od-1989/20260827/           mzdy (Tab. 13.07), bytová výstavba (Tab. 11.01)

Výstup: doplnky.json + doplnky.md
"""
import csv
import html
import json
import re
from pathlib import Path

import openpyxl

from importlib import import_module

d2 = import_module("02_dvojice")  # sdílí najdi_archiv, radek, sloupec
A = d2.najdi_archiv()
OUT = []


def zapis(okruh, ukazatel, tehdy, rok_t, dnes, rok_d, jednotka, zdroj, pozn=""):
    OUT.append(dict(okruh=okruh, ukazatel=ukazatel, tehdy=tehdy, rok_tehdy=rok_t, dnes=dnes, rok_dnes=rok_d,
                    jednotka=jednotka, zdroj=zdroj, pozn=pozn))


# ---------- Víra ----------
p = A / "scitani/sldb2021-vira/20261114"
stranka = html.unescape(re.sub(r"<[^>]+>", " ", (p / "csu_nabozenske_vyznani_1991_2001.html").read_text(encoding="utf-8")))
stranka = re.sub(r"\s+", " ", stranka)


def z_tabulky_1991(popisek):
    """Řádek tabulky na stránce ČSÚ: popisek, 1991 abs., 1991 %, 2001 abs., 2001 %."""
    m = re.search(re.escape(popisek) + r"(?: v tom:)? (\d[\d ]*?) (\d+,\d) (\d[\d ]*?) (\d+,\d)", stranka)
    if not m:
        raise SystemExit(f"Na stránce ČSÚ chybí řádek {popisek!r} – zkontrolovat HTML")
    return float(m.group(2).replace(",", "."))


vira91 = z_tabulky_1991("Věřící celkem")
rkc91 = z_tabulky_1991("Církev římskokatolická")
bez91 = z_tabulky_1991("Bez vyznání")
nezj91 = z_tabulky_1991("Nezjištěno")

soucty, celkem = {}, None
for r in csv.DictReader(open(p / "sldb2021_vira_pohlavi.csv", encoding="utf-8-sig")):
    if r["uzemi_txt"] != "Česká republika":
        continue
    if not r["vira_txt"] and not r["pohlavi_kod"]:
        celkem = int(r["hodnota"])
    elif r["vira_txt"]:
        soucty[r["vira_txt"]] = soucty.get(r["vira_txt"], 0) + int(r["hodnota"])
bez21 = soucty["Bez náboženské víry"] / celkem * 100
neuv21 = soucty["Neuvedeno"] / celkem * 100
vir21 = 100 - bez21 - neuv21
rkc21 = soucty["Církev římskokatolická"] / celkem * 100
bezcirkve21 = soucty["věřící - nehlásící se k žádné církvi ani náboženské společnosti"] / celkem * 100
O = "Víra (sčítání)"
zapis(O, "Věřící (všichni, kdo víru uvedli)", vira91, 1991, round(vir21, 1), 2021, "% obyvatel", "ČSÚ, SLDB 1991 a 2021",
      f"2021 včetně věřících bez církve ({bezcirkve21:.1f} %); otázka dobrovolná, 1991 nezjištěno {nezj91} %, 2021 neuvedeno {neuv21:.1f} %")
zapis(O, "Římskokatolická církev", rkc91, 1991, round(rkc21, 1), 2021, "% obyvatel", "ČSÚ, SLDB 1991 a 2021",
      "2021 jen přihlášení k církvi; další 2,2 % uvedlo „katolická víra“ bez církve")
zapis(O, "Bez víry / bez vyznání", bez91, 1991, round(bez21, 1), 2021, "% obyvatel", "ČSÚ, SLDB 1991 a 2021")

# ---------- Volební účast ----------
ws = openpyxl.load_workbook(A / "volby/ucast-casova-rada/20261114/vuhcr121925_volebni_ucast_v__.xlsx", data_only=True).worksheets[0]
rows = [list(r) for r in ws.iter_rows(values_only=True)]
ucast = {}
for hlav, hod in zip(rows, rows[1:]):
    if hlav and hlav[0] == "Volby" and hod and str(hod[0]).startswith("Volební účast"):
        for k, v in zip(hlav[1:], hod[1:]):
            if k and v is not None:
                ucast[str(k).strip()] = v
ps = {k: v for k, v in ucast.items() if k.startswith(("ČNR", "PS"))}
posl = max((k for k in ps if k.startswith("PS")), key=lambda k: int(k[-4:]))
zapis("Svoboda a politika", "Účast ve sněmovních volbách", ps["ČNR 1990"], 1990, ps[posl], int(posl[-4:]), "%",
      "ČSÚ, Voliči, účast, hlasy", "1990 volby do České národní rady (první svobodné)")

# ---------- Svátky (právní stav, ručně z textu zákonů – viz ZDROJ.txt) ----------
SVATKY_1989 = ["1. 1.", "Velikonoční pondělí", "1. 5.", "9. 5.", "28. 10.", "25. 12.", "26. 12."]
SVATKY_DNES = ["1. 1.", "Velký pátek", "Velikonoční pondělí", "1. 5.", "8. 5.", "5. 7.", "6. 7.", "28. 9.",
               "28. 10.", "17. 11.", "24. 12.", "25. 12.", "26. 12."]
zapis("Svoboda a politika", "Dny pracovního klidu (svátky) za rok", len(SVATKY_1989), 1989, len(SVATKY_DNES), 2026, "dní",
      "zák. 93/1951 Sb. ve znění 141/1988 Sb.; zák. 245/2000 Sb.",
      "1989: státní svátky 9. 5. a 28. 10.; významné dny 25. 2. (Vítězný únor), 29. 8., 7. 11. (VŘSR). Dnes navíc 5. 7., 6. 7., "
      "28. 9., 17. 11., Velký pátek, Štědrý den; Den vítězství z 9. na 8. 5.")

# ---------- Kriminalita od roku 1973 (IKSP, příloha 1 = data Policie ČR) ----------
import pypdf

pdf = A / "kriminalita/iksp-trendy-kriminality-2023/20261114/Trendy-kriminality-v-CR-v-roce-2023-IKSP-Diblikova.pdf"
stranka_p1 = next(p.extract_text() for p in pypdf.PdfReader(pdf).pages if "Příloha č. 1: Celková kriminalita" in p.extract_text() and "1989" in p.extract_text())
# řádek přílohy: „rok zjištěné objasněné objasněnost“, čísla s mezerou jako oddělovačem tisíců
tc = {}
for radek in stranka_p1.splitlines():
    m = re.match(r"\s*(19[789]\d|20[0-2]\d)\s+(\d{1,3} \d{3})\b", radek)
    if m:
        tc[int(m.group(1))] = int(m.group(2).replace(" ", ""))
assert tc[1989] == 120768 and tc[1991] == 282998, "kontrola přílohy IKSP selhala"
tc_cs = d2.sloupec("1401", 1)  # ČSÚ Tab. 14.01 (od 1991) – pro poslední rok
vrchol = max(tc, key=tc.get)
zapis("Svoboda a politika", "Registrované trestné činy", tc[1989], 1989, int(tc_cs[max(tc_cs)]), max(tc_cs), "počet",
      "IKSP, Trendy kriminality 2023, příl. 1 (Policie ČR); ČSÚ Tab. 14.01",
      f"vrchol {vrchol}: {tc[vrchol]}; 1990: {tc[1990]}")

# ---------- Auta ----------
j = json.loads((A / "doprava/eurostat-road_eqs_carhab/20261114/road_eqs_carhab_CZ.json").read_text(encoding="utf-8"))
t = {v: k for k, v in j["dimension"]["time"]["category"]["index"].items()}
auta = {int(t[int(k)]): v for k, v in j["value"].items()}
zapis("Peníze a bydlení", "Osobní auta na 1 000 obyvatel", auta[min(auta)], min(auta), auta[max(auta)], max(auta), "aut",
      "Eurostat road_eqs_carhab", "registr obsahuje i neodhlášená neexistující auta – skutečný počet je nižší")

# ---------- Bydlení: náklady na stavbu rodinného domu v hrubých mzdách ----------
hruba = d2.sloupec("1307", 2)
naklad_byt = d2.radek("1101", "Investiční náklady na výstavbu 1 bytu v tis. Kč", 0)   # 1. výskyt = rodinné domy
naklad_m2 = d2.radek("1101", "Investiční náklady na výstavbu 1 m2 užitné plochy v Kč", 0)
# 2025 je předběžný a nově z registru RÚIAN (pozn. 1 Tab. 11.01) → srovnáváme s rokem 2024, stejně jako kapitola Bydlení
r1 = 2024
zapis("Peníze a bydlení", "Postavit rodinný dům (náklady výstavby)", round(naklad_byt[1989] * 1000 / hruba[1989], 0), 1989,
      round(naklad_byt[r1] * 1000 / hruba[r1], 0), r1, "hrubých měsíčních mezd", "ČSÚ Tab. 11.01 + 13.07",
      f"jen investiční náklady stavby, bez pozemku; 1989 {naklad_byt[1989]:.0f} tis. Kčs, {r1} {naklad_byt[r1]:.0f} tis. Kč")
zapis("Peníze a bydlení", "1 m² nového rodinného domu (náklady výstavby)", round(naklad_m2[1989] / hruba[1989], 2), 1989,
      round(naklad_m2[r1] / hruba[r1], 2), r1, "hrubých měsíčních mezd", "ČSÚ Tab. 11.01 + 13.07",
      "stavba je vůči mzdě zhruba stejně drahá; zdražily hlavně pozemky a hotové byty na trhu")
CENA_BYTU_M2_2025 = 72410  # ČSÚ, csu.gov.cz/ceny-nemovitosti (ZDROJ.txt), ověřit exportem VDB CEN14A
zapis("Peníze a bydlení", "Byt 60 m² za průměrnou cenu", None, 1989, round(60 * CENA_BYTU_M2_2025 / hruba[2025], 0), 2025,
      "hrubých měsíčních mezd", "ČSÚ ceny nemovitostí + Tab. 13.07",
      f"{CENA_BYTU_M2_2025} Kč/m² (ČR 2025) = {60*CENA_BYTU_M2_2025/hruba[2025]/12:.1f} ročních hrubých mezd; v roce 1989 trh s byty neexistoval")

# ---------- Vnímání (CVVM 2024) ----------
O = "Jak to vidíme (CVVM 2024)"
for ukaz, lepsi, horsi in [
    ("Možnost studovat, pracovat, cestovat do zahraničí", 77, 17), ("Přístup ke vzdělání", 65, 14),
    ("Svobodný přístup k informacím", 64, 21), ("Životní úroveň", 57, 20), ("Možnost vyjádřit názor", 57, 21),
    ("Zdravotní péče", 55, 20), ("Pracovní příležitosti", 55, 25), ("Sociální jistoty", 38, 40),
    ("Bezpečnost občanů, kriminalita", 32, 42)]:
    zapis(O, f"{ukaz}: dnes lepší / horší než před 1989", lepsi, "lepší", horsi, "horší", "% dotázaných",
          "CVVM SOÚ AV ČR, Naše společnost 6–8/2024, pd241111, Tab. 4")
zapis(O, "Současné poměry lepší / horší než před listopadem 1989", 43, "lepší", 16, "horší", "% (37 % napůl)", "CVVM pd241111")
zapis(O, "Hodnotí listopad 1989 kladně / záporně", 68, "kladně", 12, "záporně", "%", "CVVM pd241111")


def main():
    here = Path(__file__).parent
    (here / "doplnky.json").write_text(json.dumps(OUT, ensure_ascii=False, indent=1), encoding="utf-8")
    L = ["# Česko 1989 × dnes – doplňky mimo publikaci ČSÚ", "", "Generováno `03_doplnky.py`.", ""]
    ok = None
    for d in OUT:
        if d["okruh"] != ok:
            ok = d["okruh"]
            L += ["", f"## {ok}", "", "| ukazatel | tehdy | dnes | jednotka | zdroj | pozn. |", "|---|---|---|---|---|---|"]
        f = lambda v: "–" if v is None else str(v).replace(".", ",")
        L.append(f"| {d['ukazatel']} | {f(d['tehdy'])} ({d['rok_tehdy']}) | {f(d['dnes'])} ({d['rok_dnes']}) | {d['jednotka']} | {d['zdroj']} | {d['pozn']} |")
    (here / "doplnky.md").write_text("\n".join(L) + "\n", encoding="utf-8")
    print(f"{len(OUT)} doplňků → doplnky.json, doplnky.md")


if __name__ == "__main__":
    main()
