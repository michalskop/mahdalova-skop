#!/usr/bin/env python3
"""Platba státu za státní pojištěnce: vyměřovací základ a měsíční platba 2020–2027.

Vstup: Sněmovní tisk 235/0 (důvodová zpráva s tabulkou vyměřovacích základů) a 235/2 (pozměňovací návrh) z archivu zdrojových dat.
Pro čtení PDF se používá pdftotext (poppler).
Výstup: platba_stat.json a graf CHART_PLATBA_STAT.json.

Použití:
    python platba_stat.py --archiv "<cesta k Zdrojová data>" --grafy "<cesta k public/specialy/dpbp/charts>"
"""
import argparse, json, os, re, subprocess

TISK0 = 'tisk235-0_vladni-navrh-a-duvodova-zprava_2026-10-29.pdf'
TISK2 = 'tisk235-2_pozmenovaci-navrhy_2026-10-29.pdf'
SAZBA = 0.135  # sazba pojistného, uvádí důvodová zpráva


def pdf_text(path):
    return subprocess.run(['pdftotext', '-enc', 'UTF-8', '-layout', path, '-'], capture_output=True, check=True).stdout.decode('utf-8')


def cislo(s):
    return int(re.sub(r'\D', '', s))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--archiv', required=True)
    ap.add_argument('--grafy', required=True)
    ap.add_argument('--vystup', default=os.path.join(os.path.dirname(__file__), 'platba_stat.json'))
    a = ap.parse_args()

    t0 = pdf_text(os.path.join(a.archiv, 'PSP', TISK0))
    radky = []
    for m in re.finditer(r'(\d{1,2}\. \d{1,2}\. \d{4}) – (\d{1,2}\. \d{1,2}\. \d{4})\s+([\d  ]+) Kč\s+([\d  ]+) Kč', t0):
        radky.append({'od': m.group(1), 'do': m.group(2), 'zaklad': cislo(m.group(3)), 'mesicne': cislo(m.group(4))})
    # kontrola: měsíční platba = 13,5 % z vyměřovacího základu (zaokrouhleno)
    for r in radky:
        r['kontrola_ok'] = abs(r['zaklad'] * SAZBA - r['mesicne']) < 1.0

    navrh = cislo(re.search(r'částka\s+„14\s+074\s+Kč“\s+(?:se\s+)?nahrazuje\s+částkou\s+„([\d\s ]+)\s*Kč“', t0).group(1))
    t2 = pdf_text(os.path.join(a.archiv, 'PSP', TISK2))
    m2 = re.search(r'„([\d\s ]+)\s*Kč“\s+nahrazuje\s+částkou\s+„([\d\s ]+)\s*Kč“', t2)
    puvodni, sniz = cislo(m2.group(1)), cislo(m2.group(2))
    zustatky = re.search(r'z (\d+,\d) mld\. Kč na (\d+,\d) mld\. Kč', t0)

    out = {
        'tabulka_duvodova_zprava': radky,
        'vladni_navrh_zaklad_2027': navrh, 'vladni_navrh_mesicne_2027': round(navrh * SAZBA),
        'pozmenovaci_navrh_zaklad_2027': sniz, 'pozmenovaci_navrh_mesicne_2027': round(sniz * SAZBA),
        'pozmenovaci_navrh_puvodni_hodnota': puvodni,
        'rozdil_zaklad': navrh - sniz, 'rozdil_mesicne': round(navrh * SAZBA) - round(sniz * SAZBA),
        'zustatky_pojistoven_mld': [zustatky.group(1), zustatky.group(2)] if zustatky else None,
    }
    with open(a.vystup, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)

    # konec roku: hodnota platná k 31. 12.
    pozdni = {}
    for r in radky:
        rok = r['do'][-4:]
        if r['do'].startswith('31. 12.'):
            pozdni[rok] = r['mesicne']
    values = [{'rok': k, 'platba': v, 'zdroj': 'platné'} for k, v in sorted(pozdni.items())]
    values.append({'rok': '2027 (vládní návrh)', 'platba': out['vladni_navrh_mesicne_2027'], 'zdroj': 'vládní návrh'})
    values.append({'rok': '2027 (návrh výboru)', 'platba': out['pozmenovaci_navrh_mesicne_2027'], 'zdroj': 'doporučení výboru'})
    graf = {
        '_source': 'Poslanecká sněmovna, tisk 235/0 a 235/2 (vyměřovací základ × 13,5 %); stav k 29. 10. 2026',
        '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
        'description': 'Měsíční platba státu za státního pojištěnce',
        'width': 450, 'height': 260, 'background': '#fdfbf7',
        'autosize': {'type': 'pad', 'resize': True},
        'data': {'values': values},
        'layer': [
            {'mark': {'type': 'bar', 'tooltip': True, 'cornerRadiusEnd': 3},
             'encoding': {'x': {'field': 'rok', 'type': 'nominal', 'title': None, 'sort': None, 'axis': {'labelAngle': -30}},
                          'y': {'field': 'platba', 'type': 'quantitative', 'title': 'Měsíční platba za osobu, Kč'},
                          'color': {'field': 'zdroj', 'type': 'nominal', 'legend': None,
                                    'scale': {'domain': ['platné', 'vládní návrh', 'doporučení výboru'], 'range': ['#bcbcb0', '#de1743', '#6267a3']}}}},
            {'mark': {'type': 'text', 'dy': -6, 'fontSize': 10, 'color': '#272a59'},
             'encoding': {'x': {'field': 'rok', 'type': 'nominal', 'sort': None},
                          'y': {'field': 'platba', 'type': 'quantitative'},
                          'text': {'field': 'platba', 'type': 'quantitative', 'format': ',.0f'}}},
        ],
        'config': {'view': {'stroke': 'transparent'},
                   'title': {'font': 'Roboto Slab', 'fontWeight': 'bold', 'fontSize': 13, 'anchor': 'start', 'color': '#272a59',
                             'subtitleFont': 'Work Sans', 'subtitleFontSize': 10, 'subtitleColor': '#6267a3'},
                   'axis': {'titleColor': '#6267a3'}},
        'title': {'text': f'Stát platí za státního pojištěnce {pozdni["2026"]:,} Kč měsíčně, od 2027 chce vláda {out["vladni_navrh_mesicne_2027"]:,} Kč'.replace(',', ' '),
                  'subtitle': 'Měsíční platba státu za osobu (13,5 % z vyměřovacího základu), hodnoty na konci roku'},
    }
    with open(os.path.join(a.grafy, 'CHART_PLATBA_STAT.json'), 'w', encoding='utf-8') as f:
        json.dump(graf, f, ensure_ascii=False, indent=1)
    print(json.dumps(out, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
