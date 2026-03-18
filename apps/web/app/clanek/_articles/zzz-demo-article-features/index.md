---
title: "Article writing guide: all features"
date: "9999-12-31"
author: "Editorial Team"
excerpt: "Everything you can use when writing an article: text formatting, boxes, charts, timelines, and more. Copy-paste syntax with live examples."
tags: ["guide", "reference"]
promoted: 0
---

> This article is hidden from listings (future date). It is a reference for article authors — you can link to it but it won't appear on the front page or in section lists.

This is your practical guide to every tool available when writing articles. Each section shows the exact text to copy, followed by a live example of what it looks like.

**You don't need to know how to code.** Just copy the pattern you need, paste it into your article, and fill in your content.

---

## Contents

1. [Text formatting](#1-text-formatting)
2. [Tables](#2-tables)
3. [Images](#3-images)
4. [Box — plain neutral style](#4-box--plain-neutral-style)
5. [Info box — typed styles + read more](#5-info-box--typed-styles--read-more)
6. [Flourish charts](#6-flourish-charts)
7. [Any embedded chart or map](#7-any-embedded-chart-or-map)
8. [Party badges](#8-party-badges)
9. [Timeline](#9-timeline)
10. [Scroll-driven story](#10-scroll-driven-story)
11. [Custom interactive piece](#11-custom-interactive-piece)
12. [Related articles](#12-related-articles)
13. [Quick reference](#13-quick-reference)

---

## 1. Text formatting

### Bold, italic, strikethrough, links

```md
**Important:** Voter turnout _increased_ significantly in 2025.

~~This claim was later corrected.~~

[Full results on the Electoral Commission website](https://volby.cz)
```

**Important:** Voter turnout _increased_ significantly in 2025.

~~This claim was later corrected.~~

[Full results on the Electoral Commission website](https://www.mahdalova-skop.cz)

---

### Lists

```md
- First item
- Second item
  - Indented sub-item

1. First step
2. Second step
```

- First item
- Second item
  - Indented sub-item

1. First step
2. Second step

---

### Block quote

Use `>` for quotes from speeches, documents, or statements:

```md
> "The data does not support the government's claim."
> — Ministry of Finance report, March 2025
```

> "The data does not support the government's claim."
> — Ministry of Finance report, March 2025

---

## 2. Tables

Separate columns with `|` and rows with a new line. The second row (dashes) is required.

```md
| Party  | Votes | Seats |
|--------|------:|:-----:|
| ANO    | 27 %  | 105   |
| SPOLU  | 21 %  |  82   |
| Piráti |  8 %  |  22   |
```

| Party  | Votes | Seats |
|--------|------:|:-----:|
| ANO    | 27 %  | 105   |
| SPOLU  | 21 %  |  82   |
| Piráti |  8 %  |  22   |

**Column alignment** (in the dashes row):
- `:---` — left-aligned (default, good for text)
- `---:` — right-aligned (good for numbers)
- `:---:` — centred

### Theme-coloured table rows (JSX)

If you need row backgrounds, use the JSX helpers `<Tr>`, `<Th>`, `<Td>`, and optional `<Swatch>`. They support theme colour tokens like `brand.6` or `background.2`.

```md
<table style={{ width: '100%', borderCollapse: 'collapse' }}>
  <thead>
    <Tr bg="background.2">
      <Th>Example</Th>
      <Th>Token</Th>
      <Th>Note</Th>
    </Tr>
  </thead>
  <tbody>
    <Tr bg="brand.0">
      <Td><Swatch color="brand.6" /></Td>
      <Td><code>brand.6</code></Td>
      <Td>Main brand colour</Td>
    </Tr>
  </tbody>
</table>
```

### CSV-backed tables (`<StyledTable />`)

If your table is long, keep it in a CSV file next to your article and render it with one line.

1. Put a CSV file into your article folder, e.g. `all.csv`.
2. Add a column for row background colours (default column name is `bg-color`). Use values like `brand.0`, `background.2`, or `#RRGGBB`.
3. Embed it:

```md
<StyledTable csvFile="spd.csv" />
```

### Volební kalkulačka table (`<MotionsStancesTable />`)

This is a special interactive table used for Volební kalkulačka-style question sets (shows majority + party positions).

1. Put a JSON file into your article folder, e.g. `data.json`.
2. Embed it:

```md
<MotionsStancesTable dataFile="data.json" />
```

Optional props:

```md
<MotionsStancesTable dataFile="data.json" showTags />
```

```md
<MotionsStancesTable dataFile="data.json" maxHeight="600px" />
```
<MotionsStancesTable dataFile="data.json" showTags maxHeight="250px" />

---

## 3. Images

Place image files in the `images/` subfolder inside your article directory. Reference them by filename only — no full path needed.

```md
![Description of the image](images/chart.webp)
```

To add a caption, follow the image with an italic line:

```md
![Voter turnout by region](images/map.webp)
_Voter turnout by region. Source: Electoral Commission._
```

**Tips:**
- Use `.webp` format when possible (smaller files, faster loading)
- Write a meaningful description in the `[brackets]` — it appears if the image fails to load and helps screen readers
- Captions are optional but recommended for charts and maps

---

## 4. Box — plain neutral style

The plain **box** (` ```box `) is the simplest callout. It uses a neutral warm-toned background — good for source attribution, short context notes, or any content you want to visually set apart without a strong semantic colour.

Write ` ```box ` on its own line, your content, then ` ``` ` on its own line.

````md
```box
Hospodářské noviny (22 July 2024)

Turek says his income figures are still estimates.
[Full article](https://archiv.hn.cz/...)
```
````

To **float it to the right** (sits beside text on desktop, full-width on mobile), add `right` after `box`:

````md
```box right
Short note that floats beside the main text.
[Source link](https://example.com)
```
````

You can also write `infobox` without a type — it is identical to `box`. (`mediabox` also still works as a legacy name.)

**Live example:**

```box
Hospodářské noviny (22. 7. 2024)

Turek o svých příjmech říká, že jsou to zatím jen odhady.
[Celý článek](https://archiv.hn.cz/c7-67344090-1320cc-393457007bcff0e)
```

---

## 5. Info box — typed styles + read more

The **info box** supports five types. The default (`infobox` without a type keyword) is the same neutral style as `box` from section 4. Add a keyword to get a semantic colour:

| Type | Keyword | Use for |
|------|---------|---------|
| *(default)* | *(none)* | Source notes, neutral callouts — same as `box` |
| `info` | `info` | Methodology notes, definitions, neutral context with a blue tint |
| `warning` | `warning` | Data caveats, limitations, things to keep in mind |
| `success` | `success` | Confirmed facts, verified findings, positive outcomes |
| `error` | `error` | Corrections, debunked claims |

````md
```infobox
Box without a type — neutral warm background, same as ```box.
```
````

````md
```infobox warning
⚠️ The data before 2018 is incomplete.
```
````

Add `right` or `left` to float it beside the text:

````md
```infobox warning right
This box will sit to the right of the surrounding text on desktop.
```
````

**Live examples — all types:**

```infobox
**Default** — neutral warm background. Same as using ` ```box `.
```

```infobox info
**Info** — blue tint. Use for methodology, definitions, neutral context.
```

```infobox warning
**Warning** — use for caveats, data limitations, or important notes the reader should keep in mind.
```

```infobox success
**Success** — use for confirmed facts, verified findings, or positive outcomes.
```

```infobox error
**Error** — use for corrections or claims that have been debunked.
```

**Floated example — info box with a table:**

```infobox right
### Voter turnout

| Year | Turnout |
|------|---------|
| 2021 | 65 %    |
| 2025 | 72 %    |

Floats right on desktop. The article text wraps around it. On mobile it becomes full-width automatically.
```

**When to float:** only float boxes when there is enough surrounding text — at least 3–4 paragraphs. Floating a box next to a short paragraph looks awkward.

---

### Read more (collapsible content)

Add `<!-- more -->` inside a box to hide everything after that line behind a "Číst více" button. The reader taps to expand — useful for long methodological notes or background context that would interrupt reading flow.

````md
```infobox
This paragraph is always visible to the reader.

<!-- more -->

This paragraph is hidden on load. It appears after tapping "Číst více".

You can have as many paragraphs after the marker as you like.
```
````

Works with any type and with floats. The marker must be on its own line.

**Live example:**

```infobox info
Tato část je vždy viditelná. Box obsahuje delší metodologickou poznámku — čtenář ji může zobrazit kliknutím.

<!-- more -->

Tato část je skrytá při načtení stránky. Zobrazí se po kliknutí na tlačítko „Číst více".

Lze přidat libovolný počet odstavců za značku. Funguje se všemi typy boxu i s plovoucím umístěním.
```

---

## 6. Flourish charts

For charts published on [Flourish](https://flourish.studio), copy the part of the chart URL after `flourish.studio/` and paste it as the `dataSrc` value:

```md
<FlourishEmbed dataSrc="visualisation/20114452" />
```

The chart URL looks like `https://public.flourish.studio/visualisation/20114452/` — you only need `visualisation/20114452`.

**Live example:**

<FlourishEmbed dataSrc="visualisation/20114452" />

---

## 7. Any embedded chart or map

For Datawrapper, Tableau, Google Maps, or any other embeddable content, paste the `<iframe>` code directly into the article:

```md
<iframe
  src="https://datawrapper.dwcdn.net/XXXXX/1/"
  width="100%"
  height="400"
  frameBorder="0"
  scrolling="no"
></iframe>
```

**Live example (Flourish via iframe):**

<iframe src="https://flo.uri.sh/visualisation/20114452/embed" width="100%" height="400" frameBorder="0" scrolling="no"></iframe>

You can also embed a chart **inside a source box** by nesting it:

````md
```box
<iframe src="https://..." width="100%" height="300" frameBorder="0"></iframe>

Source: Datawrapper / Electoral Commission
```
````

---

## 8. Party badges

Use `<PartyFace>` for inline coloured party name badges. They work in running text or standalone.

```md
<PartyFace party="ANO" size={30} /> ANO gained the most seats.

<PartyFace party="ANO" size={15} text="" /> ANO supports the measure,
while <PartyFace party="Piráti" size={15} text="" /> Piráti oppose it.
```

| Prop | Default | Notes |
|------|---------|-------|
| `party` | — | Party name — sets colour and label automatically |
| `size` | `42` | Size in pixels. Use `30` standalone, `15` inline in text |
| `text` | party label | Override the label. Use `text=""` for icon-only |

**Available parties:**

<PartyFace party="ANO" size={30} /> <PartyFace party="SPD" size={30} /> <PartyFace party="Piráti" size={30} /> <PartyFace party="SPOLU" size={30} /> <PartyFace party="ODS" size={30} /> <PartyFace party="STAN" size={30} /> <PartyFace party="KDU" size={30} /> <PartyFace party="KSČM" size={30} /> <PartyFace party="TOP09" size={30} /> <PartyFace party="Motoristé" size={30} />

`ANO`, `SPD`, `Piráti`, `SPOLU`, `ODS`, `STAN`, `KDU`, `KSČM`, `TOP09`, `Motoristé`

**Icon-only in running text:**

<PartyFace party="ANO" size={15} text="" /> ANO supports the measure, while <PartyFace party="Piráti" size={15} text="" /> Piráti oppose it.

---

## 9. Timeline

A filterable vertical timeline driven by a data file (`timeline.yaml`) that lives in the article folder. Ask a developer to help set up the YAML file — once it exists, you embed it with one line:

```md
<Timeline yamlFile="timeline.yaml" />
```

**Live example** (this article's feature history):

<Timeline yamlFile="timeline.yaml" />

---

### Timeline YAML format

The YAML file controls everything: events, filter buttons, which years are collapsed by default. Here is the full format:

```yaml
title: "Timeline title"
subtitle: "Optional subtitle line below the title"
collapsedYears: [2024]         # years shown collapsed by default

facetGroups:                   # optional — adds filter buttons above the timeline
  - key: topic
    label: "Topic"
    values:
      - key: economy
        label: "Economy"
        color: "brandTeal.3"   # any theme colour (see design demo) or a hex value
        flag: "cz"             # optional: shows a country flag (ISO 3166-1 alpha-2 code)

events:
  - year: 2025
    month: 6
    facets:
      topic: economy           # must match a key defined in facetGroups above
    date: "June 2025"          # displayed date string (free text)
    title: "Event title"
    emoji: "📊"
    summary: "One-line summary shown in the collapsed view."
    description: "Full text shown when the reader expands the event. Supports **markdown**."
    persons:
      - name: "Person Name"
        bio: "Short biography or title"
    link: "https://example.com"
    linkText: "Link label"
    tags: ["🆕 New", "Important"]
```

---

## 10. Scroll-driven story

ScrollyTelling displays a sticky image or chart on one side while the reader scrolls through text steps. It requires a `scrollytelling.yaml` file in the article folder — ask a developer to set it up.

```md
<ScrollyTelling yamlFile="scrollytelling.yaml" />
```

Full guide with a live demo: [zzz-demo-scrollytelling-v1](/clanek/zzz-demo-scrollytelling-v1)

---

## 11. Custom interactive piece

For fully custom interactive pieces — your own JavaScript, CSS, D3 charts — an HTML file can be injected before the article content. Set the filename in the article's frontmatter (the block at the very top of the file):

```yaml
---
htmlInclude: "my-interactive.html"
---
```

The HTML file can contain `<style>` and `<script>` blocks. Any paths to images or data files inside it are automatically rewritten relative to the article folder. Ask a developer if you need this.

---

## 12. Related articles

Use `<RelatedArticles />` to embed a block of recommended articles anywhere in the text. Authors control placement, filtering, and layout entirely through props — no code required.

```md
<RelatedArticles filter="analýza" count={3} />
```

<RelatedArticles filter="analýza" count={3} />

Three built-in presets cover the most common layouts:

| Preset | Layout | Use for |
|--------|--------|---------|
| `cards` (default) | 3 columns, image top | end of article |
| `sidebar` | 1 column, thumbnail left, compact | mid-article break |
| `list` | 1 column, thumbnail left, full detail | podcast or long-form list |

You can also pass `slugs={["slug-one", "slug-two"]}` to show a hand-picked list regardless of category or tag.

Full reference with all options and live examples: [Demo: RelatedArticles — all options](/clanek/zzz-demo-related-articles)

---

## 13. Quick reference

| Feature | Syntax | Notes |
|---------|--------|-------|
| Bold | `**text**` | — |
| Italic | `_text_` | — |
| Link | `[label](https://url)` | — |
| Block quote | `> text` | — |
| Table | `\| col \| col \|` | Second row = dashes |
| Image | `![alt](images/file.webp)` | File goes in `images/` subfolder |
| Box (neutral) | ` ```box ` | Add `right` to float; ` ```infobox` is identical |
| Info box (typed) | ` ```infobox warning ` | Types: *(default)* `info` `warning` `success` `error` |
| Read more | `<!-- more -->` inside any box | Hides content below the marker behind a button |
| Flourish chart | `<FlourishEmbed dataSrc="visualisation/XXXXX" />` | — |
| Any iframe embed | `<iframe src="..." />` | — |
| Party badge | `<PartyFace party="ANO" size={30} />` | Parties: ANO SPD Piráti SPOLU ODS STAN KDU KSČM TOP09 Motoristé |
| Timeline | `<Timeline yamlFile="timeline.yaml" />` | Developer creates YAML |
| ScrollyTelling | `<ScrollyTelling yamlFile="scrollytelling.yaml" />` | Developer creates YAML |
| Custom HTML | `htmlInclude: "file.html"` in frontmatter | Developer creates HTML |
| Related articles | `<RelatedArticles filter="analýza" count={3} />` | See [full demo](/clanek/zzz-demo-related-articles) for all options |
