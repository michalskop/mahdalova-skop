# Článek 02 – Co znamená plodnost 1,28 (zdroje a postup)

Čísla v článku počítá `vypocet.py` z `data/eurostat_dlouhe.csv`; ten vzniká skriptem `stahni_eurostat.py` z API Eurostatu
(stažení 28. 10. 2026). Výstup skriptu je v `vystup.txt`. Rok 2025 chybí v Eurostatu u věkově specifických měr, proto je v textu
2025 jen tam, kde ho uvádí ČSÚ.

| Tabulka Eurostatu | Obsah | SHA-256 surového JSON |
|---|---|---|
| `demo_find` (CZ, SE, FR, HU, EU27) | úhrnná plodnost, průměrný věk matek (celkem a při 1. dítěti), podíl narozených mimo manželství, 1960–2024 | `2bd29643b8e756c035943891970d940c01ff88cbbb106b1dd5291e3673ddcf6d` |
| `demo_frate` (CZ) | věkově specifické míry plodnosti po jednotlivých letech věku 1960–2024 | `affc3b5a374a5affaa0ca4495763691f7a6fd487a1c5b84edfecec77d33f294c` |
| `demo_pjan` (CZ, ženy 15–49) | počet žen podle věku k 1. 1., 1990–2025 | `5f807a2b7b924592ca0b890bfa9f3db6cfac4f917387c036f71cdcfc208eaa31` |
| `demo_gind` (CZ) | narození, úmrtí, migrace 2015–2025 | `771970d45e4682cd70c62166558e6aba93db200d4583d23668ed29e312fc9146` |

Surové JSON v repozitáři nejsou (data se z API znovu stáhnou); Eurostat hodnoty občas zpětně revidoval, hash proto platí k datu stažení.

Údaje ČSÚ zadané ručně (`vypocet.py`, konstanta `CSU_2025`), z <https://statistikaamy.csu.gov.cz/nejmene-narozenych-deti-v-historii>
(Nejméně narozených dětí v historii, ČSÚ, 2026) a <https://csu.gov.cz/produkty/pocet-narozenych-byl-loni-nejnizsi-za-poslednich-240-let>:
TFR 2025 = 1,28 (stejně jako 2005, minimum 1,13 v roce 1999), 77 636 narozených, průměrný věk matek 30,6, při 1. dítěti 29,2,
47 % dětí mimo manželství, pravděpodobnost 1. dítěte 88 % (2021) → 62 % (2025), při plodnosti 2018–2020 (1,7) by se v roce 2025
narodilo téměř 103 tisíc dětí. Další zdroje v textu: Seznam Zprávy (Štyglerová, čtvrtina poklesu kvůli menšímu počtu rodiček, převzato
z článku 01), Sněmovna 2025 (67 žen, Seznam Zprávy), kraje 21 % (ČSÚ, Ženy a muži v rozhodovacích procesech).
Podíl lidstva žijícího v zemích s TFR pod 2,1 (68 %) počítá `../03-svet-populace/vypocet.py` z OSN WPP 2024.

## Metody a limity
- **Rozklad poklesu narozených 2015 → 2024**: míry plodnosti jednoho roku × věkové složení žen druhého roku (stav k 1. 1.), poté průměr
  obou pořadí. Hrubý, ne oficiální ukazatel; míry Eurostatu jsou po dovršeném věku, stavy k 1. 1.
- **Generační plodnost** = součet věkově specifických měr podél ročníku narození (rok narození = rok porodu − dovršený věk), ±1 rok.
  Ročníky 1980 a 1985 jsou nedokončené (do 44 a 39 let). Hodnoty se mohou o setiny lišit od Human Fertility Database.
- **Tempo efekt**: jednoduchá Bongaartsova–Feeneyova úprava TFR* = TFR / (1 − r) z růstu průměrného věku matek (bez rozlišení pořadí
  dítěte); 2025: r = 0,08 (průměr 2020–2025) → 1,39. Jde o řádový odhad.
- Neověřeno: příčiny odkladu (bydlení, nároky rodičovství) – kauzální doklad nemáme, text je uvádí jako hypotézy.
