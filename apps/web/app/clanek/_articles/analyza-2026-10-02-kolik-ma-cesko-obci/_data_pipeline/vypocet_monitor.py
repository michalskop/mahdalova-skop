# -*- coding: utf-8 -*-
"""
Náklady na provoz obecní samosprávy v ČR (DataTimes.cz, článek „Kolik má Česko obcí“).

Zdroje (staženo 2026-10-02):
  FIN 2-12 M (Monitor státní pokladny MF, extrakty CSV):
    https://monitor.statnipokladna.gov.cz/data/extrakty/csv/FinM/2025_12_Data_CSUIS_FINM.zip
    https://monitor.statnipokladna.gov.cz/data/extrakty/csv/FinM/2022_12_Data_CSUIS_FINM.zip
  Číselník účetních jednotek (IČO -> kód obce ZÚJ, druh/poddruh ÚJ = ORP/POÚ):
    https://monitor.statnipokladna.gov.cz/data/xml/ucjed.xml
    https://monitor.statnipokladna.gov.cz/data/xml/poddruhuj.xml
  ČSÚ – Počet obyvatel v obcích ČR k 1. 1. 2025 (tab. 1300722503):
    https://csu.gov.cz/docs/107508/ebed5ef3-dca1-baf2-c0d3-824b0893086f/1300722503.xlsx?version=1.0

Kroky:
  1. z ucjed.xml vybrat účetní jednotky druhu 4 (Obce) platné k 31. 12. roku (MČ statutárních měst
     jsou v číselníku druh 30 => vypadnou; DSO = druh 5, kraje = druh 3 => vypadnou)
  2. FINM201 (výdaje dle paragrafů a položek): třídy 5+6, sloupec „Výsledek od počátku roku“ za 12/2025
  3. FINM203 řádek 4430 = Výdaje celkem po konsolidaci
  4. napojit obyvatele ČSÚ k 1. 1. 2025 přes kód obce (ZÚJ)
"""
import re
import pandas as pd
import numpy as np
from pathlib import Path

D = Path(__file__).parent

def num(s):
    s = s.astype(str).str.strip()
    neg = s.str.endswith('-')
    v = pd.to_numeric(s.str.rstrip('-').str.strip(), errors='coerce').fillna(0.0)
    return np.where(neg, -v, v)

# ---------- 1. číselník obcí z Monitoru ----------
def load_ucjed():
    cache = D / 'ucjed_obce_kraje.csv'
    if not cache.exists():
        txt = open(D / 'ucjed.xml', encoding='utf-8').read()
        tagre = re.compile(r'<(\w+)>([^<]*)</\1>')
        rows = [dict(tagre.findall(b)) for b in re.findall(r'<row>(.*?)</row>', txt, re.S)
                if '<druhuj_id>4<' in b or '<druhuj_id>3<' in b]
        pd.DataFrame(rows).to_csv(cache, index=False)
    return pd.read_csv(cache, dtype=str)

def obce_k(datum):
    u = load_ucjed()
    a = u[(u.druhuj_id == '4') & (u.start_date <= datum) & (u.end_date >= datum)]
    a = a.drop_duplicates('ico')
    pod = a.poddruhuj_id
    a = a.assign(
        orp=pod.isin(['451', '412', '411']),          # 411 Praha, 412 statutární města, 451 ORP
        pou=pod.isin(['451', '412', '411', '452', '462', '442']),
    )
    return a[['ico', 'zuj_id', 'nazev', 'poddruhuj_id', 'orp', 'pou']]

# ---------- 2. výdaje dle paragrafů ----------
def load_finm201(rok):
    f = D / f'finm{rok}' / f'FINM201_{rok}012.csv'
    df = pd.read_csv(f, sep=';', dtype=str, header=0, encoding='utf-8')
    df.columns = ['vykaz', 'vtab', 'obdobi', 'ucjed', 'ico', 'kraj', 'nuts', 'typ', 'par', 'pol',
                  'rs', 'ru', 'skut', 'fcopy'][:len(df.columns)]
    df['skut'] = num(df['skut'])
    df = df[df.pol.str[0].isin(['5', '6'])]
    return df

