"""Kapitola „Svoboda“ speciálu Jací jsme byli, jací jsme (1989 × 2026).

Jediný skript kapitoly: počítá všechna čísla z primárních dat v archivu csu-data
(statisticka-data/cesko), zapisuje Vega-Lite grafy do ../data/*.json a všechna čísla
použitá v textu do vystup.txt. Spouštění: python grafy.py
Cestování (delší cesty, cílové země, dovolená) počítá od 14. 11. 2026 kapitola Volný čas
(analyza-2026-11-17-jaci-jsme-volny-cas/_data_pipeline/grafy.py), graf „kam jezdíme“ se přesunul tam.

Vstupy (u každé složky je ZDROJ.txt s URL a datem stažení):
  volby/ucast-casova-rada/20261114/               ČSÚ volební účast od 1990
  pravo/svatky-93-1951/20261114/                  zákon 93/1951 Sb. (znění 1988 a 1990), zákon 245/2000 Sb.
  scitani/sldb2021-vira/20261114/                 ČSÚ sčítání 2021 (víra) + stránka ČSÚ se sčítáním 1991
  pruzkumy/cvvm-listopad-1989/20261114/           CVVM pd241111, tab. 4 (oblasti lepší/horší než před 1989)
  pruzkumy/cvvm-nazory-na-demokracii/20261114/    CVVM pd240726, graf 1 (spokojenost s demokracií 2004–2024)
  pruzkumy/pew-2019-30-let-po-komunismu/20261114/ Pew Research Center 2019, topline (1991/2009/2019)
"""
import csv
import html
import json
import os
import re
import sys
from pathlib import Path

import openpyxl
import pypdf

sys.stdout.reconfigure(encoding="utf-8")
HERE = Path(__file__).resolve().parent
DATA = HERE.parent / "data"
CRIMSON, BLUE, GREY, INK, MUTED = "#de1743", "#6267a3", "#bcbcb0", "#101432", "#d4d4c8"
NBSP = " "
out = []


def log(*a):
    out.append(" ".join(str(x) for x in a))


def najdi_archiv() -> Path:  # zkopírováno z pilota (02_dvojice.py)
    if os.environ.get("CSU_DATA"):
        return Path(os.environ["CSU_DATA"])
    for p in Path(__file__).resolve().parents:
        for kandidat in (p / "csu-data", p / "statisticka-data" / "cesko"):
            if kandidat.exists():
                return kandidat
    raise SystemExit("Archiv csu-data nenalezen – nastav CSU_DATA")


A = najdi_archiv()


def cz(x, d=0):
    return f"{x:,.{d}f}".replace(",", " ").replace(".", ",").replace(" ", NBSP)


def pdf_text(path):
    return [p.extract_text() for p in pypdf.PdfReader(path).pages]


def rows(path, sheet=None):
    wb = openpyxl.load_workbook(path, data_only=True, read_only=True)
    ws = wb[sheet] if sheet else wb.worksheets[0]
    return [list(r) for r in ws.iter_rows(values_only=True)]


# ================= 2) Volební účast =================
ws = openpyxl.load_workbook(A / "volby/ucast-casova-rada/20261114/vuhcr121925_volebni_ucast_v__.xlsx", data_only=True).worksheets[0]
rr = [list(x) for x in ws.iter_rows(values_only=True)]
ucast = {}
for hlav, hod in zip(rr, rr[1:]):
    if hlav and hlav[0] == "Volby" and hod and str(hod[0]).startswith("Volební účast"):
        for k, v in zip(hlav[1:], hod[1:]):
            if k and v is not None:
                ucast[str(k).strip()] = v
ps = {int(k[-4:]): v for k, v in ucast.items() if k.startswith(("ČNR", "PS"))}
log("UCAST snemovni volby", ps)
pmin = min(ps, key=ps.get)
log("UCAST 1990", ps[1990], "| posledni", max(ps), ps[max(ps)], "| min", pmin, ps[pmin],
    "| pokles 1990→posl. p. b.", round(ps[1990] - ps[max(ps)], 1))
