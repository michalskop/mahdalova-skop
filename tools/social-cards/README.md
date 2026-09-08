# social-cards — generátor karet pro sociální sítě

Vyrobí branded PNG karty (stejný vizuální jazyk jako `images/main.png`
u článků) ve všech rozměrech, které dnešní distribuční formáty potřebují —
z jedné datové konfigurace na článek, jedním příkazem, bez ručního
Chromia po jednom obrázku.

Na rozdíl od ostatních nástrojů v `tools/` (viz `../README.md`) tenhle
**potřebuje Node** a headless Chromium — je to skriptovaný pipeline, ne
dvojklikový HTML nástroj. Nemá vlastní `package.json`/závislosti, protože
žádné nepotřebuje: staví jen na Node built-inech a na Chromiu, které už
repo předpokládá (`/snap/bin/chromium`, stejně jako
`apps/web/scripts/qa-kviff.mjs`).

## Použití

```bash
node tools/social-cards/generate.mjs <slug-clanku> [formát ...]
```

- `slug-clanku` — název složky v `apps/web/app/clanek/_articles/`.
- `formát` — volitelně omezit jen na některé (viz `presets.mjs`); bez
  zadání se vyrobí všechny formáty uvedené u každé karty v `social.json`.

Příklad (skutečný, používaný článek):

```bash
node tools/social-cards/generate.mjs analyza-2026-08-27-obecni-i-senatni-volby-2026-nejmene-kandidatu
```

Pokud Chromium není na obvyklé cestě, nastav
`SOCIAL_CARDS_CHROMIUM=/cesta/k/chromium`.

## Kam se ukládají výstupy

Do složky článku, ne nikam centrálně:

```
apps/web/app/clanek/_articles/<slug>/social/
  social.json          # konfigurace — vstup
  og/<card-id>.png
  x-square/<card-id>.png
  bluesky-landscape/<card-id>.png
  bluesky-square/<card-id>.png
  ig-portrait/<card-id>.png
  ig-story/<card-id>.png
```

Řídí se stejným pravidlem jako zbytek repa (`../README.md`, „Kam ukládat
data"): co je vizuál konkrétního článku, patří do složky toho článku a
commituje se do gitu spolu s ním — ne do sdíleného assets adresáře a ne
generované za běhu.

## Konfigurace `social/social.json`

```json
{
  "site": "mahdalova-skop.cz",
  "eyebrow": "Volby 2026",
  "footer": "Zdroj: ...",
  "cards": [
    {
      "id": "main",
      "headline": "Nejméně kandidujících<br>za víc než 20 let",
      "caption": "Komunální: <b>190 174</b> kandidujících.",
      "chartSvg": "<svg viewBox='0 0 600 240'>...</svg>",
      "formats": ["og", "x-square", "bluesky-landscape", "ig-portrait"]
    }
  ]
}
```

- `headline`/`caption` — smí obsahovat `<br>` a `<b>`, nic jiného (žádný
  framework, jen `template.html`).
- `chartSvg` — volitelné; celý `<svg viewBox="0 0 600 240">…</svg>`
  řetězec, stejný hand-drawn styl jako v `_cover_pipeline/cover.html`
  jednotlivých článků. Bez chartu zůstane karta čistě textová se stejným
  brandingem.
- `formats` — které z `presets.mjs` se pro danou kartu mají vyrobit;
  vybírej podle toho, kam karta půjde (viz
  `docs/redakcni-styl/DISTRIBUCNI_FORMATY.md` a tabulka formátů níže).

Živý příklad se třemi kartami je přímo u tohoto článku:
`apps/web/app/clanek/_articles/analyza-2026-08-27-obecni-i-senatni-volby-2026-nejmene-kandidatu/social/social.json`.

## Formáty (`presets.mjs`)

| Formát | Rozměr | Pro co |
|---|---|---|
| `og` | 1200×630 | Odkazový náhled (X reply, Bluesky link post, Threads, Facebook) |
| `x-square` | 1200×1200 | X vícefoto set, max 4, 1:1 (X ořezává od středu) |
| `bluesky-landscape` | 1200×675 | Bluesky samostatný obrázek, 16:9 |
| `bluesky-square` | 1080×1080 | Bluesky vícefoto set, max 4, 1:1 |
| `ig-portrait` | 1080×1350 | Instagram/Threads carousel, 4:5 (aktuálně doporučený poměr) |
| `ig-story` | 1080×1920 | Instagram/Threads Stories, 9:16 |

Detaily a zdroje k těmto číslům (a k pravidlům jako „odkaz do repliesu na
X, ne do hooku") jsou v komentářích `presets.mjs` a v
`docs/redakcni-styl/DISTRIBUCNI_FORMATY.md`. Platformy tohle nedokumentují
oficiálně a mění to často — než spustíš širší kampaň, přepočítej si to.

## Texty ke kartám

Skript řeší jen obrázky. Texty (thready, captiony) mají hotové prompty pro
Claude v `prompts/` — viz `prompts/README.md`.

## Known issue, na který jsem narazil při stavbě

Snap-confinované Chromium (`/snap/bin/chromium`) umí číst jen soubory pod
`$HOME` — `generate.mjs` proto renderuje dočasné HTML do
`tools/social-cards/.tmp/` (v repu, tedy pod `$HOME`), ne do systémového
`/tmp`. Screenshot chybějícího/nečitelného souboru navíc Chromium neumí
odlišit od úspěchu — vrátí exit kód 0 a vyfotí vlastní chybovou stránku
"file not found" jako běžný snímek. Skript proto po každém screenshotu
kontroluje velikost souboru (< 3 kB = podezřelé) a shodí se s chybou,
místo aby tiše vyrobil prázdnou kartu.
