# Průběžná rekapitulace Senátu podle odhad.json (stejný semafor jako mapa v článku).
# python rekapitulace.py            → náhled na stdout
# python rekapitulace.py --pridej   → přidá příspěvek s tabulkou do zive.json
# python rekapitulace.py --nahrad   → nahradí poslední rekapitulaci v zive.json (stejný čas)
import datetime, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(os.path.join(HERE, "odhad.json"), encoding="utf-8"))
NAZVY = {3: "Cheb", 6: "Louny", 9: "Plzeň-město", 12: "Strakonice", 15: "Pelhřimov", 18: "Příbram", 21: "Praha 5",
         24: "Praha 9", 27: "Praha 1", 30: "Kladno", 33: "Děčín", 36: "Česká Lípa", 39: "Trutnov", 42: "Kolín",
         45: "Hradec Králové", 48: "Rychnov nad Kněžnou", 51: "Žďár nad Sázavou", 54: "Znojmo", 57: "Vyškov",
         60: "Brno-město", 63: "Přerov", 66: "Litovel", 69: "Frýdek-Místek", 72: "Ostrava-město", 75: "Karviná",
         78: "Zlín", 81: "Uherské Hradiště"}

# čitelné názvy koalic místo zkratek modelu
STRANY = {"KDUODSSTANTOPST": "KDU-ČSL, ODS, STAN, TOP 09", "KDUODSSTPTOPLES": "KDU-ČSL, ODS a další",
          "ZelSTAPirTOPSEN": "Zelení, STAN, Piráti, TOP 09, SEN 21", "KDUODSSTANPiTOP": "KDU-ČSL, ODS, STAN, Piráti, TOP 09",
          "ZelSTANPiTOPHDK": "Zelení, STAN, Piráti, TOP 09, HDK", "KDU+ODS+STA+TOP": "KDU-ČSL, ODS, STAN, TOP 09",
          "KDU+ODS+TOP 09": "KDU-ČSL, ODS, TOP 09", "NČ": "Naše Česko"}
for v in d["se"].values():
    for k in v.get("candidates", []):
        k["party"] = STRANY.get(k["party"], k["party"])

rows = []
for ob in sorted(NAZVY):
    v = d["se"].get(str(ob), {})
    c = sorted(v.get("candidates", []), key=lambda k: -k["est_share"])
    if v.get("status") != "ok" or len(c) < 2:
        rows.append({"stav": "cekame", "ob": ob, "obvod": NAZVY[ob], "vysledek": "zatím bez sečtených okrsků"}); continue
    frac = v.get("frac_counted", 0)
    kolo1 = v.get("p_decided_round1", 0) >= 0.5
    conf = c[0]["p_win_round1"] if kolo1 else min(c[0]["p_top2"], c[1]["p_top2"])
    if conf >= 0.99 and frac >= 0.3:
        stav = "jiste"
    elif conf >= 0.9 and frac >= 0.15:  # při pár sečtených okrscích ještě nic netvrdíme
        stav = "temer"
    else:
        stav = "cekame"
    if stav == "cekame":
        vys = f"vede {c[0]['name']}, o postupu se ještě rozhoduje"
    elif kolo1:
        vys = f"{c[0]['name']} ({c[0]['party']}) vyhrává už v 1. kole" if stav == "jiste" else \
              f"{c[0]['name']} ({c[0]['party']}) nejspíš vyhrává už v 1. kole"
    else:
        vys = f"do 2. kola {c[0]['name']} ({c[0]['party']}) a {c[1]['name']} ({c[1]['party']})"
    rows.append({"stav": stav, "ob": ob, "obvod": NAZVY[ob], "vysledek": vys, "secteno": round(frac * 100)})

n = {s: sum(r["stav"] == s for r in rows) for s in ("jiste", "temer", "cekame")}
text = (f"**Průběžná rekapitulace Senátu ({d['generated'][11:16]})** · jisté: {n['jiste']} · "
        f"téměř jisté: {n['temer']} · čekáme na sečtené hlasy: {n['cekame']} (z 27 obvodů)")
print(text)
for r in rows:
    print(f"  [{r['stav']}] {r['ob']:>2} {r['obvod']}: {r['vysledek']} {r.get('secteno', '')}")

if "--pridej" in sys.argv or "--nahrad" in sys.argv:
    f = os.path.join(HERE, "zive.json")
    z = json.load(open(f, encoding="utf-8"))
    item = {"cas": datetime.datetime.now().strftime("%H:%M"), "text": text, "rekap": rows}
    if "--nahrad" in sys.argv:
        idx = max(i for i, p in enumerate(z["zive"]) if "rekapitulace Senátu" in p["text"])
        item["cas"] = z["zive"][idx]["cas"]
        z["zive"][idx] = item
    else:
        z["zive"].append(item)
    json.dump(z, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
