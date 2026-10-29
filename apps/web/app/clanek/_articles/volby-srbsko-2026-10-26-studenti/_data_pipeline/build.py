# Analýza parlamentních voleb v Srbsku 25. 10. 2026 – čísla do textu a data grafu.
#
# Vstup (sdílený s článkem volby-srbsko-2026-10-25-predikce, _data_pipeline/data/):
#   rik/rik_2026_parlamentarni_20261029_0720.json – oficiální stránka výsledků RIK (endpoint /get_results/), 29. 10. 2026 7:20
#   rik/rik_2023_parlamentarni.json             – totéž pro volby 17. 12. 2023 (konečný stav RIK)
#   latest.json                                 – živý model Mahdalová & Škop (geografie: vedoucí listina v obcích)
# Výstup: vystup.json a apps/web/components/charts/serbia2026AnalyzaData.ts
# Spuštění z kořene repa: python apps/web/app/clanek/_articles/volby-srbsko-2026-10-26-studenti/_data_pipeline/build.py
import json, os, sys
from collections import Counter, defaultdict
sys.stdout.reconfigure(encoding='utf-8')

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', '..', '..', '..'))
DATA = os.path.abspath(os.path.join(HERE, '..', '..', 'volby-srbsko-2026-10-25-predikce', '_data_pipeline', 'data'))
D = lambda f: json.load(open(os.path.join(DATA, f), encoding='utf-8'))
num = lambda s: int(str(s).replace('.', ''))

def rik(f):
    d = D(f'rik/{f}')
    st = d['stat_sum_numbers']
    valid, invalid = d['sum_config']['data']['datasets'][0]['data']
    notvoted, voted = d['processed_config']['data']['datasets'][0]['data']
    lists = {int(r['list_name'].split('.')[0]): (r['list_name'], num(r['won_number'])) for r in d['table_data']}
    # hlasovalo = podepsaní ve výpisu voličů; lístků ve schránkách (platné + neplatné) je o pár tisíc méně
    return {'stav': st['datetime'], 'zapsani_zpracovano': notvoted + voted, 'nehlasovalo': notvoted, 'hlasovalo': voted,
            'platne': valid, 'neplatne': invalid, 'listiny': lists}

r23, r26 = rik('rik_2023_parlamentarni.json'), rik('rik_2026_parlamentarni_20261029_0720.json')
v = lambda r, i: r['listiny'][i][1]
assert 'ВУЧИЋ' in r23['listiny'][1][0] and 'ВУЧИЋ' in r26['listiny'][1][0]
assert 'СРБИЈА ПРОТИВ НАСИЉА' in r23['listiny'][7][0] and 'СТУДЕНТ' in r26['listiny'][3][0]
assert 'ДАЧИЋ' in r23['listiny'][2][0] and 'ДАЧИЋ' in r26['listiny'][2][0]
assert 'РАДИКАЛНА' in r23['listiny'][3][0]   # SRS kandidovala 2023 samostatně, 2026 na Vučićově listině

out = {'stav_2026': r26['stav'], 'stav_2023': r23['stav']}
out['sns_2023'], out['sns_2026'] = v(r23, 1), v(r26, 1)
out['srs_2023'] = v(r23, 3)
out['sns_srs_2023'] = out['sns_2023'] + out['srs_2023']
out['sns_rozdil'] = out['sns_2026'] - out['sns_2023']
out['sns_srs_rozdil'] = out['sns_2026'] - out['sns_srs_2023']
out['spn_2023'], out['studenti_2026'] = v(r23, 7), v(r26, 3)
out['sps_2023'], out['sps_2026'] = v(r23, 2), v(r26, 2)
out['ostatni_2023'] = r23['platne'] - out['sns_2023'] - out['srs_2023'] - out['spn_2023'] - out['sps_2023']
out['ostatni_2026'] = r26['platne'] - out['sns_2026'] - out['studenti_2026'] - out['sps_2026']
out['krome_sns_2023'] = r23['platne'] - out['sns_2023']          # všechny ostatní platné hlasy 2023 (včetně SRS)
out['studenti_minus_krome_sns_2023'] = out['studenti_2026'] - out['krome_sns_2023']
out['studenti_minus_spn'] = out['studenti_2026'] - out['spn_2023']
for k in ('hlasovalo', 'platne', 'neplatne', 'nehlasovalo', 'zapsani_zpracovano'):
    out[f'{k}_2023'], out[f'{k}_2026'] = r23[k], r26[k]
