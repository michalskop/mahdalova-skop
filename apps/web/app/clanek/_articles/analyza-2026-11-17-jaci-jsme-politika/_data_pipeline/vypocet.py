"""Kapitola „Politika“ speciálu Jací jsme byli, jací jsme (1989 × 2026).

Spočítá všechna čísla do textu a podklady grafů (vysledky.json). Grafy kreslí grafy.py.
Spuštění:  python vypocet.py && python grafy.py

Zdroje (archiv statisticka-data/cesko, odkaz csu-data; najde se sám, jinak proměnná CSU_DATA):
  volby/csu-casove-rady-cnr-ps/20261114/   ČSÚ, Časové řady volební statistiky, Volby do ČNR a PS PČR 1990–2025
      https://csu.gov.cz/produkty/volby-do-cnr-a-ps-pcr  (struktura poslanců podle pohlaví a věku, mandáty
      podle navrhujících stran, počet kandidujících volebních stran; vydáno 19. 12. 2025)
  volby/csu-casove-rady-senat/20261114/    ČSÚ, Časové řady volební statistiky, Volby do Senátu 1996–2024
      https://csu.gov.cz/produkty/volby-do-senatu-pcr  (zvolení senátoři podle věku a pohlaví)
  volby/se2026/20261017/reg/serk.csv       ČSÚ, registr kandidátů do Senátu 2026 (věk ke dni voleb, zvolení)
      https://volby.gov.cz/opendata/se2026/SE2026reg20261017_csv.zip
  volby/cnr1990-vysledky/20261114/         ČSÚ volby.cz, volby do ČNR 1990: https://www.volby.cz/pls/cnr1990/u610
  parlament/psp-poslanci-opendata/20261114/ Poslanecká sněmovna, otevřená data Poslanci a osoby
      https://www.psp.cz/eknih/cdrom/opendata/poslanci.zip  (ČNR k 17. 11. 1989, Sněmovna k 14. 11. 2026,
      předsedové PS, předsedové vlády od 1993, prezident od 1998)
  parlament/vrcholne-funkce/20261114/      vlada.gov.cz (rejstřík předsedů vlád), psp.cz, senat.cz (seznam
      a detaily 81 senátorů k 14. 11. 2026, almanach 30 let Senátu), stenoprotokoly psp.cz
Vyznamenání: data článku analyza-2026-10-28-statni-vyznamenani (_data_pipeline/vstupy/vyznamenani_1995_2026.csv,
  výstup jeho 02_analyza.py z oficiálních seznamů Hradu a tiskové zprávy z 28. 10. 2026). Počítáme udělená
  VYZNAMENÁNÍ, ne osoby (jeden člověk může být v datech víckrát); podíl žen ze vyznamenání se známým pohlavím.
"""
import csv
import datetime as dt
import glob
import html
import json
import os
import re
import sys
from pathlib import Path

import openpyxl

sys.stdout.reconfigure(encoding="utf-8")
HERE = Path(__file__).resolve().parent
OUT = []


def say(*a):
    s = " ".join(str(x) for x in a)
    OUT.append(s)
    print(s)


def najdi_archiv() -> Path:
    if os.environ.get("CSU_DATA"):
        return Path(os.environ["CSU_DATA"])
    for p in Path(__file__).resolve().parents:
        for kandidat in (p / "csu-data", p / "statisticka-data" / "cesko"):
            if kandidat.exists():
                return kandidat
    raise SystemExit("Archiv csu-data nenalezen – nastav CSU_DATA")


A = najdi_archiv()
PS = A / "volby/csu-casove-rady-cnr-ps/20261114"
SE = A / "volby/csu-casove-rady-senat/20261114"
PSP = A / "parlament/psp-poslanci-opendata/20261114/raw"
VF = A / "parlament/vrcholne-funkce/20261114"
V = {}  # výsledky pro grafy


def tabulka(path):
    """První list XLSX ČSÚ: {popisek řádku: {sloupec: hodnota}} podle řádku záhlaví „Ukazatel“/„Navrhující strana“."""
    rows = [list(r) for r in openpyxl.load_workbook(path, data_only=True).worksheets[0].iter_rows(values_only=True)]
    i = next(i for i, r in enumerate(rows) if r[0] in ("Ukazatel", "Navrhující strana"))
    hlav = [str(h).strip() if h is not None else None for h in rows[i]]
    out = {}
    for r in rows[i + 1:]:
        if r[0] is None or all(v is None for v in r[1:]):
            continue
        out[str(r[0]).strip()] = {hlav[j]: r[j] for j in range(1, len(hlav)) if hlav[j]}
    return hlav[1:], out


