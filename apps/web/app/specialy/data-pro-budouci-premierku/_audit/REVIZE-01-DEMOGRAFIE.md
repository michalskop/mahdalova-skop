# Revize kapitoly 1 Demografie (Data pro budoucí premiérku), 16. 10. 2026

Stav k 28. 10. 2026: ověřené chyby z oddílu 2 jsou opravené (kromě 03 a 06, viz STAV.md), článek 05 je přepsaný. Návrh nové stavby (oddíl 3) a nové texty čekají na schválení Kateřiny. Pozor: původní tabulka chyb níže je ze 16. 10.; při opravách se ukázalo víc (Francie, Švédsko, přehled 35 studií), viz commity 655b871b a c23aa336.

## 1. V jakém je kapitola stavu

**Silné stránky**
- Jasná teze, která drží celou kapitolu: „2,1 je slib bez plánu, pomáhat se má lidem, kteří děti chtějí“. Vlastní výpočet (621 pětiletých a 732 desetiletých oken bohatých zemí, `FertilityFanScrolly`) je originální a obhajitelný.
- Dobré vizuály: plodnost od 1990, vějíř, tempo efekt, posun věku matek, stárnutí (scrollytelling).
- Silné texty: 01 Vymíráme, 11 Vylidňování obcí, 16 Stárnutí, 17 Migrace, 09 Páry.

**Slabiny**
1. **Faktické chyby a zastaralá čísla** (ověřeno u zdroje, viz oddíl 2).
2. **Opakování:** tempo efekt a kohortní plodnost vysvětlují tři texty (02, 05, 07). Švédsko, Francii a Maďarsko srovnávají dva (04, 12). Slabé ročníky matek se opakují ve třech (02, 10, 13), vzdělání ve dvou (10, 14). Přehled 57 studií (Bergsvik a kol.) se cituje ve třech.
3. **Nerovnoměrná hloubka:** vedle textů o 1 300–1 600 slovech jsou „pahýly“ o 340–480 slovech (13, 14, 10, 15, 16, 17), často bez vlastního grafu a odkazů na zdroj.
4. **Chybí, co mají ostatní kapitoly:** souhrn kapitoly (one-pager), formát „Ověřili jsme…“ a mapy, které 11 slibuje („doplníme po dokončení“).
5. **Rozpor tónu:** úvod kapitoly „Vymíráme? Přijde na to, koho myslíme“ × titulek 01 „Vymíráme. To je prostě fakt“. Věta o programovém prohlášení je doslova v úvodu i v 01.
6. **Proti manuálu:** souhrnné „Zdroje:“ na konci (04, 06), zakázaná slova („pozoruhodný“, „mechanismus“ místo kauzální věty), holé údernice („Číslo 2,1 je hausnumero.“), tvrzení bez odkazu (05, 06, 08, 09, 10, 13, 14). Graf v 06 má barvy mimo paletu (růžová, zelená).
7. **Citlivé místo k právu na vyjádření:** 01 spojuje Babiše (Hartenberg, FutureLife) a ministra Šťastného s obory, kterým demografie přeje. Ověřit aktuální stav a dát jim možnost reagovat.

## 2. Ověřené chyby (opravit u všech výskytů)

| Co v kapitole je | Co platí | Zdroj | Kde |
|---|---|---|---|
| vrchol plodnosti 1,71 v roce 2020, „od roku 2021 klesá“ | vrchol **1,83 v roce 2021**, pak 1,62 (2022), 1,45 (2023), 1,37 (2024), 1,28 (2025) | ČSÚ, Nejméně narozených dětí v historii; Vývoj obyvatelstva 2024 | úvod kapitoly, 05, 07 |
| první dítě „přes 30 let“, „Věk 30 je nový věk 22“, posun „o víc než 8 let“ | průměrný věk matky při 1. porodu **29,2 (2025)**; 1993: 22,6 → posun zhruba o 7 let | ČSÚ (tamtéž), tabulky Porodnost | 05 (titulek), 07, 09 |
| Maďarsko 1,55–1,60, „otevřená otázka“ | **1,39 (2024), 1,31 (2025)**, skoro jako Česko | KSH, gyorstájékoztató 30. 1. 2026 | 04, 12 |
| Korea 0,72, „nejnižší“ | **0,75 (2024), 0,80 (2025)**, druhý rok růstu, táhnou ho sňatky | Statistics Korea / MODS, Birth Statistics 2025 | 09 |
| Praha „1,37 mil. (2021)“ | sčítání 2021: **1 301 432** | ČSÚ, SLDB 2021 | 11 |
| pokles Švédska po 2010 „nadnesený počtem silných ročníků“ | úhrnná plodnost na velikosti ročníků nezávisí; vysvětlení je metodicky špatně a odporuje 01 | definice TFR | 04 |
| minimum 1,13 (01) × 1,14 (05, 07) | sjednotit podle ČSÚ | ČSÚ, časová řada | 01, 05, 07 |
| Sněmovna 22 % žen (2021), kraje 2020 | zastaralé po volbách 2024 a 2025 | přepočítat z volby.gov.cz | 06 |
| ČR v tabulce: TFR 1,46 a 10,7 mil. × text 10,9 mil. | sjednotit, uvést rok a zdroj (OSN vs. ČSÚ) | UN WPP 2024 / ČSÚ | 03 |

