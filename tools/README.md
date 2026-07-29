# tools/ — redakční generátory

Samostatné **HTML nástroje**, které nejsou součástí webu. Spouští se **dvojklikem**
(otevřou se v prohlížeči) — žádný server, build ani instalace. Potřebují jen
**připojení k internetu** (načítají firemní fonty z Google Fonts; PNG export je do
obrázku zapéká).

Poslat kolegovi = **poslat ten jeden `.html` soubor** (mail, Slack…). Příjemce ho
otevře dvojklikem.

## Nástroje

| Soubor | Co dělá |
|--------|---------|
| [`poster-editor.html`](poster-editor.html) | Generátor **náhledových obrázků / og:image** (poutáků) speciálu *Data pro budoucí premiérku*. Formáty pro sítě (www·FB·X·BSky 1200×630, Square, Portrait, IG story/reel), barvy 15 kapitol, vlastní obrázek (Ctrl+V / drag&drop / soubor), světlý i tmavý režim. Export SVG (malý, na web) i PNG (na sítě). |
| [`logo-dpbp-editor.html`](logo-dpbp-editor.html) | Generátor **barevných log-hlav** (ProfileHead) speciálu — silueta profilu v barvě kapitoly s barevnými tečkami. |

## Zdroj barev

Oba nástroje ctí **kanonickou paletu 15 kapitol**. Jediný zdroj je
[`apps/web/components/dpbp/dpbpChapters.json`](../apps/web/components/dpbp/dpbpChapters.json).
Kontrolu shody hlídá `npm run check:palette`.

## Kam ukládat data

- **Data, která se vizualizují v článku** → do složky článku vedle obrázků
  (`apps/web/app/clanek/_articles/<slug>/…`, resp. `_content/<kapitola>/…`).
- **Surová / nezpracovaná data** (možná se nikdy nepoužijí) → do editorského repa
  `../data-pro-premierku/` (organizovaný po kapitolách). **Nedávat do `apps/web`** —
  nafouklo by to build a zkopírovalo se to do `public/`.
