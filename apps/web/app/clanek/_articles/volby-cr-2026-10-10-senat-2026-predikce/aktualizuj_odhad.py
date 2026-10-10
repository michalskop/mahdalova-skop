# Stáhne aktuální senátní odhad z volby2026.datatimes.cz/api/latest a uloží ho vedle článku jako odhad.json.
# Web volby2026.datatimes.cz neposílá CORS hlavičky, proto se data do článku kopírují tímto skriptem
# (a pak commit + push). Spuštění: python aktualizuj_odhad.py
import json, os, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
URL = "https://volby2026.datatimes.cz/api/latest"
KEEP = ("no", "name", "party", "counted_share", "est_share", "sd", "p_win_round1", "p_top2")

req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0 (DataTimes clanek senat-2026-predikce)", "Accept": "application/json"})
with urllib.request.urlopen(req, timeout=30) as r:
    d = json.load(r)

se = {}
for ob, v in d["se"].items():
    x = {k: v[k] for k in ("status", "n_total", "n_counted", "frac_counted", "p_decided_round1", "reliability") if k in v}
    if "candidates" in v:
        x["candidates"] = [{k: c[k] for k in KEEP if k in c} for c in v["candidates"]]
    se[ob] = x

json.dump({"generated": d["generated"], "se": se}, open(os.path.join(HERE, "odhad.json"), "w", encoding="utf-8"),
          ensure_ascii=False, separators=(",", ":"))
print("odhad", d["generated"], "obvodů s daty:", sum(1 for v in se.values() if v.get("status") == "ok"))
for ob in sorted(se, key=int):
    v = se[ob]
    if v.get("candidates"):
        top = sorted(v["candidates"], key=lambda c: -c["est_share"])[:2]
        print(f'{ob:>3} {v["frac_counted"]*100:5.1f} % sečteno  P(1.k)={v.get("p_decided_round1",0):.2f}  ' +
              " | ".join(f'{c["name"]} ({c["party"]}) {c["est_share"]*100:.1f} %' for c in top))