| „přes 50 % dětí se rodí mimo manželství“ | **46,8 % (2025)** | ČSÚ, RI Pohyb obyvatelstva – rok 2025 | 04, 10, 12 |

**K přepočtu skriptem** (zatím bez opory v primárním zdroji): jesle 5 % × EU 35 % (04, 08, 12); páry 25–34 let 68 → 58 % (09); Karviná −12 %, Říčany +30 % (11); „žen v nejplodnějším věku o třetinu méně“ (02); kohortní plodnost 1,7–1,8 (05, 07); „36 zemí má kvóty“ (06).

## 2b. Co se teď řeší a co v kapitole chybí

Rešerše duben–říjen 2026. U položek označených „média“ nemám primární zdroj, před použitím dohledat.

| Téma | Stav v kapitole | Klíčové číslo, zdroj |
|---|---|---|
| Česko v 1. pololetí 2026 ubývá i s migrací | chybí | −12,2 tis. obyvatel, saldo migrace jen +8,9 tis. (ČSÚ, RI 11. 9. 2026) |
| Rodičovský příspěvek 400 000 Kč od 2027 | chybí | zákon č. 152/2026 Sb., tisk 198 (MPSV) |
| „Milion za druhé dítě“, nulová daň pro matky tří dětí (Babiš, Fórum rodinné politiky 11. 9., návrhy Solvo) | chybí | odhad ~30 mld. ročně jen z médií → spočítat sami |
| Programové prohlášení: „upřednostňovat manželství“ | chybí | vlada.gov.cz, PDF; mimo manželství 46,8 % dětí |
| Bezdětnost: při plodnosti 2025 až 38 % žen | chybí | ČSÚ (Štyglerová) |
| Chtěné × skutečné děti: 34 % rodičů má méně dětí, než plánovalo | jen citát Šťastné | Zpráva o rodině 2026 (RILSA/MPSV) |
| Důchodový věk 65 odložen, novela z 20. 7. 2026 | chybí | média, číslo tisku dohledat |
| Cizinci 10,4 % populace, Ukrajinci s dočasnou ochranou 390 tis., zpřísnění dávek | jen obecně (17) | MV, Zpráva o migraci 2025 a 2. čtvrtletí 2026 |
| Dlouhodobá péče o seniory | chybí | média a oborové odhady |
| Maďarsko 1,31, Korea 0,80, Polsko 1,07, EU 1,34 | zastaralé | KSH; Statistics Korea; GUS (média); Eurostat |
| Naděje dožití 2025: ženy 83,19, muži 77,49 | chybí | ČSÚ (dohledat celostátní tabulku) |
| Matky doma, jesle, rané kolektivy (naše agenda) | jen okrajově | série DataTimes, díl 2 vychází 19. 10. |

## 3. Návrh nové stavby (knižní kapitola v pěti oddílech)

Značky: **P** = přepsat/sloučit stávající, **N** = nový text, **W** = text z webu (dlaždice), ★ = vysoká priorita.

**I. Kolik nás je a kolik nás bude**
1. P★ Otvírák: Vymíráme? (01 + úvod kapitoly, opravená čísla, jednotný tón)
2. P Explainer: Momentka a film – co znamená 1,28 (sloučit 02 + 07 + kohortní část 05)
3. P Matky, které se nenarodily: aritmetika slabých ročníků (sloučit 13 + 10 + část 02, nový graf věkové pyramidy žen)
4. P Stárnutí (16) – rozšířit o důchody a důchodový věk (most do kapitoly 14)
5. P Migrace (17) + **N★ Cizinci v datech:** kolik dětí rodí cizinky, Ukrajinci a děti ve školách, kde žijí
6. P Svět (03) – opravená tabulka

