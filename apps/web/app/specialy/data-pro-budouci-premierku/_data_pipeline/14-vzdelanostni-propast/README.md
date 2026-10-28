# Článek 14 – Vzdělanostní propast (zdroje a postup)

Všechna čísla v článku počítá `vypocet.py` ze stažených souborů ČSÚ (stažení 28. 10. 2026; originály v repu nejsou).
Spuštění: `python -X utf8 -I vypocet.py <složka se staženými soubory>` (XLSX z ČSÚ patří do její podsložky `vyvoj2025`); skript zapíše `data/vzdelani_kraje.csv`,
`data/zeny_deti.csv`, `data/plodnost_kraje_2025.csv` a vytiskne čísla použitá v textu. Výstup z posledního běhu odpovídá textu článku.

| Soubor | Zdroj (ČSÚ) | SHA-256 |
|---|---|---|
| `sldb2021_vzdelani_vek_pohlavi.csv` | Sčítání 2021, otevřená data: nejvyšší dosažené vzdělání podle jednotek věku, pohlaví a kraje (obvyklý pobyt, 26. 3. 2021). https://csu.gov.cz/produkty/vysledky-scitani-2021-otevrena-data | d44771d8338248cde0ea343208b2cb7987733158d6c495060dfca58ef74c03a4 |
| `sldb2021_vzdelani_pohlavi.csv` | tamtéž, vzdělání podle pohlaví (kontrola 15+: základní vč. neukončeného 1 107 860 z 8 321 029 = 13,3 %, VŠ 1 552 407 = 18,7 %) | 85b862b2b0624541936165dc7376346f5da6ee008f5d4440ce2bf03afa7021ea |
| `sldb2021_zeny_stav_vzdelani_vek_deti.csv` | tamtéž, ženy podle vzdělání, věkové skupiny a počtu dětí (ČR a kraje) | 3cf686e0748c911995b4f0a07c191294f96032b2bf1440d695369dd4b7185c78 |
| `17023224.pdf` | Vzdělanostní struktura obyvatelstva podle výsledků sčítání lidu 2021 (kontrola 15+: ČR 13,3 %; Karlovarský a Ústecký nad 18 %). https://csu.gov.cz/produkty/vzdelanostni-struktura-obyvatelstva-podle-vysledku-scitani-lidu-2021 | cb620b1fdea48d287c68f2f557ece021e5d939ecd720b20451788ad407b2d816 |
| `13006926p.xlsx` | Vývoj obyvatelstva ČR – 2025, tabulková příloha, krajské srovnání (9. 10. 2026): Tab. 4.1 narození, 4.2 pořadí, 4.3 mimo manželství, 4.4 úhrnná plodnost, 4.6 průměrný věk matek. https://csu.gov.cz/produkty/vyvoj-obyvatelstva-ceske-republiky-2025 | f4a0279cf8e501a0a8beea4bede4550217c6e7d961cb5c55066b13abad120976 |

## Definice a limity
- „Základní vzdělání“ = „základní vč. neukončeného“ podle ČSÚ = kódy 002 (neúplné základní) + 003 (základní); „bez vzdělání“ (001) je zvlášť a do podílu se nezapočítává (shodně s ČSÚ).
- Podíl = osoby s daným vzděláním / osoby se zjištěným vzděláním (bez kódu 900 „nezjištěno“). Nezjištěno: ČR 25–64 let 6,5 %, Karlovarský kraj 9,6 %, Ústecký 9,4 %; ve věku 25–34 let 11,8 % a 11,7 %.
- Jde o osoby s obvyklým pobytem k 26. 3. 2021 (před příchodem uprchlíků z Ukrajiny 2022). Srovnání 25–34 × 55–64 let jsou dvě generace v jednom okamžiku, ne vývoj týchž lidí.
- Ženy a děti: průměr dětí = součet (počet dětí × počet žen) / počet žen se zjištěným počtem dětí, „10 a více“ = 10; vzdělání „nezjištěno“ a děti „nezjištěno“ jsou vynechány.
- Krajská plodnost 2025: přímo z tabulek ČSÚ (předběžné údaje za rok 2025).
- Vysvětlení původu rozdílů (odsun Němců, dosídlení pohraničí) je citovaný výklad sociologa Libora Prudkého (Právo, 11. 2. 2018, autor Jiří Mach); data ze sčítání ho nemohou ověřit.

## Co bylo ve starém textu špatně
- „18–22 % lidí ve věku 25–64 let“ v Ústeckém a Karlovarském kraji a „5–8 %“ v Praze a Jihomoravském kraji. Správně vychází 10,5–11,6 % a 3,6–5,2 %; podíly kolem 18 % (Ústecký a Karlovarský) a 8,3 % (Praha) platí pro věk 15+.
- Nadpis „Kde je méně diplomů, rodí se dřív a víc“: dřív ano, víc ne (úhrnná plodnost 2025: Karlovarský 1,16, Praha 1,15, Ústecký 1,26, ČR 1,28, Vysočina 1,42).
- „Nejvíc peněz pošle do regionů s nejslabšími školami a nejnižšími příjmy“: školy a příjmy nebyly doloženy, a regiony s nejnižším vzděláním nemají nejvyšší plodnost.

## Otevřené / neověřeno
- Tvrzení „ženy se základním vzděláním rodí první dítě kolem 22–24 let“ (článek 10) jsme tímto skriptem neověřovali; z dat sčítání lze určit jen podíl žen s dítětem v dané věkové skupině.
- Článek 10 tvrdí, že Ústecký a Karlovarský kraj mají „dlouhodobě vyšší plodnost než celostátní průměr“; podle tabulek ČSÚ je Karlovarský kraj v letech 2016–2025 trvale pod republikovým průměrem (v roce 2025 1,16 proti 1,28) a Ústecký kraj kolem průměru (2025: 1,26).
