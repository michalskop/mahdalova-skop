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
import locale, csv, json, re, sys
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
    'media': 'žurnalistika',
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

# Ročník 2020: Zeman ho ohlásil 28. 10. 2020, kvůli covidu se nepředával a Hrad ho vede pod rokem 2021
# (předáno spolu s ročníkem 2021 dne 7. 3. 2022). Rozdělujeme podle seznamu ohlášeného 28. 10. 2020
# (e15: https://www.e15.cz/domaci/prezident-zeman-vyznamenal-romana-prymulu-nebo-karla-gotta-1374611);
# Pavlu Rychetskému Zeman ohlášený Řád T. G. Masaryka neudělil, v seznamu Hradu není.
ROCNIK_2020 = ['Karel Gott', 'Miloslav Masopust', 'František Chábera', 'Josef Koukal', 'Heliodor Píka',
               'Roman Prymula', 'Jana Březinová', 'Petr Láng', 'Petr Lang', 'Vladimír Šupa', 'Petr Šnajdárek',
               'Daniel Miklós', 'Martin Vondrášek', 'Jiří Běhounek', 'Peter Weiss', 'Karel Brückner', 'Jaroslav Falta',
               'Václav Nedomanský', 'Karel Fiala', 'Josef Dvořák', 'Pavel Trávníček', 'Jožka Černý', 'Josef Černý', 'Jožka Šmukař', 'Josef Šmukař',
               'Alena Štěpánková Veselá', 'Eva Erbenová', 'Václav Fanta', 'Eduard Stehlík', 'Petr Čornej',
               'Petr Nováček', 'František Hezoučký', 'Jan Rýdl', 'Vladimír Dohnal', 'Radim Uzel', 'Jiří Jelínek',
               'Jaroslav Matýs', 'Tan Trinh', 'Jiří Ošecký', 'Tomáš Cihlář']
presunuto = []
for r in rows:
    if r['rok'] == '2021' and r['jmeno'].strip(' ,') in ROCNIK_2020:
        r['rok'] = '2020'; presunuto.append(r['jmeno'].strip(' ,'))
say(f'Ročník 2020 vrácen z roku 2021: {len(presunuto)} vyznamenání; nenalezeno:',
    sorted(set(ROCNIK_2020) - set(presunuto)))

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
# Ročníky = roky, za které prezident vyznamenání oznámil. Za Zemana 10 (2013–2022), včetně ročníku 2020.
ceremonie = {'Havel': 8, 'Klaus': 10, 'Zeman': 10, 'Pavel': 3}
say('Ročníky:', ceremonie)

def pct(a, b):
    return f'{100 * a / b:.0f} %' if b else '–'

TITULY = re.compile(r'^((prof|doc|Ing|MUDr|JUDr|PhDr|RNDr|Mgr|MgA|PaedDr|ThDr|Bc|pplk|plk|gen|genmjr|brig|v\.\s?v|i\.\s?m|arm|Mons|R\.P)\.?\s*)+')

OPRAVY_JMEN = {'Danuška Němcová': 'Dana Němcová'}  # překlepy v seznamu Hradu

def cisty(jmeno):
    jm = TITULY.sub('', jmeno).strip()
    jm = OPRAVY_JMEN.get(jm, jm)
    return re.sub(r',?\s*(CSc|DrSc|Ph\.D|MBA|PhD|Th\.D)\.?\s*$', '', jm).strip(' ,')

def jmena(lide):
    """Seznam jmen do tooltipu: do 6 jmen pod sebou, do 40 ve dvou sloupcích s rokem, víc ve třech bez roku."""
    if len(lide) > 40:
        j = sorted(f"{cisty(r['jmeno'])}{' (in memoriam)' if r['in_memoriam'] == '1' else ''}" for r in lide)
        k = 3
    else:
        j = sorted(f"{cisty(r['jmeno'])} ({r['rok']}{', in memoriam' if r['in_memoriam'] == '1' else ''})" for r in lide)
        k = 1 if len(j) <= 6 else 2
    n = (len(j) + k - 1) // k
    sl = [j[i * n:(i + 1) * n] for i in range(k)]
    return chr(10).join(chr(9).join(c[i] if i < len(c) else '' for c in sl) for i in range(n))

