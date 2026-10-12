# Ke konečným výsledkům na mapách najde naši predikci z volebního večera, která byla konečnému
# výsledku nejblíž: snímek odhadu (historie odhad_kv.json / odhad.json v gitu), kdy ještě běželo
# sčítání a průměrná odchylka odhadu u hlavních stran (konečně ≥ 5 %) / kandidátů byla nejmenší.
# Ranní snímek (6:44, sečteno 99–100 %) se za predikci nepočítá.
# python nejblizsi_predikce.py  →  predikce_nejblizsi.json
import json, os, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))

def snimky(soubor):
    hs = subprocess.run(["git", "-C", HERE, "log", "--format=%h", "--", soubor], capture_output=True, text=True).stdout.split()
    out = {}
    for h in hs:
        d = json.loads(subprocess.run(["git", "-C", HERE, "show", f"{h}:./{soubor}"], capture_output=True, text=True, encoding="utf-8").stdout)
        out[d["generated"]] = d
    return [out[g] for g in sorted(out) if g < "2026-10-11"]

def nejblizsi(snaps, fin, get):
    """get(d) → (frac, {jméno: podíl}, extra) nebo None; vrací nejbližší snímek během sčítání."""
    hlavni = {k: v for k, v in fin.items() if v >= 0.05} or fin
    best = None
    for d in snaps:
        g = get(d)
        if not g or not (0 < g[0] < 0.999):
            continue
        frac, sh, extra = g
        err = sum(abs(sh.get(k, 0) - v) for k, v in hlavni.items()) / len(hlavni)
        if best is None or err < best[0]:
            best = (err, d["generated"][11:16], frac, extra)
    return best

out = {"kv": {}, "se": {}}

kvs = snimky("odhad_kv.json")
fin = json.load(open(os.path.join(HERE, "odhad_kv.json"), encoding="utf-8"))["kv"]
for k, z in fin.items():
    if not z.get("l"):
        continue
    def get(d):
        x = d["kv"].get(k)
        if not x or not x.get("l"):
            return None
        return x["frac"], {l["a"] + "|" + l["nm"]: l["e"] for l in x["l"]}, {l["a"] + "|" + l["nm"]: [l["e"], l["s"]] for l in x["l"]}
    b = nejblizsi(kvs, {l["a"] + "|" + l["nm"]: l["e"] for l in z["l"]}, get)
    if b:
        out["kv"][k] = {"t": b[1], "frac": round(b[2], 3), "err": round(b[0], 4), "l": b[3]}

ses = snimky("odhad.json")
fin = json.load(open(os.path.join(HERE, "odhad.json"), encoding="utf-8"))["se"]
for o, z in fin.items():
    if not z.get("candidates"):
        continue
    def get(d):
        x = d["se"].get(o)
        if not x or x.get("status") != "ok" or not x.get("candidates"):
            return None
        return x.get("frac_counted", 0), {c["name"]: c["est_share"] for c in x["candidates"]}, {str(c["no"]): round(c["est_share"], 4) for c in x["candidates"]}
    b = nejblizsi(ses, {c["name"]: c["est_share"] for c in z["candidates"]}, get)
    if b:
        out["se"][o] = {"t": b[1], "frac": round(b[2], 3), "err": round(b[0], 4), "c": b[3]}

