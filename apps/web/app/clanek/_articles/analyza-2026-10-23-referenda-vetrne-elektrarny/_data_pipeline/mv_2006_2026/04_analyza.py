# -*- coding: utf-8 -*-
"""
Krok 4: analýza referend o VTE 2006–2026. Všechna čísla pro analyza_vte_2006_2026.md se počítají zde.

Vstup:  ../referenda_vte_2006_2026.csv (z 03_dataset_vte.py)
Výstup: vysledky.json (všechna čísla) + tabulky_*.md (tabulky do zprávy) – zpráva se skládá v 05_zprava.py

Analytické soubory (vždy jen HLAVNÍ otázka referenda, tj. 1 řádek = 1 referendum):
  KONANÁ   = konala se (vč. Chvalovic, jejichž výsledek zrušil soud) – pro účast
  PLATNÁ   = konaná, platná (účast nad zákonnou hranicí), výsledek nezrušen soudem – pro výsledky
  Odmítnutí = ve PLATNÉM referendu měla víc hlasů strana proti výstavbě (bez ohledu na závaznost);
              přísnější varianta: závazné odmítnutí.
Logistická regrese: vlastní implementace (IRLS, numpy), test poměrem věrohodnosti (LR, chí-kvadrát, 1 st. v.).
"""
import json
import math
from pathlib import Path

import numpy as np
import pandas as pd

HERE = Path(__file__).resolve().parent
BASE = HERE.parent
d = pd.read_csv(BASE / "referenda_vte_2006_2026.csv", sep=";", decimal=",", encoding="utf-8-sig")
H = d[d.hlavni_otazka == "ano"].copy()
KON = H[H.stav.str.startswith("konáno")].copy()
PL = KON[(KON.platne == "ano") & (KON.stav == "konáno")].copy()
PL = PL[PL.smer_vetsiny_hlasujicich.isin(["pro výstavbu", "proti výstavbě"])]
PL["proti"] = (PL.smer_vetsiny_hlasujicich == "proti výstavbě").astype(int)
PL["proti_zav"] = (PL.smer_vysledku == "proti výstavbě").astype(int)
PL["pro_zav"] = (PL.smer_vysledku == "pro výstavbu").astype(int)
# podíl hlasů pro stranu výstavby (z hlasů ANO+NE)
PL["podpora_pro_pct"] = np.where(PL.ANO_znamena == "pro výstavbu", PL["ano"], PL["ne"]) / (PL["ano"] + PL["ne"]) * 100
for df in (KON, PL):
    df["log10_oby"] = np.log10(df.obyvatel)

R = {}  # všechna čísla


def fmt(x, n=1):
    if x is None or (isinstance(x, float) and math.isnan(x)):
        return "–"
    s = f"{x:,.{n}f}".replace(",", " ").replace(".", ",")
    return s


def pct(a, b, n=0):
    return fmt(100 * a / b, n) if b else "–"


# ------------------------------------------------------------------ logistická regrese
def logit(y, X):
    """IRLS; X bez konstanty. Vrací koef., SE, LR p-hodnoty pro každý prediktor (vůči modelu bez něj)."""
    y = np.asarray(y, float)
    Xc = np.column_stack([np.ones(len(y))] + [np.asarray(x, float) for x in X])

    def fit(M):
        b = np.zeros(M.shape[1])
        for _ in range(100):
            p = 1 / (1 + np.exp(-M @ b))
            W = p * (1 - p)
            H_ = M.T @ (M * W[:, None])
            g = M.T @ (y - p)
            step = np.linalg.solve(H_, g)
            b += step
            if np.max(np.abs(step)) < 1e-10:
                break
        p = np.clip(1 / (1 + np.exp(-M @ b)), 1e-12, 1 - 1e-12)
        ll = np.sum(y * np.log(p) + (1 - y) * np.log(1 - p))
        cov = np.linalg.inv(M.T @ (M * (p * (1 - p))[:, None]))
        return b, np.sqrt(np.diag(cov)), ll

    b, se, ll = fit(Xc)
    lr_p = []
    for j in range(1, Xc.shape[1]):
        _, _, ll0 = fit(np.delete(Xc, j, axis=1))
        lr = 2 * (ll - ll0)
        lr_p.append(math.erfc(math.sqrt(max(lr, 0) / 2)))
    return b, se, lr_p


