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
    description: 'Největší nárůst zaznamenaný kdekoli v bohatém světě za 10 let. Švédsko, po roce 2000 — a dočasně.',
    color: 'blue',
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

### Loading from JSON File

```tsx
<KeyNumbers dataFile="/data/demographics-stats.json" />
```

JSON file format:
```json
{
  "label": "Klíčová čísla",
  "numbers": [
    {
      "value": "1,28",
      "title": "Česká plodnost 2025",
      "description": "Odhad zazněl 27. 4. 2026...",
      "color": "blue"
    }
  ]
}
```

### Custom Colors (HTML/RGBA)

```tsx
const customColorStats: KeyNumberItem[] = [
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
    color: 'teal',
  },
];

<KeyNumbers numbers={customColorStats} />
```

## Props

### `KeyNumbers`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `'Klíčová čísla'` | Section label displayed above the grid |
| `numbers` | `KeyNumberItem[]` | optional* | Array of key number items to display |
| `dataFile` | `string` | optional* | Path to JSON file containing KeyNumbersData |

*Either `numbers` or `dataFile` must be provided.

### `KeyNumberItem`

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `value` | `string` | ✓ | The main numeric value (e.g., "1,28", "+0,8") |
| `title` | `string` | ✓ | Bold title for the statistic |
| `description` | `string` | ✓ | Detailed description text |
| `color` | `KeyNumberPaletteColor \| string` | ✗ | Color theme (palette name, hex, or rgba) |

### `KeyNumbersData` (for JSON files)

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `label` | `string` | ✗ | Section label (overrides component prop if not set) |
| `numbers` | `KeyNumberItem[]` | ✓ | Array of key number items |

## Color Options

### Palette Colors

Use predefined colors from the design system:

- **`red`** (default): `#de1743` (brand.6)
- **`blue`**: `#1a6fa8`
- **`green`**: `#2a8a50`
- **`teal`**: `#0f6c78` (brandTeal.6)
- **`orange`**: `#f76800` (brandOrange.6)
- **`navy`**: `#6267a3` (brandNavy.6)
- **`yellow`**: `#ffcf02` (brandYellow.6)
- **`forestGreen`**: `#639e0a` (brandForestGreen.6)
- **`emeraldMint`**: `#12b886` (brandEmeraldMint.6)
- **`deepRed`**: `#a03250` (brandDeepRed.6)

### Custom Colors

You can also use any HTML color code:

- **Hex**: `"#ff6b35"`, `"#3498db"`
- **RGB**: `"rgb(255, 107, 53)"`
- **RGBA**: `"rgba(52, 152, 219, 0.8)"` (with transparency)

The color affects both the top border and the numeric value color.

## Responsive Behavior

- **Desktop**: 3-column grid
- **Mobile** (≤768px): Single column layout

## Design Notes

Based on the DataTimes design system with:
- Roboto Slab font for numeric values (900 weight)
- 4px colored top border accent
- White card backgrounds
- Consistent spacing and typography hierarchy
- Responsive grid layout
- Full palette support plus custom HTML/RGBA colors
- JSON data loading for easier content management

## Performance Notes

- When using `dataFile`, the component shows a loading state while fetching
- JSON data is fetched client-side using the Fetch API
- Failed JSON loads are logged to console and component renders nothing
- For static data, prefer inline `numbers` prop for better performance

## Complete Examples

### Example 1: Inline Data with Mixed Colors

```tsx
const demographicsData: KeyNumberItem[] = [
  {
    value: '1,28',
    title: 'Česká plodnost 2025',
    description: 'Odhad zazněl 27. 4. 2026 na kulatém stole v Poslanecké sněmovně.',
    color: 'red',
  },
  {
    value: '+0,8',
    title: 'Babišův cíl',
    description: 'Nárůst z 1,28 na 2,10 dítěte na ženu.',
    color: '#f76800',
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

### Example 2: Loading from JSON

```tsx
// In your page/component
export default function ArticlePage() {
  return (
    <>
      <KeyNumbers dataFile="/data/key-stats.json" />
      {/* Rest of article content */}
    </>
  );
}
```

```json
// public/data/key-stats.json
{
  "label": "Klíčová čísla projektu",
  "numbers": [
    {
      "value": "1,28",
      "title": "Česká plodnost 2025",
      "description": "Odhad zazněl 27. 4. 2026.",
      "color": "red"
    },
    {
      "value": "+0,47",
      "title": "Historický rekord",
      "description": "Největší nárůst za 10 let.",
      "color": "#1a6fa8"
    }
  ]
}
```
