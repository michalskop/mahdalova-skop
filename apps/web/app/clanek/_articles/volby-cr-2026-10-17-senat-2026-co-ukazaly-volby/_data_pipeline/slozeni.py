# Nové složení Senátu po volbách 2026 -> ../slozeni.json (pro komponentu <SenatSlozeni>).
# 54 senátorů s trvajícím mandátem a jejich klub: senat.cz k 1. 10. 2026 (senat-data.json v článku o 2. kole).
# 27 zvolených: výsledky ČSÚ 2026 po obvodech (zdroj/d26, stahuje senat_hist.py); předpokládaný klub: kluby.json článku o 2. kole
# (dosavadní senátor zůstává ve svém klubu, jinak klub strany, jejímž je členem, nebo která ho navrhla; strany bez klubu = nezařazení).
import json, os, sys
sys.stdout.reconfigure(encoding='utf-8')
H = os.path.dirname(os.path.abspath(__file__))
SES = os.path.normpath(os.path.join(H, '..', '..', 'volby-cr-2026-10-17-senat-druhe-kolo-predikce'))
sd = json.load(open(os.path.join(SES, '_data_pipeline', 'senat-data.json'), encoding='utf-8'))
kl = json.load(open(os.path.join(SES, 'kluby.json'), encoding='utf-8'))
KLUB_SD = {'ods-top09': 'ods', 'sen21-pirati': 'nez', 'nezarazeni': 'nez'}  # klub SEN 21 a Piráti po 10. 10. zanikl -> nezařazení

def jmeno_csu(n):  # "Ceralová Petrofová Zuzana Mgr." -> "Zuzana Ceralová Petrofová"
    t = [x for x in n.split() if '.' not in x and x not in ('MBA', 'MHA', 'DiS', 'et', 'MPA')]
    return ' '.join([t[-1]] + t[:-1])

sedadla = []
for s in sd['senatori']:
    if s['konci2026']: continue
    sedadla.append(dict(jmeno=s['jmeno'], obvod=s['obvod'], obvodNazev=s['obvod_nazev'], klub=KLUB_SD.get(s['klub'], s['klub']), nove=False))
for o in range(3, 82, 3):
    d = json.load(open(os.path.join(H, 'zdroj', 'd26', f'{o}.json'), encoding='utf-8'))
    post = d['postupuje'] or []; z = d['zvoleny']
    if z is None and post:  # obvod 24: ČSÚ k 17. 10. 17:10 neoznačil zvoleného, sečteno 100 % – vítěz podle hlasů
        z = max((r for r in d['vysledky'] if r[0] in post), key=lambda r: r[7])[0]
    r = next(r for r in d['vysledky'] if r[0] == z)
    j = jmeno_csu(r[1])
    info = kl['kandidati'][str(o)].get(j)
    assert info, (o, j)
    sedadla.append(dict(jmeno=j, obvod=o, obvodNazev=d['obvodNazev'], klub=info['klub'], nove=True,
                        kolo=1 if not post else 2, navrh=info.get('navrh', r[3])))
assert len(sedadla) == 81 and len({s['obvod'] for s in sedadla}) == 81
# Klub SEN 21 a Piráti po 10. 10. zanikl a do pěti členů nikdo nedorostl -> Václav Láska (SEN 21) je nezařazený, šedě.
# Teal #0e839e (brandTeal.6) je vyhrazená pro klub SEN 21, pokud vznikne (Kateřina, 17. 10. 2026).
for s_ in sedadla:
    if s_['klub'] == 'sen21': s_['klub'] = 'nez'
kluby = [k for k in kl['kluby'] if any(s['klub'] == k['id'] for s in sedadla)]

out = dict(stav='Nové složení Senátu po volbách 2026. Mandáty, které trvají: senat.cz k 1. 10. 2026; zvolení 2026: ČSÚ; '
                'u nově zvolených předpokládaný klub (kluby se ustálí po volbách).',
           kluby=kluby, sedadla=sorted(sedadla, key=lambda s: s['obvod']))
json.dump(out, open(os.path.join(H, '..', 'slozeni.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
from collections import Counter
print('kluby:', dict(Counter(s['klub'] for s in sedadla)), '| nově zvolení:', sum(s['nove'] for s in sedadla))
