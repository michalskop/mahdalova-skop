---
title: "Demo: RelatedArticles — all options"
date: "9999-12-31"
author: "Editorial Team"
excerpt: "Full reference for the RelatedArticles component: presets, sorting, image position, author and date visibility, filtering by category or tag, and hard-coded slug lists."
tags: ["guide", "reference", "demo"]
promoted: 0
---

> This article is hidden from listings (future date). It is a full reference for the **RelatedArticles** component. For a quick introduction see the [article writing guide](/clanek/zzz-demo-article-features).

The `<RelatedArticles />` component lets authors place a block of recommended articles anywhere inside an article. It draws from a pre-fetched pool, filters and sorts on the client side, and renders nothing at all if no articles match.

---

## 1. Presets

A preset sets all layout and visibility defaults at once. Individual props always override the preset.

### `cards` (default) — 3 columns, image on top

```mdx
<RelatedArticles filter="analýza" count={3} />
```

<RelatedArticles filter="analýza" count={3} />

---

### `sidebar` — 1 column, thumbnail left, no excerpt

```mdx
<RelatedArticles filter="kontext" preset="sidebar" count={4} />
```

<RelatedArticles filter="kontext" preset="sidebar" count={4} />

---

### `list` — 1 column, thumbnail left, everything visible

```mdx
<RelatedArticles filter="analýza" preset="list" count={3} />
```

<RelatedArticles filter="analýza" preset="list" count={3} />

---

## 2. Sorting (`sort`)

### `sort="default"` — by score (promotion + recency decay)

```mdx
<RelatedArticles filter="analýza" count={4} sort="default" heading="Sort: default (score)" />
```

<RelatedArticles filter="analýza" count={4} sort="default" heading="Sort: default (score)" />

---

### `sort="newest"` — newest article first

```mdx
<RelatedArticles filter="analýza" count={4} sort="newest" heading="Sort: newest first" />
```

<RelatedArticles filter="analýza" count={4} sort="newest" heading="Sort: newest first" />

---

## 3. Image position (`imagePosition`)

### `imagePosition="top"`

```mdx
<RelatedArticles filter="analýza" preset="sidebar" imagePosition="top" count={3} heading="Image: top" />
```

<RelatedArticles filter="analýza" preset="sidebar" imagePosition="top" count={3} heading="Image: top" />

---

### `imagePosition="left"`

```mdx
<RelatedArticles filter="analýza" imagePosition="left" count={3} heading="Image: left" />
```

<RelatedArticles filter="analýza" imagePosition="left" count={3} heading="Image: left" />

---

### `imagePosition="right"`

```mdx
<RelatedArticles filter="analýza" imagePosition="right" count={3} heading="Image: right" />
```

<RelatedArticles filter="analýza" imagePosition="right" count={3} heading="Image: right" />

---

### `imagePosition="none"` — no image

```mdx
<RelatedArticles filter="analýza" imagePosition="none" count={3} heading="Image: hidden" />
```

<RelatedArticles filter="analýza" imagePosition="none" count={3} heading="Image: hidden" />

---

## 4. Author visibility (`showAuthor`)

### `showAuthor={true}`

```mdx
<RelatedArticles filter="analýza" showAuthor={true} count={3} heading="Author: visible" />
```

<RelatedArticles filter="analýza" showAuthor={true} count={3} heading="Author: visible" />

---

### `showAuthor={false}`

```mdx
<RelatedArticles filter="analýza" showAuthor={false} count={3} heading="Author: hidden" />
```

<RelatedArticles filter="analýza" showAuthor={false} count={3} heading="Author: hidden" />

---

## 5. Publication date (`showDate`)

### `showDate={true}`

```mdx
<RelatedArticles filter="analýza" showDate={true} count={3} heading="Date: visible" />
```

<RelatedArticles filter="analýza" showDate={true} count={3} heading="Date: visible" />

---

### `showDate={false}`

```mdx
<RelatedArticles filter="analýza" showDate={false} count={3} heading="Date: hidden" />
```

<RelatedArticles filter="analýza" showDate={false} count={3} heading="Date: hidden" />

---

## 6. Hard-coded slug list (`slugs`)

Bypasses all filtering — displays exactly the articles listed, in the given order.

```mdx
<RelatedArticles
  slugs={[
    "analyza-2025-03-08-zeny-v-politice-cim-vyse-tim-mene-zen",
    "analyza-2025-03-04-trumpova-obchodni-valka",
    "analyza-2024-10-17-za-sevcika-se-rekordne-propadl-zajem-uchazecu-o-studium",
  ]}
  heading="Selected analyses (fixed list)"
/>
```

