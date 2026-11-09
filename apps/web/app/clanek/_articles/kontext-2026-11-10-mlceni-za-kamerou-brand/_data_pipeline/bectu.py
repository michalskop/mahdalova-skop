"""Bectu 2024 survey chart (data/bectu-2024.json).

Source: Bectu press release, 30 May 2024 (read in full):
https://bectu.org.uk/news/bectu-calls-on-creative-industries-to-get-behind-independent-standards-authority-as-9-in-10-creative-workers-say-they-have-been-sexually-harassed-at-work
Respondents: 225 creative-industry workers, survey run in May 2024 (Screen Global Production, 3 June 2024).
The release gives some values only verbally ("six in ten", "one in five", "more than 60%");
those bars use the verbal value (60, 20, 60) and the label keeps the original wording.
Run: python _data_pipeline/bectu.py (from the article folder).
"""
import json
from pathlib import Path

RED, NAVY = "#de1743", "#101432"
ROWS = [
    # (label, value %, label text, wording in the release, colour)
    ("Zažili nebo viděli šikanu či obtěžování kvůli pohlaví", 92, "92 %", "92% ... witnessed or experienced bullying or harassment on grounds of their sex or gender", NAVY),
    ("Zažili nebo viděli sexuální obtěžování", 85, "85 %", "85 per cent ... experienced or witnessed an incident of sexual harassment", NAVY),
    ("Zažili nechtěné dotyky, objetí či polibky", 60, "6 z 10", "six in ten ... experienced unwanted and/or inappropriate touching, hugging or kissing", NAVY),
    ("Zažili vážné sexuální napadení v práci", 20, "1 z 5", "One in five ... have experienced a serious sexual assault while at work", NAVY),
    ("Nenahlásili ze strachu o kariéru", 60, "přes 60 %", "More than 60% chose not to report an incident because they were worried it would negatively impact their career", RED),
    ("Věří, že odvětví účinně jedná", 13, "13 %", "just 13% ... confident that the industry is taking effective action", RED),
]

spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "title": {
        "text": "Přes 60 % dotázaných obtěžování nenahlásilo ze strachu o kariéru",
        "subtitle": "Průzkum odborového svazu Bectu mezi 225 lidmi z britských kreativních odvětví, květen 2024. Podíl dotázaných v %. Nejde o reprezentativní vzorek.",
    },
    "width": 600,
    "height": 300,
    "data": {"values": [{"otazka": l, "v": v, "popisek": t, "zneni": w, "barva": c} for l, v, t, w, c in ROWS]},
    "encoding": {
        "y": {"field": "otazka", "type": "nominal", "sort": [r[0] for r in ROWS],
              "axis": {"title": None, "ticks": False, "domain": False, "labelFontSize": 12, "labelLimit": 330}}
    },
    "layer": [
        {
            "mark": {"type": "bar", "cornerRadiusEnd": 2, "height": 22},
            "encoding": {
                "x": {"field": "v", "type": "quantitative", "scale": {"domain": [0, 100]},
                      "axis": {"title": None, "grid": True, "gridColor": "#e8e3d2", "values": [0, 25, 50, 75, 100], "labelExpr": "datum.value + ' %'"}},
                "color": {"field": "barva", "type": "nominal", "scale": None},
                "tooltip": [{"field": "otazka", "title": "Otázka"}, {"field": "popisek", "title": "Podíl"}, {"field": "zneni", "title": "Znění v tiskové zprávě Bectu"}],
            },
        },
        {
            "mark": {"type": "text", "align": "left", "dx": 5, "fontSize": 12, "fontWeight": "bold", "color": "#333333"},
            "encoding": {"x": {"field": "v", "type": "quantitative"}, "text": {"field": "popisek"}},
        },
    ],
    "_source": "[Bectu, tisková zpráva 30. 5. 2024](https://bectu.org.uk/news/bectu-calls-on-creative-industries-to-get-behind-independent-standards-authority-as-9-in-10-creative-workers-say-they-have-been-sexually-harassed-at-work); počet dotázaných [Screen Global Production](https://www.screenglobalproduction.com/news/2024/06/03/uk-creative-industry-workers-sexual-assault-survey). Hodnoty „6 z 10“, „1 z 5“ a „přes 60 %“ zpráva uvádí jen slovně.",
}

out = Path(__file__).resolve().parent.parent / "data" / "bectu-2024.json"
out.write_text(json.dumps(spec, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("wrote", out)
