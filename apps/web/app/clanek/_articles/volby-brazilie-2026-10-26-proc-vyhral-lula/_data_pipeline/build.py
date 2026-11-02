# Proč vyhrál Lula – všechna čísla do článku a data mapy.
#
# Vstup: obce_tse_2026.csv (extrahuj_obce.py z oficiálních výsledků TSE po obcích, obě kola).
# Výstup: vystup.json (čísla do textu a grafů) a ../brazil-obce-data.json (data mapy, klíč = kód IBGE).
# Geometrie mapy ../brazil-obce-geo.json vzniká zvlášť (viz README.md).
# Spuštění:  python build.py
import csv, json, os
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
rows = list(csv.DictReader(open(os.path.join(HERE, 'obce_tse_2026.csv'), encoding='utf-8')))
for r in rows:
    for k, v in r.items():
        if k not in ('uf', 'tse', 'ibge', 'nazev'):
            r[k] = int(v)

REG = {
    'Sever': 'AC AM AP PA RO RR TO', 'Severovýchod': 'AL BA CE MA PB PE PI RN SE',
    'Středozápad': 'DF GO MS MT', 'Jihovýchod': 'ES MG RJ SP', 'Jih': 'PR RS SC', 'Zahraničí': 'ZZ',
}
REG_OF = {uf: reg for reg, ufs in REG.items() for uf in ufs.split()}

def agg(rs):
    s = defaultdict(int)
    for r in rs:
        for k, v in r.items():
            if isinstance(v, int):
                s[k] += v
    return s

def summary(s):
    two1 = s['r1_lula'] + s['r1_flavio']
    two2 = s['r2_lula'] + s['r2_flavio']
    return {
        'volici': s['r2_volici'],
        'lula_r1_ze_dvou': round(100 * s['r1_lula'] / two1, 2),
        'lula_r2': round(100 * s['r2_lula'] / two2, 2),
        'posun_pb': round(100 * s['r2_lula'] / two2 - 100 * s['r1_lula'] / two1, 2),
        'naskok_r1': s['r1_lula'] - s['r1_flavio'],
        'naskok_r2': s['r2_lula'] - s['r2_flavio'],
        'ucast_r1': round(100 * s['r1_prislo'] / s['r1_volici'], 2),
        'ucast_r2': round(100 * s['r2_prislo'] / s['r2_volici'], 2),
        'ucast_zmena_pb': round(100 * s['r2_prislo'] / s['r2_volici'] - 100 * s['r1_prislo'] / s['r1_volici'], 2),
        'lula_pribylo': s['r2_lula'] - s['r1_lula'],
        'flavio_pribylo': s['r2_flavio'] - s['r1_flavio'],
    }

out = {}
T = agg(rows)
out['celkem'] = summary(T)
out['celkem'].update({
    'lula_r1_hlasy': T['r1_lula'], 'flavio_r1_hlasy': T['r1_flavio'], 'lula_r2_hlasy': T['r2_lula'], 'flavio_r2_hlasy': T['r2_flavio'],
    'lula_r1_pct': round(100 * T['r1_lula'] / T['r1_platne'], 2), 'flavio_r1_pct': round(100 * T['r1_flavio'] / T['r1_platne'], 2),
    'lula_r2_pct': round(100 * T['r2_lula'] / T['r2_platne'], 2), 'flavio_r2_pct': round(100 * T['r2_flavio'] / T['r2_platne'], 2),
    'prislo_r1': T['r1_prislo'], 'prislo_r2': T['r2_prislo'], 'prislo_navic': T['r2_prislo'] - T['r1_prislo'],
    'prazdne_neplatne_r1': T['r1_prazdne'] + T['r1_neplatne'], 'prazdne_neplatne_r2': T['r2_prazdne'] + T['r2_neplatne'],
    'prazdne_neplatne_r1_pct': round(100 * (T['r1_prazdne'] + T['r1_neplatne']) / T['r1_prislo'], 2),
    'prazdne_neplatne_r2_pct': round(100 * (T['r2_prazdne'] + T['r2_neplatne']) / T['r2_prislo'], 2),
    'platne_navic': T['r2_platne'] - T['r1_platne'],
    'ostatni_kandidati_r1': T['r1_cury'] + T['r1_renan'] + T['r1_caiado'] + T['r1_zema'] + T['r1_ostatni'],
    'r1_cury': T['r1_cury'], 'r1_renan': T['r1_renan'], 'r1_caiado': T['r1_caiado'], 'r1_zema': T['r1_zema'],
})

# Regiony
out['regiony'] = {reg: summary(agg([r for r in rows if REG_OF[r['uf']] == reg])) for reg in REG}

# Státy
out['staty'] = {}
for uf in sorted({r['uf'] for r in rows}):
    out['staty'][uf] = summary(agg([r for r in rows if r['uf'] == uf]))

