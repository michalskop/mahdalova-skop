# Účast ve 2. kole po okrscích: kdo přišel a kdo ne (senátní volby 2026, srovnání 2024).
# Vstupy (zdroj/, ve gitu nejsou):
#   2026: https://volby.gov.cz/opendata/se2026/SE2026data20261017_csv.zip -> zdroj/se2026data/csv/set5.csv (okrsky, obě kola)
#         zdroj/d26/<obvod>.json (kandidáti: číslo, navrhující strana) – stahuje senat_hist.py
#   2024: zdroj/dl/SENATdata20250118_csv/csv/set5.csv + registr SENATreg (senat_hist.py)
# Retence = (vydané obálky ve 2. kole / voliči) / (vydané obálky v 1. kole / voliči) v okrsku.
# „Vládní podíl“ = podíl hlasů kandidátů navržených stranami vlády v den voleb na platných hlasech v 1. kole v okrsku.
import csv, json, os, sys, collections, statistics
sys.stdout.reconfigure(encoding='utf-8')
H = os.path.dirname(os.path.abspath(__file__)); Z = os.path.join(H, 'zdroj')
def rows(p): return list(csv.DictReader(open(p, encoding='cp1250'), delimiter=';'))

def analyza(okr, kand, vlada, oznaceni):
    """okr: řádky set5 jednoho roku (dict); kand[(obvod, cislo)] = (navrhující strana, jméno)."""
    by = collections.defaultdict(dict)
    for r in okr:
        by[(r['OBVOD'], r['OBEC'], r['OKRSEK'])][r['KOLO']] = r
    data = []
    for (ob, obec, okrsek), k in by.items():
        if '1' not in k or '2' not in k: continue
        r1, r2 = k['1'], k['2']
        v1, v2 = int(r1['VOL_SEZNAM']), int(r2['VOL_SEZNAM'])
        o1, o2 = int(r1['VYD_OBALKY']), int(r2['VYD_OBALKY'])
        pl1 = int(r1['PL_HL_CELK'])
        if v1 < 50 or o1 == 0 or pl1 == 0: continue
        gov = sum(int(r1.get(f'HLASY_{i:02d}') or 0) for i in range(1, 23) if kand.get((int(ob), i), ('', ''))[0] in vlada)
        data.append(dict(ob=int(ob), v1=v1, o1=o1, v2=v2, o2=o2, gov=gov / pl1))
    # celkově
    print(f'\n===== {oznaceni} =====')
    V1 = sum(d['v1'] for d in data); O1 = sum(d['o1'] for d in data); V2 = sum(d['v2'] for d in data); O2 = sum(d['o2'] for d in data)
    print(f'okrsků s oběma koly: {len(data)} | účast 1. kolo {100*O1/V1:.2f} % | 2. kolo {100*O2/V2:.2f} % | retence {100*(O2/V2)/(O1/V1):.1f} %')
    # pětiny okrsků podle vládního podílu v 1. kole (vážené voliči)
    data.sort(key=lambda d: d['gov'])
    tot = sum(d['v1'] for d in data); q = []; acc = 0; cur = []
    for d in data:
        cur.append(d); acc += d['v1']
        if acc >= tot * (len(q) + 1) / 5 and len(q) < 4: q.append(cur); cur = []
    q.append(cur)
    print('pětiny okrsků podle podílu vládních kandidátů v 1. kole (stejně voličů v každé):')
    for i, g in enumerate(q):
        v1 = sum(d['v1'] for d in g); o1 = sum(d['o1'] for d in g); v2 = sum(d['v2'] for d in g); o2 = sum(d['o2'] for d in g)
        gv = sum(d['gov'] * d['v1'] for d in g) / v1
        print(f'  {i+1}. pětina: vládní podíl {100*gv:5.1f} % | účast 1. k. {100*o1/v1:5.1f} % | 2. k. {100*o2/v2:5.1f} % | retence {100*(o2/v2)/(o1/v1):5.1f} %')
    # vážená korelace vládní podíl × retence
    w = [d['v1'] for d in data]; x = [d['gov'] for d in data]; y = [(d['o2'] / d['v2']) / (d['o1'] / d['v1']) for d in data]
    W = sum(w); mx = sum(a * b for a, b in zip(w, x)) / W; my = sum(a * b for a, b in zip(w, y)) / W
    cov = sum(a * (b - mx) * (c - my) for a, b, c in zip(w, x, y)) / W
    sx = (sum(a * (b - mx) ** 2 for a, b in zip(w, x)) / W) ** .5; sy = (sum(a * (c - my) ** 2 for a, c in zip(w, y)) / W) ** .5
    print(f'vážená korelace vládní podíl × retence: r = {cov/(sx*sy):+.2f}; sklon: +10 p. b. vládního podílu = {100*cov/sx**2*0.1:+.1f} p. b. retence')
    # po obvodech
    print('po obvodech: obvod | účast 1. k. | 2. k. | retence | vládní podíl 1. k.')
    for ob in sorted({d['ob'] for d in data}):
        g = [d for d in data if d['ob'] == ob]
        v1 = sum(d['v1'] for d in g); o1 = sum(d['o1'] for d in g); v2 = sum(d['v2'] for d in g); o2 = sum(d['o2'] for d in g)
        gv = sum(d['gov'] * d['v1'] for d in g) / v1
        print(f'  {ob:2d} | {100*o1/v1:5.1f} % | {100*o2/v2:5.1f} % | {100*(o2/v2)/(o1/v1):5.1f} % | {100*gv:5.1f} %')
    return data

