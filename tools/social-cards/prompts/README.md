# Prompty pro texty k sociálním kartám

Tyhle soubory jsou hotové prompty pro Claude (nebo jiný LLM) — vyplníš pár
placeholderů a vložíš do konverzace. Nejsou to instrukce pro `generate.mjs`;
skript řeší jen obrázky, tenhle text řeší slova kolem nich.

Platí pro ně vždy:
- **Jeden zdroj pravdy zůstává kanonický článek.** Prompt smí přeformulovat,
  nesmí přidat číslo ani tvrzení, které v článku není — viz
  `docs/redakcni-styl/DISTRIBUCNI_FORMATY.md`.
- **Jazyk** se řídí `docs/redakcni-styl/REDAKCNI_MANUAL.md` (civilní čeština,
  čísla s kotvou, žádné berličky) — je to výchozí kontext pro každý prompt
  níže, i když ho prompt sám nekopíruje celý.
- Než pošleš vygenerovaný text ven, přečti ho jednou nahlas — pokud se
  zadrhne jazyk na mobilu za pochodu, zadrhne se i čtenáři.

## Soubory

| Prompt | Pro co |
|---|---|
| `x-thread.md` | Vlákno na X — hook bez odkazu, odkaz až v prvním replies |
| `bluesky-thread.md` | Vlákno na Bluesky — stejná kostra, odkaz smí být rovnou v hlavním příspěvku |
| `threads-post.md` | Příspěvek/krátké vlákno na Threads — konverzačnější tón |
| `instagram-caption.md` | Caption ke carouselu — odkaz jen přes bio, jiná gramatika captionu |

## Společné vstupy, které budeš vyplňovat

- `{{ČLÁNEK_URL}}` — veřejná URL publikovaného článku.
- `{{ČLÁNEK_TEXT}}` — buď vlož celý `index.md`, nebo aspoň úvod + mezititulky.
- `{{KARTY}}` — obsah `social/social.json` daného článku (headline/caption
  jednotlivých karet) — prompt z něj vybírá, které karty pro daný formát
  použít; obrázky samotné vyrobíš pomocí `generate.mjs` podle stejného
  `social.json`.
- `{{KEY_STATS}}` — obsah `key-stats.yaml`, pokud existuje.

## Než spustíš pipeline obrázků

Text a karty vznikají ze stejného `social/social.json` — když prompt níže
navrhne jinou kotvu nebo pořadí zjištění, než jaké mají karty teď, uprav
`social.json` a spusť `generate.mjs` znovu, ať obrázek a text sedí na sebe.
