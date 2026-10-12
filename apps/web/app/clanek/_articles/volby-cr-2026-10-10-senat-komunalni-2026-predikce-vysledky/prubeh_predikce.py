# Průběh predikce během sčítání pro mapu měst + milníky „od kdy jsme to věděli“.
# Zdroj: rekonstrukce volebního večera (Michal Škop, složka volby2026_replay mimo repo): model přepočítaný po každé
# dávce ČSÚ jen z tehdy sečtených okrsků; konečné výsledky = oficiální souhrn ČSÚ.
#
# Milník = první dávka (sečteno < 100 %, spolehlivost „dobrá“; u zastupitelstev pod 21 okrsků, kde ji dashboard nedává,
# „nízká“), kdy model splnil podmínku s jistotou 99 %; kde to do konce nenastalo, zkušebně s jistotou 95 %:
#   vitez   – 99% interval vedoucí kandidátky se nepřekrývá s 99% intervaly ostatních (95 %: 90% intervaly)
#   slozeni – u každé kandidátky jisté, zda získá mandát: 1 − Σ min(P(0 mandátů), 1 − P(0 mandátů)) ≥ 0,99 (0,95)
#   poradi  – kandidátky s mandáty (podle predikce) jdou po sobě a sousední 99% (90%) intervaly se nepřekrývají
#   mandaty – přesné počty mandátů všech kandidátek: 1 − Σ (1 − P(nejpravděpodobnější počet)) ≥ 0,99 (0,95)
# Model uložil rozdělení mandátů jen po kandidátkách zvlášť, proto u slozeni/mandaty dolní odhad (Bonferroni).
# Každý milník nese, zda tvrzení odpovídalo konečnému výsledku (ok), u chybného krátké vysvětlení (d).
# python prubeh_predikce.py [cesta k volby2026_replay]  →  prubeh_kv.json
import json, os, sys
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
REP = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\datov\Desktop\Mahdalova & Skop\Volby\Volby - predikce\Predikce - komunální a senát 2026\volby2026_replay"

r = pd.read_parquet(os.path.join(REP, "replay_predictions.parquet"))
iv = pd.read_parquet(os.path.join(REP, "replay_intervals.parquet"))
sd = pd.read_parquet(os.path.join(REP, "replay_seats_dist.parquet"))
fin = pd.read_parquet(os.path.join(REP, "final_results.parquet"))
for d in (r, iv, sd, fin):
    d["unit_id"] = d.unit_id.astype(str)
r = r[r.kind == "kv"].merge(iv[iv.kind == "kv"][["unit_id", "batch", "subject_id", "lo99", "hi99"]], on=["unit_id", "batch", "subject_id"])
r["pub_time"] = pd.to_datetime(r.pub_time)
p0 = sd[sd.seats == 0].set_index(["unit_id", "batch", "subject_id"]).prob   # P(0 mandátů)
fin = fin[fin.kind == "kv"]
odhad = json.load(open(os.path.join(HERE, "odhad_kv.json"), encoding="utf-8"))["kv"]
pb = lambda v: f"{v * 100:.1f}".replace(".", ",")  # podíl → „23,2“

minuty = lambda t: (t.day - 10) * 1440 + t.hour * 60 + t.minute
pm = lambda v: int(round(v * 1000))  # promile

def neprekryv(o, lo, hi):
    """o seřazené podle odhadu: každá další kandidátka má horní mez pod dolní mezí předchozí"""
    return all(o[lo].iloc[k] > o[hi].iloc[k + 1:].max() for k in range(len(o) - 1)) if len(o) > 1 else True

def podminky(x, uid, b, P):
    """x = stav zastupitelstva (index subject_id), P = 0,99 / 0,95 → {milník: splněno}"""
    o = x.sort_values("est_share", ascending=False)
    lo, hi = ("lo99", "hi99") if P > 0.98 else ("lo90", "hi90")
    p_zero = [float(p0.get((uid, b, s), 0.0)) for s in x.index]
    seat = o[o.seats_mode > 0]
    return dict(
        vitez=len(o) < 2 or o[lo].iloc[0] > o[hi].iloc[1:].max(),
        slozeni=1 - sum(min(p, 1 - p) for p in p_zero) >= P - 1e-9,
        poradi=neprekryv(seat, lo, hi),
        mandaty=1 - (1 - x.seats_pmax).sum() >= P - 1e-9,
    )

