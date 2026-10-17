# Bilance stran a klubů ve volbách do Senátu 2026 (1. a 2. kolo).
# Vstupy: zdroj/ob/<obvod>.json = výsledky 1. kola ČSÚ (volby.gov.cz/appdata/senat/20261009/vysled/obvod/<n>.json),
#         predikce 2. kola: https://volby2026-2.datatimes.cz/api/latest.json (stáhne se živě, uloží do zdroj/latest.json),
#         ../kluby.json = předpokládaný klub kandidátů.
# Sloupce výsledku ČSÚ: [číslo, jméno, navrhující subjekt (zkr.), navrhující strana (zkr.), příslušnost (zkr.), hlasy, %, ...]
import json, sys, urllib.request, collections, os
sys.stdout.reconfigure(encoding='utf-8')
H = os.path.dirname(os.path.abspath(__file__))
raw = urllib.request.urlopen(urllib.request.Request('https://volby2026-2.datatimes.cz/api/latest.json', headers={'User-Agent': 'Mozilla/5.0 DataTimes bilance'})).read()
open(os.path.join(H, 'zdroj', 'latest.json'), 'wb').write(raw)
L = json.loads(raw)
kl = json.load(open(os.path.join(H, '..', 'kluby.json'), encoding='utf-8'))
def norm(n):  # "Plevný Miroslav prof. Dr." -> "Miroslav Plevný"
    t = [x for x in n.split() if '.' not in x and x not in ('MBA', 'MHA', 'DiS', 'et', 'Ph.D.')]
    return ' '.join([t[-1]] + t[:-1])
nom = collections.Counter(); post = collections.Counter(); vyhra = collections.Counter(); vyhra_jmena = collections.defaultdict(list)
klub_vyhra = collections.Counter()
nerozhodnuto = []
print('stav predikce:', L['generated'], 'sečteno okrsků', L['se2_reported_precincts'])
for o in range(3, 82, 3):
    d = json.load(open(os.path.join(H, 'zdroj', 'ob', f'{o}.json'), encoding='utf-8'))
    s = L['se2'][str(o)]
    if s['status'] == 'decided_r1':
        win = s['winner']['name']; jak = '1. kolo'
    else:
        ev = (L.get('decided') or {}).get(str(o))
        if s.get('final'): win = s['a']['name'] if s['p_a'] >= .5 else s['b']['name']; jak = 'sečteno'
        elif ev and not ev.get('revoked'): win = ev['name']; jak = 'predikce ≥ 99 %'
        else: win = None; jak = 'nerozhodnuto'; nerozhodnuto.append(o)
    for r in d['vysledky']:
        j = norm(r[1]); strana = r[3]
        nom[strana] += 1
        if r[0] in (d['postupuje'] or []): post[strana] += 1
        if j == win:
            vyhra[strana] += 1; vyhra_jmena[strana].append(f'{j} ({o} {d["obvodNazev"]}, {jak})')
            klub_vyhra[kl['kandidati'][str(o)][j]['klub']] += 1
print('\nNAVRHUJÍCÍ STRANA (v koalici strana, která kandidáta navrhla): navrženo / ve 2. kole nebo zvolen v 1. / zvoleno')
for st, n in nom.most_common():
    if vyhra[st] or post[st] or n >= 5:
        print(f'  {st:20s} {n:3d} {post[st]:3d} {vyhra[st]:3d}  ' + '; '.join(vyhra_jmena[st]))
obhajoba = {'stan': 11, 'ods': 9, 'kdu': 3, 'sen21': 3, 'ano': 1}
print('\nPŘEDPOKLÁDANÝ KLUB: obhajoval křesel / získal')
for k in ['stan', 'ods', 'kdu', 'sen21', 'ano', 'nez']:
    print(f'  {k:6s} {obhajoba.get(k, 0):3d} {klub_vyhra[k]:3d}')
print('nerozhodnuté obvody:', nerozhodnuto)
k30 = L['se2']['30']; print('\nKladno:', k30['a']['name'], round(k30['a_share'] * 100, 2), '% vs', k30['b']['name'], round((1 - k30['a_share']) * 100, 2), '%, sečteno', k30['n_counted'], '/', k30['n_total'], 'final', k30.get('final'))

# Obhajoby: senátoři, kterým letos končil mandát (obvody dělitelné 3) nebo kteří kandidovali jinde, podle senat-data.json
sd = json.load(open(os.path.join(H, 'senat-data.json'), encoding='utf-8'))
koncici = {s['jmeno'] for s in sd['senatori'] if s['konci2026']}
kand_vse = {}
for o in range(3, 82, 3):
    d = json.load(open(os.path.join(H, 'zdroj', 'ob', f'{o}.json'), encoding='utf-8'))
    for r in d['vysledky']: kand_vse[norm(r[1])] = o
zvoleni = set(n for v in vyhra_jmena.values() for n in [x.split(' (')[0] for x in v])
obhajci = [n for n in koncici if n in kand_vse]
print(f'\nObhajoby: kandidovalo {len(obhajci)} z {len(koncici)} senátorů s končícím mandátem, zvoleno {sum(n in zvoleni for n in obhajci)}')
print('  neuspěli:', sorted(n for n in obhajci if n not in zvoleni))
