# Revize kapitoly 2 Zdravotnictví a péče (Data pro budoucí premiérku), 28. 10. 2026

Stav k 29. 10. 2026: **složení kapitoly schválila Kateřina (3b i doplněk 3c).** Provedeno: opravy ověřených chyb, odstraněné zástupné boxy, přepis 03, 11, 12, sloučení 04 + 06 (nový slug `04-sestry-a-skupinove-praxe`), 05 → 01, 08 → 10, nové články `13-cekaci-doby`, `14-kolik-stoji-kdo-plati`, `15-sousede-stredni-evropa`, `svet-jizni-korea-lekari` se skripty v `_data_pipeline/`, přepsaný one-pager a závěr úvodu. Dlaždic je 16 (6 + 10 v `postSupportTiles`), web dlaždice: Návrat karenční doby (místo dlaždice o postižení). **Zbývá:** covery všech 16 článků (kontaktní arch ke schválení), sladění `image`/`imageAspect`, kontrola Hartenbergu v rejstříku, ověření „34 700 lůžek“, přepis komponenty `LongTermCareFlow` (ručně kreslená) a zelené v `CHART_HEALTHY_LIFE`, merge `main` a build; publikace jen na pokyn Kateřiny. Nic není publikované.

Zdroje: články v `_content/02-zdravotnictvi-a-pece/articles/` (15 souborů), `_meta.json`, grafy v `public/specialy/dpbp/charts/`, komponenty v `components/dpbp/HealthcareVisuals/`. Pravidla: `docs/redakcni-styl/REDAKCNI_MANUAL.md` (II, III, VI, kontrolní seznam VII), `STYL_DATOVA_ZURNALISTIKA.md`.

## 1. V jakém je kapitola stavu

**Silné stránky**
- Jasná teze, která drží celou kapitolu: součet zdravotníků roste, dostupnost se rozhoduje věkem, rozmístěním, úvazky a návaznou péčí. Silný otvírák 01 (lékařů je nejvíc, ordinace přesto zavírají) a 02 (7,6 vs 13,9 roku ve zdraví).
- Dobré zdroje tam, kde jsou: 07, 09, 10, 11, 12 (OECD, WHO, ČSÚ, MZ, Sněmovna, ÚOHS).
- Nápad „palubní deska sedmi čísel“ v one-pageru je dobrá kostra pro závěr kapitoly.

**Slabiny**
1. **Rozpracovaný stav na veřejné stránce.** Pět článků (07, 08, 09, 10, 12) obsahuje zástupný box „Připravovaná grafika: …“ s popisem toho, co se teprve udělá („připravujeme“, „stavíme“, „zjišťujeme“, „datový požadavek jsme formulovali“). To je pracovní zadání, ne publikovatelný text; v knize nemůže zůstat. Každý box buď nahradit skutečným grafem z dat (skript), nebo smazat.
2. **Pět krátkých článků bez jediného odkazu na zdroj:** 03 Digital, 04 Norsko, 05 Ověřili 53 %, 06 Rakousko, explainer DRG a Japonsko (366–499 slov). Obsahují odhady („přibližně“, „řádově“) a obecná tvrzení bez čísla (Rakousko: žádné číslo vůbec).
3. **Opakování:** číslo 53 % (01, 05, one-pager); „nejdražší postel v zemi“ (02, 09, 10); stárnutí → lůžka (02, 08, 10, Japonsko); sestry s rozšířenými kompetencemi (01, 04, 08, 06); „rok 2035“ (01, 04, 05, 08, 10).
4. **Tón a hlas:** část textů mluví jako plán redakce („budeme měřit“, „stavíme databázi“, „naše otázky míří“), část jako analýza. Do knihy patří hotové zjištění, ne záměr. 11 a 12 jsou psané jako sledování politiků, ne jako vysvětlení pro čtenářku.
5. **Aktuálnost:** články psané v červnu a červenci 2026 (datum 28. 7.). Od té doby se změnilo např. vedení, rozpočty, termíny; viz oddíl 2. Chybí aktuální data 2025.
6. **Grafy a vizuály:** viz oddíl 5.
7. **Dlaždice:** 8 + 7 = 15 karet (lichý počet); žádný článek nemá cover (`og/02-zdravotnictvi-a-pece/` je prázdné; 03 má starý obrázek).

## 2. Ověřené chyby (tři nezávislé kontroly faktů, stav k 28. 10. 2026)

Zdroje: kontrola politických a právních faktů, kontrola čísel o personálu (ČSÚ, ÚZIS, MZ, OECD), kontrola OECD a zahraničí (Eurostat, OECD SDMX, MHLW, Observatory). Zdroje označené (S) jsou sekundární (média, Wikipedie), primární se musí dohledat před publikací. Co nešlo ověřit, je v oddíle 2d.

### 2a. Chyby, které se opravují vždy

