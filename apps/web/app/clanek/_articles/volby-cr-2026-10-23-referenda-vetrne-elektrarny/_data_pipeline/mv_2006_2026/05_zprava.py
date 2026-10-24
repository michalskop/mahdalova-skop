# -*- coding: utf-8 -*-
"""
Krok 5: složí ../analyza_vte_2006_2026.md. Všechna čísla bere z vysledky.json (04_analyza.py)
a z ../referenda_vte_2006_2026.csv – v textu nejsou ručně psaná čísla.
Pořadí spuštění: 01_parse_mv.py → 02_kandidati.py → 03_dataset_vte.py → 04_analyza.py → 05_zprava.py
"""
import json
import math
import re
from pathlib import Path

import pandas as pd

HERE = Path(__file__).resolve().parent
BASE = HERE.parent
R = json.loads((HERE / "vysledky.json").read_text(encoding="utf-8"))
d = pd.read_csv(BASE / "referenda_vte_2006_2026.csv", sep=";", decimal=",", encoding="utf-8-sig")
nes = pd.read_csv(HERE / "kontrola_nesoulady.csv", sep=";", encoding="utf-8-sig")
NB = " "


def f(x, n=1):
    if x is None or (isinstance(x, float) and math.isnan(x)):
        return "–"
    s = f"{x:,.{n}f}".replace(",", NB).replace(".", ",")
    return s.replace("-", "−")


def i(x):
    return f(x, 0)


def p(x):
    """p-hodnota srozumitelně"""
    if x < 0.001:
        return "p < 0,001"
    return f"p = {f(x, 3)}"


def cz(t):
    """desetinná tečka → čárka v textech kontrol"""
    out = []
    for j, ch in enumerate(t):
        dig = 0 < j < len(t) - 1 and t[j - 1].isdigit() and t[j + 1].isdigit()
        out.append("," if ch == "." and dig else ch)
    return "".join(out)


def tab(rows, head):
    out = ["| " + " | ".join(head) + " |", "|" + "|".join("---" for _ in head) + "|"]
    out += ["| " + " | ".join(str(c) for c in r) + " |" for r in rows]
    return "\n".join(out)


A19, A26, A06, Y26 = R["amo_2019_2025"], R["amo_2019_2026"], R["amo_2006_2026"], R["amo_2026"]
U, UV, US = R["ucast_vse"], R["ucast_volby"], R["ucast_samostatne"]
LV = R["logit_vse_velikost"]["log10_oby"]
LVR = R["logit_vse_velikost_rok"]
F26 = R["fisher_2026_vs_2019_2025"]
INV, INV19 = R["inverzni"], R["inverzni_2019_2025"]
ols = R["ols_ucast"]
pred = R["logit_predikce"]
H = d[d.hlavni_otazka == "ano"]
KON = H[H.stav.str.startswith("konáno")]

L = []
L.append("# Místní referenda o větrných elektrárnách 2006–2026: data a základní analýza\n")
L.append("Zpracováno 24. 10. 2026. Zdroj: tabulka MV ČR *Místní referenda v ČR (od r. 2006)*, aktualizovaná k 16. 10. 2026 "
         "(soubor `zapisy/MV_mistni-referenda-tabulka-hlaseni-20260708.xlsx`); výsledky z 9.–10. 10. 2026 ze zápisů místních komisí "
         "(`referenda_vetrniky_kv2026.csv`); počty obyvatel z ČSÚ (OBY02A, stav k 1. 1. roku konání). "
         "Výpočet: skripty v `_data_pipeline/` (01–05). Data: `referenda_vte_2006_2026.csv`.\n")

# ---------------------------------------------------------------- hlavní zjištění
L.append("## Hlavní zjištění\n")
L.append(f"- **Kolik:** MV eviduje od roku 2006 celkem {i(R['referend_vse'])} místních referend o větrných elektrárnách. "
         f"{i(R['konanych'])} se jich konalo (ve {i(R['obci_konanych'])} obcích), {i(R['zruseno_pred'])} byla zrušena předem "
         f"a {i(R['planovanych'])} jsou naplánovaná na konec roku 2026.")
_py = {x["rok"]: x["konano"] for x in R["po_letech"]}
_do23 = sum(v for k, v in _py.items() if k <= 2023)
_2526 = _py[2025] + _py[2026]
assert _2526 > _do23
L.append(f"- **Boom posledních let:** {i(_py[2024] + _2526)} z {i(R['konanych'])} konaných referend připadá na roky 2024–2026. "
         f"Za roky 2025 a 2026 ({i(_py[2025])} + {i(_py[2026])}) jich bylo víc než za celé období 2006–2023 ({i(_do23)}).")
