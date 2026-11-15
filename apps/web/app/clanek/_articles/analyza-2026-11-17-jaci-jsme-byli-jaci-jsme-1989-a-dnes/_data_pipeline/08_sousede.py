"""Česko a sousedé 1990 × dnes – srovnání pro pilot speciálu „Jací jsme byli, jací jsme“.

Země: Česko, Rakousko, Německo (sousedé na západě, měřítko), Slovensko, Polsko (sousedé se stejným
startem) a Maďarsko (země se stejným startem z plánované ekonomiky sovětského bloku, bez společné hranice).

Primární zdroje (archiv csu-data/srovnani/…/20261114, stav ke 14. 11. 2026):
  HDP na obyvatele v paritě kupní síly – Světová banka, World Development Indicators,
    NY.GDP.PCAP.PP.CD (běžné mezinárodní dolary), řada od 1990 (Eurostat nama_10_pc začíná až 1995)
    https://api.worldbank.org/v2/en/indicator/NY.GDP.PCAP.PP.CD?downloadformat=csv
    kontrola posledního roku: Eurostat nama_10_pc, CP_PPS_EU27_2020_HAB (PPS)
  Naděje dožití při narození – Eurostat demo_mlexpec (sex=T, age=Y_LT1)
  Kojenecká úmrtnost – Eurostat demo_minfind (INFMORRT, na 1 000 živě narozených)
  Vysokoškoláci 25–64 let – Eurostat edat_lfse_03 (ISCED 5–8), řada od 1990s, zlom 2014 (ISCED 2011)
  Německo u Eurostatu: pro rok 1990 kód DE_TOT (včetně bývalé NDR); kód DE je do 1990 jen západní Německo.

Výstup: vystup_sousede.txt (všechna čísla), ../data/sousede-hdp.json, ../data/sousede-doziti.json
"""
import csv
import glob
import json
import os
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
HERE = Path(__file__).resolve().parent
DATA_OUT = HERE.parent / "data"
CRIMSON, BLUE, MUTED, INK, GREY = "#de1743", "#6267a3", "#d4d4c8", "#101432", "#bcbcb0"
NB = " "


def najdi_archiv() -> Path:
    if os.environ.get("CSU_DATA"):
        return Path(os.environ["CSU_DATA"])
    for p in Path(__file__).resolve().parents:
        for kandidat in (p / "csu-data", p / "statisticka-data" / "cesko"):
            if kandidat.exists():
                return kandidat
    raise SystemExit("Archiv csu-data nenalezen – nastav CSU_DATA")


ARCHIV = najdi_archiv() / "srovnani"
WB = ARCHIV / "worldbank-wdi-sousede/20261114"
ES = ARCHIV / "eurostat-sousede/20261114"
ZEME = {"CZ": "Česko", "AT": "Rakousko", "DE": "Německo", "SK": "Slovensko", "PL": "Polsko", "HU": "Maďarsko"}
ISO3 = {"CZE": "CZ", "AUT": "AT", "DEU": "DE", "SVK": "SK", "POL": "PL", "HUN": "HU"}
out = []


def log(*a):
    out.append(" ".join(str(x) for x in a))


def cz(x, d=1):
    return f"{x:,.{d}f}".replace(",", NB).replace(".", ",")


def wdi(kod):
    f = glob.glob(str(WB / kod / f"API_{kod}_*.csv"))[0]
    rows = list(csv.reader(open(f, encoding="utf-8-sig")))
    hdr = rows[4]
    return {ISO3[r[1]]: {int(hdr[i]): float(r[i]) for i in range(4, len(hdr)) if hdr[i].isdigit() and r[i]}
            for r in rows[5:] if r[1] in ISO3}, rows[2][1]


def eurostat(soubor, **filtr):
    d = json.loads((ES / soubor).read_text(encoding="utf-8"))
    ids, sz = d["id"], d["size"]
    cats = [sorted(d["dimension"][i]["category"]["index"].items(), key=lambda x: x[1]) for i in ids]
    gi, ti = ids.index("geo"), ids.index("time")
    res = {}
    for k, v in d["value"].items():
        k, idx = int(k), []
        for s in reversed(sz):
            idx.append(k % s)
            k //= s
        idx.reverse()
        key = [cats[j][idx[j]][0] for j in range(len(ids))]
        if any(key[ids.index(dim)] != hod for dim, hod in filtr.items()):
            continue
        res.setdefault(key[gi], {})[int(key[ti])] = v
    # Německo: 1990 jen DE_TOT (vč. NDR), jinak DE
    if "DE_TOT" in res:
        res["DE"] = {**res.get("DE", {}), **{y: v for y, v in res["DE_TOT"].items() if y <= 1990}}
    return res, d.get("updated")


