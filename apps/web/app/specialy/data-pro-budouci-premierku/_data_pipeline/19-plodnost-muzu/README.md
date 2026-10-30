# Extra článek 19 – Plodnost mužů (zdroje a postup)

Vznik 29. 10. 2026 (podnět Kateřiny Mahdalové). Čísla vznikají skriptem z oficiálních tabulek ČSÚ; zdrojové soubory jsou v archivu `Zdrojová data\CSU\` (viz `ZDROJE.md`), v repozitáři nejsou.

| Skript | Co dělá | Výstup |
|---|---|---|
| `plodnost_muzu.py <13006725_data.zip>` | Úhrnná plodnost mužů a žen v Česku 2024 stejným postupem (děti / populace k 1. 7. podle věku). Muži 1,14 (dolní mez, jen děti s uvedeným otcem) až 1,23 (neuvedení otcové dopočteni), ženy 1,37 (kontrola: oficiálních 1,368). | `data/plodnost_muzu_2024.csv`, `data/plodnost_muzu_vypis.txt` |

## Zdroje
| Zdroj | URL | SHA-256 |
|---|---|---|
| ČSÚ, Demografická ročenka ČR 2024 (D.10, I.01, I.10), `13006725_data.zip` | https://csu.gov.cz/produkty/demograficka-rocenka-ceske-republiky-2ncey2iey2 | `0e38ccd770631990ca4addce24366eda3846654d7ee340e7293a8eeaf8aa13a1` |
| ČSÚ, Vývoj obyvatelstva ČR 2024, kap. 4 Porodnost (tab. 4.7, věk otce 2015–2024) | https://csu.gov.cz/produkty/vyvoj-obyvatelstva-ceske-republiky-2024 | `85d279d20675eced1b1380b3c541d65507ea1635969be233bd8a32f436bd99a5` |
| Schoumaker, B. (2019): Male Fertility around the World and over Time: How Different Is It from Female Fertility? Population and Development Review 45(3), 459–487 | https://research.dial.uclouvain.be/handle/2078.5/268864 | (literatura) |
| Li, N., Mi, H., Liu, Z. (2025): Female, male, two-sex fertility rates and their population projections. Humanities and Social Sciences Communications 12 | https://ideas.repec.org/a/pal/palcom/v12y2025i1d10.1057_s41599-025-04627-z.html | (literatura; v textu jen abstrakt) |
| Greene, M. E., Biddlecom, A. E. (2000): Absent and Problematic Men. Population and Development Review 26(1), 81–115 | https://ideas.repec.org/a/bla/popdev/v26y2000i1p81-115.html | (literatura) |
| Rabušic, L., Chromková Manea, B. E. (2011): Řekni, kde ti muži jsou? O chybějících mužích ve studiích reprodukce. Sociální studia | https://muni.cz/en/research/publications/972470 | (literatura) |
| Johnson, S. L. et al. (2015): Consistent age-dependent declines in human semen quality: a systematic review and meta-analysis. Ageing Research Reviews | https://research.monash.edu/en/publications/consistent-age-dependent-declines-in-human-semen-quality-a-system/ | (literatura) |

## Limity
- D.10 zahrnuje i mrtvě narozené; úhrnná plodnost žen z D.10 (1,369) se od oficiální (1,368) liší jen o tisícinu.
- U 6,9 % narozených (5 878) není věk otce uveden; mužskou plodnost proto uvádíme jako rozpětí. Varianty dopočtu dávají stejný výsledek (1,23).
- Muži ve věku 30–39 let (735 867) jsou o 22 % početnější než ženy ve věku 25–34 let (601 469), což snižuje míru plodnosti na jednoho muže; v tom je hlavní část rozdílu proti ženám. Jde o odhad příčiny, zvláštním výpočtem neověřený.
- Údaj Schoumakera (2019) pro Česko 2014 (ženy 1,32, muži 1,44) nesedí s oficiální plodností žen 1,53, nepoužíváme ho.
