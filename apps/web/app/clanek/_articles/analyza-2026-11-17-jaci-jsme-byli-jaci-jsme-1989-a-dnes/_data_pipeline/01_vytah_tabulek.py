"""Výtah dvojic „první rok × poslední rok“ ze všech tabulek publikace ČSÚ
Česko od roku 1989 v číslech (aktualizace 27. 8. 2026).

Zdroj balíku (pro zopakování bez archivu):
  https://csu.gov.cz/docs/107508/bd0a22e6-1df1-a4f1-86db-dcbcba592a0a/320181260827_data.zip?version=1.2
Archiv: statisticka-data/cesko/souhrn/cesko-od-1989/20260827/data/ (najde se přes odkaz csu-data
nebo proměnnou CSU_DATA).

Výstup: vytah_vsech_radku.csv – pro každý řádek každého listu: tabulka, list, popisek,
první rok s hodnotou, hodnota, poslední rok s hodnotou, hodnota, poměr.
Slouží jen k výběru ukazatelů; čísla do textu počítá 02_dvojice.py.
"""
import csv
import os
import re
from pathlib import Path

import openpyxl

SADA = Path("souhrn/cesko-od-1989/20260827/data")


def najdi_archiv() -> Path:
    if os.environ.get("CSU_DATA"):
        return Path(os.environ["CSU_DATA"])
    for p in [Path(__file__).resolve(), *Path(__file__).resolve().parents]:
        for kandidat in (p / "csu-data", p / "statisticka-data" / "cesko"):
            if kandidat.exists():
                return kandidat
    raise SystemExit("Archiv csu-data nenalezen – nastav CSU_DATA")


def je_rok(v) -> bool:
    if isinstance(v, (int, float)) and 1900 <= v <= 2030 and float(v).is_integer():
        return True
    return isinstance(v, str) and re.fullmatch(r"\s*(19|20)\d\d\s*", v) is not None


def cislo(v):
    if isinstance(v, bool):
        return None
    if isinstance(v, (int, float)):
        return float(v)
    return None


def main():
    data = najdi_archiv() / SADA
    out = Path(__file__).with_name("vytah_vsech_radku.csv")
    with out.open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["tabulka", "list", "nadpis", "popisek", "rok_od", "hodnota_od", "rok_do", "hodnota_do", "pomer"])
        for xlsx in sorted(data.glob("*.xlsx")):
            wb = openpyxl.load_workbook(xlsx, data_only=True)
            for ws in wb:
                rows = list(ws.iter_rows(values_only=True))
                nadpis = next((str(r[0]) for r in rows if r and r[0]), "")
                # řádek s roky = ten s nejvíc letopočty
                hlav_i, hlav = max(
                    enumerate(rows), key=lambda ir: sum(je_rok(v) for v in ir[1]), default=(None, None)
                )
                if hlav is None or sum(je_rok(v) for v in hlav) < 3:
                    continue
                roky = {j: int(str(v).strip()) if isinstance(v, str) else int(v) for j, v in enumerate(hlav) if je_rok(v)}
                kontext = ""
                for r in rows[hlav_i + 1 :]:
                    popisek = next((str(v).strip() for v in r[: min(roky)] if v not in (None, "")), "")
                    hodnoty = [(roky[j], cislo(r[j])) for j in sorted(roky) if j < len(r) and cislo(r[j]) is not None]
                    if not hodnoty:
                        if popisek:
                            kontext = popisek
                        continue
                    (r0, v0), (r1, v1) = hodnoty[0], hodnoty[-1]
                    pomer = round(v1 / v0, 3) if v0 else ""
                    w.writerow([xlsx.stem, ws.title, nadpis, f"{kontext} | {popisek}".replace("\n", " "), r0, v0, r1, v1, pomer])
    print("zapsáno", out)


if __name__ == "__main__":
    main()
