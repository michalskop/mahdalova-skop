# Komunální volby 2026 – výsledky po okrscích pro mapu „Jak volili vaši sousedé“.
#
# Vstupy (raw/, viz README.md):
#   KV2026_data_20261011_csv/csv_od/kvt3.csv, kvhl.csv   – souhrn a hlasy kandidátek za okrsky (ČSÚ, konečný stav 11. 10. 2026)
#   KV2026reg20261011_csv/csv_od/kvros.csv                – registr kandidátek (název, zkratka, složení, mandáty)
#   okrsky_zo2026.geojson                                 – hranice okrsků ZO 2026 (GIS ČSÚ, stahni_okrsky.py)
# Výstupy:
#   raw/okrsky_join.geojson      – geometrie s klíčem okrsku a okresem (vstup pro mapshaper, viz build.sh)
#   raw/meta/<okres>.json        – výsledky okrsků a kandidátky zastupitelstev daného okresu
#   ../okrsky-obce.json          – rejstřík obcí a městských částí pro vyhledávání
#
# Okrsek se s výsledky páruje přes (kód MČ/MO, nebo kód obce) + číslo okrsku.
# Podíl kandidátky v okrsku = hlasy kandidátky / všechny platné hlasy (každý volič má tolik hlasů, kolik je mandátů).
import csv, json, os, collections, sys

sys.stdout.reconfigure(encoding="utf-8")

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "raw")
OUT = os.path.join(HERE, "..", "..", "..", "..", "..", "public", "data", "kv2026-okrsky")
DATA = os.path.join(RAW, "KV2026_data_20261011_csv", "csv_od")
REG = os.path.join(RAW, "KV2026reg20261011_csv", "csv_od")


def rows(path):
    with open(path, encoding="utf-8") as f:
        yield from csv.DictReader(f)


# --- barvy: celostátní strany jako v naší predikci (volby2026.datatimes.cz), místní kandidátky tlumeně z palety ---
PARTY = [  # (kód VSTRANA, zkratka do legendy, barva) – pořadí = priorita u koalic a sdružení
    (768, "ANO", "#272a59"),
    (1114, "SPD", "#a47d03"),
    (166, "STAN", "#ff1a4a"),
    (53, "ODS", "#5e66d5"),
    (720, "Piráti", "#111111"),
    (1, "KDU-ČSL", "#ffcf02"),
    (721, "TOP 09", "#812840"),
    (1178, "Motoristé", "#1a9fbd"),
    (7, "SOCDEM", "#f76800"),
    (47, "KSČM", "#c5143c"),
    (1298, "Stačilo!", "#c5143c"),
    (5, "Zelení", "#639e0a"),
    (714, "Svobodní", "#0e926a"),
    (1265, "PRO", "#8cdfef"),
    (1245, "Přísaha", "#a9b5f0"),
    (1227, "Trikolora", "#ffb3c0"),
]
PARTY_BY_CODE = {c: (z, col) for c, z, col in PARTY}
PRIORITY = {c: i for i, (c, _, _) in enumerate(PARTY)}
LOCAL = ["#c19a78", "#c49ad8", "#75dfc4", "#8dd265", "#8f9dc9", "#efa0af", "#ffe680", "#d4b89e", "#e0c8ee", "#bcbcb0"]  # šedá až nakonec – plete se s okolím a „bez dat“


def party_of(vstrana, slozeni):
    codes = [int(vstrana)] + [int(x) for x in slozeni.split(",") if x.strip()]
    hits = [c for c in codes if c in PARTY_BY_CODE]
    return min(hits, key=PRIORITY.get) if hits else None


# --- registr kandidátek ---
# --- kdo kandidátku podává (pro čtenáře: „čí je to koalice“) z číselníku stran ČSÚ ---
CVS = {r["VSTRANA"]: r for r in rows(os.path.join(RAW, "KV2026ciselniky20261011_csv", "csv_od", "cvs.csv"))}
KRATKE = {c: z for c, z, _ in PARTY}  # zavedené zkratky celostátních stran


