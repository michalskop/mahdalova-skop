"""Sestaví data pro článek o obcích s jedinou kandidátkou.

Kategorie obce v daném roce (řádný termín voleb, jen zastupitelstva obcí, bez městských částí):
  0 = soutěž: víc kandidátek a víc kandidátů než mandátů
  1 = jediná kandidátka, víc kandidátů než mandátů (jsou náhradníci)
  2 = jediná kandidátka, kandidátů nejvýš tolik jako mandátů (zvoleni všichni, bez náhradníků)
  3 = víc kandidátek, ale kandidátů dohromady nejvýš tolik jako mandátů (zvoleni všichni)
  4 = žádná kandidátka (volby se nekonaly)
"""
import json, os
import pandas as pd
from load import YEARS, rd

OUT = 'out'
os.makedirs(OUT, exist_ok=True)


def cat(listy, kand, mand):
    if kand < 0:  # 1994/98, obce s obvody: kandidáti neuvedeni, ale víc stran → soutěž
        return 0
    if listy == 0:
        return 4
    if listy == 1:
        return 2 if kand <= mand else 1
    return 3 if kand <= mand else 0


z = pd.read_pickle('zast.pkl').reset_index()
z['kat'] = [cat(l, k, m) for l, k, m in zip(z.LISTY, z.KAND, z.MANDATY)]
z['LISTD'] = z.MAXLISTY_OBV  # počet kandidátek k zobrazení (u obcí s obvody max. v jednom obvodu)

# 1994/1998 (scrape volby.cz), klíč = kód obce → převod na KODZASTUP podle 2026
cur = z[z.YEAR == 2026][['KODZASTUP', 'OBEC']]
obec2kod = dict(zip(cur.OBEC, cur.KODZASTUP))
old = []
for y in (1994, 1998):
    d = pd.read_pickle(f'z{y}.pkl')
    d = d[d.dz != '5'].copy()
    d['YEAR'] = y
    d['KODZASTUP'] = d.obec.map(lambda o: obec2kod.get(o, o))
    d['kat'] = [cat(l, k, m) for l, k, m in zip(d.LISTY, d.KAND, d.MANDATY)]
    d['POCOBYV'] = None
    d['NAZEV'] = d.name
    d['LISTD'] = d.LISTY
    old.append(d[['YEAR', 'KODZASTUP', 'NAZEV', 'MANDATY', 'LISTY', 'LISTD', 'KAND', 'kat', 'POCOBYV']])
allz = pd.concat([pd.concat(old), z[['YEAR', 'KODZASTUP', 'NAZEV', 'MANDATY', 'LISTY', 'LISTD', 'KAND', 'kat', 'POCOBYV']]])
ALLY = [1994, 1998] + YEARS

# ---------- 1) časová řada ----------
ser = []
for y in ALLY:
    d = allz[allz.YEAR == y]
    n = len(d)
    row = dict(rok=y, obci=n)
    for c in range(5):
        row[f'c{c}'] = int((d.kat == c).sum())
    ser.append(row)
ser = pd.DataFrame(ser)
ser.to_csv(f'{OUT}/serie.csv', index=False)
print(ser.to_string())

# ---------- 2) mapa: data po obcích ----------
cur26 = z[z.YEAR == 2026].set_index('KODZASTUP')
okresy = rd(2026, 'cnumnuts')
okres_name = dict(zip(okresy.NUMNUTS, okresy.NAZEVNUTS))
mapdata = {'years': ALLY, 'obce': {}}
for kod, r in cur26.iterrows():
    mapdata['obce'][kod] = {'n': r.NAZEV, 'o': okres_name.get(r.OKRES, ''), 'p': int(r.POCOBYV), 'y': {}}
for _, r in allz.iterrows():
    o = mapdata['obce'].get(r.KODZASTUP)
    if o is None:
        continue
    o['y'][str(r.YEAR)] = [int(r.kat), int(r.MANDATY), int(r.KAND), int(r.LISTD)]
# kompaktně: y -> řetězec "rok:cat,mand,kand,listy;..."
for o in mapdata['obce'].values():
    o['y'] = ';'.join(f"{y}:{','.join(map(str, v))}" for y, v in sorted(o['y'].items()))
json.dump(mapdata, open(f'{OUT}/obce-data.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('obce v mapě', len(mapdata['obce']))
