"""Spočítá všechna čísla do článku o státních vyznamenáních a vygeneruje grafy.

Vstupy:
  vstupy/hrad_seznamy.csv     – výstup 01_parse_hrad.py (oficiální seznamy Hradu)
  vstupy/klasifikace/*_out.csv – ruční/rešeršní kódování každého záznamu:
                                 pohlaví, cizinec, obor, krátký popis, jistota
Výstupy:
  vystup.txt                  – všechna čísla citovaná v textu
  vstupy/vyznamenani_1995_2026.csv – sloučená tabulka
  ../data/*.json              – Vega-Lite grafy pro <VegaChart />

Prezident = kdo vyznamenání v daném roce udělil: Havel 1995–2002, Klaus 2003–2012,
Zeman 2013–2022, Pavel 2023–. Rok 2020 v seznamech není (ceremonie se kvůli covidu
nekonala). Roky 1993–1994 také ne: zákon o státních vyznamenáních platí od 1994
a první vyznamenání udělil Havel 28. 10. 1995.
"""
import csv, json, sys
from collections import Counter, defaultdict
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
BASE = Path(__file__).parent
DATA = BASE.parent / 'data'
OUT = []

def say(*a):
    s = ' '.join(str(x) for x in a)
    OUT.append(s); print(s)

PREZ = ['Havel', 'Klaus', 'Zeman', 'Pavel']
PREZ_LABEL = {'Havel': 'Václav Havel', 'Klaus': 'Václav Klaus', 'Zeman': 'Miloš Zeman', 'Pavel': 'Petr Pavel'}
# barvy podle Kateřiny (27. 10. 2026): Havel modrá, Klaus červená (trikolóra), Zeman nejtmavší zlatá, Pavel tyrkysová
PREZ_COLOR = {'Havel': '#4a51ab', 'Klaus': '#de1743', 'Zeman': '#a47d03', 'Pavel': '#0e839e'}
DRUHY = ['Řád Bílého lva', 'Řád T. G. Masaryka', 'Medaile Za hrdinství', 'Medaile Za zásluhy']
ZENY, MUZI = '#f76800', '#06677d'

def prezident(rok):
    r = int(rok)
    return 'Havel' if r <= 2002 else 'Klaus' if r <= 2012 else 'Zeman' if r <= 2022 else 'Pavel'

OBORY = {
    'kultura': 'kultura a umění',
    'veda': 'věda a vzdělávání',
    'medicina': 'medicína',
    'sport': 'sport',
    'media': 'novinářství',
    'politika': 'politika, stát a justice',
    'zahranicni_statnik': 'zahraniční státníci',
    'odboj_valka': 'válka a protinacistický odboj',
    'protikomunisticky_odboj': 'protikomunistický odboj a disent',
    'armada_bezpecnost': 'armáda, policie, záchranáři',
    'hrdinsky_cin': 'statečný čin civilisty',
    'podnikani': 'podnikání',
    'cirkev': 'církev',
    'obcanska_spolecnost': 'občanská společnost a krajané',
    'jine': 'jiné',
    'nezjisteno': 'nezjištěno',
}

# --- načtení -----------------------------------------------------------------
rows = list(csv.DictReader(open(BASE / 'vstupy' / 'hrad_seznamy.csv', encoding='utf-8')))
rows.sort(key=lambda x: (x['rok'], x['druh'], x['jmeno']))
for i, r in enumerate(rows, 1):
    r['id'] = str(i)
    r['prezident'] = prezident(r['rok'])

klas = {}
for f in sorted((BASE / 'vstupy' / 'klasifikace').glob('*_out.csv')):
    for k in csv.DictReader(open(f, encoding='utf-8-sig')):
        klas[k['id'].strip()] = k
chybi = [r['id'] for r in rows if r['id'] not in klas]
say(f'Záznamů celkem: {len(rows)}; bez klasifikace: {len(chybi)}')
for r in rows:
    k = klas.get(r['id'], {})
    r['pohlavi'] = (k.get('pohlavi') or '?').strip().upper()
    r['cizinec'] = (k.get('cizinec') or '0').strip()
    r['obor'] = (k.get('obor') or 'jine').strip()
    if r['obor'] not in OBORY:
        say('  neznámý obor', r['id'], r['jmeno'], r['obor']); r['obor'] = 'jine'
    r['popis'] = (k.get('popis') or '').strip()
    r['jistota'] = (k.get('jistota') or '').strip()
    # nejistý odhad oboru nebereme – vede se jako nezjištěno
    if r['obor'] == 'jine' or (r['jistota'] == 'nizka' and r['obor'] == 'jine'):
        r['obor'] = 'nezjisteno'
