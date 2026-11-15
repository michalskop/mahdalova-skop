"""Grafy kapitoly „Politika“ (Vega-Lite pro <VegaChart dataFile="data/…" />).

Čísla bere jen z vysledky.json, který počítá vypocet.py z primárních dat. Pořadí:
  python vypocet.py && python grafy.py
Na konec vystup.txt připíše kontrolní výpis hodnot v grafech.
"""
import json
import sys
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
HERE = Path(__file__).resolve().parent
DATA = HERE.parent / "data"
CRIMSON, BLUE, MUTED, INK = "#de1743", "#6267a3", "#d4d4c8", "#101432"
V = json.loads((HERE / "vysledky.json").read_text(encoding="utf-8"))
log = []
NB = " "


def cz(x, d=1):
    s = f"{x:,.{d}f}".replace(",", " ").replace(".", ",")
    return s.replace(" ", NB)


def pct(x):
    return f"{cz(x, 1).replace(',0', '')}{NB}%"


def r0(x):
    """Zaokrouhlení na celá procenta nahoru od poloviny (28,5 → 29), stejně jako v textu."""
    return int(Decimal(str(x)).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def spec(title, subtitle, values, layers, source, **kw):
    s = {"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
         "title": {"text": title, "subtitle": subtitle},
         "width": "container", "config": {"view": {"stroke": None}},
         "data": {"values": values}, "layer": layers, "_source": source}
    s.update(kw)
    return s


SRC_PS = "[ČSÚ](https://csu.gov.cz/produkty/volby-do-cnr-a-ps-pcr), [psp.cz](https://www.psp.cz/sqw/hp.sqw?k=1300)"

# ---------------------------------------------------------------- Graf 1: ženy ve Sněmovně
c = V["cnr_1989"]
v1 = [dict(volby="ČNR 1989*", pct=c["zeny_pct"], n=c["zen"], z=c["clenu"], barva="1989",
           t=f"{pct(c['zeny_pct'])} ({c['zen']} z {c['clenu']})", pozn="nesvobodná ČNR k 17. 11. 1989")]
for s in V["snemovna"]:
    v1.append(dict(volby=s["volby"], pct=s["zeny_pct"], n=s["zeny_n"], z=s["poslancu"],
                   barva="dnes" if s["rok"] == 2025 else "mezi",
                   t=f"{pct(s['zeny_pct'])} ({s['zeny_n']} z {s['poslancu']})", pozn="zvolení poslanci"))
for x in v1:
    log.append(f"G1 {x['volby']}: {x['t']}")
y1 = {"field": "volby", "type": "nominal", "sort": None,
      "axis": {"title": None, "domain": False, "ticks": False, "labelFontSize": 12, "labelPadding": 6}}
x1 = {"field": "pct", "type": "quantitative", "scale": {"domain": [0, 62]},
      "axis": {"title": None, "grid": True, "gridColor": MUTED, "domain": False, "ticks": False,
               "values": [0, 10, 20, 30], "labelExpr": "datum.value + ' %'"}}
tt1 = [{"field": "volby", "title": "Volby"}, {"field": "t", "title": "Ženy"}, {"field": "pozn", "title": "Kdo"}]
g1 = spec(f"Ve Sněmovně je {{třetina žen|{CRIMSON}}}, nejvíc od {{roku 1989|{BLUE}}}",
          "Podíl žen mezi zvolenými poslanci v %; ČNR = Česká národní rada, PS = Poslanecká sněmovna. "
          "*Nesvobodná ČNR zvolená v roce 1986 na jednotné kandidátce Národní fronty, stav k 17. 11. 1989",
          v1, [
              {"mark": {"type": "bar", "cornerRadiusEnd": 3, "height": {"band": 0.7}},
               "encoding": {"y": y1, "x": x1, "tooltip": tt1,
                            "color": {"field": "barva", "type": "nominal", "legend": None,
                                      "scale": {"domain": ["1989", "mezi", "dnes"], "range": [BLUE, MUTED, CRIMSON]}}}},
              {"mark": {"type": "text", "align": "left", "dx": 5, "fontSize": 11, "fontWeight": 700, "color": INK},
               "encoding": {"y": y1, "x": {"field": "pct", "type": "quantitative"}, "text": {"field": "t"}, "tooltip": tt1}},
          ], SRC_PS, height={"step": 26})

# ---------------------------------------------------------------- Graf 2: věk
v2 = []
for s in V["snemovna"]:
    v2.append(dict(rok=s["rok"], vek=s["vek"], komora="Poslanci", t=f"{cz(s['vek'])}{NB}roku", volby=s["volby"]))
for s in V["senat"]:
    v2.append(dict(rok=s["rok"], vek=s["vek"], komora="Senátoři", t=f"{cz(s['vek'])}{NB}roku",
                   volby=f"Senát {s['rok']} ({s['zvoleno']} zvolených)"))
for x in v2:
    log.append(f"G2 {x['komora']} {x['rok']}: {x['t']}")
okraje = [x for x in v2 if (x["komora"] == "Poslanci" and x["rok"] in (1990, 2025)) or (x["komora"] == "Senátoři" and x["rok"] in (1996, 2026))]
for x in okraje:
    x["popisek"] = cz(x["vek"])
    x["nahore"] = x["komora"] == "Senátoři"
col2 = {"field": "komora", "type": "nominal", "title": None,
        "scale": {"domain": ["Poslanci", "Senátoři"], "range": [CRIMSON, BLUE]}}
xx = {"field": "rok", "type": "quantitative", "scale": {"domain": [1989, 2027]},
      "axis": {"title": None, "format": "d", "grid": False, "domain": False, "ticks": False, "values": [1990, 2000, 2010, 2020, 2025]}}
yy = {"field": "vek", "type": "quantitative", "scale": {"domain": [40, 62]},
      "axis": {"title": None, "grid": True, "gridColor": MUTED, "domain": False, "ticks": False, "values": [40, 45, 50, 55, 60]}}
tt2 = [{"field": "volby", "title": "Volby"}, {"field": "t", "title": "Průměrný věk zvolených"}]
g2 = spec(f"Poslanci jsou {{skoro o pět let starší|{CRIMSON}}} než po volbách 1990, {{senátoři|{BLUE}}} o tři roky",
          "Průměrný věk zvolených poslanců a nově zvolených senátorů v den voleb (Senát volí každé dva roky třetinu, v roce 1996 všech 81)",
          v2, [
              {"mark": {"type": "line", "strokeWidth": 2.5, "point": {"size": 36, "filled": True}},
               "encoding": {"x": xx, "y": yy, "color": col2, "tooltip": tt2}},
              {"data": {"values": [x for x in okraje if not x["nahore"]]},
               "mark": {"type": "text", "dy": 16, "fontSize": 11, "fontWeight": 700, "color": CRIMSON},
               "encoding": {"x": xx, "y": yy, "text": {"field": "popisek"}}},
              {"data": {"values": [x for x in okraje if x["nahore"]]},
               "mark": {"type": "text", "dy": -12, "fontSize": 11, "fontWeight": 700, "color": BLUE},
               "encoding": {"x": xx, "y": yy, "text": {"field": "popisek"}}},
          ],
          "ČSÚ, volby do [Sněmovny](https://csu.gov.cz/produkty/volby-do-cnr-a-ps-pcr) a [Senátu](https://csu.gov.cz/produkty/volby-do-senatu-pcr)",
          height=260, _toggle_legend=True)

# ---------------------------------------------------------------- Graf 3: vyznamenání ženám podle prezidentů
v3 = []
for p in V["vyznamenani"]:
    v3.append(dict(prezident=f"{p['prezident']} ({p['roky'].replace('–', '–')})", pct=p["pct"],
                   barva="dnes" if p["prezident"] == "Petr Pavel" else "tehdy",
                   t=f"{pct(r0(p['pct']))} ({p['zeny']} z {cz(p['vse'], 0)})",
                   r=f"{p['rady_zeny']} z {p['rady']} ({pct(r0(p['rady_pct']))})"))
    log.append(f"G3 {p['prezident']}: ženám {p['zeny']} z {p['vse']} ({p['pct']} %), řády {p['rady_zeny']} z {p['rady']}")
y3 = {"field": "prezident", "type": "nominal", "sort": None, "axis": None, "scale": {"paddingInner": 0.55, "paddingOuter": 0.5}}
x3 = {"field": "pct", "type": "quantitative", "scale": {"domain": [0, 52]},
      "axis": {"title": None, "grid": True, "gridColor": MUTED, "domain": False, "ticks": False,
               "values": [0, 10, 20, 30], "labelExpr": "datum.value + ' %'"}}
tt3 = [{"field": "prezident", "title": "Prezident"}, {"field": "t", "title": "Vyznamenání pro ženy"}, {"field": "r", "title": "Z toho řády"}]
g3 = spec(f"Za Petra Pavla dostávají ženy {{dvakrát větší podíl|{CRIMSON}}} vyznamenání než za {{jeho předchůdců|{BLUE}}}",
          "Podíl vyznamenání udělených ženám v %, ze vyznamenání se známým pohlavím; počítáme vyznamenání, ne osoby. Pavel včetně 28. 10. 2026",
          v3, [
              {"mark": {"type": "text", "align": "left", "baseline": "bottom", "dy": -12, "fontSize": 12, "color": "#333333"},
               "encoding": {"y": y3, "x": {"datum": 0, "type": "quantitative", "scale": {"domain": [0, 52]}}, "text": {"field": "prezident"}}},
              {"mark": {"type": "bar", "cornerRadiusEnd": 3, "height": {"band": 1}},
               "encoding": {"y": y3, "x": x3, "tooltip": tt3,
                            "color": {"field": "barva", "type": "nominal", "legend": None, "scale": {"domain": ["tehdy", "dnes"], "range": [BLUE, CRIMSON]}}}},
              {"mark": {"type": "text", "align": "left", "dx": 5, "fontSize": 11, "fontWeight": 700, "color": INK},
               "encoding": {"y": y3, "x": {"field": "pct", "type": "quantitative"}, "text": {"field": "t"}, "tooltip": tt3}},
          ],
          "Hrad, [výpočet DataTimes](/clanek/analyza-2026-10-28-statni-vyznamenani)",
          height={"step": 52})

# ---------------------------------------------------------------- Graf 4: ženy zvolené do Senátu
v4 = [dict(rok=str(s["rok"]), pct=s["zeny_pct"], n=s["zeny_n"], z=s["zvoleno"],
           barva="dnes" if s["rok"] == 2026 else ("tehdy" if s["rok"] == 1996 else "mezi"),
           t=f"{s['zeny_n']} z {s['zvoleno']} ({pct(s['zeny_pct'])})") for s in V["senat"]]
for x in v4:
    log.append(f"G4 Senát {x['rok']}: {x['t']}")
x4 = {"field": "rok", "type": "ordinal", "sort": None,
      "axis": {"title": None, "domain": False, "ticks": False, "labelAngle": 0, "labelExpr": "'’' + substring(datum.value, 2, 4)"}}
y4 = {"field": "pct", "type": "quantitative", "scale": {"domain": [0, 40]},
      "axis": {"title": None, "grid": True, "gridColor": MUTED, "domain": False, "ticks": False, "values": [0, 10, 20, 30], "labelExpr": "datum.value + ' %'"}}
tt4 = [{"field": "rok", "title": "Volby do Senátu"}, {"field": "t", "title": "Zvolené ženy"}]
g4 = spec(f"Letos se do Senátu dostala {{jedna žena|{CRIMSON}}} z 27 zvolených",
          "Podíl žen mezi nově zvolenými senátory v %, nad sloupcem počet žen; 1996 se volilo všech 81 senátorů, od 1998 vždy třetina (27)",
          v4, [
              {"mark": {"type": "bar", "cornerRadiusEnd": 2, "width": {"band": 0.75}},
               "encoding": {"x": x4, "y": y4, "tooltip": tt4,
                            "color": {"field": "barva", "type": "nominal", "legend": None,
                                      "scale": {"domain": ["tehdy", "mezi", "dnes"], "range": [BLUE, MUTED, CRIMSON]}}}},
              {"mark": {"type": "text", "dy": -7, "fontSize": 11, "fontWeight": 700, "color": INK},
               "encoding": {"x": x4, "y": y4, "text": {"field": "n"}, "tooltip": tt4}},
          ],
          "[ČSÚ](https://csu.gov.cz/produkty/volby-do-senatu-pcr), [senat.cz](https://www.senat.cz/senatori/)",
          height=220)

DATA.mkdir(exist_ok=True)
for name, s in [("zeny-snemovna", g1), ("vek-poslancu-senatoru", g2), ("vyznamenani-zeny", g3), ("zeny-senat", g4)]:
    (DATA / f"{name}.json").write_text(json.dumps(s, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
vys = (HERE / "vystup.txt").read_text(encoding="utf-8").split("\n## Hodnoty v grafech")[0].rstrip("\n")
(HERE / "vystup.txt").write_text(vys + "\n\n## Hodnoty v grafech (grafy.py)\n" + "\n".join(log) + "\n", encoding="utf-8")
print("\n".join(log))