def cz(x, d=1):
    return f"{x:,.{d}f}".replace(",", " ").replace(".", ",")


# ---------------------------------------------------------------- 1. Sněmovna (ČSÚ)
volby, t = tabulka(PS / "vpscr121925_struktura_poslancu_podle_pohlavi_a_veku.xlsx")
zeny = t["- z toho ženy v %"]
vek = t["Průměrný věk celkem"]
pocet = t["Počet poslanců"]
say("## Sněmovna a ČNR podle ČSÚ (zvolení poslanci, věk ke dni voleb)")
snem = []
for v in volby:
    rok = int(re.search(r"\d{4}", v).group())
    snem.append(dict(volby=v.replace("*)", "").strip(), rok=rok, zeny_pct=float(zeny[v]), vek=float(vek[v]),
                     zeny_n=round(float(zeny[v]) * pocet[v] / 100), poslancu=pocet[v],
                     vek_muzi=float(t["Průměrný věk muži"][v]), vek_zeny=float(t["Průměrný věk ženy"][v]),
                     do_39=t["Věk - 21-29"][v] + t["- 30-39"][v],
                     od_60=t["- 60-69"][v] + (t["- 70 a více"][v] if isinstance(t["- 70 a více"][v], int) else 0)))
for s in snem:
    say(f"{s['volby']}: žen {cz(s['zeny_pct'])} % ({s['zeny_n']} z {s['poslancu']}), průměrný věk {cz(s['vek'])} "
        f"(muži {cz(s['vek_muzi'])}, ženy {cz(s['vek_zeny'])}), do 39 let {s['do_39']}, 60 a víc {s['od_60']}")
V["snemovna"] = snem

# ---------------------------------------------------------------- 2. ČNR k 17. 11. 1989 a Sněmovna dnes (psp.cz)
oso = {}
for line in open(PSP / "osoby.unl", encoding="cp1250"):
    r = line.rstrip("\n").split("|")
    oso[r[0]] = r


def datum(s):
    s = s.strip()[:10]
    return dt.date.fromisoformat(s) if s else None


clen = {}
for line in open(PSP / "zarazeni.unl", encoding="cp1250"):
    r = line.split("|")
    if r[2] == "0":  # členství v orgánu (ne funkce)
        clen.setdefault(r[1], []).append((r[0], datum(r[3]), datum(r[4])))


def prurez(organ, den, popis):
    ids = [i for i, a, b in clen[organ] if a <= den and (b is None or b >= den)]
    z = sum(oso[i][6] != "M" for i in ids)  # psp.cz vede ženy jako Ž, výjimečně Z nebo poškozený znak
    veky, vadne = [], []
    for i in ids:
        nar = oso[i][5]
        b = dt.datetime.strptime(nar, "%d.%m.%Y").date() if nar else None
        a = (den - b).days / 365.2425 if b else None
        if a and 18 <= a <= 95:
            veky.append(a)
        else:
            vadne.append(f"{oso[i][3]} {oso[i][2]} ({nar})")
    res = dict(popis=popis, den=den.isoformat(), clenu=len(ids), zen=z, zeny_pct=round(100 * z / len(ids), 1),
               vek=round(sum(veky) / len(veky), 1), vek_n=len(veky), nejmladsi=round(min(veky), 1), nejstarsi=round(max(veky), 1))
    say(f"{popis} k {den}: členů {len(ids)}, žen {z} ({cz(res['zeny_pct'])} %), průměrný věk {cz(res['vek'])} "
        f"(z {len(veky)} s platným datem narození; vyřazeno: {vadne}), nejmladší {cz(res['nejmladsi'])}, nejstarší {cz(res['nejstarsi'])}")
    return res


