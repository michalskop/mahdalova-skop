# GeoPackage (geobr / IBGE 2022, MULTIPOLYGON) -> GeoJSON bez externích knihoven
import sqlite3, struct, json, glob, sys, os
src, out = sys.argv[1], sys.argv[2]
def wkb(b, o):
    le = b[o] == 1; e = '<' if le else '>'; o += 1
    t, = struct.unpack_from(e + 'I', b, o); o += 4
    def ring(o):
        n, = struct.unpack_from(e + 'I', b, o); o += 4
        pts = struct.unpack_from(e + 'd' * 2 * n, b, o); o += 16 * n
        return [[round(pts[i], 5), round(pts[i + 1], 5)] for i in range(0, 2 * n, 2)], o
    def poly(o):
        n, = struct.unpack_from(e + 'I', b, o); o += 4; rs = []
        for _ in range(n):
            r, o = ring(o); rs.append(r)
        return rs, o
    if t == 3:
        p, o = poly(o); return {'type': 'Polygon', 'coordinates': p}, o
    if t == 6:
        n, = struct.unpack_from(e + 'I', b, o); o += 4; ps = []
        for _ in range(n):
            o += 1 + 4; p, o = poly(o); ps.append(p)
        return {'type': 'MultiPolygon', 'coordinates': ps}, o
    raise ValueError(t)
feats = []
for f in sorted(glob.glob(os.path.join(src, '*.gpkg'))):
    c = sqlite3.connect(f); t = c.execute('select table_name from gpkg_contents').fetchone()[0]
    for g, code, name, uf in c.execute(f'select geom, code_muni, name_muni, abbrev_state from "{t}"'):
        flags = g[3]; env = (flags >> 1) & 7
        off = 8 + {0: 0, 1: 32, 2: 48, 3: 48, 4: 64}[env]
        geom, _ = wkb(g, off)
        feats.append({'type': 'Feature', 'properties': {'id': str(int(code)), 'uf': uf}, 'geometry': geom})
json.dump({'type': 'FeatureCollection', 'features': feats}, open(out, 'w', encoding='utf-8'))
print(len(feats))
