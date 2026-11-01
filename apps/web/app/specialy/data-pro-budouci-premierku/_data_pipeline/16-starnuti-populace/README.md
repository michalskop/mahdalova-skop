# Článek 16 – Stárnutí populace (zdroje a postup)

Všechna čísla v článku počítá `vypocet.py` z CSV ve složce `data/`. CSV vznikla skriptem `xlsx_to_csv.py`
z oficiálních tabulek ČSÚ (stažení 28. 10. 2026; originální XLSX v repu nejsou, kontrolní součty níže).
Spuštění: `python -X utf8 -I xlsx_to_csv.py vek|ukaz <xlsx> <varianta> <csv>`, pak `python -X utf8 -I vypocet.py`.

| CSV | Zdroj (ČSÚ) | XLSX, SHA-256 |
|---|---|---|
| `vek_stredni2023.csv` | Projekce obyvatelstva ČR 2023–2100, Tab. 1 Střední varianta, počet obyvatel podle věku (k 1. 1.), obě pohlaví. Publikace 30. 11. 2023, kód 130139-23. 2023 = skutečnost, od 2024 projekce. https://csu.gov.cz/produkty/projekce-obyvatelstva-ceske-republiky-2023-2100 | `1301392301.xlsx` 18e570b115ca960cb6e967775372470b79dbdf89dd4271deab5ab392eeb3e9ac |
| `ukazatele_stredni2023.csv` | tamtéž, Tab. 4 Střední varianta: ukazatele věkového složení, pohyb obyvatel, předpoklady | `1301392304.xlsx` 25408967f628f846615f357c684f0d38e64995b375d43ef6c623c286b339f458 |
| `vek_nizka2023.csv` | tamtéž, Tab. 5 Nízká varianta | `1301392305.xlsx` 2ad8a10fce24b759719321d17ce910e22e771ac97d2450ad17cc057802f3d2c8 |
| `ukazatele_nizka2023.csv` | tamtéž, Tab. 8 Nízká varianta: ukazatele | `1301392308.xlsx` d76bdf51510861907aa2e87c744c374c64335779332b0bbc40aeb76d2b745027 |
| `vek_vysoka2023.csv` | tamtéž, Tab. 9 Vysoká varianta | `1301392309.xlsx` a3c02b36747b2195a184c18455120a415ef11b51dc6e4677e29038acb0a98644 |
| `ukazatele_vysoka2023.csv` | tamtéž, Tab. 12 Vysoká varianta: ukazatele | `1301392312.xlsx` 2a6d441cb043ecc7c05409a372406ba98d317c3092733cebaf0f80a769b2a4af |
| `vek_stredni2018.csv` | Projekce obyvatelstva ČR 2018–2100, Tab. 1 Střední varianta; sloupec 2018* = skutečný stav k 1. 1. 2018 (https://csu.gov.cz/produkty/projekce-obyvatelstva-ceske-republiky-2018-2100) | `1301391801.xlsx` ce939e6b81b915a3b2b14d9dcf619821fd6267cca79a900cff6b6ab12398f1e1 |

Kontrola: skript ověřuje, že věkové skupiny 0–14, 15–64 a 65+ spočítané z Tab. 1 se shodují s Tab. 4 pro roky 2023, 2040, 2060 a 2100.
Soubory `1301392301`, `1301392305`, `1301392309` a `1301391801` mají stejné kontrolní součty jako ve složce článku 15.

## Skutečnost 2025 pro srovnání (z textu ČSÚ, ne ze skriptu)
ČSÚ, Česko mělo v roce 2025 rekordní počet obyvatel, ale minimum narozených (9. 10. 2026), https://csu.gov.cz/produkty/cesko-melo-v-roce-2025-rekordni-pocet-obyvatel-ale-minimum-narozenych:
obyvatel k 31. 12. 2025 téměř 10,916 milionu (10 915 839), senioři 2,273 milionu (téměř 21 %; 2 272 755 / 10 915 839 = 20,8 %), saldo zahraniční migrace +42,0 tis.,
živě narození 77,6 tis. (77 636 podle Tab. 4.1 tabulkové přílohy), úhrnná plodnost 1,28.

## Definice a limity
- „Produktivní věk“ = 15–64 let (definice ČSÚ v Tab. 4), poměr = počet ve věku 15–64 / počet ve věku 65+. Nejde o počet pracujících.
- Podíl 50+ mezi dospělými = osoby od 50 let / osoby od 18 let (včetně cizinců): 46,84 % (1. 1. 2018), 50,79 % (1. 1. 2026), 53,44 % (1. 1. 2030), shodně s článkem 15.
- Střední varianta 2023 předpokládá úhrnnou plodnost 1,5 (nízká 1,25, vysoká 1,75 v roce 2050) a saldo migrace 35 tis. od roku 2028 (nízká 25 tis., vysoká 40 tis.); pro 2025–2027 −31 tis. ročně. Skutečnost 2025: plodnost 1,28, saldo +42,0 tis.
- Projekce 2023 vznikla v listopadu 2023; novější verze ČSÚ do 28. 10. 2026 nezveřejnil (na stránce publikace je jen verze 1.0).

## Co bylo ve starém textu špatně
- Podíl seniorů „25,6 % v roce 2040“ a „30,7 % v roce 2060“ byl připsán stránce ČSÚ Senioři v datech, která žádné procento neuvádí. Správně podle Tab. 4: 25,0 % (2040) a 30,7 % (2060).
- Počet lidí ve věku 15–64 let v roce 2040: v textu 6,63 milionu, správně 6,70 milionu (6 700 890).
- Poměr seniorů k věku 15–64 let v roce 2040: komponenta má 1 : 2,4, správně 1 : 2,5.
- Titulek „jeden senior na dva lidi v produktivním věku“ spojený s „nárazem ve čtyřicátých letech“: poměr 2,0 vychází na rok 2051, nejrychlejší změna na roky 2038–2043.

## Komponenta AgeingScrolly (neměněno, mimo zadání)
`apps/web/components/dpbp/AgeingScrolly/AgeingScrolly.tsx` má pevně zapsané hodnoty. Rok 2040: v komponentě 12/62/26 % a poměr 1 : 2,4, správně podle Tab. 4 12,4 / 62,5 / 25,0 % (zaokrouhleně 12/63/25) a poměr 1 : 2,5. Roky 2023 (16/64/20, 1 : 3,1), 2060 (13/56/31, 1 : 1,8) a 2100 (12/54/34, 1 : 1,6) sedí. Text kroku 4 („země s podobným počtem obyvatel“): 9,91 milionu v roce 2100 proti 10,83 milionu v roce 2023, tedy o 8,5 % méně.