# Ruční opravy podle rešerše: Jan Dvořák (hasič, in memoriam) dostal medaili Za hrdinství
# od Zemana k 1. 1. 2023, Hrad ho vede rokem 2023.
for r in rows:
    if r['jmeno'].startswith('Jan Dvořák') and r['rok'] == '2023' and r['druh'] == 'Medaile Za hrdinství':
        r['prezident'] = 'Zeman'

# Čištění až po spojení s klasifikací (id musí sedět s dávkami): koncové čárky ve jménech,
# zdvojený záznam v seznamu Hradu (Ilja Hradecký, ŘTGM 2023 je tam dvakrát).
seen = set(); clean = []
for r in rows:
    r['jmeno'] = r['jmeno'].strip(' ,')
    key = (r['druh'], r['zaznam'].replace('plukovník', 'plk.'))  # hasič M. Štěpán 1997 je v seznamu dvakrát
    if key in seen:
        say('  zdvojený záznam vynechán:', r['druh'], r['zaznam']); continue
    seen.add(key); clean.append(r)
rows = clean

with open(BASE / 'vstupy' / 'vyznamenani_1995_2026.csv', 'w', encoding='utf-8', newline='') as f:
    cols = ['id', 'rok', 'prezident', 'druh', 'trida', 'skupina', 'in_memoriam', 'jmeno',
            'pohlavi', 'cizinec', 'obor', 'popis', 'jistota', 'zaznam']
    w = csv.DictWriter(f, fieldnames=cols, extrasaction='ignore'); w.writeheader(); w.writerows(rows)

# Analyzujeme roky 1995–2025 (rok 2026 zatím obsahuje jen vyznamenání udělená
# při státních návštěvách; říjnový seznam Hrad zveřejní až 28. 10. 2026).
R = [r for r in rows if r['rok'] <= '2025']
say(f'Analyzováno 1995–2025: {len(R)} vyznamenání')
say('Rok 2026 v seznamu:', '; '.join(r['zaznam'] for r in rows if r['rok'] == '2026'))
# Ročníky = roky, za které prezident vyznamenání oznámil. Za Zemana 10 (2013–2022): ročník 2020
# se kvůli covidu nepředával a Hrad ho vede pod rokem 2021 (předáno spolu s 2021 dne 7. 3. 2022).
ceremonie = {'Havel': 8, 'Klaus': 10, 'Zeman': 10, 'Pavel': 3}
say('Ročníky:', ceremonie)

def pct(a, b):
    return f'{100 * a / b:.0f} %' if b else '–'

# --- 1. počty podle prezidentů ------------------------------------------------
say('\n## Počty podle prezidentů')
for p in PREZ:
    s = [r for r in R if r['prezident'] == p]
    c = Counter(r['druh'] for r in s)
    im = sum(int(r['in_memoriam']) for r in s)
    say(f'{p}: {len(s)} ({len(s) / ceremonie[p]:.1f} ročně), in memoriam {im} ({pct(im, len(s))}); '
        + '; '.join(f'{d}: {c[d]} ({pct(c[d], len(s))})' for d in DRUHY))
roky = Counter(r['rok'] for r in R)
say('Po letech:', ', '.join(f'{k}: {v}' for k, v in sorted(roky.items())))
say('Nejvíc:', roky.most_common(3), ' nejméně:', sorted(roky.items(), key=lambda x: x[1])[:3])

# --- 2. ženy ------------------------------------------------------------------
say('\n## Ženy (osoby se známým pohlavím)')
for p in PREZ + ['celkem']:
    s = [r for r in R if (p == 'celkem' or r['prezident'] == p) and r['pohlavi'] in 'ZM']
    z = sum(r['pohlavi'] == 'Z' for r in s)
    ri = [r for r in s if r['druh'].startswith('Řád')]
    zr = sum(r['pohlavi'] == 'Z' for r in ri)
    say(f'{p}: žen {z} z {len(s)} ({pct(z, len(s))}); v řádech {zr} z {len(ri)} ({pct(zr, len(ri))})')
