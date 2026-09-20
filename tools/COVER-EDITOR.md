# Cover obrázky: jeden projekt, čtyři výstupy

Pro práci s grafovým motivem a kontrolu vzhledu viz
[návod pro Michala](NAVOD-PRO-MICHALA.md).

Nové covery tvoří `poster-editor.html`. Automat používá tentýž editor přes
`render-covers.cjs`; nevytváří druhou implementaci grafiky.

| Soubor | Rozměry | Frontmatter |
| --- | --- | --- |
| cover-homepage.jpg/png | 1500 × 1200 (5:4) | homepageImage |
| cover-og.jpg/png | 1200 × 630 | ogImage |
| cover-square.jpg/png | 1080 × 1080 | squareImage |
| cover-instagram.jpg/png | 1080 × 1350 (4:5) | instagramImage |

## Ruční a poloautomatická práce

Písmo coverů je pevně dané: titulek, podtitulek a claim používají **IBM Plex
Serif (patkové)**; kicker a horní tagy **IBM Plex Sans (bezpatkové)**.
Platí to pro editor i automat. Při otevření staršího projektu se jeho písma
sjednotí s tímto pravidlem. Logotypy si zachovávají vlastní značkovou podobu.

### Co dodat a co publikovat

- **Vstup:** původní fotografie či ilustrace bez dodatečného titulku a loga,
  krátký titulek, případný kicker a claim, zdroj fotografie a informace o právu
  k použití. Důležitý motiv označ, pokud nemusí být zřejmý. Stačí dodat jednou.
- **Kvalita zdroje:** originál v nejvyšším dostupném rozlišení, ideálně alespoň
  2400 px na delší straně. Je to pracovní doporučení, nikoli záruka: rozhoduje
  také ostrost a rozlišení po ořezu. Neposílej screenshot či soubor opakovaně
  komprimovaný messengerem, je-li dostupný originál. Menší obrázek nezvětšuj
  předem; editor umí upozornit na nedostatečné rozlišení konkrétního ořezu.
- **Automat:** z jednoho zadání vytvoří čtyři kompletní soubory a editovatelný
  `cover-project.json`. Text a logo přidává společný renderer, ne AI obrazem.
- **Ruční zásah:** jen když kontrola odhalí špatný ořez, zalomení či kompozici.
  Otevři projekt, oprav konkrétní variantu a ulož projekt i nové exporty.
- **Publikace:** JPEG/PNG s celou kompozicí včetně textů a značek. Samotná
  fotografie je zdroj, nikoli náhrada hotového coveru. Zdroj a projekt ponech
  zvlášť pro další úpravy. Po změně projektu je potřeba znovu exportovat obrázky.

Pro Codex i Claude použij stejný uložený projekt a tento postup. Běžná výroba
má být deterministické spuštění rendereru; AI řeší krátké zadání a vizuální
kontrolu, ne pokaždé nový generátor ani ruční skládání všech variant.
Pokud dodáš hotovou grafiku s již vloženým textem, přilož také její editovatelný
zdroj nebo tento projekt. Zploštěný JPEG neumožní samostatně přemístit titulek.

U obrázků uvnitř článku zachovej původní motiv bez coverových titulků a log;
přidej popisek, zdroj a alternativní text. Grafy uchovávej i v editovatelném
zdroji (data + specifikace/SVG); export pro sociální sítě je samostatná varianta.

### Ovládání editoru

1. Spusť `npm run dev --workspace web` a otevři
   `http://localhost:3001/tools/poster-editor.html`.
2. Vlož fotografii, napiš krátký titulek a případně doplňující text.
   Nebo otevři uložený `cover-project.json`.
3. Přepni varianty, zkontroluj sazbu a dolaď jednotlivé ořezy.
4. Stáhni ZIP se všemi variantami, projektem a `frontmatter.yaml`.
   Jednotlivý obrázek lze stáhnout zvlášť; tlačítko Instagram otevře portrétní
   obrázek v nové kartě pro kopírování či uložení.