# ---------- HDP na obyvatele v PPP ----------
hdp, upd = wdi("NY.GDP.PCAP.PP.CD")
log(f"WDI NY.GDP.PCAP.PP.CD, aktualizace {upd}")
ROK0, ROK1 = 1990, max(hdp["CZ"])
for z in ZEME:
    log(f"HDP PPP {ZEME[z]}: {ROK0} {hdp[z][ROK0]:.0f} $, {ROK1} {hdp[z][ROK1]:.0f} $, "
        f"v % Rakouska {100 * hdp[z][ROK0] / hdp['AT'][ROK0]:.1f} → {100 * hdp[z][ROK1] / hdp['AT'][ROK1]:.1f}, "
        f"v % Německa {100 * hdp[z][ROK0] / hdp['DE'][ROK0]:.1f} → {100 * hdp[z][ROK1] / hdp['DE'][ROK1]:.1f}")
pct_at = {z: {y: 100 * hdp[z][y] / hdp["AT"][y] for y in hdp["AT"] if y >= ROK0 and y in hdp[z]} for z in ZEME}
dno = min((y for y in pct_at["CZ"] if y <= 2005), key=lambda y: pct_at["CZ"][y])
log(f"Česko v % Rakouska – minimum {dno}: {pct_at['CZ'][dno]:.1f}; 2010 {pct_at['CZ'][2010]:.1f}")
nama, upd_n = eurostat("nama_10_pc.json", unit="CP_PPS_EU27_2020_HAB")
log(f"Eurostat nama_10_pc (aktualizace {upd_n}) – kontrola {ROK1}: Česko v % Rakouska v PPS "
    f"{100 * nama['CZ'][ROK1] / nama['AT'][ROK1]:.1f} (WDI {pct_at['CZ'][ROK1]:.1f})")
nama_eu, _ = eurostat("nama_10_pc.json", unit="PC_EU27_2020_HAB_MPPS_CP")
log(f"Eurostat {ROK1}: HDP na obyvatele v PPS, EU27 = 100: " + ", ".join(f"{ZEME[z]} {nama_eu[z][ROK1]}" for z in ZEME))

# ---------- naděje dožití, kojenecká úmrtnost, vysokoškoláci ----------
le, upd_le = eurostat("demo_mlexpec.json")
im, upd_im = eurostat("demo_minfind.json")
ed, upd_ed = eurostat("edat_lfse_03.json")
L0, L1 = 1990, max(le["CZ"])
I0, I1 = 1990, max(im["CZ"])
log(f"Eurostat demo_mlexpec aktualizace {upd_le}, demo_minfind {upd_im}, edat_lfse_03 {upd_ed}")
for z in ZEME:
    log(f"Naděje dožití {ZEME[z]}: {L0} {le[z][L0]} → {L1} {le[z][L1]} (+{le[z][L1] - le[z][L0]:.1f} roku)")
for z in ZEME:
    log(f"Kojenecká úmrtnost {ZEME[z]}: {I0} {im[z][I0]} → {I1} {im[z][I1]} ‰")
poradi_le = sorted(ZEME, key=lambda z: -le[z][L1])
log("pořadí naděje dožití", L1, [ZEME[z] for z in poradi_le])
log("pořadí naděje dožití", L0, [ZEME[z] for z in sorted(ZEME, key=lambda z: -le[z][L0])])
log("pořadí kojenecké úmrtnosti (nejnižší první)", I1, [ZEME[z] for z in sorted(ZEME, key=lambda z: im[z][I1])])
log(f"Česko – rozdíl naděje dožití proti Rakousku: {L0} {le['AT'][L0] - le['CZ'][L0]:.1f} → {L1} {le['AT'][L1] - le['CZ'][L1]:.1f} roku")
E1 = max(ed["CZ"])
E0 = max(min(ed[z]) for z in ZEME)
for z in ZEME:
    log(f"VŠ 25–64 {ZEME[z]}: {E0} {ed[z].get(E0)} → {E1} {ed[z][E1]} %")
