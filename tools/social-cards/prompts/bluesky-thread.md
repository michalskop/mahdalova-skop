# Prompt: vlákno na Bluesky

## Platformní mechanika (2026)

- **Až 4 obrázky na příspěvek**, žádné pevné pixelové vynucení, ale drž se
  standardních poměrů — buď čtverec (`bluesky-square`, 1080×1080), nebo
  širokoúhlý 16:9 pro samostatný obrázek (`bluesky-landscape`, 1200×675).
  Soubory drž pod ~1 MB (ploché barvy a text bez fotografií to splňují
  bez zvláštní komprese).
- **Odkaz v hlavním příspěvku není penalizovaný** stejným způsobem jako na
  X — Bluesky nemá zdokumentovaný ekvivalentní útlum dosahu u odchozích
  odkazů (feedy jsou většinou chronologické nebo vlastní/custom). **Neplatí
  tedy X-ové pravidlo "odkaz do replies"** — odkaz může být přímo v prvním
  příspěvku, pokud to čtenářsky dává smysl.
- Publikum je ochotnější číst datové detaily než na X — klidně jedna úroveň
  „wonk" navíc (přesnější formulace metodiky, číslo s dodatečnou kotvou).
- Alt text u obrázků čtenáři na Bluesky očekávají — dopiš ho ke každému
  obrázku (věcný popis grafu, ne opakování captionu).

## Pravidla obsahu

Stejná kostra jako X: hook s jedním číslem → dílčí zjištění → shrnutí +
odkaz na víc. Rozdíl je jen v umístění odkazu a v míře detailu, ne ve
struktuře ani v číslech — viz `docs/redakcni-styl/DISTRIBUCNI_FORMATY.md`,
sekce Tweet-stories.

## Vstupy

- Odkaz: `{{ČLÁNEK_URL}}`
- Text článku: `{{ČLÁNEK_TEXT}}`
- Karty (formát `bluesky-square` nebo `bluesky-landscape`): `{{KARTY}}`
- Klíčová čísla: `{{KEY_STATS}}`

## Požadovaný výstup

```
1/ [hook s jedním číslem] {{ČLÁNEK_URL}}
   IMAGE: bluesky-square/<card-id> (až 4) nebo bluesky-landscape/<card-id> (1)
   ALT: [věcný popis obrázku pro nevidomé čtenáře]

2/ [dílčí zjištění]
   IMAGE: ...
   ALT: ...

N/ [shrnutí, co článek řeší navíc — metodika, limity]
```

---

## Prompt k odeslání

```
Napiš vlákno na Bluesky k tomuto článku podle pravidel a mechaniky výše.
Drž se výhradně čísel a tvrzení z ČLÁNEK_TEXT. Piš civilní češtinou bez
berliček, jedna myšlenka na větu, ale o úroveň detailnější než bys psal
pro X — bluesky publikum čte datové nuance ochotněji.
Odkaz může být přímo v prvním příspěvku. Ke každému obrázku napiš i alt
text. Navrhni karty z KARTY podle id, max 4 na příspěvek.
```
