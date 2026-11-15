"""Mapa demonstrací listopad–prosinec 1989 (kapitola „Svoboda“ speciálu Jací jsme byli, jací jsme).

Vstup (archiv dat mimo git, u složky ZDROJ.txt s URL pramenů a postupem extrakce):
  statisticka-data/cesko/historie/demonstrace-1989/20261114/demonstrace_1989.csv
    – řádek = jedna akce podle jednoho pramene (FMV, Informační servis NTS, Suk/ÚSD, ÚSTR),
      pro_mapu = 1 je jeden doporučený řádek na den × obec (největší uvedený odhad).
Geometrie krajů: sdílená mapa obcí webu (TopoJSON v S-JTSK, objekt „kraje“)
  apps/web/app/clanek/_articles/volby-cr-2026-09-24-mista-kde-neexistuje-politicka-konkurence/obce-geo.json

Výstup: ../data/demonstrace-1989.json pro komponentu <Demonstrace1989Map> a čísla do vystup_demonstrace.txt.
Nic se nedopočítává ani neodhaduje: počty jsou přesně ucastnici_min/max z CSV, akce bez čísla
zůstávají bez čísla. Souřadnice obcí (WGS84 v CSV) se převádějí do S-JTSK (EPSG:5514), aby seděly
na geometrii krajů. Spouštění: python demonstrace.py
"""
import csv
import json
import os
import sys
from collections import Counter, defaultdict
from datetime import date, timedelta
from pathlib import Path

from pyproj import Transformer

sys.stdout.reconfigure(encoding="utf-8")
HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "data" / "demonstrace-1989.json"
VYSTUP = HERE / "vystup_demonstrace.txt"
SADA = Path("historie") / "demonstrace-1989" / "20261114"
GEO = (HERE.parents[1] / "volby-cr-2026-09-24-mista-kde-neexistuje-politicka-konkurence" / "obce-geo.json")

PRVNI, POSLEDNI = date(1989, 11, 9), date(1989, 12, 26)
TOLERANCE_M = 600  # zjednodušení hranic krajů (Douglas–Peucker, metry S-JTSK; 1 px mapy ≈ 650 m)


def najdi_archiv() -> Path:
    if os.environ.get("CSU_DATA"):
        return Path(os.environ["CSU_DATA"])
    for p in Path(__file__).resolve().parents:
        for kandidat in (p / "csu-data", p / "statisticka-data" / "cesko"):
            if kandidat.exists():
                return kandidat
    raise SystemExit("Archiv csu-data nenalezen – nastav CSU_DATA")


radky_vystupu: list[str] = []


def radek(s: str = ""):
    print(s)
    radky_vystupu.append(s)


# ---------- kdo odhadoval ----------
KDO = {
    "FMV": "policie (StB a VB) – denní situační zpráva FMV",
    "IS": "opozice – Informační servis NTS (prostředí OF)",
    "USD": "historik Jiří Suk (ÚSD AV ČR)",
    "USTR": "ÚSTR – chronologie Listopad 1989",
}


def kratky_zdroj(z: str) -> str:
    for oddelovac in (" (fond ABS", ", Nezávislé tiskové", ", 1. díl", " (web ÚSTR)"):
        if oddelovac in z:
            return z.split(oddelovac)[0].strip()
    return z.strip()


def cislo(s: str):
    s = (s or "").strip()
    return int(s) if s else None


# ---------- zjednodušení čar (Douglas–Peucker) ----------
def dp(body, tol):
    if len(body) < 3:
        return body
    (x1, y1), (x2, y2) = body[0], body[-1]
    dx, dy = x2 - x1, y2 - y1
    d2 = dx * dx + dy * dy
    nej, idx = -1.0, 0
    for i in range(1, len(body) - 1):
        px, py = body[i]
        if d2 == 0:
            vzd = ((px - x1) ** 2 + (py - y1) ** 2) ** 0.5
        else:
            vzd = abs(dy * px - dx * py + x2 * y1 - y2 * x1) / d2 ** 0.5
        if vzd > nej:
            nej, idx = vzd, i
    if nej <= tol:
        return [body[0], body[-1]]
    return dp(body[: idx + 1], tol)[:-1] + dp(body[idx:], tol)