| Článek | Tvrzení v textu | Správně | Zdroj |
|---|---|---|---|
| **11** | „předseda vlády v demisi“ | **Vláda není v demisi.** Babiš jmenován premiérem 9. 12. 2025, důvěru získala 15. 1. 2026 (108 : 91). Demisi měla v září až prosinci 2025 vláda Fialy. Psát „předseda vlády“. | e15, Eurozprávy (S) |
| **11** | svěřenské fondy „od 2023“ | Agrofert a SynBiol vložil do fondů AB private trust I a II v únoru 2017; fond I zanikl koncem 2024, fond II 15. 10. 2025; od 20. 2. 2026 drží Agrofert fond RSVP Trust, SynBiol a Hartenberg v něm nejsou. Rok 2023 jsem nenašel. Evropská komise 8. 9. 2026 označila RSVP Trust za nedostatečný. | Echo24 17. 10. 2025 (S), iDNES/CNN Prima 20. 2. 2026 (S), Newstream (S) |
| **11** | Investigate Europe „28 skupin, 5 000 zařízení, 450 tisíc lůžek“ | Primární text říká **25 největších korporací**, domovy pro **více než 455 000 lidí** (2021), kapacita za čtyři roky +22 %. Čísla 28 a 5 000 v primárním zdroji nejsou. Jde o lidi v domovech, ne o lůžka. | Investigate Europe, stránka For-Profit Elder Care |
| **12** | „v letech 2027 a 2028 počítá s dalšími 24 miliardami přes platby za státní pojištěnce“ | 24 mld. platí **pro rok 2027** (platby za státní pojištěnce plus úspory provozu pojišťoven). V letech 2027 až 2028 se platby valorizovat nebudou. Výbor 14. 10. 2026 doporučil snížit navýšení (tisk 235) z 21 na 13 mld.; čeká na 3. čtení. Psát „od 1. 1. 2027“ a po třetím čtení doplnit výsledek. | mzd.gov.cz 9. 7. 2026; psp.cz tisk 235; Echo24 (S) |
| **12** | odkazy na Čabana | …285886 je psaný komentář (11. 9. 2025), …285548 je podcast 5:59 (9. 9. 2025). Rozlišit v popisu odkazu. | Seznam Zprávy |
| **03** | telemedicína jako rovná osobní návštěvě, účinnost od 1. 1. 2026 | Telemedicínu zakotvil **zákon č. 240/2024 Sb.** (§ 11c zákona 372/2011 Sb.), obecně účinný od 1. 10. 2024, prováděcí vyhláška č. 30/2025 Sb. od 14. 2. 2025. K 1. 1. 2026 vstoupil v účinnost zákon č. 236/2025 Sb. (elektronizace), který telemedicínu neřeší; přibyly jen vybrané hrazené výkony na dálku. Zákon nestanoví, že je telemedicína „na roveň osobní návštěvě“. | Sbírka zákonů, VZP |
| **03** (též 01, 12) | e-žádanka / sdílená dokumentace „od 2029“ | Zatím jen návrh novely: e-žádanka povinně od 1. 7. 2027 (laboratorní od 1. 1. 2028 podle pracovní skupiny MZ), pacientský souhrn od března 2029, plná dokumentace od března 2031. Psát podmíněně („podle návrhu“). | MZ 24. 6. 2026; Zdravotnický deník 26. 10. 2026 (S) |
| **03** | „MAIA“ analyzuje snímky | Projekt MAIA pro rentgeny nebo oční pozadí jsem nenašel. MAIA Labs (Brno) je AI pro kolonoskopii. Zeptat se autora, o jaký projekt jde; jinak nahradit pojmenovaným a doloženým (např. Carebot, Aireen). | Lupa.cz, BusinessInfo |
| **03** | ransomware „opakovaně 2024–2025“, „11 milionů lidí“ | Doložen **jeden** případ: Nemocnice Nymburk, 1. 7. 2025. „11 milionů“ nemá zdroj (blízké počtu obyvatel, tedy ne doložený únik). Psát jen doložený případ. | ČT24/ČTK 9. 7. 2025 |
| **03** | „157 dětských psychiatrů, více než třetina v důchodovém věku“ | 157 sedí (MZ, 12. 9. 2025). Zdroj uvádí, že **47 % může do 5 let do penze**; „třetinu“ nenašel. Jiné počty: asi 180 certifikovaných, z toho 86 v důchodovém věku. Vyměnit za doložené. | ČTK 12. 9. 2025 |
| **01** | „téměř dvojnásobek absolventů oproti 2001“ (1 800) | 1 800 sedí (1 779 v 2024, 1 819 v 2025). V 2001 bylo 762 (jen občané ČR, všeobecné lékařství); dnes jsou započteni i cizinci (20 až 25 % studentů). Občané ČR v českém programu: 1 074 (2024), tj. asi +40 % proti 2001. „Téměř dvojnásobek“ nepsat. | MŠMT přes ÚZIS (Dušek, Mužík 3. 12. 2025, snímek 22); ÚZIS Aktuální informace 53/2002 |
| **04** | Norsko „dvojnásobek sester“, lékaři ≈ 4, sestry ≈ 8, systém „z ropného fondu“ | Praktikující na 1 000 obyvatel, **2023**: Česko lékaři 4,2, sestry 9,0; Norsko lékaři 5,0, sestry 15,6. Sester je v Norsku **1,7×** víc (jen kvalifikované sestry 1,9×: 2024 CZ 8,0, NO 15,2); lékařů +19 %. Norský systém se financuje z daní a národního pojištění; ropný fond doplňuje státní rozpočet (asi 27 %), není účelový. | OECD Health at a Glance 2025, Country Health Profile 2025, OECD SDMX, Observatory HiT Norway 2024 |
| **explainer-drg** | „700 skupin“, DRG od 2012, hospitalizace 9,2 → 6,8 dne | CZ-DRG 5.0: **730 bází a 1 787 skupin**. IR-DRG zavedeno 2012, v 2014 vláda rozhodla vrátit se k paušálům; „DRG Restart“ od 2015/16, k úhradě CZ-DRG od pilotu 2020 a 2021 (v 2019 jen 7 % plateb). Hospitalizace podle OECD: akutní 7,9 (2000) → 5,8 (2023), všechna lůžka 11,4 → 9,3; dvojice 9,2 a 6,8 neodpovídá žádné řadě. | ÚZIS Klasifikon 2022; PMC11526301; MDPI 18(10):5463; OECD SDMX |
| **Japonsko** | 11,5 % HDP, LTC CZ 1,5 % vs JP přes 2,5 %, schodek 690 tisíc, 22 % seniorů, struktura 2045 | Výdaje JP **10,8 % (2023)** vs CZ 8,4 %. LTC 2023 (zdravotní + sociální) **CZ 1,9 % vs JP 2,3 %** (jen zdravotní 1,1 vs 2,0). Potřeba pečovatelů: aktuálně **+570 tisíc do 2040** (2,72 mil.); 690 tisíc je z plánu 2021. Česko 65+ **20,7 % (2025)**, dnešní úrovně JP (29,4 %) dosáhne kolem 2050 až 2055, ne 2045 (Eurostat 24,0 % v 2040, 27,2 % v 2050). Stoletých 95 119 (2024), **99 763 (2025), 107 677 (2026)**. | OECD SDMX; MHLW; Eurostat EUROPOP2023; ČSÚ |

