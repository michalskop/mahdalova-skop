# KeyNumbers Component

A component for displaying key statistics in a visually appealing grid format, based on the DataTimes design system. Supports inline data or JSON file loading with flexible color customization.

## Import

```tsx
import { KeyNumbers } from '@repo/ui/components/KeyNumbers';
import type { KeyNumberItem, KeyNumbersData, KeyNumberPaletteColor } from '@repo/ui/components/KeyNumbers';
```

## Usage

### Basic Example

```tsx
const keyStats: KeyNumberItem[] = [
  {
    value: '1,28',
    title: 'Česká plodnost 2025',
    description: 'Odhad zazněl 27. 4. 2026 na kulatém stole v Poslanecké sněmovně. Jedno z nejnižších čísel v historii.',
  },
  {
    value: '+0,8',
    title: 'Babišův cíl',
    description: 'Nárůst z 1,28 na 2,10 dítěte na ženu. Vláda ho vyhlásila jako prioritu. Žádné opatření zatím nestanovila.',
  },
  {
    value: '+0,47',
    title: 'Historický rekord',
    description: 'Největší nárůst zaznamenaný kdekoli v bohatém světě za 10 let. Švédsko, po roce 2000 – a dočasně.',
    color: 'brandTeal',
  },
];

<KeyNumbers numbers={keyStats} />
```

### With Custom Label

```tsx
<KeyNumbers 
  label="Statistiky projektu" 
  numbers={keyStats} 
/>
```

### Loading from YAML File (Server-Side)

```tsx
// In your article markdown:
<KeyNumbers yamlFile="demographics-stats.yaml" />

// With alignment (for single items)
<KeyNumbers yamlFile="single-stat.yaml" align="center" />
```

Place the YAML file in the same directory as your article's `index.md`. The file is loaded server-side during build (same pattern as Timeline).

YAML file format:
```yaml
label: Klíčová čísla
numbers:
  - value: "1,28"
    title: Česká plodnost 2025
    description: Odhad zazněl 27. 4. 2026...
    color: brand
```

### Custom Colors (HTML/RGBA)

```tsx
const customColorStats: KeyNumberItem[] = [
  {
    value: '2nd',
    title: 'Shade Notation',
    description: 'Using brand[9] for darkest shade.',
    color: 'brand[9]',
  },
  {
    value: '3rd',
    title: 'Palette Teal',
    description: 'Back to palette color.',
    color: 'brandTeal',
  },
  {
    value: '42%',
    title: 'Custom Hex Color',
    description: 'Using a custom hex color code.',
    color: '#ff6b35',
  },
  {
    value: '3.14',
    title: 'RGBA Color',
    description: 'Using an RGBA color with transparency.',
    color: 'rgba(26, 111, 168, 0.8)',
  },
  {
    value: '100',
    title: 'Palette Color',
    description: 'Using a color from the design system palette.',
    color: 'brandTeal',
  },
  {
    value: '999',
    title: 'Shade Notation',
    description: 'Using shade notation for darker brand color.',
    color: 'brand[8]',
  },
];

<KeyNumbers numbers={customColorStats} />
```

### Loading from YAML File with Custom Colors

```tsx
<KeyNumbers yamlFile="key-stats.yaml" />
```

```yaml
# Place in same directory as index.md: key-stats.yaml
label: Klíčová čísla projektu
numbers:
  - value: "1,28"
    title: Česká plodnost 2025
    description: Odhad zazněl 27. 4. 2026.
    color: brand
  - value: "+0,8"
    title: Babišův cíl
    description: Nárůst z 1,28 na 2,10.
    color: brandOrange
```

## Props

### `KeyNumbers`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `'Klíčová čísla'` | Section label displayed above the grid |
| `numbers` | `KeyNumberItem[]` | optional* | Array of key number items to display |
| `yamlFile` | `string` | optional* | Filename (relative to article dir) for server-side loading |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Alignment for single items (desktop only) |

*Either `numbers` or `yamlFile` must be provided.

### `KeyNumberItem`

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `value` | `string` | ✓ | The main numeric value (e.g., "1,28", "+0,8") |
| `title` | `string` | ✓ | Bold title for the statistic |
| `description` | `string` | ✓ | Detailed description text |
| `color` | `KeyNumberPaletteColor \| string` | ✗ | Color theme (palette name, hex, or rgba) |