se2 = {k: v for k, v in ucast.items() if k.startswith("SE-2")}
log("UCAST senat 2. kolo min", min(se2, key=se2.get), min(se2.values()), "| SE-2 2024", ucast["SE-2 2024"])
log("UCAST snemovni 2006–2025 rozpeti", min(v for y, v in ps.items() if y >= 2006), max(v for y, v in ps.items() if y >= 2006))
log("UCAST jine volby 1990: ZO 1990", ucast["ZO 1990"], "| ZO 2022", ucast["ZO 2022"],
    "| PE-2 2023", ucast["PE-2 2023&)"], "| EP 2024", ucast["EP 2024"])

# ================= 3) Svátky (právní stav, ověřeno v textu zákonů) =================
S = A / "pravo/svatky-93-1951/20261114"


def zakon_html(f):
    t = html.unescape(re.sub(r"<[^>]+>", " ", (S / f).read_text(encoding="utf-8")))
    t = re.sub(r"\s+", " ", t)
    return t[t.index("usnieslo sa na tomto zákone"):]


z88, z90 = zakon_html("zakon_93_1951_znenie_19880921.html"), zakon_html("zakon_93_1951_znenie_19900510.html")
z00 = re.sub(r"\s+", " ", "\n".join(pdf_text(S / "zakon_245_2000_mpsv.pdf")))
for frag in ["Deviaty máj", "dvadsiaty ôsmy október", "a) 1. január (Nový rok), b) Veľkonočný pondelok, c) 1. máj (Sviatok práce), "
             "d) 25. december (prvý vianočný sviatok), e) 26. december (druhý vianočný sviatok)", "a) 25. február, b) 29. august, c) 7. november",
             "a) 5. júl (slovanskí vierozvestovia Cyril a Metod), b) 6. júl (Majster Ján Hus)", "sú dňami pracovnými"]:
    assert frag in z88, frag
for frag in ["5. júl, deň slovanských vierozvestcov Cyrila a Metoda", "d) 24. december (Štedrý deň)",
             "c) 17. november (deň boja študentov za slobodu a demokraciu)", "Pamätným dňom Českej a Slovenskej Federatívnej Republiky je 6. júl"]:
    assert frag in z90, frag
for frag in ["8. květen - Den vítězství", "6. červenec - Den upálení mistra Jana Husa", "28. září - Den české státnosti",
             "17. listopad - Den boje za svobodu a demokracii", "Velký pátek", "24. prosinec - Štědrý den",
             "Státní svátky a ostatní svátky jsou dny pracovního klidu"]:
    assert frag in z00.replace("6. červenec", "6. červenec").replace("6.\n", "6. "), frag
# řádky kalendáře: (datum, název, 1989, dnes); "volno" = den pracovního klidu, "pracovni" = připomínaný pracovní den
KAL = [
    ("1. 1.", "Nový rok", "volno", "volno"),
    ("25. 2.", "Vítězný únor", "pracovni", None),
    ("", "Velký pátek", None, "volno"),
    ("", "Velikonoční pondělí", "volno", "volno"),
    ("1. 5.", "Svátek práce", "volno", "volno"),
    ("9. 5. / 8. 5.", "Den osvobození / vítězství", "volno", "volno"),
    ("5. 7.", "Cyril a Metoděj", "pracovni", "volno"),
    ("6. 7.", "Mistr Jan Hus", "pracovni", "volno"),
    ("29. 8.", "Výročí SNP", "pracovni", None),
    ("28. 9.", "Den české státnosti", None, "volno"),
    ("28. 10.", "Vznik Československa", "volno", "volno"),
    ("7. 11.", "Říjnová revoluce", "pracovni", None),
    ("17. 11.", "Den boje za svobodu", None, "volno"),
    ("24. 12.", "Štědrý den", None, "volno"),
    ("25. 12.", "1. svátek vánoční", "volno", "volno"),
    ("26. 12.", "2. svátek vánoční", "volno", "volno"),
]
n89 = sum(k[2] == "volno" for k in KAL)
nd = sum(k[3] == "volno" for k in KAL)
assert (n89, nd) == (7, 13)
log("SVATKY dny pracovniho klidu 1989", n89, "| dnes", nd, "| pracovni pripominane dny 1989", sum(k[2] == "pracovni" for k in KAL))

