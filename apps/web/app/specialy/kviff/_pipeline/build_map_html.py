# -*- coding: utf-8 -*-
"""
Sestaví soběstačný HTML soubor s mapou a dashboardem "Odkud přijíždějí filmy".

Vstupy:  countries_map_clean.json  (z clean_countries_map.py)
         land-110m.json            (world-atlas TopoJSON, jen obrys pevniny)
         map_template.html         (šablona s placeholdery)
Výstup:  ../../../public/kviff/mapa-zemi.html

Projekce: equirektangulární, oříznutá na lat <-56, 84> (bez Antarktidy),
stejná pro obrys pevniny i bubliny, takže vše sedí na sebe.
"""

import io
import json
import sys
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

HERE = Path(__file__).parent
DATA = HERE / "countries_map_clean.json"
LAND = HERE / "land-110m.json"
TEMPLATE = HERE / "map_template.html"
OUT = HERE.parents[3] / "public" / "kviff" / "mapa-zemi.html"

# viewBox mapy
W, H = 960, 420
LAT_MAX, LAT_MIN = 84.0, -56.0   # ořez Antarktidy a polárního severu

# celkový počet filmů v katalogu podle ročníku (films.ts, oficiální archiv KVIFF)
FILMS_PER_YEAR = {
    1995: 226, 1996: 251, 1997: 297, 1998: 213, 1999: 247, 2000: 293,
    2001: 282, 2002: 292, 2003: 304, 2004: 235, 2005: 278, 2006: 268,
    2007: 250, 2008: 235, 2009: 232, 2010: 207, 2011: 199, 2012: 218,
    2013: 235, 2014: 245, 2015: 226, 2016: 200, 2017: 207, 2018: 236,
    2019: 177, 2021: 144, 2022: 170, 2023: 185, 2024: 177, 2025: 175,
}

MISSED_YEARS = [1993, 2020]  # festival se nekonal


def project(lon, lat):
    x = (lon + 180.0) / 360.0 * W
    y = (LAT_MAX - lat) / (LAT_MAX - LAT_MIN) * H
    return round(x, 1), round(y, 1)


def decode_topojson_land(topo):
    """Dekóduje delta-kódované arcs a složí MultiPolygon pevniny do SVG path."""
    scale = topo["transform"]["scale"]
    translate = topo["transform"]["translate"]

    arcs = []
    for arc in topo["arcs"]:
        points = []
        x = y = 0
        for dx, dy in arc:
            x += dx
            y += dy
            lon = x * scale[0] + translate[0]
            lat = y * scale[1] + translate[1]
            points.append((lon, lat))
        arcs.append(points)

    def ring_coords(arc_indices):
        coords = []
        for index in arc_indices:
            if index >= 0:
                part = arcs[index]
            else:
                part = list(reversed(arcs[~index]))
            if coords:
                part = part[1:]  # návazné arcs sdílejí krajní bod
            coords.extend(part)
        return coords

    land = topo["objects"]["land"]
    path_parts = []
    for geometry in ([land] if land["type"] != "GeometryCollection"
                     else land["geometries"]):
        polygons = (geometry["arcs"] if geometry["type"] == "MultiPolygon"
                    else [geometry["arcs"]])
        for polygon in polygons:
            for ring in polygon:
                coords = ring_coords(ring)
                # ořez: vynech body mimo lat rozsah (Antarktida zmizí celá,
                # protože všechny její body jsou pod LAT_MIN)
                projected = [project(lon, max(LAT_MIN, min(LAT_MAX, lat)))
                             for lon, lat in coords]
                if all(pt[1] >= H - 0.6 for pt in projected):
                    continue  # celý prstenec pod jižním ořezem
                d = "M" + "L".join(f"{px},{py}" for px, py in projected) + "Z"
                path_parts.append(d)
    return "".join(path_parts)


def main():
    countries = json.loads(DATA.read_text(encoding="utf-8"))
    topo = json.loads(LAND.read_text(encoding="utf-8"))
    land_path = decode_topojson_land(topo)

    # kompaktní payload pro JS (jen co vizualizace potřebuje)
    payload = []
    for c in sorted(countries, key=lambda c: c["key"]):
        x, y = project(c["lon"], c["lat"])
        payload.append({
            "k": c["key"],
            "n": c["country_cs"],
            "x": x, "y": y,
            "c": c["continent"],
            "y0": c["first_year"], "y1": c["last_year"],
            "t": c["total"],
            "cs": c["coprod_share"],
            "cz": c["coprod_cz"],
            "p": c["top_partners"],
            "f": c["sample_films"],
            "yr": {str(y_): v for y_, v in sorted(c["years"].items())},
        })

    html = TEMPLATE.read_text(encoding="utf-8")
    html = html.replace("/*__DATA__*/", json.dumps(payload, ensure_ascii=False,
                                                   separators=(",", ":")))
    html = html.replace("/*__FILMS__*/", json.dumps(FILMS_PER_YEAR,
                                                    separators=(",", ":")))
    html = html.replace("/*__MISSED__*/", json.dumps(MISSED_YEARS))
    html = html.replace("__LAND_PATH__", land_path)
    html = html.replace("__VIEWBOX__", f"0 0 {W} {H}")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(html, encoding="utf-8")
    size_kb = OUT.stat().st_size / 1024
    print(f"Zapsáno: {OUT}  ({size_kb:.0f} kB, {len(payload)} zemí)")


if __name__ == "__main__":
    main()
