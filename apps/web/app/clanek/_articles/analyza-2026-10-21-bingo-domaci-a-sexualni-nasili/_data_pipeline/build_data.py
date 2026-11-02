"""Čísla a grafy k analýze „bingo diskusí o domácím a sexuálním násilí“.

Každé číslo v textu a v grafech se počítá tady z primárních zdrojů:
  - Special Eurobarometer 449 „Gender-based violence“ (2016), tabulky T19–T23 (PDF)
    https://europa.eu/eurobarometer/surveys/detail/2115 (stahujeme kopii PDF z rtvslo.si, stejný dokument)
  - Flash Eurobarometer 544 „Gender stereotypes – violence against women“ (2024), česká factsheet + zpráva (PDF)
    https://europa.eu/eurobarometer/surveys/detail/3252
  - Eurostat, šetření EU-GBV: gbv_ipv_type, gbv_any_rp (data 2021); vraždy crim_hom_vrel (API)
Hodnoty z dokumentů, které nejsou tabulkou (APIC, studie), jsou v DOLOZENE se zdrojem a stranou.

Spuštění (z této složky): python -I build_data.py
Zdrojové PDF se stáhnou do raw/ (mimo git). Výstup: ../data/*.json (Vega-Lite) a cisla.json.
"""
import json
import re
import sys
import urllib.request
from pathlib import Path

import pypdf

HERE = Path(__file__).resolve().parent
RAW = HERE / "raw"
OUT = HERE.parent / "data"
RAW.mkdir(exist_ok=True)
OUT.mkdir(exist_ok=True)

ZDROJE = {
    "seb449.pdf": "https://www.rtvslo.si/files/eukomisija/ebs_449_en.pdf",
    "fl544_report.pdf": "https://webgate.ec.europa.eu/ebsm/api/public/deliverable/download?doc=true&deliverableId=95144",
    "fl544_cz_factsheet.pdf": "https://webgate.ec.europa.eu/ebsm/api/public/deliverable/download?doc=true&deliverableId=95152",
}
EUROSTAT = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{}?{}"

# Barvy jen ze závazné palety (packages/ui/DESIGN.md)
CRIMSON = "#de1743"  # brand.6 – Česko
NAVY = "#101432"     # brandNavy.9
GREY = "#c8c8bc"     # background.8 – průměr EU
ORANGE = "#f76800"   # brandOrange.6 – ženy
TEAL = "#06677d"     # brandTeal.7 – muži
SCHEMA = "https://vega.github.io/schema/vega-lite/v5.json"


def stahni(nazev):
    p = RAW / nazev
    if not p.exists():
        urllib.request.urlretrieve(ZDROJE[nazev], p)
    return p


def text_pdf(nazev):
    cache = RAW / (nazev[:-4] + ".txt")
    if not cache.exists():
        r = pypdf.PdfReader(stahni(nazev))
        cache.write_text("".join(f"\n===== PAGE {i + 1} =====\n" + (p.extract_text() or "") for i, p in enumerate(r.pages)), encoding="utf-8")
    return cache.read_text(encoding="utf-8")


# --- Special Eurobarometer 449 (2016) -------------------------------------------------------
def rozloz(cifry, n, test):
    """PDF tabulky SEB 449 mají u části zemí slepené cifry („C Z 4 2 24 42 …“). Najde jediné rozdělení
    řetězce cifer na n čísel 0–100, které projde kontrolou součtů."""
    s = re.sub(r"\D", "", cifry)
    reseni = []
    def krok(i, akt):
        if len(akt) == n:
            if i == len(s) and test(akt):
                reseni.append(list(akt))
            return
        for d in (1, 2, 3):
            if i + d > len(s):
                break
            t = s[i:i + d]
            if (len(t) > 1 and t[0] == "0") or int(t) > 100:
                continue
            krok(i + d, akt + [int(t)])
    krok(0, [])
    assert len(reseni) == 1, f"nejednoznačné rozdělení {cifry!r}: {reseni}"
    return reseni[0]