say("\n## Průřezy z otevřených dat psp.cz")
V["cnr_1989"] = prurez("260", dt.date(1989, 11, 17), "ČNR (zvolená 1986 na jednotné kandidátce NF)")
V["ps_2026"] = prurez("174", dt.date(2026, 11, 14), "Poslanecká sněmovna (zvolená 2025)")
V["ps_2025_kontrola"] = prurez("174", dt.date(2025, 10, 4), "Poslanecká sněmovna – kontrola proti ČSÚ")
kooptace = sum(1 for i, a, b in clen["260"] if a == dt.date(1990, 2, 6))
say(f"ČNR 1986–1990: kooptováno 6. 2. 1990 {kooptace} poslanců (výměna po revoluci)")

# ---------------------------------------------------------------- 3. Strany (ČSÚ, volby.cz)
_, kand = tabulka(PS / "vpscr121925_pocet_kandidujicich_volebnich_stran.xlsx")
kandiduje = kand["Počet kandidujících volebních stran - celkem"]
volby_m, mand = tabulka(PS / "vpscr121925_mandaty_pro_vybrane_navrhujici_strany_abs_.xlsx")
say("\n## Strany")
strany = []
for v in volby_m:
    s = {k: r[v] for k, r in mand.items() if isinstance(r[v], int) and r[v] > 0 and not k.startswith(("ČNR -", "PS -"))}
    soucet = sum(s.values())
    strany.append(dict(volby=v, kandidovalo=kandiduje[v], s_mandaty=len(s) if soucet == 200 else None,
                       soucet=soucet, strany={k.split(" ")[0]: n for k, n in s.items()}))
    say(f"{v}: kandidovalo {kandiduje[v]} volebních stran; navrhující strany s mandátem: {len(s)} "
        f"(součet mandátů {soucet}{'' if soucet == 200 else ' – tabulka ČSÚ je jen výběr, počet nepoužíváme'}) {s}")
V["strany"] = strany
# ČNR 1990 přímo z volby.cz (kontrola tabulky ČSÚ)
t610 = html.unescape(re.sub(r"<[^>]+>", " ", (A / "volby/cnr1990-vysledky/20261114/cnr1990_u610_rozdeleni_mandatu.html").read_text(encoding="utf-8")))
cnr90 = {m.group(1): int(m.group(2)) for m in re.finditer(r"\b(OF|KSČ|MORSL|KDU)\s+(?:\d+\s+){7}(\d+)", t610)}
say("ČNR 1990 podle volby.cz (mandáty celkem):", cnr90, "součet", sum(cnr90.values()))
V["cnr1990_mandaty"] = cnr90

# ---------------------------------------------------------------- 4. Senát
volby_s, ts = tabulka(SE / "vsecr122024_struktura_senatoru_podle_veku_a_pohlavi.xlsx")
say("\n## Senát – nově zvolení senátoři podle ČSÚ")
senat = []
for v in volby_s:
    n = ts["Počet zvolených senátorů"][v]
    p = float(ts["- z toho ženy v %"][v])
    senat.append(dict(rok=int(str(v).strip(" *")), zvoleno=n, zeny_pct=p, zeny_n=round(p * n / 100),
                      vek=float(ts["Průměrný věk celkem"][v])))
# Senát 2026: registr kandidátů ČSÚ (věk ke dni voleb) + pohlaví ze senat.cz (stránky senátorů)
kandidati = list(csv.DictReader(open(A / "volby/se2026/20261017/reg/serk.csv", encoding="utf-8")))
zvoleni26 = [k for k in kandidati if k["ZVOLEN_K1"] == "1" or k["ZVOLEN_K2"] == "1"]
sen_det = []
for f in sorted(glob.glob(str(VF / "senat_senatori_detail" / "*.html"))):
    t = open(f, encoding="utf-8", errors="replace").read()
    tx = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", re.sub(r"<!--.*?-->", "", t, flags=re.S))))
    jm = re.sub(r"\s+", " ", html.unescape(re.search(r"<title>([^<:]*)", t).group(1))).strip()
    poh = "Ž" if "Jak jsem hlasovala" in tx else "M" if "Jak jsem hlasoval" in tx else "?"
    rok = re.search(r"Zvolen[a]? za .*? v roce (\d{4})", tx)
    sen_det.append(dict(jmeno=jm, pohlavi=poh, rok=int(rok.group(1)) if rok else None))