# ================= 4) Víra (sčítání 1991 × 2021) =================
V = A / "scitani/sldb2021-vira/20261114"
stranka = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", (V / "csu_nabozenske_vyznani_1991_2001.html").read_text(encoding="utf-8"))))


def z_tabulky_1991(popisek):
    m = re.search(re.escape(popisek) + r"(?: v tom:)? (\d[\d ]*?) (\d+,\d) (\d[\d ]*?) (\d+,\d)", stranka)
    return float(m.group(2).replace(",", "."))


vira91, rkc91, bez91, nezj91 = (z_tabulky_1991(x) for x in ("Věřící celkem", "Církev římskokatolická", "Bez vyznání", "Nezjištěno"))
soucty, celkem = {}, None
for x in csv.DictReader(open(V / "sldb2021_vira_pohlavi.csv", encoding="utf-8-sig")):
    if x["uzemi_txt"] != "Česká republika":
        continue
    if not x["vira_txt"] and not x["pohlavi_kod"]:
        celkem = int(x["hodnota"])
    elif x["vira_txt"]:
        soucty[x["vira_txt"]] = soucty.get(x["vira_txt"], 0) + int(x["hodnota"])
pct = lambda k: soucty[k] / celkem * 100
bez21, neuv21, rkc21 = pct("Bez náboženské víry"), pct("Neuvedeno"), pct("Církev římskokatolická")
bezc21 = pct("věřící - nehlásící se k žádné církvi ani náboženské společnosti")
vir21 = 100 - bez21 - neuv21
log("VIRA 1991: veriici", vira91, "rkc", rkc91, "bez vyznani", bez91, "nezjisteno", nezj91)
log("VIRA 2021: veriici", round(vir21, 1), "z toho bez cirkve", round(bezc21, 1), "rkc", round(rkc21, 1),
    "bez viry", round(bez21, 1), "neuvedeno", round(neuv21, 1))
log("VIRA 2021 veriici + neuvedeno", round(vir21 + neuv21, 1), "| podil veriicich mezi odpovedi", round(vir21 / (100 - neuv21) * 100, 1))

# ================= 5) Průzkumy =================
# CVVM pd241111, tab. 4
pd = "\n".join(pdf_text(A / "pruzkumy/cvvm-listopad-1989/20261114/pd241111.pdf"))
t4 = pd[pd.index("Tabulka 4: Zlepšení/zhoršení"):]
roky4 = [int(x) for x in re.search(r"\n\s*((?:\d{4} ?){5})\n", t4).group(1).split()]
tab4 = {}
for line in t4.splitlines():
    mm = re.match(r"^(.+?) ((?:\d+/\d+ ?){5})\s*$", line.strip())
    if mm:
        tab4[mm.group(1).strip()] = dict(zip(roky4, [tuple(int(z) for z in p.split("/")) for p in mm.group(2).split()]))
log("CVVM tab4 roky", roky4, "| oblasti", len(tab4))
for k, v in tab4.items():
    log("CVVM tab4", k, v)
m = re.search(r"(\d+) % Čechů hodnotí současné poměry jako lepší než v období před listopadem 1989, (\d+) % míní, že tehdejší poměry "
              r"byly lepší než současné, podle (\d+) % je to tak napůl", re.sub(r"\s+", " ", pd))
log("CVVM 2024 pomery lepsi dnes / pred 1989 / napul", m.groups())

# CVVM pd240726, graf 1 – hodnoty popisků grafu (18 šetření × 5 kategorií)
dem = "\n".join(pdf_text(A / "pruzkumy/cvvm-nazory-na-demokracii/20261114/pd240726.pdf"))
blok = dem[dem.index("1 Znění otázky: „Jak jste celkově spokojen"):]
blok = blok[blok.index("\n"):blok.index("0% 10%")]
cisla = [int(x) for x in blok.split()]
obdobi = re.findall(r"\b(\d{2}/\d{4})\b", dem[dem.index("0% 10%"):dem.index("rozhodně spokojen spíše spokojen spíše nespokojen")])
n = len(obdobi)
assert n == 18 and len(cisla) == 5 * n, (n, len(cisla))
rs, ss = cisla[:n], cisla[n:2 * n]
spok = {o: a + b for o, a, b in zip(obdobi, rs, ss)}
assert spok["02/2013"] == 33 and spok["02/2019"] == 67 and spok["04/2024"] == 55
log("CVVM spokojenost s demokracii (rozhodne+spise)", spok)