### 2b. Zastaralé nebo nepřesně definované (opravit při přepisu)

| Článek | Tvrzení | Správně | Zdroj |
|---|---|---|---|
| 01, 02, one-pager | roky ve zdraví po 65: CZ 7,6 vs SE 13,9 | Dva různé roky. Eurostat **2024: CZ 8,0 vs SE 14,2**; 2023: 7,7 vs 13,9. Sjednotit rok (v datech komponenty je 7,7). Definice: roky bez omezení činnosti (GALI), oba pohlaví. „Průměr EU 9,5“ bez zdroje, z naší tabulky 29 zemí vychází 9,3. | Eurostat tepsr_sp320 |
| 02 | naděje dožití ženy 82, muži 76 | **2025: ženy 83,2, muži 77,5** (maximum); 2024: 83,0 a 77,1. | ČSÚ 2025, Eurostat |
| 02, 10, one-pager | podíl 80+ se do 2050 zdvojnásobí, 4 → 9 % | Dnes 4,5 % (2024), 4,8 % (2025); do 2050 asi **8,0 %** (EUROPOP2023), odhad ČSÚ asi 8,8 %. Nárůst 1,7× až 1,8×. Psát „z necelých 5 % na 8 až 9 %“. | Eurostat proj_23np, ČSÚ |
| 02, one-pager | 35 700 nových lůžek do 2040 | Jde o lůžka v **pobytových sociálních službách** (domovy, stacionáře), ne zdravotní. ČTK 15. 3. 2025: až 35 700 do 2040. Novější model MPSV (14. 11. 2025): +34 700 do 2035. | ČTK, MPSV |
| 02 | 13 tisíc chybějících míst „pro ty, kdo je potřebují okamžitě“ | Původ jsem nenašel; blízké odhady: asi 15 000 míst do 2035 (BCG pro MPSV), 12 až 15 tisíc (APSS). Doložit zdrojem, jinak vypustit. | ČTK 3/2025, ČT24 |
| 02, 09, one-pager | lůžka CZ 6,4 vs OECD 4,2 | Sedí (2023), ale jde o **všechna nemocniční lůžka** na 1 000 obyvatel, ne akutní; průměr EU 5,1, obsazenost 62 % vs 69 %. Upřesnit definici. | OECD Health at a Glance 2025, CHP Czechia |
| 02, one-pager | odvratitelné hospitalizace 592 vs 473 | Sedí; označit „odvratitelné hospitalizace při čtyřech chronických onemocněních (astma, CHOPN, srdeční selhání, cukrovka), na 100 000“; průměr je OECD. | OECD HAG 2025 |
| 10, one-pager | LTC 13 % výdajů vs EU 18 % | Sedí (2023), ale je to **jen zdravotní složka** dlouhodobé péče z běžných výdajů na zdraví. | CHP Czechia 2025 |
| 10 | pracovníci dlouhodobé péče 2,1 vs 5,0 na 100 lidí 65+ | Sedí (2023). Česká hodnota může mít jinou metodiku než norské 13,0; uvést definici OECD. | OECD HAG 2025 |
| 01, one-pager | průměrný věk praktika 55,6; 52,8 % v penzi za 10 let | 55,6 (2023) je z webu ministra zdraví (29. 1. 2025), v ÚZIS jsem nenašel; ÚZIS udává 54 (2022), všichni ambulantní lékaři 55,5 (2024). 52,8 % je propočet ministra zdraví, projekce k ≈ 2035. Psát „kolem 55 let“ a uvést zdroj. | MZ; ÚZIS (Dušek, Mužík 3. 12. 2025) |
| 01, one-pager | praktici pro děti 35 % v důchodovém věku | Přesně **34,6 % (2023)**, 65+. Sjednotit 65+ ve všech místech; jinde (60+) jde o jinou kategorii. Průměrný věk 56,7 je z konce 2022. | Zdravotnický deník 8. 4. 2025 (ÚZIS) |
| 01 | 390 tisíc dětí za 5 let | Údaj z konce 2023 (ČT24 21. 5. 2024): děti, které musely **hledat nového praktika**, ne ty, které nenašly. Aktuálně bez praktika v 2024 asi 34 tisíc dětí a 449 tisíc dospělých. | ČT24/ČTK; MZ/ÚZIS 3. 7. 2025 |
| 01 | průměrný věk sestry 47 let | **47,9 (31. 12. 2024)**; psát „necelých 48“. | ÚZIS, snímek 11 |
| 01, 07 | lékaři 48 781, sestry 86 580, zubaři 6 993 (2024); +7,8 %, +0,8 %, +176 | Sedí (ČSÚ, fyzické osoby, aktualizace 16. 10. 2025). Za 2025 zatím nejsou. Zubaři nemají lineární vývoj (vrchol 7 208 v 2022). | ČSÚ Pracovníci a mzdy ve zdravotnictví |
| 07 | VZP bonifikace za hlášení registrací | Bonifikace je i za nové registrace (500 Kč) a prevenci; ověřená stránka je verze 2022, podmínky 2026 neověřeny; jde o praktické zubní lékaře. | VZP PLUS Stomatologie |
| 07 | katastrofické výdaje | Sedí: 2023 téměř 6 % domácností; u nejchudší pětiny 14 % (2018) → 21 % (2023); zubní péče hlavní u ostatních, u nejchudších léky. | WHO Europe 30. 9. 2025 |
| 06 | Rakousko | Doplnit čísla: **100 primárních center (1. 7. 2025)**, 77 na konci 2024, 53 v 2023, cíl až 300 do 2030; zákon PrimVG 2017, novela BGBl. I 2023/81 (zkrácený výběr při dvou neobsazených místech 6 měsíců), 100 mil. € z EU plánu, dotace aws typ A a B. Cílení na „strukturálně slabé regiony“ a „garantované smluvní podmínky“ jsem nepotvrdil. | Sozialministerium, BKA, RIS, aws |
| 12 | koordinátoři onkologické péče „od ledna 2026“ | Psát „povinnost od roku 2026“; podle MZ 2. 9. 2026 má každé centrum mít aspoň jednoho, koordinaci hradí pojišťovny (250 Kč na pacienta). | mzd.gov.cz |
| 12 | Dušek ředitelem ÚZIS | Na webu ÚZIS je stále uveden; stránka není datovaná, odvolání jsem nenašel. Ověřit k datu publikace. | uzis.cz |