def jmena_mz(lide, rok=True):
    """Jména pro panel po kliknutí: oddíl Ženy a oddíl Muži (řádek „## …“ = nadpis oddílu)."""
    def fmt(r):
        im = r['in_memoriam'] == '1'
        if rok:
            return f"{cisty(r['jmeno'])} ({r['rok']}{', in memoriam' if im else ''})"
        return f"{cisty(r['jmeno'])}{' (in memoriam)' if im else ''}"
    z = [fmt(r) for r in lide if r['pohlavi'] == 'Z']
    m = [fmt(r) for r in lide if r['pohlavi'] != 'Z']
    out = []
    if z:
        out += [f'## Ženy ({len(z)})'] + z
    if m:
        out += [f'## Muži ({len(m)})'] + m
    return chr(10).join(out)

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
                   'podíl': round(z / len(s), 4) if s else 0})
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
                          'podíl': round(n / len(s), 4), 'celkem': len(s),
                          '_lide': [r for r in s if r['obor'] == o]})
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
                          'Ročník 2020 Zeman ohlásil, kvůli covidu ho ale předal až v březnu 2022 spolu s ročníkem 2021.'},
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
# ženy po letech – piktogramy: 20 postav na ročník, 1 postava = 5 % vyznamenaných, ženy dole
ZENA_DARK = '#06677d'  # brandTeal.7 – čitelný text procent žen
ZENA_TEAL, MUZ_AMETYST = '#33b9d9', '#522a7a'  # brandTeal.4, brandAmethyst.8 (Kateřina 27. 10. 2026)
MUZ_SHAPE = 'M0,-1 A0.3,0.3 0 1 1 0,-0.4 A0.3,0.3 0 1 1 0,-1 Z M-0.8,1 L-0.8,0 Q-0.8,-0.32 -0.45,-0.32 L0.45,-0.32 Q0.8,-0.32 0.8,0 L0.8,1 Z'
ZENA_SHAPE = 'M0,-1 A0.3,0.3 0 1 1 0,-0.4 A0.3,0.3 0 1 1 0,-1 Z M-0.35,-0.32 L0.35,-0.32 L0.95,0.7 L0.3,0.7 L0.3,1 L-0.3,1 L-0.3,0.7 L-0.95,0.7 Z'
ikony = []
for x in zr_rok:
    zen = round(x['podíl'] * 20)
    for i in range(20):
        ikony.append({'rok': x['rok'], 'i': i, 'pohlaví': 'žena' if i < zen else 'muž',
                      'ženy': x['ženy'], 'celkem': x['celkem'], 'podíl': x['podíl'], 'prezident': x['prezident']})
hranice = [{'rok': '2003'}, {'rok': '2013'}, {'rok': '2023'}]
jmena_prez = [{'rok': '1998', 'p': 'Havel'}, {'rok': '2007', 'p': 'Klaus'}, {'rok': '2017', 'p': 'Zeman'}, {'rok': '2024', 'p': 'Pavel'}]
X = {'field': 'rok', 'type': 'ordinal', 'title': None, 'sort': ALL_YEARS, 'scale': {'domain': ALL_YEARS, 'paddingInner': 0.08},
     'axis': {'labelAngle': 0, 'ticks': False, 'domain': False, 'labelExpr': "(+datum.value) % 5 == 0 ? datum.value : ''"}}
# pyramida: nahoře nejnovější ročník (Pavel), dole Havel; ženy vlevo, muži vpravo (jako pruh v panelu)
sloupce = []
for x in zr_rok:
    muzi = x['celkem'] - x['ženy']
    for poh, v0, v1, n in (('žena', -x['ženy'], 0, x['ženy']), ('muž', 0, muzi, muzi)):
        sloupce.append({'rok': x['rok'], 'pohlaví': poh, 'x0': v0, 'x1': v1, 'počet': n, 'ženy': x['ženy'],
                        'muži': muzi, 'celkem': x['celkem'], 'podíl': x['podíl']})
