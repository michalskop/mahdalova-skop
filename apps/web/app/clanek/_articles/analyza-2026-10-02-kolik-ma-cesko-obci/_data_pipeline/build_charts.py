"""Grafy k článku analyza-2026-10-02-kolik-ma-cesko-obci.

Vstupy (vstupy/*.csv) vznikly 2. 10. 2026 rešerší:
- obce_cz_2026.csv, velikost_skupiny.csv, pocet_obci_vyvoj.csv – ČSÚ (OBY02A k 1. 1. 2026,
  Statistická ročenka tab. 1-13, Statistika&My 2018), skript build_cz.py
- zastupitelstva_2026.csv – volby.cz, otevřená data KV2026reg20260923
- naklady_*_2025.csv – Monitor státní pokladny, FIN 2-12 M 12/2025, skript vypocet_monitor.py
- velikost_skupiny_at.csv, pocet_gemeinden_vyvoj.csv – Statistik Austria (RegGemVz2026, seznam změn od 2002), WIFO/KDZ 2010
- evropa_obce.csv – OECD SNG dashboard 2025, Eurostat LAU 2025, Eurostat obyvatelé 1. 1. 2025

Spuštění: python build_charts.py  → zapíše ../data/*.json a vypíše čísla pro text.
"""
import csv
import json
from pathlib import Path

HERE = Path(__file__).parent
IN = HERE / 'vstupy'
OUT = HERE.parent / 'data'
OUT.mkdir(exist_ok=True)

CZ = '#de1743'      # brand.6 – Česko
AT = '#06677d'      # brandTeal.7 – Rakousko
GREY = '#c8c8bc'    # background.8 – ostatní
NAVY = '#272a59'    # brandRoyalBlue.8
NAVY_LIGHT = '#8f9dc9'  # brandNavy.4

GROUPS = ['do 199', '200–499', '500–999', '1 000–1 999', '2 000–4 999',
          '5 000–9 999', '10 000–49 999', '50 000+']


def read(name):
    with open(IN / name, encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f))


def dump(name, spec):
    (OUT / name).write_text(json.dumps(spec, ensure_ascii=False, indent=2), encoding='utf-8')


def fmt(n, d=0):
    s = f'{n:,.{d}f}'.replace(',', ' ').replace('.', ',')
    return s


# ── 1. Evropa: obcí na 100 tis. obyvatel ─────────────────────────────────
eu = [r for r in read('evropa_obce.csv') if r['obci_na_100k_obyvatel']]
rows = []
for r in eu:
    rows.append({
        'zeme': r['zeme'],
        'v': float(r['obci_na_100k_obyvatel']),
        'obci': int(float(r['pocet_obci'])),
        'obyv_na_obec': int(float(r['prumer_obyvatel_na_obec'])),
        'barva': CZ if r['kod'] == 'CZ' else AT if r['kod'] == 'AT' else GREY,
    })
rows.sort(key=lambda r: -r['v'])
dump('evropa.json', {
    '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
    'title': {
        'text': 'Česko má na počet obyvatel nejvíc obcí v Evropě',
        'subtitle': 'Počet obcí na 100 000 obyvatel, 2025. Obec = základní jednotka místní samosprávy.',
    },
    'width': 600,
    'height': len(rows) * 19,
    'data': {'values': rows},
    'encoding': {
        'y': {'field': 'zeme', 'type': 'nominal', 'sort': [r['zeme'] for r in rows],
              'axis': {'title': None, 'labelFontSize': 12, 'ticks': False, 'domain': False}},
    },
    'layer': [
        {
            'mark': {'type': 'bar', 'cornerRadiusEnd': 2, 'height': 13},
            'encoding': {
                'x': {'field': 'v', 'type': 'quantitative', 'scale': {'domain': [0, 72]}, 'axis': {'title': None, 'grid': True, 'gridColor': '#e8e3d2'}},
                'color': {'field': 'barva', 'type': 'nominal', 'scale': None},
                'tooltip': [
                    {'field': 'zeme', 'title': 'Země'},
                    {'field': 'v', 'title': 'Obcí na 100 tis. obyv.', 'format': ',.1f'},
                    {'field': 'obci', 'title': 'Obcí', 'format': ',.0f'},
                    {'field': 'obyv_na_obec', 'title': 'Průměrně obyvatel na obec', 'format': ',.0f'},
                ],
            },
        },
        {
            'mark': {'type': 'text', 'align': 'left', 'dx': 4, 'fontSize': 11, 'fontWeight': 'bold', 'color': '#333333'},
            'encoding': {
                'x': {'field': 'v', 'type': 'quantitative'},
                'text': {'field': 'v', 'type': 'quantitative', 'format': ',.1f'},
            },
        },
    ],
    '_source': 'OECD – Subnational government structure and finance 2025 (počty obcí), Eurostat LAU 2025 (Bulharsko, Chorvatsko, Malta, Rumunsko), Eurostat – obyvatelé k 1. 1. 2025. Česko včetně 4 vojenských újezdů. Kypr bez srovnatelného údaje.',
})

