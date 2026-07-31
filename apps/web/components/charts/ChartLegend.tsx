'use client';

import { useMemo, useState } from 'react';

export type ChartLegendItem = {
  key: string;
  label: string;
  color: string;
  dashed?: boolean;
};

export type ChartLegendInactiveStyle = 'muted' | 'strikethrough';

interface ChartLegendProps {
  items: ChartLegendItem[];
  activeKeys?: string[];
  defaultActive?: string[];
  inactiveStyle?: ChartLegendInactiveStyle;
  onChange?: (activeKeys: string[]) => void;
  marginBottom?: number;
}

// Shared default legend for DataTimes charts. It is deliberately independent
// of the rendering technology: SVG, Vega, canvas and DOM charts can all use it.
export default function ChartLegend({
  items,
  activeKeys,
  defaultActive,
  inactiveStyle = 'muted',
  onChange,
  marginBottom = 16,
}: ChartLegendProps) {
  const initial = useMemo(() => defaultActive ?? items.map(item => item.key), [defaultActive, items]);
  const [internalActive, setInternalActive] = useState<Set<string>>(() => new Set(initial));
  const active = activeKeys ? new Set(activeKeys) : internalActive;

  function toggle(key: string) {
    const next = new Set(active);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    if (!activeKeys) setInternalActive(next);
    onChange?.(Array.from(next));
  }

  return (
    <div
      aria-label="Zobrazené datové řady"
      style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 16, marginBottom }}
    >
      {items.map(item => {
        const isActive = active.has(item.key);
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => toggle(item.key)}
            aria-pressed={isActive}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif',
              fontSize: 13,
              fontWeight: 700,
              color: isActive ? '#1a1a1a' : '#8a8a80',
              opacity: isActive ? 1 : 0.58,
              textDecoration: !isActive && inactiveStyle === 'strikethrough' ? 'line-through' : 'none',
              transition: 'opacity 0.15s, color 0.15s',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 13,
                height: 13,
                borderRadius: 4,
                background: item.dashed ? 'transparent' : item.color,
                border: item.dashed
                  ? `2px dashed ${item.color}`
                  : 'none',
                boxSizing: 'border-box',
                display: 'inline-block',
                flex: '0 0 auto',
              }}
            />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
