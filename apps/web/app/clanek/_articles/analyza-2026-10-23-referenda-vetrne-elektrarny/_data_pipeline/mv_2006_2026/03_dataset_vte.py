# -*- coding: utf-8 -*-
"""
Krok 3: čistý datový soubor místních referend o větrných elektrárnách 2006–2026.

Vstupy:
  mv_otazky_vsechny.csv          – z 01_parse_mv.py (tabulka MV, aktualizováno k 16. 10. 2026)
  kandidati_vte.csv              – z 02_kandidati.py
  rucni_kodovani.csv             – RUČNÍ rozhodnutí ke každému kandidátovi (zahrnout, hlavní otázka,
                                   co znamená ANO, typ otázky, stav)
  ../referenda_vetrniky_kv2026.csv – ověřená tabulka 21 obcí 9.–10. 10. 2026 (zápisy komisí)
  vstupy/obce_cz_2026.csv        – číselník obcí ČSÚ (kód, název „Obec (okr. X)“, okres, kraj),
                                   převzato z repo DataTimes (analyza-2026-10-02-kolik-ma-cesko-obci)
  OBY02A (ČSÚ, počet obyvatel obcí k 1. 1.) – cesta v proměnné OBY02A níže (velký soubor)

Výstup: ../referenda_vte_2006_2026.csv (UTF-8 s BOM, středník, desetinná čárka)
        kontrola_nesoulady.csv (všechny automatické kontroly, které něco našly)

Pravidla platnosti a závaznosti (zák. 22/2004 Sb., § 48):
  do 30. 6. 2008: platné při účasti ≥ 50 %; závazné, má-li vítězná odpověď nadpoloviční většinu hlasujících
  od 1. 7. 2008:  platné při účasti ≥ 35 %; závazné, má-li vítězná odpověď nadpoloviční většinu hlasujících
                  A ZÁROVEŇ hlasy aspoň 25 % oprávněných
Hlasující (mimo 2026) = round(oprávnění × účast) – MV počet hlasujících neuvádí.
"""
import math
import re
from pathlib import Path

import pandas as pd

HERE = Path(__file__).resolve().parent
BASE = HERE.parent
# ČSÚ OBY02A (počet obyvatel v obcích), stáhnout z https://data.csu.gov.cz/opendata/sady/OBY02A/distribuce/csv (~195 MB)
OBY02A = BASE / "vstupy" / "oby02a.csv"
OUT = BASE / "referenda_vte_2006_2026.csv"

# ---------------------------------------------------------------- volby (celostátní, řádné)
# zdroj: volby.cz (ČSÚ); senát se volí jen ve třetině obvodů
VOLBY = [
    ("2006-06-02", "2006-06-03", "sněmovní"),
    ("2006-10-20", "2006-10-21", "komunální + senát (1. kolo)"),
    ("2006-10-27", "2006-10-28", "senát (2. kolo)"),
    ("2008-10-17", "2008-10-18", "krajské + senát (1. kolo)"),
    ("2008-10-24", "2008-10-25", "senát (2. kolo)"),
    ("2009-06-05", "2009-06-06", "europarlament"),
    ("2010-05-28", "2010-05-29", "sněmovní"),
    ("2010-10-15", "2010-10-16", "komunální + senát (1. kolo)"),
    ("2010-10-22", "2010-10-23", "senát (2. kolo)"),
    ("2012-10-12", "2012-10-13", "krajské + senát (1. kolo)"),
    ("2012-10-19", "2012-10-20", "senát (2. kolo)"),
    ("2013-01-11", "2013-01-12", "prezidentské (1. kolo)"),
    ("2013-01-25", "2013-01-26", "prezidentské (2. kolo)"),
    ("2013-10-25", "2013-10-26", "sněmovní"),
    ("2014-05-23", "2014-05-24", "europarlament"),
    ("2014-10-10", "2014-10-11", "komunální + senát (1. kolo)"),
    ("2014-10-17", "2014-10-18", "senát (2. kolo)"),
    ("2016-10-07", "2016-10-08", "krajské + senát (1. kolo)"),
    ("2016-10-14", "2016-10-15", "senát (2. kolo)"),
    ("2017-10-20", "2017-10-21", "sněmovní"),
    ("2018-01-12", "2018-01-13", "prezidentské (1. kolo)"),
    ("2018-01-26", "2018-01-27", "prezidentské (2. kolo)"),
    ("2018-10-05", "2018-10-06", "komunální + senát (1. kolo)"),
    ("2018-10-12", "2018-10-13", "senát (2. kolo)"),
    ("2019-05-24", "2019-05-25", "europarlament"),
    ("2020-10-02", "2020-10-03", "krajské + senát (1. kolo)"),
    ("2020-10-09", "2020-10-10", "senát (2. kolo)"),
    ("2021-10-08", "2021-10-09", "sněmovní"),
    ("2022-09-23", "2022-09-24", "komunální + senát (1. kolo)"),
    ("2022-09-30", "2022-10-01", "senát (2. kolo)"),
    ("2023-01-13", "2023-01-14", "prezidentské (1. kolo)"),
    ("2023-01-27", "2023-01-28", "prezidentské (2. kolo)"),
    ("2024-06-07", "2024-06-08", "europarlament"),
    ("2024-09-20", "2024-09-21", "krajské + senát (1. kolo)"),
    ("2024-09-27", "2024-09-28", "senát (2. kolo)"),
    ("2025-10-03", "2025-10-04", "sněmovní"),
    ("2026-10-09", "2026-10-10", "komunální + senát (1. kolo)"),
    ("2026-10-16", "2026-10-17", "senát (2. kolo)"),
]


