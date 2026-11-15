"""Grafy kapitoly „Doprava“ (Jací jsme byli, jací jsme). Čísla bere jen z cisla.json (počítá cisla.py).
Spuštění: python cisla.py && python grafy.py   → ../data/*.json (Vega-Lite), dopíše vystup.txt
"""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
DATA = HERE.parent / "data"
DATA.mkdir(exist_ok=True)
CRIMSON, BLUE, GREY, INK = "#de1743", "#6267a3", "#d4d4c8", "#101432"
C = json.loads((HERE / "cisla.json").read_text(encoding="utf-8"))
out = []
NB = " "


def log(*a):
    out.append(" ".join(str(x) for x in a))


def cz(x, d=0):
    return f"{x:,.{d}f}".replace(",", NB).replace(".", ",")


def spec(title, subtitle, values, layers, step=None, source="", height=None):
    s = {"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
         "title": {"text": title, "subtitle": subtitle},
         "width": "container", "config": {"view": {"stroke": None}},
         "data": {"values": values}, "layer": layers, "_source": source}
    if step:
        s["height"] = {"step": step}
    if height:
        s["height"] = height
    return s


def cinka(nazev, radky, osa, jednotka, title, subtitle, source, fmt=0, krok=20):
    """Činka: modrá tečka = tehdy, karmínová = dnes; název řádku nad ním (mobil 390 px)."""
    vals = []
    for lab, (r0, v0), (r1, v1) in radky:
        vals.append(dict(ukazatel=lab, tehdy=v0, dnes=v1,
                         t_tehdy=f"{cz(v0, fmt)}{jednotka} ({r0})", t_dnes=f"{cz(v1, fmt)}{jednotka} ({r1})",
                         l_tehdy=f"{cz(v0, fmt)}{jednotka}", l_dnes=f"{cz(v1, fmt)}{jednotka}", vlevo_dnes=v1 < v0))
        log(nazev, lab, r0, v0, "→", r1, v1)
    y = {"field": "ukazatel", "type": "nominal", "sort": None, "axis": None,
         "scale": {"paddingInner": 0.55, "paddingOuter": 0.6}}
    x = {"type": "quantitative", "scale": {"domain": osa},
         "axis": {"title": None, "grid": True, "gridColor": GREY, "domain": False, "ticks": False,
                  "values": list(range(0, osa[1] + 1, krok)), "labelExpr": f"replace(format(datum.value, ',d'), ',', '{NB}')"}}
    tt = [{"field": "ukazatel", "title": "Ukazatel"}, {"field": "t_tehdy", "title": "Tehdy"}, {"field": "t_dnes", "title": "Dnes"}]
    lay = [
        {"mark": {"type": "text", "align": "left", "baseline": "bottom", "dy": -11, "fontSize": 12, "color": "#333333"},
         "encoding": {"y": y, "x": {"datum": osa[0], "type": "quantitative", "scale": {"domain": osa}}, "text": {"field": "ukazatel"}}},
        {"mark": {"type": "rule", "strokeWidth": 3, "color": GREY},
         "encoding": {"y": y, "x": {**x, "field": "tehdy"}, "x2": {"field": "dnes"}, "tooltip": tt}},
        {"mark": {"type": "circle", "size": 150, "opacity": 1, "color": BLUE}, "encoding": {"y": y, "x": {**x, "field": "tehdy"}, "tooltip": tt}},
        {"mark": {"type": "circle", "size": 150, "opacity": 1, "color": CRIMSON}, "encoding": {"y": y, "x": {**x, "field": "dnes"}, "tooltip": tt}},
    ]
    for vlevo, (at, ad) in ((False, ("right", "left")), (True, ("left", "right"))):
        f = "datum.vlevo_dnes" if vlevo else "!datum.vlevo_dnes"
        lay += [
            {"transform": [{"filter": f}], "mark": {"type": "text", "align": at, "dx": -10 if at == "right" else 10, "fontSize": 11, "color": BLUE},
             "encoding": {"y": y, "x": {**x, "field": "tehdy"}, "text": {"field": "l_tehdy"}}},
            {"transform": [{"filter": f}], "mark": {"type": "text", "align": ad, "dx": 10 if ad == "left" else -10, "fontSize": 11, "fontWeight": 700, "color": CRIMSON},
             "encoding": {"y": y, "x": {**x, "field": "dnes"}, "text": {"field": "l_dnes"}}},
        ]
    return spec(title, subtitle, vals, lay, step=52, source=source)


ROC98 = "[Ročenka dopravy 1998](https://www.sydos.cz/cs/rocenka-1998/cze/obsah.htm)"
ROC25 = "[Ročenka dopravy 2025](https://www.sydos.cz/cs/rocenka-2025/rocenka/htm_cz/index.html)"

