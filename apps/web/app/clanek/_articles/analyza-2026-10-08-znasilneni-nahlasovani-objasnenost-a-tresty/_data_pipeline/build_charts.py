"""Grafy k analýze znásilnění (Vega-Lite JSON → ../data/).
Data převzatá z ověřených tabulek (Policie ČR, MSp, Jaktrestame.cz, Eurostat).
Podrobné zdroje a výpočty: Desktop/Témata na později/2026-10-08_irozhlas-jane-doe-znasilneni-data/.
Spuštění: python build_charts.py
"""
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "data"
OUT.mkdir(exist_ok=True)

CRIMSON = "#de1743"   # brand.6
NAVY = "#101432"      # brandNavy.9
TEAL = "#06677d"      # brandTeal.7
ORANGE = "#f76800"    # brandOrange.6
ORANGE_L = "#fda668"  # brandOrange.3
GREY = "#c8c8bc"      # background.8
GRID = "#e8e3d2"
SCHEMA = "https://vega.github.io/schema/vega-lite/v5.json"


def save(name, spec):
    spec = {"$schema": SCHEMA, **spec}
    (OUT / name).write_text(json.dumps(spec, ensure_ascii=False, indent=2), encoding="utf-8")


# 1) Registrovaná znásilnění (TSK 201) a objasněnost 2010–2025 -------------------------
pcr = [
    (2010, 586, 437, 74.6), (2011, 675, 468, 69.3), (2012, 669, 489, 73.1), (2013, 589, 410, 69.6),
    (2014, 669, 455, 68.0), (2015, 598, 425, 71.1), (2016, 649, 448, 69.0), (2017, 598, 418, 69.9),
    (2018, 651, 439, 67.4), (2019, 683, 441, 64.6), (2020, 639, 370, 57.9), (2021, 773, 448, 58.0),
    (2022, 880, 519, 59.0), (2023, 917, 530, 57.8), (2024, 1067, 580, 54.4), (2025, 1086, 574, 52.9),
]
rows = []
for r, reg, obj, pct in pcr:
    rows.append({"rok": r, "typ": "Objasněno", "v": obj, "reg": reg, "obj": obj, "pct": pct})
    rows.append({"rok": r, "typ": "Neobjasněno", "v": reg - obj, "reg": reg, "obj": obj, "pct": pct})
save("registrovana-znasilneni.json", {
    "title": {"text": "Policie eviduje skoro dvakrát víc znásilnění než v roce 2010",
              "subtitle": "Registrované případy znásilnění (§ 185) podle toho, zda je policie v témže roce objasnila"},
    "width": 600, "height": 320,
    "data": {"values": rows},
    "mark": {"type": "bar", "cornerRadiusEnd": 1},
    "encoding": {
        "x": {"field": "rok", "type": "ordinal", "axis": {"title": None, "labelAngle": 0,
              "values": [2010, 2013, 2016, 2019, 2022, 2025]}},
        "y": {"field": "v", "type": "quantitative", "stack": True,
              "axis": {"title": None, "grid": True, "gridColor": GRID}},
        "color": {"field": "typ", "type": "nominal",
                  "scale": {"domain": ["Objasněno", "Neobjasněno"], "range": [NAVY, CRIMSON]},
                  "legend": {"title": None, "orient": "top", "symbolType": "square"}},
        "order": {"field": "typ", "sort": "descending"},
        "tooltip": [{"field": "rok", "title": "Rok"},
                    {"field": "reg", "title": "Registrováno", "format": ",.0f"},
                    {"field": "obj", "title": "Objasněno", "format": ",.0f"},
                    {"field": "pct", "title": "Objasněnost (%)", "format": ".1f"}],
    },
    "_source": "[Policie ČR – statistické přehledy kriminality](https://policie.gov.cz/statisticke-prehledy-kriminality-za-roky-2016---2025) (TSK 201, prosincové sestavy) a archivní výkazy 2010–2015. Od 2025 platí užší definice (část činů spadá pod nový sexuální útok, § 185a – 328 případů v roce 2025)."
})

