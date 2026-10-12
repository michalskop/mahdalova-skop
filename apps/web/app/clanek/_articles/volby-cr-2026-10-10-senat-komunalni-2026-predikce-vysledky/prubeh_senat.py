# Senát: průběh predikce během sčítání po dávkách ČSÚ + milník „kdy jsme to věděli“ (pro SenatVysledkyMapa).
# Zdroj: rekonstrukce volebního večera (Michal Škop, složka volby2026_replay mimo repo); konečné výsledky = oficiální souhrn ČSÚ.
# Milník = první dávka (sečteno < 100 %, nejvyšší spolehlivost, jakou dashboard pro obvod dává), kdy model s jistotou 99 % určil
#   kolo1  – vítěze už v 1. kole (P(výhra v 1. kole) ≥ 0,99), nebo
#   postup – oba postupující do 2. kola (dva kandidáti s P(postup do 2. kola) ≥ 0,99).
# Barvy kandidátů z /api/universe dashboardu (dashboard_universe.json ve složce rekonstrukce).
# python prubeh_senat.py [cesta k volby2026_replay] [cesta k dashboard_universe.json]  →  prubeh_se.json
import json, os, sys
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
ZDROJ = r"C:\Users\datov\Desktop\Mahdalova & Skop\Volby\Volby - predikce\Predikce - komunální a senát 2026"
REP = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ZDROJ, "volby2026_replay")
UNI = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ZDROJ, "rekonstrukce", "dashboard_universe.json")
P = 0.99 - 1e-9

r = pd.read_parquet(os.path.join(REP, "replay_predictions.parquet"))
iv = pd.read_parquet(os.path.join(REP, "replay_intervals.parquet"))
fin = pd.read_parquet(os.path.join(REP, "final_results.parquet"))
for d in (r, iv, fin):
    d["unit_id"] = d.unit_id.astype(str)
r = r[r.kind == "se"].merge(iv[iv.kind == "se"][["unit_id", "batch", "subject_id", "lo99", "hi99"]], on=["unit_id", "batch", "subject_id"])
r["pub_time"] = pd.to_datetime(r.pub_time)
fin = fin[fin.kind == "se"]
barvy = {(str(u["ob"]), c["no"]): c.get("color") for u in json.load(open(UNI, encoding="utf-8"))["se"] for c in u["cands"]}

minuty = lambda t: (t.day - 10) * 1440 + t.hour * 60 + t.minute
pm = lambda v: int(round(v * 1000))
pb = lambda v: f"{v * 100:.1f}".replace(".", ",")

out = {}
for o, g in r.groupby("unit_id"):
    f = fin[fin.unit_id == o].sort_values("official_share", ascending=False)
    off = f.set_index("subject_id").official_share
    r1 = off[off > 0.5]
    top2 = set(int(s) for s in f.subject_id[:2])
    nejlepsi = "ok" if (g.reliability == "ok").any() else "low"
    stavy, m = [], {}
    for b, x in g.sort_values("pub_time").groupby("batch", sort=False):
        x = x.set_index("subject_id")
        frac = float(x.frac_counted.iloc[0])
        stavy.append((minuty(x.pub_time.iloc[0]), frac, x))
        if m or frac >= 1 or x.reliability.iloc[0] != nejlepsi:
            continue
        w = x[x.p_win_round1 >= P]
        dvojice = x[x.p_runoff >= P]
        if len(w):
            s = int(w.index[0]); ok = len(r1) == 1 and int(r1.index[0]) == s
            m["kolo1"] = dict(i=len(stavy) - 1, ok=ok, p=99, a=x.subject[s], **({} if ok else {"d": "rozhodlo se až ve 2. kole"}))
        elif len(dvojice) >= 2:
            par = set(int(s) for s in dvojice.sort_values("est_share", ascending=False).index[:2])
            ok = len(r1) == 0 and par == top2
            m["postup"] = dict(i=len(stavy) - 1, ok=ok, p=99, **({} if ok else {"d": "postoupil jiný kandidát"}))
    konec = next((st[0] for st in stavy if st[1] >= 1), stavy[-1][0])
    lists = []
    for fr in f.itertuples():
        s = int(fr.subject_id)
        col = lambda c: [pm(st[2][c].get(s, 0)) for st in stavy]
        lists.append(dict(a=fr.subject, strana=fr.party, v=pm(fr.official_share), s=None, c=barvy.get((o, s)),
                          e=col("est_share"), lo=col("lo90"), hi=col("hi90"), lo99=col("lo99"), hi99=col("hi99"), n0=col("counted_share"), ms=[]))
    out[o] = dict(t=[st[0] for st in stavy], f=[round(st[1], 3) for st in stavy], nc=[int(st[2].n_counted.iloc[0]) for st in stavy],
                  nt=int(g.n_total.iloc[0]), konec=konec, l=lists, m=m)

json.dump({"zdroj": "rekonstrukce po dávkách ČSÚ (volby2026_replay)", "se": out},
          open(os.path.join(HERE, "prubeh_se.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
mm = [z["m"] for z in out.values()]
print(f"obvodů {len(out)}, milník {sum(bool(x) for x in mm)}, chybně {sum(1 for x in mm for v in x.values() if not v['ok'])}",
      f"| {os.path.getsize(os.path.join(HERE, 'prubeh_se.json')) / 1e6:.2f} MB")
