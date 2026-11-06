# Přesuny voličů mezi sněmovními volbami 2021 a 2025 po krajích: všechna čísla článku, graf a Sankey.
#
# Zdroj: odhad přesunů voličů, model ekologické inference Michala Škopa (zásilka 4. 11. 2026, N-17), jeden soubor
# na kraj: vstup/presuny_NN_<kraj>.csv (sloupce Volby 2021, Volby 2025, Přesuny). Čísla jsou odhady modelu
# zaokrouhlené na tisíce (malé toky na 1 000, 2 000 nebo 5 000), proto v textu jen zaokrouhlená čísla a podíly.
# Model stojí na výsledcích ve volebních okrscích (ČSÚ); kontrolu odhadu proti skutečným výsledkům po okrscích
# obsahují Michalovy soubory region_NN_points.csv (nejsou součástí repa).
#
# Spuštění: python vypocet.py → vystup.txt, ../data/pirstan-kraje.json a ../data/odkud-strany.json (Vega-Lite), ../sankey.html (Sankey)
import csv, json, sys
from collections import defaultdict
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
H = Path(__file__).resolve().parent
ART = H.parent
OUT = []
def p(*a): OUT.append(' '.join(str(x) for x in a))
def tis(v): return f'{round(v / 1000):,}'.replace(',', ' ') + ' tis.'
def pct(a, b): return f'{a / b * 100:.0f} %'

KRAJE = ['Hlavní město Praha', 'Středočeský', 'Jihočeský', 'Plzeňský', 'Karlovarský', 'Ústecký', 'Liberecký',
         'Královéhradecký', 'Pardubický', 'Vysočina', 'Jihomoravský', 'Olomoucký', 'Zlínský', 'Moravskoslezský']
KR = {'Hlavní město Praha': 'Praha', 'Vysočina': 'Vysočina'}
kraj_kratce = lambda k: KR.get(k, k + ' kraj')

toky = {}
for i, k in enumerate(KRAJE, 1):
    f = sorted((H / 'vstup').glob(f'presuny_{i:02d}_*.csv'))
    assert len(f) == 1, (i, f)
    t = defaultdict(int)
    for r in csv.DictReader(open(f[0], encoding='utf-8-sig')):
        t[(r['Volby 2021'].strip(), r['Volby 2025'].strip())] += int(float(r['Přesuny']))
    toky[k] = dict(t)
cr = defaultdict(int)
for t in toky.values():
    for kl, v in t.items():
        cr[kl] += v
toky['Česko'] = dict(cr)

L = sorted({a for a, _ in cr}); R = sorted({b for _, b in cr})
p('strany 2021:', L); p('strany 2025:', R)

def do(t, s): return {a: v for (a, b), v in t.items() if b == s}
def z(t, s): return {b: v for (a, b), v in t.items() if a == s}

# ── ANO: odkud přišli voliči 2025 a kam odešli voliči 2021 ──────────────────
PUVOD = ['ANO', 'Nevoliči', 'SPD', 'SOCDEM', 'KSČM', 'Přísaha', 'SPOLU', 'PirSTAN', 'Ostatní']
p('\n' + '=' * 78 + '\nANO 2025: ODKUD PŘIŠLI VOLIČI (odhad modelu, zaokrouhleno)\n' + '=' * 78)
radky = []
for k in ['Česko'] + KRAJE:
    t = toky[k]
    d = do(t, 'ANO'); celk = sum(d.values()); drz = d.get('ANO', 0)
    zano = z(t, 'ANO'); ano21 = sum(zano.values())
    p(f"\n{k}: voliči ANO 2025 ≈ {tis(celk)}; z nich volili ANO už 2021 {tis(drz)} ({pct(drz, celk)}), noví {tis(celk - drz)} ({pct(celk - drz, celk)})")
    p('   noví odkud: ' + ', '.join(f"{a} {tis(v)} ({pct(v, celk)})" for a, v in sorted(d.items(), key=lambda x: -x[1]) if a != 'ANO'))
    p(f"   voliči ANO 2021 ≈ {tis(ano21)}; zůstali {tis(zano.get('ANO', 0))} ({pct(zano.get('ANO', 0), ano21)}); odešli: "
      + ', '.join(f"{b} {tis(v)}" for b, v in sorted(zano.items(), key=lambda x: -x[1]) if b != 'ANO'))
    p(f"   bilance ANO: přišlo {tis(celk - drz)}, odešlo {tis(ano21 - zano.get('ANO', 0))}")
    # do grafu jen hlavní zdroje; Přísaha, SPOLU, PirSTAN a ostatní (celostátně asi 4 %) jako „ostatní“, ať se legenda vejde i na mobil
    skup = {'ANO': 'ANO už 2021', 'Nevoliči': 'nevoliči', 'SPD': 'SPD', 'SOCDEM': 'SOCDEM', 'KSČM': 'KSČM'}
    sg = defaultdict(int)
    for a, v in d.items():
        sg[skup.get(a, 'ostatní')] += v
    for i, g in enumerate(['ANO už 2021', 'nevoliči', 'SPD', 'SOCDEM', 'KSČM', 'ostatní']):
        radky.append(dict(kraj=k if k == 'Česko' else kraj_kratce(k).replace(' kraj', ''), puvod=g, v=sg[g], podil=round(sg[g] / celk * 100, 1), poradi=i))

