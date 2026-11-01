# Článek 15 – Kdo bude volit příští Sněmovnu (zdroje a postup)

Všechna čísla v článku počítá `vypocet.py` z CSV ve složce `data/`. CSV vznikla skriptem `xlsx_to_csv.py`
z oficiálních tabulek ČSÚ (stažení 27. 10. 2026; originální XLSX v repu nejsou, kontrolní součty níže).

| CSV | Zdroj (ČSÚ) | XLSX, SHA-256 |
|---|---|---|
| `proj_stredni.csv` | Projekce obyvatelstva ČR 2023–2100, Tab. 1 Střední varianta, počet obyvatel podle věku (k 1. 1.), obě pohlaví. Publikace 30. 11. 2023, kód 130139-23. 2023 = skutečnost, od 2024 projekce. https://csu.gov.cz/csu/czso/projekce-obyvatelstva-ceske-republiky-2023-2100 | `1301392301.xlsx` 18e570b115ca960cb6e967775372470b79dbdf89dd4271deab5ab392eeb3e9ac |
| `proj_nizka.csv` | tamtéž, Tab. 5 Nízká varianta | `1301392305.xlsx` 2ad8a10fce24b759719321d17ce910e22e771ac97d2450ad17cc057802f3d2c8 |
| `proj_vysoka.csv` | tamtéž, Tab. 9 Vysoká varianta | `1301392309.xlsx` a3c02b36747b2195a184c18455120a415ef11b51dc6e4677e29038acb0a98644 |
| `proj2018_stredni.csv` | Projekce obyvatelstva ČR 2018–2100, Tab. 1 Střední varianta; sloupec 2018* = skutečný stav k 1. 1. 2018 (https://csu.gov.cz/produkty/projekce-obyvatelstva-ceske-republiky-2018-2100) | `1301391801.xlsx` ce939e6b81b915a3b2b14d9dcf619821fd6267cca79a900cff6b6ab12398f1e1 |

Spuštění: `python -X utf8 -I xlsx_to_csv.py <xlsx> <varianta> <csv>`, pak `python -X utf8 -I vypocet.py`.

## Definice a limity
- „Dospělí“ = obyvatelé od 18 let (vč. cizinců), ne oprávnění voliči. ČSÚ věkovou strukturu občanů neprojektuje.
- Stav k 1. lednu. Volby 2017 (říjen) srovnáváme s 1. 1. 2018, volby 2029 s 1. 1. 2030 (obojí tři měsíce po volbách).
- Všichni dospělí roku 2040 jsou už dnes na světě; varianty projekce se liší jen úmrtností a migrací (55,3–55,7 % v 2040).
- Neověřeno/nepočítáno: věková struktura cizinců, podíl 50+ mezi občany.

## Další grafy (28. 10. 2026)
- **Účast podle věku** (`GRAF_15_UCAST_VEK`, `data/ucast_vek.csv`, `build_charts_extra.py`): společná povolební studie STEM, Kantar, Ipsos, Median, NMS a Data Collect (SIMAR), „Ozvěny voleb 2025“, s. 13, N = 7 738, dotaz „Účastnil(a) jste se voleb do Poslanecké sněmovny 3. a 4. října 2025?“ (https://www.stem.cz/wp-content/uploads/2026/01/SIMAR_spolecna_povolebni_studie.pdf). Jde o podíl (míru účasti) ve věkové skupině, ne o počet lidí; údaje jsou z dotazníku, celkem 69 % (skutečná účast 68,95 %).
- **Odhad podílu 50+ mezi voliči** (`volici_odhad.py`): dotazníková účast podle věku × počet lidí z projekce ČSÚ k 1. 1. 2025 / 2026 (střední varianta) → 53,0 / 53,8 % voličů od 50 let (mezi dospělými 49,9 / 50,8 %); kontrola: odhadnutá celková účast 69,3 %. Hrubý odhad (dotazník, populace včetně cizinců).
- **Kraje** (`GRAF_15_KRAJE_PROJEKCE`, `kraje_to_csv.py` → `data/kraje_projekce.csv`): ČSÚ, Projekce obyvatelstva v krajích ČR 2024–2080 (https://csu.gov.cz/produkty/projekce-obyvatelstva-v-krajich-cr-do-roku-2080), 14 souborů 13005224NN.xlsx v `13005224_data.zip` (SHA-256 zipu 4dcc0a23…c22fc75a), list Tab. 1, změna celkového počtu obyvatel a dospělých (18+) mezi 1. 1. 2024 a 1. 1. 2081; hodnoty Praha +40,3 %, Středočeský +30,5 %, Plzeňský +5,4 %, Karlovarský −43,5 %, Moravskoslezský −35,4 %, Zlínský −30,4 % se shodují s textem ČSÚ.