assert len(sen_det) == 81 and all(s["pohlavi"] in "MŽ" for s in sen_det)
prijmeni_zen26 = {s["jmeno"] for s in sen_det if s["rok"] == 2026 and s["pohlavi"] == "Ž"}
z26 = [k for k in zvoleni26 if any(k["PRIJMENI"] in j for j in prijmeni_zen26)]
vek26 = sum(int(k["VEK"]) for k in zvoleni26) / len(zvoleni26)
senat.append(dict(rok=2026, zvoleno=len(zvoleni26), zeny_pct=round(100 * len(z26) / len(zvoleni26), 1),
                  zeny_n=len(z26), vek=round(vek26, 1)))
for s in senat:
    say(f"{s['rok']}: zvoleno {s['zvoleno']}, žen {s['zeny_n']} ({cz(s['zeny_pct'])} %), průměrný věk {cz(s['vek'])}")
say("Ženy zvolené 2026:", [f"{k['JMENO']} {k['PRIJMENI']}" for k in z26])
V["senat"] = senat
zen_dnes = [s for s in sen_det if s["pohlavi"] == "Ž"]
from collections import Counter
say(f"Senát k 14. 11. 2026 (senat.cz): {len(sen_det)} senátorů, žen {len(zen_dnes)} ({cz(100 * len(zen_dnes) / 81)} %); "
    f"podle roku zvolení {dict(Counter(s['rok'] for s in sen_det))}, ženy podle roku {dict(Counter(s['rok'] for s in zen_dnes))}")
V["senat_2026_slozeni"] = dict(senatoru=81, zen=len(zen_dnes), zeny_pct=round(100 * len(zen_dnes) / 81, 1))
s96 = senat[0]
say(f"Senát 1996 (všech 81 zvolených najednou): žen {s96['zeny_n']}, průměrný věk {cz(s96['vek'])}")

