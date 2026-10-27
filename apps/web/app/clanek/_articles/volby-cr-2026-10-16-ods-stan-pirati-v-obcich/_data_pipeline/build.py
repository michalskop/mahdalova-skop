"""Data k článku volby-cr-2026-10-16-ods-stan-pirati-v-obcich.

Otázka: kolik zastupitelů měly opoziční strany – ODS, KDU-ČSL a TOP 09 (koalice SPOLU ve Sněmovně),
STAN, Piráti a Zelení – v obcích a městských částech před volbami 2026, kde letos postavily kandidáty
a kolik jich mají teď. Navazuje na článek volby-cr-2026-10-14-spd-ano-motoriste-v-obcich, metoda je stejná.

Zdroj: otevřená data ČSÚ (volby.gov.cz/opendata)
- KV2022reg20260328_csv.zip – registry kandidátů a mandátů, řádné volby 2022
  a všechny pozdější nové, dodatečné a opakované volby do 28. 3. 2026
- KV2026reg20261011_csv.zip – totéž pro volby 9.–10. 10. 2026 (stav 11. 10.)
- KV2026ciselniky20261011_csv.zip – číselník krajů, okresů a stran

Metoda (popsaná i v článku):
- Zastupitel strany = zvolený kandidát, kterého strana navrhla (sloupec NSTRANA),
  bez ohledu na to, na jaké kandidátce stál (vlastní, koalice, sdružení s nezávislými).
  U koalice SPOLU tak každého zvoleného přiřadíme té ze tří stran, která ho navrhla.
- Výchozí stav = poslední volby do každého zastupitelstva před rokem 2026, tedy
  řádné volby 2022, kde se pak konaly nové nebo dodatečné volby, platí ty.
- Ambice 2026 = počet kandidátů, které strana letos navrhla.
- Obec i městská část (obvod) jsou samostatná zastupitelstva, v součtech se počítají obě.

Spuštění: python build.py  → stáhne data do .cache/, zapíše ../data/*.json, ../obce-strany.json,
zastupitelstva.csv a vypíše čísla pro text.
"""
import csv
import io
import json
import sys
import urllib.request
import zipfile
from collections import defaultdict
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

HERE = Path(__file__).parent
ART = HERE.parent
CACHE = HERE / '.cache'
OUT = ART / 'data'
for d in (CACHE, OUT):
    d.mkdir(exist_ok=True)

BASE = 'https://volby.gov.cz/opendata/'
ZIPS = {
    'reg22': 'kv2022/KV2022reg20260328_csv.zip',
    'reg26': 'kv2026/KV2026reg20261011_csv.zip',
    'cis26': 'kv2026/KV2026ciselniky20261011_csv.zip',
}
# názvy obcí, okresy a počet obyvatel 2026 – z mapy obcí v článku o politické konkurenci
OBCE_INFO = ART.parent / 'volby-cr-2026-09-24-mista-kde-neexistuje-politicka-konkurence' / 'obce-data.json'

# kódy navrhujících stran (NSTRANA) z číselníku cpp.csv
STRANY = {'ods': '53', 'kdu': '1', 'top': '721', 'stan': '166', 'pir': '720', 'zel': '5'}
NAZVY = {'ods': 'ODS', 'kdu': 'KDU-ČSL', 'top': 'TOP 09', 'stan': 'STAN', 'pir': 'Piráti', 'zel': 'Zelení',
         'spolu': 'ODS, KDU-ČSL a TOP 09'}
# tři strany sněmovní koalice SPOLU dohromady – jen pro souhrny, v mapě a grafech každá zvlášť
SLOUCENE = {'spolu': ('ods', 'kdu', 'top')}
MAPA = ['ods', 'kdu', 'top', 'stan', 'pir', 'zel']   # strany v mapě a souhrnných grafech
VSE = [*STRANY, *SLOUCENE]                           # všechny výpočty a výpisy


def fetch(key):
    path = CACHE / Path(ZIPS[key]).name
    if not path.exists():
        urllib.request.urlretrieve(BASE + ZIPS[key], path)
    return zipfile.ZipFile(path)


def table(key, name):
    with fetch(key).open(f'csv_od/{name}') as f:
        return list(csv.DictReader(io.TextIOWrapper(f, encoding='utf-8')))


def fmt(n, d=0):
    return f'{n:,.{d}f}'.replace(',', ' ').replace('.', ',')


