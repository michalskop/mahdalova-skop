# Čísla do textu článku „Jak volili vaši sousedé“: krajská a další města z mapy, srovnání KV 2022 × 2026.
# Každé číslo v textu musí sedět s výstupem tohoto skriptu (REDAKCNI_MANUAL.md, Část VI).
#
# Vstupy (ČSÚ open data, https://volby.gov.cz/opendata/kv2026/kv2026_opendata.htm a …/kv2022/…):
#   ../_pipeline/raw/KV2026reg20261011_csv/csv_od/kvros.csv   – kandidátky 2026 (hlasy, %, mandáty), stav 11. 10. 2026
#   ../_pipeline/raw/KV2026_data_20261011_csv/csv_od/kvt3.csv – okrsky 2026 (voliči, obálky)
#   ../_pipeline/raw/KV2022reg20260328_csv/csv_od/kvros.csv   – kandidátky 2022 (stav 28. 3. 2026, jen řádné volby 23.–24. 9. 2022)
#   ../_pipeline/raw/KV2022_data_20260328_csv/csv_od/kvt3.csv
#   ../../../../../public/data/kv2026-okrsky/meta/*.json       – vítězové okrsků 2026 (postav.py)
# Výstup: mesta.json + výpis do konzole.
# Podíl kandidátky = její hlasy / všechny hlasy v zastupitelstvu (vícenásobné hlasy, stejně jako PROCHLSTR ČSÚ).
import csv, json, os, sys, collections

sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "..", "_pipeline", "raw")
META = os.path.join(HERE, "..", "..", "..", "..", "..", "public", "data", "kv2026-okrsky", "meta")
ANO = "768"
ODS = "53"
DATUM_2022 = "20220923"  # řádné komunální volby 23.–24. 9. 2022 (v souborech jsou i dodatečné a opakované volby)

MESTA = {  # kód zastupitelstva (obec / hl. m.) → název
    "554782": "Praha", "582786": "Brno", "554821": "Ostrava", "554791": "Plzeň", "563889": "Liberec",
    "500496": "Olomouc", "544256": "České Budějovice", "569810": "Hradec Králové", "554804": "Ústí nad Labem",
    "555134": "Pardubice", "585068": "Zlín", "554961": "Karlovy Vary", "586846": "Jihlava", "536385": "Jeseník",
}


def rows(*p):
    with open(os.path.join(RAW, *p), encoding="utf-8") as f:
        yield from csv.DictReader(f)


def kandidatky(soubor, datum=None):
    """KODZASTUP → seznam kandidátek {n, vs, slozeni, hlasy, mand}; součet hlasů za zastupitelstvo."""
    out, tot = collections.defaultdict(list), collections.Counter()
    for r in rows(*soubor):
        if datum and r.get("DATUMVOLEB", datum) != datum:
            continue
        h = int(r["HLASY_STR"] or 0)
        cl = {r["VSTRANA"]} | {str(int(x)) for x in r["SLOZENI"].split(",") if x.strip()}
        out[r["KODZASTUP"]].append({"n": r["NAZEVCELK"], "vs": r["VSTRANA"], "cl": cl, "h": h, "m": int(r["MAND_STR"] or 0)})
        tot[r["KODZASTUP"]] += h
    return out, tot


def ucast(soubor, datum=None):
    vol, obal = collections.Counter(), collections.Counter()
    for r in rows(*soubor):
        if datum and r.get("DATUMVOLEB", datum) != datum:
            continue
        if r["TYPZASTUP"] != "1":
            continue
        vol[r["KODZASTUP"]] += int(r["VOL_SEZNAM"])
        obal[r["KODZASTUP"]] += int(r["VYD_OBALKY"])
    return {k: obal[k] / vol[k] for k in vol if vol[k]}


k26, t26 = kandidatky(("KV2026reg20261011_csv", "csv_od", "kvros.csv"))
k22, t22 = kandidatky(("KV2022reg20260328_csv", "csv_od", "kvros.csv"), DATUM_2022)
u26 = ucast(("KV2026_data_20261011_csv", "csv_od", "kvt3.csv"))
u22 = ucast(("KV2022_data_20260328_csv", "csv_od", "kvt3.csv"), DATUM_2022)


