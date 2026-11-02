# Ženy × muži a preferenční hlasy v obecních volbách 2018–2026 – zjištění

Stav 15. 10. 2026. Skript: `_data_pipeline/build.py`, úplný výstup `vstupy/vystup.txt`. Data: registr kandidátů ČSÚ (kvrk/kvros/kvrzcoco) 2018, 2022, 2026 (stav 11. 10. 2026). Metriky beze změny převzaté z pipeline článku `volby-cr-2026-10-15-profese-zastupitelu` (load(), summary()).

## Určení pohlaví (ČSÚ ho neuvádí)
- Příjmení na -ová/-á → žena, -ý/-ský → muž; křestní jméno se naučí z dat (339 jmen s ≥ 97 % jednoho pohlaví, ≥ 20 výskytů); rozpor = „nejisté“.
- Nejisté: 2,0–2,1 % kandidátů v každém roce (cizí a vzácná jména), z porovnání vyřazené.
- Kontrola: z 27 701 kandidátů s výslovně ženským tvarem povolání (učitelka, starostka…) je jako žena určeno 99,6 %; 15 „rozporů“ jsou muži s povoláním „zdravotní sestra“. 7 135 žen naopak uvádí mužský tvar (referent, technik, ekonom) – tvar povolání proto pohlaví neurčuje.

## (1) Celkem – 2026
| | kandidátů | zvoleno | hlasy navíc | přeskočení z nevolitelného místa (násobek) |
|-|-|-|-|-|
| ženy | 66 277 (35,7 %) | 28,1 % | −1,2 % | 0,91× |
| muži | 119 594 | 35,2 % | +0,7 % | 1,06× |
- Uvnitř téže kandidátky má žena o 2,0 % méně hlasů než muž na srovnatelném místě (2022: −2,4 %, 2018: −3,0 %). Ženy mají vyšší bonus než muži na 46 % kandidátek.
- Regrese uvnitř kandidátky s kontrolou profese, věku a obhajoby mandátu: ženy −2,1 % (95% interval −2,3 až −1,8); 2022 −2,7 %; 2018 −4,3 % (bez kontroly obhajoby). Po kontrole profese se rozdíl spíš zvětší (ženy jsou častěji v „hlasonosných“ profesích – učitelky, lékařky – ale uvnitř nich dostávají méně).

## KLÍČOVÉ: preferenční hlasy podíl žen v zastupitelstvech nemění
- 2026: kdyby rozhodovalo jen pořadí na kandidátce, bylo by mezi zvolenými 30,6 % žen; skutečně 30,7 %. 2022: 29,5 → 29,6 %. 2018: 28,7 → 28,6 %.
- Ženy 2026: 1 898 vypadlo z volitelného místa, 1 959 se dostalo zpod čáry (saldo +61).
- Kde se ženy ztrácejí: 35,7 % kandidátů, ale jen 27,7 % lídrů kandidátek a 22,7 % vs. 29,5 % mužů na 1.–3. místě; 59,5 % žen stojí pod čarou (muži 54,1 %). → o zastoupení žen rozhodují strany pořadím, ne voliči kroužkováním.

## (2) Uvnitř stejné profese – 2026 (pohlaví ze jména, ne z tvaru slova)
| | ženy hlasy navíc | muži | ženy přeskočení | muži |
|-|-|-|-|-|
| učitel/ka (bez ředitelů) | +4,1 % (5 839) | +8,7 % (2 843) | 1,29× | 1,84× |
| ředitel/ka školy | +9,4 % (1 436) | +14,2 % (844) | 1,78× | 3,69× |
| lékař/ka (vč. zubařů) | +10,2 % (1 105) | +14,3 % (1 155) | 2,53× | 3,75× |
| starosta/ka | +0,8 % (1 193) | +3,5 % (2 976) | 2,65× | 3,59× |
| místostarosta/ka | +7,2 % | +9,0 % | | |
| zdravotní sestra/bratr | +1,0 % | +0,7 % (137) | | |
| účetní | +0,7 % | +2,1 % (184) | | |
| podnikatel/ka | −2,5 % | +0,6 % | | |
| důchodce/kyně | −7,9 % | −6,0 % | | |
- Dohledávač Kateřiny („učitel“ +9 %, „učitelka“ +4 %) sedí: „učitel“ muži +8,9 %, „učitelka“ +4,1 %.
- Část rozdílu je obhajoba mandátu: učitelé obhajují častěji (34 % vs. 23 %). Ale i jen noví kandidáti: učitelky +1,2 %, učitelé +5,8 %; regrese uvnitř kandidátky s věkem a obhajobou: učitelky −3,7 %, ředitelky škol −5,6 %, lékařky −2,7 % proti mužským kolegům.
- Stejné znění: učitelka ZŠ +6,9 % × učitel ZŠ +12,4 %; praktická lékařka +13,0 % × praktický lékař +17,0 %; ředitelka ZŠ +11,8 % × ředitel ZŠ +14,1 %.
- Rozdíl v čase klesá: učitelky/učitelé 2018 +7,3/+10,8 → 2026 +4,1/+8,7; lékařky/lékaři 2018 +15,4/+19,9 → 2026 +10,2/+14,3.
- Možné nevolební vysvětlení (nelze z dat vyloučit): muž-učitel je v obci vzácnější, a tedy nápadnější; muži v profesi častěji vedou kroužky/sport apod.

