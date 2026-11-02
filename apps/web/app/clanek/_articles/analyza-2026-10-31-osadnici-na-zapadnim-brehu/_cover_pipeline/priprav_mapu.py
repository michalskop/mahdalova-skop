"""Podklad pro motiv coveru: obrys Západního břehu, osady a outposty.

Vstupy:
- obrys: OCHA COD-AB pro Palestinu (HDX, pse_admin1.geojson, hranice platné od 19. 10. 2023, licence CC BY-IGO),
  https://data.humdata.org/dataset/cod-ab-pse – prvek „West Bank“ (PS01, včetně východního Jeruzaléma);
- body: zdroj/peacenow_settlements_outposts_points_extracted.csv – seznam osad a outpostů Peace Now
  (aktualizace 19. 10. 2026; sloupce lat/lon = WGS84, osady s počtem obyvatel k květnu 2024).

Výstup: mapa.json = {obrys: [[lon, lat], …], osady: [[lon, lat, obyvatel], …], outposty: [[lon, lat, rok], …]}
Spuštění: python -I -X utf8 priprav_mapu.py <cesta k pse_admin1.geojson>
"""
import csv
import json
import sys
from pathlib import Path

TU = Path(__file__).parent


def main(geojson):
    g = json.load(open(geojson, encoding='utf-8'))
    wb = next(f for f in g['features'] if f['properties']['adm1_pcode'] == 'PS01')
    ring = wb['geometry']['coordinates'][0]
    krok = max(1, len(ring) // 600)  # obrys je jen dekorace coveru, stačí ~600 bodů
    obrys = [[round(x, 4), round(y, 4)] for x, y in ring[::krok]]

    osady, outposty = [], []
    for r in csv.DictReader(open(TU / 'zdroj' / 'peacenow_settlements_outposts_points_extracted.csv', encoding='utf-8')):
        if not r['lat'] or not r['lon']:
            continue
        lon, lat = round(float(r['lon']), 4), round(float(r['lat']), 4)
        if r['sheet'] == 'Settlements':
            osady.append([lon, lat, int(float(r['population_latest'] or 0))])
        else:
            outposty.append([lon, lat, int(float(r['year_established'] or 0))])
    json.dump({'obrys': obrys, 'osady': osady, 'outposty': outposty}, open(TU / 'mapa.json', 'w', encoding='utf-8'))
    print(len(obrys), 'bodů obrysu,', len(osady), 'osad,', len(outposty), 'outpostů')


if __name__ == '__main__':
    main(sys.argv[1])
