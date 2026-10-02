"""Vega-Lite specy pro článek (styl jako volby-cr-2026-08-27-nejmene-kandidatu…)."""
import json, os
import pandas as pd
from load import YEARS, rd
from build import cat, allz, ALLY  # noqa  (build.py při importu přepočítá serie + mapu)

OUT = 'out/data'
os.makedirs(OUT, exist_ok=True)
SRC = 'volby.gov.cz – otevřená data a výsledky komunálních voleb 1994–2026, řádný termín, zastupitelstva obcí (bez městských částí)'

C_ALL = '#6e227d'    # brandAmethyst.7 – jediná kandidátka, zvoleni všichni
C_NAHR = '#c49ad8'   # brandAmethyst.3 – jediná kandidátka s náhradníky
C_MULTI = '#ff934d'  # brandOrange.4 – víc kandidátek, ale zvoleni všichni
C_NONE = '#de1743'   # brand.6 – nikdo nekandidoval
C_SOUT = '#bcbcb0'   # background.9 – soutěž
NAVY = '#272a59'

LBL = {2: 'Jediná kandidátka, zvoleni všichni', 1: 'Jediná kandidátka s náhradníky',
       3: 'Víc kandidátek, ale zvoleni všichni', 4: 'Nikdo nekandidoval'}


