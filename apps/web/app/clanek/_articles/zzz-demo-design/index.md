---
title: "Design system: visual reference"
date: "9999-12-31"
author: "Tech Team"
excerpt: "Visual reference for the design system: colour palette, component variants, typography, and conventions. Complements packages/ui/DESIGN.md."
tags: ["guide", "design", "reference"]
promoted: 0
---

> This article is hidden from listings (future date). It is a visual reference for developers and designers — complements `packages/ui/DESIGN.md` which documents the same system in text form.

All colors are Mantine custom scales (10 shades, index 0–9). Access via `theme.colors.colorName[index]` or Mantine's `c="colorName.6"` shorthand. The **main shade is always `[6]`** unless noted below.

---

## Color palette

### `brand` — Primary crimson red

<div style="display:flex;gap:4px;flex-wrap:wrap;margin:12px 0 4px">
  <div style="text-align:center"><div style="width:56px;height:48px;background:#fff4f6;border:1px solid #eee;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[0]</div><div style="font-size:10px;color:#999">#fff4f6</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#ffb3c0;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[1]</div><div style="font-size:10px;color:#999">#ffb3c0</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#ff8099;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[2]</div><div style="font-size:10px;color:#999">#ff8099</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#ff4d70;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[3]</div><div style="font-size:10px;color:#999">#ff4d70</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#ff1a4a;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[4]</div><div style="font-size:10px;color:#999">#ff1a4a</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#f01745;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[5]</div><div style="font-size:10px;color:#999">#f01745</div></div>
  <div style="text-align:center;position:relative"><div style="width:56px;height:48px;background:#de1743;border-radius:4px;outline:2px solid #333;outline-offset:2px"></div><div style="font-size:11px;margin-top:5px;color:#333;font-weight:700">[6] ★</div><div style="font-size:10px;color:#999">#de1743</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#c5143c;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[7]</div><div style="font-size:10px;color:#999">#c5143c</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#a81134;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[8]</div><div style="font-size:10px;color:#999">#a81134</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#8b0e2b;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[9]</div><div style="font-size:10px;color:#999">#8b0e2b</div></div>
</div>

| Index | Hex | Use |
|-------|-----|-----|
| [0] | `#fff4f6` | InfoBox `error` background |
| [6] | `#de1743` | **Main** — links, headings, tag badges, Arrow, section titles, InfoBox `error` border |
| [7] | `#c5143c` | Hover state for brand links |
| [8] | `#a81134` | Active/visited state for brand links |

---

### `background` — Warm off-white page scale

<div style="display:flex;gap:4px;flex-wrap:wrap;margin:12px 0 4px">
  <div style="text-align:center"><div style="width:56px;height:48px;background:#ffffff;border:1px solid #eee;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[0]</div><div style="font-size:10px;color:#999">#ffffff</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#fdfbf7;border:1px solid #eee;border-radius:4px;outline:2px solid #333;outline-offset:2px"></div><div style="font-size:11px;margin-top:5px;color:#333;font-weight:700">[1] ★</div><div style="font-size:10px;color:#999">#fdfbf7</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#f8f6f0;border:1px solid #eee;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[2]</div><div style="font-size:10px;color:#999">#f8f6f0</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#f3f1e9;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[3]</div><div style="font-size:10px;color:#999">#f3f1e9</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#eeeae2;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[4]</div><div style="font-size:10px;color:#999">#eeeae2</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#e9e9dd;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[5]</div><div style="font-size:10px;color:#999">#e9e9dd</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#e8e8dc;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[6]</div><div style="font-size:10px;color:#999">#e8e8dc</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#d4d4c8;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[7]</div><div style="font-size:10px;color:#999">#d4d4c8</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#c8c8bc;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[8]</div><div style="font-size:10px;color:#999">#c8c8bc</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#bcbcb0;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[9]</div><div style="font-size:10px;color:#999">#bcbcb0</div></div>
</div>

