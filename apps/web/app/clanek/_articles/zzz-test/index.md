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
      color: "red"
    },
    {
      value: "+0,8",
      title: "Babišův cíl",
      description: "Nárůst z 1,28 na 2,10 dítěte na ženu.",
      color: "orange"
    },
    {
      value: "+0,47",
      title: "Historický rekord",
      description: "Největší nárůst zaznamenaný v bohatém světě za 10 let.",
      color: "blue"
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
      value: "RED",
      title: "Brand Red",
      description: "Default brand color (red).",
      color: "red"
    },
    {
      value: "BLUE",
      title: "Blue",
      description: "Blue accent color.",
      color: "blue"
    },
    {
      value: "GREEN",
      title: "Green",
      description: "Green accent color.",
      color: "green"
    },
    {
      value: "TEAL",
      title: "Teal",
      description: "Teal brand color.",
      color: "teal"
    },
    {
      value: "ORANGE",
      title: "Orange",
      description: "Orange brand color.",
      color: "orange"
    },
    {
      value: "NAVY",
      title: "Navy",
      description: "Navy brand color.",
      color: "navy"
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
      color: "yellow"
    },
    {
      value: "FOREST",
      title: "Forest Green",
      description: "Forest green brand color.",
      color: "forestGreen"
    },
    {
      value: "EMERALD",
      title: "Emerald Mint",
      description: "Emerald mint brand color.",
      color: "emeraldMint"
    },
    {
      value: "DEEP",
      title: "Deep Red",
      description: "Deep red brand color.",
      color: "deepRed"
    }
  ]}
/>

---

## Example 5: Loading from JSON File

This example loads data from an external JSON file.

<KeyNumbers dataFile="/clanek/_articles/zzz-test/key-numbers-data.json" />

---

## Example 6: Mixed Colors (Palette + Custom)

Combining palette colors with custom hex/rgba codes in one component.

<KeyNumbers 
  label="Smíšené barvy"
  numbers={[
    {
      value: "1st",
      title: "Palette Red",
      description: "Using palette color name.",
      color: "red"
    },
    {
      value: "2nd",
      title: "Custom Hex",
      description: "Using custom hex color.",
      color: "#9b59b6"
    },
    {
      value: "3rd",
      title: "Palette Teal",
      description: "Back to palette color.",
      color: "teal"
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

## End of Test Article

This article demonstrates all features of the KeyNumbers component. Check the browser console for any errors when loading JSON data.