# pořadí krajů podle podílu nevoličů mezi voliči ANO 2025
p('\nPodíl bývalých nevoličů mezi voliči ANO 2025 (sestupně):')
nev = sorted(((k, do(toky[k], 'ANO').get('Nevoliči', 0) / sum(do(toky[k], 'ANO').values())) for k in KRAJE), key=lambda x: -x[1])
for k, v in nev:
    p(f"   {k:20} {v * 100:4.1f} %")
p('\nPodíl bývalých voličů SPD mezi voliči ANO 2025 (sestupně):')
for k, v in sorted(((k, do(toky[k], 'ANO').get('SPD', 0) / sum(do(toky[k], 'ANO').values())) for k in KRAJE), key=lambda x: -x[1]):
    p(f"   {k:20} {v * 100:4.1f} %")
p('\nPodíl bývalých voličů SOCDEM a KSČM mezi voliči ANO 2025 (sestupně):')
for k, v in sorted(((k, (do(toky[k], 'ANO').get('SOCDEM', 0) + do(toky[k], 'ANO').get('KSČM', 0)) / sum(do(toky[k], 'ANO').values())) for k in KRAJE), key=lambda x: -x[1]):
    p(f"   {k:20} {v * 100:4.1f} %")
p('\nKam odešli voliči ANO 2021 (podíl z voličů ANO 2021, ČR):')
zano = z(cr, 'ANO'); a21 = sum(zano.values())
for b, v in sorted(zano.items(), key=lambda x: -x[1]):
    p(f"   {b:12} {tis(v):>12} {v / a21 * 100:5.1f} %")

# největší přesuny v ČR
p('\nNejvětší přesuny v ČR (mimo setrvání a nevoliče → nevoliče):')
for (a, b), v in sorted(cr.items(), key=lambda x: -x[1]):
    if a != b and v >= 100000:
        p(f"   {a} → {b}: {tis(v)}")


(H / 'vystup.txt').write_text('\n'.join(OUT) + '\n', encoding='utf-8')
print('\n'.join(OUT))

# ── Sankey 2021 → 2025: Česko a kraje (sankey.html → <HtmlEmbed wide>) ───────
# Stejný styl jako Sankey v článku o koalicích (5. 11. 2026): kreslí se podle šířky článku, strany abecedně
# (Ostatní a nevoliči na konci), přechod barvy strana 2021 → šedá → strana 2025, tooltip v našem stylu,
# klik na stranu zvýrazní její toky a ukáže čísla; navíc přepínač Česko / kraje.
BARVA_S = {'ANO': '#272a59', 'SPOLU': '#5e66d5', 'PirSTAN': '#a03250', 'STAN': '#ff1a4a', 'Piráti': '#111111',
           'SPD': '#a47d03', 'Motoristé': '#1a9fbd', 'Stačilo!': '#c5143c', 'SOCDEM': '#f76800', 'KSČM': '#c5143c',
           'Přísaha': '#a9b5f0', 'Ostatní': '#c3c6d8', 'Nevoliči': '#dfe1ea'}
