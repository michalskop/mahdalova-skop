"""Referenda o větrných elektrárnách při komunálních volbách 9.–10. 10. 2026.

Vstup: vstupy/referenda_vetrniky_kv2026.csv – výsledky 21 obcí ze zápisů místních
komisí na webech a úředních deskách obcí, kontrola proti tabulce MV „Místní
referenda – tabulka hlášení“ (stav 16. 10. 2026). Sestaveno 20.–21. 10. 2026.
Hranice obcí a krajů: obce-geo.json (ČSÚ, volební okrsky 2022, S-JTSK).

Výstup: vystup.txt (všechna čísla v textu), ../data/graf_obce.json, ../data/mapa.json
Spuštění: python build.py
"""
import csv
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

HERE = Path(__file__).parent
ART = HERE.parent
GEO = ART.parent / "volby-cr-2026-09-24-mista-kde-neexistuje-politicka-konkurence" / "obce-geo.json"
GEO_URL = "/clanek/_articles/volby-cr-2026-09-24-mista-kde-neexistuje-politicka-konkurence/obce-geo.json"

PROTI = "#f76800"  # brandOrange.6
PRO = "#06677d"    # brandTeal.7
INK = "#101432"

# Ruční kódování podle znění otázky a stavu záměru (sloupce zneni_otazky,
# investor_developer, stav_projektu ve vstupní tabulce).
TYP = {
    # konkrétní projekt se známým investorem nebo uzavřenou smlouvou
    "Dětřichov": "projekt", "Mikuleč": "projekt", "Kamenná Horka": "projekt",
    "Sklené": "projekt", "Kačice": "projekt", "Petrovice": "projekt",
    "Kralovice": "projekt", "Kožlany": "projekt", "Žihle": "projekt",
    "Zátor": "projekt", "Cítoliby": "projekt", "Bystrá nad Jizerou": "projekt",
    # bez konkrétního projektu: akcelerační oblast, nabídky, obecná otázka
    "Petroupim": "bez", "Soběhrdy": "bez", "Teplýšovice": "bez",
    "Horní Benešov": "bez", "Šebířov": "bez", "Radenín": "bez",
    "Měčín": "bez", "Staré Heřminovy": "bez", "Maršov u Úpice": "bez",
}
INVESTOR = {
    "Dětřichov": "ČEZ", "Sklené": "ČEZ", "Žihle": "ČEZ", "Zátor": "ČEZ",
    "Kačice": "NOHO Energy", "Bystrá nad Jizerou": "NOHO Energy",
    "Kožlany": "meridian Nová Energie", "Cítoliby": "meridian Nová Energie",
    "Mikuleč": "S&M", "Kamenná Horka": "S&M", "Kralovice": "SmartTech",
    "Petrovice": "nezjištěn",
}


def num(s):
    s = (s or "").strip().replace(" ", "").replace(" ", "").replace(",", ".")
    return float(s) if s else None


def cz(x, d=1):
    s = f"{x:,.{d}f}".replace(",", " ").replace(".", ",")
    return s


rows = list(csv.DictReader(open(HERE / "vstupy" / "referenda_vetrniky_kv2026.csv", encoding="utf-8-sig"), delimiter=";"))
obce = []
seen = set()
for r in rows:
    if r["obec"] in seen:  # Maršov u Úpice: 2. otázka (územní plán) se nepočítá
        continue
    seen.add(r["obec"])
    opr, hl = int(num(r["opravneni"])), int(num(r["hlasujici_vydane_listky"]))
    ano, ne = int(num(r["ano"])), int(num(r["ne"]))
    pro_vystavbu = r["ANO_znamena"].strip() == "pro výstavbu"
    v_pro, v_proti = (ano, ne) if pro_vystavbu else (ne, ano)
    obce.append(dict(
        obec=r["obec"], okres=r["okres"], kraj=r["kraj"], kod=r["kod_obce_CSU"].strip(),
        obyv=int(num(r["obyvatel_1_1_2026"])), opr=opr, hl=hl, ucast=hl / opr * 100,
        pro=v_pro, proti=v_proti, platne=v_pro + v_proti,
        proti_pct=v_proti / (v_pro + v_proti) * 100,
        proti_hl_pct=v_proti / hl * 100, pro_hl_pct=v_pro / hl * 100,
        vitez_opr_pct=max(v_pro, v_proti) / opr * 100,
        ano_znamena="pro výstavbu" if pro_vystavbu else "proti výstavbě",
        smer=r["smer_vysledku"].strip(), typ=TYP[r["obec"]],
        investor=INVESTOR.get(r["obec"], "–"), anketa=r["predchozi_anketa"].strip(),
        iniciator=r["iniciator"].strip(),
    ))