def load_4430(rok):
    f = D / f'finm{rok}' / f'FINM203_{rok}012.csv'
    df = pd.read_csv(f, sep=';', dtype=str)
    df.columns = ['vykaz', 'vtab', 'obdobi', 'ucjed', 'ico', 'kraj', 'nuts', 'polvyk', 'rs', 'ru', 'skut', 'fcopy']
    df = df[df.polvyk == '4430']
    df['skut'] = num(df['skut'])
    return df.groupby('ico').skut.sum()

def vydaje_obci(rok):
    ob = obce_k(f'{rok}-12-31')
    df = load_finm201(rok)
    df = df[df.ico.isin(ob.ico)]
    piv = df.groupby('ico').apply(lambda g: pd.Series({
        'v6112': g.loc[g.par == '6112', 'skut'].sum(),
        'v6171': g.loc[g.par == '6171', 'skut'].sum(),
        'v6115': g.loc[g.par == '6115', 'skut'].sum(),
        'v6112_platy': g.loc[(g.par == '6112') & (g.pol.str[:3].isin(['502', '503'])), 'skut'].sum(),
        'vydaje_nekonsolid': g['skut'].sum(),
    }), include_groups=False)
    piv['vydaje_celkem'] = load_4430(rok).reindex(piv.index).fillna(0)
    return ob.merge(piv, left_on='ico', right_index=True, how='left').fillna(
        {'v6112': 0, 'v6171': 0, 'v6115': 0, 'v6112_platy': 0, 'vydaje_nekonsolid': 0, 'vydaje_celkem': 0})

# ---------- 3. obyvatelé ČSÚ ----------
def obyvatele_2025():
    o = pd.read_excel(D / 'obyv_03.xlsx', header=None, skiprows=6, dtype=str)
    o = o[o[1].str.match(r'^\d{6}$', na=False)]
    return pd.DataFrame({'kod_obce': o[1], 'nazev_csu': o[2], 'obyvatele': o[3].astype(int)})

BINS = [0, 200, 500, 1000, 2000, 5000, 10000, 50000, 10**9]
LABELS = ['do 199', '200–499', '500–999', '1 000–1 999', '2 000–4 999', '5 000–9 999',
          '10 000–49 999', '50 000+ (bez Prahy)']

def skupiny(o, tag):
    o = o.copy()
    o['sprava'] = o.v6112 + o.v6171
    o['pc6112'] = o.v6112 / o.obyvatele
    o['pc6171'] = o.v6171 / o.obyvatele
    o['pcsprava'] = o.sprava / o.obyvatele
    o['podil'] = o.sprava / o.vydaje_celkem
    rows = []
    for lab, g in o.groupby('skupina', observed=True):
        rows.append({
            'varianta': tag, 'skupina': lab, 'pocet_obci': len(g), 'obyvatele': int(g.obyvatele.sum()),
            'v6112_kc': round(g.v6112.sum()), 'v6171_kc': round(g.v6171.sum()), 'sprava_kc': round(g.sprava.sum()),
            'vydaje_celkem_kc': round(g.vydaje_celkem.sum()),
            'vazeny_6112_na_obyv': round(g.v6112.sum() / g.obyvatele.sum(), 0),
            'vazeny_6171_na_obyv': round(g.v6171.sum() / g.obyvatele.sum(), 0),
            'vazeny_sprava_na_obyv': round(g.sprava.sum() / g.obyvatele.sum(), 0),
            'median_6112_na_obyv': round(g.pc6112.median(), 0),
            'median_6171_na_obyv': round(g.pc6171.median(), 0),
            'median_sprava_na_obyv': round(g.pcsprava.median(), 0),
            'podil_sprava_na_vydajich_souhrn_pct': round(100 * g.sprava.sum() / g.vydaje_celkem.sum(), 1),
            'podil_sprava_na_vydajich_median_pct': round(100 * g.podil.median(), 1),
        })
    return rows

