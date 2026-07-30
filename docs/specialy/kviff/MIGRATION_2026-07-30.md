# Migrace pracovní složky KVIFF

Datum: 30. července 2026

Původní pracovní adresář `C:\Users\datov\Documents\KVIFF` spojoval produkční
kopie, datové nástroje, prototypy, QA výstupy a dočasné logy. Při migraci byl
obsah rozdělen podle účelu.

## Přenesený obsah

| Původní obsah | Nové umístění |
| --- | --- |
| Skripty `prepare-*` a `build-*` | `apps/web/app/specialy/kviff/_pipeline/film-origins/` |
| CSV, TSV a detailní JSON původu filmů | `apps/web/app/specialy/kviff/_pipeline/film-origins/data/` |
| Metodické README k datům | `apps/web/app/specialy/kviff/_pipeline/film-origins/` |
| Samostatný dashboardový prototyp | `docs/specialy/kviff/prototypes/` |
| QA skript | `apps/web/scripts/qa-kviff.mjs` |
| Osm kontrolních screenshotů | `docs/specialy/kviff/qa/2026-07-29/` |

Skripty byly upraveny tak, aby nepoužívaly absolutní uživatelské cesty.
Playwright je vývojová závislost aplikace a QA lze spustit příkazem
`npm run qa:kviff --workspace apps/web`.

## Vědomě nepřenesený obsah

### `staging-kviff/` a `final-staging/`

Šlo o pracovní kopie starších stavů produkčních souborů. Aktuální kanonická
implementace je v `apps/web/app/specialy/kviff/`. Následný vývoj je dohledatelný
v Git historii, zejména v commitech:

- `b5ff0a53` – sloučení speciálu do jedné stránky,
- `36636633` – odstranění nepoužívané staré komponenty `VerticalTimeline`,
- `63639658` – přechod Grand Prix na sdílenou komponentu Timeline.

Osiřelé kopie `FooterCentered.tsx`, `next.config.mjs` a `sitemap.xml` mají své
kanonické protějšky ve webové aplikaci, proto nebyly duplikovány.

### Logy

Soubory `*.log` byly jednorázové výstupy vývojových serverů a npm. Neobsahují
zdrojová data ani ruční práci a byly vyřazeny. Nové logy tohoto typu ignoruje
existující pravidlo `.dev-server-*.log`; obecné dočasné výstupy nemají být
ukládány do repozitáře.

## Kontroly před odstraněním zdroje

- Regenerované CSV, TSV, JSON a standalone HTML byly bitově totožné s
  původními soubory.
- Všechny tři datové skripty úspěšně doběhly z nového umístění.
- TypeScript kontrola aplikace prošla.
- Produkční build webu prošel.
