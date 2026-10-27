# Povolební analytika Senátu 1996–2026 z primárních dat ČSÚ (článek volby-cr-2026-10-17-senat-2026-co-ukazaly-volby).
# Vstupy (stáhnou se samy do zdroj/, ve gitu nejsou – 30 MB):
#   - registr kandidátů, číselníky a okrsková data 1996–1/2025: https://www.volby.cz/opendata/senat_vse/senat_vse_opendata.htm
#     (SENATreg20250118_csv.zip, SENATciselniky20250118_csv.zip, SENATdata20250118_csv.zip)
#   - výsledky 2026 po obvodech: https://volby.gov.cz/appdata/senat/20261009/vysled/obvod/<n>.json (staženo 17. 10. 2026 po 17:10)
#   - dosavadní senátoři k 1. 10. 2026 podle senat.cz: ../../volby-cr-2026-10-17-senat-druhe-kolo-predikce/_data_pipeline/senat-data.json
# Pohlaví ČSÚ neuvádí – odvozujeme z křestního jména a příjmení, sporné případy vypisujeme (kontrola: Fórum 50 %, IPU Parline).
# Výstup: vystup.txt (python senat_hist.py > vystup.txt), senat_slozeni.json
import csv, json, sys, os, collections, statistics, urllib.request, zipfile, io
sys.stdout.reconfigure(encoding='utf-8')
H = os.path.dirname(os.path.abspath(__file__))
ART = os.path.normpath(os.path.join(H, '..', '..', 'volby-cr-2026-10-17-senat-druhe-kolo-predikce'))  # sesterský článek o 2. kole (normpath kvůli limitu délky cesty ve Windows)
Z = os.path.join(H, 'zdroj')
UA = {'User-Agent': 'Mozilla/5.0 DataTimes senat_hist'}
def stahni(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA)).read()
for balik in ('SENATreg20250118_csv', 'SENATciselniky20250118_csv', 'SENATdata20250118_csv'):
    if not os.path.isdir(os.path.join(Z, 'dl', balik)):
        zipfile.ZipFile(io.BytesIO(stahni(f'https://www.volby.cz/opendata/senat_vse/{balik}.zip'))).extractall(os.path.join(Z, 'dl', balik))
os.makedirs(os.path.join(Z, 'd26'), exist_ok=True)
for o in range(3, 82, 3):
    f = os.path.join(Z, 'd26', f'{o}.json')
    if not os.path.exists(f):
        open(f, 'wb').write(stahni(f'https://volby.gov.cz/appdata/senat/20261009/vysled/obvod/{o}.json'))

def rcsv(p):
    with open(os.path.join(Z, p), encoding='cp1250') as f:
        return list(csv.DictReader(f, delimiter=';'))

cvs = {r['VSTRANA']: r['ZKRATKAV8'] for r in rcsv('dl/SENATciselniky20250118_csv/csv/cvs.csv')}
reg = rcsv('dl/SENATreg20250118_csv/csv/serk.csv')
datumy = {r['DATUMVOLEB']: r['TYPVOLEB'] for r in rcsv('dl/SENATciselniky20250118_csv/csv/sedatumvoleb.csv')}

# --- pohlaví z jména ---
MUZ_A = {'Jiří', 'Kuba', 'Saša', 'Nikita', 'Ilja', 'Jožka', 'Honza', 'Mykola', 'Nicola', 'Luca', 'Andrea', 'Ota', 'Sáša', 'Bohuša', 'Jona', 'Nikola'}  # Andrea, Nikola řešíme příjmením
ZENA_K = {'Dagmar', 'Ingrid', 'Miriam', 'Ester', 'Ruth', 'Carmen', 'Iveta', 'Ivet', 'Karin', 'Marion', 'Lilian', 'Mirjam', 'Gabriel', 'Doris', 'Nikol', 'Rút', 'Edit', 'Judit', 'Ludmila', 'Elen', 'Mariel'}
def pohlavi(jmeno, prijmeni):
    j = jmeno.split()[0] if jmeno else ''
    p = prijmeni.split()[-1].split('-')[-1] if prijmeni else ''
    pz = p.endswith('á') or p.endswith('ová')
    if j in ZENA_K: jz = True
    elif j in MUZ_A and j != 'Andrea': jz = False
    elif j in ('Andrea', 'Nikola'): jz = pz
    else: jz = j.endswith(('a', 'e', 'ie', 'y')) and j not in MUZ_A
    return 'Ž' if (jz or pz) else 'M', (jz != pz)