def spearman(x, y):
    rx = pd.Series(x).rank().values
    ry = pd.Series(y).rank().values
    r = np.corrcoef(rx, ry)[0, 1]
    n = len(x)
    z = r * math.sqrt(n - 1)          # normální aproximace
    return r, math.erfc(abs(z) / math.sqrt(2)), n


def ols(y, X):
    Xc = np.column_stack([np.ones(len(y))] + [np.asarray(x, float) for x in X])
    b, *_ = np.linalg.lstsq(Xc, y, rcond=None)
    res = y - Xc @ b
    s2 = res @ res / (len(y) - Xc.shape[1])
    se = np.sqrt(np.diag(s2 * np.linalg.inv(Xc.T @ Xc)))
    p = [math.erfc(abs(bi / si) / math.sqrt(2)) for bi, si in zip(b, se)]  # normální aproximace
    return b, se, p


# ------------------------------------------------------------------ 0. přehled
R["otazek_vte"] = len(d)
R["referend_vse"] = len(H)
R["konanych"] = len(KON)
R["zruseno_pred"] = int((H.stav == "zrušeno před konáním").sum())
R["planovanych"] = int((H.stav == "plánované").sum())
R["zruseno_soudem"] = int((H.stav == "konáno, zrušeno soudem").sum())
R["neplatnych"] = int((KON.platne == "ne").sum())
R["platnych"] = len(PL)
R["obci_konanych"] = int(KON.kod_obce_CSU.nunique())
R["smer_vysledku"] = KON.smer_vysledku.value_counts().to_dict()
R["proti_n"] = int(PL.proti.sum())
R["proti_pct"] = 100 * PL.proti.mean()
R["proti_zav_n"] = int(PL.proti_zav.sum())
R["pro_zav_n"] = int(PL.pro_zav.sum())
R["nezav_n"] = int((PL.smer_vysledku == "nezávazné").sum())
R["vice_referend_obec"] = KON.groupby(["obec", "okres"]).size().loc[lambda s: s > 1].to_dict()
R["vice_referend_obec"] = {f"{k[0]} ({k[1]})": int(v) for k, v in R["vice_referend_obec"].items()}

# ------------------------------------------------------------------ 1. po letech
roky = range(2006, 2027)
t1 = []
for r in roky:
    k = KON[KON.rok == r]
    p = PL[PL.rok == r]
    t1.append(dict(rok=r, konano=len(k), platnych=len(p), proti=int(p.proti.sum()), pro=int(len(p) - p.proti.sum()),
                   neplatne=int((k.platne == "ne").sum()), zruseno_soudem=int((k.stav != "konáno").sum()),
                   zavazne_proti=int(p.proti_zav.sum()), zavazne_pro=int(p.pro_zav.sum()),
                   nezavazne=int((p.smer_vysledku == "nezávazné").sum())))
T1 = pd.DataFrame(t1)
R["po_letech"] = t1
obdobi = [("2006–2012", 2006, 2012), ("2013–2018", 2013, 2018), ("2019–2023", 2019, 2023), ("2024", 2024, 2024),
          ("2025", 2025, 2025), ("2026 (do 16. 10.)", 2026, 2026)]
t1b = []
for nm, a, b in obdobi:
    p = PL[(PL.rok >= a) & (PL.rok <= b)]
    k = KON[(KON.rok >= a) & (KON.rok <= b)]
    t1b.append(dict(obdobi=nm, konano=len(k), platnych=len(p), proti=int(p.proti.sum()),
                    proti_pct=100 * p.proti.mean() if len(p) else float("nan"),
                    ucast_median=k.ucast_pct.median()))
R["po_obdobich"] = t1b

# ------------------------------------------------------------------ 2. účast
def ucast_stat(s):
    return dict(n=len(s), median=s.median(), prumer=s.mean(), min=s.min(), max=s.max(),
                q1=s.quantile(.25), q3=s.quantile(.75))


