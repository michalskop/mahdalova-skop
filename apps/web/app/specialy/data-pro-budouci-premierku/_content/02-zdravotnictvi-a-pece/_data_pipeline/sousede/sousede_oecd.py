#!/usr/bin/env python3
"""Sousedé: lékaři, sestry, výdaje a odvratitelná úmrtnost v Česku, Polsku, Slovensku, Maďarsku, Rakousku a Německu.

Vstup: soubory OECD (SDMX CSV) z archivu zdrojových dat, viz ../README.md.
Výstup: sousede_oecd.json (hodnoty a roky) a dva grafy v apps/web/public/specialy/dpbp/charts/.

Použití:
    python sousede_oecd.py --archiv "<cesta k Zdrojová data>" --grafy "<cesta k public/specialy/dpbp/charts>"
"""
import argparse, csv, json, os

ZEME = [('CZE', 'Česko'), ('POL', 'Polsko'), ('SVK', 'Slovensko'), ('HUN', 'Maďarsko'), ('AUT', 'Rakousko'), ('DEU', 'Německo')]
SOUBORY = {
    'phys': 'oecd-els-hd_DF_PHYS_od2015_2026-10-29.csv',
    'nurse': 'oecd-els-hd_DF_NURSE_od2015_2026-10-29.csv',
    'sha': 'oecd-els-hd_DF_SHA_vyber-zemi_od2019_2026-10-29.csv',
    'am': 'oecd-els-hd_DF_AM_od2015_2026-10-29.csv',
}
ROK = '2024'  # poslední rok bez projekce (2025 je v OECD označen jako odhad P)


def nacti(archiv, klic):
    with open(os.path.join(archiv, 'OECD', SOUBORY[klic]), encoding='utf-8') as f:
        return list(csv.DictReader(f))


def hodnota(rows, area, rok=None, **kw):
    """Vrátí (rok, hodnota) pro daný filtr; bez roku vezme poslední dostupný."""
    r = [x for x in rows if x['REF_AREA'] == area and all(x[k] == v for k, v in kw.items())]
    if rok:
        r = [x for x in r if x['TIME_PERIOD'] == rok]
    if not r:
        return None
    r.sort(key=lambda x: x['TIME_PERIOD'])
    x = r[-1]
    return x['TIME_PERIOD'], float(x['OBS_VALUE'])