sporne = set()
def g(jm, pr):
    s, spor = pohlavi(jm, pr)
    if spor: sporne.add(f'{jm} {pr} -> {s}')
    return s

# --- kandidáti 1996–2025 ---
K = []
for r in reg:
    if r['PLATNOST'] != 'A': continue
    K.append(dict(datum=r['DATUMVOLEB'], rok=int(r['DATUMVOLEB'][:4]), typ=datumy[r['DATUMVOLEB']], obvod=int(r['OBVOD']),
                  jmeno=f"{r['JMENO']} {r['PRIJMENI']}", g=g(r['JMENO'], r['PRIJMENI']), vek=int(r['VEK'] or 0),
                  ns=cvs.get(r['NSTRANA'], r['NSTRANA']), ps=cvs.get(r['PSTRANA'], r['PSTRANA']), vs=cvs.get(r['VSTRANA'], r['VSTRANA']),
                  p1=float(r['PROC_K1'] or 0), p2=float(r['PROC_K2'] or 0), h2=int(r['HLASY_K2'] or 0),
                  z1=r['ZVOLEN_K1'], z2=r['ZVOLEN_K2'], postup=r['ZVOLEN_K1'] == '2' or float(r['PROC_K2'] or 0) > 0,
                  zvolen=r['ZVOLEN_K1'] == '1' or r['ZVOLEN_K2'] == '1'))
# --- 2026 ---
def norm(n):
    t = [x for x in n.split() if '.' not in x and x not in ('MBA', 'MHA', 'DiS', 'et', 'LL.M.', 'MPA')]
    return t[1:] , t[0]  # (jména, příjmení) – ČSÚ: "Příjmení Jméno tituly"; dvojitá příjmení řešíme níže
for o in range(3, 82, 3):
    d = json.load(open(os.path.join(Z, 'd26', f'{o}.json'), encoding='utf-8'))
    z = d['zvoleny']; post = d['postupuje'] or []
    if z is None and post:  # ČSÚ k 17. 10. 17:10 neoznačil zvoleného v obvodu 24, přestože je sečteno 100 % – bereme vítěze podle hlasů
        z = max((r for r in d['vysledky'] if r[0] in post), key=lambda r: r[7])[0]; print('   obvod', o, 'zvoleny=None, vítěz podle hlasů:', z)
    for r in d['vysledky']:
        t = [x for x in r[1].split() if '.' not in x and x not in ('MBA', 'MHA', 'DiS', 'et', 'MPA')]
        # křestní jméno = poslední token, který je v seznamu běžných jmen? ČSÚ dává "Příjmení [Příjmení2] Jméno"
        jm, pr = t[-1], ' '.join(t[:-1])
        if any(x.endswith('á') for x in t[:-1]) and not jm.endswith(('a','e')): jm, pr = t[-1], ' '.join(t[:-1])
        K.append(dict(datum='20261009', rok=2026, typ='0', obvod=o, jmeno=f'{jm} {pr}', g=g(jm, pr), vek=0,
                      ns=r[3], ps=r[4], vs=r[2], p1=r[6], p2=r[8], h2=r[7], z1='1' if r[0] == z and not post else ('2' if r[0] in post else '0'),
                      z2='1' if (post and r[0] == z) else '0', postup=r[0] in post, zvolen=r[0] == z))

REG = sorted({k['rok'] for k in K if k['typ'] == '0'})
VLADA = {1996: {'ODS', 'KDU-ČSL', 'ODA'}, 1998: {'SOCDEM'}, 2000: {'SOCDEM'}, 2002: {'SOCDEM', 'KDU-ČSL', 'US-DEU', 'US'},
         2004: {'SOCDEM', 'KDU-ČSL', 'US-DEU'}, 2006: {'ODS'}, 2008: {'ODS', 'KDU-ČSL', 'SZ'}, 2010: {'ODS', 'TOP 09', 'VV'},
         2012: {'ODS', 'TOP 09', 'LIDEM'}, 2014: {'SOCDEM', 'ANO', 'KDU-ČSL'}, 2016: {'SOCDEM', 'ANO', 'KDU-ČSL'},
         2018: {'ANO', 'SOCDEM'}, 2020: {'ANO', 'SOCDEM'}, 2022: {'ODS', 'STAN', 'Piráti', 'KDU-ČSL', 'TOP 09'},
         2024: {'ODS', 'STAN', 'Piráti', 'KDU-ČSL', 'TOP 09'}, 2026: {'ANO', 'SPD', 'Motoristé'}}