# ---------- Graf 1: auta na 1 000 obyvatel ----------
r = {int(k): v for k, v in C["auta_1000_rada"].items()}
v1 = [{"rok": y, "auta": a, "t": f"{a} aut"} for y, a in sorted(r.items())]
y0, y1 = min(r), max(r)
log("auta na 1000", y0, r[y0], "→", y1, r[y1])
x1 = {"field": "rok", "type": "quantitative", "scale": {"domain": [1989, 2027]},
      "axis": {"title": None, "format": "d", "grid": False, "domain": False, "ticks": False, "values": [1990, 2000, 2010, 2020, 2025]}}
yy1 = {"field": "auta", "type": "quantitative", "scale": {"domain": [0, 720]},
       "axis": {"title": None, "grid": True, "gridColor": GREY, "domain": False, "ticks": False, "values": [0, 200, 400, 600]}}
g1 = spec(f"Na tisíc obyvatel připadá {{621 aut|{CRIMSON}}}, v roce 1990 jich bylo {{234|{BLUE}}}",
          f"Registrovaná osobní auta na 1{NB}000 obyvatel, 1990–2025; roky 1991 a 1992 chybějí. Registr obsahuje i auta, která už nejezdí",
          v1, [
              {"mark": {"type": "line", "color": CRIMSON, "strokeWidth": 2.5, "point": False},
               "encoding": {"x": x1, "y": yy1, "tooltip": [{"field": "rok", "title": "Rok"}, {"field": "t", "title": "Na 1 000 obyvatel"}]}},
              {"mark": {"type": "circle", "size": 70, "opacity": 1}, "transform": [{"filter": f"datum.rok == {y0} || datum.rok == {y1}"}],
               "encoding": {"x": x1, "y": yy1, "color": {"condition": {"test": f"datum.rok == {y0}", "value": BLUE}, "value": CRIMSON}}},
              {"mark": {"type": "text", "dy": -14, "fontSize": 12, "fontWeight": 700}, "transform": [{"filter": f"datum.rok == {y0} || datum.rok == {y1}"}],
               "encoding": {"x": x1, "y": yy1, "text": {"field": "auta"},
                            "color": {"condition": {"test": f"datum.rok == {y0}", "value": BLUE}, "value": CRIMSON}}},
          ], height=240,
          source="[Eurostat road_eqs_carhab](https://ec.europa.eu/eurostat/databrowser/view/road_eqs_carhab/default/table)")

# ---------- Graf 2: palivo 1997 × 2025 ----------
p97, p25 = C["palivo_podil_1997"], C["palivo_podil_2025"]
ost97 = p97["elektřina"] + p97["ostatní"]
ost25 = sum(v for k, v in p25.items() if k not in ("benzín", "nafta"))
g2 = cinka("palivo", [
    ("Benzin", (1997, round(p97["benzín"], 1)), (2025, round(p25["benzín"], 1))),
    ("Nafta", (1997, round(p97["nafta"], 1)), (2025, round(p25["nafta"], 1))),
    ("Plyn, elektřina a ostatní", (1997, round(ost97, 1)), (2025, round(ost25, 1))),
], [0, 100], f"{NB}%",
    f"Na naftu jezdí {{39 %|{CRIMSON}}} aut, v roce 1997 to bylo {{8 %|{BLUE}}}",
    f"Podíl registrovaných osobních aut podle paliva v %, 1997 a 2025; plug-in hybridy patří k benzinu a naftě",
    "[Ročenky dopravy MD 1998 a 2025](https://www.sydos.cz/cs/rocenky.htm)", fmt=1)
log("palivo ostatní 1997/2025", round(ost97, 2), round(ost25, 2))

# ---------- Graf 3: cestující vlak a autobus ----------
v3 = []
for y, d in sorted(((int(k), v) for k, v in C["cestujici_rada"].items())):
    v3.append({"rok": y, "druh": "Autobusy mimo MHD", "mil": round(d["bus"], 1), "t": f"{cz(d['bus'], 1)} mil."})
    v3.append({"rok": y, "druh": "Vlaky", "mil": round(d["vlak"], 1), "t": f"{cz(d['vlak'], 1)} mil."})
x3 = {"field": "rok", "type": "quantitative", "scale": {"domain": [1996, 2027]},
      "axis": {"title": None, "format": "d", "grid": False, "domain": False, "ticks": False, "values": [1997, 2005, 2015, 2025]}}
y3 = {"field": "mil", "type": "quantitative", "scale": {"domain": [0, 520]},
      "axis": {"title": None, "grid": True, "gridColor": GREY, "domain": False, "ticks": False, "values": [0, 100, 200, 300, 400, 500]}}
