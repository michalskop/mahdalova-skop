# Podklad pro motiv coveru: obce Srbska (bez Kosova) s vedoucí listinou podle predikce.
#
# Vstup:  ../../volby-srbsko-2026-10-25-predikce/_data_pipeline/data/latest.json (geografie živého modelu, 191 jednotek RIK)
#         geoBoundaries SRB ADM2 (OpenStreetMap / Wambacher, ODbL 1.0, stav 2017, 145 obcí a měst),
#         staženo 29. 10. 2026 z https://www.geoboundaries.org/api/current/gbOpen/SRB/ADM2/
#         do Desktop/datatimes/statisticka-data/srbsko/geo/ (mimo git).
# Výstup: obce.json = {obrys: [polygony obcí, souřadnice na 3 desetinná místa], obce: [[lon, lat, zapsaní, vede], …]}
#
# RIK dělí některá města na městské obce (Bělehrad 17, Niš 5, Požarevac + Kostolac, Užice + Sevojno);
# ty kreslíme jako samostatná kolečka kolem těžiště města (rozmístěná do kruhu, poloha je jen orientační).
# Kosovo (22 jednotek RIK), zahraničí a věznice v mapě nejsou.
import json, math, os, sys, unicodedata
sys.stdout.reconfigure(encoding="utf-8")

HERE = os.path.dirname(os.path.abspath(__file__))
GEO = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Desktop/datatimes/statisticka-data/srbsko/geo/geoBoundaries-SRB-ADM2_simplified.geojson')
latest = json.load(open(os.path.join(HERE, '..', '..', 'volby-srbsko-2026-10-25-predikce', '_data_pipeline', 'data', 'latest.json'), encoding='utf-8'))
geo = json.load(open(GEO, encoding='utf-8'))

def norm(s):
    s = s.replace('đ', 'dj').replace('Đ', 'Dj')
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    for suf in (' Municipality', ' City', ' Municipal*'):
        s = s.replace(suf, '')
    return s.replace('-', ' ').lower().strip()

def ring_centroid(ring):
    a = cx = cy = 0
    for (x0, y0), (x1, y1) in zip(ring, ring[1:]):
        f = x0 * y1 - x1 * y0
        a += f; cx += (x0 + x1) * f; cy += (y0 + y1) * f
    return (cx / (3 * a), cy / (3 * a), abs(a) / 2) if a else (ring[0][0], ring[0][1], 0)

def centroid(geom):
    polys = geom['coordinates'] if geom['type'] == 'MultiPolygon' else [geom['coordinates']]
    best = max((ring_centroid(p[0]) for p in polys), key=lambda c: c[2])   # těžiště největší části
    return best[0], best[1]

shapes = {norm(f['properties']['shapeName']): f for f in geo['features']}
PARENT = {'Beograd': 'belgrade', 'Kostolac': 'pozarevac', 'Sevojno': 'uzice'}
NIS = {'Crveni Krst', 'Medijana', 'Niška Banja', 'Palilula (Niš)', 'Pantelej'}
groups, missing = {}, []
for x in latest['geography']:
    if x['region'] in ('Kosovo i Metohija', 'Inostranstvo', 'Zatvori'):
        continue
    n = x['municipality_name']
    key = 'belgrade' if x['region'] == 'Beograd' else 'nis' if n in NIS else PARENT.get(n, norm(n))
    if key not in shapes:
        missing.append(n); continue
    groups.setdefault(key, []).append(x)
assert not missing, missing
nepouzite = sorted(set(shapes) - set(groups))
assert not nepouzite, nepouzite

obce = []
for key, xs in groups.items():
    lon, lat = centroid(shapes[key]['geometry'])
    xs = sorted(xs, key=lambda x: -x['registered'])
    if len(xs) == 1:
        pos = [(lon, lat)]
    else:   # městské obce do kruhu kolem těžiště města, největší uprostřed
        R = 0.035 if key != 'belgrade' else 0.075
        pos = [(lon, lat)] + [(lon + R * math.cos(2 * math.pi * i / (len(xs) - 1)) / math.cos(math.radians(lat)),
                               lat + R * math.sin(2 * math.pi * i / (len(xs) - 1))) for i in range(len(xs) - 1)]
    for x, (a, b) in zip(xs, pos):
        obce.append([round(a, 4), round(b, 4), x['registered'], x['projected_leader']])

obrys = []
for f in geo['features']:
    g = f['geometry']
    polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
    for p in polys:
        obrys.append([[round(c[0], 3), round(c[1], 3)] for c in p[0]])
json.dump({'obrys': obrys, 'obce': obce}, open(os.path.join(HERE, 'obce.json'), 'w', encoding='utf-8'), separators=(',', ':'))
print(len(obce), 'koleček,', len(obrys), 'polygonů')