print('Strany v registru (zkratky NSTRANA vítězů):', sorted({k['ns'] for k in K if k['zvolen']}))
print('\n=== 1) ŘÁDNÉ VOLBY: kandidáti, ženy, vítězové, vládní strany ===')
print('rok  kand  žen%  zvol  žen_zvol  1.kolo  vláda_kand vláda_2k vláda_zvol  průměr_věk_zvol')
for y in REG:
    ks = [k for k in K if k['rok'] == y and k['typ'] == '0']
    zv = [k for k in ks if k['zvolen']]
    vl = VLADA[y]
    vk = [k for k in ks if k['ns'] in vl]
    print(f"{y} {len(ks):5d} {100*sum(k['g']=='Ž' for k in ks)/len(ks):5.1f} {len(zv):5d} {sum(k['g']=='Ž' for k in zv):6d} {sum(k['z1']=='1' for k in ks):7d}"
          f"  {len(vk):8d} {sum(k['postup'] or k['z1']=='1' for k in vk):8d} {sum(k['zvolen'] for k in vk):8d}   "
          + (f"{statistics.mean(k['vek'] for k in zv):.1f}" if y < 2026 else '–'))

print('\n=== 2) VÍTĚZOVÉ podle navrhující strany ===')
for y in REG:
    c = collections.Counter(k['ns'] for k in K if k['rok'] == y and k['typ'] == '0' and k['zvolen'])
    print(y, dict(c.most_common()))

# --- složení celého Senátu po každých řádných volbách (poslední vítěz v obvodu k datu, včetně doplňovacích) ---
print('\n=== 3) CELÝ SENÁT po volbách (podle strany, která senátora navrhla; ženy) ===')
win = sorted([k for k in K if k['zvolen']], key=lambda k: k['datum'])
senat_po = {}
for y in REG:
    dat = max(k['datum'] for k in K if k['rok'] == y and k['typ'] == '0')
    seat = {}
    for k in win:
        if k['datum'] <= dat: seat[k['obvod']] = k
    if y == 2026:
        # trvající mandáty podle senat.cz k 1. 10. 2026 (zachytí i doplňovací volby po 1/2025)
        sd = json.load(open(os.path.join(ART, '_data_pipeline', 'senat-data.json'), encoding='utf-8'))
        for s in sd['senatori']:
            if not s['konci2026']:
                jm = s['jmeno'].split()
                if seat.get(s['obvod']) is None or seat[s['obvod']]['jmeno'].split()[-1] != jm[-1]:
                    print('   POZOR obvod', s['obvod'], 'senat.cz:', s['jmeno'], '| registr:', seat.get(s['obvod'], {}).get('jmeno'))
                    seat[s['obvod']] = dict(jmeno=s['jmeno'], g=g(jm[0], ' '.join(jm[1:])), ns=s['prislusnost_senat_cz'], rok=0)
    assert len(seat) == 81, (y, len(seat))
    senat_po[y] = seat
    c = collections.Counter(s['ns'] for s in seat.values())
    zen = sum(s['g'] == 'Ž' for s in seat.values())
    print(f"{y}: žen {zen}/81 ({100*zen/81:.1f} %) | vládní strany {sum(s['ns'] in VLADA[y] for s in seat.values())} | " + ', '.join(f'{a} {b}' for a, b in c.most_common()))

print('\n=== 4) OBHAJOBY (senátor obvodu před volbami kandidoval ve stejném obvodu) ===')
for i, y in enumerate(REG[1:], 1):
    prev = senat_po[REG[i - 1]]
    ks = [k for k in K if k['rok'] == y and k['typ'] == '0']
    obv = {k['obvod'] for k in ks}
    obh = [k for k in ks if k['obvod'] in obv and prev[k['obvod']]['jmeno'].split()[-1] == k['jmeno'].split()[-1] and prev[k['obvod']]['jmeno'].split()[0] == k['jmeno'].split()[0]]
    print(f"{y}: obvodů {len(obv)}, obhajovalo {len(obh)}, uspělo {sum(k['zvolen'] for k in obh)} ({100*sum(k['zvolen'] for k in obh)/max(1,len(obh)):.0f} %)")

