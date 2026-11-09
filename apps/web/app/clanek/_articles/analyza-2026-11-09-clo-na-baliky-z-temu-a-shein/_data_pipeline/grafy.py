"""Charts and model baskets for the article on the EU duty on low-value parcels (Temu, Shein).

Item counts: Celní správa ČR has not published a monthly series; the numbers below are the ones it released
through the cited documents and agency reports (read in full on 9. 11. 2026 unless noted):
- 2023: about 3 million items (ČTK, 26. 10. 2026, https://www.ceskenoviny.cz/zpravy/2893157)
- 2024: 23 million items (Výroční zpráva o činnosti Celní správy ČR za rok 2025, p. 4)
- 2025: about 105 million items (e15, 24. 6. 2026, data of Celní správa)
- January–May 2026: over 93 million items (e15, 24. 6. 2026)
- June 13.6, July 3.6, September 2.6 million items (ČTK, 26. 10. 2026, data of Celní správa)
- July + August 2026: 6.6 million items (Celní správa ČR via dauc.cz, 29. 9. 2026) -> August = 6.6 - 3.6
Exchange rate: ČNB daily fix declared 6. 11. 2026 (valid on 9. 11. 2026, the day of calculation), downloaded
from https://www.cnb.cz/.../denni_kurz.txt?date=06.11.2026.

Run:  python -I -X utf8 grafy.py
Writes ../data/*.json and vystup.txt with every number used in the text.
"""
import json
import pathlib
import urllib.request

HERE = pathlib.Path(__file__).resolve().parent
DATA = HERE.parent / 'data'
CNB = 'https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt?date=06.11.2026'
CRIMSON, EU_BLUE, GREY, INK = '#de1743', '#6267a3', '#bcbcb0', '#101432'

out = []
def log(*a):
    out.append(' '.join(str(x) for x in a))

def cz(x, d=1):
    s = f'{x:,.{d}f}'.replace(',', ' ').replace('.', ',')
    return s.replace(' ', ' ')

# ---- exchange rate (ČNB)
with urllib.request.urlopen(CNB, timeout=60) as r:
    txt = r.read().decode('utf-8')
hlavicka = txt.splitlines()[0]
eur = next(l for l in txt.splitlines() if l.endswith('|EUR|' + l.split('|')[-1]) and '|EUR|' in l)
kurz = float(eur.split('|')[-1].replace(',', '.'))
log('ČNB', hlavicka, 'EUR', cz(kurz, 3))

# ---- Chart 1: items in consignments up to 150 EUR, monthly average per period (million)
obdobi = [
    # label, total (million items), months, after the duty?, source note
    ('2023', 3.0, 12, False, 'zhruba 3 mil. položek (ČTK)'),
    ('2024', 23.0, 12, False, '23 mil. položek (výroční zpráva Celní správy)'),
    ('2025', 105.0, 12, False, 'zhruba 105 mil. položek (e15 podle Celní správy)'),
    ('led–kvě 2026', 93.0, 5, False, 'přes 93 mil. položek (e15 podle Celní správy)'),
    ('červen 2026', 13.6, 1, False, '13,6 mil. položek (ČTK podle Celní správy)'),
    ('červenec 2026', 3.6, 1, True, '3,6 mil. položek (ČTK podle Celní správy)'),
    ('srpen 2026', round(6.6 - 3.6, 1), 1, True, 'dopočet: červenec a srpen 6,6 mil. (Celní správa), z toho červenec 3,6 mil.'),
    ('září 2026', 2.6, 1, True, '2,6 mil. položek (ČTK podle Celní správy)'),
]
v1 = []
for i, (lab, tot, mes, clo, zdroj) in enumerate(obdobi):
    prumer = tot / mes
    v1.append({'obdobi': lab, 'poradi': i, 'prumer': round(prumer, 2), 'clo': 'od zavedení cla' if clo else 'před clem',
               't_prumer': f'{cz(prumer)} mil.', 't_celkem': f'{cz(tot)} mil.', 'zdroj': zdroj})
    log('položky', lab, 'celkem', cz(tot), 'průměr/měsíc', cz(prumer, 2))
