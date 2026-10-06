import json, re, unicodedata
import pandas as pd
from load import YEARS, rd
from build import cat

def norm(s): return re.sub(r'\s+', ' ', (s or '').strip().lower())
d = json.load(open('starostove.json', encoding='utf-8'))
z = pd.read_pickle('zast.pkl').reset_index()
z['kat'] = [cat(l, k, m) for l, k, m in zip(z.LISTY, z.KAND, z.MANDATY)]
obec2kod = dict(zip(z[z.YEAR == 2026].OBEC, z[z.YEAR == 2026].KODZASTUP))

# kandidáti všech let
K = {}
for y in YEARS:
    rk = rd(y, 'kvrk')
    if 'DATUMVOLEB' in rk: rk = rk[rk.DATUMVOLEB == rk.DATUMVOLEB.mode()[0]]
    rk = rk[rk.PLATNOST == 'A'].copy()
    rk['nm'] = rk.JMENO.map(norm) + ' ' + rk.PRIJMENI.map(norm)
    K[y] = rk

rows = []
for o in d:
    kod = obec2kod.get(o['obec'])
    if not kod or not o['zastupci']: continue
    st = [s for s in o['zastupci'] if re.match(r'^(starost|primátor|uvolněn|neuvolněn)', s['funkce'].lower()) or s['funkce'] == '']
    # jen jedna osoba: preferuj výslovně starostu
    st = sorted(st, key=lambda s: 0 if 'starost' in s['funkce'].lower() or 'primátor' in s['funkce'].lower() else 1)
    if not st: continue
    s = st[0]
    nm = norm(s['jmeno']) + ' ' + norm(s['prijmeni'])
    e22 = K[2022][(K[2022].KODZASTUP == kod) & (K[2022].nm == nm) & (K[2022].MANDAT == 'A')]
    if e22.empty: continue
    hist = {y: bool(((K[y].KODZASTUP == kod) & (K[y].nm == nm) & (K[y].MANDAT == 'A')).any()) for y in YEARS[:-1]}
    # nepřetržitě zpětně od 2022
    since = 2022
    for y in reversed(YEARS[:-1]):
        if hist[y]: since = y
        else: break
    c26 = K[2026][(K[2026].KODZASTUP == kod) & (K[2026].nm == nm)]
    r22 = e22.iloc[0]
    rows.append(dict(kod=kod, nazev=o['nazev'], jmeno=nm, zena=s['funkce'].lower().startswith('starostka') or nm.split()[-1].endswith('á'),
                     since=since, n_terms=sum(hist.values()), first_on_list22=int(r22.PORCISLO) == 1,
                     kand26=not c26.empty, first26=(not c26.empty) and int(c26.iloc[0].PORCISLO) == 1,
                     kat22=int(z[(z.YEAR == 2022) & (z.KODZASTUP == kod)].kat.iloc[0]),
                     kat26=int(z[(z.YEAR == 2026) & (z.KODZASTUP == kod)].kat.iloc[0])))
m = pd.DataFrame(rows)
m.to_csv('out/starostove_match.csv', index=False)
print('spárováno', len(m))
m['skup26'] = m.kat26.map({0: 'soutez', 1: '1L nahr', 2: '1L vsichni', 3: 'vic L vsichni', 4: 'nikdo'})
print(m.groupby('skup26').agg(n=('kod', 'size'), od2002=('since', lambda s: round((s == 2002).mean() * 100, 1)),
      prum_obdobi=('n_terms', 'mean'), kand26=('kand26', 'mean'), prvni26=('first26', 'mean'), zeny=('zena', 'mean')).round(3))
print(pd.crosstab(m.skup26, m.since, normalize='index').round(3) * 100)
