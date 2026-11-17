"""Grafy článku „Jací jsme byli, jací jsme – 1989 a dnes“.

Čísla bere výhradně z výstupů 02_dvojice.py (dvojice.json) a 03_doplnky.py (doplnky.json),
které je počítají z primárních dat v archivu csu-data. Pořadí spuštění:
  python 02_dvojice.py && python 03_doplnky.py && python 04_grafy.py
Zapisuje ../data/*.json (Vega-Lite) a vystup.txt se všemi čísly použitými v textu.
"""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
DATA = HERE.parent / "data"
CRIMSON, BLUE, GREY, INK = "#de1743", "#6267a3", "#bcbcb0", "#101432"

D = {d["ukazatel"]: d for d in json.loads((HERE / "dvojice.json").read_text(encoding="utf-8"))}
X = {d["ukazatel"]: d for d in json.loads((HERE / "doplnky.json").read_text(encoding="utf-8"))}
out = []


def log(*a):
    out.append(" ".join(str(x) for x in a))


def cz(x, d=1):
    return f"{x:,.{d}f}".replace(",", " ").replace(".", ",")


def spec(title, subtitle, values, layers, encoding=None, step=34, source=""):
    s = {"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
         "title": {"text": title, "subtitle": subtitle},
         "width": "container", "height": {"step": step},
         "config": {"view": {"stroke": None}}, "data": {"values": values}, "layer": layers, "_source": source}
    if encoding:
        s["encoding"] = encoding
    return s