def strana(kod):
    kod = str(int(kod))
    if kod == "80":
        return "nezávislí kandidáti"
    if int(kod) in KRATKE:
        return KRATKE[int(kod)]
    r = CVS.get(kod)
    if not r:
        return kod
    return r["NAZEVCELK"] if len(r["NAZEVCELK"]) <= 48 else r["ZKRATKAV30"]


def slozeni(L):
    v = L["VSTRANA"]
    typ = CVS.get(v, {}).get("TYPVS")
    if v == "90":
        return "" if "nezávislých kandidátů" in L["NAZEVCELK"].lower() else "sdružení nezávislých kandidátů"
    if v == "80":
        return "nezávislý kandidát"
    cleny = [x for x in L["SLOZENI"].split(",") if x.strip()]
    if typ == "K":
        return "koalice " + ", ".join(strana(x) for x in cleny)
    if typ == "D":
        jm = [strana(x) for x in cleny if int(x) != 80]
        if any(int(x) == 80 for x in cleny):
            jm.append("nezávislí kandidáti")
        return "sdružení " + (", ".join(jm[:-1]) + " a " + jm[-1] if len(jm) > 1 else jm[0])
    nazev = CVS.get(v, {}).get("NAZEVCELK", "")
    return "" if nazev.lower() == L["NAZEVCELK"].lower() else nazev  # strana pod vlastním jménem: nic navíc


lists = {}  # (KODZASTUP, COBVODU, POR) -> kandidátka
zast_name = {}
for r in rows(os.path.join(REG, "kvros.csv")):
    k = (r["KODZASTUP"], r["COBVODU"], r["POR_STR_HL"])
    lists[k] = r
    zast_name[r["KODZASTUP"]] = r["NAZEVZAST"]

# --- okrsky: souhrn ---
okr = {}  # ID_OKRSKY -> souhrn
for r in rows(os.path.join(DATA, "kvt3.csv")):
    okr[r["ID_OKRSKY"]] = r
votes = collections.defaultdict(dict)  # ID_OKRSKY -> {POR: hlasy}
for r in rows(os.path.join(DATA, "kvhl.csv")):
    v = int(r["POC_HLASU"])
    if v:
        votes[r["ID_OKRSKY"]][r["POR_STR_HL"]] = v

# --- zastupitelstva: kandidátky sloučené přes volební obvody (stejná strana a název = jedna položka legendy) ---
zast = {}  # KODZASTUP -> {"n", "lists": [..], "key2i": {}}
okrsky = {}  # (obecKey, cislo) -> {"okres", "z": {typ: [KODZASTUP, vol, obalky, plhl, {i: hlasy}]}}
for oid, r in okr.items():
    kz, ob = r["KODZASTUP"], r["COBVODU"]
    Z = zast.setdefault(kz, {"n": zast_name.get(kz, ""), "lists": [], "key2i": {}, "tot": collections.Counter()})
    res = {}
    for por, v in votes[oid].items():
        L = lists[(kz, ob, por)]
        key = (L["VSTRANA"], L["NAZEVCELK"])
        if key not in Z["key2i"]:
            Z["key2i"][key] = len(Z["lists"])
            Z["lists"].append({"n": L["NAZEVCELK"], "z": L["ZKRATKAO8"], "k": slozeni(L), "p": party_of(L["VSTRANA"], L["SLOZENI"]), "m": 0, "_mand": set()})
        i = Z["key2i"][key]
        if (ob, por) not in Z["lists"][i]["_mand"]:
            Z["lists"][i]["_mand"].add((ob, por))
            Z["lists"][i]["m"] += int(L["MAND_STR"] or 0)
        res[i] = res.get(i, 0) + v
        Z["tot"][i] += v
    o = okrsky.setdefault((r["OBEC"], r["OKRSEK"]), {"okres": r["OKRES"], "z": {}})
    o["z"][r["TYPZASTUP"]] = [kz, int(r["VOL_SEZNAM"]), int(r["VYD_OBALKY"]), int(r["PL_HL_CELK"]), res]