# Predikce, které jsme večer opravdu zveřejnili (screenshoty dashboardu), mají přednost před nejbližším snímkem.
# klíč zastupitelstva → čas, podíl sečtených okrsků a odhady z obrázku (mandáty na screenshotu nejsou → None)
ZVEREJNENO = {
    "554782_1": [{"t": "23:23", "frac": 898 / 1120, "zdroj": "karta dashboardu na síti X od Michala Škopa ve 23:23", "e": {
        "STAN": (0.233, 18), "ODS+TOP 09": (0.217, 16), "PRAHA SOBĚ+NK": (0.181, 13), "ANO": (0.142, 11), "Piráti": (0.095, 7),
        "SPD+NK": (0.035, 0), "AUTO": (0.029, 0), "HPPSENMourekNK": (0.028, 0), "KSČM+KSČ+ČSSD": (0.009, 0), "TEAM+NK": (0.007, 0),
        "Patrioti ČR+NK": (0.006, 0), "Svobodní": (0.005, 0), "GEN+NK": (0.004, 0)}},
                 {"t": "18:35", "frac": 56 / 1120, "zdroj": "screenshot dashboardu (stav 18:29) zveřejněný v 18:35", "e": {
        "ODS+TOP 09": 0.221, "STAN": 0.219, "PRAHA SOBĚ+NK": 0.189, "ANO": 0.141, "Piráti": 0.088, "HPPSENMourekNK": 0.040,
        "SPD+NK": 0.038, "AUTO": 0.027, "KSČM+KSČ+ČSSD": 0.010, "Patrioti ČR+NK": 0.007, "TEAM+NK": 0.005, "Svobodní": 0.005,
        "GEN+NK": 0.004, "Levice": 0.002}}],
    # karta v reportáži 21:26 (tweet ve 22:00); mandáty z karty
    "563889_1": {"t": "21:26", "frac": 82 / 87, "zdroj": "karta dashboardu v reportáži 21:26", "e": {
        "SLK": (0.286, 14), "Lepší město+NK": (0.222, 11), "ANO": (0.176, 8), "Zelení+Piráti": (0.127, 6), "SPD": (0.046, 0),
        "ODS+USZ": (0.043, 0), "KDUČSL+TOP09+NK": (0.042, 0), "PRO": (0.036, 0), "GEN+NK": (0.020, 0), "DSZ+NK": (0.001, 0), "ČSA": (0.001, 0)}},
    # karta v reportáži 19:22 (mandáty na kartě useknuté)
    "582786_1": {"t": "19:22", "frac": 87 / 353, "zdroj": "karta dashboardu v reportáži 19:22", "e": {
        "KDU-ČSL+STAN": 0.270, "ODS+TOP 09+NK": 0.183, "ANO": 0.174, "ZLESŽBSENBuVoKr": 0.092, "PirIdeFaktBrGEN": 0.073,
        "Za Lužánky": 0.051, "SPD+NK": 0.038, "AUTO": 0.030, "NB": 0.023, "KLID": 0.016, "KSČMČSSDDOSmSt!": 0.016,
        "Svobo+Triko+PRO": 0.011, "PŘÍSAHA": 0.010, "SOCDEM+NK": 0.008, "LANO+VRBa": 0.004, "DSZ+NK": 0.000}},
}
fin_kv = json.load(open(os.path.join(HERE, "odhad_kv.json"), encoding="utf-8"))["kv"]
def _blizkost(k, z):
    hl = [x for x in fin_kv[k]["l"] if x["e"] >= 0.05 and x["a"] in z["e"]]
    val = lambda v: v[0] if isinstance(v, tuple) else v
    return sum(abs(val(z["e"][x["a"]]) - x["e"]) for x in hl) / max(1, len(hl))
for k, z in ZVEREJNENO.items():
    if isinstance(z, list):  # víc zveřejněných predikcí → ta nejbližší konečnému výsledku
        z = min(z, key=lambda v: _blizkost(k, v))
    l = {f"{x['a']}|{x['nm']}": list(z["e"][x["a"]]) if isinstance(z["e"][x["a"]], tuple) else [z["e"][x["a"]], None]
         for x in fin_kv[k]["l"] if x["a"] in z["e"]}
    out["kv"][k] = {"t": z["t"], "frac": round(z["frac"], 3), "zdroj": z["zdroj"], "l": l}

