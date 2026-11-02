# Článek 04 – Skandinávská past (zdroje a postup)

`stahni_data.py <složka>` stáhne data z API (Eurostat, SCB) do `data/`; `build_chart.py` z nich sestaví `data/tfr_zeme.csv`
a graf `apps/web/public/specialy/dpbp/charts/GRAF_04_PLODNOST_ZEME.json` (nahrazuje dřívější pevně nakreslenou komponentu
`FertilityComparisonChart` s chybnými hodnotami). Výstup s čísly pro text: `vystup.txt`. Stažení 28. 10. 2026.

| Údaj | Zdroj | SHA-256 |
|---|---|---|
| TFR a podíl dětí mimo manželství (CZ, SE, FR, HU, EU27) | Eurostat `demo_find` | `2bd29643b8e756c035943891970d940c01ff88cbbb106b1dd5291e3673ddcf6d` |
| Děti do 3 let ve formální péči (EU-SILC) | Eurostat `ilc_caindformal` | `021a424b4bd200429ebe11db82be4dd83174466c4c5cd9987cb252e5e11db157` |
| Výdaje na rodinu a děti, % HDP (ESSPROS) | Eurostat `spr_exp_func` | `5186cb80729fb89399d5aa1649de53ec035228804654e9a5ab3605bab85b8259` |
| Švédsko TFR (ženy) 2000–2025 | SCB, BE0101H/FruktsamhetSum <https://www.statistikdatabasen.scb.se/pxweb/en/ssd/START__BE__BE0101__BE0101H/FruktsamhetSum/> | `data/scb_fruktsamhetsum.csv` `1e1db32ec172f9133e98c7b41f90de1f7cd6672938a6a4efc64717e0c94b6394` |

Ručně zadané hodnoty (v `build_chart.py`):
- **Maďarsko 2000–2025**: KSH STADAT 22.1.1.6 <https://www.ksh.hu/stadat_files/nep/en/nep0006.html> (tabulka přenesena 28. 10. 2026, kontrola proti Eurostatu: 2011 1,23 shoda,
  2021 1,61 × 1,63, 2024 1,39 × 1,41; 2025 = 1,31 předběžný údaj KSH, 72 017 narozených).
- **Francie 2025 = 1,56**: INSEE, Insee Première č. 2087, Bilan démographique 2025 (13. 1. 2026) <https://www.insee.fr/fr/statistiques/8719824>.
- **Česko 2025 = 1,28**: ČSÚ <https://statistikaamy.csu.gov.cz/nejmene-narozenych-deti-v-historii>.

Literatura (ověřeno podle abstraktů/bibliografických záznamů, plné texty nečteny): Luci-Greulich & Thévenon (2013), European Journal of Population 29(4), 387–416,
DOI 10.1007/s10680-013-9295-4 (18 zemí OECD, 1982–2007); Duvander & Andersson (2006), Marriage & Family Review 39(1–2), 121–142 (registrová data, 1988–1999);
Ohlsson-Wijk & Andersson (2022), Demographic Research 47, 345–358; Hellstrand a kol., „Not just later, but fewer“ (Demographic Research).
Daňová osvobození v Maďarsku a půjčka Babaváró: sekundární zdroje (Vialto, Bankmonitor), primární předpisy (NAV, magyarkozlony.hu) neověřeny.

## Neověřeno nebo otevřené
- Maďarsko „výdaje 4–5 % HDP“ (původní text, vládní vymezení) – neověřeno, v textu označeno; Eurostat ESSPROS 1,68 % HDP (2023).
- Švédské procento dětí v péči podle věku (1, 2 roky) – použit EU-SILC pro děti do 3 let; Skolverket po věku neověřen.
- Délka švédské vyhrazené části dovolené pro otce (bez čísla v textu); česká otcovská péče 14 dní podle sekundárního zdroje (finance.cz), primární ČSSZ neověřena.
- Babaváró: podmínky (manželství, odpouštění dluhu) ze sekundárních zdrojů, aktuální pravidla pro rok 2026 neověřena.