# 2026
kand26 = {}
for o in range(3, 82, 3):
    d = json.load(open(os.path.join(Z, 'd26', f'{o}.json'), encoding='utf-8'))
    for r in d['vysledky']: kand26[(o, r[0])] = (r[3], r[1])
analyza(rows(os.path.join(Z, 'se2026data', 'csv', 'set5.csv')), kand26, {'ANO', 'SPD', 'Motoristé', 'AUTO'}, '2026 (vláda ANO + SPD + Motoristé)')
# 2024
cvs = {r['VSTRANA']: r['ZKRATKAV8'] for r in rows(os.path.join(Z, 'dl', 'SENATciselniky20250118_csv', 'csv', 'cvs.csv'))}
kand24 = {(int(r['OBVOD']), int(r['CKAND'])): (cvs.get(r['NSTRANA'], r['NSTRANA']), r['PRIJMENI']) for r in rows(os.path.join(Z, 'dl', 'SENATreg20250118_csv', 'csv', 'serk.csv')) if r['DATUMVOLEB'] == '20240920'}
okr24 = [r for r in rows(os.path.join(Z, 'dl', 'SENATdata20250118_csv', 'csv', 'set5.csv')) if r['DATUMVOLEB'] == '20240920']
analyza(okr24, kand24, {'ODS', 'STAN', 'KDU-ČSL', 'TOP 09', 'Piráti'}, '2024 (vláda ODS + STAN + KDU-ČSL + TOP 09 + Piráti)')
# 2024 se stejnou optikou jako 2026: podíl ANO+SPD (tehdy opozice)
analyza(okr24, kand24, {'ANO', 'SPD'}, '2024 – optika ANO + SPD (tehdy opozice)')

# --- Finalisté 2026: kolik hlasů měli v 1. a ve 2. kole (ČSÚ, výsledky po obvodech) ---
print('\n===== 2026: hlasy finalistů 1. kolo -> 2. kolo =====')
sum_ano = [0, 0]; sum_opo = [0, 0]
for o in range(3, 82, 3):
    d = json.load(open(os.path.join(Z, 'd26', f'{o}.json'), encoding='utf-8'))
    post = d['postupuje'] or []
    if not post: continue
    f = [r for r in d['vysledky'] if r[0] in post]
    txt = []
    for r in f:
        txt.append(f"{r[1].split()[0]} ({r[3]}) {r[5]} -> {r[7]} ({100*r[7]/r[5]:.0f} %)")
        if r[3] == 'ANO': sum_ano[0] += r[5]; sum_ano[1] += r[7]
        elif any(x[3] == 'ANO' for x in f): sum_opo[0] += r[5]; sum_opo[1] += r[7]
    print(f'{o:2d} ' + ' | '.join(txt))
print(f'\nKandidáti ANO ve 2. kole (13): 1. kolo {sum_ano[0]} hlasů -> 2. kolo {sum_ano[1]} ({100*sum_ano[1]/sum_ano[0]:.0f} %)')
print(f'Jejich soupeři (13):           1. kolo {sum_opo[0]} hlasů -> 2. kolo {sum_opo[1]} ({100*sum_opo[1]/sum_opo[0]:.0f} %)')

# --- Stejné srovnání pro dřívější roky z registru ČSÚ (HLASY_K1, HLASY_K2) ---
print('\n===== Finalisté ANO × jejich soupeři: hlasy 2. kolo / 1. kolo =====')
reg = rows(os.path.join(Z, 'dl', 'SENATreg20250118_csv', 'csv', 'serk.csv'))
for dat in ['20141010', '20161007', '20181005', '20201002', '20220923', '20240920']:
    fin = collections.defaultdict(list)
    for r in reg:
        if r['DATUMVOLEB'] == dat and r['PLATNOST'] == 'A' and int(r['HLASY_K2'] or 0) > 0:
            fin[r['OBVOD']].append(r)
    a = [0, 0, 0, 0]; o = [0, 0, 0, 0]
    for ob, f in fin.items():
        if len(f) != 2 or not any(cvs.get(x['NSTRANA']) == 'ANO' for x in f): continue
        for x in f:
            t = a if cvs.get(x['NSTRANA']) == 'ANO' else o
            t[0] += int(x['HLASY_K1']); t[1] += int(x['HLASY_K2']); t[2] += 1; t[3] += x['ZVOLEN_K2'] == '1'
    if a[2]: print(f"{dat[:4]}: ANO {a[2]} finalistů {100*a[1]/a[0]:.0f} % (vyhráli {a[3]}) | soupeři {100*o[1]/o[0]:.0f} % (vyhráli {o[3]})")
