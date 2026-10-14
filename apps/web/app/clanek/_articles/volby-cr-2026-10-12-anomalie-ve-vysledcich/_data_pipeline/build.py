"""Data a grafy k článku volby-cr-2026-10-12-anomalie-ve-vysledcich.

Zdroj: otevřená data ČSÚ (volby.gov.cz/opendata), stav po zpracování 1. kola 11. 10. 2026:
- Senát 2026: SE2026data20261011_csv.zip (okrsky), SE2026reg20261011_csv.zip (kandidáti),
  SE2026ciselniky20261011_csv.zip (obce a obvody)
- Zastupitelstva obcí 2026: KV2026_data_20261011_csv.zip (okrsky, hlasy pro strany),
  KV2026reg20261011_csv.zip (volební strany, kandidáti, mandáty, zastupitelstva)

Metoda (popsaná i v článku):
1. Využití hlasů: v obecních volbách má volič tolik hlasů, kolik má zastupitelstvo členů.
   Využití okrsku = platné hlasy / (platné lístky × počet mandátů). Ve městech bývá 90–97 %.
   Okrsek, kde je výrazně nižší, než je medián města, nejspíš v zápisu ztratil část hlasů.
2. Kontrola dvěma lístky: ve městech s městskými částmi volí titíž voliči v jednom okrsku
   zastupitelstvo města i městské části. Když jeden lístek vyjde normálně a druhý ne,
   nejde o zvláštnost voličů, ale o zápis.
3. Nula pro silnou stranu: strana s 10+ % ve městě má v okrsku nejvýš 1 % hlasů.
4. Mandáty: přepočet d'Hondtovou metodou s 5% hranicí (ověřeno proti oficiálním mandátům),
   chybějící hlasy rozdělené podle podílů stran ve městě, resp. přidané podezřelé straně.

Spuštění: python build.py  → stáhne data do .cache/, zapíše ../data/*.json a vstupy/*.csv
a vypíše čísla pro text.
"""
import csv
import io
import json
import statistics as st
import sys
import urllib.request
import zipfile
from collections import defaultdict
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

HERE = Path(__file__).parent
CACHE = HERE / '.cache'
OUT = HERE.parent / 'data'
TAB = HERE / 'vstupy'
for d in (CACHE, OUT, TAB):
    d.mkdir(exist_ok=True)

BASE = 'https://volby.gov.cz/opendata/'
ZIPS = {
    'se_data': 'se2026/SE2026data20261011_csv.zip',
    'se_reg': 'se2026/SE2026reg20261011_csv.zip',
    'se_cis': 'se2026/SE2026ciselniky20261011_csv.zip',
    'kv_data': 'kv2026/KV2026_data_20261011_csv.zip',
    'kv_reg': 'kv2026/KV2026reg20261011_csv.zip',
}

CRIMSON = '#de1743'   # brand.6 – zvýraznění
INK = '#101432'       # ink blue
GREY = '#c8c8bc'      # background.8 – ostatní okrsky
TEAL = '#06677d'      # brandTeal.7

MIN_LISTKU = 50       # menší okrsky vynecháváme, využití tam silně kolísá


def fetch(key):
    path = CACHE / Path(ZIPS[key]).name
    if not path.exists():
        urllib.request.urlretrieve(BASE + ZIPS[key], path)
    return zipfile.ZipFile(path)


def table(key, name):
    z = fetch(key)
    with z.open(f'csv_od/{name}') as f:
        return list(csv.DictReader(io.TextIOWrapper(f, encoding='utf-8')))


def dump(name, spec):
    (OUT / name).write_text(json.dumps(spec, ensure_ascii=False, indent=2), encoding='utf-8')