def main():
    v = vydaje_obci(2025)
    ob = obyvatele_2025()
    o = v.merge(ob, left_on='zuj_id', right_on='kod_obce', how='left')
    assert o.obyvatele.notna().all(), o[o.obyvatele.isna()]
    o['nazev'] = o['nazev_csu']
    o['praha'] = o.kod_obce == '554782'
    o['skupina'] = pd.cut(o.obyvatele, BINS, right=False, labels=LABELS)
    o.loc[o.praha, 'skupina'] = np.nan
    out = o[['kod_obce', 'nazev', 'obyvatele', 'v6112', 'v6171', 'vydaje_celkem', 'vydaje_nekonsolid',
             'v6112_platy', 'ico', 'orp', 'pou', 'praha']].sort_values('kod_obce')
    out.round(2).to_csv(D / 'naklady_obce_2025.csv', index=False, encoding='utf-8-sig')

    bez_prahy = o[~o.praha]
    rows = skupiny(bez_prahy, 'vsechny obce bez Prahy') + skupiny(bez_prahy[~bez_prahy.orp], 'bez ORP (a bez Prahy)')
    # řádky souhrnu
    for tag, g in [('CR celkem vc. Prahy', o), ('CR bez Prahy', bez_prahy), ('Praha (obec+kraj)', o[o.praha]),
                   ('205 ORP (bez Prahy)', bez_prahy[bez_prahy.orp]), ('bez ORP', bez_prahy[~bez_prahy.orp])]:
        s = g.v6112.sum() + g.v6171.sum()
        rows.append({'varianta': 'souhrn', 'skupina': tag, 'pocet_obci': len(g), 'obyvatele': int(g.obyvatele.sum()),
                     'v6112_kc': round(g.v6112.sum()), 'v6171_kc': round(g.v6171.sum()), 'sprava_kc': round(s),
                     'vydaje_celkem_kc': round(g.vydaje_celkem.sum()),
                     'vazeny_6112_na_obyv': round(g.v6112.sum() / g.obyvatele.sum()),
                     'vazeny_6171_na_obyv': round(g.v6171.sum() / g.obyvatele.sum()),
                     'vazeny_sprava_na_obyv': round(s / g.obyvatele.sum()),
                     'podil_sprava_na_vydajich_souhrn_pct': round(100 * s / g.vydaje_celkem.sum(), 1)})
    sk = pd.DataFrame(rows)
    sk.to_csv(D / 'naklady_skupiny_2025.csv', index=False, encoding='utf-8-sig')
    pd.set_option('display.width', 250); pd.set_option('display.max_columns', 30)
    print(sk.to_string())

    # ---------- 2022: § 6115 ----------
    v22 = vydaje_obci(2022)
    print('\n2022 obce:', len(v22), ' § 6115 součet Kč:', round(v22.v6115.sum()),
          ' obcí s nenulovým 6115:', int((v22.v6115 != 0).sum()))
    print('2022 § 6112:', round(v22.v6112.sum()), ' § 6171:', round(v22.v6171.sum()))
    print('2025 § 6115:', round(v.v6115.sum()))
    v22[['zuj_id', 'nazev', 'v6115', 'v6112', 'v6171']].to_csv(D / 'volby_6115_obce_2022.csv', index=False, encoding='utf-8-sig')
    f = load_finm201(2022)
    f = f[f.ico.isin(v22.ico)]
    print('2022 § 6114 (volby do Parlamentu – Senát):', round(f[f.par == '6114'].skut.sum()))

    # účelová dotace ÚZ 98187 (společné volby do Parlamentu ČR a zastupitelstev obcí) – FINM207, řádky typu D
    u = pd.read_csv(D / 'finm2022' / 'FINM207_2022012.csv', sep=';', dtype=str)
    u.columns = ['vykaz', 'vtab', 'obd', 'ucjed', 'ico', 'kraj', 'nuts', 'por', 'typr', 'uz', 'polp', 'par', 'polv',
                 'vp', 'vv', 'rozdil', 'fcopy']
    u = u[u.ico.isin(v22.ico) & (u.typr == 'D') & (u.uz == '98187')]
    print('ÚZ 98187 2022 obce: přijato', round(num(u.vp).sum()), ' vydáno', round(num(u.vv).sum()),
          ' z toho § 6115', round(num(u[u.par == '6115'].vv).sum()), ' § 6114', round(num(u[u.par == '6114'].vv).sum()))

if __name__ == '__main__':
    main()
