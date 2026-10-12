# Prompt: cover k článku (společný pro Kateřinu i Michala)

Jediná verze zadání – stejná pro oba. Pravidla, ze kterých vychází, jsou v [COVER-EDITOR.md](COVER-EDITOR.md).
Většinou ho není třeba vkládat: Claude i Codex čtou pravidla z `CLAUDE.md` / `AGENTS.md` samy, stačí napsat
„udělej k článku <slug> cover“. Prompt slouží pro ruční, podrobné zadání.

Zkopíruj celý blok níže do Claude / Codexu v repozitáři `mahdalova-skop` a doplň tři řádky nahoře.
Výsledkem je sada pěti coverů, kontrolní list ořezů a frontmatter. Nic se nepublikuje bez kontroly.

---

```text
Připrav cover k článku podle redakční metodiky DataTimes.

ČLÁNEK: <cesta ke složce článku v apps/web/app/clanek/_articles/…>
O ČEM TO JE JEDNOU VĚTOU: <co má čtenář pochopit za 3 sekundy, např. „Při sčítání se nejčastěji chybovalo ve velkých městech“>
PODKLAD: <fotka (cesta, autor, právo k použití) / data článku (soubor) / nic – navrhni motiv z dat>

Než začneš, přečti a dodržuj:
- tools/COVER-EDITOR.md – sada formátů, bezpečné zóny, písma, OG pravidla
- packages/ui/DESIGN.md, sekce „Full palette“ – ZÁVAZNÁ paleta, jen přesné hodnoty, žádné vlastní odstíny
- docs/design/NAVOD_LOGO_NA_COVER.md – logo DataTimes.cz (umístění, velikost)
- GENERÁTOR: tools/cover-generator.cjs – z jednoho cover.config.cjs v _cover_pipeline/ článku vyrobí všech pět formátů
  se správnými kotvami, písmy a štítkem. Vzorové konfigurace: _cover_pipeline/cover.config.cjs u článků
  volby-cr-2026-10-10-senat-komunalni-2026-predikce-vysledky (tečková mapa + ikona), …-predikce, …-volebni-kalkulacka-73-mest-a-senat,
  volby-brazilie-2026-10-04-prvni-kolo-vyhrava-bolsonaro (obrázek jako motiv). Spuštění:
  PW_PATH=<repo>/node_modules/playwright node tools/cover-generator.cjs <cesta ke cover.config.cjs>
- ikony sérií (graf predikce, výsledky): stejný piktogram, oválek s nápisem vycentrovaný pod ním, přechod jen z palety;
  na homepage coveru vždy stejné místo (pravý okraj 1320, horní hrana 470, šířka 230)
- vzor fotografického coveru s citátem: apps/web/app/clanek/_articles/kontext-2026-10-05-vaclav-havel-odkaz-vyroci-90-let
  (fotky dělej přes tools/poster-editor.html / npm run covers, ne vlastním generátorem)

1. MOTIV – jeden vizuální nápad, ne koláž; a VELKÝ: motiv vyplní plochu coveru (mapu zvětši od pravého dolního
   rohu doleva nahoru), text, legenda a logo smí ležet přes něj – čitelnost drží tmavý rozmazaný podklad pod textem.
   Nebát se pěkných, odvážných kompozic; malá mapa uprostřed prázdné plochy je chyba.
   LOGO dej do toho dolního rohu, kde je motiv klidnější a logo nezanikne (mapa ČR: vlevo dole pod Šumavou,
   legenda pak vpravo; v generátoru logo: 'vlevo'). Výchozí vpravo dole.
   - Datový článek → motiv vytvoř ze skutečných dat článku, ne z ilustrace. Osvědčené:
     tečková mapa ČR (podklad senat-mapa.json / obce-mapa.json z článku volby-cr-2026-10-10-senat-komunalni-2026-predikce)
     s vrstvou bodů (města, obvody, okrsky); jednoduchý zvýrazněný graf; jedno velké číslo.
   - Fotka → fotka je hlavní, text jen titulek, případně krátký citát v uvozovkách se jménem; nic dalšího.
   - ZAKÁZÁNO: AI generované obrázky a ilustrace, stockové ikony, 3D efekty, neonové záře, víc než 2–3 barvy motivu,
     text přes rušná místa fotky, emoji, vymyšlená čísla. Každé číslo nebo tvrzení na coveru musí být v článku.

2. TEXT (wording) a PÍSMA – tvrdé pravidlo
   - PATKOVÉ (IBM Plex Serif Bold) je jen titulek a nápis loga „DataTimes.cz“. Všechno ostatní je BEZPATKOVÉ (IBM Plex Sans):
     štítek, nadtitulek, podtitulek, legenda, popisky, nápisy v ikonách.
   - štítek coveru (vždy nahoře nad titulkem): VERZÁLKY Plex Sans s prostrkáním, první část karmínově (brand.6 #de1743)
     s podtržením, které končí v půlce posledního písmene, pak „•“ a zbytek bíle,
     např. VOLEBNÍ KALKULAČKA • KOMUNÁLNÍ A SENÁTNÍ VOLBY 2026, ANALÝZA • …, KONTEXT • ESEJ.
     Při zarovnání vpravo zrcadlově (podtržení od pravého kraje).
   - titulek: max. ~6 slov, věcný, česky, bez clickbaitu; smí být stejný jako titulek článku
   - podtitulek: jedna krátká věta s konkrétním zjištěním nebo otázkou článku
   - čeština: pomlčka –, české uvozovky „…“, mezera před %, nezlomitelné mezery po jednopísmenných předložkách

3. BARVY – jen ze závazné palety (packages/ui/DESIGN.md)
   - tmavé pozadí brandNavy.9 #101432, případně jemný přechod do brandTeal / brandEmeraldMint 7–8
   - motiv 1–2 výrazné barvy z palety (např. brandYellow.6 #ffcf02, brandEmeraldMint.4 #4fd6b4, brand.6 #de1743),
     vedlejší vrstvy tlumeně (brandNavy.8 #2f325c)
   - bílý text, doplňkový text ve světlém odstínu téže škály (index 1–2)
   - každá nová série článků (predikce × výsledky × analýza) má odlišnou převládající barvu, ať se covery neopakují

4. FORMÁTY – vždy všech pět, z jedné šablony (viz tools/COVER-EDITOR.md, „Sada pro web a sociální sítě“)
   - cover-homepage.png 1500×1200: text a logo uvnitř x 180–1320, y 120–1080
     ŠTÍTEK RUBRIKY: web na každou kartu vkládá vpravo nahoře červený oválek s rubrikou (VOLBY, ANALÝZA…).
     V malých kartách zabírá na coveru oblast x ≥ 950, y ≤ 280 (delší štítek až od x ≈ 760).
     Tahle oblast musí být PRÁZDNÁ – žádná ikona, odznak, číslo, logo ani konec titulku.
     Ikonky a odznaky (např. ikona kalkulačky, „PREDIKCE“, „20 let“) dej pod ni, nejdřív od y ≈ 320.
   - KOTVY, aby covery lícovaly v řadě vedle sebe: text začíná vždy na x 180, y 120 (zrcadlově končí na x 1320,
     když je motiv vlevo); logo DataTimes.cz vždy pravý dolní roh zóny (pravý okraj 1320, spodek 1080).
     Žádné vlastní odsazení „pro jistotu“ – karty webu drží přesně 5:4, nic víc se neořezává.
   - cover-og.jpg 1200×630: titulek a logo ve STŘEDNÍM ČTVERCI 630×630 (WhatsApp, Bluesky, Messenger ho ořízne),
     motiv může vyplnit kraje; velké písmo (náhled na WhatsAppu má ~100 px); JPEG do 300 kB
   - cover-square.png 1080×1080, cover-instagram.png 1080×1350 (nic důležitého v horních/dolních 80 px),
     cover-story.png 1080×1920 (horních 250 a dolních 340 px volných)
   - logo DataTimes.cz vpravo dole podle NAVOD_LOGO_NA_COVER.md, jen jednou

5. KONTROLA – než mi to ukážeš
   - vyrenderuj kontrolní list ořezů (jako nahledy.cjs): homepage velká karta, postranní karta (čtverec), mobil 45 %,
     související 120×96, OG + jeho čtvercový ořez, IG 3:4, stories se zónami
   - zkontroluj: čte se titulek i na náhledu 120×96? nic důležitého není oříznuté? nic nezasahuje pod štítek
     rubriky (x ≥ 950, y ≤ 280)? začíná text a sedí logo na stejných kotvách jako u ostatních coverů? barvy jsou přesně z palety?
     sedí čísla s článkem? velikost OG ≤ 300 kB?
   - pošli mi kontrolní list a všech pět souborů; frontmatter:
     coverImage + homepageImage: images/cover-homepage.png, ogImage: images/cover-og.jpg, squareImage: images/cover-square.png
   - nic necommituj ani nepushuj bez mého souhlasu.
```

---

## Příklad zadání: Michalův článek o chybovosti sčítání

```text
ČLÁNEK: apps/web/app/clanek/_articles/<složka článku o chybách při sčítání>
O ČEM TO JE JEDNOU VĚTOU: <kde a jak často se při sčítání komunálních a senátních voleb 2026 opravovalo>
PODKLAD: data článku – tečková mapa ČR, zvýrazni okrsky/obce s opravami (brand.6 #de1743 nebo brandOrange.6 #f76800)
na tlumeném podkladu; štítek ANALÝZA; převládající barva odlišná od zeleno-tyrkysových „výsledků“
```
