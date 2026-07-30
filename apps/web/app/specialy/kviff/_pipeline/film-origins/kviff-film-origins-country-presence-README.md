# KVIFF Film Origins Country Presence

This dataset mirrors the structure of the sample COVID country time-series:

`Date, Country, Latitude, Longitude, Production country appearances, Metric`

It is yearly festival data, not daily data. `Date` is set to `01/07/YYYY` as a stable festival-year timestamp for map animation tools.

## Method

- Metric: production country appearances in the KVIFF catalogue.
- Counting method: presence count. If a film lists three production countries, each country receives one appearance.
- Years 1992-2025: generated from `apps/web/app/specialy/kviff/_pipeline/countries_history.json`.
- Year 2026: generated from `apps/web/app/specialy/kviff/countries.ts`, because the historical scrape currently has only a 9-film partial sample for 2026.
- Missing years in the source series: 1993 and 2020.

## Output

- Main CSV: `kviff-film-origins-country-presence-1992-2026.csv`
- Minimal CSV: `kviff-film-origins-country-presence-1992-2026-minimal.csv`
- Rows: 1852
- Festival years: 33
- Distinct countries/entities: 139
- Total production-country appearances: 9890

## Editorial note

Do not describe this as nationality of films. It measures visibility/presence of listed production countries in the festival catalogue. For a fairer weighting of coproductions, add a separate fractional-count dataset later.
