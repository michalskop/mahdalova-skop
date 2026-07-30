# Reuters Graphics — rozbor tří speciálů jako inspirace pro naši práci

Analyzováno 27. 7. 2026. Tři materiály Reuters Graphics:

1. **World Cup 2026 hub** — https://www.reuters.com/graphics/SOCCER-WORLDCUP/zgvolqqoypd/ (včetně článku „A World Cup dominated by the 'Big Five' European leagues")
2. **Inside Ukraine's Kill Zone** — https://www.reuters.com/graphics/UKRAINE-CRISIS/KILL-ZONE/znpnojmknvl/
3. **Who wore the most ink?** (World Cup tattoos) — https://www.reuters.com/graphics/SOCCER-WORLDCUP/TATTOOS/dwvknjqejpm/

Tři úplně různé formáty od jednoho týmu: **(1) průběžně plněný hub** krátkých datových článků k události, **(2) imerzivní 3D rekonstrukce** válečné zóny, **(3) lehký kulturně-vizuální datový článek** z ručně sesbíraných dat. Dohromady ukazují celé spektrum — a hlavně jednotný systém řemesla pod tím vším.

---

## 1. World Cup hub — formát „živého speciálu"

### Co to je
Jedna URL, jedna nekonečně scrollovatelná stránka, do které redakce **průběžně přidává datované, podepsané mini-články** (11. 6. – 21. 7., celkem ~20 kusů). Každý článek má vlastní kotvu (#anchor), tlačítko „Copy link", datum, autory. Delší kusy jsou na stránce jen jako teaser s „Read More". Na konci kredity editorů celé série.

### Proč je to chytré
- **Jeden odkaz ke sdílení po celou dobu události.** Čtenář se vrací na stejné místo, SEO síla se kumuluje.
- **Rytmus:** střídají se těžké analytické kusy (tracking data, valuace, vedra) s lehkými (ponožky, kopačky, tetování, zahajovací ceremoniály). Lehké kusy drží frekvenci a sdílení, těžké budují prestiž.
- **Škáluje to redakčně:** každý kus je malý (3–8 grafik, 300–600 slov), zvládne ho 1–2 lidi za pár dní.

→ **Pro nás:** přesně tenhle vzorec se hodí na naše speciály (demografie-hub, volby, rozpočet). Místo jednoho velkého článku „hub" s průběžně přibývajícími krátkými datovými vstupy s kotvami.

### Klíčový článek: „A World Cup dominated by the 'Big Five' European leagues"

**Struktura = trychtýř od celku k detailu:**
1. **Lede s čísly hned v 1. odstavci** (464 z 1 248 hráčů = 37 %) — teze článku je kvantifikovaná okamžitě.
2. **Treemap** — celkový obraz: 5 modrých dlaždic Big Five vs. jeden velký šedý blok „ostatní ligy". Pointa je vizuální: i největší modrá dlaždice je malá proti šedé mase.
3. **Podílové pruhy po fázích turnaje** — časová/postupová dimenze: 50 % → 56 % → 79 % → 91 % → 88 %. Čísla přímo v grafu, žádná legenda navíc.
4. **Grid „prstenových" grafů — hvězda článku.** Každý tým = kruh z 26 teček (1 tečka = 1 hráč; modrá = hraje doma, šedá = v zahraničí), uprostřed vlajka, zlatá fajfka = postup do vyřazovací fáze. Řazeno od nejvíc „domácích" po nulové. Druhý grid: 8 týmů s 0/26 — vizuálně celé šedé, pointa na první pohled.
5. **Maticový heatmap (kosočtverec)** — konfederace ligy × konfederace reprezentace; diagonála = hráči doma, největší mimo-diagonální buňka (189 afrických reprezentantů v evropských ligách) nese pointu. Anotace přímo v grafu: „New Zealand is the only OFC team at the World Cup".
6. **Kicker:** poslední odstavec vrací tezi s novým číslem (95 ze 104 hráčů v semifinále).

**Ponaučení:**
- **Jeden graf = jedna věta.** Každý graf má nad sebou mezititulek, který je zjištěním, ne popiskem („Messi's percentage walked is more similar to the average goalkeeper than a forward").
- **Unit chart (1 člověk = 1 tečka)** je čitelnější a lidštější než procenta — dá se spočítat prstem.
- **Barevná disciplína:** celý článek jede na jedné sémantické dvojici (modrá = Big Five/domácí, šedá = ostatní). Žádná duha.
- **Pod každým grafem Note + Source** (Transfermarkt; Opta) — i u lehkých témat.

### Další pozoruhodné kusy z hubu (typy vizualizací)

| Článek | Vizualizace | Nápad k ukradení |
|---|---|---|
| Tracking data (Messi walked) | scatter s benchmarkem brankářů; skládané pruhy rychlostních pásem; beeswarm top rychlostí; dot-strip vzdáleností na zápas | benchmark jako vtip v datech („Messi chodí jako brankář"); rychlostní pásma jako profily hráčů |
| Money/valuace týmů | **~30× opakovaný step-chart** (rozdíl hodnoty soupisky vs. soupeř po fázích), podklad s oranžovo-zeleným gradientem, W/D/L badge, anotace vyřazení, hvězdička = penalty | **jedna dobře navržená šablona malého grafu unese celý článek** — 48 týmů, stejná grafika, seskupovaná po 2, 4, 8 podle narativu |
| Vedra a hydratační pauzy | small multiples WBGT po stadionech s prahy FIFA/FIFPRO; ilustrované schéma pocení/odparu; matice heat indexu | kombinace: data → vysvětlující ilustrace fyziologie → policy spor dvou prahů; závěrečná kalkulace (208 pauz = 10+ hodin reklamního času) |
| Blesky | ilustrace 5 typů zásahu; mapy historických úderů v 8mílovém radiusu kolem každého stadionu (small multiples) | „nudná" bezpečnostní vyhláška převyprávěná daty a ilustrací |
| Foreign-born hráči | bar chart; sankey/flow „koridory migrace" (rodiště → reprezentace); rozpad po zdrojových zemích | flow diagram na téma identity; citace experta + trenéra jako lidská vrstva |
| Debutanti (Curaçao, Kapverdy…) | **diagram kvalifikační cesty** — trychtýř kol s tečkami týmů, kdo vypadl/postoupil; dot plot populací (150 tis. vs. 300 mil.) | proces jako diagram, ne text; interaktivní řaditelná tabulka žebříčku FIFA |
| Kopačky | proporční plochy značek a modelů; twist: „The vast majority were pink" — stejná grafika přebarvená | **narativní obrat uprostřed článku** — stejná data, nová otázka (značka → barva) |
| Ponožky, chrániče | anotované fotografie (vysoké/nízké, díry, mini chrániče) | fotka jako datový bod; „pravidla vs. osobní styl" jako rámec |
| Ceremoniály | ilustrované siluety headlinerů po zemích; mapa; časová osa délek ceremoniálů | ilustrace tam, kde data nejsou tabulková |

---

## 2. Inside Ukraine's Kill Zone — imerzivní rekonstrukce

### Struktura
1. **Studený začátek (cold open):** 4 krátké odstavce atmosféry PŘED titulkem — „It's a new kind of war…". Teprve pak titulní karta, autoři, datum.
2. **Kontext + čísla** (1 200 km fronty, pátý rok války, 2 mil. obětí dle CSIS).
3. **Grid ověřených videí** (6 klipů) — důkazní materiál. Pod ním: „All videos verified by Reuters Visual Verification Team" + zdroj každého klipu (konkrétní brigády, Telegram).
4. **Lokalizační mapa** — Ukrajina, fronta, 30km pás kill zone; schéma 15 km – 0 – 15 km jako „osa" celého článku.
5. **Metodická transparentnost přímo v textu:** ilustrace není konkrétní úsek fronty, ale koncentrace scén z mnoha sektorů; založeno na desítkách rozhovorů + stovkách ověřených videí; přiznání, že ruskou stranu vyzpovídat nemohli a proč.
6. **Dva velké 3D „fly-over" scrollytelling bloky:**
   - ruská strana (15 km → linie kontaktu): útoky, dělostřelectvo, dronové jednotky, motorkáři, maskovaný tank s klecí…
   - ukrajinská strana (0 → 15 km): zásobování, rotace, evakuace, protidronové sítě nad silnicemi…
   - Každá scéna má krátký anotační text + štítky objektů (FPV drony, optická vlákna, foxhole, UGV, spací drony…).
7. **Vložený lidský mikropříběh:** evakuace zraněného pilota dronů Andrije Meskova (FPV dron, roztříštěné koleno, odvoz pozemním robotem v noci) — odvyprávěno UVNITŘ fly-overu, scéna po scéně.
8. **Cross-promo „READ MORE"** na sesterský článek (A year in a foxhole) uprostřed.
9. **Kredity:** video verifikace jmenovitě (5 lidí), additional reporting, editing, zdroje mapy (ISW, AEI).

### Inovace a ponaučení
- **Geografie = struktura vyprávění.** Osa článku je fyzická vzdálenost od linie kontaktu; scroll = pohyb prostorem. Geniálně jednoduchý princip: čtenář vždy ví, „kde" v příběhu je.
- **Ilustrace jako rekonstrukce** tam, kam kamera nemůže — ale ukotvená důkazy (ověřená videa vedle ilustrace, rozhovory, jména, callsigny).
- **Vrstvení důvěryhodnosti:** ilustrace (syntéza) + video (důkaz) + citace (svědectví) + mapa (kontext) + metodická poznámka (poctivost). Každá vrstva dělá jinou práci.
- **Detail prodává celek:** spool optického vlákna, díra v síti, ruční detektor dronů — konkrétnost místo obecných ikon.
- **Lidský příběh vložený do systémového vysvětlení** — ne zvlášť, ale přímo ve scénách.

→ **Pro nás:** máme ScrollyTelling komponentu — princip „osa příběhu = fyzická/logická osa" lze použít i bez 3D (např. řeka, trať, ulice, tok peněz rozpočtem, cesta zákona legislativou). A vzorec „rekonstrukce + důkaz + svědectví + metodika" je přenositelný na jakékoli investigativní téma.

---

## 3. World Cup tattoos — lehké téma, tvrdá data

### Co je na něm zásadní
**Data neexistovala — vytvořili si je.** Reuters ručně prošel fotky všech 1 248 hráčů a okóduje viditelná tetování (má/nemá, kde na těle, pozice hráče, věk, tým). Z „bulvárního" tématu je rigorózní datový článek s vlastním unikátním datasetem.

### Struktura
1. Lede = news hook (Cucurella si po výhře musí nechat vytetovat tvář trenéra) + hlavní číslo (téměř 1 ze 3 hráčů).
2. **Velký unit chart všech 48 týmů** — každý hráč ikona, seskupeno po postech (brankáři/obránci/záložníci/útočníci), světle modrá = tetovaný. Řazeno od nejvíc po nejméně tetované týmy.
3. Regionální srovnání — pruhy po konfederacích (CONMEBOL 62 % vs. AFC 9 %).
4. **Ilustrace těla** s procenty po částech (levá ruka 79,5 %…) — infografika místo grafu tam, kde jde o tělo.
5. Waffle grafy po věkových skupinách (do 25 let 19 % vs. 36+ 48 %).
6. Mezi grafy **fotopříklady** (Messiho lýtko, krční tetování) — data ↔ realita.
7. Závěr vrací tezi s protiváhou („bare skin still exceeds body art").

### Ponaučení
- **Ruční sběr dat z fotek/videí je levná superschopnost** — nikdo jiný ten dataset nemá, článek je automaticky exkluzivní.
- Superlativy jako háčky: nejmladší tetovaný (Páez, 19), nejstarší (Muslera, 40), rekordman Uruguay 77 %.
- Lehké téma ≠ nižší standard: Sources, Edited by, alt-texty, vše jako u vážných kusů.

---

## 4. Průřezová řemeslná pravidla Reuters (checklist pro nás)

1. **Mezititulek = zjištění — ale logicky korektní zjištění.** Ne „Graf 3: Podíl hráčů", ale věta, která něco tvrdí. Pozor na logiku: reutersovské „Older players tended to have more ink" je jako formulace sporné — starší hráči se „více netetují", jen tetování (které je trvalé) nasbírali za delší život. Korektní verze: „Starší hráči stihli nasbírat víc tetování." Mezititulek-zjištění nesmí vydávat artefakt času či složení vzorku za mechanismus (pravidlo doplněno do `REDAKCNI_MANUAL.md`, část Mezititulky).
2. **Čísla v prvním odstavci.** Teze je kvantifikovaná hned, ne po třech odstavcích kontextu.
3. **Jeden graf = jedna myšlenka; anotace přímo v grafu** (šipky, popisky výjimek), ne v legendě.
4. **Sémantická barevná dvojice na článek** (modrá/šedá; oranžová/zelená pro pod/nad). Šedá dělá práci — „ostatní" je vždy šedé.
5. **Small multiples se sdílenou šablonou** — jednou vymyslet, 48× použít. Levné na výrobu, silné na čtení.
6. **Unit charts:** lidé jako tečky/ikony, ne procenta. Počitatelné = uvěřitelné.
7. **Note + Source pod KAŽDOU grafikou**, metodická poznámka na konci (kdy sebrána data, co čísla neznamenají — viz Transfermarkt disclaimer).
8. **Alt-texty ke každé grafice** — Reuters píše detailní popisy pro čtečky (často 3–5 vět, včetně hodnot). Přístupnost + SEO + (bonus) strojová čitelnost. Kuriozita: ve dvou grafikách jim zůstal placeholder „Add a description of the graphic for screen readers" — i Reuters šije horkou jehlou.
9. **Kredity jako mapa procesu:** By / Additional work / Video verification by / Edited by / Sources — čtenář vidí, kolik řemesla za tím je.
10. **Střídání registrů:** tíha (kill zone) a hravost (ponožky) pod jednou značkou budují návyk čtenáře vracet se.
11. **Fotka jako datový bod** — anotované fotografie rovnocenné grafům.
12. **Narativní obrat uprostřed článku** (kopačky: značky → „a mimochodem, 69 % jich bylo růžových") — data vydají na dvě pointy.

## 5. Co z toho konkrétně pro mahdalova-skop / datajournalism.studio

- **Hub formát pro speciály:** jedna URL, průběžné datované mini-články s kotvami a „copy link". Nejbližší kandidát: demografický speciál, krajské/sněmovní volby.
- **Šablona small-multiple grafu** (à la step-charty valuací): navrhnout jednou jako komponentu, pak plnit daty — 14 krajů, 200 poslanců, 6 300 obcí.
- **Prstenové unit charty** (26 teček kolem vlajky) — přímo použitelné na složení zastupitelstev, sněmovních klubů, věkovou strukturu.
- **Alt-texty:** doplnit do našich chart komponent povinné pole s popisem pro čtečky (Reuters styl: co graf ukazuje + klíčové hodnoty + pointa).
- **Vlastní dataset z fotek/dokumentů:** tattoos-style ruční kódování je dosažitelné i pro dvoučlennou redakci (např. vizuální kultura české politiky, billboardy, výlohy…).
- **ScrollyTelling s fyzickou osou:** příběh strukturovaný prostorem (tok Vltavy, D1, hranice okresu) místo časem.

---

*Zdrojové stránky přečteny v plném rozsahu 27. 7. 2026 (hub 88,5 tis. znaků textu, Kill Zone a Tattoos kompletně). WebFetch Reuters blokuje; čteno přes prohlížeč.*
