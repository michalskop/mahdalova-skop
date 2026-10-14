"""Body pro cover: obce s SPD a Motoristy na tečkové mapě ČR.

SPD: obce, kde měla zastupitele po volbách 2022 (plná tečka = má je i teď, kroužek = vypadla).
Motoristé: obce, kde letos kandidovali (plná tečka = zvolení, kroužek = nikdo neprošel).
U měst s městskými částmi se sčítá město i části (stejně jako mapa v článku).

Vstupy: ../obce-strany.json (výstup _data_pipeline/build.py) a geometrie obcí
z článku volby-cr-2026-09-24-mista-kde-neexistuje-politicka-konkurence (topojson v S-JTSK).
Výstup: body.json  ([{lon, lat, strana, plna}]), spuštění: python body.py
"""
import json
from pathlib import Path

from pyproj import Transformer

HERE = Path(__file__).parent
ART = HERE.parent
GEO = ART.parent / 'volby-cr-2026-09-24-mista-kde-neexistuje-politicka-konkurence' / 'obce-geo.json'

data = json.loads((ART / 'obce-strany.json').read_text(encoding='utf-8'))['obce']
topo = json.loads(GEO.read_text(encoding='utf-8'))

# ── topojson → absolutní souřadnice oblouků ──
tr = topo.get('transform')
arcs = []
for arc in topo['arcs']:
    x = y = 0
    pts = []
    for p in arc:
        if tr:
            x += p[0]; y += p[1]
            pts.append((x * tr['scale'][0] + tr['translate'][0], y * tr['scale'][1] + tr['translate'][1]))
        else:
            pts.append((p[0], p[1]))
    arcs.append(pts)


def ring(ix):
    out = []
    for i in ix:
        a = arcs[i] if i >= 0 else arcs[~i][::-1]
        out.extend(a if not out else a[1:])
    return out


def centroid(pts):
    """Těžiště polygonu (shoelace); u degenerovaných průměr bodů."""
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
    best = max((centroid(ring(p[0])) for p in polys), key=lambda c: c[2])   # největší část obce
    stred[str(g.get('id') or g['properties']['id'])] = best[:2]

# S-JTSK v geometrii je „East-North“ (záporné souřadnice) → EPSG:5514 → WGS84
to_wgs = Transformer.from_crs('EPSG:5514', 'EPSG:4326', always_xy=True)


def soucet(o, s):
    a = o.get(s, [0, 0, 0, 0])
    m = o.get(s + '_mc')
    return [x + y for x, y in zip(a, m)] if m else a


body = []
for kod, o in data.items():
    if kod not in stred:
        continue
    lon, lat = to_wgs.transform(*stred[kod])
    spd = soucet(o, 'spd')        # [m22, k26, m26, k22]
    aut = soucet(o, 'aut')
    if spd[0]:
        body.append({'lon': round(lon, 4), 'lat': round(lat, 4), 'strana': 'spd', 'plna': spd[2] > 0, 'n': o['n']})
    if aut[1]:
        body.append({'lon': round(lon, 4), 'lat': round(lat, 4), 'strana': 'aut', 'plna': aut[2] > 0, 'n': o['n']})

(HERE / 'body.json').write_text(json.dumps(body, ensure_ascii=False), encoding='utf-8')
for s in ('spd', 'aut'):
    b = [x for x in body if x['strana'] == s]
    print(s, 'obcí:', len(b), 'plných:', sum(x['plna'] for x in b))
pr = next(x for x in body if x['n'] == 'Ostrava')
print('kontrola Ostrava:', pr)
