# Navazující analýza (NEPUBLIKOVÁNO): klesala účast v komunálních volbách 2026 proti 2022 víc tam, kde je silné ANO?
#
# Zdroj: ČSÚ, otevřená data volby.gov.cz:
#   KV 2022, KV 2026, Senát 2022 a 2026 – stejné balíky jako postav.py (staženo 15.–16. 10. 2026)
#   https://volby.gov.cz/opendata/ps2025/PS2025data20251005_csv.zip – pst4.csv (okrsky), pst4p.csv (hlasy stran v okrscích)
#   (staženo 16. 10. 2026; strany podle psrkl.csv z PS2025reg20251005_csv.zip: 22 = ANO 2011, 6 = SPD, 11 = SPOLU,
#    23 = STAN, 16 = Piráti, 20 = Motoristé sobě, 25 = Stačilo!)
#
# Jednotka = obec (zastupitelstvo obce, KODZASTUP; Praha a statutární města s městskými částmi jako celek, jako v postav.py).
# Změna účasti = účast KV 2026 − účast KV 2022 (p. b.), účast = vydané obálky / voliči v seznamu.
# Síla ANO = podíl ANO na platných hlasech ve sněmovních volbách 3.–4. 10. 2025 v okrscích obce (bez zahraničí).
# Okrsek sněmovních voleb → obec přes kód OBEC; OBEC → KODZASTUP podle kvt3 KV 2026 (TYPZASTUP 1).
# Senát: obec „se senátem“ v daném roce, když většina jejích voličů hlasovala v okrsku se souběžným 1. kolem (jako postav.py).
#
# python analyza_ano.py <slozka_KV_SE_baliku> <slozka_PS2025_baliku>
#   → analyza_ano.json (všechna čísla), výpis na konzoli (= analyza_ano.txt)
import csv, json, os, sys, collections, math
import numpy as np

sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
ART = os.path.dirname(HERE)
GEO = os.path.join(ART, "..", "volby-cr-2026-09-24-mista-kde-neexistuje-politicka-konkurence")
SRC, PS = sys.argv[1], sys.argv[2]
P = lambda *a: os.path.join(SRC, *a)
STRANY = {"22": "ANO", "6": "SPD", "11": "SPOLU", "23": "STAN", "16": "Piráti", "20": "Motoristé", "25": "Stačilo"}


# ---------- komunální volby + senát (stejná logika jako postav.py) ----------
def kv(path, datum=None):
    s = collections.defaultdict(lambda: [0, 0]); okr = {}; obec = {}; kraj = {}
    for x in csv.DictReader(open(path, encoding="utf-8")):
        if x["TYPZASTUP"] != "1" or (datum and x["DATUMVOLEB"] != datum):
            continue
        a = s[x["KODZASTUP"]]
        a[0] += int(x["VOL_SEZNAM"]); a[1] += int(x["VYD_OBALKY"])
        okr[(x["OBEC"], x["OKRSEK"])] = (x["KODZASTUP"], int(x["VOL_SEZNAM"]))
        obec[x["OBEC"]] = x["KODZASTUP"]
    return s, okr, obec


def senat(path):
    return {(x["OBEC"], x["OKRSEK"]) for x in csv.DictReader(open(path, encoding="utf-8")) if x["KOLO"] == "1"}


def podil_senat(okrsky, se):
    v = collections.defaultdict(lambda: [0, 0])
    for key, (kod, n) in okrsky.items():
        v[kod][0] += n
        v[kod][1] += n if key in se else 0
    return {k: (b / a if a else 0) for k, (a, b) in v.items()}


a22, ok22, _ = kv(P("KV2022_data_20260328_csv", "csv_od", "kvt3.csv"), "20220923")
a26, ok26, obec2zast = kv(P("KV2026_data_20261011_csv", "csv_od", "kvt3.csv"))
sen22 = podil_senat(ok22, senat(P("SE2022_data_20221001_k2_csv", "csv_od", "set5.csv")))
sen26 = podil_senat(ok26, senat(P("SE2026data20261011_csv", "csv_od", "set5.csv")))
KRAJE = {"1100": "Praha", "2100": "Středočeský", "3100": "Jihočeský", "3200": "Plzeňský", "4100": "Karlovarský", "4200": "Ústecký",
         "5100": "Liberecký", "5200": "Královéhradecký", "5300": "Pardubický", "6100": "Vysočina", "6200": "Jihomoravský",
         "7100": "Olomoucký", "7200": "Zlínský", "8100": "Moravskoslezský"}
