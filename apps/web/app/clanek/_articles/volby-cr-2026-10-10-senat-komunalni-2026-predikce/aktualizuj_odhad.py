# Stáhne aktuální odhad z volby2026.datatimes.cz/api/latest a uloží ho vedle článku:
#   odhad.json     – Senát (27 obvodů)
#   odhad_kv.json  – zastupitelstva (184), zkrácené na to, co ukazuje mapa obcí
# Web volby2026.datatimes.cz neposílá CORS hlavičky, proto se data do článku kopírují tímto skriptem
# (a pak commit + push). Spuštění: python aktualizuj_odhad.py
import json, os, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = "https://volby2026.datatimes.cz/api/"
KEEP = ("no", "name", "party", "counted_share", "est_share", "sd", "p_win_round1", "p_top2")

def get(path):
    req = urllib.request.Request(BASE + path, headers={"User-Agent": "Mozilla/5.0 (DataTimes clanek volby-2026-predikce)", "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

d = get("latest")

# --- Senát ---
se = {}
for ob, v in d["se"].items():
    x = {k: v[k] for k in ("status", "n_total", "n_counted", "frac_counted", "p_decided_round1", "reliability") if k in v}
    if "candidates" in v:
        x["candidates"] = [{k: c[k] for k in KEEP if k in c} for c in v["candidates"]]
    se[ob] = x
json.dump({"generated": d["generated"], "se": se}, open(os.path.join(HERE, "odhad.json"), "w", encoding="utf-8"),
          ensure_ascii=False, separators=(",", ":"))

# --- Zastupitelstva ---
# barvy kandidátek jsou jen v /api/universe
colors = {}
for u in get("universe")["kv"]:
    for l in u.get("lists", []):
        colors[(u["key"], l["no"])] = l.get("color")

r3 = lambda x: round(x, 3)
kv = {}
for key, v in d["kv"].items():
    x = {"n": v["name"], "seats": v.get("seats"), "st": v.get("status"), "frac": r3(v.get("frac_counted", 0)),
         "nc": v.get("n_counted", 0), "nt": v.get("n_total", 0), "rel": v.get("reliability")}
    lists = []
    for l in v.get("lists", []):
        if "est_share" not in l:
            continue
        dist = l.get("seats_dist") or []
        lists.append({"a": l.get("abbr"), "nm": l.get("name"), "c": colors.get((key, l["no"])),
                      "e": r3(l["est_share"]), "lo": r3(l.get("lo90", 0)), "hi": r3(l.get("hi90", 0)),
                      "s": l.get("seats_mode", 0), "ps": r3(max(dist)) if dist else None})
    lists.sort(key=lambda l: -l["e"])
    if lists:
        x["l"] = lists
    kv[key] = x
json.dump({"generated": d["generated"], "kv": kv}, open(os.path.join(HERE, "odhad_kv.json"), "w", encoding="utf-8"),
          ensure_ascii=False, separators=(",", ":"))

print("odhad", d["generated"], "obvodů s daty:", sum(1 for v in se.values() if v.get("status") == "ok"),
      "| zastupitelstev s daty:", sum(1 for v in kv.values() if v.get("l")), "z", len(kv))
