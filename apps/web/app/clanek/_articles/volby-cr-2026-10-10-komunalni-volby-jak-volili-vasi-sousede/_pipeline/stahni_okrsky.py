# Stáhne hranice volebních okrsků pro komunální volby 2026 z GIS ČSÚ
# (vrstva „Volební okrsky ZO2026“, stav 8. 9. 2026, generalizovaná vrstva 1) do raw/okrsky_zo2026.geojson.
# Spuštění: python stahni_okrsky.py
import json, os, urllib.parse, urllib.request

URL = "https://geodata.csu.gov.cz/server/rest/services/Hosted/Volební_okrsky_ZO2026/FeatureServer/1/query"
OUT = os.path.join(os.path.dirname(__file__), "raw", "okrsky_zo2026.geojson")
STEP = 2000

feats, off = [], 0
while True:
    q = urllib.parse.urlencode({
        "where": "1=1", "outFields": "kod,cislo,kod_mco,naz_mco,kod_obec,naz_obec",
        "outSR": 4326, "f": "geojson", "resultOffset": off, "resultRecordCount": STEP,
        "orderByFields": "objectid",
    })
    with urllib.request.urlopen(f"{urllib.parse.quote(URL, safe=':/')}?{q}", timeout=300) as r:
        page = json.load(r)
    got = page.get("features", [])
    feats += got
    print(f"offset {off}: {len(got)} (celkem {len(feats)})")
    if len(got) < STEP:
        break
    off += STEP

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump({"type": "FeatureCollection", "features": feats}, f, ensure_ascii=False)
print("uloženo", OUT, len(feats))