# ---------------------------------------------------------------- 5. Nejvyšší funkce 1989–2026
# Ověřeno: vlada.gov.cz (rejstřík předsedů vlád, stránka vlády Fialy a současné vlády), otevřená data psp.cz
# (funkce předsedů PS od 1992, předsedů vlády od 1993, prezidenta od 1998), stenoprotokoly psp.cz
# (18. 12. 1989 Šafařík, 26. 6. 1990 Burešová, 29. 12. 1989 Havel, 26. 1. 1993 volba prezidenta ČR),
# senat.cz (almanach 30 let Senátu: předsedové po letech; titulní strana 12. 11. 2026: předseda Vystrčil).
FUNKCE = [  # (funkce, jméno, žena, od, do) – do = None: ve funkci k 14. 11. 2026
    ("Prezident", "Václav Havel", 0, "1989-12-29", "1992-07-20"),   # prezident ČSSR/ČSFR
    ("Prezident", "Václav Havel", 0, "1993-02-02", "2003-02-02"),   # prezident ČR, zvolen 26. 1. 1993
    ("Prezident", "Václav Klaus", 0, "2003-03-07", "2013-03-07"),
    ("Prezident", "Miloš Zeman", 0, "2013-03-08", "2023-03-08"),
    ("Prezident", "Petr Pavel", 0, "2023-03-09", None),
    ("Předseda vlády", "František Pitra", 0, "1988-10-12", "1990-02-06"),
    ("Předseda vlády", "Petr Pithart", 0, "1990-02-06", "1992-07-02"),
    ("Předseda vlády", "Václav Klaus", 0, "1992-07-02", "1998-01-02"),
    ("Předseda vlády", "Josef Tošovský", 0, "1998-01-02", "1998-07-17"),  # vlada.gov.cz uvádí 17. 12. 1997 jmenování
    ("Předseda vlády", "Miloš Zeman", 0, "1998-07-17", "2002-07-12"),
    ("Předseda vlády", "Vladimír Špidla", 0, "2002-07-15", "2004-08-04"),
    ("Předseda vlády", "Stanislav Gross", 0, "2004-08-04", "2005-04-25"),
    ("Předseda vlády", "Jiří Paroubek", 0, "2005-04-25", "2006-08-16"),
    ("Předseda vlády", "Mirek Topolánek", 0, "2006-09-04", "2009-05-08"),
    ("Předseda vlády", "Jan Fischer", 0, "2009-04-09", "2010-07-13"),
    ("Předseda vlády", "Petr Nečas", 0, "2010-06-28", "2013-07-10"),
    ("Předseda vlády", "Jiří Rusnok", 0, "2013-06-25", "2014-01-29"),
    ("Předseda vlády", "Bohuslav Sobotka", 0, "2014-01-29", "2017-12-13"),
    ("Předseda vlády", "Andrej Babiš", 0, "2017-12-06", "2021-12-17"),
    ("Předseda vlády", "Petr Fiala", 0, "2021-11-28", "2025-12-09"),
    ("Předseda vlády", "Andrej Babiš", 0, "2025-12-09", None),
    ("Předseda ČNR a Sněmovny", "Josef Kempný", 0, "1981-06-18", "1989-12-18"),
    ("Předseda ČNR a Sněmovny", "Jaroslav Šafařík", 0, "1989-12-18", "1990-06-26"),
    ("Předseda ČNR a Sněmovny", "Dagmar Burešová", 1, "1990-06-26", "1992-06-29"),
    ("Předseda ČNR a Sněmovny", "Milan Uhde", 0, "1992-06-29", "1996-06-06"),
    ("Předseda ČNR a Sněmovny", "Miloš Zeman", 0, "1996-06-27", "1998-06-19"),
    ("Předseda ČNR a Sněmovny", "Václav Klaus", 0, "1998-07-17", "2002-06-20"),
    ("Předseda ČNR a Sněmovny", "Lubomír Zaorálek", 0, "2002-07-11", "2006-06-15"),
    ("Předseda ČNR a Sněmovny", "Miloslav Vlček", 0, "2006-08-14", "2010-04-30"),
    ("Předseda ČNR a Sněmovny", "Miroslava Němcová", 1, "2010-06-24", "2013-08-28"),
    ("Předseda ČNR a Sněmovny", "Jan Hamáček", 0, "2013-11-27", "2017-10-26"),
    ("Předseda ČNR a Sněmovny", "Radek Vondráček", 0, "2017-11-22", "2021-10-20"),
    ("Předseda ČNR a Sněmovny", "Markéta Pekarová Adamová", 1, "2021-11-10", "2025-10-08"),
    ("Předseda ČNR a Sněmovny", "Tomio Okamura", 0, "2025-11-05", None),
    ("Předseda Senátu", "Petr Pithart", 0, "1996", "1998"),
    ("Předseda Senátu", "Libuše Benešová", 1, "1998", "2000"),
    ("Předseda Senátu", "Petr Pithart", 0, "2000", "2004"),
    ("Předseda Senátu", "Přemysl Sobotka", 0, "2004", "2010"),
    ("Předseda Senátu", "Milan Štěch", 0, "2010", "2018"),
    ("Předseda Senátu", "Jaroslav Kubera", 0, "2018", "2020"),
    ("Předseda Senátu", "Miloš Vystrčil", 0, "2020", None),
]
# kontrola proti otevřeným datům psp.cz: předsedové PS (od 1992), předsedové vlády (od 1993), prezident (od 1998)
fun = {r[0]: r for r in (l.rstrip("\n").split("|") for l in open(PSP / "funkce.unl", encoding="cp1250"))}
org = {r[0]: r for r in (l.rstrip("\n").split("|") for l in open(PSP / "organy.unl", encoding="cp1250"))}
psp_funkce = set()
for line in open(PSP / "zarazeni.unl", encoding="cp1250"):
    r = line.split("|")
    f = fun.get(r[1]) if r[2] == "1" else None
    if f and org[f[1]][2] in ("5", "11", "18") and f[3].startswith(("Předseda", "Prezident")):
        psp_funkce.add(f"{oso[r[0]][3]} {oso[r[0]][2]}")
nase = {j for fn, j, _z, od, _do in FUNKCE if od[:4] >= "1993" and fn != "Předseda Senátu"}
say("\n## Nejvyšší funkce – kontrola jmen proti psp.cz: chybí v psp.cz", sorted(nase - psp_funkce))
po89 = [f for f in FUNKCE if (f[4] or "9999") > "1989-11-17"]
osoby = {}
for f in po89:
    if f[0] == "Předseda ČNR a Sněmovny" and f[1] == "Josef Kempný":
        continue
    if f[0] == "Předseda vlády" and f[1] == "František Pitra":
        continue
    osoby.setdefault(f[1], set()).add(f[0])
