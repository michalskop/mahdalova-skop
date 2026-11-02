# Referenda o větrných elektrárnách – data k článku

`python build.py` spočítá všechna čísla v textu (`vystup.txt`), grafy v `../data/` a polohy obcí pro cover
(`../_cover_pipeline/obce.json`). Pak `node ../_cover_pipeline/motiv.cjs` a generátor coverů.

## Vstupy

- `vstupy/referenda_vetrniky_kv2026.csv` – 21 obcí, referenda 9.–10. 10. 2026. Výsledky ze zápisů místních
  komisí na webech a úředních deskách obcí (URL u každého řádku), kontrola proti tabulce MV ČR
  „Místní referenda – tabulka hlášení“ (stav 16. 10. 2026, https://mv.gov.cz/volby-referenda/oznamena-referenda-2).
  Sestaveno 20.–21. 10. 2026.
- `vstupy/referenda_vte_2006_2026.csv` – všechna referenda o větrných elektrárnách z tabulky MV, vyčištěná
  skripty `mv_2006_2026/01–05` (spouštět v pořadí; potřebují tabulku MV a ČSÚ OBY02A, viz hlavičky skriptů).
  Co znamená odpověď ANO a která otázka je hlavní, je ručně zakódováno v `mv_2006_2026/rucni_kodovani.csv`.

## Známé nesoulady

- Teplýšovice: MV uvádí NE 9,71 %, ze zápisu 6,71 %.
- Měčín zveřejnil jen zaokrouhlená procenta, počty hlasů jsou z tabulky MV.
- Před 9. 10. 2026 MV neuvádí počet hlasujících, je dopočten jako oprávnění × účast (±1 hlas).
