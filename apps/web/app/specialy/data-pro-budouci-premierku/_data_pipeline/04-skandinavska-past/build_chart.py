"""Článek 04 – sestaví data/tfr_zeme.csv a graf GRAF_04_PLODNOST_ZEME.json (Vega-Lite) a vypíše čísla pro text.

Použití (po stahni_data.py):  python -X utf8 -I build_chart.py
Zdroje jednotlivých řad:
  Švédsko 2000–2025   SCB, tabulka BE0101H/FruktsamhetSum (ženy)             data/scb_fruktsamhetsum.csv
  Francie 2000–2024   Eurostat demo_find (TOTFERRT); 2025 INSEE, Insee Première č. 2087 (1,56)
  Česko 2000–2024     Eurostat demo_find (TOTFERRT); 2025 ČSÚ (1,28)
  Maďarsko 2000–2025  KSH STADAT 22.1.1.6, https://www.ksh.hu/stadat_files/nep/en/nep0006.html (2025 předběžný údaj)
Eurostat a KSH se u Maďarska o setiny liší (např. 2021: 1,63 vs. 1,61, 2024: 1,41 vs. 1,39); používáme národní zdroj KSH.
"""
import csv
import json

OUT_CHART = '../../../../../public/specialy/dpbp/charts/GRAF_04_PLODNOST_ZEME.json'
HU_KSH = {2000: 1.32, 2001: 1.31, 2002: 1.30, 2003: 1.27, 2004: 1.27, 2005: 1.30, 2006: 1.34, 2007: 1.31, 2008: 1.35, 2009: 1.32,
          2010: 1.25, 2011: 1.23, 2012: 1.34, 2013: 1.34, 2014: 1.42, 2015: 1.45, 2016: 1.51, 2017: 1.51, 2018: 1.50, 2019: 1.51,
          2020: 1.59, 2021: 1.61, 2022: 1.55, 2023: 1.51, 2024: 1.39, 2025: 1.31}
FR_2025, CZ_2025 = 1.56, 1.28

es = {}
with open('data/eurostat_vybrane.csv', encoding='utf-8') as f:
    for r in csv.DictReader(f):
        es[(r['ukazatel'], r['geo'], int(r['rok']))] = float(r['hodnota'])
with open('data/scb_fruktsamhetsum.csv', encoding='utf-8-sig') as f:
    rd = csv.reader(f)
    hdr = next(rd)
    for row in rd:
        if row[1] == 'women':
            se = {int(h.split()[-1]): float(v) for h, v in zip(hdr[2:], row[2:])}

