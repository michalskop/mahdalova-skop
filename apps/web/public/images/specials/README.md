# Obrázky speciálů

- `<název>.svg` – obrázek karty speciálu na titulce (`TILES` v `components/frontpage/SpecialsHero.tsx`).
- `og/<název>.jpg` – OG obrázek stránky speciálu (1200×630), vyrobený z obrázku karty:
  `NODE_PATH=<repo>/node_modules node tools/specials-og.cjs`. Po každé změně SVG karty spustit znovu.
  Sítě a messengery SVG neumějí, proto do metadat stránky vždy JPEG z `og/`.

Pravidla a ponaučení: `tools/COVER-EDITOR.md` → *Ponaučení z oprav*.
