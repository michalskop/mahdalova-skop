# Design System — DataTimes / Mahdalová & Skop

## 1. Visual Theme & Atmosphere

DataTimes is investigative data journalism designed to be read, not scanned. The interface channels the feel of a serious newspaper — authoritative, warm, and unhurried — while remaining entirely at home on a screen. The entire experience is built on a cream-tinted canvas (`#fdfbf7`) that deliberately suggests high-quality newsprint rather than a digital surface. Where most news sites default to stark white-and-black, DataTimes wraps every article in warmth, as if the editors care as much about the reading environment as the reporting itself.

The signature typographic move is **Roboto Slab** — a slab serif with confident proportions that lends every headline the authority of a broadsheet front page. Body text breathes at relaxed line-heights, creating a reading cadence closer to a magazine essay than a social-media feed. For technical and data-analysis outputs where the analytic structure should come forward over the editorial voice, **Work Sans** serves as a clean, functional alternative.

The brand accent is a bold, urgent crimson (`#de1743`) — the red of editorial importance, correction notices, and category badges. It is not the aggressive red of warnings or the cheerful red of consumer brands; it is the red of a newspaper's masthead. All neutral tones carry a warm, creamy undertone — there are no cold blue-grays anywhere in the system. Even the darkest text feels closer to ink on paper than pixels on glass.

**Key Characteristics:**
- Warm cream canvas (`#fdfbf7`) — newsprint feel, not digital white
- Roboto Slab (serif) as primary font for all journalistic outputs; Work Sans (sans) as alternative for technical/data-analysis contexts
- Crimson brand accent (`#de1743`) — the red of editorial authority, not urgency
- Exclusively warm-toned neutrals throughout — cream borders, warm grays, ink-dark text
- Semantic InfoBox system for journalistic callouts (key facts, caveats, corrections, findings)
- Decorative Arrow SVG beside section titles ≤ 14 characters — a masthead-style editorial flourish
- Currently light-mode only — a dark variant is planned but not yet designed or implemented

## 2. Color Palette & Roles

### Primary

- **Crimson Brand** (`#de1743`): The editorial heartbeat of the design — used for links, article headings, tag badges, primary buttons, section titles, and InfoBox error borders. Every high-signal element that demands attention uses this color. It is the red of the masthead.
- **Crimson Hover** (`#c5143c`): The hover state for brand-colored links and interactive elements — slightly deeper, confirming intent.
- **Crimson Active** (`#a81134`): The active/visited state — a darker, more saturated shift that acknowledges the reader has already been there.
- **Crimson Tint** (`#fff4f6`): The lightest wash of the brand color, used as the background for InfoBox error/correction callouts.

### Backgrounds & Surfaces

- **Newsprint** (`#fdfbf7`): The primary page background and card surface — a warm, barely-yellow cream that is the emotional foundation of the entire design. Never substitute pure white here.
- **Ink Wash** (`#f8f6f0`): A slightly cooler cream step — used for table headers, blockquote backgrounds, and Citation components. Creates subtle layering against the Newsprint base without introducing visual noise.
- **Border Cream** (`#e8e8dc`): The standard light border and the border for InfoBox default/neutral callouts. Barely visible; the gentlest possible containment.
- **Pure White** (`#ffffff`): Text colour when placed on coloured (brand, navy, teal) backgrounds. Also the floor of the background scale.

### Semantic Accents

- **Navy Purple** (`#6267a3`): InfoBox 'info' border — conveys context and annotation without alarm. A muted, journalistic purple.
- **Teal** (`#0e839e`): InfoBox 'success' border and the subscribe/CTA button color. Signals positive findings and reader actions.
- **Teal Tint** (`#e5fdfc`): InfoBox 'success' background — the pale wash behind positive findings.
- **Orange** (`#f76800`): InfoBox 'warning' border — for caveats, methodological limitations, and data-quality notes.
- **Orange Tint** (`#fff3e8`): InfoBox 'warning' background.

### Deep Accents

- **Royal Blue** (`#4a51ab`): Primary shade of the deep blue scale — available for structural accents.
- **Midnight** (`#272a59`): Testimonial card and dark-surface backgrounds — a deep blue-navy that reads as near-black while remaining distinctly warm.

### Decorative Palette *(reserve for future use — no new components without design sign-off)*

| Name | Main Hex | Note |
|------|----------|------|
| `brandYellow` | `#ffcf02` | Highlights, decorative accents |
| `brandForestGreen` | `#639e0a` | Nature/environment topics |
| `brandEmeraldMint` | `#12b886` | Alternative success states |
| `brandDeepRed` | `#a03250` | Darker crimson variant |
| `brandCoralRed` | `#e8412c` | Warmer, lighter red variant |
| `brandChocolate` | `#6e4a2c` | Editorial brown |

