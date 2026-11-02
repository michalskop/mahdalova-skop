"""Tečky pevnin pro malou zeměkouli na coveru (lokátor: kde leží Izrael a Západní břeh).

Vstup: Natural Earth 1:110m Admin 0 – Countries (public domain),
https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson
Výstup: globus.json = [[lon, lat], …] – body pravidelné sítě (asi 2,2° na povrchu koule), které leží na pevnině.
Spuštění: python -I -X utf8 globus.py <cesta k ne_110m_admin_0_countries.geojson>
"""
import json
import math
import sys
from pathlib import Path

KROK = 2.2


def v_polygonu(x, y, ring):
    uvnitr = False
    j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i][0], ring[i][1]
        xj, yj = ring[j][0], ring[j][1]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            uvnitr = not uvnitr
        j = i
    return uvnitr


def main(cesta):
    g = json.load(open(cesta, encoding='utf-8'))
    polygony = []
    for f in g['features']:
        geo = f['geometry']
        casti = geo['coordinates'] if geo['type'] == 'MultiPolygon' else [geo['coordinates']]
        for p in casti:
            ring = p[0]
            xs, ys = [q[0] for q in ring], [q[1] for q in ring]
            polygony.append((min(xs), max(xs), min(ys), max(ys), ring))
    body = []
    lat = -88.0
    while lat <= 88:
        krok_lon = KROK / max(math.cos(math.radians(lat)), 0.05)
        lon = -180.0
        while lon < 180:
            if any(a <= lon <= b and c <= lat <= d and v_polygonu(lon, lat, r) for a, b, c, d, r in polygony):
                body.append([round(lon, 2), round(lat, 2)])
            lon += krok_lon
        lat += KROK
    Path(__file__).with_name('globus.json').write_text(json.dumps(body), encoding='utf-8')
    print(len(body), 'teček pevniny')


if __name__ == '__main__':
    main(sys.argv[1])
