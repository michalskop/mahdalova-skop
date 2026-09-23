# Design System Reference

Shared design system for **mahdalova-skop** (apps/web) and **datajournalism.studio** (apps/datajournalism.studio).
All shared components live in `packages/ui/src/`. Both apps consume them via `@repo/ui`.

---

## Typography

| App | Body font | Heading font | Weights |
|-----|-----------|--------------|---------|
| `apps/web` | **IBM Plex Serif** | **IBM Plex Sans** | 400, 500, 600, 700 |
| `apps/datajournalism.studio` | Work Sans (sans-serif) | Work Sans | 400, 500, 600, 700 |

Fonts are set globally via `ThemeProvider` in each app (`theme.fontFamily` = body,
`theme.headings.fontFamily` = headings). The webfonts are declared once in
`apps/web/app/fonts.ts` (`next/font/google`, subsets `latin` + `latin-ext` for
Czech diacritics). **Do not set `fontFamily` on individual components** – it
inherits automatically. On `apps/web`, body copy is serif and every Mantine
`Title` (all heading levels) is sans-serif.

### Czech typography (`apps/web`)

Article text is run through `remarkCzechTypography` (a remark plugin, wired in
`lib/articles.ts`) at build time, and the hero title through `fixCzechTypography`
in `ArticleRenderer`. Both live in `packages/ui/src/lib/remark-czech-typography.js`
and insert non-breaking spaces so that **one-letter prepositions/conjunctions**
(`k s v z o u a i` + capitals) never end a line, and **brackets** are never
orphaned at a line edge (`( ` → `(&nbsp;`, ` )` → `&nbsp;)`). Only mdast `text`
nodes are touched — code, raw HTML and URLs are left alone. These are hard
rules: never ship copy with a dangling one-letter word or a lone bracket.

### Article layout (`apps/web`)

Applied to every article via `ArticleRenderer` (both `/clanek/*` and
`/specialy/*`); values live as named constants at the top of
`apps/web/components/clanek/ArticleRenderer.tsx`.

| Element | Value | Notes |
|---------|-------|-------|
| Reading column | `Container maw={800}` (≈736px text) | after The Nerve; blocks under the article (`page.tsx`) also use `maw="800px"` so everything aligns |
| Hero title (H1) | IBM Plex Sans, weight **600**, **responsive** | `2.625rem` (42px) ≥769px, `2rem` (32px) ≤768px — hard breakpoint at 768px, `line-height: 1.1`. Rule: `.article-hero-title` in `apps/web/app/globals.css` |
| Section headings (H2) | IBM Plex Sans, colour `brand.6` (crimson) | **responsive**: 1.625rem (26px) desktop, **1.375rem (22px) ≤768px** |
| Sub-headings (H3) | IBM Plex Sans, colour `brandNavy.9` (ink) | **responsive**: 1.375rem (22px) desktop, **1.125rem (18px) ≤768px** |
| Body copy | IBM Plex Serif, **17px** (`1.0625rem`), weight 400 | `size="lg"` line-height; colour `brandNavy.9` |