log("pořadí VŠ 25–64", E1, [ZEME[z] for z in sorted(ZEME, key=lambda z: -ed[z][E1])], "(řada má zlom 2014, ISCED 2011)")

# ---------- graf 1: Česko v % Rakouska ----------
POR = ["CZ", "PL", "HU", "SK", "DE"]
BARVA = {"CZ": CRIMSON, "PL": BLUE, "HU": BLUE, "SK": BLUE, "DE": GREY}
vals1 = []
for z in POR:
    for y, v in sorted(pct_at[z].items()):
        vals1.append(dict(zeme=ZEME[z], rok=y, v=round(v, 1), t=f"{cz(v, 0)}{NB}% Rakouska ({y})",
                          hdp=f"{cz(hdp[z][y], 0)} $"))
konce = []
for z in POR:
    v = pct_at[z][ROK1]
    # popisky blízkých konců (Maďarsko × Slovensko) rozestoupit o 2,5 p. b. nahoru/dolů, hodnota v textu zůstává přesná
    konce.append(dict(zeme=ZEME[z], rok=ROK1, v=v + {"HU": 2.5, "SK": -2.5}.get(z, 0), text=f"{ZEME[z]} {cz(v, 0)}{NB}%"))
x1 = {"field": "rok", "type": "quantitative", "scale": {"domain": [ROK0, 2039]},
      "axis": {"title": None, "format": "d", "grid": False, "domain": False, "ticks": False,
               "values": [1990, 2000, 2010, 2025]}}
y1 = {"field": "v", "type": "quantitative", "scale": {"domain": [20, 110]},
      "axis": {"title": None, "grid": True, "gridColor": MUTED, "domain": False, "ticks": False,
               "values": [20, 40, 60, 80, 100], "labelExpr": f"datum.value + '{NB}%'"}}
col1 = {"field": "zeme", "type": "nominal", "legend": None,
        "scale": {"domain": [ZEME[z] for z in POR], "range": [BARVA[z] for z in POR]}}
tt1 = [{"field": "zeme", "title": "Země"}, {"field": "t", "title": "HDP na obyvatele v PPP"},
       {"field": "hdp", "title": "Na obyvatele"}]
g1 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": {"text": f"{{Česko|{CRIMSON}}} dohání Rakousko, nejrychleji se ale blíží {{Polsko|{BLUE}}}",
              "subtitle": f"HDP na obyvatele v paritě kupní síly v % Rakouska (Rakousko = 100{NB}%), {ROK0}–{ROK1}"},
    "width": "container", "height": 300,
    "config": {"view": {"stroke": None}},
    "data": {"values": vals1},
    "layer": [
        {"mark": {"type": "rule", "color": INK, "strokeDash": [3, 3], "strokeWidth": 1},
         "data": {"values": [{"v": 100}]}, "encoding": {"y": y1}},
        {"mark": {"type": "text", "align": "left", "baseline": "bottom", "dy": -3, "fontSize": 11, "color": INK},
         "data": {"values": [{"v": 100, "rok": ROK0, "t": "Rakousko = 100 %"}]},
         "encoding": {"x": x1, "y": y1,
                      "text": {"field": "t"}}},
        {"transform": [{"filter": "datum.zeme != 'Česko'"}],
         "mark": {"type": "line", "strokeWidth": 1.8, "interpolate": "monotone"},
         "encoding": {"x": x1, "y": y1, "color": col1, "detail": {"field": "zeme"}}},
        {"transform": [{"filter": "datum.zeme == 'Česko'"}],
         "mark": {"type": "line", "strokeWidth": 3.5, "interpolate": "monotone"},
         "encoding": {"x": x1, "y": y1, "color": col1}},
        {"mark": {"type": "point", "filled": True, "size": 60, "opacity": 0},
         "encoding": {"x": x1, "y": y1, "color": col1, "tooltip": tt1}},
        {"data": {"values": konce},
         "mark": {"type": "text", "align": "left", "dx": 6, "fontSize": 11.5, "fontWeight": 700},
         "encoding": {"x": x1, "y": y1,
                      "text": {"field": "text"}, "color": col1}},
        {"data": {"values": [dict(zeme="Česko", rok=ROK0, v=pct_at["CZ"][ROK0], text=f"{cz(pct_at['CZ'][ROK0], 0)}{NB}%")]},
         "mark": {"type": "text", "align": "left", "baseline": "bottom", "dy": -6, "fontSize": 11.5, "fontWeight": 700},
         "encoding": {"x": x1, "y": y1,
                      "text": {"field": "text"}, "color": col1}},
    ],
    "_source": f"Světová banka, [World Development Indicators, NY.GDP.PCAP.PP.CD](https://data.worldbank.org/indicator/NY.GDP.PCAP.PP.CD); výpočet DataTimes",
}