def sloupce_graf(radky, indikatory, nazev, podnazev, zdroj, vyska=250):
    """Facet po indikátorech, země na ose y, Česko zvýrazněno."""
    values = []
    for z in radky:
        for ind in indikatory:
            v = radky[z].get(ind['klic'])
            if v is not None:
                values.append({'zeme': z, 'ukazatel': ind['popis'], 'hodnota': round(v, 1)})
    return {
        '_source': zdroj,
        '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
        'description': nazev,
        'background': '#fdfbf7',
        'autosize': {'type': 'pad', 'resize': True},
        'data': {'values': values},
        'facet': {'column': {'field': 'ukazatel', 'type': 'nominal', 'title': None, 'sort': [i['popis'] for i in indikatory]}},
        'spec': {
            'width': 170, 'height': vyska,
            'layer': [
                {
                    'mark': {'type': 'bar', 'tooltip': True, 'cornerRadiusEnd': 3},
                    'encoding': {
                        'y': {'field': 'zeme', 'type': 'nominal', 'title': None, 'sort': {'field': 'hodnota', 'op': 'max', 'order': 'descending'}},
                        'x': {'field': 'hodnota', 'type': 'quantitative', 'title': None},
                        'color': {'condition': {'test': "datum.zeme == 'Česko'", 'value': '#de1743'}, 'value': '#bcbcb0'},
                    },
                },
                {
                    'mark': {'type': 'text', 'align': 'left', 'dx': 4, 'fontSize': 11, 'color': '#272a59'},
                    'encoding': {
                        'y': {'field': 'zeme', 'type': 'nominal', 'sort': {'field': 'hodnota', 'op': 'max', 'order': 'descending'}},
                        'x': {'field': 'hodnota', 'type': 'quantitative'},
                        'text': {'field': 'hodnota', 'type': 'quantitative', 'format': '.1f'},
                    },
                },
            ],
        },
        'config': {
            'view': {'stroke': 'transparent'},
            'title': {'font': 'Roboto Slab', 'fontWeight': 'bold', 'fontSize': 13, 'anchor': 'start', 'color': '#272a59',
                      'subtitleFont': 'Work Sans', 'subtitleFontSize': 10, 'subtitleColor': '#6267a3'},
            'axis': {'titleColor': '#6267a3'},
            'header': {'labelFont': 'Work Sans', 'labelFontSize': 11, 'labelColor': '#272a59'},
        },
        'title': {'text': nazev, 'subtitle': podnazev},
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--archiv', required=True)
    ap.add_argument('--grafy', required=True)
    ap.add_argument('--vystup', default=os.path.join(os.path.dirname(__file__), 'sousede_oecd.json'))
    a = ap.parse_args()

    phys, nurse, sha, am = (nacti(a.archiv, k) for k in ('phys', 'nurse', 'sha', 'am'))
    out = {}
    for kod, jmeno in ZEME:
        d = {}
        # Slovensko hlásí jen „profesně aktivní“ (PA), ostatní „praktikující“ (P); rozdíl je v poznámce článku
        d['lekari'] = (hodnota(phys, kod, ROK, UNIT_MEASURE='10P3HB', HEALTH_PROF='PHYS', HEALTH_PROF_ACTIVITY_STATUS='P')
                       or hodnota(phys, kod, ROK, UNIT_MEASURE='10P3HB', HEALTH_PROF='PHYS', HEALTH_PROF_ACTIVITY_STATUS='PA'))
        d['sestry'] = (hodnota(nurse, kod, ROK, UNIT_MEASURE='10P3HB', HEALTH_PROF='MINU', HEALTH_PROF_ACTIVITY_STATUS='P')
                       or hodnota(nurse, kod, ROK, UNIT_MEASURE='10P3HB', HEALTH_PROF='MINU', HEALTH_PROF_ACTIVITY_STATUS='PA'))
        d['vydaje_hdp'] = hodnota(sha, kod, ROK, UNIT_MEASURE='PT_B1GQ', FINANCING_SCHEME='_T', PRICE_BASE='_Z')
        d['vydaje_ppp'] = hodnota(sha, kod, ROK, UNIT_MEASURE='USD_PPP_PS', FINANCING_SCHEME='_T', PRICE_BASE='V')
        d['verejne_podil'] = hodnota(sha, kod, ROK, UNIT_MEASURE='PT_EXP_HLTH', FINANCING_SCHEME='HF1')
        d['z_kapsy_podil'] = hodnota(sha, kod, ROK, UNIT_MEASURE='PT_EXP_HLTH', FINANCING_SCHEME='HF3')
        for klic, mer in (('odvratitelna', 'AVM'), ('lecitelna', 'TRTM'), ('preventabilni', 'PREVM')):
            d[klic] = hodnota(am, kod, None, MEASURE=mer, UNIT_MEASURE='DT_10P5HB', SEX='_T')
        out[jmeno] = d

    with open(a.vystup, 'w', encoding='utf-8') as f:
        json.dump({'rok': ROK, 'zeme': out}, f, ensure_ascii=False, indent=1)

    radky = {z: {k: (v[1] if v else None) for k, v in d.items()} for z, d in out.items()}
    zdroj_p = f'OECD Health Statistics (stažení 29. 10. 2026), rok {ROK}; praktikující lékaři a sestry na 1 000 obyvatel'
    g1 = sloupce_graf(radky, [{'klic': 'lekari', 'popis': 'Lékaři na 1 000 obyvatel'}, {'klic': 'sestry', 'popis': 'Sestry na 1 000 obyvatel'}],
                      'Lékařů a sester má Česko víc než Polsko, Slovensko a Maďarsko, méně než Rakousko a Německo',
                      f'Praktikující lékaři a sestry na 1 000 obyvatel, {ROK}', zdroj_p)
    g2 = sloupce_graf(radky, [{'klic': 'vydaje_hdp', 'popis': 'Výdaje na zdraví (% HDP)'}, {'klic': 'z_kapsy_podil', 'popis': 'Z vlastní kapsy (% výdajů)'}],
                      'Česko dává na zdraví 8,6 % HDP, Rakousko 11,7 % a Německo 12,2 %',
                      f'Výdaje na zdraví a podíl plateb pacientů, {ROK}', f'OECD, Health expenditure and financing (SHA), rok {ROK}')
    for nazev, g in (('CHART_SOUSEDE_PERSONAL.json', g1), ('CHART_SOUSEDE_VYDAJE.json', g2)):
        with open(os.path.join(a.grafy, nazev), 'w', encoding='utf-8') as f:
            json.dump(g, f, ensure_ascii=False, indent=1)
    for z, d in out.items():
        print(z, {k: v for k, v in d.items()})


if __name__ == '__main__':
    main()