def seb449():
    t = text_pdf("seb449.pdf")
    vysl = {}
    # QB9.1 a QB9.2: 8 sloupců (rozhodně souhlasí, spíš souhlasí, spíš nesouhlasí, rozhodně nesouhlasí, odmítl, neví, souhlas, nesouhlas)
    ok9 = lambda a: abs(a[0] + a[1] - a[6]) <= 1 and abs(a[2] + a[3] - a[7]) <= 1 and 98 <= sum(a[:6]) <= 102
    for q in ("QB9.1", "QB9.2"):
        blok = t[t.index(f"\n{q}\n"):][:1500]
        for zeme, klic in (("CZ", r"C ?Z"), ("EU28", r"E ?U ?2 ?8")):
            radek = re.search(rf"^{klic} (.+)$", blok, re.M).group(1)
            vysl[(q, zeme)] = rozloz(radek, 8, ok9)[6]
    # QB10: 13 sloupců, řádky CZ a EU28 jsou v PDF čisté
    blok = t[t.rindex("\nQB10\n"):][:3000]
    cz = [int(x) for x in re.search(r"^CZ ([\d ]+)$", blok, re.M).group(1).split()]
    eu = [int(x) for x in re.search(r"^EU28 ([\d ]+)$", blok, re.M).group(1).split()]
    situace = ["oblečení", "opilost", "flirt", "neřekla jasně ne", "sama v noci", "více partnerů", "šla s ním domů"]
    for i, s in enumerate(situace):
        vysl[("QB10", s)] = (cz[i], eu[i])
    vysl[("QB10", "aspoň jedna")] = (cz[12], eu[12])
    return vysl


# --- Flash Eurobarometer 544 (2024) ---------------------------------------------------------
def fl544():
    t = text_pdf("fl544_cz_factsheet.pdf")
    # factsheet: bloky 10 čísel před značkou „CZ“, střídavě EU a CZ pro: rozhodně souhlasím, spíš souhlasím,
    # spíš nesouhlasím, rozhodně nesouhlasím, nevím. Souhlas = první dvě kategorie.
    bloky = []
    for m in re.finditer(r"((?:\d{1,2}\n){9}\d{1,2})CZ", t):
        c = [int(x) for x in m.group(1).split()]
        bloky.append({"eu": c[0] + c[2], "cz": c[1] + c[3], "eu_ne": c[4] + c[6], "cz_ne": c[5] + c[7]})
    # Položky ověřujeme podle unijních součtů uvedených ve zprávě (fl544_report.pdf, s. 10–11 a 13–17)
    zprava = text_pdf("fl544_report.pdf")
    assert "4% ‘totally agree’" in zprava and "12% ‘tend to agree’" in zprava  # opilost: EU 16 %
    hledej = {"opilost": 16, "ne_znamena_ano": 9}
    vysl = {}
    for k, eu in hledej.items():
        kand = [b for b in bloky if b["eu"] == eu and b["cz"] not in [v["cz"] for v in vysl.values()]]
        vysl[k] = kand[0]
    vysl["bez_souhlasu_v_paru"] = next(b for b in bloky if b["eu"] == 5)
    vysl["vymysleji"] = next(b for b in bloky if b["eu"] == 17)
    return vysl


# --- Eurostat --------------------------------------------------------------------------------
def eurostat(ds, **filtr):
    q = "&".join(f"{k}={v}" for k, vals in filtr.items() for v in (vals if isinstance(vals, list) else [vals]))
    cache = RAW / f"{ds}_{abs(hash(q)) % 10**8}.json"
    if not cache.exists():
        with urllib.request.urlopen(EUROSTAT.format(ds, q + "&lang=en")) as r:
            cache.write_bytes(r.read())
    d = json.loads(cache.read_text(encoding="utf-8"))
    ids, size = d["id"], d["size"]
    idx = {k: d["dimension"][k]["category"]["index"] for k in ids}
    vysl = {}
    for poz, v in d["value"].items():
        poz = int(poz); klic = []
        for k, s in zip(reversed(ids), reversed(size)):
            klic.append(next(c for c, i in idx[k].items() if i == poz % s)); poz //= s
        vysl[tuple(reversed(klic))] = v
    return ids, vysl


def gbv():
    ids, v = eurostat("gbv_ipv_type", geo=["CZ", "EU_V"], violence=["PSY", "PHY_SX", "PSY_PHY_THRT_SX"])
    g = {(k[ids.index("violence")], k[ids.index("geo")]): x for k, x in v.items()}
    ids2, v2 = eurostat("gbv_any_rp", geo=["CZ", "EU_V"], pers_serv=["POLC", "ANY", "CLSPER"])
    r = {(k[ids2.index("pers_serv")], k[ids2.index("geo")]): x for k, x in v2.items()}
    return g, r