Projekt obsahuje zdrojový obrázek, texty, barvy a samostatné úpravy každého
formátu. Ulož ho před zavřením editoru. Hotový zploštěný cover lze vložit přes
režim „Hotový cover“, ale tento režim neumí znovu vysázet text z fotografie.

Kicker má standardně rám podle délky textu. Po výběru textu lze zadat šířku
v pixelech nebo změnit šířku bočním úchytem. Tlačítko „Rám podle délky textu“
obnoví automatický rám kickeru. Enter v claimu vynutí nový řádek i po změně
šířky; uvnitř jednotlivých řádků se text může dále zalomit podle dostupného místa.

## Automat

```sh
npm run covers -- tools/cover-example.json ./cover-output
```

Z Pythonu lze spustit stejný postup:

```sh
python tools/render-covers.py tools/cover-example.json ./cover-output
```

Python je zde vstupní bod pro automatizaci: předá projekt společnému rendereru
a vrátí jeho výsledek i návratový kód. Potřebuje tedy také Node.js a níže uvedený
prohlížeč. Nevytváří další sazbu v Pillow. Výsledný `cover-project.json` otevři
v editoru, dolaď a ulož; příští automatický běh použije právě tento uložený projekt.

Vyžaduje Playwright Chromium (`npx playwright install chromium`), případně
nainstalovaný Edge: v PowerShellu nastav `$env:COVER_BROWSER_CHANNEL='msedge'`.
Stejně jako editor potřebuje přístup ke Google Fonts pro vložení fontů.

Jako vstup slouží projekt uložený editorem nebo stručný JSON podle příkladu.
Pro fotografii přidej do kořene JSON `"imageFile": "relativni/cesta/foto.jpg"`.
Cesta je relativní k JSON. Automat ji vloží do výsledného projektu, který
potom otevřeš v editoru bez dalších souborů. `imageFile` je zkratka pro CLI;
editor otevírá uložený projekt s již vloženým obrázkem.

Existující soubory automat nepřepíše bez `--force`. Fotografie exportuje do
JPEG, čistou grafiku do PNG; ruční volba v projektu má přednost.

## Zapojení na web

Obrázky patří do `images/` u článku. Přenes pole z `frontmatter.yaml` do
`index.md`. `homepageImage` určuje náhled karty. `ogImage` určuje Open Graph,
Twitter a obrázek JSON-LD; rozměry a MIME se čtou ze skutečného souboru.
`instagramImage` přidá na kartu samostatný odkaz Instagram do nové karty.
Kliknutí na hlavní obrázek nadále vede na článek a jeho nativní nabídka
„Otevřít obrázek“ nadále otevírá zobrazený webový obrázek.

`squareImage` je připravený soubor pro přímé sdílení; neurčuje automaticky
náhled WhatsAppu. Jeden odkaz nabízí společný hlavní OG obrázek. Podle
[Open Graph](https://ogp.me/#array) má při více obrázcích přednost první;
protokol neurčuje samostatné pole pro WhatsApp. Základní OG sazba proto drží
text a značky v centrálním čtverci. Náhledy ořezů jsou kontrolní pomůcka,
nikoli garance konkrétní aplikace.

Starší články bez nových polí si zachovají `coverImage` a dosavadní chování
ořezu. `photo-cover.py` je starší samostatný fotografický generátor;
zůstává kvůli reprodukci starých coverů. Pro nové články používej společný
projekt a `npm run covers`. Generátor `social-cards/` slouží dalším kartám
a carouselům, nikoli této sadě coverů.

Před publikací zkontroluj všechny čtyři soubory: čitelnost, ořez hlavního
motivu, loga a velikost. Cíl pro OG je přibližně 150–500 kB. Automatická
sazba nenahrazuje redakční kontrolu fotografie ani délky titulku.

## Ověření

```sh
node tools/test-cover-geometry.cjs
node tools/test-cover-text.cjs
node tools/test-cover-project.cjs
npx tsc --noEmit --incremental false -p apps/web/tsconfig.json
```