def volby_pro(od, do):
    hits = [t for a, b, t in VOLBY if not (do < a or od > b)]
    return " / ".join(hits) if hits else None


# ---------------------------------------------------------------- opravy názvů MV → ČSÚ
NAZEV_FIX = {
    "Jammé": "Jamné",                                    # překlep v tabulce MV
    "Abertamy a přidružená část Hřebečná": "Abertamy",
}
# MV uvádí okres „Plzeň“; Střížovice v Plzeňském kraji jsou jen jedny (okr. Plzeň-jih)
OKRES_FIX = {("Střížovice", "Plzeň"): "Plzeň-jih"}

# ---------------------------------------------------------------- spouštěč 2026 (z referenční tabulky,
# sloupce investor_developer / stav_projektu / poznamka; ručně shrnuto)
SPOUSTEC_2026 = {
    "Dětřichov": "konkrétní projekt / investor",       # ČEZ, smlouva o spolupráci 2024
    "Mikuleč": "konkrétní projekt / investor",         # záměry S & M Development, Enerconet (MO)
    "Kamenná Horka": "konkrétní projekt / investor",   # S&M Develop (jen média)
    "Sklené": "konkrétní projekt / investor",          # ČEZ, smlouvy 2025
    "Kačice": "konkrétní projekt / investor",          # NOHO, plánovací smlouva, EIA
    "Kralovice": "konkrétní projekt / investor",       # SmartTech
    "Kožlany": "konkrétní projekt / investor",         # meridian Nová Energie
    "Žihle": "konkrétní projekt / investor",           # ČEZ OZ
    "Zátor": "konkrétní projekt / investor",           # ČEZ, EIA 10/2026
    "Cítoliby": "konkrétní projekt / investor",        # meridian Nová Energie
    "Bystrá nad Jizerou": "konkrétní projekt / investor",  # NOHO
    "Staré Heřminovy": "konkrétní projekt / investor",  # „místní firma“, dohoda o spolupráci (investor nezjištěn)
    "Petroupim": "akcelerační oblast",                 # AOV77
    "Soběhrdy": "akcelerační oblast",                  # AOV77
    "Teplýšovice": "akcelerační oblast",               # AOV77
    "Horní Benešov": "akcelerační oblast",             # navržená AOV59, žádný investor
    "Radenín": "akcelerační oblast + dřívější nabídka investora",  # AOV48 + nabídka JRD (neprojednává se)
    "Šebířov": "bez projektu (preventivně)",
    "Maršov u Úpice": "bez projektu (preventivně)",
    "Měčín": "nezjištěno (zájem firem, bez projektu)",
    "Petrovice": "nezjištěno",
}


def num(x):
    """CSV s desetinnou čárkou → float"""
    if x is None or (isinstance(x, float) and math.isnan(x)) or x == "":
        return None
    return float(str(x).replace(" ", "").replace(",", "."))