# ── 2. Rozdělení obcí podle velikosti, ČR × Rakousko ───────────────────
cz_g = {r['skupina']: r for r in read('velikost_skupiny.csv')}
at_g = {r['velikostni_skupina']: r for r in read('velikost_skupiny_at.csv')}
vals = []
for i, g in enumerate(GROUPS):
    vals.append({'sk': g, 'i': i, 'zeme': 'Česko', 'v': float(cz_g[g]['podil_obci_pct']), 'n': int(cz_g[g]['pocet_obci'])})
    vals.append({'sk': g, 'i': i, 'zeme': 'Rakousko', 'v': float(at_g[g]['podil_obci_pct']), 'n': int(at_g[g]['pocet_obci'])})
dump('velikost.json', {
    '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
    'title': {
        'text': 'Polovina českých obcí má méně než 500 obyvatel, rakouských jen každá dvacátá',
        'subtitle': 'Podíl obcí podle počtu obyvatel (v %), k 1. 1. 2026',
    },
    'width': 600,
    'height': 300,
    'data': {'values': vals},
    'encoding': {
        'x': {'field': 'sk', 'type': 'nominal', 'sort': GROUPS,
              'axis': {'title': 'počet obyvatel obce', 'labelAngle': 0, 'labelFontSize': 10.5}},
        'xOffset': {'field': 'zeme', 'sort': ['Česko', 'Rakousko']},
        'color': {'field': 'zeme', 'type': 'nominal', 'scale': {'domain': ['Česko', 'Rakousko'], 'range': [CZ, AT]},
                  'legend': {'title': None}},
    },
    'layer': [
        {
            'mark': {'type': 'bar', 'cornerRadiusEnd': 2},
            'encoding': {
                'y': {'field': 'v', 'type': 'quantitative', 'axis': {'title': None, 'grid': True, 'gridColor': '#e8e3d2', 'labelExpr': "datum.label + ' %'"}},
                'tooltip': [
                    {'field': 'zeme', 'title': 'Země'},
                    {'field': 'sk', 'title': 'Obyvatel'},
                    {'field': 'v', 'title': 'Podíl obcí (%)', 'format': ',.1f'},
                    {'field': 'n', 'title': 'Počet obcí', 'format': ',.0f'},
                ],
            },
        },
        {
            'mark': {'type': 'text', 'dy': -7, 'fontSize': 10.5, 'fontWeight': 'bold'},
            'encoding': {
                'y': {'field': 'v', 'type': 'quantitative'},
                'text': {'field': 'v', 'type': 'quantitative', 'format': '.0f'},
            },
        },
    ],
    '_source': 'ČSÚ – počet obyvatel v obcích k 1. 1. 2026 (datová sada OBY02A, bez vojenských újezdů); Statistik Austria – Gemeindeverzeichnis 2026',
})

# ── 3. Vývoj počtu obcí ───────────────────────────────────────────────
cz_years = {1921, 1930, 1950, 1961, 1970, 1980, 1990, 1991, 2001, 2011, 2021, 2026}
hist = []
for r in read('pocet_obci_vyvoj.csv'):
    y = int(r['rok'])
    if y in cz_years:
        hist.append({'rok': y, 'zeme': 'Česko', 'v': int(r['pocet_obci'])})
at_pick = {'1961': 1961, '2002-01-01': 2002, '2013-01-01': 2013, '2015-05-01': 2015, '2026-01-01': 2026}
for r in read('pocet_gemeinden_vyvoj.csv'):
    if r['uzemi'] == 'Rakousko' and r['datum'] in at_pick:
        hist.append({'rok': at_pick[r['datum']], 'zeme': 'Rakousko', 'v': int(r['pocet_obci'])})
