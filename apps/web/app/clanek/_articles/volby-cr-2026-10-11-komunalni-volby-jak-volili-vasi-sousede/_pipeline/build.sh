#!/usr/bin/env bash
# Mapa „Jak volili vaši sousedé“ – celý postup od zdrojových dat k souborům na webu.
#
# 1) raw/ – ČSÚ open data KV 2026, konečný stav 11. 10. 2026 (https://volby.gov.cz/opendata/kv2026/kv2026_opendata.htm):
#      KV2026_data_20261011_csv.zip, KV2026reg20261011_csv.zip, KV2026ciselniky20261011_csv.zip – rozbalit do stejnojmenných složek
# 2) python stahni_okrsky.py   – hranice okrsků ZO 2026 z GIS ČSÚ → raw/okrsky_zo2026.geojson
# 3) python postav.py          – spojení výsledků s okrsky → raw/okrsky_join.geojson + public/data/kv2026-okrsky/meta/*.json, obce.json
# 4) mapshaper                 – zjednodušení a rozdělení po okresech do jedné TopoJSON → public/data/kv2026-okrsky/okrsky.json
#    (mapshaper přes npx běží v jiném adresáři, proto absolutní cesty; cílová složka musí existovat)
set -euo pipefail
cd "$(dirname "$0")"
RAW=$(cygpath -w "$PWD/raw" 2>/dev/null || echo "$PWD/raw")
mkdir -p raw/topo
npx -y mapshaper@0.6.102 -i "$RAW/okrsky_join.geojson" -simplify 30% keep-shapes -split okres \
  -o "$RAW/topo/" format=topojson quantization=100000
cp raw/topo/okrsky_join.json ../../../../../public/data/kv2026-okrsky/okrsky.json
ls -la ../../../../../public/data/kv2026-okrsky