max_m = max(x['celkem'] - x['ženy'] for x in zr_rok)
max_z = max(x['ženy'] for x in zr_rok)
DOM = [-(max_z + 6), max_m + 30]  # vpravo volný pruh pro jména prezidentů
Ypy = {'field': 'rok', 'type': 'ordinal', 'title': None, 'sort': ALL_YEARS[::-1], 'scale': {'domain': ALL_YEARS[::-1], 'paddingInner': 0.18},
       'axis': {'ticks': False, 'domain': False, 'labelFontSize': 10.5, 'labelPadding': 4}}
Xpy = {'type': 'quantitative', 'title': None, 'scale': {'domain': DOM},
       'axis': {'gridColor': '#e8e3d2', 'values': [-20, 0, 20, 40, 60, 80], 'labelExpr': 'abs(datum.value)',
                'domain': False, 'ticks': False, 'orient': 'top'}}
H_Z = 31 * 17
prez_zacatky = [{'rok': '2002', 'p': 'Havel'}, {'rok': '2012', 'p': 'Klaus'}, {'rok': '2022', 'p': 'Zeman'}, {'rok': '2025', 'p': 'Pavel'}]
hranice_py = [{'rok': '2002'}, {'rok': '2012'}, {'rok': '2022'}]
save('graf_zeny.json', {
    'title': {'text': f'Vyznamenání dostávají hlavně {{muži|{MUZ_AMETYST}}}. Za Pavla je {{žen|{ZENA_TEAL}}} víc, zhruba čtvrtina',
              'subtitle': 'Počet vyznamenaných v daném ročníku: tyrkysově ženy vlevo, fialově muži vpravo. '
                          'Kliknutím na řádek zobrazíte jména.'},
    '_source': SRC,
    '_click_detail': {'field': 'jména', 'key': 'rok', 'title': ['rok'],
                      'items': {y: jmena_mz([r for r in R if r['rok'] == y and r['pohlavi'] in 'ZM'], rok=False) for y in sorted(roky)},
                      'rows': [{'field': 'celkem', 'label': 'Vyznamenáno celkem'}],
                      'split': [{'field': 'ženy', 'label': 'Ženy', 'color': ZENA_TEAL},
                                {'field': 'muži', 'label': 'Muži', 'color': MUZ_AMETYST}]},
    'width': 'container', 'height': H_Z,
    'layer': [
        {'data': {'values': sloupce},
         'mark': {'type': 'bar'},
         'encoding': {
             'y': Ypy, 'x': {**Xpy, 'field': 'x0'}, 'x2': {'field': 'x1'},
             'color': {'field': 'pohlaví', 'type': 'nominal', 'legend': None,
                       'scale': {'domain': ['žena', 'muž'], 'range': [ZENA_TEAL, MUZ_AMETYST]}},
             'tooltip': [{'field': 'rok', 'title': 'Ročník'}, {'field': 'podíl', 'title': 'Podíl žen', 'format': '.0%'},
                         {'field': 'ženy', 'title': 'Žen'}, {'field': 'muži', 'title': 'Mužů'},
                         {'field': 'celkem', 'title': 'Vyznamenaných osob'}]}},
        # osa uprostřed pyramidy (posunutá podle počtů)
        {'data': {'values': [{'x': 0}]},
         'mark': {'type': 'rule', 'color': '#101432', 'strokeWidth': 1.5},
         'encoding': {'x': {'field': 'x', 'type': 'quantitative', 'scale': {'domain': DOM}}}},
        # předěly prezidentů
        {'data': {'values': hranice_py},
         'mark': {'type': 'rule', 'color': '#de1743', 'strokeDash': [5, 3], 'strokeWidth': 2},
         'encoding': {'y': {**Ypy, 'bandPosition': 0}, 'x': {'value': 0}, 'x2': {'value': 'width'}}},
        {'data': {'values': prez_zacatky},
         'mark': {'type': 'text', 'align': 'right', 'baseline': 'top', 'dx': -2, 'dy': 3, 'fontSize': 13,
                  'fontWeight': 'bold', 'color': '#101432'},
         'encoding': {'y': {**Ypy, 'bandPosition': 0}, 'x': {'value': 'width'}, 'text': {'field': 'p'}}},
        # popisky od nulové osy: ženy doleva, muži doprava
        {'data': {'values': [{'x': 0, 't': '← ženy'}]},
         'mark': {'type': 'text', 'baseline': 'bottom', 'align': 'right', 'dx': -6, 'dy': -22, 'fontSize': 12,
                  'fontWeight': 'bold', 'color': ZENA_DARK},
         'encoding': {'x': {'field': 'x', 'type': 'quantitative', 'scale': {'domain': DOM}}, 'y': {'value': 0},
                      'text': {'field': 't'}}},
        {'data': {'values': [{'x': 0, 't': 'muži →'}]},
         'mark': {'type': 'text', 'baseline': 'bottom', 'align': 'left', 'dx': 6, 'dy': -22, 'fontSize': 12,
                  'fontWeight': 'bold', 'color': MUZ_AMETYST},
         'encoding': {'x': {'field': 'x', 'type': 'quantitative', 'scale': {'domain': DOM}}, 'y': {'value': 0},
                      'text': {'field': 't'}}},
    ],
})


