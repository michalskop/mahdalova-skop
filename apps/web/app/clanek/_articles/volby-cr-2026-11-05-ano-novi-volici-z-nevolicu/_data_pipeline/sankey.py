# N-17 · Přesuny voličů 2021 → 2025 (sněmovní volby), data Michal (zásilka Úschovna, 4. 11. 2026).
# Vstup: ../N-17-sankey-data/sankey_region_NN_*.csv (Volby 2021, Volby 2025, Přesuny) – jen čtení.
# Výstup: sankey.html (ČR celkem + výběr kraje, stínované toky jako u koalic 4. 11.), souhrn.txt.
# Spuštění: python -I -X utf8 sankey.py
import csv, glob, html, os
from collections import defaultdict

H = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(H, '..', 'N-17-sankey-data')
KRAJE = ['Hlavní město Praha', 'Středočeský', 'Jihočeský', 'Plzeňský', 'Karlovarský', 'Ústecký', 'Liberecký',
         'Královéhradecký', 'Pardubický', 'Vysočina', 'Jihomoravský', 'Olomoucký', 'Zlínský', 'Moravskoslezský']
BARVY = {'ANO': '#272a59', 'SPOLU': '#5e66d5', 'PirSTAN': '#7a1f33', 'STAN': '#ff1a4a', 'Piráti': '#111111',
         'SPD': '#a47d03', 'Motoristé': '#1a9fbd', 'Stačilo!': '#c5143c', 'SOCDEM': '#f76800', 'KSČM': '#c5143c',
         'Přísaha': '#a9b5f0', 'Ostatní': '#c3c6d8', 'Nevoliči': '#dfe1ea'}
L_PORADI = ['ANO', 'SPOLU', 'PirSTAN', 'SPD', 'SOCDEM', 'KSČM', 'Přísaha', 'Ostatní', 'Nevoliči']
R_PORADI = ['ANO', 'SPOLU', 'STAN', 'Piráti', 'SPD', 'Motoristé', 'Stačilo!', 'Ostatní', 'Nevoliči']

kraje = {}
for i, k in enumerate(KRAJE, 1):
    f = glob.glob(os.path.join(DATA, f'sankey_region_{i:02d}_*.csv'))
    assert len(f) == 1, (i, f)
    toky = defaultdict(int)
    for r in csv.DictReader(open(f[0], encoding='utf-8-sig')):
        toky[(r['Volby 2021'].strip(), r['Volby 2025'].strip())] += int(float(r['Přesuny']))
    kraje[k] = dict(toky)
cr = defaultdict(int)
for t in kraje.values():
    for k, v in t.items():
        cr[k] += v
VSE = {'Česko celkem': dict(cr), **kraje}

nezname = {s for t in VSE.values() for (s, _) in t if s not in L_PORADI} | {d for t in VSE.values() for (_, d) in t if d not in R_PORADI}
assert not nezname, nezname

fmt = lambda v: f'{v:,}'.replace(',', ' ')


