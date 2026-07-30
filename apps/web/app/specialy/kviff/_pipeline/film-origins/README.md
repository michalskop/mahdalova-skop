# Původ filmů: datová pipeline

Tato složka obsahuje reprodukovatelné zpracování zemí původu filmů pro KVIFF
speciál.

## Struktura

- `prepare-kviff-film-origin-data.mjs` vytváří roční country-presence CSV.
- `prepare-kviff-map-enriched-data.mjs` doplňuje mapová a detailní data.
- `build-kviff-origin-dashboard.mjs` obnoví referenční HTML prototyp.
- `data/` obsahuje verzované výstupy použité při vývoji vizualizace.
- Samostatné metodické poznámky popisují význam polí a omezení dat.

Všechny cesty se odvozují od umístění skriptů, takže pipeline není závislá na
uživatelském profilu ani pracovním adresáři.

## Spuštění

Z kořene repozitáře:

```powershell
node apps/web/app/specialy/kviff/_pipeline/film-origins/prepare-kviff-film-origin-data.mjs
node apps/web/app/specialy/kviff/_pipeline/film-origins/prepare-kviff-map-enriched-data.mjs
node apps/web/app/specialy/kviff/_pipeline/film-origins/build-kviff-origin-dashboard.mjs
```

Poslední příkaz zapisuje referenční výstupy do
`docs/specialy/kviff/prototypes/`. HTML prototyp slouží pro dohledání
návrhových rozhodnutí; produkční implementace je v React komponentách KVIFF
speciálu.