# Senát: predikce zveřejněné večer na sítích (karty obvodů, přehledy ze stavu 18:02 a 18:11), čas = čas zveřejnění.
# U každého obvodu se vybere ta, která byla konečnému výsledku nejblíž (průměrná odchylka u uvedených kandidátů).
# Přehledy mají jen zaokrouhlená procenta 1–2 kandidátů (zbytek je na obrázku useknutý).
P1802 = {3: (102, 158, {"Miroslav Plevný": 38, "Sandra Tsoukernik": 28}), 6: (211, 293, {"Ivo Trešl": 44, "Jaroslav Mikoláš": 25}),
         9: (33, 148, {"Karel Řehka": 31, "Lucie Kantorová": 29}), 12: (262, 321, {"Tomáš Fiala": 57, "Miroslav Ušatý": 23}),
         15: (283, 349, {"Ladislav Med": 31}), 18: (186, 265, {"Petr Štěpánek": 45, "Barbora Daňhová": 26}),
         21: (1, 141, {"Václav Láska": 32}), 24: (1, 111, {"David Smoljak": 42}), 30: (92, 144, {"Petr Paták": 30}),
         33: (69, 141, {"Zbyněk Linhart": 52, "Michal Hejcman": 21}), 36: (189, 227, {"Jitka Volfová": 35, "Martin Půta": 33}),
         39: (116, 177, {"Jan Sobotka": 58, "Zuzana Chovancová": 29}), 42: (162, 225, {"Michael Kašpar": 46, "Andrea Brzobohatá": 26}),
         45: (109, 189, {"Zuzana Ceralová Petrofová": 24}), 48: (171, 239, {"Jan Grulich": 62}), 51: (214, 266, {"Michal Šmarda": 28}),
         54: (147, 204, {"Tomáš Třetina": 36}), 57: (86, 162, {"Jan Grolich": 63, "Petra Absolonová": 30}),
         60: (4, 113, {"Zdeněk Papoušek": 33}), 63: (148, 216, {"Jakub Navařík": 38}), 66: (162, 226, {"Marek Ošťádal": 35, "Martin Škurek": 28}),
         69: (63, 121, {"Helena Pešatová": 39}), 72: (18, 117, {"Ondřej Šimetka": 47}), 75: (84, 111, {"Lenka Brzyszkowská": 33, "Petr Kazík": 15}),
         78: (51, 126, {"Tomáš Goláň": 37}), 81: (39, 123, {"Josef Bazala": 50, "Jiří Vašica": 26})}
P1811 = {3: (105, 158, {"Miroslav Plevný": 38, "Sandra Tsoukernik": 28}), 6: (217, 293, {"Ivo Trešl": 44, "Jaroslav Mikoláš": 26}),
         9: (36, 148, {"Karel Řehka": 32, "Lucie Kantorová": 29}), 12: (267, 321, {"Tomáš Fiala": 57, "Miroslav Ušatý": 23}),
         15: (287, 349, {"Ladislav Med": 31}), 18: (191, 265, {"Petr Štěpánek": 45, "Barbora Daňhová": 26}),
         21: (3, 141, {"Radko Sáblík": 31}), 24: (1, 111, {"David Smoljak": 42}), 30: (93, 144, {"Adéla Sucharda Šípová": 30}),
         33: (71, 141, {"Zbyněk Linhart": 52}), 36: (199, 227, {"Jitka Volfová": 35, "Martin Půta": 33}),
         39: (122, 177, {"Jan Sobotka": 59, "Zuzana Chovancová": 29}), 42: (165, 225, {"Michael Kašpar": 46, "Andrea Brzobohatá": 26}),
         45: (114, 189, {"Zuzana Ceralová Petrofová": 24}), 48: (182, 239, {"Jan Grulich": 62}), 51: (220, 266, {"Michal Šmarda": 28}),
         54: (151, 204, {"Tomáš Třetina": 36}), 57: (96, 162, {"Jan Grolich": 62}), 60: (7, 113, {"Zdeněk Papoušek": 37}),
         63: (158, 216, {"Jakub Navařík": 38}), 66: (166, 226, {"Marek Ošťádal": 35, "Martin Škurek": 28}),
         69: (70, 121, {"Helena Pešatová": 38}), 72: (23, 117, {"Ondřej Šimetka": 47}), 75: (87, 111, {"Lenka Brzyszkowská": 33, "Petr Kazík": 15}),
         78: (57, 126, {"Tomáš Goláň": 36}), 81: (46, 123, {"Josef Bazala": 49, "Jiří Vašica": 27})}