### Full Scale Reference (10 shades, index 0–9; bold = primary/main shade)

**`brand` (crimson):** `#fff4f6` · `#ffb3c0` · `#ff8099` · `#ff4d70` · `#ff1a4a` · `#f01745` · **`#de1743`** · `#c5143c` · `#a81134` · `#8b0e2b`

**`background` (warm cream):** `#ffffff` · `#fdfbf7` · `#f8f6f0` · `#f3f1e9` · `#eeeae2` · `#e9e9dd` · `#e8e8dc` · `#d4d4c8` · `#c8c8bc` · `#bcbcb0`

**`brandNavy`:** `#e9ecf4` · `#d2d8e9` · `#bcc4df` · `#a6b0d4` · `#8f9dc9` · `#7889be` · **`#6267a3`** · `#4c4f8e` · `#2f325c` · `#101432`

**`brandTeal`:** `#e5fdfc` · `#b8eff6` · `#8cdfef` · `#5fcce6` · `#33b9d9` · `#1a9fbd` · **`#0e839e`** · `#06677d` · `#044d5e` · `#023440`

**`brandOrange`:** `#fff3e8` · `#ffe0c7` · `#ffc89f` · `#fda668` · `#ff934d` · `#ff7f2a` · **`#f76800`** · `#cc5f00` · `#994800` · `#663200`

**`brandRoyalBlue`:** `#e9ebfa` · `#c9d0f5` · `#a9b5f0` · `#899aeb` · `#697fe6` · `#5e66d5` · **`#4a51ab`** · `#383d82` · **`#272a59`** · `#161730`

## 3. Typography Rules

### Font Family

| Role | Font | Style | Weights | Source |
|------|------|-------|---------|--------|
| **Primary** — all journalistic outputs | **Roboto Slab** | Serif | 400 · 500 · 600 · 700 | Google Fonts |
| **Alternative** — technical / data-analysis outputs | **Work Sans** | Sans-serif | 400 · 500 · 600 · 700 | Google Fonts |

```css
/* Primary (journalistic) */
@import url('https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;500;600;700&display=swap');
font-family: 'Roboto Slab', Georgia, serif;

/* Alternative (technical/data) */
@import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&display=swap');
font-family: 'Work Sans', system-ui, sans-serif;
```

*Font should be set globally (body/root level) — avoid overriding it on individual components.*

### Hierarchy

| Role | Size | Weight | Line Height | Notes |
|------|------|--------|-------------|-------|
| Article title (h1) | 2rem+ | 700 | 1.2 | Slab serif broadsheet authority |
| Section heading (h2) | 1.5rem | 600–700 | 1.25 | Category anchors, section breaks |
| Sub-heading (h3) | 1.25rem | 600 | 1.30 | Card titles, feature names |
| Body editorial | 1rem (16px) | 400 | 1.6–1.7 | Article body — generous, readable |
| Body UI | 0.875–1rem | 400–500 | 1.4 | Labels, captions, UI text |
| Tag / Badge | 0.75rem | 500 | 1.0 | Uppercase-optional, letter-spaced |
| Code | 0.875rem | 400 | 1.6 | Monospace; inline and block |

### Principles

- **Slab serif for editorial authority**: Roboto Slab is the default for all journalistic outputs — articles, reports, editorial pages. Work Sans is the deliberate exception for outputs where data structure and technical clarity take precedence over editorial warmth.
- **Relaxed article line-height**: Article body text uses 1.6–1.7 line-height — significantly more open than typical web text. The goal is reading comfort over scan-ability.
- **Crimson for structural emphasis**: Crimson Brand (`#de1743`) is the typographic accent — applied to links, active headings, and category labels. Avoid bold + crimson simultaneously; the color alone carries weight.
- **Set font globally**: Font should be declared at the root/body level and inherited everywhere. Per-component font overrides break typographic consistency.

## 4. Component Stylings

### InfoBox — Journalistic Callout System

The InfoBox is the most distinctive editorial component. It provides five semantic variants for journalistic context: neutral facts, informational context, warnings/caveats, positive findings, and corrections/errors.

**Default (Key Fact)**
- Left border: Border Cream (`#e8e8dc`)
- Background: Ink Wash (`#f8f6f0`)
- Use for: key facts, supporting data, neutral background information

**Info (Context/Annotation)**
- Left border: Navy Purple (`#6267a3`)
- Background: `#f0f1f8` (light navy tint)
- Use for: methodology notes, definitions, contextual annotations

**Warning (Caveat)**
- Left border: Orange (`#f76800`)
- Background: Orange Tint (`#fff3e8`)
- Use for: data limitations, methodological caveats, important qualifications

