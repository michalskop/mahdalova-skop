"""Výtah z číselníku obcí CBS do zdroj/cbs_obce_2024.csv.

Vstup: bycode2024.xlsx z archivu statisticka-data/izrael/cbs-obce/2024/ (cbs.gov.il, Last-Modified 23. 9. 2026,
SHA256 a021c6a1…f7d2ad0). Souřadnice CBS jsou izraelská síť ITM v metrech: 12 číslic = 6 východ + 6 sever.

Spuštění: python -I -X utf8 vytah_cbs.py <cesta k bycode2024.xlsx>
"""
import csv
import sys
from pathlib import Path

import openpyxl

VYSTUP = Path(__file__).parent / 'zdroj' / 'cbs_obce_2024.csv'
SLOUPCE = [('kod', 'סמל יישוב'), ('nazev', 'שם יישוב'), ('nazev_en', 'שם יישוב באנגלית'), ('dat_yisuv', 'דת יישוב'),
           ('obyv_2024', 'סך הכל אוכלוסייה 2024'), ('zide_a_ostatni', 'יהודים ואחרים'), ('arabove', 'ערבים'),
           ('okres', 'שם מחוז'), ('podokres', 'שם נפה')]


def main(xlsx):
    rows = list(openpyxl.load_workbook(xlsx, read_only=True).worksheets[0].iter_rows(values_only=True))
    h = rows[0]
    with open(VYSTUP, 'w', encoding='utf-8', newline='') as f:
        w = csv.writer(f)
        w.writerow([k for k, _ in SLOUPCE] + ['itm_x', 'itm_y'])
        for r in rows[1:]:
            d = dict(zip(h, r))
            k = str(d['קואורדינטות'] or '')
            xy = [int(k[:6]), int(k[6:])] if len(k) == 12 else ['', '']
            w.writerow([d[s] if d[s] is not None else '' for _, s in SLOUPCE] + xy)
    print(f'{len(rows) - 1} obcí → {VYSTUP}')


if __name__ == '__main__':
    main(sys.argv[1])
