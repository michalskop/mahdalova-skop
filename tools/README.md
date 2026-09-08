# tools/ – redakční generátory

Dvě kategorie nástrojů, které nejsou součástí webu.

**HTML nástroje** – spouští se **dvojklikem** (otevřou se v prohlížeči),
žádný server, build ani instalace, jen připojení k internetu (Google Fonts;
PNG export je do obrázku zapéká). Poslat kolegovi = poslat ten jeden
`.html` soubor.

**Skriptované generátory** – vlastní podsložka s `README.md`, potřebují
Node a někdy headless Chromium (viz `social-cards/`). Nejsou dvojklikové,
ale jsou to jednorázové/on-demand nástroje spouštěné při psaní článku, ne
CI ani produkční kód webu.

## Jak spustit

**HTML nástroje** (`poster-editor.html`, `logo-dpbp-editor.html`,
`chart-simplifier.html`):
1. Otevři soubor **dvojklikem** – spustí se v prohlížeči, nic se
   neinstaluje ani nespouští na pozadí.
2. Potřebuješ internet jen kvůli fontům (Google Fonts); jinak je nástroj
   samostatný.
3. Export (SVG/PNG) je tlačítko v nástroji – stáhne soubor rovnou do
   Stažených.

Pár `chart-simplifier.html` → `poster-editor.html`: nejdřív v
chart-simplifier vlož Vega-Lite spec grafu a zkopíruj vygenerovaný motiv
(SVG), pak ho vlož do poster-editoru.

**`social-cards/`** (vyžaduje terminál, ne dvojklik):
1. Předpoklad: Node a Chromium na stroji (repo počítá s
   `/snap/bin/chromium`; jinou cestu nastavíš přes
   `SOCIAL_CARDS_CHROMIUM=/cesta/k/chromium`).
2. V terminálu: `cd` do repa `mahdalova-skop`.
3. Zkontroluj/uprav `apps/web/app/clanek/_articles/<slug>/social/social.json`
   (headline, caption, případně `chartSvg` pro každou kartu).
4. Spusť `node tools/social-cards/generate.mjs <slug-clanku>`.
5. Hotové PNG jsou v
   `apps/web/app/clanek/_articles/<slug>/social/<formát>/<card-id>.png`.
6. Texty ke kartám: otevři příslušný soubor v `social-cards/prompts/`,
   vyplň placeholdery a vlož do Claude – podrobnosti v
   `social-cards/prompts/README.md`.

## HTML nástroje

> **`poster-editor.html` je náš jediný generátor cover / náhledových obrázků.**
> Všechny náhledy k článkům (na web i na sociální sítě) děláme tady – žádný jiný
> nástroj na to není. (Dřívější `cover-bg-picker.html` byl **zrušen**, ať v tom
> není zmatek; barvu si vybíráš přímo v poster-editoru.)

| Soubor | Co dělá |
|--------|---------|
| [`poster-editor.html`](poster-editor.html) | Generátor **cover / náhledových obrázků / og:image** pro **všechny články** (zpětně i do budoucna) – i pro poutáky speciálu *Data pro budoucí premiérku*. Nahoře volitelně **logo DataTimes.cz** (běžné články) nebo hlava speciálu; kicker (auto-zmenšení + zalomení), titulek, číslo/claim, motiv-graf **nebo vlastní fotka** (Ctrl+V / drag&drop / soubor); paleta 15 kapitol **+ rozšířená firemní paleta**; formáty pro web i sítě (1200×630, Square, Portrait, IG story/reel), světlé i **tmavé pozadí** (ink blue `#101432` ↔ béžová `#f8f6f0`). Export **SVG** (na web) i **PNG** (na sítě). |
| [`logo-dpbp-editor.html`](logo-dpbp-editor.html) | Generátor **barevných log-hlav** (ProfileHead) speciálu – silueta profilu v barvě kapitoly s barevnými tečkami. |
| [`chart-simplifier.html`](chart-simplifier.html) | Zjednoduší Vega-Lite spec na motiv (SVG path) pro `poster-editor.html`. |

## Skriptované generátory

| Složka | Co dělá |
|--------|---------|
| [`social-cards/`](social-cards/README.md) | Vyrobí branded PNG karty pro X/Bluesky/Threads/Instagram/OG ze `social.json` daného článku, jedním příkazem, pro všechny formáty najednou. Texty ke kartám mají hotové prompty v `social-cards/prompts/`. |

## Zdroj barev

Oba nástroje ctí **kanonickou paletu 15 kapitol**. Jediný zdroj je
[`apps/web/components/dpbp/dpbpChapters.json`](../apps/web/components/dpbp/dpbpChapters.json).
Kontrolu shody hlídá `npm run check:palette`.

## Kam ukládat data

- **Data, která se vizualizují v článku** → do složky článku vedle obrázků
  (`apps/web/app/clanek/_articles/<slug>/…`, resp. `_content/<kapitola>/…`).
- **Surová / nezpracovaná data** (možná se nikdy nepoužijí) → do editorského repa
  `../data-pro-premierku/` (organizovaný po kapitolách). **Nedávat do `apps/web`** –
  nafouklo by to build a zkopírovalo se to do `public/`.
