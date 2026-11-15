# Zadání pro psaní kapitol speciálu „Jací jsme byli, jací jsme – 1989 × 2026“

Platí pro každou kapitolu (lidé i AI). Kapitola = běžná složka článku, veřejná adresa je pod speciálem.

## Kde a jak
- Repo (worktree): `C:\Users\datov\Desktop\datatimes\mahdalova-skop\.claude\worktrees\cesko-37-let-revoluce-22e592`
- Složka kapitoly: `apps/web/app/clanek/_articles/<zdroj>/` (název `zdroj` je v `apps/web/app/specialy/jaci-jsme-byli-jaci-jsme-1989-2026/kapitoly.json`). Nic jiného neměň: `kapitoly.json`, pilot, `lib/`, komponenty ani cizí kapitoly.
- Veřejná adresa kapitoly: `/specialy/jaci-jsme-byli-jaci-jsme-1989-2026/<kapitola>/`. Odkazy na jiné kapitoly piš vždy takhle, nikdy `/clanek/…`.
- Vzor: pilot `apps/web/app/clanek/_articles/analyza-2026-11-17-jaci-jsme-byli-jaci-jsme-1989-a-dnes/` (index.md + `_data_pipeline/02_dvojice.py`, `03_doplnky.py`, `04_grafy.py`). Funkce `najdi_archiv`, `radek`, `sloupec` si zkopíruj, neimportuj z pilota.
- Žádný commit, žádný push, žádné covery (dělají se zvlášť po schválení textu).

## Povinné čtení před psaním
1. `docs/redakcni-styl/REDAKCNI_MANUAL.md` celý (hlavně Části II, III, VI a checklist VII).
2. `docs/redakcni-styl/STYL_DATOVA_ZURNALISTIKA.md`.
3. `docs/design/DESIGN.md` §10 grafy, hlavně *Before you send a chart* a *Pictogram grids*.

## Data
- Archiv dat (mimo git): `C:\Users\datov\Desktop\datatimes\statisticka-data\cesko` (odkaz `csu-data`). Nejdřív hledej tam (README archivu má tabulku sad). Nová data stahuj tam podle README (oblast/sada/datum, ZDROJ.txt, SHA256SUMS.txt) a do README archivu NEPIŠ – vypiš řádky ve zprávě.
- Klíčová sada: `souhrn/cesko-od-1989/20260827/data/32018126_XXXX.xlsx` (ČSÚ Česko od roku 1989 v číslech, 73 tabulek, seznam v `obsah.txt`).
- Každé číslo v textu, grafu i titulku počítá skript v `_data_pipeline/` kapitoly z primárních dat a vypíše ho do `vystup.txt`. Žádná čísla z hlavy, médií ani AI shrnutí. Neověřené nepiš.
- Srovnání vždy „1989 (nebo nejbližší rok, se kterým ČSÚ řadu začíná) × poslední rok“; když řada začíná později nebo se změnila metodika, řekni to u tvrzení.

## Článek
- Frontmatter: `title` (teze, jedna myšlenka, nejvýš jedno číslo), `date: "2026-11-17"`, `author: "Kateřina Mahdalová"`, `excerpt`, `filter: ["analýza"]`, `tags: ["Jací jsme byli, jací jsme", "1989", …tematické]`. Bez `time` a bez cover polí.
- Žánr datová analýza, 700–1 200 slov. Otvírák = nejsilnější číslo s kotvou. Mezititulky jsou teze. Konec bez rekapitulace.
- Povinné prvky: inline `<RelatedArticles preset="sidebar" position="right" heading="🔻🔻🔻" slugs={[…]} />` v první čtvrtině (do slugs dej `analyza-2026-11-17-jaci-jsme-byli-jaci-jsme-1989-a-dnes` a 1–2 příbuzné články), `<SupportBanner float="left" />` v horní polovině v jiném úseku, rámeček ```` ```infobox info ```` s `**Jak to počítáme**`, na konci `<RelatedArticles heading="🔻🔻🔻" slugs={[…]} />`. Boční prvky jen tam, kde je obteče 3–4 odstavce textu.
- Zdroje inline jako `[popisný název](konkrétní URL)` u tvrzení, žádný souhrnný „Zdroje“.
- Čeština: en-dash, pevné mezery v tisících, procenta s mezerou, podmět a přísudek napřed, žádná klišé a hodnotící přívlastky u čísel.

## Grafy (2–4 na kapitolu)
- Vega-Lite JSON do `data/*.json`, generuje `_data_pipeline/grafy.py`, v textu `<VegaChart dataFile="data/x.json" />`. Logo, patičku a tooltip dodá web sám (`_source` = řádek dat v patičce, krátce, na jeden řádek).
- Titulek = teze s barevným zvýrazněním `{slovo|#de1743}`; podtitul = co, jednotky, roky. `config.view.stroke: null`, osy bez `domain` a `ticks`, mřížka jen popsaná `#d4d4c8`, hodnoty přímo u značek, rezerva v doméně osy.
- Barvy: tehdy (1989) `#6267a3`, dnes `#de1743`, ink `#101432`, tlumená `#d4d4c8`. Nikdy červená × zelená.
- Dlouhé názvy kategorií dávej NAD řádek (textová vrstva, osa y `axis: null`) – na mobilu 390 px se jinak tlačí do grafu (vzor `cinka()` v pilotu `04_grafy.py`).
- Piktogramy (pokud je zadání chce): Vega-Lite mřížka bodů s vlastním tvarem `shape` = SVG path ikony (Tabler icons, viewBox 24, jedna ikona = jeden kus), zvýrazněné `#de1743`, ostatní `#d4d4c8`, nadpis řádku srozumitelnou větou.

## Kontrola a zpráva
- Spusť `node apps/web/scripts/checkArticles.js <zdroj>`: smí hlásit jen chybějící covery.
- Ve zprávě: titulek, perex, 5–8 klíčových čísel (tehdy × dnes, roky, zdroj), seznam grafů, co jsi nezjistil(a) nebo vypustil(a), řádky pro README archivu.
