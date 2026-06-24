# Handover: Demografie – nové články na webu

**Datum:** 19. 6. 2026  
**Autor:** Claude Code (claude-sonnet-4-6)  
**Pro:** kolega navazující na tuto práci

---

## Co bylo uděláno

Tři nové články z editorského repozitáře `data-pro-premierku` byly zapojeny do webové aplikace `mahdalova-skop` a jsou přístupné na webu.

### Nové URL adresy článků

| URL | Název |
|-----|-------|
| `/specialy/data-pro-budouci-premierku/02-demografie/05-skandinavska-past` | Švédský rekord byl 1,97. Dnes je 1,45. |
| `/specialy/data-pro-budouci-premierku/02-demografie/08-cas-rodicovstvi` | Věk 30 je nový věk 22. |
| `/specialy/data-pro-budouci-premierku/02-demografie/12-zeny-rozhodovani` | Pětina sněmovny, polovina populace. |

---

## Architektura – důležité pochopit před editací

### Dva repozitáře, dva různé systémy

**`data-pro-premierku`** je editorský workspace. Obsahuje `.md` soubory jako `DIST_ARTICLE_*.md`. Tyto soubory **se nezobrazují na webu přímo** – jsou zdrojovým materiálem.

**`mahdalova-skop`** je Next.js webová aplikace. Jen to, co je zde, se zobrazí na mahdalova-skop.cz.

### Dva systémy článků v mahdalova-skop

Web má **dva různé systémy** pro zobrazení článků:

#### STARÝ systém (používá demografie a nové články)
```
apps/web/app/clanek/_articles/[slug]/
├── index.md       ← frontmatter: title, slug, htmlInclude: article.html
└── article.html   ← skutečný HTML obsah článku (podporuje inline SVG)

apps/web/app/specialy/data-pro-budouci-premierku/02-demografie/[název]/
└── page.tsx       ← Next.js stránka (viz vzor níže)
```

**Proč starý systém pro demografie?** Kapitola 02-demografie má vlastní hardcoded `page.tsx` pro hub stránku. Nové články v ní musí používat stejný systém (raw HTML), protože MDX v2 (nový systém) nepodporuje inline SVG s HTML atributy jako `stroke-width` – vyžaduje JSX camelCase (`strokeWidth`).

#### NOVÝ systém (kapitoly 01, 03–12)
```
apps/web/app/specialy/data-pro-budouci-premierku/_content/[chapter]/articles/[slug].mdx
```
Pro demografie se NEPOUŽÍVÁ.

---

## Soubory vytvořené v tomto commitu

### article.html soubory (obsah článků)

```
apps/web/app/clanek/_articles/
├── data-pro-budouci-premierku-02-demografie-05-skandinavska-past/
│   ├── index.md      ← frontmatter (promoted: 35)
│   └── article.html  ← obsah + SVG: TFR srovnání Švédsko/Francie/Maďarsko/ČR 2000–2023
├── data-pro-budouci-premierku-02-demografie-08-cas-rodicovstvi/
│   ├── index.md      ← frontmatter (promoted: 36)
│   └── article.html  ← obsah + SVG: timeline věku porodu 1990 vs 2023, kohortní tabulka
└── data-pro-budouci-premierku-02-demografie-12-zeny-rozhodovani/
    ├── index.md      ← frontmatter (promoted: 37)
    └── article.html  ← obsah + SVG: zastoupení žen v politice (sněmovna/kraje/obce/Švédsko)
```

### page.tsx soubory (Next.js routes)

```
apps/web/app/specialy/data-pro-budouci-premierku/02-demografie/
├── 05-skandinavska-past/page.tsx
├── 08-cas-rodicovstvi/page.tsx
└── 12-zeny-rozhodovani/page.tsx
```

Všechny tři page.tsx používají stejný vzor:
```tsx
const SLUG = 'data-pro-budouci-premierku-02-demografie-[slug]';

export async function generateMetadata(): Promise<Metadata> {
  const article = await getArticleBySlug(SLUG);
  return { title: article.title, description: article.excerpt, ... };
}

export default async function [NazevPage]() {
  const article = await getArticleBySlug(SLUG);
  return <ArticleRenderer {...article} slug={SLUG} />;
}
```

Vzor zkopírovat z: `02-demografie/02-co-znamena-plodnost/page.tsx`

### Hub stránka aktualizována

`apps/web/app/clanek/_articles/data-pro-budouci-premierku-02-demografie/demografie-hub.html`

Tři placeholder karty (`<div class="dt-card">`) konvertovány na klikatelné linky (`<a class="dt-card dt-card-link" href="...">`):
- Skandinávská past → `/specialy/.../05-skandinavska-past`
- Věk 30 (Čas rodičovství) → `/specialy/.../08-cas-rodicovstvi`  
- Ženy v rozhodování → `/specialy/.../12-zeny-rozhodovani`

---

## Jak přidat další článek (postup)

1. **Vytvořit složku** v `apps/web/app/clanek/_articles/data-pro-budouci-premierku-02-demografie-[NN-slug]/`

2. **Napsat `index.md`** s frontmatter:
   ```yaml
   ---
   title: "Titulek článku"
   date: "YYYY-MM-DD"
   author: "Kateřina Mahdalová & Michal Škop"
   slug: "data-pro-budouci-premierku-02-demografie-[NN-slug]"
   excerpt: "Perex..."
   coverImage: "/images/data-pro-budouci-premierku-demografie-landing.webp"
   filter: ["data-pro-budouci-premierku", "demografie"]
   tags: ["demografie", "speciál", "data-pro-budouci-premierku"]
   promoted: [číslo – next po 37]
   htmlInclude: article.html
   ---
   ```

3. **Napsat `article.html`** – HTML obsah. Zabalit do `<div class="dp-art">`. SVG inline funguje bez omezení.

4. **Vytvořit `page.tsx`** v `apps/web/app/specialy/data-pro-budouci-premierku/02-demografie/[NN-slug]/page.tsx` podle vzoru výše.

5. **Aktualizovat `demografie-hub.html`** – konvertovat `<div class="dt-card">` na `<a class="dt-card dt-card-link" href="/specialy/.../[NN-slug]">`.

---

## Existující funkční články v demografie (pro referenci)

| URL slug | Stav |
|----------|------|
| `01-128` | ✅ funkční |
| `02-co-znamena-plodnost` | ✅ funkční |
| `03-svet-populace` | ✅ funkční |
| `05-skandinavska-past` | ✅ nový (tento commit) |
| `08-cas-rodicovstvi` | ✅ nový (tento commit) |
| `12-zeny-rozhodovani` | ✅ nový (tento commit) |

Ostatní karty v hub stránce jsou zatím placeholder (`<div>` bez href) – článek pro ně neexistuje.

---

## Static export – důležité

Web používá `output: 'export'` (Next.js static export). To znamená:
- Každá URL musí mít odpovídající `page.tsx` soubor (nebo `generateStaticParams`)
- Po přidání `page.tsx` je třeba **buildnout** (`npm run build` v `apps/web/`)
- Lokálně: `npm run dev` funguje bez buildu, ale produkce vyžaduje build a deploy

---

## Kontakt na editorský repozitář

Zdrojový obsah článků je v `data-pro-premierku/02_DEMOGRAFIE/03_primary_content/DIST_ARTICLE_*.md`. Tyto soubory slouží jako referenční zdrojový materiál – obsah z nich se ručně konvertuje do `article.html` formátu při publikaci.