assert len(obce) == 21, len(obce)
for o in obce:  # kontrola směru proti tabulce
    assert (o["proti"] > o["pro"]) == (o["smer"] == "proti výstavbě"), o["obec"]

out = []
p = out.append
O = sum(o["opr"] for o in obce); H = sum(o["hl"] for o in obce)
P = sum(o["pro"] for o in obce); N = sum(o["proti"] for o in obce)
p(f"Obcí: {len(obce)}; proti výstavbě: {sum(o['smer']=='proti výstavbě' for o in obce)}; pro: {sum(o['smer']=='pro výstavbu' for o in obce)}")
p(f"Oprávněných {cz(O,0)}, hlasujících {cz(H,0)}, účast {cz(H/O*100)} %")
p(f"Hlasy pro variantu proti větrníkům {cz(N,0)}, pro výstavbu {cz(P,0)}; proti = {cz(N/(N+P)*100)} % hlasů pro jednu z odpovědí")
u = sorted(o["ucast"] for o in obce)
p(f"Účast: min {cz(u[0],2)} %, medián {cz(u[10],2)} %, max {cz(u[-1],2)} %")
p(f"Obyvatel 1. 1. 2026 celkem {cz(sum(o['obyv'] for o in obce),0)}; nejmenší {min(obce,key=lambda o:o['obyv'])['obec']} {min(o['obyv'] for o in obce)}, největší {max(obce,key=lambda o:o['obyv'])['obec']} {max(o['obyv'] for o in obce)}")
p(f"Obcí pod 500 obyvatel: {sum(o['obyv']<500 for o in obce)}, pod 1000: {sum(o['obyv']<1000 for o in obce)}")
p("")
for t, lab in (("projekt", "konkrétní projekt s investorem"), ("bez", "bez konkrétního projektu")):
    g = [o for o in obce if o["typ"] == t]
    gp = sum(o["pro"] for o in g); gn = sum(o["proti"] for o in g)
    p(f"{lab}: {len(g)} obcí, proti {sum(o['smer']=='proti výstavbě' for o in g)}, pro {sum(o['smer']=='pro výstavbu' for o in g)}; hlasy proti {cz(gn/(gn+gp)*100)} %; účast {cz(sum(o['hl'] for o in g)/sum(o['opr'] for o in g)*100)} %")
    p("   " + ", ".join(o["obec"] for o in g))
p("")
inv = {}
for o in obce:
    if o["typ"] == "projekt":
        inv.setdefault(o["investor"], []).append(o["obec"])
for k, v in inv.items():
    p(f"Investor {k}: {', '.join(v)}")
p("")
p("Po obcích (seřazeno podle podílu proti z hlasů ANO+NE):")
for o in sorted(obce, key=lambda o: -o["proti_pct"]):
    p(f"  {o['obec']:<20} {o['okres']:<12} obyv {o['obyv']:>5}  účast {cz(o['ucast'],2):>6} %  proti {o['proti']:>4}  pro {o['pro']:>4}  "
      f"proti {cz(o['proti_pct'])} % platných / {cz(o['proti_hl_pct'])} % hlasujících  vítěz {cz(o['vitez_opr_pct'])} % opráv.  typ {o['typ']}  ANO={o['ano_znamena']}")
