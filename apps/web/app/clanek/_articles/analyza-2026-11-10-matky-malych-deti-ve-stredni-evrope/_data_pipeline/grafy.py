"""Charts for the article (series on mothers, part 2): builds data/*.json (Vega-Lite) from primary data.

Sources (downloaded by this script, nothing is copied from the draft):
- OECD Family Database, LMF1.2 Maternal employment (sheets Chart LMF1.2.C and Chart LMF1.2.F, data 2021),
  https://webfs.oecd.org/els-com/Family_Database/LMF_1_2_Maternal_Employment.xlsx
- Eurostat lfst_hheredch (2025, women 25-49, all ISCED levels), dissemination API.

Run:  python -I -X utf8 grafy.py   (needs openpyxl)
Writes ../data/*.json and prints every number used in the text to vystup.txt.
"""
import io
import json
import pathlib
import urllib.request

import openpyxl

HERE = pathlib.Path(__file__).resolve().parent
DATA = HERE.parent / 'data'
OECD_URL = 'https://webfs.oecd.org/els-com/Family_Database/LMF_1_2_Maternal_Employment.xlsx'
ES_URL = ('https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/lfst_hheredch?format=JSON&lang=EN'
          '&time=2025&sex=F&age=Y25-49&isced11=TOTAL' + ''.join(f'&geo={g}' for g in ['CZ', 'SK', 'HU', 'PL', 'AT', 'DE', 'EU27_2020']))

CZ_NAME = {'Czech Republic': 'Česko', 'Slovak Republic': 'Slovensko', 'Hungary': 'Maďarsko', 'Poland': 'Polsko',
           'Austria': 'Rakousko', 'Germany': 'Německo', 'EU average': 'Průměr EU'}
GEO = {'CZ': 'Česko', 'SK': 'Slovensko', 'HU': 'Maďarsko', 'PL': 'Polsko', 'AT': 'Rakousko', 'DE': 'Německo', 'EU27_2020': 'Průměr EU'}

CRIMSON, EU, GREY, NAVY, INK = '#de1743', '#6267a3', '#bcbcb0', '#272a59', '#101432'
OECD_SRC = '[OECD Family Database, ukazatel LMF1.2 Maternal employment](https://www.oecd.org/en/data/datasets/oecd-family-database.html), data 2021, ženy 15–64 let'
ES_SRC = '[Eurostat, míra zaměstnanosti podle počtu a věku dětí (lfst_hheredch)](https://ec.europa.eu/eurostat/databrowser/view/lfst_hheredch/default/table?lang=en), 2025, ženy 25–49 let; výpočet DataTimes'

out = []
def log(*a):
    out.append(' '.join(str(x) for x in a))

def cz(x, d=1):
    return f'{x:.{d}f}'.replace('.', ',')

def get(url):
    with urllib.request.urlopen(url, timeout=120) as r:
        return r.read()

def sheet_rows(wb, name):
    rows = {}
    for row in wb[name].iter_rows(values_only=True):
        cells = [c for c in row if c is not None]
        for i, c in enumerate(cells):
            if isinstance(c, str) and c.strip() in CZ_NAME:
                vals = [v for v in cells[i + 1:] if isinstance(v, (int, float))]
                rows.setdefault(CZ_NAME[c.strip()], vals)
    return rows

wb = openpyxl.load_workbook(io.BytesIO(get(OECD_URL)), data_only=True, read_only=True)
lmf_c = sheet_rows(wb, 'Chart LMF1.2.C')  # [0-14, 0-2, 3-5, 6-14]
lmf_f = sheet_rows(wb, 'Chart LMF1.2.F')  # [total 0-2, working, maternity, parental, ...]

# ---- Chart 1: Czechia vs EU by age of youngest child (OECD LMF1.2.C)
vek = ['0–2 roky', '3–5 let', '6–14 let']  # age of the youngest child
v1 = []
for oblast in ['Česko', 'Průměr EU']:
    for i, s in enumerate(vek):
        val = round(lmf_c[oblast][i + 1], 1)
        v1.append({'skupina': f'Dítě {s}', 'oblast': oblast, 'hodnota': val, 't': f'{cz(val)} %'})
        log('LMF1.2.C', oblast, s, cz(val))