### 2c. Ověřeno, sedí (ponechat, doplnit odkaz)

Vojtěch ministrem 13. 12. 2017 až 21. 9. 2020, 26. 5. 2021 až 17. 12. 2021 a potřetí od 15. 12. 2025 (předchůdce Válek). Babiš premiér, Juchelka ministr práce a sociálních věcí. Šťastný, oficiální název „Ministr pro sport, prevenci a zdraví“, ve funkci od 15. 12. 2025; Alzheimer Home a Nemocnici Vršovice prodal Penta Hospitals 2018 až 2022; správní rady opustil v říjnu 2025; 38 dotací přes 185 mil. Kč (Demagog 24450, verdikt Pravda k jinému výroku, nejde o usvědčení z nepravdy); jediný akcionář Medical Investments, v radě manželka a synové. SynBiol 87,75 % Hartenbergu (Kupka, psp.cz 21. 4. 2026; v rejstříku neověřeno); rozhodnutí ÚOHS S1114/2014 dokládá jen historii struktury FutureLife, ne 87,75 %. Sloučení FN Motol a Homolka od 1. 1. 2026 (ředitel Petr Polouček). Portál eZdraví a první verze e-žádanky (bilance MZ 9. 7. 2026). Národní strategie elektronického zdravotnictví 2025 až 2035 (usnesení č. 746, 8. 10. 2025; 40 cílů, 23 rozpracováno a 17 nezahájeno v únoru 2026). Národní plán geriatrické péče (duben 2025), GeriPRO (výzva 13. 10. 2026, aspoň 15 ambulancí), Strategie paliativní péče do 2035 (29. 6. 2026; +86 % do 2050). Adéla Čabanová (Medical Tribune), Martin Čaban (Seznam Zprávy). OECD: prevence 2,7 % výdajů (průměr OECD 3,4 %). Observatory: studie o private equity v dlouhodobé péči (Cooney, Greer, Cylus, Rechel 2025).

**K doplnění do textu 11 (stav k 28. 10. 2026):** Šťastný přiznal příjem 9,625 mil. Kč od Medical Investments plus 93 tis. Kč z dohody o provedení práce (Občanský týdeník 11. 7. 2026, S); 14. 10. 2026 podal ve 2. čtení pozměňovací návrh k tisku 235; Hlídač státu uvádí pro celý holding 55 dotací za 201,9 mil. Kč (2020 až 2023). Reakci Šťastného jsme nenašli: požádat o vyjádření, odpověď nečekat.

**Co se od července 2026 změnilo (pro aktualizaci 12):** úhradová vyhláška 2027 podepsána 26. 10. 2026 (dohoda v 11 z 15 segmentů, poprvé se hradí praktické sestry, podpora regionálních nemocnic); rozpočet pojištění 2027: příjmy 605 mld., náklady 604,9 mld.; praktici od července 2026 předepisují přes 1 200 dříve vázaných léků; od 2028 nové dohodovací řízení s arbitráží; zákon o dlouhodobé péči v legislativním přehledu MZ 08/2026 není; novela zákona o nelékařských povoláních je před připomínkovým řízením; šéf VZP Kabátek odvolán 23. 2. 2026 (nový ředitel Duškov, S).

### 2d. Nešlo ověřit u primárního zdroje (zeptat se autora nebo dohledat)