def kraje_geometrie():
    topo = json.loads(GEO.read_text(encoding="utf-8"))
    sx, sy = topo["transform"]["scale"]
    tx, ty = topo["transform"]["translate"]
    oblouky = []
    for arc in topo["arcs"]:
        x = y = 0
        body = []
        for dx, dy in arc:
            x += dx
            y += dy
            body.append((x * sx + tx, y * sy + ty))
        oblouky.append(body)

    pouziti = Counter()
    geometrie = topo["objects"]["kraje"]["geometries"]

    def prstence(g):
        if g["type"] == "Polygon":
            return [g["arcs"]]
        if g["type"] == "MultiPolygon":
            return g["arcs"]
        return []

    for g in geometrie:
        for poly in prstence(g):
            for ring in poly:
                for a in ring:
                    pouziti[a if a >= 0 else ~a] += 1

    zjedn = {}

    def oblouk(i):
        j = i if i >= 0 else ~i
        if j not in zjedn:
            zjedn[j] = [(round(x), round(y)) for x, y in dp(oblouky[j], TOLERANCE_M)]
        return zjedn[j] if i >= 0 else zjedn[j][::-1]

    features = []
    for g in geometrie:
        polys = []
        for poly in prstence(g):
            rings = []
            for ring in poly:
                body = []
                for a in ring:
                    o = oblouk(a)
                    body.extend(o if not body else o[1:])
                if len(body) >= 4:
                    rings.append([list(p) for p in body])
            if rings:
                polys.append(rings)
        features.append({"type": "Feature", "properties": {"kraj": g.get("properties", {}).get("kraj")},
                         "geometry": {"type": "MultiPolygon", "coordinates": polys}})
    obrys = [[list(p) for p in oblouk(j)] for j, n in pouziti.items() if n == 1]
    return (
        {"type": "FeatureCollection", "features": features},
        {"type": "MultiLineString", "coordinates": obrys},
    )