def dlazdice(rows, order, title, subtitle, pocet_title):
    """Mřížka dlaždic: jedna dlaždice = jedna oblast, v ní čtyři prezidenti jednou barvou, hodnota u pruhu."""
    for r in rows:
        r['p'] = r['prezident'].split()[-1]
    enc_y = {'field': 'p', 'type': 'nominal', 'title': None, 'sort': PREZ,
             'axis': {'ticks': False, 'domain': False, 'labelFontSize': 12, 'labelPadding': 4}}
    tooltip = [{'field': 'prezident', 'title': 'Prezident'}, {'field': 'obor', 'title': 'Oblast'},
               {'field': 'podíl', 'title': 'Podíl (celé působení)', 'format': '.0%'},
               {'field': 'počet', 'title': pocet_title}]
    detail = None
    if any('jména' in r for r in rows):
        for r in rows:
            r['nápověda'] = 'klikněte na pruh'
        tooltip.append({'field': 'nápověda', 'title': 'Seznam jmen'})
        detail = {'field': 'jména', 'title': ['prezident', 'obor'],
                  'rows': [{'field': 'podíl', 'label': 'Podíl (celé působení)', 'format': 'pct'},
                           {'field': 'počet', 'label': pocet_title}]}
    return {
        **({'_click_detail': detail} if detail else {}),
        'title': {'text': title, 'subtitle': subtitle},
        '_source': SRC,
        'data': {'values': rows},
        'facet': {'field': 'obor', 'type': 'nominal', 'title': None, 'sort': order,
                  'header': {'labelFontSize': 13, 'labelFontWeight': 'bold', 'labelAnchor': 'start',
                             'labelLimit': 220, 'labelColor': '#101432'}},
        'columns': 2,
        'spacing': {'row': 12, 'column': 16},
        'spec': {
            'width': 150, 'height': 72,
            'layer': [
                {'mark': {'type': 'bar', 'color': '#4c4f8e', 'height': {'band': 0.72}, 'cornerRadiusEnd': 2},
                 'encoding': {'y': enc_y,
                              'x': {'field': 'podíl', 'type': 'quantitative', 'title': None, 'axis': None,
                                    'scale': {'domain': [0, max(r['podíl'] for r in rows)]}},
                              'tooltip': tooltip}},
                {'mark': {'type': 'text', 'align': 'left', 'dx': 3, 'fontSize': 11, 'color': '#101432'},
                 'encoding': {'y': enc_y, 'x': {'field': 'podíl', 'type': 'quantitative'},
                              'text': {'field': 'podíl', 'format': '.0%'}, 'tooltip': tooltip}},
            ],
        },
        'resolve': {'axis': {'y': 'independent'}},
    }


