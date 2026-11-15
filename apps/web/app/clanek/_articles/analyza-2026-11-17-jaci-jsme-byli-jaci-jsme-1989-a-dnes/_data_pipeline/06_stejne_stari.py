"""Stejně staří lidé při sčítání 1991 × 2021 (věkové skupiny 20–29, 30–39, 40–49, 50–59, 60–69).

Srovnáváme stejný věk, aby výsledek neovlivnilo, že populace mezitím zestárla.
Čísla počítá výhradně z primárních dat ČSÚ v archivu statisticka-data\\cesko (odkaz csu-data):

  1991 – Pramenné dílo SLDB 1991, Obyvatelstvo (https://csu.gov.cz/obyvatelstvo1991), PDF:
    tab05.pdf  Tab. 5  Obyvatelstvo podle věkových skupin, pohlaví a rodinného stavu
    tab12.pdf  Tab. 12 Obyvatelstvo starší 15 let podle věku, nejvyššího vzdělání a pohlaví
    tab29.pdf  Tab. 29 Intenzita ekonomické aktivity obyvatelstva podle věku (‰)
    tab32.pdf  Tab. 32 Ženy podle věku a počtu všech živě narozených dětí
  2021 – SLDB 2021 otevřená data (https://csu.gov.cz/produkty/vysledky-scitani-2021-otevrena-data), CSV:
    sldb2021_vzdelani_vek_pohlavi.csv, sldb2021_stav_vek5_pohlavi.csv,
    sldb2021_aktivita_vek1_pohlavi.csv, sldb2021_zeny_stav_vzdelani_vek_deti.csv
Přesné URL souborů jsou v ZDROJ.txt obou sad (scitani/sldb1991-vek/20261114, scitani/sldb2021-vek/20261114).

Text z PDF čte pdftotext -raw (poppler). Čísla v PDF mají mezeru jako oddělovač tisíců, takže řádek „30 - 34 344 651 52 152 …“
jde rozdělit víc způsoby; skript zkusí všechna rozdělení a nechá jen to, kde celkem = součet částí
(musí vyjít právě jedno). Navíc kontroluje muži + ženy = celkem.

Definice (stejné pro oba roky, nezjištěné hodnoty se ze jmenovatele vynechávají):
  VŠ          – vysokoškolské vzdělání (2021 bakalářské + magisterské + doktorské); 1991 bez kategorie „vyšší“
  rodinný stav – ženatí/vdané, svobodní, rozvedení (2021 registrované partnerství zvlášť, do podílů nepatří)
  bezdětné    – ženy bez živě narozeného dítěte (jmenovatel bez „nezjištěno“)
  pracující   – 1991 ekonomicky aktivní bez hledajících zaměstnání a bez žen na mateřské dovolené (Tab. 29, ‰,
                váženo počtem mužů a žen z Tab. 5); 2021 zaměstnaní bez osob na mateřské dovolené.
                Ženy na další mateřské/rodičovské tak nejsou „pracující“ ani v jednom roce.
Populace: 1991 trvale bydlící, 2021 obvyklý pobyt.

Spuštění (po 05_interaktivni.py, protože doplňuje data/od-narozeni.json):
  python 06_stejne_stari.py   → vystup_stejne_stari.txt, ../data/stejne-stari.json, ../data/od-narozeni.json (klíč podle_veku)
"""
import csv
import json
import os
import re
import sys
from collections import defaultdict
from pathlib import Path

import shutil
import subprocess

HERE = Path(__file__).resolve().parent
DATA_OUT = HERE.parent / "data"
VYSTUP = HERE / "vystup_stejne_stari.txt"

SCITANI_1991_URL = "https://csu.gov.cz/obyvatelstvo1991"
SCITANI_2021_URL = "https://csu.gov.cz/produkty/vysledky-scitani-2021-otevrena-data"
ZDROJ = (f"[ČSÚ, sčítání 1991 – pramenné dílo]({SCITANI_1991_URL}), Tab. 5, 12, 29, 32; "
         f"[ČSÚ, sčítání 2021 – otevřená data]({SCITANI_2021_URL})")


def najdi_archiv() -> Path:
    if os.environ.get("CSU_DATA"):
        return Path(os.environ["CSU_DATA"])
    for p in Path(__file__).resolve().parents:
        for kandidat in (p / "csu-data", p / "statisticka-data" / "cesko"):
            if kandidat.exists():
                return kandidat
    raise SystemExit("Archiv csu-data nenalezen – nastav CSU_DATA")