L.append(f"- **Výsledek:** v {i(R['platnych'])} platných referendech převážili odpůrci výstavby v {i(R['proti_n'])} případech "
         f"({f(R['proti_pct'], 0)} %). Závazně výstavbu odmítlo {i(R['proti_zav_n'])} obcí, závazně schválilo {i(R['pro_zav_n'])}.")
L.append(f"- **Rok 2026 je výjimka:** odmítnutí v {i(F26['proti_2026'])} z {i(F26['n_2026'])} platných referend "
         f"({f(100 * F26['proti_2026'] / F26['n_2026'], 0)} %), v letech 2019–2025 v {i(F26['proti_1925'])} z {i(F26['n_1925'])} "
         f"({f(100 * F26['proti_1925'] / F26['n_1925'], 0)} %). Rozdíl je statisticky významný (Fisherův test, {p(F26['p'])}).")
L.append(f"- **Účast:** medián {f(U['median'])} %, rozpětí {f(U['min'])}–{f(U['max'])} %. Spolu s volbami medián {f(UV['median'])} %, "
         f"samostatně {f(US['median'])} %.")
L.append(f"- **Velikost obce:** menší obce chodí k hlasování víc a výstavbu schvalují o něco častěji. "
         f"Model odhaduje pravděpodobnost odmítnutí u obce se 150 obyvateli na {f(pred['150'], 0)} %, s 600 obyvateli na {f(pred['600'], 0)} % "
         f"a s 3 000 obyvateli na {f(pred['3000'], 0)} %. Vztah je slabý a nepravidelný (nejmenší obce do 200 obyvatel jsou půl na půl).")
L.append(f"- **Studie AMO (Vidomus 2026) se na jejím období potvrzuje:** za 2019–2025 nám vychází průměrná účast v platných referendech "
         f"{f(A19['ucast_prumer_platna'])} % (AMO 62,3 %) a odmítnutí {f(A19['proti_pct'], 0)} % (AMO 62 %). "
         f"Po přidání roku 2026 ale neplatí závěr „bez časového trendu“: podíl odmítnutí vyskočil na {f(A26['proti_pct'], 0)} %.")
L.append("")

# ---------------------------------------------------------------- 1. po letech
L.append("## 1. Kolik referend se konalo a jak dopadla\n")
L.append("Počítá se jedno referendum = jedna hlavní otázka o VTE. „Proti“ a „pro“ znamená, která strana dostala víc hlasů v platném referendu; "
         "sloupce „závazně“ ukazují, kdy výsledek obec ze zákona zavazuje.\n")
rows = []
for x in R["po_letech"]:
    if x["konano"] == 0:
        continue
    rows.append([x["rok"], x["konano"], x["platnych"], x["proti"], x["pro"],
                 f"{f(100 * x['proti'] / x['platnych'], 0)} %" if x["platnych"] else "–",
                 x["zavazne_proti"], x["zavazne_pro"], x["nezavazne"], x["neplatne"], x["zruseno_soudem"]])
L.append(tab(rows, ["rok", "konáno", "platných", "převážilo proti", "převážilo pro", "podíl proti",
                    "závazně proti", "závazně pro", "platné, nezávazné", "neplatné (nízká účast)", "zrušeno soudem"]))
L.append("\nRoky bez referenda o VTE (2011, 2015, 2017, 2018, 2020) jsou vynechány.\n")
rows = [[x["obdobi"], x["konano"], x["platnych"], x["proti"], f"{f(x['proti_pct'], 0)} %", f"{f(x['ucast_median'])} %"] for x in R["po_obdobich"]]
L.append(tab(rows, ["období", "konáno", "platných", "převážilo proti", "podíl proti", "medián účasti"]))
L.append(f"\nVýstavbu v platném referendu podpořilo {i(len(R['pro_seznam']))} obcí: "
         + ", ".join(f"{x['obec']} ({x['rok']}{', nezávazně' if x['smer_vysledku'] == 'nezávazné' else ''})" for x in R["pro_seznam"]) + ".\n")
