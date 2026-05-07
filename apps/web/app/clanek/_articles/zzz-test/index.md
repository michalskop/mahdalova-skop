---
title: "Test: KeyNumbers Component"
date: "9999-12-30"
author: "Dev Team"
excerpt: "Testing the new KeyNumbers component with various configurations: inline data, JSON loading, palette colors, and custom HTML/RGBA colors."
tags: ["test", "components"]
promoted: 0
---

> This is a test article for the KeyNumbers component. Hidden from listings (future date).

This article demonstrates the new **KeyNumbers** component with different configurations.

---

## Example 1: Inline Data with Palette Colors

Using inline data with predefined palette colors from the design system.

<KeyNumbers 
  label="Demografická data"
  numbers={[
    {
      value: "1,28",
      title: "Česká plodnost 2025",
      description: "Odhad zazněl 27. 4. 2026 na kulatém stole v Poslanecké sněmovně.",
      color: "brand"
    },
    {
      value: "+0,8",
      title: "Babišův cíl",
      description: "Nárůst z 1,28 na 2,10 dítěte na ženu.",
      color: "brandOrange"
    },
    {
      value: "+0,47",
      title: "Historický rekord",
      description: "Největší nárůst zaznamenaný v bohatém světě za 10 let.",
      color: "brandTeal"
    }
  ]}
/>

---

## Example 2: Custom HTML Colors

Using custom hex and RGBA color codes.

<KeyNumbers 
  label="Vlastní barvy"
  numbers={[
    {
      value: "42%",
      title: "Hex Color",
      description: "Using a custom hex color code #ff6b35.",
      color: "#ff6b35"
    },
    {
      value: "3.14",
      title: "RGBA Color",
      description: "Using RGBA with transparency.",
      color: "rgba(26, 111, 168, 0.8)"
    },
    {
      value: "100",
      title: "Green Hex",
      description: "Another custom hex color.",
      color: "#2ecc71"
    }
  ]}
/>

---

## Example 3: All Palette Colors

Demonstrating all available palette colors from the design system.

<KeyNumbers 
  label="Paleta barev"
  numbers={[
    {
      value: "BRAND",
      title: "Brand Red",
      description: "Default brand color.",
      color: "brand"
    },
    {
      value: "ROYAL",
      title: "Royal Blue",
      description: "Royal blue color.",
      color: "brandRoyalBlue"
    },
    {
      value: "EMERALD",
      title: "Emerald Mint",
      description: "Emerald mint color.",
      color: "brandEmeraldMint"
    },
    {
      value: "TEAL",
      title: "Teal",
      description: "Teal brand color.",
      color: "brandTeal"
    },
    {
      value: "ORANGE",
      title: "Orange",
      description: "Orange brand color.",
      color: "brandOrange"
    },
    {
      value: "NAVY",
      title: "Navy",
      description: "Navy brand color.",
      color: "brandNavy"
    }
  ]}
/>

---

## Example 4: More Palette Colors

<KeyNumbers 
  label="Další barvy z palety"
  numbers={[
    {
      value: "YELLOW",
      title: "Yellow",
      description: "Yellow brand color.",
      color: "brandYellow"
    },
    {
      value: "FOREST",
      title: "Forest Green",
      description: "Forest green brand color.",
      color: "brandForestGreen"
    },
    {
      value: "DEEP",
      title: "Deep Red",
      description: "Deep red brand color.",
      color: "brandDeepRed"
    },
    {
      value: "BG",
      title: "Background",
      description: "Background neutral color.",
      color: "background"
    }
  ]}
/>

---

## Example 5: Loading from YAML File

This example loads data from an external YAML file (server-side, like Timeline).

<KeyNumbers yamlFile="key-numbers-data.yaml" />

---

## Example 6: Mixed Colors (Palette + Custom)

Combining palette colors with custom hex/rgba codes in one component.

<KeyNumbers 
  label="Smíšené barvy"
  numbers={[
    {
      value: "1st",
      title: "Palette Brand",
      description: "Using palette color name.",
      color: "brand"
    },
    {
      value: "2nd",
      title: "Shade Notation",
      description: "Using brand[9] for darkest shade.",
      color: "brand[9]"
    },
    {
      value: "3rd",
      title: "Light Shade",
      description: "Using brandTeal[2] for light shade.",
      color: "brandTeal[2]"
    },
    {
      value: "4th",
      title: "RGBA",
      description: "Using RGBA with transparency.",
      color: "rgba(231, 76, 60, 0.7)"
    }
  ]}
/>

---

## Technical Notes

### Features Tested

- ✅ Inline data with `numbers` prop
- ✅ External JSON loading with `dataFile` prop
- ✅ All 10 palette colors (red, blue, green, teal, orange, navy, yellow, forestGreen, emeraldMint, deepRed)
- ✅ Custom hex colors (#rrggbb)
- ✅ Custom RGBA colors with transparency
- ✅ Custom section labels
- ✅ Responsive grid (3 columns → 1 column on mobile)

### Color Options

**Palette colors** (from design system):
- `red`, `blue`, `green`, `teal`, `orange`, `navy`, `yellow`, `forestGreen`, `emeraldMint`, `deepRed`

**Custom colors** (HTML codes):
- Hex: `#ff6b35`, `#3498db`
- RGB: `rgb(255, 107, 53)`
- RGBA: `rgba(52, 152, 219, 0.8)`

---

## Example 7: Single Number - Left Aligned

Default alignment for a single number.

<KeyNumbers 
  label="Single Stat - Left"
  align="left"
  numbers={[
    {
      value: "100%",
      title: "Left Aligned",
      description: "This single number is aligned to the left (default).",
      color: "brandTeal"
    }
  ]}
/>

---

## Example 8: Single Number - Center Aligned

Center alignment for a single number (desktop only, full width on mobile).

<KeyNumbers 
  label="Single Stat - Center"
  align="center"
  numbers={[
    {
      value: "50%",
      title: "Center Aligned",
      description: "This single number is centered on desktop, full width on mobile.",
      color: "brandOrange"
    }
  ]}
/>

---

## Example 9: Single Number - Right Aligned

Right alignment for a single number (desktop only).

<KeyNumbers 
  label="Single Stat - Right"
  align="right"
  numbers={[
    {
      value: "1st",
      title: "Right Aligned",
      description: "This single number is aligned to the right on desktop.",
      color: "brandForestGreen"
    }
  ]}
/>

---

## End of Test Article

This article demonstrates all features of the KeyNumbers component including alignment options for single items.
