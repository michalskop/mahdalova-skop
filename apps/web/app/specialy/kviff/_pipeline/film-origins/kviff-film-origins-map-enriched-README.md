# KVIFF Map Enriched Data

## Files

- `kviff-film-origins-map-enriched-1992-2026.tsv`: map animation table with cumulative values and continent labels.
- `kviff-film-origin-country-details-1992-2025.json`: detail panel data keyed by country.

## Important

- `Kumulativne` is cumulative production-country appearances by country over time.
- `Kontinent` is intended for map legend/color grouping.
- The TSV also includes popup-ready summary fields: total films, coproductions, Czech coproductions, first/last year, peak year, top coproduction partners, example films, awards and directors.
- The detail JSON is complete for film-level source years 1992-2025.
- Year 2026 remains map-level only here, because the current full 2026 catalogue exists as country aggregates, while the raw film-level scrape contains only a partial sample.
- Awards and directors are kept as explicit fields at the bottom of the panel. They are currently placeholders with methodological notes until a dedicated enrichment step adds reliable film-level awards and director metadata.