- **Vyřešeno 29. 10. 2026 (druhé ověření, primární dokumenty):**
  - **Dětští psychiatři (03):** 157, víc než třetina v důchodovém věku (Dušek, ČT24 21. 5. 2024); 47 % dosáhne do 5 let důchodového věku, 559 lůžek místo asi 860, 5 stacionářů místo 2 v každém kraji (MZ, tisková konference 12. 9. 2025, ČTK). **„80 km z Jesenicka“ a „pět nemocnic v okruhu 2 km v Praze 6“ nikde nenalezeno, z textu odstraněno.** Úvodní odstavec o AI (MAIA) vypuštěn jako nesouvisející s dětskou psychiatrií.
  - **Tisk 235 (12):** předchozí tvrzení „výbor doporučil 13 místo 21 miliard“ **v oficiálních dokumentech není**. Skutečnost: novela zákona o pojistném (vláda 8. 6. 2026, tisk předložen 23. 6. 2026) zvyšuje vyměřovací základ za státní pojištěnce z 16 206 Kč na 18 362 Kč od 1. 1. 2027 (+24 mld, 182 místo 158 mld). Výbor pro zdravotnictví 14. 10. 2026 doporučil pozměňovací návrh poslance Borise Šťastného (SD 1796) snížit základ na 17 540 Kč a nedoporučil návrh poslankyně Šebelové. Výsledek 3. čtení stránka tisku k 29. 10. 2026 neuvádí. Text 12 přepsán podle toho.
  - Zdroje: psp.cz tisk 235/0, 235/2, 235/3; epravo.cz (8. 6. 2026); ČTK 12. 9. 2025; ČT24 21. 5. 2024. Stažené PDF jsou v pracovním adresáři relace, do archivu `Zdrojová data\` je zapíšu při zpracování `penize` (viz pravidlo o archivu).
- **„13 tisíc míst“ (02):** zdroj ani po druhém hledání nenalezen (číslo 13 tisíc se objevuje jen jako plánované navýšení v starší studii BCG), **věta z textu 02 odstraněna**. K ověření zbývá také údaj „34 700 lůžek do roku 2035“ (model MPSV, 11/2025): nově nalezené zdroje uvádějí jiné míry (celková potřeba 111,5 tisíce lůžek v roce 2035), takže před publikací ověřit u MPSV.
- **Zůstává nevyřešeno:** 9,2 → 6,8 dne (nahrazeno údajem OECD 7,9 → 5,8, hotovo), Japonsko (medián 49,9, spoluúčast), CZ-DRG 6.0, Hartenberg v rejstříku.
- **Původ „13 tisíc míst“** (02) a **9,2 → 6,8 dne** (explainer-drg): zdroj nenalezen.
- **Medián věku Japonska 49,9** (UN WPP nebo statistický úřad Japonska): sekundární zdroje 49,4 až 49,9; psát „kolem 50“ nebo doložit.
- **Japonská spoluúčast** (30 %, 70 až 74 let 20 %, od 75 let 10 %; od 10/2022 u 75+ s vyšším příjmem 20 %): aktuální prahy MHLW nestaženy.
- **Počet skupin CZ-DRG 6.0** (platná 2024+).
- **Podíl Hartenbergu v obchodním rejstříku**, **konečný výsledek hlasování o tisku 235**, **reakce Šťastného** od července 2026.
- **Primární tabulky ÚZIS** k podílu praktiků 65+ a ke 390 tisícům dětí (máme jen zprostředkované slajdy).

## 3. Kontrola proti manuálu (Část II a III), nalezeno čtením

| Kde | Problém |
|---|---|
| 05 | „alarmující“ (hodnotící přívlastek u čísla; zakázáno). Ve 2 odstavcích 3× „přibližně“. Článek je „ověřili jsme“, ale neodkazuje na jediný zdroj ÚZIS. |
| 11 | „zajímavá“ (klišé). „Psát, že dnes síť vlastní, by bylo nepřesné“ – dobré, ponechat. Souhrn o Babišovi označuje „předseda vlády v demisi“ (ověřit). Odkazy mají popisné názvy – v pořádku. |
| explainer-drg | „mechanismy“ jako kauzální náhrada (2×), „cherry picking“ a „upcoding“ bez vysvětlení pro laika a bez zdroje; „statisticky vyšší ziskovost“ bez čísla. |
| Japonsko | „pouze“ před číslem; 5× „přibližně/zhruba“; žádný odkaz; „krize“ bez zdroje. |
| 07, 08, 10, 12 | zástupné boxy „Připravovaná grafika“; 08 a 10 mají vedle toho grafy / komponenty. |
| 03 | `coverImage` ukazuje na starý obrázek `cover-digital-datatimes.jpg`; text končí odkazem na kapitolu 8 bez čísla. |
| 04 | norský model „financovaný z ropného fondu“ (zjednodušení, ověřit); pochybný poměr 1:2. |
| 01, 02, 10 | souhrnné odkazy chybí; zdroje jsou na místě u některých tvrzení, ale spoustu čísel nemá odkaz (390 tisíc dětí, 1 800 absolventů, 47 let sestry, 2,1 vs 5,0, 35 700 lůžek, 13 tisíc míst). |
| one-pager | opakuje čísla z článků, bez odkazů; čísla se musí po přepočtu sjednotit. |

Žádný článek nepoužívá em-dash a čísla jsou formátem v pořádku; zbytek viz tabulka výše.

## 3b. Návrh změn složení kapitoly (povinný oddíl revize, viz STAV.md oddíl 7)

**Návrh, nic se nemění ani nemaže bez schválení Kateřiny.** Jde o návrh na ČLÁNKY v kapitole (kapitol zůstává 15). Značky podle REVIZE-01: **P** = přepsat/sloučit stávající, **N** = nový text, **W** = text z webu (dlaždice), ★ = vysoká priorita. Cílem je 16 dlaždic (sudý počet), každá s vlastním zdrojem dat a bez zástupných boxů.

| Návrh | Článek | Proč |
|---|---|---|
| **sloučit** | 04 Norsko + 06 Rakousko → jeden text „Jak sestry a skupinové praxe drží primární péči jinde“ | oba jsou krátké (366 a 356 slov), bez zdrojů a bez čísel; společná teze (přenést práci / udržet lékaře v regionu); sestry v textu 01 a 08 se opakují |
| **sloučit** | 05 Ověřili 53 % → do 01 Pyramida jako rámeček „Ověřili jsme“ (nebo přepsat jako samostatný formát „Ověřili jsme“, ale s primárním zdrojem ministra zdraví a ÚZIS) | číslo je teď na třech místech; 05 nemá jediný odkaz; propočet pochází z ministerstva zdraví, ne z naší práce |
| **sloučit** | 08 Odbornosti 2035 → do 10 Kdo se postará (potřeba péče roste s multimorbiditou) | 08 je bez vlastních dat (zástupná grafika), z velké části opakuje 02 a 10 |
| **přepsat** | 12 Třetí návrat Vojtěcha → bilance kroků (eŽádanka, úhradová vyhláška 2027, rozpočet pojišťoven), bez odstavce „Dva Čabanovi“ | opravit termíny a „24 miliard“; text je dnes seznam otázek, ne zjištění |
| **přepsat** | 11 Kdo vlastní péči | opravit „předseda vlády v demisi“ a svěřenské fondy; zbylá fakta sedí; požádat o vyjádření, ale odpověď nečekat |
| **přepsat** | 03 Digital → „Dětská psychiatrie a péče na dálku“ | opravit telemedicínu (zákon 240/2024 Sb.), MAIA, ransomware; rozšířit o skutečná data o psychiatrech |
| **přepsat** | Japonsko, DRG | doplnit zdroje a čísla; DRG vysvětlit laikovi (co je cherry picking a upcoding) |
| **zachovat + opravit** | 01, 02, 07, 09, 10, one-pager | opravit čísla, odstranit zástupné boxy, dodat grafy ze skriptu |
| **doplnit ★** | **Čekací doby a dostupnost specialistů** | hlavní zkušenost pacientů; chybí v kapitole úplně |
| **doplnit ★** | **Kolik zdravotnictví stojí a kdo platí** (platba státu za státní pojištěnce, rozpočet pojišťoven 2027, tisk 235) | rozhodující rozpočtová otázka každé vlády, aktuální v Sněmovně |
| **doplnit** | Záchranky a dojezdové doby | dostupnost akutní péče, vlastní výpočet z dat ZZS |
| **doplnit** | Reforma dlouhodobé péče, příspěvek na péči | 10 popisuje problém, chybí řešení a co vláda dělá (zákon o dlouhodobé péči v MZ legislativě nenalezen) |
| **doplnit z webu** | Smrtelná vlna veder (2026-07-30); Návrat karenční doby (2026-09-24); Poruchy příjmu potravy u dívek (2026-10-25) | web články s tématem zdraví; ověřit soulad s kapitolou |
| **rozhodnout** | web dlaždice „Jak se žije lidem se zdravotním postižením“ (2026-08-04) | patří spíš do sociální politiky než zdravotnictví |

Výsledek: z 15 položek zůstane 11 (2× sloučení do 01 a 10, 1× sloučení 04+06), přibydou 2 nové + 2–3 texty z webu → 16 dlaždic. Pokud Michal u některého navržené doplnění nesouhlasí, kapitola se drží sudého počtu úpravou jedné dlaždice.

### 3c. Doplněk k návrhu složení: pohled „domov → region → střední Evropa → Evropa → svět“ (Kateřina, 28. 10. 2026)

Projekt se dívá nejdřív hodně zblízka domů (kraje, okresy, konkrétní ordinace), pak na střední Evropu, na celou Evropu a nakonec globálně. **Návrh, k schválení Kateřinou; nahrazuje řádek „doplnit z webu“ ve 3b tak, aby kapitola měla všechny čtyři zoomy.**

| Zoom | Články dnes | Stav |
|---|---|---|
| Domov (kraje, okresy) | 01 Pyramida, 07 Zubaři, 09 Nemocnice, 10 Kdo se postará, 03 Psychiatrie (Jesenicko), 11 Kdo vlastní, 12 Vojtěch | silný, i nad rámec potřeby |
| Střední Evropa | 06 Rakousko | slabý: jediný text, bez Polska, Slovenska, Maďarska, Německa |
| Evropa | 02 Zdravé roky (29 zemí), 04 Norsko, DRG | dobrý, DRG ale srovnává jen s popisem, bez zemí |
| Svět | Japonsko | jediný text, bez druhého srovnání |

Navržená výsledná skladba 16 dlaždic (sudý počet):

| # | Zoom | Článek | Značka |
|---|---|---|---|
| 1–4 | domov | 01 Pyramida (+ rámeček „Ověřili jsme 53 %“), 07 Zubaři, 09 Nemocnice, 10 Kdo se postará (+ 08 Odbornosti) | zachovat + opravit |
| 5 | domov (kraje) | 03 Dětská psychiatrie a péče na dálku | P★ |
| 6 | domov (kraje) | **Čekací doby a dostupnost specialistů** (podle krajů, záchranky a dojezdy jako součást) | N★ |
| 7–8 | domov (politika) | 11 Kdo vlastní péči, 12 Třetí návrat Vojtěcha | P★ |
| 9 | domov + Evropa | **Kolik zdravotnictví stojí a kdo platí** (podíl na HDP proti sousedům, platba za státní pojištěnce, tisk 235) | N★ |
| 10 | **střední Evropa** | **Sousedé: lékaři, sestry a peníze v Česku, Polsku, Slovensku, Maďarsku, Rakousku a Německu** (OECD, Eurostat; skript `lekari_sestry_oecd` už je v plánu) | N |
| 11 | střední Evropa | Sestry a skupinové praxe: Norsko + Rakousko (sloučené 04 + 06) | P |
| 12 | Evropa | 02 Zdravé roky ve 29 zemích | zachovat + opravit |
| 13 | Evropa | DRG: jak platí nemocnice (doplnit Německo a další země, které DRG používají) | P |
| 14 | svět | Japonsko | P |
| 15 | **svět** | **Druhý globální příklad.** Kandidát: Jižní Korea (rychlé stárnutí a spor o počty lékařů); před přijetím ověřit, že data a zdroje opravdu sedí | N, k ověření |
| 16 | domov (politika) | **Jedna dlaždice z webu**, vybrat po přečtení: Návrat karenční doby (2026-09-24), nebo Smrtelná vlna veder (2026-07-30) | W |

Co tím odpadá oproti 3b: zbylé dvě dlaždice z webu (Poruchy příjmu potravy u dívek, dlaždice o postižení) zůstávají na webu mimo kapitolu, pokud nenajdeme jejich vazbu na péči; dá se je vrátit místo čísla 16. Reforma dlouhodobé péče se zpracuje uvnitř 10, ne jako samostatný článek.

### Pořadí práce (návrh, po schválení složení)

1. **Schválení složení** (Kateřina; u kapitoly 2 případně Michal): nic se nepřepisuje a nemaže dřív.
2. **Hned:** opravit ověřené chyby (oddíl 2) v textech, které zůstávají; odstranit zástupné boxy „Připravovaná grafika“.
3. **P★:** přepis 03 (psychiatrie a péče na dálku), 11 a 12 (politici a vlastnictví), sloučení 04+06.
4. **N★:** čekací doby; kolik zdravotnictví stojí a kdo platí; grafy ze skriptu v `_data_pipeline/`.
5. **W:** zařazení článků z webu jako dlaždic (po souladu s tématem).
6. Covery všech článků (kontaktní arch), sladění dlaždic (`image` + `imageAspect`), one-pager a úvod kapitoly přepsat podle výsledné stavby, `validate-meta.mjs`, build, publikace jen na pokyn Kateřiny.

## 4. Chybějící témata (návrh)

Podrobnosti v plánu u Kateřiny. Priorita ★: **čekací doby a dostupnost specialistů**, **kolik zdravotnictví stojí a kdo platí** (pojistné, platba státu za státní pojištěnce, výsledek pojišťoven). Dále: záchranky a dojezdy, duševní zdraví, reforma dlouhodobé péče, sestry (platy, odchody), léky, prevence a screening.
Z webu DataTimes se hodí k zařazení jako dlaždice (v případě tematického souladu): *Smrtelná vlna veder* (2026-07-30), *Horko v kabině řidičů autobusů* (2026-07-31), *Návrat karenční doby nedává smysl* (2026-09-24), *Poruchy příjmu potravy u dívek* (2026-10-25). Dlaždice o lidech se zdravotním postižením (2026-08-04) patří spíš do kapitoly o sociální politice – rozhodnout.

## 5. Grafy a vizuály

| Prvek | Stav |
|---|---|
| `CHART_ZDRAVOTNICI` (Vega) | data ČSÚ 2020–2024, v pořádku; doplnit 2025, pokud ČSÚ vydal |
| `CHART_MD_AGE` | zdroj ÚZIS 2024, čtyři sloupce; ověřit hodnoty (34,6 / 33,3 / 30,2 / 15,0) |
| `CHART_HEALTHY_LIFE` | zdroj uveden „OECD Health Statistics“, ale komponenta `HealthyYearsComparison` cituje Eurostat 2023; **Česko 7,6 v textu, 7,7 v datech komponenty**; „Průměr EU 9,5“ bez zdroje (průměr z naší tabulky 29 zemí vychází 9,3); zelená `#27ae60` mimo paletu |
| `CHART_ODVRATITELNE` | pouze dva sloupce (Česko 592, OECD 473); ověřit definici a rok |
| `CHART_ZUBARI` | data ČSÚ, v pořádku (6 817, 6 868, 7 208, 6 845, 6 993) |
| `CareAccessMap` | vlastní mapa z NRPZS; ověřit metodiku a datum stažení; mapa ještě „neměří“ dobu jízdy, ordinační dobu, smlouvu ani přijímání pacientů (popsáno v poznámce, dobře) |
| `HealthyYearsComparison`, `EuropeHealthSystems` | data v `HealthcareVisuals/data/europe-health-systems.json` (29 zemí, Eurostat 2023); zdroj skriptu (stažení, datum) není u dat |
| `LongTermCareFlow` | **ručně kreslené schéma** (šířky spojnic zadané pevně, 20,7 % → 29 %); schéma neukazuje data, jen ilustruje; podle STAV.md „ručně kreslené SVG grafy s natvrdo zapsanými body nepoužívat“ |
| `OwnershipNetwork`, `CareJourneyScrolly` | schémata; ověřit, že tvrdí jen doložené vazby |
| zástupné boxy 07, 08, 09, 10, 12 | viz oddíl 1 |

