import re, json, sys, time, html, urllib.request
from concurrent.futures import ThreadPoolExecutor
Y=sys.argv[1]; BASE=f'https://volby.gov.cz/pls/kv{Y}/'
def get(u, tries=4):
    for i in range(tries):
        try:
            return urllib.request.urlopen(urllib.request.Request(BASE+u, headers={'User-Agent':'DataTimes research'}), timeout=60).read().decode('utf-8','replace')
        except Exception as e:
            time.sleep(2+i*3)
    return ''
def txt(s): return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',s))).strip()
top=get('kv12?xjazyk=CZ&xid=0')
okresy=sorted(set(re.findall(r'kv111\?xjazyk=CZ&amp;xid=0&amp;xnumnuts=(\d+)',top)))
print(Y,'okresy',len(okresy),flush=True)
links=[]
for o in okresy:
    p=get(f'kv111?xjazyk=CZ&xid=0&xnumnuts={o}')
    links+= [l.replace('&amp;','&') for l in re.findall(r'href="(kv1111\?[^"]+)"',p,re.I)]
links=sorted(set(links)); print('obce',len(links),flush=True)
def parse(l):
    p=get(l)
    obec=re.search(r'xobec=(\d+)',l).group(1); dz=re.search(r'xdz=(\d+)',l).group(1)
    rows=[]
    # table rows
    for tr in re.findall(r'<tr[^>]*>(.*?)</tr>',p,re.S|re.I):
        tds=[txt(t) for t in re.findall(r'<td[^>]*>(.*?)</td>',tr,re.S|re.I)]
        rows.append(tds)
    return dict(obec=obec,dz=dz,link=l,rows=rows,name=txt(re.search(r'Obec:(.*?)</',p,re.S).group(1)) if 'Obec:' in p else '')
out=[]
with ThreadPoolExecutor(6) as ex:
    for i,r in enumerate(ex.map(parse,links)):
        out.append(r)
        if i%500==0: print(i,flush=True)
json.dump(out,open(f'kv{Y}_raw.json','w',encoding='utf-8'),ensure_ascii=False)
print('done',flush=True)