p("")
p(f"Otázek, kde ANO znamená proti výstavbě: {sum(o['ano_znamena']=='proti výstavbě' for o in obce)}")
p("Nejtěsnější: " + ", ".join(f"{o['obec']} rozdíl {abs(o['proti']-o['pro'])}" for o in sorted(obce, key=lambda o: abs(o['proti'] - o['pro']))[:5]))
p("")
p("Předchozí ankety (jen tam, kde jsou):")
for o in obce:
    if o["anketa"] and not o["anketa"].lower().startswith(("nezjiš", "nenalez", "neprob")):
        p(f"  {o['obec']}: {o['anketa'][:220]}")

# Anketa v Kačici 20., 22. a 24. 6. 2024 (obec Kačice, Výsledky ankety:
# https://www.kacice.cz/pro-obcany/aktuality/vysledky-ankety-103cs.html):
# 986 rozdaných lístků, 377 odevzdaných, 209 pro, 168 proti.
k = next(o for o in obce if o["obec"] == "Kačice")
p("")
p(f"Kačice anketa 2024: odevzdáno 377 z 986 ({cz(377/986*100)} %), pro 209 ({cz(209/377*100)} %), proti 168")
p(f"Kačice referendum 2026: hlasovalo {k['hl']} z {k['opr']}, pro {k['pro']}, proti {k['proti']}; "
  f"pro +{k['pro']-209}, proti +{k['proti']-168} ({cz(k['proti']/168,2)}×)")

# ---- graf po obcích: podíl hlasů proti / pro ----
srt = sorted(obce, key=lambda o: -o["proti_pct"])
vals = []
for o in srt:
    lab = f"{o['obec']}"
    vals.append({"obec": lab, "odpověď": "proti výstavbě", "podíl": round(o["proti_pct"], 1), "hlasy": o["proti"], "účast": round(o["ucast"], 1), "pořadí": 0, "typ": "konkrétní projekt" if o["typ"] == "projekt" else "bez konkrétního projektu"})
    vals.append({"obec": lab, "odpověď": "pro výstavbu", "podíl": round(100 - o["proti_pct"], 1), "hlasy": o["pro"], "účast": round(o["ucast"], 1), "pořadí": 1, "typ": "konkrétní projekt" if o["typ"] == "projekt" else "bez konkrétního projektu"})