SE_ZVEREJNENO = [(ob, "18:08", nc / nt, {k: v / 100 for k, v in c.items()}) for ob, (nc, nt, c) in P1802.items()] + [
    (ob, "18:19", nc / nt, {k: v / 100 for k, v in c.items()}) for ob, (nc, nt, c) in P1811.items()] + [
    # první predikce na Twitteru v 15:13 (karta Strakonic + přehled ze stavu 14:54)
    (12, "15:13", 9 / 321, {"Tomáš Fiala": .531, "Miroslav Ušatý": .256, "Jana Hrdinová": .213}),
    (12, "15:13", 3 / 321, {"Tomáš Fiala": .59, "Miroslav Ušatý": .28}),
    (15, "15:13", 3 / 349, {"Michal Kozár": .27, "Ladislav Med": .27}),
    (36, "15:13", 1 / 227, {"Jitka Volfová": .58, "Vít Vomáčka": .20, "Martin Půta": .08}),
    (45, "15:13", 1 / 189, {"Monika Nebeská": .27, "Zuzana Ceralová Petrofová": .19}),
    (48, "15:13", 1 / 239, {"Jan Grulich": .57}),
    (51, "15:13", 1 / 266, {"Radek Koten": .40, "Michal Šmarda": .20}),
    (6, "15:33", 28 / 294, {"Ivo Trešl": .535, "Jaroslav Mikoláš": .265, "Vladislav Hrbáček": .089, "Leo Steiner": .048, "Ivana Hluštíková": .034, "Jiří Kobza": .030}),
    (6, "16:59", 155 / 294, {"Ivo Trešl": .446, "Jaroslav Mikoláš": .271, "Leo Steiner": .100, "Vladislav Hrbáček": .094, "Ivana Hluštíková": .058, "Jiří Kobza": .031}),
    (15, "15:40", 55 / 349, {"Ladislav Med": .302, "Michal Kozár": .256, "Jaroslav Chalupský": .228, "Karolína Kubisková": .113, "Lucie Pavlů Řádová": .072, "Pavel Hodáč": .030}),
    (54, "15:46", 18 / 204, {"Tomáš Třetina": .350, "Jiří Kyněra": .205, "Jindřich Růžička": .154, "Petra Rédová Fajmonová": .108, "Pavel Černý": .097, "Bohumila Beranová": .086}),
    (18, "15:50", 23 / 265, {"Petr Štěpánek": .477, "Barbora Daňhová": .263, "Josef Šorna": .083, "Simona Luftová": .078, "Frank Thomas Podstatzky-Lichtenstein": .053, "Pavel Vermach": .047}),
    (12, "15:54", 108 / 322, {"Tomáš Fiala": .581, "Miroslav Ušatý": .211, "Jana Hrdinová": .208}),
    (36, "16:07", 43 / 227, {"Jitka Volfová": .343, "Martin Půta": .291, "Jiří Vosecký": .219, "Vít Vomáčka": .108, "Leoš Hamrský": .039}),
    (30, "16:20", 20 / 144, {"Adéla Sucharda Šípová": .314, "Petr Paták": .269, "Aleš Gerloch": .221, "Jan Klas": .089, "Marcela Machalová": .062, "Jaroslav Pelc": .045}),
    (57, "16:23", 13 / 162, {"Jan Grolich": .597, "Petra Absolonová": .302, "Jaroslav Fládr": .101}),
    (48, "16:29", 83 / 239, {"Jan Grulich": .632, "Petr Sadovský": .368}),
    (9, "18:29", 45 / 148, {"Karel Řehka": .312, "Lucie Kantorová": .284, "Lumír Aschenbrenner": .193, "Daniela Pousková": .082}),
]
fin_se = json.load(open(os.path.join(HERE, "odhad.json"), encoding="utf-8"))["se"]
for ob in sorted({x[0] for x in SE_ZVEREJNENO}):
    cands = {c["name"]: c for c in fin_se[str(ob)]["candidates"]}
    best = None
    for o, t, frac, vals in SE_ZVEREJNENO:
        if o != ob:
            continue
        miss = [n for n in vals if n not in cands]
        assert not miss, (ob, miss)
        err = sum(abs(v - cands[n]["est_share"]) for n, v in vals.items()) / len(vals)
        if best is None or err < best[0]:
            best = (err, t, frac, vals)
    out["se"][str(ob)] = {"t": best[1], "frac": round(best[2], 3), "zdroj": "zveřejněno", "err": round(best[0], 4),
                          "c": {str(cands[n]["no"]): v for n, v in best[3].items()}}

json.dump(out, open(os.path.join(HERE, "predikce_nejblizsi.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
from collections import Counter
print("zastupitelstva s predikcí:", len(out["kv"]), Counter(v["t"] for v in out["kv"].values()))
print("Senát:", len(out["se"]), Counter(v["t"] for v in out["se"].values()))