# barvy a zkratky kandidátek v rámci zastupitelstva
for Z in zast.values():
    order = sorted(range(len(Z["lists"])), key=lambda i: -Z["tot"][i])
    used_party, li = set(), 0
    for i in order:
        L = Z["lists"][i]
        p = L.pop("p")
        L.pop("_mand")
        if p is not None and p not in used_party:
            used_party.add(p)
            L["c"] = PARTY_BY_CODE[p][1]
            L["s"] = PARTY_BY_CODE[p][0]
        else:
            L["c"] = LOCAL[li % len(LOCAL)]
            li += 1

# --- geometrie: klíč okrsku + okres ---
geo = json.load(open(os.path.join(RAW, "okrsky_zo2026.geojson"), encoding="utf-8"))
feats, unmatched = [], 0
obce = {}  # kód -> položka rejstříku
for f in geo["features"]:
    p = f["properties"]
    kod_obec, kod_mco, cislo = p["kod_obec"].strip(), (p["kod_mco"] or "").strip(), (str(int(p["cislo"])) if p["cislo"].strip() else "")
    if not kod_obec:
        continue
    ok = kod_mco or kod_obec
    o = okrsky.get((ok, cislo))
    if not o:
        unmatched += 1
        continue
    oid = f"{ok}-{cislo}"
    feats.append({"type": "Feature", "geometry": f["geometry"], "properties": {"id": oid, "okres": o["okres"]}})
    o["id"] = oid
    e = obce.setdefault(kod_obec, {"k": int(kod_obec), "n": p["naz_obec"].strip(), "o": o["okres"], "v": 0, "mc": {}})
    vol = o["z"].get("1", [0, 0])[1]
    e["v"] += vol
    if kod_mco:
        m = e["mc"].setdefault(kod_mco, {"k": int(kod_mco), "n": p["naz_mco"].strip(), "v": 0})
        m["v"] += vol
print("okrsků s geometrií:", len(feats), "bez výsledků:", unmatched, "výsledků bez geometrie:", sum(1 for o in okrsky.values() if "id" not in o))

with open(os.path.join(RAW, "okrsky_join.geojson"), "w", encoding="utf-8") as f:
    json.dump({"type": "FeatureCollection", "features": feats}, f, ensure_ascii=False)

# --- meta po okresech: okrsky + zastupitelstva, která se v okrese vyskytují ---
by_okres = collections.defaultdict(lambda: {"okrsky": {}, "zast": {}})
for o in okrsky.values():
    if "id" not in o:
        continue
    M = by_okres[o["okres"]]
    zz = {}
    for typ, (kz, vol, obal, plhl, res) in o["z"].items():
        zz[typ] = [int(kz), vol, obal, plhl, [[i, v] for i, v in sorted(res.items(), key=lambda t: -t[1])]]
        if kz not in M["zast"]:
            Z = zast[kz]
            M["zast"][kz] = {"n": Z["n"], "l": Z["lists"]}
    M["okrsky"][o["id"]] = zz
os.makedirs(os.path.join(OUT, "meta"), exist_ok=True)
for okres, M in by_okres.items():
    with open(os.path.join(OUT, "meta", f"{okres}.json"), "w", encoding="utf-8") as f:
        json.dump(M, f, ensure_ascii=False, separators=(",", ":"))

# --- rejstřík pro vyhledávání: [kód, název, okres, voliči, [[kód MČ, název, voliči], ...]] ---
index = [[e["k"], e["n"], int(e["o"]), e["v"], [[m["k"], m["n"], m["v"]] for m in sorted(e["mc"].values(), key=lambda m: m["n"])]]
         for e in sorted(obce.values(), key=lambda e: -e["v"])]
okresy = {r["NUMNUTS"]: r["NAZEVNUTS"] for r in rows(os.path.join(RAW, "KV2026ciselniky20261011_csv", "csv_od", "cnumnuts.csv"))
          if r["NUMNUTS"] in by_okres}
with open(os.path.join(OUT, "obce.json"), "w", encoding="utf-8") as f:
    json.dump({"okresy": okresy, "obce": index}, f, ensure_ascii=False, separators=(",", ":"))
print("obcí v rejstříku:", len(index), "okresů:", len(by_okres))
