# Design System Reference

Shared design system for **mahdalova-skop** (apps/web) and **datajournalism.studio** (apps/datajournalism.studio).
All shared components live in `packages/ui/src/`. Both apps consume them via `@repo/ui`.

---

## Typography

| App | Font | Weights |
|-----|------|---------|
| `apps/web` | Roboto Slab (serif) | 400, 500, 600, 700 |
| `apps/datajournalism.studio` | Work Sans (sans-serif) | 400, 500, 600, 700 |

Font is set globally via `ThemeProvider` in each app. Do not set `fontFamily` on individual components — it inherits automatically.

---

## Color Tokens

All colors are Mantine custom color scales (10 shades, index 0–9). The **main shade** is always index `[6]` unless noted. Access via `theme.colors.colorName[index]` in components or `c="colorName.6"` in Mantine props.

### `brand` — Primary crimson red

| Index | Hex | Use |
|-------|-----|-----|
| [0] | `#fff4f6` | InfoBox 'error' background |
| [6] | `#de1743` | **Default** — links, headings, tag badges, Arrow, section titles, InfoBox 'error' border |
| [7] | `#c5143c` | Hover state for brand links |
| [8] | `#a81134` | Active/visited state for brand links |

```tsx
// Examples
c="brand.6"
gradient={{ from: theme.colors.brand[3], to: theme.colors.brand[8] }}  // article card badge
color={theme.colors.brand[6]}  // Arrow SVG
```

### `background` — Warm off-white page scale

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

### `brandNavy` — Navy purple

| Index | Hex | Use |
|-------|-----|-----|
| [6] | `#6267a3` | InfoBox 'info' border |

### `brandTeal` — Teal green

| Index | Hex | Use |
|-------|-----|-----|
| [0] | `#e5f9fc` | InfoBox 'success' background |
| [6] | `#0f6c78` | InfoBox 'success' border, SubscribeHH button (`color="teal"`) |

### `brandOrange` — Orange

| Index | Hex | Use |
|-------|-----|-----|
| [0] | `#fff4eb` | InfoBox 'warning' background |
| [6] | `#f76800` | InfoBox 'warning' border |

### `brandRoyalBlue` — Deep blue

| Index | Hex | Use |
|-------|-----|-----|
| [6] | `#4a51ab` | Main shade |
| [8] | `#272a59` | TestimonialCard background (`bg="brandRoyalBlue.8"`) |

### Accent colors (decorative, not yet used in components)

| Token | Main [6] | Notes |
|-------|----------|-------|
| `brandYellow` | `#ffcf02` | Highlights |
| `brandForestGreen` | `#639e0a` | Nature/environment topics |
| `brandEmeraldMint` | `#12b886` | Available for success states |
| `brandDeepRed` | `#a03250` | Darker crimson variant |

---

## Spacing & Sizing

Mantine's default spacing scale is used throughout. Common values:

| Prop value | Approx px | Use |
|------------|-----------|-----|
| `xs` | 10px | Small gaps, badge top offset |
| `sm` | 12px | — |
| `md` | 16px | Standard padding, paragraph margins |
| `lg` | 20px | Section gaps |
| `xl` | 24px | Heading top margin |

Container sizes: `size="md"` for article content, `size="lg"` for article grids.

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

**In markdown articles** — use code fences:
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

**"Read more" — fold content with `<!-- more -->`:**
````md
```infobox
This paragraph is always visible.

<!-- more -->

This paragraph is hidden until the reader taps "Číst více".
```
````

Props: `type`, `float`, `readMoreAt` (set by the remark plugin — do not set manually), `readMoreLabel`, `readLessLabel`.

---

### `FlourishEmbed`
Embeds a Flourish data visualisation.

```tsx
import { FlourishEmbed } from '@repo/ui/components/FlourishEmbed';

<FlourishEmbed dataSrc="visualisation/1234567" />
```

**In markdown articles** — paste the Flourish embed div directly; `remarkFlourishPlugin` converts it automatically:
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
// In apps/web — already wrapped, just use:
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

## Utility: `getArticles`

Server-side function (Node.js only — use in `page.tsx`, never in client components).

```ts
// apps/web wrapper (already configured):
import { getArticles } from '@/components/common/getArticles';
const articles = await getArticles(9, 'analyzy');

// Parameters:
getArticles(
  limit = 9,
  filter?,              // string | string[] — matches article frontmatter 'filter' field
  useExplicitPromotion = false,
  tag?                  // string — matches article frontmatter 'tags' array
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

Used in `articles.ts` MDX pipeline — do not import in client components.

```ts
import { remarkBoxPlugin } from '@repo/ui/lib/remark-box-plugin';
import { remarkFlourishPlugin } from '@repo/ui/lib/remark-flourish-plugin';
```

- **`remarkBoxPlugin`** — transforms ` ```box `, ` ```mediabox `, ` ```infobox ` fences into `<MediaBox>` / `<InfoBox>` MDX elements
- **`remarkFlourishPlugin`** — transforms Flourish `<div>` embeds into `<FlourishEmbed>` MDX elements

---

## Design Conventions

### Do
- Use `brand.6` (`#de1743`) as the primary action/highlight colour
- Use `background.1` for card/paper backgrounds
- Use `background.0` for text that sits on a coloured (`brand`, `brandNavy`, etc.) background
- Use `InfoBox` type semantically: `warning` for caveats, `success` for positive findings, `error` for corrections
- Float boxes (`float="right"`) only when there is enough surrounding text — at least 3–4 paragraphs
- Keep `ArticlesSection` titles short (≤ 14 chars) if you want the Arrow decoration

### Don't
- Don't hardcode hex colours in new components — always use theme tokens
- Don't use `brandYellow` / `brandForestGreen` / `brandEmeraldMint` / `brandDeepRed` in new components without design sign-off — they are reserved for future use
- Don't set `fontFamily` manually — it comes from `ThemeProvider`
- Don't use `MediaBox` for semantic content (warnings, corrections) — use `InfoBox` instead
- Don't put `getArticles` or file-system logic in client components (`'use client'`)

---

## App-specific differences

| | `apps/web` | `apps/datajournalism.studio` |
|-|------------|------------------------------|
| Font | Roboto Slab (serif) | Work Sans (sans-serif) |
| Article path | `/clanek/[slug]` | `/a/[slug]` |
| Articles dir | `app/clanek/_articles/` | `app/a/_articles/` |
| Matomo siteId | `4` | `5` |
| Date locale | `cs-CZ` | `en-US` |
| ScrollyTelling base | `/clanek/_articles` | `/a/_articles` |