def piktogramy(rows_src, order, title, subtitle, pocet_title, dlazdic=None):
    """Mřížka malých pyramid, jedna na oblast: řádky = prezidenti (nahoře Pavel), ženy vlevo, muži vpravo
    od společné nulové osy. Délka = podíl ze všech vyznamenání (řádů) daného prezidenta, aby šli srovnat
    prezidenti s různě dlouhým působením. Klik na řádek otevře panel se jmény zvlášť žen a mužů."""
    if dlazdic:  # menší oblasti do jedné dlaždice „ostatní“
        hlavni = order[:dlazdic - 1]
        nazev = lambda r: OBORY[r['obor']] if OBORY[r['obor']] in hlavni else 'ostatní'
        order = hlavni + ['ostatní']
    else:
        nazev = lambda r: OBORY[r['obor']]
    # dlaždice podle abecedy (české řazení), „nezjištěno“ a „ostatní“ na konec
    try:
        locale.setlocale(locale.LC_COLLATE, 'cs_CZ.UTF-8')
    except locale.Error:
        try:
            locale.setlocale(locale.LC_COLLATE, 'Czech_Czechia.1250')
        except locale.Error:
            pass
    konec = [o for o in ('nezjištěno', 'ostatní') if o in order]
    order = sorted([o for o in order if o not in konec], key=locale.strxfrm) + konec
    data, items = [], {}
    for p in PREZ:
        vse = [r for r in rows_src if r['prezident'] == p]
        for o in order:
            lide = [r for r in vse if nazev(r) == o]
            zen = sum(r['pohlavi'] == 'Z' for r in lide)
            key = f'{p}|{o}'
            if lide:
                items[key] = jmena_mz(lide)
            spol = {'key': key, 'p': p, 'prezident': PREZ_LABEL[p], 'obor': o, 'počet': len(lide), 'ženy': zen,
                    'muži': len(lide) - zen, 'podíl_žen': round(zen / len(lide), 4) if lide else 0,
                    'nápověda': 'klikněte na řádek'}
            data.append({**spol, 'pohlaví': 'žena', 'x0': -zen / len(vse), 'x1': 0})
            data.append({**spol, 'pohlaví': 'muž', 'x0': 0, 'x1': (len(lide) - zen) / len(vse)})
    lo = min(d['x0'] for d in data) * 1.12
    hi = max(d['x1'] for d in data) * 1.05
    DOMt = [lo, hi]
    Yt = {'field': 'p', 'type': 'nominal', 'title': None, 'sort': PREZ[::-1], 'scale': {'paddingInner': 0.22},
          'axis': {'ticks': False, 'domain': False, 'labelFontSize': 10, 'labelPadding': 3}}
    Xt = {'type': 'quantitative', 'title': None, 'scale': {'domain': DOMt},
          'axis': {'format': '.0%', 'labelExpr': "replace(format(abs(datum.value), '.0%'), '%', ' %')",
                   'tickCount': 4, 'gridColor': '#e8e3d2', 'domain': False, 'ticks': False, 'labelFontSize': 9}}
    tooltip = [{'field': 'prezident', 'title': 'Prezident'}, {'field': 'obor', 'title': 'Oblast'},
               {'field': 'počet', 'title': 'Uděleno celkem'}, {'field': 'ženy', 'title': 'Z toho žen'},
               {'field': 'podíl_žen', 'title': 'Podíl žen v kategorii', 'format': '.0%'},
               {'field': 'nápověda', 'title': 'Seznam jmen'}]
    return {
        'title': {'text': title, 'subtitle': subtitle},
        '_source': SRC,
        '_click_detail': {'field': 'jména', 'key': 'key', 'items': items, 'title': ['prezident', 'obor'],
                          'rows': [{'field': 'počet', 'label': 'Uděleno celkem'}, {'field': 'ženy', 'label': 'Z toho žen'},
                                   {'field': 'podíl_žen', 'label': 'Podíl žen v kategorii', 'format': 'pct'}],
                          'split': [{'field': 'ženy', 'label': 'Ženy', 'color': ZENA_TEAL},
                                    {'field': 'muži', 'label': 'Muži', 'color': MUZ_AMETYST}]},
        'data': {'values': data},
        'facet': {'field': 'obor', 'type': 'nominal', 'title': None, 'sort': order,
                  'header': {'labelFontSize': 12.5, 'labelFontWeight': 'bold', 'labelAnchor': 'start', 'labelPadding': 4,
                             'labelLimit': 190, 'labelColor': '#101432'}},
        'columns': 3,
        '_facet_fill': {'label': 37, 'narrowColumns': 2},
        'spacing': {'row': 22, 'column': 16},
        'resolve': {'axis': {'y': 'independent', 'x': 'independent'}},
        'spec': {
            'width': 182, 'height': 84,
            'layer': [
                {'mark': {'type': 'bar'},
                 'encoding': {'y': Yt, 'x': {**Xt, 'field': 'x0'}, 'x2': {'field': 'x1'},
                              'color': {'field': 'pohlaví', 'type': 'nominal', 'legend': None,
                                        'scale': {'domain': ['žena', 'muž'], 'range': [ZENA_TEAL, MUZ_AMETYST]}},
                              'tooltip': tooltip}},
                {'mark': {'type': 'rule', 'color': '#101432', 'strokeWidth': 1.2},
                 'encoding': {'x': {'datum': 0, 'type': 'quantitative', 'scale': {'domain': DOMt}}}},
            ],
        },
    }