cerven, zari = 13.6, 2.6
pokles = 1 - zari / cerven
log('pokles červen→září', cz(100 * pokles), '%')
log('září vs průměr leden–květen', cz(100 * (1 - zari / (93 / 5))), '% méně')
log('září vs průměr 2025', cz(100 * (1 - zari / (105 / 12))), '% méně')
log('pololetí 2026 (I–V + VI)', cz(93 + 13.6), 'mil. vs 2025', cz(105))
y1 = {'field': 'obdobi', 'type': 'nominal', 'sort': [o[0] for o in obdobi],
      'axis': {'title': None, 'domain': False, 'ticks': False, 'labelFontSize': 12, 'labelLimit': 200}}
tt1 = [{'field': 'obdobi', 'title': 'Období'}, {'field': 't_prumer', 'title': 'Průměr za měsíc'},
       {'field': 't_celkem', 'title': 'Za celé období'}, {'field': 'zdroj', 'title': 'Zdroj'}]
chart1 = {
    '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
    'title': {
        'text': f'Po zavedení cla {{od 1. července|{CRIMSON}}} spadl počet položek v levných zásilkách na necelou pětinu června',
        'subtitle': 'Položky zboží v zásilkách do 150 eur dovezených do Česka ze zemí mimo EU, průměr za měsíc v milionech',
    },
    'width': 'container', 'height': {'step': 30},
    'config': {'view': {'stroke': None}},
    'data': {'values': v1},
    'encoding': {
        'y': y1,
        'x': {'field': 'prumer', 'type': 'quantitative', 'scale': {'domain': [0, 20]},
              'axis': {'title': None, 'grid': False, 'domain': False, 'ticks': False, 'values': [0, 5, 10, 15, 20],
                       'labelExpr': "datum.value + ' mil.'"}},
        'color': {'field': 'clo', 'type': 'nominal', 'scale': {'domain': ['před clem', 'od zavedení cla'], 'range': [EU_BLUE, CRIMSON]}, 'legend': None},
        'tooltip': tt1,
    },
    'layer': [
        {'mark': {'type': 'bar', 'cornerRadiusEnd': 3, 'height': {'band': 0.72}}},
        {'mark': {'type': 'text', 'align': 'left', 'dx': 5, 'fontWeight': 700, 'fontSize': 11},
         'encoding': {'text': {'field': 'prumer', 'type': 'quantitative', 'format': '.1f'}, 'color': {'value': INK}}},
    ],
    '_source': ('Celní správa ČR podle [ČTK, 26. 10. 2026](https://www.ceskenoviny.cz/zpravy/2893157), '
                '[e15, 24. 6. 2026](https://www.e15.cz/byznys/obchod-a-sluzby/cesi-vykoupili-temu-pocet-levnych-zasilek-z-ciny-letos-prudce-stoupl-ted-je-nakupum-za-par-korun-konec-1433805) '
                'a [výroční zprávy Celní správy za rok 2025](https://celnisprava.gov.cz/cz/statistiky/Documents/V%C3%BDro%C4%8Dn%C3%AD%20zpr%C3%A1va%20o%20%C4%8Dinnosti%20Celn%C3%AD%20spr%C3%A1vy%20%C4%8CR%20za%20tok%20%202025.pdf); '
                'srpen dopočten z údaje za červenec a srpen 2026; výpočet DataTimes'),
}

# ---- Chart 2: model baskets (duty 3 EUR + handling fee 2 EUR per item, fully passed on, price incl. VAT)
CLO, POPLATEK = 3, 2
kosiky = [('1 věc za 150 Kč', 1, 150), ('5 věcí po 100 Kč', 5, 100), ('10 věcí po 200 Kč', 10, 200)]
v2 = []
for i, (lab, n, cena) in enumerate(kosiky):
    zbozi = n * cena
    clo = n * CLO * kurz
    pop = n * POPLATEK * kurz
    po7 = zbozi + clo
    po11 = po7 + pop
    narust = 100 * (po11 / zbozi - 1)
    log('košík', lab, 'zboží', cz(zbozi, 2), 'od 1. 7.', cz(po7, 2), 'od 1. 11.', cz(po11, 2),
        'clo+poplatek', cz(clo + pop, 2), 'zdražení', cz(narust), '%')
    for k, (slozka, castka) in enumerate([('cena zboží', zbozi), ('clo 3 € za položku', clo), ('poplatek 2 € za položku', pop)]):
        v2.append({'kosik': lab, 'poradi': i, 'slozka': slozka, 'sp': k, 'castka': round(castka, 2),
                   'celkem': round(po11, 2), 'narust': f'+{narust:.0f} %',
                   't_zbozi': f'{cz(zbozi, 0)} Kč', 't_po7': f'{cz(po7, 0)} Kč', 't_po11': f'{cz(po11, 0)} Kč',
                   'popisek': f'{cz(po11, 0)} Kč (+{narust:.0f} %)'})