Chybí `_data_pipeline/` pro kapitolu 2 (podle vzoru `01-demografie/_data_pipeline/`): všechny časové řady a srovnání země × země se mají počítat skriptem z primárních dat (ČSÚ, ÚZIS, OECD, Eurostat) a čísla v textu brát z jeho výstupu.

## 6. Seznam čísel k přepočtu skriptem

Skripty půjdou do `_content/02-zdravotnictvi-a-pece/_data_pipeline/` (vzor `01-demografie/_data_pipeline/`). Každý uloží výstup (CSV nebo JSON s datem stažení a URL zdroje) a text i grafy z něj čerpají. Pořadí podle rozdílu proti dnešnímu textu:

| # | Skript | Co spočítat | Primární zdroj | Kde se použije |
|---|---|---|---|---|
| 1 | `japonsko_cesko` | výdaje na zdraví % HDP (CZ, JP), LTC zdravotní + sociální % HDP, podíl 65+ (CZ, JP) a projekce CZ do 2060, potřeba pečovatelů JP | OECD SDMX (SHA), Eurostat proj_23np, MHLW | Japonsko, 10 |
| 2 | `zdrave_roky` | roky bez omezení činnosti po 65 letech, 29 zemí, celá řada do 2024, pohlaví; průměr EU z dat | Eurostat tepsr_sp320 | 02, CHART_HEALTHY_LIFE, HealthyYearsComparison, EuropeHealthSystems |
| 3 | `personal_csu` | lékaři, sestry, zubaři, fyzioterapeuti 2020 až 2024 (osoby a úvazky), změny v % | ČSÚ Pracovníci a mzdy ve zdravotnictví, ÚZIS NRZP | 01, 07, CHART_ZDRAVOTNICI, CHART_ZUBARI |
| 4 | `lekari_sestry_oecd` | praktikující lékaři a sestry na 1 000 obyvatel, CZ, NO, průměr OECD, 2013 až 2024; kvalifikované vs všechny sestry | OECD SDMX (DF_PHYS, DF_NURSE) | sloučený text 04 + 06 |
| 5 | `vek_lekaru` | věková struktura praktiků pro dospělé a děti (65+, 60+), průměrný věk, projekce odchodů | ÚZIS NRZP, strategické analýzy 12/2025 | 01, CHART_MD_AGE, one-pager |
| 6 | `absolventi` | absolventi všeobecného lékařství 2001, 2010 až 2025, občané ČR vs cizinci | MŠMT přes ÚZIS, Aktuální informace 53/2002 | 01 |
| 7 | `starnuti_podil_80` | podíl 80+ a 65+ 2000 až 2050 (základní varianta), srovnání ČSÚ vs Eurostat | Eurostat demo_pjanind, proj_23np; ČSÚ | 02, 10, LongTermCareFlow (nahradí ručně kreslené schéma) |
| 8 | `luzka_hospitalizace` | nemocniční lůžka a délka hospitalizace (akutní i všechna), obsazenost, CZ vs OECD vs EU | OECD SDMX, HAG 2025 | 09, explainer-drg |
| 9 | `ltc_kapacity` | lůžka pobytových služeb 2024 a 2035 až 2040 (dva modely MPSV), pracovníci LTC na 100 osob 65+ | MPSV, ČTK, OECD HAG 2025 | 10 |
| 10 | `odvratitelne` | odvratitelné hospitalizace, prevence % výdajů, spoluúčast domácností | OECD HAG 2025, CHP Czechia 2025, WHO Europe | 02, 07, one-pager |
| 11 | `rakousko_pve` | počet primárních center 2023 až 2026, cíl 2030 | Sozialministerium, BKA | sloučený text 04 + 06 |
| 12 | `zivotni_doba` | naděje dožití při narození, ČR 2000 až 2025, ženy a muži | ČSÚ, Eurostat demo_mlexpec | 02 |
| 13 | `psychiatri` | počet dětských psychiatrů a věková struktura; vzdálenosti jen pokud dostaneme data | MZ, ÚZIS oborové statistiky, NRPZS | 03 (přepsaný) |
| 14 | `cekaci_doby` | čekací doby na specialisty podle krajů a oborů (nový článek ★) | pojišťovny, ÚZIS, NRPZS; poptat data | nový článek |
| 15 | `penize` | příjmy a výdaje zdravotního pojištění 2018 až 2027, platba státu za státní pojištěnce (nový článek ★) | MZ vyhlášky, VZP, psp.cz tisk 235 | nový článek, 12 |

**Kolize čísel mezi texty (sjednotit po přepočtu):** roky ve zdraví (01, 02, one-pager, komponenty) a 53 % lékařů (01, 05, one-pager) brát z jednoho výstupu skriptu. Průměrný věk lékaře, podíl 65+ a 35 % dětských praktiků psát vždy se stejnou definicí a rokem.

**Co nelze spočítat z veřejných dat (poptat):** 80 km z Jesenicka (vzdálenosti k dětskému psychiatrovi), čekací doby (nejsou publikovány jednotně), vlastnický řetězec Hartenbergu (výpis z obchodního rejstříku).
