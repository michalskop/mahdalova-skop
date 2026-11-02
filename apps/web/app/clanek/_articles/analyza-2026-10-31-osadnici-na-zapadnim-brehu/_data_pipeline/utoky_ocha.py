"""Útoky osadníků na Palestince podle roku – OCHA (Úřad OSN pro koordinaci humanitárních záležitostí).

Vstup: zdroj/ocha_settler_attacks_annual_transcribed.csv – hodnoty přečtené z grafu „West Bank | Monthly snapshot:
casualties, property damage and displacement – as of 30 September 2026“ (OCHA oPt, vydáno 27. 10. 2026,
https://www.ochaopt.org/content/west-bank-monthly-snapshot-casualties-property-damage-and-displacement-september-2026).
Přepis z textové vrstvy PDF zkontrolován proti vykreslení a kontrolním součtům OCHA (2025 + leden–září 2026 = 3 684).

Definice OCHA: útok osadníků proti Palestincům, který skončil zraněním či smrtí, škodou na majetku, nebo obojím.
Výhrůžky a zastrašování bez škody se nepočítají. Západní břeh včetně východního Jeruzaléma. OCHA čísla zpětně reviduje.

Výstup: vystup_utoky.json a ../data/utoky-osadniku.json (spec grafu VegaChart).
Spuštění: python -I -X utf8 utoky_ocha.py
"""
import csv
import json
from pathlib import Path

TU = Path(__file__).parent
CSV = TU / 'zdroj' / 'ocha_settler_attacks_annual_transcribed.csv'
LETOS_DO_RIJNA = 2159  # 1. 1. – 19. 10. 2026, Humanitarian Situation Report 22. 10. 2026 (text, ne graf)


def main():
    radky = list(csv.DictReader(open(CSV, encoding='utf-8')))
    rocni = {int(r['period']): int(r['settler_attacks_casualties_or_damage']) for r in radky if '-' not in r['period']}
    mesice_2026 = {r['period']: int(r['settler_attacks_casualties_or_damage']) for r in radky if r['period'].startswith('2026-')}
    letos_zari = sum(mesice_2026.values())

    hodnoty = [{'rok': str(y), 'utoky': v, 'druh': 'cely rok'} for y, v in sorted(rocni.items())]
    hodnoty.append({'rok': '2026', 'utoky': letos_zari, 'druh': 'leden–září'})

    vystup = {
        'zdroj': 'OCHA oPt, Monthly snapshot as of 30 September 2026',
        'rocni': rocni, 'leden_zari_2026': letos_zari, 'leden_19_rijen_2026': LETOS_DO_RIJNA,
        'pomer_2025_ku_2022': round(rocni[2025] / rocni[2022], 2),
        'pomer_2025_ku_2020': round(rocni[2025] / rocni[2020], 2),
        'denne_2025': round(rocni[2025] / 365, 1), 'denne_2026_do_19_10': round(LETOS_DO_RIJNA / 292, 1),
        'maximum_pred_2021': max(v for y, v in rocni.items() if y < 2021),
    }
    (TU / 'vystup_utoky.json').write_text(json.dumps(vystup, ensure_ascii=False, indent=1), encoding='utf-8')

    spec = {
        '$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
        'title': {
            'text': 'Osadníci {letos do září|#de1743} zaútočili víc než za celý loňský rok',
            'subtitle': 'Útoky osadníků na Palestince, které skončily zraněním, smrtí nebo škodou na majetku (Západní břeh včetně východního Jeruzaléma). Rok 2026 leden–září.',
        },
        'width': 600, 'height': 300,
        'data': {'values': hodnoty},
        'encoding': {
            'x': {'field': 'rok', 'type': 'ordinal', 'axis': {'title': None, 'labelAngle': 0, 'labelExpr': "toNumber(datum.value) % 2 == 0 ? datum.value : ''"}},
            'y': {'field': 'utoky', 'type': 'quantitative', 'axis': {'title': 'Počet útoků'}},
        },
        'layer': [
            {'mark': {'type': 'bar', 'width': {'band': 0.75}},
             'encoding': {
                 'color': {'condition': {'test': "datum.rok == '2026'", 'value': '#de1743'}, 'value': '#272a59'},
                 'tooltip': [{'field': 'rok', 'title': 'Rok'}, {'field': 'druh', 'title': 'Období'},
                             {'field': 'utoky', 'title': 'Útoků', 'format': ',d'}]}},
            {'transform': [{'filter': "toNumber(datum.rok) >= 2021"}],
             'mark': {'type': 'text', 'dy': -8, 'fontSize': 11, 'fontWeight': 'bold', 'color': '#272a59'},
             'encoding': {'text': {'field': 'utoky', 'type': 'quantitative', 'format': ',d'}}},
        ],
        '_source': '[OCHA, West Bank Monthly snapshot k 30. 9. 2026](https://www.ochaopt.org/content/west-bank-monthly-snapshot-casualties-property-damage-and-displacement-september-2026); OCHA údaje zpětně upřesňuje',
    }
    (TU.parent / 'data' / 'utoky-osadniku.json').write_text(json.dumps(spec, ensure_ascii=False, indent=1), encoding='utf-8')
    print(json.dumps(vystup, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
