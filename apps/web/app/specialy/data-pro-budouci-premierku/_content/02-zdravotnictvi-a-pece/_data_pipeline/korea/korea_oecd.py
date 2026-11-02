#!/usr/bin/env python3
"""Jižní Korea a Česko: lékaři, sestry, výdaje na zdraví, platby z kapsy a odvratitelná úmrtnost.

Vstup: soubory OECD z archivu zdrojových dat (stejné jako ../sousede/sousede_oecd.py).
Výstup: korea_oecd.json a graf CHART_KOREA_CESKO.json.

Použití:
    python korea_oecd.py --archiv "<cesta k Zdrojová data>" --grafy "<cesta k public/specialy/dpbp/charts>"
"""
import argparse, importlib.util, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('sousede_oecd', os.path.join(HERE, '..', 'sousede', 'sousede_oecd.py'))
sousede = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sousede)

ZEME = [('CZE', 'Česko'), ('KOR', 'Jižní Korea')]
ROK = '2024'
ROK_UMRTNOST = '2023'  # poslední rok, za který OECD hlásí odvratitelnou úmrtnost za Koreu


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--archiv', required=True)
    ap.add_argument('--grafy', required=True)
    ap.add_argument('--vystup', default=os.path.join(HERE, 'korea_oecd.json'))
    a = ap.parse_args()
    h = sousede.hodnota
    phys, nurse, sha, am = (sousede.nacti(a.archiv, k) for k in ('phys', 'nurse', 'sha', 'am'))
    out = {}
    for kod, jmeno in ZEME:
        d = {
            'lekari': h(phys, kod, ROK, UNIT_MEASURE='10P3HB', HEALTH_PROF='PHYS', HEALTH_PROF_ACTIVITY_STATUS='P'),
            'sestry': h(nurse, kod, ROK, UNIT_MEASURE='10P3HB', HEALTH_PROF='MINU', HEALTH_PROF_ACTIVITY_STATUS='P'),
            'vydaje_hdp': h(sha, kod, ROK, UNIT_MEASURE='PT_B1GQ', FINANCING_SCHEME='_T', PRICE_BASE='_Z'),
            'verejne_podil': h(sha, kod, ROK, UNIT_MEASURE='PT_EXP_HLTH', FINANCING_SCHEME='HF1'),
            'z_kapsy_podil': h(sha, kod, ROK, UNIT_MEASURE='PT_EXP_HLTH', FINANCING_SCHEME='HF3'),
            'odvratitelna': h(am, kod, ROK_UMRTNOST, MEASURE='AVM', UNIT_MEASURE='DT_10P5HB', SEX='_T'),
            'lecitelna': h(am, kod, ROK_UMRTNOST, MEASURE='TRTM', UNIT_MEASURE='DT_10P5HB', SEX='_T'),
        }
        out[jmeno] = d
    with open(a.vystup, 'w', encoding='utf-8') as f:
        json.dump({'rok': ROK, 'rok_umrtnost': ROK_UMRTNOST, 'zeme': out}, f, ensure_ascii=False, indent=1)
    radky = {z: {k: (v[1] if v else None) for k, v in d.items()} for z, d in out.items()}
    inds = [{'klic': 'lekari', 'popis': 'Lékaři na 1 000 obyv.'}, {'klic': 'sestry', 'popis': 'Sestry na 1 000 obyv.'},
            {'klic': 'z_kapsy_podil', 'popis': 'Z kapsy pacientů (% výdajů)'}, {'klic': 'lecitelna', 'popis': 'Léčitelná úmrtí na 100 000'}]
    g = sousede.sloupce_graf(
        radky, inds,
        'Jižní Korea má 2,6 lékaře na tisíc obyvatel, Česko 4,3; léčitelných úmrtí má Korea 44, Česko 87 na 100 000',
        f'Lékaři, sestry a platby pacientů {ROK}, léčitelná úmrtnost {ROK_UMRTNOST}',
        f'OECD Health Statistics (stažení 29. 10. 2026), rok {ROK}, léčitelná úmrtnost {ROK_UMRTNOST}', vyska=120)
    with open(os.path.join(a.grafy, 'CHART_KOREA_CESKO.json'), 'w', encoding='utf-8') as f:
        json.dump(g, f, ensure_ascii=False, indent=1)
    for z, d in out.items():
        print(z, d)


if __name__ == '__main__':
    main()