ARCHIV = najdi_archiv()
D91 = ARCHIV / "scitani" / "sldb1991-vek" / "20261114"
D21 = ARCHIV / "scitani" / "sldb2021-vek" / "20261114"

radky_vystupu = []


def out(s=""):
    print(s)
    radky_vystupu.append(s)


# ------------------------------------------------------------------ čtení PDF 1991
def stranky(nazev):
    """Text stránek PDF přes pdftotext -raw (poppler; ve Windows je v Git Bash). Řádky drží pořadí sloupců."""
    exe = shutil.which("pdftotext")
    if not exe:
        raise SystemExit("Chybí pdftotext (poppler-utils / Git Bash)")
    txt = subprocess.run([exe, "-raw", "-enc", "UTF-8", str(D91 / nazev), "-"], capture_output=True, check=True).stdout
    return txt.decode("utf-8").split("")


def rozdel(tokeny, n):
    """Všechna rozdělení tokenů na n čísel (první skupina 1–3 číslice, další přesně 3; „-“/„x“ = 0)."""
    vysledky = []

    def krok(i, akt):
        if len(akt) > n:
            return
        if i == len(tokeny):
            if len(akt) == n:
                vysledky.append(list(akt))
            return
        t = tokeny[i]
        if t in ("-", "x"):
            krok(i + 1, akt + [0])
            return
        if not re.fullmatch(r"\d{1,3}", t):
            return
        cislo, j = t, i + 1
        krok(j, akt + [int(cislo)])
        while j < len(tokeny) and re.fullmatch(r"\d{3}", tokeny[j]):
            cislo += tokeny[j]
            j += 1
            krok(j, akt + [int(cislo)])

    krok(0, [])
    return vysledky


def radek_se_souctem(text_radku, n):
    """Rozdělí řádek tabulky na n čísel tak, aby první = součet ostatních; musí vyjít právě jedno."""
    tokeny = text_radku.replace("xxxx", "x x x x").split()
    moznosti = [r for r in rozdel(tokeny, n) if r[0] == sum(r[1:])]
    if len(moznosti) != 1:
        raise SystemExit(f"Řádek nejde jednoznačně rozdělit ({len(moznosti)} možností): {text_radku!r}")
    return moznosti[0]


VEK_RE = re.compile(r"^\s*(\d+)\s*-\s*(\d+)\s+(.*)$")


def tab05():
    """{pohlaví: {(od, do): [celkem, svobodní, ženatí, rozvedení, ovdovělí, nezjištěn]}}"""
    s = stranky("tab05.pdf")
    vysledek = {}
    bloky = {"muži": [], "ženy": [], "celkem": []}
    aktualni = None
    for i, stranka in enumerate(s):
        poradi = ["muži", "ženy"] if i == 0 else ["celkem"]
        k = 0
        for radek in stranka.splitlines():
            m = VEK_RE.match(radek)
            if m:
                if aktualni is None:
                    aktualni = poradi[k]
                bloky[aktualni].append(((int(m.group(1)), int(m.group(2))), m.group(3)))
            elif radek.strip().startswith("úhrn"):
                k += 1
                aktualni = None
    for pohl, radky in bloky.items():
        vysledek[pohl] = {vek: radek_se_souctem(zbytek, 6) for vek, zbytek in radky}
    for vek in vysledek["celkem"]:
        assert [a + b for a, b in zip(vysledek["muži"][vek], vysledek["ženy"][vek])] == vysledek["celkem"][vek], vek
    return vysledek


TAB12_VEKY = [(15, 19), (20, 24), (25, 29), (30, 34), (35, 39), (40, 49), (50, 59), (60, 200)]


def tab12():
    """{pohlaví: {kategorie: {(od, do): počet}}} – kategorie 'vysokoškolské', 'bez údaje', 'celkem'."""
    s = stranky("tab12.pdf")
    vysledek = {}
    for stranka, pohl in zip(s, ["muži", "ženy", "celkem"]):
        d = {}
        for radek in stranka.splitlines():
            for klic, vzor in (("vysokoškolské", "vysokoškolské "), ("bez údaje", "osoby bez údaje o šk. vzděl. "),
                               ("celkem", "celkem ")):
                if radek.startswith(vzor) and klic not in d:
                    hodnoty = radek_se_souctem(radek[len(vzor):], 10)  # celkem + 8 věkových skupin + nezj.
                    d[klic] = dict(zip(TAB12_VEKY, hodnoty[1:9]))
        assert set(d) == {"vysokoškolské", "bez údaje", "celkem"}, (pohl, d.keys())
        vysledek[pohl] = d
    for kat in vysledek["celkem"]:
        for vek in TAB12_VEKY:
            assert vysledek["muži"][kat][vek] + vysledek["ženy"][kat][vek] == vysledek["celkem"][kat][vek], (kat, vek)
    return vysledek