# 2) Objasněnost: znásilnění × krádeže × celková kriminalita ------------------------------
srov = [
    (2010, 74.6, 16.6, 37.6), (2015, 71.1, 22.6, 45.3), (2016, 69.0, 24.6, 46.6), (2019, 64.6, 28.8, 46.8),
    (2022, 59.0, 42.3, 44.8), (2024, 54.4, 48.0, 45.1), (2025, 52.9, 53.4, 45.2),
]
rows = []
for r, reg, obj, pct in pcr:
    rows.append({"rok": r, "cin": "Znásilnění", "v": pct})
for r, z, k, c in srov:
    rows.append({"rok": r, "cin": "Krádeže prosté", "v": k})
    rows.append({"rok": r, "cin": "Celková kriminalita", "v": c})
save("objasnenost.json", {
    "title": {"text": "Objasněnost znásilnění klesla pod úroveň prostých krádeží",
              "subtitle": "Podíl registrovaných případů, které policie objasnila v témže roce (%)"},
    "width": 600, "height": 320,
    "data": {"values": rows},
    "encoding": {
        "x": {"field": "rok", "type": "quantitative", "scale": {"domain": [2010, 2025]},
              "axis": {"title": None, "format": "d", "values": [2010, 2013, 2016, 2019, 2022, 2025]}},
        "y": {"field": "v", "type": "quantitative", "scale": {"domain": [0, 80]},
              "axis": {"title": None, "grid": True, "gridColor": GRID}},
        "color": {"field": "cin", "type": "nominal",
                  "scale": {"domain": ["Znásilnění", "Krádeže prosté", "Celková kriminalita"],
                            "range": [CRIMSON, TEAL, GREY]},
                  "legend": {"title": None, "orient": "top"}},
    },
    "layer": [
        {"mark": {"type": "line", "strokeWidth": 2.5}},
        {"mark": {"type": "point", "filled": True, "size": 40},
         "encoding": {"tooltip": [{"field": "cin", "title": "Trestný čin"}, {"field": "rok", "title": "Rok"},
                                  {"field": "v", "title": "Objasněnost (%)", "format": ".1f"}]}},
    ],
    "_source": "[Policie ČR – statistické přehledy kriminality](https://policie.gov.cz/statisticke-prehledy-kriminality-za-roky-2016---2025). U krádeží a celkové kriminality vybrané roky."
})

# 3) Trychtýř 2024 -------------------------------------------------------------------------
fun = [
    ("Registrované případy", 1067, "skutky, policie"),
    ("Objasněné případy", 580, "skutky, policie"),
    ("Stíhané osoby", 474, "osoby, státní zastupitelství"),
    ("Obžalované osoby", 449, "osoby, státní zastupitelství"),
    ("Odsouzené osoby", 283, "osoby, soudy"),
    ("Nepodmíněný trest", 161, "osoby, soudy"),
]
rows = [{"krok": k, "v": v, "pozn": p, "barva": CRIMSON if i == len(fun) - 1 else NAVY} for i, (k, v, p) in enumerate(fun)]
save("trychtyr-2024.json", {
    "title": {"text": "Z tisíce oznámených znásilnění skončí ve vězení 161 pachatelů",
              "subtitle": "Rok 2024. Policie počítá skutky, justice osoby a řízení se táhnou přes více let – jde o orientační srovnání, ne sledování týchž případů."},
    "width": 600, "height": 260,
    "data": {"values": rows},
    "encoding": {"y": {"field": "krok", "type": "nominal", "sort": [f[0] for f in fun],
                       "axis": {"title": None, "ticks": False, "domain": False, "labelFontSize": 12}}},
    "layer": [
        {"mark": {"type": "bar", "cornerRadiusEnd": 2, "height": 22},
         "encoding": {"x": {"field": "v", "type": "quantitative", "scale": {"domain": [0, 1200]},
                            "axis": {"title": None, "grid": True, "gridColor": GRID}},
                      "color": {"field": "barva", "type": "nominal", "scale": None},
                      "tooltip": [{"field": "krok", "title": "Fáze"}, {"field": "v", "title": "Počet", "format": ",.0f"},
                                  {"field": "pozn", "title": "Jednotka a zdroj"}]}},
        {"mark": {"type": "text", "align": "left", "dx": 5, "fontSize": 12, "fontWeight": "bold", "color": "#333333"},
         "encoding": {"x": {"field": "v", "type": "quantitative"}, "text": {"field": "v", "format": ",.0f"}}},
    ],
    "_source": "[Policie ČR](https://policie.gov.cz/statisticke-prehledy-kriminality-za-roky-2016---2025) (TSK 201), [Ministerstvo spravedlnosti – statistické listy Z-SL-T a S-SL-T](https://cslav.justice.cz/InfoData/prehledy-statistickych-listu.html), § 185, rok 2024."
})