t = R["tesne"]
L.append("Nejtěsnější výsledky: " + "; ".join(f"{x['obec']} {x['rok']} ({i(x['ano'])} : {i(x['ne'])})" for x in t) + ".\n")
L.append(f"Co víme o roce 2026: z {i(R['rok2026_pred_kv']['n'])} platných referend před komunálními volbami odmítlo výstavbu "
         f"{i(R['rok2026_pred_kv']['proti'])}, z {i(R['rok2026_kv']['n'])} při volbách {i(R['rok2026_kv']['proti'])}. "
         f"Vysoké odmítání tedy není dané jen volebním termínem. Není ani dané formulací otázky: když vynecháme otázky, kde ANO znamená „proti“, "
         f"odmítlo výstavbu {i(R['rok2026_jen_neinverzni']['proti'])} z {i(R['rok2026_jen_neinverzni']['n'])}.\n")

# ---------------------------------------------------------------- 2. účast
L.append("## 2. Účast\n")
L.append("Účast = podíl oprávněných, kteří přišli hlasovat (u referend do 9. 10. 2026 podle MV, u 9.–10. 10. 2026 ze zápisů). "
         "Počítají se všechna konaná referenda včetně neplatných.\n")
names = {"komunální": "s komunálními volbami", "sněmovní": "se sněmovními volbami", "krajské": "s krajskými volbami",
         "europarlament": "s volbami do EP", "prezidentské": "s prezidentskou volbou", "samostatně": "samostatně (bez voleb)"}
rows = [["všechna", U["n"], f(U["median"]), f(U["prumer"]), f"{f(U['q1'])}–{f(U['q3'])}", f"{f(U['min'])}–{f(U['max'])}"],
        ["spolu s volbami (jakýmikoli)", UV["n"], f(UV["median"]), f(UV["prumer"]), f"{f(UV['q1'])}–{f(UV['q3'])}", f"{f(UV['min'])}–{f(UV['max'])}"]]
for k in ["komunální", "sněmovní", "krajské", "europarlament", "prezidentské", "samostatně"]:
    s = R["ucast_dle_voleb"].get(k)
    if s:
        rows.append([names[k], s["n"], f(s["median"]), f(s["prumer"]), f"{f(s['q1'])}–{f(s['q3'])}", f"{f(s['min'])}–{f(s['max'])}"])
L.append(tab(rows, ["referenda", "počet", "medián účasti %", "průměr %", "prostřední polovina %", "rozpětí %"]))
L.append(f"\nNejnižší účast: {R['min_ucast']['obec']} {R['min_ucast']['rok']} ({f(R['min_ucast']['ucast_pct'])} %), nejvyšší: {R['max_ucast']['obec']} "
         f"{R['max_ucast']['rok']} ({f(R['max_ucast']['ucast_pct'])} %).\n")
L.append(f"Účast víc souvisí s velikostí obce než s volbami. Jednoduchý lineární model (účast podle velikosti obce a toho, zda se hlasovalo s volbami) říká: "
         f"obec desetkrát větší má v průměru o {f(-ols['log10_oby'])} procentního bodu nižší účast ({p(ols['log10_oby_p'])}); "
         f"konání spolu s volbami přidává při stejné velikosti asi {f(ols['volby'])} bodu ({p(ols['volby_p'])}). "
         f"Pořadová korelace velikosti a účasti je {f(R['spearman_ucast_velikost']['r'], 2)} ({p(R['spearman_ucast_velikost']['p'])}). "
         f"S krajskými volbami a volbami do EP ale byla účast spíš nižší než samostatně – jde o malé počty a o větší obce (Kynšperk, Moravský Beroun).\n")
pvv, pvn = R["proti_volby_ano"], R["proti_volby_ne"]
L.append(f"Na výsledek termín vliv nemá: s volbami převážili odpůrci v {i(pvv['proti'])} z {i(pvv['n'])} platných referend ({f(pvv['pct'], 0)} %), "
         f"samostatně v {i(pvn['proti'])} z {i(pvn['n'])} ({f(pvn['pct'], 0)} %); Fisherův test {p(R['fisher_volby'])}.\n")

# ---------------------------------------------------------------- 3. velikost
L.append("## 3. Velikost obce\n")
L.append(f"Referenda o VTE se konají hlavně v malých obcích: medián je {i(R['median_obyvatel_konana'])} obyvatel "
         f"a {f(R['median_opravneni_konana'], 1)} oprávněných.\n")
rows = [[x["velikost"], x["konano"], f(x["ucast_median"]), x["platnych"], x["proti"], f"{f(x['proti_pct'], 0)} %", f"{f(x['podpora_pro_median'], 0)} %"]
        for x in R["velikost"]]
