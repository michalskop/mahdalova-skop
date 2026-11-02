# Článek 07 – Kohortní plodnost (zdroje a postup)

Všechna kohortní čísla v článku počítá `kohorty.py` z tabulky ČSÚ 6.11; výstup je v `vystup.txt`, graf generací v `data/kohorty_kumul.csv`.

| Soubor | Zdroj | SHA-256 |
|---|---|---|
| `130055250611.xlsx` (mimo repo, `C:/tmp/dpbp-05-07/raw/zip/`) | ČSÚ, Demografická příručka – data za rok 2024 (kód 130055-25, vydáno 25. 11. 2025), tab. 6.11 Míry plodnosti žen podle věku 1950–2024, https://csu.gov.cz/produkty/demograficka-prirucka-2024 (ZIP `13005525_data.zip`, SHA-256 9796dbb16d1e037a748daa76d02a336db8ca9e30d10bb7498a17915740dbeae6) | ff9261455ae5049460027eb10d07df266b9c51944f1b492f83b10694b6f54736 |
| `statistikaamy.html` | ČSÚ, Statistika&My, 18. 5. 2026, kontrolní čísla: ročník 1980 do 45 let 1,7; ročník 1970 až 1,9; pravděpodobnost 1. dítěte 88 → 62 % | 9b3fda413f0b4fa58d52decd3afbc3f452e6e44ad1ddfeca1448c34546872d3d |

## Definice
- **Úhrnná plodnost (období)**: součet věkových měr plodnosti jednoho kalendářního roku (1,28 za 2025, ČSÚ).
- **Kohortní (generační) plodnost**: součet věkových měr plodnosti jedné generace žen napříč lety – míra věku `a` z roku `narození + a`. Věk = rozdíl roku porodu a roku narození matky. U generace 1980 je poslední známý věk 44 (rok 2024).
- Řádek tabulky „15“ znamená 15 let a méně, skupina 45–49 je míra za jeden rok věku, proto se násobí pěti. Kontrola: součet měr za 2024 dává 1,3679, tedy úhrnnou plodnost z tab. 6.12.
- Výsledek sedí s čísly ČSÚ (ročník 1970 do 45 let ≈ 1,9, ročník 1980 ≈ 1,7). Míry se počítají z populace včetně cizinek, generace proto není přesně stejná skupina žen.

## Čísla v článku
Dokončená plodnost: 1940 2,10; 1945 2,02; 1950 2,09; 1955 2,08; 1960 2,03; 1965 1,95; 1970 1,87; 1975 1,79; 1980 1,69 (do 44 let). Ročník 1990 do 34 let 1,29, ročník 1985 do 34 let 1,32 a do 39 let 1,58. Scénáře pro ročník 1990: 1,56 (míry 2024 beze změny od 35 let), 1,59 (přírůstek jako u ročníku 1980), 1,50 (míry od 35 let o čtvrtinu nižší).

## Neověřeno
- Věkové míry plodnosti za rok 2025 nejsou v dostupných zdrojích; scénáře proto nezahrnují rok 2025.
- Původní text uváděl „historických 0,4–0,55“ přírůstku mezi 30. a 40. rokem a „1,2 ve věku 35“ pro ročník 1990; tabulky ČSÚ dávají přírůstek 0,25 / 0,39 / 0,75 pro ročníky 1960 / 1970 / 1980 a 1,29 do 34 let.
