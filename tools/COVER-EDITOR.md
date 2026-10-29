# Covery a obrázky pro sociální sítě – jediné místo

**Tohle je jediný kanonický zdroj pravidel pro covery a obrázky na sítě – pro Kateřinu i Michala stejně.**
Leží v repu na GitHubu (`tools/COVER-EDITOR.md`), Claude a Codex ho načítají přes `CLAUDE.md` / `AGENTS.md`
automaticky; stačí mít stažený aktuální main (`git pull`).

| Co | Kde |
| --- | --- |
| Pravidla: sada 5 souborů, písma, štítek coveru, bezpečné zóny, kompozice, logo | tento soubor (sekce níže) |
| Zadání pro AI (vložit do Claude/Codexu, doplnit 3 řádky) | [PROMPT-COVER.md](PROMPT-COVER.md) |
| Jak vymyslet motiv a držet identitu (bez fotky, s fotkou, citlivá témata, vzory) | [COVER-VIZUALNI-IDENTITA.md](COVER-VIZUALNI-IDENTITA.md) |
| Grafický / datový cover (mapa, graf, číslo) | `tools/cover-generator.cjs` + `_cover_pipeline/cover.config.cjs` u článku |
| Fotografický cover | `poster-editor.html`, `npm run covers` (níže) |
| Graf → motiv coveru | [NAVOD-PRO-MICHALA.md](NAVOD-PRO-MICHALA.md) (chart-simplifier) |
| Doplňkové karty do vláken + texty vláken a captionů | [social-cards/](social-cards/README.md), `social-cards/prompts/` |
| Formáty a zvyklosti jednotlivých sítí | `docs/redakcni-styl/DISTRIBUCNI_FORMATY.md` |
| Hotové obrázky k článku | `apps/web/app/clanek/_articles/<slug>/images/` (`cover-og.jpg`, `cover-square.png`, `cover-instagram.png`, `cover-story.png`); na webu `https://www.mahdalova-skop.cz/clanek/_articles/<slug>/images/<soubor>` |

Při rozporu platí tento soubor; ostatní dokumenty na něj odkazují.

Nové covery (datové, grafické i fotografické) vznikají v `tools/cover-generator.cjs` z konfigurace u článku.
`poster-editor.html` s `npm run covers` zůstává pro ruční fotografické covery a starší projekty (kapitola
*Ruční a poloautomatická práce* níže).

| Soubor | Rozměry | Frontmatter |
| --- | --- | --- |
| cover-homepage.png/jpg | 1500 × 1200 (5:4) | homepageImage |
| cover-og.jpg | 1200 × 630 | ogImage |
| cover-square.png/jpg | 1080 × 1080 | squareImage |
| cover-instagram.png/jpg | 1080 × 1350 (4:5) | instagramImage |
| cover-story.png/jpg | 1080 × 1920 (9:16) | (jen soubor, nahrává se ručně) |

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
(statický web na Cloudflare Pages), proto drží OG všechny texty a logo ve středním čtverci 630 s vůlí 35 px
(x 320–880). Jak OG skládat, říká kapitola *Kompozice podle formátu* níže.

