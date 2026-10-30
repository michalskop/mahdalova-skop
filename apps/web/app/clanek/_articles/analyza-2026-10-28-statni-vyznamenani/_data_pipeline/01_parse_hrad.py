"""Rozparsuje oficiální seznamy vyznamenaných z hrad.cz (4 stránky) do jedné CSV.

Vstup: vstupy/hrad_seznamy/<druh>.html – kopie stránek
https://www.hrad.cz/cs/ceska-republika/statni-vyznamenani/<druh>/seznam-vyznamenanych
stažené 27. 10. 2026 přes Internet Archive (snímky z 8. 8. – 12. 10. 2026; hrad.cz je za
Cloudflare ochranou). Počty souhlasí s živou verzí stránek ověřenou v prohlížeči.
Výstup: hrad_seznamy.csv
"""
import csv, html, re, sys
from pathlib import Path

base = Path(__file__).parent
DRUHY = {
    'rad-bileho-lva': 'Řád Bílého lva',
    'rad-t.-g.-masaryka': 'Řád T. G. Masaryka',
    'medaile-za-hrdinstvi': 'Medaile Za hrdinství',
    'medaile-za-zasluhy': 'Medaile Za zásluhy',
}

def clean(s):
    s = re.sub(r'<br\s*/?>', ' | ', s)
    s = re.sub(r'<[^>]+>', '', s)
    s = html.unescape(s).replace('\xa0', ' ')
    return re.sub(r'\s+', ' ', s).strip()

sys.stdout.reconfigure(encoding='utf-8')
rows = []
for slug, druh in DRUHY.items():
    t = (base / 'vstupy' / 'hrad_seznamy' / f'{slug}.html').read_text(encoding='utf-8')
    start = t.find('FULLTEXT:INDEXSTART')
    end = t.find('FULLTEXT:INDEXSTOP', start)
    body = t[start:end if end > 0 else None]
    for li in re.findall(r'<li[^>]*>(.*?)</li>', body, flags=re.S):
        raw = clean(li)
        if not raw:
            continue
        strongs = [clean(s) for s in re.findall(r'<strong>(.*?)</strong>', li, flags=re.S)]
        jmeno = ' '.join(s.strip(' |') for s in strongs if s.strip(' |')).strip()
        rok = re.findall(r'\b(19\d\d|20\d\d)\b', raw)
        trida = re.search(r'([IVXl]+\.\s*(třída|stupeň)( s řetězem)?)', raw)
        skupina = re.search(r'(občanská|vojenská) skupina', raw)
        rows.append({
            'druh': druh,
            'jmeno': jmeno,
            'zaznam': raw,
            'rok': rok[-1] if rok else '',
            'trida': trida.group(1).replace('l.', 'I.') if trida else '',
            'skupina': skupina.group(1) if skupina else '',
            'in_memoriam': int('in memoriam' in raw.lower() or 'i. m.' in raw),
        })

# Opravy struktury HTML: záznam rozdělený do dvou <li>, chybějící <strong>, řádek o prezidentovi
fixed = []
for r in rows:
    if r['zaznam'].startswith('Prezidentu republiky'):
        continue
    if not r['jmeno'] and fixed and not fixed[-1]['rok']:
        p = fixed[-1]
        p['zaznam'] += ' | ' + r['zaznam']
        for k in ('rok', 'trida', 'skupina'):
            p[k] = p[k] or r[k]
        continue
    if not r['jmeno']:
        r['jmeno'] = re.sub(r'^((prof|doc|MUDr|Ing|PhDr|JUDr|RNDr|Mgr)\.\s*)+', '', r['zaznam'].split('|')[0]).split(',')[0].strip()
    fixed.append(r)
rows = fixed

with open(base / 'vstupy' / 'hrad_seznamy.csv', 'w', encoding='utf-8', newline='') as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0]))
    w.writeheader(); w.writerows(rows)

from collections import Counter
sys.stdout.reconfigure(encoding='utf-8')
print(len(rows), Counter(r['druh'] for r in rows))
print('bez roku:', [r['zaznam'] for r in rows if not r['rok']][:20])
print('bez jména:', [r['zaznam'] for r in rows if not r['jmeno']][:20])
