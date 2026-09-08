# Prompt: vlákno na X

## Platformní mechanika (2026, ověřuj před velkou kampaní — X to nedokumentuje oficiálně, jde o široce pozorovanou praxi)

- **Odkaz snižuje dosah hlavního příspěvku** — opakovaně zaznamenané testy z
  2026 ukazují desítky procent nižší zobrazení u příspěvků s odchozím
  odkazem oproti textově/obrazově identickému příspěvku bez odkazu. Proto:
  **hlavní (hook) příspěvek nikdy neobsahuje odkaz** — ten patří až do
  prvního vlastního replies pod hookem.
- **Až 4 obrázky na příspěvek**, dnes v mřížce 2×2 (X postupně přechází na
  swipeable carousel — do budoucna se počet možná zvýší, teď počítej se 4).
  X ořezává vícefoto příspěvky **od středu** — ve všech obrázcích (viz
  `x-square` preset, 1200×1200) drž klíčový text/číslo ve středních
  60–70 % plochy, což šablona `template.html` už respektuje odsazením.
  Všechny obrázky v jednom příspěvku musí mít **stejný poměr stran**,
  jinak je X neořízne konzistentně — používej výhradně `x-square`.

## Pravidla obsahu

- Hook = jedno číslo s kotvou (stejný princip jako žánr „Číslo dne",
  `REDAKCNI_MANUAL.md`), žádné souvětí.
- Další příspěvky: jedno zjištění na příspěvek, vlastní kotva, žádná
  závislá vsuvka — čte se na mobilu za pochodu.
- Poslední příspěvek threadu = shrnutí + věta, proč dočíst článek (co
  v threadu není: metodika, limity dat).
- Neopakuj číslo jinak, než jak ho má článek — žádné zaokrouhlení navíc.
- Žádné emoji jako odrážky, žádné clickbaitové "you won't believe".

## Vstupy

- Odkaz: `{{ČLÁNEK_URL}}`
- Text článku: `{{ČLÁNEK_TEXT}}`
- Karty (obrázky už vyrobené/k výrobě přes `generate.mjs`, formát `x-square`,
  max 4 na jeden příspěvek): `{{KARTY}}`
- Klíčová čísla: `{{KEY_STATS}}`

## Požadovaný výstup

Očíslovaná řada příspěvků, každý max ~260 znaků (rezerva pod 280 na
diakritiku a interpunkci), v tomto tvaru:

```
1/ [text hooku, BEZ ODKAZU]
   IMAGE: x-square/<card-id> (až 4, jen pokud fakt přidávají, ne default)

1a/ (REPLY na 1/) [text s odkazem]
   LINK: {{ČLÁNEK_URL}}

2/ [druhé zjištění]
   IMAGE: x-square/<card-id>

3/ [třetí zjištění, pokud unese]
   IMAGE: x-square/<card-id>

N/ [shrnutí + důvod dočíst]
```

Vyber karty z `{{KARTY}}` tak, aby pořadí příspěvků odpovídalo tomu, jak
zjištění staví samotný článek (hlavní číslo → dílčí zjištění → limity/co
z toho neplyne), ne obráceně.

---

## Prompt k odeslání

```
Napiš vlákno na X k tomuto článku podle pravidel a mechaniky výše.
Drž se výhradně čísel a tvrzení, která jsou v ČLÁNEK_TEXT — nic nepřidávej
ani nezaokrouhluj jinak. Piš civilní češtinou bez berliček
(docs/redakcni-styl/REDAKCNI_MANUAL.md), jedna myšlenka na větu.
Odkaz smí být JEN v příspěvku 1a (reply na hook), nikdy v hooku samotném.
Ke každému příspěvku, kde to dává smysl, navrhni, kterou kartu z KARTY
použít (podle jejího id), max 4 karty na jeden příspěvek, formát x-square.
```