zen_f = sorted(j for j, z in {f[1]: f[2] for f in po89}.items() if z)
say(f"Od prosince 1989 / února 1990 vystřídalo v čele státu, vlády, ČNR/Sněmovny a Senátu {len(osoby)} lidí, z toho žen {len(zen_f)}: {zen_f}")
for fn in ["Prezident", "Předseda vlády", "Předseda ČNR a Sněmovny", "Předseda Senátu"]:
    lidi = sorted({j for f, j in ((f[0], f[1]) for f in po89) if f == fn and j not in ("Josef Kempný", "František Pitra")})
    say(f"  {fn}: {len(lidi)} – {', '.join(lidi)}")
say("  Součet obsazení podle funkcí (bez sloučení osob):", sum(len(f) for f in osoby.values()))
say("  Ve víc funkcích:", {j: sorted(f) for j, f in osoby.items() if len(f) > 1})
V["funkce"] = [dict(funkce=f[0], jmeno=f[1], zena=f[2], od=f[3], do=f[4]) for f in FUNKCE]

# ---------------------------------------------------------------- 6. Státní vyznamenání a ženy
CSV = HERE.parents[1] / "analyza-2026-10-28-statni-vyznamenani" / "_data_pipeline" / "vstupy" / "vyznamenani_1995_2026.csv"
R = [r for r in csv.DictReader(open(CSV, encoding="utf-8")) if r["rok"] <= "2026"]
say(f"\n## Státní vyznamenání 1995–2026: {len(R)} vyznamenání (jednotka = vyznamenání, ne osoba)")
PREZ = [("Havel", "Václav Havel"), ("Klaus", "Václav Klaus"), ("Zeman", "Miloš Zeman"), ("Pavel", "Petr Pavel")]
vyz = []
for k, jm in PREZ:
    s = [r for r in R if r["prezident"] == k and r["pohlavi"] in ("Z", "M")]
    z = sum(r["pohlavi"] == "Z" for r in s)
    ri = [r for r in s if r["druh"].startswith("Řád")]
    zr = sum(r["pohlavi"] == "Z" for r in ri)
    roky = sorted({r["rok"] for r in R if r["prezident"] == k})
    vyz.append(dict(prezident=jm, vse=len(s), zeny=z, pct=round(100 * z / len(s), 1),
                    rady=len(ri), rady_zeny=zr, rady_pct=round(100 * zr / len(ri), 1), roky=f"{roky[0]}–{roky[-1]}"))
    say(f"{jm} ({roky[0]}–{roky[-1]}): ženám {z} z {len(s)} vyznamenání se známým pohlavím ({cz(100 * z / len(s))} %); "
        f"řády {zr} z {len(ri)} ({cz(100 * zr / len(ri))} %)")
pred = [r for r in R if r["prezident"] != "Pavel" and r["pohlavi"] in ("Z", "M")]
zp = sum(r["pohlavi"] == "Z" for r in pred)
say(f"Předchůdci Pavla dohromady: ženám {zp} z {len(pred)} ({cz(100 * zp / len(pred))} %)")
r26 = [r for r in R if r["rok"] == "2026" and not r["zaznam"].startswith("Jeho Excelence") and r["pohlavi"] in ("Z", "M")]
say(f"Ročník 28. 10. 2026: ženám {sum(r['pohlavi'] == 'Z' for r in r26)} z {len(r26)}; "
    f"Řád Bílého lva ženám {sum(r['pohlavi'] == 'Z' for r in r26 if r['druh'] == 'Řád Bílého lva')} z {sum(r['druh'] == 'Řád Bílého lva' for r in r26)}")
nezn = [r["jmeno"] for r in R if r["pohlavi"] not in ("Z", "M")]
say("Pohlaví neurčeno (vynecháno z podílů):", nezn)
for k, jm in PREZ:
    s_ = [r for r in R if r["prezident"] == k]
    o = [r for r in s_ if r["obor"] in ("odboj_valka", "armada_bezpecnost")]
    say(f"{jm}: válka, protinacistický odboj, armáda, policie, záchranáři {len(o)} z {len(s_)} ({cz(100 * len(o) / len(s_))} %), "
        f"z toho ženám {sum(r['pohlavi'] == 'Z' for r in o)}")
V["vyznamenani"] = vyz
V["vyznamenani_predchudci"] = dict(zeny=zp, vse=len(pred), pct=round(100 * zp / len(pred), 1))

(HERE / "vysledky.json").write_text(json.dumps(V, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
(HERE / "vystup.txt").write_text("\n".join(OUT) + "\n", encoding="utf-8")