def save(name, spec, hide_mode=None):
    # klikací (vypínací) legenda = sdílený ChartLegend; nativní legendu Vegy vypínáme
    spec['encoding']['color']['legend'] = None
    spec['_toggle_legend'] = True
    if hide_mode:
        spec['_legend_hide_mode'] = hide_mode
    json.dump(spec, open(f'{OUT}/{name}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


# ---------- 1) vývoj 1994–2026: podíl obcí podle kategorie ----------
rows = []
for y in ALLY:
    d = allz[allz.YEAR == y]
    n = len(d)
    for i, c in enumerate([2, 1, 3, 4]):
        k = int((d.kat == c).sum())
        rows.append(dict(rok=str(y), kat=LBL[c], ord=i, n=k, obci=n, pct=round(k / n * 100, 1)))
save('vyvoj', {
    '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
    'title': {'text': 'Obcí s jedinou kandidátkou je skoro třikrát víc než v roce 1994',
              'subtitle': 'Podíl obcí (%) s jedinou kandidátkou nebo s předem jistým výsledkem, komunální volby 1994–2026'},
    'width': 600, 'height': 340,
    'data': {'values': rows},
    'mark': {'type': 'bar', 'width': {'band': 0.7}},
    'encoding': {
        'x': {'field': 'rok', 'type': 'ordinal', 'axis': {'title': None, 'labelAngle': 0}},
        'y': {'field': 'pct', 'type': 'quantitative', 'stack': 'zero', 'axis': {'title': None, 'format': '.0f', 'labelExpr': "datum.label + ' %'"}},
        'color': {'field': 'kat', 'type': 'nominal',
                  'scale': {'domain': [LBL[2], LBL[1], LBL[3], LBL[4]], 'range': [C_ALL, C_NAHR, C_MULTI, C_NONE]},
                  'legend': {'title': None, 'orient': 'top', 'direction': 'vertical', 'columns': 2, 'labelLimit': 400}},
        'order': {'field': 'ord', 'type': 'quantitative'},
        'tooltip': [{'field': 'rok', 'title': 'Volby'}, {'field': 'kat', 'title': 'Typ obce'},
                    {'field': 'n', 'title': 'Obcí', 'format': ',.0f'}, {'field': 'pct', 'title': '% všech obcí', 'format': '.1f'}],
    },
    '_source': SRC,
}, hide_mode='filter')

# ---------- 2) podle velikosti obce ----------
bins = [0, 200, 500, 1000, 2000, 10**9]
lab = ['do 199 obyvatel', '200–499', '500–999', '1 000–1 999', '2 000 a víc']
zz = allz[allz.YEAR >= 2002].copy()
zz['vel'] = pd.cut(zz.POCOBYV.astype(float), bins, labels=lab, right=False)
rows = []
for (y, v), d in zz.groupby(['YEAR', 'vel'], observed=True):
    k = int(d.kat.isin([1, 2]).sum())
    rows.append(dict(rok=str(y), vel=v, n=k, obci=len(d), pct=round(k / len(d) * 100, 1)))
VCOL = ['#351040', '#6e227d', '#9f319e', '#b57ac8', '#c49ad8']  # brandAmethyst 9,7,6,4,3
save('velikost', {
    '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
    'title': {'text': 'Jediná kandidátka přibývá ve vesnicích i ve větších obcích',
              'subtitle': 'Podíl obcí s jedinou kandidátkou (%) podle počtu obyvatel'},
    'width': 600, 'height': 340,
    'data': {'values': rows},
    'encoding': {
        'x': {'field': 'rok', 'type': 'ordinal', 'axis': {'title': None, 'labelAngle': 0}},
        'y': {'field': 'pct', 'type': 'quantitative', 'axis': {'title': None, 'labelExpr': "datum.label + ' %'"}},
        'color': {'field': 'vel', 'type': 'nominal', 'scale': {'domain': lab, 'range': VCOL},
                  'legend': {'title': 'Velikost obce', 'orient': 'top', 'direction': 'horizontal', 'labelLimit': 400}},
    },
    'layer': [
        {'mark': {'type': 'line', 'strokeWidth': 2.5}},
        {'mark': {'type': 'point', 'filled': True, 'size': 55},
         'encoding': {'tooltip': [{'field': 'rok', 'title': 'Volby'}, {'field': 'vel', 'title': 'Velikost obce'},
                                  {'field': 'n', 'title': 'Obcí s jedinou kandidátkou', 'format': ',.0f'},
                                  {'field': 'obci', 'title': 'Obcí celkem', 'format': ',.0f'},
                                  {'field': 'pct', 'title': '%', 'format': '.1f'}]}},
    ],
    '_source': 'volby.gov.cz – otevřená data komunálních voleb 2002–2026 (počet obyvatel uvádí ČSÚ k danému roku), řádný termín',
})

# ---------- 3) volební účast: komunální 2022 × sněmovní 2025 ----------
m = pd.read_pickle('zt.pkl')
m = m[m.YEAR == 2022].copy()
m['kat'] = [cat(l, k, mm) for l, k, mm in zip(m.LISTY, m.KAND, m.MANDATY)]
m['skup'] = m.kat.map({0: 'Soutěž víc kandidátek', 1: 'Jediná kandidátka s náhradníky', 2: 'Jediná kandidátka, zvoleni všichni'})
m = m[m.skup.notna()]
ps = pd.read_csv('ps/PS2025data20251005/csv/pst4.csv', sep=';', encoding='cp1250', dtype=str)
ps = ps[ps.TYP_FORM == '1']
for c in ['VOL_SEZNAM', 'VYD_OBALKY']:
    ps[c] = ps[c].astype(int)
ps = ps.groupby('OBEC')[['VOL_SEZNAM', 'VYD_OBALKY']].sum().add_suffix('_ps')
m = m.merge(ps, left_on='OBEC', right_index=True)
m['vel'] = pd.cut(m.POCOBYV, bins, labels=lab, right=False)
SK = ['Jediná kandidátka, zvoleni všichni', 'Jediná kandidátka s náhradníky', 'Soutěž víc kandidátek']
rows = []
for (v, s), d in m.groupby(['vel', 'skup'], observed=True):
    if len(d) < 20:
        continue  # málo obcí – nespolehlivé
    rows.append(dict(vel=v, skup=s, volby='Komunální 2022', obci=len(d),
                     ucast=round(d.VYD_OBALKY.sum() / d.VOL_SEZNAM.sum() * 100, 1)))
    rows.append(dict(vel=v, skup=s, volby='Sněmovní 2025', obci=len(d),
                     ucast=round(d.VYD_OBALKY_ps.sum() / d.VOL_SEZNAM_ps.sum() * 100, 1)))
pd.DataFrame(rows).to_csv('out/ucast.csv', index=False)


def ucast_spec(volby, title):
    return {
        '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
        'title': {'text': title},
        'width': 300, 'height': 280,
        'data': {'values': [r for r in rows if r['volby'] == volby]},
        'mark': {'type': 'bar'},
        'encoding': {
            'x': {'field': 'vel', 'type': 'ordinal', 'sort': lab, 'axis': {'title': None, 'labelAngle': -30}},
            'xOffset': {'field': 'skup', 'sort': SK},
            'y': {'field': 'ucast', 'type': 'quantitative', 'scale': {'domain': [0, 85]},
                  'axis': {'title': None, 'labelExpr': "datum.label + ' %'"}},
            'color': {'field': 'skup', 'type': 'nominal', 'scale': {'domain': SK, 'range': [C_ALL, C_NAHR, C_SOUT]},
                      'legend': {'title': None, 'orient': 'top', 'direction': 'vertical', 'labelLimit': 400}},
            'tooltip': [{'field': 'vel', 'title': 'Velikost obce'}, {'field': 'skup', 'title': 'Typ obce v KV 2022'},
                        {'field': 'obci', 'title': 'Obcí', 'format': ',.0f'}, {'field': 'ucast', 'title': 'Účast %', 'format': '.1f'}],
        },
    }


save('ucast_kv2022', ucast_spec('Komunální 2022', 'Komunální volby 2022'), hide_mode='filter')
sp = ucast_spec('Sněmovní 2025', 'Sněmovní volby 2025')
save('ucast_ps2025', sp, hide_mode='filter')

# ---------- 4) stejní lidé: podíl zvolených, kteří seděli v zastupitelstvu už předchozí období ----------
C, E = {}, {}
for y in YEARS:
    rk = rd(y, 'kvrk')
    if 'DATUMVOLEB' in rk:
        rk = rk[rk.DATUMVOLEB == rk.DATUMVOLEB.mode()[0]]
    rk = rk[rk.PLATNOST == 'A'].copy()
    rk['k'] = rk.KODZASTUP + '|' + rk.JMENO.str.strip().str.lower() + ' ' + rk.PRIJMENI.str.strip().str.lower()
    C[y] = rk
    E[y] = set(rk[rk.MANDAT == 'A'].k)
zc = allz[allz.YEAR >= 2006]
rows = []
for a, b in zip(YEARS[:-1], YEARS[1:]):
    c = C[b].copy()
    kk = zc[zc.YEAR == b].set_index('KODZASTUP').kat
    c['kat'] = c.KODZASTUP.map(kk)
    # 2026: výsledky ještě nejsou – zvoleni budou jistě jen ti z obcí, kde jsou zvoleni všichni
    c = c[c.kat == 2] if b == 2026 else c[c.MANDAT == 'A']
    c['byl'] = c.k.isin(E[a])
    c['skup'] = c.kat.map({0: 'Soutěž víc kandidátek', 1: 'Jediná kandidátka s náhradníky', 2: 'Jediná kandidátka, zvoleni všichni'})
    for s_, d in c[c.skup.notna()].groupby('skup'):
        rows.append(dict(rok=str(b), skup=s_, zvol=len(d), byli=int(d.byl.sum()), pct=round(d.byl.mean() * 100, 1)))
pd.DataFrame(rows).to_csv('out/kontinuita.csv', index=False)
save('kontinuita', {
    '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
    'title': {'text': 'Kde jsou zvoleni všichni, sedí v zastupitelstvu z velké části stejní lidé',
              'subtitle': 'Podíl zvolených zastupitelů (%), kteří byli zvoleni do zastupitelstva téže obce už v předchozích volbách. Rok 2026: obce, kde je výsledek jistý už teď'},
    'width': 600, 'height': 320,
    'data': {'values': rows},
    'encoding': {
        'x': {'field': 'rok', 'type': 'ordinal', 'axis': {'title': None, 'labelAngle': 0}},
        'y': {'field': 'pct', 'type': 'quantitative', 'scale': {'domain': [0, 100]}, 'axis': {'title': None, 'labelExpr': "datum.label + ' %'"}},
        'color': {'field': 'skup', 'type': 'nominal', 'scale': {'domain': SK, 'range': [C_ALL, C_NAHR, C_SOUT]},
                  'legend': {'title': None, 'orient': 'top', 'direction': 'vertical', 'labelLimit': 400}},
    },
    'layer': [
        {'mark': {'type': 'line', 'strokeWidth': 2.5}},
        {'mark': {'type': 'point', 'filled': True, 'size': 55},
         'encoding': {'tooltip': [{'field': 'rok', 'title': 'Volby'}, {'field': 'skup', 'title': 'Typ obce'},
                                  {'field': 'zvol', 'title': 'Zvolených zastupitelů', 'format': ',.0f'},
                                  {'field': 'byli', 'title': 'Z toho zastupitelé z minulého období', 'format': ',.0f'},
                                  {'field': 'pct', 'title': '%', 'format': '.1f'}]}},
    ],
    '_source': 'volby.gov.cz – registry kandidátů KV2002–KV2026; shoda jména a příjmení v téže obci (změnu příjmení, např. po sňatku, nezachytí)',
})
print(pd.DataFrame(rows).pivot(index='rok', columns='skup', values='pct').to_string())
print(pd.read_csv('out/ucast.csv').pivot_table(index='vel', columns=['volby', 'skup'], values='ucast'))
