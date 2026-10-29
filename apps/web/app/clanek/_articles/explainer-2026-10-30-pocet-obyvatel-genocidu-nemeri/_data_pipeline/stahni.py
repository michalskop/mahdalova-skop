"""Stáhne celkový počet obyvatel zemí (World Bank WDI, ukazatel SP.POP.TOTL, vychází z UN World Population Prospects)
do zdroj/worldbank_SP.POP.TOTL.json. Spuštění: python -I stahni.py
"""
import json
import sys
import urllib.request
from datetime import date
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ZDROJ = Path(__file__).parent / "zdroj"
ZDROJ.mkdir(exist_ok=True)

# Kambodža, Rwanda, Bosna a Hercegovina, Irák, Súdán, Myanmar, Guatemala, Západní břeh a Gaza
ZEME = "KHM;RWA;BIH;IRQ;SDN;MMR;GTM;PSE"
URL = f"https://api.worldbank.org/v2/country/{ZEME}/indicator/SP.POP.TOTL?format=json&per_page=2000&date=1960:2025"

with urllib.request.urlopen(URL, timeout=300) as r:
    meta, radky = json.load(r)
data = {}
for x in radky:
    if x["value"] is not None:
        data.setdefault(x["countryiso3code"], {})[int(x["date"])] = x["value"]
out = {"zdroj": URL, "stazeno": date.today().isoformat(), "posledni_aktualizace_wb": meta.get("lastupdated"),
       "data": {k: dict(sorted(v.items())) for k, v in sorted(data.items())}}
(ZDROJ / "worldbank_SP.POP.TOTL.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
for k, v in out["data"].items():
    print(k, min(v), max(v), len(v))