order = [o["obec"] for o in srt]
graf = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": {
        "text": "Větrníky {odmítlo|" + PROTI + "} 20 z 21 obcí, {podpořil|" + PRO + "} je jen Dětřichov",
        "subtitle": "Podíl hlasů pro odpověď proti výstavbě a pro výstavbu v referendech 9.–10. 10. 2026, bez neplatných a prázdných lístků. Obce seřazené od nejjednoznačnějšího odmítnutí. Číslo vpravo je účast.",
    },
    "_source": "Zápisy místních komisí o výsledku referenda na úředních deskách obcí; kontrola: MV ČR, Místní referenda – tabulka hlášení (16. 10. 2026); výpočet DataTimes.cz",
    "_toggle_legend": True,
    "width": "container",
    "height": {"step": 22},
    "data": {"values": vals},
    "encoding": {
        "y": {"field": "obec", "type": "nominal", "sort": order, "title": None,
              "axis": {"labelFontSize": 13, "labelLimit": 160, "ticks": False, "domain": False}},
    },
    "layer": [
        {
            "mark": {"type": "bar", "height": {"band": 0.72}},
            "encoding": {
                "x": {"field": "podíl", "type": "quantitative", "stack": "zero", "scale": {"domain": [0, 100]},
                      "title": None, "axis": {"values": [0, 25, 50, 75, 100], "labelExpr": "datum.value + ' %'", "grid": True, "gridColor": "#e8e3d2"}},
                "color": {"field": "odpověď", "type": "nominal", "scale": {"domain": ["proti výstavbě", "pro výstavbu"], "range": [PROTI, PRO]},
                          "legend": None},
                "order": {"field": "pořadí"},
                "tooltip": [
                    {"field": "obec", "title": "Obec"},
                    {"field": "odpověď", "title": "Odpověď"},
                    {"field": "hlasy", "title": "Hlasů", "format": ",.0f"},
                    {"field": "podíl", "title": "Podíl, %", "format": ".1f"},
                    {"field": "účast", "title": "Účast, %", "format": ".1f"},
                    {"field": "typ", "title": "Hlasovalo se o"},
                ],
            },
        },
        {
            "transform": [{"filter": "datum['odpověď'] == 'proti výstavbě'"}],
            "mark": {"type": "text", "align": "left", "dx": 4, "fontSize": 12, "fontWeight": "bold", "color": "#ffffff"},
            "encoding": {"x": {"datum": 0}, "text": {"field": "podíl", "type": "quantitative", "format": ".0f"}},
        },
        {
            "transform": [{"filter": "datum['odpověď'] == 'proti výstavbě'"}],
            "mark": {"type": "text", "align": "left", "dx": 6, "fontSize": 12, "color": "#333333"},
            "encoding": {"x": {"datum": 100}, "text": {"field": "účast", "type": "quantitative", "format": ".0f"}},
        },
    ],
    "config": {"view": {"stroke": None}},
}
(ART / "data" / "graf_obce.json").write_text(json.dumps(graf, ensure_ascii=False, indent=1), encoding="utf-8")

# ---- mapa: puntík = obec, barva = výsledek, velikost = počet hlasujících ----
topo = json.load(open(GEO, encoding="utf-8"))
sx, sy = topo["transform"]["scale"]; tx, ty = topo["transform"]["translate"]
arcs = []
for a in topo["arcs"]:
    x = y = 0; pts = []
    for dx, dy in a:
        x += dx; y += dy
        pts.append((x * sx + tx, y * sy + ty))
    arcs.append(pts)


def ring(idx):
    pts = []
    for i in idx:
        seg = arcs[i] if i >= 0 else arcs[~i][::-1]
        pts.extend(seg if not pts else seg[1:])
    return pts


def centroid(geom):
    polys = geom["arcs"] if geom["type"] == "MultiPolygon" else [geom["arcs"]]
    A = Cx = Cy = 0.0
    for poly in polys:
        pts = ring(poly[0])
        for (x0, y0), (x1, y1) in zip(pts, pts[1:] + pts[:1]):
            c = x0 * y1 - x1 * y0
            A += c; Cx += (x0 + x1) * c; Cy += (y0 + y1) * c
    return Cx / (3 * A), Cy / (3 * A)


geoms = {str(g.get("id") or g.get("properties", {}).get("id")): g for g in topo["objects"]["obce"]["geometries"]}
body = []
for o in obce:
    g = geoms.get(o["kod"])
    assert g is not None, ("obec chybí v geometrii", o["obec"], o["kod"])
    x, y = centroid(g)
    body.append({"obec": o["obec"], "okres": o["okres"], "x": round(x), "y": round(y),
                 "výsledek": "proti výstavbě" if o["smer"] == "proti výstavbě" else "pro výstavbu",
                 "hlasujících": o["hl"], "účast": round(o["ucast"], 1),
                 "proti": o["proti"], "pro": o["pro"], "podíl proti": round(o["proti_pct"], 1)})
# Popisky: shluky sousedních obcí dostanou jméno regionu (jinak by se popisky překrývaly), ostatní obce své jméno.
SHLUK = {"Svitavy": "Svitavsko", "Benešov": "Benešovsko", "Plzeň-sever": "Plzeňsko", "Bruntál": "Bruntálsko", "Tábor": "Táborsko"}
popisky = {}
for b in body:
    k = SHLUK.get(b["okres"], b["obec"])
    popisky.setdefault(k, []).append(b)