chart1 = {
    '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
    'title': {
        'text': 'S batoletem pracuje v {Česku|#de1743} pětina matek, ve školkovém věku dítěte jsou Češky na {průměru EU|#bcbcb0}',
        'subtitle': 'Zaměstnanost matek podle věku nejmladšího dítěte, ženy 15–64 let (%, 2021)',
    },
    'width': 'container', 'height': 240,
    'config': {'view': {'stroke': None}},
    'data': {'values': v1},
    'encoding': {
        'y': {'field': 'skupina', 'type': 'nominal', 'sort': [f'Dítě {s}' for s in vek],
              'axis': {'title': None, 'labelLimit': 200, 'domain': False, 'ticks': False}},
        'yOffset': {'field': 'oblast', 'sort': ['Česko', 'Průměr EU']},
        'x': {'field': 'hodnota', 'type': 'quantitative', 'scale': {'domain': [0, 100]},
              'axis': {'title': '% zaměstnaných', 'grid': False, 'domain': False, 'values': [0, 20, 40, 60, 80, 100]}},
        'color': {'field': 'oblast', 'type': 'nominal', 'scale': {'domain': ['Česko', 'Průměr EU'], 'range': [CRIMSON, GREY]}, 'legend': None},
    },
    'layer': [
        {'mark': {'type': 'bar', 'cornerRadiusEnd': 3},
         'encoding': {'tooltip': [{'field': 'oblast', 'title': 'Oblast'}, {'field': 'skupina', 'title': 'Skupina'}, {'field': 't', 'title': 'Zaměstnané'}]}},
        {'mark': {'type': 'text', 'align': 'left', 'dx': 5, 'fontWeight': 700, 'fontSize': 11},
         'encoding': {'text': {'field': 'hodnota', 'type': 'quantitative', 'format': '.1f'}}},
    ],
    '_source': OECD_SRC + ' (Chart LMF1.2.C)',
}

# ---- Chart 2: mothers of children 0-2 by reason they count as employed (OECD LMF1.2.F)
kat = ['skutečně pracuje', 'na mateřské, vedená jako zaměstnaná', 'na rodičovské, vedená jako zaměstnaná']
zeme2 = ['Česko', 'Slovensko', 'Maďarsko', 'Polsko', 'Rakousko', 'Německo', 'Průměr EU']
v2 = []
for z in zeme2:
    tot, prac, mat, rod = [round(x, 1) for x in lmf_f[z][:4]]
    log('LMF1.2.F', z, 'celkem', cz(tot), 'pracuje', cz(prac), 'mateřská', cz(mat), 'rodičovská', cz(rod))
    for k, val in zip(kat, [prac, mat, rod]):
        v2.append({'zeme': z, 'kategorie': k, 'poradi': kat.index(k), 'hodnota': val, 'celkem': tot,
                   'cz': z == 'Česko', 't_prac': f'{cz(prac)} %', 't_mat': f'{cz(mat)} %', 't_rod': f'{cz(rod)} %',
                   't_tot': f'{cz(tot)} %'})
# sort countries by share actually working (ascending)
order2 = sorted(zeme2, key=lambda z: lmf_f[z][1])
tooltip2 = [{'field': 'zeme', 'title': 'Země'}, {'field': 't_prac', 'title': 'Skutečně pracuje'},
            {'field': 't_mat', 'title': 'Na mateřské, vedená jako zaměstnaná'},
            {'field': 't_rod', 'title': 'Na rodičovské, vedená jako zaměstnaná'}, {'field': 't_tot', 'title': 'Statistika vede jako zaměstnané celkem'}]
y2 = {'field': 'zeme', 'type': 'nominal', 'sort': order2,
      'axis': {'title': None, 'domain': False, 'ticks': False, 'labelPadding': 6, 'labelFontSize': 12,
               'labelColor': {'expr': f"datum.value == 'Česko' ? '{CRIMSON}' : '{INK}'"},
               'labelFontWeight': {'expr': "datum.value == 'Česko' ? 700 : 400"}}}
chart2 = {
    '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
    'title': {
        'text': 'Skutečně pracuje s batoletem na {Slovensku a v Maďarsku|#272a59} podobně málo matek jako v {Česku|#de1743}',
        'subtitle': 'Matky dětí do tří let, které statistika vede jako zaměstnané, ženy 15–64 let (%, 2021); číslo za pruhem = celkem',
    },
    'width': 'container', 'height': {'step': 30},
    'config': {'view': {'stroke': None}},
    'data': {'values': v2},
    # legend is drawn by the website (ChartLegend) from the top-level colour scale
    '_toggle_legend': True,
    '_legend_hide_mode': 'filter',
    'encoding': {'color': {'field': 'kategorie', 'type': 'nominal', 'sort': kat, 'legend': None,
                           'scale': {'domain': kat, 'range': [CRIMSON, '#8f9dc9', '#d2d8e9']}}},
    'layer': [
        {'mark': {'type': 'bar', 'height': {'band': 0.72}},
         'encoding': {
             'y': y2,
             'x': {'field': 'hodnota', 'type': 'quantitative', 'stack': 'zero', 'scale': {'domain': [0, 80]},
                   'axis': {'title': None, 'grid': False, 'domain': False, 'ticks': False, 'values': [0, 20, 40, 60, 80], 'labelExpr': "datum.value + ' %'"}},
             'order': {'field': 'poradi'},
             'tooltip': tooltip2}},
        {'transform': [{'filter': "datum.poradi == 0"}],
         'mark': {'type': 'text', 'align': 'left', 'dx': 4, 'fontSize': 11, 'fontWeight': 700, 'color': INK},
         'encoding': {'y': y2, 'x': {'field': 'celkem', 'type': 'quantitative'}, 'color': {'value': INK},
                      'text': {'field': 'celkem', 'type': 'quantitative', 'format': '.1f'}, 'tooltip': tooltip2}},
        {'transform': [{'filter': "datum.poradi == 0"}],
         'mark': {'type': 'text', 'align': 'right', 'dx': -4, 'fontSize': 11, 'fontWeight': 700, 'color': '#ffffff'},
         'encoding': {'y': y2, 'x': {'field': 'hodnota', 'type': 'quantitative'}, 'color': {'value': '#ffffff'},
                      'text': {'field': 'hodnota', 'type': 'quantitative', 'format': '.1f'}, 'tooltip': tooltip2}},
    ],
    '_source': OECD_SRC + ' (Chart LMF1.2.F)',
}