def vrazdy():
    ids, v = eurostat("crim_hom_vrel", geo="CZ", pers_cat="IPTN", unit="NR", sex=["F", "M"])
    roky = {}
    for k, x in v.items():
        roky.setdefault(int(k[ids.index("time")]), {})[k[ids.index("sex")]] = x
    return dict(sorted(roky.items()))


# --- Hodnoty z dokumentů (ne tabulková data) ----------------------------------------------
DOLOZENE = {
    "apic_2024_ohrozeni": {"zeny": 1477, "muzi": 212, "deti": 1452,
                           "zdroj": "Komentář APIC ke statistikám 2024, http://www.domaci-nasili.cz/wp-content/uploads/koment%C3%A1%C5%99-APIC-2024.pdf"},
    "apic_2025": {"vykazani": 1640, "deti_ohrozene": 3251, "nasilnik_rodic_pct": 72,
                  "zdroj": "Komentář APIC ke statistikám 2025, http://www.domaci-nasili.cz/wp-content/uploads/koment%C3%A1%C5%99-APIC-2025.pdf"},
    "moller_2017": {"n": 298, "vyrazne_ztuhnuti_pct": 69.8, "extremni_pct": 47.7,
                    "zdroj": "Möller, Söndergaard, Helström 2017, Acta Obstet Gynecol Scand 96:932–938, doi 10.1111/aogs.13174"},
    "lisak_2010": {"krive_od": 2, "krive_do": 10, "zdroj": "Lisak a kol. 2010, Violence Against Women 16(12), doi 10.1177/1077801210387747"},
    "ferguson_malouff_2016": {"potvrzene_krive_pct": 5.2, "ci": [3.0, 8.9],
                              "zdroj": "Ferguson & Malouff 2016, Archives of Sexual Behavior 45(5), doi 10.1007/s10508-015-0666-2 (abstrakt)"},
    "campbell_2003": {"aOR_odlouceni_kontrolujici": 8.98, "zdroj": "Campbell a kol. 2003, Am J Public Health 93(7), PMC1447915"},
    "iksp_rozsudky": {"n": 106, "deti_pritomny_pct": 91, "podminka_pct": 54,
                      "zdroj": "IKSP, P. Přesličková 2025, prezentace https://iksp.gov.cz/storage/169/IKSP_workshop_obeti_prezentace_Preslickova.pdf"},
    "senat_istanbul_2024": {"pro": 34, "proti": 28, "zdrzelo": 9, "potreba": 36,
                            "zdroj": "Senát, 21. schůze 24. 1. 2024, hlasování č. 24, https://www.senat.cz/xqw/xervlet/pssenat/hlasy?G=22128&O=14"},
}