hist.sort(key=lambda r: (r['zeme'], r['rok']))
color = {'field': 'zeme', 'type': 'nominal', 'scale': {'domain': ['Česko', 'Rakousko'], 'range': [CZ, AT]},
         'legend': {'title': None}}
tooltip = [{'field': 'zeme', 'title': 'Země'}, {'field': 'rok', 'title': 'Rok', 'format': 'd'},
           {'field': 'v', 'title': 'Obcí', 'format': ',.0f'}]
notes = [
    {'rok': 1972, 'v': 10600, 't': 'slučování obcí', 't2': '1960–1985'},
    {'rok': 2004, 'v': 8200, 't': 'po volbách 1990', 't2': 'vzniklo ~1 700 obcí'},
]
dump('vyvoj.json', {
    '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
    'title': {
        'text': 'Česko obce za socialismu sloučilo a po roce 1990 zase rozdělilo. Rakousko u sloučení zůstalo',
        'subtitle': 'Počet obcí. Česko na dnešním území včetně vojenských újezdů. U Rakouska chybí údaje mezi lety 1961 a 2002 (čárkovaně).',
    },
    'width': 600,
    'height': 320,
    'data': {'values': hist},
    'encoding': {
        'x': {'field': 'rok', 'type': 'quantitative', 'scale': {'domain': [1920, 2027]},
              'axis': {'title': None, 'format': 'd', 'values': [1921, 1950, 1961, 1970, 1980, 1990, 2001, 2011, 2026]}},
        'color': color,
    },
    'layer': [
        {
            'transform': [{'filter': "datum.zeme == 'Česko'"}],
            'mark': {'type': 'line', 'strokeWidth': 2.5},
            'encoding': {'y': {'field': 'v', 'type': 'quantitative', 'axis': {'title': None, 'grid': True, 'gridColor': '#e8e3d2'}}},
        },
        {
            'transform': [{'filter': "datum.zeme == 'Rakousko' && datum.rok <= 2002"}],
            'mark': {'type': 'line', 'strokeWidth': 2, 'strokeDash': [4, 4]},
            'encoding': {'y': {'field': 'v', 'type': 'quantitative'}},
        },
        {
            'transform': [{'filter': "datum.zeme == 'Rakousko' && datum.rok >= 2002"}],
            'mark': {'type': 'line', 'strokeWidth': 2.5},
            'encoding': {'y': {'field': 'v', 'type': 'quantitative'}},
        },
        {
            'mark': {'type': 'point', 'filled': True, 'size': 40},
            'encoding': {'y': {'field': 'v', 'type': 'quantitative'}, 'tooltip': tooltip},
        },
        {
            'data': {'values': notes},
            'mark': {'type': 'text', 'fontSize': 11, 'color': '#555555', 'align': 'center'},
            'encoding': {
                'x': {'field': 'rok', 'type': 'quantitative'},
                'y': {'field': 'v', 'type': 'quantitative'},
                'text': {'field': 't'},
                'color': {'value': '#555555'},
            },
        },
        {
            'data': {'values': notes},
            'mark': {'type': 'text', 'fontSize': 11, 'color': '#555555', 'align': 'center', 'dy': 13},
            'encoding': {
                'x': {'field': 'rok', 'type': 'quantitative'},
                'y': {'field': 'v', 'type': 'quantitative'},
                'text': {'field': 't2'},
                'color': {'value': '#555555'},
            },
        },
    ],
    '_source': 'ČSÚ – Statistická ročenka ČR, tab. 1-13 (sčítání lidu) a Statistika&My (stav na začátku roku 1990, cca 4 100 obcí); Statistik Austria – změny územního členění od roku 2002 a Gemeindeverzeichnis 2026; WIFO/KDZ pro rakouské ministerstvo financí 2010 (rok 1961)',
})