def slouc(lst, tot):
    """Kandidátky se stejným názvem z více volebních obvodů sloučit; seřadit podle hlasů."""
    m = {}
    for l in lst:
        x = m.setdefault((l["vs"], l["n"]), {**l, "h": 0, "m": 0})
        x["h"] += l["h"]
        x["m"] += l["m"]
    return sorted(({**x, "p": x["h"] / tot} for x in m.values()), key=lambda x: -x["h"])


def okrsky_vitezove(kod):
    """Počet okrsků, kde kandidátka 2026 vyhrála (z dat mapy)."""
    for f in os.listdir(META):
        m = json.load(open(os.path.join(META, f), encoding="utf-8"))
        if kod in m["zast"]:
            L = m["zast"][kod]["l"]
            won, n = collections.Counter(), 0
            for z in m["okrsky"].values():
                r = z.get("1")
                if r and str(r[0]) == kod and r[4]:
                    won[L[r[4][0][0]]["n"]] += 1
                    n += 1
            return won, n
    return collections.Counter(), 0


vysledek = {}
for kod, nazev in MESTA.items():
    l26, l22 = slouc(k26[kod], t26[kod]), slouc(k22.get(kod, []), t22.get(kod, 1))
    won, n = okrsky_vitezove(kod)
    ano = lambda L: next((x for x in L if ANO in x["cl"]), None)
    ods = lambda L: [x for x in L if ODS in x["cl"]]
    a26, a22 = ano(l26), ano(l22)
    vysledek[nazev] = {
        "mandatu": sum(x["m"] for x in l26), "okrsku": n,
        "ucast_2022": u22.get(kod), "ucast_2026": u26.get(kod),
        "2026": [{"n": x["n"], "p": round(x["p"] * 100, 1), "m": x["m"], "okrsky": won.get(x["n"], 0)} for x in l26],
        "2022": [{"n": x["n"], "p": round(x["p"] * 100, 1), "m": x["m"]} for x in l22],
        "ano": {"2022": a22 and {"n": a22["n"], "p": round(a22["p"] * 100, 1), "m": a22["m"]},
                "2026": a26 and {"n": a26["n"], "p": round(a26["p"] * 100, 1), "m": a26["m"]}},
        "ods_2026": [{"n": x["n"], "p": round(x["p"] * 100, 1), "m": x["m"]} for x in ods(l26)],
        "ods_2022": [{"n": x["n"], "p": round(x["p"] * 100, 1), "m": x["m"]} for x in ods(l22)],
    }

# celostátně: ANO v zastupitelstvech, kde kandidovalo 2022 i 2026
def ano_podil(k, t):
    return {z: sum(x["h"] for x in L if ANO in x["cl"]) / t[z] for z, L in k.items() if t[z] and any(ANO in x["cl"] for x in L)}
p22, p26 = ano_podil(k22, t22), ano_podil(k26, t26)
oba = [z for z in p22 if z in p26]
celkem = {
    "ano_zastupitelstev_2022": len(p22), "ano_zastupitelstev_2026": len(p26), "ano_v_obou": len(oba),
    "ano_pokles_podilu": sum(1 for z in oba if p26[z] < p22[z]),
    "ano_mandaty_2022": sum(x["m"] for L in k22.values() for x in L if ANO in x["cl"]),
    "ano_mandaty_2026": sum(x["m"] for L in k26.values() for x in L if ANO in x["cl"]),
}
json.dump({"mesta": vysledek, "celkem": celkem}, open(os.path.join(HERE, "mesta.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

for nazev, v in vysledek.items():
    print(f"\n== {nazev}: {v['mandatu']} mandátů, {v['okrsku']} okrsků, účast {v['ucast_2022']*100:.1f} → {v['ucast_2026']*100:.1f} %")
    for x in v["2026"][:6]:
        print(f"   2026 {x['p']:5.1f} % {x['m']:2d} m {x['okrsky']:4d} okr  {x['n'][:70]}")
    for x in v["2022"][:5]:
        print(f"   2022 {x['p']:5.1f} % {x['m']:2d} m           {x['n'][:70]}")
    print("   ANO:", v["ano"], "\n   ODS 2026:", v["ods_2026"], "\n   ODS 2022:", v["ods_2022"])
print("\n", celkem)