**Text colour:** body copy, sub-headings, card titles, excerpts and dates use
`brandNavy.9` (**#101432**, "ink blue") instead of Mantine's off-palette gray /
`dimmed`. Only the crimson H1/H2 keep `brand.6`.

**Article/card titles are sans-serif** (`--mantine-font-family-headings`). Card
titles (`ArticleCard`) are container-responsive (md→lg→xl by card width); H1/H2/H3
use the 768px breakpoint above.

**Oval tag/badge font — always sans-serif.** Every oval tag/badge (the rubric
pill "ANALÝZA"/"KONTEXT", the homepage tag pill, `TagList`, etc.) uses the
sans-serif headings font (`--mantine-font-family-headings`), **never** the serif
body font — on `apps/web` a serif badge looks wrong at pill size. Mantine's
`Badge` defaults to the body font, so this must be set explicitly (e.g.
`.rating` in `ArticleCard.module.css`, `.relatedBadge` in `box.module.css`).
This is a site-wide rule for any new badge.

**Oval tag/badge — vertical centering (`text-box-trim`).** Verzálky (rubriky
"MAPY", "RUSKO", "GAZA", "ŠVÉDSKO"…) nemají dolní dotažnice, takže defaultní
řádkový box je posadí opticky moc vysoko (empiricky −4 px u čistých verzálek,
až −8 px u slov s diakritikou). Řešeno **jedním plošným pravidlem pro celý web**
na `.mantine-Badge-label` (v `apps/web/app/globals.css`, stejné v DJS) — ne
per-komponentu, ať je zdroj pravdy jediný a centrování platí u všech badge:

```css
.mantine-Badge-label {
  text-box-trim: trim-both;          /* seřízne řádkový box… */
  text-box-edge: cap alphabetic;     /* …na výšku samotných verzálek → vycentruje */
  overflow: visible;                 /* háčky/čárky nad verzálkami se ukážou, neořežou */
}
```

Je to **standardní CSS** (CSS Inline Layout 3), ne hack. `overflow: visible` je
nutné, protože Mantine label má `overflow: hidden` a diakritiku přesahující nad
verzálky by jinak ořízl. Pozn.: `text-box-edge: text alphabetic` (plná
accentová výška) posadí slova s diakritikou naopak opticky moc nízko —
nepoužívej. Prohlížeč bez podpory `text-box-trim` spadne zpět na původní
chování.

**Hover-stabilita:** karty (`ArticleCard .card`) se na hover zvětšují
(`transform: scale`). Bez promoce na kompozitní vrstvu prohlížeč překresluje
text mezi klidem a hoverem jinak, takže tag opticky „poskočí". Proto má `.card`
`will-change: transform` (standardní hint), aby bylo vykreslení v obou stavech
konzistentní.

---

### Bleed / vyčuhující prvky (`apps/web`)

Some elements **bleed past the reading column on their outer edge** while the
running text wraps around their inner edge. There is **one shared standard** so
every bleeding element matches — the tokens live in `:root` in
`apps/web/app/globals.css`:

| Token | Value | Meaning |
|-------|-------|---------|
| `--dt-bleed-width` | `48%` | width of the floated element |
| `--dt-bleed-out` | `12%` | how far the outer edge bleeds into the page margin |
| `--dt-bleed-gap` | `1.25rem` | gap between the element and the wrapping text |

**Which elements bleed (side / floated):**
- `<Figure side="right|left">` — floated photo (`figure.module.css`)
- `InfoBox` with `right`/`left` (```` ```infobox warning right ````) — via `box.module.css` `.floatRight/.floatLeft`
- `RelatedArticles position="right|left"` — the floating **„Napsali jsme"** (same `box.module.css` floats)
- `<SupportBanner float="right|left" />` — the compact mid-article donate banner

**Which elements do NOT bleed (full-width, stay in the column):** a plain
full-width `InfoBox` (no `right`/`left`), the end-of-article `<SupportBanner />`,
and the `Doporučujeme` cards block. **Rule of thumb:** only the `right`/`left`
(or `float`) variants bleed; everything else respects the 800px column.

**Side convention (which side floats which way):**
- **SupportBanner → left** (`<SupportBanner float="left" />`). Unlike the other
  bleeding elements it reaches only **half its width** into the text; the outer
  half hangs in the margin (capped so it never crosses the viewport on narrow
  desktops). It also has fixed three-line copy and a set width — see `SupportBanner`.
- **Side InfoBox / „Napsali jsme" → right** (```` ```infobox … right ````, `position="right"`).
- **Photos (`<Figure>`) alternate** left/right as the text flows (author's choice); `center` for tall/portrait.
- **Big boxes → full-width** (no side keyword); on mobile (`≤768px`) everything is full-width.

Keeping support on the left and context boxes on the right means the two never
fight for the same margin. **Don't** put a left and a right float in the *same*
short paragraph cluster — they would pinch the text into a thin middle column;
give each its own text-heavy stretch (≥3–4 paragraphs).

**Flow-around rule:** text *and* headings keep flowing/wrapping around a
bleeding element **until it ends** — no forced gap. This is why H2/H3 must **not**
set `clear` (see `ArticleRenderer`), and `.article-content` is `display: flow-root`
so floats stay contained within the article body (byline above / `Doporučujeme` +
`SupportBanner` below never overlap them).

**Mobile:** at `≤768px` every bleeding element collapses to a normal full-width
block (each component has its own `@media (max-width: 768px)` reset).

**Changing the look:** edit the three tokens in `globals.css` once — Figure,
InfoBox floats, „Napsali jsme" and the floating SupportBanner all update together.

---

## Color Tokens

**This is the BINDING DataTimes palette (závazná paleta).** Every color used anywhere — apps, specials, editorial tools, manuals — must be an exact value from a scale below. Never derive, tint, or invent an intermediate shade; pick the nearest existing index instead. All scales are Mantine custom color scales (10 shades, index 0–9); the **main shade** is index `[6]` unless noted. Access via `theme.colors.colorName[index]` or `c="colorName.6"`. Defined in `apps/web/app/providers/ThemeProvider.tsx` and mirrored in `apps/datajournalism.studio/app/providers/ThemeProvider.tsx`.

### Full palette

**Card 1 — "White, yellow, orange and red"**

| Token | 0 | 1 | 2 | 3 | 4 | 5 | 6 (main) | 7 | 8 | 9 |
|-------|---|---|---|---|---|---|----------|---|---|---|
| `background` | `#ffffff` | `#fdfbf7` | `#f8f6f0` | `#f3f1e9` | `#eeeae2` | `#e9e9dd` | `#e8e8dc` | `#d4d4c8` | `#c8c8bc` | `#bcbcb0` |
| `brandYellow` | `#fffdf0` | `#fff7d9` | `#fff0b3` | `#ffe680` | `#ffdc33` | `#ffd519` | `#ffcf02` | `#efb704` | `#bd9103` | `#a47d03` |
| `brandOrange` | `#fff3e8` | `#ffe0c7` | `#ffc89f` | `#fda668` | `#ff934d` | `#ff7f2a` | `#f76800` | `#cc5f00` | `#994800` | `#663200` |
| `brandCoralRed` | `#fff0ed` | `#ffcec6` | `#ffa99c` | `#ff7e6e` | `#ff5c4a` | `#ff3f30` | `#e8412c` | `#c93020` | `#a32318` | `#7d1810` |
| `brand` | `#fff4f6` | `#ffb3c0` | `#ff8099` | `#ff4970` | `#ff1a4a` | `#f01745` | `#de1743` | `#c5143c` | `#a81134` | `#8b0e2b` |
| `brandDeepRed` | `#fbe8eb` | `#f5c4c9` | `#efa0af` | `#e87c91` | `#d85a74` | `#bb3a5d` | `#a03250` | `#812840` | `#621d30` | `#431320` |
| `brandAmethyst` | `#faf5fc` | `#f3eaf8` | `#e0c8ee` | `#c49ad8` | `#b57ac8` | `#b262c0` | `#9f319e` | `#6e227d` | `#522a7a` | `#351040` |

**Card 2 — "Blue, green and brown"**

| Token | 0 | 1 | 2 | 3 | 4 | 5 | 6 (main) | 7 | 8 | 9 |
|-------|---|---|---|---|---|---|----------|---|---|---|
| `brandRoyalBlue` | `#e9ebfa` | `#c9d0f5` | `#a9b5f0` | `#899aeb` | `#697fe6` | `#5e66d5` | `#4a51ab` | `#383d82` | `#272a59` | `#161730` |
| `brandNavy` | `#e9ecf4` | `#d2d8e9` | `#bcc4df` | `#a6b0d4` | `#8f9dc9` | `#7889be` | `#6267a3` | `#4c4f8e` | `#2f325c` | `#101432` |
| `brandTeal` | `#e5fdfc` | `#b8eff6` | `#8cdfef` | `#5fcce6` | `#33b9d9` | `#1a9fbd` | `#0e839e` | `#06677d` | `#044d5e` | `#023440` |
| `brandEmeraldMint` | `#e8f9f4` | `#c2f0e4` | `#9be8d4` | `#75dfc4` | `#4fd6b4` | `#12b886` | `#0e926a` | `#0b6b4e` | `#084533` | `#042319` |
| `brandForestGreen` | `#eaf7d6` | `#cbeab1` | `#acde8b` | `#8dd265` | `#6ec53f` | `#639e0a` | `#507e08` | `#3d5f06` | `#2a3f04` | `#172002` |
| `brandChocolate` | `#f5f0eb` | `#e6d5c3` | `#d4b89e` | `#c19a78` | `#a87d58` | `#8b6240` | `#6e4a2c` | `#53361e` | `#3b2414` | `#24150b` |

> The purple/**Amethyst** scale (`brandAmethyst`, main `#9f319e`, bright accent `#b262c0`) is the palette's answer whenever an "amethyst" or purple accent is requested — never introduce a new purple.

### Component usage notes

### `brand` – Primary crimson red

| Index | Hex | Use |
|-------|-----|-----|
| [0] | `#fff4f6` | InfoBox 'error' background |
| [6] | `#de1743` | **Default** – links, headings, tag badges, Arrow, section titles, InfoBox 'error' border |
| [7] | `#c5143c` | Hover state for brand links |
| [8] | `#a81134` | Active/visited state for brand links |

```tsx
// Examples
c="brand.6"
gradient={{ from: theme.colors.brand[3], to: theme.colors.brand[8] }}  // article card badge
color={theme.colors.brand[6]}  // Arrow SVG
```

### `background` – Warm off-white page scale

| Index | Hex | Use |
|-------|-----|-----|
| [0] | `#ffffff` | Text colour on dark/coloured backgrounds |
| [1] | `#fdfbf7` | Default page background, Paper/card background |
| [2] | `#f8f6f0` | Table headers, blockquote (Citation) background |

```tsx
// Examples
bg="background.2"   // table header, Citation
c="background.0"    // white text on coloured section header
```

### `brandNavy` – Navy purple

| Index | Hex | Use |
|-------|-----|-----|
| [6] | `#6267a3` | InfoBox 'info' border |

### `brandTeal` – Teal green

| Index | Hex | Use |
|-------|-----|-----|
| [0] | `#e5f9fc` | InfoBox 'success' background |
| [6] | `#0f6c78` | InfoBox 'success' border, SubscribeHH button (`color="teal"`) |

### `brandOrange` – Orange

| Index | Hex | Use |
|-------|-----|-----|
| [0] | `#fff4eb` | InfoBox 'warning' background |
| [6] | `#f76800` | InfoBox 'warning' border |

### `brandRoyalBlue` – Deep blue

| Index | Hex | Use |
|-------|-----|-----|
| [6] | `#4a51ab` | Main shade |
| [8] | `#272a59` | TestimonialCard background (`bg="brandRoyalBlue.8"`) |

### Accent colors (decorative)

| Token | Main [6] | Notes |
|-------|----------|-------|
| `brandYellow` | `#ffcf02` | Highlights |
| `brandForestGreen` | `#639e0a` | Nature/environment topics |
| `brandEmeraldMint` | `#12b886` | Available for success states |
| `brandDeepRed` | `#a03250` | Darker crimson / rose variant |
| `brandAmethyst` | `#9f319e` | Purple accent; bright `#b262c0` [5] (e.g. DPBP hub). Use for "amethyst" accents. |
| `brandCoralRed` | `#e8412c` | Warm coral red |
| `brandChocolate` | `#6e4a2c` | Brown |

---

## Spacing & Sizing

Mantine's default spacing scale is used throughout. Common values:

| Prop value | Approx px | Use |
|------------|-----------|-----|
| `xs` | 10px | Small gaps, badge top offset |
| `sm` | 12px | – |
| `md` | 16px | Standard padding, paragraph margins |
| `lg` | 20px | Section gaps |
| `xl` | 24px | Heading top margin |

Container sizes: article content is capped at `maw={800}` (see Article layout
above); `size="lg"` for article grids.

---

## RelatedArticles („Doporučujeme" / „Napsali jsme")

**Heading is always `🔻🔻🔻`** (since 2026-09-23 – replaces the old „Doporučujeme"
and „Napsali jsme" labels, which are kept below only as role names). It is the
default Czech heading, so `heading` can be omitted; when written explicitly, use
`heading="🔻🔻🔻"`, never the old texts.

Two roles from one component:
- **Bottom cards block = „Doporučujeme"** (the `cards` preset).
  Every article ends with `<RelatedArticles slugs={[…]} heading="🔻🔻🔻" />`.
- **Floating side box = „Napsali jsme"** (`preset="sidebar" position="right" heading="🔻🔻🔻"`).
  Placed mid-article; it **bleeds** out of the column like `<Figure>` (see
  *Bleed / vyčuhující prvky*).

The `cards` preset renders as a **framed section**: a cream `background.2`
(`#f8f6f0`) container with `p="lg"` that underlays the cards. Each card is the
lighter layer — `background.0` (white `#ffffff`) under the text/excerpt below
the cover image. The heading keeps `brand.6` (crimson) — **no underline**. The
`sidebar` preset (the side "Napsali jsme" / "Více k tématu") is frameless but its
card sits on a **slightly beige** `background.1` with rounded corners, so it
reads as one card floated beside the text. Card background is chosen by
`cardBackground` → `cardBgValue()` in `RelatedArticles.tsx`.

**Card behaviour:** the whole card is a single link to the article (stretched
link from the title) with a subtle hover zoom (`scale(1.02)`). Cover thumbnails
use the same **5:4** ratio and the **same fit logic** as the homepage
`ArticleCard` — the shared `fitFor()` in `lib/coverFit.ts` shows the whole image
with a `coverBg` colour band (`contain`) instead of a crop that would cut text
out of the cover. This holds for both the top image (`cards`) and the horizontal
side thumbnail (`sidebar`).

**Badge = rubric pill on the cover.** The format/rubric badge (ANALÝZA/KONTEXT…)
sits in the **top-right corner of the cover image** (`.relatedBadgeOverlay`),
exactly like the homepage — this also saves a line of vertical space in the card
body. It is sans-serif (`.relatedBadge`, see *Oval tag/badge font*). **No author
line** in these boxes — the date is enough (authors clutter a recommendation
list). Author names still render in the `list` preset only.

---

## Component Catalog

All imports from `@repo/ui/components/ComponentName`.

### `Arrow`
Decorative SVG arrow used in section headers next to short titles.

```tsx
import { Arrow } from '@repo/ui/components/Arrow';

<Arrow size={80} color={theme.colors.background[0]} />
```

Props: `size` (px, controls width; height = size/3), `color` (hex), any SVG prop.
**Rule:** Only show next to section titles ≤ 14 characters (`sectionTitle.length <= 14`).

---

### `Flag`
Country flag rendered as an SVG image. Shared by `apps/web` and `apps/datajournalism.studio`.

**Why an image, not an emoji:** Windows (and Chrome on Windows) does **not** render
emoji flags – the "regional indicator" characters fall back to the bare country code
(e.g. `🇩🇪` shows as `DE`). Any flag shown to readers must therefore use this component,
never an emoji. (This is also stated as an editorial standard in the redakční manuál,
section *Fotografie a obraz*.)

**Automatic conversion in articles:** you do **not** need to write `<Flag>` by hand in
article Markdown. Authors may type the plain emoji (`🇩🇪`, `🇪🇺`, …) anywhere in the body –
headings, tables, lists, running text – and the `remarkFlagPlugin`
(`apps/*/lib/remark-flag-plugin.js`) rewrites it to `<Flag>` at build time. The same happens
for scrollytelling HTML via `replaceFlagEmojiInHtml` (`@repo/ui/lib/flag-emoji`). Use the
component directly only when you need a non-default `size` or `shape`.

```tsx
import { Flag } from '@repo/ui/components/Flag';

<Flag code="de" />                           // clean rectangle (4:3), height 20 px
<Flag code="cz" size={16} />                 // rectangle, height 16 px
<Flag code="cz" shape="circle" size={18} />  // circle – EXCEPTIONAL, ad-hoc only
```

Props: `code` (ISO 3166-1 alpha-2, case-insensitive), `size` (px height, width follows 4:3;
for `circle` width = height; default `20`), `shape` (`'rectangle' | 'circle'`, default
`'rectangle'`), `basePath` (default `'/flags'`), any `<img>` prop.

**Look:** a clean rectangle at the flag's natural 4:3 proportions – **no** border, shadow,
background or rounding. The circular crop (`shape="circle"`) is reserved for exceptional,
case-by-case use, not a default.

**Flag galleries (SVG):** rectangles served from `public/flags/rectangle/` (source:
[flag-icons](https://github.com/lipis/flag-icons) `4x3`, MIT, file name = ISO code); circles
from `public/flags/circle/`. Canonical copy lives in `apps/web/public/flags/`; the same folder
is mirrored into `apps/datajournalism.studio/public/flags/` so `<Flag>` never 404s. Keep both
apps in sync. (The older square set in `public/flags/square/` is deprecated and no longer used.)

---

### `ArticleCard`
Card linking to an article. Used inside `ArticlesGrid`.

```tsx
import { ArticleCard } from '@repo/ui/components/ArticleCard';

<ArticleCard
  title="..."
  excerpt="..."
  date="2025-01-01"
  author="..."
  slug="my-article-slug"
  coverImage="/path/to/image.jpg"  // or null
  tags={['tag1', 'tag2']}
  articleBasePath="/clanek"   // default; use "/a" for DJS
  locale="cs-CZ"              // default; use "en-US" for DJS
/>
```

---

### `ArticlesGrid`
Responsive 3-column grid of `ArticleCard`s.

```tsx
import { ArticlesGrid } from '@repo/ui/components/ArticlesGrid';

<ArticlesGrid
  articles={articles}
  articleBasePath="/clanek"   // passed down to ArticleCard
  locale="cs-CZ"
/>
```

---

### `ArticlesSection`
Full-width coloured section with a title on the left and an `ArticlesGrid` on the right.

```tsx
import { ArticlesSection } from '@repo/ui/components/ArticlesSection';

<ArticlesSection
  sectionTitle="Analýzy"
  sectionLink="/analyzy"
  articles={articles}
  themeColor="brand.6"        // any Mantine color string or hex
  articleBasePath="/clanek"
  locale="cs-CZ"
/>
```

Arrow appears automatically next to titles ≤ 14 chars.

---

### `KeyNumbers`
Displays key statistics in a responsive grid with large numeric values and descriptions. Supports inline data or JSON file loading.

```tsx
import { KeyNumbers } from '@repo/ui/components/KeyNumbers';
import type { KeyNumberItem } from '@repo/ui/components/KeyNumbers';

// Inline data
const stats: KeyNumberItem[] = [
  {
    value: '1,28',
    title: 'Česká plodnost 2025',
    description: 'Odhad zazněl 27. 4. 2026 na kulatém stole.',
  },
  {
    value: '+0,8',
    title: 'Babišův cíl',
    description: 'Nárůst z 1,28 na 2,10 dítěte na ženu.',
    color: '#f76800',  // Custom hex color
  },
  {
    value: '+0,47',
    title: 'Historický rekord',
    description: 'Největší nárůst zaznamenaný za 10 let.',
    color: 'brandTeal',  // Palette color
  },
];

<KeyNumbers label="Klíčová čísla" numbers={stats} />

// Or load from YAML file (server-side, like Timeline)
<KeyNumbers yamlFile="stats.yaml" />
```

Props: `label` (section title, default: "Klíčová čísla"), `numbers` (array of `KeyNumberItem`), `yamlFile` (filename relative to article directory, loaded server-side like Timeline), `align` (alignment for single items: 'left', 'center', 'right', default: 'left', desktop only).

Each `KeyNumberItem` has: `value` (string), `title` (string), `description` (string), `color?` (palette name, hex, or rgba).

**Colors:** Use theme names (`brand`, `brandTeal`, `brandOrange`, `brandNavy`, `brandYellow`, `brandForestGreen`, `brandEmeraldMint`, `brandDeepRed`, `brandRoyalBlue`, `background`), shade notation (`brand[9]`, `brandTeal[3]`), or custom codes (`#ff6b35`, `rgba(26,111,168,0.8)`).

Responsive: 3 columns on desktop, 1 column on mobile (≤768px).

---

### `InfoBox`
Informational box with a left border accent and a light background. All fence names (`box`, `mediabox`, `infobox`) map to this component; `box` is a legacy alias.

```tsx
import { InfoBox } from '@repo/ui/components/InfoBox';

<InfoBox type="warning" float="right">
  Content here...
</InfoBox>
```

| `type` | Border | Background | Use for |
|--------|--------|------------|---------|
| `default` *(default)* | `background[6]` #e8e8dc | `background[2]` #f8f6f0 | General callouts, key facts |
| `info` | `brandNavy[6]` #6267a3 | #f0f1f8 | Context, notes |
| `warning` | `brandOrange[6]` #f76800 | #fff4eb | Caveats, limitations |
| `success` | `brandTeal[6]` #0f6c78 | #e5f9fc | Positive findings |
| `error` | `brand[6]` #de1743 | #fff4f6 | Corrections, important warnings |

**In markdown articles** – use code fences:
````md
```box
Key fact using the default neutral style.
```

```infobox warning right
This is a floated warning box.
```

```infobox success
This is a full-width success box.
```
````

**Full-width vs. side (bleeding):** add `right` or `left` to make the box a
**floated side box that bleeds** out of the reading column (like `<Figure>`; see
*Bleed / vyčuhující prvky*) with the text wrapping around it. **Without** `right`/
`left` the box is **full-width** and respects the column. Same distinction, one
keyword.

**"Read more" – fold content with `<!-- more -->`:**
````md
```infobox
This paragraph is always visible.

<!-- more -->

This paragraph is hidden until the reader taps "Číst více".
```
````

**Padding, spacing & titles are central — never tweak a single box.** The look is
set once for every InfoBox: compact padding (`py`/`my` on the `Paper` in
`InfoBox.tsx`) plus the `.dt-infobox` rules in `apps/web/app/globals.css`, which
give a **uniform internal rhythm** and make the box **hug its content** (no extra
space at the top or bottom, at any nesting depth — even a `<div>` MDX wraps inside
the last list item). **Titles are unified** regardless of the markdown level used
(`###` vs `####`): one modest size, **bold**, dark `#242424`, and a title that is a
link is **not** crimson. So authors just write ` ```infobox … ` and the sizing is
consistent — don't add per-box padding/margins.

Props: `type`, `float`, `readMoreAt` (set by the remark plugin – do not set manually), `readMoreLabel`, `readLessLabel`.

---

### `FlourishEmbed`
Embeds a Flourish data visualisation.

```tsx
import { FlourishEmbed } from '@repo/ui/components/FlourishEmbed';

<FlourishEmbed dataSrc="visualisation/1234567" />
```

**In markdown articles** – paste the Flourish embed div directly; `remarkFlourishPlugin` converts it automatically:
```html
<div class="flourish-embed flourish-chart" data-src="visualisation/1234567"></div>
```

---

### `ScrollyTelling`
Scroll-driven storytelling: sticky visual (image or iframe) on the right, scrolling text steps on the left.

```tsx
import ScrollyTelling from '@repo/ui/components/ScrollyTelling';

<ScrollyTelling
  steps={scrollyContent.steps}
  defaultContent={scrollyContent.defaultContent}
  textAlignment="left"         // 'left' | 'right'
  slug="article-slug"
  articleBasePath="/clanek/_articles"  // default; use "/a/_articles" for DJS
/>
```

Data comes from a `scrollytelling.yaml` file next to the article's `index.md`. Loaded automatically by `articles.ts`.

---

### `TagList`
Renders article tags as clickable badge links to `/tag/[normalizedTag]`.

```tsx
import { TagList } from '@repo/ui/components/TagList';

<TagList tags={['Data', 'Volby']} size="sm" />
```

---

### `MatomoAnalytics`
Drop into app layout. `siteId` is app-specific (set in each app's wrapper).

```tsx
// In apps/web – already wrapped, just use:
import { MatomoAnalytics } from '@/components/common/MatomoAnalytics';
<MatomoAnalytics />

// If using the shared package directly:
import { MatomoAnalytics } from '@repo/ui/components/MatomoAnalytics';
<MatomoAnalytics siteId="4" />   // web=4, DJS=5
```

---

### `ThemeSwitcher`
Light/dark mode toggle button. Place in app header.

```tsx
import { ThemeSwitcher } from '@repo/ui/components/ThemeSwitcher';
<ThemeSwitcher />
```

---

### `RawHtmlEmbed`
Renders a raw HTML string (from `htmlInclude` frontmatter field) with scripts re-executed.

```tsx
import RawHtmlEmbed from '@repo/ui/components/RawHtmlEmbed';
<RawHtmlEmbed html={htmlContent} assetBasePath={`/clanek/_articles/${slug}`} />
```

---

### `PhotoGallery`
Fotogalerie ve stylu super.cz: náhledová mřížka stejně velkých dlaždic vložená přímo do textu,
která se po kliknutí na kteroukoli fotku **rozbalí na místě** do svislého sloupce velkých fotek.
Náhledy se ořezávají do čtverce (`object-fit: cover`); zvětšené fotky jsou vidět celé, s červeným
popiskem (`brand.6`) pod fotkou a počítadlem `n / N` v rohu. Responzivní (mobil 3 sloupce, desktop 4).

**V markdown článcích** – použij code fence `fotogalerie`, jeden obrázek na řádek
(`- soubor | popisek | zdroj`; popisek a zdroj jsou nepovinné):

````md
```fotogalerie
- gallery-01.jpg | Popisek první fotky | Foto: ČTK
- gallery-02.jpg | Popisek druhé fotky
- gallery-03.jpg
```
````

Přidáním čísla za fence (` ```fotogalerie 4 `) ukážeš jen část náhledů; zbytek se schová pod
dlaždici „+N". Externí fotku lze zadat i plnou `https://` URL. Renderer doplní cestu
`/clanek/_articles/<slug>/images/` k holým názvům souborů automaticky.

Fotky se do článku připraví skillem **`fotogalerie`** (`.claude/skills/fotogalerie/`): zmenší,
zkomprimuje a nakopíruje je do `images/` a vygeneruje tenhle blok.

Props: `images` (`GalleryImage[]` – `{ src, caption?, credit?, alt? }`), `previewCount`
(kolik náhledů ukázat před „+N", default 6). V článku se `images` předává jako JSON string
přes remark plugin `remark-gallery-plugin`.

---

### `Citation`
Branded blockquote with the editorial philosophy quote. Used on the about/frontpage.

```tsx
import Citation from '@repo/ui/components/Citation';
<Citation />
```

---

### `SubscribeHH`
HeroHero subscription CTA button. Used on frontpage.

```tsx
import SubscribeHH from '@repo/ui/components/SubscribeHH';
<SubscribeHH />
```

---

### `TestimonialCard`
Dark blue card for reader testimonials.

```tsx
import { TestimonialCard } from '@repo/ui/components/TestimonialCard';
<TestimonialCard author="Name" position="Title" date="2024" text="Quote..." />
```

---

### `SupportBanner` (`apps/web`)

Donate strip linking to Stripe. Two forms:

- **Full-width, end of article** — added **automatically** to every article by
  `ArticleRenderer` (below „Doporučujeme"). Controlled by the `withSupportBanner`
  prop (default `true`). Also used on `/specialy/*` landing pages.
- **Bleeding, mid-article** — `<SupportBanner float="left" />` placed **manually**
  by the author inside a text-heavy paragraph (**left by convention** — context
  boxes go right). Compact vertical card that bleeds
  out of the column (shared `--dt-bleed-*` tokens) with the text wrapping around
  it. **Every article should get one** (see the new-article checklist below).

```md
<SupportBanner float="left" />
```

Place it in a stretch with **several paragraphs of running text** (not next to an
infographic, chart, table or another float), so the text has room to wrap.

---

### `PreferredSource` (`apps/web`)

Navy button **„☆ Chci víc [logo] DataTimes.cz ve zprávách Googlu"** linking to
Google's „preferované zdroje" setting
(`https://www.google.com/preferences/source?q=mahdalova-skop.cz`).
File: `apps/web/components/clanek/PreferredSource.tsx` (+ `.module.css`).

- **Placement: automatic, in every article** — rendered by `ArticleByline`
  (right under author/date + share icons, right-aligned) and by the date-only
  fallback in `ArticleRenderer`. Covers `/clanek/*`, `/specialy/[slug]` and the
  DPBP chapters/articles. **Never add it to article markdown by hand.**
- **Wording is fixed:** „Chci víc DataTimes.cz ve zprávách Googlu" (chosen
  2026-09-23 as short + reader-voiced; longer variants like „Přidejte si …
  jako oblíbený zdroj informací na Googlu" were rejected as too long).
- **Look:** `brandNavy.9` (`#101432`) background, white IBM Plex text 15px,
  centred (`text-align: center` + `text-wrap: balance`), radius 6px.
- **Star:** outline only, stroke = logo yellow `brandYellow.4` (`#ffdc33`,
  same as `datatimes-donut.svg`).
- **Icons are centred on cap height, not sitting on the baseline:** star and
  logo (18px) use `vertical-align: calc(0.349em − 9px)` (IBM Plex cap height
  = 0.698em). Keep this if you change icon size or font.
- **Spacing:** star → text 8px; „víc" → logo = word space + 3px; logo → „DataTimes.cz" 5px.
- **No orphaned icons:** star + „Chci víc" and logo + „DataTimes.cz" are each
  `white-space: nowrap`, so an icon never wraps away from its word on mobile.
- Hover: subtle `scale(1.015)`; disabled under `prefers-reduced-motion`.
  Marked `data-pagefind-ignore` so it doesn't pollute search.

---

## Utility: `getArticles`

Server-side function (Node.js only – use in `page.tsx`, never in client components).

```ts
// apps/web wrapper (already configured):
import { getArticles } from '@/components/common/getArticles';
const articles = await getArticles(9, 'analyzy');

// Parameters:
getArticles(
  limit = 9,
  filter?,              // string | string[] – matches article frontmatter 'filter' field
  useExplicitPromotion = false,
  tag?                  // string – matches article frontmatter 'tags' array
)
```

---

## Utility: `normalizeTag`

Converts any tag string to a URL-safe slug (lowercase, no diacritics, hyphens).

```ts
import { normalizeTag } from '@repo/ui/lib/tagNormalizer';
normalizeTag('Volby & Politika') // → 'volby-politika'
```

---

## Remark Plugins

Used in `articles.ts` MDX pipeline – do not import in client components.

```ts
import { remarkBoxPlugin } from '@repo/ui/lib/remark-box-plugin';
import { remarkFlourishPlugin } from '@repo/ui/lib/remark-flourish-plugin';
```

- **`remarkBoxPlugin`** – transforms ` ```box `, ` ```mediabox `, ` ```infobox ` fences into `<MediaBox>` / `<InfoBox>` MDX elements
- **`remarkFlourishPlugin`** – transforms Flourish `<div>` embeds into `<FlourishEmbed>` MDX elements

---

## Design Conventions

### Do
- Use `brand.6` (`#de1743`) as the primary action/highlight colour
- Use `background.1` for card/paper backgrounds
- Use `background.0` for text that sits on a coloured (`brand`, `brandNavy`, etc.) background
- Use `InfoBox` type semantically: `warning` for caveats, `success` for positive findings, `error` for corrections
- Float / bleed boxes (`right`/`left`, `float="right"`) only when there is enough surrounding text – at least 3–4 paragraphs (they flow-wrap until the element ends)
- Keep `ArticlesSection` titles short (≤ 14 chars) if you want the Arrow decoration

### New-article checklist (`/clanek`)
**0. Before creating the folder: ASK for the URL slug and the rubric.** Never pick them yourself. The slug is `<rubrika>-<YYYY-MM-DD>-<popis>` (e.g. `kontext-2026-08-02-novinar-nema-vyvazovat-ale-overovat`), the rubric is the `filter` value (+ special, e.g. `svobodná-média`). Renaming a published article = 301 in `apps/web/public/_redirects` + fix internal links + regenerate sitemap/llms. Canonical rule: `docs/redakcni-styl/REDAKCNI_MANUAL.md` → *Před založením článku: URL a rubrika*.

Every real article (not a special landing page) should have:
1. **Related-articles block („Doporučujeme") at the end** — `<RelatedArticles slugs={[…]} heading="🔻🔻🔻" />` with 2–4 thematically related articles (group by tags/topic).
2. **A mid-article `<SupportBanner float="left" />`** placed in a text-heavy paragraph (not next to an infographic/chart/table). The full-width end banner is automatic — don't add it by hand.
3. Any side asides (`infobox … right`, „Napsali jsme" `position="right"`, `<Figure side="right">`) use the shared bleed — nothing else to set.
4. The Google „Chci víc DataTimes.cz ve zprávách Googlu" button (`PreferredSource`) is automatic in the byline — nothing to add.

### Don't
- Don't hardcode hex colours in new components – always use theme tokens
- Don't use `brandYellow` / `brandForestGreen` / `brandEmeraldMint` / `brandDeepRed` in new components without design sign-off – they are reserved for future use
- Don't set `fontFamily` manually – it comes from `ThemeProvider`
- Don't use `MediaBox` for semantic content (warnings, corrections) – use `InfoBox` instead
- Don't put `getArticles` or file-system logic in client components (`'use client'`)

---

## Specials – Management and Extension

Specials are themed projects displayed in three places:

| Location | File |
|---|---|
| Homepage carousel | `apps/web/components/frontpage/SpecialsHero.tsx` |
| Landing page `/special` | `apps/web/app/special/page.tsx` |
| Section-specific landing page | `apps/web/app/special/[rubrika]/page.tsx` |

---

### Tile images

Stored in `apps/web/public/images/specials/`. Each special has its own file:

```
apps/web/public/images/specials/
  klima.svg
  investigace.svg
  svobodna-media.svg
  snemovna.svg
  mandaty.svg
  data-pro-budouci-premierku.svg
```

**Rules:**
- SVG or JPG format, ideally a square 1:1 ratio
- The filename must match the `coverImage` value in the tile definition in `SpecialsHero.tsx`
- Files > 256 KB can't be inlined – they must live in `public/` and be referenced via `<img src>`
- The image renders as the tile's full-bleed background, with a dark gradient over the bottom for title legibility

---

### Adding an article to a special (filter)

In the article frontmatter `app/clanek/_articles/[slug]/index.md`, add a value to the `filter` field:

```yaml
filter: ["kontext", "klima"]
```

`filter` is an array – an article can belong to more than one section at once.

**Available filter values and their target** (values stay in Czech – they're literal data, matched against page code):

| Filter value | Landing page |
|---|---|
| `"analýza"` | `/analyzy` |
| `"kontext"` | `/kontext` |
| `"explainer"` | – |
| `"investigace"` | `/special/investigace` |
| `"svobodná-média"` | `/specialy/svobodna-media` (core tags: `média`, `svobodná média`, `nezávislá média`, `nezávislost médií`) |
| `"klima"` | `/special/klima` |

The value must exactly match what the page passes to `getArticles(100, 'klima')`.

---

### Adding a new special – checklist

**1.** Copy the image to `apps/web/public/images/specials/novy-special.svg`

**2.** Add a tile to `SpecialsHero.tsx` (the `TILES` array):
```ts
{
  href: '/special/novy-special',
  title: 'Special title',
  bg: '#color',
  external: false,
  logoType: 'klima',        // fallback icon (used if coverImage is missing)
  coverImage: '/images/specials/novy-special.svg',
},
```

**3.** Add the same tile to `apps/web/app/special/page.tsx` (the `TILES` array)

**4.** Create the landing page by copying `apps/web/app/special/klima/page.tsx`:
- Change the filter: `getArticles(100, 'novy-special')`
- Update `themeColor`, metadata, canonical URL, and OG image

**5.** Tag articles by adding the filter to the frontmatter:
```yaml
filter: ["kontext", "novy-special"]
```

---

### Overview of specials and their technical parameters

| Special | URL | Filter | Color |
|---|---|---|---|
| Data pro budoucí premiérku | `/special/data-pro-budouci-premierku` | own landing page, no filter | `#ff3f30` |
| Svobodná média | `/special/svobodna-media` | `svobodná-média` | `#812840` |
| M & Š investigace | `/special/investigace` | `investigace` | `#351040` |
| Data o klimatu | `/special/klima` | `klima` | `linear-gradient(135deg, #2a3f04, #639e0a)` |
| Sněmovna DataTimes | ext. link | – | `#2f325c` |
| Mandáty.cz | ext. link | – | `linear-gradient(90deg, #f71b4b, #101432)` |

---

### Carousel – technical parameters

Implemented in `SpecialsHero.tsx`, plain CSS scroll-snap + a custom RAF animation (no external library).

| Constant | Value | Description |
|---|---|---|
| `VISIBLE` | `3` | Number of visible tiles |
| `AUTOPLAY_MS` | `6000` | Switch interval (ms) |
| `SCROLL_DURATION` | `700` | Transition animation length (ms) |
| `GAP` | `16` | Gap between tiles (px) |
| `POSITIONS` | `TILES.length - VISIBLE + 1` | Number of dot indicators |

The animation uses `easeInOut` via `requestAnimationFrame` – scroll-snap is temporarily disabled during the animation so it doesn't interrupt the transition.

---

## App-specific differences

| | `apps/web` | `apps/datajournalism.studio` |
|-|------------|------------------------------|
| Font | IBM Plex Serif (body) + IBM Plex Sans (headings) | Work Sans (sans-serif) |
| Article path | `/clanek/[slug]` | `/a/[slug]` |
| Articles dir | `app/clanek/_articles/` | `app/a/_articles/` |
| Matomo siteId | `4` | `5` |
| Date locale | `cs-CZ` | `en-US` |
| ScrollyTelling base | `/clanek/_articles` | `/a/_articles` |

---

## Standard pro mapu světa: `WorldMapViewport`

Sdílený SVG viewport pro mapy světa. Výchozí profil je závazný pro nové celosvětové mapy v obou aplikacích, pokud konkrétní datový příběh nevyžaduje jiný geografický důraz.

```tsx
import {
  WORLD_MAP_DEFAULT_VIEW,
  WORLD_MAP_VIEWPORT,
  WorldMapViewport,
} from '@repo/ui/components/WorldMapViewport';

const [zoom, setZoom] = useState(WORLD_MAP_DEFAULT_VIEW.zoom);
const [offset, setOffset] = useState({ ...WORLD_MAP_DEFAULT_VIEW.offset });
const profile = WORLD_MAP_DEFAULT_VIEW.projection;

const projection = geoNaturalEarth1()
  .rotate([...profile.rotate])
  .scale(profile.scale * zoom)
  .translate([profile.translate.x + offset.x, profile.translate.y + offset.y]);

<WorldMapViewport aria-label="Popis mapy">
  {/* země, datové značky a popisky */}
</WorldMapViewport>;
```

### Výchozí profil

| Parametr | Hodnota | Důvod |
|---|---:|---|
| Projekce | Natural Earth 1 | čitelná celosvětová mapa bez extrémního zkreslení pólů |
| SVG šířka | `960` | společný souřadnicový systém |
| Výřez | `y = 85`, výška `520` | obydlené kontinenty vyplní široký obdélník |
| Základní scale | `190` | referenční měřítko projekce |
| Výchozí zoom | `1.15×` | odstraní nevyužitou plochu |
| Výchozí offset | `x = -69`, `y = -29` | zoom je ukotvený na jihovýchodě a roste na sever a západ |
| Rotace | `[-12, 0]` | vyvážené rozložení Ameriky, Evropy, Asie a Oceánie |

### Pravidla použití

- První pohled musí zachovat Nový Zéland, Austrálii, jih Afriky a jižní okraj Ameriky.
- Antarktida není v prvním pohledu, protože pro běžné socioekonomické a kulturní mapy nepřináší data; zůstává však v geometrii a lze ji odkrýt posunem.
- Volné místo se při výchozím přiblížení využívá směrem na sever a západ. Nezoomovat kolem středu, protože by se ořízl jih a východ.
- Vnější kontejner musí mít `overflow: hidden`; skrytá geografie se nemaže ani neořezává z dat.
- Mapa musí podporovat tažení myší i jedním prstem (`Pointer Events`, `touchAction: 'none'`) a mít omezený posun, aby ji uživatel nemohl zcela ztratit.
- Převod souřadnic ukazatele počítá s `WORLD_MAP_VIEWPORT.top` a `WORLD_MAP_VIEWPORT.height`; nepoužívat rozměry celého původního SVG.
- Projektové barvy, bubliny, popisky, tooltipy a datové vrstvy zůstávají odpovědností konkrétní vizualizace.