def save(nazev, spec):
    (OUT / nazev).write_text(json.dumps({"$schema": SCHEMA, **spec}, ensure_ascii=False, indent=2), encoding="utf-8")


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    s = seb449()
    f = fl544()
    g, r = gbv()
    vr = vrazdy()

    # Srovnání výroků Česko × EU (jen položky se souhlasem; zdroj a rok u každé)
    vyroky = [
        ("„Byla opilá, může si za to sama“", f["opilost"]["cz"], f["opilost"]["eu"], "2024"),
        ("„Flirtovala, tak je sex bez souhlasu omluvitelný“", *s[("QB10", "flirt")], "2016"),
        ("„Neřekla jasně ne, nebránila se“", *s[("QB10", "neřekla jasně ne")], "2016"),
        ("„Šla s ním domů“", *s[("QB10", "šla s ním domů")], "2016"),
        ("„Násilí na ženách často vyprovokuje oběť“", s[("QB9.2", "CZ")], s[("QB9.2", "EU28")], "2016"),
        ("„Když žena řekne ne, často myslí ano“", f["ne_znamena_ano"]["cz"], f["ne_znamena_ano"]["eu"], "2024"),
        ("„Ženy si obvinění vymýšlejí nebo přehánějí“", f["vymysleji"]["cz"], f["vymysleji"]["eu"], "2024"),
        ("„Co měla na sobě“ (vyzývavé oblečení)", *s[("QB10", "oblečení")], "2016"),
    ]
    radky = []
    for text, cz, eu, rok in vyroky:
        radky += [{"vyrok": text, "kdo": "Česko", "v": cz, "rok": rok, "pomer": round(cz / eu, 1)},
                  {"vyrok": text, "kdo": "průměr EU", "v": eu, "rok": rok, "pomer": round(cz / eu, 1)}]
    save("vyroky-cesko-eu.json", {
        "title": {"text": "Češi souhlasí s obviňováním obětí častěji než lidé jinde v EU",
                  "subtitle": "Podíl lidí, kteří s výrokem souhlasí (%). Eurobarometr 2016 a 2024, Česko a průměr EU"},
        "width": 560, "height": {"step": 22},
        "data": {"values": radky},
        "encoding": {"y": {"field": "vyrok", "type": "nominal", "sort": None, "title": None,
                           "axis": {"labelLimit": 330, "labelFontSize": 13}},
                     "yOffset": {"field": "kdo", "sort": ["Česko", "průměr EU"]},
                     "x": {"field": "v", "type": "quantitative", "title": None, "scale": {"domain": [0, 40]},
                           "axis": {"grid": True, "tickCount": 4, "labelExpr": "datum.value + ' %'"}},
                     "color": {"field": "kdo", "type": "nominal", "scale": {"domain": ["Česko", "průměr EU"], "range": [CRIMSON, GREY]},
                               "legend": {"orient": "top", "title": None}},
                     "tooltip": [{"field": "vyrok", "title": "Výrok"}, {"field": "kdo", "title": "Kdo"},
                                 {"field": "v", "title": "Souhlasí (%)"}, {"field": "rok", "title": "Průzkum"}]},
        "layer": [{"mark": {"type": "bar", "height": 9, "cornerRadiusEnd": 2}},
                  {"mark": {"type": "text", "align": "left", "dx": 4, "fontSize": 12}, "encoding": {"text": {"field": "v", "format": ".0f"}}}],
    })

    # Partnerské vraždy podle pohlaví oběti
    vr_r = [{"rok": str(y), "pohlavi": "ženy" if k == "F" else "muži", "v": n}
            for y, d in vr.items() if y >= 2015 for k, n in d.items()]
    zeny = sum(d.get("F", 0) for y, d in vr.items() if y >= 2015)
    muzi = sum(d.get("M", 0) for y, d in vr.items() if y >= 2015)
    roky_s_daty = [y for y, d in vr.items() if y >= 2015 and d]
    save("partnerske-vrazdy.json", {
        "title": {"text": "Tři čtvrtiny obětí partnerských vražd jsou ženy",
                  "subtitle": f"Oběti vražd, které spáchal současný nebo bývalý partner, Česko {min(roky_s_daty)}–{max(roky_s_daty)} (počet). Eurostat"},
        "width": 560, "height": 260, "data": {"values": vr_r},
        "mark": {"type": "bar", "cornerRadiusEnd": 2},
        "encoding": {"x": {"field": "rok", "type": "ordinal", "title": None, "axis": {"labelAngle": 0}},
                     "y": {"field": "v", "type": "quantitative", "title": None, "stack": True},
                     "color": {"field": "pohlavi", "type": "nominal", "scale": {"domain": ["ženy", "muži"], "range": [ORANGE, TEAL]},
                               "legend": {"orient": "top", "title": None}},
                     "order": {"field": "pohlavi", "sort": "descending"},
                     "tooltip": [{"field": "rok"}, {"field": "pohlavi"}, {"field": "v", "title": "Obětí"}]},
    })

    cisla = {
        "seb449": {f"{k[0]} {k[1]}": v for k, v in s.items()},
        "fl544": f,
        "gbv_ipv_type": {f"{a} {b}": v for (a, b), v in g.items()},
        "gbv_any_rp": {f"{a} {b}": v for (a, b), v in r.items()},
        "vrazdy_partner": {"roky": vr, "zeny_od_2015": zeny, "muzi_od_2015": muzi,
                           "podil_zen_pct": round(100 * zeny / (zeny + muzi), 1), "roky_s_daty": roky_s_daty},
        "pomery_vyroku": {t: round(cz / eu, 2) for t, cz, eu, _ in vyroky},
        "dolozene": DOLOZENE,
    }
    (HERE / "cisla.json").write_text(json.dumps(cisla, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({k: cisla[k] for k in ("seb449", "fl544", "gbv_ipv_type", "gbv_any_rp", "pomery_vyroku")}, ensure_ascii=False, indent=1))
    print("vraždy:", cisla["vrazdy_partner"]["zeny_od_2015"], cisla["vrazdy_partner"]["muzi_od_2015"], cisla["vrazdy_partner"]["podil_zen_pct"], roky_s_daty)


if __name__ == "__main__":
    main()