print('\n=== 5) DRUHÁ KOLA: kolikrát vyhrál ten, kdo v 1. kole skončil druhý ===')
for y in REG:
    by = collections.defaultdict(list)
    for k in K:
        if k['rok'] == y and k['typ'] == '0' and k['postup']: by[k['obvod']].append(k)
    obr = 0; n = 0; tesne = []
    for o, ks in by.items():
        if len(ks) != 2: continue
        n += 1
        a, b = sorted(ks, key=lambda k: -k['p1'])
        if b['zvolen']: obr += 1
        tesne.append((abs(a['p2'] - b['p2']), o, a['jmeno'], a['p2'], b['jmeno'], b['p2']))
    tesne.sort()
    print(f"{y}: 2. kol {n}, obrat {obr} ({100*obr/max(1,n):.0f} %); nejtěsnější: {tesne[0] if tesne else ''}")

print('\n=== 6) ÚSPĚŠNOST STRAN VE 2. KOLE (postoupil → vyhrál) pro hlavní strany ===')
for st in ['ANO', 'ODS', 'SOCDEM', 'STAN', 'KDU-ČSL', 'TOP 09', 'Piráti', 'SPD', 'KSČM']:
    row = []
    for y in REG:
        ks = [k for k in K if k['rok'] == y and k['typ'] == '0' and k['ns'] == st]
        p = [k for k in ks if k['postup']]
        if ks: row.append(f"{y}:{len(ks)}/{len(p)}/{sum(k['zvolen'] for k in p)}")
    print(st, '  '.join(row))

# --- účast (řádné volby, set5) ---
print('\n=== 7) ÚČAST (řádné volby, součet okrsků) ===')
uc = collections.defaultdict(lambda: [0, 0])
with open(os.path.join(Z, 'dl/SENATdata20250118_csv/csv/set5.csv'), encoding='cp1250') as f:
    for r in csv.DictReader(f, delimiter=';'):
        if datumy.get(r['DATUMVOLEB']) != '0': continue
        x = uc[(r['DATUMVOLEB'][:4], r['KOLO'])]; x[0] += int(r['VOL_SEZNAM']); x[1] += int(r['VYD_OBALKY'])  # oficiální účast ČSÚ = vydané obálky / voliči v seznamu
u26 = {1: [0, 0], 2: [0, 0]}
for o in range(3, 82, 3):
    d = json.load(open(os.path.join(Z, 'd26', f'{o}.json'), encoding='utf-8'))
    for p in d['prehled']:
        u26[p[0]][0] += p[4]; u26[p[0]][1] += p[5]
for (y, kolo), (v, o) in sorted(uc.items()):
    print(y, kolo, f'{100*o/v:.2f} %')
for kolo in (1, 2): print('2026', kolo, f'{100*u26[kolo][1]/u26[kolo][0]:.2f} % (zapsaní {u26[kolo][0]}, obálky {u26[kolo][1]})')