# ── 4. Náklady samosprávy podle velikosti obce ───────────────────────
nak = read('naklady_skupiny_2025.csv')
bez_orp = {r['skupina']: r for r in nak if r['varianta'].startswith('bez ORP')}
souhrn = {r['skupina']: r for r in nak if r['varianta'] == 'souhrn'}
cost_groups = GROUPS[:6]
cv = []
for i, g in enumerate(cost_groups):
    r = bez_orp[g]
    total = float(r['vazeny_sprava_na_obyv'])
    cv.append({'sk': g, 'slozka': 'obecní úřad (§ 6171)', 'v': float(r['vazeny_6171_na_obyv']), 'celkem': total, 'n': int(r['pocet_obci'])})
    cv.append({'sk': g, 'slozka': 'zastupitelstvo (§ 6112)', 'v': float(r['vazeny_6112_na_obyv']), 'celkem': total, 'n': int(r['pocet_obci'])})
dump('naklady.json', {
    '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
    'title': {
        'text': 'Nejmenší obce stojí na obyvatele skoro dvakrát víc než obce s tisícovkou lidí',
        'subtitle': 'Výdaje obcí na zastupitelstvo a obecní úřad v Kč na obyvatele, 2025. Obce bez rozšířené působnosti, bez Prahy.',
    },
    'width': 600,
    'height': 300,
    'data': {'values': cv},
    'encoding': {
        'x': {'field': 'sk', 'type': 'nominal', 'sort': cost_groups,
              'axis': {'title': 'počet obyvatel obce', 'labelAngle': 0, 'labelFontSize': 10.5}},
    },
    'layer': [
        {
            'mark': {'type': 'bar', 'width': {'band': 0.7}},
            'encoding': {
                'y': {'field': 'v', 'type': 'quantitative', 'stack': 'zero',
                      'axis': {'title': None, 'grid': True, 'gridColor': '#e8e3d2', 'format': ',.0f'}},
                'color': {'field': 'slozka', 'type': 'nominal',
                          'scale': {'domain': ['zastupitelstvo (§ 6112)', 'obecní úřad (§ 6171)'], 'range': [CZ, NAVY_LIGHT]},
                          'legend': {'title': None}},
                'order': {'field': 'slozka', 'sort': 'descending'},
                'tooltip': [
                    {'field': 'sk', 'title': 'Obyvatel'},
                    {'field': 'slozka', 'title': 'Položka'},
                    {'field': 'v', 'title': 'Kč na obyvatele', 'format': ',.0f'},
                    {'field': 'celkem', 'title': 'Celkem Kč na obyvatele', 'format': ',.0f'},
                    {'field': 'n', 'title': 'Počet obcí', 'format': ',.0f'},
                ],
            },
        },
        {
            'transform': [{'filter': "datum.slozka == 'zastupitelstvo (§ 6112)'"}],
            'mark': {'type': 'text', 'dy': -8, 'fontSize': 12, 'fontWeight': 'bold', 'color': '#1a1a1a'},
            'encoding': {
                'y': {'field': 'celkem', 'type': 'quantitative'},
                'text': {'field': 'celkem', 'type': 'quantitative', 'format': ',.0f'},
            },
        },
    ],
    '_source': 'Monitor státní pokladny (MF) – výkaz FIN 2-12 M za 12/2025, paragrafy 6112 a 6171, třídy 5 a 6; ČSÚ – obyvatelé k 1. 1. 2025. Vážený průměr (součet výdajů / součet obyvatel). Obce nad 10 000 obyvatel jsou téměř všechny obce s rozšířenou působností, jejichž úřady vykonávají i státní správu – proto v grafu nejsou.',
})

# ── 5. Volby bez výběru podle velikosti obce ─────────────────────────
z = [r for r in read('zastupitelstva_2026.csv') if r['TYPZASTUP'] == '1']
bins = [(0, 199), (200, 499), (500, 999), (1000, 1999), (2000, 4999), (5000, 9999), (10000, 49999), (50000, 10**9)]
agg = {g: {'n': 0, 'jedna': 0, 'malo': 0} for g in GROUPS}
tot = {'n': 0, 'jedna': 0, 'rovno': 0, 'malo': 0, 'mand': 0}
for r in z:
    ob = int(r['obyv'])
    g = next(GROUPS[i] for i, (a, b) in enumerate(bins) if a <= ob <= b)
    kand = float(r['kand'] or 0)
    mand = int(r['mand'])
    listin = float(r['listin'] or 0)
    agg[g]['n'] += 1
    tot['n'] += 1
    tot['mand'] += mand
    if listin == 1:
        agg[g]['jedna'] += 1
        tot['jedna'] += 1
    if kand <= mand:
        agg[g]['malo'] += 1
        tot['malo'] += 1
    if kand == mand:
        tot['rovno'] += 1