R["ucast_vse"] = ucast_stat(KON.ucast_pct)
R["ucast_volby"] = ucast_stat(KON[KON.spolu_s_volbami == "ano"].ucast_pct)
R["ucast_samostatne"] = ucast_stat(KON[KON.spolu_s_volbami == "ne"].ucast_pct)
KON["volby_typ"] = KON.volby.fillna("").str.extract(r"^(komunální|krajské|sněmovní|europarlament|prezidentské)")[0].fillna("samostatně")
R["ucast_dle_voleb"] = {k: ucast_stat(g.ucast_pct) for k, g in KON.groupby("volby_typ")}
R["min_ucast"] = KON.nsmallest(1, "ucast_pct")[["obec", "rok", "ucast_pct"]].to_dict("records")[0]
R["max_ucast"] = KON.nlargest(1, "ucast_pct")[["obec", "rok", "ucast_pct"]].to_dict("records")[0]
# výsledek s volbami × samostatně
for nm, g in PL.groupby("spolu_s_volbami"):
    R[f"proti_volby_{nm}"] = dict(n=len(g), proti=int(g.proti.sum()), pct=100 * g.proti.mean())
# OLS účast ~ log10(obyv) + s volbami
b, se, p = ols(KON.ucast_pct.values, [KON.log10_oby.values, (KON.spolu_s_volbami == "ano").astype(int).values])
R["ols_ucast"] = dict(konst=b[0], log10_oby=b[1], log10_oby_p=p[1], volby=b[2], volby_p=p[2], n=len(KON))

# ------------------------------------------------------------------ 3. velikost obce
bins = [0, 200, 500, 1000, 2000, 10 ** 7]
lab = ["do 199", "200–499", "500–999", "1 000–1 999", "2 000 a více"]
KON["vel"] = pd.cut(KON.obyvatel, bins, right=False, labels=lab)
PL["vel"] = pd.cut(PL.obyvatel, bins, right=False, labels=lab)
t3 = []
for l in lab:
    k = KON[KON.vel == l]
    p = PL[PL.vel == l]
    t3.append(dict(velikost=l, konano=len(k), ucast_median=k.ucast_pct.median(), platnych=len(p),
                   proti=int(p.proti.sum()), proti_pct=100 * p.proti.mean() if len(p) else float("nan"),
                   podpora_pro_median=p.podpora_pro_pct.median()))
R["velikost"] = t3
R["median_obyvatel_konana"] = KON.obyvatel.median()
R["median_opravneni_konana"] = KON.opravneni.median()
r_, p_, n_ = spearman(KON.obyvatel, KON.ucast_pct)
R["spearman_ucast_velikost"] = dict(r=r_, p=p_, n=n_)
r_, p_, n_ = spearman(PL.obyvatel, PL.podpora_pro_pct)
R["spearman_podpora_velikost"] = dict(r=r_, p=p_, n=n_)

# logistické modely: proti ~ log10(obyvatel) [+ rok]
def logit_report(df, cols, label):
    b, se, lr_p = logit(df.proti.values, [df[c].values for c in cols])
    out = dict(n=len(df), proti=int(df.proti.sum()), label=label)
    for j, c in enumerate(cols, start=1):
        out[c] = dict(b=b[j], se=se[j], OR=math.exp(b[j]), OR_lo=math.exp(b[j] - 1.96 * se[j]),
                      OR_hi=math.exp(b[j] + 1.96 * se[j]), p_LR=lr_p[j - 1])
    return out


PL["rok_c"] = PL.rok - 2020
R["logit_vse_velikost"] = logit_report(PL, ["log10_oby"], "2006–2026, velikost")
R["logit_vse_velikost_rok"] = logit_report(PL, ["log10_oby", "rok_c"], "2006–2026, velikost + rok")
R["logit_vse_rok"] = logit_report(PL, ["rok_c"], "2006–2026, rok")
PL["volby01"] = (PL.spolu_s_volbami == "ano").astype(int)
R["logit_vse_velikost_rok_volby"] = logit_report(PL, ["log10_oby", "rok_c", "volby01"], "2006–2026, velikost + rok + volby")
# pravděpodobnost odmítnutí podle modelu pro typické velikosti
b, se, _ = logit(PL.proti.values, [PL.log10_oby.values])
R["logit_predikce"] = {str(n): 100 / (1 + math.exp(-(b[0] + b[1] * math.log10(n)))) for n in (150, 300, 600, 1500, 3000)}