<RelatedArticles
  slugs={[
    "analyza-2025-03-08-zeny-v-politice-cim-vyse-tim-mene-zen",
    "analyza-2025-03-04-trumpova-obchodni-valka",
    "analyza-2024-10-17-za-sevcika-se-rekordne-propadl-zajem-uchazecu-o-studium",
  ]}
  heading="Selected analyses (fixed list)"
/>

> When `slugs` is provided, the `filter`, `tag`, and `sort` props are ignored.

---

## 7. No heading

Pass `heading={false}` to suppress the heading and its divider line entirely — useful when embedding the block in a context that already has its own title.

```mdx
<RelatedArticles filter="analýza" count={3} heading={false} />
```

<RelatedArticles filter="analýza" count={3} heading={false} />

---

## 8. Filtering

### Array of filters — match any category

```mdx
<RelatedArticles filter={["analýza", "explainer"]} count={4} heading="Analyses and explainers" />
```

<RelatedArticles filter={["analýza", "explainer"]} count={4} heading="Analyses and explainers" />

---

### Filter by tag

```mdx
<RelatedArticles tag="Europarlament" count={4} heading="European Parliament" />
```

<RelatedArticles tag="Europarlament" count={4} heading="European Parliament" />

---

## 9. No match — nothing renders

When no article in the pool matches the filter, the component renders nothing — not even the heading.

```mdx
<RelatedArticles filter="nonexistent-category" count={3} />
```

<RelatedArticles filter="nonexistent-category" count={3} />

_(Nothing above — correct behaviour.)_

---

## All parameters

| Parameter | Type | Default | Values | Description |
|-----------|------|---------|--------|-------------|
| `slugs` | `string[]` | — | array of slug strings | Hard-coded article list in given order; overrides `filter`, `tag`, and `sort` |
| `filter` | `string \| string[]` | — | any `filter` frontmatter value | Filter pool by article category |
| `tag` | `string` | — | any tag | Filter pool by tag |
| `count` | `number` | `4` | positive integer | Maximum number of articles to show |
| `heading` | `string \| false` | `"Čtěte dál"` | any text, or `false` | Section heading; `false` hides the heading and divider |
| `sort` | `string` | `"default"` | `"default"` `"newest"` | Sort order: score (promotion + recency) or newest first |
| `preset` | `string` | `"cards"` | `"cards"` `"sidebar"` `"list"` | Layout preset — sets all defaults at once |
| `columns` | `number` | by preset | `1` `2` `3` `4` | Number of columns |
| `imagePosition` | `string` | by preset | `"top"` `"left"` `"right"` `"none"` | Thumbnail position |
| `cardBackground` | `string` | by preset | `"white"` `"cream"` `"transparent"` | Card background colour |
| `titleSize` | `string` | by preset | `"xs"` `"sm"` `"md"` `"lg"` `"xl"` | Card title size |
| `showImage` | `boolean` | by preset | `true` `false` | Show thumbnail image |
| `showAuthor` | `boolean` | by preset | `true` `false` | Show author name |
| `showDate` | `boolean` | by preset | `true` `false` | Show publication date |
| `showExcerpt` | `boolean` | by preset | `true` `false` | Show article excerpt |
| `showReadingTime` | `boolean` | by preset | `true` `false` | Show estimated reading time |
| `showFormatBadge` | `boolean` | by preset | `true` `false` | Show category badge |
| `showTopicBadge` | `boolean` | by preset | `true` `false` | Show topic/series badge |
| `showEmbed` | `boolean` | by preset | `true` `false` | Show embedded player (podcasts) |

### Preset defaults

| Parameter | `cards` | `sidebar` | `list` |
|-----------|---------|-----------|--------|
| `columns` | `3` | `1` | `1` |
| `imagePosition` | `"top"` | `"left"` | `"left"` |
| `cardBackground` | `"white"` | `"transparent"` | `"white"` |
| `titleSize` | `"md"` | `"sm"` | `"lg"` |
| `showImage` | `true` | `true` | `true` |
| `showAuthor` | `true` | `false` | `true` |
| `showDate` | `true` | `true` | `true` |
| `showExcerpt` | `true` | `false` | `true` |
| `showReadingTime` | `false` | `false` | `true` |
| `showFormatBadge` | `true` | `true` | `true` |
| `showTopicBadge` | `false` | `false` | `true` |
| `showEmbed` | `false` | `false` | `false` |
