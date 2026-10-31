# Parlamentní volby v Srbsku 25. 10. 2026 – všechna čísla do článku.
#
# Vstup: data/ = snímek živého modelu Mahdalová & Škop (API /rs/api/latest.json a /rs/api/series/*.json),
#        stažený 29. 10. 2026 v 7:19 SEČ; model počítá z průběžných výsledků Republičke izborne komisije (RIK)
#        po volebních místech (biračka mesta).
# Výstup: vystup.json (čísla do textu a key-stats) a
#         apps/web/components/charts/serbia2026Data.ts (data grafu).
# Spuštění z kořene repa:  python apps/web/app/clanek/_articles/volby-srbsko-2026-10-25-predikce/_data_pipeline/build.py
#
# Pojmy (sloupce řad list_XX.json):
#   coverage  = sečteno, % zapsaných voličů ve volebních místech, která už nahlásila výsledek
#   reported  = podíl listiny na platných hlasech v dosud sečtených místech (průběžné sčítání RIK)
#   projected, low, high = predikce konečného podílu a 90% interval
#   seats     = bodový odhad mandátů (250 křesel, D'Hondt, hranice 3 %, menšinové listiny bez hranice)
import json, os, sys, datetime as dt
sys.stdout.reconfigure(encoding="utf-8")
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', '..', '..', '..'))
D = lambda f: json.load(open(os.path.join(HERE, 'data', f), encoding='utf-8'))

latest = D('latest.json')
CET = dt.timezone(dt.timedelta(hours=1))   # od 25. 10. 2026 03:00 platí v Srbsku i v Česku SEČ
cet = lambda t: dt.datetime.fromtimestamp(t, CET)
hm = lambda t: cet(t).strftime('%H:%M')
den = lambda t: cet(t).strftime('%-d. %-m. %H:%M') if os.name != 'nt' else cet(t).strftime('%#d. %#m. %H:%M')
CLOSE = dt.datetime(2026, 10, 25, 19, 0, tzinfo=dt.timezone.utc).timestamp()   # místnosti zavřely ve 20:00 SEČ

def series(lid):
    s = D(f'series/{lid}.json')
    return [dict(zip(s['cols'], r)) for r in s['rows']]

SNS, STU = 'list_01', 'list_03'
sns, stu = series(SNS), series(STU)
assert [r['time'] for r in sns] == [r['time'] for r in stu]
both = [(a, b) for a, b in zip(sns, stu) if a['projected'] is not None and b['projected'] is not None]

P = {p['id']: p for p in latest['parties']}
cnt = latest['counts']
out = {}
out['stav'] = den(latest['source_time'] if isinstance(latest['source_time'], (int, float))
                  else dt.datetime.fromisoformat(latest['source_time']).timestamp())
out['secteno_pct_zapsanych'] = round(cnt['registered_coverage_pct'], 2)
out['mista_sectena'] = cnt['reported_stations']
out['mista_celkem'] = cnt['expected_stations']
out['zapsani'] = cnt['registered_total']
out['platne_hlasy_sectene'] = cnt['reported_valid']
out['ucast_prubezne'] = round(latest['turnout']['reported_cast_pct'], 2)
out['ucast_predikce'] = round(latest['turnout']['projected_cast_pct'], 2)
out['hranice_platnych_pct'] = round(latest['threshold_valid_share_pct'], 2)

out['listiny'] = []
for p in sorted(latest['parties'], key=lambda p: -p['reported_votes']):
    out['listiny'].append({
        'id': p['id'], 'nazev': p['display_name'], 'mensinova': p['minority'],
        'hlasy': p['reported_votes'], 'prubezne': round(p['reported_share_pct'], 2),
        'predikce': round(p['projected_share_pct'], 2), 'lo': round(p['share_low_90'], 2), 'hi': round(p['share_high_90'], 2),
        'mandaty': p['point_seats'],
    })
out['mandaty_celkem'] = sum(p['point_seats'] for p in latest['parties'])
assert out['mandaty_celkem'] == 250
out['mandaty_mensiny'] = sum(p['point_seats'] for p in latest['parties'] if p['minority'])
out['rozdil_hlasu_stu_sns'] = P[STU]['reported_votes'] - P[SNS]['reported_votes']
out['rozdil_pb'] = round(P[STU]['reported_share_pct'] - P[SNS]['reported_share_pct'], 2)

# ---- volební noc ----
FIN_STU, FIN_SNS = P[STU]['reported_share_pct'], P[SNS]['reported_share_pct']   # skoro konečný stav (99,6 %)
f = both[0]
out['prvni_odhad'] = {'cas': hm(f[0]['time']), 'secteno': round(f[0]['coverage'], 3),
                      'sns': round(f[0]['projected'], 1), 'stu': round(f[1]['projected'], 1),
                      'sns_prubezne': round(f[0]['reported'], 1), 'stu_prubezne': round(f[1]['reported'], 1),
                      'stu_lo': round(f[1]['low'], 1), 'stu_hi': round(f[1]['high'], 1)}