def main():
    mv = pd.read_csv(HERE / "mv_otazky_vsechny.csv", sep=";", decimal=",", encoding="utf-8-sig")
    kand = pd.read_csv(HERE / "kandidati_vte.csv", sep=";", decimal=",", encoding="utf-8-sig")
    kod = pd.read_csv(HERE / "rucni_kodovani.csv", sep=";", encoding="utf-8-sig", dtype=str).fillna("")
    kod["radek"] = kod.radek.astype(int)

    # --- kontrola: každý kandidát má ruční rozhodnutí a naopak
    miss = set(kand.radek) - set(kod.radek)
    extra = set(kod.radek) - set(kand.radek)
    assert not miss, f"kandidáti bez ručního kódu: {sorted(miss)}"
    assert not extra, f"ruční kód bez kandidáta: {sorted(extra)}"
    chk = kod.merge(mv[["radek", "mv_c", "obec_mv"]], on="radek")
    for _, r in chk.iterrows():
        assert int(r["mv_c_y"]) == int(r["mv_c_x"]), f"nesedí č. MV u řádku {r.radek}"

    d = kod[kod.zahrnout == "ano"].merge(mv, on="radek", suffixes=("_kod", ""))
    d["obec"] = d.obec_mv.map(lambda s: NAZEV_FIX.get(s, s))

    # --- kód obce ČSÚ + okres + kraj
    ob = pd.read_csv(HERE / "vstupy" / "obce_cz_2026.csv", dtype=str)
    ob["obec"] = ob.nazev.str.replace(r"\s*\(okr\..*\)$", "", regex=True)
    d["okres_mv"] = [OKRES_FIX.get((o, k), k) for o, k in zip(d.obec, d.okres_mv)]
    d["klic"] = d.obec + " (okr. " + d.okres_mv + ")"
    m = d.merge(ob[["nazev", "kod_obce", "okres", "kraj"]], left_on="klic", right_on="nazev", how="left")
    nenalez = m[m.kod_obce.isna()][["radek", "obec", "okres_mv"]]
    assert nenalez.empty, f"nenalezené obce:\n{nenalez}"
    d = m.drop(columns=["nazev"])

    # --- počet obyvatel k 1. 1. roku konání (ČSÚ OBY02A)
    kody = set(d.kod_obce)
    parts = []
    for ch in pd.read_csv(OBY02A, dtype=str, chunksize=200_000):
        ch = ch[(ch.UZ01234596C.isin(kody)) & (ch.Ukazatel.str.startswith("Počet obyvatel k 1. 1."))
                & (ch.POHL2 == "0")]
        parts.append(ch[["UZ01234596C", "Roky", "Hodnota"]])
    oby = pd.concat(parts).rename(columns={"UZ01234596C": "kod_obce", "Roky": "rok_oby", "Hodnota": "obyvatel"})
    oby["obyvatel"] = oby.obyvatel.astype(int)
    d["rok"] = d.datum_od.str[:4].astype(int)
    d["rok_oby"] = d.rok.clip(upper=int(oby.rok_oby.astype(int).max())).astype(str)
    d = d.merge(oby, on=["kod_obce", "rok_oby"], how="left")
    assert d.obyvatel.notna().all(), d[d.obyvatel.isna()][["obec", "rok_oby"]]

    # --- výsledky: MV, u 9.–10. 10. 2026 referenční tabulka (primární zápisy)
    ref = pd.read_csv(BASE / "referenda_vetrniky_kv2026.csv", sep=";", encoding="utf-8-sig", dtype=str)
    ref["q"] = ref.otazka_c.str.extract(r"^(\d)").astype(int)
    ref_q_map = {("Soběhrdy", 1): 2, ("Horní Benešov", 1): 2, ("Maršov u Úpice", 2): 2}  # ref.q → pořadí v MV
    ref["mv_q"] = [ref_q_map.get((o, q), q) for o, q in zip(ref.obec, ref.q)]
    nesoulady = []

    rows = []
    for _, r in d.iterrows():
        o = dict(
            mv_c=int(r.mv_c), mv_radek_xlsx=int(r.radek), obec=r.obec, okres=r.okres, kraj=r.kraj,
            kod_obce_CSU=r.kod_obce, obyvatel=int(r.obyvatel), obyvatel_k_1_1_roku=int(r.rok_oby),
            datum_od=r.datum_od, datum_do=r.datum_do, rok=int(r.rok),
            otazka_poradi_MV=int(r.otazka_poradi), hlavni_otazka=r.hlavni_otazka,
            zneni_otazky=re.sub(r"\s*(Zrušeno KS.*|Dne 16\. 10\. referendum.*)$", "", r.otazka or ""),
            typ_otazky=r.typ_otazky, ANO_znamena=r.ANO_znamena,
            spoustec_podle_podkladu=SPOUSTEC_2026.get(r.obec, "") if r.datum_od == "2026-10-09" else "",
            stav=r.stav, poznamka_kodovani=r.poznamka_kodovani, poznamka_MV=r.poznamka_mv if isinstance(r.poznamka_mv, str) else "",
        )
        v = volby_pro(r.datum_od, r.datum_do)
        o["spolu_s_volbami"] = "ano" if v else "ne"
        o["volby"] = v or ""
        if not v and r.datum_od != r.datum_do:
            nesoulady.append((r.obec, r.datum_od, "dvoudenní referendum bez shody s celostátními volbami (doplňovací volby?)"))

        kontrola = []
        if r.stav in ("zrušeno před konáním", "plánované"):
            o.update(zdroj_vysledku="", opravneni=None)
            rows.append(o)
            continue

        rr = ref[(ref.obec == r.obec) & (ref.mv_q == r.otazka_poradi)] if r.datum_od == "2026-10-09" else pd.DataFrame()
        if r.datum_od == "2026-10-09":
            assert len(rr) == 1, f"2026 bez reference: {r.obec} q{r.otazka_poradi}"
            x = rr.iloc[0]
            assert x.ANO_znamena == r.ANO_znamena, f"ANO_znamena nesedí s referencí: {r.obec}"
            opr, hl = int(x.opravneni), int(x.hlasujici_vydane_listky)
            ano, ne, ost = int(x["ano"]), int(x["ne"]), int(x["ostatni_zdrzeni_neplatne_prazdne"])
            o["zdroj_vysledku"] = "zápis komise (referenční tabulka KV 2026)"
            # porovnání s MV
            if pd.isna(r.opravneni):
                kontrola.append("MV k 16. 10. 2026 bez výsledku")
            else:
                for nm, a, b in (("oprávnění", r.opravneni, opr), ("ANO", r.ano_n, ano), ("NE", r.ne_n, ne)):
                    if not pd.isna(a) and int(a) != b:
                        kontrola.append(f"MV {nm} {int(a)} × zápis {b}")
                if abs(r.ucast_pct_mv - 100 * hl / opr) > 0.05:
                    kontrola.append(f"MV účast {r.ucast_pct_mv:.2f} % × zápis {100*hl/opr:.2f} %")
                for nm, p, n in (("ANO", r.ano_pct, ano), ("NE", r.ne_pct, ne)):
                    if not pd.isna(p) and abs(p - 100 * n / hl) > 0.05:
                        kontrola.append(f"MV {nm} {p:.2f} % × zápis {100*n/hl:.2f} %")
            o.update(opravneni=opr, hlasujici=hl, ano=ano, ne=ne, ostatni_neplatne=ost)
        else:
            opr = int(r.opravneni)
            hl = round(opr * r.ucast_pct_mv / 100)
            ano, ne = int(r.ano_n), int(r.ne_n)
            o["zdroj_vysledku"] = "MV (tabulka hlášení)"
            o.update(opravneni=opr, hlasujici=hl, ano=ano, ne=ne, ostatni_neplatne=None)
            if ano + ne > hl:
                kontrola.append(f"ANO+NE ({ano + ne}) > dopočtení hlasující ({hl})")
            # hlasující odvozené z procent MV
            for nm, p, n in (("ANO", r.ano_pct, ano), ("NE", r.ne_pct, ne)):
                if not pd.isna(p) and p > 0 and abs(100 * n / hl - p) > 0.6:
                    kontrola.append(f"MV {nm} {p:.2f} % × přepočet z účasti {100*n/hl:.2f} %")
        o["hlasujici_dopocet"] = "ne" if r.datum_od == "2026-10-09" else "ano (oprávnění × účast)"
        if r.obec == "Měčín":
            o["hlasujici_dopocet"] = "ano (oprávnění × účast MV; zápis jen v %)"

        o["ucast_pct"] = round(100 * hl / opr, 2)
        o["ano_pct_hlasujicich"] = round(100 * ano / hl, 2)
        o["ne_pct_hlasujicich"] = round(100 * ne / hl, 2)
        o["vitezna_odpoved"] = "ANO" if ano > ne else ("NE" if ne > ano else "remíza")
        win = max(ano, ne)
        o["vitez_pct_opravnenych"] = round(100 * win / opr, 2)
        stary = r.datum_od < "2008-07-01"
        platne = (hl / opr >= (0.5 if stary else 0.35))
        zavazne = platne and (win > hl / 2) and (stary or win >= 0.25 * opr) and ano != ne
        o["platne"] = "ano" if platne else "ne"
        o["zavazne"] = "ano" if zavazne else "ne"
        o["pravidla"] = "do 30. 6. 2008 (účast 50 %)" if stary else "od 1. 7. 2008 (účast 35 %, 25 % oprávněných)"
        # MV platnost / závaznost
        o["platnost_MV"] = r.platnost_mv if isinstance(r.platnost_mv, str) else ""
        o["zavaznost_MV"] = r.zavaznost_raw if isinstance(r.zavaznost_raw, str) else ""
        if o["platnost_MV"] in ("ANO", "NE") and (o["platnost_MV"] == "ANO") != platne:
            kontrola.append(f"platnost: MV {o['platnost_MV']} × přepočet {o['platne']}")
        mz = re.match(r"^(ANO|NE)", o["zavaznost_MV"])
        if mz and (mz.group(1) == "ANO") != zavazne:
            kontrola.append(f"závaznost: MV {o['zavaznost_MV']} × přepočet {o['zavazne']}")

        smer_ano = r.ANO_znamena
        if o["vitezna_odpoved"] == "remíza" or smer_ano not in ("pro výstavbu", "proti výstavbě"):
            sv = "jiné / nejasné"
        elif o["vitezna_odpoved"] == "ANO":
            sv = smer_ano
        else:
            sv = "proti výstavbě" if smer_ano == "pro výstavbu" else "pro výstavbu"
        o["smer_vetsiny_hlasujicich"] = sv
        if r.stav == "konáno, zrušeno soudem":
            o["smer_vysledku"] = "zrušeno soudem"
        elif not platne:
            o["smer_vysledku"] = "neplatné"
        elif not zavazne:
            o["smer_vysledku"] = "nezávazné"
        else:
            o["smer_vysledku"] = sv
        if r.datum_od == "2026-10-09":
            x = rr.iloc[0]
            for nm, a, b in (("platnost", x.platne_ucast_35, o["platne"]), ("závaznost", x.zavazne_50_a_25, o["zavazne"]),
                             ("směr", x.smer_vysledku, o["smer_vysledku"])):
                if a != b:
                    kontrola.append(f"REFERENCE {nm}: {a} × přepočet {b}")
        pomer = opr / r.obyvatel
        if not 0.6 <= pomer <= 0.97:
            kontrola.append(f"poměr oprávnění/obyvatelé {pomer:.2f} – ověřit přiřazení obce")
        o["kontrola"] = "; ".join(kontrola)
        for k in kontrola:
            nesoulady.append((r.obec, r.datum_od, k))
        rows.append(o)

    out = pd.DataFrame(rows)
    out.loc[out.stav == "plánované", "smer_vysledku"] = "plánované"
    out.loc[out.stav == "zrušeno před konáním", "smer_vysledku"] = "nekonalo se (zrušeno)"
    cols = ["mv_c", "obec", "okres", "kraj", "kod_obce_CSU", "obyvatel", "obyvatel_k_1_1_roku",
            "datum_od", "datum_do", "rok", "spolu_s_volbami", "volby", "stav",
            "otazka_poradi_MV", "hlavni_otazka", "zneni_otazky", "typ_otazky", "ANO_znamena", "spoustec_podle_podkladu",
            "opravneni", "hlasujici", "hlasujici_dopocet", "ucast_pct", "ano", "ne", "ostatni_neplatne",
            "ano_pct_hlasujicich", "ne_pct_hlasujicich", "vitezna_odpoved", "vitez_pct_opravnenych",
            "platne", "zavazne", "pravidla", "platnost_MV", "zavaznost_MV",
            "smer_vetsiny_hlasujicich", "smer_vysledku", "zdroj_vysledku", "kontrola",
            "poznamka_kodovani", "poznamka_MV", "mv_radek_xlsx"]
    out = out[cols].sort_values(["datum_od", "obec", "mv_c", "otazka_poradi_MV"])
    for c in ("opravneni", "hlasujici", "ano", "ne", "ostatni_neplatne"):
        out[c] = out[c].astype("Int64")
    out.to_csv(OUT, sep=";", decimal=",", index=False, encoding="utf-8-sig")
    pd.DataFrame(nesoulady, columns=["obec", "datum", "nesoulad"]).to_csv(
        HERE / "kontrola_nesoulady.csv", sep=";", index=False, encoding="utf-8-sig")
    print(f"řádků (otázek o VTE): {len(out)}, referend (č. MV): {out.mv_c.nunique()}, hlavních otázek: {(out.hlavni_otazka=='ano').sum()}")
    print(out.smer_vysledku.value_counts().to_string())
    print("\nNESOULADY / KONTROLY:")
    for n in nesoulady:
        print("  ", n)


if __name__ == "__main__":
    main()
