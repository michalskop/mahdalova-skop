"""Článek 04 – Skandinávská past: stažení dat (Eurostat API, SCB API) do data/*.csv.

Použití:  python -X utf8 -I stahni_data.py <slozka_pro_surove_soubory>   (spouštět ve složce článku)
Ruční zdroje (hodnoty zapsané v tfr_zeme.csv, zdroj ve sloupci 'zdroj'):
  Maďarsko 2000–2025: KSH STADAT 22.1.1.6 (https://www.ksh.hu/stadat_files/nep/en/nep0006.html, staženo 28. 10. 2026)
  Francie 2025: INSEE, Insee Première č. 2087, Bilan démographique 2025 (ICF 1,56)
  Česko 2025: ČSÚ, https://statistikaamy.csu.gov.cz/nejmene-narozenych-deti-v-historii (1,28)
"""
import csv
import hashlib
import json
import os
import sys
import urllib.request

raw = sys.argv[1]
os.makedirs(raw, exist_ok=True)
os.makedirs('data', exist_ok=True)
EU = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/'


def get(url, fname, data=None):
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'} if data else {})
    body = urllib.request.urlopen(req, timeout=120).read()
    open(os.path.join(raw, fname), 'wb').write(body)
    print(fname, len(body), 'B SHA-256', hashlib.sha256(body).hexdigest())
    return body


def jsonstat(body, table):
    d = json.loads(body)
    ids, size = d['id'], d['size']
    cats = {k: list(d['dimension'][k]['category']['index']) if isinstance(d['dimension'][k]['category']['index'], list)
            else [c for c, _ in sorted(d['dimension'][k]['category']['index'].items(), key=lambda kv: kv[1])] for k in ids}
    strides, s = [], 1
    for n in reversed(size):
        strides.append(s); s *= n
    strides.reverse()
    for pos_s, v in d['value'].items():
        pos = int(pos_s)
        rec = {k: cats[k][(pos // st) % n] for k, st, n in zip(ids, strides, size)}
        yield table, rec, v


rows = []
# 1) Eurostat demo_find: TFR a podíl narozených mimo manželství (CZ, SE, FR, HU, EU27)
geos = '&'.join('geo=' + g for g in ('CZ', 'SE', 'FR', 'HU', 'EU27_2020'))
b = get(EU + 'demo_find?format=JSON&lang=EN&' + geos, 'eurostat_demo_find.json')
for t, rec, v in jsonstat(b, 'demo_find'):
    if rec['indic_de'] in ('TOTFERRT', 'NMARPCT'):
        rows.append([t, rec['indic_de'], rec['geo'], rec['time'], v])
# 2) péče o děti do 3 let (EU-SILC): podíl dětí, které chodí do formální péče aspoň hodinu týdně = 100 – 'H0'
b = get(EU + 'ilc_caindformal?format=JSON&lang=EN&age=Y_LT3&duration=H0&' + geos + '&time=2022&time=2023&time=2024', 'eurostat_ilc_caindformal.json')
for t, rec, v in jsonstat(b, 'ilc_caindformal'):
    rows.append([t, 'H0_pct_bez_formalni_pece', rec['geo'], rec['time'], v])
# 3) ESSPROS: výdaje na rodinu a děti v % HDP
b = get(EU + 'spr_exp_func?format=JSON&lang=EN&unit=PC_GDP&spfunc=FAM&' + '&'.join('geo=' + g for g in ('EU27_2020', 'FR', 'SE', 'HU', 'CZ', 'PL', 'DE', 'DK', 'LU', 'BG')) + '&time=2021&time=2022&time=2023', 'eurostat_spr_exp_func.json')
for t, rec, v in jsonstat(b, 'spr_exp_func'):
    rows.append([t, 'FAM_pct_HDP', rec['geo'], rec['time'], v])
with open('data/eurostat_vybrane.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(['tabulka', 'ukazatel', 'geo', 'rok', 'hodnota'])
    w.writerows(sorted(rows))

# 4) SCB: úhrnná plodnost žen ve Švédsku 2000–2025 (tabulka BE0101H/FruktsamhetSum)
q = json.dumps({'query': [{'code': 'Region', 'selection': {'filter': 'item', 'values': ['00']}},
                          {'code': 'Kon', 'selection': {'filter': 'item', 'values': ['2']}},
                          {'code': 'ContentsCode', 'selection': {'filter': 'all', 'values': ['*']}},
                          {'code': 'Tid', 'selection': {'filter': 'all', 'values': ['*']}}],
                'response': {'format': 'csv'}}).encode()
body = get('https://api.scb.se/OV0104/v1/doris/en/ssd/START/BE/BE0101/BE0101H/FruktsamhetSum', 'scb_fruktsamhetsum.csv', data=q)
open('data/scb_fruktsamhetsum.csv', 'wb').write(body)
print(body.decode('utf-8-sig')[:300])