def trvale_od(cond, rows):
    """první řádek, od kterého podmínka platí už až do konce"""
    last_bad = max((i for i, r in enumerate(rows) if not cond(r)), default=-1)
    return rows[last_bad + 1] if last_bad + 1 < len(rows) else None

def bod(r, extra=None):
    a, b = r
    d = {'cas': hm(a['time']), 'secteno': round(a['coverage'], 2),
         'stu': round(b['projected'], 2), 'sns': round(a['projected'], 2),
         'stu_prubezne': round(b['reported'], 2), 'sns_prubezne': round(a['reported'], 2),
         'stu_lo': round(b['low'], 2), 'stu_hi': round(b['high'], 2),
         'sns_lo': round(a['low'], 2), 'sns_hi': round(a['high'], 2),
         'stu_mandaty': b['seats'], 'sns_mandaty': a['seats']}
    return d

r = trvale_od(lambda r: r[1]['projected'] > r[0]['projected'], both)
out['predikce_stu_vede_od'] = bod(r)
r = trvale_od(lambda r: r[1]['low'] is not None and r[0]['high'] is not None and r[1]['low'] > r[0]['high'], both)
out['intervaly_oddeleny_od'] = bod(r)
r = trvale_od(lambda r: r[1]['seats'] is not None and r[1]['seats'] >= 126, both)
out['predikce_vetsina_stu_od'] = bod(r)
r = trvale_od(lambda r: r[1]['low'] is not None and r[1]['low'] > 50, both)
out['interval_stu_nad_50_od'] = bod(r) if r else None
# průběžné sčítání: kdy studenti trvale předstihli SNS v sečtených hlasech
allrows = list(zip(sns, stu))
r = trvale_od(lambda r: r[1]['reported'] is not None and r[0]['reported'] is not None and r[1]['reported'] > r[0]['reported'], allrows)
out['prubezne_stu_vede_od'] = {'cas': hm(r[0]['time']), 'secteno': round(r[0]['coverage'], 2),
                               'stu_prubezne': round(r[1]['reported'], 2), 'sns_prubezne': round(r[0]['reported'], 2)}
r = trvale_od(lambda r: r[1]['reported'] is not None and r[1]['reported'] > 50, allrows)
out['prubezne_stu_nad_50_od'] = {'cas': hm(r[0]['time']), 'secteno': round(r[0]['coverage'], 2)}
ft = lambda s: dt.datetime.strptime(s, '%H:%M')
out['nahled_minut'] = int((ft(out['prubezne_stu_vede_od']['cas']) - ft(out['predikce_stu_vede_od']['cas'])).seconds / 60)
out['nahled_minut_intervaly'] = int((ft(out['prubezne_stu_vede_od']['cas']) - ft(out['intervaly_oddeleny_od']['cas'])).seconds / 60)

# maximum SNS v průběžném sčítání po uzavření místností
mx = max((r for r in allrows if r[0]['time'] >= CLOSE and r[0]['reported'] is not None), key=lambda r: r[0]['reported'])
out['prubezne_sns_max'] = {'cas': hm(mx[0]['time']), 'secteno': round(mx[0]['coverage'], 3), 'sns': round(mx[0]['reported'], 2)}

# stavy v milnících sečtení
out['milniky'] = []
for m in [1, 3, 5, 10, 25, 50, 75, 90, 95, 99]:
    r = next(r for r in both if r[0]['coverage'] >= m)
    out['milniky'].append({'milnik': m, **bod(r)})

# Kalibrace: jak daleko byla predikce od (skoro) konečného výsledku a jak často ho 90% interval obsahoval.
# Konečný výsledek = průběžný stav RIK při 99,6 % sečtených voličů.
def kal(od, do):
    rr = [r for r in both if od <= r[0]['coverage'] < do and r[1]['low'] is not None]
    if not rr:
        return None
    e_stu = [r[1]['projected'] - FIN_STU for r in rr]
    e_sns = [r[0]['projected'] - FIN_SNS for r in rr]
    in_stu = sum(r[1]['low'] <= FIN_STU <= r[1]['high'] for r in rr) / len(rr)
    in_sns = sum(r[0]['low'] <= FIN_SNS <= r[0]['high'] for r in rr) / len(rr)
    rep_stu = [r[1]['reported'] - FIN_STU for r in rr]
    return {'od': od, 'do': do, 'aktualizaci': len(rr),
            'stu_chyba_prumer': round(sum(e_stu) / len(e_stu), 2), 'stu_chyba_max': round(min(e_stu, key=lambda v: -abs(v)), 2),
            'sns_chyba_prumer': round(sum(e_sns) / len(e_sns), 2), 'sns_chyba_max': round(min(e_sns, key=lambda v: -abs(v)), 2),
            'stu_prubezne_chyba_prumer': round(sum(rep_stu) / len(rep_stu), 2),
            'stu_v_intervalu': round(in_stu * 100), 'sns_v_intervalu': round(in_sns * 100)}