print(f"2026: ANO 13 finalistů {100*sum_ano[1]/sum_ano[0]:.0f} % (vyhráli 0) | soupeři {100*sum_opo[1]/sum_opo[0]:.0f} % (vyhráli 13)")

# --- Test titulku: v 13 obvodech s kandidátem ANO ve 2. kole – přišlo méně lidí tam, kde měl kandidát ANO v 1. kole víc? ---
print('\n===== 13 obvodů s ANO ve 2. kole: okrsky podle podílu finalisty ANO v 1. kole =====')
okr26 = rows(os.path.join(Z, 'se2026data', 'csv', 'set5.csv'))
ano_fin = {}
for o in range(3, 82, 3):
    d = json.load(open(os.path.join(Z, 'd26', f'{o}.json'), encoding='utf-8'))
    post = d['postupuje'] or []
    f = [r for r in d['vysledky'] if r[0] in post]
    a = [r for r in f if r[3] == 'ANO']
    if a: ano_fin[o] = (a[0][0], [r[0] for r in f if r[3] != 'ANO'][0])
by = collections.defaultdict(dict)
for r in okr26:
    if int(r['OBVOD']) in ano_fin: by[(r['OBVOD'], r['OBEC'], r['OKRSEK'])][r['KOLO']] = r
D = []
for (ob, _, _), k in by.items():
    if '1' not in k or '2' not in k: continue
    r1, r2 = k['1'], k['2']; v1, v2, o1, o2, p1 = int(r1['VOL_SEZNAM']), int(r2['VOL_SEZNAM']), int(r1['VYD_OBALKY']), int(r2['VYD_OBALKY']), int(r1['PL_HL_CELK'])
    if v1 < 50 or o1 == 0 or p1 == 0: continue
    na, no = ano_fin[int(ob)]
    a1 = int(r1[f'HLASY_{na:02d}']); a2 = int(r2[f'HLASY_{na:02d}']); b1 = int(r1[f'HLASY_{no:02d}']); b2 = int(r2[f'HLASY_{no:02d}'])
    D.append(dict(v1=v1, o1=o1, v2=v2, o2=o2, ano=a1 / p1, a1=a1, a2=a2, b1=b1, b2=b2))
D.sort(key=lambda d: d['ano']); tot = sum(d['v1'] for d in D); q = []; cur = []; acc = 0
for d in D:
    cur.append(d); acc += d['v1']
    if acc >= tot * (len(q) + 1) / 5 and len(q) < 4: q.append(cur); cur = []
q.append(cur)
for i, g in enumerate(q):
    v1 = sum(d['v1'] for d in g); o1 = sum(d['o1'] for d in g); v2 = sum(d['v2'] for d in g); o2 = sum(d['o2'] for d in g)
    an = sum(d['a1'] for d in g); a2 = sum(d['a2'] for d in g); b1 = sum(d['b1'] for d in g); b2 = sum(d['b2'] for d in g)
    print(f"  {i+1}. pětina: kandidát ANO v 1. k. {100*sum(d['ano']*d['v1'] for d in g)/v1:4.1f} % | účast {100*o1/v1:4.1f} -> {100*o2/v2:4.1f} % | retence {100*(o2/v2)/(o1/v1):4.1f} % | ANO hlasy 2./1. kolo {100*a2/an:3.0f} % | soupeř {100*b2/b1:3.0f} %")
w = [d['v1'] for d in D]; x = [d['ano'] for d in D]; y = [(d['o2'] / d['v2']) / (d['o1'] / d['v1']) for d in D]
W = sum(w); mx = sum(a * b for a, b in zip(w, x)) / W; my = sum(a * b for a, b in zip(w, y)) / W
cov = sum(a * (b - mx) * (c - my) for a, b, c in zip(w, x, y)) / W; sx = (sum(a * (b - mx) ** 2 for a, b in zip(w, x)) / W) ** .5; sy = (sum(a * (c - my) ** 2 for a, c in zip(w, y)) / W) ** .5
print(f'okrsků: {len(D)} | vážená korelace podíl kandidáta ANO × retence: r = {cov/(sx*sy):+.2f}')
