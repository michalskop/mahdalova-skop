# Druhé kolo prezidentských voleb v Brazílii 25. 10. 2026 – všechna čísla do článku.
#
# Vstup: data/ = snímek živého modelu Mahdalová & Škop (API /api/latest.json a /api/series/*.json),
#        stažený během volební noci; model počítá z průběžných souborů TSE (seção = okrsky, zona = zóny).
# Výstup: vystup.json (čísla do textu a key-stats) a
#         apps/web/components/charts/brazil2026RunoffData.ts (data grafů).
# Spuštění z kořene repa:  python apps/web/app/clanek/_articles/volby-brazilie-2026-10-25-druhe-kolo-vyhrava-lula/_data_pipeline/build.py
#
# Pojmy (sloupce řady NAT.json):
#   cs  = sečteno, % registrovaných voličů (okrskový model)
#   rs  = Lulův podíl na hlasech pro dva kandidáty v dosud sečtených okrscích (průběžné sčítání)
#   s, s_lo, s_hi = predikce konečného Lulova podílu a 90% interval (okrskový model)
#   z   = totéž ze zónového (kontrolního) modelu
#   ts  = odhad konečné účasti
import json, os, datetime as dt

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', '..', '..', '..'))
D = lambda f: json.load(open(os.path.join(HERE, 'data', f), encoding='utf-8'))

latest = D('latest.json')
nat = D('NAT.json')
cols = nat['cols']
rows = [dict(zip(cols, r)) for r in nat['rows']]

CET = dt.timezone(dt.timedelta(hours=1))   # od 25. 10. 2026 03:00 platí v Česku SEČ
BRT = dt.timezone(dt.timedelta(hours=-3))
cet = lambda t: dt.datetime.fromtimestamp(t, CET)

# Volební místnosti zavřely v 17:00 brasilijského času = 21:00 SEČ = 20:00 UTC.
# Starší řádky jsou zkušební běhy a zahraniční okrsky před uzavřením místností – do grafu nejdou.
CLOSE = dt.datetime(2026, 10, 25, 20, 0, tzinfo=dt.timezone.utc).timestamp()
night = [r for r in rows if r['t'] >= CLOSE and r['s'] is not None]
# první skutečná aktualizace po uzavření = první řádek, kde přibyly sečtené okrsky
first_new = next(i for i, r in enumerate(night) if i and r['cs'] != night[i - 1]['cs'])
night = night[first_new:]

head = latest['pres']['NAT']['head']
zona = latest['pres']['NAT']['zona']
gen = cet(latest['generated'])

out = {}
out['stav'] = gen.strftime('%H:%M') + ' SEČ'
out['stav_brt'] = dt.datetime.fromtimestamp(latest['generated'], BRT).strftime('%H:%M')
out['secteno_pct_registrovanych'] = round(head['counted'], 2)
out['lula'] = round(head['q'], 2)
out['lula_lo'] = round(head['lo'], 2)
out['lula_hi'] = round(head['hi'], 2)
out['flavio'] = round(100 - head['q'], 2)
out['flavio_lo'] = round(100 - head['hi'], 2)
out['flavio_hi'] = round(100 - head['lo'], 2)
out['p_lula'] = head['p']
out['naskok_hlasu'] = head['lead']
out['prubezne_lula'] = round(head['rep'], 2)
out['ucast'] = round(head['turnout'], 2)
out['ucast_lo'] = round(head['t_lo'], 2)
out['ucast_hi'] = round(head['t_hi'], 2)
out['kontrolni_zona_lula'] = round(zona['q'], 2)
out['kontrolni_zona_lo'] = round(zona['lo'], 2)
out['kontrolni_zona_hi'] = round(zona['hi'], 2)

