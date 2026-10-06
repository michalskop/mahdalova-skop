# Zpracování dat – obce s jedinou kandidátkou (KV 1994–2026)

Skripty běží z jedné pracovní složky; vstupy se stahují zvlášť (nejsou v repu):

1. `d/<rok>/csv/` – otevřená data KV2002–KV2026 z https://volby.gov.cz/opendata/opendata.htm (CSV číselníky + registry)
2. `scrape9x.py 1994|1998` – výsledky obec po obci z https://volby.gov.cz/pls/kv1994/kv a kv1998 → `kv<rok>_raw.json`; `parse9x.py` → `z<rok>.pkl`
3. `load.py` – `zast(y)` = jeden řádek na zastupitelstvo obce (řádný termín, bez MČ); uloženo jako `zast.pkl`
4. `ps/` – PS2025 (a PS2021) data z volby.gov.cz pro srovnání účasti; `zt.pkl` = účast KV podle obcí (`kvt3`)
5. `build.py` – kategorie obcí + `obce-data.json` (mapa) a `serie.csv`
6. `charts.py` – Vega-Lite specy v `data/`
7. `starostove.py` + `mayors.py` – jména starostů ze Seznamu OVM (czechpoint.cz), párování se zvolenými 2022

Geometrie `obce-geo.json`: volební okrsky ČSÚ 2022 (`geo/vol_okrsky_2022g100.zip` u KV2022) sloučené do obcí:
`mapshaper vol_okrsky_2022g100.shp -dissolve Obec -join obec_kraj.csv keys=Obec,Obec -each 'id=String(Obec); delete Obec' -rename-layers obce -simplify 2% keep-shapes -dissolve kraj + name=kraje -filter-fields target=obce id -o format=topojson quantization=10000 id-field=id target=*`
