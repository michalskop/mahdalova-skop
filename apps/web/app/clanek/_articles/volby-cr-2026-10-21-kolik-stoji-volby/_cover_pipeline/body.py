"""Body pro cover: každá obec jako kolečko velké podle počtu voličů, barva podle toho, kolik v ní stojí okrsková
komise na voliče (odměny komisí se zákonným minimem členů, výstup ../_data_pipeline/obce_2026.json z build.py).

Polohy obcí = body.json z coveru článku volby-cr-2026-10-19-komu-patri-cesko-po-komunalnich-volbach (těžiště obce
přepočtené na zeměpisné souřadnice, postup je popsaný v tamním body.py).
Výstup: body.json ([{lon, lat, v, drahe}]), spuštění: python body.py
"""
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
HERE = Path(__file__).parent
ART = HERE.parent
POLOHY = ART.parent / 'volby-cr-2026-10-19-komu-patri-cesko-po-komunalnich-volbach' / '_cover_pipeline' / 'body.json'

obce = json.loads((ART / '_data_pipeline' / 'obce_2026.json').read_text(encoding='utf-8'))
poloha = {b['kod']: b for b in json.loads(POLOHY.read_text(encoding='utf-8'))}
body = [{'lon': poloha[k]['lon'], 'lat': poloha[k]['lat'], 'v': o['v'], 'drahe': o['o'] / o['v'] > 100}
        for k, o in obce.items() if k in poloha]
(HERE / 'body.json').write_text(json.dumps(body), encoding='utf-8')
print('obcí:', len(body), 'z', len(obce), '| komise přes 100 Kč na voliče:', sum(b['drahe'] for b in body))
