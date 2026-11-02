# Článek 05 – Čas rodičovství (zdroje a postup)

Čísla v článku počítá `vypocet.py`, grafy staví `build_charts.py`. Původní soubory jsou mimo repozitář (stažení 28. 10. 2026 do `C:/tmp/dpbp-05-07/raw`).

| Soubor | Zdroj | SHA-256 |
|---|---|---|
| `OBY01CR.csv` | ČSÚ, Obyvatelstvo – roční časové řady, open data OBY01CR (https://data.csu.gov.cz/opendata/sady/OBY01CR/distribuce/csv): úhrnná plodnost, průměrný věk matek při narození 1. dítěte a všech dětí, živě narození | c648672288fde644d15b509d27cdc2103764610a27bf80f1a616039158a08cea |
| `13005525_data.zip` | ČSÚ, Demografická příručka – data za rok 2024, kód 130055-25, vydáno 25. 11. 2025 (https://csu.gov.cz/produkty/demograficka-prirucka-2024) | 9796dbb16d1e037a748daa76d02a336db8ca9e30d10bb7498a17915740dbeae6 |
| `zip/130055250612.xlsx` | tab. 6.12 Úhrnná plodnost podle pořadí a míry reprodukce 1920–2024 | 4da5be130a14069d4615decc20c7cac90d1f6e6e029ab924f940adb8ec6915e4 |
| `zip/130055250613.xlsx` | tab. 6.13 Průměrný věk žen při narození dítěte 1950–2024 (podle pořadí) | 27ec4194831adacb98ee89ba2e91cf628bf5671320312e2e2dc58bd47c931c39 |
| `zip/130055250611.xlsx` | tab. 6.11 Míry plodnosti žen podle věku 1950–2024 (vstup pro kohortní graf, viz `../07-kohortni-plodnost`) | ff9261455ae5049460027eb10d07df266b9c51944f1b492f83b10694b6f54736 |
| `eurostat_demo_find.json` | Eurostat, demo_find, indikátor AGEMOTH1 (průměrný věk při narození 1. dítěte), aktualizováno 30. 9. 2026 | 34ff3827059495cf9674aa254fe2c15324fc4440f14746f4a780f276fb854d88 |
| `statistikaamy.html` | ČSÚ, Statistika&My, T. Štyglerová, „Nejméně narozených dětí v historii“, 18. 5. 2026 (29,2 roku, 30,6 roku, pravděpodobnost 1. dítěte 88 → 62 %, 2. dítěte 78–79 %, pokles měr o ~30 %, kohorty 1970/1980) | 9b3fda413f0b4fa58d52decd3afbc3f452e6e44ad1ddfeca1448c34546872d3d |

Spuštění: `python -X utf8 -I vypocet.py`, potom `python -X utf8 -I ../07-kohortni-plodnost/kohorty.py` a `python -X utf8 -I build_charts.py`.

## Co skript počítá
- **Věk prvorodičky** (`data/ukazatele_cr.csv`): přímo z OBY01CR. 1990: 22,47; 2025: 29,16 roku; posun 6,69 roku. Věk všech matek 24,76 → 30,63.
- **Úhrnná plodnost**: minimum 1,1328 v roce 1999, v roce 2000 1,1436; 2025: 1,2818. Živě narození 2025: 77 636 (nejméně v řadě od 1806).
- **Odklad (tempo) metodou Bongaarts–Feeney** (`data/tempo_bf.csv`): pro každý rok součet plodnosti podle pořadí dítěte i dělený (1 − r_i), kde r_i je centrovaná roční změna průměrného věku při porodu pořadí i (Bongaarts, Feeney 1998, https://doi.org/10.2307/2807974). Odhad, není to měření. 1999: 1,133 → 1,628; 2023: 1,453 → 1,510. Pro 2024–2025 chybí tabulky podle pořadí. Roky 2020–2021 jsou kvůli epidemii nespolehlivé (1,94 a 2,04).
- **Srovnání zemí** (`data/eurostat_vek_prvni.csv`): 19 států s údajem pro 1995 i 2024; Estonsko +5,9, Česko +5,7, Litva +5,5 roku. Eurostat zaokrouhluje na 0,1 roku. Jen Evropa; OECD mimo Evropu (Korea, Japonsko) jsme neověřovali.
- **Kohorty** (`GRAF_05_KOHORTY`): vstup `../07-kohortni-plodnost/data/kohorty_kumul.csv`; původní data grafu (Human Fertility Database) nešlo bez registrace znovu stáhnout, proto jsou nahrazena přepočtem z tabulky ČSÚ 6.11 (hodnoty se liší o 0,0 až 0,1 dítěte, např. ročník 1970 do 34 let 1,68 v HFD a 1,70 v ČSÚ).

## Známé limity
- Komponenta `MothersAgeShiftChart` (sdílená, nesahali jsme na ni) má chybné hodnoty (30,5 roku v roce 2023, „+8 let za 33 let“) a z článku byla odstraněna; nahradil ji `GRAF_05_VEK_PRVNI`.
- ČSÚ ukazatele pravděpodobností 1./2. dítěte (88 → 62 %, 78–79 %) jsme nepřepočítávali (nemáme zdrojovou tabulku), jsou citovány ze Statistiky&My.
