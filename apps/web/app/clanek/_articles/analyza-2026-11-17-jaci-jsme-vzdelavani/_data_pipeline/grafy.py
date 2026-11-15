"""Grafy kapitoly „Vzdělávání“. Čísla bere výhradně z vypocet.py (primární tabulky ČSÚ).

Spuštění: python grafy.py   → ../data/*.json (Vega-Lite) + vystup.txt (všechna čísla z textu i grafů)
"""
import json
from pathlib import Path

import vypocet as V

HERE = Path(__file__).resolve().parent
DATA = HERE.parent / "data"
CRIMSON, BLUE, GREY, INK, MUTED = "#de1743", "#6267a3", "#bcbcb0", "#101432", "#c9c9bd"
ZENY, MUZI = "#f76800", "#06677d"  # paleta pro srovnání žen a mužů (nikdy růžová × modrá)
NB = " "
ZDROJ = "https://csu.gov.cz/produkty/cesko-od-roku-1989-v-cislech-aktualizace-27-8-2026"
log = list(V.LOG)


def cz(x, d=1):
    return f"{x:,.{d}f}".replace(",", NB).replace(".", ",")


def spec(title, subtitle, values, layers, step=34, source="", height=None):
    s = {"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
         "title": {"text": title, "subtitle": subtitle},
         "width": "container", "height": height if height else {"step": step},
         "config": {"view": {"stroke": None}}, "data": {"values": values}, "layer": layers, "_source": source}
    return s


def cinka(nazev, radky, osa, jednotka, title, subtitle, source, fmt=1):
    """Činkový graf (vzor pilotu): šedomodrá tečka = tehdy, karmínová = dnes, názvy řádků nad čarou."""
    vals = []
    for lab, (r0, v0), (r1, v1) in radky:
        vals.append(dict(ukazatel=lab, tehdy=v0, dnes=v1, t_tehdy=f"{cz(v0, fmt)}{NB}{jednotka} ({r0})",
                         t_dnes=f"{cz(v1, fmt)}{NB}{jednotka} ({r1})", l_tehdy=cz(v0, fmt), l_dnes=cz(v1, fmt),
                         vlevo_dnes=v1 < v0))
        log.append(f"GRAF {nazev}: {lab} {r0} {v0} → {r1} {v1}")
    y = {"field": "ukazatel", "type": "nominal", "sort": None, "axis": None,
         "scale": {"paddingInner": 0.55, "paddingOuter": 0.6}}
    krok = 10
    x = {"type": "quantitative", "scale": {"domain": osa},
         "axis": {"title": None, "grid": True, "gridColor": "#d4d4c8", "domain": False, "ticks": False,
                  "values": list(range(0, osa[1] + 1, krok)), "labelExpr": f"datum.value + '{NB}%'"}}
    tt = [{"field": "ukazatel", "title": "Ukazatel"}, {"field": "t_tehdy", "title": "Tehdy"}, {"field": "t_dnes", "title": "Dnes"}]
    lab = lambda filt, pole, align, dx, barva, tucne: {
        "transform": [{"filter": filt}],
        "mark": {"type": "text", "align": align, "dx": dx, "fontSize": 11, "color": barva, **({"fontWeight": 700} if tucne else {})},
        "encoding": {"y": y, "x": {**x, "field": pole}, "text": {"field": "l_" + pole}}}
    layers = [
        {"mark": {"type": "text", "align": "left", "baseline": "bottom", "dy": -11, "fontSize": 12, "color": "#333333"},
         "encoding": {"y": y, "x": {"datum": osa[0], "type": "quantitative", "scale": {"domain": osa}}, "text": {"field": "ukazatel"}}},
        {"mark": {"type": "rule", "strokeWidth": 3, "color": GREY},
         "encoding": {"y": y, "x": {**x, "field": "tehdy"}, "x2": {"field": "dnes"}, "tooltip": tt}},
        {"mark": {"type": "circle", "size": 150, "opacity": 1, "color": BLUE}, "encoding": {"y": y, "x": {**x, "field": "tehdy"}, "tooltip": tt}},
        {"mark": {"type": "circle", "size": 150, "opacity": 1, "color": CRIMSON}, "encoding": {"y": y, "x": {**x, "field": "dnes"}, "tooltip": tt}},
        lab("!datum.vlevo_dnes", "tehdy", "right", -10, BLUE, False), lab("!datum.vlevo_dnes", "dnes", "left", 10, CRIMSON, True),
        lab("datum.vlevo_dnes", "tehdy", "left", 10, BLUE, False), lab("datum.vlevo_dnes", "dnes", "right", -10, CRIMSON, True),
    ]
    return spec(title, subtitle, vals, layers, step=52, source=source)


