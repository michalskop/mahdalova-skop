# ANO po komunálních a senátních volbách 2026: všechna čísla článku a grafy.
#
# 1) Senát, 2. kolo – pomohla by výzva voličům koaličních partnerů (spor Pečinka × Michopulos)?
#    Zdroj: ČSÚ, výsledky po obvodech https://volby.gov.cz/appdata/senat/20261009/vysled/obvod/<n>.json
#    (staženo 20. 10. 2026 do zdroj/senat/; chybějící soubory skript stáhne)
#    vysledky: [č., jméno, navrh. subjekt, navrh. strana, příslušnost, hlasy 1. kolo, %, hlasy 2. kolo, %, ...]
#    prehled:  [kolo, okrsky, sečteno, %, voliči, vydané obálky, účast %, ..., odevzdané, platné, % platných]
# 2) ANO ve 13 krajských městech 2014–2026 (zastupitelstvo města, součet přes volební obvody).
#    Zdroj: ČSÚ, otevřená data komunálních voleb, registr výsledků stran kvros.csv
#    https://volby.gov.cz/opendata/kv2026/kv2026_opendata.htm (a kv2022, kv2018, kv2014; rozbalit do kv/)
#
# Spuštění: python vypocet.py [cesta ke složce kv]  → vystup.txt + ../grafy/*.html
import csv, json, os, sys, urllib.request
from collections import defaultdict
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
H = Path(__file__).resolve().parent
OUT = []
def p(*a): OUT.append(' '.join(str(x) for x in a))
def cz(n, d=0):  # 12345.6 -> "12 345,6"
    s = f'{n:,.{d}f}'.replace(',', ' ').replace('.', ',')
    return s.replace(' ', ' ')