series = {
    'Švédsko': se,
    'Francie': {y: es[('TOTFERRT', 'FR', y)] for y in range(2000, 2025)} | {2025: FR_2025},
    'Maďarsko': HU_KSH,
    'Česko': {y: es[('TOTFERRT', 'CZ', y)] for y in range(2000, 2025)} | {2025: CZ_2025},
}
with open('data/tfr_zeme.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(['rok', 'zeme', 'tfr'])
    for z, s in series.items():
        for y in range(2000, 2026):
            w.writerow([y, z, s[y]])

print('== Čísla pro text ==')
for z, s in series.items():
    peak = max(s.items(), key=lambda kv: kv[1])
    print('%-9s vrchol %.2f (%d); 2025: %.2f; pokles od vrcholu %.2f; 2000: %.2f' % (z, peak[1], peak[0], s[2025], peak[1] - s[2025], s[2000]))
print('Švédsko: 2000 -> 2010 %+.2f; 1990 (Eurostat) %.2f; 1991 %.2f; 1992 %.2f' % (se[2010] - se[2000], es[('TOTFERRT', 'SE', 1990)], es[('TOTFERRT', 'SE', 1991)], es[('TOTFERRT', 'SE', 1992)]))
print('Maďarsko: 2011 %.2f -> 2021 %.2f (%+.2f) -> 2025 %.2f (2025 proti 2011 %+.2f; proti 2010 %+.2f)' % (HU_KSH[2011], HU_KSH[2021], HU_KSH[2021] - HU_KSH[2011], HU_KSH[2025], HU_KSH[2025] - HU_KSH[2011], HU_KSH[2025] - HU_KSH[2010]))
print('Francie: rozpětí 2000–2015 %.2f–%.2f; 2010 %.2f; 2023 %.2f; 2024 %.2f; 2025 %.2f' % (min(series['Francie'][y] for y in range(2000, 2016)), max(series['Francie'][y] for y in range(2000, 2016)), series['Francie'][2010], series['Francie'][2023], series['Francie'][2024], FR_2025))
print('Česko: 2021 %.2f, 2023 %.2f, 2024 %.2f (Eurostat), 2025 %.2f' % (series['Česko'][2021], series['Česko'][2023], series['Česko'][2024], CZ_2025))
print('EU27 2024: %.2f (Eurostat)' % es[('TOTFERRT', 'EU27_2020', 2024)])
print('Mimo manželství 2024 (Eurostat): CZ %.1f %%, SE %.1f %%, FR %.1f %%, HU %.1f %%, EU27 %.1f %%' % tuple(es[('NMARPCT', g, 2024)] for g in ('CZ', 'SE', 'FR', 'HU', 'EU27_2020')))
print('Mimo manželství Maďarsko: 2010 %.1f %%, 2020 %.1f %%, 2024 %.1f %%' % (es[('NMARPCT', 'HU', 2010)], es[('NMARPCT', 'HU', 2020)], es[('NMARPCT', 'HU', 2024)]))
print('Formální péče o děti do 3 let (100 – podíl bez péče), 2024 [2023]: ' + ', '.join('%s %.1f %% [%.1f %%]' % (g, 100 - es[('H0_pct_bez_formalni_pece', g, 2024)], 100 - es[('H0_pct_bez_formalni_pece', g, 2023)]) for g in ('CZ', 'EU27_2020', 'SE', 'FR', 'HU')))
print('Výdaje na rodinu a děti, % HDP, 2023 (ESSPROS): ' + ', '.join('%s %.2f' % (g, es[('FAM_pct_HDP', g, 2023)]) for g in ('FR', 'SE', 'HU', 'CZ', 'PL', 'DE', 'LU', 'EU27_2020')))

# ------------------------------------------------------------------ graf
COL = {'Česko': '#de1743', 'Švédsko': '#4a51ab', 'Francie': '#0e839e', 'Maďarsko': '#f76800'}
ORDER = ['Švédsko', 'Francie', 'Maďarsko', 'Česko']
values = [{'rok': y, 'zeme': z, 'tfr': series[z][y], 'Plodnost': ('%.2f' % series[z][y]).replace('.', ',')} for z in ORDER for y in range(2000, 2026)]
X = {'field': 'rok', 'type': 'quantitative', 'title': None, 'scale': {'domain': [2000, 2029], 'nice': False},
     'axis': {'format': 'd', 'values': [2000, 2005, 2010, 2015, 2020, 2025], 'grid': False, 'domain': False, 'ticks': False, 'labelAngle': 0}}
Y = {'field': 'tfr', 'type': 'quantitative', 'title': None, 'scale': {'domain': [1.1, 2.2]},
     'axis': {'grid': True, 'gridColor': '#e8e8dc', 'domain': False, 'ticks': False, 'values': [1.2, 1.5, 1.8, 2.1], 'format': '.1f'}}
COLOR = {'field': 'zeme', 'type': 'nominal', 'scale': {'domain': ORDER, 'range': [COL[z] for z in ORDER]}, 'legend': None}
peaks = {'Švédsko': 2010, 'Francie': 2010, 'Maďarsko': 2021, 'Česko': 2021}
peak_rows = [{'rok': y, 'zeme': z, 'tfr': series[z][y]} for z, y in peaks.items()]
end_rows = [{'rok': 2025, 'zeme': z, 'tfr': series[z][2025], 'label': '%s %s' % (z, ('%.2f' % series[z][2025]).replace('.', ',')),
             'ly': series[z][2025] + {'Česko': -0.025, 'Maďarsko': 0.025, 'Francie': 0, 'Švédsko': 0}[z]} for z in ORDER]
ref_rows = [{'rok': 2000, 'tfr': 2.1}, {'rok': 2029, 'tfr': 2.1}]
spec = {
    '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
    'title': {'text': 'Švédsko, Francie, Maďarsko i Česko jsou dnes mezi 1,28 a 1,56 dítěte na ženu, od svých vrcholů klesly o 0,3 až 0,6',
              'subtitle': 'Úhrnná plodnost, dětí na ženu, 2000–2025. Vrcholy (body): Francie 2,03 a Švédsko 1,98 v roce 2010, Česko 1,83 a Maďarsko 1,61 v roce 2021. Přerušovaná čára je hranice 2,1.'},
    '_source': '[SCB, Total fertility rate](https://www.statistikdatabasen.scb.se/pxweb/en/ssd/START__BE__BE0101__BE0101H/FruktsamhetSum/) (Švédsko) · [Eurostat, demo_find](https://ec.europa.eu/eurostat/databrowser/view/demo_find/default/table) (Francie a Česko do 2024) · [KSH, 22.1.1.6](https://www.ksh.hu/stadat_files/nep/en/nep0006.html) (Maďarsko, 2025 předběžně) · [INSEE, Bilan démographique 2025](https://www.insee.fr/fr/statistiques/8719824) (Francie 2025) · [ČSÚ, Nejméně narozených dětí v historii](https://statistikaamy.csu.gov.cz/nejmene-narozenych-deti-v-historii) (Česko 2025)\nZdroje se liší metodikou o setiny; vrcholy označují nejvyšší hodnotu v letech 2000–2025.',
    'height': 340,
    'config': {'view': {'stroke': 'transparent'}},
    'encoding': {'x': X, 'y': Y},
    'layer': [
        {'data': {'values': ref_rows}, 'mark': {'type': 'line', 'strokeDash': [5, 4], 'stroke': '#0e8aab', 'strokeWidth': 1.5}},
        {'data': {'values': values}, 'mark': {'type': 'line', 'strokeWidth': 2.5, 'strokeJoin': 'round'},
         'encoding': {'color': COLOR,
                      'tooltip': [{'field': 'rok', 'type': 'quantitative', 'title': 'Rok', 'format': 'd'},
                                  {'field': 'zeme', 'type': 'nominal', 'title': 'Země'},
                                  {'field': 'Plodnost', 'type': 'nominal', 'title': 'Dětí na ženu'}]}},
        {'data': {'values': peak_rows}, 'mark': {'type': 'point', 'filled': True, 'size': 70}, 'encoding': {'color': COLOR}},
        {'data': {'values': end_rows}, 'mark': {'type': 'text', 'align': 'left', 'dx': 7, 'baseline': 'middle', 'fontWeight': 'bold', 'fontSize': 12},
         'encoding': {'y': {'field': 'ly'}, 'text': {'field': 'label'}, 'color': COLOR}},
    ],
}
with open(OUT_CHART, 'w', encoding='utf-8') as f:
    json.dump(spec, f, ensure_ascii=False, indent=1)
print('graf uložen:', OUT_CHART)
