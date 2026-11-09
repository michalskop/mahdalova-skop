# Graf 3 článku volby-cr-2026-11-02-senat-pojistka-demokracie: zákony, které Senát zamítl nebo vrátil, a co s nimi udělala
# Sněmovna, po vládách 1996–2026. Vstup: data/zakony-senat.csv (vyrábí graf3_data.py z otevřených dat PSP ČR) a vlady.py.
# Vládu určuje datum, kdy o návrhu po Senátu hlasovala Sněmovna (u návrhů bez hlasování datum usnesení Senátu).
import csv, os, sys, datetime as dt, collections
sys.stdout.reconfigure(encoding='utf-8')
H = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(H)
sys.path.insert(0, H)
from vlady import VLADY
rows = [r for r in csv.DictReader(open(os.path.join(OUT, 'data', 'zakony-senat.csv'), encoding='utf-8')) if r['datum_senat']]
KONEC = dt.date(2026, 11, 8)
# premiérská období (spojujeme po sobě jdoucí vlády téhož premiéra)
OBD = []
for od, do, prem, strany, kresla, pozn in VLADY:
    od, do = dt.date.fromisoformat(od), min(dt.date.fromisoformat(do), KONEC)
    uredni = not strany
    jm = prem + (' (úřednická)' if uredni else '')
    if OBD and OBD[-1]['jm'] == jm and OBD[-1]['do'] == od: OBD[-1]['do'] = do
    else: OBD.append(dict(jm=jm, od=od, do=do, uredni=uredni))
def obd(d):
    for o in OBD:
        if o['od'] <= d < o['do'] or (d == KONEC and o['do'] == KONEC): return o
KAT = ['přehlasováno', 'verze Senátu', 'nepřijato', 'bez rozhodnutí']
for o in OBD: o['c'] = collections.Counter(); o['zam'] = 0
for r in rows:
    d = dt.date.fromisoformat(r['datum_snemovna'] or r['datum_senat'])
    o = obd(d)
    if o is None: print('mimo vlády', r['datum_senat'], r['nazev']); continue
    o['c'][r['snemovna']] += 1; o['zam'] += r['senat'] == 'zamítnut'
out = []
for o in OBD:
    n = sum(o['c'].values()); let = (o['do'] - o['od']).days / 365.25
    if n == 0: continue
    out.append(dict(vlada=o['jm'], od=o['od'].isoformat(), do=o['do'].isoformat(), let=round(let, 2), celkem=n, zamitnuto=o['zam'], vraceno=n - o['zam'],
                    **{k.replace(' ', '_'): o['c'][k] for k in KAT}, za_rok=round(n / let, 1), prehlasovano_za_rok=round(o['c']['přehlasováno'] / let, 1)))
with open(os.path.join(OUT, 'data', 'zakony-po-vladach.csv'), 'w', encoding='utf-8', newline='') as f:
    w = csv.DictWriter(f, fieldnames=list(out[0])); w.writeheader(); w.writerows(out)
for r in out: print(r)
print('celkem', sum(r['celkem'] for r in out), 'přehlasováno', sum(r['přehlasováno'] for r in out))

NAVY, INK, MUTED, CRIMSON, GRID, LIGHT, GREY = '#272a59', '#101432', '#4c4f8e', '#de1743', '#e2ddcf', '#b9bccf', '#d9d6cc'
BAR = {'přehlasováno': NAVY, 'verze Senátu': LIGHT, 'nepřijato': '#f76800', 'bez rozhodnutí': GREY}
FONT = "font-family='IBM Plex Sans, Arial, sans-serif'"
x0, x1, top, rh = 150, 470, 34, 25
vmax = max(r['celkem'] for r in out)
o = []
o.append(f"<text x='{x1 + 66}' y='{top - 12}' text-anchor='end' {FONT} font-size='11' font-weight='600' fill='{MUTED}'>za rok</text>")
for i, r in enumerate(out):
    y = top + i * rh; hl = i == len(out) - 1
    roky = f"{r['od'][:4]}–{r['do'][:4]}" if r['od'][:4] != r['do'][:4] else r['od'][:4]
    o.append(f"<text x='{x0 - 8}' y='{y + 12}' text-anchor='end' {FONT} font-size='12' font-weight='{700 if hl else 600}' fill='{CRIMSON if hl else INK}'>{r['vlada']}</text>")
    o.append(f"<text x='{x0 - 8}' y='{y + 23}' text-anchor='end' {FONT} font-size='9.5' fill='{MUTED}'>{roky}</text>")
    x = x0
    for k in KAT:
        v = r[k.replace(' ', '_')]
        if not v: continue
        w = (x1 - x0) * v / vmax
        o.append(f"<rect x='{x:.1f}' y='{y + 2}' width='{w:.1f}' height='{rh - 8}' fill='{BAR[k]}'><title>{r['vlada']}: {k} {v}</title></rect>")
        if k == 'přehlasováno' and w > 16:
            o.append(f"<text x='{x + 4:.1f}' y='{y + 15}' {FONT} font-size='10.5' font-weight='700' fill='#fff'>{v}</text>")
        x += w
    o.append(f"<text x='{x + 5:.1f}' y='{y + 15}' {FONT} font-size='11' font-weight='700' fill='{CRIMSON if hl else INK}'>{r['celkem']}</text>")
    o.append(f"<text x='{x1 + 66}' y='{y + 15}' text-anchor='end' {FONT} font-size='11' fill='{CRIMSON if hl else MUTED}'>{str(r['za_rok']).replace('.', ',')}</text>")
ly = top + len(out) * rh + 16
lx = 0
for k, lab in (('přehlasováno', 'Sněmovna přehlasovala'), ('verze Senátu', 'přijala verzi Senátu'), ('nepřijato', 'zákon nepřijala'), ('bez rozhodnutí', 'nerozhodla')):
    o.append(f"<rect x='{lx}' y='{ly - 10}' width='12' height='12' fill='{BAR[k]}'/><text x='{lx + 16}' y='{ly}' {FONT} font-size='11.5' fill='{INK}'>{lab}</text>")
    lx += 16 + len(lab) * 6.3 + 14
o.append(f"<text x='0' y='{ly + 20}' {FONT} font-size='11.5' fill='{MUTED}'>Délka pruhu = zákony, které Senát zamítl nebo vrátil s pozměňovacími návrhy; vpravo průměr za rok vlády.</text>")
W, Hh = 560, ly + 34
svg = (f"<div style=\"max-width:760px;margin:0 auto;overflow-x:auto;-webkit-overflow-scrolling:touch\"><svg role=\"img\" aria-label=\"Zákony zamítnuté nebo vrácené Senátem a jejich osud ve Sněmovně po vládách 1996–2026\" "
       f"style=\"width:100%;min-width:520px;height:auto;display:block\" viewBox='0 0 {W} {Hh}' preserveAspectRatio='xMidYMid meet' xmlns='http://www.w3.org/2000/svg'>{''.join(o)}</svg></div>\n")
os.makedirs(os.path.join(OUT, 'grafy'), exist_ok=True)
open(os.path.join(OUT, 'grafy', 'zakony-senat.html'), 'w', encoding='utf-8').write(svg)
print('zapsáno grafy/zakony-senat.html')