def dump(name, obj, path=OUT):
    (path / name).write_text(json.dumps(obj, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')


# ═══ Zastupitelstva ══════════════════════════════════════════════════════
nuts = {r['NUMNUTS']: r['NAZEVNUTS'] for r in table('cis26', 'cnumnuts.csv')}
# nadřízené zastupitelstvo: městská část → město (kvrzcoco má u měst řádek za každou část obce)
nadr = {r['KODZASTUP']: r['NADRZASTUP'] for r in table('cis26', 'kvcoco.csv')}

zast22_all = table('reg22', 'kvrzcoco.csv')
posledni = {}   # KODZASTUP -> DATUMVOLEB posledních voleb před 2026
for r in zast22_all:
    if r['DATUMVOLEB'] > posledni.get(r['KODZASTUP'], ''):
        posledni[r['KODZASTUP']] = r['DATUMVOLEB']
zast22 = {r['KODZASTUP']: r for r in zast22_all if r['DATUMVOLEB'] == posledni[r['KODZASTUP']]}
zast26 = {r['KODZASTUP']: r for r in table('reg26', 'kvrzcoco.csv')}
print(f'Zastupitelstva: 2022 {len(zast22)}, 2026 {len(zast26)}; '
      f's pozdějšími volbami {sum(1 for d in posledni.values() if d != "20220923")}')


# ═══ Kandidáti a mandáty podle navrhující strany ═════════════════════════
def pocty(rows, datum=None):
    """(KODZASTUP, strana) -> [kandidátů, mandátů]"""
    out = defaultdict(lambda: [0, 0])
    kod2key = {v: k for k, v in STRANY.items()}
    for r in rows:
        if datum and r['DATUMVOLEB'] != datum[r['KODZASTUP']]:
            continue
        k = kod2key.get(r['NSTRANA'])
        if not k:
            continue
        for kk in [k] + [s for s, cast in SLOUCENE.items() if k in cast]:
            x = out[(r['KODZASTUP'], kk)]
            x[0] += 1
            x[1] += r['MANDAT'] == 'A'
    return out


rk22 = [r for r in table('reg22', 'kvrk.csv') if r['DATUMVOLEB'] == posledni[r['KODZASTUP']]]
rk26 = table('reg26', 'kvrk.csv')
p22 = pocty(rk22)
p26 = pocty(rk26)

kody = sorted(set(zast22) | set(zast26))


def rec(k, s):
    a, b = p22.get((k, s), [0, 0]), p26.get((k, s), [0, 0])
    return {'k22': a[0], 'm22': a[1], 'k26': b[0], 'm26': b[1]}


def kategorie(r):
    """Změna 2022 → 2026 pro jedno zastupitelstvo."""
    if r['m22'] and not r['k26']:
        return 'odesli'   # měli zastupitele, letos nekandidovali
    if r['m22'] and not r['m26']:
        return 'prisli_o_vse'
    if r['m22'] and r['m26'] < r['m22']:
        return 'ubylo'
    if r['m22'] and r['m26'] == r['m22']:
        return 'stejne'
    if r['m22'] and r['m26'] > r['m22']:
        return 'pribylo'
    if r['m26']:
        return 'nove'
    if r['k26']:
        return 'neuspeli'
    if r['k22']:
        return 'vzdali'
    return 'nic'


# ═══ Souhrny ════════════════════════════════════════════════════════════
souhrn = {}
for s in VSE:
    agg = defaultdict(int)
    kat = defaultdict(int)
    kat_m = defaultdict(int)   # mandáty 2022 → 2026 po kategoriích
    for k in kody:
        r = rec(k, s)
        for f in r:
            agg[f] += r[f]
        agg['z_k22'] += r['k22'] > 0
        agg['z_m22'] += r['m22'] > 0
        agg['z_k26'] += r['k26'] > 0
        agg['z_m26'] += r['m26'] > 0
        c = kategorie(r)
        kat[c] += 1
        kat_m[c + '_m22'] += r['m22']
        kat_m[c + '_m26'] += r['m26']
    souhrn[s] = {**agg, 'kat': dict(kat), 'kat_m': dict(kat_m)}

print('\n══ Celá ČR, všechna zastupitelstva obcí a městských částí ══')
for s, a in souhrn.items():
    print(f"\n{NAZVY[s]}:")
    print(f"  zastupitelé {fmt(a['m22'])} → {fmt(a['m26'])} ({a['m26'] - a['m22']:+d}, "
          f"{(a['m26'] / a['m22'] - 1) * 100 if a['m22'] else float('nan'):+.1f} %)")
    print(f"  kandidáti   {fmt(a['k22'])} → {fmt(a['k26'])} ({(a['k26'] / a['k22'] - 1) * 100:+.1f} %)")
    print(f"  zastupitelstva se zastupitelem {fmt(a['z_m22'])} → {fmt(a['z_m26'])}; "
          f"kde kandidovali {fmt(a['z_k22'])} → {fmt(a['z_k26'])}")
    print(f"  úspěšnost: 2022 {a['m22'] / a['k22'] * 100:.1f} %, 2026 {a['m26'] / a['k26'] * 100:.1f} % kandidátů zvoleno")
    print('  kategorie (zastupitelstev):', {c: n for c, n in sorted(a['kat'].items(), key=lambda x: -x[1]) if c != 'nic'})
    print('  zastupitelé v kategoriích 2022→2026:',
          {c: f"{a['kat_m'].get(c + '_m22', 0)}→{a['kat_m'].get(c + '_m26', 0)}"
           for c in ('odesli', 'prisli_o_vse', 'ubylo', 'stejne', 'pribylo', 'nove')})


# ═══ Mapa: obce (TYPZASTUP 1) + součty městských částí ═══════════════════
info = json.loads(OBCE_INFO.read_text(encoding='utf-8'))['obce']


def zast(k):
    return zast26.get(k) or zast22[k]


mc = defaultdict(lambda: defaultdict(lambda: [0, 0, 0, 0]))   # obec -> strana -> součty MČ
casti = defaultdict(list)   # obec -> rozpad po městských částech (pro tabulku pod mapou)
for k in kody:
    z = zast(k)
    if z['TYPZASTUP'] != '2':
        continue
    cast = {'n': z['NAZEVZAST']}
    for s in MAPA:
        r = rec(k, s)
        t = mc[nadr[k]][s]
        t[0] += r['m22']; t[1] += r['k26']; t[2] += r['m26']; t[3] += r['k22']
        if any(r.values()):
            cast[s] = [r['m22'], r['k26'], r['m26'], r['k22']]
    casti[nadr[k]].append(cast)

mapa = {}
for k in kody:
    z = zast(k)
    if z['TYPZASTUP'] != '1':
        continue
    i = info.get(k, {})
    o = {'n': i.get('n') or z['NAZEVZAST'], 'o': i.get('o') or nuts.get(z['OKRES'], ''),
         'p': i.get('p') or int(z['POCOBYV']), 'm': int(z['MANDATY'])}
    for s in MAPA:
        r = rec(k, s)
        # m22, k26, m26, k22
        if any(r.values()):   # nuly vynecháváme, mapa je bere jako výchozí stav
            o[s] = [r['m22'], r['k26'], r['m26'], r['k22']]
        if k in mc and any(mc[k][s]):
            o[s + '_mc'] = mc[k][s]
    if k in casti:
        o['casti'] = sorted(casti[k], key=lambda c: c['n'])
    mapa[k] = o
# Barvy stran z predikce (volby2026.datatimes.cz), stejné jako ve všech volebních mapách
BARVA = {'ODS': '#5e66d5', 'KDU-ČSL': '#ffcf02', 'TOP 09': '#812840', 'STAN': '#ff1a4a', 'Piráti': '#111111',
         'Zelení': '#639e0a'}
dump('obce-strany.json', {'strany': {s: NAZVY[s] for s in MAPA}, 'barvy': {s: BARVA[NAZVY[s]] for s in MAPA},
                          'obce': mapa}, ART)
print(f'\nMapa: {len(mapa)} obcí, {len(mc)} měst s městskými částmi')


# ═══ Velká města a městské části ═══════════════════════════════════════
def radek(k):
    z = zast(k)
    return {'kod': k, 'nazev': z['NAZEVZAST'], 'typ': z['TYPZASTUP'], 'druh': z['DRUHZASTUP'],
            'obec': nadr.get(k) or k, 'kraj': nuts.get(z['KRAJ'], ''), 'okres': nuts.get(z['OKRES'], ''),
            'mandaty': int(z['MANDATY']), 'obyv': int(z['POCOBYV']), **{s: rec(k, s) for s in VSE}}


radky = [radek(k) for k in kody]
# tabulka všech zastupitelstev ke kontrole (není součástí webu)
with open(HERE / 'zastupitelstva.csv', 'w', encoding='utf-8', newline='') as f:
    w = csv.writer(f)
    w.writerow(['kod', 'nazev', 'typ', 'obec', 'kraj', 'mandaty', 'obyv']
               + [f'{s}_{x}' for s in VSE for x in ('k22', 'm22', 'k26', 'm26')])
    for r in radky:
        w.writerow([r[c] for c in ('kod', 'nazev', 'typ', 'obec', 'kraj', 'mandaty', 'obyv')]
                   + [r[s][x] for s in VSE for x in ('k22', 'm22', 'k26', 'm26')])

print('\n══ Statutární města a Praha (zastupitelstvo města): zastupitelé 2022→2026 (kandidáti 2026) ══')
for r in sorted((r for r in radky if r['druh'] in ('3', '4')), key=lambda r: -r['obyv']):
    print(f"  {r['nazev'][:22]:22} " + '  '.join(
        f"{NAZVY[s][:4]} {r[s]['m22']:>2}→{r[s]['m26']:<2}(k{r[s]['k26']:>2})" for s in MAPA))

print('\n══ Praha a Brno: město + městské části ══')
for kod, jm in (('554782', 'Praha'), ('582786', 'Brno'), ('554821', 'Ostrava'), ('554791', 'Plzeň')):
    sel = [r for r in radky if r['obec'] == kod]
    mesto = [r for r in sel if r['typ'] == '1']
    cast = [r for r in sel if r['typ'] == '2']
    print(f"  {jm}: " + '  '.join(
        f"{NAZVY[s]} město {sum(r[s]['m22'] for r in mesto)}→{sum(r[s]['m26'] for r in mesto)}, "
        f"části {sum(r[s]['m22'] for r in cast)}→{sum(r[s]['m26'] for r in cast)}" for s in MAPA))


# ═══ Podle velikosti obce ══════════════════════════════════════════════
PASMA = [(0, 500, 'do 500'), (500, 2000, '500–2 000'), (2000, 10000, '2 000–10 000'),
         (10000, 50000, '10 000–50 000'), (50000, 10**8, 'nad 50 000')]
velikost = []
print('\n══ Podle velikosti (obce bez MČ, zastupitelé 2022 → 2026) ══')
for lo, hi, lab in PASMA:
    sel = [r for r in radky if r['typ'] == '1' and lo <= r['obyv'] < hi]
    row = {'pasmo': lab, 'obci': len(sel)}
    for s in VSE:
        row[s] = {f: sum(r[s][f] for r in sel) for f in ('m22', 'm26', 'k22', 'k26')}
    velikost.append(row)
    print(f"  {lab:14} ({len(sel):>4}) " + '  '.join(
        f"{NAZVY[s][:4]} {row[s]['m22']:>4}→{row[s]['m26']:<4}" for s in VSE))
mcasti = [r for r in radky if r['typ'] == '2']
print(f"  městské části ({len(mcasti)}) " + '  '.join(
    f"{NAZVY[s][:4]} {sum(r[s]['m22'] for r in mcasti):>4}→{sum(r[s]['m26'] for r in mcasti):<4}" for s in VSE))
dump('velikost.json', velikost)

# ═══ Podle krajů ═════════════════════════════════════════════════════════
kraje = defaultdict(lambda: {s: {'m22': 0, 'm26': 0, 'k26': 0} for s in VSE})
for r in radky:
    for s in VSE:
        for f in ('m22', 'm26', 'k26'):
            kraje[r['kraj']][s][f] += r[s][f]
print('\n══ Podle krajů ══')
for kr, v in sorted(kraje.items()):
    print(f"  {kr[:20]:20} " + '  '.join(f"{NAZVY[s][:4]} {v[s]['m22']:>4}→{v[s]['m26']:<4}" for s in VSE))
dump('kraje.json', kraje)

dump('souhrn.json', souhrn)


# ═══ Kde strana nejvíc ztratila a přibrala (jednotlivá zastupitelstva) ═══
for s in MAPA:
    zm = sorted(radky, key=lambda r: r[s]['m26'] - r[s]['m22'])
    print(f"\n══ {NAZVY[s]}: největší úbytky ══")
    for r in zm[:14]:
        d = r[s]['m26'] - r[s]['m22']
        if d >= 0:
            break
        print(f"  {r['nazev']} ({r['okres']}): {r[s]['m22']} → {r[s]['m26']} (kandidátů 2026: {r[s]['k26']}, 2022: {r[s]['k22']})")
    print(f"══ {NAZVY[s]}: největší přírůstky ══")
    for r in zm[::-1][:12]:
        d = r[s]['m26'] - r[s]['m22']
        if d <= 0:
            break
        print(f"  {r['nazev']} ({r['okres']}): {r[s]['m22']} → {r[s]['m26']} (kandidátů 2026: {r[s]['k26']}, 2022: {r[s]['k22']})")


# ═══ STAN: kde ztratil (podrobně, signál pro další zkoumání) ═══
print('\n══ STAN: zastupitelstva, kde ubylo zastupitelů, podle kategorie ══')
for c in ('odesli', 'prisli_o_vse', 'ubylo'):
    sel = [r for r in radky if kategorie(r['stan']) == c]
    print(f"  {c}: {len(sel)} zastupitelstev, zastupitelé {sum(r['stan']['m22'] for r in sel)} → "
          f"{sum(r['stan']['m26'] for r in sel)}")
    for r in sorted(sel, key=lambda r: r['stan']['m26'] - r['stan']['m22'])[:12]:
        print(f"    {r['nazev']} ({r['okres']}, {fmt(r['obyv'])} obyv.): {r['stan']['m22']} → {r['stan']['m26']},"
              f" kandidátů {r['stan']['k22']} → {r['stan']['k26']}")
stan_kraje = sorted(kraje.items(), key=lambda kv: kv[1]['stan']['m26'] - kv[1]['stan']['m22'])
print('  kraje podle změny STAN:', [(k, v['stan']['m22'], v['stan']['m26']) for k, v in stan_kraje])


# ═══ Grafy (Vega-Lite, styl jako ostatní volební články) ═════════════════
SRC = ('volby.gov.cz – registry kandidátů a mandátů komunálních voleb 2022 (vč. pozdějších nových voleb) '
       'a 2026; zastupitelstva obcí i městských částí, zastupitelé podle navrhující strany')
SEDA = '#bcbcb0'   # background.9
INK = '#101432'


def spec(name, s):
    s.setdefault('$schema', 'https://vega.github.io/schema/vega-lite/v5.json')
    s['_source'] = SRC
    dump(name, s)


# 1) Zastupitelé před volbami a po nich: změna v procentech, pruh od nuly (doprava přibylo, doleva ubylo)
rows = []
for s in MAPA:
    a = souhrn[s]
    rows.append({'strana': NAZVY[s], 'pred': a['m22'], 'po': a['m26'], 'zmena': a['m26'] - a['m22'],
                 'pct': round((a['m26'] / a['m22'] - 1) * 100, 1),
                 'popis': f"{(a['m26'] / a['m22'] - 1) * 100:+.0f} %".replace('-', '−'),
                 'cisla': f"{fmt(a['m22'])} → {fmt(a['m26'])}", 'barva': BARVA[NAZVY[s]]})
rows.sort(key=lambda r: -r['pct'])
PORADI = [r['strana'] for r in rows]
lo = min(r['pct'] for r in rows)
hi = max(r['pct'] for r in rows)
X = {'field': 'pct', 'type': 'quantitative', 'scale': {'domain': [min(-40, lo - 12), hi + 12 if hi > 0 else 4], 'nice': False},
     'axis': {'title': '← ubylo zastupitelů · přibylo → (%)', 'titleFontWeight': 400, 'titlePadding': 8, 'grid': True,
              'tickCount': 6, 'labelExpr': "(datum.value > 0 ? '+' : '') + datum.label + ' %'"}}
Y = {'field': 'strana', 'type': 'nominal', 'sort': PORADI,
     'axis': {'title': None, 'domain': False, 'ticks': False, 'labelFontSize': 14, 'labelFontWeight': 700,
              'labelPadding': 10, 'labelLimit': 200}}
BARVY = {'field': 'strana', 'type': 'nominal', 'scale': {'domain': [r['strana'] for r in rows],
                                                          'range': [r['barva'] for r in rows]}, 'legend': None}
TOOLTIP = [{'field': 'strana', 'title': 'Strana'}, {'field': 'pred', 'title': 'Zastupitelé před volbami', 'format': ',.0f'},
           {'field': 'po', 'title': 'Po volbách 2026', 'format': ',.0f'}, {'field': 'zmena', 'title': 'Změna', 'format': '+,.0f'},
           {'field': 'pct', 'title': 'Změna (%)', 'format': '+.1f'}]
nejhorsi = rows[-1]
spec('graf_zmena.json', {
    'title': {'text': 'STAN a Zelení počet zastupitelů udrželi, ostatní ztratili šestinu až čtvrtinu',
              'subtitle': 'Změna počtu zastupitelů obcí a městských částí, které strana navrhla: před volbami 2026 → po nich'},
    'width': 600, 'height': 300,
    'data': {'values': rows},
    'layer': [
        {'transform': [{'filter': 'datum.pct >= 0'}], 'mark': {'type': 'bar', 'cornerRadiusEnd': 3, 'height': {'band': 0.62}},
         'encoding': {'y': Y, 'x': X, 'color': BARVY, 'tooltip': TOOLTIP}},
        {'transform': [{'filter': 'datum.pct < 0'}],
         'mark': {'type': 'bar', 'fillOpacity': 0.22, 'strokeWidth': 1.8, 'strokeDash': [5, 3], 'height': {'band': 0.62}},
         'encoding': {'y': Y, 'x': X, 'fill': BARVY, 'stroke': BARVY, 'tooltip': TOOLTIP}},
        # procento na konci pruhu, počty zastupitelů za ním
        *[{'transform': [{'filter': f'datum.pct {op} 0'}],
           'mark': {'type': 'text', 'align': al, 'dx': dx, 'fontSize': 14, 'fontWeight': 700, 'color': INK},
           'encoding': {'y': Y, 'x': {'field': 'pct', 'type': 'quantitative'}, 'text': {'field': 'popis'}}}
          for op, al, dx in (('>=', 'left', 6), ('<', 'right', -6))],
        *[{'transform': [{'filter': f'datum.pct {op} 0'}],
           'mark': {'type': 'text', 'align': al, 'dx': dx, 'fontSize': 12.5, 'color': '#4c4f8e'},
           'encoding': {'y': Y, 'x': {'field': 'pct', 'type': 'quantitative'}, 'text': {'field': 'cisla'}}}
          for op, al, dx in (('>=', 'left', 52), ('<', 'right', -50))],
        {'mark': {'type': 'rule', 'strokeWidth': 1.6},
         'encoding': {'x': {'datum': 0, 'type': 'quantitative'}, 'color': {'value': INK}}},
    ],
})

# 2) Kandidáti a zvolení: kolik z navržených kandidátů se do zastupitelstva dostalo
rows = []
for s in MAPA:
    a = souhrn[s]
    for rok, k, m in (('2022', a['k22'], a['m22']), ('2026', a['k26'], a['m26'])):
        rows.append({'strana': NAZVY[s], 'rok': rok, 'kandidatu': k, 'zvoleno': m, 'pct': round(m / k * 100, 1)})
por = sorted(MAPA, key=lambda s: -souhrn[s]['m26'] / souhrn[s]['k26'])
spec('graf_uspesnost.json', {
    'title': {'text': 'Kandidáti stran uspěli zhruba stejně často jako v roce 2022, jen jich bylo méně',
              'subtitle': 'Podíl zvolených z kandidátů, které strana navrhla (%), komunální volby 2022 a 2026'},
    'width': 600, 'height': 300,
    'data': {'values': rows},
    'layer': [
        {'mark': {'type': 'rule', 'color': SEDA, 'strokeWidth': 2},
         'encoding': {'y': {'field': 'strana', 'type': 'nominal'},
                      'x': {'aggregate': 'min', 'field': 'pct', 'type': 'quantitative'},
                      'x2': {'aggregate': 'max', 'field': 'pct'}}},
        {'mark': {'type': 'circle', 'size': 220, 'opacity': 1},
         'encoding': {
             'y': {'field': 'strana', 'type': 'nominal', 'sort': [NAZVY[s] for s in por],
                   'axis': {'title': None, 'labelFontSize': 14, 'labelLimit': 200, 'domain': False, 'ticks': False,
                            'labelPadding': 12}},
             'x': {'field': 'pct', 'type': 'quantitative', 'scale': {'domain': [0, 40], 'padding': 16, 'nice': False},
                   'axis': {'title': None, 'labelExpr': "datum.label + ' %'", 'tickCount': 5}},
             'color': {'field': 'rok', 'type': 'nominal', 'scale': {'domain': ['2022', '2026'], 'range': [SEDA, '#de1743']},
                       'legend': {'title': None, 'orient': 'top'}},
             'tooltip': [{'field': 'strana', 'title': 'Strana'}, {'field': 'rok', 'title': 'Volby'},
                         {'field': 'kandidatu', 'title': 'Kandidátů', 'format': ',.0f'},
                         {'field': 'zvoleno', 'title': 'Zvoleno', 'format': ',.0f'},
                         {'field': 'pct', 'title': 'Zvoleno z kandidátů (%)', 'format': '.1f'}]}},
        # popisky: 2022 nad tečkou, 2026 pod ní, aby se blízké hodnoty nepřekrývaly
        *[{'transform': [{'filter': f"datum.rok == '{rok}'"}],
           'mark': {'type': 'text', 'dy': dy, 'fontSize': 13, 'color': col},
           'encoding': {'y': {'field': 'strana', 'type': 'nominal'}, 'x': {'field': 'pct', 'type': 'quantitative'},
                        'text': {'field': 'pct', 'type': 'quantitative', 'format': '.1f'}}}
          for rok, dy, col in (('2022', -16, '#4c4f8e'), ('2026', 18, '#de1743'))],
    ],
})
# 3) Obce do 10 000 obyvatel × větší města a městské části: změna počtu zastupitelů
#    Blok za každou stranu, dva řádky; doprava přibylo (plný pruh), doleva ubylo (světlý čárkovaný pruh)
SKUP = [('obce do 10 000 obyv.', lambda r: r['typ'] == '1' and r['obyv'] < 10000),
        ('města a městské části', lambda r: r['typ'] == '2' or r['obyv'] >= 10000)]
rows = []
for s in MAPA:
    for lab, f in SKUP:
        sel = [r for r in radky if f(r)]
        m22, m26 = sum(r[s]['m22'] for r in sel), sum(r[s]['m26'] for r in sel)
        rows.append({'strana': NAZVY[s], 'skupina': lab, 'klic': f'{NAZVY[s]}|{lab}', 'pred': m22, 'po': m26,
                     'zmena': m26 - m22, 'popis': f'{m26 - m22:+d}'.replace('-', '−')})
print('\n══ Obce do 10 000 × města a MČ ══')
for r in rows:
    print(f"  {r['strana']:8} {r['skupina']:24} {r['pred']:>5} → {r['po']:<5} ({r['zmena']:+d})")
DOMENA = []
for s in MAPA:
    DOMENA += [f'h-{NAZVY[s]}'] + [f'{NAZVY[s]}|{lab}' for lab, _ in SKUP] + ([f'mezera-{s}'] if s != MAPA[-1] else [])
JE_HLAVICKA = "indexof(datum.value, 'h-') == 0"
# popisek KDU-ČSL tmavším odstínem žluté (brandYellow.8), světlá žlutá na bílém by nebyla čitelná
POPISEK = {**{NAZVY[s]: BARVA[NAZVY[s]] for s in MAPA}, 'KDU-ČSL': '#bd9103'}
BARVA_EXPR = ' : '.join(f"datum.value == 'h-{NAZVY[s]}' ? '{POPISEK[NAZVY[s]]}'" for s in MAPA) + f" : '{INK}'"
OSA_Y = {'field': 'klic', 'type': 'ordinal', 'sort': DOMENA, 'scale': {'domain': DOMENA, 'paddingInner': 0.18, 'paddingOuter': 0.05},
         'axis': {'title': None, 'domain': False, 'ticks': False, 'labelPadding': 10,
                  'labelExpr': "indexof(datum.value, 'h-') == 0 ? replace(datum.value, 'h-', '') "
                               ": indexof(datum.value, 'mezera') == 0 ? '' : split(datum.value, '|')[1]",
                  'labelFontWeight': {'expr': f"{JE_HLAVICKA} ? 800 : 500"},
                  'labelFontSize': {'expr': f"{JE_HLAVICKA} ? 15 : 13"},
                  'labelColor': {'expr': BARVA_EXPR}}}
X = {'field': 'zmena', 'type': 'quantitative', 'scale': {'domain': [-640, 330], 'nice': False},
     'axis': {'title': '← ubylo zastupitelů · přibylo →', 'titleFontWeight': 400, 'titlePadding': 8,
              'values': [-600, -400, -200, 0, 200], 'grid': True, 'labelExpr': "datum.value > 0 ? '+' + datum.label : datum.label"}}
BARVY = {'field': 'strana', 'type': 'nominal', 'scale': {'domain': [NAZVY[s] for s in MAPA],
                                                          'range': [BARVA[NAZVY[s]] for s in MAPA]}, 'legend': None}
TOOLTIP = [{'field': 'strana', 'title': 'Strana'}, {'field': 'skupina', 'title': 'Kde'},
           {'field': 'pred', 'title': 'Zastupitelé před volbami'}, {'field': 'po', 'title': 'Po volbách 2026'},
           {'field': 'zmena', 'title': 'Změna'}]
spec('graf_velikost.json', {
    'title': {'text': 'V menších obcích ubylo zastupitelů všem šesti stranám, ve městech přibral hlavně STAN',
              'subtitle': 'Změna počtu zastupitelů 2022 → 2026: obce do 10 000 obyvatel a větší města včetně městských částí'},
    'width': 600, 'height': 470,
    'data': {'values': rows},
    'layer': [
        {'transform': [{'filter': 'datum.zmena >= 0'}], 'mark': {'type': 'bar', 'cornerRadiusEnd': 3},
         'encoding': {'y': OSA_Y, 'x': X, 'color': BARVY, 'tooltip': TOOLTIP}},
        {'transform': [{'filter': 'datum.zmena < 0'}],
         'mark': {'type': 'bar', 'fillOpacity': 0.2, 'strokeWidth': 1.8, 'strokeDash': [5, 3]},
         'encoding': {'y': OSA_Y, 'x': X, 'fill': BARVY, 'stroke': BARVY, 'tooltip': TOOLTIP}},
        *[{'transform': [{'filter': f'datum.zmena {op} 0'}],
           'mark': {'type': 'text', 'align': al, 'dx': dx, 'fontSize': 14, 'fontWeight': 700, 'color': INK},
           'encoding': {'y': OSA_Y, 'x': {'field': 'zmena', 'type': 'quantitative'}, 'text': {'field': 'popis'}}}
          for op, al, dx in (('>=', 'left', 5), ('<', 'right', -5))],
        {'mark': {'type': 'rule', 'strokeWidth': 1.6},
         'encoding': {'x': {'datum': 0, 'type': 'quantitative'}, 'color': {'value': INK}}},
    ],
})
print('\nGrafy zapsány: graf_zmena.json, graf_uspesnost.json, graf_velikost.json')


# ═══ Členové stran zvolení za jiný subjekt (sdružení, jiná strana) ═══
# Do počtu zastupitelů je nepočítáme (metoda = navrhující strana), v textu je zmiňujeme zvlášť.
print('\n══ Členové stran (PSTRANA) zvolení, ale navržení někým jiným ══')
for s in MAPA:
    for rok, rows_ in (('2022', rk22), ('2026', rk26)):
        cl = [r for r in rows_ if r['PSTRANA'] == STRANY[s] and r['MANDAT'] == 'A']
        jinde = [r for r in cl if r['NSTRANA'] != STRANY[s]]
        print(f"  {NAZVY[s]:8} {rok}: zvolených členů {len(cl):>5}, z toho navrhl jiný subjekt {len(jinde):>4}")
    nav = [r for r in rk26 if r['NSTRANA'] == STRANY[s] and r['MANDAT'] == 'A']
    nestr = sum(1 for r in nav if r['PSTRANA'] != STRANY[s])
    print(f"  {NAZVY[s]:8} 2026: zvolených navržených {len(nav)}, z toho nečlenů strany {nestr}")


# ═══ Kandidátky v krajských městech: podíl hlasů (vlastní i společné) ═══
print('\n══ Kandidátky se stranou (název nebo složení) v Praze a krajských městech ══')
krajska = {r['kod'] for r in radky if r['druh'] in ('3', '4') and r['typ'] == '1' and r['obyv'] > 35000}
for rok, key in (('2022', 'reg22'), ('2026', 'reg26')):
    print(f'  ── {rok}')
    for r in table(key, 'kvros.csv'):
        if key == 'reg22' and r['DATUMVOLEB'] != posledni[r['KODZASTUP']]:
            continue
        if r['KODZASTUP'] not in krajska:
            continue
        # SLOZENI má kódy s úvodními nulami („001,053,721“)
        sl = {str(int(x)) for x in r['SLOZENI'].replace('"', '').split(',') if x.strip()} | {r['VSTRANA']}
        mine = [NAZVY[s] for s in MAPA if STRANY[s] in sl]
        if mine and float(r['PROCHLSTR']) >= 3:
            print(f"    {r['NAZEVZAST'][:18]:18} {fmt(float(r['PROCHLSTR']), 2):>6} %  {r['MAND_STR']:>2} mand.  "
                  f"{r['NAZEVCELK'][:60]}  [{', '.join(mine)}]")


# ═══ Všechny mandáty: strany vs. sdružení nezávislých kandidátů ═══
# NSTRANA 80 = nezávislý kandidát bez nominace strany (typicky na kandidátce sdružení nezávislých); stejný výchozí stav jako výše
NEZ = '80'
for rok, rows_ in (('2022', rk22), ('2026', rk26)):
    m = [r for r in rows_ if r['MANDAT'] == 'A']
    n = sum(1 for r in m if r['NSTRANA'] == NEZ)
    print(f"\n══ Mandáty celkem {rok}: {fmt(len(m))}, nezávislí bez nominace strany {fmt(n)} ({n / len(m) * 100:.1f} %), "
          f"strany a hnutí {fmt(len(m) - n)}")


# ═══ Co se stalo se zastupiteli strany zvolenými v roce 2022 ═══
# Stejný člověk = stejné zastupitelstvo, jméno, příjmení a věk o 3–5 let vyšší (registry nemají ID osoby).
cpp26 = {r['PSTRANA']: r['ZKRATKAP8'] for r in table('cis26', 'cpp.csv')}
cpp26[NEZ] = 'nezávislý kandidát (bez nominace strany)'
kand26 = defaultdict(list)
for r in rk26:
    kand26[(r['KODZASTUP'], r['JMENO'].strip().lower(), r['PRIJMENI'].strip().lower())].append(r)


def najdi(r):
    for x in kand26.get((r['KODZASTUP'], r['JMENO'].strip().lower(), r['PRIJMENI'].strip().lower()), []):
        if 2 <= int(x['VEK']) - int(r['VEK']) <= 5:
            return x
    return None


osudy = {}
for s in MAPA:
    zvol = [r for r in rk22 if r['NSTRANA'] == STRANY[s] and r['MANDAT'] == 'A']
    c = defaultdict(int)
    jinde = defaultdict(int)
    odesli_c = defaultdict(int)
    for r in zvol:
        x = najdi(r)
        odesla = not p26.get((r['KODZASTUP'], s), [0, 0])[0]   # strana tu letos nekandidovala
        if x is None:
            k = 'nekandidoval'
        elif x['NSTRANA'] == STRANY[s]:
            k = 'znovu_za_stranu' if x['MANDAT'] == 'A' else 'neuspel_za_stranu'
        else:
            k = 'znovu_jinak' if x['MANDAT'] == 'A' else 'neuspel_jinak'
            if x['MANDAT'] == 'A':
                jinde[cpp26.get(x['NSTRANA'], x['NSTRANA'])] += 1
        c[k] += 1
        if odesla:
            odesli_c[k] += 1
    osudy[s] = {'celkem': len(zvol), **c}
    print(f"\n══ {NAZVY[s]}: {len(zvol)} zastupitelů z roku 2022 v roce 2026 ══")
    for k in ('znovu_za_stranu', 'znovu_jinak', 'neuspel_za_stranu', 'neuspel_jinak', 'nekandidoval'):
        print(f"  {k:18} {c[k]:>5} ({c[k] / len(zvol) * 100:.0f} %)")
    print('  znovu zvolení za jiného navrhovatele:', dict(sorted(jinde.items(), key=lambda x: -x[1])[:6]))
    print(f"  jen zastupitelstva, kde strana letos nekandidovala ({sum(odesli_c.values())} lidí):", dict(odesli_c))
dump('osudy.json', osudy)


# ═══ Příklady: zastupitelstva, kde STAN a ODS měly nejvíc lidí a letos nekandidovaly ═══
listiny26 = {(r['KODZASTUP'], r['POR_STR_HL']): r['NAZEVCELK'] for r in table('reg26', 'kvros.csv')}
for s in ('stan', 'ods'):
    print(f"\n══ {NAZVY[s]}: kde strana letos nekandidovala – kam šli její zastupitelé ══")
    sel = sorted((r for r in radky if kategorie(r[s]) == 'odesli'), key=lambda r: -r[s]['m22'])[:8]
    for z in sel:
        lide = [r for r in rk22 if r['KODZASTUP'] == z['kod'] and r['NSTRANA'] == STRANY[s] and r['MANDAT'] == 'A']
        kam = defaultdict(int)
        for r in lide:
            x = najdi(r)
            kam['nekandidoval' if x is None else
                f"{'zvolen' if x['MANDAT'] == 'A' else 'nezvolen'}: {listiny26[(x['KODZASTUP'], x['POR_STR_HL'])]}"] += 1
        print(f"  {z['nazev']} ({z['okres']}): {z[s]['m22']} zastupitelů → {dict(kam)}")


# ═══ Krajská města (zastupitelstvo města, 13 měst vč. Prahy): součty ═══
KRAJSKA = ['Praha hl.m.', 'Brno', 'Ostrava', 'Plzeň', 'Liberec', 'Olomouc', 'České Budějovice', 'Hradec Králové',
           'Pardubice', 'Ústí nad Labem', 'Zlín', 'Karlovy Vary', 'Jihlava']
km = [r for r in radky if r['typ'] == '1' and r['druh'] in ('3', '4') and r['nazev'] in KRAJSKA]
assert len(km) == 13, [r['nazev'] for r in km]
print('\n══ 13 krajských měst (zastupitelstvo města) ══')
for s in VSE:
    print(f"  {NAZVY[s]:22} {sum(r[s]['m22'] for r in km):>3} → {sum(r[s]['m26'] for r in km):<3}")


# ═══ STAN: kde ubyli zastupitelé, i když strana postavila aspoň tolik kandidátů jako v roce 2022 ═══
# (signál pro další zkoumání, příčiny nehledáme)
for s in ('stan', 'ods'):
    sel = [r for r in radky if r[s]['m22'] and r[s]['m26'] < r[s]['m22']]
    stejne_sily = [r for r in sel if r[s]['k26'] >= r[s]['k22']]
    slabsi = [r for r in sel if r[s]['k26'] < r[s]['k22']]
    print(f"\n══ {NAZVY[s]}: úbytek zastupitelů ve {len(sel)} zastupitelstvech ══"
          f"\n  méně kandidátů než 2022 (vč. nula): {len(slabsi)} zastupitelstev, {sum(r[s]['m22'] for r in slabsi)} → {sum(r[s]['m26'] for r in slabsi)}"
          f"\n  aspoň stejně kandidátů: {len(stejne_sily)} zastupitelstev, {sum(r[s]['m22'] for r in stejne_sily)} → {sum(r[s]['m26'] for r in stejne_sily)}")
    for r in sorted(stejne_sily, key=lambda r: r[s]['m26'] - r[s]['m22'])[:10]:
        print(f"    {r['nazev']} ({r['okres']}, {fmt(r['obyv'])} obyv.): {r[s]['m22']} → {r[s]['m26']}, kandidátů {r[s]['k22']} → {r[s]['k26']}")


# ═══ Tabulka krajských měst do článku (markdown, pevné mezery kolem šipky) ═══
NB = '\u00a0'
JMENO = {'Praha hl.m.': 'Praha'}
radky_md = ['| Město | ' + ' | '.join(NAZVY[s] for s in MAPA) + ' |', '|---' * (len(MAPA) + 1) + '|']
for nazev in KRAJSKA:
    r = next(x for x in km if x['nazev'] == nazev)
    bunky = [('–' if not (r[s]['m22'] or r[s]['m26']) else f"{r[s]['m22']}{NB}→{NB}{r[s]['m26']}") for s in MAPA]
    radky_md.append(f"| {JMENO.get(nazev, nazev)} | " + ' | '.join(bunky) + ' |')
(HERE / 'tabulka_krajska_mesta.md').write_text('\n'.join(radky_md) + '\n', encoding='utf-8')
print('\nTabulka krajských měst zapsána: tabulka_krajska_mesta.md')