def tab29():
    """{(od, do): {'muzi_akt', 'muzi_hled', 'zeny_akt', 'zeny_md', 'zeny_hled'}} v ‰."""
    s = stranky("tab29.pdf")[0]
    d = {}
    for radek in s.splitlines():
        m = VEK_RE.match(radek)
        if not m:
            continue
        t = [0 if x in ("x", "-") else int(x) for x in m.group(3).split()]
        if len(t) != 8:  # celkem; muži: celkem, hledající, prac. důchodci; ženy: celkem, na MD, hledající, prac. důchodci
            raise SystemExit(f"Tab. 29: nečekaný řádek {radek!r}")
        d[(int(m.group(1)), int(m.group(2)))] = {"muzi_akt": t[1], "muzi_hled": t[2],
                                                 "zeny_akt": t[4], "zeny_md": t[5], "zeny_hled": t[6]}
    return d


def tab32():
    """{(od, do): [celkem, 0, 1, …, 10+, nezj.]} – všechny ženy (1. strana tabulky)."""
    s = stranky("tab32.pdf")[0]
    d = {}
    for radek in s.splitlines():
        m = VEK_RE.match(radek)
        if m and 20 <= int(m.group(1)) <= 65:  # řádek 15–19 pypdf čte s rozbitými mezerami, nepotřebujeme ho
            d[(int(m.group(1)), int(m.group(2)))] = radek_se_souctem(m.group(3), 13)
    return d