**Písma (tvrdé pravidlo, od 12. 10. 2026):** patkový IBM Plex Serif Bold jen titulek a nápis loga „DataTimes.cz“;
všechno ostatní (štítek, nadtitulek, podtitulek, legenda, nápisy v ikonách) IBM Plex Sans.
**Štítek coveru:** verzálky Plex Sans s prostrkáním, první část karmínově (#de1743) s podtržením končícím v půlce
posledního písmene, pak „•“ a zbytek bíle (VOLEBNÍ KALKULAČKA • KOMUNÁLNÍ A SENÁTNÍ VOLBY 2026); vpravo zarovnaný zrcadlově.

## Kompozice podle formátu (od 29. 10. 2026)

Shrnutí všeho, co jsme se na coverech naučili. Každý formát je **samostatné rozvržení téhož sdělení**, ne výřez
ani zmenšenina jedné šablony. Kompozice se řídí motivem konkrétního článku: jednotný vzor za každou cenu je chyba
(Kateřina 29. 10.: „ten mustr nemá být takhle jednotný za každou cenu, mapy se chovají jinak“).

### Obecné zásady

1. **Nejdřív sdělení a motiv, pak text.** Jednou větou: co má čtenář pochopit za tři sekundy, a který prvek to
   nese (motiv, titulek, nebo fotka). Ten dostane nejvíc místa a nejlepší polohu.
2. **Motiv velký.** Mapa, disk, medaile nebo fotka vyplní plochu, ne malý ostrůvek v rohu nebo uprostřed prázdné
   navy. Na výšku zabere většinu plochy mezi textem a logem.
3. **Texty jsou bloky kolem motivu.** Štítek s titulkem, podtitulek, legenda a logo se rozmístí do klidných míst
   kolem motivu (prázdné kouty mapy, místa, kde motiv nic nenese), ne automaticky do jednoho sloupce vlevo nahoře.
   Bloky mají společné svislice: levé bloky lícují vlevo na jedné linii, pravé vpravo.
4. **Vůle od okrajů.** Text nikdy nesedí přímo na hraně formátu ani na hraně výřezu (čtverec OG, mřížka Instagramu).
   Vlevo stejná vůle jako vpravo.
5. **Čitelnost, ne dotyk.** Text smí ležet přes motiv tam, kde motiv nic podstatného nenese (u větrníků jižní Čechy
   a jižní Morava, kde se nehlasovalo; mapa republiky jako podkres). Vadí jen světlé nebo rušné místo pod písmem
   a zakrytá data. Pod velký titulek nikdy tmavý blok, nanejvýš stín kolem písmen; drobný text dostane měkký
   podklad (generátor to dělá sám, viz *Automatické pojistky*).
6. **Zalomení.** Titulek má ve všech formátech stejné řádky (ruční `<br>`), podtitulek a legendu lze pro jeden
   formát zalomit jinak, když to rozvržení potřebuje (`pro: { og: { pod: '…' } }`). Nikdy jednopísmenná předložka
   nebo spojka na konci řádku, číslo nikdy odtržené od jednotky.
7. **Logo** v klidném rohu, kde nezanikne (u mapy ČR vlevo dole pod Šumavou). Když se dole tlačí vedle titulku,
   smí nahoru nad štítek. Na homepage vždy dole (pravý horní roh patří štítku rubriky).

### Legenda

- **Popsat jen to, co je zvýrazněné.** Když jsou kategorie dvě, druhou nepopisovat („ostatní obce“ je zřejmé).
  Formulace srozumitelná bez článku: „malé obce, kde volby stojí přes 100 Kč na voliče“, ne „komise přes 100 Kč“.
- **Společné slovo vytknout jako nadpis:** „Obec větrníky“ a pod ním puntík „odmítla“, puntík „podpořila“
  (v konfiguraci položka bez barvy: `[null, 'Obec větrníky']`).
- Legenda patří k motivu, který vysvětluje, a má stejné znění ve všech formátech.
- Dlouhou položku zalomit (`<br>`), ať nenarazí do loga ani do motivu.

### Formáty

| Formát | Jak skládat |
| --- | --- |
| **homepage** 1500×1200 | text vlevo od x 180, motiv vpravo a velký, logo dole, pravý horní roh (x ≥ 950, y ≤ 280) prázdný pro štítek rubriky |
| **OG** 1200×630 | motiv uprostřed nebo blízko středu, texty jako bloky kolem něj, všechny v bezpečném čtverci x 320–880, y 48–584 (střední čtverec 285–915 s vůlí 35 px); motiv smí přesahovat do boků i za okraj čtverce |
| **čtverec** 1080×1080 | text nahoře, motiv dole a velký, okraj 70 px |
| **Instagram** 1080×1350 | jako čtverec, motiv využije výšku; nic důležitého v horních a dolních 80 px (mřížka profilu 3:4) |
| **story** 1080×1920 | text → motiv → logo pod sebou, obsah mezi horními 250 a dolními 340 px, žádný prázdný pás |

**OG podrobněji** (nejvíc chyb jsme dělali tady):
- WhatsApp, Signal a Messenger ukážou jen střední čtverec 630×630 (x 285–915), Facebook, X a LinkedIn celou šířku.
  Obojí musí fungovat: ve čtverci celý text a logo a rozpoznatelný motiv, na šířku plná kompozice bez prázdných boků.
- **Nevycentrovat text přes motiv.** Text uprostřed přes ztlumenou mapu (Miliarda za volby, větrníky) a motiv
  rozdělený do krajů (dva disky slunečnice na okrajích) nefungovaly: motiv ztratil sdělení, data nebyla vidět.
- **Ani zmenšený čtverec s prázdnými boky** („čtverec s ušima“) není cíl: motiv je malý a boky nic nenesou.
  Zůstává jako nouzové výchozí chování generátoru, když článek vlastní rozvržení OG nemá.
- **Rozložení podle motivu**, vzory z 29. 10. 2026 (Kateřina: „zatím nejlepší výsledek“):
  - *Miliarda za volby* (`volby-cr-2026-10-21-kolik-stoji-volby`): mapa ČR přes střed, titulek vlevo nahoře nad
    Krušnými horami, podtitulek vpravo nahoře, logo vlevo dole pod Šumavou. Mapa je podkres, okraj republiky
    smí do textu zasahovat.
  - *Slunečnice* (`analyza-2026-10-25-poruchy-prijmu-potravy`): jeden disk blízko středu, mírně zmenšený, texty
    a legenda ve sloupci vlevo, logo vlevo dole.
  - *Větrníky* (`analyza-2026-10-23-referenda-vetrne-elektrarny`): mapa přes střed, titulek dole přes jih, kde se
    nehlasovalo, legenda vlevo nahoře, podtitulek vpravo nahoře, logo nad štítkem.
- **Technicky:** `og: 'siroky', ogScrim: false` a textové bloky v `rozlozeni: { og: [{ prvky: ['kicker', 'titulek'],
  x: 320, y: 48 }, { prvky: ['pod'], x: 880, y: 100, vpravo: true }, { prvky: ['logo'], x: 320, y: 584, dole: true }] }`.
  Prvky: kicker, nad, titulek, pod, legenda, logo; `vpravo` zarovná blok k pravé svislici, `dole` ukotví spodní
  hranu. Motiv do středu posune jeho plocha v `motiv.cjs` (např. `og: [1200, 630, [215, 200, 985, 615]]`).
  Velikost titulku jen pro OG: `format: { og: { t: 54 } }`.

### Animace a GIF

- Animace přebírá rozvržení coveru daného formátu; **text a logo stojí po celou dobu na místě**, hýbe se jen motiv.
  Rozvržení se ladí na nejrozsáhlejším snímku (plný stav), ať motiv v žádném snímku nenaráží do textu.
- **První i poslední snímek = hlavní sdělení** (stav „dnes“): je to náhled a statický fallback.
- Homepage GIF má pravidla homepage coveru (logo dole, roh štítku rubriky volný); GIF pro sítě má logo nahoře.
- Podrobnosti (MP4 × GIF, délky, velikosti, LFS): COVER-VIZUALNI-IDENTITA.md → *8. Balík výstupů*.

### Kontrola: vidět, ne předpokládat

Technicky platný render není hotový cover. Hotový je až zkontrolovaný.
1. Vyrenderovat všech pět formátů (zkušebně `--vystup <složka>`, ostře bez něj).
2. Kontaktní arch (`tools/kontaktni-arch.cjs`): všech pět formátů, karty webu, **OG s čárkovaným středním
   čtvercem a jeho ořez ve skutečné velikosti** (ověřit, že žádnému textu nechybí písmena a že má vůli od okraje).
3. Prohlédnout každý formát ve velkém náhledu, pojmenovat konkrétní problém („podtitulek naráží do severních
   větrníků“), změnit jednu vlastnost (polohu bloku, zalomení, plochu motivu, velikost titulku), znovu vyrenderovat
   a porovnat. Neměnit při každé opravě celé rozvržení.
4. Teprve pak ukázat Kateřině: kontaktní arch a samotné soubory homepage, OG a story.

## Generátor, povinná kontrola a ponaučení

**Generátor:** `tools/cover-generator.cjs` + `_cover_pipeline/cover.config.cjs` u článku vyrobí všech pět formátů
(`PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <config>`). Vzory konfigurací: predikce,
výsledky predikce, kalkulačka (tečková mapa ČR + ikona), Bolsonaro (obrázek jako motiv).

**Kompozice a mezery – povinná kontrola před odesláním náhledů (od 27. 10. 2026, Kateřina: „málo se pracuje
s kompozicí a s mezerami, chyby se vrší“).** Platí pro každý cover, grafický i fotografický, a pro každý z pěti formátů:
1. **Motiv je celý.** Hlava, obličej ani postava nesmí být useknutá okrajem formátu, okrajem výřezu ani přechodem
   do navy. Výřez fotky začíná nad hlavou s rezervou (aspoň půl výšky hlavy). Přechod smí ztmavit jen pozadí
   (nebe, klenbu, prázdný kraj), nikdy hlavy, text v koláži ani podstatnou část motivu. Když už zdroj hlavu ořezává
   (screenshot, koláž), ořez ani přechod to nezhorší a Kateřina se to dozví.
2. **Výškové formáty využijí výšku.** Na 4:5 a story má motiv zabrat většinu plochy mezi textem a logem, ne úzký
   pás uprostřed prázdné navy. Když se motiv nevejde, zmenši titulek (`format.story.t`), ne motiv.
3. **Na výšku pořadí text → motiv → logo.** Logo stojí na volné navy ploše pod motivem, nikdy přes něj (halo loga
   přes nohy sochy působilo jako „záclona“).
4. **Story:** nic důležitého v horních 250 a dolních 340 px, obsah vycentrovaný mezi těmito pásy, pozadí čisté
   ink blue `#101432` bez záře.
5. **Text a motiv: rozhoduje čitelnost, ne dotyk** (upraveno 28. 10. 2026, Kateřina: „není potřeba ucukávat před
   každou čárkou v podkladu“). Text smí do motivu zasahovat, i celý, když leží na klidné tmavé části nebo na
   ztmaveném okraji motivu. Vadí jen světlé nebo rušné místo pod bílým textem. Pak pomůže měkký podklad pod drobným
   textem, stín kolem písmen titulku, užší zalomení nebo posun motivu. Nikdy ne tmavý blok pod velkým titulkem
   (viz Ponaučení 28. 10.). Zalomení je běžný nástroj: jednopísmenné předložky a spojky nikdy na konci řádku.
   Kontrolovat na největším náhledu, ne na zmenšenině.
6. **Zapečené prvky zdroje** (logo, datum „únor 2026“, popisky screenshotu) se odříznou výřezem, nepřetírají se.
7. **Kontaktní arch je pomůcka:** zóny jsou jen čárkované obrysy a v obrázku nejsou. Kateřině posílat i samotné
   soubory homepage, OG a story, ať nemusí rozlišovat kontrolní značky od obsahu.
8. **Převod hotového coveru** (Kateřina: „nech fotku i wording“) mění jen sazbu do formátů. Motiv, barvy a texty
   zůstávají, každý formát se ale kontroluje podle bodů 1–7 stejně jako nový cover.
9. **Fotka jako podkres = celá plocha, ne okno** (Kateřina 27. 10. 2026: „žádné divné oseklé fotky“). Když má fotka
   sloužit jako podkres (satelitní snímek, krajina, město), vyplní celý formát ve všech pěti velikostech včetně boků OG
   (`og: 'siroky'`). Čitelnost textu zajistí závoj v ink blue (celoplošně asi 0,3 a k textu přechod do ~0,6), text
   smí do fotky zasahovat. Nedělat z ní malý výřez, pás ani okno s měkkými okraji uprostřed prázdné navy. Body 2–3
   (motiv mezi textem a logem) platí pro motivy, které podkresem nejsou. Pro podkres volit spíš odzoomovaný záběr.
   Snímky se zapečenými popisky uvnitř (štítky čtvrtí, data) se na podkres nehodí: rozmazané popisky prosvítají jako
   šmouhy. Vybrat snímek bez nich, nebo popisek v rohu odříznout výřezem. Vzor:
   `kontext-2026-10-27-komise-osn-zlociny-proti-lidskosti-na-zapadnim-brehu/_cover_pipeline/cover.config.cjs`.

**Automatické pojistky (od 28. 10. 2026).** Body výše hlídá z velké části `tools/cover-generator.cjs` sám, takže
na oko zbývá motiv, sdělení a celkový dojem:
- **Text coveru z článku.** Schválený text coveru patří do frontmatteru článku: `coverTitulek` (zalomení přes `<br>`)
  a případně `coverPodtitulek`. Generátor ho vezme odtud; když konfigurace obsahuje jiný text, nevyrenderuje nic a
  ohlásí rozpor. Bez `coverTitulek` aspoň vypíše titulek článku vedle titulku coveru. Proč: cover k vyznamenáním
  zůstal se starým „dvakrát častěji“, i když se titulek článku změnil, protože text coveru byl ruční kopie.
- **Rozvrh a kontrola kompozice v každém formátu.** Generátor vyfotí motiv zvlášť bez textu a změří, jak světlé je
  místo pod každým textem. Na světlé části motivu dá drobnému textu (podtitulek, legenda) měkký podklad a titulku se
  štítkem stín kolem písmen. Když text leží na světlé ploše z velké části, zalomí ho užeji, aby skončil před motivem.
  Logo na světlém motivu zkusí přesunout do druhého dolního rohu. Za jednopísmenná slova dává nezlomitelnou mezeru.
  **Chybou** je jen to, co takhle opravit nejde, text mimo bezpečnou zónu (story: horních 250 a dolních 340 px) a
  OG nad 300 kB. **Upozorněním** je text nebo motiv v rohu štítku rubriky (homepage x ≥ 950, y ≤ 280) a prázdný pás
  přes výšku story a 4:5. Co generátor upravil, vypíše (↻), chyby a upozornění vyznačí do
  `_cover_pipeline/_kontrola-<formát>.png` (mimo git). Vědomou výjimku zapiš do konfigurace:
  `kontrola: { prekryv: true | ['legenda'] | { story: ['legenda'] }, duvod: '…' }`.
- **Razítko.** Generátor zapíše vedle konfigurace `<config>.razitko.json` (texty, titulek článku, otisky vstupů a
  obrázků, výsledek kontroly). Razítko patří do gitu. `apps/web/scripts/checkArticles.js` (před commitem i při buildu)
  podle něj zastaví cover, když se od renderu změnil titulek článku nebo `coverTitulek`, konfigurace či motiv bez
  nového renderu, obrázek mimo generátor, nebo když cover neprošel kontrolou. Covery bez razítka (starší, editor)
  se zatím nekontrolují.
- Zkušební render jinam, bez razítka: `node tools/cover-generator.cjs <config> --vystup <složka>`.

**Ponaučení z oprav (zapisovat sem, ať se chyby neopakují; co platí obecně, přenést do kapitoly *Kompozice podle
formátu*):**
- *29. 10. 2026 – OG naležato u tří datových coverů (Miliarda za volby, slunečnice, větrníky).* Staré OG měly text
  na středu přes ztlumený motiv, nebo motiv rozdělený do krajů; výchozí „čtverec s ušima“ zase nechal motiv malý
  a boky prázdné. Přeskládáno: motiv do středu, texty jako bloky kolem, vše ve čtverci s vůlí 35 px (první verze
  měla text přesně na hraně čtverce, ve WhatsApp ořezu pak písmena seděla na okraji). Legendy zjednodušeny (jen
  zvýrazněná kategorie; společné slovo jako nadpis). Pravidla jsou v kapitole *Kompozice podle formátu*.
- *28. 10. 2026 – medaile z teček (státní vyznamenání, ženy a „Komu prezidenti dávají medaile“).* **Využít prostor:** motiv nenechávat v pravém dolním rohu, posunout ho výš a blíž k textu a zvětšit, dokud stuha/okraj nenarazí do titulku, legendy, loga nebo zóny štítku rubriky. Dlouhý podtitulek rozdělit na dva řádky (`<br>`), aby se uvolnilo místo. Rozložení ladit **zvlášť pro každý článek**, když se liší délka titulku nebo legendy (třířádkový titulek → medaile níž; delší legenda ve story → medaile níž, logo nesmí ležet na motivu). Po každé změně zkontrolovat všech pět formátů na kontaktním archu, ne jen homepage. **Legenda patří jen k motivu, který vysvětluje:** „uprostřed Havel, na okraji Pavel“ ke cover s barvami prezidentů, ne ke coveru žen; údaje (1995–2025) psát v obou sesterských coverech stejně. **Barvy pohlaví bez stereotypu:** ženy světle béžová (background.2) na modré medaili mužů (brandRoyalBlue.6), obojí z trikolóry stuhy. Homepage GIF (pomalé problikávání žen, 45s cyklus, každá tečka jednou) vzniká z `animace.config.cjs` přes `medaile()` z motiv.cjs; delší GIF než 8 s jen výjimečně (`gif.delka`), hlídat velikost (~5 MB).
- *28. 10. 2026 – automatické pojistky (vyznamenání, Brazílie).* Story k vyznamenáním: legenda přes bílý pruh stuhy,
  logo přes spodek medaile, starý text titulku. Kateřina: mírný přesah textu přes motiv je v pořádku, jen musí být
  čitelný (podklad, stín, lehký fading). Proto kontrola měří světlé místo pod textem, ne dotyk. Záře pozadí se
  nepočítá: **bílý titulek na zlaté záři u Brazílie svítí a funguje**, kdežto pokus dát pod titulek „Proč vyhrál
  Lula“ tmavý ink blue blok vypadal ošklivě a nefungoval. Pod velký titulek nikdy tmavý obdélník, nanejvýš stín
  kolem písmen. U Brazílie lze příště vyzkoušet slabší podbarvení podtitulku uprostřed mapy (podklad je tam
  tmavý přechod ze žluté do modré).
- *28. 10. 2026 – covery kapitoly Demografie (speciál Data pro budoucí premiérku), systém bez fotek.* Generátor je `apps/web/app/specialy/data-pro-budouci-premierku/_cover_pipeline/covery.cjs` (zadání deseti coverů v `DEF`, motivy v `MOTIVY`): nahoře velké logo speciálu (hlava s tečkami) + „Data pro budoucí premiérku“, vpravo nahoře štítek „Analýza • Kapitola 1 Demografie“, pak velký titulek (hlavní sdělení), podtitulek **bez tečky** (je to statement, ne věta), jeden motiv z čísla článku, dole logo DataTimes.cz. Barva dat = barva kapitoly z `dpbpChapters.json` (kapitola 1 vivid red `#de1743`), pozadí ink blue se zářemi. Popisky motivů musí být srozumitelné bez čtení článku („dnes: 128 dětí na 100 žen“, ne „chybí do 210“), titulek ukazuje souvislost s Českem. Dlaždice kapitoly berou obrázek z `image` v `_meta.json` (má přednost před `coverImage` ve frontmatteru, který je OG ke sdílení); staré `pout-*` covery se už pro dlaždice nepoužívají. Starší pokusy (fotky z mobilu pod oponou, kontura hlavy přes celou výšku, tečkové postavičky) Kateřina zamítla: přeplácané, bez jasného sdělení.
- *27. 10. 2026 – převod pěti starších coverů k Izraeli/Gaze do formátů a cover článku o komisi OSN.* Opakované
  chyby, ze kterých vznikla kontrola výše: titulek přes obrys mapy ve čtverci a OG (komise OSN, opraveno menším
  titulkem a posunem mapy); story se sochou Spravedlnosti, kde socha končila u dolního okraje a logo leželo přes
  nohy; pás satelitního snímku Gazy s viditelným zapečeným štítkem „únor 2026“; koláž s přechodem nahoře, který
  ztmavil hlavy dětí, a výřezem, který usekl tweet; story s malým pásem fotky a prázdnou navy plochou. Kateřina navíc
  četla vínové výplně zón v kontaktním archu jako součást obrázku, proto `tools/kontaktni-arch.cjs` kreslí zóny jen
  čárkovaně. Koláž ze screenshotů: prvky zapečené v jedné fotce (výstřížek Guardianu ve fotce BBC) přesunout nejde,
  pod nimi nejsou pixely. Zachovat původní rozložení koláže a vzít ji celou (i s přečnívajícím tweetem), mimopaletový
  podklad zdroje zakrýt ink blue; zvětšený výřez tweetu přes roh zakryl titulek BBC „warning“ (vzor `maska()` v
  `kontext-2025-05-22-bezpodminecna-podpora-izraele-poskozuje-nasi-bezpecnost/_cover_pipeline/cover.config.cjs`).
  Vzor fotky v pásu s přechody: `_cover_pipeline/foto.cjs` u článku
  `analyza-2026-08-25-evropske-soudy-a-nenavist-palestinci-izraelci` (story: výřez nad závojem, socha nad logem).
- *26. 10. 2026 – článek speciálu Data pro budoucí premiérku bez obrázku v rubrice Volby.* Články speciálu
  (`_content/*/articles/*.mdx`) mají jako `coverImage` jen poutač speciálu 1200×630; do homepage a rubrik je
  `components/common/getDpbpArticles.ts` dřív posílal bez obrázku. Teď bere `homepageImage` (absolutní cesta).
  Sada pěti formátů se generuje do `_articles/data-pro-budouci-premierku-02-demografie/images/cover-<slug>/`
  (vzor `_cover_pipeline/15-volicska-zakladna.config.cjs`) a do mdx se doplní `homepageImage`,
  `squareImage`, `instagramImage`.
- *26. 10. 2026 – fotky politiků (Merz, Putin, billboard): kompozice ve všech formátech.* Každý formát kontroluj
  zvlášť ve velkém náhledu (homepage, čtverec, 4:5, story vedle sebe ve výšce 960 px), ne na malém archu.
  - Fotku ukotvi na obličej: `podkres(…, { bod: { fx, fy, X, Y, sirka, pomer } })` posadí bod obličeje na (X, Y).
    Hlava nikdy pod textem, logem ani přechodem. Titulek s pruhem patří na úroveň hrudníku, ne přes hlavu.
    Logo nikdy přes tváře nebo krky („šála“): pás fotky pod titulkem a logo pod ním.
  - Ve story dej text nad fotku, nebo fotku nad text. Nikdy přes sebe.
  - Titulek raději na méně řádků menším písmem (`pro.story.titulek` + `format.story.t`) než tři řádky přes motiv.
  - Barvu nese pruh titulku → pozadí čisté ink blue bez záře (záře zhoršila čitelnost karmínového štítku).
  - Široké OG (`og: 'siroky'`, `ogScrim: false`): text ve středním čtverci, postava zasahuje do čtverce zprava.
    Text smí na rameno, nikdy na obličej. Stejné mezery mezi štítkem, nadtitulkem, pruhem a podtitulkem:
    `mezery: { og: [a, b, c] }` (px). Logo na úrovni spodního okraje fotky.
  - Zdrojová fotka může mít hlavu uříznutou už sama (Merz: temeno v horní řadě pixelů). Pak pomůže jen
    neořezaná fotka; nedomalovávat.
  - Štítek na světlé fotce: `kickPodklad: '#101432e6'`.
  - Když se Kateřině líbí původní cover (Die Linke), nepřepracovávat. Jen ho převést do chybějících formátů
    stejným skriptem (`_cover_pipeline/cover.cjs`). Před převodem ověř, který cover myslí: u kalkulačky „míří
    do obcí“ chtěla už hotovou verzi s mapou, ne původní logo.
- *26. 10. 2026 – dva sousední články se stejným motivem (STOP s dlaní × STOP s rukama).* Než motiv navrhneš,
  podívej se na covery článků se stejnými tagy (zvlášť ty, které se ukážou v related boxu vedle sebe). Stejný
  nápad dvakrát v řadě karet působí jako duplikát. Starší článek o znásilnění dostal tečkovou slunečnici
  (100 teček, 11 karmínových = oběti, které šly na policii), vzor
  `analyza-2026-10-08-znasilneni-nahlasovani-objasnenost-a-tresty/_cover_pipeline/motiv.cjs`.
- *26. 10. 2026 – OG s mapou (Brazílie, proč vyhrál Lula).* Vycentrovaný OG s mapou jako slabým pozadím nestačil:
  text zarovnat doleva od levého okraje středního čtverce a mapu dát do jeho pravé části, **celou uvnitř čtverce
  285–915 px**, jinak messengery ořežou nejdůležitější body (velká města na východním pobřeží). V configu
  `format: { og: { stred: false, box: [285, 50, 915, 580] } }` a mapa přes `mapaPozice.og` (od 29. 10. text s vůlí
  od x 320, viz *Kompozice podle formátu*; vzor
  `volby-brazilie-2026-10-26-proc-vyhral-lula/_cover_pipeline/`).
  Když motiv vpravo dole zakrývá logo (jih Brazílie), `logoPodLegendou: true` dá logo vlevo dolů a legendu o dva
  řádky výš nad něj (ve všech formátech). Barvy bodů na mapě cizí země mohou nést její vlajku (Brazílie: žlutá
  brandYellow.6 × zelená brandEmeraldMint.6 na modrém podkladu).
  Jemné posuny v jednom formátu: `format: { square: { podDolu: 2, legNahoru: 2 } }` posune podtitulek o 2 řádky
  níž a legendu o 2 řádky výš (vyplní volnou plochu vlevo). Mapu jako podkres zvětšovat tahem za roh proti
  nejdůležitějším bodům (u Brazílie levý horní roh, pravý okraj drží města na pobřeží), klidně až k titulku.
- *25. 10. 2026 – fotka jako motiv pod navy závojem (bingo, STOP s dlaní místo „O“).* Podkladová fotka nesmí mít
  viditelný rámeček: okraje maskovat obdélníkem s Gaussovým rozmazáním (`motiv.typ: 'svg'`, vzor
  `analyza-2026-10-21-bingo-domaci-a-sexualni-nasili/_cover_pipeline/motiv.cjs`) a pod světlé partie u okraje
  (tričko, čelo) dát navy přechod. Kontrolovat výřezem se zesíleným kontrastem ve všech formátech. Ruční obrys
  (lasso) ruky ve fotce nesedí podél prstů ani po přichycení na hrany. Pozadí za rukou tlumit jen měkkým přechodem
  bez obrysu. Zvýšený kontrast a teplý tón fotky se neosvědčily, ruka zůstává v přirozené barvě. Písmena motivu
  v karmínové #de1743. Písmena motivu (bez dlaně) centrovat svisle na střed mezi spodní okraj podtitulku a horní okraj
  kolečka loga (měří `zmer.cjs`), dlaň zůstává na svém místě. Konečky prstů nesmí zasahovat pod podtitulek, jeho halo je usekne.
- *24. 10. 2026 – jméno místa patří přímo na mapu (Mariánské Lázně, kupování hlasů).* Když cover stojí na jednom
  zvýrazněném místě, Kateřina chce jeho název u tečky, ne jen ve štítku nebo v legendě v rohu. Generátor umí
  `popisek` u bodu (`motiv.body: [{ lon, lat, k, popisek: 'Mariánské Lázně' }]`): Plex Sans s obrysem v barvě pozadí,
  vpravo od tečky, v OG pod ní (jinak naráží do titulku uprostřed). Téma kauzy (např. „Podezření na kupování hlasů“)
  patří do štítku coveru.
- *24. 10. 2026 – v OG coveru zmizela mapa ČR (referenda o větrnících).* Generátor i vzorové `motiv.cjs` u OG
  tečkovou mapu tlumí (tečky 0,35, `opacityOg` 0,45), takže zůstaly jen značky obcí a obrázek nedával smysl.
  Když motiv stojí na tvaru republiky (body obcí, ikony v místech), musí být mapa čitelná i v OG: tečky plně,
  `opacityOg: 1`. Čitelnost textu drží halo generátoru. OG kontrolovat vedle homepage, ne jen samotný.
  (Rozvržení OG s textem na středu bylo 29. 10. nahrazeno, viz *Kompozice podle formátu* → OG.)
- *23. 10. 2026 – cover kapitoly Demografie (speciál Data pro budoucí premiérku).* U karet speciálu je štítek rubriky na dlaždici vpravo na úrovni titulku (`DpbpArticleCard`), ne jako červený oválek přes obrázek, takže zóna x ≥ 950, y ≤ 280 zde odpadá. Cover kapitoly: nahoře zleva logo speciálu (hlava s tečkami, otočená doprava) a „Data pro budoucí premiérku“ v jednom řádku, pod tím „Kapitola 1 • Demografie“, pak velký titulek; krémové pozadí jako na webu. Dětský graf plodnosti (děti na bodech grafu) je zdroj `plodnost-3.webp` z karty článku, ne SVG náhled (ten se v prohlížeči nenačte). Dlaždice kapitoly umí vlastní `image` + `imageAspect` a `showOpener` v `_meta.json` (úvodní článek jako první dlaždice).
- *16. 10. 2026 – titulek se v každém formátu lámal jinak (ODS a Piráti).* Titulek coveru má mít ve všech pěti
  formátech stejné zalomení. Řádky určit ručně přes `<br>` a kde se řádek do užšího formátu nevejde (typicky
  story), zmenšit jen jeho titulek přes `format: { story: { t: 88 } }` v `cover.config.cjs`. (Podtitulek a legenda
  se smějí v jednom formátu zalomit jinak, když to rozvržení potřebuje, viz *Kompozice podle formátu*.) Na kontrolním listu
  projít všechny formáty vedle sebe. Rivalské strany (ODS × Piráti) v titulku nesčítat do jedné věty, každá dostane
  vlastní údaj („ODS ztratila / čtvrtinu zastupitelů, / Piráti rovněž“).
- *15. 10. 2026 – „v“ na konci řádku v titulku karty na sítě.* Karty a dlaždice vykreslované mimo web (Playwright
  šablony v `_cover_pipeline/`, např. `karty.cjs`) nejdou přes `fixCzechTypography`. Titulky a podtitulky v nich
  proto prohnat vlastní funkcí, která za jednopísmenné předložky a spojky (v, k, s, z, o, u, a, i) dá nezlomitelnou
  mezeru, a v kontrolním listu projít zlomy řádků ve všech formátech.
- *14. 10. 2026 – useknutý titulek v boční kartě titulky („Kdo zůstal doma“).* Cover byl v pořádku; chyba byla
  v kartě, která se u dlouhého titulku protáhla a náhled ořízla na střed. Opraveno v komponentě (boční karty
  cover 5:4 nikdy neořezávají, viz `packages/ui/DESIGN.md` → *Hero side cards*). Při podobné chybě nejdřív
  porovnat soubor v repu s webem a změřit rámeček karty, teprve pak sahat na cover.
- *14. 10. 2026 – ikona přes štítek a titulek (kalkulačka, čtverec/IG/story).* U dlouhého titulku generátor
  nehlídá kolizi ikony s textem. V kontrolním listu projít **všech pět formátů**, nejen homepage, a kolizi
  řešit přes `ikonaPozice` v cover.config.cjs. (Kalkulačka zatím neopravena – čeká na revizi coverů v UKOLY.md.)
- *14. 10. 2026 – obrázek v kartě nejde otevřít v nové kartě.* Obrázek karty patří do `<img>`, ne do CSS
  `background-image`, a vrstvy nad ním (gradient, titulek) mají `pointer-events: none`; karta zůstává odkazem.
  Platí pro karty článků (`ArticleCard`) i speciálů (`SpecialsHero`).
- *14. 10. 2026 – OG obrázky speciálů.* Sítě a messengery SVG neumějí (klima, KVIFF, Svobodná média měly SVG,
  investigace odkaz na neexistující JPG, DPBP žádný). OG speciálu = obrázek jeho karty na titulce, vyrobený
  `tools/specials-og.cjs` do `public/images/specials/og/<název>.jpg`; po změně obrázku karty skript spustit znovu.
  Boky 1200×630 jsou **gradient od barvy kraje do nejtmavšího odstínu téže škály palety** – nikdy rozmazaná ani
  protažená kopie obrázku (působí zdvojeně a rušivě, Kateřina).
- *14. 10. 2026 – karta speciálu Volby 2026.* Logo DataTimes.cz samotné jako kolečko, bez dlaždice, obrysu
  i stínu; za ním tři světla v barvách jeho částí (červené, bílé, modré).
- *14. 10. 2026 – nový obrázek „není vidět“ ani po refreshi.* Web posílá obrázky s cache 4 hodiny
  (`max-age=14400`), takže obrázek přepsaný pod **stejným jménem** prohlížeč dál bere z cache. Při výměně
  obrázku karty/coveru buď nové jméno souboru, nebo verze v odkazu (`volby-2026.svg?v=2026-10-14`). Ověřit:
  `curl -s <URL> | grep <něco z nové verze>` – když server vrací novou verzi, chyba je jen v cache.

Původní vzor generátoru pro grafické (ne fotografické) covery a kontrolní list ořezů:
`apps/web/app/clanek/_articles/volby-cr-2026-10-10-senat-komunalni-2026-predikce-vysledky/_cover_pipeline/`
(`cover.cjs`, `nahledy.cjs`). Hotový prompt pro zadání coveru AI: [PROMPT-COVER.md](PROMPT-COVER.md).
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
`instagramImage` je jen záznam sady coverů; v kartě se nezobrazuje (odkaz „Instagram ↗“ zrušen 25. 10. 2026, viz `packages/ui/DESIGN.md`).
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

Před publikací zkontroluj všech pět souborů: čitelnost, ořez hlavního
motivu, loga a velikost (postup v kapitole *Kompozice podle formátu* → *Kontrola*). Cíl pro OG je přibližně 150–500 kB. Automatická
sazba nenahrazuje redakční kontrolu fotografie ani délky titulku.

## Ověření

```sh
node tools/test-cover-geometry.cjs
node tools/test-cover-text.cjs
node tools/test-cover-project.cjs
npx tsc --noEmit --incremental false -p apps/web/tsconfig.json
```
