# Graf 1 článku volby-cr-2026-11-02-senat-pojistka-demokracie:
# podíl křesel vládních stran v Senátu (podle senátorských klubů, senat.cz) a ve Sněmovně (podle výsledků voleb) 1997–2026.
# Vstup: kluby.json (počty členů klubů ke dni, stahuje kluby.py ze senat.cz/organy/…par_1=K), vlady.py (vlády a jejich křesla ve Sněmovně).
# Výstup: data/slozeni-komor.csv, grafy/slozeni-komor.html, souhrn na stdout.
import json, os, sys, csv, datetime as dt
sys.stdout.reconfigure(encoding='utf-8')
H = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(H)  # složka článku
sys.path.insert(0, H)
from vlady import VLADY

K = {}
for f in ('kluby.json', 'kluby2.json'):
    p = os.path.join(H, f)
    if os.path.exists(p): K.update(json.load(open(p, encoding='utf-8')))

# Body: stav po každých senátních volbách (první den, kdy jsou v klubech zapsaní všichni noví senátoři) a po nástupu každé
# řádné vlády po sněmovních volbách. Pravidlo: senátor je „vládní“, když je v klubu, který nese jméno strany ve vládě
# (u společných klubů rozhoduje vládní strana v názvu); nezařazení se nepočítají, s jedinou výjimkou uvedenou níže.
# (datum senat.cz, typ bodu, kluby počítané jako vládní, + nezařazení podporující vládu, poznámka)
BODY = [
    ('1.1.1997', 'Senát', ['Senátorský klub Občanské demokratické strany', 'Senátorský klub Křesťanské a demokratické unie - Československé strany lidové', 'Senátorský klub Občanské demokratické aliance'], 0, 'první Senát'),
    ('1.1.1999', 'Senát', ['Senátorský klub České strany sociálně demokratické'], 0, ''),
    ('1.1.2001', 'Senát', ['Senátorský klub České strany sociálně demokratické'], 0, ''),
    ('1.8.2002', 'vláda', ['Senátorský klub České strany sociálně demokratické', 'Senátorský klub Křesťanské a demokratické unie - Československé strany lidové', 'Senátorský klub Unie svobody - Občanské demokratické aliance'], 0, 'Špidla'),
    ('1.12.2002', 'Senát', ['Senátorský klub České strany sociálně demokratické', 'Senátorský klub Křesťanské a demokratické unie - Československé strany lidové', 'Klub otevřené demokracie'], 0, 'Klub otevřené demokracie = US-DEU a nezávislí'),
    ('1.12.2004', 'Senát', ['Senátorský klub České strany sociálně demokratické', 'Senátorský klub Křesťanské a demokratické unie - Československé strany lidové', 'Klub otevřené demokracie'], 0, ''),
    ('1.12.2006', 'Senát', ['Senátorský klub Občanské demokratické strany'], 0, 'Topolánek I bez důvěry'),
    ('1.2.2007', 'vláda', ['Senátorský klub Občanské demokratické strany', 'Senátorský klub Křesťanské a demokratické unie - Československé strany lidové'], 0, 'Topolánek II; SZ bez vlastního klubu'),
    ('1.12.2008', 'Senát', ['Senátorský klub Občanské demokratické strany', 'Senátorský klub Křesťanské a demokratické unie - Československé strany lidové'], 0, ''),
    ('1.8.2010', 'vláda', ['Senátorský klub Občanské demokratické strany', 'Klub TOP 09 a Starostové'], 0, 'Nečas; VV v Senátu bez klubu'),
    ('1.12.2010', 'Senát', ['Senátorský klub Občanské demokratické strany', 'Klub TOP 09 a Starostové'], 0, ''),
    ('1.12.2012', 'Senát', ['Senátorský klub Občanské demokratické strany'], 0, 'TOP 09 bez vlastního klubu; Starostové a Ostravak nepočítáme'),
    ('15.2.2014', 'vláda', ['Senátorský klub České strany sociálně demokratické', 'Klub pro obnovu demokracie - KDU-ČSL a nezávislí'], 0, 'Sobotka; ANO v Senátu ještě bez klubu'),
    ('1.12.2014', 'Senát', ['Senátorský klub České strany sociálně demokratické', 'Senátorský klub KDU-ČSL a nezávislí', 'Senátorský klub ANO + Severočeši.cz'], 0, ''),
    ('1.12.2016', 'Senát', ['Senátorský klub České strany sociálně demokratické', 'Senátorský klub KDU-ČSL a nezávislí', 'Senátorský klub ANO'], 0, ''),
    ('1.7.2018', 'vláda', ['Senátorský klub České strany sociálně demokratické', 'Senátorský klub ANO'], 0, 'Babiš II'),
    ('1.12.2018', 'Senát', ['Senátorský klub České strany sociálně demokratické', 'Senátorský klub ANO'], 0, ''),
    ('1.12.2020', 'Senát', ['Senátorský klub PROREGION'], 0, 'PROREGION = senátoři ANO a ČSSD'),
    ('1.1.2022', 'vláda', ['Senátorský klub ODS a TOP 09', 'Senátorský klub Starostové a nezávislí', 'Senátorský klub KDU-ČSL a nezávislí', 'Senátorský klub SEN 21 a Piráti'], 0, 'Fiala'),
    ('1.12.2022', 'Senát', ['Senátorský klub ODS a TOP 09', 'Senátorský klub Starostové a nezávislí', 'Senátorský klub KDU-ČSL a nezávislí', 'Senátorský klub SEN 21 a Piráti'], 0, ''),
    ('1.12.2024', 'Senát', ['Senátorský klub ODS a TOP 09', 'Senátorský klub Starostové a nezávislí', 'Senátorský klub KDU-ČSL a nezávislí'], 0, 'Piráti už mimo vládu'),
    ('1.1.2026', 'vláda', ['Senátorský klub ANO 2011'], 0, 'Babiš III'),
    ('3.11.2026', 'Senát', ['Senátorský klub ANO 2011'], 1, '+ Daniela Kovářová (nezařazená, provládní)'),
]

