# Data k článku „Proč vyhrál Lula“ (volby-brazilie-2026-10-26-proc-vyhral-lula)

1. `stahni_tse.py <složka>` – stáhne oficiální výsledky TSE po obcích pro obě kola prezidentských voleb 2026
   (volba 6257 = 1. kolo 4. 10., 6258 = 2. kolo 25. 10.; resultados.tse.jus.br/oficial/ele2026/...). Do složky
   nejdřív ulož `mun6258.json` z `.../ele2026/6258/config/mun-e006258-cm.json` (seznam obcí, kódy TSE a IBGE).
   Staženo 26. 10. 2026 dopoledne, stav 100 % sečteno.
2. `extrahuj_obce.py <složka>` → `obce_tse_2026.csv` (5 757 řádků: 5 570 obcí + 187 měst v zahraničí, uf = ZZ).
3. `build.py` → `vystup.json` (všechna čísla v textu) a `../brazil-obce-data.json` (data mapy).
4. Geometrie `../brazil-obce-geo.json`: hranice obcí IBGE 2022 z balíku geobr (IPEA,
   `ipea.gov.br/geobr/data_gpkg/municipality/2022/*municipality_2022_simplified.gpkg`), převod
   `gpkg2geojson.py`, pak mapshaper 0.6.102:
   `mapshaper -i mun2022.geojson name=mun -filter '!["4300001","4300002"].includes(id)' -simplify 4% weighted keep-shapes -clean -o mun.json format=topojson quantization=1e5`
   a `mapshaper -i mun.json -dissolve uf + name=uf -o brazil-obce-geo.json format=topojson target=* combine-layers quantization=1e5`.
   (4300001/4300002 jsou laguny Lagoa dos Patos a Lagoa Mirim, ne obce.) Přímé API IBGE (servicodados.ibge.gov.br)
   bylo z Česka nedostupné.
