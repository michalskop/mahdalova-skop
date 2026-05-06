# KeyNumbers Component

A component for displaying key statistics in a visually appealing grid format, based on the DataTimes design system.

## Import

```tsx
import { KeyNumbers } from '@repo/ui/components/KeyNumbers';
import type { KeyNumberItem } from '@repo/ui/components/KeyNumbers';
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

## Props

### `KeyNumbers`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `'Klíčová čísla'` | Section label displayed above the grid |
| `numbers` | `KeyNumberItem[]` | required | Array of key number items to display |

### `KeyNumberItem`

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `value` | `string` | ✓ | The main numeric value (e.g., "1,28", "+0,8") |
| `title` | `string` | ✓ | Bold title for the statistic |
| `description` | `string` | ✓ | Detailed description text |
| `color` | `'red' \| 'blue' \| 'green'` | ✗ | Color theme for the card (default: 'red') |

## Color Variants

- **`red`** (default): Uses `brand.6` color (#de1743)
- **`blue`**: Uses blue accent (#1a6fa8)
- **`green`**: Uses green accent (#2a8a50)

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

## Example: Demographics Article

```tsx
const demographicsData: KeyNumberItem[] = [
  {
    value: '1,28',
    title: 'Česká plodnost 2025',
    description: 'Odhad zazněl 27. 4. 2026 na kulatém stole v Poslanecké sněmovně.',
  },
  {
    value: '+0,8',
    title: 'Babišův cíl',
    description: 'Nárůst z 1,28 na 2,10 dítěte na ženu.',
  },
  {
    value: '+0,47',
    title: 'Historický rekord',
    description: 'Největší nárůst zaznamenaný v bohatém světě za 10 let.',
    color: 'blue',
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