# ---------- Graf 1: ženy předstihly muže (VŠPS) ----------
v1 = []
for pohl, rada in V.VSPS.items():
    for rok, hod in sorted(rada.items()):
        v1.append(dict(rok=rok, pohlavi=pohl, podil=round(hod, 1), t=f"{cz(hod)}{NB}%"))
r0, r1 = V.C["vsps_rok_od"], V.C["vsps_rok_do"]
konce = [d for d in v1 if d["rok"] in (r0, r1)]
for d in konce:
    log.append(f"GRAF vs-zeny-muzi: {d['pohlavi']} {d['rok']} {d['podil']}")
x1 = {"field": "rok", "type": "quantitative", "scale": {"domain": [r0, r1]},
      "axis": {"title": None, "format": "d", "grid": False, "domain": False, "ticks": False, "values": [1993, 2000, 2010, 2017, 2025]}}
y1 = {"field": "podil", "type": "quantitative", "scale": {"domain": [0, 27]},
      "axis": {"title": None, "grid": True, "gridColor": "#d4d4c8", "domain": False, "ticks": False, "values": [0, 5, 10, 15, 20, 25],
               "labelExpr": f"datum.value + '{NB}%'"}}
barva = {"field": "pohlavi", "type": "nominal", "legend": None, "scale": {"domain": ["ženy", "muži"], "range": [ZENY, MUZI]}}
g1 = spec(f"Od roku {V.C['vsps_zeny_predstihly_podil']} mají vysokou školu častěji {{ženy|{ZENY}}} než {{muži|{MUZI}}}",
          f"Podíl lidí s vysokoškolským vzděláním mezi obyvateli staršími 15 let v %, {r0}–{r1}",
          v1, [
              {"mark": {"type": "rule", "color": INK, "strokeDash": [3, 3], "opacity": 0.5},
               "data": {"values": [{"rok": V.C["vsps_zeny_predstihly_podil"]}]}, "encoding": {"x": x1}},
              {"mark": {"type": "line", "strokeWidth": 2.5, "interpolate": "monotone"},
               "encoding": {"x": x1, "y": y1, "color": barva,
                            "tooltip": [{"field": "pohlavi", "title": "Pohlaví"}, {"field": "rok", "title": "Rok"}, {"field": "t", "title": "Podíl"}]}},
              {"transform": [{"filter": f"datum.rok == {r0}"}],
               "mark": {"type": "text", "align": "left", "dx": 2, "dy": -10, "fontSize": 11, "fontWeight": 700},
               "encoding": {"x": x1, "y": y1, "color": barva, "text": {"field": "t"}}},
              {"transform": [{"filter": f"datum.rok == {r1}"}, {"calculate": f"datum.pohlavi + ' {NB}' + datum.t", "as": "l"}],
               "mark": {"type": "text", "align": "right", "dx": -2, "fontSize": 12, "fontWeight": 700},
               "encoding": {"x": x1, "y": y1, "color": barva, "text": {"field": "l"},
                            "yOffset": {"condition": {"test": "datum.pohlavi == 'ženy'", "value": -18}, "value": 30}}},
          ], height=260,
          source=f"ČSÚ, [Česko od roku 1989 v číslech, Tab. 01.04]({ZDROJ}) (Výběrové šetření pracovních sil)")

