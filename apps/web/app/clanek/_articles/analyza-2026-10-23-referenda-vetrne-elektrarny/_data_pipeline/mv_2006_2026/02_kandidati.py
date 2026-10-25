# -*- coding: utf-8 -*-
"""
Krok 2: široké vyhledání kandidátů – otázek, které by se mohly týkat větrných elektráren.

Vstup:  mv_otazky_vsechny.csv (z 01_parse_mv.py)
Výstup: kandidati_vte.csv  – každá otázka, která obsahuje některé z hesel (úmyslně široce),
        se sloupcem `heslo` (co se chytilo). Ruční rozhodnutí je v rucni_kodovani.csv.

Hesla: větrn*, VTE, větrník, větrný park, akcelerač*, turbín*, obnoviteln*, OZE,
        elektrár* (chytá i jaderné/fotovoltaické – vyřazuje se ručně), vítr/větru.
Kandidát se hledá v textu otázky; navíc v textu hlavního řádku referenda (kvůli buňkám s více otázkami).
"""
import re
from pathlib import Path
import pandas as pd

HERE = Path(__file__).resolve().parent
df = pd.read_csv(HERE / "mv_otazky_vsechny.csv", sep=";", decimal=",", encoding="utf-8-sig")

HESLA = {
    "vetrn": r"v[ěe]trn",
    "VTE": r"\bVTE\b",
    "vetrnik": r"v[ěe]trník",
    "akcelerac": r"akcelera",
    "turbin": r"turbín",
    "obnovitel": r"obnoviteln",
    "OZE": r"\bOZE\b",
    "elektrar": r"elektrár",
    "vitr": r"\bv[ěi]t(r|ru|rem)\b",
}

def hesla(t):
    t = t if isinstance(t, str) else ""
    return ",".join(k for k, p in HESLA.items() if re.search(p, t, flags=0 if k in ("VTE", "OZE") else re.I))

df["heslo"] = df["otazka"].map(hesla)
kand = df[df["heslo"] != ""].copy()
kand.to_csv(HERE / "kandidati_vte.csv", sep=";", index=False, encoding="utf-8-sig", decimal=",")
print(f"kandidátních otázek: {len(kand)} (z {len(df)}), referend: {kand['mv_c'].nunique()}")
for _, r in kand.iterrows():
    print(f"\n[{r.radek}] č.{r.mv_c} q{r.otazka_poradi} {r.obec_mv} ({r.okres_mv}, {r.kraj_mv}) {r.datum_raw} | hesla={r.heslo}")
    print("   OTÁZKA:", r.otazka)
    print(f"   opr={r.opravneni} účast={r.ucast_pct_mv} plat={r.platnost_mv} ANO={r.ano_raw} NE={r.ne_raw} záv={r.zavaznost_raw}")
