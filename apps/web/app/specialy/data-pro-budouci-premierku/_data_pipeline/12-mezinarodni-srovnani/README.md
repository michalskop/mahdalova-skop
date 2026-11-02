# Článek 12 – Mezinárodní srovnání (zdroje a postup)

Čísla počítá `vypocet.py` z `data/*.csv` (vznikly skripty `priprava_dat.py` a `pracovni_vek.py`; výstup `vypocet_vystup.txt`; graf `GRAF_12_PLODNOST` staví `build_chart.py`). Stažení 28. 10. 2026.

| Soubor | Zdroj | SHA-256 |
|---|---|---|
| `eurostat_tfr.json` | Eurostat demo_find (TOTFERRT), SE, FR, HU, CZ, EU27, aktualizace 30. 9. 2026 | 8ba93f76366ada50a997b0279e17d72d5a2d16f84582fd24e5d1cfb2dd8ab9a1 |
| `childcare.json` | Eurostat ilc_caindformal, děti do 3 let, aktualizace 20. 10. 2026 | 7ff2ae258ccb6fb843c20fb257a07c71eed8ce893257c1e5d305537d1d05fc42 |
| `eu_age.json` | Eurostat demo_pjanind (střední věk, podíl 65+) | e6d7871f240047f333b510f260ece11e0d3049c36170be40da29898556a24bc4 |
| `pf11.xlsx`, `pf11.pdf` | OECD Family Database PF1.1 (aktualizace únor 2025), výdaje 2021 | de00248c98b4ea9aeaf53d4c30b01a6fb911108abc76e58c6654b34afbbf8914; cef75b9b0f8b38dce938004b264a32520117d1f01b8e07800b6facdc79ee1859 |
| `oby01cr.csv` | ČSÚ OBY01CR, podíl dětí mimo manželství | c648672288fde644d15b509d27cdc2103764610a27bf80f1a616039158a08cea |
| `FertilityFanScrolly/data.json` | Světová banka/OSN (Kanada, okna změn) | součást repa |

Ověřeno z webu (bez uložených souborů): INSEE Première č. 2087 (13. 1. 2026), plodnost FR 2025 = 1,56; Statistics Canada Daily 24. 9. 2025 (2024 = 1,25, 2023 = 1,27, změny −6,9/−5,2/−1,6 %); Försäkringskassan (480 dnů, 90 vyhrazených každému z rodičů, cca 80 % mzdy); IRCC (cíle stálých pobytů 2025 = 395 tis., 2026–2028 = 380 tis.; tisková zpráva 2022: imigrace ≈ 100 % růstu pracovní síly); PwC Tax Summaries Hungary (osvobození matek 4+ od 1. 1. 2020, 3 děti od 1. 10. 2025); Babaváró od 1. 7. 2019, jen manželé (bankmonitor.hu); Budapest Times 31. 10. 2021 (6,2 % HDP plán 2022, tehdejší ministryně Novák); KSH nep0073 (narození 2024: 77 511, 2025: 72 017, předběžně; sloupce tabulky nelze jednoznačně potvrdit).
Neověřeno: střední věk Kanady 40,6 a podíl 65+ 19,5 % (sekundární zdroje); otcovská dovolená 14 dní (nenalezen funkční odkaz ČSSZ); aktuální stav maďarské politiky po volbách 2026; plodnost HU 2025 (média: 1,31).