**Success (Positive Finding)**
- Left border: Teal (`#0e839e`)
- Background: Teal Tint (`#e5fdfc`)
- Use for: confirmed findings, positive outcomes, verified facts

**Error (Correction)**
- Left border: Crimson Brand (`#de1743`)
- Background: Crimson Tint (`#fff4f6`)
- Use for: corrections, critical warnings, significant errors

InfoBox can be floated right (`float="right"`) — only when there are ≥ 3–4 paragraphs of surrounding text. Content after `<!-- more -->` is collapsed behind a "Číst více" / "Read more" toggle.

### Buttons

**Primary Brand**
- Background: Crimson Brand (`#de1743`)
- Text: Pure White (`#ffffff`)
- Use for: primary editorial CTAs, subscribe actions

**Teal Subscribe**
- Background: Teal (`#0e839e`)
- Text: Pure White (`#ffffff`)
- Use for: newsletter/subscription actions

**Default / Neutral**
- Background: light gray (framework default)
- Text: standard dark
- Use for: secondary actions, filters, navigation controls

### Article Cards
- Background: Newsprint (`#fdfbf7`)
- Border/shadow: subtle lift — the card should feel like a paper clipping, not a floating UI panel
- Cover image: full-bleed top, proportional crop
- Tag badges: Crimson Brand (`#de1743`) background, white text
- Date: muted gray, locale-formatted (`cs-CZ` or `en-US`)
- Title: slab serif, links in Crimson Brand
- Hover: title link deepens to Crimson Hover (`#c5143c`)

### ArticlesSection — Colored Section Headers
- Full-width coloured band (typically Crimson Brand `#de1743`, but any brand color works)
- Section title: left-aligned, large serif, Pure White (`#ffffff`) text on coloured background
- Arrow decoration: appears automatically for titles ≤ 14 characters — a narrow SVG arrow in Pure White (`#ffffff`)
- Articles grid: 3-column responsive on the right

### Navigation
- Background: Newsprint (`#fdfbf7`) or white
- Logo / wordmark: Crimson Brand
- Links: standard dark text, Crimson Brand on hover/active
- No sticky nav by default — editorial page rhythm prioritized

### TestimonialCard
- Background: Midnight (`#272a59`) — deep navy that reads as editorial gravitas
- Text: Pure White or warm silver
- Radius: ~8px — consistent with card components

### Citation / Blockquote
- Background: Ink Wash (`#f8f6f0`)
- Left or top accent possible
- Serif font, slightly indented — the voice-of-the-editor moment

## 5. Layout Principles

### Spacing System
- Base unit: 4px — scale in multiples: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 48 · 64 · 80
- Article body padding: ~16px standard
- Section vertical rhythm: generous — sections breathe like newspaper spreads (~48–80px between major sections)
- Container widths: ~720px for article content (reading width), ~1100px for article grids

### Grid
- Article grid: 3 columns on desktop, 2 on tablet, 1 on mobile
- Article content: single column, max ~720px centered — optimized for long-form reading
- Section headers: full-width coloured band + constrained content inside

### Whitespace Philosophy
- **Reading rhythm over density**: DataTimes pages are not dashboards. Each article section breathes with generous vertical margins — readers should feel they have space to think.
- **Serif-driven pacing**: The slab serif headlines establish a slower, more deliberate cadence than sans-serif sites. More whitespace is required to balance the visual weight.
- **Editorial hierarchy**: Clear visual breaks between sections, not continuous scrolling soup. Each section announces itself.

### Border Radius
- Tags / badges: pill-shaped (9999px)
- Cards: ~8px
- Buttons: ~4–8px
- InfoBox: no radius — the flat left border is the defining shape

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (0) | No shadow, no border | Page background, inline text |
| Contained (1) | `1px solid #e8e8dc` (Border Cream) | InfoBox borders, card separators |
| Lifted (2) | Subtle box-shadow (e.g. `0 2px 8px rgba(0,0,0,0.08)`) | Article cards, modal surfaces |
| Prominent (3) | Coloured left border (4px solid) | InfoBox — the primary depth signal |

**Shadow Philosophy**: Elevation in the DataTimes system comes primarily from **background color contrast** (Newsprint → Ink Wash → white) and **coloured left borders** on InfoBox components, not from drop shadows. When shadows do appear on article cards, they are subtle lifts — the card should feel like a clipping from a stack of papers, not a floating UI element.

The InfoBox left-border system is the most distinctive depth signal: a 4px solid left border communicates category and importance without any shadow at all. This is the journalistic equivalent of a sidebar rule in print layout.

## 7. Do's and Don'ts