# ---------- graf 2: naděje dožití 1990 × poslední rok ----------
vals2 = []
for z in poradi_le:
    vals2.append(dict(zeme=ZEME[z], tehdy=le[z][L0], dnes=le[z][L1], cesko=z == "CZ",
                      l_tehdy=cz(le[z][L0]), l_dnes=cz(le[z][L1]),
                      t_tehdy=f"{cz(le[z][L0])} roku ({L0})", t_dnes=f"{cz(le[z][L1])} roku ({L1})"))
y2 = {"field": "zeme", "type": "nominal", "sort": None, "axis": None, "scale": {"paddingInner": 0.55, "paddingOuter": 0.6}}
x2 = {"type": "quantitative", "scale": {"domain": [66, 86]},
      "axis": {"title": None, "grid": True, "gridColor": MUTED, "domain": False, "ticks": False,
               "values": [66, 70, 74, 78, 82]}}
tt2 = [{"field": "zeme", "title": "Země"}, {"field": "t_tehdy", "title": str(L0)}, {"field": "t_dnes", "title": str(L1)}]
barva_dnes = {"condition": {"test": "datum.cesko", "value": CRIMSON}, "value": BLUE}
g2 = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": {"text": f"{{Česko|{CRIMSON}}} přidalo od roku 1990 skoro devět let života, Rakousko a Německo míň",
              "subtitle": f"Naděje dožití při narození v letech, obě pohlaví; šedá tečka = {L0}, barevná = {L1}. Německo {L0} včetně bývalé NDR"},
    "width": "container", "height": {"step": 50},
    "config": {"view": {"stroke": None}},
    "data": {"values": vals2},
    "layer": [
        {"mark": {"type": "text", "align": "left", "baseline": "bottom", "dy": -11, "fontSize": 12, "color": "#333333"},
         "encoding": {"y": y2, "x": {"datum": 66, "type": "quantitative", "scale": {"domain": [66, 86]}},
                      "text": {"field": "zeme"}, "fontWeight": {"condition": {"test": "datum.cesko", "value": 700}, "value": 400}}},
        {"mark": {"type": "rule", "strokeWidth": 3, "color": MUTED},
         "encoding": {"y": y2, "x": {**x2, "field": "tehdy"}, "x2": {"field": "dnes"}, "tooltip": tt2}},
        {"mark": {"type": "circle", "size": 140, "opacity": 1, "color": GREY},
         "encoding": {"y": y2, "x": {**x2, "field": "tehdy"}, "tooltip": tt2}},
        {"mark": {"type": "circle", "size": 150, "opacity": 1},
         "encoding": {"y": y2, "x": {**x2, "field": "dnes"}, "color": barva_dnes, "tooltip": tt2}},
        {"mark": {"type": "text", "align": "right", "dx": -10, "fontSize": 11, "color": "#333333"},
         "encoding": {"y": y2, "x": {**x2, "field": "tehdy"}, "text": {"field": "l_tehdy"}}},
        {"mark": {"type": "text", "align": "left", "dx": 10, "fontSize": 11, "fontWeight": 700},
         "encoding": {"y": y2, "x": {**x2, "field": "dnes"}, "text": {"field": "l_dnes"}, "color": barva_dnes}},
    ],
    "_source": f"Eurostat, [demo_mlexpec](https://ec.europa.eu/eurostat/databrowser/view/demo_mlexpec/default/table); výpočet DataTimes",
}

DATA_OUT.mkdir(exist_ok=True)
for name, s in [("sousede-hdp", g1), ("sousede-doziti", g2)]:
    (DATA_OUT / f"{name}.json").write_text(json.dumps(s, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(HERE / "vystup_sousede.txt").write_text("\n".join(out) + "\n", encoding="utf-8")
print("\n".join(out))
