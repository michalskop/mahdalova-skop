"""Data interaktivních prvků článku „Jací jsme byli, jací jsme – 1989 a dnes“.

Čísla bere výhradně z výstupů 02_dvojice.py (dvojice.json) a 03_doplnky.py (doplnky.json).
Žádné číslo se tu nepíše ručně. Pořadí spuštění:
  python 02_dvojice.py && python 03_doplnky.py && python 04_grafy.py && python 05_interaktivni.py

Zapisuje do ../data/:
  tip-trestne-ciny.json   – <Tipovacka dataFile="data/tip-trestne-ciny.json" />
  posuvnik-podily.json    – <PosuvnikTehdyDnes dataFile="data/posuvnik-podily.json" />
  od-narozeni.json        – <OdNarozeni dataFile="data/od-narozeni.json" />
Formát JSON popisuje packages/ui/DESIGN.md → „Interaktivní prvky speciálu 1989 × 2026“.
"""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
DATA = HERE.parent / "data"

D = {d["ukazatel"]: d for d in json.loads((HERE / "dvojice.json").read_text(encoding="utf-8"))}
X = {d["ukazatel"]: d for d in json.loads((HERE / "doplnky.json").read_text(encoding="utf-8"))}

CSU_URL = "https://csu.gov.cz/produkty/cesko-od-roku-1989-v-cislech-aktualizace-27-8-2026"
CSU = f"[ČSÚ, Česko od roku 1989 v číslech]({CSU_URL})"
IKSP_URL = "https://iksp.gov.cz/storage/169/Trendy-kriminality-v-Ceske-republice-v-roce-2023-z-pohledu-statistiky-Policie-CR_Diblikova.pdf"
SCITANI_URL = "https://csu.gov.cz/produkty/vysledky-scitani-2021-otevrena-data"


def cz(x, d=0):
    """České číslo: pevná mezera mezi tisíci, desetinná čárka."""
    return f"{x:,.{d}f}".replace(",", " ").replace(".", ",")


def zaokr(v, d):
    return round(v, d) if d else int(round(v))