### Do
- Use Newsprint (`#fdfbf7`) as every page and card background — the warm cream tone is the DataTimes personality
- Use Crimson Brand (`#de1743`) as the sole primary action/highlight color — links, headings, badges, and primary buttons only
- Apply InfoBox types semantically: `warning` for caveats, `success` for findings, `error` for corrections, `info` for context
- Use generous body line-height (1.6–1.7) — the reading experience is the product
- Float InfoBox components only when ≥ 3–4 paragraphs of surrounding text exist
- Keep ArticlesSection titles ≤ 14 characters if you want the Arrow decoration
- Reference CSS custom properties or design tokens — never hardcode hex values in component code
- Use Pure White (`#ffffff`) only for text on coloured backgrounds, never as a page/card background

### Don't
- Don't use pure white (`#ffffff`) as a page background — Newsprint (`#fdfbf7`) is warmer and defines the reading environment
- Don't hardcode hex values in component code — reference CSS custom properties or design tokens
- Don't override font at the component level — set it globally and let it inherit
- Don't use decorative palette colors (`brandYellow`, `brandForestGreen`, `brandEmeraldMint`, `brandDeepRed`, `brandCoralRed`, `brandChocolate`) in new components without design sign-off
- Don't float InfoBox right in short articles — it will collide with surrounding text on narrow viewports
- Don't implement a dark variant yet — it is planned but the color system for dark mode has not been designed

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| xs | < 576px | Single column, stacked everything, compact headings |
| sm | 576–768px | Single column, slightly wider reading area |
| md | 768–992px | 2-column article grids begin |
| lg | 992–1200px | 3-column article grids, full section headers |
| xl | > 1200px | Max container width, full editorial layout |

### Collapsing Strategy
- **Article grids**: 3-column → 2-column → 1-column stacked
- **ArticlesSection**: full-width band maintained at all sizes; grid inside collapses
- **InfoBox float**: float is removed on mobile — all InfoBox become full-width block elements
- **Section titles**: scale proportionally; Arrow decoration persists if title ≤ 14 chars
- **Article body**: single-column always — already optimized for reading width

### Touch Targets
- Buttons: minimum ~16px vertical padding for thumb navigation
- Article cards: full card surface is a touch target, not just the title link
- Tag badges: adequate tap area via padding, not just text size

## 9. Agent Prompt Guide

### Quick Color Reference
- Brand / Primary: "Crimson Brand (`#de1743`)"
- Page Background: "Newsprint (`#fdfbf7`)"
- Card Background: "Newsprint (`#fdfbf7`)"
- Subtle Background: "Ink Wash (`#f8f6f0`)"
- Text on coloured bg: "Pure White (`#ffffff`)"
- Standard border: "Border Cream (`#e8e8dc`)"
- Info accent: "Navy Purple (`#6267a3`)"
- Success accent: "Teal (`#0e839e`)"
- Warning accent: "Orange (`#f76800`)"
- Dark surface: "Midnight (`#272a59`)"

### Example Component Prompts
- "Create an article card on Newsprint (`#fdfbf7`) with a full-bleed cover image, a Crimson Brand (`#de1743`) tag badge in pill shape, a slab serif headline that links in Crimson Brand, and muted gray date metadata. Hover deepens the title to `#c5143c`."
- "Design a section header as a full-width Crimson Brand (`#de1743`) band with Pure White (`#ffffff`) serif title text at large size on the left and a 3-column article grid on the right."
- "Build an InfoBox warning with a 4px solid left border in Orange (`#f76800`), background Orange Tint (`#fff3e8`), no border-radius, and standard body text inside."
- "Create a testimonial card on Midnight (`#272a59`) with Pure White serif headline and warm silver body text, ~8px border-radius."
- "Design a subscribe button using Teal (`#0e839e`) background and Pure White text, 8px border-radius."
- "Create an article body section on Newsprint (`#fdfbf7`) with a single centered column (~720px max), Roboto Slab serif body text at 16px, line-height 1.65. Links in Crimson Brand (`#de1743`). Blockquote uses Ink Wash (`#f8f6f0`) background with a left rule."

### Iteration Guide
1. Always specify which InfoBox type — "InfoBox warning" not "a colored box"
2. Reference color names — "Crimson Brand (`#de1743`)" not "the red"
3. Background is always Newsprint unless it's a dark testimonial surface (Midnight)
4. For text on any coloured background, specify "Pure White (`#ffffff`)" explicitly
5. Primary font is Roboto Slab (journalistic outputs); use Work Sans only when the output is explicitly technical or data-analysis oriented
6. For the Arrow decoration: "show Arrow SVG in Pure White, only if section title is ≤ 14 characters"
7. Dark mode is not yet designed — implement light-mode only for now

---

*Canonical source: color scales in `apps/web/app/providers/ThemeProvider.tsx` · component usage in `packages/ui/DESIGN.md`*
