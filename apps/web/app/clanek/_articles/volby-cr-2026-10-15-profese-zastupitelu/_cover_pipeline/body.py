"""Body pro cover: obce, kde se z nevolitelného místa do zastupitelstva dostal lékař, veterinář,
ředitel školy nebo knihovnice (../_data_pipeline/vstupy/skoky_cover.csv). Souřadnice = střed obce
z geometrie obcí k článku volby-cr-2026-09-24-mista-kde-neexistuje-politicka-konkurence (obce-geo.json).
Spuštění: python body.py → cover-body.json
"""
import csv
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
HERE = Path(__file__).parent
GEO = HERE.parent.parent / 'volby-cr-2026-09-24-mista-kde-neexistuje-politicka-konkurence' / 'obce-geo.json'

topo = json.loads(GEO.read_text(encoding='utf-8'))
sx, sy = topo['transform']['scale']
tx, ty = topo['transform']['translate']
arcs = []
for a in topo['arcs']:
    x = y = 0
    pts = []
    for dx, dy in a:
        x += dx
        y += dy
        pts.append((x * sx + tx, y * sy + ty))
    arcs.append(pts)


def ring_pts(ring):
    out = []
    for i in ring:
        out.extend(arcs[i] if i >= 0 else arcs[~i][::-1])
    return out


stred = {}
obj = next(iter(topo['objects'].values()))
for g in obj['geometries']:
    polys = g['arcs'] if g['type'] == 'MultiPolygon' else [g['arcs']]
    pts = [p for poly in polys for p in ring_pts(poly[0])]
    if pts:
        xs, ys = [p[0] for p in pts], [p[1] for p in pts]
        stred[str(g.get('id') or g.get('properties', {}).get('id'))] = ((min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2)

# Geometrie je v S-JTSK (Křovák). Pro tečkovou mapu stačí převod afinní transformací napasovanou
# na 140 měst se známou zeměpisnou polohou (obce-mapa.json z článku o predikci); chyba je pod velikost tečky.
mesta = json.loads((HERE.parent.parent / 'volby-cr-2026-10-10-senat-komunalni-2026-predikce' / 'obce-mapa.json').read_text(encoding='utf-8'))
pary = [(stred[m['keys'][0].split('_')[0]], (m['lon'], m['lat'])) for m in mesta if m['keys'][0].split('_')[0] in stred]


def fit(idx):
    # nejmenší čtverce pro lon|lat = a*x + b*y + c (normální rovnice 3×3)
    A = [[0.0] * 3 for _ in range(3)]
    v = [0.0] * 3
    for (x, y), ll in pary:
        f = (x, y, 1.0)
        for i in range(3):
            v[i] += f[i] * ll[idx]
            for j in range(3):
                A[i][j] += f[i] * f[j]
    for i in range(3):  # Gauss
        piv = A[i][i]
        for j in range(i, 3):
            A[i][j] /= piv
        v[i] /= piv
        for k in range(3):
            if k != i:
                m = A[k][i]
                for j in range(i, 3):
                    A[k][j] -= m * A[i][j]
                v[k] -= m * v[i]
    return v


KL, KB = fit(0), fit(1)
err = max(abs(KL[0] * x + KL[1] * y + KL[2] - ll[0]) + abs(KB[0] * x + KB[1] * y + KB[2] - ll[1]) for (x, y), ll in pary)
print('párů', len(pary), 'max. chyba (stupně)', round(err, 3))
stred = {k: (KL[0] * x + KL[1] * y + KL[2], KB[0] * x + KB[1] * y + KB[2]) for k, (x, y) in stred.items()}

rows = list(csv.DictReader(open(HERE.parent / '_data_pipeline' / 'vstupy' / 'skoky_cover.csv', encoding='utf-8')))
body, chybi = [], 0
for r in rows:
    s = stred.get(r['obec_kod'])
    if not s:
        chybi += 1
        continue
    body.append({'lon': round(s[0], 4), 'lat': round(s[1], 4), 'klic': r['klic']})
print('bodů', len(body), 'bez souřadnic', chybi)
(HERE / 'cover-body.json').write_text(json.dumps(body, ensure_ascii=False), encoding='utf-8')