## (3) Mateřská / rodičovská / v domácnosti
- 2026: 1 556 žen, hlasy navíc −11,0 %, přeskočení 0,40×; ostatní ženy 25–44 let −1,4 %, muži 25–44 +0,6 %. Nejhorší ze všech velkých skupin (dělnice −12,4 %, ale jen 101 kandidátek).
- Podle velikosti obce: do 1 000 −14,1 %; 1 000–4 000 −11,9 %; 4 000–20 000 −6,6 %; 20–100 tis. +0,6 %; nad 100 tis. +1,9 % → postih jen ve vesnicích a malých městech.
- 2018 −10,4 %, 2022 −9,9 %, 2026 −11,0 % – stabilní.
- Muži na rodičovské: 15–28 ročně, čísla nepoužitelná (2026 −7,4 %, n = 15). Znění: „rodičovská dovolená“ 448, „mateřská dovolená“ 428, „v domácnosti“ 115, „žena v domácnosti“ 75.
- Pozor na interpretaci: mateřská = povolání chybí, voliči nevidí profesi; podobně studenti (−7 %) a důchodci (−8 %). Nejde nutně o trest za mateřství, ale o chybějící „pracovní identitu“ na lístku.

## (4) Velikost obce a čas (regrese uvnitř kandidátky 2026)
- do 1 000: −2,9 %; 1 000–4 000: −2,7 %; 4 000–20 000: −2,4 %; 20–100 tis.: −1,0 %; nad 100 tis.: 0,0 % (interval −0,3 až +0,3).
- Čas: −4,3 % (2018) → −2,7 % (2022) → −2,1 % (2026). Podíl žen mezi zvolenými 28,6 → 29,6 → 30,7 %; mezi kandidáty 34,1 → 34,6 → 35,7 %.

## (5) Dosavadní zastupitelé
- Obhajující 2026: ženy +7,0 %, muži +7,6 %; regrese −0,4 % (interval −0,8 až +0,1) = žádný rozdíl. Stejně 2022 (+8,4 vs. +8,6).
- Noví 2026: ženy −3,0 %, muži −1,8 %; regrese −2,4 %.
- Ženy obhajují méně často (19,4 % vs. 28,8 %), což část hrubého rozdílu vysvětluje.
- → Ženu, kterou voliči už znají ze zastupitelstva, nepenalizují; rozdíl dopadá na nováčky.

## Alternativní vysvětlení – ověřeno
- Pořadí na kandidátce: metrika už srovnává se stejným místem stejně dlouhé kandidátky; rozdíl je podobný u lídrů (−1,3 b.), 2.–5. místa (−1,6) i níž (−1,5).
- Typ kandidátky: rozdíl napříč typy, největší KDU-ČSL (−4,8 b.) a KSČM (−4,0), nulový ANO (−0,1), STAN (+1,4); SNK −2,0.
- Věk: medián 48 let u obou; rozdíl největší 30–39 let (−3,2 b.), nejmenší 18–29 (−0,6).
- Profese, věk, obhajoba: viz regrese, rozdíl zůstává ~2 %.

## Návrh teze titulku (ke schválení)
1. **Voliči ženy na kandidátkách nepotápějí. O tom, kolik jich usedne v zastupitelstvu, rozhodují strany** (nejsilnější teze podle dat).
2. Učitelka dostane méně hlasů navíc než učitel, maminka na mateřské nejméně ze všech. Do zastupitelstva ženy ale nepouští hlavně pořadí na kandidátce.
3. Kroužek pro učitele, ne pro učitelku: voliči v obcích přidávají víc mužům. Rozdíl se ale každé volby zmenšuje.
