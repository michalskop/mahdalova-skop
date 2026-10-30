# Článek 10 – Data o porodech (zdroje a postup)

Revize 28. 10. 2026. Čísla v textu vznikají skripty v této složce z oficiálních souborů ČSÚ (stažení 28. 10. 2026; originály v repu nejsou, kontrolní součty níže).

| Skript | Co dělá | Výstup |
|---|---|---|
| `obce_porody.py <pohyb25.zip>` | Sečte narozené za všechny obce po letech 1971–2025. Kontrola: rok 2025 = 77 636 (shodné s ČSÚ), 2021 = 111 793 (ČSÚ 111,8 tis.), 1971 = 154 180. | `data/porodnost_obce_soucet.csv` |
| `xlsx_to_csv.py <1301392303.xlsx> data/zeny_stredni.csv` | Převod Tab. 3 projekce (ženy podle věku, k 1. 1.). | `data/zeny_stredni.csv` |
| `vypocet.py <sldb2021_zeny_stav_vzdelani_vek_deti.csv>` | Průměrný počet dětí a podíl bezdětných žen podle věku a vzdělání (ČR, všechny rodinné stavy); velikost ročníků žen; změna počtu žen 26–33 a 23–37 let 2025 → 2030. | `data/vzdelani_deti_sldb2021.csv`, `data/kohorty_zen.csv`, `data/vypis.txt` |

| `vysokoskolacky_1991_2021.py <tab12.xls> <sldb2021_zeny_stav_vzdelani_vek_deti.csv>` | Podíl žen s vysokoškolským vzděláním ve sčítání 1991 a 2021 (25–34, 25–59, 15+; jmenovatel včetně nezjištěného vzdělání). 25–34 let: 11,2 % → 39,0 % (3,5×); 25–59 let: 8,0 % → 26,3 % (3,3×); 15+: 5,1 % → 18,2 %. | `data/vysokoskolacky_1991_2021.csv`, `data/vysokoskolacky_vypis.txt` |
| `otcove_vek_vzdelani.py <300002161116.xlsx> <300002161117.xlsx>` | Muži: průměrný věk otce při narození dítěte (32,1 v 2007, 32,9 v 2010, 33,6 v 2015; podíl otců 35+ 27,1 → 34,0 → 41,8 %) a vzdělání otců novorozených dětí 1993–2015 (nespolehlivé: vzdělání otce chybí u 13–37 % dětí). Počet dětí mužů podle vzdělání z oficiálních dat zjistit nelze (sčítání 2021 se ptalo jen žen). | `data/otcove_vek.csv`, `data/otcove_vzdelani.csv`, `data/otcove_vypis.txt` |

Zdrojové soubory (včetně sčítání 1991, tab. 12, `ac75ab82…af82f`) jsou v archivu `Zdrojová data\CSU\` (viz `ZDROJE.md` tam); znovu se nestahují.

## Zdroje
| Zdroj | URL | SHA-256 |
|---|---|---|
| ČSÚ, Databáze demografických údajů za obce ČR, část 1 (1971–2025), `pohyb25.zip` (77 souborů xlsx) | https://csu.gov.cz/databaze-demografickych-udaju-za-obce-cr | `b12db3cb0815d58421610a1e6ee3afbe5ccc4c54031280bc544d60673fa628de` |
| ČSÚ, Výsledky sčítání 2021 – otevřená data, „Ženy ve věku 15 a více let podle rodinného stavu, vzdělání, věku a počtu dětí“ (stav k 26. 3. 2021; úrovně ČR, regiony soudržnosti, kraje – obce ne) | https://csu.gov.cz/produkty/vysledky-scitani-2021-otevrena-data | `3cf686e0748c911995b4f0a07c191294f96032b2bf1440d695369dd4b7185c78` (sldb2021_zeny_stav_vzdelani_vek_deti.csv) |
| ČSÚ, Projekce obyvatelstva ČR 2023–2100, Tab. 3 Střední varianta – ženy (2023 = skutečnost, od 2024 projekce) | https://csu.gov.cz/csu/czso/projekce-obyvatelstva-ceske-republiky-2023-2100 | `e5e104f9866f764f78de33422a74fd372f105fbee0f459830356c5e94551f4f7` (1301392303.xlsx) |
| ČSÚ, Počet narozených byl loni nejnižší za posledních 240 let, TZ 31. 3. 2026 (docx) a prezentace z tiskové konference | https://csu.gov.cz/produkty/pocet-narozenych-byl-loni-nejnizsi-za-poslednich-240-let | docx `3d5f43b7a68226a8f10cf11ec84d150e1edb906bcc7096e9056da7e4a2ddd854`, pdf `af85797a196c9c279c0099c7ea8e8857899c356ae8cde1ba6fb1594b3d5ffade` |
| ČSÚ, Statistika&My, Nejméně narozených dětí v historii | https://statistikaamy.csu.gov.cz/nejmene-narozenych-deti-v-historii | (web) |
| Eurostat `edat_lfse_03` (ženy s ISCED 5–8, 25–64 let), `demo_find` (NMARPCT) | viz `_data_pipeline/09-pary-a-partnerstvi/vypocet.py` | |

## Čísla z tiskové zprávy a prezentace ČSÚ (ověřeno, předběžné údaje za 2025)
Narození 77,6 tis. (77 636 podle součtu obcí), plodnost 1,28 (2021: 1,83; minimum 1,13 v 1999), průměrný věk matky 30,6 / u prvního dítěte 29,2; Praha 1,15 (nejnižší) a Karlovarský kraj pod 1,2, Vysočina 1,42 (nejvyšší), Olomoucký 1,37; věk při 1. dítěti nejnižší Ústecký kraj 27,6, nejvyšší Praha 30,8; mimo manželství 47 % (kraje 37–64 %, okres Most 70 %); při plodnosti 2025 by zůstalo až 38 % žen bezdětných; žen 26–33 let ubylo mezi 2021 a 2025 o 35,8 tis.

## Limity
- Sčítání 2021 srovnává různé generace (30–34 a 45–49 let), ne tytéž ženy. Vysokoškolačky ve věku 25–29 let mohou ještě studovat.
- Projekce ČSÚ z roku 2023 (od 2024 projektované hodnoty) nezná skutečný pokles plodnosti ani migraci 2024–2025; odhad „−12 % / −9 % narozených do 2030“ je hrubý (počet narozených úměrný počtu žen v daném věkovém pásmu).
- Věk matky při prvním dítěti podle vzdělání jsme v otevřených datech nenašli; původní tvrzení „22–24 let × po třicítce“ nebylo doloženo.
- Kraj Vysočina 1,42, Praha 1,15, Karlovarský kraj „pod 1,2“: z prezentace a TZ; přesné krajské hodnoty ostatních krajů jsou jen v grafu (ČSÚ, s. 18 prezentace).
