# Prompt: příspěvek/vlákno na Threads

## Platformní mechanika (2026)

- **Limit 500 znaků na příspěvek** (plus volitelná dlouhá textová příloha,
  tu tady nepoužíváme — je to pro jiný typ obsahu).
- **Carousel obrázků**: standardně až 10, u části účtů se postupně
  odemyká až 20 — pro naše účely stačí max 4, stejná sada jako pro X/Bluesky
  (`x-square` nebo `bluesky-square`, obojí 1:1 funguje).
- Odkazy na Threads nemají tak zdokumentovaný útlum dosahu jako na X, ale
  praxe je opatrná — bezpečná varianta je stejná jako u X: **hook bez
  odkazu, odkaz do prvního replies**, protože účty často cross-postují
  a řídí se přísnějším pravidlem z obou.
- **Tón je konverzačnější** než X i Bluesky — Threads je blíž běžné
  konverzaci než zpravodajskému kanálu, viz
  `docs/redakcni-styl/DISTRIBUCNI_FORMATY.md`.

## Pravidla obsahu

Kratší vlákno než na X/Bluesky (obvykle 2–4 příspěvky stačí, Threads
publikum čte míň do hloubky). Hook + 1–2 dílčí zjištění + odkaz v repliesu.
Číslo vždy s kotvou, žádné tvrzení nad rámec článku.

## Vstupy

- Odkaz: `{{ČLÁNEK_URL}}`
- Text článku: `{{ČLÁNEK_TEXT}}`
- Karty (formát `x-square` nebo `bluesky-square`): `{{KARTY}}`
- Klíčová čísla: `{{KEY_STATS}}`

## Požadovaný výstup

```
1/ [hook, konverzačnější tón, BEZ ODKAZU, max 500 znaků]
   IMAGE: x-square/<card-id> (až 4)

1a/ (reply) [odkaz + jedna věta, proč kliknout]
   LINK: {{ČLÁNEK_URL}}

2/ [nejvýš jedno další zjištění, jen pokud fakt unese kratší formát]
```

---

## Prompt k odeslání

```
Napiš krátké vlákno (2–4 příspěvky) na Threads k tomuto článku podle
pravidel výše. Konverzačnější tón než na X, ale žádná fakta navíc oproti
ČLÁNEK_TEXT. Hook bez odkazu, odkaz do repliesu. Navrhni karty z KARTY
podle id, max 4 na příspěvek, formát x-square nebo bluesky-square.
```
