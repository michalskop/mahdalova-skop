import json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
OUT = sys.argv[1]
B = 'https://resultados.tse.jus.br/oficial/ele2026'
cfg = json.load(open(os.path.join(OUT, 'mun6258.json'), encoding='utf-8-sig'))
jobs = []
for uf in cfg['abr']:
    for m in uf['mu']:
        for ele in ('6258', '6257'):
            jobs.append((ele, uf['cd'], m['cd']))
def get(j):
    ele, uf, mu = j
    d = os.path.join(OUT, ele, uf); os.makedirs(d, exist_ok=True)
    f = os.path.join(d, f'{mu}.json')
    if os.path.exists(f) and os.path.getsize(f) > 500: return 0
    url = f'{B}/{ele}/dados/{uf}/{uf}{mu}-c0001-e00{ele}-u.json'
    for _ in range(4):
        try:
            r = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=30).read()
            open(f, 'wb').write(r); return 0
        except Exception as e:
            err = e
    print('FAIL', url, err); return 1
with ThreadPoolExecutor(24) as ex:
    fails = sum(ex.map(get, jobs))
print('jobs', len(jobs), 'fails', fails)