print('\n=== SPORNÉ pohlaví (jméno × příjmení nesouhlasí) – zkontrolovat ručně ===')
for s in sorted(sporne): print('  ', s)
json.dump({str(y): [dict(obvod=o, jmeno=s['jmeno'], g=s['g'], ns=s['ns']) for o, s in sorted(senat_po[y].items())] for y in REG},
          open(os.path.join(H, 'senat_slozeni.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)

print('\n=== ZVOLENÉ ŽENY podle roku ===')
for y in REG:
    print(y, '; '.join(f"{k['jmeno']} ({k['ns']}, {k['obvod']})" for k in K if k['rok']==y and k['typ']=='0' and k['zvolen'] and k['g']=='Ž'))
print('2026 senátorky celkem:', [s['jmeno'] for s in senat_po[2026].values() if s['g']=='Ž'])

print('\n=== ŽENY ve 2. kole / zvolené v 1. kole a jejich úspěšnost ===')
for y in REG:
    ks = [k for k in K if k['rok'] == y and k['typ'] == '0']
    p = [k for k in ks if k['g'] == 'Ž' and (k['postup'] or k['z1'] == '1')]
    print(y, f"ženy postoupily/zvoleny v 1.k.: {len(p)}, zvoleno {sum(k['zvolen'] for k in p)}; muži: {sum(k['g']=='M' and (k['postup'] or k['z1']=='1') for k in ks)}")
print('\n=== 2026: vedoucí z 1. kola, kteří prohráli ===')
by = collections.defaultdict(list)
for k in K:
    if k['rok'] == 2026 and k['postup']: by[k['obvod']].append(k)
for o, ks in sorted(by.items()):
    a, b = sorted(ks, key=lambda k: -k['p1'])
    if b['zvolen']: print(o, f"{a['jmeno']} ({a['ns']}) {a['p1']} % -> {a['p2']} %  vs  {b['jmeno']} ({b['ns']}) {b['p1']} % -> {b['p2']} %")
print('\n=== ANO: první místa v 1. kole a výhry ===')
for y in range(2014, 2027, 2):
    by = collections.defaultdict(list)
    for k in K:
        if k['rok'] == y and k['typ'] == '0': by[k['obvod']].append(k)
    prv = [max(ks, key=lambda k: k['p1']) for ks in by.values()]
    print(y, 'ANO 1. místo v 1. kole:', sum(k['ns'] == 'ANO' for k in prv), '| z toho zvoleno:', sum(k['ns'] == 'ANO' and k['zvolen'] for k in prv))
print('\n=== Vítězné % ve 2. kole (medián) a nejvyšší ===')
for y in REG:
    w = [k['p2'] for k in K if k['rok'] == y and k['typ'] == '0' and k['zvolen'] and (k['p2'] or 0) > 0]
    if w: print(y, f'medián {statistics.median(w):.1f} %, max {max(w)} %')

print('\n=== Souboje 2. kola podle pohlaví ===')
for y in REG:
    by = collections.defaultdict(list)
    for k in K:
        if k['rok'] == y and k['typ'] == '0' and k['postup']: by[k['obvod']].append(k)
    c = collections.Counter(); zw = 0
    for ks in by.values():
        if len(ks) != 2: continue
        t = ''.join(sorted(k['g'] for k in ks)); c[t] += 1
        if t == 'MŽ': zw += any(k['g'] == 'Ž' and k['zvolen'] for k in ks)
    print(y, dict(c), f'| žena vyhrála smíšený souboj: {zw}/{c["MŽ"]}')
print('\n=== Senátorky s mandátem končícím 2026 a co udělaly ===')
kand26 = {k['jmeno'].split()[0] + ' ' + k['jmeno'].split()[1] if False else k['jmeno'] for k in K if k['rok'] == 2026}
for o, s in sorted(senat_po[2024].items()):
    if o % 3 == 0 and s['g'] == 'Ž':
        hit = [k for k in K if k['rok'] == 2026 and s['jmeno'].split()[-1].split('-')[0][:5] in k['jmeno']]
        print(o, s['jmeno'], s['ns'], '->', [(k['jmeno'], k['obvod'], k['zvolen']) for k in hit] or 'nekandidovala')

print('\n=== 2026: ženy ve 2. kole a jejich soupeři ===')
for k in K:
    if k['rok'] == 2026 and k['postup'] and k['g'] == 'Ž':
        opp = [x for x in K if x['rok'] == 2026 and x['obvod'] == k['obvod'] and x['postup'] and x is not k][0]
        print(k['obvod'], k['jmeno'], k['ns'], k['p1'], '->', k['p2'], '| proti', opp['jmeno'], opp['ns'], opp['p2'])

print('\n=== OBHAJOBY podle toho, zda obhájce navrhla strana tehdejší vlády (vláda v den voleb) ===')
for i, y in enumerate(REG[1:], 1):
    prev = senat_po[REG[i - 1]]
    ks = [k for k in K if k['rok'] == y and k['typ'] == '0']
    obh = [k for k in ks if prev[k['obvod']]['jmeno'].split()[-1] == k['jmeno'].split()[-1] and prev[k['obvod']]['jmeno'].split()[0] == k['jmeno'].split()[0]]
    vl = [k for k in obh if prev[k['obvod']]['ns'] in VLADA[y]]; ost = [k for k in obh if k not in vl]
    print(f"{y}: obhájci z vládních stran {sum(k['zvolen'] for k in vl)}/{len(vl)}, ostatní {sum(k['zvolen'] for k in ost)}/{len(ost)}")
