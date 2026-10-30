# Inteligentní kompozice coverů – audit a návrh (28. 10. 2026)

Odpověď na zadání „Intelligent Editorial Cover Composition System“. Fáze 1 (audit) a 2 (návrh).
Implementace (fáze 3) začne až po schválení priorit. Nic z návrhu nemění branding, písma, barvy ani formáty.

**Stav 29. 10. 2026:** první krok hotový ručně na třech OG (Miliarda za volby, slunečnice, větrníky): generátor umí
textové bloky kolem motivu (`rozlozeni`), pravidla jsou v COVER-EDITOR.md → *Kompozice podle formátu*. Další
kroky (řešič, varianty, zalomení) podle priorit níže, až po schválení.

## 1. Audit: co dnes existuje

**Tři generátory, jeden hlavní.**

| Nástroj | Kde se používá | Jak skládá |
|---|---|---|
| `tools/cover-generator.cjs` + `_cover_pipeline/cover.config.cjs` | 50 článků, všechny nové covery | HTML/CSS stránka na formát, Playwright, pět formátů |
| `poster-editor.html` + `cover-project.js` + `npm run covers` | ruční editor, starší covery | pevný svislý sloupec: štítek, titulek, podtitulek, obrázek, claim, logo (`editorialLayout`, zlomky výšky) |
| `specialy/…/covery.cjs` | speciál Data pro budoucí premiérku | vlastní systém (logo speciálu, štítek ANALÝZA / 01 DEMOGRAFIE) |

Návrh se týká hlavního generátoru; ostatní dva nechávám, jak jsou.

**Co funguje a zůstane**
- Pět formátů s bezpečnými zónami (`FORMATY.box`), OG jako „čtverec s ušima“ (čitelný i v oříznutém náhledu
  WhatsApp/Signal), roh pro štítek rubriky na homepage.
- Motivy nejsou rastrové obrázky grafů: 32 z 50 coverů kreslí motiv skript `motiv.cjs` z dat (slunečnice
  z teček, medaile, postavičky žen, mapy obcí). To je nejcennější vlastnost systému: graf jde přeskládat bez
  změny dat.
- Od dneška: text coveru z článku, razítko, měření čitelnosti textu nad motivem a samočinný podklad nebo stín.
- Animace berou stejné `html()` jako cover (stejné písmo, štítek, titulek, logo), takže statický cover je
  přirozený fallback.
- Kontaktní arch (`tools/kontaktni-arch.cjs`) simuluje ořezy webu a sítí.

**Jak se dnes počítají pozice**
- Textový blok je vždy přišpendlený k levému hornímu rohu bezpečné zóny a teče dolů; mezery jsou násobky
  velikosti titulku (0,45 / 0,3 × `t`). Nic neměří, kolik místa pod textem zbylo.
- Zalomení titulku: 48 z 50 konfigurací má ruční `<br>`. Stejné zalomení pak platí pro široké OG i úzkou story.
- Motiv: každý `motiv.cjs` má pro každý formát ruční souřadnice (např. slunečnice `[střed x, střed y, poloměr]`),
  tečkové mapy se vejdou do pevného obdélníku `FORMATY.mapa`. Motiv nedostane „zbylé místo“, dostane čísla.
- Fotky: ruční `vyrez` a `oblast`; kde je obličej, je jen v komentáři („hlava nikdy pod textem“).
- Ladění se děje přes desítky ručních klíčů: `format` (18 konfigurací), `mapaPozice` (5), `mezery`, `rozestup`,
  `legNahoru`, `podDolu`, `pro`, `logoPodLegendou`. To je přesně „přidávání pevných hodnot a výjimek“,
  před kterým zadání varuje.

**Kde vznikají chyby (prohlédnuto na šesti sadách, arch v příloze)**

| Sada | Co je vidět |
|---|---|
| CDU Meklenbursko (fotka + titulek) | dobré; ve story je pod logem prázdný tmavý pás asi čtvrtiny výšky |
| Miliarda za volby (číslo + mapa) | story: text i mapa nahoře, spodní třetina prázdná; legenda v náhledu nečitelná |
| Slunečnice (tečkový graf) | nejlepší sada; každý formát má vlastní rozvržení motivu (OG dva disky) |
| Větrníky (mapa + ikony) | OG: ikony větrníků vjíždějí do písmen titulku; story: mapa malá uprostřed, dole prázdno |
| Komise OSN (fotka jako textura) | story: text nahoře nahuštěný, zbytek plochy jen textura |
| Ženy na radnicích (piktogramy) | graf je mechanicky zmenšený: 20 postaviček v řádku i ve story, popisky drobné, dole prázdný fialový pás |

