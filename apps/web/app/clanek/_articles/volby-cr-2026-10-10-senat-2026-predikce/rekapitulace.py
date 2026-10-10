# Vypíše text průběžné rekapitulace podle odhad.json (stejný semafor jako mapa v článku).
# python rekapitulace.py           → text příspěvku na stdout
# python rekapitulace.py --pridej  → navíc ho přidá do zive.json
import datetime, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(os.path.join(HERE, "odhad.json"), encoding="utf-8"))
NAZVY = {3: "Cheb", 6: "Louny", 9: "Plzeň-město", 12: "Strakonice", 15: "Pelhřimov", 18: "Příbram", 21: "Praha 5",
         24: "Praha 9", 27: "Praha 1", 30: "Kladno", 33: "Děčín", 36: "Česká Lípa", 39: "Trutnov", 42: "Kolín",
         45: "Hradec Králové", 48: "Rychnov nad Kněžnou", 51: "Žďár nad Sázavou", 54: "Znojmo", 57: "Vyškov",
         60: "Brno-město", 63: "Přerov", 66: "Litovel", 69: "Frýdek-Místek", 72: "Ostrava-město", 75: "Karviná",
         78: "Zlín", 81: "Uherské Hradiště"}

jiste, temer, cekame = [], [], []
for ob in sorted(NAZVY):
    v = d["se"].get(str(ob), {})
    c = sorted(v.get("candidates", []), key=lambda k: -k["est_share"])
    if v.get("status") != "ok" or len(c) < 2:
        cekame.append(f"{NAZVY[ob]} (zatím bez sečtených okrsků)"); continue
    frac = v.get("frac_counted", 0)
    p1 = v.get("p_decided_round1", 0)
    kolo1 = p1 >= 0.5
    conf = c[0]["p_win_round1"] if kolo1 else max(0, c[0]["p_top2"] + c[1]["p_top2"] - 1)
    jist = conf >= 0.99 and frac >= 0.3
    if kolo1:
        co = f"{NAZVY[ob]}: v 1. kole vyhrává {c[0]['name']}" if jist else f"{NAZVY[ob]}: {c[0]['name']} nejspíš vyhrává už v 1. kole"
    else:
        co = f"{NAZVY[ob]}: do 2. kola {c[0]['name']} a {c[1]['name']}"
    sec = f"sečteno {round(frac * 100)} %"
    if jist:
        jiste.append(co)
    elif conf >= 0.9 and frac >= 0.15:  # při pár sečtených okrscích ještě nic netvrdíme
        temer.append(f"{co} ({sec})")
    else:
        cekame.append(f"{NAZVY[ob]} ({sec}, o postupu se ještě rozhoduje)")

def blok(nadpis, rows):
    return f"**{nadpis} ({len(rows)})**\n\n" + ("\n\n".join("– " + r for r in rows) if rows else "– zatím nic")

text = "\n\n".join([
    f"**Průběžná rekapitulace Senátu ({d['generated'][11:16]})**",
    blok("S jistotou víme", jiste),
    blok("Téměř jisté", temer),
    blok("Čekáme na sečtené hlasy", cekame),
])
print(text)
if '--pridej' in sys.argv:
    f = os.path.join(HERE, 'zive.json')
    z = json.load(open(f, encoding='utf-8'))
    z['zive'].append({'cas': datetime.datetime.now().strftime('%H:%M'), 'text': text})
    json.dump(z, open(f, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
