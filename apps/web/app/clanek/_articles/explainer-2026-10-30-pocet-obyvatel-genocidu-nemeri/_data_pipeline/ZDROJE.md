# Zdrojový záznam k článku (ověřeno 29. 10. 2026)

Čísla v textu a grafech počítají `cisla.py`, `krivky.py` a `grafy.py`. Spuštění: `python -I stahni.py` (jednou), `python -I cisla.py`, `python -I grafy.py`.

## Data
- **World Bank WDI, SP.POP.TOTL** (vychází z UN World Population Prospects 2024), staženo 29. 10. 2026 přes API do `zdroj/worldbank_SP.POP.TOTL.json` (poslední aktualizace WB 8. 10. 2026). Jde o rekonstrukce a odhady, ne o sčítání.
- **PCBS, předválečná projekce** „Projected Population in the Palestine“ (PCBS 2023, Revised Estimates based on Census 2017): Gaza 2023 2 226 544, 2024 2 287 558, 2025 2 349 301, 2026 2 411 790.
- **PCBS, válečné odhady:** Den populace 2025 (Press_En_WPD2025E.pdf): polovina 2025 2 114 301, polovina 2024 2 129 724. Konec 2025 (Press_En_PalPeopleEnd2025E.pdf): 2,13 mil., úbytek 254 000 = 10,6 % proti předválečné projekci. Vlastní přepočet proti polovině 2023: −96 544 (−4,3 %).
- **Oběti (ministerstvo zdravotnictví v Gaze přes OCHA, Reported impact snapshot):** 31. 12. 2024 45 541; 21. 10. 2026 74 494.
- **Lancet Global Health 2026** (Spagat a kol., DOI 10.1016/S2214-109X(25)00522-4): 75 200 násilných úmrtí (95% CI 63 600–86 800) do 5. 1. 2025; ministerstvo za totéž období 49 090 (o 34,7 % níž). Ověřen abstrakt (Europe PMC), plný text za paywallem.
- **Porody:** PCBS registr 2022 57 877 živě narozených v Gaze; UNFPA situační zpráva 24. 1. 2024 „180 women give birth each day“ (modelový odhad); UNFPA/UN News 23. 7. 2025: 17 000 porodů v 1. pololetí 2025 proti 29 000 v 1. pololetí 2022.
- **Odchody:** OCHA Humanitarian Situation Update #187 (5. 7. 2024): asi 110 000 lidí opustilo Gazu přes Egypt.

## Srovnání podílu zavražděných (graf podil-zavrazdenych.json)
- Tutsiové: HRW 1999 *Leave None to Tell the Story*, nejméně 507 000 z odhadem 657 000.
- Evropští Židé: USHMM, asi 9,5 mil. Židů v Evropě v roce 1933; zavražděno 6 mil.
- Čamové: Ben Kiernan, 90 000 z 250 000; genocida Čamů a Vietnamců podle ECCC (16. 11. 2018).
- Srebrenica: ICTY Krstić (odvolání 2004), asi 40 000 bosenských muslimů v enklávě, 7 000–8 000 zavražděných (v grafu horní mez 8 000).
- Jezídové: PLOS Medicine 2017 (Cetorelli a kol.), 3 100 zabitých a 6 800 unesených z asi 400 000 v oblasti Sindžáru.
- Gaza: 74 494 (OCHA, 21. 10. 2026) z 2 226 544 (PCBS, polovina 2023).

## Právní stav (vše ověřeno v plném textu, není-li uvedeno jinak)
- Úmluva 1948, čl. II a III: vyhláška 32/1955 Sb.
- ICTY Krstić, odvolací rozsudek IT-98-33-A, 19. 4. 2004, odst. 8, 12, 32, 37.
- ICJ Chorvatsko v. Srbsko, 3. 2. 2015, odst. 148, 417, 440.
- ICJ JAR v. Izrael: příkazy 26. 1., 28. 3., 24. 5. 2024; harmonogram z 21. 5. 2026 (odpověď JAR 22. 11. 2027, duplika Izraele 22. 5. 2029); 21 intervenujících států (tisková zpráva ICJ 2026/24). Obsah americké deklarace jen ze sekundárních zdrojů. Výrok Joan Donoghue (BBC HARDtalk, duben 2024) jen ze sekundárních zdrojů.
- ICC, 21. 11. 2024: zatykače za válečné zločiny a zločiny proti lidskosti, ne za genocidu.
- Komise OSN: A/HRC/60/CRP.3 (16. 9. 2025, odst. 157, 240, 253, 254), A/81/430 (zveřejněno 26. 10. 2026).
- Amnesty International (5. 12. 2024), HRW (19. 12. 2024), IAGS (1. 9. 2025, 86 % hlasujících, účast 28 %), B'Tselem a PHRI (27.–28. 7. 2025, jen ze sekundárních zdrojů).
- Izrael: stálá mise v Ženevě 16. 9. 2025; studie BESA č. 213 (září 2025). Německo: Regierungspressekonferenz 17. 9. 2025 a 18. 3. 2026.
- Myanmar: A/HRC/39/64 (12. 9. 2018), odst. 33 a 36. Rwanda: UNHCR *The State of the World's Refugees 2000*, kap. 10.
- Simon Schama, X, 13. 10. 2026 (ověřeno přes fxtwitter API).

## Co se nepodařilo ověřit
Autor a původ čtyřpanelového grafu; zda ministerstvo zdravotnictví v Gaze nebo Save the Children zveřejnily odhad počtu obyvatel (v textu jako „nepodařilo se nám dohledat“); roční počet porodů v Gaze 2024.