# ------------------------------------------------------------------ čtení CSV 2021
def csv_cr(nazev):
    with open(D21 / nazev, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            if r["uzemi_cis"] == "97":  # Česká republika
                yield r


def vek_od(txt):
    return int(re.match(r"\d+", txt).group())


def data_2021():
    vzd = defaultdict(lambda: defaultdict(int))     # vek -> kategorie -> počet (obě pohlaví)
    for r in csv_cr("sldb2021_vzdelani_vek_pohlavi.csv"):
        if r["pohlavi_txt"] == "":
            vzd[vek_od(r["vek_txt"])][r["vzdelani_txt"]] += int(r["hodnota"])
    stav = defaultdict(lambda: defaultdict(int))    # vek5 od -> stav -> počet
    for r in csv_cr("sldb2021_stav_vek5_pohlavi.csv"):
        if r["pohlavi_txt"] == "":
            stav[vek_od(r["vek_txt"])][r["stav_txt"]] += int(r["hodnota"])
    akt = defaultdict(lambda: defaultdict(int))     # vek -> aktivita -> počet
    for r in csv_cr("sldb2021_aktivita_vek1_pohlavi.csv"):
        if r["pohlavi_txt"] == "":
            akt[vek_od(r["vek_txt"])][r["aktivita_txt"]] += int(r["hodnota"])
    deti = defaultdict(lambda: defaultdict(int))    # vek5 od -> počet dětí -> počet žen
    for r in csv_cr("sldb2021_zeny_stav_vzdelani_vek_deti.csv"):
        if r["stav_txt"] == "" and r["vzdelani_txt"] == "":
            deti[vek_od(r["vek_txt"])][r["pocet_deti_txt"]] += int(r["hodnota"])
    return vzd, stav, akt, deti


# ------------------------------------------------------------------ výpočet
SKUPINY = [
    (20, 29, "Dvacátníci", "dvacátníci"),
    (30, 39, "Třicátníci", "třicátníci"),
    (40, 49, "Čtyřicátníci", "čtyřicátníci"),
    (50, 59, "Padesátníci", "padesátníci"),
    (60, 69, "Šedesátníci", "šedesátníci"),
]
VS_2021 = ("vysokoškolské bakalářské vzdělání", "vysokoškolské magisterské vzdělání", "vysokoškolské doktorské vzdělání")


def pet(od, do):
    return [(a, a + 4) for a in range(od, do + 1, 5)]


def podil(citatel, jmenovatel):
    return 100 * citatel / jmenovatel


def spocti():
    t05, t12, t29, t32 = tab05(), tab12(), tab29(), tab32()
    vzd, stav, akt, deti = data_2021()
    vysledky = []
    for od, do, nazev, _ in SKUPINY:
        r = {"od": od, "do": do, "nazev": nazev, "ukazatele": {}}
        U = r["ukazatele"]

        # VŠ – 1991 Tab. 12 má desetiletá pásma 40–49 a 50–59 a 60+; 60–69 tedy nejde
        veky12 = [v for v in TAB12_VEKY if v[0] >= od and v[1] <= do]
        if veky12 and veky12[0][0] == od and veky12[-1][1] == do:
            c = t12["celkem"]
            vs91 = sum(c["vysokoškolské"][v] for v in veky12)
            zn91 = sum(c["celkem"][v] - c["bez údaje"][v] for v in veky12)
            vs21 = sum(vzd[a][k] for a in range(od, do + 1) for k in VS_2021)
            zn21 = sum(sum(v for k, v in vzd[a].items() if k != "nezjištěno") for a in range(od, do + 1))
            U["vs"] = (podil(vs91, zn91), podil(vs21, zn21), f"VŠ {vs91}/{zn91} × {vs21}/{zn21}")

        # rodinný stav – Tab. 5 × stav_vek5
        k91 = [sum(t05["celkem"][v][i] for v in pet(od, do)) for i in range(6)]
        zn91 = k91[0] - k91[5]
        s21 = defaultdict(int)
        for v in pet(od, do):
            for k, x in stav[v[0]].items():
                s21[k] += x
        zn21 = sum(s21.values()) - s21["Nezjištěno"]
        U["zenati"] = (podil(k91[2], zn91), podil(s21["Ženatý/vdaná"], zn21), f"ženatí {k91[2]}/{zn91} × {s21['Ženatý/vdaná']}/{zn21}")
        U["svobodni"] = (podil(k91[1], zn91), podil(s21["Svobodný/svobodná"], zn21), f"svobodní {k91[1]}/{zn91} × {s21['Svobodný/svobodná']}/{zn21}")
        U["rozvedeni"] = (podil(k91[3], zn91), podil(s21["Rozvedený/rozvedená"], zn21), f"rozvedení {k91[3]}/{zn91} × {s21['Rozvedený/rozvedená']}/{zn21}")

        # bezdětné ženy – Tab. 32 × zeny_…_deti
        b91 = sum(t32[v][1] for v in pet(od, do))
        n91 = sum(t32[v][0] - t32[v][12] for v in pet(od, do))
        b21 = sum(deti[v[0]]["0"] for v in pet(od, do))
        n21 = sum(deti[v[0]][""] - deti[v[0]]["Nezjištěno"] for v in pet(od, do))
        U["bezdetne"] = (podil(b91, n91), podil(b21, n21), f"bezdětné {b91}/{n91} × {b21}/{n21}")

        # pracující – Tab. 29 (‰) váženo muži a ženami z Tab. 5 × aktivita_vek1
        prac91 = obyv91 = 0.0
        for v in pet(od, do):
            m, z = t05["muži"][v][0], t05["ženy"][v][0]
            q = t29[v]
            prac91 += m * (q["muzi_akt"] - q["muzi_hled"]) / 1000 + z * (q["zeny_akt"] - q["zeny_md"] - q["zeny_hled"]) / 1000
            obyv91 += m + z
        prac21 = sum(akt[a]["Zaměstnaní"] - akt[a]["Osoby na mateřské dovolené (28 nebo 37 týdnů)"] for a in range(od, do + 1))
        zn21 = sum(akt[a]["Pracovní síla"] + akt[a]["Mimo pracovní sílu"] for a in range(od, do + 1))
        U["pracuji"] = (podil(prac91, obyv91), podil(prac21, zn21), f"pracující {prac91:.0f}/{obyv91:.0f} × {prac21}/{zn21}")
        vysledky.append(r)

    # pro text: ženy 30–34 bez dítěte (nejblíž otázce „kolik žen má ve 30 letech dítě“)
    b91, n91 = t32[(30, 34)][1], t32[(30, 34)][0] - t32[(30, 34)][12]
    b21, n21 = deti[30]["0"], deti[30][""] - deti[30]["Nezjištěno"]
    extra = {"bezdetne_30_34": (podil(b91, n91), podil(b21, n21), f"{b91}/{n91} × {b21}/{n21}")}
    return vysledky, extra


NAZVY = {
    "vs": "S vysokou školou",
    "zenati": "Ženatí a vdané",
    "svobodni": "Svobodní",
    "rozvedeni": "Rozvedení",
    "bezdetne": "Ženy bez dítěte",
    "pracuji": "Pracují",
}
POZN = {
    "pracuji": "nepočítá ženy na mateřské ani nezaměstnané",
}


def cz(x, d=1):
    return f"{x:,.{d}f}".replace(",", " ").replace(".", ",")


def main():
    vysledky, extra = spocti()
    out("Stejně staří lidé, sčítání 1991 × 2021 (podíly v %, nezjištěné mimo jmenovatel)")
    out(f"Archiv: {D91.relative_to(ARCHIV).as_posix()} | {D21.relative_to(ARCHIV).as_posix()} (v csu-data)")
    out("")
    for r in vysledky:
        out(f"{r['nazev']} ({r['od']}–{r['do']} let)")
        for k, (a, b, detail) in r["ukazatele"].items():
            out(f"  {NAZVY[k]:<18} 1991 {cz(a):>5} %   2021 {cz(b):>5} %   změna {'+' if b >= a else ''}{cz(b - a)} p. b.   [{detail}]")
        out("")
    a, b, detail = extra["bezdetne_30_34"]
    out(f"Ženy 30–34 let bez živě narozeného dítěte: 1991 {cz(a)} %, 2021 {cz(b)} %  [{detail}]")
    out(f"  → s dítětem: 1991 {cz(100 - a)} %, 2021 {cz(100 - b)} %")
    out("")
    out("Nezjištěno: kohortní řada „podíl žen s dítětem do 30 let podle ročníku narození“ (ČSÚ pohyb obyvatelstva)")
    out("  v otevřených tabulkách ČSÚ nenalezena; místo ní sčítání: ženy 30–34 let (ročníky ~1957–61 × ~1987–91).")
    out("Nezjištěno: domácnosti podle věku osoby (žije sám / s partnerem / s rodiči) – otevřená data SLDB 2021 je podle věku nemají.")

    # a) PosuvnikTehdyDnes – třicátníci
    tricatnici = next(r for r in vysledky if r["od"] == 30)
    polozky = []
    for k in ("vs", "zenati", "svobodni", "rozvedeni", "bezdetne", "pracuji"):
        a, b, _ = tricatnici["ukazatele"][k]
        polozky.append({"nazev": NAZVY[k], "tehdy": round(a, 1), "dnes": round(b, 1), **({"pozn": POZN[k]} if k in POZN else {})})
    DATA_OUT.mkdir(exist_ok=True)
    stejne = {
        "title": "Dnešní třicátníci mají častěji vysokou školu a méně často jsou v manželství",
        "subtitle": "Lidé ve věku 30–39 let při sčítání 1991 a 2021, podíl v %. Posuňte jezdcem z roku 1991 do roku 2021.",
        "jednotka": "%",
        "max": 100,
        "desetinna": 1,
        "popisek_tehdy": "1991",
        "popisek_dnes": "2021",
        "polozky": polozky,
        "zdroj": ZDROJ,
    }
    p = DATA_OUT / "stejne-stari.json"
    p.write_text(json.dumps(stejne, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    out(f"zapsáno {p.relative_to(HERE.parent)}")

    # b) OdNarozeni – sekce „Lidé ve vašem věku tehdy × dnes“
    p = DATA_OUT / "od-narozeni.json"
    od = json.loads(p.read_text(encoding="utf-8"))
    od["podle_veku"] = {
        "title": "Lidé ve vašem věku tehdy × dnes",
        "rok_tehdy": 1991,
        "rok_dnes": 2021,
        # plná přesnost, aby rozdíl v p. b. v komponentě seděl s výstupem (32,9 − 11,7 by dalo 21,2 místo 21,1)
        "skupiny": [
            {
                "od": r["od"], "do": r["do"], "nazev": r["nazev"],
                "ukazatele": [
                    {"nazev": NAZVY[k], "tehdy": round(a, 3), "dnes": round(b, 3), **({"pozn": POZN[k]} if k in POZN else {})}
                    for k, (a, b, _) in r["ukazatele"].items()
                ],
            }
            for r in vysledky
        ],
        "pozn": "Sčítání lidu 1991 a 2021, podíl v %; nezjištěné údaje nejsou ve jmenovateli.",
        "zdroj": ZDROJ,
    }
    p.write_text(json.dumps(od, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    out(f"doplněno {p.relative_to(HERE.parent)} (podle_veku: {len(vysledky)} skupin)")
    VYSTUP.write_text("\n".join(radky_vystupu) + "\n", encoding="utf-8")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