# 4) Podíl nepodmíněných trestů 2016–2024 (MSp) -------------------------------------------
msp = [(2016, 227, 113, 109), (2017, 205, 97, 106), (2018, 204, 108, 94), (2019, 221, 106, 113),
       (2020, 185, 91, 90), (2021, 252, 123, 125), (2022, 247, 126, 115), (2023, 301, 152, 145), (2024, 283, 161, 119)]
rows = []
for r, o, n, p in msp:
    rows.append({"rok": r, "druh": "Nepodmíněně", "v": n, "o": o, "pct": round(100 * n / o, 1)})
    rows.append({"rok": r, "druh": "Podmíněně", "v": p, "o": o, "pct": round(100 * p / o, 1)})
    rows.append({"rok": r, "druh": "Jiný trest", "v": o - n - p, "o": o, "pct": round(100 * (o - n - p) / o, 1)})
save("odsouzeni-druh-trestu.json", {
    "title": {"text": "Zhruba polovina odsouzených za znásilnění odchází s podmínkou",
              "subtitle": "Pravomocně odsouzení podle § 185 a druh hlavního trestu"},
    "width": 600, "height": 300,
    "data": {"values": rows},
    "mark": {"type": "bar"},
    "encoding": {
        "x": {"field": "rok", "type": "ordinal", "axis": {"title": None, "labelAngle": 0}},
        "y": {"field": "v", "type": "quantitative", "stack": True, "axis": {"title": None, "grid": True, "gridColor": GRID}},
        "color": {"field": "druh", "type": "nominal",
                  "scale": {"domain": ["Nepodmíněně", "Podmíněně", "Jiný trest"], "range": [CRIMSON, ORANGE_L, GREY]},
                  "legend": {"title": None, "orient": "top"}},
        "order": {"field": "druh", "sort": "descending"},
        "tooltip": [{"field": "rok", "title": "Rok"}, {"field": "druh", "title": "Trest"},
                    {"field": "v", "title": "Osob"}, {"field": "pct", "title": "Podíl (%)", "format": ".1f"},
                    {"field": "o", "title": "Odsouzených celkem"}],
    },
    "_source": "[Ministerstvo spravedlnosti – Přehled o pravomocně odsouzených osobách podle paragrafů](https://cslav.justice.cz/InfoData/prehledy-statistickych-listu.html). Včetně mladistvých. Data za rok 2025 zatím nevyšla."
})

# 5) Druh trestu podle odstavce, 2016–2022 (Jaktrestame) -----------------------------------
odst = [("Odst. 1 (6 měs.–5 let)", 184, 24.5, 68.5), ("Odst. 2 (2–10 let)", 790, 42.5, 56.5), ("Odst. 3 (5–12 let)", 421, 81.9, 17.3)]
rows = []
for k, n, nep, pod in odst:
    rows += [{"o": k, "druh": "Nepodmíněně", "v": nep, "n": n},
             {"o": k, "druh": "Podmíněně", "v": pod, "n": n},
             {"o": k, "druh": "Jiný trest", "v": round(100 - nep - pod, 1), "n": n}]