Shrnutí: chyby nejsou v jednotlivých parametrech, ale v tom, že **volné místo nikdo nerozděluje**. Na výšku
(4:5, story) se kompozice skládá shora a zbytek zůstane prázdný. Graf se nepřeskládá, jen se zmenší.

## 2. Návrh architektury

Rozšířit stávající generátor, nepřepisovat. Osm vrstev ze zadání mapuji takto:

| Vrstva | Dnes | Návrh |
|---|---|---|
| 1. Obsah | `coverTitulek`, `cover.config.cjs` | + `plan.sdeleni`, `plan.dominanta` (titulek / motiv / fotka) |
| 2. Analýza fotky | komentář v konfiguraci | `foto.chranene` (obličeje, gesta), `foto.klid` (plochy pro text), `foto.pohled` |
| 3. Sémantika grafu | `motiv.cjs` s ručními souřadnicemi | `motiv.cjs` dostane obdélník a vrátí SVG + skutečné hranice + kotvy; vyjmenuje přípustná přeskládání |
| 4. Kompoziční plán | rozptýlené klíče | jeden objekt `plan` (viz níže), ze kterého se odvodí všechny formáty |
| 5. Rozvržení formátu | pevný `box` + `mapa` | řešič: strategie × formát → kandidáti |
| 6. Vykreslení | `html()` | beze změny, jen bere výsledek řešiče |
| 7. Kontrola | čitelnost, zóny (od dneška) | + rozložení prázdna, optické mezery, náhledová čitelnost, datové invarianty |
| 8. Export | razítko, pět souborů | + arch tří variant k výběru, zapamatovaná volba |

**Kompoziční plán (strukturovaná data v `cover.config.cjs`)**

```js
plan: {
  sdeleni: 'Dívek s poruchou příjmu potravy je třikrát víc',
  dominanta: 'motiv',                 // co má čtenář vidět první
  poradi: ['motiv', 'titulek', 'podtitulek', 'legenda'],
  vazby: [['legenda', 'motiv', 'u']], // legenda patří k motivu (Gestalt: blízkost)
  motiv: { min: 0.35, max: 0.6, preskladat: ['mrizka', 'meritko'] }, // podíl plochy, povolené změny
  foto: { chranene: [[x, y, w, h, 'obličej Merze']], pohled: 'vlevo', klid: [[…]] },
  strategie: { story: 'nad-sebou' },  // volitelně: editor zamkne vybranou variantu
}
```

Bez `plan` se generátor chová jako dnes, takže stará konfigurace a publikované covery fungují beze změny.

**Strategie místo souřadnic.** Malá knihovna smysluplných rozvržení, každé popsané vztahy, ne pixely:
- **vedle sebe**: text vlevo, motiv vpravo (OG, homepage);
- **nad sebou**: titulek nahoře, motiv vyplní zbytek po bezpečnou zónu (čtverec, 4:5, story);
- **motiv přes celou plochu**: text v nejklidnějším místě (mapy, textury);
- **fotka dominuje**: text v negativním prostoru podle `foto.klid`, chráněné oblasti mimo text i ořez;
- **na střed** (OG čtverec s ušima, jak je dnes).

Řešič pro každý formát vyzkouší 2–4 vhodné strategie. Každou vykreslí, změří a seřadí. Editor dostane arch
tří nejlepších a vybere; volba se zapíše do `plan.strategie` a příště se použije rovnou. Zdařilé kompozice
(Kateřina je v konfiguracích už dnes chválí v komentářích) se sbírají do knihovny vzorů.

**Kontrola po vykreslení (měřitelná část)**
- Prázdný pás: dnes jen upozornění, nově se opraví (motiv dostane uvolněné místo nebo se text posune).
- Optické mezery: hranice skutečně vykreslených glyfů ze snímku textové vrstvy (snímek už dnes děláme),
  ne CSS boxy. Mezery mezi skupinami ve vztahu k velikosti písma, konzistentní napříč formáty.
- Optické těžiště: vážený střed jasu a sytosti celé plochy; varování při silném převážení k jedné hraně.
- Čitelnost v náhledu: nejmenší písmo přepočtené na skutečnou velikost karty (homepage karta asi 380 px, OG
  ve WhatsApp asi 250 px). Pod 9 px se hlásí (dnes typicky legendy).
- Datové invarianty: u motivů z `motiv.cjs` spočítat jednotky podle barvy v SVG každého formátu a porovnat
  s daty. Pořadí kategorií a legenda musí sedět. Hlídá se nezávisle na estetice.