def uloz(nazev, obsah):
    p = DATA / nazev
    p.write_text(json.dumps(obsah, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("zapsáno", p.relative_to(HERE.parent))


# ---------------------------------------------------------------- 1. Tipovačka: trestné činy
tc = X["Registrované trestné činy"]          # 1989 a dnes (IKSP z dat Policie ČR)
tc_rada = D["Registrované trestné činy"]["rada"]  # ČSÚ Tab. 14.01, řada od 1991
vrchol_rok, vrchol = max(tc_rada.items(), key=lambda kv: kv[1])
assert int(tc_rada[str(tc["rok_dnes"])]) == int(tc["dnes"]), "dnešní hodnota IKSP × ČSÚ nesedí"
tehdy, dnes = int(tc["tehdy"]), int(tc["dnes"])
horni = int(-(-vrchol * 1.1 // 50_000) * 50_000)  # strop posuvníku nad vrcholem řady
uloz("tip-trestne-ciny.json", {
    "title": "Tipněte si: kolik trestných činů policie zaregistrovala loni?",
    "otazka": f"V roce {tc['rok_tehdy']} policie zaregistrovala {cz(tehdy)} trestných činů. Kolik jich bylo v roce {tc['rok_dnes']}?",
    "jednotka": "trestných činů",
    "min": 0,
    "max": horni,
    "krok": 1000,
    "vychozi": tehdy,
    "desetinna": 0,
    "tehdy": {"rok": tc["rok_tehdy"], "hodnota": tehdy},
    "dnes": {"rok": tc["rok_dnes"], "hodnota": dnes},
    "vysvetleni": (
        f"Trestných činů je dnes víc než v roce {tc['rok_tehdy']}, ale nejvíc jich bylo po revoluci: "
        f"vrcholu dosáhla registrovaná kriminalita v roce {vrchol_rok} s {cz(vrchol)} činy a od té doby klesá. "
        "Čísla z doby před revolucí nemusí být s dnešními plně srovnatelná, protože o registraci rozhodovala tehdejší policie."
    ),
    "zdroj": f"[IKSP z dat Policie ČR]({IKSP_URL}); {CSU}, Tab. 14.01",
})

# ---------------------------------------------------------------- 2. Posuvník: podíly
POSUVNIK = [
    ("Lidé starší 65 let", D["Podíl lidí 65+"], None),
    ("Děti do 14 let", D["Podíl dětí do 14 let"], None),
    ("Děti narozené mimo manželství", D["Děti narozené mimo manželství"], None),
    ("Domácnosti s počítačem", D["Domácnosti s počítačem"], None),
    ("Věřící (sčítání)", X["Věřící (všichni, kdo víru uvedli)"], "otázka na víru je dobrovolná"),
]
polozky = []
for nazev, d, pozn in POSUVNIK:
    polozky.append({
        "nazev": nazev,
        "tehdy": round(d["tehdy"], 1), "rok_tehdy": d["rok_tehdy"],
        "dnes": round(d["dnes"], 1), "rok_dnes": d["rok_dnes"],
        **({"pozn": pozn} if pozn else {}),
    })
roky_dnes = sorted({p["rok_dnes"] for p in polozky})
uloz("posuvnik-podily.json", {
    "title": "Česko zestárlo a přestalo spěchat k oltáři",
    "subtitle": "Podíl v %; přepněte rok tlačítkem. Víra podle sčítání 1991 a 2021.",
    "jednotka": "%",
    "max": 100,
    "desetinna": 1,
    "popisek_tehdy": "1989",
    "popisek_dnes": str(max(roky_dnes)),
    "polozky": polozky,
    "zdroj": f"{CSU}; [ČSÚ, sčítání 1991 a 2021]({SCITANI_URL})",
})

# ---------------------------------------------------------------- 3. Od vašeho narození
# (název v komponentě, ukazatel v dvojice.json, jednotka v komponentě, desetinná místa, porovnání, poznámka)
OD_NAROZENI = [
    ("Naděje dožití mužů při narození", "Naděje dožití při narození – muži", "roku", 1, "rozdil", None),
    ("Naděje dožití žen při narození", "Naděje dožití při narození – ženy", "roku", 1, "rozdil", None),
    ("Průměrný věk obyvatel", "Průměrný věk", "roku", 1, "rozdil", None),
    ("Věk matky při prvním dítěti", "Věk matky při prvním dítěti", "roku", 1, "rozdil", None),
    ("Věk nevěsty při první svatbě", "Věk svobodných nevěst", "roku", 1, "rozdil", None),
    ("Děti narozené mimo manželství", "Děti narozené mimo manželství", "%", 1, "rozdil", None),
    ("Lidé starší 65 let", "Podíl lidí 65+", "%", 1, "rozdil", None),
    ("Živě narozené děti za rok", "Živě narozené děti", "", 0, "pomer", None),
    ("Reálná mzda (1989 = 100)", "Reálná mzda (kupní síla), 1989 = 100", "", 0, "pomer",
     "kupní síla průměrné mzdy očištěná o inflaci"),
    ("Průměrná čistá mzda", "Průměrná čistá mzda", "Kčs/Kč", 0, "pomer",
     "nominálně, bez očištění o inflaci – kupní sílu ukazuje reálná mzda"),
    ("Cizinci žijící v Česku", "Cizinci trvale a dlouhodobě žijící v ČR", "", 0, "pomer", None),
    ("Studenti vysokých škol", "Studenti vysokých škol", "", 0, "pomer", None),
    ("Domácnosti s počítačem", "Domácnosti s počítačem", "%", 1, "rozdil", None),
]
ukazatele = []
for nazev, klic, jednotka, des, porovnani, pozn in OD_NAROZENI:
    d = D[klic]
    # plná přesnost ČSÚ (3 desetinná místa), aby rozdíl v komponentě seděl s textem (77,492 − 68,139 = 9,4)
    rada = {str(r): (round(v, 3) if des else zaokr(v, 0)) for r, v in sorted(d["rada"].items(), key=lambda kv: int(kv[0]))}
    ukazatele.append({
        "nazev": nazev,
        "jednotka": jednotka,
        "desetinna": des,
        "porovnani": porovnani,
        "rada": rada,
        "zdroj": f"ČSÚ, {d['tabulka']}",
        **({"pozn": pozn} if pozn else {}),
    })
prvni = min(min(int(r) for r in u["rada"]) for u in ukazatele)
posledni = max(max(int(r) for r in u["rada"]) for u in ukazatele)
uloz("od-narozeni.json", {
    "title": "Česko od vašeho narození",
    "subtitle": "Zadejte rok narození a porovnejte ho s dneškem. Údaje ČSÚ začínají většinou rokem 1989.",
    "rok_min": 1920,
    "rok_max": 2025,
    "vychozi": 1989,
    "ukazatele": ukazatele,
    "zdroj": CSU,
})
print(f"trestné činy {tc['rok_tehdy']} {tehdy} → {tc['rok_dnes']} {dnes}; vrchol {vrchol_rok} {int(vrchol)}; strop {horni}")
print(f"od narození: {len(ukazatele)} ukazatelů, řady {prvni}–{posledni}")