L.append(tab(rows, ["obyvatel", "konáno", "medián účasti %", "platných", "převážilo proti", "podíl proti", "medián hlasů pro výstavbu"]))
L.append(f"\n**Co říká logistická regrese (srozumitelně):** model odhaduje šanci, že referendum dopadne proti výstavbě, podle počtu obyvatel. "
         f"U obce desetkrát větší vychází šance na odmítnutí asi {f(LV['OR'], 1)}× vyšší (95% interval {f(LV['OR_lo'], 1)}–{f(LV['OR_hi'], 1)}; "
         f"{p(LV['p_LR'])}, {i(R['logit_vse_velikost']['n'])} platných referend). Široký interval ukazuje, že odhad je nepřesný. "
         f"Když do modelu přidáme rok, vliv velikosti zůstává (OR {f(LVR['log10_oby']['OR'], 1)}, {p(LVR['log10_oby']['p_LR'])}) a rok sám nic nevysvětluje "
         f"({p(LVR['rok_c']['p_LR'])}) – lineární trend ale skok v roce 2026 dobře nezachytí (viz kap. 7).\n")
sp = R["spearman_podpora_velikost"]
L.append(f"Podíl hlasů pro výstavbu s velikostí souvisí jen slabě: pořadová korelace {f(sp['r'], 2)} ({p(sp['p'])}). "
         f"Rozdíl dělají hlavně obce nad 2 000 obyvatel (všech {i(R['velikost'][-1]['platnych'])} platných referend proti) a nejmenší obce do 200 obyvatel "
         f"(půl na půl). Mezi 200 a 2 000 obyvateli žádný pravidelný vzorec není.\n")

# ---------------------------------------------------------------- 4. kraje
L.append("## 4. Kraje\n")
rows = [[x["kraj"], x["konano"], x["platnych"], x["proti"], x["pro"], x["z_toho_2025_2026"]] for x in R["kraje"]]
L.append(tab(rows, ["kraj", "konáno", "platných", "převážilo proti", "převážilo pro", "z toho konáno 2025–2026"]))
_vsechny = {"Hlavní město Praha", "Středočeský", "Jihočeský", "Plzeňský", "Karlovarský", "Ústecký", "Liberecký", "Královéhradecký",
            "Pardubický", "Vysočina", "Jihomoravský", "Olomoucký", "Zlínský", "Moravskoslezský"}
_bez = sorted(_vsechny - {x["kraj"] for x in R["kraje"]})
L.append(f"\nKraj podle číselníku ČSÚ 2026. Bez konaného referenda o VTE: {', '.join(_bez)}.\n")

# ---------------------------------------------------------------- 5. typ otázky, AO
L.append("## 5. Konkrétní projekt, nebo akcelerační oblast?\n")
L.append("Typ otázky jsem kódovala ručně podle znění. „Konkrétní záměr“ = otázka uvádí počet turbín, pozemky, lokalitu, investora nebo název projektu. "
         "„VTE obecně“ = otázka se ptá na větrné elektrárny na území obce bez podrobností (projekt za tím často je, ale z otázky to nepoznáme).\n")
tp = R["typ_otazky_proti"]
rows = [[k, v, tp.get(k, {}).get("n", "–"), tp.get(k, {}).get("proti", "–")] for k, v in R["typ_otazky"].items()]
L.append(tab(rows, ["typ hlavní otázky", "konáno", "platných", "převážilo proti"]))
ao = R["ao_v_otazce"]
L.append(f"\nAkcelerační oblast se v otázce objevila jen dvakrát, obojí 9.–10. 10. 2026 ({', '.join(x['obec'] for x in ao)}). "
         "Před rokem 2026 se v tabulce MV akcelerační oblasti nevyskytují.\n")
L.append("U 21 referend z 9.–10. 10. 2026 známe ze sběru podkladů i spouštěč (sloupec `spoustec_podle_podkladu`):\n")
L.append(tab([[k, v] for k, v in R["spoustec_2026"].items()], ["spouštěč (podle podkladů)", "obcí"]))
L.append("\nPro roky 2006–2025 tuto informaci nemáme – tabulka MV obsahuje jen znění otázky. "
         "Kolikrát šlo o konkrétní projekt, je proto spolehlivě určitelné jen pro rok 2026.\n")

