'use client';

import { useState } from 'react';

// Standardní vypínací legenda pro grafy v tomto speciálu (DESIGN.md §9:
// "nad grafem, na středu, vypínací; čtvercová tlačítka se zakulacenými rohy").
// Kliknutí na položku danou sérii/skupinu ztlumí, další klik ji vrátí zpět.
export type ChartLegendItem = {
  key: string;
  label: string;
  color: string;
  dashed?: boolean;
};

interface ChartLegendProps {
  items: ChartLegendItem[];
  defaultActive?: string[];
  onChange?: (activeKeys: string[]) => void;
}

export default function ChartLegend({ items, defaultActive, onChange }: ChartLegendProps) {
  const [active, setActive] = useState<Set<string>>(new Set(defaultActive ?? items.map((item) => item.key)));

  function toggle(key: string) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      onChange?.(Array.from(next));
      return next;
    });
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
      {items.map((item) => {
        const isActive = active.has(item.key);
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => toggle(item.key)}
            aria-pressed={isActive}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif',
              fontSize: 13,
              fontWeight: 700,
              color: isActive ? '#1a1a1a' : '#a3a396',
              opacity: isActive ? 1 : 0.55,
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
                border: item.dashed ? `2px dashed ${item.color}` : 'none',
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