s = [r for r in R if r['prezident'] != 'Pavel' and r['pohlavi'] in 'ZM']
say(f"Předchůdci Pavla dohromady: žen {sum(r['pohlavi'] == 'Z' for r in s)} z {len(s)} ({pct(sum(r['pohlavi'] == 'Z' for r in s), len(s))})")
nezn = [r for r in R if r['pohlavi'] not in 'ZM']
say('Pohlaví neurčeno:', len(nezn), [r['jmeno'] for r in nezn][:15])
zr_rok = []
for rok in sorted(roky):
    s = [r for r in R if r['rok'] == rok and r['pohlavi'] in 'ZM']
    z = sum(r['pohlavi'] == 'Z' for r in s)
    zr_rok.append({'rok': rok, 'prezident': PREZ_LABEL[prezident(rok)], 'ženy': z, 'celkem': len(s),
                   'podíl': round(z / len(s), 3) if s else 0})
say('Ženy po letech:', ', '.join(f"{x['rok']}: {x['ženy']}/{x['celkem']}" for x in zr_rok))

# --- 3. obory -------------------------------------------------------------------
say('\n## Obory podle prezidentů (podíl ze všech vyznamenání)')
obor_rows = []
for p in PREZ:
    s = [r for r in R if r['prezident'] == p]
    c = Counter(r['obor'] for r in s)
    say(f'{p}: ' + '; '.join(f'{OBORY[o]} {n} ({pct(n, len(s))})' for o, n in c.most_common()))
    for o, n in c.items():
        obor_rows.append({'prezident': PREZ_LABEL[p], 'obor': OBORY[o], 'počet': n,
                          'podíl': round(n / len(s), 4), 'celkem': len(s)})
say('\n## Řády (Bílý lev + TGM) podle oborů')
for p in PREZ:
    s = [r for r in R if r['prezident'] == p and r['druh'].startswith('Řád')]
    c = Counter(r['obor'] for r in s)
    say(f'{p} ({len(s)} řádů): ' + '; '.join(f'{OBORY[o]} {n} ({pct(n, len(s))})' for o, n in c.most_common()))
say('\n## Cizinci')
for p in PREZ:
    s = [r for r in R if r['prezident'] == p]
    c = sum(r['cizinec'] == '1' for r in s)
    say(f'{p}: cizinců {c} z {len(s)} ({pct(c, len(s))})')
say('\n## Ženy podle oblasti (celé období)')
for o in OBORY:
    s_ = [r for r in R if r['obor'] == o and r['pohlavi'] in 'ZM']
    if s_:
        z = sum(r['pohlavi'] == 'Z' for r in s_)
        say(f'{OBORY[o]}: žen {z} z {len(s_)} ({pct(z, len(s_))})')
s_ = [r for r in R if r['obor'] in ('odboj_valka', 'armada_bezpecnost')]
say(f'Válka, odboj, armáda dohromady: {len(s_)} z {len(R)} ({pct(len(s_), len(R))})')
say('Nezjištěná oblast:', sum(r['obor'] == 'nezjisteno' for r in R),
    dict(Counter(r['prezident'] for r in R if r['obor'] == 'nezjisteno')))
say('\n## Nízká jistota klasifikace:',sum(r['jistota'] == 'nizka' for r in R))

(BASE / 'vystup.txt').write_text('\n'.join(OUT) + '\n', encoding='utf-8')

# --- grafy ------------------------------------------------------------------------
SRC = ('Kancelář prezidenta republiky, seznamy vyznamenaných na hrad.cz (stav k 27. 10. 2026); '
       'rozdělení podle oborů a pohlaví DataTimes.cz')
DATA.mkdir(exist_ok=True)

def save(name, spec):
    spec = {'$schema': 'https://vega.github.io/schema/vega-lite/v5.json', **spec}
    spec.setdefault('config', {'view': {'stroke': None}})
    (DATA / name).write_text(json.dumps(spec, ensure_ascii=False, indent=1), encoding='utf-8')

ALL_YEARS = [str(y) for y in range(1995, 2026)]
rok_vals = [{'rok': y, 'počet': roky.get(y, 0), 'prezident': PREZ_LABEL[prezident(y)]} for y in ALL_YEARS]
pcolor = {'field': 'prezident', 'type': 'nominal', 'title': None,
          'scale': {'domain': [PREZ_LABEL[p] for p in PREZ], 'range': [PREZ_COLOR[p] for p in PREZ]},
          'legend': {'orient': 'top', 'direction': 'horizontal', 'symbolType': 'square'}}