# Pew 2019 topline – Česko (1991 = česká část Československa)
pew = "\n".join(pdf_text(A / "pruzkumy/pew-2019-30-let-po-komunismu/20261114/Pew-Value-of-Europe-topline-2019.pdf"))


def pew_otazka(start, stop):
    b = pew[pew.index(start):]
    b = b[:b.index(stop)]
    stitky, radky, zeme = [], [], None
    for line in b.splitlines():
        line = line.strip()
        ms = re.match(r"^(.*?)(Spring|Fall), (\d{4})$", line)
        if ms:
            zeme = ms.group(1).strip() or zeme
            stitky.append((zeme, int(ms.group(3))))
        elif re.fullmatch(r"[\d ]+", line) and len(line.split()) >= 4:
            radky.append(line.split())
    assert len(stitky) == len(radky), (start, len(stitky), len(radky))
    return {s: rr_ for s, rr_ in zip(stitky, radky) if s[0] == "Czech Republic"}


q15 = pew_otazka("Q15b. Starting in late 1989", "Q15e.")
q16 = pew_otazka("Q16b. Again, thinking back to 1989", "Q16c.")
q17 = pew_otazka("Q17. Would you say that the economic situation", "In Fall 2009, the question asked")
for nazev, q in (("Q15b vicestranicky system: silne souhlasi, souhlasi", q15), ("Q16b trzni ekonomika", q16)):
    log("PEW", nazev, {y: (v[0], v[1], int(v[0]) + int(v[1])) for (_, y), v in q15.items()} if q is q15 else
        {y: (v[0], v[1], int(v[0]) + int(v[1])) for (_, y), v in q16.items()})
log("PEW Q17 ekonomicka situace lepsi/horsi/stejna nez za komunismu", {y: v[:3] for (_, y), v in q17.items()})

# =================== GRAFY ===================


def spec(title, subtitle, values, layers, source, height=None, step=None):
    s = {"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
         "title": {"text": title, "subtitle": subtitle}, "width": "container",
         "config": {"view": {"stroke": None}}, "data": {"values": values}, "layer": layers, "_source": source}
    if height:
        s["height"] = height
    if step:
        s["height"] = {"step": step}
    return s


AX_NONE = {"title": None, "domain": False, "ticks": False}

# --- G1 kalendář svátků 1989 × dnes (popis vlevo, dva sloupce koleček vpravo)
XP = {"1989": 0.80, "dnes": 0.94}
HLAV = " "  # řádek záhlaví sloupců
v1 = []
for dat, naz, s89, sdn in KAL:
    for sl, stav in (("1989", s89), ("dnes", sdn)):
        v1.append(dict(radek=f"{dat} {naz}", x0=0, popis=(f"{dat.replace(' ', NBSP)}  {naz}" if dat else naz).replace("1. svátek", f"1.{NBSP}svátek").replace("2. svátek", f"2.{NBSP}svátek"), sloupec=sl, x=XP[sl],
                       stav={"volno": "den volna", "pracovni": "připomínaný pracovní den", None: "–"}[stav],
                       typ=(sl + "-" + stav) if stav else "nic"))
y1 = {"field": "radek", "type": "nominal", "sort": None, "axis": None, "scale": {"type": "band", "paddingInner": 0.25, "paddingOuter": 0.2}}
xq = lambda: {"field": "x", "type": "quantitative", "scale": {"domain": [0, 1]},
              "axis": {**AX_NONE, "orient": "top", "grid": False, "values": list(XP.values()), "labelFontSize": 13,
                       "labelFontWeight": 700, "labelColor": INK, "labelExpr": "datum.value < 0.9 ? '1989' : 'dnes'"}}