def svg(nazev, toky, idx):
    W, LW, RW, GAP, NW, HMAX = 520, 130, 140, 10, 9, 560
    out_l = {s: sum(v for (a, _), v in toky.items() if a == s) for s in L_PORADI}
    in_r = {d: sum(v for (_, b), v in toky.items() if b == d) for d in R_PORADI}
    ls = [s for s in L_PORADI if out_l[s]]
    rs = [d for d in R_PORADI if in_r[d]]
    total = sum(toky.values())
    K = (HMAX - GAP * (max(len(ls), len(rs)) - 1)) / total
    x0, x1 = LW, W - RW
    def poz(seznam, vel):
        y, o = 0, {}
        for s in seznam:
            o[s] = y
            y += vel[s] * K + GAP
        return o, y - GAP
    yl, hl = poz(ls, out_l)
    yr, hr = poz(rs, in_r)
    Hc = max(hl, hr)
    offl, offr = dict(yl), dict(yr)
    defs, cesty = [], []
    cx = (x0 + NW + x1) / 2
    for s in ls:
        for d in rs:
            v = toky.get((s, d), 0)
            if not v:
                continue
            h = v * K
            a0, b0 = offl[s], offr[d]
            offl[s] += h; offr[d] += h
            gid = f'g{idx}_{len(cesty)}'
            defs.append(f'<linearGradient id="{gid}" gradientUnits="userSpaceOnUse" x1="{x0 + NW}" y1="0" x2="{x1}" y2="0">'
                        f'<stop offset="0" stop-color="{BARVY[s]}"/><stop offset="0.5" stop-color="#b9bccb"/>'
                        f'<stop offset="1" stop-color="{BARVY[d]}"/></linearGradient>')
            dd = (f"M{x0 + NW},{a0:.1f} C{cx},{a0:.1f} {cx},{b0:.1f} {x1},{b0:.1f} L{x1},{b0 + h:.1f} "
                  f"C{cx},{b0 + h:.1f} {cx},{a0 + h:.1f} {x0 + NW},{a0 + h:.1f} Z")
            op = 0.7 if 'ANO' in (s, d) and s != d else 0.38
            popis = f'{s} 2021 → {d} 2025: asi {fmt(v)} voličů'
            cesty.append(f'<path d="{dd}" fill="url(#{gid})" fill-opacity="{op}" class="l" data-s="{s}" data-t="{d}" '
                         f'data-v="{fmt(v)}"><title>{html.escape(popis)}</title></path>')
    uzly = []
    c = '<tspan class="c" font-weight="400" fill="#55597a"></tspan>'
    for side, seznam, ys, vel, x in (('L', ls, yl, out_l, x0), ('R', rs, yr, in_r, x1)):
        for s in seznam:
            h = max(vel[s] * K, 2)
            tw = 700 if s == 'ANO' else 600
            tx = x - 8 if side == 'L' else x + NW + 8
            anc = ' text-anchor="end"' if side == 'L' else ''
            txt = (f'<text x="{tx}" y="{ys[s] + h / 2:.1f}"{anc} dominant-baseline="middle" font-weight="{tw}">{s}{c}'
                   f' <tspan font-weight="400" font-size="12.5" fill="#55597a">{fmt(round(vel[s], -3))}</tspan></text>')
            uzly.append(f'<g class="n" data-n="{s}" data-side="{side}" role="button" tabindex="0" aria-label="Zvýraznit: {s}">'
                        f'<rect x="{x}" y="{ys[s]:.1f}" width="{NW}" height="{h:.1f}" fill="{BARVY[s]}"/>{txt}</g>')
    hlav = (f'<text x="{x0 + NW / 2}" y="-14" text-anchor="middle" font-size="13" fill="#55597a">2021</text>'
            f'<text x="{x1 + NW / 2}" y="-14" text-anchor="middle" font-size="13" fill="#55597a">2025</text>')
    return (f'<svg data-kraj="{html.escape(nazev)}" viewBox="-4 -30 {W + 8} {Hc + 50:.0f}" width="100%" role="img" '
            f'xmlns="http://www.w3.org/2000/svg" aria-label="Sankeyův diagram přesunů voličů mezi sněmovními volbami 2021 a 2025: {html.escape(nazev)}" '
            f'style="font-family:IBM Plex Sans,Arial,sans-serif;font-size:15px;fill:#101432;display:{"block" if idx == 0 else "none"};max-width:560px;margin:0 auto">'
            f'<defs>{"".join(defs)}</defs>{hlav}{"".join(cesty)}{"".join(uzly)}</svg>')