log('DPH z cla na položku (21 % ze 3 €)', cz(0.21 * CLO * kurz, 2), 'Kč')
y2 = {'field': 'kosik', 'type': 'nominal', 'sort': [k[0] for k in kosiky],
      'axis': {'title': None, 'domain': False, 'ticks': False, 'labelFontSize': 12, 'labelLimit': 200}}
tt2 = [{'field': 'kosik', 'title': 'Nákup'}, {'field': 't_zbozi', 'title': 'Do 30. 6. 2026'},
       {'field': 't_po7', 'title': 'Od 1. 7. (clo 3 €)'}, {'field': 't_po11', 'title': 'Od 1. 11. (+ poplatek 2 €)'},
       {'field': 'narust', 'title': 'Zdražení celkem'}]
slozky = ['cena zboží', 'clo 3 € za položku', 'poplatek 2 € za položku']
kurz_txt = cz(kurz, 3)
chart2 = {
    '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
    'title': {
        'text': f'{{Clo|{CRIMSON}}} a {{poplatek|{EU_BLUE}}} zdraží levný nákup z Číny o 61 až 122 %',
        'subtitle': f'Cena modelového nákupu v korunách od 1. listopadu 2026; každá věc je jiný druh zboží, tedy jiná položka. Prodejce clo i poplatek přenese na zákazníka (kurz ČNB {kurz_txt} Kč/€)',
    },
    'width': 'container', 'height': {'step': 44},
    'config': {'view': {'stroke': None}},
    'data': {'values': v2},
    '_toggle_legend': True,
    'encoding': {'color': {'field': 'slozka', 'type': 'nominal', 'sort': slozky, 'legend': None,
                           'scale': {'domain': slozky, 'range': [GREY, CRIMSON, EU_BLUE]}}},
    'layer': [
        {'mark': {'type': 'bar', 'height': {'band': 0.7}},
         'encoding': {'y': y2,
                      'x': {'field': 'castka', 'type': 'quantitative', 'stack': 'zero', 'scale': {'domain': [0, 4000]},
                            'axis': {'title': None, 'grid': False, 'domain': False, 'ticks': False, 'values': [0, 1000, 2000, 3000, 4000],
                                     'labelExpr': "format(datum.value, ',') + ' Kč'"}},
                      'order': {'field': 'sp'}, 'tooltip': tt2}},
        {'transform': [{'filter': 'datum.sp == 0'}],
         'mark': {'type': 'text', 'align': 'left', 'dx': 5, 'fontWeight': 700, 'fontSize': 11},
         'encoding': {'y': y2, 'x': {'field': 'celkem', 'type': 'quantitative'}, 'text': {'field': 'popisek'},
                      'color': {'value': INK}, 'tooltip': tt2}},
    ],
    '_source': f'Výpočet DataTimes: clo 3 € a poplatek 2 € za každou položku, kurz ČNB vyhlášený 6. 11. 2026 ({kurz_txt} Kč/€); cena zboží včetně DPH, bez DPH z cla',
}

DATA.mkdir(exist_ok=True)
for name, spec in [('polozky-zasilky-do-150-eur', chart1), ('modelove-kosiky', chart2)]:
    (DATA / f'{name}.json').write_text(json.dumps(spec, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(HERE / 'vystup.txt').write_text('\n'.join(out) + '\n', encoding='utf-8')
print('\n'.join(out))