kv = []
for g in GROUPS:
    a = agg[g]
    kv.append({'sk': g, 'serie': 'jediná kandidátka', 'v': round(a['jedna'] / a['n'] * 100, 1), 'k': a['jedna'], 'n': a['n']})
    kv.append({'sk': g, 'serie': 'zvolen bude každý kandidát', 'v': round(a['malo'] / a['n'] * 100, 1), 'k': a['malo'], 'n': a['n']})
dump('kandidati.json', {
    '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
    'title': {
        'text': 'Čím menší obec, tím častěji volby bez výběru',
        'subtitle': 'Podíl obcí (v %) podle počtu obyvatel, komunální volby 9.–10. 10. 2026',
    },
    'width': 600,
    'height': 300,
    'data': {'values': kv},
    'encoding': {
        'x': {'field': 'sk', 'type': 'nominal', 'sort': GROUPS,
              'axis': {'title': 'počet obyvatel obce', 'labelAngle': 0, 'labelFontSize': 10.5}},
        'xOffset': {'field': 'serie', 'sort': ['jediná kandidátka', 'zvolen bude každý kandidát']},
        'color': {'field': 'serie', 'type': 'nominal',
                  'scale': {'domain': ['jediná kandidátka', 'zvolen bude každý kandidát'], 'range': [NAVY, CZ]},
                  'legend': {'title': None}},
    },
    'layer': [
        {
            'mark': {'type': 'bar', 'cornerRadiusEnd': 2},
            'encoding': {
                'y': {'field': 'v', 'type': 'quantitative', 'scale': {'domain': [0, 55]},
                      'axis': {'title': None, 'grid': True, 'gridColor': '#e8e3d2', 'labelExpr': "datum.label + ' %'"}},
                'tooltip': [
                    {'field': 'sk', 'title': 'Obyvatel'},
                    {'field': 'serie', 'title': 'Ukazatel'},
                    {'field': 'v', 'title': 'Podíl obcí (%)', 'format': ',.1f'},
                    {'field': 'k', 'title': 'Obcí', 'format': ',.0f'},
                    {'field': 'n', 'title': 'Obcí ve skupině', 'format': ',.0f'},
                ],
            },
        },
        {
            'mark': {'type': 'text', 'dy': -7, 'fontSize': 10.5, 'fontWeight': 'bold'},
            'encoding': {
                'y': {'field': 'v', 'type': 'quantitative'},
                'text': {'field': 'v', 'type': 'quantitative', 'format': '.0f'},
            },
        },
    ],
    '_source': 'volby.cz – otevřená data registrů kandidátů KV 2026 (stav 23. 9. 2026); ČSÚ – obyvatelé obcí. Bez zastupitelstev městských částí a obvodů.',
})

# ── Čísla pro text ────────────────────────────────────────────────────
print('Volby 2026:', tot)
for g in GROUPS:
    a = agg[g]
    print(f"  {g}: n={a['n']} jedna={a['jedna']} ({a['jedna']/a['n']*100:.1f} %) malo={a['malo']} ({a['malo']/a['n']*100:.1f} %)")

vse = {r['skupina']: r for r in nak if r['varianta'].startswith('vsechny')}
small = ['do 199', '200–499']
cost_small = sum(float(vse[g]['sprava_kc']) for g in small)
pop_small = sum(int(vse[g]['obyvatele']) for g in small)
ref = float(vse['1 000–1 999']['vazeny_sprava_na_obyv'])
diff = cost_small - pop_small * ref
cr = souhrn['CR celkem vc. Prahy']
print(f'Obce do 499: {fmt(pop_small)} obyv., správa {fmt(cost_small/1e9, 2)} mld. Kč')
print(f'Kdyby stály jako 1 000–1 999 ({fmt(ref)} Kč/obyv.): rozdíl {fmt(diff/1e9, 2)} mld. Kč = '
      f"{diff/float(cr['sprava_kc'])*100:.1f} % nákladů samosprávy, {diff/float(cr['vydaje_celkem_kc'])*100:.2f} % výdajů obcí")