CSS = ('.dt-sankey .l{transition:fill-opacity .2s}.dt-sankey .n{cursor:pointer;transition:opacity .2s}.dt-sankey .n:focus{outline:none}'
       '.dt-sankey svg:not(.sel) .l:hover{fill-opacity:.85}.dt-sankey svg.sel .l{fill-opacity:.05}.dt-sankey svg.sel .l.on{fill-opacity:.8}'
       '.dt-sankey svg.sel .n{opacity:.3}.dt-sankey svg.sel .n.on,.dt-sankey svg.sel .n.p{opacity:1}'
       '.dt-sankey select{font:inherit;font-size:15px;padding:4px 8px;margin:0 auto 12px;display:block}')
JS = ("(function(){var w=document.querySelector('.dt-sankey:not([data-init])');if(!w)return;w.setAttribute('data-init','1');"
      "var sel=w.querySelector('select');sel.addEventListener('change',function(){w.querySelectorAll('svg').forEach(function(s){"
      "s.style.display=s.getAttribute('data-kraj')===sel.value?'block':'none'})});"
      "w.querySelectorAll('svg').forEach(function(svg){var cur=null;"
      "function clear(){svg.classList.remove('sel');svg.querySelectorAll('.on,.p').forEach(function(e){e.classList.remove('on','p')});"
      "svg.querySelectorAll('.c').forEach(function(e){e.textContent=''})}"
      "function pick(g){var n=g.getAttribute('data-n'),L=g.getAttribute('data-side')==='L',k=n+'|'+(L?'L':'R');clear();"
      "if(cur===k){cur=null;return}cur=k;svg.classList.add('sel');g.classList.add('on');"
      "svg.querySelectorAll('.l').forEach(function(p){if(p.getAttribute(L?'data-s':'data-t')!==n)return;p.classList.add('on');"
      "var o=p.getAttribute(L?'data-t':'data-s');svg.querySelectorAll('.n[data-side=\"'+(L?'R':'L')+'\"]').forEach(function(og){"
      "if(og.getAttribute('data-n')===o){og.classList.add('p');og.querySelector('.c').textContent=' · '+p.getAttribute('data-v')}})})}"
      "svg.querySelectorAll('.n').forEach(function(g){g.addEventListener('click',function(){pick(g)});"
      "g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(g)}})})})})();")
moznosti = ''.join(f'<option>{html.escape(k)}</option>' for k in VSE)
telo = ''.join(svg(k, t, i) for i, (k, t) in enumerate(VSE.items()))
open(os.path.join(H, 'sankey.html'), 'w', encoding='utf-8').write(
    f'<div class="dt-sankey"><style>{CSS}</style><select aria-label="Kraj">{moznosti}</select>{telo}</div>\n<script>{JS}</script>\n')

# ── Souhrn pro Kateřinu a Xenii ──
o = []
for nazev, t in VSE.items():
    tot = sum(t.values())
    ano_in = {s: v for (s, d), v in t.items() if d == 'ANO' and s != 'ANO'}
    ano_out = {d: v for (s, d), v in t.items() if s == 'ANO' and d != 'ANO'}
    o.append(f'## {nazev} (součet toků {fmt(tot)})')
    o.append(f'ANO udrželo: {fmt(t.get(("ANO", "ANO"), 0))}; přišlo {fmt(sum(ano_in.values()))}, odešlo {fmt(sum(ano_out.values()))}')
    o.append('  do ANO odkud: ' + ', '.join(f'{s} {fmt(v)}' for s, v in sorted(ano_in.items(), key=lambda x: -x[1])))
    o.append('  z ANO kam: ' + ', '.join(f'{d} {fmt(v)}' for d, v in sorted(ano_out.items(), key=lambda x: -x[1])))
    top = sorted(((v, s, d) for (s, d), v in t.items() if s != d), reverse=True)[:6]
    o.append('  největší přesuny: ' + '; '.join(f'{s} → {d} {fmt(v)}' for v, s, d in top))
    o.append('')
open(os.path.join(H, 'souhrn.txt'), 'w', encoding='utf-8').write('\n'.join(o))
print('\n'.join(o[:7]))
print('Zapsáno: sankey.html, souhrn.txt')
