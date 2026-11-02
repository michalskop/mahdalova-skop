# Článek 03 – Svět se mění (zdroje a postup)

Všechna čísla o světě, regionech, Togu a Číně počítá `vypocet.py` (výstup v `vystup.txt`, výběr dat v `data/wpp_vybrane.csv`).

| Soubor | Zdroj | SHA-256 |
|---|---|---|
| `WPP2024_Demographic_Indicators_Medium.csv.gz` | OSN, World Population Prospects 2024, střední varianta (vydáno 11. 7. 2024; stažení 28. 10. 2026) <https://population.un.org/wpp/assets/Excel%20Files/1_Indicator%20(Standard)/CSV_FILES/WPP2024_Demographic_Indicators_Medium.csv.gz> | `286ac36bb1415e2e1ade03acfef0a29f0e4c087e2f78e38c48f50c5df89082bc` |
| `WPP2024_CSV_files_update.zip` → `WPP2024_Demographic_Indicators_Medium_Update.csv` | OSN, WPP 2024 Interim Update z 19. 1. 2026 (jen Togo) <https://population.un.org/wpp/assets/Excel%20Files/1_Indicator%20(Standard)/WPP2024_CSV_files_update.zip>, release note <https://population.un.org/wpp/assets/Files/WPP2024_Release-Note-rev1.pdf> (SHA-256 `1c1672d2e1f2cf589f10b83e07269bf0cd0977217365d6c8e93041d90215e8dc`) | zip `eb7846bf5d937ee15060198e1130e770b885e58c24035b314966681ed929ca9f`, csv `54e32f583ebe63070ad99978f9cf46882bac00a18220b17a16f2f526f798f4b7` |

Spuštění: `python -X utf8 -I vypocet.py <WPP csv.gz> <Update csv>` ve složce článku. Skript čte také `../15-volicska-zakladna/data/proj_stredni.csv`
(ČSÚ, Projekce obyvatelstva ČR 2023–2100, střední varianta, k 1. 1.).

## Co se v textu změnilo a proč
- **Togo**: WPP 2024 mělo pro rok 2022 9,1 mil., sčítání Toga 2022 (INSEED, RGPH-5, 23. 10.–12. 11. 2022) napočítalo 8 095 498 lidí.
  OSN korekci na nedopočtení dvakrát započítala; aktualizace z 19. 1. 2026 Togo snížila (1. 7. 2024: 9,52 → 8,41 mil.; 2050: 15,6 → 14,0 mil.).
  Plodnost a úmrtnost se neměnily. Regionální součty OSN (Afrika) aktualizace nepřepočítala (rozdíl řádově 0,07 % Afriky).
- **Česko** v tabulce a v textu: ČSÚ/Eurostat (průměrný stav 2000 = 10 255 063, 2024 = 10 905 028, 1. 1. 2025 = 10 909 500) a projekce ČSÚ
  (střední varianta, 1. 1. 2050 = 10 691 467). OSN odhaduje Česko níž (mid-2024 10,74 mil., 2050 9,83 mil., TFR 1,46) – rozdíl je zmíněn pod tabulkou.
  TFR 2024: Eurostat 1,36 (ČSÚ 1,37), rok 2025 ČSÚ 1,28.
- **Předstih Toga před Českem**: podle OSN pro obě země 1. 7. 2034 (před aktualizací Toga 2029); Togo (OSN, 1. 1.) × Česko (projekce ČSÚ, 1. 1.) první v roce 2037
  (1. 1. 2036: 10,73 × 10,73). V textu „kolem roku 2036 (OSN a ČSÚ), podle samotného OSN kolem roku 2034“.
- Peněžní/ostatní údaje: migrace a přirozená měna Česka 2023–2025 z Eurostatu (`demo_gind`, viz `../02-co-znamena-plodnost/`), ČSÚ 2025 (statistikaamy.csu.gov.cz).
- Historie: Togo mělo podle sčítání 1912 „něco přes milion“ obyvatel (české a anglické Wikipedie – sekundární zdroj, primární německý koloniální
  úřad neověřen); autorem myšlenky československé kolonie je Jan Havlasa (brožura *České kolonie zámořské*, 1919). Počet obyvatel ČSR 1921 (13,6 mil.)
  jsme z primárního zdroje neověřovali.
- Čína: pokles 2022 a „první od roku 1961“ podle Národního statistického úřadu (zpráva CNBC, 17. 1. 2023); v datech OSN Indie Čínu předstihla v roce 2022.

## Limity
- Úhrnná plodnost „Amerika“ je průměr Severní a Latinské Ameriky vážený počtem obyvatel; v tabulce jsou regiony podle definic OSN.
- 2024 je v datech OSN už projekce (WPP 2024 vychází z dat do roku 2023).