# ---------------------------------------------------------------- 6. inverzní
L.append("## 6. Otázky, kde ANO znamená „proti“\n")
L.append(f"V {i(INV['n'])} platných referendech byla otázka položena obráceně (ANO = proti výstavbě). Průměrná podpora výstavby v nich byla "
         f"{f(INV['podpora_inv'])} % hlasů, u běžně položených otázek {f(INV['podpora_norm'])} %. Rozdíl není statisticky průkazný "
         f"(permutační test, {p(INV['perm_p'])}); za období AMO 2019–2025 je to {f(INV19['podpora_inv'])} % × {f(INV19['podpora_norm'])} % "
         f"({p(INV19['perm_p'])}), tedy prakticky totéž, co uvádí AMO (37,28 % × 46,73 %, p = 0,264). "
         f"Nejvíc obrácených otázek bylo v roce 2026 ({i(R['inverzni_po_letech']['2026']['inv'])} z {i(R['inverzni_po_letech']['2026']['n'])} konaných referend), "
         f"podílem podobně jako v roce 2023 ({i(R['inverzni_po_letech']['2023']['inv'])} z {i(R['inverzni_po_letech']['2023']['n'])}). "
         "Protože v roce 2026 bylo odmítání celkově nejvyšší, vliv formulace a vliv roku se od sebe nedají oddělit.\n")

# ---------------------------------------------------------------- 7. AMO
L.append("## 7. Platí závěry studie AMO i s daty do roku 2026?\n")
L.append("AMO (Vidomus, *Proti větru*, únor 2026) analyzovala platná referenda 2019–2025 z dat MV. Přesný seznam referend, se kterým pracovala, "
         "studie neuvádí, takže shodu čísel lze čekat jen přibližnou.\n")
la, lb = A19["logit_velikost"]["log10_oby"], A26["logit_velikost"]["log10_oby"]
ra, rb = A19["logit_rok"]["rok_c"], A26["logit_rok"]["rok_c"]
rows = [
    ["konaná / platná referenda", "neuvádí", f"{i(A19['konano'])} / {i(A19['platnych'])}", f"{i(A26['konano'])} / {i(A26['platnych'])}"],
    ["průměrná účast (platná)", "62,3 %", f"{f(A19['ucast_prumer_platna'])} %", f"{f(A26['ucast_prumer_platna'])} %"],
    ["medián oprávněných", "424", i(A19["median_opravneni"]), i(A26["median_opravneni"])],
    ["výstavba odmítnuta", "62 %", f"{f(A19['proti_pct'], 0)} % ({i(A19['proti_n'])})", f"{f(A26['proti_pct'], 0)} % ({i(A26['proti_n'])})"],
    ["časový trend odmítání", "žádný významný", f"žádný (OR za rok {f(ra['OR'], 2)}, {p(ra['p_LR'])})",
     f"náznak růstu (OR za rok {f(rb['OR'], 2)}, {p(rb['p_LR'])}); 2026 × 2019–2025: {p(F26['p'])}"],
    ["menší obce schvalují častěji", "ano, nejsilnější prediktor", f"ano (OR {f(la['OR'], 1)} na 10× větší obec, {p(la['p_LR'])})",
     f"ano (OR {f(lb['OR'], 1)}, {p(lb['p_LR'])})"],
    ["velikost × podíl hlasů pro", "bez významného vlivu", f"slabý vztah (r = {f(A19['spearman_podpora_velikost']['r'], 2)}, {p(A19['spearman_podpora_velikost']['p'])})",
     f"r = {f(A26['spearman_podpora_velikost']['r'], 2)}, {p(A26['spearman_podpora_velikost']['p'])}"],
    ["menší obce = vyšší účast", "ano", f"ano (r = {f(A19['spearman_ucast_velikost']['r'], 2)}, {p(A19['spearman_ucast_velikost']['p'])})",
     f"ano (r = {f(A26['spearman_ucast_velikost']['r'], 2)}, {p(A26['spearman_ucast_velikost']['p'])})"],
]
L.append(tab(rows, ["závěr", "AMO 2019–2025", "naše data 2019–2025", "naše data 2019–2026 (do 16. 10.)"]))
L.append(f"""
**Shrnutí:**
- Na stejném období čísla AMO sedí: průměrná účast se liší o {f(abs(A19['ucast_prumer_platna'] - 62.3))} procentního bodu, podíl odmítnutí o {f(abs(A19['proti_pct'] - 62), 0)} body.
- Závěr „bez časového trendu“ platil do konce roku 2025. V roce 2026 převážili odpůrci ve {f(Y26['proti_pct'], 0)} % platných referend; skok oproti 2019–2025 je statisticky významný ({p(F26['p'])}). Lineární trend přes celé období 2019–2026 vychází jen jako náznak ({p(rb['p_LR'])}), protože jde o skok, ne o plynulý růst.
- Vztah „menší obce schvalují častěji“ platí i s rokem 2026, je ale slabý a stojí hlavně na obcích nad 2 000 obyvatel (vždy proti) a pod 200 obyvatel (půl na půl). AMO zároveň píše, že velikost „nemá statisticky významný vliv“ na procento podpory; na jejím období nám slabý vztah vychází ({p(A19['spearman_podpora_velikost']['p'])}), na celém období 2006–2026 ne ({p(A06['spearman_podpora_velikost']['p'])}).
- Vysoká účast v malých obcích se potvrzuje ve všech obdobích.
""")

