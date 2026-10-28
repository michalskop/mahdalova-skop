"""Stažení tabulek Eurostatu pro článek 02 (a 04) do CSV.

Použití:  python -X utf8 -I stahni_eurostat.py <vystupni_slozka_pro_surove_JSON> <data_slozka_pro_CSV>
Eurostat API (JSON-stat): https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/<kod>
Stáhne:
  demo_find   – úhrnná plodnost, průměrný věk matek, podíl narozených mimo manželství (CZ, SE, FR, HU, EU27_2020)
  demo_frate  – věkově specifické míry plodnosti, Česko, po jednotlivých letech věku
  demo_pjan   – počet žen v Česku podle věku 15–49 k 1. 1. (sex F)
  demo_gind   – součásti změny počtu obyvatel Česka (narození, úmrtí, migrace)
Do CSV se ukládá "dlouhý" tvar: tabulka, ukazatel, geo, vek, rok, hodnota.
"""
import csv
import hashlib
import json
import os
import sys
import urllib.request

BASE = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/'
raw_dir, data_dir = sys.argv[1], sys.argv[2]
os.makedirs(raw_dir, exist_ok=True)


def fetch(code, params, fname):
    url = BASE + code + '?format=JSON&lang=EN&' + params
    with urllib.request.urlopen(url, timeout=120) as r:
        body = r.read()
    path = os.path.join(raw_dir, fname)
    with open(path, 'wb') as f:
        f.write(body)
    print(code, fname, len(body), 'B, SHA-256', hashlib.sha256(body).hexdigest())
    return json.loads(body)


def to_rows(d, table):
    ids, size = d['id'], d['size']
    cats = {}
    for k in ids:
        idx = d['dimension'][k]['category']['index']
        cats[k] = list(idx) if isinstance(idx, list) else [c for c, _ in sorted(idx.items(), key=lambda kv: kv[1])]
    strides, s = [], 1
    for n in reversed(size):
        strides.append(s)
        s *= n
    strides = list(reversed(strides))
    for pos_s, v in d['value'].items():
        pos = int(pos_s)
        rec = {}
        for k, st, n in zip(ids, strides, size):
            rec[k] = cats[k][(pos // st) % n]
        yield [table, rec.get('indic_de', rec.get('unit', '')), rec.get('geo', ''), rec.get('age', ''), rec.get('sex', ''), rec.get('time', ''), v]


rows = []
geos = '&'.join('geo=' + g for g in ('CZ', 'SE', 'FR', 'HU', 'EU27_2020'))
d = fetch('demo_find', geos, 'demo_find.json')
rows += list(to_rows(d, 'demo_find'))
d = fetch('demo_frate', 'geo=CZ', 'demo_frate_CZ.json')
rows += list(to_rows(d, 'demo_frate'))
ages = '&'.join('age=Y%d' % a for a in range(15, 50))
years = '&'.join('time=%d' % y for y in range(1990, 2026))
d = fetch('demo_pjan', 'geo=CZ&sex=F&' + ages + '&' + years, 'demo_pjan_CZ_F.json')
rows += list(to_rows(d, 'demo_pjan'))
d = fetch('demo_gind', 'geo=CZ&' + '&'.join('time=%d' % y for y in range(2015, 2026)), 'demo_gind_CZ.json')
rows += list(to_rows(d, 'demo_gind'))

os.makedirs(data_dir, exist_ok=True)
with open(os.path.join(data_dir, 'eurostat_dlouhe.csv'), 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(['tabulka', 'ukazatel', 'geo', 'vek', 'pohlavi', 'rok', 'hodnota'])
    w.writerows(sorted(rows))
print('řádků:', len(rows))