# obory podle prezidentů – malé násobky (vodorovné pruhy)
obor_order = [OBORY[o] for o, _ in Counter(r['obor'] for r in R).most_common()]
for r in obor_rows:
    r['jména'] = jmena(r.pop('_lide'))
save('graf_obory.json', piktogramy(
    R, obor_order, 'Klaus vyznamenával disidenty, Zeman podnikatele',
    'Za co prezident vyznamenával: podíl oblasti na všech jeho vyznamenáních 1995–2025, tyrkysově ženy vlevo, fialově muži vpravo. '
    'Oblast určila redakce podle životopisu vyznamenaného. Kliknutím na řádek zobrazíte jména.', 'Vyznamenání'))
# řády podle oborů – jména v panelu po kliknutí
def obdobi(r):
    """Funkční období, ve kterém prezident vyznamenání udělil (podle roku 28. října)."""
    y = int(r['rok'])
    return {'Havel': '1. období' if y <= 1997 else '2. období',
            'Klaus': '1. období' if y <= 2007 else '2. období',
            'Zeman': '1. období' if y <= 2017 else '2. období',
            'Pavel': '1. období'}[r['prezident']]

RADY = [r for r in R if r['druh'].startswith('Řád')]
rad_rows = []
for p in PREZ:
    s_ = [r for r in RADY if r['prezident'] == p]
    for o in sorted({r['obor'] for r in s_}):
        lide = [r for r in s_ if r['obor'] == o]
        rad_rows.append({'prezident': PREZ_LABEL[p], 'obor': OBORY[o], 'počet': len(lide),
                         'podíl': round(len(lide) / len(s_), 4), 'celkem': len(s_), 'jména': jmena(lide)})
rad_order = [OBORY[o] for o, _ in Counter(r['obor'] for r in RADY).most_common()]
PREZ_SCALE = {'domain': [PREZ_LABEL[p] for p in PREZ], 'range': [PREZ_COLOR[p] for p in PREZ]}
save('graf_rady.json', piktogramy(
    RADY, rad_order, 'Klaus dával řády politickým vězňům, Zeman zahraničním státníkům',
    'Za co prezident udělil Řád Bílého lva nebo Řád T. G. Masaryka: podíl ze všech jeho řádů 1995–2025, '
    'tyrkysově ženy vlevo, fialově muži vpravo. Kliknutím na řádek zobrazíte jména.', 'Řádů', dlazdic=8))