### `KeyNumbersData` (for YAML files)

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `label` | `string` | ✗ | Section label (overrides component prop if not set) |
| `numbers` | `KeyNumberItem[]` | ✓ | Array of key number items |

## Color Options

### Palette Colors (Theme Names)

Use predefined colors from the design system by their theme names:

- **`brand`** (default): `#de1743` – Primary crimson red
- **`brandTeal`**: `#0f6c78` – Teal green
- **`brandOrange`**: `#f76800` – Orange
- **`brandNavy`**: `#6267a3` – Navy purple
- **`brandYellow`**: `#ffcf02` – Yellow highlights
- **`brandForestGreen`**: `#639e0a` – Forest green
- **`brandEmeraldMint`**: `#12b886` – Emerald mint
- **`brandDeepRed`**: `#a03250` – Deep red
- **`brandRoyalBlue`**: `#4a51ab` – Royal blue
- **`background`**: `#e8e8dc` – Neutral background

### Shade Notation

Access any shade (0-9) from any color scale:

- **`brand[9]`** – Darkest brand shade
- **`brand[0]`** – Lightest brand shade
- **`brandTeal[3]`** – Light teal shade
- **`brandOrange[8]`** – Dark orange shade

All theme colors support this notation.

### Custom Colors

You can also use any HTML color code:

- **Hex**: `"#ff6b35"`, `"#3498db"`
- **RGB**: `"rgb(255, 107, 53)"`
- **RGBA**: `"rgba(52, 152, 219, 0.8)"` (with transparency)

The color affects both the top border and the numeric value color.

## Responsive Behavior

- **Desktop**: 3-column grid
- **Mobile** (≤768px): Single column layout

## Alignment Feature

When displaying a **single number**, you can control its horizontal position on desktop:

```tsx
// Left-aligned (default)
<KeyNumbers numbers={[singleStat]} align="left" />

// Center-aligned
<KeyNumbers numbers={[singleStat]} align="center" />

// Right-aligned
<KeyNumbers numbers={[singleStat]} align="right" />
```

**Note:** Alignment only applies when `numbers.length === 1`. On mobile (≤768px), items always stretch to full width.

## Design Notes

Based on the DataTimes design system with:
- Roboto Slab font for numeric values (900 weight)
- 4px colored top border accent
- White card backgrounds
- Consistent spacing and typography hierarchy
- Responsive grid layout
- Full palette support plus custom HTML/RGBA colors
- YAML data loading for easier content management (consistent with Timeline)
- Alignment control for single items (desktop only)

## Performance Notes

- When using `yamlFile`, data is loaded **server-side** during build (same as Timeline)
- No client-side fetch required - data is embedded in the page
- For dynamic data that changes frequently, use inline `numbers` prop
- Server-side YAML loading is preferred for static article data

## Complete Examples

### Example 1: Inline Data with Mixed Colors

```tsx
const demographicsData: KeyNumberItem[] = [
  {
    value: '1,28',
    title: 'Česká plodnost 2025',
    description: 'Odhad zazněl 27. 4. 2026 na kulatém stole v Poslanecké sněmovně.',
    color: 'brand',
  },
  {
    value: '+0,8',
    title: 'Babišův cíl',
    description: 'Nárůst z 1,28 na 2,10 dítěte na ženu.',
    color: 'brandOrange',
  },
  {
    value: '+0,47',
    title: 'Historický rekord',
    description: 'Největší nárůst zaznamenaný v bohatém světě za 10 let.',
    color: 'rgba(26, 111, 168, 1)',
  },
];

export default function DemographicsPage() {
  return (
    <>
      <KeyNumbers numbers={demographicsData} />
      {/* Rest of article content */}
    </>
  );
}
```

### Example 2: Loading from YAML (Server-Side)

```md
<!-- In your article's index.md -->
<KeyNumbers yamlFile="key-stats.yaml" />
```

```yaml
# Place in same directory as index.md: key-stats.yaml
label: Klíčová čísla projektu
numbers:
  - value: "1,28"
    title: Česká plodnost 2025
    description: Odhad zazněl 27. 4. 2026.
    color: red
  - value: "+0,47"
    title: Historický rekord
    description: Největší nárůst za 10 let.
    color: "#1a6fa8"
```