POD = {"Petrovice"}  # popisek pod puntíkem, nad ním by kolidoval s Plzeňskem
popisky = [{"popisek": k, "x": round(sum(b["x"] for b in v) / len(v)), "y": max(b["y"] for b in v)} for k, v in popisky.items()]
mapa = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": {
        "text": "Referenda o větrnících se konala hlavně na venkově od Plzeňska po Bruntálsko",
        "subtitle": "Obce, kde se 9.–10. 10. 2026 spolu s komunálními volbami hlasovalo o větrných elektrárnách. Velikost puntíku odpovídá počtu hlasujících. Najeďte na obec pro podrobnosti.",
    },
    "_source": "Zápisy místních komisí o výsledku referenda; MV ČR, Místní referenda – tabulka hlášení (16. 10. 2026); hranice: ČSÚ; výpočet DataTimes.cz",
    "width": "container",
    "height": 380,
    "projection": {"type": "identity", "reflectY": True},
    "layer": [
        {"data": {"url": GEO_URL, "format": {"type": "topojson", "feature": "kraje"}},
         "mark": {"type": "geoshape", "fill": "#f3f1e9", "stroke": "#ffffff", "strokeWidth": 1.2}},
        {"data": {"values": body},
         "mark": {"type": "circle", "opacity": 0.85, "stroke": "#ffffff", "strokeWidth": 1},
         "encoding": {
             "longitude": {"field": "x", "type": "quantitative"},
             "latitude": {"field": "y", "type": "quantitative"},
             "size": {"field": "hlasujících", "type": "quantitative", "scale": {"range": [40, 520]}, "legend": None},
             "color": {"field": "výsledek", "type": "nominal", "scale": {"domain": ["proti výstavbě", "pro výstavbu"], "range": [PROTI, PRO]},
                       "legend": {"orient": "top", "title": None}},
             "tooltip": [
                 {"field": "obec", "title": "Obec"}, {"field": "okres", "title": "Okres"},
                 {"field": "výsledek", "title": "Výsledek"},
                 {"field": "proti", "title": "Hlasů proti výstavbě", "format": ",.0f"},
                 {"field": "pro", "title": "Hlasů pro výstavbu", "format": ",.0f"},
                 {"field": "účast", "title": "Účast, %", "format": ".1f"},
             ]}},
        {"data": {"values": [x for x in popisky if x["popisek"] not in POD]},
         "mark": {"type": "text", "dy": -16, "fontSize": 12, "color": INK},
         "encoding": {"longitude": {"field": "x", "type": "quantitative"}, "latitude": {"field": "y", "type": "quantitative"},
                      "text": {"field": "popisek"}}},
        {"data": {"values": [x for x in popisky if x["popisek"] in POD]},
         "mark": {"type": "text", "dy": 18, "fontSize": 12, "color": INK},
         "encoding": {"longitude": {"field": "x", "type": "quantitative"}, "latitude": {"field": "y", "type": "quantitative"},
                      "text": {"field": "popisek"}}},
    ],
    "config": {"view": {"stroke": None}},
}
(ART / "data" / "mapa.json").write_text(json.dumps(mapa, ensure_ascii=False, indent=1), encoding="utf-8")

# ---- všechna referenda o VTE 2006–2026 (tabulka MV) ----
# vstupy/referenda_vte_2006_2026.csv: MV ČR, Místní referenda – tabulka hlášení (stav 16. 10. 2026),
# vyčištěno skripty mv_2006_2026/01–05 (ruční kódování ANO_znamena v rucni_kodovani.csv); 9.–10. 10. 2026
# ze zápisů komisí. Počítá se hlavní otázka o VTE, směr = většina hlasujících, bez ohledu na závaznost.
vte = [r for r in csv.DictReader(open(HERE / "vstupy" / "referenda_vte_2006_2026.csv", encoding="utf-8-sig"), delimiter=";")
       if r["hlavni_otazka"] == "ano" and r["stav"] == "konáno"]
