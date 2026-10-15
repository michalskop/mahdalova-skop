"""Data pro galerii dlaždic: jedna tečková mapa ČR za každou stranu.

Pro každou obec (město včetně městských částí) a stranu:
  plná tečka  = strana má zastupitele po volbách 2026
  kroužek     = měla zastupitele po volbách 2022 (nebo pozdějších), teď žádného;
                u stran, které v roce 2022 nekandidovaly (Motoristé, Stačilo!), = letos kandidovala a nikdo neprošel
Vstupy: ../_data_pipeline/zastupitelstva.csv (výstup build.py), středy obcí z body.py (přepočet stejný).
Výstup: dlazdice.json, spuštění: python dlazdice.py
"""
import csv
import json
from collections import defaultdict
from pathlib import Path

import body as B   # středy obcí v WGS84 (B.stred + B.to_wgs) – body.py při importu zapíše i body.json

HERE = Path(__file__).parent
CSV = HERE.parent / '_data_pipeline' / 'zastupitelstva.csv'

# KSČM a Stačilo! jako jedna karta (kss = navržení kteroukoli z nich, viz build.py)
STRANY = [('spd', 'SPD'), ('ano', 'ANO'), ('aut', 'Motoristé'), ('kss', 'KSČM a Stačilo!'), ('pro', 'PRO')]
NOVE = {'aut', 'sta'}   # v roce 2022 nekandidovaly

soucty = defaultdict(lambda: defaultdict(lambda: [0, 0, 0, 0]))   # obec -> strana -> [m22, k26, m26, k22]
celkem = defaultdict(lambda: [0, 0, 0])                            # strana -> [m22, m26, k26] za všechna zastupitelstva
with open(CSV, encoding='utf-8') as f:
    for r in csv.DictReader(f):
        for s, _ in STRANY:
            v = [int(r[f'{s}_m22']), int(r[f'{s}_k26']), int(r[f'{s}_m26']), int(r[f'{s}_k22'])]
            t = soucty[r['obec']][s]
            for i in range(4):
                t[i] += v[i]
            celkem[s][0] += v[0]; celkem[s][1] += v[2]; celkem[s][2] += v[1]

out = {}
for s, nazev in STRANY:
    body = []
    plne = prazdne = 0
    for kod, st in soucty.items():
        m22, k26, m26, _ = st[s]
        if m26:
            stav = 1
        elif (m22 if s not in NOVE else k26):
            stav = 0
        else:
            continue
        plne += stav; prazdne += 1 - stav
        if kod not in B.stred:   # obec bez polygonu v geometrii 2022 – počítá se, ale tečka chybí
            print(f'  {s}: obec {kod} nemá polygon')
            continue
        lon, lat = B.to_wgs.transform(*B.stred[kod])
        body.append([round(lon, 4), round(lat, 4), stav, int(m22 > 0)])   # 4. pole: měla zastupitele 2022 (pro GIF)
    m22, m26, k26 = celkem[s]
    out[s] = {'nazev': nazev, 'nova': s in NOVE, 'body': body, 'plne': plne, 'prazdne': prazdne,
              'm22': m22, 'm26': m26, 'k26': k26}
    print(f'{nazev:10} obcí plných {plne:>4}, kroužků {prazdne:>4} | zastupitelé {m22} → {m26}, kandidátů 2026 {k26}')

(HERE / 'dlazdice.json').write_text(json.dumps(out, ensure_ascii=False), encoding='utf-8')
