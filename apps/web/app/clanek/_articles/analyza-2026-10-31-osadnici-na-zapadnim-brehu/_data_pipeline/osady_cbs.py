"""Izraelské osady na Západním břehu podle číselníku obcí izraelského statistického úřadu (CBS).

Vstup: výtah z číselníku CBS bycode2024.xlsx (stav ke konci roku 2024), který leží u rozboru izraelských voleb:
../../analyza-2026-10-28-izraelske-volby-arabske-strany-rozhodnou/_data_pipeline/zdroj/cbs_obce_2024.csv
(postup výtahu a SHA souboru viz vytah_cbs.py tamtéž).

CBS vede osady na Západním břehu jako okres „Judea a Samaří“ (אזור יהודה ושומרון). Východní Jeruzalém do něj
nepatří (CBS ho počítá k okresu Jeruzalém), outposty bez úředního statusu v číselníku nejsou.

Výstup: vystup_osady.json (souhrn pro text) a ../_cover_pipeline/osady-mapa.json (body pro motiv coveru).
Spuštění: python -I -X utf8 osady_cbs.py
"""
import csv
import json
from pathlib import Path

TU = Path(__file__).parent
CBS = TU.parent.parent / 'analyza-2026-10-28-izraelske-volby-arabske-strany-rozhodnou' / '_data_pipeline' / 'zdroj' / 'cbs_obce_2024.csv'
OKRES_JS = 'אזור יהודה ושומרון'


def cislo(s):
    return int(float(s)) if s not in ('', None) else 0


def main():
    obce = list(csv.DictReader(open(CBS, encoding='utf-8-sig')))
    osady = [o for o in obce if o['okres'] == OKRES_JS]
    osady.sort(key=lambda o: -cislo(o['obyv_2024']))
    celkem = sum(cislo(o['obyv_2024']) for o in osady)
    vnitrozemi = [o for o in obce if o['okres'] != OKRES_JS]

    # velikostní skupiny osad
    pasma = [(0, 1000), (1000, 5000), (5000, 20000), (20000, 10**7)]
    skupiny = []
    for a, b in pasma:
        v = [o for o in osady if a <= cislo(o['obyv_2024']) < b]
        skupiny.append({'od': a, 'do': b, 'pocet_osad': len(v), 'obyvatel': sum(cislo(o['obyv_2024']) for o in v)})

    dve_nabozenske = sum(cislo(o['obyv_2024']) for o in osady if o['nazev_en'] in ("Modi'in Illit", 'Betar Illit'))
    vystup = {
        'zdroj': 'CBS, číselník obcí bycode2024 (stav 31. 12. 2024)',
        'pocet_osad': len(osady),
        'obyvatel_celkem': celkem,
        'modiin_betar_illit': dve_nabozenske,
        'podil_modiin_betar_illit': round(100 * dve_nabozenske / celkem, 1),
        'osad_pod_1000': skupiny[0]['pocet_osad'],
        'skupiny': skupiny,
        'nejvetsi': [{'nazev': o['nazev_en'], 'obyv': cislo(o['obyv_2024'])} for o in osady[:10]],
    }
    (TU / 'vystup_osady.json').write_text(json.dumps(vystup, ensure_ascii=False, indent=1), encoding='utf-8')

    # body pro cover: [itm_x, itm_y, obyvatel, 1 = osada / 0 = obec uvnitř Izraele]
    body = [[cislo(o['itm_x']), cislo(o['itm_y']), cislo(o['obyv_2024']), 1] for o in osady if o['itm_x']]
    body += [[cislo(o['itm_x']), cislo(o['itm_y']), cislo(o['obyv_2024']), 0] for o in vnitrozemi if o['itm_x']]
    (TU.parent / '_cover_pipeline' / 'osady-mapa.json').write_text(json.dumps(body), encoding='utf-8')

    print(json.dumps(vystup, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
