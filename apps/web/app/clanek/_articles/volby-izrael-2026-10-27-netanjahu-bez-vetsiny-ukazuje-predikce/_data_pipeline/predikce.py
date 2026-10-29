"""Průběh predikce DataTimes.cz během sčítání – volby do Knesetu 27. 10. 2026.

Vstup: historie živého modelu Mahdalová & Škop (API /il/api/history.json), stažená 29. 10. 2026
v 7:59 IST, 128 přepočtů od 0:24 IST 28. 10. Surová data (7 MB) jsou v archivu
statisticka-data/izrael/predikce-kneset-2026/20261029-0759/il-history-raw.json; do repa jde
jen výtah data/predikce_historie.json (13 stran nad 1 %, bloky, souboj Jašar × Likud, účast).

Pojmy (model „hybrid“, hlavní):
  coverage   = sečteno, % odhadovaných platných hlasů
  reported   = podíl strany v dosud sečtených hlasech (průběžný součet ÚVK)
  share, low, high = predikce konečného podílu a 90% interval
  seats, seat_low, seat_high = predikce mandátů a 90% interval
  margin     = Jašar minus Likud v procentních bodech (5., 50. a 95. percentil)

Spuštění:
  python -I -X utf8 predikce.py --vytah <cesta k il-history-raw.json>   # jednou, vytvoří výtah
  python -I -X utf8 predikce.py                                       # čísla do textu + grafy do ../data/
"""
import datetime as dt
import json
import sys
from pathlib import Path

HERE = Path(__file__).parent
VYTAH = HERE / 'data' / 'predikce_historie.json'

STRANY = {
    'מחל': 'Likud', 'דרך': 'Jašar', 'ודם': 'Společná kandidátka', 'רק': 'Bejachad',
    'אמת': 'Demokraté', 'ל': "Jisra'el bejtenu", 'עם': "Ra'am", 'ג': 'UTJ',
    'ב': 'Ocma jehudit', 'שס': 'Šas', 'ט': 'Náboženský sionismus', 'די': 'Záložníci',
    'ך': "Amcha Jisra'el",
}
NETANJAHU = ['מחל', 'ג', 'שס', 'ב', 'ט']
OPOZICE = ['דרך', 'רק', 'אמת', 'ל']
ARABSKE = ['ודם', 'עם']
SEC = dt.timezone(dt.timedelta(hours=1))   # Česko od 25. 10. 2026 v zimním čase
IST = dt.timezone(dt.timedelta(hours=2))   # Izrael od 25. 10. 2026 v zimním čase