g1 = spec(f"Volných dnů je {{dnes|{CRIMSON}}} třináct, v {{roce 1989|{BLUE}}} jich bylo sedm",
          "Plné kolečko = den pracovního klidu (státní nebo jiný svátek), prázdné = den, který stát připomínal, ale pracovalo se",
          v1, [
              {"transform": [{"filter": "datum.sloupec == '1989' && datum.typ != 'hlavicka'"}],
               "mark": {"type": "text", "align": "left", "baseline": "middle", "fontSize": 12, "color": "#333333",
                        "limit": {"expr": "width * 0.72"}},
               "encoding": {"y": y1, "x": {**xq(), "field": "x0"},
                            "text": {"field": "popis"}}},
              {"transform": [{"filter": "datum.typ != 'nic' && datum.typ != 'hlavicka'"}],
               "mark": {"type": "point", "shape": "circle", "size": 150, "strokeWidth": 2, "opacity": 1},
               "encoding": {"y": y1, "x": xq(),
                            "stroke": {"field": "sloupec", "type": "nominal", "legend": None,
                                       "scale": {"domain": ["1989", "dnes"], "range": [BLUE, CRIMSON]}},
                            "fill": {"field": "typ", "type": "nominal", "legend": None,
                                     "scale": {"domain": ["1989-volno", "1989-pracovni", "dnes-volno"], "range": [BLUE, "#f8f6f0", CRIMSON]}},
                            "tooltip": [{"field": "popis", "title": "Den"}, {"field": "sloupec", "title": "Období"},
                                        {"field": "stav", "title": "Stav"}]}},
          ], source="zákon [93/1951 Sb.](https://static.slov-lex.sk/static/SK/ZZ/1951/93/19880921.html) ve znění z let 1988–1990, zákon [245/2000 Sb.](https://www.e-sbirka.cz/sb/2000/245)",
          step=22)

# --- G2 volební účast ve sněmovních volbách
v2 = [dict(rok=y, u=v, l=f"{cz(v, 1)}{NBSP}%", org="Česká národní rada" if y < 1996 else "Poslanecká sněmovna",
           c=("t" if y == 1990 else ("d" if y == max(ps) else "m"))) for y, v in sorted(ps.items())]
x2 = {"field": "rok", "type": "ordinal", "axis": {**AX_NONE, "labelAngle": 0, "labelFontSize": 10.5,
                                                   "labelExpr": "datum.value == 1990 || datum.value == 2002 || datum.value == 2025 || datum.value == 2010 ? datum.value : \"'\" + slice(datum.value + '', 2)"}}
y2 = {"field": "u", "type": "quantitative", "scale": {"domain": [0, 110]}, "axis": None}
c2 = {"field": "c", "type": "nominal", "legend": None, "scale": {"domain": ["t", "m", "d"], "range": [BLUE, GREY, CRIMSON]}}
g2 = spec(f"K volbám v {{roce 1990|{BLUE}}} přišlo 97{NBSP}% voličů, {{loni|{CRIMSON}}} 69{NBSP}%",
          "Volební účast ve volbách do České národní rady (1990, 1992) a do Poslanecké sněmovny (od 1996), v %",
          v2, [
              {"mark": {"type": "bar", "cornerRadiusEnd": 2, "width": {"band": 0.7}},
               "encoding": {"x": x2, "y": y2, "color": c2,
                            "tooltip": [{"field": "rok", "title": "Rok"}, {"field": "org", "title": "Volby"}, {"field": "l", "title": "Účast"}]}},
              {"mark": {"type": "text", "dy": -6, "baseline": "bottom", "fontSize": 10, "fontWeight": 700, "color": INK},
               "encoding": {"x": x2, "y": y2, "text": {"field": "u", "format": ".0f"}}},
          ], source="ČSÚ, [Voliči, účast, hlasy – volební účast od roku 1990](https://csu.gov.cz/produkty/volici-ucast-hlasy)",
          height=200)