def main():
    archiv = najdi_archiv() / SADA
    csv_soubor = archiv / "demonstrace_1989.csv"
    with open(csv_soubor, encoding="utf-8-sig", newline="") as f:
        vse = list(csv.DictReader(f))
    vse = [r for r in vse if r["stat"] == "CZ"]
    mapa = [r for r in vse if r["pro_mapu"] == "1"]

    dny = []
    d = PRVNI
    while d <= POSLEDNI:
        dny.append(d.isoformat())
        d += timedelta(days=1)
    index_dne = {s: i for i, s in enumerate(dny)}

    to_sjtsk = Transformer.from_crs("EPSG:4326", "EPSG:5514", always_xy=True)

    obce = {}
    akce = []
    mimo_obdobi = 0
    for r in sorted(mapa, key=lambda r: (r["datum"], r["obec"])):
        if r["datum"] not in index_dne:
            mimo_obdobi += 1
            continue
        kod = r["kod_obce"]
        if kod not in obce:
            x, y = to_sjtsk.transform(float(r["lon"]), float(r["lat"]))
            obce[kod] = {"n": r["obec"], "x": round(x), "y": round(y), "kraj": r["kraj_dnes"]}
        mn, mx = cislo(r["ucastnici_min"]), cislo(r["ucastnici_max"])
        # velikost bubliny = horní uvedená hodnota (u rozpětí horní hranice), jinak jediné číslo
        v = mx if mx is not None else mn
        # jiné číselné odhady téže akce (týž den a obec) z ostatních pramenů
        jine = []
        videno = {(r["zdroj_typ"], mn, mx)}
        for o in vse:
            if o is r or o["datum"] != r["datum"] or o["kod_obce"] != kod:
                continue
            omn, omx = cislo(o["ucastnici_min"]), cislo(o["ucastnici_max"])
            if omn is None and omx is None:
                continue
            klic = (o["zdroj_typ"], omn, omx)
            if klic in videno:
                continue
            videno.add(klic)
            jine.append({"kdo": o["zdroj_typ"], "min": omn, "max": omx, "text": o["ucastnici_text"].strip(),
                         "zdroj": kratky_zdroj(o["zdroj"])})
        akce.append({
            "d": index_dne[r["datum"]],
            "o": kod,
            "min": mn,
            "max": mx,
            "v": v,
            "text": r["ucastnici_text"].strip(),
            "kdo": r["zdroj_typ"],
            "typ": r["typ"],
            "zdroj": kratky_zdroj(r["zdroj"]),
            **({"jine": jine} if jine else {}),
        })

    kraje, obrys = kraje_geometrie()

    # ---------- čísla pro text a kontrolu ----------
    radek("MAPA DEMONSTRACÍ 9. 11. – 26. 12. 1989 (území dnešní ČR)")
    radek(f"vstup: {csv_soubor}")
    radek(f"řádků CZ celkem: {len(vse)}, s pro_mapu = 1: {len(mapa)}, mimo období mapy: {mimo_obdobi}")
    radek(f"akcí na mapě (den × obec): {len(akce)}, obcí: {len(obce)}, dnů: {len(dny)}")
    s_cislem = [a for a in akce if a["v"] is not None]
    radek(f"akcí s číslem: {len(s_cislem)}, bez čísla: {len(akce) - len(s_cislem)}")
    radek("podle pramene (kdo odhadoval): " + ", ".join(f"{k} {n}" for k, n in Counter(a["kdo"] for a in akce).most_common()))
    nej = max(s_cislem, key=lambda a: a["v"])
    radek(f"největší číslo: {obce[nej['o']]['n']} {dny[nej['d']]}: {nej['v']:,} ({nej['kdo']}), jiné odhady: "
          + "; ".join(f"{j['kdo']} {j['min']}–{j['max']}" for j in nej.get("jine", [])))
    radek()
    radek("Teplice (předehra):")
    for a in akce:
        if obce[a["o"]]["n"] == "Teplice":
            radek(f"  {dny[a['d']]}: {a['v']} – „{a['text']}“ ({a['kdo']}, {a['zdroj']})")
    radek()
    radek("Praha 25. 11. (Letná), všechny řádky CSV:")
    for r in vse:
        if r["obec"] == "Praha" and r["datum"] == "1989-11-25":
            radek(f"  {r['zdroj_typ']}: {r['ucastnici_min']}–{r['ucastnici_max']} „{r['ucastnici_text']}“ ({kratky_zdroj(r['zdroj'])})")
    radek()
    prvni_v_obci = {}
    for a in akce:
        prvni_v_obci.setdefault(a["o"], a["d"])
    for den in ("1989-11-16", "1989-11-22", "1989-11-26", "1989-11-30", "1989-12-26"):
        n = sum(1 for d0 in prvni_v_obci.values() if d0 <= index_dne[den])
        radek(f"obcí s akcí v datech do {den} včetně: {n}")
    po_dnech = Counter(a["d"] for a in akce)
    dmax, nmax = po_dnech.most_common(1)[0]
    radek(f"nejvíc obcí v jednom dni: {dny[dmax]} ({nmax})")
    stavka = [a for a in akce if dny[a["d"]] == "1989-11-27"]
    radek(f"27. 11. (generální stávka): obcí {len(stavka)}, z toho s číslem {sum(1 for a in stavka if a['v'] is not None)}")
    radek()
    radek("Pozn.: FMV, DSZ č. 182/B/1989, s. 2 (OCR pracovni/ocr_fmv/dsz182b-11-1989_p002.txt): „Demonstrace a shromáždění")
    radek("občanů se konala ve všech krajských a v 56 dalších městech ČSSR“ – města nejmenuje.")

    data = {
        "title": "Po 17. listopadu se demonstrovalo {po celé zemi|#de1743}",
        "subtitle": (
            f"Demonstrace a shromáždění na území dnešního Česka, 9. listopadu – 26. prosince 1989, den po dni. "
            f"Plocha bubliny = počet účastníků podle dobového odhadu, modrý bod = akce bez čísla, "
            f"bledé stopy = dřívější akce. {len(akce)} akcí v {len(obce)} obcích"
        ),
        "zdroj": (
            "ABS/ÚSTR – [denní situační zprávy FMV](https://www.ustrcr.cz/uvod/listopad-1989/denni-situacni-zpravy/denni-situacni-zpravy-fmv/), "
            "Informační servis NTS (digitalizace Scriptum), "
            "chronologie [ÚSD AV ČR (J. Suk)](https://www.89.usd.cas.cz/cs/udalosti.html) a "
            "[ÚSTR](https://www.ustrcr.cz/uvod/listopad-1989/chronologie/); výpočet DataTimes"
        ),
        "poznamka": (
            "Čísla jsou dobové odhady různých stran: policie (StB a VB) uváděla spíš nižší, opozice spíš vyšší, "
            "historici původ odhadu neuvádějí. U rozpětí odpovídá bublina horní hranici. Seznam měst je neúplný – "
            "[denní situační zpráva FMV k 25. listopadu](https://www.ustrcr.cz/data/pdf/svodky/dsz182b-11-1989.pdf) "
            "píše o demonstracích „ve všech krajských a v 56 dalších městech ČSSR“, ale nejmenuje je. "
            "Generální stávka 27. listopadu je po obcích v pramenech téměř bez čísel. Slovensko mapa neukazuje."
        ),
        "dny": dny,
        "kdo": KDO,
        "obce": obce,
        "akce": akce,
        "kraje": kraje,
        "obrys": obrys,
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    radek()
    radek(f"zapsáno: {OUT.name} ({OUT.stat().st_size / 1024:.0f} kB)")
    VYSTUP.write_text("\n".join(radky_vystupu) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