out['hlasovalo_rozdil'] = r26['hlasovalo'] - r23['hlasovalo']
out['ucast_2023'] = round(100 * r23['hlasovalo'] / r23['zapsani_zpracovano'], 2)
out['ucast_2026'] = round(100 * r26['hlasovalo'] / r26['zapsani_zpracovano'], 2)
pct = lambda a, b: round(100 * a / b, 2)
out['podil_platne'] = {'sns_2023': pct(out['sns_2023'], r23['platne']), 'sns_2026': pct(out['sns_2026'], r26['platne']),
                       'spn_2023': pct(out['spn_2023'], r23['platne']), 'studenti_2026': pct(out['studenti_2026'], r26['platne']),
                       'sps_2023': pct(out['sps_2023'], r23['platne']), 'sps_2026': pct(out['sps_2026'], r26['platne'])}
# podíl z ZAPSANÝCH voličů – kolik lidí z celého voličstva listinu volilo
out['podil_zapsani'] = {'sns_2023': pct(out['sns_2023'], r23['zapsani_zpracovano']), 'sns_2026': pct(out['sns_2026'], r26['zapsani_zpracovano']),
                        'studenti_2026': pct(out['studenti_2026'], r26['zapsani_zpracovano']), 'spn_2023': pct(out['spn_2023'], r23['zapsani_zpracovano'])}

# ---- geografie podle predikce (vedoucí listina v obcích a městských obvodech RIK) ----
latest = D('latest.json')
names = {p['id']: p['display_name'] for p in latest['parties']}
g = latest['geography']
out['obce_celkem'] = len(g)
out['obce_vede'] = {names[k]: n for k, n in Counter(x['projected_leader'] for x in g).most_common()}
zap = Counter()
for x in g:
    zap[names[x['projected_leader']]] += x['registered']
out['zapsani_kde_vede'] = dict(zap)
reg = defaultdict(Counter)
for x in g:
    reg[x['region']][names[x['projected_leader']]] += 1
out['regiony'] = {k: dict(c) for k, c in reg.items()}
big = sorted([x for x in g if x['region'] not in ('Inostranstvo', 'Zatvori')], key=lambda x: -x['registered'])
out['velke_obce_100k'] = [(x['municipality_name'], x['registered'], names[x['projected_leader']], round(x['projected_leader_share_pct'], 1)) for x in big if x['registered'] >= 100000]
out['zahranici_studenti'] = round(next(x['projected_leader_share_pct'] for x in g if x['region'] == 'Inostranstvo'), 1)
bg = [x for x in g if x['region'] == 'Beograd']
out['beograd'] = {'obvodu': len(bg), 'studenti_vedou': sum(x['projected_leader'] == 'list_03' for x in bg),
                  'min': min(round(x['projected_leader_share_pct'], 1) for x in bg), 'max': max(round(x['projected_leader_share_pct'], 1) for x in bg)}
mala = [x for x in g if x['region'] not in ('Inostranstvo', 'Zatvori', 'Kosovo i Metohija', 'Beograd') and x['registered'] < 20000]
out['male_obce_pod_20k'] = {'pocet': len(mala), 'vede': {names[k]: n for k, n in Counter(x['projected_leader'] for x in mala).most_common()}}
json.dump(out, open(os.path.join(HERE, 'vystup.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

# ---- data grafu: hlasy 2023 a 2026 (v tisících) ----
rows = [
    ['Vučićova listina', out['sns_2023'], out['sns_2026'], 'sns'],
    ['Srbská radikální strana', out['srs_2023'], 0, 'srs'],
    ['Srbsko proti násilí (2023) / Studentská listina (2026)', out['spn_2023'], out['studenti_2026'], 'opo'],
    ['Socialisté (SPS)', out['sps_2023'], out['sps_2026'], 'sps'],
    ['Ostatní kandidátky', out['ostatni_2023'], out['ostatni_2026'], 'ost'],
    ['Neplatné hlasy', r23['neplatne'], r26['neplatne'], 'nep'],
    ['Nepřišli k volbám', r23['nehlasovalo'], r26['nehlasovalo'], 'nev'],
]
ts = os.path.join(ROOT, 'apps', 'web', 'components', 'charts', 'serbia2026AnalyzaData.ts')
with open(ts, 'w', encoding='utf-8') as fh:
    fh.write('// Srbsko, parlamentní volby 2023 a 2026 podle RIK. GENEROVÁNO – neupravovat ručně.\n')
    fh.write('// Skript: _data_pipeline/build.py u článku volby-srbsko-2026-10-26-studenti.\n')
    fh.write(f"// 2023: konečný stav RIK; 2026: stav RIK {r26['stav']} (8 338 z 8 392 volebních míst).\n")
    fh.write('// [skupina, hlasy 2023, hlasy 2026, klíč barvy]\n')
    fh.write('export const VOTES: [string, number, number, string][] = ' + json.dumps(rows, ensure_ascii=False) + ';\n')
print(json.dumps(out, ensure_ascii=False, indent=1))
