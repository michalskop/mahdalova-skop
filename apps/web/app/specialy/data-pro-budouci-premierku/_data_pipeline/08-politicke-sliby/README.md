# Článek 08 – Školky, byty, dávky (zdroje a postup)

Revize 28. 10. 2026. Čísla o péči o děti, zaměstnanosti matek a plodnosti Polska počítá `vypocet.py` z veřejného API Eurostatu
(výstup `data/vypis.txt`, CSV v `data/`). Citace z programů stran a z vládního prohlášení vyhledává `citace_programu.py`
(výstup `data/citace_programu.txt`). Stažené soubory v repu nejsou, kontrolní součty níže.

## Eurostat (stažení 28. 10. 2026)
| Údaj v textu | Datová sada, filtr | Hodnota |
|---|---|---|
| Děti do 3 let v péči aspoň 1 hodinu týdně: ČR 7,9 %, EU27 40,6 % (2025); 30 h a víc: 2,1 % × 26,1 % | `ilc_caindformal` (EU-SILC, % dětí věkové skupiny), age=Y_LT3, duration=H0 → 100 − podíl s 0 hodin; H_GE30 | v textu pětinásobek (poměr 5,14); v EU27 nižší jen SK 1,8 % |
| Zaměstnanost žen 20–49 let s nejmladším dítětem do 6 let: ČR 50,4 %, EU27 68,5 % (2025), ČR 48,1 % (2024, nejnižší v EU) | `lfst_hheredch`, sex=F, age=Y20-49, n_child=TOTAL, agechild=Y_LT6, isced11=TOTAL | v roce 2025 nižší jen RO 47,7 % |
| Úhrnná plodnost Polska 1,32 (2015), 1,48 (2017), 1,14 (2024) | `demo_find`, indic_de=TOTFERRT | |

Dřívější text uváděl „5 % dětí do 3 let v péči × 35 % průměr EU“ bez zdroje a roku. Nesedí s Eurostatem (2025: 7,9 % × 40,6 %; 2024: 7,3 % × 39,3 %).
Limit: EU-SILC je výběrové šetření, u malé skupiny dětí do 3 let má český údaj větší nejistotu (2019–2025 kolísá 4,4–7,9 %; „5 %“ odpovídá starším rokům 2020–2023).

## Programy a dokumenty (stažení 27.–28. 10. 2026)
| Dokument | URL | SHA-256 |
|---|---|---|
| ANO, Volební program 2025 (PDF, 38 s.) | https://www.anobudelip.cz/file/edee/ke-stazeni/volebni-program-2025.pdf | `62e87d136ff8ed780a0a48ca09e0fdf0be80b38e8af61fa5bd55eacdb72f46ea` |
| SPOLU, Program 2025 (PDF, 32 s.; tištěná s. 25 = s. 27 v PDF) | https://spolu25.cz/pdf/SPOLU-program-2025.pdf | `892814e6fd356477d515c4338889c0ef9bd974fa9d8e83b96459b20c5c3fd3f3` |
| STAN, Volební program 2025 (PDF, 35 s.) | https://www.starostove.cz/files/dobry-program-starostove.pdf | `4ee90abeb5510b343d668c5291756c48d181cc6b3786435c9fa88b84d62e58c7` |
| Piráti, Nakopneme to! (PDF, 30 s.) | https://www.pirati.cz/documents/506/PROGRAM_PIRATU_2025.pdf | `7916a67620577490c7856b0968c56d82aa7898cb73d589440c9764bf86c2649a` |
| IDEA CERGE-EI (K. Kalíšková), Rodinná politika a porodnost ve volebních programech, 9/2025 | https://idea.cerge-ei.cz/documents/Rodinna_politika_a_porodnost_leaflet_0925.pdf | `fc2757f58d5da61b543503770a924e95ad1cbd70a6853ca954f02b88a387c425` |
| Programové prohlášení vlády (HTML, uloženo 28. 10. 2026) | https://vlada.gov.cz/cz/vlada/programove-prohlaseni/programove-prohlaseni-vlady-224629/ | `0059ae99931d446d287410d6ac39f1ba38f4c5e69e5c5d6178554e07803437a7` |
| MPSV, Senát schválil zvýšení rodičovského příspěvku (HTML) | https://mpsv.gov.cz/senat-schvalil-zvyseni-rodicovskeho-prispevku-na-400-000-korun-i-upravy-superdavky | `ac30cbdba680b2f2428814c84430d5d49a0508075c90238ebc77ff3a893fa7fa` |

Spuštění: `python -X utf8 -I vypocet.py`, `python -X utf8 -I citace_programu.py <složka s PDF/HTML pod názvy ano.pdf, spolu.pdf, stan.pdf, pirati.pdf, vlada.html>`.

## Co je ověřeno z primárních textů
- Rodičovský příspěvek 400 000 Kč: ANO s. 10; vládní prohlášení, kapitola 10 „Rodiny s dětmi“; MPSV (Senát, 400 000 Kč, 800 000 Kč u vícerčat, děti narozené od 1. 1. 2027); podpis prezidenta 17. 8. 2026 podle ČTK (blesk.cz/clanek/846230).
- Předškolní péče: SPOLU s. 25 (dostupné školky a dětské skupiny); STAN s. 26–29 (40 000 míst, normativ, záruka místa pro tříleté); Piráti s. 4 a 12 (místa i pro děti do 3 let, garance od 2 let); ANO s. 17 a vláda (investice do MŠ v oblastech s nedostatkem kapacit). Slova „jesle“ ani „dětské skupiny“ ve vládním prohlášení nejsou.
- První bydlení mladých: ANO s. 19 (hypotéky, bezúročné půjčky), vláda kap. 15, STAN (zvýhodněné půjčky a záruky pro lidi do 35 let).
- Migrace: STAN (pružnější přijímání zahraničních pracovníků, bodový systém); vláda: „Zrevidujeme systém zaměstnávání zahraničních pracovníků“, „Migrační politika bude reflektovat potřeby trhu práce“; vláda upřednostní manželství při demografických opatřeních.
- V programech ANO, SPOLU (kromě vize „porodnost roste“), STAN a Pirátů, ani ve vládním prohlášení není hodnota 2,1 ani odhad účinku na plodnost.

## Studie
- Bergsvik, Fauske, Hart (2021), Population and Development Review 47(4), doi 10.1111/padr.12431: 35 studií (abstrakt: péče o děti zvyšuje dokončenou plodnost, peněžní dávky dočasně, rodičovská dovolená větší účinky než se čekalo; hodnoceny reformy rodičovské dovolené, péče, zdravotních služeb a univerzálních dávek, bydlení ne). Pracovní verze SSB DP 922 (2020): 57 studií.
- Bokun (2024), Demographic Research 51(28); Paradowski, Wolszczak-Derlacz (2025), Post-Soviet Affairs 41(3); Dettling, Kearney, NBER w17485; Duvander, Andersson, MPIDR WP 2005-013.

## Neověřeno / otevřené
- Programy SPD a Motoristů jsme nečetli (údaje podle IDEA, označeno v textu); programy STAN, Pirátů, ANO a SPOLU jsou volební programy 2025, ne koaliční smlouva.
- Údaje IDEA o 70 tisících chybějících míst a o 1–2 % otců na rodičovské přebíráme jako tvrzení IDEA.
- Plné znění časopisecké verze Bergsvik et al. (Wiley) nebylo dostupné (403); opíráme se o abstrakt (Crossref) a pracovní verzi.