# ---- Chart 3: mothers of children under 6 as % of childless women (Eurostat lfst_hheredch)
es = json.loads(get(ES_URL))
ids, size, dims, val = es['id'], es['size'], es['dimension'], es['value']
idx = {k: dims[k]['category']['index'] for k in ids}
def esv(**kw):
    pos = 0
    for k, s in zip(ids, size):
        pos = pos * s + idx[k][kw.get(k, next(iter(idx[k])))]
    return val[str(pos)]
v3 = []
for g, z in GEO.items():
    m, b = esv(n_child='TOTAL', agechild='Y_LT6', geo=g), esv(n_child='0', agechild='NAP', geo=g)
    s611 = esv(n_child='TOTAL', agechild='Y6-11', geo=g)
    pomer = round(100 * m / b, 1)
    log('lfst_hheredch', z, 'matky <6', cz(m), 'bez dětí', cz(b), 'matky 6-11', cz(s611), 'poměr', cz(pomer))
    v3.append({'zeme': z, 'pomer': pomer, 'matky': f'{cz(m)} %', 'bezdetne': f'{cz(b)} %', 'skupina': 'cz' if g == 'CZ' else 'eu' if g.startswith('EU') else 'ost'})
order3 = [d['zeme'] for d in sorted(v3, key=lambda d: d['pomer'])]
chart3 = {
    '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
    'title': {
        'text': 'Proti ženám bez dětí zaostávají matky malých dětí v {Česku|#de1743} mnohem víc než jinde ve střední Evropě',
        'subtitle': 'Zaměstnanost matek s dítětem do 6 let jako % zaměstnanosti žen bez dětí v téže zemi, ženy 25–49 let (2025)',
    },
    'width': 'container', 'height': {'step': 30},
    'config': {'view': {'stroke': None}},
    'data': {'values': v3},
    'encoding': {
        'y': {'field': 'zeme', 'type': 'nominal', 'sort': order3,
              'axis': {'title': None, 'domain': False, 'ticks': False, 'labelFontSize': 12,
                       'labelColor': {'expr': f"datum.value == 'Česko' ? '{CRIMSON}' : '{INK}'"},
                       'labelFontWeight': {'expr': "datum.value == 'Česko' ? 700 : 400"}}},
        'x': {'field': 'pomer', 'type': 'quantitative', 'scale': {'domain': [0, 100]},
              'axis': {'title': None, 'grid': False, 'domain': False, 'ticks': False, 'values': [0, 25, 50, 75, 100], 'labelExpr': "datum.value + ' %'"}},
        'color': {'field': 'skupina', 'type': 'nominal', 'scale': {'domain': ['cz', 'eu', 'ost'], 'range': [CRIMSON, EU, GREY]}, 'legend': None},
        'tooltip': [{'field': 'zeme', 'title': 'Země'}, {'field': 'matky', 'title': 'Matky dítěte do 6 let zaměstnané'},
                    {'field': 'bezdetne', 'title': 'Ženy bez dětí zaměstnané'}, {'field': 'pomer', 'title': 'Poměr (%)', 'format': '.1f'}],
    },
    'layer': [
        {'mark': {'type': 'bar', 'cornerRadiusEnd': 3, 'height': {'band': 0.72}}},
        {'mark': {'type': 'text', 'align': 'left', 'dx': 5, 'fontWeight': 700, 'fontSize': 11, 'color': INK},
         'encoding': {'text': {'field': 'pomer', 'type': 'quantitative', 'format': '.1f'}}},
    ],
    '_source': ES_SRC,
}

DATA.mkdir(exist_ok=True)
for name, spec in [('matky-podle-veku-ditete', chart1), ('matky-batolat-pracuje-vs-rodicovska', chart2), ('matky-vs-bezdetne', chart3)]:
    (DATA / f'{name}.json').write_text(json.dumps(spec, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(HERE / 'vystup.txt').write_text('\n'.join(out) + '\n', encoding='utf-8')
print('\n'.join(out))