| Index | Hex | Use |
|-------|-----|-----|
| [0] | `#ffffff` | Text on dark/coloured backgrounds (`c="background.0"`) |
| [1] | `#fdfbf7` | **Main** — page background, Paper/card background |
| [2] | `#f8f6f0` | Table headers, blockquote (Citation) background |

---

### `brandNavy` — Navy purple

<div style="display:flex;gap:4px;flex-wrap:wrap;margin:12px 0 4px">
  <div style="text-align:center"><div style="width:56px;height:48px;background:#e9ecf4;border:1px solid #eee;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[0]</div><div style="font-size:10px;color:#999">#e9ecf4</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#d2d8e9;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[1]</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#bcc4df;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[2]</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#a6b0d4;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[3]</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#8f9dc9;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[4]</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#7889be;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[5]</div></div>
  <div style="text-align:center;position:relative"><div style="width:56px;height:48px;background:#6267a3;border-radius:4px;outline:2px solid #333;outline-offset:2px"></div><div style="font-size:11px;margin-top:5px;color:#333;font-weight:700">[6] ★</div><div style="font-size:10px;color:#999">#6267a3</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#4c4f8e;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[7]</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#2f325c;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[8]</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#101432;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[9]</div></div>
</div>

| Index | Hex | Use |
|-------|-----|-----|
| [6] | `#6267a3` | MediaBox background (light mode), InfoBox `info` border |

---

### `brandTeal` — Teal green

<div style="display:flex;gap:4px;flex-wrap:wrap;margin:12px 0 4px">
  <div style="text-align:center"><div style="width:56px;height:48px;background:#e5f9fc;border:1px solid #eee;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[0]</div><div style="font-size:10px;color:#999">#e5f9fc</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#b8eff6;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[1]</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#8cdfef;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[2]</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#5fcce6;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[3]</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#33b9d9;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[4]</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#1a9fbd;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[5]</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#0f6c78;border-radius:4px;outline:2px solid #333;outline-offset:2px"></div><div style="font-size:11px;margin-top:5px;color:#333;font-weight:700">[6] ★</div><div style="font-size:10px;color:#999">#0f6c78</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#0b5964;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[7]</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#084650;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[8]</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#06333c;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[9]</div></div>
</div>

| Index | Hex | Use |
|-------|-----|-----|
| [0] | `#e5f9fc` | InfoBox `success` background |
| [6] | `#0f6c78` | InfoBox `success` border, SubscribeHH button |

---

### `brandOrange` — Orange

<div style="display:flex;gap:4px;flex-wrap:wrap;margin:12px 0 4px">
  <div style="text-align:center"><div style="width:56px;height:48px;background:#fff4eb;border:1px solid #eee;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[0]</div><div style="font-size:10px;color:#999">#fff4eb</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#ffe4cc;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[1]</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#ffd4b3;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[2]</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#ffb380;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[3]</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#ff934d;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[4]</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#ff7519;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[5]</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#f76800;border-radius:4px;outline:2px solid #333;outline-offset:2px"></div><div style="font-size:11px;margin-top:5px;color:#333;font-weight:700">[6] ★</div><div style="font-size:10px;color:#999">#f76800</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#c55300;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[7]</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#ac4800;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[8]</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#933e00;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[9]</div></div>
</div>

| Index | Hex | Use |
|-------|-----|-----|
| [0] | `#fff4eb` | InfoBox `warning` background |
| [6] | `#f76800` | InfoBox `warning` border |

---

### `brandRoyalBlue` — Deep blue

<div style="display:flex;gap:4px;flex-wrap:wrap;margin:12px 0 4px">
  <div style="text-align:center"><div style="width:56px;height:48px;background:#e9ebfa;border:1px solid #eee;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[0]</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#c9d0f5;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[1]</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#a9b5f0;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[2]</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#899aeb;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[3]</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#697fe6;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[4]</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#5e66d5;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[5]</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#4a51ab;border-radius:4px;outline:2px solid #333;outline-offset:2px"></div><div style="font-size:11px;margin-top:5px;color:#333;font-weight:700">[6] ★</div><div style="font-size:10px;color:#999">#4a51ab</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#383d82;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[7]</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#272a59;border-radius:4px"></div><div style="font-size:11px;margin-top:5px;color:#333;font-weight:700">[8]</div><div style="font-size:10px;color:#999">#272a59</div></div>
  <div style="text-align:center"><div style="width:56px;height:48px;background:#161730;border-radius:4px"></div><div style="font-size:11px;margin-top:3px;color:#666">[9]</div></div>
