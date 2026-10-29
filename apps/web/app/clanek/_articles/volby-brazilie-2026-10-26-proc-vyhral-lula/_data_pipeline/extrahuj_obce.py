# Výsledky prezidentských voleb v Brazílii 2026 po obcích -> jedna tabulka obce_tse_2026.csv
#
# Zdroj: Tribunal Superior Eleitoral, oficiální výsledky (resultados.tse.jus.br/oficial/ele2026),
#   1. kolo = volba 6257 (4. 10. 2026), 2. kolo = volba 6258 (25. 10. 2026), funkce 0001 = prezident.
#   Soubory stáhne stahni_tse.py (5 757 obcí včetně zahraničí „zz“ × 2 kola, staženo 26. 10. 2026
#   dopoledne, stav TSE 100 % sečteno). Seznam obcí s kódy TSE a IBGE: config/mun-e006258-cm.json.
# Spuštění:  python extrahuj_obce.py <složka se staženými soubory>
import json, os, sys, csv
SRC = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
cfg = json.load(open(os.path.join(SRC, 'mun6258.json'), encoding='utf-8-sig'))
CANDS = {'13': 'lula', '22': 'flavio', '70': 'cury', '14': 'renan', '55': 'caiado', '30': 'zema'}
cols = ['uf', 'tse', 'ibge', 'nazev']
for k in ('r1', 'r2'):
    cols += [f'{k}_volici', f'{k}_prislo', f'{k}_prazdne', f'{k}_neplatne', f'{k}_platne', f'{k}_lula', f'{k}_flavio']
cols += ['r1_cury', 'r1_renan', 'r1_caiado', 'r1_zema', 'r1_ostatni']
rows = []
for uf in cfg['abr']:
    for m in uf['mu']:
        row = {'uf': uf['cd'].upper(), 'tse': m['cd'], 'ibge': m.get('cdi', ''), 'nazev': m['nm']}
        for k, ele in (('r1', '6257'), ('r2', '6258')):
            d = json.load(open(os.path.join(SRC, ele, uf['cd'], m['cd'] + '.json'), encoding='utf-8-sig'))
            assert d['s']['pst'] == '100,00', (ele, uf['cd'], m['cd'], d['s']['pst'])
            row[f'{k}_volici'] = int(d['e']['te']); row[f'{k}_prislo'] = int(d['e']['c'])
            row[f'{k}_prazdne'] = int(d['v']['vb']); row[f'{k}_neplatne'] = int(d['v']['tvn'])
            row[f'{k}_platne'] = int(d['v']['vv'])
            votes = {}
            for a in d['carg'][0]['agr']:
                for p in a['par']:
                    for c in p['cand']:
                        votes[c['n']] = int(c['vap'])
            row[f'{k}_lula'] = votes['13']; row[f'{k}_flavio'] = votes['22']
            if k == 'r1':
                for n, key in CANDS.items():
                    if key not in ('lula', 'flavio'):
                        row[f'r1_{key}'] = votes.get(n, 0)
                row['r1_ostatni'] = sum(v for n, v in votes.items() if n not in CANDS)
        rows.append(row)
with open(os.path.join(HERE, 'obce_tse_2026.csv'), 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=cols); w.writeheader(); w.writerows(rows)
print(len(rows), 'obcí')