print('Samospráva celkem:', fmt(float(cr['sprava_kc'])/1e9, 2), 'mld.; 6112:', fmt(float(cr['v6112_kc'])/1e9, 2), 'mld.')
print('Mandáty na 1000 obyv. CZ:', round(59173 / 10915839 * 1000, 2), '| s MČ:', round(61751 / 10915839 * 1000, 2), '| AT:', round(39500 / 9215956 * 1000, 2))
print('CZ/AT obcí:', round(6254 / 2092, 2), '| na 100k:', round(57.4 / 22.7, 2))


# ── Souhrnný tooltip za celou kategorii ───────────────────────────────
# U seskupených a skládaných sloupců má každá kategorie (skupina sloupců) jeden
# tooltip s minitabulkou za všechny série. Řeší to neviditelný pás přes celou
# výšku kategorie, položený nad sloupce; řádky tooltipu se jmenují podle sérií,
# takže je VegaChartImpl obarví barvou série. Při najetí se pás jemně zvýrazní.
def add_category_band(name, rows, ymax, cat_title='Obyvatel obce'):
    path = OUT / name
    spec = json.loads(path.read_text(encoding='utf-8'))
    enc = spec['encoding']
    moved = {k: enc.pop(k) for k in ('xOffset', 'color') if k in enc}
    for layer in spec['layer']:
        layer.setdefault('encoding', {})
        for k, v in moved.items():
            layer['encoding'].setdefault(k, v)
        layer['encoding'].pop('tooltip', None)
        y = layer['encoding'].get('y')
        if y and 'axis' in y:
            y['scale'] = {**y.get('scale', {}), 'domain': [0, ymax]}
    keys = [k for k in rows[0] if k != 'sk']
    spec['layer'].append({
        'data': {'values': rows},
        'params': [{'name': 'hov', 'select': {'type': 'point', 'fields': ['sk'], 'on': 'mouseover', 'clear': 'mouseout'}}],
        'mark': {'type': 'bar', 'fill': '#101432', 'cursor': 'default'},
        'encoding': {
            'y': {'datum': 0},
            'y2': {'datum': ymax},
            'fillOpacity': {'condition': {'param': 'hov', 'empty': False, 'value': 0.06}, 'value': 0},
            'tooltip': [{'field': 'sk', 'title': cat_title}] + [{'field': k, 'title': k} for k in keys],
        },
    })
    path.write_text(json.dumps(spec, ensure_ascii=False, indent=2), encoding='utf-8')


pct = lambda v: fmt(v, 1) + ' %'
add_category_band('velikost.json', [
    {'sk': g,
     'Česko': f"{pct(float(cz_g[g]['podil_obci_pct']))} ({fmt(int(cz_g[g]['pocet_obci']))} obcí)",
     'Rakousko': f"{pct(float(at_g[g]['podil_obci_pct']))} ({fmt(int(at_g[g]['pocet_obci']))} obcí)"}
    for g in GROUPS], 40)

add_category_band('naklady.json', [
    {'sk': g,
     'zastupitelstvo (§ 6112)': fmt(float(bez_orp[g]['vazeny_6112_na_obyv'])) + ' Kč',
     'obecní úřad (§ 6171)': fmt(float(bez_orp[g]['vazeny_6171_na_obyv'])) + ' Kč',
     'Celkem na obyvatele': fmt(float(bez_orp[g]['vazeny_sprava_na_obyv'])) + ' Kč',
     'Podíl na výdajích obcí': pct(float(bez_orp[g]['podil_sprava_na_vydajich_souhrn_pct'])),
     'Obcí ve skupině': fmt(int(bez_orp[g]['pocet_obci']))}
    for g in cost_groups], 12000)

add_category_band('kandidati.json', [
    {'sk': g,
     'jediná kandidátka': f"{pct(agg[g]['jedna'] / agg[g]['n'] * 100)} ({fmt(agg[g]['jedna'])} z {fmt(agg[g]['n'])} obcí)",
     'zvolen bude každý kandidát': f"{pct(agg[g]['malo'] / agg[g]['n'] * 100)} ({fmt(agg[g]['malo'])} z {fmt(agg[g]['n'])} obcí)"}
    for g in GROUPS], 55)
