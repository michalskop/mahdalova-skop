import re, json, time, urllib.request, gzip
from concurrent.futures import ThreadPoolExecutor
s = open('ovm.xml', encoding='utf-8').read()
subj = re.findall(r'<Subjekt>(.*?)</Subjekt>', s, re.S)
obce = []
for x in subj:
    if '<PravniForma type="801">' in x and '<PrimarniOvm>Ano' in x:
        g = lambda t: (re.search(f'<{t}>(.*?)</{t}>', x, re.S) or [None, None])[1]
        obce.append(dict(zkratka=g('Zkratka'), ico=g('ICO'), nazev=g('Nazev'), obec=g('ObecKod')))
print('obci', len(obce), flush=True)
def get(o):
    u = 'https://www.czechpoint.cz/spravadat/p/ovm/datafile?format=xml&service=seznamovm&id=' + urllib.request.quote(o['zkratka'])
    for i in range(4):
        try:
            b = urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'DataTimes research'}), timeout=60).read()
            if b[:2] == b'\x1f\x8b': b = gzip.decompress(b)
            t = b.decode('utf-8')
            z = []
            for m in re.findall(r'<StatutarniZastupce>(.*?)</StatutarniZastupce>', t, re.S):
                f = lambda k: (re.search(f'<{k}>(.*?)</{k}>', m, re.S) or [None, ''])[1]
                z.append(dict(jmeno=f('Jmeno'), prijmeni=f('Prijmeni'), funkce=f('Funkce'), tit=f('TitulyPred')))
            return dict(o, zastupci=z)
        except Exception as e:
            time.sleep(3 + 3 * i)
    return dict(o, zastupci=None)
out = []
with ThreadPoolExecutor(5) as ex:
    for i, r in enumerate(ex.map(get, obce)):
        out.append(r)
        if i % 500 == 0: print(i, flush=True)
json.dump(out, open('starostove.json', 'w', encoding='utf-8'), ensure_ascii=False)
print('done', flush=True)