col3 = {"field": "druh", "type": "nominal", "legend": None, "scale": {"domain": ["Autobusy mimo MHD", "Vlaky"], "range": [CRIMSON, INK]}}
konce = "datum.rok == 1997 || datum.rok == 2025"
g3 = spec(f"Autobusy mimo města vozí skoro o {{čtvrtinu|{CRIMSON}}} lidí méně než v roce 1997, {{vlaky|{INK}}} skoro stejně",
          "Přepravení cestující v milionech za rok; autobusy bez městské hromadné dopravy. V roce 2000 se změnil sběr dat o autobusech, 2020–2021 covid",
          v3, [
              {"mark": {"type": "line", "strokeWidth": 2.5},
               "encoding": {"x": x3, "y": y3, "color": col3,
                            "tooltip": [{"field": "druh", "title": "Druh"}, {"field": "rok", "title": "Rok"}, {"field": "t", "title": "Cestujících"}]}},
              {"mark": {"type": "circle", "size": 60, "opacity": 1}, "transform": [{"filter": konce}],
               "encoding": {"x": x3, "y": y3, "color": col3}},
              {"mark": {"type": "text", "dy": -12, "fontSize": 11, "fontWeight": 700}, "transform": [{"filter": konce}],
               "encoding": {"x": x3, "y": y3, "color": col3, "text": {"field": "mil", "format": ".0f"}}},
              {"mark": {"type": "text", "align": "left", "dy": -14, "fontSize": 12, "fontWeight": 700},
               "transform": [{"filter": "datum.rok == 2005 && datum.druh != 'Vlaky'"}],
               "encoding": {"x": x3, "y": y3, "color": col3, "text": {"field": "druh"}}},
              {"mark": {"type": "text", "align": "left", "dy": 18, "fontSize": 12, "fontWeight": 700},
               "transform": [{"filter": "datum.rok == 2005 && datum.druh == 'Vlaky'"}],
               "encoding": {"x": x3, "y": y3, "color": col3, "text": {"field": "druh"}}},
          ], height=260,
          source="[ČSÚ](https://csu.gov.cz/produkty/osobni_doprava_casove_rady) a " + ROC25)
for y in (1997, 2010, 2019, 2025):
    d = C["cestujici_rada"][str(y)]
    log("cestujici", y, "vlak", d["vlak"], "bus", d["bus"])

# ---------- Graf 4: obce bez autobusu ----------
B = C["obsluha_bus"]
g4 = cinka("obsluha", [
    ("Obce bez autobusu v sobotu", (2000, B["2000"]["sobota"]["bez"]), (2025, B["2025"]["sobota"]["bez"])),
    ("Obce bez autobusu v neděli", (2000, B["2000"]["neděle"]["bez"]), (2025, B["2025"]["neděle"]["bez"])),
    ("Obce s nejvýš čtyřmi spoji v sobotu", (2000, C["bus_sobota_nejvys4_2000"]), (2025, C["bus_sobota_nejvys4_2025"])),
    ("Obce bez autobusu v pracovní den", (2000, B["2000"]["pracovní den"]["bez"]), (2025, B["2025"]["pracovní den"]["bez"])),
], [-600, 4500], "",
    f"V sobotu nejede autobus do {{1{NB}722 obcí|{CRIMSON}}}, v roce 2000 jich bylo {{2{NB}441|{BLUE}}}",
    f"Počet obcí podle spojů veřejné linkové autobusové dopravy; v roce 2000 bylo obcí 6{NB}169, v roce 2025 6{NB}258. Obce včetně těch, kam jezdí vlak",
    "[Ročenky dopravy MD 2006 a 2025](https://www.sydos.cz/cs/rocenky.htm)",
    krok=1000)

# ---------- Graf 5: značky – auta registrovaná do 1989 × auta v provozu 2026 (Registr silničních vozidel) ----------
g5 = cinka("znacky", [(lab, ("do 1989", round(t, 1)), ("2026", round(d, 1))) for lab, t, d in C["rsv_graf_znacky"]],
           [-14, 66], f"{NB}%",
           f"Škoda má {{třetinu|{CRIMSON}}} dnešních aut, mezi auty z doby před revolucí měla {{víc než polovinu|{BLUE}}}",
           f"Podíl značky v %. Modře auta poprvé registrovaná v Česku do roku 1989, jak je dnes eviduje registr (i zaniklá), "
           f"červeně auta v provozu k 1.{NB}11.{NB}2026",
           "[Registr vozidel MD](https://download.dataovozidlech.cz/)", fmt=1)

for nazev, g in (("auta-na-obyvatele", g1), ("palivo", g2), ("cestujici", g3), ("obce-bez-autobusu", g4), ("znacky", g5)):
    (DATA / f"{nazev}.json").write_text(json.dumps(g, ensure_ascii=False, indent=1), encoding="utf-8")
with open(HERE / "vystup.txt", "a", encoding="utf-8") as f:
    f.write("\n# grafy.py\n" + "\n".join(out) + "\n")
print("\n".join(out))