def vytah(cesta):
    raw = json.load(open(cesta, encoding='utf-8'))
    r3 = lambda v: None if v is None else round(v, 3)
    out = {'zdroj': 'il/api/history.json, ' + raw['history_version'], 'historie': []}
    for x in raw['history']:
        p = x['parties']
        if not p['מחל']['models'].get('hybrid'):
            continue
        strany = {}
        for k in STRANY:
            m = p[k]['models']['hybrid']
            strany[k] = {'reported': r3(p[k]['reported']), 'share': r3(m['share']),
                         'low': r3(m['low']), 'high': r3(m['high']),
                         'seats': m['seats'], 'seat_low': m['seat_low'], 'seat_high': m['seat_high']}
        par = x['pairs']['hybrid'].get('דרך|מחל')
        t = x['turnout'].get('hybrid') or {}
        out['historie'].append({
            'at': x['at'], 'coverage': r3(x['coverage']), 'boxes_coverage': r3(x['boxes_coverage']),
            'strany': strany,
            'margin': [r3(v) for v in par['margin_quantiles_pp']] if par else None,
            'p_jasar_vede': par['ahead'] if par else None,
            'ucast': r3(t.get('projected_cast_pct')),
            'ucast_q': [r3(v) for v in t.get('conditional_quantiles_pct') or []] or None,
        })
    VYTAH.parent.mkdir(exist_ok=True)
    json.dump(out, open(VYTAH, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(f"výtah: {len(out['historie'])} přepočtů → {VYTAH}")


def main():
    H = json.load(open(VYTAH, encoding='utf-8'))['historie']
    assert len(H) == 128
    cas = lambda x: dt.datetime.fromisoformat(x['at']).astimezone(SEC)
    seats = lambda x, ks: sum(x['strany'][k]['seats'] for k in ks)
    rep = lambda x, ks: sum(x['strany'][k]['reported'] or 0 for k in ks)
    share = lambda x, ks: sum(x['strany'][k]['share'] for k in ks)

    prvni, posl = H[0], H[-1]
    print(f"Přepočtů {len(H)}: {cas(prvni):%d. %m. %H:%M} SEČ ({prvni['coverage']:.2f} % sečteno)"
          f" → {cas(posl):%d. %m. %H:%M} SEČ ({posl['coverage']:.2f} %)")

    nb = [seats(x, NETANJAHU) for x in H]
    ob = [seats(x, OPOZICE) for x in H]
    ab = [seats(x, ARABSKE) for x in H]
    print(f"Netanjahuův blok: {min(nb)}–{max(nb)} mandátů, opozice {min(ob)}–{max(ob)}, arabské strany {min(ab)}–{max(ab)}")
    assert max(nb) < 61 and max(ob) < 61, 'model by v některém přepočtu dal většinu'

    # od kdy model drží konečné rozložení bloků
    final = (nb[-1], ob[-1], ab[-1])
    i = len(H) - 1
    while i > 0 and (nb[i - 1], ob[i - 1], ab[i - 1]) == final:
        i -= 1
    print(f"Bloky {final} drží model od {cas(H[i]):%d. %m. %H:%M} SEČ, sečteno {H[i]['coverage']:.1f} %")

    print('\nVývoj (jen přepočty, kde se změnily mandáty bloků):')
    prev = None
    for x in H:
        r = (seats(x, NETANJAHU), seats(x, OPOZICE), seats(x, ARABSKE))
        if r != prev:
            L = x['strany']['מחל']
            print(f"  {cas(x):%d. %m. %H:%M} sečteno {x['coverage']:6.2f} %  bloky {r}"
                  f"  arab. strany predikce {share(x, ARABSKE):5.2f} % / průběžně {rep(x, ARABSKE):5.2f} %"
                  f"  Likud predikce {L['share']:5.2f} % [{L['low']:.2f}–{L['high']:.2f}] / průběžně {L['reported'] or 0:5.2f} %")
        prev = r

    L = [(x['strany']['מחל']['reported'] or 0) for x in H]
    print(f"\nLikud v průběžném součtu: max {max(L):.2f} %, konec {L[-1]:.2f} %;"
          f" predikce {min(x['strany']['מחל']['share'] for x in H):.2f}–{max(x['strany']['מחל']['share'] for x in H):.2f} %")
    po1 = [x for x in H if x['coverage'] >= 1]
    print(f"Od 1 % sečteno: Likud predikce {min(x['strany']['מחל']['share'] for x in po1):.2f}–"
          f"{max(x['strany']['מחל']['share'] for x in po1):.2f} %, průběžně "
          f"{min(x['strany']['מחל']['reported'] for x in po1):.2f}–{max(x['strany']['מחל']['reported'] for x in po1):.2f} %")
    jist = next(x for x in H if x['p_jasar_vede'] is not None and x['p_jasar_vede'] < 0.05)
    print(f"Likud před Jašarem s pravděpodobností nad 95 % od {cas(jist):%d. %m. %H:%M} SEČ, sečteno {jist['coverage']:.2f} %")

    print(f"\nPoslední přepočet {cas(posl):%d. %m. %H:%M} SEČ ({cas(posl).astimezone(IST):%H:%M} IST):")
    for k, n in STRANY.items():
        s = posl['strany'][k]
        print(f"  {n:22} {s['share']:5.2f} % [{s['low']:.2f}–{s['high']:.2f}]  průběžně {s['reported']:5.2f} %"
              f"  mandáty {s['seats']} ({s['seat_low']}–{s['seat_high']})")
    print(f"  Účast predikce {posl['ucast']:.1f} % (90% interval {posl['ucast_q'][0]:.1f}–{posl['ucast_q'][2]:.1f})")

    print()
    grafy(H, cas, seats, rep, share)


# barvy jen z palety (apps/web/app/providers/ThemeProvider.tsx);
# opozice × arabské strany = pár bezpečný pro barvoslepé
# barvy bloků podle dominantní barvy stran (Kateřina 29. 10. 2026): Likud modrá → brandRoyalBlue.6,
# Jašar modrá/světle modrá → brandTeal.6, Ra'am zelená a bílá → brandForestGreen.6; o stupeň tmavší odstíny kvůli kontrastu
# popisků na krémovém pozadí (≥ 4,3 : 1), ověřeno simulací barvosleposti
INK = '#101432'        # brandNavy.9 – neutrální čára a text (většina 61)
MODRA = '#5e66d5'      # brandRoyalBlue.5 – Netanjahuův blok, Likud (stejně jako na coveru)
TEAL = '#0e839e'       # brandTeal.6 – Eisenkotova opozice
ZELENA = '#507e08'     # brandForestGreen.6 – arabské strany
MRIZKA = '#e6e4dc'
NBSP = ' '
ZDROJ_GRAF = ('Predikce DataTimes.cz (Mahdalová & Škop) z průběžných výsledků '
              '[Ústřední volební komise](https://votes26.bechirot.gov.il/), 128 přepočtů 27.–29. 10. 2026')
OSA_X = {'field': 'secteno', 'type': 'quantitative', 'title': 'sečteno hlasů (%)',
         'scale': {'domain': [0, 100], 'nice': False},
         'axis': {'values': [0, 25, 50, 75, 100], 'grid': False, 'domain': False, 'tickSize': 4,
                  'labelFontSize': 12, 'titleFontSize': 12, 'titleFontWeight': 400}}


def uloz(nazev, spec):
    spec.setdefault('config', {})['view'] = {'stroke': None}
    out = HERE.parent / 'data' / nazev
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps(spec, ensure_ascii=False, indent=1), encoding='utf-8')
    print('zapsáno', nazev)


def osa_y(domena, hodnoty, label_expr=None):
    axis = {'values': hodnoty, 'grid': True, 'gridColor': MRIZKA, 'domain': False, 'ticks': False, 'labelFontSize': 12}
    if label_expr:
        axis['labelExpr'] = label_expr
    return {'type': 'quantitative', 'title': None, 'scale': {'domain': domena, 'nice': False}, 'axis': axis}


def neviditelne_body(data, y, tooltip):
    return {'data': {'values': data}, 'mark': {'type': 'point', 'opacity': 0, 'size': 80},
            'encoding': {'x': {'field': 'secteno', 'type': 'quantitative'}, 'y': {'field': y, 'type': 'quantitative'},
                         'tooltip': tooltip}}


def grafy(H, cas, seats, rep, share):
    # 1) mandáty bloků podle predikce
    B = [('Netanjahuův blok', NETANJAHU, MODRA), ('Eisenkotova opozice', OPOZICE, TEAL), ('arabské strany', ARABSKE, ZELENA)]
    body = [{'secteno': x['coverage'], 'cas': cas(x).strftime('%d. %m. %H:%M'), 'blok': n, 'mandaty': seats(x, ks), 'barva': c}
            for x in H for n, ks, c in B]
    # popisek opozice jde pod její čáru: nad ní je na mobilu málo místa do čáry Netanjahuova bloku
    konec = [{'secteno': H[-1]['coverage'], 'mandaty': seats(H[-1], ks), 'barva': c, 't': f'{n} {seats(H[-1], ks)}',
              'pod': n == 'Eisenkotova opozice'} for n, ks, c in B]
    y = dict(osa_y([0, 66], [0, 20, 40, 61]), field='mandaty')
    s = {
        '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
        'width': 'container', 'height': 300,
        'layer': [
            {'data': {'values': [{'y': 61}]},
             'mark': {'type': 'rule', 'strokeDash': [4, 3], 'color': INK, 'opacity': 0.6},
             'encoding': {'y': {'field': 'y', 'type': 'quantitative', 'scale': {'domain': [0, 66]}}}},
            {'data': {'values': [{'y': 61, 'x': 1, 't': 'většina 61'}]},
             'mark': {'type': 'text', 'align': 'left', 'baseline': 'bottom', 'dy': -4, 'fontSize': 12, 'color': INK},
             'encoding': {'y': {'field': 'y', 'type': 'quantitative'}, 'x': {'field': 'x', 'type': 'quantitative'},
                          'text': {'field': 't'}}},
            {'data': {'values': body}, 'mark': {'type': 'line', 'interpolate': 'step-after', 'strokeWidth': 2.5},
             'encoding': {'x': OSA_X, 'y': y, 'detail': {'field': 'blok'},
                          'color': {'field': 'barva', 'type': 'nominal', 'scale': None}}},
            neviditelne_body(body, 'mandaty', [
                {'field': 'cas', 'title': 'Čas (SEČ)'}, {'field': 'secteno', 'title': 'Sečteno %', 'format': '.1f'},
                {'field': 'blok', 'title': 'Blok'}, {'field': 'mandaty', 'title': 'Mandáty'}]),
            *[{'data': {'values': [k for k in konec if k['pod'] == pod]},
               'mark': {'type': 'text', 'align': 'right', 'baseline': 'top' if pod else 'bottom', 'dy': 6 if pod else -5,
                        'fontSize': 12.5, 'fontWeight': 700},
               'encoding': {'x': {'field': 'secteno', 'type': 'quantitative'}, 'y': {'field': 'mandaty', 'type': 'quantitative'},
                            'text': {'field': 't'}, 'color': {'field': 'barva', 'type': 'nominal', 'scale': None}}}
              for pod in (False, True)],
        ],
    }
    s['title'] = {
        'text': f'Predikce ani jednou nedala většinu žádnému bloku, {{arabské strany|{ZELENA}}} ale zpočátku podcenila',
        'subtitle': f'Odhad konečného počtu mandátů podle predikce DataTimes.cz během sčítání; většina ve 120členném Knesetu je 61{NBSP}mandátů',
    }
    s['_source'] = ZDROJ_GRAF
    uloz('predikce-bloky.json', s)

    # 2) průběžný součet × predikce: Likud a arabské strany
    rady = []
    for x in H:
        for n, ks, c in [('Likud', ['מחל'], MODRA), ('arabské strany', ARABSKE, ZELENA)]:
            for druh, pct in [('predikce', share(x, ks)), ('průběžný součet', rep(x, ks))]:
                rady.append({'secteno': x['coverage'], 'cas': cas(x).strftime('%d. %m. %H:%M'), 'strana': n,
                             'druh': druh, 'pct': round(pct, 2), 'barva': c, 'serie': f'{n} {druh}'})
    # pozice popisků ověřené na mobilu (375 px) i desktopu: nad vrcholem průběžného součtu Likudu,
    # pod plnou čarou Likudu a nad plnou čarou arabských stran (popisek musí skončit do pravého okraje)
    stitky = [
        {'secteno': 1, 'pct': 29.5, 't': 'Likud v průběžném součtu', 'barva': MODRA},
        {'secteno': 1, 'pct': 19.1, 't': 'Likud podle predikce', 'barva': MODRA},
        {'secteno': 38, 'pct': 16.9, 't': 'arabské strany podle predikce', 'barva': ZELENA},
        {'secteno': 24, 'pct': 3.2, 't': 'arabské strany v průběžném součtu', 'barva': ZELENA},
    ]
    y = dict(osa_y([0, 30], [0, 10, 20, 30], "datum.value + ' %'"), field='pct')

    def cara(druh, mark):
        return {'data': {'values': [r for r in rady if r['druh'] == druh]},
                'mark': dict({'type': 'line', 'interpolate': 'step-after'}, **mark),
                'encoding': {'x': OSA_X, 'y': y, 'detail': {'field': 'serie'},
                             'color': {'field': 'barva', 'type': 'nominal', 'scale': None}}}

    s = {
        '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
        'width': 'container', 'height': 300,
        'layer': [
            cara('průběžný součet', {'strokeWidth': 1.6, 'strokeDash': [5, 3]}),
            cara('predikce', {'strokeWidth': 2.8}),
            neviditelne_body(rady, 'pct', [
                {'field': 'cas', 'title': 'Čas (SEČ)'}, {'field': 'secteno', 'title': 'Sečteno %', 'format': '.1f'},
                {'field': 'strana', 'title': 'Strana'}, {'field': 'druh', 'title': 'Řada'},
                {'field': 'pct', 'title': 'Podíl hlasů %'}]),
            {'data': {'values': stitky},
             'mark': {'type': 'text', 'align': 'left', 'baseline': 'middle', 'fontSize': 12, 'fontWeight': 700},
             'encoding': {'x': {'field': 'secteno', 'type': 'quantitative'}, 'y': {'field': 'pct', 'type': 'quantitative'},
                          'text': {'field': 't'}, 'color': {'field': 'barva', 'type': 'nominal', 'scale': None}}},
        ],
    }
    s['title'] = {
        'text': f'Průběžný součet nadsazoval Likud, predikce ho od začátku viděla kolem {{21{NBSP}%|{MODRA}}}',
        'subtitle': 'Podíl platných hlasů v dosud sečtených hlasech (čárkovaně) a odhad konečného výsledku podle predikce DataTimes.cz (plnou čarou)',
    }
    s['_source'] = ZDROJ_GRAF
    uloz('predikce-prubezny-soucet.json', s)


if __name__ == '__main__':
    if len(sys.argv) == 3 and sys.argv[1] == '--vytah':
        vytah(sys.argv[2])
    else:
        main()
