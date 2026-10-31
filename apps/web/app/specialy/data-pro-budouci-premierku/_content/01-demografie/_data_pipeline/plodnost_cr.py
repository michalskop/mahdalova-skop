"""Úhrnná plodnost v Česku 1990–2025 pro kapitolu Demografie.

Zdroje:
- 1990–2024: ČSÚ, Demografická příručka 2024, tab. 6.12 „Úhrnná plodnost podle
  pořadí a míry reprodukce v letech 1920–2024“
  https://csu.gov.cz/produkty/demograficka-prirucka-2024
  soubor vstupy/csu_demograficka_prirucka_2024_tab_6_12.xlsx (staženo 27. 10. 2026)
- 2025: ČSÚ, předběžné výsledky (1,28), „Nejméně narozených dětí v historii“
  https://statistikaamy.csu.gov.cz/nejmene-narozenych-deti-v-historii

Spuštění: python plodnost_cr.py  → vypíše klíčové hodnoty a uloží plodnost_cr.json
"""
import json
from pathlib import Path

import openpyxl

HERE = Path(__file__).parent
SRC = HERE / "vstupy" / "csu_demograficka_prirucka_2024_tab_6_12.xlsx"
TFR_2025 = 1.28  # ČSÚ, předběžné výsledky za rok 2025

wb = openpyxl.load_workbook(SRC, data_only=True)
ws = wb.active
series = {}
for row in ws.iter_rows(min_row=6, values_only=True):
    year, tfr = row[0], row[1]
    if isinstance(year, int) and isinstance(tfr, (int, float)):
        series[year] = round(float(tfr), 3)
series[2025] = TFR_2025

window = {y: v for y, v in series.items() if 1990 <= y <= 2025}
low_year = min((y for y in window if y < 2025), key=lambda y: window[y])
peak_year = max((y for y in window if y >= 2000), key=lambda y: window[y])
lower_than_2025 = sorted(y for y in window if y < 2025 and window[y] < 1.275)

print(f"minimum 1990–2024: {low_year} = {window[low_year]}")
print(f"vrchol po roce 2000: {peak_year} = {window[peak_year]}")
print("roky s nižší plodností než 1,28 (zaokrouhleno):", lower_than_2025)
for y in (1990, 1995, 1999, 2000, 2005, 2019, 2020, 2021, 2022, 2023, 2024, 2025):
    print(y, window[y])

out = [
    {"rok": y, "tfr": v, "typ": "předběžné" if y == 2025 else "data"}
    for y, v in sorted(window.items())
]
(HERE / "plodnost_cr.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