# ---------- Graf 2: struktura vzdělání 1991 × 2021 (sčítání) ----------
g2 = cinka("struktura-vzdelani",
           [(lab, (1991, V.C[f"{k}_1991"]), (2021, V.C[f"{k}_2021"])) for lab, k in V.SCITANI_STRUKTURA],
           [0, 50], "%",
           f"Vysokou školu mělo v {{roce 1991|{BLUE}}} {round(V.C['sc_vs_celkem_1991'])}{NB}% dospělých, v {{roce 2021|{CRIMSON}}} {round(V.C['sc_vs_celkem_2021'])}{NB}%",
           f"Nejvyšší ukončené vzdělání obyvatel starších 15 let v %, sčítání lidu; podíly ze zjištěných hodnot (nezjištěno 1991: 1{NB}%, 2021: 6{NB}%)",
           f"ČSÚ, [Česko od roku 1989 v číslech, Tab. 01.03]({ZDROJ}) (sčítání lidu)")

# ---------- Graf 3: studenti VŠ, Češi × cizinci ----------
v3 = []
for rok, (cesi, ciz) in sorted(V.VS_RADA.items()):
    celk = cesi + ciz
    v3 += [dict(rok=rok, skupina="s českým občanstvím", n=cesi, poradi=1, celk=celk,
                t_c=f"{cz(cesi, 0)}", t_z=f"{cz(ciz, 0)} ({cz(100 * ciz / celk)}{NB}%)", t_celk=cz(celk, 0)),
           dict(rok=rok, skupina="cizinci", n=ciz, poradi=2, celk=celk,
                t_c=f"{cz(cesi, 0)}", t_z=f"{cz(ciz, 0)} ({cz(100 * ciz / celk)}{NB}%)", t_celk=cz(celk, 0))]
R = V.C["vs_rok_dnes"]
x3 = {"field": "rok", "type": "ordinal", "axis": {"title": None, "domain": False, "ticks": False, "labelAngle": 0,
                                                   "values": [1989, 2000, 2010, 2020, R]}}
tt3 = [{"field": "rok", "title": "Rok"}, {"field": "t_celk", "title": "Studenti celkem"},
       {"field": "t_c", "title": "s českým občanstvím"}, {"field": "t_z", "title": "cizinci"}]
g3 = spec(f"Vysokoškoláků je skoro třikrát víc než v roce 1989 a víc než šestina z nich jsou {{cizinci|{CRIMSON}}}",
          f"Studenti veřejných a soukromých vysokých škol k 31.{NB}12., 1989–{R}; šedě s českým občanstvím, červeně cizinci",
          v3, [
              {"mark": {"type": "bar", "width": {"band": 0.8}},
               "encoding": {"x": x3, "y": {"field": "n", "type": "quantitative", "stack": "zero", "scale": {"domain": [0, 440000]},
                                           "axis": {"title": None, "grid": True, "gridColor": "#d4d4c8", "domain": False, "ticks": False,
                                                    "values": [0, 100000, 200000, 300000, 400000], "format": ",d"}},
                            "color": {"field": "skupina", "type": "nominal", "legend": None,
                                      "scale": {"domain": ["s českým občanstvím", "cizinci"], "range": [MUTED, CRIMSON]}},
                            "order": {"field": "poradi"}, "tooltip": tt3}},
              {"transform": [{"filter": f"datum.skupina == 'cizinci' && (datum.rok == 1989 || datum.rok == {V.C['vs_studenti_vrchol_rok']} || datum.rok == {R})"}],
               "mark": {"type": "text", "baseline": "bottom", "dy": -4, "fontSize": 11, "fontWeight": 700, "color": INK},
               "encoding": {"x": x3, "y": {"field": "celk", "type": "quantitative"}, "text": {"field": "t_celk"}}},
          ], height=260,
          source=f"MŠMT podle ČSÚ, [Česko od roku 1989 v číslech, Tab. 12.06]({ZDROJ})")
for r in (1989, V.C["vs_studenti_vrchol_rok"], R):
    c, z = V.VS_RADA[r]
    log.append(f"GRAF studenti: {r} celkem {c + z}, Češi {c}, cizinci {z}")

DATA.mkdir(exist_ok=True)
for name, s in [("vysokoskolacky-a-vysokoskolaci", g1), ("struktura-vzdelani", g2), ("studenti-vs", g3)]:
    (DATA / f"{name}.json").write_text(json.dumps(s, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(HERE / "vystup.txt").write_text("\n".join(log) + "\n", encoding="utf-8")
print("\n".join(l for l in log if l.startswith("GRAF")))
