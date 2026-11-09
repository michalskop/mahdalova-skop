import re, sys, json, html, time, urllib.request, os
sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
def get(u):
    for i in range(6):
        try:
            return urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 DataTimes senat-kluby'}), timeout=60).read().decode('utf-8', 'replace')
        except Exception as e:
            print('retry', u, e); time.sleep(4)
    raise SystemExit('fail ' + u)
OUT = sys.argv[1]
out = json.load(open(OUT, encoding='utf-8')) if os.path.exists(OUT) else {}
for d in sys.argv[2:]:
    t = get(f'https://www.senat.cz/organy/index.php?ke_dni={d}&O=&lng=cz&par_1=K')
    cl = re.findall(r'<a href=(index\.php\?[^ >]*par_2=(\d+))>([^<]+)</a>', t)
    res = []
    for href, cid, name in cl:
        t2 = get('https://www.senat.cz/organy/' + html.unescape(href))
        s = re.sub(r'\s+', ' ', re.sub('<!--.*?-->', ' ', re.sub(r'-->', ' ', t2), flags=re.S))
        s = html.unescape(re.sub(r'\s+', ' ', re.sub('<[^>]+>', ' ', s))).replace('\xa0', ' ')
        m = re.search(r'Počet členů (\d+)', s)
        n = int(m.group(1)) if m else None
        i = s.find(html.unescape(name.strip()), s.find('Nacházíte') + 200)
        j = s.find('Kontakt', i)
        res.append(dict(id=cid, klub=html.unescape(name.strip()), clenu=n, text=s[i:j if j > 0 else i + 800][:900]))
    out[d] = res
    print(d, 'celkem', sum(r['clenu'] or 0 for r in res))
    for r in res: print('   ', r['clenu'], r['klub'])
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