save("tresty-podle-odstavcu.json", {
    "title": {"text": "Za mříže jde jen každý čtvrtý odsouzený podle nejmírnějšího odstavce",
              "subtitle": "Druh trestu podle odstavce § 185 ve znění do roku 2024, odsouzení 2016–2022 (%)"},
    "width": 600, "height": 170,
    "data": {"values": rows},
    "mark": {"type": "bar", "height": 30},
    "encoding": {
        "y": {"field": "o", "type": "nominal", "sort": [o[0] for o in odst],
              "axis": {"title": None, "ticks": False, "domain": False, "labelFontSize": 12}},
        "x": {"field": "v", "type": "quantitative", "stack": "zero", "scale": {"domain": [0, 100]},
              "axis": {"title": None, "grid": True, "gridColor": GRID}},
        "color": {"field": "druh", "type": "nominal",
                  "scale": {"domain": ["Nepodmíněně", "Podmíněně", "Jiný trest"], "range": [CRIMSON, ORANGE_L, GREY]},
                  "legend": {"title": None, "orient": "top"}},
        "order": {"field": "druh", "sort": "descending"},
        "tooltip": [{"field": "o", "title": "Odstavec"}, {"field": "druh", "title": "Trest"},
                    {"field": "v", "title": "Podíl (%)", "format": ".1f"}, {"field": "n", "title": "Odsouzených"}],
    },
    "_source": "[Jaktrestame.cz](https://jaktrestame.cz) (anonymizované statistické listy MSp, dospělí, vč. souběhu), vlastní výpočet DataTimes. Odst. 1 dříve zahrnoval i jiný pohlavní styk než soulož, odst. 2 soulož, oběť 15–18 let nebo čin se zbraní, odst. 3 oběť mladší 15 let nebo těžkou újmu."
})

# 6) Evropa: zaznamenaná znásilnění × odsouzení na 100 případů -----------------------------
names = {"AT": "Rakousko", "BG": "Bulharsko", "CZ": "Česko", "DE": "Německo", "DK": "Dánsko",
         "EL": "Řecko", "FR": "Francie", "HR": "Chorvatsko", "HU": "Maďarsko", "LT": "Litva",
         "LV": "Lotyšsko", "PT": "Portugalsko", "RO": "Rumunsko", "SE": "Švédsko", "SK": "Slovensko",
         "NL": "Nizozemsko", "FI": "Finsko", "EE": "Estonsko", "LU": "Lucembursko", "SI": "Slovinsko"}
eu = [  # země, zaznamenáno na 100 tis., odsouzení na 100 zaznamenaných, rok
    ("AT", 26.29, 11.3, 2024), ("BG", 1.72, 23.4, 2024), ("CZ", 17.13, 32.8, 2024), ("DE", 17.09, 8.7, 2024),
    ("DK", 38.83, 9.0, 2024), ("EL", 3.39, 52.6, 2024), ("FR", 65.95, 4.1, 2024), ("HR", 12.40, 19.6, 2024),
    ("HU", 5.10, 58.1, 2024), ("LT", 2.98, 47.7, 2024), ("LV", 15.33, 21.5, 2024), ("PT", 5.10, 16.4, 2024),
    ("RO", 13.53, 9.7, 2024), ("SE", 88.22, 6.8, 2024), ("SK", 2.41, 29.0, 2024),
]
rows = [{"z": names[g], "x": x, "y": y, "barva": CRIMSON if g == "CZ" else NAVY} for g, x, y, _ in eu]
save("evropa-oznameni-odsouzeni.json", {
    "title": {"text": "Kde policie eviduje víc znásilnění, končí odsouzením menší část",
              "subtitle": "Země EU, 2024. Vodorovně: policií zaznamenaná znásilnění na 100 000 obyvatel. Svisle: odsouzení na 100 zaznamenaných případů."},
    "width": 600, "height": 380,
    "data": {"values": rows},
    "encoding": {
        "x": {"field": "x", "type": "quantitative", "scale": {"type": "log", "domain": [1, 100]},
              "axis": {"title": "Zaznamenaná znásilnění na 100 000 obyvatel (log. osa)", "grid": True, "gridColor": GRID,
                       "values": [1, 2, 5, 10, 20, 50, 100]}},
        "y": {"field": "y", "type": "quantitative", "scale": {"domain": [0, 65]},
              "axis": {"title": "Odsouzení na 100 případů", "grid": True, "gridColor": GRID}},
    },
    "layer": [
        {"mark": {"type": "circle", "size": 110, "opacity": 0.9},
         "encoding": {"color": {"field": "barva", "type": "nominal", "scale": None},
                      "tooltip": [{"field": "z", "title": "Země"},
                                  {"field": "x", "title": "Zaznamenáno na 100 tis.", "format": ".1f"},
                                  {"field": "y", "title": "Odsouzení na 100 případů", "format": ".1f"}]}},
        {"transform": [{"filter": "datum.z != 'Rumunsko'"}],
         "mark": {"type": "text", "align": "left", "dx": 8, "fontSize": 11, "color": "#333333"},
         "encoding": {"text": {"field": "z"}}},
        {"transform": [{"filter": "datum.z == 'Rumunsko'"}],
         "mark": {"type": "text", "align": "right", "dx": -8, "fontSize": 11, "color": "#333333"},
         "encoding": {"text": {"field": "z"}}},
    ],
    "_source": "[Eurostat crim_off_cat a crim_hom_soff](https://ec.europa.eu/eurostat/databrowser/view/crim_hom_soff/default/table), vlastní výpočet DataTimes. Hrubý ukazatel: odsouzené osoby a zaznamenané činy z téhož roku. Bez zemí s neúplnými daty (Španělsko, Polsko, Belgie, Nizozemsko, Finsko, Irsko). Česko od roku 2021 vykazuje Eurostatu i pohlavní styk s dítětem mladším 15 let."
})