kraj = {x["KODZASTUP"]: KRAJE[x["KRAJ"]] for x in csv.DictReader(open(P("KV2022_data_20260328_csv", "csv_od", "kvt3.csv"), encoding="utf-8")) if x["TYPZASTUP"] == "1"}
info = json.load(open(os.path.join(GEO, "obce-data.json"), encoding="utf-8"))["obce"]


def sk(k):
    s2, s6 = sen22.get(k, 0) > 0.5, sen26.get(k, 0) > 0.5
    return {(False, True): "jen 2026", (True, False): "jen 2022", (True, True): "v obou letech", (False, False): "ani jednou"}[(s2, s6)]


# ---------- sněmovní volby 2025 po obcích ----------
ps = collections.defaultdict(lambda: collections.Counter())  # KODZASTUP → voliči, obálky, platné, hlasy stran
nezarazeno = collections.Counter()
for x in csv.DictReader(open(os.path.join(PS, "PS2025data20251005_csv", "csv_od", "pst4.csv"), encoding="utf-8")):
    if x["OKRES"] == "9999" or x["OBEC"] == "999997":  # zahraničí
        continue
    k = obec2zast.get(x["OBEC"])
    if not k:
        nezarazeno[x["OBEC"]] += int(x["VOL_SEZNAM"]); continue
    c = ps[k]
    c["vol"] += int(x["VOL_SEZNAM"]); c["obal"] += int(x["VYD_OBALKY"]); c["plat"] += int(x["PL_HL_CELK"])
for x in csv.DictReader(open(os.path.join(PS, "PS2025data20251005_csv", "csv_od", "pst4p.csv"), encoding="utf-8")):
    k = obec2zast.get(x["OBEC"])
    if k and x["KSTRANA"] in STRANY:
        ps[k][STRANY[x["KSTRANA"]]] += int(x["POC_HLASU"])

# kontrola: celostátní výsledek ANO (ČSÚ: 34,51 % vč. zahraničí)
tot = sum((ps[k] for k in ps), collections.Counter())
kontrola = {"ANO_cr_bez_zahranici": round(tot["ANO"] / tot["plat"] * 100, 2), "ucast_ps_bez_zahranici": round(tot["obal"] / tot["vol"] * 100, 2),
            "obci_PS_nezarazeno": len(nezarazeno), "volicu_PS_nezarazeno": sum(nezarazeno.values())}

# ---------- tabulka obcí ----------
t = lambda a: a[1] / a[0] * 100
R = []
for k in sorted(a22.keys() & a26.keys() & ps.keys()):
    if not (a22[k][0] and a26[k][0] and ps[k]["plat"]):
        continue
    c = ps[k]
    R.append({"kod": k, "obec": info.get(k, {}).get("n", k), "okres": info.get(k, {}).get("o", ""), "kraj": kraj.get(k, "?"),
              "vol22": a22[k][0], "obal22": a22[k][1], "vol26": a26[k][0], "obal26": a26[k][1],
              "u22": t(a22[k]), "u26": t(a26[k]), "d": t(a26[k]) - t(a22[k]), "senat": sk(k),
              "ups25": c["obal"] / c["vol"] * 100, **{s: c[s] / c["plat"] * 100 for s in STRANY.values()}})
kontrola["obci_v_analyze"] = len(R)
kontrola["obci_KV_bez_PS"] = len((a22.keys() & a26.keys()) - ps.keys())