dom = [r for r in rows if r['uf'] != 'ZZ']
def lula2(r): return 100 * r['r2_lula'] / max(1, r['r2_lula'] + r['r2_flavio'])
def lula1(r): return 100 * r['r1_lula'] / max(1, r['r1_lula'] + r['r1_flavio'])
out['obce'] = {
    'pocet': len(dom),
    'lula_vyhral_r2': sum(lula2(r) > 50 for r in dom),
    'flavio_vyhral_r2': sum(lula2(r) < 50 for r in dom),
    'lula_vedl_r1_ze_dvou': sum(lula1(r) > 50 for r in dom),
    'lula_posilil': sum(lula2(r) > lula1(r) for r in dom),
    'lula_oslabil': sum(lula2(r) < lula1(r) for r in dom),
    'preklopene_k_lulovi': sum(lula1(r) < 50 < lula2(r) for r in dom),
    'preklopene_k_flaviovi': sum(lula2(r) < 50 < lula1(r) for r in dom),
    'ucast_vzrostla': sum(r['r2_prislo'] / r['r2_volici'] > r['r1_prislo'] / r['r1_volici'] for r in dom),
}

# Velikost obce podle počtu voličů
SIZES = [(0, 10_000, 'do 10 tisíc voličů'), (10_000, 50_000, '10–50 tisíc'), (50_000, 200_000, '50–200 tisíc'),
         (200_000, 1_000_000, '200 tisíc – 1 milion'), (1_000_000, 10**9, 'nad 1 milion')]
out['velikost'] = []
for lo, hi, lab in SIZES:
    rs = [r for r in dom if lo <= r['r2_volici'] < hi]
    s = summary(agg(rs)); s.update({'skupina': lab, 'obci': len(rs)})
    out['velikost'].append(s)

# Největší města
big = sorted(dom, key=lambda r: -r['r2_volici'])[:12]
out['mesta'] = [{'nazev': r['nazev'], 'uf': r['uf'], 'volici': r['r2_volici'], 'lula_r2': round(lula2(r), 2),
                 'lula_r1_ze_dvou': round(lula1(r), 2), 'posun': round(lula2(r) - lula1(r), 2),
                 'naskok_r2': r['r2_lula'] - r['r2_flavio']} for r in big]

with open(os.path.join(HERE, 'vystup.json'), 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=1)

# Data mapy: [uf, název, voliči 2. kolo, Lula % 2. kolo, Lula % 1. kolo ze dvou, účast 1. kolo, účast 2. kolo, hlasy Lula, hlasy Flávio]
def title(n):
    small = {'de', 'da', 'do', 'das', 'dos', 'e', "d'"}
    return ' '.join(w if w in small else w.capitalize() for w in n.lower().split())
mapa = {}
for r in dom:
    mapa[r['ibge']] = [r['uf'], title(r['nazev']), r['r2_volici'], round(lula2(r), 2), round(lula1(r), 2),
                       round(100 * r['r1_prislo'] / r['r1_volici'], 1), round(100 * r['r2_prislo'] / r['r2_volici'], 1),
                       r['r2_lula'], r['r2_flavio']]
with open(os.path.join(HERE, '..', 'brazil-obce-data.json'), 'w', encoding='utf-8') as f:
    json.dump(mapa, f, ensure_ascii=False, separators=(',', ':'))

# Data grafů do komponenty BrazilProcChart (apps/web/components/charts/brazil2026ProcData.ts)
C = out['celkem']
REGS = ['Severovýchod', 'Sever', 'Jihovýchod', 'Středozápad', 'Jih']
ts = os.path.join(HERE, '..', '..', '..', '..', '..', 'components', 'charts', 'brazil2026ProcData.ts')
with open(ts, 'w', encoding='utf-8') as f:
    NL = chr(10)
    f.write('// Brazílie 2026, mezi 1. a 2. kolem. GENEROVÁNO skriptem _data_pipeline/build.py u článku' + NL)
    f.write('// volby-brazilie-2026-10-26-proc-vyhral-lula z oficiálních výsledků TSE po obcích – neupravovat ručně.' + NL)
    f.write('export const GAINS = ' + json.dumps({'lula_r1': C['lula_r1_hlasy'], 'lula_r2': C['lula_r2_hlasy'], 'flavio_r1': C['flavio_r1_hlasy'], 'flavio_r2': C['flavio_r2_hlasy'],
        'ostatni_r1': C['ostatni_kandidati_r1'], 'prazdne_ubylo': C['prazdne_neplatne_r1'] - C['prazdne_neplatne_r2'], 'prislo_navic': C['prislo_navic']}) + ';' + NL)
    f.write('export const REGIONS = ' + json.dumps([{'n': r, 'r1': out['regiony'][r]['naskok_r1'], 'r2': out['regiony'][r]['naskok_r2'],
        'l1': out['regiony'][r]['lula_r1_ze_dvou'], 'l2': out['regiony'][r]['lula_r2'], 'u': out['regiony'][r]['ucast_zmena_pb']} for r in REGS], ensure_ascii=False) + ';' + NL)
    f.write('export const SIZES = ' + json.dumps([{'n': s['skupina'], 'obci': s['obci'], 'l1': s['lula_r1_ze_dvou'], 'l2': s['lula_r2'], 'p': s['posun_pb']} for s in out['velikost']], ensure_ascii=False) + ';' + NL)

print(json.dumps({k: out[k] for k in ('celkem', 'obce')}, ensure_ascii=False, indent=1))