# 7) Evropa: zkušenost se znásilněním (EU-GBV) ---------------------------------------------
gbv = [("SE", 21.9), ("FI", 15.5), ("DK", 15.4), ("LU", 15.3), ("HU", 13.6), ("SK", 13.5), ("EE", 11.9),
       ("NL", 11.5), ("FR", 11.1), ("DE", 9.9), ("EU", 9.2), ("AT", 8.7), ("ES", 7.3), ("CZ", 7.1),
       ("LV", 5.9), ("EL", 5.9), ("HR", 5.0), ("SI", 4.7), ("PT", 3.6), ("PL", 3.3), ("BG", 2.3)]
names["EU"] = "EU (průměr)"; names["ES"] = "Španělsko"; names["PL"] = "Polsko"
rows = [{"z": names[g], "v": v, "barva": CRIMSON if g == "CZ" else (NAVY if g == "EU" else GREY)} for g, v in gbv]
save("evropa-zkusenost-znasilneni.json", {
    "title": {"text": "Ve srovnání s Evropou uvádí znásilnění méně Češek",
              "subtitle": "Ženy 18–74 let, které v dospělosti zažily znásilnění (%). Vyšší čísla mohou znamenat i větší ochotu o násilí mluvit."},
    "width": 600, "height": 470,
    "data": {"values": rows},
    "encoding": {"y": {"field": "z", "type": "nominal", "sort": [names[g] for g, _ in gbv],
                       "axis": {"title": None, "ticks": False, "domain": False, "labelFontSize": 12}}},
    "layer": [
        {"mark": {"type": "bar", "cornerRadiusEnd": 2, "height": 14},
         "encoding": {"x": {"field": "v", "type": "quantitative", "scale": {"domain": [0, 25]},
                            "axis": {"title": None, "grid": True, "gridColor": GRID}},
                      "color": {"field": "barva", "type": "nominal", "scale": None},
                      "tooltip": [{"field": "z", "title": "Země"}, {"field": "v", "title": "Zažilo znásilnění (%)", "format": ".1f"}]}},
        {"mark": {"type": "text", "align": "left", "dx": 4, "fontSize": 11, "fontWeight": "bold", "color": "#333333"},
         "encoding": {"x": {"field": "v", "type": "quantitative"}, "text": {"field": "v", "format": ".1f"}}},
    ],
    "_source": "[Eurostat – EU-GBV survey (gbv_any_type)](https://ec.europa.eu/eurostat/databrowser/view/gbv_any_type/default/table), sběr 2020–2024 (v Česku 2023–2024, FRA a EIGE). Vybrané země; Itálie bez údaje."
})
print("ok", sorted(p.name for p in OUT.glob("*.json")))