p("")
p(f"MV 2006–2026: konaných referend o VTE {len(vte)} (bez zrušeného soudem), obcí {len({r['kod_obce_CSU'] for r in vte})}")
roky = {}
for r in vte:
    y = int(r["rok"]); d = roky.setdefault(y, {"proti": 0, "pro": 0, "neplatné": 0})
    if r["platne"] != "ano":
        d["neplatné"] += 1
    elif r["smer_vetsiny_hlasujicich"] == "proti výstavbě":
        d["proti"] += 1
    elif r["smer_vetsiny_hlasujicich"] == "pro výstavbu":
        d["pro"] += 1
    else:
        d["neplatné"] += 1  # jiné / nejasné
for y in sorted(roky):
    d = roky[y]; p(f"  {y}: celkem {sum(d.values())}, proti {d['proti']}, pro {d['pro']}, neplatné/nejasné {d['neplatné']}")


def soucet(od, do):
    s = {"proti": 0, "pro": 0, "neplatné": 0}
    for y, d in roky.items():
        if od <= y <= do:
            for k in s:
                s[k] += d[k]
    return s


for od, do in ((2006, 2023), (2024, 2026), (2025, 2026), (2006, 2026), (2019, 2025), (2026, 2026)):
    s = soucet(od, do); pl = s["proti"] + s["pro"]
    p(f"  {od}–{do}: konaných {sum(s.values())}, platných {pl}, proti {s['proti']} ({cz(s['proti']/pl*100)} % platných)")
mimo = [r for r in vte if r["rok"] == "2026" and r["spolu_s_volbami"] != "ano" and r["platne"] == "ano"]
p(f"  2026 mimo volby: platných {len(mimo)}, proti {sum(r['smer_vetsiny_hlasujicich']=='proti výstavbě' for r in mimo)}; "
  f"pro: {', '.join(r['obec'] + ' (' + r['okres'] + ', ' + r['datum_od'] + ', ' + r['ano'] + ':' + r['ne'] + ')' for r in mimo if r['smer_vetsiny_hlasujicich']=='pro výstavbu')}")
pv = [o for o in obce if o["iniciator"].lower().startswith(("přípravný", "návrh přípravného"))]
p(f"Říjen 2026: návrh na referendum podal přípravný výbor občanů v {len(pv)} obcích: {', '.join(o['obec'] for o in pv)}")
graf_roky = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": {
        "text": "Referend o větrnících přibývá a letos skoro všechna {odmítla|" + PROTI + "} výstavbu",
        "subtitle": "Místní referenda o větrných elektrárnách podle roku konání a podle toho, která odpověď získala většinu hlasujících. Šedě referenda neplatná kvůli nízké účasti. Rok 2026 do 10. října.",
    },
    "_source": "MV ČR, Místní referenda – tabulka hlášení (16. 10. 2026); referenda 9.–10. 10. 2026 ze zápisů místních komisí; ruční kódování otázek a výpočet DataTimes.cz",
    "_toggle_legend": True,
    "width": "container",
    "height": 300,
    "data": {"values": [{"rok": str(y), "výsledek": k, "počet": v, "pořadí": i}
                        for y in range(2006, 2027) for i, k in enumerate(("proti", "pro", "neplatné"))
                        for v in [roky.get(y, {}).get(k, 0)] if v]},
    "transform": [{"calculate": "{'proti': 'většina proti výstavbě', 'pro': 'většina pro výstavbu', 'neplatné': 'neplatné'}[datum['výsledek']]", "as": "odpověď"}],
    "mark": {"type": "bar", "width": {"band": 0.75}},
    "encoding": {
        "x": {"field": "rok", "type": "ordinal", "title": None, "sort": [str(y) for y in range(2006, 2027)],
              "scale": {"domain": [str(y) for y in range(2006, 2027)]},
              "axis": {"labelAngle": 0, "labelExpr": "(+datum.value) % 2 == 0 || datum.value == '2025' ? datum.value : ''", "ticks": False}},
        "y": {"field": "počet", "type": "quantitative", "stack": "zero", "title": None, "axis": {"tickMinStep": 5, "gridColor": "#e8e3d2"}},
        "color": {"field": "odpověď", "type": "nominal",
                  "scale": {"domain": ["většina proti výstavbě", "většina pro výstavbu", "neplatné"], "range": [PROTI, PRO, "#bcc4df"]},
                  "legend": None},
        "order": {"field": "pořadí"},
        "tooltip": [{"field": "rok", "title": "Rok"}, {"field": "odpověď", "title": "Výsledek"}, {"field": "počet", "title": "Referend"}],
    },
    "config": {"view": {"stroke": None}},
}
(ART / "data" / "graf_roky.json").write_text(json.dumps(graf_roky, ensure_ascii=False, indent=1), encoding="utf-8")

