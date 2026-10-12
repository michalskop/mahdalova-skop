# Ke konečným výsledkům v mapě měst vybere NEJRANĚJŠÍ zveřejněnou predikci, která už byla dost přesná:
# první snímek v čase, kde součet absolutních odchylek středových hodnot od konečného výsledku
# E = Σ |predikce − výsledek| přes všechny kandidátky je nejvýš PRAH procentních bodů.
# Nevybírá se nejpřesnější ani poslední predikce; když práh nesplní žádná, predikce se neukáže (nesplneno).
# Kandidáti: snímky odhad_kv.json v gitu (dashboard /api/latest, během sčítání) a predikce zveřejněné
# jako screenshot / karta dashboardu (převzato z nejblizsi_predikce.py).
# Konečné výsledky: /api/latest po sečtení 100 % okrsků.
# Test prahů 1 / 3 / 5 p. b. (11. 10. 2026): práh 3 splnilo 109 ze 126 zastupitelstev s predikcí během sčítání
# a všech 27 senátních obvodů. Senát: snímky odhad.json v gitu + screenshoty s úplným seznamem kandidátů.
# python predikce_rana.py  →  predikce_rana.json
import json, os, subprocess, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
PRAH = 3.0  # p. b.

req = urllib.request.Request("https://volby2026.datatimes.cz/api/latest",
                             headers={"User-Agent": "Mozilla/5.0 (DataTimes clanek volby-2026-predikce)", "Accept": "application/json"})
with urllib.request.urlopen(req, timeout=60) as r:
    latest = json.load(r)
fin = latest["kv"]
assert all(v.get("n_counted") == v.get("n_total") for v in fin.values()), "ještě není všude sečteno 100 %"

def git(*a):
    return subprocess.run(["git", "-C", HERE, *a], capture_output=True, text=True, encoding="utf-8").stdout

snaps = {}
for h in git("log", "--format=%h", "--", "odhad_kv.json").split():
    d = json.loads(git("show", f"{h}:./odhad_kv.json"))
    snaps.setdefault(d["generated"], d)

# klíč zastupitelstva → [(čas, podíl sečtených, {"zkratka|název": [odhad, mandáty, lo90, hi90]}, zdroj)]
kand = {}
for g, d in sorted(snaps.items()):
    for k, z in d["kv"].items():
        if z.get("l") and z.get("frac", 0) < 0.999:
            kand.setdefault(k, []).append((g[11:16], z["frac"], {f"{l['a']}|{l['nm']}": [l["e"], l["s"], l["lo"], l["hi"]] for l in z["l"]}, None))

# zveřejněné screenshoty / karty dashboardu (jen středové hodnoty, mandáty jen kde byly na obrázku)
FOTO = {
    "554782_1": [("18:35", 56 / 1120, "screenshot dashboardu (stav 18:29) zveřejněný v 18:35", {
        "ODS+TOP 09": 0.221, "STAN": 0.219, "PRAHA SOBĚ+NK": 0.189, "ANO": 0.141, "Piráti": 0.088, "HPPSENMourekNK": 0.040,
        "SPD+NK": 0.038, "AUTO": 0.027, "KSČM+KSČ+ČSSD": 0.010, "Patrioti ČR+NK": 0.007, "TEAM+NK": 0.005, "Svobodní": 0.005,
        "GEN+NK": 0.004, "Levice": 0.002}),
                 ("23:23", 898 / 1120, "karta dashboardu na síti X od Michala Škopa ve 23:23", {
        "STAN": (0.233, 18), "ODS+TOP 09": (0.217, 16), "PRAHA SOBĚ+NK": (0.181, 13), "ANO": (0.142, 11), "Piráti": (0.095, 7),
        "SPD+NK": (0.035, 0), "AUTO": (0.029, 0), "HPPSENMourekNK": (0.028, 0), "KSČM+KSČ+ČSSD": (0.009, 0), "TEAM+NK": (0.007, 0),
        "Patrioti ČR+NK": (0.006, 0), "Svobodní": (0.005, 0), "GEN+NK": (0.004, 0)})],
    "563889_1": [("21:26", 82 / 87, "karta dashboardu v reportáži 21:26", {
        "SLK": (0.286, 14), "Lepší město+NK": (0.222, 11), "ANO": (0.176, 8), "Zelení+Piráti": (0.127, 6), "SPD": (0.046, 0),
        "ODS+USZ": (0.043, 0), "KDUČSL+TOP09+NK": (0.042, 0), "PRO": (0.036, 0), "GEN+NK": (0.020, 0), "DSZ+NK": (0.001, 0), "ČSA": (0.001, 0)})],
    "582786_1": [("19:22", 87 / 353, "karta dashboardu v reportáži 19:22", {
        "KDU-ČSL+STAN": 0.270, "ODS+TOP 09+NK": 0.183, "ANO": 0.174, "ZLESŽBSENBuVoKr": 0.092, "PirIdeFaktBrGEN": 0.073,
        "Za Lužánky": 0.051, "SPD+NK": 0.038, "AUTO": 0.030, "NB": 0.023, "KLID": 0.016, "KSČMČSSDDOSmSt!": 0.016,
        "Svobo+Triko+PRO": 0.011, "PŘÍSAHA": 0.010, "SOCDEM+NK": 0.008, "LANO+VRBa": 0.004, "DSZ+NK": 0.000})],
}
for k, lst in FOTO.items():
    plny = {l["abbr"]: f"{l['abbr']}|{l['name']}" for l in fin[k]["lists"]}
    for t, frac, zdroj, e in lst:
        l = {plny[a]: ([v[0], v[1], None, None] if isinstance(v, tuple) else [v, None, None, None]) for a, v in e.items()}
        kand[k].append((t, frac, l, zdroj))

