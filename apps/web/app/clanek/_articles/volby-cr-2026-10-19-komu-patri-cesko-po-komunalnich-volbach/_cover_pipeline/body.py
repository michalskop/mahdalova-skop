"""Body pro cover: každá obec jako kolečko velké podle počtu obyvatel, barva podle toho, jestli v zastupitelstvu
mají většinu křesel nezávislí (výstup ../_data_pipeline/obce_2026.json z build.py).

Poloha = těžiště největší části obce z geometrie článku volby-cr-2026-09-24-mista-kde-neexistuje-politicka-konkurence
(topojson v S-JTSK). S-JTSK se na zeměpisné souřadnice převádí přibližně: polynomem 2. stupně nafitovaným na 140 měst
se známou polohou (obce-mapa.json z článku o predikci). Pro tečkovou ilustraci stačí (odchylka u referenčních měst do 0,034°, zhruba 3 km).
Výstup: body.json ([{lon, lat, p, nk}]), spuštění: python body.py
"""
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

HERE = Path(__file__).parent
ART = HERE.parent
GEO = ART.parent / 'volby-cr-2026-09-24-mista-kde-neexistuje-politicka-konkurence' / 'obce-geo.json'
MESTA = ART.parent / 'volby-cr-2026-10-10-senat-komunalni-2026-predikce' / 'obce-mapa.json'

obce = json.loads((ART / '_data_pipeline' / 'obce_2026.json').read_text(encoding='utf-8'))
topo = json.loads(GEO.read_text(encoding='utf-8'))
tr = topo['transform']
arcs = []
for arc in topo['arcs']:
    x = y = 0
    pts = []
    for p in arc:
        x += p[0]; y += p[1]
        pts.append((x * tr['scale'][0] + tr['translate'][0], y * tr['scale'][1] + tr['translate'][1]))
    arcs.append(pts)


def ring(ix):
    out = []
    for i in ix:
        a = arcs[i] if i >= 0 else arcs[~i][::-1]
        out.extend(a if not out else a[1:])
    return out


def centroid(pts):
    a = cx = cy = 0.0
    for (x0, y0), (x1, y1) in zip(pts, pts[1:] + pts[:1]):
        f = x0 * y1 - x1 * y0
        a += f; cx += (x0 + x1) * f; cy += (y0 + y1) * f
    if abs(a) < 1e-9:
        return sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts), 0
    return cx / (3 * a), cy / (3 * a), abs(a) / 2


stred = {}
for g in topo['objects']['obce']['geometries']:
    polys = [g['arcs']] if g['type'] == 'Polygon' else g['arcs']
    stred[str(g.get('id') or g['properties']['id'])] = max((centroid(ring(p[0])) for p in polys), key=lambda c: c[2])[:2]

# --- přibližný převod S-JTSK → lon/lat: nejmenší čtverce, polynom 2. stupně ---
def terms(x, y):
    x, y = x / 1e5, y / 1e5
    return [1, x, y, x * x, x * y, y * y]


def solve(A, b):
    n = len(A)
    M = [row[:] + [v] for row, v in zip(A, b)]
    for i in range(n):
        piv = max(range(i, n), key=lambda r: abs(M[r][i]))
        M[i], M[piv] = M[piv], M[i]
        for r in range(n):
            if r != i:
                f = M[r][i] / M[i][i]
                M[r] = [a - f * c for a, c in zip(M[r], M[i])]
    return [M[i][n] / M[i][i] for i in range(n)]


ref = [(stred[m['keys'][0].split('_')[0]], m['lon'], m['lat']) for m in json.loads(MESTA.read_text(encoding='utf-8'))
       if m['keys'][0].split('_')[0] in stred]
X = [terms(*s) for s, _, _ in ref]
XtX = [[sum(r[i] * r[j] for r in X) for j in range(6)] for i in range(6)]
coef = {k: solve(XtX, [sum(r[i] * v for r, v in zip(X, [q[k] for q in ref])) for i in range(6)]) for k in (1, 2)}
conv = lambda x, y: tuple(sum(c * t for c, t in zip(coef[k], terms(x, y))) for k in (1, 2))
err = max(max(abs(conv(*s)[0] - lo), abs(conv(*s)[1] - la)) for s, lo, la in ref)
print('referenčních měst:', len(ref), 'největší odchylka (stupně):', round(err, 4))

body = []
for kod, o in obce.items():
    if kod in stred:
        lon, lat = conv(*stred[kod])
        body.append({'kod': kod, 'lon': round(lon, 4), 'lat': round(lat, 4), 'p': o['p'], 'nk': o['nk'] * 2 > o['m'], 'n': o['n']})
(HERE / 'body.json').write_text(json.dumps(body, ensure_ascii=False), encoding='utf-8')
print('obcí:', len(body), 'z', len(obce), '| většina nezávislých:', sum(b['nk'] for b in body),
      '| obyvatel tam:', sum(b['p'] for b in body if b['nk']), 'z', sum(b['p'] for b in body))
print('kontrola:', [b for b in body if b['n'] in ('Praha', 'Hlavní město Praha', 'Brno', 'Vysoká Lhota')])