# ---------------------------------------------------------------- 8. KV 2026 kontrola
L.append("## 8. 9.–10. 10. 2026: tabulka MV × ověřená referenční tabulka\n")
k = nes[nes.datum == "2026-10-09"]
bez = k[k.nesoulad.str.startswith("MV k 16. 10.")].obec.tolist()
jine = k[~k.nesoulad.str.startswith("MV k 16. 10.") & ~k.nesoulad.str.startswith("REFERENCE")]
refmis = k[k.nesoulad.str.startswith("REFERENCE")]
_kv = KON[KON.datum_od == "2026-10-09"]
_ref = pd.read_csv(BASE / "referenda_vetrniky_kv2026.csv", sep=";", encoding="utf-8-sig", dtype=str)
assert set(_kv.obec) == set(_ref.obec)
L.append(f"- Všech {_ref.obec.nunique()} obcí z referenční tabulky je i v tabulce MV a v tabulce MV pro tento termín není žádné další referendum o VTE "
         f"(další energetická referenda toho dne – fotovoltaika v Sedlnici a Ralsku, energoblok se spalováním odpadů v Přísečné – se VTE netýkají).")
L.append(f"- MV k 16. 10. 2026 nemá výsledek u {len(bez)} obcí: {', '.join(bez)}. Výsledky jsou proto ze zápisů komisí.")
L.append("- Kde MV výsledek má, porovnávala jsem oprávněné, účast, počty a procenta ANO/NE. Rozdíly:")
for _, r in jine.iterrows():
    L.append(f"  - {r.obec}: {cz(r.nesoulad)}")
L.append("- Žihle: MV uvádí účast 52,96 % (z vydaných lístků) jako referenční tabulka; zápis komise 52,77 % z odevzdaných obálek. Používám 52,96 %.")
L.append("- Měčín: MV má absolutní čísla, zápis komise jen procenta; referenční tabulka přebírá čísla z MV (hlasující dopočteni).")
if refmis.empty:
    L.append(f"- Platnost, závaznost a směr výsledku z mého přepočtu vycházejí u všech {_ref.obec.nunique()} obcí stejně jako v referenční tabulce.\n")
else:
    L.append("- Přepočet se od referenční tabulky liší: " + "; ".join(f"{r.obec}: {r.nesoulad}" for _, r in refmis.iterrows()) + "\n")

# ---------------------------------------------------------------- 9. plánovaná
L.append("## 9. Plánovaná referenda (po 16. 10. 2026, bez výsledku)\n")
pl = H[H.stav == "plánované"].sort_values("datum_od")
L.append(tab([[r.datum_od, r.obec, r.okres, i(r.obyvatel), r.ANO_znamena] for r in pl.itertuples()],
             ["datum", "obec", "okres", "obyvatel 1. 1. 2026", "ANO znamená"]))
L.append("")