# ------------------------------------------------------------------ 4. kraje
t4 = []
for k, g in KON.groupby("kraj"):
    p = PL[PL.kraj == k]
    t4.append(dict(kraj=k, konano=len(g), platnych=len(p), proti=int(p.proti.sum()),
                   pro=int(len(p) - p.proti.sum()), z_toho_2025_2026=int((g.rok >= 2025).sum())))
T4 = pd.DataFrame(t4).sort_values(["konano", "kraj"], ascending=[False, True])
R["kraje"] = T4.to_dict("records")

# ------------------------------------------------------------------ 5. typ otázky, akcelerační oblasti
R["typ_otazky"] = KON.typ_otazky.value_counts().to_dict()
R["typ_otazky_proti"] = {k: dict(n=len(g), proti=int(g.proti.sum())) for k, g in PL.groupby("typ_otazky")}
R["ao_v_otazce"] = KON[KON.typ_otazky.str.contains("akcelera")][["obec", "rok"]].to_dict("records")
k26 = KON[KON.datum_od == "2026-10-09"]
R["spoustec_2026"] = k26.spoustec_podle_podkladu.value_counts().to_dict()
R["inverzni"] = dict(
    n=int((PL.ANO_znamena == "proti výstavbě").sum()),
    podpora_inv=PL[PL.ANO_znamena == "proti výstavbě"].podpora_pro_pct.mean(),
    podpora_norm=PL[PL.ANO_znamena == "pro výstavbu"].podpora_pro_pct.mean(),
    proti_inv=100 * PL[PL.ANO_znamena == "proti výstavbě"].proti.mean(),
    proti_norm=100 * PL[PL.ANO_znamena == "pro výstavbu"].proti.mean(),
)
R["inverzni_po_letech"] = {int(r): dict(n=len(g), inv=int((g.ANO_znamena == "proti výstavbě").sum()))
                           for r, g in KON.groupby("rok") if r >= 2019}

# ------------------------------------------------------------------ 6. srovnání s AMO (2019–2025, platná)
def amo_blok(a, b, label):
    k = KON[(KON.rok >= a) & (KON.rok <= b)]
    p = PL[(PL.rok >= a) & (PL.rok <= b)]
    kp = k[(k.platne == "ano") & (k.stav == "konáno")]
    out = dict(label=label, konano=len(k), platnych=len(p),
               ucast_prumer_platna=kp.ucast_pct.mean(), ucast_median_platna=kp.ucast_pct.median(),
               ucast_prumer_vse=k.ucast_pct.mean(),
               proti_n=int(p.proti.sum()), proti_pct=100 * p.proti.mean(),
               proti_zav_pct=100 * p.proti_zav.mean(),
               median_opravneni=kp.opravneni.median())
    out["logit_velikost"] = logit_report(p, ["log10_oby"], label)
    out["logit_rok"] = logit_report(p, ["rok_c"], label) if p.rok.nunique() > 1 else None
    r_, p_, n_ = spearman(kp.obyvatel, kp.ucast_pct)
    out["spearman_ucast_velikost"] = dict(r=r_, p=p_, n=n_)
    r_, p_, n_ = spearman(p.obyvatel, p.podpora_pro_pct)
    out["spearman_podpora_velikost"] = dict(r=r_, p=p_, n=n_)
    return out


R["amo_2019_2025"] = amo_blok(2019, 2025, "2019–2025 (období AMO)")
R["amo_2019_2026"] = amo_blok(2019, 2026, "2019–2026 (do 16. 10. 2026)")
R["amo_2006_2026"] = amo_blok(2006, 2026, "2006–2026")
R["amo_2026"] = amo_blok(2026, 2026, "2026 (do 16. 10.)")

# ------------------------------------------------------------------ 7. pro výstavbu – seznam
R["pro_seznam"] = PL[PL.proti == 0][["obec", "okres", "rok", "obyvatel", "ucast_pct", "smer_vysledku"]].to_dict("records")
R["tesne"] = PL.assign(rozdil=(PL["ano"] - PL["ne"]).abs()).nsmallest(6, "rozdil")[["obec", "rok", "ano", "ne", "rozdil", "smer_vysledku"]].to_dict("records")