save('graf_roky.json', {
    'title': {'text': 'Klaus vyznamenával nejméně, Havel a Pavel nejvíc',
              'subtitle': 'Počet státních vyznamenání v daném roce (všechny čtyři druhy, včetně in memoriam a zahraničních státníků). '
                          'Ročník 2020 se kvůli covidu nepředával, Hrad ho vede pod rokem 2021.'},
    '_source': SRC, '_toggle_legend': True,
    'width': 'container', 'height': 300,
    'data': {'values': rok_vals},
    'mark': {'type': 'bar', 'width': {'band': 0.78}},
    'encoding': {
        'x': {'field': 'rok', 'type': 'ordinal', 'title': None, 'sort': ALL_YEARS,
              'axis': {'labelAngle': 0, 'ticks': False,
                       'labelExpr': "(+datum.value) % 5 == 0 ? datum.value : ''"}},
        'y': {'field': 'počet', 'type': 'quantitative', 'title': None,
              'axis': {'gridColor': '#e8e3d2', 'tickMinStep': 20}},
        'color': {**pcolor, 'legend': None},
        'tooltip': [{'field': 'rok', 'title': 'Rok'}, {'field': 'prezident', 'title': 'Prezident'},
                    {'field': 'počet', 'title': 'Vyznamenání'}],
    },
})

# druhy vyznamenání podle prezidentů (100% pruhy)
druh_vals = []
for p in PREZ:
    s = [r for r in R if r['prezident'] == p]
    c = Counter(r['druh'] for r in s)
    for i, d in enumerate(DRUHY):
        druh_vals.append({'prezident': PREZ_LABEL[p], 'druh': d, 'počet': c[d],
                          'podíl': round(c[d] / len(s), 4), 'pořadí': i})
save('graf_druhy.json', {
    'title': {'text': 'Zeman dával Řád T. G. Masaryka třikrát méně často než Havel a Klaus',
              'subtitle': 'Podíl jednotlivých druhů vyznamenání na všech, která prezident udělil, 1995–2025'},
    '_source': SRC, '_toggle_legend': True,
    'width': 'container', 'height': 200,
    'data': {'values': druh_vals},
    'mark': {'type': 'bar', 'height': {'band': 0.7}},
    'encoding': {
        'y': {'field': 'prezident', 'type': 'nominal', 'title': None, 'sort': [PREZ_LABEL[p] for p in PREZ],
              'axis': {'ticks': False, 'domain': False}},
        'x': {'field': 'podíl', 'type': 'quantitative', 'stack': 'normalize', 'title': None,
              'axis': {'format': '.0%', 'gridColor': '#e8e3d2'}},
        'color': {'field': 'druh', 'type': 'nominal', 'title': None,
                  'scale': {'domain': DRUHY, 'range': ['#9f319e', '#6267a3', '#ff934d', '#bcc4df']},
                  'legend': {'orient': 'top', 'direction': 'horizontal', 'columns': 2, 'symbolType': 'square'}},
        'order': {'field': 'pořadí'},
        'tooltip': [{'field': 'prezident', 'title': 'Prezident'}, {'field': 'druh', 'title': 'Vyznamenání'},
                    {'field': 'počet', 'title': 'Počet'}, {'field': 'podíl', 'title': 'Podíl', 'format': '.0%'}],
    },
})

# ženy po letech
save('graf_zeny.json', {
    'title': {'text': f'Za Pavla jsou ženy {{víc než čtvrtinou|{ZENY}}} vyznamenaných, dřív bývaly sedminou',
              'subtitle': 'Podíl žen mezi vyznamenanými osobami v daném roce. Ročník 2020 je kvůli covidu sloučený s rokem 2021.'},
    '_source': SRC, '_toggle_legend': True,
    'width': 'container', 'height': 260,
    'data': {'values': zr_rok},
    'mark': {'type': 'bar', 'width': {'band': 0.78}},
    'encoding': {
        'x': {'field': 'rok', 'type': 'ordinal', 'title': None, 'sort': ALL_YEARS,
              'scale': {'domain': ALL_YEARS},
              'axis': {'labelAngle': 0, 'ticks': False, 'labelExpr': "(+datum.value) % 5 == 0 ? datum.value : ''"}},
        'y': {'field': 'podíl', 'type': 'quantitative', 'title': None,
              'axis': {'format': '.0%', 'gridColor': '#e8e3d2'}, 'scale': {'domain': [0, 0.4]}},
        'color': {**pcolor, 'legend': None},
        'tooltip': [{'field': 'rok', 'title': 'Rok'}, {'field': 'ženy', 'title': 'Žen'},
                    {'field': 'celkem', 'title': 'Vyznamenaných osob'},
                    {'field': 'podíl', 'title': 'Podíl žen', 'format': '.0%'}],
    },
})