**Kontrola po vykreslení (estetická část).** Měření nejsou estetické hodnocení a nebudu je za ně vydávat.
Povinný krok procesu: Claude si každý arch zobrazí, slovy pojmenuje problémy („mezi titulkem a grafem
vznikl neodůvodněný pás“), upraví jednu konkrétní vlastnost a porovná před/po. Závěrečné slovo má redakce.

**Zalomení titulku.** Ruční `<br>` se stane návrhem, ne povinností. Generátor projde všechna smysluplná
zalomení do čtyř řádků, změří je skutečným písmem a ohodnotí:
- vyrovnanost délek řádků a tvar bloku;
- žádný krátký poslední řádek;
- nerozdělit číslo a jednotku („20 z 21 obcí“, „1 080 Palestinců“) ani vlastní jména;
- předložky a spojky na konci řádku nikdy (to už platí).

Velikost písma zůstává z design systému; mění se šířka bloku a zalomení.

**Fotky.** První krok bez nových závislostí: chráněné oblasti zapisuje do konfigurace člověk nebo Claude po
prohlédnutí fotky. Ořez pro každý formát pak řeší řešič tak, aby chráněné oblasti zůstaly celé a mimo text.
Automatická detekce obličejů (smartcrop.js nebo MediaPipe, princip jako „automatic gravity“ v Cloudinary)
až jako druhý krok a jen s tvým souhlasem s instalací.

**Animace.** Plán a rozvržení se spočítají jednou (pro nejrozsáhlejší snímek) a zamknou pro všechny snímky,
takže titulek ani graf neposkakují. Statický cover zůstává fallbackem a reprezentativním snímkem.

**Bezpečné zóny.** Každý formát dostane seznam scénářů (karta webu, náhled WhatsApp, mřížka profilu
Instagramu, ovládání Reels) s vyznačením, co je ověřené a co pracovní předpoklad. Kontaktní arch je
vykreslí jako vodítka.

## 3. Priority

| # | Krok | Přínos | Náročnost | Riziko |
|---|---|---|---|---|
| R1 | Zalomení titulku: kandidáti + skóre, `<br>` jako návrh | vyvážené titulky v každém formátu | 1 den | jiné zalomení u starých coverů → jen pro nové render |
| R2 | Rozdělení volného místa na výšku: motiv dostane zbytek plochy | konec prázdných pásů ve story a 4:5 | 1–2 dny | motivy s pevnými souřadnicemi je třeba převést (viz A1) |
| R3 | Optické mezery z vykreslených glyfů + čitelnost v náhledu | rytmus, legendy čitelné v kartě | 1 den | nízké |
| R4 | Referenční sada: šest článků výše, staré vs. nové na jednom archu | srovnání, regresní test | 0,5 dne | nízké |
| A1 | Rozhraní `motiv.cjs`: obdélník → SVG + hranice + přeskládání (začít postavičkami žen a slunečnicí) + datové invarianty | graf se přeskládá, nezmenší | 2–3 dny | chyba v přeskládání = chybná data; proto invarianty |
| A2 | `plan` + strategie + řešič + arch tří variant | rozhodování místo souřadnic | 3–5 dní | větší zásah do generátoru; bez `plan` vše jako dnes |
| A3 | Fotky: chráněné oblasti a ořez podle nich | text mimo obličeje ve všech formátech | 2 dny | ruční anotace; detekce až po schválení |
| A4 | Knihovna zdařilých kompozic | rychlejší a jistější další covery | průběžně | nízké |

Doporučené pořadí: R4 → R1 → R2 + A1 (postavičky) → R3 → A2 → A3. Po každém kroku arch staré vs. nové.

**Dopady:** konfigurace se jen rozšiřuje (zpětně kompatibilně), razítko dostane `plan`. Publikované covery se
nepřegenerují samy, jen na tvůj pokyn (změna obrázku znamená novou keš náhledů na sítích).
`checkArticles` se nemění. Ruční úpravy editorem zůstávají možné: každý klíč dnešní konfigurace má přednost
před řešičem.

## 4. Akceptační kritéria (ze zadání), jak je ověříme

- Titulky vyvážené: skóre zalomení + arch, posouzení okem.
- Mezery záměrné: optické mezery v toleranci, žádný prázdný pás.
- Fotky ořezané s ohledem na obsah: chráněné oblasti celé ve všech formátech (měřitelné).
- Infografika přeskládaná bez změny významu: datové invarianty prochází.
- Každý formát plnohodnotný a čitelný v náhledu: arch se skutečnými velikostmi karet.
- Branding a exporty beze změny: stávající konfigurace bez `plan` dávají stejné obrázky (porovnání otisků).
