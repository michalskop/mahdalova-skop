# Data k článku o poruchách příjmu potravy u dívek

Všechna čísla v textu a v grafech počítá `build.py` (výstup `vystup.txt`, grafy `../data/graf_lecba.json` a `../data/graf_hbsc.json`).

```bash
python -I build.py
```

| Soubor ve `vstupy/` | Zdroj | Staženo |
|---|---|---|
| `Datovy-souhrn-NR-04-25-poruchy-prijmu-potravy-2026-02.xlsx` | [ÚZIS / NZIP, datový souhrn Poruchy příjmu potravy](https://www.nzip.cz/data/2672-poruchy-prijmu-potravy-datovy-souhrn): unikátní pacienti s dg. F50 (hlavní i vedlejší), ambulance i lůžka, péče hrazená pojišťovnami, 2010–2025 | 24. 10. 2026 |
| `Datovy-souhrn-SSS-07-06-vykaz-a013-psychiatrie-2026-01.xlsx` | [ÚZIS / NZIP, výkaz A013 psychiatrie](https://www.nzip.cz/data/1796-vykaz-a013-psychiatrie-datovy-souhrn): ambulantní psychiatrie 2011–2025, počty za pracoviště | 24. 10. 2026 |
| `obyvatelstvo_0_19_csu.csv` | výřez z [ČSÚ 130181](https://csu.gov.cz/produkty/obyvatelstvo-podle-jednotek-veku-a-pohlavi-ve-spravnich-obvodech-obci-s-rozsirenou-pusobnosti) skriptem `extract_obyvatelstvo.py` (stav k 31. 12. 2008–2024) | 24. 10. 2026 |
| `hbsc_cz_body_image_dieting.csv`, `hbsc_2022_toofat_country_ranking.csv` | HBSC: [Data Browser](https://data-browser.hbsc.org/measure/body-image/), API WHO/Europe (HBSC_19, HBSC_20), [Zdravá generace – report Obezita](https://zdravagenerace.cz/report/obezita/) (český tým HBSC, UP Olomouc); zdroj u každého řádku | 24. 10. 2026 |

**Limity**
- NR-04-25 počítá děti, které se dostaly k péči hrazené pojišťovnou, ne všechny nemocné. Věková skupina 0–18 let, jemnější členění ani rozpad na anorexii a bulimii veřejně není (žádost na ÚZIS podána zvlášť).
- Přepočet na 10 000 dívek končí rokem 2024 (populace podle věku za 2025 v řadě ČSÚ 130181 zatím chybí). Střední stav = průměr stavů k 31. 12. předchozího a daného roku.
- A013 počítá pacienty za každé pracoviště zvlášť; rok 2014 je neúplný. „Nově zjištěná onemocnění“ jsou za všechny věky.
- HBSC „normální nebo nižší váha, a přesto se cítí tlustá“: podíl ze všech dětí dané skupiny s platným BMI (z vlastní výšky a váhy) i odpovědí na otázku o postavě, podle grafů českého týmu HBSC. Diety jsou v otevřených datech jen za rok 2014.

Podrobná rešerše a surová data (mimo repo): `Desktop\Témata na později\2026-10-21_seznamzpravy-mandlove-matky\`.