# obory podle prezidentů – malé násobky (vodorovné pruhy)
obor_order = [OBORY[o] for o, _ in Counter(r['obor'] for r in R).most_common()]
save('graf_obory.json', {
    'title': {'text': 'Klaus vyznamenával disidenty, Zeman podnikatele',
              'subtitle': 'Podíl oblastí, za které lidé vyznamenání dostali, ze všech vyznamenání daného prezidenta, 1995–2025. Oblast určila redakce podle životopisu vyznamenaného.'},
    '_source': SRC,
    '_toggle_legend': True,
    'width': 'container', 'height': 46 * len(obor_order),
    'data': {'values': obor_rows},
    'mark': {'type': 'bar', 'height': {'band': 0.85}},
    'encoding': {
        'y': {'field': 'obor', 'type': 'nominal', 'title': None, 'sort': obor_order,
              'axis': {'ticks': False, 'domain': False, 'labelLimit': 230}},
        'yOffset': {'field': 'prezident', 'sort': [PREZ_LABEL[p] for p in PREZ]},
        'x': {'field': 'podíl', 'type': 'quantitative', 'title': None,
              'axis': {'format': '.0%', 'gridColor': '#e8e3d2'}},
        'color': {'field': 'prezident', 'type': 'nominal', 'title': None,
                  'scale': {'domain': [PREZ_LABEL[p] for p in PREZ], 'range': [PREZ_COLOR[p] for p in PREZ]},
                  'legend': None},
        'tooltip': [{'field': 'prezident', 'title': 'Prezident'}, {'field': 'obor', 'title': 'Oblast'},
                    {'field': 'počet', 'title': 'Vyznamenání'}, {'field': 'podíl', 'title': 'Podíl', 'format': '.0%'}],
    },
})
# řády podle oborů
rad_rows = []
for p in PREZ:
    s_ = [r for r in R if r['prezident'] == p and r['druh'].startswith('Řád')]
    c = Counter(r['obor'] for r in s_)
    for o, n in c.items():
        rad_rows.append({'prezident': PREZ_LABEL[p], 'obor': OBORY[o], 'počet': n,
                         'podíl': round(n / len(s_), 4), 'celkem': len(s_)})
rad_order = [OBORY[o] for o, _ in Counter(r['obor'] for r in R if r['druh'].startswith('Řád')).most_common()]
save('graf_rady.json', {
    'title': {'text': 'Klaus dával řády politickým vězňům, Zeman zahraničním státníkům',
              'subtitle': 'Za co prezident udělil Řád Bílého lva nebo Řád T. G. Masaryka, podíl ze všech jeho řádů, 1995–2025. Oblast určila redakce podle životopisu vyznamenaného.'},
    '_source': SRC, '_toggle_legend': True,
    'width': 'container', 'height': 46 * len(rad_order),
    'data': {'values': rad_rows},
    'mark': {'type': 'bar', 'height': {'band': 0.85}},
    'encoding': {
        'y': {'field': 'obor', 'type': 'nominal', 'title': None, 'sort': rad_order,
              'axis': {'ticks': False, 'domain': False, 'labelLimit': 230}},
        'yOffset': {'field': 'prezident', 'sort': [PREZ_LABEL[p] for p in PREZ]},
        'x': {'field': 'podíl', 'type': 'quantitative', 'title': None, 'axis': {'format': '.0%', 'gridColor': '#e8e3d2'}},
        'color': {'field': 'prezident', 'type': 'nominal', 'title': None, 'legend': None,
                  'scale': {'domain': [PREZ_LABEL[p] for p in PREZ], 'range': [PREZ_COLOR[p] for p in PREZ]}},
        'tooltip': [{'field': 'prezident', 'title': 'Prezident'}, {'field': 'obor', 'title': 'Oblast'},
                    {'field': 'počet', 'title': 'Řádů'}, {'field': 'podíl', 'title': 'Podíl', 'format': '.0%'}],
    },
})
print('grafy uloženy do', DATA)

# body pro motiv coveru (medaile z teček, ženy oranžově)
(BASE.parent / '_cover_pipeline' / 'tecky.json').write_text(
    json.dumps([[r['rok'], r['pohlavi']] for r in R], ensure_ascii=False), encoding='utf-8')
