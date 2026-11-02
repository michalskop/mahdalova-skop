# Podklad pro motiv coveru: obce Srbska (bez Kosova) s vedoucí listinou podle predikce.
#
# Vstup:  ../../volby-srbsko-2026-10-25-predikce/_data_pipeline/data/latest.json (geografie živého modelu, 191 jednotek RIK)
#         geoBoundaries SRB ADM2 (OpenStreetMap / Wambacher, ODbL 1.0, stav 2017, 145 obcí a měst),
#         staženo 29. 10. 2026 z https://www.geoboundaries.org/api/current/gbOpen/SRB/ADM2/
#         do Desktop/datatimes/statisticka-data/srbsko/geo/ (mimo git).
#         geoBoundaries XKX ADM2 (Kosovo, 38 obcí, OpenStreetMap / Wambacher, CC BY-SA 2.0, stav 2017),
#         staženo 29. 10. 2026 z https://www.geoboundaries.org/api/current/gbOpen/XKX/ADM2/
#         do Desktop/datatimes/statisticka-data/kosovo/geo/ (mimo git).
# Výstup: obce.json = {obrys: [polygony obcí Srbska], kosovo: [vnější hranice Kosova],
#                      obce: [[lon, lat, zapsaní, vede, kosovo 0/1], …]}  souřadnice zaokrouhlené
#
# RIK dělí některá města na městské obce (Bělehrad 17, Niš 5, Požarevac + Kostolac, Užice + Sevojno);
# ty kreslíme jako samostatná kolečka kolem těžiště města (rozmístěná do kruhu, poloha je jen orientační).
# Kosovo: RIK vykazuje 22 jednotek podle předválečného členění obcí. Volilo se v nich jen podle zápisu: Priština
# volby v Kosovu nepovolila a ~100 tisíc voličů ze srbských seznamů hlasovalo na 60 místech ve Vranji, Rašce,
# Kuršumliji a Tutinu (N1/Beta 5. 10. 2026). Kolečka kreslíme v kosovské obci zápisu, odlišně (příznak kosovo=1),
# a Kosovo jako samostatné území s vlastní hranicí. Zahraničí a věznice v mapě nejsou.
import json, math, os, sys, unicodedata
sys.stdout.reconfigure(encoding="utf-8")

HERE = os.path.dirname(os.path.abspath(__file__))
GEO = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Desktop/datatimes/statisticka-data/srbsko/geo/geoBoundaries-SRB-ADM2_simplified.geojson')
GEO_XK = os.path.expanduser('~/Desktop/datatimes/statisticka-data/kosovo/geo/geoBoundaries-XKX-ADM2_simplified.geojson')
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
        obce.append([round(a, 4), round(b, 4), x['registered'], x['projected_leader'], 0])

# ---- Kosovo: jednotky RIK (srbské názvy, staré členění) → dnešní kosovské obce ----
xk = json.load(open(GEO_XK, encoding='utf-8'))
xk_shapes = {f['properties']['shapeName'].replace('Municipality of ', ''): f for f in xk['features']}
XK = {'Kosovska Mitrovica': 'North Mitrovica', 'Priština': 'Pristina', 'Leposavić': 'Leposaviq', 'Gnjilane': 'Gjilan',
      'Gora': 'Dragash', 'Kosovska Kamenica': 'Kamenica', 'Štrpce': 'Shtërpcë', 'Zvečan': 'Zveçan', 'Lipljan': 'Lipjan',
      'Zubin Potok': 'Zubin Potok', 'Kosovo Polje': 'Fushë Kosovë', 'Obilić': 'Obiliq', 'Vučitrn': 'Vushtrri',
      'Prizren': 'Prizren', 'Uroševac': 'Ferizaj', 'Vitina': 'Viti', 'Istok': 'Istog', 'Peć': 'Peja',
      'Novo Brdo': 'Novobërdë', 'Orahovac': 'Rahovec', 'Klina': 'Klina', 'Srbica': 'Skenderaj'}
kos = [x for x in latest['geography'] if x['region'] == 'Kosovo i Metohija']
assert sorted(x['municipality_name'] for x in kos) == sorted(XK), sorted(x['municipality_name'] for x in kos)
for x in kos:
    lon, lat = centroid(xk_shapes[XK[x['municipality_name']]]['geometry'])
    obce.append([round(lon, 4), round(lat, 4), x['registered'], x['projected_leader'], 1])

# vnější hranice Kosova: hrany, které patří jen jedné obci (sousední obce sdílejí stejné vrcholy)
from collections import Counter as _C
key = lambda c: (round(c[0], 5), round(c[1], 5))
hrany = _C()
for f in xk['features']:
    g = f['geometry']
    for p in (g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]):
        r = [key(c) for c in p[0]]
        for a, b in zip(r, r[1:]):
            if a != b:
                hrany[frozenset((a, b))] += 1
vnejsi = [tuple(e) for e, n in hrany.items() if n == 1]
soused = {}
for a, b in vnejsi:
    soused.setdefault(a, []).append(b); soused.setdefault(b, []).append(a)
kosovo, videno = [], set()
for start in list(soused):
    if start in videno:
        continue
    ring, cur, prev = [start], start, None
    videno.add(start)
    while True:
        nxt = [n for n in soused[cur] if n != prev and n not in videno]
        if not nxt:
            break
        prev, cur = cur, nxt[0]
        videno.add(cur); ring.append(cur)
    if len(ring) > 20:
        kosovo.append([[round(a, 3), round(b, 3)] for a, b in ring + [ring[0]]])

obrys = []
for f in geo['features']:
    g = f['geometry']
    polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
    for p in polys:
        obrys.append([[round(c[0], 3), round(c[1], 3)] for c in p[0]])
json.dump({'obrys': obrys, 'kosovo': kosovo, 'obce': obce}, open(os.path.join(HERE, 'obce.json'), 'w', encoding='utf-8'), separators=(',', ':'))
print(len(obce), 'koleček,', len(obrys), 'polygonů Srbska, hranice Kosova:', [len(r) for r in kosovo])
