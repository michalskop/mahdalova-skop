# Kontrola barev: klub každého vítěze v kluby.json proti senat.cz.
# Obhájci (dosavadní senátoři) = klub podle senat.cz k 1. 10. 2026 (senat-data.json, pole senator_ted).
# Noví senátoři = klub zatím neznámý; barva podle navrhující strany (kluby.json), v grafech označeno.
import json, os, sys
sys.stdout.reconfigure(encoding='utf-8')
H = os.path.dirname(os.path.abspath(__file__))
sd = json.load(open(os.path.join(H, 'senat-data.json'), encoding='utf-8'))
kl = json.load(open(os.path.join(H, '..', 'kluby.json'), encoding='utf-8'))
L = json.load(open(os.path.join(H, 'zdroj', 'latest.json'), encoding='utf-8'))
MAP = {'ods-top09': 'ods', 'stan': 'stan', 'kdu': 'kdu', 'sen21-pirati': 'nez', 'ano': 'ano', 'nezarazeni': 'nez'}  # klub SEN 21 a Piráti zanikl → nezařazení
inc = {k['jmeno']: MAP[k['senator_ted']] for k in sd['kandidati'] if k['senator_ted']}
chyby = 0
for o, v in sorted(L['se2'].items(), key=lambda x: int(x[0])):
    if v['status'] == 'decided_r1': w = v['winner']['name']
    else:
        ev = (L.get('decided') or {}).get(o); w = ev['name'] if ev else (v['a']['name'] if v['p_a'] >= .5 else v['b']['name'])
    k = kl['kandidati'][o][w]['klub']
    if w in inc:
        ok = inc[w] == k; chyby += not ok
        print(f'{o:>2} {w:28s} OBHÁJCE  senat.cz: {inc[w]:5s} kluby.json: {k:5s} {"OK" if ok else "!!! NESEDÍ"}')
    else:
        print(f'{o:>2} {w:28s} NOVÝ     barva podle navrhující strany: {k}')
print('chyb:', chyby)