# varianta: počty řádů podle funkčních období (sloupce, 1. a 2. období přes sebe)
say(chr(10) + '## Řády podle funkčních období')
ob_rows = []
for p in PREZ:
    for ob in ['1. období', '2. období']:
        s_ = [r for r in RADY if r['prezident'] == p and obdobi(r) == ob]
        if not s_:
            continue
        say(f"{p} {ob}: {len(s_)} řádů; " + '; '.join(f'{OBORY[o]} {n}' for o, n in Counter(r['obor'] for r in s_).most_common()))
        for o in sorted({r['obor'] for r in s_}):
            lide = [r for r in s_ if r['obor'] == o]
            ob_rows.append({'prezident': PREZ_LABEL[p], 'období': ob, 'obor': OBORY[o], 'počet': len(lide),
                            '_lide': lide})
top_obory = rad_order[:6]
slouceno = {}
for r in ob_rows:
    o = r['obor'] if r['obor'] in top_obory else 'ostatní'
    k = (r['prezident'], r['období'], o)
    if k in slouceno:
        slouceno[k]['počet'] += r['počet']
        slouceno[k]['_lide'] += r['_lide']
    else:
        slouceno[k] = {**r, 'obor': o}
ob_rows = []
for v in slouceno.values():
    v['jména'] = jmena(v.pop('_lide'))
    ob_rows.append(v)
for r in ob_rows:
    r['nápověda'] = 'klikněte na sloupec'
save('graf_rady_obdobi.json', {
    '_click_detail': {'field': 'jména', 'title': ['prezident', 'období', 'obor'],
                      'rows': [{'field': 'počet', 'label': 'Řádů'}]},
    'title': {'text': 'Klaus dával řády politickým vězňům, Zeman zahraničním státníkům',
              'subtitle': 'Počet řádů Bílého lva a T. G. Masaryka podle oblasti a funkčního období, 1995–2025. '
                          'Plná barva = první funkční období, světlejší = druhé. Pavlovi běží první období.'},
    '_source': SRC, '_toggle_legend': True,
    'width': 'container', 'height': 300,
    'data': {'values': ob_rows},
    'mark': {'type': 'bar', 'width': {'band': 0.9}, 'stroke': '#f8f6f0', 'strokeWidth': 0.5},
    'encoding': {
        'x': {'field': 'obor', 'type': 'nominal', 'title': None, 'sort': top_obory + ['ostatní'],
              'axis': {'labelAngle': 0, 'ticks': False, 'labelLimit': 110, 'labelExpr': "split(datum.label, ' ')"}},
        'xOffset': {'field': 'prezident', 'sort': [PREZ_LABEL[p] for p in PREZ]},
        'y': {'field': 'počet', 'type': 'quantitative', 'title': None, 'stack': 'zero',
              'axis': {'gridColor': '#e8e3d2', 'tickMinStep': 5}},
        'color': {'field': 'prezident', 'type': 'nominal', 'title': None, 'legend': None, 'scale': PREZ_SCALE},
        'opacity': {'field': 'období', 'type': 'nominal', 'legend': None,
                    'scale': {'domain': ['1. období', '2. období'], 'range': [1, 0.45]}},
        'order': {'field': 'období'},
        'tooltip': [{'field': 'prezident', 'title': 'Prezident'}, {'field': 'období', 'title': 'Funkční období'},
                    {'field': 'obor', 'title': 'Oblast'}, {'field': 'počet', 'title': 'Řádů'},
                    {'field': 'nápověda', 'title': 'Seznam jmen'}],
    },
})
print('grafy uloženy do', DATA)

# body pro motiv coveru (medaile z teček, ženy oranžově)
(BASE.parent / '_cover_pipeline' / 'tecky.json').write_text(
    json.dumps([[r['rok'], r['pohlavi']] for r in R], ensure_ascii=False), encoding='utf-8')