out['kalibrace'] = [k for k in (kal(0, 1), kal(1, 5), kal(5, 25), kal(25, 50), kal(50, 90), kal(90, 101)) if k]
after3 = [r for r in both if r[0]['coverage'] >= 3]
out['od_3pct'] = {'stu_min': round(min(r[1]['projected'] for r in after3), 2), 'stu_max': round(max(r[1]['projected'] for r in after3), 2),
                  'sns_min': round(min(r[0]['projected'] for r in after3), 2), 'sns_max': round(max(r[0]['projected'] for r in after3), 2),
                  'stu_prubezne_min': round(min(r[1]['reported'] for r in after3), 2),
                  'sns_prubezne_max': round(max(r[0]['reported'] for r in after3), 2)}

# ---- geografie: kdo vede v kolika obcích a v jakých regionech ----
g = latest['geography']
names = {p['id']: p['display_name'] for p in latest['parties']}
out['obce_celkem'] = len(g)
out['obce_vede'] = {names[k]: v for k, v in Counter(x['projected_leader'] for x in g).most_common()}
reg = defaultdict(lambda: Counter())
for x in g:
    reg[x['region']][names[x['projected_leader']]] += 1
out['regiony_vede'] = {k: dict(v) for k, v in reg.items()}
# voliči v obcích, kde vedou studenti / SNS
vol = Counter()
for x in g:
    vol[x['projected_leader']] += x['registered']
out['zapsani_v_obcich_kde_vede'] = {names[k]: v for k, v in vol.items()}
out['zahranici'] = next(({'stu': round(x['projected_leader_share_pct'], 1), 'zapsani': x['registered']}
                         for x in g if x['region'] == 'Inostranstvo'), None)
out['nejvetsi_obce'] = [{'obec': x['municipality_name'], 'region': x['region'], 'zapsani': x['registered'],
                        'vede': names[x['projected_leader']], 'podil': round(x['projected_leader_share_pct'], 1)}
                       for x in sorted(g, key=lambda x: -x['registered'])[:15]]

# ---- oficiální stránka RIK (endpoint /get_results/, staženo 29. 10. 2026 7:20) a srovnání s volbami 2023 ----
# RIK počítá procenta ze všech odevzdaných lístků včetně neplatných; model a text počítají z platných hlasů.
num = lambda s: int(str(s).replace('.', ''))
def rik(f):
    d = D(f'rik/{f}')
    st = d['stat_sum_numbers']
    valid, invalid = d['sum_config']['data']['datasets'][0]['data']
    lists = {r['list_name']: (num(r['won_number']), r['won_percent']) for r in d['table_data']}
    return {'zapsani': num(st['total_voters']), 'hlasovalo': num(st['available']), 'platne': valid, 'neplatne': invalid,
            'mista': num(st['processed_stations']), 'mista_celkem': num(st['number_of_stations']), 'stav': st['datetime'], 'listiny': lists}
r26, r23 = rik('rik_2026_parlamentarni_20261029_0720.json'), rik('rik_2023_parlamentarni.json')
assert r26['platne'] == cnt['reported_valid'] and r26['hlasovalo'] == cnt['reported_votes']
first = lambda r, i: [v for k, v in r['listiny'].items() if k.startswith(f'{i}. ')][0]
out['rik_2026'] = {'stav': r26['stav'], 'mista': r26['mista'], 'mista_celkem': r26['mista_celkem'],
                   'stu_pct_rik': first(r26, 3)[1], 'sns_pct_rik': first(r26, 1)[1],
                   'ucast_rik': round(100 * r26['hlasovalo'] / (r26['zapsani'] * 1.0), 2)}
sns23, sps23 = first(r23, 1)[0], first(r23, 2)[0]
out['srovnani_2023'] = {
    'sns_hlasy_2023': sns23, 'sns_hlasy_2026': first(r26, 1)[0], 'sns_rozdil': first(r26, 1)[0] - sns23,
    'sns_platne_pct_2023': round(100 * sns23 / r23['platne'], 2),
    'sps_hlasy_2023': sps23, 'sps_hlasy_2026': first(r26, 2)[0],
    'hlasovalo_2023': r23['hlasovalo'], 'hlasovalo_2026': r26['hlasovalo'], 'hlasovalo_rozdil': r26['hlasovalo'] - r23['hlasovalo'],
    'ucast_2023': round(100 * r23['hlasovalo'] / r23['zapsani'], 2),
    'zapsani_2023': r23['zapsani'], 'zapsani_2026': r26['zapsani'],
    'ostatni_platne_2023': r23['platne'] - sns23, 'ostatni_platne_2026': r26['platne'] - first(r26, 1)[0],
}

