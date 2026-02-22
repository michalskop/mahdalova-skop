---
title: "Design system: visual reference"
date: "9999-12-31"
author: "Tech Team"
excerpt: "Visual reference for the design system: colour palette, component variants, typography, and conventions. Complements packages/ui/DESIGN.md."
tags: ["guide", "design", "reference"]
promoted: 0
htmlInclude: "swatches.html"
---

> This article is hidden from listings (future date). Visual reference for developers and designers — complements `packages/ui/DESIGN.md` which documents the same system in text form.

All colors are Mantine custom scales (10 shades, index 0–9). The **main shade is always `[6]`** unless noted. Access via `theme.colors.colorName[index]` or Mantine's `c="colorName.6"` shorthand.

The color palette above is injected from `swatches.html` via `htmlInclude`.

---

## InfoBox variants

All five types rendered live. Use the `type` prop in JSX or the fence keyword in markdown articles. `box` and `mediabox` fence names are legacy aliases for the default type.

```infobox
**`default`** (default) — Neutral warm background. Used by ` ```box ` and ` ```infobox ` without a type keyword.
Border: `background[6]` `#e8e8dc` · Background: `background[2]` `#f8f6f0`
```

```infobox info
**`info`** — General notes, methodology, neutral context with a blue tint.
Border: `brandNavy[6]` `#6267a3` · Background: `#f0f1f8`
```

```infobox warning
**`warning`** — Caveats, data limitations, things to keep in mind.
Border: `brandOrange[6]` `#f76800` · Background: `brandOrange[0]` `#fff4eb`
```

```infobox success
**`success`** — Confirmed facts, corrections, positive findings.
Border: `brandTeal[6]` `#0f6c78` · Background: `brandTeal[0]` `#e5f9fc`
```

```infobox error
**`error`** — Corrections, debunked claims, important warnings.
Border: `brand[6]` `#de1743` · Background: `brand[0]` `#fff4f6`
```

**Floated right:**

```infobox warning right
This box floats right on desktop and collapses to full-width on mobile. Only float when surrounded by at least 3–4 paragraphs of text.
```

**Read more (collapsible):**

```infobox
This paragraph is always visible.

<!-- more -->

This paragraph is hidden on load. Place `<!-- more -->` on its own line to fold everything below it behind a "Číst více" button. Works with any type and with floats.
```

---

## Typography

The font is set globally by `ThemeProvider` — do **not** set `fontFamily` on individual components.

| App | Font | Weights |
|-----|------|---------|
| `apps/web` | Roboto Slab (serif) | 400, 500, 600, 700 |
| `apps/datajournalism.studio` | Work Sans (sans-serif) | 400, 500, 600, 700 |

### Heading scale (rendered)

## H2 — Major section heading

### H3 — Sub-section heading

#### H4 — Minor heading

Regular body text. Used at `md` (16px) base size with Mantine's default line-height.

---

## Spacing scale (Mantine defaults)

| Token | ~px | Common use |
|-------|-----|-----------|
| `xs` | 10px | Small gaps, badge top offset |
| `sm` | 12px | Compact padding |
| `md` | 16px | Standard padding, paragraph margins |
| `lg` | 20px | Section gaps |
| `xl` | 24px | Heading top margin |

Container sizes: `size="md"` for article content, `size="lg"` for article grids.

---

## Design conventions

### Do
- Use `brand.6` (`#de1743`) as the primary action/highlight colour
- Use `background.1` for card/Paper backgrounds
- Use `background.0` (white) for text on coloured backgrounds
- Use InfoBox type semantically: `warning` for caveats, `success` for verified facts, `error` for corrections
- Float boxes only when surrounded by at least 3–4 paragraphs of text
- Keep `ArticlesSection` titles short (≤ 14 chars) to get the Arrow decoration

### Don't
- Don't hardcode hex colours in components — always use theme tokens
- Don't use accent colours (`brandYellow`, `brandForestGreen`, `brandEmeraldMint`, `brandDeepRed`) without design sign-off
- Don't set `fontFamily` manually on any component
- Don't use `type="info"` as a generic neutral box — use the default type (no `type` prop / plain ` ```box ` fence)
- Don't use `getArticles` or filesystem logic in client components (`'use client'`)

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

See `packages/ui/DESIGN.md` for the full component catalog with prop signatures and import paths.