# Vývoj noci
f = night[0]
out['prvni_odhad'] = {'cas': cet(f['t']).strftime('%H:%M'), 'secteno': f['cs'], 'lula': f['s']}
after1 = [r for r in night if r['cs'] >= 1]
out['od_1pct'] = {
    'cas': cet(after1[0]['t']).strftime('%H:%M'),
    'lula_min': min(r['s'] for r in after1), 'lula_max': max(r['s'] for r in after1),
}
out['predikce_lula_min_cela_noc'] = min(r['s'] for r in night)
# od kdy je celý 90% interval TRVALE nad 50 % (první krátké intervaly ve 21:17 byly po přepočtu zase široké)
last_low = max(i for i, r in enumerate(night) if r['s_lo'] is None or r['s_lo'] <= 50)
sure = night[last_low + 1]
out['interval_nad_50'] = {'cas': cet(sure['t']).strftime('%H:%M'), 'secteno': sure['cs']}
# kdy průběžné sčítání ukazovalo v čele Flávia (Lulův podíl v sečtených < 50 %)
below = [r for r in night if r['rs'] is not None and r['rs'] < 50]
if below:
    back = next((r for r in night if r['t'] > below[-1]['t'] and r['rs'] >= 50), None)
    out['prubezne_flavio_v_cele'] = {
        'od': cet(below[0]['t']).strftime('%H:%M'), 'od_secteno': below[0]['cs'],
        'do': cet(back['t']).strftime('%H:%M') if back else None, 'do_secteno': back['cs'] if back else None,
        'flavio_max': round(100 - min(r['rs'] for r in below), 2),
    }
out['prubezne_lula_max_po_1pct'] = round(max(r['rs'] for r in after1), 2)
out['prubezne_lula_min_po_1pct'] = round(min(r['rs'] for r in after1), 2)

# 1. kolo (oficiální výsledek TSE, 99,99 % sečteno, podle The Rio Times): Flávio 47,03 %, Lula 45,16 %;
# naše predikce 4. 10. ve 23:44 SELČ: Flávio 47,01 %, Lula 45,22 %. Účast 78,92 % z 158 745 502 voličů.
REG = 158_745_502
F1, L1 = 47.03, 45.16
out['kolo1_lula_ze_dvou'] = round(100 * L1 / (L1 + F1), 2)
out['posun_lula_pb'] = round(head['q'] - out['kolo1_lula_ze_dvou'], 2)
out['kolo1_ucast'] = 78.92
out['ucast_rozdil_pb'] = round(head['turnout'] - 78.92, 2)
out['ucast_rozdil_volicu'] = round(REG * (head['turnout'] - 78.92) / 100)
out['naskok_2022'] = 2_139_645  # Lula × J. Bolsonaro, 2. kolo 2022 (TSE)
# odhad platných hlasů = registrovaní × účast platných hlasů (valid_turnout)
valid = REG * head['valid_turnout'] / 100
out['platne_hlasy'] = round(valid)
out['lula_hlasy'] = round(valid * head['q'] / 100)
out['flavio_hlasy'] = round(valid * (100 - head['q']) / 100)

# Státy
NAMES = {
    'AC': 'Acre', 'AL': 'Alagoas', 'AM': 'Amazonas', 'AP': 'Amapá', 'BA': 'Bahia', 'CE': 'Ceará',
    'DF': 'Distrito Federal', 'ES': 'Espírito Santo', 'GO': 'Goiás', 'MA': 'Maranhão', 'MG': 'Minas Gerais',
    'MS': 'Mato Grosso do Sul', 'MT': 'Mato Grosso', 'PA': 'Pará', 'PB': 'Paraíba', 'PE': 'Pernambuco',
    'PI': 'Piauí', 'PR': 'Paraná', 'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte', 'RO': 'Rondônia',
    'RR': 'Roraima', 'RS': 'Rio Grande do Sul', 'SC': 'Santa Catarina', 'SE': 'Sergipe', 'SP': 'São Paulo',
    'TO': 'Tocantins', 'ZZ': 'Voliči v zahraničí',
}
# Vítěz státu v 1. kole (The Rio Times, oficiální výsledky TSE po státech)
K1_FLAVIO = {'AC', 'DF', 'ES', 'GO', 'MT', 'MS', 'MG', 'PR', 'RJ', 'RS', 'RO', 'RR', 'SC', 'SP', 'TO'}
states = []
for k, name in NAMES.items():
    h = latest['pres'][k].get('head') or latest['pres'][k]['sec']
    states.append({
        'k': k, 'n': name, 'l': round(h['q'], 2), 'lo': round(h['lo'], 2), 'hi': round(h['hi'], 2),
        'c': round(h['counted'], 1), 'lead': h['lead'], 'k1': 'F' if k in K1_FLAVIO else ('L' if k != 'ZZ' else None),
    })