# ---------- 1) Senát ----------
Z = H / 'zdroj' / 'senat'; Z.mkdir(parents=True, exist_ok=True)
def obvod(o):
    f = Z / f'{o}.json'
    if not f.exists():
        u = f'https://volby.gov.cz/appdata/senat/20261009/vysled/obvod/{o}.json'
        f.write_bytes(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 DataTimes'})).read())
    return json.loads(f.read_text(encoding='utf-8'))
def jm(n):  # "Vrána Petr Ing." -> "Petr Vrána"
    t = [x for x in n.split() if '.' not in x and x not in ('MBA', 'MHA', 'DiS', 'et')]
    return ' '.join(t[1:] + t[:1])
# Vládní partneři ANO: SPD (i v koalicích SPD+PRO, Svobodní+SPD+Trikolóra). Motoristé nikoho nenavrhli (kontrola níž).
def partner(r): return 'SPD' in (r[2] or '') or 'SPD' in (r[3] or '')
def ano(r): return r[3] == 'ANO'

vse = {o: obvod(o) for o in range(3, 82, 3)}
moto = [r for d in vse.values() for r in d['vysledky'] if 'Motorist' in (r[2] or '') + (r[3] or '')]
p('Kandidáti Motoristů:', len(moto))
duely = []
for o, d in vse.items():
    pr = {x[0]: x for x in d['prehled']}
    if 2 not in pr: continue
    a, b = [r for r in d['vysledky'] if r[0] in d['postupuje']]
    w, l = (a, b) if a[7] > b[7] else (b, a)
    duely.append(dict(o=o, nazev=d['obvodNazev'], w=w, l=l, u1=pr[1][6], u2=pr[2][6], ob1=pr[1][5], ob2=pr[2][5],
                      spd=sum(r[5] for r in d['vysledky'] if partner(r) and r[0] not in d['postupuje'])))
p('Obvodů se 2. kolem:', len(duely))

def zmena(sel, nazev):
    s1 = sum(r[5] for r in sel); s2 = sum(r[7] for r in sel)
    p(f'  {nazev:22s} n={len(sel):2d}  ztratilo hlasy {sum(r[7] < r[5] for r in sel):2d}  {s1} -> {s2} ({(s2 - s1) / s1 * 100:+.1f} %)')
p('\nZměna hlasů finalistů mezi koly')
zmena([x['w'] for x in duely], 'vítězové')
zmena([x['l'] for x in duely], 'poražení')
zmena([r for x in duely for r in (x['w'], x['l']) if ano(r)], 'kandidáti ANO')
zmena([r for x in duely for r in (x['w'], x['l']) if not ano(r)], 'ostatní finalisté')
ob1 = sum(x['ob1'] for x in duely); ob2 = sum(x['ob2'] for x in duely)
p(f'  vydané obálky ve 22 obvodech: {ob1} -> {ob2} (2. kolo = {ob2 / ob1 * 100:.0f} % prvního)')

p('\nSouboje s kandidátem ANO: kolik hlasů chybělo a kolik měla SPD v 1. kole')
ano_duely = []
for x in duely:
    if not (ano(x['w']) or ano(x['l'])): continue
    an, op = (x['w'], x['l']) if ano(x['w']) else (x['l'], x['w'])
    gap = op[7] - an[7]; ret = x['ob2'] / x['ob1']
    r = dict(o=x['o'], nazev=x['nazev'], ano=jm(an[1]), ano1=an[5], ano2=an[7], souper=jm(op[1]), souper_strana=op[3],
             souper2=op[7], gap=gap, spd=x['spd'], navrat=ret, u1=x['u1'], u2=x['u2'])
    ano_duely.append(r)
    pot = f"potřeba {gap / x['spd'] * 100:.0f} % voličů SPD" if x['spd'] else 'SPD nekandidovala'
    p(f"  {x['o']:2d} {x['nazev']:17s} {r['ano']:24s} {an[5]:6d}->{an[7]:6d} ({(an[7] - an[5]) / an[5] * 100:+.0f} %)  chybělo {gap:6d}  SPD {x['spd']:5d}  {pot}  "
      f"| účast {x['u1']:.1f} -> {x['u2']:.1f} %, 2. kolo přišlo {ret * 100:.0f} % voličů 1. kola"
      f" | soupeř {jm(op[1])} {op[5]}->{op[7]} ({op[7] - op[5]:+d}, {(op[7] - op[5]) / op[5] * 100:+.0f} %)")
nestaci = [r for r in ano_duely if r['spd'] < r['gap']]
p(f"  ANO vyhrálo: {sum(r['gap'] < 0 for r in ano_duely)} z {len(ano_duely)};  ani všichni voliči SPD by nestačili v {len(nestaci)} z {len(ano_duely)}")
p(f"  ANO ztratilo celkem {sum(r['ano1'] - r['ano2'] for r in ano_duely)} hlasů, SPD měla v těchto obvodech v 1. kole {sum(r['spd'] for r in ano_duely)}")

p('\nSoučet hlasů 1. kola ANO + SPD proti nejsilnějšímu jinému kandidátovi (společná kandidátka, horní odhad)')
for o, d in vse.items():
    V = d['vysledky']; s = sum(r[5] for r in V if ano(r) or partner(r))
    best = max((r for r in V if not (ano(r) or partner(r))), key=lambda r: r[5])
    if s > best[5]: p(f"  {o:2d} {d['obvodNazev']:17s} ANO+SPD {s} > {jm(best[1])} ({best[3]}) {best[5]}")

# ---------- 2) Krajská města ----------
KV = Path(sys.argv[1]) if len(sys.argv) > 1 else H / 'kv'
DIRS = {2014: 'KV2014_reg_20230224_csv', 2018: 'KV2018_reg_20230224_csv',
        2022: 'KV2022reg20260328_csv', 2026: 'KV2026reg20261011_csv'}
MESTA = {'554782': 'Praha', '582786': 'Brno', '554821': 'Ostrava', '554791': 'Plzeň',
         '563889': 'Liberec', '500496': 'Olomouc', '544256': 'České Budějovice',
         '569810': 'Hradec Králové', '555134': 'Pardubice', '554804': 'Ústí nad Labem',
         '585068': 'Zlín', '554961': 'Karlovy Vary', '586846': 'Jihlava'}
import io, zipfile
ZIPY = {2014: 'kv2014/KV2014_reg_20230224_csv.zip', 2018: 'kv2018/KV2018_reg_20230224_csv.zip',
        2022: 'kv2022/KV2022reg20260328_csv.zip', 2026: 'kv2026/KV2026reg20261011_csv.zip'}
for rok, dd in DIRS.items():  # chybějící registr stáhnout z https://volby.gov.cz/opendata/ (kv/ je v .gitignore)
    if not (KV / dd / 'csv_od' / 'kvros.csv').exists():
        u = 'https://volby.gov.cz/opendata/' + ZIPY[rok]
        z = zipfile.ZipFile(io.BytesIO(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 DataTimes'})).read()))
        z.extractall(KV / dd)
mesta = defaultdict(dict)
for rok, dd in DIRS.items():
    rows = defaultdict(list)
    with open(KV / dd / 'csv_od' / 'kvros.csv', encoding='utf-8') as f:
        for r in csv.DictReader(f):
            if r['KODZASTUP'] in MESTA: rows[r['KODZASTUP']].append(r)
    for kod, rs in rows.items():
        strany = defaultdict(lambda: [0, 0, ''])
        for r in rs:  # součet přes volební obvody podle kandidátky
            s = strany[r['POR_STR_HL'] + '|' + r['NAZEVCELK']]
            s[0] += int(r['HLASY_STR'] or 0); s[1] += int(r['MAND_STR'] or 0); s[2] = r['NAZEVCELK']
        tot = sum(v[0] for v in strany.values())
        por = sorted(strany.values(), key=lambda v: -v[0])
        if rok == 2026 and MESTA[kod] == 'Ústí nad Labem':
            p('Ústí nad Labem 2026, první tři:', [(v[2], round(v[0] / tot * 100, 2), v[1]) for v in por[:3]], 'mandátů celkem', sum(v[1] for v in por))
        i, v = next((i + 1, v) for i, v in enumerate(por) if v[2].upper().startswith('ANO'))
        mesta[MESTA[kod]][rok] = dict(podil=v[0] / tot * 100, mandaty=v[1], poradi=i, kandidatka=v[2])
p('\nANO v krajských městech: podíl hlasů (pořadí, mandáty)')
for m in MESTA.values():
    p(f'  {m:17s}' + ''.join(f"{mesta[m][r]['podil']:6.1f} % ({mesta[m][r]['poradi']}., {mesta[m][r]['mandaty']:2d})" for r in DIRS)
      + f"   2022→2026 {mesta[m][2026]['podil'] - mesta[m][2022]['podil']:+.1f} p. b.")
prum = {r: sum(mesta[m][r]['podil'] for m in MESTA.values()) / len(MESTA) for r in DIRS}
for r in DIRS:
    p(f"  {r}: průměr {prum[r]:.1f} %, mandátů {sum(mesta[m][r]['mandaty'] for m in MESTA.values())}, první místo v {sum(mesta[m][r]['poradi'] == 1 for m in MESTA.values())} městech")
p(f"  změna průměru 2014→18 {prum[2018] - prum[2014]:+.1f}, 2018→22 {prum[2022] - prum[2018]:+.1f}, 2022→26 {prum[2026] - prum[2022]:+.1f} p. b.")
p(f"  ztráta 2022→2026 ve {sum(mesta[m][2026]['podil'] < mesta[m][2022]['podil'] for m in MESTA.values())} z 13; pod rokem 2018 ve {sum(mesta[m][2026]['podil'] < mesta[m][2018]['podil'] for m in MESTA.values())} z 13")
p('  kandidátky s jiným názvem:', sorted({(m, r, mesta[m][r]['kandidatka']) for m in MESTA.values() for r in DIRS if mesta[m][r]['kandidatka'] != 'ANO 2011'}))

(H / 'vystup.txt').write_text('\n'.join(OUT) + '\n', encoding='utf-8')
print('\n'.join(OUT))

# ---------- Grafy (statické SVG pro <HtmlEmbed>) ----------
INK, INK2, MUTED, LIGHT, ACC = '#101432', '#272a59', '#4c4f8e', '#c5c7e6', '#de1743'
F = "font-family='IBM Plex Sans, Arial, sans-serif'"
def wrap(svg, w, h, minw=540):
    return (f"<div style=\"max-width:760px;margin:0 auto;overflow-x:auto;-webkit-overflow-scrolling:touch\">"
            f"<svg role=\"img\" style=\"width:100%;min-width:{minw}px;height:auto;display:block\" viewBox='0 0 {w} {h}' "
            f"preserveAspectRatio='xMidYMid meet' xmlns='http://www.w3.org/2000/svg'>{svg}</svg></div>\n")
G = H.parent / 'grafy'; G.mkdir(exist_ok=True)

# Graf 1: kolik hlasů ANO chybělo × kolik měla SPD v 1. kole; vpravo kolik voličů SPD by muselo volit ANO
# Červená = co ANO chybělo, ink [4] = hlasy SPD; oba pruhy stejně silné, řádky obvodů střídavě podbarvené.
SPDC, BAND = '#8f9dc9', '#e9ecf4'  # brandInk [4] a [0] z ThemeProvider.tsx
rows = sorted(ano_duely, key=lambda r: r['gap'])
W, X0, X1, RH, TOP, BH = 600, 118, 360, 40, 58, 12
mx = max(max(r['gap'], r['spd']) for r in rows)
sx = lambda v: X0 + v / mx * (X1 - X0)
# Legenda v jednom řádku vpravo nahoře, pod ní nadpis pravého sloupce
def leg(x, col, txt): return (f"<rect x='{x}' y='5' width='11' height='11' rx='2' fill='{col}'/>"
                              f"<text x='{x + 17}' y='15' {F} font-size='13' fill='{INK}'>{txt}</text>")
s = (leg(W - 452, ACC, 'Chybělo kandidátovi ANO k výhře') + leg(W - 200, SPDC, 'Hlasy SPD v 1. kole')
     + f"<line x1='0' y1='27' x2='{W}' y2='27' stroke='{BAND}' stroke-width='1'/>"
     + f"<text x='{W - 2}' y='{TOP - 10}' text-anchor='end' {F} font-size='12' font-weight='600' fill='{MUTED}'>Kolik voličů SPD by muselo volit ANO</text>")
for i, r in enumerate(rows):
    y = TOP + i * RH
    if i % 2 == 0: s += f"<rect x='0' y='{y}' width='{W}' height='{RH}' fill='{BAND}'/>"
    ok = 0 < r['gap'] <= r['spd']
    s += f"<text x='{X0 - 10}' y='{y + RH / 2 + 4}' text-anchor='end' {F} font-size='13' font-weight='{700 if ok else 400}' fill='{INK}'>{r['nazev']}</text>"
    s += f"<rect x='{X0}' y='{y + 7}' width='{sx(r['gap']) - X0:.1f}' height='{BH}' fill='{ACC}'/>"
    s += f"<text x='{sx(r['gap']) + 5:.1f}' y='{y + 7 + BH - 2}' {F} font-size='11' font-weight='700' fill='{ACC}'>{cz(r['gap'])}</text>"
    if r['spd']:
        s += f"<rect x='{X0}' y='{y + 7 + BH + 2}' width='{sx(r['spd']) - X0:.1f}' height='{BH}' fill='{SPDC}'/>"
        s += f"<text x='{sx(r['spd']) + 5:.1f}' y='{y + 7 + 2 * BH}' {F} font-size='11' fill='{MUTED}'>{cz(r['spd'])}</text>"
        txt = f"{r['gap'] / r['spd'] * 100:.0f} %" if ok else 'nestačí ani 100 %'
    else:
        s += f"<text x='{X0 + 4}' y='{y + 7 + 2 * BH}' {F} font-size='11' fill='{MUTED}'>SPD nekandidovala</text>"
        txt = '–'
    s += f"<text x='{W - 2}' y='{y + RH / 2 + 4}' text-anchor='end' {F} font-size='12' font-weight='{700 if ok else 400}' fill='{INK if ok else MUTED}'>{txt}</text>"
s += f"<line x1='{X0}' y1='{TOP}' x2='{X0}' y2='{TOP + len(rows) * RH}' stroke='{INK}' stroke-width='1.5'/>"
(G / 'spd-vyzva.html').write_text(wrap(s, W, TOP + len(rows) * RH + 4), encoding='utf-8')

# Graf 2: ANO v krajských městech 2018 / 2022 / 2026
order = sorted(MESTA.values(), key=lambda m: mesta[m][2026]['podil'] - mesta[m][2022]['podil'])
W, X0, X1, RH, TOP = 600, 140, 520, 26, 50
sx = lambda v: X0 + v / 40 * (X1 - X0)
s = ''
for v in (0, 10, 20, 30, 40):
    s += f"<line x1='{sx(v):.1f}' y1='{TOP - 8}' x2='{sx(v):.1f}' y2='{TOP + 14 * RH}' stroke='#e6e7f2' stroke-width='1'/>"
    s += f"<text x='{sx(v):.1f}' y='{TOP + 14 * RH + 16}' text-anchor='middle' {F} font-size='12' fill='{MUTED}'>{v} %</text>"
leg = [(2018, 'none', MUTED), (2022, LIGHT, LIGHT), (2026, INK2, INK2)]
for k, (rok, fill, stroke) in enumerate(leg):
    lx = X0 + k * 90
    s += f"<circle cx='{lx + 6}' cy='14' r='6' fill='{fill}' stroke='{stroke}' stroke-width='2'/><text x='{lx + 18}' y='19' {F} font-size='13' fill='{MUTED}'>{rok}</text>"
s += f"<text x='{W - 4}' y='19' text-anchor='end' {F} font-size='12' fill='{MUTED}'>2026</text>"
radky = [('průměr 13 měst', {r: prum[r] for r in DIRS}, True)] + [(m, {r: mesta[m][r]['podil'] for r in DIRS}, False) for m in order]
for i, (m, v, bold) in enumerate(radky):
    y = TOP + i * RH + (8 if i else 0)
    up = v[2026] > v[2022]
    s += f"<text x='{X0 - 10}' y='{y + 5}' text-anchor='end' {F} font-size='13' font-weight='{700 if bold or up else 400}' fill='{ACC if up else INK}'>{m}</text>"
    s += f"<line x1='{sx(v[2022]):.1f}' y1='{y}' x2='{sx(v[2026]):.1f}' y2='{y}' stroke='{ACC if up else MUTED}' stroke-width='2'/>"
    s += f"<circle cx='{sx(v[2018]):.1f}' cy='{y}' r='5' fill='none' stroke='{MUTED}' stroke-width='1.5'/>"
    s += f"<circle cx='{sx(v[2022]):.1f}' cy='{y}' r='6' fill='{LIGHT}'/>"
    s += f"<circle cx='{sx(v[2026]):.1f}' cy='{y}' r='6' fill='{ACC if up else INK2}'/>"
    s += f"<text x='{W - 4}' y='{y + 4}' text-anchor='end' {F} font-size='12' font-weight='700' fill='{ACC if up else INK}'>{cz(v[2026], 1)} %</text>"
    if i == 0:
        s += f"<line x1='{X0 - 120}' y1='{y + RH / 2 + 3}' x2='{X1}' y2='{y + RH / 2 + 3}' stroke='{LIGHT}' stroke-width='1'/>"
(G / 'mesta.html').write_text(wrap(s, W, TOP + 14 * RH + 26), encoding='utf-8')
print('grafy:', sorted(x.name for x in G.iterdir()))