def souhrn(rows):
    s22 = sum(r["vol22"] for r in rows); v22 = sum(r["obal22"] for r in rows)
    s26 = sum(r["vol26"] for r in rows); v26 = sum(r["obal26"] for r in rows)
    return {"obci": len(rows), "volicu26": s26, "u22": round(v22 / s22 * 100, 2), "u26": round(v26 / s26 * 100, 2),
            "zmena": round((v26 / s26 - v22 / s22) * 100, 2), "median_obce": round(float(np.median([r["d"] for r in rows])), 2),
            "nizsi": sum(r["d"] < 0 for r in rows),
            "ANO": round(sum(r["ANO"] * r["vol26"] for r in rows) / s26, 1)}


def ctvrtiny(rows, pole="ANO", n=5):
    """Pětiny obcí podle pole (stejný počet obcí v každé pětině)."""
    z = sorted(rows, key=lambda r: r[pole]); out = []
    for i in range(n):
        g = z[len(z) * i // n: len(z) * (i + 1) // n]
        out.append({"od": round(g[0][pole], 1), "do": round(g[-1][pole], 1), **souhrn(g)})
    return out


def wcorr(x, y, w):
    x, y, w = map(np.asarray, (x, y, w)); w = w / w.sum()
    mx, my = (w * x).sum(), (w * y).sum()
    return float((w * (x - mx) * (y - my)).sum() / math.sqrt((w * (x - mx) ** 2).sum() * (w * (y - my) ** 2).sum()))


def spearman(x, y):
    rk = lambda v: np.argsort(np.argsort(v))
    return float(np.corrcoef(rk(np.asarray(x)), rk(np.asarray(y)))[0, 1])


def ols(rows, cols, w=None, fe=None):
    """OLS (volitelně vážená) d ~ cols (+ dummies pro fe). Vrací koeficienty, robustní SE (HC1), R²."""
    y = np.array([r["d"] for r in rows])
    X = [np.ones(len(rows))] + [np.array([r[c] if not callable(c) else c(r) for r in rows], float) for c in cols]
    names = ["konst"] + [c if isinstance(c, str) else c.__name__ for c in cols]
    for f in (fe or []):
        lv = sorted({r[f] for r in rows})[1:]
        for v in lv:
            X.append(np.array([r[f] == v for r in rows], float)); names.append(f"{f}={v}")
    X = np.column_stack(X)
    W = np.ones(len(rows)) if w is None else np.array([r[w] for r in rows], float)
    sw = np.sqrt(W); Xw, yw = X * sw[:, None], y * sw
    b, *_ = np.linalg.lstsq(Xw, yw, rcond=None)
    e = yw - Xw @ b
    XtXi = np.linalg.pinv(Xw.T @ Xw)
    n, p = X.shape
    V = XtXi @ (Xw.T * e ** 2) @ Xw @ XtXi * n / (n - p)
    r2 = 1 - (e ** 2).sum() / ((yw - (W * y).sum() / W.sum() * sw) ** 2).sum()
    return {nm: {"b": round(float(bi), 4), "se": round(float(math.sqrt(V[i, i])), 4)} for i, (nm, bi) in enumerate(zip(names, b)) if "=" not in nm} | {"R2": round(float(r2), 3), "n": n}


out = {"kontrola": kontrola, "celkem": souhrn(R)}

# 1) korelace
vel = [r for r in R if r["vol26"] >= 500]
out["korelace"] = {
    "vsechny_obce_vazene_volici": round(wcorr([r["ANO"] for r in R], [r["d"] for r in R], [r["vol26"] for r in R]), 3),
    "vsechny_obce_spearman": round(spearman([r["ANO"] for r in R], [r["d"] for r in R]), 3),
    "obce_500plus_spearman": round(spearman([r["ANO"] for r in vel], [r["d"] for r in vel]), 3),
    "obce_500plus_n": len(vel),
}
# 2) pětiny podle ANO – celkem a uvnitř senátních skupin a velikostí
out["petiny_ANO"] = ctvrtiny(R)
out["petiny_ANO_senat"] = {g: ctvrtiny([r for r in R if r["senat"] == g]) for g in ("ani jednou", "jen 2022", "jen 2026")}
TRIDY = [(0, 500), (500, 2000), (2000, 10000), (10000, 10 ** 9)]
out["petiny_ANO_velikost"] = {f"{lo}–{hi}": ctvrtiny([r for r in R if lo <= r["vol26"] < hi]) for lo, hi in TRIDY}

# 3) regrese: změna účasti (p. b.) na podíl ANO (v p. b.) + kontroly
lnvol = lambda r: math.log(r["vol26"]); lnvol.__name__ = "ln_volicu"
sen = lambda g: (lambda r: float(r["senat"] == g))
s22, s26 = sen("jen 2022"), sen("jen 2026"); s22.__name__, s26.__name__ = "senat_jen2022", "senat_jen2026"
MODELY = [("jen ANO", ["ANO"], []),
          ("+ senát", ["ANO", s22, s26], []),
          ("+ senát + velikost", ["ANO", s22, s26, lnvol], []),
          ("+ senát + velikost + kraj", ["ANO", s22, s26, lnvol], ["kraj"]),
          ("+ … + účast 2022", ["ANO", s22, s26, lnvol, "u22"], ["kraj"]),
          ("+ … + účast PS 2025 místo účasti 2022", ["ANO", s22, s26, lnvol, "ups25"], ["kraj"])]
out["regrese"] = {}
for vaha, rows, w in (("obce 500+ voličů, nevážené", vel, None), ("všechny obce, vážené voliči (bez Prahy)", [r for r in R if r["kraj"] != "Praha"], "vol26")):
    out["regrese"][vaha] = {m: ols(rows, c, w, fe) for m, c, fe in MODELY}
# 4) placebo: jiné strany místo ANO (stejné kontroly: senát + velikost + kraj)
out["placebo"] = {s: ols(vel, [s, s22, s26, lnvol], None, ["kraj"])[s] for s in STRANY.values()}
out["placebo_s_ucasti"] = {s: ols(vel, [s, s22, s26, lnvol, "ups25"], None, ["kraj"])[s] for s in STRANY.values()}
out["placebo_ucast"] = {c: ols(vel, [c, s22, s26, lnvol], None, ["kraj"])[c] for c in ("ups25", "u22")}
# korelace ANO se strukturou (proč je ANO zástupná proměnná)
out["korelace_ANO_s"] = {c: round(spearman([r["ANO"] for r in vel], [r[c] for r in vel]), 3) for c in ("u22", "ups25", "SPD", "SPOLU", "vol26")}

# 5) města 10 000+ voličů
m = [r for r in R if r["vol26"] >= 10000]
out["mesta"] = {"n": len(m), "spearman_ANO_d": round(spearman([r["ANO"] for r in m], [r["d"] for r in m]), 3),
                "spearman_u22_d": round(spearman([r["u22"] for r in m], [r["d"] for r in m]), 3),
                "spearman_ANO_u22": round(spearman([r["ANO"] for r in m], [r["u22"] for r in m]), 3),
                "regrese_ANO": ols(m, ["ANO", s22, s26])["ANO"],
                "regrese_ANO_u22": ols(m, ["ANO", s22, s26, "u22"]),
                "regrese_ANO_ups25": ols(m, ["ANO", s22, s26, "ups25"]),
                "regrese_ups25": ols(m, ["ups25", s22, s26])["ups25"],
                "placebo": {s: ols(m, [s, s22, s26])[s] for s in STRANY.values()},
                "spearman_ANO_ups25": round(spearman([r["ANO"] for r in m], [r["ups25"] for r in m]), 3),
                "spearman_strany_d": {c: round(spearman([r[c] for r in m], [r["d"] for r in m]), 3) for c in [*STRANY.values(), "ups25"]},
                "spearman_ups25_d": round(spearman([r["ups25"] for r in m], [r["d"] for r in m]), 3),
                "petiny": ctvrtiny(m),
                "tabulka": sorted(({"obec": r["obec"], "kraj": r["kraj"], "ANO": round(r["ANO"], 1), "u22": round(r["u22"], 1), "d": round(r["d"], 2), "senat": r["senat"]} for r in m), key=lambda r: -r["ANO"])}
TRI = {"Ústecký", "Moravskoslezský", "Karlovarský"}
for nm, g in (("mesta_v_UK_MSK_KV", [r for r in m if r["kraj"] in TRI]), ("mesta_mimo_UK_MSK_KV", [r for r in m if r["kraj"] not in TRI])):
    out[nm] = {"n": len(g), "spearman_ANO_d": round(spearman([r["ANO"] for r in g], [r["d"] for r in g]), 3),
               "ANO": ols(g, ["ANO", s22, s26])["ANO"], "ANO_ups25": ols(g, ["ANO", s22, s26, "ups25"])["ANO"], "souhrn": souhrn(g)}
# města 5 000–10 000 voličů (kontrola, jestli vzorec drží i o třídu níž)
m5 = [r for r in R if 5000 <= r["vol26"] < 10000]
out["mesta_5_10k"] = {"n": len(m5), "spearman_ANO_d": round(spearman([r["ANO"] for r in m5], [r["d"] for r in m5]), 3),
                      "ANO": ols(m5, ["ANO", s22, s26])["ANO"], "ANO_ups25": ols(m5, ["ANO", s22, s26, "ups25"])["ANO"], "petiny": ctvrtiny(m5)}

# 6) uvnitř krajů: korelace ANO × změna (obce 500+)
out["kraje"] = {}
for kr in sorted({r["kraj"] for r in vel}):
    g = [r for r in vel if r["kraj"] == kr]
    if len(g) >= 20:
        out["kraje"][kr] = {"n": len(g), "spearman": round(spearman([r["ANO"] for r in g], [r["d"] for r in g]), 3), "ANO_median": round(float(np.median([r["ANO"] for r in g])), 1)}

json.dump(out, open(os.path.join(HERE, "analyza_ano.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# ---------- výpis ----------
f = lambda x: f"{x:+.2f}".replace(".", ",")
print("KONTROLA:", kontrola)
c = out["celkem"]; print(f"obcí v analýze {c['obci']}, účast {c['u22']} → {c['u26']} ({f(c['zmena'])} p. b.)")
print("KORELACE ANO 2025 × změna účasti KV:", out["korelace"])
print("\nPĚTINY OBCÍ PODLE ANO 2025 (zmena = souhrnná změna účasti, p. b.; median_obce = medián změn obcí)")
for r in out["petiny_ANO"]:
    print(f"  ANO {r['od']:5.1f}–{r['do']:5.1f} %  obcí {r['obci']:5}  voličů {r['volicu26']:>9,}  účast22 {r['u22']:5.1f}  změna {f(r['zmena'])}  medián {f(r['median_obce'])}  nižší {r['nizsi']}")
for g, v in out["petiny_ANO_senat"].items():
    print(f"  senát {g:11}: " + " | ".join(f"{r['od']:.0f}–{r['do']:.0f} %: {f(r['zmena'])} (med {f(r['median_obce'])})" for r in v))
for g, v in out["petiny_ANO_velikost"].items():
    print(f"  voliči {g:13}: " + " | ".join(f"{r['od']:.0f}–{r['do']:.0f} %: {f(r['zmena'])} (med {f(r['median_obce'])})" for r in v))
print("\nREGRESE – koeficient ANO = o kolik p. b. se změnila účast na každých +10 p. b. ANO (± 2 SE)")
for vaha, mm in out["regrese"].items():
    print(f"  {vaha}:")
    for nm, r in mm.items():
        extra = "  ".join(f"{k} {f(v['b'])}" for k, v in r.items() if k not in ("ANO", "konst", "R2", "n"))
        print(f"    {nm:40} ANO×10: {f(r['ANO']['b'] * 10)} ± {r['ANO']['se'] * 20:.2f}".replace(".", ",") + f"   R² {r['R2']}   {extra}")
print("\nPLACEBO (obce 500+, kontroly senát + velikost + kraj): koeficient ×10 p. b. podílu strany")
for s in STRANY.values():
    a, b = out["placebo"][s], out["placebo_s_ucasti"][s]
    print(f"  {s:10} {f(a['b'] * 10)} ± {a['se'] * 20:.2f}".replace(".", ",") + f"    s účastí PS 2025: {f(b['b'] * 10)} ± {b['se'] * 20:.2f}".replace(".", ",") + f"")
for k, v in out["placebo_ucast"].items():
    print(f"  {k:10} {f(v['b'] * 10)} ± {v['se'] * 20:.2f}".replace(".", ",") + f"  (×10 p. b. účasti)")
print("  korelace ANO (Spearman, obce 500+) s:", out["korelace_ANO_s"])
mm = out["mesta"]
print(f"\nMĚSTA 10 000+ (n={mm['n']}): Spearman ANO×změna {mm['spearman_ANO_d']}, účast22×změna {mm['spearman_u22_d']}, ANO×účast22 {mm['spearman_ANO_u22']}")
print(f"  ANO×10 (senát): {f(mm['regrese_ANO']['b'] * 10)} ± {mm['regrese_ANO']['se'] * 20:.2f}".replace(".", ",") + f"; + účast22: {f(mm['regrese_ANO_u22']['ANO']['b'] * 10)} ± {mm['regrese_ANO_u22']['ANO']['se'] * 20:.2f}".replace(".", ",") + f""
      f" (účast22×10 {f(mm['regrese_ANO_u22']['u22']['b'] * 10)}); + účast PS25: {f(mm['regrese_ANO_ups25']['ANO']['b'] * 10)} ± {mm['regrese_ANO_ups25']['ANO']['se'] * 20:.2f}".replace(".", ",") + f"")
for r in mm["petiny"]:
    print(f"  ANO {r['od']:4.1f}–{r['do']:4.1f} %  měst {r['obci']:3}  účast22 {r['u22']:5.1f}  změna {f(r['zmena'])}  medián {f(r['median_obce'])}  nižší {r['nizsi']}")
print("  nejsilnější ANO:", ", ".join(f"{r['obec']} {r['ANO']} % ({f(r['d'])})" for r in mm["tabulka"][:12]))
print("  nejslabší ANO:", ", ".join(f"{r['obec']} {r['ANO']} % ({f(r['d'])})" for r in mm["tabulka"][-8:]))
print(f"  účast PS25 sama ×10: {f(mm['regrese_ups25']['b'] * 10)} ± {mm['regrese_ups25']['se'] * 20:.2f}".replace(".", ",") + f"; Spearman ANO×účastPS25 {mm['spearman_ANO_ups25']}, účastPS25×změna {mm['spearman_ups25_d']}")
print("  Spearman podíl strany × změna účasti ve městech:", mm["spearman_strany_d"])
print("  model ANO + účast PS25 (+ senát):", {k: v for k, v in mm["regrese_ANO_ups25"].items() if k in ("ANO", "ups25", "R2")})
print("  placebo strany ve městech (×10, kontrola senát):", ", ".join(f"{s} {f(v['b'] * 10)} ± {v['se'] * 20:.2f}".replace(".", ",") + f"" for s, v in mm["placebo"].items()))
for nm in ("mesta_v_UK_MSK_KV", "mesta_mimo_UK_MSK_KV", "mesta_5_10k"):
    v = out[nm]
    print(f"  {nm:22} n {v['n']:3}  ρ ANO×změna {v['spearman_ANO_d']:+.3f}  ANO×10 {f(v['ANO']['b'] * 10)} ± {v['ANO']['se'] * 20:.2f}".replace(".", ",") + f"  s účastí PS25 {f(v['ANO_ups25']['b'] * 10)} ± {v['ANO_ups25']['se'] * 20:.2f}".replace(".", ",") + f"")
for r in out["mesta_5_10k"]["petiny"]:
    print(f"    5–10 tis.: ANO {r['od']:4.1f}–{r['do']:4.1f} %  měst {r['obci']:3}  účast22 {r['u22']:5.1f}  změna {f(r['zmena'])}  medián {f(r['median_obce'])}  nižší {r['nizsi']}")
print("\nUVNITŘ KRAJŮ (obce 500+): Spearman ANO × změna")
for kr, v in sorted(out["kraje"].items(), key=lambda kv: kv[1]["spearman"]):
    print(f"  {kr:16} n {v['n']:4}  ρ {v['spearman']:+.3f}  medián ANO {v['ANO_median']}")
