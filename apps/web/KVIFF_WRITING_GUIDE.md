# KVIFF_WRITING_GUIDE.md – psaní a stavba speciálu „Karlovy Vary v datech"

Pravidla pro obsah, grafy a strukturu `/specialy/kviff` (`apps/web/app/specialy/kviff/`). Destilováno z redakčního auditu 2026-07-12 (viz shrnutí níže) – účel je zabránit stejným chybám v nových kapitolách (`temata-filmu`, `trzby-filmu`) a při revizích hotových.

Technický layout: `data.ts` (`KviffBranch[]`), `page.tsx` (landing), `[slug]/page.tsx` (kapitoly). Sdílené vizuální komponenty v `ChartFrame.tsx`, `ChartLegend.tsx`.

---

## 1. Stav kapitoly musí být viditelný, ne jen v hlavě autora

Každá položka v `kviffBranches` má pole `status: 'draft' | 'research' | 'ready'` – **tohle už existuje a používá se** (badge na landing page, `page.tsx` kolem řádku 289: „hotová osa" / „datová metodika" / „kapitola speciálu"). Při psaní nové kapitoly nebo revizi:

- `ready` = data ověřená proti zdroji, graf hotový, text v dokonavém čase. Žádné „budeme evidovat", žádné „bude postavená".
- `research` = otevřeně rozpracované – text i badge to musí přiznat. Budoucí čas je tady v pořádku (viz `temata-filmu` v `data.ts`), protože je jasně označen jako rozpracovaný, ne skrytý v souvislém odstavci vedle hotových zjištění.
- Nikdy neoznačuj `ready`, dokud je v textu byť jedna věta popisující budoucí sběr dat jako aktuální stav kapitoly (výjimka: explicitně vyčleněná metodická poznámka o dílčím omezení – viz bod 4).

Než přidáš/měníš `excerpt`, zkontroluj, že popisuje **hotové zjištění**, ne téma ani proces psaní.

## 2. Titulek je zjištění, ne téma

Špatně: „Gender ve Varech", „Festivalové filmy a tržby" jsou názvy sekcí, ne titulky.

Dobře (viz `oceneni-v-datech`, `crystal-globe` v `data.ts`): titulek nese napětí nebo konkrétní číslo. Než kapitolu publikuješ, zkontroluj `title` i `excerpt` podle tohoto vzoru – např. `excerpt` u `oceneni-v-datech` už to dělá správně: „...dlouhá mužská řada s několika málo ženskými vlnami" místo neutrálního „genderová statistika ocenění".

Když už název kapitoly v menu/URL zůstává obecný (`Gender ve Varech` jako kicker/slug je OK pro navigaci), **titulek uvnitř kapitoly a `excerpt` na landing page musí nést zjištění**, ne opakovat obecný název.

## 3. Terminologická přesnost: Crystal Globe / Křišťálový glóbus

`crystal-globe` a `hoste-a-prestiz` už rozlišují **soutěžní** Grand Prix – Křišťálový glóbus (od 1948, hlavní porota) od **čestného** Křišťálového glóbu za mimořádný umělecký přínos (od 1995, osobnosti) – viz `data.ts` řádky 68–73 a 101–104. **Toto rozlišení se nesmí při editaci ztratit** – je to přesně ten bod, kde si čtenáři i sekundární přehledy ceny běžně pletou.

Historické státy (Československo, SSSR, NDR) necháváme tak, jak je uváděl dobový archiv – nepřepisovat na dnešní hranice (viz `data.ts:72`). Anglický název „Crystal Globe" v titulku kapitoly je vědomá výjimka pro známost značky; v běžném textu používej Křišťálový glóbus/glóbusu.

## 4. Metodická poznámka smí být v budoucím čase – ale musí být oddělená a označená

Je v pořádku napsat „tohle zatím neumíme spočítat stejnou metodou" (viz `[slug]/page.tsx` – „Do roku 1989: zatím ne stejnou metodou", „Fractional count zatím kreslit nebudeme"). To je poctivé přiznání limitu dat, ne rozpracovanost celé kapitoly.

Rozdíl, na kterém to stojí:
- **OK:** hlavní zjištění je hotové a stojí samo o sobě; vedle něj jedna zvlášť vizuálně oddělená karta/poznámka říká, co konkrétně (jedna dílčí metoda, jedno období) ještě není spočítáno a proč.
- **Špatně:** budoucí čas nese samotné hlavní sdělení kapitoly, nebo se metodická poznámka objevuje v hlavním odstavci vedle zjištění bez vizuálního oddělení (samostatný `Paper`/box, ne splynutí s okolním textem).

## 5. Čísla vždy s jmenovatelem, unknown se nezamlčuje

Podíl bez základu je zavádějící. `honoraryWomenShare` v `honors.ts` a text u `oceneni-v-datech` („Žen je 11, tedy 17,7 %") správně uvádí obojí. Když přidáváš nové procento:
- vždy ukaž i absolutní počet a celkový základ (X z Y),
- pokud existují nedoložitelné/unknown případy, zahrň je do textu i grafu jako vlastní kategorii, ne jako tichý odečet ze jmenovatele (viz bod „Neměříme odhady podle jmen" v `data.ts:119-121` – zatím 0 unknown případů, ale kategorie musí zůstat připravená, až nějaký nastane).

## 6. Graf nese tvrzení, ne jen téma

Titulek grafu/karty má tvar tvrzení („Odpověď: Evropa zůstává jádrem, koprodukce sílí" – `[slug]/page.tsx:515`), ne popisku („Země v čase"). Struktura karty s grafem:

1. Tvrzení v titulku
2. Krátký podtitulek/definice, pokud pojem není samozřejmý
3. Graf
4. 1–3 anotace/klíčové hodnoty vypsané přímo v textu (ne jen v tooltipu – na dotykovém zařízení tooltip často není dostupný)
5. Zdroj + metodická poznámka, pokud je potřeba

## 7. Mapy jsou doplněk, ne hlavní graf

`HistoricalCountryMap.tsx` existuje, ale hlavní čtení má vždy být seřazený graf/tabulka (viz `countryPresenceTop` použití v `[slug]/page.tsx`). Mapa je vizuálně efektní, ale u koprodukcí, malých zemí a historicky proměnlivých hranic (Československo, Jugoslávie) zkresluje – nikdy ji nenech nést zjištění samostatně bez doprovodného seřazeného přehledu.

## 8. Jedna barva na jeden význam napříč celým speciálem

Barvy z `accent` v `data.ts` patří konkrétní kapitole – nepoužívej stejnou barvu pro jiný význam v jiné kapitole (kontrast k pravidlu z `SPECIAL.md` pro DPBP: tam je `accent` per-kapitola identita, tady analogicky). Uvnitř jedné kapitoly: pokud barva jednou znamená ženy/menšinu, nesmí ve stejném grafu nebo sousední kartě znamenat něco jiného.

## 9. Návštěvnost a podobné „ekonomika pozornosti" metriky nesmí míchat jednotky

Vstupenky, unikátní návštěvníci, akreditace, pasy, projekce, novináři – to jsou různé populace/jednotky (viz `ekonomika-pozornosti`, `stats.ts`: `ticketShare2026`, `passesShare2026`, `journalistsShare2026` už jsou drženy jako oddělená pole, ne sečtené do jednoho čísla). Při psaní textu okolo nikdy nenapiš „128 133 návštěvníků" – je to „128 133 prodaných vstupenek" (viz `page.tsx:40` – správně už teď). Kontroluj to zvlášť u nových vět, snadno se to sveze zpátky do zkratky.

## 10. Zdroje patří do patičky/metodiky, ne do hlavního odstavce

`kviffSources` v `data.ts` a blok „Zdroje a interpretační vrstva" na landing page (`page.tsx`) jsou správné umístění. Nový text u kapitoly nemá vyjmenovávat databáze (Wikidata, IMDb, TMDb...) v souvislém odstavci – zdroj patří k patě stránky nebo ke konkrétnímu tvrzení, které podpírá.

## 11. Responzivita heroes/vizuálů: nikdy jeden zploštělý obrázek s vsazeným textem/logem

Původní hero `page.tsx` používal jediný plochý `karlovy-vary.svg` (fotka + soška + baked-in nápis „VARY" + DataTimes logo sloučené do jednoho rastrového/vektorového kompozitu) jako `background-image` s `cover`. Protože se poměr stran boxu (fixní `minHeight`, šířka podle viewportu) mění napříč breakpointy jinak než poměr obrázku, `cover` ořezával nepředvídatelně – jednou stranami (zasáhlo to nápis „Vary"), jednou nahoře/dole. Dočasná oprava na `contain` (2026-07-12) ořez sice odstranila, ale pořád šlo o jeden nedělitelný obrázek.

**Finální řešení (2026-07-12):** hero rozdělen na samostatné prvky, každý se škáluje nezávisle přes `clamp()`/`object-fit: contain`, žádný nikdy neořezává druhý:
- `public/images/specials/karlovy-vary-statue.webp` – soška (trofej) vyříznutá z originálu jako transparentní výřez, `height: clamp(...)`, `object-fit: contain`.
- `VaryWordmark.tsx` – nápis „VARY" jako samostatná inline SVG komponenta (vektorové obrysy vytažené z originálu, ne raster) s `fill="currentColor"`, barvitelná přes `color`. Nikdy nepoužívat `<img>` na externí SVG, pokud potřebuješ komponentu obarvovat/škálovat přes CSS – inlinovaný `<svg>` v TSX to umí, externí soubor přes `src=` ne.
- Barva nápisu i hlavičkové pozadí vycházejí z autentické barvy z originálu (`#522a7a`), pozadí je tmavší varianta stejného odstínu (`#1f102e`, kalibrováno na podobnou světlost jako `brandNavy-9`) – nejde o barvu vymyšlenou nazdařbůh.
- Původní `karlovy-vary.svg` zůstává zachovaný jen pro `og:image`/meta cover (`COVER` konstanta v `page.tsx`) – tam je pevný 1200×630 kontext sociálních sítí, ne responzivní CSS box, takže `cover`/ořez tam neplatí stejné riziko.

Totéž pravidlo (rozdělit na nezávisle škálovatelné prvky, nikdy jeden plochý kompozit) platí pro `HistoricalCountryMap.tsx` a jakýkoli budoucí komponent kombinující text/logo/foto s pevným poměrem stran – vždy zkontrolovat chování při šířkách 320/360/390/768px, ne jen na desktopu.

## 12. Tabulky a tooltipy na mobilu

Klíčové hodnoty z tooltipu musí být čitelné i bez hoveru (dotykové zařízení) – buď přímo v textu u grafu, nebo v přístupné tabulce pod ním.

## 13. Časová osa: vždy sdílená `components/common/Timeline`, ne bespoke komponenta

Bývalá kapitolová komponenta `VerticalTimeline.tsx` (vlastní cik-cak osa) měla na mobilu bug – svislá osa byla přišpendlená na `left: 50%` bez ohledu na to, že mobilní grid mění sloupce, takže na úzkých šířkách protínala text karet. Nahrazeno sdílenou `components/common/Timeline.tsx` (stejná komponenta jako v `<Timeline yamlFile="..." />` u článků) – 2026-07-12, viz `[slug]/page.tsx` (`festivalTimelineContent`, `pre1989AwardsTimeline`).

Pro éry/období (ne přesná kalendářní data) nastav `date` na volný text ("1959–1990", "60. léta") – `formatEventDate` v `Timeline.tsx` se pokusí naparsovat ISO/JS datum, a když se to nepovede, zobrazí `date` beze změny. Žádné nové pole ani úprava sdílené komponenty nejsou potřeba.

Zvýraznění klíčové položky (dřív větší kolečko `highlight`) nahraď barevným `facets` záznamem s vlastní `facetGroups` kategorií (např. `{ key: 'zlom', label: 'Metodologický zlom', color: 'brand.6' }`) – dá to barevný okraj karty a filtrovací pilulku navíc, ne jen kosmetickou velikost.

---

## Otevřené položky z auditu 2026-07-12 (k ověření/doladění, ne vymyšlené nanovo)

Toto NENÍ seznam k mechanickému odškrtání bez ověření zdrojů – u obsahových tvrzení vždy porovnat s `_pipeline/` daty, ne jen přepsat formulaci:

- Landing page karty kapitol (`page.tsx`, sekce „Analýzy") ukazují titulek + excerpt + badge stavu, ale ne datum poslední aktualizace. Zvážit doplnění.
- `temata-filmu` a `trzby-filmu` zůstávají `research` – platí bod 1, nepovyšovat na `ready`, dokud text neopustí popis budoucí metodiky jako hlavní sdělení.
- Zkontrolovat, jestli nasazená produkční verze (mahdalova-skop.cz) odpovídá tomuto stavu repozitáře – audit mohl vzniknout na starší nasazené verzi, zatímco zdrojový kód už řadu bodů (stavové badge, terminologie Crystal Globe, unknown kategorie u genderu, oddělené zdroje) řeší.
- Alt texty, kontrast pomocných/zdrojových textů a klávesnicová ovladatelnost grafů/map nebyly v tomto auditu ověřeny v prohlížeči – projít samostatně.