def write_csv(name, rows):
    with open(TAB / name, 'w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)


def fmt(n, d=0):
    return f'{n:,.{d}f}'.replace(',', ' ').replace('.', ',')


# ═══ Obecní volby ════════════════════════════════════════════════════════
zast = {r['KODZASTUP']: r for r in table('kv_reg', 'kvrzcoco.csv')}
strany = defaultdict(dict)
for r in table('kv_reg', 'kvros.csv'):
    strany[r['KODZASTUP']][int(r['POR_STR_HL'])] = r
kandidatu = defaultdict(int)
for r in table('kv_reg', 'kvrk.csv'):
    kandidatu[(r['KODZASTUP'], int(r['POR_STR_HL']))] += 1

okrsky = {}   # (ID_OKRSKY, TYPZASTUP) -> záznam
for r in table('kv_data', 'kvt3.csv'):
    okrsky[(r['ID_OKRSKY'], r['TYPZASTUP'])] = r
hlasy = defaultdict(dict)
for r in table('kv_data', 'kvhl.csv'):
    hlasy[(r['ID_OKRSKY'], r['TYPZASTUP'])][int(r['POR_STR_HL'])] = int(r['POC_HLASU'])


def mandaty(k):
    return int(zast[k]['MANDATY'])


def vyuziti(r):
    return int(r['PL_HL_CELK']) / int(r['PLAT_LISTKY']) / mandaty(r['KODZASTUP'])


po_zast = defaultdict(list)
for key, r in okrsky.items():
    if int(r['PLAT_LISTKY']) >= MIN_LISTKU:
        po_zast[r['KODZASTUP']].append(key)
median = {k: st.median(vyuziti(okrsky[x]) for x in keys) for k, keys in po_zast.items()}


def rozdel(votes, m, k):
    """D'Hondt s 5% hranicí a stropem počtu kandidátů na listině."""
    total = sum(votes.values())
    ok = {n: v for n, v in votes.items() if v >= 0.05 * total}
    podily = sorted(((v / d, n) for n, v in ok.items()
                     for d in range(1, min(m, kandidatu[(k, n)] or m) + 1)), reverse=True)[:m]
    out = defaultdict(int)
    for _, n in podily:
        out[n] += 1
    return dict(out)


# kontrola přepočtu proti oficiálním mandátům
shoda = sum(rozdel({n: int(r['HLASY_STR']) for n, r in strany[k].items()}, mandaty(k), k)
            == {n: int(r['MAND_STR']) for n, r in strany[k].items() if int(r['MAND_STR'])}
            for k in strany if mandaty(k) >= 15)
print(f'Kontrola d\'Hondta: {shoda} z {sum(1 for k in strany if mandaty(k) >= 15)} zastupitelstev s 15+ mandáty sedí')

# ── screening ────────────────────────────────────────────────────────────
podezrele = []
for k, keys in po_zast.items():
    if len(keys) < 8:
        continue
    city = defaultdict(int)
    for x in keys:
        for n, c in hlasy[x].items():
            city[n] += c
    T = sum(city.values())
    for x in keys:
        r = okrsky[x]
        u = vyuziti(r)
        h = hlasy[x]
        s = sum(h.values()) or 1
        nuly = [strany[k][n]['NAZEVCELK'] for n, c in h.items()
                if city[n] / T >= 0.10 and c / s <= 0.01]
        if median[k] - u >= 0.12 or nuly:
            podezrele.append({
                'zastupitelstvo': zast[k]['NAZEVZAST'], 'kodzastup': k, 'obec': r['OBEC'],
                'okrsek': r['OKRSEK'], 'platne_listky': int(r['PLAT_LISTKY']),
                'vyuziti_pct': round(100 * u, 1), 'median_mesta_pct': round(100 * median[k], 1),
                'chybi_hlasu_odhad': max(0, round((median[k] - u) * int(r['PLAT_LISTKY']) * mandaty(k))),
                'silna_strana_s_nulou': '; '.join(nuly),
            })
podezrele.sort(key=lambda r: r['vyuziti_pct'] - r['median_mesta_pct'])
write_csv('podezrele_okrsky.csv', podezrele)
print(f'\nPodezřelé okrsky (využití o 12+ bodů pod mediánem města nebo nula silné strany): {len(podezrele)}')

# ── dva lístky: město × městská část ─────────────────────────────────────
# lístek města a městské části mají v datech různé ID_OKRSKY, párujeme přes obec + číslo okrsku
dle_cisla = {(r['OBEC'], r['OKRSEK'], typ): key for key, r in okrsky.items() for typ in [key[1]]}
pary = []
for (idk, typ), r in okrsky.items():
    if typ != '1' or (r['OBEC'], r['OKRSEK'], '2') not in dle_cisla:
        continue
    r2 = okrsky[dle_cisla[(r['OBEC'], r['OKRSEK'], '2')]]
    if int(r['PLAT_LISTKY']) < MIN_LISTKU or int(r2['PLAT_LISTKY']) < MIN_LISTKU:
        continue
    pary.append({
        'mesto': zast[r['KODZASTUP']]['NAZEVZAST'].replace('Praha hl.m.', 'Praha'),
        'cast': zast[r2['KODZASTUP']]['NAZEVZAST'],
        'okrsek': r['OKRSEK'],
        'x': round(100 * vyuziti(r2), 1),
        'y': round(100 * vyuziti(r), 1),
    })
ZVYRAZNIT = {
    ('Ostrava', '11065'): 'Ostrava-Jih, okrsek 11065',
    ('Ostrava', '11049'): 'Ostrava-Jih, okrsek 11049',
    ('Praha', '15003'): 'Praha 15, okrsek 15003',
    ('Praha', '2038'): 'Praha 2, okrsek 2038',
    ('Brno', '23018'): 'Brno-střed, okrsek 23018',
}
for p in pary:
    p['popis'] = ZVYRAZNIT.get((p['mesto'], p['okrsek']), '')
    p['nazev'] = p['popis'] or f"{p['cast']}, okrsek {p['okrsek']}"
blizko = sum(1 for p in pary if abs(p['x'] - p['y']) <= 10)
print(f'\nDva lístky: {len(pary)} okrsků, u {blizko} ({100 * blizko / len(pary):.0f} %) se využití liší nejvýš o 10 bodů')
for p in pary:
    if p['popis']:
        print('  ', p['popis'], 'město', p['y'], '% | městská část', p['x'], '%')

POZICE = {'Praha 2, okrsek 2038': 'lu', 'Brno-střed, okrsek 23018': 'ld', 'Ostrava-Jih, okrsek 11065': 'lu'}
ostatni = [p for p in pary if not p['popis']]
zvyr = [p for p in pary if p['popis']]
TT = [
    {'field': 'nazev', 'title': 'Okrsek'},
    {'field': 'y', 'title': 'Lístek města: využito % hlasů', 'format': ',.1f'},
    {'field': 'x', 'title': 'Lístek městské části: využito % hlasů', 'format': ',.1f'},
]
dump('dva-listky.json', {
    '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
    'title': {
        'text': 'Stejní voliči, dva lístky. Pár okrsků se vymyká',
        'subtitle': 'Kolik procent svých hlasů voliči v okrsku rozdali: na lístku do zastupitelstva města '
                    '(svisle) a městské části (vodorovně). Obecní volby 2026, okrsky s 50+ lístky.',
    },
    'width': 560,
    'height': 460,
    'layer': [
        {
            'data': {'values': [{'a': 0, 'b': 0}, {'a': 100, 'b': 100}]},
            'mark': {'type': 'line', 'color': '#d4d4c8', 'strokeDash': [4, 4]},
            'encoding': {'x': {'field': 'a', 'type': 'quantitative'}, 'y': {'field': 'b', 'type': 'quantitative'}},
        },
        {
            'data': {'values': ostatni},
            'mark': {'type': 'circle', 'size': 22, 'opacity': 0.55, 'color': GREY},
            'encoding': {
                'x': {'field': 'x', 'type': 'quantitative', 'scale': {'domain': [0, 100]},
                      'axis': {'title': 'Lístek městské části (% využitých hlasů)', 'gridColor': '#e8e3d2'}},
                'y': {'field': 'y', 'type': 'quantitative', 'scale': {'domain': [0, 100]},
                      'axis': {'title': 'Lístek města (% využitých hlasů)', 'gridColor': '#e8e3d2'}},
                'tooltip': TT,
            },
        },
        {
            'data': {'values': zvyr},
            'mark': {'type': 'circle', 'size': 110, 'opacity': 1, 'color': CRIMSON, 'stroke': 'white', 'strokeWidth': 1},
            'encoding': {
                'x': {'field': 'x', 'type': 'quantitative'},
                'y': {'field': 'y', 'type': 'quantitative'},
                'tooltip': TT,
            },
        },
    ] + [
        # popisky: vpravo od bodu, u dvou blízkých bodů vlevo nad / vlevo pod
        {
            'data': {'values': [p for p in zvyr if POZICE.get(p['popis'], 'r') == poz]},
            'mark': {'type': 'text', 'align': 'left' if poz == 'r' else 'right', 'dx': 9 if poz == 'r' else -9,
                     'dy': {'r': 0, 'lu': -9, 'ld': 11}[poz], 'fontSize': 12, 'fontWeight': 'bold', 'color': INK},
            'encoding': {
                'x': {'field': 'x', 'type': 'quantitative'},
                'y': {'field': 'y', 'type': 'quantitative'},
                'text': {'field': 'popis'},
            },
        }
        for poz in ('r', 'lu', 'ld')
    ],
    '_source': 'ČSÚ – otevřená data voleb do zastupitelstev obcí 2026 (stav 11. 10. 2026), výpočet DataTimes.cz',
})

# ── pás využití ve čtyřech městech ──────────────────────────────────────
MESTA = [('554782', 'Praha'), ('582786', 'Brno'), ('554821', 'Ostrava'), ('532053', 'Kladno')]
OZN = {('554782', '2038'): 'okrsek 2038', ('554782', '3036'): 'okrsek 3036',
       ('582786', '23018'): 'okrsek 23018', ('554821', '11065'): 'okrsek 11065',
       ('532053', '29'): 'okrsek 29'}
pas = []
for k, jmeno in MESTA:
    for i, x in enumerate(sorted(po_zast[k])):
        r = okrsky[x]
        popis = OZN.get((k, r['OKRSEK']), '')
        pas.append({
            'mesto': jmeno, 'okrsek': r['OKRSEK'], 'v': round(100 * vyuziti(r), 1),
            'j': ((int(r['OKRSEK']) * 7919) % 100) / 100 - 0.5,   # deterministický rozptyl
            'popis': popis, 'nazev': f'{jmeno}, okrsek {r["OKRSEK"]}',
        })
for k, jmeno in MESTA:
    print(f'Využití {jmeno}: medián {100 * median[k]:.1f} %, okrsků {len(po_zast[k])}')
TT2 = [{'field': 'nazev', 'title': 'Okrsek'}, {'field': 'v', 'title': 'Využito % hlasů', 'format': ',.1f'}]
enc_x = {'field': 'v', 'type': 'quantitative', 'scale': {'domain': [15, 100]},
         'axis': {'title': '% hlasů, které voliči v okrsku rozdali', 'gridColor': '#e8e3d2'}}
enc_y = {'field': 'mesto', 'type': 'nominal', 'sort': [m for _, m in MESTA],
         'axis': {'title': None, 'labelFontSize': 13, 'labelFontWeight': 'bold', 'ticks': False, 'domain': False}}
dump('vyuziti-mesta.json', {
    '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
    'title': {
        'text': 'Většina okrsků rozdá přes 90 % hlasů. Pár jich z řady vypadává',
        'subtitle': 'Každá tečka je jeden volební okrsek: kolik procent hlasů, které voliči měli, '
                    'skutečně dostaly strany. Lístek do zastupitelstva města, obecní volby 2026.',
    },
    'width': 600,
    'height': 300,
    'encoding': {'y': enc_y, 'yOffset': {'field': 'j', 'type': 'quantitative', 'scale': {'domain': [-0.6, 0.6]}}},
    'layer': [
        {
            'transform': [{'filter': 'datum.popis == ""'}],
            'mark': {'type': 'circle', 'size': 20, 'opacity': 0.6, 'color': GREY},
            'encoding': {'x': enc_x, 'tooltip': TT2},
        },
        {
            'transform': [{'filter': 'datum.popis != ""'}],
            'mark': {'type': 'circle', 'size': 110, 'opacity': 1, 'color': CRIMSON, 'stroke': 'white', 'strokeWidth': 1},
            'encoding': {'x': enc_x, 'tooltip': TT2},
        },
        {
            'transform': [{'filter': 'datum.popis != ""'}],
            'mark': {'type': 'text', 'align': 'center', 'dy': -13, 'fontSize': 12, 'fontWeight': 'bold', 'color': INK},
            'encoding': {'x': enc_x, 'text': {'field': 'popis'}},
        },
    ],
    'data': {'values': pas},
    '_source': 'ČSÚ – otevřená data voleb do zastupitelstev obcí 2026 (stav 11. 10. 2026), výpočet DataTimes.cz',
})

# ── detaily vybraných okrsků a dopad na mandáty ─────────────────────────
PRIPADY = [('554821', '546135', '11065', None), ('546135', '546135', '11049', None),
           ('547387', '547387', '15003', None), ('532053', '532053', '29', 8),
           ('582786', '550973', '23018', 2), ('554782', '500089', '2038', 22),
           ('554782', '500097', '3036', 12)]
print('\nDetaily a mandáty:')
for k, obec, okr, cil in PRIPADY:
    key = next(x for x, r in okrsky.items() if r['KODZASTUP'] == k and r['OBEC'] == obec and r['OKRSEK'] == okr)
    r = okrsky[key]
    m = mandaty(k)
    druhy_key = dle_cisla.get((obec, okr, '2' if key[1] == '1' else '1'))
    druhy = okrsky[druhy_key] if druhy_key else None
    zakl = {n: int(s['HLASY_STR']) for n, s in strany[k].items()}
    a0 = rozdel(zakl, m, k)
    chybi = max(0, round((median[k] - vyuziti(r)) * int(r['PLAT_LISTKY']) * m))
    T = sum(zakl.values())
    prop = rozdel({n: v + chybi * v / T for n, v in zakl.items()}, m, k)
    print(f"\n  {zast[k]['NAZEVZAST']} – okrsek {okr}: seznam {r['VOL_SEZNAM']}, odevzdané obálky {r['ODEVZ_OBAL']}, "
          f"platné lístky {r['PLAT_LISTKY']}, hlasy {fmt(int(r['PL_HL_CELK']))}, využití {100 * vyuziti(r):.1f} % "
          f"(medián {100 * median[k]:.1f} %), chybí odhadem {fmt(chybi)} hlasů, oprava v datech: {r['OPRAVA']}")
    if druhy:
        k2 = druhy['KODZASTUP']
        h2 = hlasy[druhy_key]
        print(f"    druhý lístek ({zast[k2]['NAZEVZAST']}): využití {100 * vyuziti(druhy):.1f} %, "
              + ', '.join(f"{strany[k2][n]['ZKRATKAO30']} {c}" for n, c in sorted(h2.items())))
    print('    mandáty se při poměrném doplnění', 'NEMĚNÍ' if prop == a0 else f'MĚNÍ: {prop}')
    if cil:
        h = hlasy[key]
        print(f"    {strany[k][cil]['NAZEVCELK']}: v okrsku {h.get(cil, 0)} hlasů, ve městě {100 * zakl[cil] / T:.1f} %")
        t = dict(zakl)
        t[cil] += chybi
        a2 = rozdel(t, m, k)
        print('    i když vše chybějící dostane tato strana, mandáty se', 'NEMĚNÍ' if a2 == a0 else 'MĚNÍ')
        for add in range(0, 3 * chybi + 1, 10):
            t = dict(zakl)
            t[cil] += add
            a = rozdel(t, m, k)
            if a != a0:
                zmena = {strany[k][n]['ZKRATKAO30']: (a0.get(n, 0), a.get(n, 0))
                         for n in set(a) | set(a0) if a.get(n, 0) != a0.get(n, 0)}
                print(f'    zlom: +{fmt(add)} hlasů pro stranu → {zmena}')
                break

# Kladno: podíl KLADEŇÁKŮ v ostatních okrscích
kl = [100 * hlasy[x].get(8, 0) / sum(hlasy[x].values()) for x in po_zast['532053'] if okrsky[x]['OKRSEK'] != '29']
print(f"\nKLADEŇÁCI v ostatních {len(kl)} okrscích Kladna: {min(kl):.1f}–{max(kl):.1f} %, medián {st.median(kl):.1f} %")
ku = [100 * vyuziti(okrsky[x]) for x in po_zast['532053'] if okrsky[x]['OKRSEK'] != '29']
print(f"Využití v ostatních okrscích Kladna: {min(ku):.1f}–{max(ku):.1f} %")

# ═══ Senát: Milešín ══════════════════════════════════════════════════════
kand = [r for r in table('se_reg', 'serk.csv') if r['OBVOD'] == '51']
obce = {r['OBEC']: r['NAZEVOBCE'] for r in table('se_cis', 'secoco.csv') if r['OBVOD'] == '51'}
se = [r for r in table('se_data', 'set5.csv') if r['OBVOD'] == '51' and r['KOLO'] == '1']
print('\nSenátní obvod 51:')
for r in kand:
    print(f"  {r['CKAND']} {r['JMENO']} {r['PRIJMENI']} ({r['NAZEV_VS']}), {r['BYDLISTEN']}: {r['HLASY_K1']} hlasů, {r['PROC_K1']} %")
SOUSEDE = ['Březí', 'Heřmanov', 'Radňoves', 'Rozseč', 'Skřinářov', 'Vidonín']
mil = next(r for r in se if obce[r['OBEC']] == 'Milešín')
okoli = [r for r in se if obce[r['OBEC']] in SOUSEDE]
mv = [int(mil[f'HLASY_0{i}']) for i in range(1, 6)]
ov = [sum(int(r[f'HLASY_0{i}']) for r in okoli) for i in range(1, 6)]
rows = []
for i, r in enumerate(kand):
    jm = f"{r['JMENO']} {r['PRIJMENI']}"
    rows.append({'kandidat': jm, 'kde': 'Milešín', 'hlasu': mv[i], 'v': round(100 * mv[i] / sum(mv), 1), 'o': i})
    rows.append({'kandidat': jm, 'kde': 'šest sousedních obcí', 'hlasu': ov[i], 'v': round(100 * ov[i] / sum(ov), 1), 'o': i})
write_csv('milesin.csv', rows)
podily = sorted(((100 * int(r['HLASY_05']) / max(1, sum(int(r[f'HLASY_0{i}']) for i in range(1, 6))), obce[r['OBEC']])
                 for r in se), reverse=True)
print('  Milešín:', mv, 'okolí:', ov, '| Moos nejvýš:', [(o, round(p, 1)) for p, o in podily[:3]])
for r in okoli:
    v = [int(r[f'HLASY_0{i}']) for i in range(1, 6)]
    print(f"    {obce[r['OBEC']]}: {v}, Šmarda {100 * v[2] / sum(v):.1f} %")

TT3 = [{'field': 'kde', 'title': 'Kde'}, {'field': 'kandidat', 'title': 'Kandidát'},
       {'field': 'v', 'title': 'Podíl hlasů (%)', 'format': ',.1f'}, {'field': 'hlasu', 'title': 'Hlasů'}]
enc_y3 = {'field': 'kandidat', 'type': 'nominal', 'sort': {'field': 'o'},
          'axis': {'title': None, 'labelFontSize': 13, 'ticks': False, 'domain': False}}
dump('milesin.json', {
    '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
    'title': {
        'text': '{Milešín|' + CRIMSON + '} proti {sousedům|' + TEAL + '}: jako by si Moos a Šmarda vyměnili voliče',
        'subtitle': 'Podíl hlasů v 1. kole senátních voleb 2026. Milešín měl 33 platných hlasů, '
                    'šest sousedních obcí dohromady 378.',
    },
    'width': 560,
    'height': 230,
    'data': {'values': rows},
    'encoding': {'y': enc_y3},
    'layer': [
        {
            'mark': {'type': 'rule', 'color': '#d4d4c8', 'strokeWidth': 2},
            'encoding': {'x': {'aggregate': 'min', 'field': 'v', 'type': 'quantitative'},
                         'x2': {'aggregate': 'max', 'field': 'v'}},
        },
        {
            'mark': {'type': 'circle', 'size': 170, 'opacity': 1, 'stroke': 'white', 'strokeWidth': 1},
            'encoding': {
                'x': {'field': 'v', 'type': 'quantitative', 'scale': {'domain': [0, 45]},
                      'axis': {'title': 'podíl hlasů (%)', 'gridColor': '#e8e3d2'}},
                'color': {'field': 'kde', 'type': 'nominal', 'legend': None,
                          'scale': {'domain': ['Milešín', 'šest sousedních obcí'], 'range': [CRIMSON, TEAL]}},
                'tooltip': TT3,
            },
        },
    ],
    '_source': 'ČSÚ – otevřená data voleb do Senátu 2026, 1. kolo (stav 11. 10. 2026)',
})
print('\nHotovo: data/*.json, vstupy/*.csv')