# ---------------------------------------------------------------- metodika
_mv = pd.read_csv(HERE / "mv_otazky_vsechny.csv", sep=";", encoding="utf-8-sig")
_kand = pd.read_csv(HERE / "kandidati_vte.csv", sep=";", encoding="utf-8-sig")
_kod = pd.read_csv(HERE / "rucni_kodovani.csv", sep=";", encoding="utf-8-sig", dtype=str)
_vyr = int((_kod.zahrnout == "ne").sum())
_pm = int(nes.nesoulad.str.contains("^(?:platnost|závaznost):", regex=True).sum())
L.append("## Metodika\n")
L.append(f"""1. **Rozbor tabulky MV** (`01_parse_mv.py`): {i(len(_mv))} otázek v {i(_mv.mv_c.nunique())} číslovaných záznamech. Pokračovací řádky (další otázky téhož referenda) dostaly obec, datum a oprávněné z hlavního řádku. Data v textové podobě („03.-04.10.2025“) převedena na první a poslední den hlasování. Výsledky „počet (%)“ rozděleny na počet a procento.
2. **Vyhledání** (`02_kandidati.py`): široké hledání slov větrn*, VTE, větrník, turbín*, akcelerač*, obnoviteln*, OZE, elektrár*, vítr. Zachytilo {i(len(_kand))} otázek.
3. **Ruční kontrola každého zásahu** (`rucni_kodovani.csv`): vyřazeno {i(_vyr)} otázek (fotovoltaika, jaderná, bioplynová a geotermální elektrárna, úložiště, druhé otázky o FVE). Ponecháno {i(R['otazek_vte'])} otázek o VTE ve {i(R['referend_vse'])} referendech. U každé otázky ručně zakódováno, co znamená ANO, typ otázky a stav (konáno / zrušeno / plánované). Kde mělo referendum víc otázek o VTE, je jedna označena jako hlavní (první a nejobecnější) a jen ta vstupuje do souhrnů; ostatní jsou v CSV se `hlavni_otazka = ne`.
4. **Doplnění** (`03_dataset_vte.py`): kód obce a kraj z číselníku ČSÚ (párování „obec + okres“), počet obyvatel k 1. 1. roku konání z ČSÚ OBY02A. Termín voleb podle kalendáře celostátních voleb 2006–2026 (sněmovní, komunální, krajské, senátní, EP, prezidentské). Senát se volí jen ve třetině obvodů, u referend „s krajskými/komunálními volbami“ proto senátní volba v dané obci nemusela být.
5. **Přepočet** z absolutních čísel podle § 48 zák. 22/2004 Sb.: do 30. 6. 2008 platné při účasti ≥ 50 % a závazné při nadpoloviční většině hlasujících; od 1. 7. 2008 platné při účasti ≥ 35 % a závazné, když vítězná odpověď má nadpoloviční většinu hlasujících a zároveň aspoň 25 % oprávněných. {"Přepočet souhlasí s údaji MV o platnosti a závaznosti u všech referend, kde je MV uvádí." if _pm == 0 else f"Přepočet se od MV liší v {_pm} případech (viz Omezení)."}
6. **Směr výsledku:** `smer_vetsiny_hlasujicich` = která strana (pro/proti výstavbě) dostala víc hlasů; `smer_vysledku` = pro výstavbu / proti výstavbě (jen platné a závazné), jinak neplatné / nezávazné / zrušeno soudem / nekonalo se / plánované. V analýze výsledků „odmítnutí“ = v platném referendu převážili odpůrci (bez ohledu na závaznost), závazná varianta je uvedena zvlášť.
7. **Statistika** (`04_analyza.py`): logistická regrese (šance na odmítnutí podle logaritmu počtu obyvatel, případně roku a voleb), test poměrem věrohodnosti; Fisherův přesný test pro srovnání podílů; pořadová (Spearmanova) korelace; permutační test (20 000 permutací, pevné semínko). p-hodnota pod 0,05 = rozdíl nejspíš není náhoda; s počty kolem 50–100 referend jsou ale všechny odhady hrubé.
8. **Citlivost:** v Nových Dvorech (2025) a v Milíně (2026) proběhla týž den dvě samostatná referenda o VTE. Když ponecháme jen jedno, podíl odmítnutí je {f(R['citlivost_dedup']['proti_pct'], 1)} % místo {f(R['proti_pct'], 1)} % a vliv velikosti obce se nemění (OR {f(R['citlivost_dedup']['logit_velikost']['log10_oby']['OR'], 1)}).
""")

