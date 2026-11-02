"""Outposty na Západním břehu podle roku vzniku – seznam osad a outpostů organizace Peace Now (Šalom achšav).

Vstup: zdroj/peacenow_settlements_outposts_list.xlsx, list „Outposts“. Stažen 31. 10. 2026 z odkazu
„Download the list of settlements and outposts“ na https://peacenow.org.il/en/settlements-watch/settlements-data/population
(Google Sheets export, seznam aktualizovaný 19. 10. 2026).

Outpost = osada založená bez rozhodnutí izraelské vlády (nezákonná i podle izraelského práva). Peace Now rozlišuje
klasické outposty a „farmy“ (zemědělské a pastevecké outposty, často jedna rodina se stádem). Seznam obsahuje
outposty, které stojí dnes; vyklizené nebo legalizované mohou v ročních počtech chybět.

Výstup: vystup_outposty.json a ../data/outposty.json (spec grafu VegaChart).
Spuštění: python -I -X utf8 outposty.py
"""
import json
from collections import Counter
from pathlib import Path

import openpyxl

TU = Path(__file__).parent
XLSX = TU / 'zdroj' / 'peacenow_settlements_outposts_list.xlsx'
OD, DO = 2012, 2026


def main():
    ws = openpyxl.load_workbook(XLSX, read_only=True, data_only=True)['Outposts']
    rows = list(ws.iter_rows(values_only=True))
    h = [str(c).strip() if c is not None else '' for c in rows[0]]
    i_typ, i_rok = h.index('Settlement Type'), h.index('Established Year')
    i_jmeno = h.index('Name')
    zaznamy = [r for r in rows[1:] if r[i_jmeno]]

    def druh(t):
        return 'farma' if 'farm' in str(t or '').lower() else 'outpost'

    pocty = Counter()
    bez_roku = 0
    for r in zaznamy:
        rok = r[i_rok]
        if rok in (None, ''):
            bez_roku += 1
            continue
        pocty[(int(float(rok)), druh(r[i_typ]))] += 1

    druhy = Counter(druh(r[i_typ]) for r in zaznamy)
    roky = list(range(OD, DO + 1))
    radky = [{'rok': str(y), 'druh': d, 'pocet': pocty[(y, d)]} for y in roky for d in ('farma', 'outpost')]
    celkem_rok = {y: pocty[(y, 'farma')] + pocty[(y, 'outpost')] for y in roky}
    od_2023 = sum(celkem_rok[y] for y in range(2023, DO + 1))
    vystup = {
        'zdroj': 'Peace Now, seznam osad a outpostů (aktualizace 19. 10. 2026)',
        'outpostu_celkem': len(zaznamy), 'z_toho_farmy': druhy['farma'], 'z_toho_outposty': druhy['outpost'],
        'bez_roku_vzniku': bez_roku, 'za_rok': celkem_rok,
        'od_2023_vcetne': od_2023, 'farmy_od_2023': sum(pocty[(y, 'farma')] for y in range(2023, DO + 1)), 'podil_od_2023': round(100 * od_2023 / len(zaznamy), 1),
        'farmy_za_rok': {y: pocty[(y, 'farma')] for y in roky},
        'pred_2023': sum(v for (y, _), v in pocty.items() if y < 2023),
        'prumer_2012_2022': round(sum(celkem_rok[y] for y in range(2012, 2023)) / 11, 1),
    }
    (TU / 'vystup_outposty.json').write_text(json.dumps(vystup, ensure_ascii=False, indent=1), encoding='utf-8')

    spec = {
        '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
        'title': {
            'text': 'Dvě třetiny dnešních outpostů vznikly od roku 2023, většinou jako {farmy|#9f319e}',
            'subtitle': 'Outposty, které dnes na Západním břehu stojí, podle roku vzniku. Farmy jsou zemědělské a pastevecké outposty, světlejší část sloupce ostatní outposty. Rok 2026 do 19. října.',
        },
        'width': 600, 'height': 300,
        'data': {'values': radky},
        'encoding': {
            'x': {'field': 'rok', 'type': 'ordinal', 'axis': {'title': None, 'labelAngle': 0}},
            'y': {'field': 'pocet', 'type': 'quantitative', 'aggregate': 'sum', 'stack': 'zero',
                  'axis': {'title': 'Počet outpostů'}},
        },
        'layer': [
            {'mark': {'type': 'bar', 'width': {'band': 0.75}},
             'encoding': {
                 'color': {'field': 'druh', 'type': 'nominal', 'scale': {'domain': ['farma', 'outpost'], 'range': ['#9f319e', '#8f9dc9']}, 'legend': None},
                 'order': {'field': 'druh', 'sort': 'ascending'},
                 'tooltip': [{'field': 'rok', 'title': 'Rok vzniku'}, {'field': 'druh', 'title': 'Druh'},
                             {'field': 'pocet', 'title': 'Počet', 'aggregate': 'sum'}]}},
            {'transform': [{'aggregate': [{'op': 'sum', 'field': 'pocet', 'as': 'celkem'}], 'groupby': ['rok']}],
             'mark': {'type': 'text', 'dy': -8, 'fontSize': 12, 'fontWeight': 'bold', 'color': '#272a59'},
             'encoding': {'y': {'field': 'celkem', 'type': 'quantitative'}, 'text': {'field': 'celkem', 'type': 'quantitative'}}},
        ],
        '_source': '[Peace Now, seznam osad a outpostů na Západním břehu](https://peacenow.org.il/en/settlements-watch/settlements-data/population) (aktualizace 19. 10. 2026); outposty vyklizené nebo legalizované před tímto datem v seznamu nejsou',
    }
    (TU.parent / 'data' / 'outposty.json').write_text(json.dumps(spec, ensure_ascii=False, indent=1), encoding='utf-8')
    print(json.dumps(vystup, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