KONEC = ['Ostatní', 'Nevoliči']
abc = lambda ss: sorted([s for s in ss if s not in KONEC], key=str.casefold) + [s for s in KONEC if s in ss]
SK = dict(L=abc(L), R=abc(R), barvy=BARVA_S, oblasti=[])
for k in ['Česko'] + KRAJE:
    SK['oblasti'].append(dict(n='Česko' if k == 'Česko' else kraj_kratce(k).replace(' kraj', ''),
                              t=[[a, b, v] for (a, b), v in sorted(toky[k].items())]))
SK_JS = (H / 'sankey.js').read_text(encoding='utf-8')
ALT = ('Sankeyův diagram přesunů voličů mezi sněmovními volbami 2021 a 2025 podle odhadu modelu, pro Česko a pro jednotlivé kraje. '
       'K ANO přešlo nejvíc lidí, kteří v roce 2021 nevolili, a voličů SPD a SOCDEM.')
(ART / 'sankey.html').write_text(
    f'<div class="dt-sankey2" data-alt="{ALT}" style="width:100%;min-height:560px"></div>\n'
    f'<script>{SK_JS.replace("__DATA__", json.dumps(SK, ensure_ascii=False))}</script>\n', encoding='utf-8')
p('sankey zapsán: sankey.html; pořadí 2021:', SK['L'], '2025:', SK['R'])
(H / 'vystup.txt').write_text('\n'.join(OUT) + '\n', encoding='utf-8')

# ── Podklad pro cover (motiv Sankey za celé Česko) ──────────────────────────
(ART / '_cover_pipeline').mkdir(exist_ok=True)
(ART / '_cover_pipeline' / 'toky-cr.json').write_text(json.dumps(dict(L=SK['L'], R=SK['R'], barvy=BARVA_S,
    t=[[a, b, v] for (a, b), v in sorted(cr.items())]), ensure_ascii=False, indent=0), encoding='utf-8')

# ── Všechny strany: kam šli voliči koalic 2021, odkud mají voliče strany 2025 ──
# (Kateřina 6. 11. 2026: článek o všech stranách po krajích, ne jen o ANO)
p('\n' + '=' * 78 + '\nVŠECHNY STRANY (odhad modelu, zaokrouhleno)\n' + '=' * 78)
for s21 in ['PirSTAN', 'SPOLU', 'SPD']:
    p(f'\nKam šli voliči {s21} 2021:')
    for k in ['Česko'] + KRAJE:
        d = z(toky[k], s21); c = sum(d.values())
        p(f"   {k:20} {tis(c):>10}  " + ', '.join(f"{b} {v / c * 100:.0f} %" for b, v in sorted(d.items(), key=lambda x: -x[1])[:5]))
for s25 in ['STAN', 'Piráti', 'Motoristé', 'Stačilo!']:
    d = do(cr, s25); c = sum(d.values())
    p(f"\nOdkud voliči {s25} 2025 (ČR, {tis(c)}): " + ', '.join(f"{a} {v / c * 100:.0f} %" for a, v in sorted(d.items(), key=lambda x: -x[1])))

# Graf 1: kam šli voliči Pirátů a Starostů z roku 2021, po krajích (100% pruhy)
KAM = ['Piráti', 'STAN', 'SPOLU', 'Nevoliči', 'ostatní']
B1 = {'Piráti': '#111111', 'STAN': '#ff1a4a', 'SPOLU': '#5e66d5', 'Nevoliči': '#8f9dc9', 'ostatní': '#c3c6d8'}
r1 = []
for k in ['Česko'] + KRAJE:
    d = z(toky[k], 'PirSTAN'); c = sum(d.values()); sg = defaultdict(int)
    for b, v in d.items():
        sg[b if b in KAM else 'ostatní'] += v
    for i, g in enumerate(KAM):
        r1.append(dict(kraj=k if k == 'Česko' else kraj_kratce(k).replace(' kraj', ''), kam='nevoliči' if g == 'Nevoliči' else g,
                       podil=round(sg[g] / c * 100, 1), poradi=i))
