"""Grafy kapitoly „Bydlení“. Čísla bere výhradně z vypocet.py (primární data ČSÚ).

Spuštění: python grafy.py   → ../data/*.json (Vega-Lite) + vystup.txt (všechna čísla z textu i grafů)
"""
import json
from pathlib import Path

import vypocet as V

HERE = Path(__file__).resolve().parent
DATA = HERE.parent / "data"
CRIMSON, BLUE, GREY, INK, MUTED = "#de1743", "#6267a3", "#bcbcb0", "#101432", "#c9c9bd"
NB = " "
ZDROJ = "https://csu.gov.cz/produkty/cesko-od-roku-1989-v-cislech-aktualizace-27-8-2026"
log = list(V.LOG)


def cz(x, d=1):
    return f"{x:,.{d}f}".replace(",", NB).replace(".", ",")


def spec(title, subtitle, values, layers, step=34, source="", height=None):
    return {"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "title": {"text": title, "subtitle": subtitle},
            "width": "container", "height": height if height else {"step": step},
            "config": {"view": {"stroke": None}}, "data": {"values": values}, "layer": layers, "_source": source}


def sloupce(nazev, rada, zvyraznit, ypopisky, ydomena, title, subtitle, source, fmt=0, predbezne=(), jednotka=""):
    """Sloupce po letech: zvýrazněné roky barevně, ostatní tlumeně, hodnota nad zvýrazněnými."""
    vals = []
    for rok, v in sorted(rada.items()):
        barva = zvyraznit.get(rok, MUTED)
        vals.append(dict(rok=rok, v=round(v, 1), barva=barva, popisek=cz(v, fmt) if rok in zvyraznit else "",
                         t=f"{cz(v, fmt)}{(NB + jednotka) if jednotka else ''}" + (" (předběžně)" if rok in predbezne else ""),
                         op=0.55 if rok in predbezne else 1))
    for rok in zvyraznit:
        log.append(f"GRAF {nazev}: {rok} {round(rada[rok], 1)}")
    x = {"field": "rok", "type": "ordinal", "axis": {"title": None, "domain": False, "ticks": False, "labelAngle": 0,
                                                    "values": sorted(set([min(rada)] + list(zvyraznit) + [max(rada)]) - set(predbezne))}}
    y = {"field": "v", "type": "quantitative", "scale": {"domain": ydomena},
         "axis": {"title": None, "grid": True, "gridColor": "#d4d4c8", "domain": False, "ticks": False, "values": ypopisky, "format": ",d"}}
    tt = [{"field": "rok", "title": "Rok"}, {"field": "t", "title": nazev}]
    return spec(title, subtitle, vals, [
        {"mark": {"type": "bar", "width": {"band": 0.8}},
         "encoding": {"x": x, "y": y, "color": {"field": "barva", "type": "nominal", "scale": None, "legend": None},
                      "opacity": {"field": "op", "type": "quantitative", "scale": None}, "tooltip": tt}},
        {"mark": {"type": "text", "baseline": "bottom", "dy": -4, "fontSize": 11, "fontWeight": 700, "color": INK},
         "encoding": {"x": x, "y": y, "text": {"field": "popisek"}}},
    ], height=240, source=source)


# ---------- Graf 1: dokončené byty ----------
g1 = sloupce("Dokončené byty", V.BYTY_RADA, {1989: BLUE, V.POSL: CRIMSON}, [0, 20000, 40000, 60000], [0, 62000],
             f"V {{roce 2024|{CRIMSON}}} se dokončilo o {round(-V.C['byty_zmena_pct'])}{NB}% méně bytů než v {{roce 1989|{BLUE}}}",
             f"Počet dokončených bytů za rok, 1989–{V.PRED}; {V.PRED} předběžně (nově z registru RÚIAN)",
             f"ČSÚ, [Česko od roku 1989 v číslech, Tab. 11.01]({ZDROJ})", predbezne=(V.PRED,), jednotka="bytů")

# ---------- Graf 2: právní důvod užívání bytu 1991 × 2021 ----------
c91, c21 = V.UZIV_CELK
vals2 = []
for lab, a, b in V.UZIV:
    p0, p1 = 100 * a / c91, 100 * b / c21
    vals2.append(dict(ukazatel=lab, tehdy=round(p0, 1), dnes=round(p1, 1), l_tehdy=cz(p0), l_dnes=cz(p1),
                      t_tehdy=f"{cz(p0)}{NB}% ({cz(a, 0)} bytů, 1991)", t_dnes=f"{cz(p1)}{NB}% ({cz(b, 0)} bytů, 2021)",
                      vlevo_dnes=p1 < p0, sipka=abs(p1 - p0) >= 4))
    log.append(f"GRAF uzivani: {lab} 1991 {round(p0, 1)} → 2021 {round(p1, 1)}")
osa = [0, 50]
y2 = {"field": "ukazatel", "type": "nominal", "sort": None, "axis": None, "scale": {"paddingInner": 0.55, "paddingOuter": 0.6}}
x2 = {"type": "quantitative", "scale": {"domain": osa},
      "axis": {"title": None, "grid": True, "gridColor": "#d4d4c8", "domain": False, "ticks": False,
               "values": [0, 10, 20, 30, 40, 50], "labelExpr": f"datum.value + '{NB}%'"}}