def datum(s):
    d, m, y = map(int, s.split('.')); return dt.date(y, m, d)
def vlada_k(d):
    for od, do, prem, strany, kresla, pozn in VLADY:
        if dt.date.fromisoformat(od) <= d < dt.date.fromisoformat(do): return prem, strany, kresla
    raise ValueError(d)

rows = []
for ds, typ, vl, plus, pozn in BODY:
    kl = {r['klub']: r['clenu'] for r in K[ds]}
    chybi = [k for k in vl if k not in kl]
    assert not chybi, (ds, chybi, list(kl))
    celkem = sum(v or 0 for v in kl.values())
    sen = sum(kl[k] for k in vl) + plus
    d = datum(ds); prem, strany, ps = vlada_k(d)
    rows.append(dict(datum=d.isoformat(), bod=typ, premier=prem, vladni_strany=' + '.join(strany), senat_vladni=sen,
                     senat_celkem=celkem, senat_podil=round(100 * sen / 81, 1), snemovna_vladni=ps, snemovna_podil=round(100 * ps / 200, 1),
                     vladni_kluby='; '.join(vl), poznamka=pozn))

for r in rows:
    print(f"{r['datum']} {r['bod']:6s} {r['premier']:10s} Senát {r['senat_vladni']:2d}/81 ({r['senat_podil']:4.1f} %, v klubech {r['senat_celkem']})  Sněmovna {r['snemovna_vladni']}/200  {r['poznamka']}")

# Kolik let měla vláda většinu v obou komorách: stav mezi body držíme do dalšího bodu nebo do změny vlády.
konec = dt.date(2026, 11, 8)
zlomy = sorted({dt.date.fromisoformat(r['datum']) for r in rows} | {dt.date.fromisoformat(v[0]) for v in VLADY if dt.date.fromisoformat(v[0]) >= dt.date(1997, 1, 1)} | {konec})
obe = senat_vetsina = 0.0
def sen_k(d):
    last = None
    for r in rows:
        if dt.date.fromisoformat(r['datum']) <= d: last = r
    return last
for a, b in zip(zlomy, zlomy[1:]):
    prem, strany, ps = vlada_k(a)
    r = sen_k(a)
    if not strany or r is None: continue
    sen = r['senat_vladni'] if r['premier'] == prem and r['vladni_strany'] == ' + '.join(strany) else None
    if sen is None: continue
    roky = (b - a).days / 365.25
    if sen >= 41: senat_vetsina += roky
    if sen >= 41 and ps >= 101: obe += roky
print(f'\nVláda s většinou v Senátu: {senat_vetsina:.1f} let; v obou komorách: {obe:.1f} let z {(konec - dt.date(1997,1,1)).days/365.25:.1f}')

os.makedirs(os.path.join(OUT, 'data'), exist_ok=True)
with open(os.path.join(OUT, 'data', 'slozeni-komor.csv'), 'w', encoding='utf-8', newline='') as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)

# ---- graf: dvojice sloupců po senátních volbách (Senát karmínově/navy, Sněmovna šedě), čáry 50 % a 60 % ----
NAVY, INK, MUTED, CRIMSON, GRID, LIGHT = '#272a59', '#101432', '#4c4f8e', '#de1743', '#e2ddcf', '#b9bccf'
FONT = "font-family='IBM Plex Sans, Arial, sans-serif'"
G = [r for r in rows if r['bod'] == 'Senát']
x0, x1, y0, y1, W = 46, 560, 250, 34, 680
n = len(G); krok = (x1 - x0) / n; w = krok * 0.36
Y = lambda p: y0 - (y0 - y1) * p / 100
X = lambda i: x0 + krok * (i + .5)
o = []
for p in (25, 50, 75, 100):
    o.append(f"<line x1='{x0}' y1='{Y(p):.1f}' x2='{x1}' y2='{Y(p):.1f}' stroke='{GRID}' stroke-width='1'/>")
    o.append(f"<text x='{x0 - 6}' y='{Y(p) + 4:.1f}' text-anchor='end' {FONT} font-size='11' fill='{MUTED}'>{p} %</text>")