# ---- poloha obcí pro motiv coveru (zeměpisné souřadnice) ----
# Těžiště obcí jsou v S-JTSK; tečková mapa coveru je v lon/lat. Převod: kvadratická regrese
# z těžišť 140 měst, jejichž lon/lat má obce-mapa.json (jen ilustrace, přesnost ~1 km).
mesta = json.load(open(ART.parent / "volby-cr-2026-10-10-senat-komunalni-2026-predikce" / "obce-mapa.json", encoding="utf-8"))
X, Ylon, Ylat = [], [], []
for m in mesta:
    g = geoms.get(m["keys"][0].split("_")[0])
    if g is None:
        continue
    x, y = centroid(g); x, y = x / 1e5, y / 1e5
    X.append([1, x, y, x * x, x * y, y * y]); Ylon.append(m["lon"]); Ylat.append(m["lat"])


def lstsq(A, b):  # normální rovnice, Gauss
    n = len(A[0])
    M = [[sum(r[i] * r[j] for r in A) for j in range(n)] + [sum(r[i] * v for r, v in zip(A, b))] for i in range(n)]
    for i in range(n):
        piv = max(range(i, n), key=lambda k: abs(M[k][i])); M[i], M[piv] = M[piv], M[i]
        for k in range(n):
            if k != i:
                f = M[k][i] / M[i][i]
                M[k] = [a - f * c for a, c in zip(M[k], M[i])]
    return [M[i][n] / M[i][i] for i in range(n)]


clon, clat = lstsq(X, Ylon), lstsq(X, Ylat)
pred = lambda c, r: sum(a * b for a, b in zip(c, r))
err = max(max(abs(pred(clon, r) - v) for r, v in zip(X, Ylon)), max(abs(pred(clat, r) - v) for r, v in zip(X, Ylat)))
p(f"Převod S-JTSK → lon/lat: {len(X)} měst, max. odchylka {err:.4f}°")
poloha = []
for b in body:
    x, y = b["x"] / 1e5, b["y"] / 1e5
    r = [1, x, y, x * x, x * y, y * y]
    poloha.append({"obec": b["obec"], "lon": round(pred(clon, r), 4), "lat": round(pred(clat, r), 4),
                   "vysledek": b["výsledek"], "hlasujicich": b["hlasujících"]})
(ART / "_cover_pipeline").mkdir(exist_ok=True)
(ART / "_cover_pipeline" / "obce.json").write_text(json.dumps(poloha, ensure_ascii=False, indent=1), encoding="utf-8")

(HERE / "vystup.txt").write_text("\n".join(out) + "\n", encoding="utf-8")
print("\n".join(out))