tt2 = [{"field": "ukazatel", "title": "Právní důvod"}, {"field": "t_tehdy", "title": "1991"}, {"field": "t_dnes", "title": "2021"}]


def sipka(filt, tvar, posun):
    """Hrot šipky na spojnici těsně před červeným (novějším) bodem; jen kde jsou body dost daleko od sebe
    (Kateřina 17. 11. 2026: šipka ukáže směr změny, u blízkých bodů žádná)."""
    return {"transform": [{"filter": f"datum.sipka && ({filt})"}],
            "mark": {"type": "point", "shape": tvar, "filled": True, "size": 110, "color": GREY, "opacity": 1, "xOffset": posun},
            "encoding": {"y": y2, "x": {**x2, "field": "dnes"}}}


def lab2(filt, pole, align, dx, barva, tucne):
    return {"transform": [{"filter": filt}],
            "mark": {"type": "text", "align": align, "dx": dx, "fontSize": 11, "color": barva, **({"fontWeight": 700} if tucne else {})},
            "encoding": {"y": y2, "x": {**x2, "field": pole}, "text": {"field": "l_" + pole}}}


g2 = spec(f"Byty v osobním vlastnictví tvořily v {{roce 1991|{BLUE}}} necelé procento, v {{roce 2021|{CRIMSON}}} čtvrtinu",
          f"Obydlené byty podle právního důvodu užívání v % všech obydlených bytů, sčítání lidu; v roce 2021 u 7,5{NB}% bytů důvod nezjištěn",
          vals2, [
              {"mark": {"type": "text", "align": "left", "baseline": "bottom", "dy": -11, "fontSize": 12, "color": "#333333"},
               "encoding": {"y": y2, "x": {"datum": 0, "type": "quantitative", "scale": {"domain": osa}}, "text": {"field": "ukazatel"}}},
              {"mark": {"type": "rule", "strokeWidth": 3, "color": GREY}, "encoding": {"y": y2, "x": {**x2, "field": "tehdy"}, "x2": {"field": "dnes"}, "tooltip": tt2}},
              sipka("!datum.vlevo_dnes", "triangle-right", -14), sipka("datum.vlevo_dnes", "triangle-left", 14),
              {"mark": {"type": "circle", "size": 150, "opacity": 1, "color": BLUE}, "encoding": {"y": y2, "x": {**x2, "field": "tehdy"}, "tooltip": tt2}},
              {"mark": {"type": "circle", "size": 150, "opacity": 1, "color": CRIMSON}, "encoding": {"y": y2, "x": {**x2, "field": "dnes"}, "tooltip": tt2}},
              lab2("!datum.vlevo_dnes", "tehdy", "right", -10, BLUE, False), lab2("!datum.vlevo_dnes", "dnes", "left", 10, CRIMSON, True),
              lab2("datum.vlevo_dnes", "tehdy", "left", 10, BLUE, False), lab2("datum.vlevo_dnes", "dnes", "right", -10, CRIMSON, True),
          ], step=52,
          source="ČSÚ, [sčítání 1991, Tab. 3.2.1](https://csu.gov.cz/docs/107508/b6572b80-7764-9edc-4de2-fb29747532a8/4131_3_2_1.pdf) "
                 "a [sčítání 2021, otevřená data](https://csu.gov.cz/produkty/vysledky-scitani-2021-otevrena-data); výpočet DataTimes")

# ---------- Graf 3: byt 60 m² v hrubých mzdách ----------
g3 = sloupce("Byt 60 m² v hrubých mzdách", V.BYT60, {V.C["cena_rok_od"]: MUTED, 2022: MUTED, 2025: CRIMSON}, [0, 25, 50, 75, 100], [0, 110],
             f"Průměrný byt o 60{NB}m² stojí {{{round(V.BYT60[2025])} hrubých měsíčních mezd|{CRIMSON}}}, v roce 2019 to bylo {round(V.BYT60[2019])}",
             f"Cena bytu o 60{NB}m² za průměrnou kupní cenu bytů v Česku, vydělená průměrnou hrubou měsíční mzdou, 2019–2025",
             f"ČSÚ, [průměrné kupní ceny nemovitostí (data ČÚZK)](https://csu.gov.cz/ceny-nemovitosti) a [Tab. 13.07]({ZDROJ}); výpočet DataTimes",
             jednotka="mezd")
for y in (2019, 2022, 2025):  # zvýrazněné popisky: ověřit, že sedí s textem
    assert round(V.BYT60[y]) in (68, 93, 89)

DATA.mkdir(exist_ok=True)
for name, s in [("dokoncene-byty", g1), ("pravni-duvod-uzivani", g2), ("byt-v-mzdach", g3)]:
    (DATA / f"{name}.json").write_text(json.dumps(s, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(HERE / "vystup.txt").write_text("\n".join(log) + "\n", encoding="utf-8")
print("\n".join(l for l in log if l.startswith("GRAF")))