5b. **N★ Česko ubývá:** první pololetí 2026 poprvé s úbytkem i přes migraci (aktualizace, „číslo dne“)

**II. Proč se rodí méně dětí**
6b. **N★ Chtěné děti, které se nenarodily:** 34 % rodičů má méně dětí, než plánovalo, bezdětnost až 38 % (Zpráva o rodině 2026, ČSÚ)
7. P★ Načasování: první dítě v 29,2 (05 s novým titulkem a čísly)
8. P Páry (09) + Korea: obrat táhnou sňatky + **N Sňatky a rozvody** (navázat na námět N-13 Rozvody podle věku)
9. **N★ Neplodnost a IVF:** kolik dětí se rodí z asistované reprodukce, věk, úhrada, kdo to platí (most k 01)
10. **N★ Muži a otcové:** otcovská v číslech (ČSSZ), muži na rodičovské, vzdělanostní nepoměr na sňatkovém trhu
11. **N Bydlení a první dítě:** věk matky × dostupnost bydlení po krajích (most do kapitoly 3)
12. P Vzdělání a plodnost (sloučit 14 + část 10)

**III. Matky, děti a péče** (agenda, kterou do veřejného prostoru vnášíme my)
13. W Česko drží matky doma, díl 1 (už zařazen)
14. W Díl 2: matky ve střední Evropě (vydání 19. 10.)
15. N★ Díl 3: Katolické Rakousko zve do jeslí od roku (fotoreportáž z kostelů, N-21)
16. **N★ Jesle a dětské skupiny v datech:** mapa míst podle ORP, kde chybí (MPSV, MŠMT), přepočtené 5 % × EU
17. **N Rodičovský příspěvek a co vláda změnila:** kdo na tom vydělá (výpočet)
18. **N Samoživitelky a výživné:** chudoba (EU-SILC), náhradní výživné, exekuce
19. P Kdo o rodinné politice rozhoduje (06 s daty 2024–2026 + W Ženy na radnicích)

**IV. Území**
20. P Vylidňování obcí (11) + slíbené mapy (T6) + W Kolik má Česko obcí
21. **N★ Naděje dožití podle okresů:** kolik let života dělí Prahu a Karvinsko (most do kapitol 2 a 4)
22. P Voličská základna (15) + W Kdo zůstal doma

**V. Co s tím**
23. P★ Rok vlády a slib 2,1: co vláda Andreje Babiše pro rodiny skutečně udělala (08 přepsat na bilanci: rodičák 400 000, školkovné, sliby k bydlení, manželství)
23b. **N★ Spočítali jsme „milion za druhé dítě“:** kolik by stál, komu by pomohl a co o jednorázových penězích říkají data (Maďarsko, Polsko)
23c. **N Péče o seniory:** kolik lůžek a pečujících bude chybět, až silné ročníky 70. let zestárnou (most do kapitoly 2)
24. P★ Čtyři modely (sloučit 04 + 12): Maďarsko utratilo jako nikdo v Evropě a má 1,31; Korea; Francie; Kanada
25. **N Ověřili jsme…** (formát ostatních kapitol), např. „Rodí se víc dětí cizinkám?“
26. **N Souhrn kapitoly (one-pager)**

Ze 17 textů by tak bylo zhruba 30, z toho 16 nových (včetně dílů série a textů z webu), zbytek přepisy, sloučení a opravy.

## 4. Pořadí práce (návrh)

1. **Hned (týden):** opravit ověřené chyby v 01, 04, 05, 07, 09, 11, 12 a úvodu kapitoly; sjednotit tón úvodu a 01.
2. **Do konce října:** 23b „Milion za druhé dítě“ (rezonuje nejvíc, je to naše výpočetní síla), 5b „Česko ubývá“, 6b „Chtěné děti“, díl 2 a díl 3 série o matkách.
3. **Listopad:** slučování (02+07, 04+12, 10+13, 10+14), 16 Jesle v datech, 9 IVF, 10 Muži a otcové, souhrn kapitoly.
4. **Průběžně:** mapy do 11, naděje dožití, péče o seniory, cizinci.