pir = lambda k: z(toky[k], 'PirSTAN').get('Piráti', 0) / sum(z(toky[k], 'PirSTAN').values())
POR1 = ['Česko'] + [kraj_kratce(k).replace(' kraj', '') for k in sorted(KRAJE, key=lambda k: -pir(k))]
def pruhy(rows, pole, barvy, poradi_y, titul, podtitul, osa_y):
    dom = list(barvy)
    return {
        '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
        'title': {'text': titul, 'subtitle': podtitul},
        '_source': 'Odhad přesunů voličů mezi sněmovními volbami 2021 a 2025 (ekologická inference, Michal Škop) z výsledků ČSÚ ve 14 532 okrscích; výpočet DataTimes.cz',
        'config': {'view': {'stroke': None}},
        'width': 600, 'height': 30 * len(poradi_y),
        'data': {'values': rows},
        'mark': {'type': 'bar', 'stroke': '#ffffff', 'strokeWidth': 1},
        'encoding': {
            'y': {'field': osa_y, 'type': 'nominal', 'sort': poradi_y, 'axis': {'title': None, 'domain': False, 'ticks': False, 'labelFontSize': 13,
                  'labelFontWeight': {'expr': "datum.value == 'Česko' ? 800 : 500"}}},
            'x': {'field': 'podil', 'type': 'quantitative', 'stack': 'normalize',
                  'axis': {'title': None, 'format': '.0%', 'values': [0, 0.25, 0.5, 0.75, 1], 'grid': False, 'domain': False, 'ticks': False}},
            'color': {'field': pole, 'type': 'nominal', 'scale': {'domain': [d if d != 'Nevoliči' else 'nevoliči' for d in dom], 'range': list(barvy.values())},
                      'legend': {'title': None, 'orient': 'top', 'columns': 3}},
            'order': {'field': 'poradi', 'type': 'quantitative'},
            'tooltip': [{'field': osa_y, 'title': 'Oblast' if osa_y == 'kraj' else 'Strana 2025'}, {'field': pole, 'title': 'Kam' if pole == 'kam' else 'Odkud'},
                        {'field': 'podil', 'title': 'Podíl (%)', 'format': '.0f'}],
        },
    }
spec1 = pruhy(r1, 'kam', B1, POR1, 'V Praze volili Piráty, ve středních Čechách STAN',
              'Odhad modelu: koho volili v roce 2025 lidé, kteří v roce 2021 volili koalici Pirátů a Starostů (%). Kraje podle podílu Pirátů', 'kraj')
spec1['encoding']['color']['legend']['columns'] = 2  # dlouhé názvy krajů ubírají místo, na mobilu by třetí sloupec vyčníval
(ART / 'data' / 'pirstan-kraje.json').write_text(json.dumps(spec1, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')

# Graf 2: z koho se skládají voliči stran v roce 2025 (Česko)
ODKUD = ['ANO', 'SPOLU', 'PirSTAN', 'SPD', 'KSČM', 'SOCDEM', 'Nevoliči', 'ostatní']
B2 = {g: (BARVA_S[g] if g in BARVA_S else '#c3c6d8') for g in ODKUD}
B2['Nevoliči'] = '#8f9dc9'
r2 = []
STRANY25 = abc([s for s in R if s not in ('Nevoliči', 'Ostatní')])
for s25 in STRANY25:
    d = do(cr, s25); c = sum(d.values()); sg = defaultdict(int)
    for a, v in d.items():
        sg[a if a in ODKUD else 'ostatní'] += v
    for i, g in enumerate(ODKUD):
        r2.append(dict(strana=s25, odkud='nevoliči' if g == 'Nevoliči' else g, podil=round(sg[g] / c * 100, 1), poradi=i))
spec2 = pruhy(r2, 'odkud', B2, STRANY25, 'Motoristé získali voliče od všech stran, Stačilo! hlavně od komunistů',
              'Odhad modelu: koho volili v roce 2021 voliči jednotlivých stran v roce 2025 (%), celé Česko', 'strana')
(ART / 'data' / 'odkud-strany.json').write_text(json.dumps(spec2, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
p('\ngrafy zapsány: data/pirstan-kraje.json, data/odkud-strany.json')
(H / 'vystup.txt').write_text('\n'.join(OUT) + '\n', encoding='utf-8')
