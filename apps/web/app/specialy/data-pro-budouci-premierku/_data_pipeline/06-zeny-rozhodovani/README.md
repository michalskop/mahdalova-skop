# Článek 06 – Ženy a rozhodování (zdroje a postup)

Zobrazuje se **`06-zeny-rozhodovani.html`** (v `.mdx` je jen frontmatter s `htmlInclude`; `page.tsx` vykresluje obsah souboru .html přes `RawHtmlEmbed`, text v .mdx se ignoruje). Soubor .html se sestavuje skriptem `build_html.py` ze `sablona.html` (text) a dvou SVG grafů v paletě DESIGN.md; HTML se pak nemá upravovat ručně.

Původní soubory jsou mimo repozitář (stažení 28. 10. 2026 do `C:/tmp/dpbp-06/raw`).

| Co | Zdroj | SHA-256 |
|---|---|---|
| Zvolení poslanci 2002 | volby.cz otevřená data, `PS2002_reg_20230428_csv.zip` (psrk.csv) | fb034bfec3d8f2f9983c8dfb581e65a3a54b8fe12f5ab8f5b2b0f145e01bdb94 |
| 2006 | `PS2006_reg_20230428_csv.zip` | 4aa34b0261f49bbf0074bb09a02b86de9f6b28e1710c27b414a795011358a648 |
| 2010 | `PS2010_reg_20230428_csv.zip` | 7902c8e69e3bcaa02ac2b6928120fc6a2c4e29042ecc74b7c6246db6eb626905 |
| 2013 | `PS2013_reg_20230428_csv.zip` | ecd55369380856d587a8d49aa87c034357fd4b8115132ae06e81ad95998b1b78 |
| 2017 | `PS2017reg20171021_csv.zip` | 2145e31687874214ca7ee8cf012169b131a44e64a168170a8638e1280bee6f9f |
| 2021 | `PS2021reg20211010_csv.zip` | 29102a6d304d90b4e7a3ea25cfb69b79a10bfe2e18b69b6acb65704bedf1800d |
| 2025 | `PS2025reg20251005_csv.zip` | 86495a1b9677dd1e10638efad8086c190faf725a6c5a86e5f1702a01f7cd6c5d |
| Kraje 2020/2024, obce 2026, úspěšnost 2025 | ČSÚ, Ženy a muži v rozhodovacích procesech, https://csu.gov.cz/zeny-a-muzi-v-rozhodovacich-procesech (aktualizováno 27. 10. 2026) | d0111d9c9f899f106454ec20ae0d8195dc142e564326857d762e3b2b3ae1366e |
| EU, Švédsko, Senát | IPU Parline, https://www.ipu.org/parlement/<KOD> (27 států EU), Senát https://data.ipu.org/parliament/CZ/CZ-UC01/ (SHA-256 stránky Senátu 075d8c6c…b00dc; SE b0701484…d22f0; CZ 9c14874d…f7dc) | – |
| Zákonné kvóty | International IDEA, Gender Quotas Database, Legislated Candidate Quotas (71 států v tabulce), https://idea.int/data-tools/data/gender-quotas-database/legislative-overview | a5f1fc20e68f19d8123a9845240f262359efc8f26c1c27996a76361c1f98e42d |

Spuštění: `python -X utf8 -I zeny_snemovna.py` → `ipu_eu.py` → `build_html.py`.

## Postup a limity
- **Pohlaví poslanců**: otevřená data volby.cz neobsahují pohlaví. Žena = příjmení na -ová/-á, u cizích a nepřechýlených jmen ručně ověřená výjimka (`EXTRA` v `zeny_snemovna.py`). Kontrola: součty 2010 (44), 2017 (44), 2021 (50), 2025 (67) sedí s ČSÚ a IPU; 2002 (34) a 2006 (31) sedí s údaji ČSÚ citovanými v médiích. Podíl žen mezi kandidáty (~30 %) je z téže heuristiky (E15 uvádí 31,3 %, heuristika podhodnocuje).
- **Sněmovna podle stran 2025** (`data/snemovna_2025_strany.csv`): ANO 21/80, SPOLU 11/52, STAN 13/22, Piráti 15/18, SPD 5/15, Motoristé (AUTO) 2/13; součet 67.
- **Pořadí EU** (`data/ipu_eu.csv`): ze stránek IPU o 27 státech, Česko 33,5 % = 14. místo; žebříček IPU jsme nestahovali (je načítaný skriptem), pořadí je vlastní.
- **Neověřeno**: Senát (IPU 21,3 %, nejasné, zda zahrnuje volby z října 2026); tvrzení o financování kampaní a rozdělení péče o domácnost (vypuštěno, označeno jako neověřené); knihy Thomas (1994) a Swers (2002) jsou citovány bez odkazu; 1996 a 1998 nemáme z otevřených dat (první dostupné jsou 2002).
- **Pozor na datum**: `date` článku zůstává 2026-06-19, text už cituje údaje z října 2026 (obecní volby, Senát); autorka by měla rozhodnout o vyznačení aktualizace.
