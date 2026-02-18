---
title: "Article features: quick reference"
date: "9999-12-31"
author: "Tech Team"
excerpt: "Quick-reference guide for every feature available when writing articles: markdown, boxes, embeds, components, and more."
tags: ["guide", "reference", "demo"]
promoted: 0
---

This article is a **living quick-reference** for writing articles. Every feature is shown with the exact syntax you need to copy-paste, followed by a live rendered example.

> **Note:** This article is dated far in the future (9999-12-31) so it never appears in article lists or on the front page. Linked from: [ScrollyTelling demo](/clanek/zzz-demo-scrollytelling-v1).

---

## 1. Basic markdown

Standard GFM markdown works everywhere in articles.

```md
**bold**, _italic_, ~~strikethrough~~

[Link text](https://example.com)

- unordered list
- second item
  - nested item

1. ordered list
2. second item

> Blockquote text
```

**bold**, _italic_, ~~strikethrough~~

[Link text](https://www.mahdalova-skop.cz)

- unordered list
- second item
  - nested item

1. ordered list
2. second item

> Blockquote text

---

## 2. Tables

Standard GFM pipe tables. Alignment via `:---`, `:---:`, `---:`.

```md
| Strana  | Hlasy | Mandáty |
|---------|------:|:-------:|
| ANO     | 27 %  | 105     |
| SPOLU   | 21 %  |  82     |
| Piráti  |  8 %  |  22     |
```

| Strana  | Hlasy | Mandáty |
|---------|------:|:-------:|
| ANO     | 27 %  | 105     |
| SPOLU   | 21 %  |  82     |
| Piráti  |  8 %  |  22     |

---

## 3. Images

Images are served from the `images/` subfolder of the article directory. No full path needed.

```md
![Alt text](images/my-image.webp)
```

For an image with a caption, follow it with an italic line:

```md
![Chart showing results](images/chart.png)
_Caption text goes here._
```

---

## 4. MediaBox — dark quote/source box

Use for **quoted text from external sources**, short context notes, or embeds. Maps to the dark navy box.

Three equivalent fence names — all produce the same result:

````md
```box
Quoted text here. [Source link](https://example.com)
```
````

````md
```mediabox
Same as box. Supports **markdown**, links, and headings.
```
````

With float:

````md
```mediabox right
This box floats right on desktop,
full width on mobile.
```
````

**Live example:**

```box
Hospodářské noviny (22. 7. 2024)

Turek o svých příjmech říká, že jsou to zatím jen odhady.
[Celý článek](https://archiv.hn.cz/c7-67344090-1320cc-393457007bcff0e)
```

---

## 5. InfoBox — light callout box

Use for **contextual data, tables, definitions, or callout notes**. Light background with a coloured left border.

````md
```infobox
Basic info box (type defaults to "info").
```
````

**Types:** `info` (default), `warning`, `success`, `error`

**Float:** add `right` or `left` after the type (or alone)

````md
```infobox warning
⚠️ This will not work without the YAML file.
```
````

````md
```infobox right
Floats right on desktop, full width on mobile.

| Rok  | Účast |
|------|-------|
| 2021 | 65 %  |
| 2025 | 72 %  |
```
````

**Live examples:**

```infobox info
**Info** — default type. Use for neutral context, methodology notes, or definitions.
```

```infobox warning
**Warning** — use for caveats, data limitations, or important notes for the reader.
```

```infobox success
**Success** — use for confirmed facts, corrections, or positive outcomes.
```

```infobox error
**Error** — use for known issues or debunked claims.
```

```infobox right
### Floated infobox

| Rok  | Účast |
|------|-------|
| 2021 | 65 %  |
| 2025 | 72 %  |

This box floats right on desktop. Content wraps around it.
```

On mobile all floated boxes collapse to full width automatically.

---

## 6. Raw iframe embed

Paste Flourish, Datawrapper, or any other embed code directly.

```md
<iframe
  src="https://flo.uri.sh/visualisation/20114452/embed"
  width="100%"
  height="400"
  frameBorder="0"
  scrolling="no"
></iframe>
```

**Live example:**

<iframe src="https://flo.uri.sh/visualisation/20114452/embed" width="100%" height="400" frameBorder="0" scrolling="no"></iframe>

Iframes also work **inside boxes**:

````md
```mediabox
<iframe src="https://flo.uri.sh/visualisation/20114452/embed"
  width="100%" height="300" frameBorder="0"></iframe>
```
````

---

## 7. FlourishEmbed component

Alternative to raw iframes for Flourish. Loads the Flourish embed script automatically. Use `dataSrc` — the part after `flourish.studio/` in the chart URL.

```md
<FlourishEmbed dataSrc="visualisation/20114452" />
```

**Live example:**

<FlourishEmbed dataSrc="visualisation/20114452" />

---

## 8. PartyFace

Inline coloured badge for Czech and European Parliament parties. Use directly in running text.

```md
<PartyFace party="ANO" size={15} text="" /> ANO is the largest party.

<PartyFace party="ANO" size={30} /> with default label
```

**Available parties:** `ANO`, `SPD`, `Piráti`, `SPOLU`, `ODS`, `STAN`, `KDU`, `KSČM`, `TOP09`, `Motoristé`

**Props:**

| Prop | Default | Notes |
|------|---------|-------|
| `party` | — | preset name, sets colour + label |
| `size` | `42` | px, controls badge size |
| `text` | preset label | override display text; `""` for icon only |
| `color` | — | custom hex, if no `party` preset |

**Live examples:**

<PartyFace party="ANO" size={30} /> <PartyFace party="SPD" size={30} /> <PartyFace party="Piráti" size={30} /> <PartyFace party="SPOLU" size={30} /> <PartyFace party="ODS" size={30} /> <PartyFace party="STAN" size={30} /> <PartyFace party="KDU" size={30} /> <PartyFace party="KSČM" size={30} /> <PartyFace party="TOP09" size={30} /> <PartyFace party="Motoristé" size={30} />

Using `text=""` gives icon-only badges for inline use:

<PartyFace party="ANO" size={15} text="" /> ANO supports the measure, while <PartyFace party="Piráti" size={15} text="" /> Piráti oppose it.

---

## 9. Timeline

Filterable vertical timeline driven by a YAML file in the article directory.

```md
<Timeline yamlFile="timeline.yaml" />
```

**YAML structure:**

```yaml
title: "Timeline title"
subtitle: "Optional subtitle"
collapsedYears: [2024]       # years collapsed by default

facetGroups:                 # optional filter groups
  - key: topic
    label: "Topic"
    values:
      - key: projects
        label: "Projects"
        color: "brandTeal.3"  # theme colour or hex
        flag: "cz"            # optional: country flag code

events:
  - year: 2025
    month: 6
    facets:
      topic: projects
    date: "June 2025"        # display string
    title: "Event title"
    emoji: "📊"
    summary: "One-line summary shown in collapsed view."
    description: "Full text shown on expand."
    persons:
      - name: "Person Name"
        bio: "Short bio"
    link: "https://example.com"
    linkText: "Link label"
    tags: ["🆕 Tag"]
```

**Live example** (shows features added to this codebase):

<Timeline yamlFile="timeline.yaml" />

---

## 10. ScrollyTelling

Scroll-driven narrative with images and iframes. Requires a separate `scrollytelling.yaml` file.

```md
<ScrollyTelling yamlFile="scrollytelling.yaml" />
```

See the full guide with a live demo: [zzz-demo-scrollytelling-v1](/clanek/zzz-demo-scrollytelling-v1)

---

## 11. Raw HTML file (htmlInclude)

For complex interactive pieces (custom JS, CSS, D3, etc.) that cannot be expressed in MDX. The HTML file is loaded from the article directory and injected before the MDX content.

Set in frontmatter:

```yaml
---
htmlInclude: "my-interactive.html"
---
```

The HTML file can include `<style>` and `<script>` tags. Asset paths (images, data files) in the HTML are automatically rewritten relative to the article directory.

---

## Feature summary

| Feature | Syntax | Import needed? |
|---------|--------|:---:|
| MediaBox | ` ```box ` / ` ```mediabox ` | No |
| InfoBox | ` ```infobox ` | No |
| Raw iframe | `<iframe ...>` | No |
| FlourishEmbed | `<FlourishEmbed dataSrc="..." />` | No |
| PartyFace | `<PartyFace party="..." />` | No |
| Timeline | `<Timeline yamlFile="..." />` | No |
| ScrollyTelling | `<ScrollyTelling yamlFile="..." />` | No |
| Raw HTML | `htmlInclude:` in frontmatter | No |
