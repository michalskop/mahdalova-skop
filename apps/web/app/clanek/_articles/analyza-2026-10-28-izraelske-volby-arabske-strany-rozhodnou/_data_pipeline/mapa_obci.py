"""Data tečkové mapy obcí pro cover: _cover_pipeline/obce-mapa.json.

Každá obec s výsledky z ÚVK (snímek z obce.py) a souřadnicemi CBS = [itm_x, itm_y, voliči, kategorie];
kategorie A = arabská obec nebo beduínský kmen (typ CBS 2 a 3, bez drúzských obcí), O = ostatní.
Mapa ukazuje jen území uvnitř hranic z roku 1949 (zelená linie): bez osad na okupovaném Západním břehu
(okres „אזור יהודה ושומרון“) a bez okupovaných Golanských výšin (podokres „גולן“). Ve výpočtech v obce.py
zůstávají. Východní Jeruzalém je součástí jedné tečky Jeruzaléma.

Spuštění: python -I -X utf8 mapa_obci.py
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))  # python -I nepřidává složku skriptu
from obce import nacti, typ_obce  # noqa: E402

VYSTUP = Path(__file__).parent.parent / '_cover_pipeline' / 'obce-mapa.json'


def main():
    cis, obce = nacti()
    body, vynechano = [], {'Západní břeh': 0, 'Golany': 0, 'bez souřadnic': 0}
    for r in obce:
        kod = int(r['סמל ישוב'])
        c = cis.get(kod)
        if kod == 9999 or c is None:
            continue
        if c['okres'] == 'אזור יהודה ושומרון':
            vynechano['Západní břeh'] += 1
            continue
        if c['podokres'] == 'גולן':
            vynechano['Golany'] += 1
            continue
        if not c['itm_x']:
            vynechano['bez souřadnic'] += 1
            continue
        t = typ_obce(kod, cis)
        body.append([int(c['itm_x']), int(c['itm_y']), int(r['מצביעים']), 'A' if t in (2, 3) else 'O'])
    VYSTUP.write_text(json.dumps(body, separators=(',', ':')), encoding='utf-8')
    a = [b for b in body if b[3] == 'A']
    print(f'{len(body)} obcí na mapě ({len(a)} arabských, voliči {sum(b[2] for b in a):,}); vynecháno {vynechano}')


if __name__ == '__main__':
    main()
