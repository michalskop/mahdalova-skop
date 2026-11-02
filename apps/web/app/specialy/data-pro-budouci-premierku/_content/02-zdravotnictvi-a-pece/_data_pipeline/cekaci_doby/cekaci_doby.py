#!/usr/bin/env python3
"""Čekací doby: kolik lidí nedostalo potřebné vyšetření kvůli čekací listině (EU-SILC) a které země OECD čekací doby měří.

Vstup: Eurostat hlth_silc_08 (JSON-stat, všechny země, 2024–2025) a OECD DF_WAITING z archivu zdrojových dat.
Výstup: cekaci_doby.json a graf CHART_CEKANI_WLIST.json.

Použití:
    python cekaci_doby.py --archiv "<cesta k Zdrojová data>" --grafy "<cesta k public/specialy/dpbp/charts>"
"""
import argparse, csv, json, os

ES_VSECHNY = 'eurostat_hlth_silc_08_vsechny-zeme_2024-2025_2026-10-29.json'
ES_SOUSEDE = 'eurostat_hlth_silc_08_CZ-PL-SK-HU-AT-DE-EU27_2026-10-29.json'
OECD_WAIT = 'oecd-els-hd_DF_WAITING_od2015_2026-10-29.csv'

EU27 = {
    'BE': 'Belgie', 'BG': 'Bulharsko', 'CZ': 'Česko', 'DK': 'Dánsko', 'DE': 'Německo', 'EE': 'Estonsko', 'IE': 'Irsko',
    'EL': 'Řecko', 'ES': 'Španělsko', 'FR': 'Francie', 'HR': 'Chorvatsko', 'IT': 'Itálie', 'CY': 'Kypr', 'LV': 'Lotyšsko',
    'LT': 'Litva', 'LU': 'Lucembursko', 'HU': 'Maďarsko', 'MT': 'Malta', 'NL': 'Nizozemsko', 'AT': 'Rakousko', 'PL': 'Polsko',
    'PT': 'Portugalsko', 'RO': 'Rumunsko', 'SI': 'Slovinsko', 'SK': 'Slovensko', 'FI': 'Finsko', 'SE': 'Švédsko',
}


def jsonstat(path):
    d = json.load(open(path, encoding='utf-8'))
    ids, size = d['id'], d['size']
    idx = {k: list(d['dimension'][k]['category']['index'].keys()) for k in ids}

    def get(**kw):
        n = 0
        for k, s in zip(ids, size):
            n = n * s + (idx[k].index(kw[k]) if k in kw else 0)
        return d['value'].get(str(n))
    return idx, get


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--archiv', required=True)
    ap.add_argument('--grafy', required=True)
    ap.add_argument('--vystup', default=os.path.join(os.path.dirname(__file__), 'cekaci_doby.json'))
    a = ap.parse_args()

    idx, get = jsonstat(os.path.join(a.archiv, 'Eurostat', ES_VSECHNY))
    rok = '2025'
    vals = {EU27[g]: get(reason='WLIST', geo=g, time=rok) for g in EU27 if g in idx['geo']}
    vals = {k: v for k, v in vals.items() if v is not None}
    eu = get(reason='WLIST', geo='EU27_2020', time=rok)
    poradi = sorted(vals.items(), key=lambda kv: (kv[1], kv[0]))

    # časová řada pro Česko a sousedy (starší soubor)
    idx2, get2 = jsonstat(os.path.join(a.archiv, 'Eurostat', ES_SOUSEDE))
    roky = [t for t in idx2['time']]
    rada = {g: {t: get2(reason='WLIST', geo=g, time=t) for t in roky} for g in ('CZ', 'PL', 'SK', 'HU', 'AT', 'DE', 'EU27_2020')}

    # které země OECD čekací doby měří
    with open(os.path.join(a.archiv, 'OECD', OECD_WAIT), encoding='utf-8') as f:
        zeme_oecd = sorted({x['REF_AREA'] for x in csv.DictReader(f)})

    out = {
        'rok': rok, 'ukazatel': 'Podíl lidí 16+ s nesplněnou potřebou vyšetření kvůli čekací listině, %',
        'eu27_prumer': eu, 'poradi_eu27': poradi,
        'poradi_cr': 1 + [k for k, _ in poradi].index('Česko'),
        'pocet_zemi': len(poradi),
        'rada': rada,
        'zeme_oecd_cekaci_doby': zeme_oecd, 'cr_v_oecd_cekaci_doby': 'CZE' in zeme_oecd,
    }
    with open(a.vystup, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)

    values = [{'zeme': k, 'val': v, 'color': '#de1743' if k == 'Česko' else '#bcbcb0'} for k, v in poradi]
    values.append({'zeme': 'Průměr EU', 'val': eu, 'color': '#6267a3'})
    graf = {
        '_source': f'Eurostat, hlth_silc_08 (EU-SILC), rok {rok}, lidé starší 16 let, důvod „čekací listina“',
        '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
        'description': 'Nesplněná potřeba lékařského vyšetření kvůli čekací listině',
        'width': 450, 'height': 520, 'background': '#fdfbf7',
        'autosize': {'type': 'pad', 'resize': True},
        'data': {'values': values},
        'layer': [
            {'mark': {'type': 'bar', 'tooltip': True, 'cornerRadiusEnd': 3},
             'encoding': {'y': {'field': 'zeme', 'type': 'nominal', 'title': None, 'sort': {'field': 'val', 'op': 'max', 'order': 'descending'}},
                          'x': {'field': 'val', 'type': 'quantitative', 'title': 'Podíl lidí s nesplněnou potřebou vyšetření kvůli čekací listině, %'},
                          'color': {'field': 'color', 'type': 'nominal', 'scale': None}}},
            {'mark': {'type': 'text', 'align': 'left', 'dx': 4, 'fontSize': 10, 'color': '#272a59'},
             'encoding': {'y': {'field': 'zeme', 'type': 'nominal', 'sort': {'field': 'val', 'op': 'max', 'order': 'descending'}},
                          'x': {'field': 'val', 'type': 'quantitative'},
                          'text': {'field': 'val', 'type': 'quantitative', 'format': '.1f'}}},
        ],
        'config': {'view': {'stroke': 'transparent'},
                   'title': {'font': 'Roboto Slab', 'fontWeight': 'bold', 'fontSize': 13, 'anchor': 'start', 'color': '#272a59',
                             'subtitleFont': 'Work Sans', 'subtitleFontSize': 10, 'subtitleColor': '#6267a3'},
                   'axis': {'titleColor': '#6267a3'}},
        'title': {'text': f'Čekací listiny berou vyšetření {vals["Česko"] * 10:.0f} z 1 000 Čechů, v EU {eu * 10:.0f} z 1 000',
                  'subtitle': f'Podíl lidí 16+ s nesplněnou potřebou vyšetření kvůli čekací listině, {rok}'},
    }
    with open(os.path.join(a.grafy, 'CHART_CEKANI_WLIST.json'), 'w', encoding='utf-8') as f:
        json.dump(graf, f, ensure_ascii=False, indent=1)
    print('Česko:', vals['Česko'], 'pořadí', out['poradi_cr'], 'z', out['pocet_zemi'], '| EU27:', eu)
    print('nejvyšší:', poradi[-4:])
    print('OECD měří čekací doby v zemích:', zeme_oecd, '| Česko:', out['cr_v_oecd_cekaci_doby'])
    print({g: [rada[g][t] for t in ('2015', '2019', '2023', '2025')] for g in rada})


if __name__ == '__main__':
    main()
