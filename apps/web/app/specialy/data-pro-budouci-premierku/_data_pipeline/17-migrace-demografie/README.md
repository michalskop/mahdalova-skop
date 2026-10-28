# Článek 17 – Migrace a demografie (zdroje a postup)

Čísla o projekcích počítá `vypocet.py` z CSV ve složce `data/` (vznikla skriptem `xlsx_to_csv.py` z tabulek ČSÚ, stažení 28. 10. 2026; XLSX v repu nejsou).
Spuštění: `python -X utf8 -I xlsx_to_csv.py vek|ukaz <xlsx> <varianta> <csv>`, pak `python -X utf8 -I vypocet.py`.

| CSV | Zdroj (ČSÚ) | XLSX, SHA-256 |
|---|---|---|
| `vek_stredni2018.csv` | Projekce obyvatelstva ČR 2018–2100 (28. 11. 2018, kód 130139-18), Tab. 1 Střední varianta, počet obyvatel podle věku k 1. 1. https://csu.gov.cz/produkty/projekce-obyvatelstva-ceske-republiky-2018-2100 | `1301391801.xlsx` ce939e6b81b915a3b2b14d9dcf619821fd6267cca79a900cff6b6ab12398f1e1 |
| `vek_bezmigrace2018.csv` | tamtéž, Tab. 5 Střední varianta bez migrace (kontrola: 7 402 347 obyvatel k 1. 1. 2101) | `1301391805.xlsx` 1f6d6b3cebb32c3a3e197ff86b0af98657ab9399994c74bc4fa49b7d81941290 |
| `ukazatele_stredni2018.csv` | tamtéž, Tab. 4 Střední varianta: ukazatele, pohyb obyvatel, předpoklady (saldo migrace 26 000 ročně od 2019, plodnost 1,69–1,74) | `1301391804.xlsx` dfd4379a0650b979eb2a041146a6b3ccc7d3849aabd60302dbaee1837591e7d8 |
| `ukazatele_bezmigrace2018.csv` | tamtéž, Tab. 8 Střední varianta bez migrace: ukazatele | `1301391808.xlsx` 4494b93a6e181fcd6fa1e355c7260a79e849fd6cb9c759ab0e6c7d408d248320 |
| `vek_stredni2023.csv` | Projekce obyvatelstva ČR 2023–2100 (30. 11. 2023, kód 130139-23), Tab. 1 Střední varianta. https://csu.gov.cz/produkty/projekce-obyvatelstva-ceske-republiky-2023-2100 | `1301392301.xlsx` 18e570b115ca960cb6e967775372470b79dbdf89dd4271deab5ab392eeb3e9ac |
| `ukazatele_stredni2023.csv` | tamtéž, Tab. 4 Střední varianta: ukazatele (saldo migrace 35 000 od 2028, plodnost 1,5) | `1301392304.xlsx` 25408967f628f846615f357c684f0d38e64995b375d43ef6c623c286b339f458 |

Textové popisy předpokladů:
- Projekce 2018–2100, popis předpokladů a výsledků (`13013918u.pdf`, SHA-256 f56b814a2429681d502562d632b8e78f1300468eba4561b2a0e13fafe5001598), kapitola Migrace: saldo 26 tis. od 2019; varianta bez migrace slouží k vyjádření citlivosti migrační složky a ukazuje vývoj jen podle plodnosti a úmrtnosti.
- Projekce 2023–2100, úvod (`13013923u.pdf`, SHA-256 06ac13fe018acb175b78e44b196a79f8e3a47b3d43def4d02f597e06972706d0, https://csu.gov.cz/docs/107508/976781b5-6f3e-f3d7-6048-8ec5bff6cf05/13013923u.pdf?version=1.0): saldo „běžné“ migrace 35 tis. od 2025 (celkové saldo fixní od 2028); projektování vývoje bez migrace označeno za bezpředmětné, protože by se takový scénář zcela jistě nenaplnil.

## Důležitá oprava oproti původnímu textu
Původní text srovnával střední variantu projekce **2023** (9,90 mil. k 1. 1. 2101) s variantou bez migrace z projekce **2018** (7,40 mil., odkaz na `1301391805.pdf`) a z rozdílu 2,5 mil. vyvozoval vliv migrace. Projekce 2023 žádnou variantu bez migrace nemá; obě čísla pocházejí z různých projekcí (jiný výchozí stav 10,83 × 10,61 mil., plodnost 1,5 × 1,69–1,74, migrace 35 tis. × 26 tis.). Správné srovnání uvnitř projekce 2018: s migrací 10 527 469, bez migrace 7 402 347, rozdíl 3 125 122; podíl 65+ 29,5 % × 32,5 %.

## Skutečnost 2025 a cizinci (ČSÚ)
- Česko mělo v roce 2025 rekordní počet obyvatel, ale minimum narozených (9. 10. 2026), https://csu.gov.cz/produkty/cesko-melo-v-roce-2025-rekordni-pocet-obyvatel-ale-minimum-narozenych: přírůstek +6,3 tis., saldo zahraniční migrace +42,0 tis. (Ukrajina 23,1 tis.), narození 77,6 tis., zemřelí 113,3 tis. (rozdíl 35,7 tis. je náš výpočet).
- Počet cizinců, demografické události (aktualizace 5. 10. 2026), https://csu.gov.cz/pocet-cizincu-demograficke-udalosti: k 31. 12. 2025 evidovala cizinecká policie 1 131 197 cizinců (+37 108), trvalý pobyt 394 268 (35 %), ostatní 736 929, Ukrajina 612 953 (54 %), Slovensko 125 280, Vietnam 69 685, Rusko 37 524. Stejné číslo a odkaz jako článek 15.

## Neověřeno
- OECD: tvrzení, že vysoký podíl dospělých uprchlíků z Ukrajiny pracuje a mnozí pod úrovní kvalifikace, jsme u OECD neotevřeli (weby oecd.org vracejí HTTP 403). Převzato z rešerše `research/17-migrace-demografie.md`; odkazovaná publikace „Promoting Better Career Mobility for Longer Working Lives in Czechia“ se podle anotace zabývá hlavně starší pracovní silou, nutno ověřit, zda tvrzení obsahuje.
- Odhad vládní zmocněnkyně pro lidská práva (únor 2024: 61 % z asi 120 tis. ekonomicky aktivních uprchlíků pracuje pod kvalifikací) je jen z reportáže Radia Prague (https://english.radio.cz/node/8809055), bez uvedeného datového podkladu. Zda Klára Šimáčková Laurenčíková zastává funkci i dnes, jsme neověřovali (v textu je uvedena role k únoru 2024).
- Věkové složení cizinců jsme neověřovali (jako u článku 15).
