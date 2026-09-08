# Prompt: caption ke carouselu na Instagramu

## Platformní mechanika (2026)

- **Carousel: aktuálně doporučený poměr 4:5 portrait (1080×1350)** —
  zabírá víc plochy ve feedu než čtverec, proto je teď preferovaná volba
  před 1:1. Používej výhradně preset `ig-portrait`.
- **Instagram uzamkne poměr stran podle prvního slidu** — všechny další
  slidy se na něj automaticky ořežou. Nikdy nemíchej `ig-portrait` s jiným
  presetem v jednom carouselu.
- **Caption nemá klikací odkaz** — Instagram odkazy v textu nezobrazuje
  jako klikací, takže se nepíšou jako "podrobnosti na [URL]", ale jako
  **"odkaz v bio"** nebo obdobná výzva k profilu.
- Publikum je vizuálnější a méně čte dlouhý text pod příspěvkem — caption
  je shrnutí, ne převyprávění threadu.

## Pravidla obsahu

- Každý slide = jedno zjištění, jeden graf/číslo (karty v `social.json`
  jsou 1:1 se slidy, v pořadí, v jakém mají jít do carouselu).
- Caption pod carouselem: krátké shrnutí (2–4 věty) + CTA na bio, ne
  kopie textu ze slidů.
- Hashtagy věcné a málo (téma, ne generické „#news #czech"), pokud vůbec.

## Vstupy

- Text článku: `{{ČLÁNEK_TEXT}}`
- Karty v pořadí pro carousel (formát `ig-portrait`, max 10, u nás typicky
  3–5): `{{KARTY}}`
- Klíčová čísla: `{{KEY_STATS}}`

## Požadovaný výstup

```
CAROUSEL POŘADÍ:
1. ig-portrait/<card-id>
2. ig-portrait/<card-id>
...

CAPTION:
[2–4 věty shrnutí, poslední věta = CTA "odkaz v bio" nebo obdoba]

HASHTAGY: [0–5 věcných, jen pokud fakt pomůžou dohledatelnosti]
```

---

## Prompt k odeslání

```
Navrhni pořadí slidů carouselu (z KARTY, formát ig-portrait) a napiš k nim
caption podle pravidel výše. Caption nesmí obsahovat klikací odkaz — místo
toho CTA na bio. Drž se výhradně čísel a tvrzení z ČLÁNEK_TEXT, civilní
čeština bez berliček.
```
