# Jednorázově: obce-mapa.json = obce s predikcí zastupitelstva (volby2026.datatimes.cz) + souřadnice.
# Městské části a obvody se slučují do jednoho bodu města; hlavní zastupitelstvo je první v seznamu.
# python postav_obce.py <souřadnice.json: [{n, lon, lat}]>
import json, os, re, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
coords = {c["n"]: (c["lon"], c["lat"]) for c in json.load(open(sys.argv[1], encoding="utf-8"))}
req = urllib.request.Request("https://volby2026.datatimes.cz/api/universe", headers={"User-Agent": "Mozilla/5.0"})
kv = json.load(urllib.request.urlopen(req))["kv"]

def obec(n):
    if n.startswith("Praha"): return "Praha"
    if n.startswith("Brno"): return "Brno"
    if re.match(r"Plzeň( \d|$)", n): return "Plzeň"
    if n.startswith("Pardubice"): return "Pardubice"
    if n.startswith("Ústí nad Labem"): return "Ústí nad Labem"
    if n in ("Moravská Ostrava a Přívoz", "Slezská Ostrava", "Ostrava-Jih", "Poruba", "Ostrava"): return "Ostrava"
    return n

MAIN = {"Praha": "Praha hl.m."}
out = {}
for u in kv:
    o = obec(u["name"])
    out.setdefault(o, {"n": o, "keys": []})["keys"].append(u["key"])
names = {u["key"]: u["name"] for u in kv}
res = []
for o, v in sorted(out.items()):
    main = MAIN.get(o, o)
    v["keys"].sort(key=lambda k: (names[k] != main, names[k]))
    lon, lat = coords[o]
    res.append({"n": o, "lon": lon, "lat": lat, "keys": v["keys"]})
json.dump(res, open(os.path.join(HERE, "obce-mapa.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("obcí:", len(res), "zastupitelstev:", sum(len(r["keys"]) for r in res))