</div>

| Index | Hex | Use |
|-------|-----|-----|
| [6] | `#4a51ab` | Main shade |
| [8] | `#272a59` | TestimonialCard background |

---

### Accent colours — decorative, not yet used in components

Do not use these in new components without design sign-off.

<div style="display:flex;gap:16px;flex-wrap:wrap;margin:12px 0">
  <div>
    <div style="font-size:12px;font-weight:600;margin-bottom:4px">brandYellow</div>
    <div style="display:flex;gap:3px">
      <div style="width:28px;height:28px;background:#fffdf0;border:1px solid #eee;border-radius:3px" title="[0]"></div>
      <div style="width:28px;height:28px;background:#fff7d9;border-radius:3px" title="[1]"></div>
      <div style="width:28px;height:28px;background:#fff0b3;border-radius:3px" title="[2]"></div>
      <div style="width:28px;height:28px;background:#ffe680;border-radius:3px" title="[3]"></div>
      <div style="width:28px;height:28px;background:#ffdc33;border-radius:3px" title="[4]"></div>
      <div style="width:28px;height:28px;background:#ffd519;border-radius:3px" title="[5]"></div>
      <div style="width:28px;height:28px;background:#ffcf02;border-radius:3px;outline:2px solid #333;outline-offset:1px" title="[6] #ffcf02"></div>
      <div style="width:28px;height:28px;background:#d6a404;border-radius:3px" title="[7]"></div>
      <div style="width:28px;height:28px;background:#bd9103;border-radius:3px" title="[8]"></div>
      <div style="width:28px;height:28px;background:#a47d03;border-radius:3px" title="[9]"></div>
    </div>
    <div style="font-size:10px;color:#999;margin-top:2px">[6] #ffcf02</div>
  </div>
  <div>
    <div style="font-size:12px;font-weight:600;margin-bottom:4px">brandForestGreen</div>
    <div style="display:flex;gap:3px">
      <div style="width:28px;height:28px;background:#eaf7d6;border:1px solid #eee;border-radius:3px"></div>
      <div style="width:28px;height:28px;background:#cbeab1;border-radius:3px"></div>
      <div style="width:28px;height:28px;background:#acde8b;border-radius:3px"></div>
      <div style="width:28px;height:28px;background:#8dd265;border-radius:3px"></div>
      <div style="width:28px;height:28px;background:#6ec53f;border-radius:3px"></div>
      <div style="width:28px;height:28px;background:#639e0a;border-radius:3px;outline:2px solid #333;outline-offset:1px"></div>
      <div style="width:28px;height:28px;background:#507e08;border-radius:3px"></div>
      <div style="width:28px;height:28px;background:#3d5f06;border-radius:3px"></div>
      <div style="width:28px;height:28px;background:#2a3f04;border-radius:3px"></div>
      <div style="width:28px;height:28px;background:#172002;border-radius:3px"></div>
    </div>
    <div style="font-size:10px;color:#999;margin-top:2px">[6] #639e0a</div>
  </div>
  <div>
    <div style="font-size:12px;font-weight:600;margin-bottom:4px">brandEmeraldMint</div>
    <div style="display:flex;gap:3px">
      <div style="width:28px;height:28px;background:#e8f9f4;border:1px solid #eee;border-radius:3px"></div>
      <div style="width:28px;height:28px;background:#c2f0e4;border-radius:3px"></div>
      <div style="width:28px;height:28px;background:#9be8d4;border-radius:3px"></div>
      <div style="width:28px;height:28px;background:#75dfc4;border-radius:3px"></div>
      <div style="width:28px;height:28px;background:#4fd6b4;border-radius:3px"></div>
      <div style="width:28px;height:28px;background:#12b886;border-radius:3px;outline:2px solid #333;outline-offset:1px"></div>
      <div style="width:28px;height:28px;background:#0e926a;border-radius:3px"></div>
      <div style="width:28px;height:28px;background:#0b6b4e;border-radius:3px"></div>
      <div style="width:28px;height:28px;background:#084533;border-radius:3px"></div>
      <div style="width:28px;height:28px;background:#042319;border-radius:3px"></div>
    </div>
    <div style="font-size:10px;color:#999;margin-top:2px">[6] #12b886</div>
  </div>
  <div>
    <div style="font-size:12px;font-weight:600;margin-bottom:4px">brandDeepRed</div>
    <div style="display:flex;gap:3px">
      <div style="width:28px;height:28px;background:#fbe8eb;border:1px solid #eee;border-radius:3px"></div>
      <div style="width:28px;height:28px;background:#f5c4cd;border-radius:3px"></div>
      <div style="width:28px;height:28px;background:#efa0af;border-radius:3px"></div>
      <div style="width:28px;height:28px;background:#e87c91;border-radius:3px"></div>
      <div style="width:28px;height:28px;background:#d85a74;border-radius:3px"></div>
      <div style="width:28px;height:28px;background:#bb3a5d;border-radius:3px"></div>
      <div style="width:28px;height:28px;background:#a03250;border-radius:3px;outline:2px solid #333;outline-offset:1px"></div>
      <div style="width:28px;height:28px;background:#812840;border-radius:3px"></div>
      <div style="width:28px;height:28px;background:#621d30;border-radius:3px"></div>
      <div style="width:28px;height:28px;background:#431320;border-radius:3px"></div>
    </div>
    <div style="font-size:10px;color:#999;margin-top:2px">[6] #a03250</div>
  </div>
