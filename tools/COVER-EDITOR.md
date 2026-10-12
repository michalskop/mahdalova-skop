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

## Sada pro web a sociální sítě (od 12. 10. 2026)

Ke každému článku pět souborů. Důležitý text a logo vždy uvnitř bezpečné zóny,
okraje smí přesahovat jen dekorace (mapa, fotka).

| Soubor | Rozměry | Kde se použije | Bezpečná zóna (text, logo) |
| --- | --- | --- | --- |
| cover-homepage | 1500 × 1200 (5:4) | `homepageImage` + `coverImage`: všechny karty webu | x 180–1320, y 120–1080; **oblast x ≥ 950, y ≤ 280 prázdná** (štítek rubriky, delší až od x ≈ 760); text začíná na x 180 / y 120, logo pravý dolní roh zóny |
| cover-og (JPEG, **do 300 kB** – větší WhatsApp nenačte) | 1200 × 630 | `ogImage`: odkaz na Facebooku, X, LinkedInu, Bluesky, WhatsAppu | **střední čtverec** 630 × 630 (WhatsApp a messengery ořezávají na čtverec); velké písmo, náhled na WhatsAppu má ~100 px |
| cover-square | 1080 × 1080 | `squareImage`: ruční sdílení obrázku (Bluesky, WhatsApp) | okraj 70 px |
| cover-instagram | 1080 × 1350 (4:5) | Instagram feed (nahrává se ručně) | nic důležitého v horních a dolních 80 px (mřížka profilu ořízne na 3:4) |
| cover-story | 1080 × 1920 (9:16) | Instagram stories (nahrává se ručně) | horních 250 px a dolních 340 px překrývá rozhraní aplikace |

Všechny karty webu včetně tří postranních u hlavního článku drží náhled přesně 5:4 (od 12. 10. 2026;
dřív se postranní karty ořezávaly až na čtverec, proto mají starší covery text posunutý doprostřed –
Bolsonaro). Na každou kartu web vkládá vpravo nahoře štítek rubriky: v malých kartách (boční 230 px,
mobilní seznam) zakryje na coveru oblast x ≥ 950, y ≤ 280. Ikony a odznaky coveru patří pod ni.
Stejné kotvy (text od x 180 / y 120, logo vpravo dole) drží covery v řadě vedle sebe zarovnané. Odkaz na síti vždy přebírá jeden `ogImage`; web nepozná, kam se sdílí
(statický web na Cloudflare Pages), proto má OG text uprostřed.

**Písma (tvrdé pravidlo, od 12. 10. 2026):** patkový IBM Plex Serif Bold jen titulek a nápis loga „DataTimes.cz“;
všechno ostatní (štítek, nadtitulek, podtitulek, legenda, nápisy v ikonách) IBM Plex Sans.
**Štítek coveru:** verzálky Plex Sans s prostrkáním, první část karmínově (#de1743) s podtržením končícím v půlce
posledního písmene, pak „•“ a zbytek bíle (VOLEBNÍ KALKULAČKA • KOMUNÁLNÍ A SENÁTNÍ VOLBY 2026); vpravo zarovnaný zrcadlově.

**Kompozice – využít plochu:** motiv (mapa, fotka, ilustrační obrázek) má vyplnit cover, ne plavat malý uprostřed.
Mapu zvětšit od pravého dolního rohu směrem doleva nahoru; text, legenda i logo smí ležet přes ni (jako Brazílie).
Čitelnost drží rozmazaný podklad v barvě pozadí pod drobnými texty (generátor: třída `halo`) a stín titulku.
Nebát se velkých, odvážných kompozic – jen štítek rubriky (x ≥ 950, y ≤ 280) a kotvy textu/loga platí dál.

**Generátor:** `tools/cover-generator.cjs` + `_cover_pipeline/cover.config.cjs` u článku vyrobí všech pět formátů
(`PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <config>`). Vzory konfigurací: predikce,
výsledky predikce, kalkulačka (tečková mapa ČR + ikona), Bolsonaro (obrázek jako motiv).

Původní vzor generátoru pro grafické (ne fotografické) covery a kontrolní list ořezů:
`apps/web/app/clanek/_articles/volby-cr-2026-10-10-senat-komunalni-2026-predikce-vysledky/_cover_pipeline/`
(`cover.cjs`, `nahledy.cjs`). Hotový prompt pro zadání coveru AI: [PROMPT-COVER-PRO-MICHALA.md](PROMPT-COVER-PRO-MICHALA.md).
Barvy coverů jen přesně ze závazné palety v `packages/ui/DESIGN.md`.

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