out = {"prah": PRAH, "kv": {}}
for k, v in fin.items():
    V = {f"{l['abbr']}|{l['name']}": l["counted_share"] for l in v.get("lists", [])}
    rady = sorted(kand.get(k, []), key=lambda c: (c[0] < "12:00", c[0]))  # chronologicky přes půlnoc
    if not rady:
        continue  # sečteno dřív, než existoval první snímek – predikci nemáme
    for t, frac, l, zdroj in rady:
        assert set(l) <= set(V), (k, t, set(l) - set(V))
        E = sum(abs(l[x][0] - V[x]) for x in l) * 100
        if E <= PRAH:
            out["kv"][k] = {"t": t, "frac": round(frac, 3), "E": round(E, 2), "l": l, **({"zdroj": zdroj} if zdroj else {})}
            break
    else:
        out["kv"][k] = {"nesplneno": True, "minE": round(min(sum(abs(l[x][0] - V[x]) for x in l) * 100 for _, _, l, _ in rady), 2)}

# --- Senát ---
fin_se = latest["se"]
assert all(v.get("frac_counted", 0) >= 0.999 for v in fin_se.values()), "Senát ještě není všude sečten"
snaps_se = {}
for h in git("log", "--format=%h", "--", "odhad.json").split():
    d = json.loads(git("show", f"{h}:./odhad.json"))
    snaps_se.setdefault(d["generated"], d)
kand_se = {}
for g, d in sorted(snaps_se.items()):
    for o, x in d["se"].items():
        if x.get("status") == "ok" and x.get("candidates") and x.get("frac_counted", 0) < 0.999:
            kand_se.setdefault(o, []).append((g[11:16], x["frac_counted"], {c["name"]: c["est_share"] for c in x["candidates"]}, None))
# screenshoty z nejblizsi_predikce.py – jen ty s úplným seznamem kandidátů (přehledy s 1–2 jmény se do E nedají sečíst)
src = open(os.path.join(HERE, "nejblizsi_predikce.py"), encoding="utf-8").read()
ns = {}
exec(src[src.index("P1802 = "):src.index("fin_se = ")], ns)
for o, t, frac, vals in ns["SE_ZVEREJNENO"]:
    if abs(sum(vals.values()) - 1) < 0.02:
        kand_se.setdefault(str(o), []).append((t, frac, vals, "zveřejněno"))
out["se"] = {}
for o, v in fin_se.items():
    V = {c["name"]: c for c in v["candidates"]}
    for t, frac, vals, zdroj in sorted(kand_se.get(o, []), key=lambda c: (c[0] < "12:00", c[0])):
        E = sum(abs(vals[n] - V[n]["est_share"]) for n in vals) * 100
        if E <= PRAH:
            out["se"][o] = {"t": t, "frac": round(frac, 3), "E": round(E, 2), "c": {str(V[n]["no"]): round(e, 4) for n, e in vals.items()},
                            **({"zdroj": zdroj} if zdroj else {})}
            break

json.dump(out, open(os.path.join(HERE, "predikce_rana.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
from collections import Counter
ok = [z for z in out["kv"].values() if not z.get("nesplneno")]
print(f"práh {PRAH} p. b.: predikce u {len(ok)}, nesplněno {len(out['kv']) - len(ok)}", Counter(z["t"] for z in ok))
print(f"Senát: predikce u {len(out['se'])} z {len(fin_se)}", Counter(z["t"] for z in out["se"].values()))