st = [s for s in states if s['k'] != 'ZZ']
out['staty_lula'] = sum(s['l'] > 50 for s in st)
out['staty_flavio'] = sum(s['l'] < 50 for s in st)
out['preklopene_k_lulovi'] = [s['n'] for s in st if s['k1'] == 'F' and s['l'] > 50]
out['preklopene_k_flaviovi'] = [s['n'] for s in st if s['k1'] == 'L' and s['l'] < 50]
mg = next(s for s in st if s['k'] == 'MG')
out['MG'] = mg
out['nejvic_hlasu_lula'] = sorted(st, key=lambda s: -s['lead'])[:3]
out['nejvic_hlasu_flavio'] = sorted(st, key=lambda s: s['lead'])[:3]
out['ZZ'] = next(s for s in states if s['k'] == 'ZZ')
out['secteno_staty'] = {s['k']: s['c'] for s in st}
out['flavio_staty'] = {s['k']: round(100 - s['l'], 1) for s in st if s['l'] < 50}

with open(os.path.join(HERE, 'vystup.json'), 'w', encoding='utf-8') as fh:
    json.dump(out, fh, ensure_ascii=False, indent=1)

# Data grafů: [minuty od 21:00 SEČ, predikce Lula, lo, hi, průběžně Lula, sečteno % registrovaných]
t0 = dt.datetime(2026, 10, 25, 21, 0, tzinfo=CET).timestamp()
series, last_key = [], None
for r in night:
    key = (r['cs'], r['s'], r['rs'])
    if key == last_key:
        continue
    last_key = key
    series.append([round((r['t'] - t0) / 60, 2), round(r['s'], 3), round(r['s_lo'], 3) if r['s_lo'] else None,
                   round(r['s_hi'], 3) if r['s_hi'] else None, round(r['rs'], 3), round(r['cs'], 2)])

ts = os.path.join(ROOT, 'apps', 'web', 'components', 'charts', 'brazil2026RunoffData.ts')
with open(ts, 'w', encoding='utf-8') as fh:
    fh.write('// Brazílie 2026, 2. kolo prezidentských voleb (25.–26. 10. 2026). GENEROVÁNO – neupravovat ručně.\n')
    fh.write('// Zdroj: živý model Mahdalová & Škop nad průběžnými daty TSE; skript _data_pipeline/build.py u článku\n')
    fh.write('// volby-brazilie-2026-10-25-druhe-kolo-vyhrava-lula, stav ' + out['stav'] + '.\n')
    fh.write('// [minuty od 21:00 SEČ, predikce Lula %, interval od, interval do, průběžně sečteno Lula %, sečteno % voličů]\n')
    fh.write('export const RUNOFF: (number | null)[][] = ' + json.dumps(series) + ';\n')
    fh.write('// Státy: Lulův odhadovaný podíl na hlasech pro dva kandidáty, interval, sečteno % voličů, vítěz 1. kola\n')
    fh.write('export const STATES: { k: string; n: string; l: number; lo: number; hi: number; c: number; lead: number; k1: string | null }[] = '
             + json.dumps(states, ensure_ascii=False) + ';\n')
    fh.write('export const STAV = ' + json.dumps(out['stav']) + ';\n')

print(json.dumps(out, ensure_ascii=False, indent=1))
print('body grafu:', len(series))