# ------------------------------------------------------------------ 8. doplňkové testy
def fisher(a, b, c, d_):
    """Oboustranný Fisherův přesný test pro tabulku [[a, b], [c, d]] (a = proti v 1. skupině)."""
    n1, n2, k = a + b, c + d_, a + c
    N = n1 + n2
    def hp(x):
        return math.comb(n1, x) * math.comb(n2, k - x) / math.comb(N, k)
    p0 = hp(a)
    lo, hi = max(0, k - n2), min(k, n1)
    return sum(hp(x) for x in range(lo, hi + 1) if hp(x) <= p0 * (1 + 1e-9))


p26 = PL[PL.rok == 2026]
p1925 = PL[(PL.rok >= 2019) & (PL.rok <= 2025)]
R["fisher_2026_vs_2019_2025"] = dict(
    proti_2026=int(p26.proti.sum()), n_2026=len(p26), proti_1925=int(p1925.proti.sum()), n_1925=len(p1925),
    p=fisher(int(p26.proti.sum()), int(len(p26) - p26.proti.sum()), int(p1925.proti.sum()), int(len(p1925) - p1925.proti.sum())))
pv, ps = PL[PL.spolu_s_volbami == "ano"], PL[PL.spolu_s_volbami == "ne"]
R["fisher_volby"] = fisher(int(pv.proti.sum()), int(len(pv) - pv.proti.sum()), int(ps.proti.sum()), int(len(ps) - ps.proti.sum()))
# 2026 bez otázek s ANO = proti (kontrola, zda vysoké odmítání není dané formulací)
p26n = p26[p26.ANO_znamena == "pro výstavbu"]
R["rok2026_jen_neinverzni"] = dict(n=len(p26n), proti=int(p26n.proti.sum()))
p26kv = p26[p26.datum_od == "2026-10-09"]
R["rok2026_kv"] = dict(n=len(p26kv), proti=int(p26kv.proti.sum()), ucast_median=p26kv.ucast_pct.median())
p26pred = p26[p26.datum_od < "2026-10-09"]
R["rok2026_pred_kv"] = dict(n=len(p26pred), proti=int(p26pred.proti.sum()))

# permutační test: rozdíl průměrné podpory výstavby u otázek s ANO = proti × ANO = pro
rng = np.random.default_rng(20261023)
x = PL.podpora_pro_pct.values
g = (PL.ANO_znamena == "proti výstavbě").values
obs = x[g].mean() - x[~g].mean()
perm = np.array([x[s].mean() - x[~s].mean() for s in (rng.permutation(g) for _ in range(20000))])
R["inverzni"]["perm_p"] = float((np.abs(perm) >= abs(obs)).mean())
R["inverzni"]["rozdil"] = float(obs)
# totéž jen 2019–2025 (období AMO)
m = (PL.rok >= 2019) & (PL.rok <= 2025)
x2, g2 = PL[m].podpora_pro_pct.values, (PL[m].ANO_znamena == "proti výstavbě").values
obs2 = x2[g2].mean() - x2[~g2].mean()
perm2 = np.array([x2[s].mean() - x2[~s].mean() for s in (rng.permutation(g2) for _ in range(20000))])
R["inverzni_2019_2025"] = dict(n_inv=int(g2.sum()), n=len(x2), podpora_inv=float(x2[g2].mean()),
                               podpora_norm=float(x2[~g2].mean()), perm_p=float((np.abs(perm2) >= abs(obs2)).mean()))

# citlivost: dvě referenda v jedné obci týž den (Nové Dvory 2025, Milín 2026) → ponechat jen první
PLd = PL.sort_values("mv_c").drop_duplicates(["kod_obce_CSU", "datum_od"])
KONd = KON.sort_values("mv_c").drop_duplicates(["kod_obce_CSU", "datum_od"])
R["citlivost_dedup"] = dict(konano=len(KONd), platnych=len(PLd), proti_pct=100 * PLd.proti.mean(),
                            ucast_median=KONd.ucast_pct.median(),
                            logit_velikost=logit_report(PLd, ["log10_oby"], "dedup"))

(HERE / "vysledky.json").write_text(json.dumps(R, ensure_ascii=False, indent=1, default=float), encoding="utf-8")
print(json.dumps(R, ensure_ascii=False, indent=1, default=float))
