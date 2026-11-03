"""Graf výše televizního a rozhlasového poplatku 1991–2026 (data/poplatky.json).

Spuštění z kořene repa: python apps/web/app/clanek/_articles/<slug>/_data_pipeline/grafy.py

Částky (měsíční poplatek domácnosti, nominálně) podle předpisů:
- 1. 4. 1991: vyhláška FMS 100/1991 Sb. (TV 50 Kčs, rozhlas 20 Kčs)
- 1. 4. 1995: zákon 252/1994 Sb. (TV 50 Kč, rozhlas 25 Kč; částky podle přehledu finance.cz, ve Sbírce neověřeno)
- 1. 7. 1997: zákon 135/1997 Sb. (TV 75 Kč, rozhlas 37 Kč)
- 1. 10. 2005, 1. 1. 2007, 1. 1. 2008: zákon 348/2005 Sb. (TV 100 → 120 → 135 Kč, rozhlas 45 Kč)
- 1. 5. 2025: novela Fialovy vlády (TV 150 Kč, rozhlas 55 Kč; MediaGuru 4/2025)
Bez přepočtu na dnešní ceny: lokální řada ČSÚ CEN0101E začíná až rokem 2015.
"""
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "data" / "poplatky.json"

ZMENY = [  # (od, TV, rozhlas)
    ("1991-04-01", 50, 20),
    ("1995-04-01", 50, 25),
    ("1997-07-01", 75, 37),
    ("2005-10-01", 100, 45),
    ("2007-01-01", 120, 45),
    ("2008-01-01", 135, 45),
    ("2025-05-01", 150, 55),
]
KONEC = "2026-11-03"

TV, ROZHLAS = "#de1743", "#06677d"  # brand.6 (karmínová), brandTeal.7
INK, GRID = "#101432", "#d4d4c8"

rows = []
for i, (od, tv, ro) in enumerate(ZMENY):
    do = ZMENY[i + 1][0] if i + 1 < len(ZMENY) else KONEC
    for d in (od, do):
        rows.append({"d": d, "s": "televizní", "v": tv, "od": od})
        rows.append({"d": d, "s": "rozhlasový", "v": ro, "od": od})
konec = [r for r in rows if r["d"] == KONEC]
for r in konec:
    r["lab"] = f"{r['s']} {r['v']} Kč"

spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": {
        "text": "Televizní poplatek se mezi lety 2008 a 2025 nezměnil",
        "subtitle": "Měsíční poplatek domácnosti v korunách (do roku 1992 Kčs), nominálně, podle data účinnosti",
    },
    "width": 600,
    "height": 260,
    "data": {"values": rows},
    "encoding": {
        "x": {"field": "d", "type": "temporal", "axis": {"title": None, "format": "%Y", "tickCount": 8, "grid": False, "domain": False, "ticks": False}},
        "y": {"field": "v", "type": "quantitative", "scale": {"domain": [0, 160]},
              "axis": {"title": None, "tickCount": 4, "gridColor": GRID, "domain": False, "ticks": False}},
        "color": {"field": "s", "type": "nominal", "scale": {"domain": ["televizní", "rozhlasový"], "range": [TV, ROZHLAS]}, "legend": None},
    },
    "layer": [
        {"mark": {"type": "line", "strokeWidth": 3},
         "encoding": {"tooltip": [
             {"field": "s", "type": "nominal", "title": "Poplatek"},
             {"field": "od", "type": "temporal", "title": "Platí od", "format": "%-d. %-m. %Y"},
             {"field": "v", "type": "quantitative", "title": "Kč měsíčně"}]}},
        {"transform": [{"filter": "datum.lab"}],
         "mark": {"type": "text", "align": "right", "dx": -4, "dy": -10, "fontSize": 12.5, "fontWeight": "bold"},
         "encoding": {"text": {"field": "lab"}}},
    ],
    "_source": "Sbírka zákonů (100/1991, 252/1994, 135/1997, 348/2005 Sb.), finance.cz, MediaGuru",
}
OUT.parent.mkdir(exist_ok=True)
OUT.write_text(json.dumps(spec, ensure_ascii=False, indent=1), encoding="utf-8")
print("zapsáno", OUT, len(rows), "řádků")