def cinka(nazev, radky, osa, jednotka, title, subtitle, source, fmt=1):
    """Činkový graf: šedomodrá tečka = tehdy, karmínová = dnes, popisky hodnot u teček."""
    vals = []
    for lab, (r0, v0), (r1, v1) in radky:
        vals.append(dict(ukazatel=lab, tehdy=v0, dnes=v1, rok_t=str(r0), rok_d=str(r1),
                         t_tehdy=f"{cz(v0, fmt)} {jednotka} ({r0})", t_dnes=f"{cz(v1, fmt)} {jednotka} ({r1})",
                         l_tehdy=cz(v0, fmt), l_dnes=cz(v1, fmt),
                         vlevo_dnes=v1 < v0))
        log(nazev, lab, r0, v0, "→", r1, v1)
    y = {"field": "ukazatel", "type": "nominal", "sort": None, "axis": None,
         "scale": {"paddingInner": 0.55, "paddingOuter": 0.6}}
    krok = 20 if osa[1] - osa[0] >= 70 else 10
    x0 = osa[0] if osa[0] >= 0 or osa[1] < 0 else 0
    x = {"type": "quantitative", "scale": {"domain": osa},
         "axis": {"title": None, "grid": True, "gridColor": "#d4d4c8", "domain": False, "ticks": False,
                  "values": list(range(max(0, (osa[0] + krok - 1) // krok * krok), osa[1] + 1, krok))}}
    tt = [{"field": "ukazatel", "title": "Ukazatel"}, {"field": "t_tehdy", "title": "Tehdy"}, {"field": "t_dnes", "title": "Dnes"}]
    layers = [
        {"mark": {"type": "text", "align": "left", "baseline": "bottom", "dy": -11, "fontSize": 12, "color": "#333333"},
         "encoding": {"y": y, "x": {"datum": x0, "type": "quantitative", "scale": {"domain": osa}}, "text": {"field": "ukazatel"}}},
        {"mark": {"type": "rule", "strokeWidth": 3, "color": GREY},
         "encoding": {"y": y, "x": {**x, "field": "tehdy"}, "x2": {"field": "dnes"}, "tooltip": tt}},
        {"mark": {"type": "circle", "size": 150, "opacity": 1, "color": BLUE},
         "encoding": {"y": y, "x": {**x, "field": "tehdy"}, "tooltip": tt}},
        {"mark": {"type": "circle", "size": 150, "opacity": 1, "color": CRIMSON},
         "encoding": {"y": y, "x": {**x, "field": "dnes"}, "tooltip": tt}},
        # popisky: hodnota „tehdy“ na vnější straně, „dnes“ na druhé
        {"transform": [{"filter": "!datum.vlevo_dnes"}], "mark": {"type": "text", "align": "right", "dx": -10, "fontSize": 11, "color": BLUE},
         "encoding": {"y": y, "x": {**x, "field": "tehdy"}, "text": {"field": "l_tehdy"}}},
        {"transform": [{"filter": "!datum.vlevo_dnes"}], "mark": {"type": "text", "align": "left", "dx": 10, "fontSize": 11, "fontWeight": 700, "color": CRIMSON},
         "encoding": {"y": y, "x": {**x, "field": "dnes"}, "text": {"field": "l_dnes"}}},
        {"transform": [{"filter": "datum.vlevo_dnes"}], "mark": {"type": "text", "align": "left", "dx": 10, "fontSize": 11, "color": BLUE},
         "encoding": {"y": y, "x": {**x, "field": "tehdy"}, "text": {"field": "l_tehdy"}}},
        {"transform": [{"filter": "datum.vlevo_dnes"}], "mark": {"type": "text", "align": "right", "dx": -10, "fontSize": 11, "fontWeight": 700, "color": CRIMSON},
         "encoding": {"y": y, "x": {**x, "field": "dnes"}, "text": {"field": "l_dnes"}}},
    ]
    return spec(title, subtitle, vals, layers, step=52, source=source)


def par(d):
    return (d["rok_tehdy"], d["tehdy"]), (d["rok_dnes"], d["dnes"])


# ---------- Graf 1: roky života ----------
g1 = cinka("roky", [
    ("Naděje dožití žen", *par(D["Naděje dožití při narození – ženy"])),
    ("Naděje dožití mužů", *par(D["Naděje dožití při narození – muži"])),
    ("Průměrný věk obyvatel", *par(D["Průměrný věk"])),
    ("Věk ženicha při první svatbě", *par(D["Věk svobodných ženichů"])),
    ("Věk nevěsty při první svatbě", *par(D["Věk svobodných nevěst"])),
    ("Věk matky při prvním dítěti", *par(D["Věk matky při prvním dítěti"])),
], [15, 90], "let",
    f"Žijeme déle a všechno {{dnes|{CRIMSON}}} děláme později než v roce {{1989|{BLUE}}}",
    "Průměrný věk v letech; naděje dožití při narození",
    "ČSÚ, [Česko od roku 1989 v číslech, Tab. 01.01](https://csu.gov.cz/produkty/cesko-od-roku-1989-v-cislech-aktualizace-27-8-2026); výpočet DataTimes")

# ---------- Graf 2: podíly ----------
def pp(lab, d):
    (r0, v0), (r1, v1) = par(d)
    return (lab, (r0, round(v0, 1)), (r1, round(v1, 1)))


g2 = cinka("podily", [
    pp("Volební účast ve sněmovních volbách", X["Účast ve sněmovních volbách"]),
    pp("Domácnosti s počítačem", D["Domácnosti s počítačem"]),
    pp("Děti narozené mimo manželství", D["Děti narozené mimo manželství"]),
    pp("Manželství, která skončí rozvodem", D["Úhrnná rozvodovost"]),
    pp("Lidé, kteří se hlásí k víře", X["Věřící (všichni, kdo víru uvedli)"]),
    pp("Lidé starší 65 let", D["Podíl lidí 65+"]),
], [-12, 104], "%",
    f"Skoro polovina dětí se {{dnes|{CRIMSON}}} rodí mimo manželství, v roce {{1989|{BLUE}}} to bylo 8 %",
    "Podíl v %; víra podle sčítání 1991 a 2021, volební účast 1990 (Česká národní rada) a 2025",
    "ČSÚ, [Česko od roku 1989 v číslech](https://csu.gov.cz/produkty/cesko-od-roku-1989-v-cislech-aktualizace-27-8-2026), "
    "[sčítání 2021](https://csu.gov.cz/produkty/vysledky-scitani-2021-otevrena-data), "
    "[sčítání 1991](https://csu.gov.cz/nabozenske_vyznani_obyvatelstva_ceske_republiky_23_12_04), "
    "[volební účast od roku 1990](https://csu.gov.cz/produkty/volici-ucast-hlasy); výpočet DataTimes")

# ---------- Graf 3: kupní síla ----------
ZBOZI = [  # (popisek, klíč v dvojice.json, trvanlivé = počítáno v mzdách → poměr převrátit)
    ("Automatická pračka", "Automatická bubnová pračka – kolik stojí čistých mezd", True),
    ("Lednička s mrazákem", "Elektrická chladnička – kolik stojí čistých mezd", True),
    ("Vejce", "Vejce slepičí – kolik koupí čistá mzda", False),
    ("Benzin", "Benzin automobilový – kolik koupí čistá mzda", False),
    ("Máslo", "Máslo čerstvé – kolik koupí čistá mzda", False),
    ("Pivo (lahvové výčepní)", "Pivo výčepní – kolik koupí čistá mzda", False),
    ("Auto Škoda", "Automobil Škoda – kolik stojí čistých mezd", True),
    ("Jízdní kolo", "Jízdní kolo – kolik stojí čistých mezd", True),
    ("Mléko", "Mléko polotučné – kolik koupí čistá mzda", False),
    ("Chléb", "Chléb konzumní kmínový – kolik koupí čistá mzda", False),
    ("Jízdenka MHD", "Jednotlivé jízdné v MHD – kolik koupí čistá mzda", False),
    ("Lístek do kina", "Vstupenka do kina – kolik koupí čistá mzda", False),
    ("Pánský kadeřník", "Pánský kadeřník – kolik koupí čistá mzda", False),
]
v3 = []
for lab, key, trv in ZBOZI:
    d = D[key]
    r = d["rada"]
    r0, r1 = str(d["rok_tehdy"]), str(d["rok_dnes"])
    pomer = (r[r0] / r[r1]) if trv else (r[r1] / r[r0])
    v3.append(dict(zbozi=lab, pomer=round(pomer, 2), skup="víc" if pomer >= 1 else "míň",
                   popisek=f"{cz(pomer, 1)}×", rok_d=r1,
                   t=f"{cz(pomer, 2)}krát tolik jako v roce {r0} (srovnání s rokem {r1})"))
    log("kupni sila", lab, r0, "→", r1, "pomer", round(pomer, 3))
v3.sort(key=lambda z: -z["pomer"])
y3 = {"field": "zbozi", "type": "nominal", "sort": None,
      "axis": {"title": None, "domain": False, "ticks": False, "labelFontSize": 12, "labelLimit": 200}}
tt3 = [{"field": "zbozi", "title": "Zboží"}, {"field": "t", "title": "Za průměrnou čistou mzdu"}]
g3 = spec(f"Za výplatu dnes koupíme {{víc zboží|{CRIMSON}}}, ale {{méně služeb|{BLUE}}} než v roce 1989",
          "Kolikrát víc kusů koupí průměrná čistá mzda než v roce 1989 (1 = stejně); auto Škoda 2023, ostatní 2025. Výrobky se změnily, srovnání je orientační",
          v3, [
              {"mark": {"type": "bar", "cornerRadiusEnd": 3, "height": {"band": 0.7}},
               "encoding": {"y": y3, "x": {"field": "pomer", "type": "quantitative", "scale": {"domain": [0, 12.5]},
                                            "axis": {"title": None, "grid": True, "gridColor": "#d4d4c8", "domain": False, "ticks": False,
                                                     "values": [0, 1, 2, 4, 6, 8, 10], "labelExpr": "datum.value + '×'"}},
                            "color": {"field": "skup", "type": "nominal", "legend": None,
                                      "scale": {"domain": ["víc", "míň"], "range": [CRIMSON, BLUE]}}, "tooltip": tt3}},
              {"mark": {"type": "text", "align": "left", "dx": 5, "fontWeight": 700, "fontSize": 11, "color": INK},
               "encoding": {"y": y3, "x": {"field": "pomer", "type": "quantitative"}, "text": {"field": "popisek"}, "tooltip": tt3}},
              {"mark": {"type": "rule", "color": INK, "strokeDash": [3, 3]}, "data": {"values": [{"x": 1}]},
               "encoding": {"x": {"field": "x", "type": "quantitative"}}},
          ], step=30,
          source="ČSÚ, [Česko od roku 1989 v číslech, Tab. 03.04 a 13.07](https://csu.gov.cz/produkty/cesko-od-roku-1989-v-cislech-aktualizace-27-8-2026); výpočet DataTimes")

# ---------- Graf 4: oxid siřičitý ----------
so2 = D["Emise oxidu siřičitého (SO₂), všechny zdroje"]["rada"]
v4 = [{"rok": int(k), "emise": v, "t": f"{cz(v, 0)} tis. t"} for k, v in sorted(so2.items())]
log("SO2", v4[0], v4[-1], "pokles %", round(100 * (1 - v4[-1]["emise"] / v4[0]["emise"]), 1))
g4 = spec(f"Česko vypouští o {{97 %|{CRIMSON}}} méně oxidu siřičitého než v roce 1990",
          "Emise oxidu siřičitého ze všech zdrojů v tisících tun; 2024 předběžně",
          v4, [
              {"mark": {"type": "area", "color": CRIMSON, "opacity": 0.15, "line": {"color": CRIMSON, "strokeWidth": 2.5}},
               "encoding": {"x": {"field": "rok", "type": "quantitative", "axis": {"title": None, "format": "d", "grid": False, "domain": False, "values": [1990, 2000, 2010, 2020, 2024]}},
                            "y": {"field": "emise", "type": "quantitative", "axis": {"title": None, "grid": True, "domain": False, "ticks": False, "tickCount": 4}},
                            "tooltip": [{"field": "rok", "title": "Rok"}, {"field": "t", "title": "Emise SO₂"}]}},
          ], source="ČHMÚ podle ČSÚ, [Česko od roku 1989 v číslech, Tab. 02.04](https://csu.gov.cz/produkty/cesko-od-roku-1989-v-cislech-aktualizace-27-8-2026) (REZZO 1–4)")
g4["height"] = 260

# ---------- Graf 5: CVVM ----------
v5 = []
for k, d in X.items():
    if d["okruh"].startswith("Jak to vidíme") and ": dnes lepší" in k:
        lab = {"Možnost studovat, pracovat, cestovat do zahraničí": "Studium, práce a cesty do zahraničí",
               "Bezpečnost občanů, kriminalita": "Bezpečnost a kriminalita"}.get(k.split(":")[0], k.split(":")[0])
        v5 += [dict(oblast=lab, hodnoceni="lepší", v=d["tehdy"], x0=0, x1=d["tehdy"], t=f"{d['tehdy']} %"),
               dict(oblast=lab, hodnoceni="horší", v=d["dnes"], x0=-d["dnes"], x1=0, t=f"{d['dnes']} %")]
        log("CVVM", lab, "lepší", d["tehdy"], "horší", d["dnes"])
poradi = [r["oblast"] for r in v5 if r["hodnoceni"] == "lepší"]
y5 = {"field": "oblast", "type": "nominal", "sort": poradi, "axis": None,
      "scale": {"paddingInner": 0.5, "paddingOuter": 0.5}}
g5 = spec(f"Lidé hodnotí dnešek jako {{lepší|{CRIMSON}}} skoro ve všem. Horší je podle nich {{bezpečnost|{BLUE}}}",
          "Je dnes situace lidí jako vy lepší, nebo horší než před rokem 1989? Podíl odpovědí „mnohem či trochu lepší“ a „trochu či mnohem horší“ v %",
          v5, [
              {"mark": {"type": "bar", "height": {"band": 0.7}},
               "encoding": {"y": y5, "x": {"field": "x0", "type": "quantitative", "scale": {"domain": [-60, 90]},
                                            "axis": {"title": None, "grid": False, "domain": False, "ticks": False, "labels": False}},
                            "x2": {"field": "x1"},
                            "color": {"field": "hodnoceni", "type": "nominal", "legend": None,
                                      "scale": {"domain": ["lepší", "horší"], "range": [CRIMSON, BLUE]}},
                            "tooltip": [{"field": "oblast", "title": "Oblast"}, {"field": "hodnoceni", "title": "Dnes"}, {"field": "t", "title": "Podíl"}]}},
              {"transform": [{"filter": "datum.hodnoceni == 'lepší'"}],
               "mark": {"type": "text", "align": "left", "dx": 5, "fontSize": 11, "fontWeight": 700, "color": INK},
               "encoding": {"y": y5, "x": {"field": "x1", "type": "quantitative"}, "text": {"field": "t"}}},
              {"transform": [{"filter": "datum.hodnoceni == 'horší'"}],
               "mark": {"type": "text", "align": "right", "dx": -5, "fontSize": 11, "fontWeight": 700, "color": INK},
               "encoding": {"y": y5, "x": {"field": "x0", "type": "quantitative"}, "text": {"field": "t"}}},
              {"transform": [{"filter": "datum.hodnoceni == 'lepší'"}],
               "mark": {"type": "text", "align": "left", "baseline": "bottom", "dy": -9, "fontSize": 12, "color": "#333333"},
               "encoding": {"y": y5, "x": {"datum": -60, "type": "quantitative"}, "text": {"field": "oblast"}}},
          ], step=46,
          source="CVVM SOÚ AV ČR, [Třicet pět let od sametové revoluce z pohledu české veřejnosti](https://cvvm.soc.cas.cz/images/articles/files/5889/pd241111.pdf), "
                 "šetření 10. 6. – 27. 8. 2024, 922 respondentů starších 15 let; zbytek do 100 % tvoří „stejná“ a „neví“")

# ---------- čísla do textu ----------
for k in ["Reálná mzda (kupní síla), 1989 = 100", "Průměrná hrubá mzda", "Průměrná čistá mzda", "Kojenecká úmrtnost",
          "Umělá přerušení těhotenství", "Matky do 19 let", "Sňatky", "Živě narozené děti", "Úhrnná plodnost",
          "Cizinci trvale a dlouhodobě žijící v ČR", "Studenti vysokých škol", "Usmrcení na silnicích", "Národní parky",
          "Dokončené byty za rok", "Hovězí maso na obyvatele", "Drůbež na obyvatele", "Pivo na obyvatele", "Návštěvy kin",
          "Hosté v ubytovacích zařízeních", "Vraždy (registrované)", "Registrované trestné činy", "Emise prachu (TZL), všechny zdroje"]:
    d = D[k]
    log("TEXT", k, d["rok_tehdy"], d["tehdy"], "→", d["rok_dnes"], d["dnes"], d["jednotka"])
for k, d in X.items():
    if not d["okruh"].startswith("Jak to vidíme"):
        log("TEXT", k, d["rok_tehdy"], d["tehdy"], "→", d["rok_dnes"], d["dnes"], d["jednotka"])

DATA.mkdir(exist_ok=True)
for name, s in [("roky-zivota", g1), ("podily", g2), ("kupni-sila", g3), ("oxid-sirICity".lower(), g4), ("cvvm-lepsi-horsi", g5)]:
    (DATA / f"{name}.json").write_text(json.dumps(s, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(HERE / "vystup.txt").write_text("\n".join(out) + "\n", encoding="utf-8")
print("\n".join(out))