for p, l1, l2 in ((50, 'většina', '41 z 81'), (60.5, 'ústavní většina', '3/5 = 49 z 81')):
    o.append(f"<line x1='{x0}' y1='{Y(p):.1f}' x2='{x1 + 4}' y2='{Y(p):.1f}' stroke='#8d8a7c' stroke-width='1.4' stroke-dasharray='6 5'/>")
    dy = 10 if p == 50 else -3
    o.append(f"<text x='{x1 + 8}' y='{Y(p) + dy:.1f}' {FONT} font-size='11.5' font-weight='600' fill='{INK}'>{l1}</text>"
             f"<text x='{x1 + 8}' y='{Y(p) + dy + 13:.1f}' {FONT} font-size='11' fill='{MUTED}'>{l2}</text>")
o.append(f"<line x1='{x0}' y1='{y0}' x2='{x1}' y2='{y0}' stroke='{INK}' stroke-width='2'/>")
for i, r in enumerate(G):
    cx = X(i); hl = i == n - 1
    s, c = r['senat_podil'], r['snemovna_podil']
    o.append(f"<rect x='{cx - w:.1f}' y='{Y(s):.1f}' width='{w - 1:.1f}' height='{y0 - Y(s):.1f}' fill='{CRIMSON if hl else NAVY}' rx='1.5'><title>Senát: {r['senat_vladni']} z 81 ({r['premier']})</title></rect>")
    o.append(f"<rect x='{cx + 1:.1f}' y='{Y(c):.1f}' width='{w - 1:.1f}' height='{y0 - Y(c):.1f}' fill='{LIGHT}' rx='1.5'><title>Sněmovna: {r['snemovna_vladni']} z 200</title></rect>")
    o.append(f"<text x='{cx - w / 2:.1f}' y='{Y(s) - 5:.1f}' text-anchor='middle' {FONT} font-size='{16 if hl else 11}' font-weight='700' fill='{CRIMSON if hl else INK}'>{r['senat_vladni']}</text>")
    rok = r['datum'][:4] if r['datum'][5:7] != '01' else str(int(r['datum'][:4]) - 1)
    o.append(f"<text x='{cx:.1f}' y='{y0 + 17}' text-anchor='middle' {FONT} font-size='{12.5 if hl else 11.5}' font-weight='{700 if hl else 400}' fill='{CRIMSON if hl else MUTED}'>’{rok[2:]}</text>")
# premiéři: závorka pod roky přes sloupce stejného premiéra
sk = []
for i, r in enumerate(G):
    if sk and sk[-1][0] == r['premier']: sk[-1][2] = i
    else: sk.append([r['premier'], i, i])
for k, (jm, a, b) in enumerate(sk):
    hl = b == n - 1; c = CRIMSON if hl else MUTED
    xa, xb = X(a) - krok * .44, X(b) + krok * .44
    yy = y0 + 26 + (12 if (b - a == 0 and k % 2) else 0)
    o.append(f"<path d='M{xa:.1f},{y0 + 24} v4 H{xb:.1f} v-4' fill='none' stroke='{c}' stroke-width='1.2'/>")
    o.append(f"<text x='{(xa + xb) / 2:.1f}' y='{yy + 14}' text-anchor='middle' {FONT} font-size='11' font-weight='{700 if hl else 600}' fill='{CRIMSON if hl else INK}'>{jm}</text>")
ly = y0 + 74
o.append(f"<rect x='{x0}' y='{ly - 10}' width='12' height='12' fill='{NAVY}'/><text x='{x0 + 17}' y='{ly}' {FONT} font-size='12' fill='{INK}'>Senát: senátoři v klubech vládních stran (číslo = z 81)</text>")
o.append(f"<rect x='{x0 + 340}' y='{ly - 10}' width='12' height='12' fill='{LIGHT}'/><text x='{x0 + 357}' y='{ly}' {FONT} font-size='12' fill='{INK}'>Sněmovna: vládní strany</text>")
o.append(f"<text x='{x0}' y='{ly + 20}' {FONT} font-size='11.5' fill='{MUTED}'>Stav po každých senátních volbách; pod osou rok voleb a premiér tehdejší vlády.</text>")
svg = (f"<div style=\"max-width:760px;margin:0 auto;overflow-x:auto;-webkit-overflow-scrolling:touch\"><svg role=\"img\" aria-label=\"Podíl vládních stran v Senátu a ve Sněmovně po senátních volbách 1996–2026\" "
       f"style=\"width:100%;min-width:540px;height:auto;display:block\" viewBox='0 0 {W} {ly + 34}' preserveAspectRatio='xMidYMid meet' xmlns='http://www.w3.org/2000/svg'>{''.join(o)}</svg></div>\n")
os.makedirs(os.path.join(OUT, 'grafy'), exist_ok=True)
open(os.path.join(OUT, 'grafy', 'slozeni-komor.html'), 'w', encoding='utf-8').write(svg)
print('zapsáno', os.path.join(OUT, 'grafy', 'slozeni-komor.html'))