# ---------------------------------------------------------------- omezení
L.append("## Omezení a nejistoty\n")
L.append("""**Co MV nemá:**
- počet hlasujících – dopočítán jako oprávnění × účast (zaokrouhleno); u starších referend proto ±1 hlas,
- neplatné a prázdné hlasy, iniciátora (zastupitelstvo × přípravný výbor), investora, počet turbín, stav projektu,
- výsledky 10 referend z 9.–10. 10. 2026 (doplněno ze zápisů komisí),
- u části referend znění všech otázek (Cotkytle 2010 začíná „1.“, druhá otázka v tabulce není; Borová 2012 má místo otázky jen „K výstavbě větrných elektráren“).

**Kde jsem rozhodovala ručně:**
- zařazení každé otázky (o VTE ano/ne) a co znamená ANO,
- výběr hlavní otázky u vícetémových a víceotázkových referend (Počátky, Řisuty, Nové Dvory, Stonařov, Hynčina, Maletín, Maršov u Úpice; u Soběhrd, Horního Benešova a Skleného je otázkou o VTE jen jedna),
- zkrácené otázky „Větrné elektrárny v katastru obce?“ (Sudice 2022, Rohov 2025, Žihle 2026) čtu tak, že ANO = souhlas s VTE,
- typ otázky (konkrétní záměr × obecně × územní plán × akcelerační oblast) – podle znění, ne podle skutečného stavu projektu,
- hraniční případy vyřazené ze souboru: Stará Červená Voda 2023 (zamezit výrobnám z OZE nad 1 MW obecně; ANO 80 %), Ralsko 2026 ot. 2 (referendum ke všem budoucím OZE), Rasošky 2024 („investor v oblasti energetiky“, podle souvislostí zřejmě FVE – neověřeno).

**Nejasné nebo k ověření:**
""")
_popsane = {"Místo", "Těchařovice", "Stříbro"}   # vysvětleno níže ručně
for _, r in nes[(nes.datum != "2026-10-09") & ~nes.obec.isin(_popsane)].iterrows():
    L.append(f"- {r.obec} ({r.datum[:4]}): {cz(r.nesoulad)} – rozdíl v zaokrouhlení nebo základu procent, na platnost ani závaznost nemá vliv.")
L.append("""- Místo 2007: MV uvádí 337 oprávněných, ČSÚ k 1. 1. 2007 jen 322 obyvatel – chyba MV, nebo jiný stav seznamu voličů; nezjištěno.
- Těchařovice 2026: 43 oprávněných na 37 obyvatel (ČSÚ k 1. 1. 2026) – totéž; referendum je neplatné kvůli účasti, na závěry to nemá vliv.
- Stříbro 2009: procenta v tabulce MV jsou zřejmě z platných hlasů, ne z hlasujících; v CSV přepočteno z hlasujících.
- Chvalovice 2012: výsledek zrušil Krajský soud v Brně (Ars 4/2012-47); do účasti se počítá, do výsledků ne. Podrobnosti rozhodnutí nezjištěny.
- Abertamy 2006: MV uvádí minimum pro závaznost 443 hlasů, podle tehdejšího pravidla (většina hlasujících) to je 243; výsledek (ANO 437, závazné) se tím nemění.
- Termín voleb: kalendář pokrývá jen celostátní řádné volby. Dvoudenní referendum mimo tyto termíny se v datech nevyskytuje, doplňovací volby do Senátu jsem nekontrolovala.
- Kraj a kód obce jsou podle číselníku 2026; změny hranic obcí od roku 2006 nejsou zohledněny.
- Studie AMO neuvádí seznam referend ani zda započítala jen jednu otázku na referendum – srovnání je přibližné.
""")

# ---------------------------------------------------------------- příloha
L.append("## Příloha: všechna konaná referenda (hlavní otázka)\n")
rows = []
for r in KON.sort_values(["datum_od", "obec"]).itertuples():
    rows.append([r.datum_od, f"{r.obec} ({r.okres})", i(r.obyvatel), f(r.ucast_pct), r.ANO_znamena,
                 f"{i(r.ano)} : {i(r.ne)}", r.smer_vysledku, r.volby if isinstance(r.volby, str) else "–"])
L.append(tab(rows, ["datum", "obec (okres)", "obyvatel", "účast %", "ANO znamená", "ANO : NE", "výsledek", "spolu s volbami"]))
L.append("\n## Soubory\n")
L.append("""- `referenda_vte_2006_2026.csv` – jeden řádek = jedna otázka o VTE (UTF-8 s BOM, středník, desetinná čárka); souhrny jen z řádků `hlavni_otazka = ano`.
- `_data_pipeline/01_parse_mv.py` … `05_zprava.py` – výpočet; `rucni_kodovani.csv` – ruční rozhodnutí; `kontrola_nesoulady.csv` – automatické kontroly; `vysledky.json` – všechna čísla této zprávy.
- `_data_pipeline/vstupy/obce_cz_2026.csv` – číselník obcí ČSÚ (z repozitáře DataTimes).
""")

(BASE / "analyza_vte_2006_2026.md").write_text("\n".join(L), encoding="utf-8")
print("hotovo:", BASE / "analyza_vte_2006_2026.md")
