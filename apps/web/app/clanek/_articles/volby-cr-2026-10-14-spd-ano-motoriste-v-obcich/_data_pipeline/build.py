"""Data k článku volby-cr-2026-10-16-spd-ano-motoriste-v-obcich.

Otázka: kolik zastupitelů měly SPD, ANO a Motoristé (a pro srovnání PRO, KSČM a Stačilo!) v obcích a městských částech
před volbami 2026, kde letos postavily kandidáty (ambice) a kolik jich mají teď.

Zdroj: otevřená data ČSÚ (volby.gov.cz/opendata)
- KV2022reg20260328_csv.zip – registry kandidátů a mandátů, řádné volby 2022
  a všechny pozdější nové, dodatečné a opakované volby do 28. 3. 2026
- KV2026reg20261011_csv.zip – totéž pro volby 9.–10. 10. 2026 (stav 11. 10.)
- KV2026ciselniky20261011_csv.zip – číselník krajů a okresů

Metoda (popsaná i v článku):
- Zastupitel strany = zvolený kandidát, kterého strana navrhla (sloupec NSTRANA),
  bez ohledu na to, na jaké kandidátce stál (vlastní, koalice, sdružení s nezávislými).
- Výchozí stav = poslední volby do každého zastupitelstva před rokem 2026, tedy
  řádné volby 2022, kde se pak konaly nové nebo dodatečné volby, platí ty.
- Ambice 2026 = počet kandidátů, které strana letos navrhla.
- Obec i městská část (obvod) jsou samostatná zastupitelstva, v součtech se počítají obě.

Spuštění: python build.py  → stáhne data do .cache/, zapíše ../data/*.json, ../obce-strany.json
a vypíše čísla pro text.
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

STRANY = {'spd': '1114', 'ano': '768', 'aut': '1178', 'pro': '1265', 'ksc': '47', 'sta': '1298'}
NAZVY = {'spd': 'SPD', 'ano': 'ANO', 'aut': 'Motoristé', 'pro': 'PRO', 'ksc': 'KSČM', 'sta': 'Stačilo!',
         'kss': 'KSČM a Stačilo!'}
# KSČM kandidovala do Sněmovny 2025 na kandidátce Stačilo! a letos ji v obcích Stačilo! často nahradilo
# (viz výpis „KSČM → Stačilo!“ níže). Pro mapu a grafy obě sčítáme dohromady (kss), ve výpisech i zvlášť.
SLOUCENE = {'kss': ('ksc', 'sta')}
MAPA = ['spd', 'ano', 'aut', 'kss', 'pro']   # strany v mapě a souhrnných grafech
VSE = [*STRANY, *SLOUCENE]                  # všechny výpočty a výpisy


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


p22 = pocty(table('reg22', 'kvrk.csv'), posledni)
p26 = pocty(table('reg26', 'kvrk.csv'))

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
          f"{(a['m26'] / a['m22'] - 1) * 100 if a['m22'] else float('nan'):+.0f} %)")
    print(f"  kandidáti   {fmt(a['k22'])} → {fmt(a['k26'])}")
    print(f"  zastupitelstva se zastupitelem {fmt(a['z_m22'])} → {fmt(a['z_m26'])}; "
          f"kde kandidovali {fmt(a['z_k22'])} → {fmt(a['z_k26'])}")
    if a['k26']:
        print(f"  úspěšnost 2026: {a['m26'] / a['k26'] * 100:.1f} % kandidátů zvoleno"
              + (f" (2022: {a['m22'] / a['k22'] * 100:.1f} %)" if a['k22'] else ''))
    print('  kategorie:', {c: n for c, n in sorted(a['kat'].items(), key=lambda x: -x[1]) if c != 'nic'})


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
dump('obce-strany.json', {'strany': {s: NAZVY[s] for s in MAPA}, 'obce': mapa}, ART)
print(f'\nMapa: {len(mapa)} obcí, {len(mc)} měst s městskými částmi')


# ═══ Velká města a městské části ═══════════════════════════════════════
def radek(k):
    z = zast(k)
    return {'kod': k, 'nazev': z['NAZEVZAST'], 'typ': z['TYPZASTUP'], 'druh': z['DRUHZASTUP'],
            'obec': nadr.get(k) or k, 'kraj': nuts.get(z['KRAJ'], ''), 'mandaty': int(z['MANDATY']),
            'obyv': int(z['POCOBYV']), **{s: rec(k, s) for s in VSE}}


radky = [radek(k) for k in kody]
# tabulka všech zastupitelstev ke kontrole (není součástí webu)
with open(HERE / 'zastupitelstva.csv', 'w', encoding='utf-8', newline='') as f:
    w = csv.writer(f)
    w.writerow(['kod', 'nazev', 'typ', 'obec', 'kraj', 'mandaty', 'obyv']
               + [f'{s}_{x}' for s in VSE for x in ('k22', 'm22', 'k26', 'm26')])
    for r in radky:
        w.writerow([r[c] for c in ('kod', 'nazev', 'typ', 'obec', 'kraj', 'mandaty', 'obyv')]
                   + [r[s][x] for s in VSE for x in ('k22', 'm22', 'k26', 'm26')])

print('\n══ Statutární města a Praha (zastupitelstvo města) ══')
for r in sorted((r for r in radky if r['druh'] in ('3', '4')), key=lambda r: -r['obyv']):
    print(f"  {r['nazev'][:22]:22} " + '  '.join(
        f"{NAZVY[s][:3]} {r[s]['m22']:>2}→{r[s]['m26']:<2}(k{r[s]['k26']:>2})" for s in VSE))

print('\n══ Praha – městské části (Motoristé) ══')
praha = [r for r in radky if r['obec'] == '554782' and r['typ'] == '2']
kand = [r for r in praha if r['aut']['k26']]
print(f"  Motoristé kandidovali v {len(kand)} z {len(praha)} MČ, "
      f"{sum(r['aut']['k26'] for r in kand)} kandidátů, zvoleno {sum(r['aut']['m26'] for r in kand)}")
for r in sorted(kand, key=lambda r: -r['aut']['m26'])[:10]:
    print(f"    {r['nazev']}: {r['aut']['k26']} kandidátů, {r['aut']['m26']} zvoleno")


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
        f"{NAZVY[s][:3]} {row[s]['m22']:>4}→{row[s]['m26']:<4}" for s in VSE))
dump('velikost.json', velikost)

# ═══ Podle krajů ═════════════════════════════════════════════════════════
kraje = defaultdict(lambda: {s: {'m22': 0, 'm26': 0, 'k26': 0} for s in VSE})
for r in radky:
    for s in VSE:
        for f in ('m22', 'm26', 'k26'):
            kraje[r['kraj']][s][f] += r[s][f]
print('\n══ Podle krajů ══')
for kr, v in sorted(kraje.items()):
    print(f"  {kr[:20]:20} " + '  '.join(f"{NAZVY[s][:3]} {v[s]['m22']:>4}→{v[s]['m26']:<4}" for s in VSE))
dump('kraje.json', kraje)

dump('souhrn.json', souhrn)


# ═══ Grafy (Vega-Lite, styl jako ostatní volební články) ═════════════════
SRC = ('volby.gov.cz – registry kandidátů a mandátů komunálních voleb 2022 (vč. pozdějších nových voleb) '
       'a 2026; zastupitelstva obcí i městských částí, zastupitelé podle navrhující strany')
BARVA = {'SPD': '#a47d03', 'ANO': '#272a59', 'Motoristé': '#1a9fbd',   # barvy z predikce
         'KSČM': '#c5143c', 'Stačilo!': '#621d30', 'KSČM a Stačilo!': '#c5143c', 'PRO': '#9f319e'}
SEDA = '#bcbcb0'   # background.9


def spec(name, s):
    s.setdefault('$schema', 'https://vega.github.io/schema/vega-lite/v5.json')
    s['_source'] = SRC
    dump(name, s)


# 1) Kandidáti a zvolení: kolik z navržených kandidátů se do zastupitelstva dostalo
rows = []
for s in MAPA:
    a = souhrn[s]
    for rok, k, m in (('2022', a['k22'], a['m22']), ('2026', a['k26'], a['m26'])):
        if k:
            rows.append({'strana': NAZVY[s], 'rok': rok, 'kandidatu': k, 'zvoleno': m,
                         'pct': round(m / k * 100, 1), 'barva': BARVA[NAZVY[s]]})
spec('graf_uspesnost.json', {
    'title': {'text': 'V roce 2022 prošel do zastupitelstva každý desátý kandidát SPD, letos každý pětadvacátý',
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
             'y': {'field': 'strana', 'type': 'nominal', 'sort': ['ANO', 'PRO', 'KSČM a Stačilo!', 'SPD', 'Motoristé'],
                   'axis': {'title': None, 'labelFontSize': 14, 'labelLimit': 200, 'domain': False, 'ticks': False}},
             'x': {'field': 'pct', 'type': 'quantitative', 'scale': {'domain': [0, 30]},
                   'axis': {'title': None, 'labelExpr': "datum.label + ' %'", 'tickCount': 6}},
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

# 2) Podle velikosti obce: změna počtu zastupitelů (obce bez městských částí)
rows = []
for i, v in enumerate(velikost):
    for s in ('spd', 'ano'):
        rows.append({'pasmo': v['pasmo'], 'ord': i, 'strana': NAZVY[s], 'pred': v[s]['m22'], 'po': v[s]['m26'],
                     'zmena': v[s]['m26'] - v[s]['m22']})
spec('graf_velikost.json', {
    'title': {'text': 'ANO ztrácí ve městech, v menších obcích přibírá. SPD ubývá všude',
              'subtitle': 'Změna počtu zastupitelů 2022 → 2026 podle velikosti obce (počet obyvatel), bez městských částí'},
    'width': 600, 'height': 260,
    'data': {'values': rows},
    'mark': {'type': 'bar'},
    'encoding': {
        'x': {'field': 'pasmo', 'type': 'ordinal', 'sort': [v['pasmo'] for v in velikost], 'axis': {'title': None, 'labelAngle': 0}},
        'xOffset': {'field': 'strana', 'sort': ['ANO', 'SPD']},
        'y': {'field': 'zmena', 'type': 'quantitative', 'axis': {'title': None}},
        'color': {'field': 'strana', 'type': 'nominal', 'scale': {'domain': ['ANO', 'SPD'], 'range': [BARVA['ANO'], BARVA['SPD']]},
                  'legend': {'title': None, 'orient': 'top'}},
        'tooltip': [{'field': 'pasmo', 'title': 'Obyvatel'}, {'field': 'strana', 'title': 'Strana'},
                    {'field': 'pred', 'title': 'Zastupitelé před volbami'}, {'field': 'po', 'title': 'Po volbách 2026'},
                    {'field': 'zmena', 'title': 'Změna'}],
    },
})
print('\nGrafy zapsány: graf_uspesnost.json, graf_velikost.json')


# ═══ Kandidátky s Motoristy: podíl hlasů a mandáty (vlastní i společné) ═══
print('\n══ Kandidátky s Motoristy (strana v názvu nebo ve složení) ══')
for rok, key in (('2022', 'reg22'), ('2026', 'reg26')):
    listiny = []
    for r in table(key, 'kvros.csv'):
        if key == 'reg22' and r['DATUMVOLEB'] != posledni[r['KODZASTUP']]:
            continue
        if r['VSTRANA'] == STRANY['aut'] or STRANY['aut'] in r['SLOZENI'].replace('"', '').split(','):
            listiny.append((float(r['PROCHLSTR']), r['NAZEVZAST'], r['NAZEVCELK'], int(r['MAND_STR'])))
    print(f'  {rok}: {len(listiny)} kandidátek, s mandátem {sum(1 for x in listiny if x[3])}')
    for p, z, n, m in sorted(listiny, reverse=True):
        print(f'    {fmt(p, 2):>6} %  {m} mand.  {z} – {n}')


# ═══ KSČM → Stačilo!: kde KSČM letos nekandidovala a místo ní kandidovalo Stačilo! ═══
prechod = [r for r in radky if r['ksc']['k22'] and not r['ksc']['k26'] and r['sta']['k26']]
print(f"\n══ KSČM → Stačilo! ══\n  zastupitelstev, kde KSČM v roce 2022 kandidovala, letos ne, a kandidovalo Stačilo!: {len(prechod)}"
      f"\n  z toho KSČM měla zastupitele: {sum(1 for r in prechod if r['ksc']['m22'])},"
      f" zastupitelé KSČM {sum(r['ksc']['m22'] for r in prechod)} → Stačilo! {sum(r['sta']['m26'] for r in prechod)}"
      f"\n  zastupitelstev, kde letos kandidovalo Stačilo!: {sum(1 for r in radky if r['sta']['k26'])}")


# ═══ Kdo kandidoval za Stačilo!: stranická příslušnost (PSTRANA) navržených ═══
clen = {r['PSTRANA']: r['ZKRATKAP8'] for r in table('cis26', 'cpp.csv')}
kand, zvol = defaultdict(int), defaultdict(int)
for r in table('reg26', 'kvrk.csv'):
    if r['NSTRANA'] == STRANY['sta']:
        kand[clen.get(r['PSTRANA'], r['PSTRANA'])] += 1
        zvol[clen.get(r['PSTRANA'], r['PSTRANA'])] += r['MANDAT'] == 'A'
print('\n══ Stačilo!: členství navržených (BEZPP = bez politické příslušnosti) ══')
for p, n in sorted(kand.items(), key=lambda x: -x[1]):
    print(f'  {p:10} kandidátů {n:>4}, zvoleno {zvol[p]}')