# ---- vlastní kontrola rozdělení mandátů z průběžných hlasů RIK ----
# D'Hondt, 250 mandátů; hranice 3 % odevzdaných lístků (včetně neplatných); menšinové listiny hranici nepotřebují
# a jejich podíly se násobí 1,35 (novela zákona 2020, N1 8. 2. 2020). Menšinový status podle metadat modelu (RIK).
cast = cnt['reported_votes']
el = [(p['id'], p['reported_votes'] * (1.35 if p['minority'] else 1)) for p in latest['parties']
      if p['minority'] or p['reported_votes'] >= 0.03 * cast]
q = sorted(((v / k, i) for i, v in el for k in range(1, 251)), reverse=True)
seats = Counter(i for _, i in q[:250])
assert all(seats[p['id']] == p['point_seats'] for p in latest['parties']), (seats, 'nesedí s modelem')
posl, prvni_nezvoleny = q[249], q[250]
out['dhondt'] = {'posledni_mandat': names[posl[1]], 'posledni_podil': round(posl[0]),
                 'prvni_nezvoleny': names[prvni_nezvoleny[1]], 'prvni_nezvoleny_podil': round(prvni_nezvoleny[0]),
                 # kolik hlasů navíc by listina prvního nezvoleného potřebovala, aby předběhla poslední mandát
                 'chybi_hlasu': round((posl[0] - prvni_nezvoleny[0]) * (seats[prvni_nezvoleny[1]] + 1)),
                 'nesectena_mista': cnt['expected_stations'] - cnt['reported_stations'],
                 'nesecteni_zapsani': cnt['registered_total'] - cnt['reported_registered']}

json.dump(out, open(os.path.join(HERE, 'vystup.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

# ---- data grafu ----
# [minuty od 20:00 SEČ 25. 10., sečteno %, STU predikce, lo, hi, STU průběžně, SNS predikce, lo, hi, SNS průběžně]
pts, last_c = [], None
for a, b in both:
    if a['low'] is None or b['low'] is None:
        continue
    c = round(a['coverage'], 3)
    if c == last_c:            # model se přepočítal bez nových okrsků – do grafu stačí poslední stav
        pts.pop()
    last_c = c
    m = round((a['time'] - CLOSE) / 60, 1)
    pts.append([m, c, round(b['projected'], 2), round(b['low'], 2), round(b['high'], 2), round(b['reported'], 2),
                round(a['projected'], 2), round(a['low'], 2), round(a['high'], 2), round(a['reported'], 2)])
ts = os.path.join(ROOT, 'apps', 'web', 'components', 'charts', 'serbia2026Data.ts')
with open(ts, 'w', encoding='utf-8') as fh:
    fh.write('// Srbsko 2026, parlamentní volby 25. 10. 2026. GENEROVÁNO – neupravovat ručně.\n')
    fh.write('// Zdroj: živý model Mahdalová & Škop nad průběžnými daty RIK; skript _data_pipeline/build.py u článku\n')
    fh.write(f"// volby-srbsko-2026-10-25-predikce, stav {out['stav']} SEČ.\n")
    fh.write('// [minuty od 20:00 SEČ 25. 10., sečteno % voličů, Studenti predikce %, od, do, Studenti průběžně %,\n')
    fh.write('//  SNS predikce %, od, do, SNS průběžně %]\n')
    fh.write('export const NIGHT: number[][] = ' + json.dumps(pts, separators=(',', ':')) + ';\n')
    fh.write(f"export const STAV = {json.dumps(out['stav'] + ' SEČ', ensure_ascii=False)};\n")
    fh.write('export const MARKS = ' + json.dumps({
        'stuVede': out['predikce_stu_vede_od']['secteno'], 'oddeleno': out['intervaly_oddeleny_od']['secteno'],
        'prubezneVede': out['prubezne_stu_vede_od']['secteno'],
        'stuVedeCas': out['predikce_stu_vede_od']['cas'], 'oddelenoCas': out['intervaly_oddeleny_od']['cas'],
        'prubezneVedeCas': out['prubezne_stu_vede_od']['cas']}, ensure_ascii=False) + ';\n')
print(json.dumps({k: v for k, v in out.items() if k not in ('listiny', 'nejvetsi_obce', 'milniky')}, ensure_ascii=False, indent=1))
print('grafu bodů:', len(pts))