</div>

---

## InfoBox variants

All four semantic types, rendered. Use the `type` prop in JSX or the fence language in markdown.

```infobox info
**`info`** (default) — General notes, methodology, neutral context.
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
This box floats right on desktop and collapses to full-width on mobile. Use only when there are at least 3–4 paragraphs of surrounding text.
```

---

## MediaBox (dark source box)

Used for quotes from external sources, short context notes. Background: `brandNavy[6]` `#6267a3`.

```box
This is a dark source box. Use for quoted text, source attribution, or short contextual notes.

Supports **markdown**, links, headings, and even iframes.
[Link text](https://example.com)
```

**Floated right:**

```box right
Floats right on desktop. Full-width on mobile.
[Source](https://example.com)
```

---

## Typography

The font is set globally by `ThemeProvider` in each app — do **not** override `fontFamily` on individual components.

| App | Font | Weights |
|-----|------|---------|
| `apps/web` | Roboto Slab (serif) | 400, 500, 600, 700 |
| `apps/datajournalism.studio` | Work Sans (sans-serif) | 400, 500, 600, 700 |

### Heading scale (rendered)

# H1 — Article title (rendered by the article renderer, not authored)

## H2 — Major section heading

### H3 — Sub-section heading

#### H4 — Minor heading

Regular body text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Used at `md` (16px) base size.

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
- Use `background.0` (white) for text that sits on a coloured background
- Use InfoBox type semantically: `warning` for caveats, `success` for verified facts, `error` for corrections
- Float boxes only when surrounded by at least 3–4 paragraphs of text
- Keep `ArticlesSection` titles short (≤ 14 chars) if you want the Arrow decoration

### Don't
- Don't hardcode hex colours in components — always use theme tokens
- Don't use accent colours (`brandYellow`, `brandForestGreen`, `brandEmeraldMint`, `brandDeepRed`) without design sign-off
- Don't set `fontFamily` manually on any component
- Don't use `MediaBox` for semantic content (warnings, corrections) — use `InfoBox` instead
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