out = {}
for uid, g in r.groupby("unit_id"):
    f = fin[fin.unit_id == uid].sort_values("official_share", ascending=False)
    keep = [int(s) for s in f[f.official_share >= 0.01].subject_id]
    if not keep:
        continue
    offs = f.set_index("subject_id").official_seats.fillna(0).astype(int)
    off_rank = [int(s) for s in f[f.official_seats > 0].subject_id]   # oficiální pořadí kandidátek s mandáty
    nejlepsi = "ok" if (g.reliability == "ok").any() else "low"  # pod 21 okrsků dashboard „dobrou“ spolehlivost nedává
    stavy, mil = [], {99: {}, 95: {}}
    for b, x in g.sort_values("pub_time").groupby("batch", sort=False):  # chronologicky
        x = x.set_index("subject_id")
        frac = float(x.frac_counted.iloc[0])
        stavy.append((minuty(x.pub_time.iloc[0]), frac, int(x.n_counted.iloc[0]), x))
        if frac >= 1 or x.reliability.iloc[0] != nejlepsi:
            continue
        o = x.sort_values("est_share", ascending=False)
        ms = x.seats_mode.astype(int)
        pred_rank = [int(s) for s in o[o.seats_mode > 0].index]          # pořadí, které model tvrdil (kandidátky s mandáty)
        off_of_pred = [s for s in f.subject_id.astype(int) if s in pred_rank]   # jejich skutečné pořadí
        nm = lambda s: f.set_index("subject_id").subject.get(s)
        spravne = dict(vitez=int(o.index[0]) == int(f.subject_id.iloc[0]),
                       slozeni=all((ms.get(s, 0) > 0) == (v > 0) for s, v in offs.items()),
                       poradi=pred_rank == off_of_pred,
                       mandaty=all(ms.get(s, 0) == v for s, v in offs.items()))
        offsh = f.set_index("subject_id").official_share
        detail = dict(
            vitez=f"vyhrál {f.subject.iloc[0]} o {pb(offsh.iloc[0] - offsh.iloc[1])} b." if not spravne["vitez"] else None,
            slozeni=", ".join(f"{nm(s)} {'se dostal' if v > 0 else 'se nedostal'} ({pb(offsh[s])} %)"
                              for s, v in offs.items() if (ms.get(s, 0) > 0) != (v > 0)) or None,
            poradi=", ".join(f"{nm(a)} a {nm(b)} se prohodili (rozdíl {pb(abs(offsh[a] - offsh[b]))} b.)"
                             for a, b in zip(pred_rank, pred_rank[1:]) if off_of_pred.index(a) > off_of_pred.index(b)) or None,
            mandaty=", ".join(f"{nm(s)} {v} místo {ms.get(s, 0)}" for s, v in offs.items() if ms.get(s, 0) != v) or None)
        for P in (99, 95):
            for k, ok in podminky(x, uid, b, P / 100).items():
                if ok and k not in mil[P]:
                    mil[P][k] = dict(i=len(stavy) - 1, ok=spravne[k], p=P, **({"a": o.subject.iloc[0]} if k == "vitez" else {}),
                                     **({"d": detail[k]} if not spravne[k] and detail[k] else {}))
    milniky = {k: mil[99].get(k) or mil[95].get(k) for k in ("vitez", "slozeni", "poradi", "mandaty") if mil[99].get(k) or mil[95].get(k)}
    z = odhad.get(uid, {})
    abbr = {l["a"]: l for l in z.get("l", [])}
    lists = []
    for s in keep:
        fr = f[f.subject_id == s].iloc[0]
        col = lambda c: [pm(st[3][c].get(s, 0)) for st in stavy]
        lists.append(dict(a=fr.subject, v=pm(fr.official_share), s=None if pd.isna(fr.official_seats) else int(fr.official_seats),
                          c=abbr.get(fr.subject, {}).get("c"), e=col("est_share"), lo=col("lo90"), hi=col("hi90"),
                          lo99=col("lo99"), hi99=col("hi99"), n0=col("counted_share"),
                          ms=[int(st[3].seats_mode.get(s, 0)) for st in stavy]))
    konec = next((st[0] for st in stavy if st[1] >= 1), stavy[-1][0])
    out[uid] = dict(t=[st[0] for st in stavy], f=[round(st[1], 3) for st in stavy], nc=[st[2] for st in stavy],
                    nt=int(g.n_total.iloc[0]), konec=konec, l=lists, m=milniky)

json.dump({"zdroj": "rekonstrukce po dávkách ČSÚ (volby2026_replay)", "kv": out},
          open(os.path.join(HERE, "prubeh_kv.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
for k in ("vitez", "slozeni", "poradi", "mandaty"):
    w = [z["m"][k] for z in out.values() if k in z["m"]]
    print(f"{k:8}: {len(w):3} zastupitelstev (99 %: {sum(x['p'] == 99 for x in w)}, 95 %: {sum(x['p'] == 95 for x in w)}), chybně {sum(not x['ok'] for x in w)}")
print(f"{os.path.getsize(os.path.join(HERE, 'prubeh_kv.json')) / 1e6:.2f} MB")