# --- G4 CVVM: svobody, podíl „lepší než před 1989“ v roce 2019 × 2024
SVOB = [("Možnost studovat, pracovat nebo cestovat do zahraničí", "Studovat, pracovat a cestovat do zahraničí"),
        ("Svobodný přístup k informacím", "Svobodný přístup k informacím"),
        ("Možnost svobodně se účastnit na veřejném životě", "Svobodně se účastnit veřejného života"),
        ("Možnost vyjádřit svůj názor", "Vyjádřit svůj názor"),
        ("Možnost ovlivňovat politická rozhodnutí", "Ovlivňovat politická rozhodnutí")]
R_A, R_B = 2019, roky4[-1]
v4 = []
for k, lab in SVOB:
    a, b = tab4[k][R_A], tab4[k][R_B]
    v4.append(dict(oblast=lab, tehdy=a[0], dnes=b[0], l_t=str(a[0]), l_d=str(b[0]), vlevo=b[0] < a[0],
                   t_t=f"lépe {a[0]} %, hůř {a[1]} %", t_d=f"lépe {b[0]} %, hůř {b[1]} %"))
    log("GRAF CVVM svobody", lab, R_A, a, R_B, b)
y4 = {"field": "oblast", "type": "nominal", "sort": None, "axis": None, "scale": {"paddingInner": 0.5, "paddingOuter": 0.5}}
dom4 = [0, 100]
x4 = {"type": "quantitative", "scale": {"domain": dom4},
      "axis": {**AX_NONE, "grid": True, "gridColor": MUTED, "values": [0, 25, 50, 75, 100], "labelExpr": "datum.value + ' %'"}}
tt4 = [{"field": "oblast", "title": "Oblast"}, {"field": "t_t", "title": str(R_A)}, {"field": "t_d", "title": str(R_B)}]
g4 = spec(f"Svobodu projevu hodnotí lidé {{v roce {R_B}|{CRIMSON}}} lépe než před rokem 1989 méně často než {{v roce {R_A}|{BLUE}}}",
          f"Podíl lidí, podle nichž je dnes situace lidí jako oni v dané oblasti „mnohem či trochu lepší“ než před rokem 1989, v %",
          v4, [
              {"mark": {"type": "text", "align": "left", "baseline": "bottom", "dy": -9, "fontSize": 12, "color": "#333333"},
               "encoding": {"y": y4, "x": {"datum": 0, "type": "quantitative", "scale": {"domain": dom4}}, "text": {"field": "oblast"}}},
              {"mark": {"type": "rule", "strokeWidth": 3, "color": GREY},
               "encoding": {"y": y4, "x": {**x4, "field": "tehdy"}, "x2": {"field": "dnes"}, "tooltip": tt4}},
              {"mark": {"type": "circle", "size": 140, "opacity": 1, "color": BLUE},
               "encoding": {"y": y4, "x": {**x4, "field": "tehdy"}, "tooltip": tt4}},
              {"mark": {"type": "circle", "size": 140, "opacity": 1, "color": CRIMSON},
               "encoding": {"y": y4, "x": {**x4, "field": "dnes"}, "tooltip": tt4}},
              {"mark": {"type": "text", "align": "left", "dx": 9, "fontSize": 11, "color": BLUE},
               "encoding": {"y": y4, "x": {**x4, "field": "tehdy"}, "text": {"field": "l_t"}}},
              {"mark": {"type": "text", "align": "right", "dx": -9, "fontSize": 11, "fontWeight": 700, "color": CRIMSON},
               "encoding": {"y": y4, "x": {**x4, "field": "dnes"}, "text": {"field": "l_d"}}},
          ], source=f"CVVM SOÚ AV ČR, [Třicet pět let od sametové revoluce](https://cvvm.soc.cas.cz/images/articles/files/5889/pd241111.pdf), tab. 4; {R_B}: 922 respondentů 15+",
          step=46)
assert all(d["vlevo"] for d in v4), "popisky G4 počítají s poklesem ve všech oblastech"

DATA.mkdir(exist_ok=True)
for name, sp_ in [("svatky", g1), ("volebni-ucast", g2), ("cvvm-svobody", g4)]:
    (DATA / f"{name}.json").write_text(json.dumps(sp_, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(HERE / "vystup.txt").write_text("\n".join(out) + "\n", encoding="utf-8")
print("\n".join(out))
