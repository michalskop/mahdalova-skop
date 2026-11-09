"""Donor charts for the US midterms article (data/darci-tabory.json, data/darci-top6.json).

Source (read in full): Al Jazeera, "Tracking the money: The biggest donors in the 2026 US midterm elections",
27 Oct 2026, based on FEC data; 50 largest donors and organisations, totals "so far" (no cutoff date given).
https://www.aljazeera.com/news/2026/10/27/tracking-the-money-the-biggest-donors-in-the-2026-us-midterm-elections
Run: python _data_pipeline/darci.py (from the article folder).
"""
import json
from pathlib import Path

RED, BLUE, GREY = "#de1743", "#5e66d5", "#a9b5f0"  # brand.6 Republican-aligned, brandRoyalBlue.5 Democratic-aligned, brandRoyalBlue.2 other
SRC = "[Al Jazeera podle dat FEC, 27. 10. 2026](https://www.aljazeera.com/news/2026/10/27/tracking-the-money-the-biggest-donors-in-the-2026-us-midterm-elections), 50 největších dárců a organizací."
OUT = Path(__file__).resolve().parent.parent / "data"


def bars(title, subtitle, rows, domain, fmt_label, height):
    order = [r["n"] for r in rows]
    return {
        "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
        "title": {"text": title, "subtitle": subtitle},
        "width": 600,
        "height": height,
        "data": {"values": rows},
        "encoding": {"y": {"field": "n", "type": "nominal", "sort": order,
                           "axis": {"title": None, "ticks": False, "domain": False, "labelFontSize": 12, "labelLimit": 260}}},
        "layer": [
            {"mark": {"type": "bar", "cornerRadiusEnd": 2, "height": 22},
             "encoding": {"x": {"field": "v", "type": "quantitative", "scale": {"domain": domain},
                                "axis": {"title": None, "grid": True, "gridColor": "#e8e3d2"}},
                          "color": {"field": "barva", "type": "nominal", "scale": None},
                          "tooltip": [{"field": "n", "title": "Dárce"}, {"field": "popisek", "title": "Částka"}, {"field": "tabor", "title": "Napojení"}]}},
            {"mark": {"type": "text", "align": "left", "dx": 5, "fontSize": 12, "fontWeight": "bold", "color": "#333333"},
             "encoding": {"x": {"field": "v", "type": "quantitative"}, "text": {"field": "popisek"}}},
        ],
        "_source": SRC,
    }


tabory = [
    {"n": "Skupiny napojené na republikány", "v": 1670, "popisek": "1,67 mld. USD (60 %)", "tabor": "republikáni", "barva": RED},
    {"n": "Skupiny napojené na demokraty", "v": 832, "popisek": "832 mil. USD (30 %)", "tabor": "demokraté", "barva": BLUE},
    {"n": "Obě strany a zájmové organizace", "v": 264, "popisek": "264 mil. USD (10 %)", "tabor": "ostatní", "barva": GREY},
]
assert sum(r["v"] for r in tabory) in (2766, 2770)  # article: 2.77 bn in total (rounded parts)

top6 = [
    {"n": "Elon Musk", "v": 446, "tabor": "republikáni"},
    {"n": "Elizabeth a Richard Uihleinovi", "v": 150, "tabor": "republikáni"},
    {"n": "Jeff a Janine Yassovi", "v": 110, "tabor": "republikáni"},
    {"n": "George Soros", "v": 102, "tabor": "demokraté"},
    {"n": "Mike Bloomberg", "v": 84, "tabor": "demokraté"},
    {"n": "Reid Hoffman a Michelle Yee", "v": 41, "tabor": "demokraté"},
]
for r in top6:
    r["popisek"] = f"{r['v']} mil. USD"
    r["barva"] = RED if r["tabor"] == "republikáni" else BLUE

specs = {
    "darci-tabory.json": bars("Republikánský tábor dostal od největších dárců dvakrát víc než demokratický",
                              "Příspěvky 50 největších dárců a organizací v kampani 2026, miliony dolarů. Celkem 2,77 miliardy.",
                              tabory, [0, 1800], None, 120),
    "darci-top6.json": bars("Musk sám dal víc než tři největší demokratičtí dárci dohromady",
                            "Největší individuální dárci kampaně 2026, miliony dolarů. Červeně napojení na republikány, modře na demokraty.",
                            top6, [0, 500], None, 230),
}
for name, spec in specs.items():
    (OUT / name).write_text(json.dumps(spec, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("wrote", name)
