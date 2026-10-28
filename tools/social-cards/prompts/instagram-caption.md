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
- **Výzva k interakci je povinná** (od 28. 10. 2026, podle spolupráce
  s Moravec.cz): otázka k tipování nebo na názor čtenáře + „napište nám do
  komentářů“. Otázka musí jít z dat zodpovědět a nesmí podsouvat odpověď.
  Podrobně  → kapitola 8.1.
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
[2–4 věty shrnutí + otázka na čtenáře („Tipněte si…“ / „Co si myslíte…? Napište do komentářů.“) + CTA "odkaz v bio"]

HASHTAGY: [0–5 věcných, jen pokud fakt pomůžou dohledatelnosti]
```

---

## Prompt k odeslání

```
Navrhni pořadí slidů carouselu (z KARTY, formát ig-portrait) a napiš k nim
caption podle pravidel výše. Caption nesmí obsahovat klikací odkaz — místo
toho CTA na bio. Přidej otázku, která čtenáře vyzve k tipu nebo názoru
v komentářích. Drž se výhradně čísel a tvrzení z ČLÁNEK_TEXT, civilní
čeština bez berliček.
```
