'use client';

import ChartSignature from '@/components/dpbp/ChartSignature';

// Sjednocený rám "grafové karty" podle DESIGN.md §9 (stejný standard jako
// VegaChartImpl v Datech pro budoucí premiérku): Ink Wash pozadí #f8f6f0,
// titulek 20/bold, podtitulek 14, podpis DataTimes.cz na švu hlavičky vpravo,
// patička ve dvou řádcích (autoři / data). Používat pro KAŽDÝ graf a mapu
// v tomto speciálu, aby nevznikaly vizuálně nesourodé karty.

export const NUM_FONT: React.CSSProperties = {
  fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif',
  fontVariantNumeric: 'tabular-nums',
};

export const CHART_TRACK_BG = '#eeeae2';

interface ChartFrameProps {
  title: string;
  subtitle?: string;
  source: string;
  children: React.ReactNode;
  fullWidth?: boolean;
  headerContent?: React.ReactNode;
}

export default function ChartFrame({ title, subtitle, source, children, fullWidth, headerContent }: ChartFrameProps) {
  return (
    <div
      style={{
        background: '#f8f6f0',
        borderRadius: 4,
        padding: '18px 16px 14px',
        gridColumn: fullWidth ? '1 / -1' : undefined,
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'center', columnGap: 18, marginBottom: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ ...NUM_FONT, fontSize: 20, fontWeight: 700, lineHeight: 1.2, color: '#1a1a1a', marginBottom: subtitle ? 4 : 0 }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ ...NUM_FONT, fontSize: 14, lineHeight: 1.3, color: '#333333' }}>{subtitle}</div>
          )}
          {headerContent && <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>{headerContent}</div>}
        </div>
        <ChartSignature size={34} layout="stacked" style={{ lineHeight: 1, alignSelf: 'center' }} />
      </div>

      {children}

      <div style={{ ...NUM_FONT, fontSize: 14, color: '#333333', marginTop: 12, lineHeight: 1.5 }}>
        <div>
          {'• autoři: '}
          <a href="https://datatimes.cz" target="_blank" rel="noopener noreferrer" style={{ color: '#333333', textDecoration: 'underline' }}>
            Kateřina Mahdalová &amp; Michal Škop
          </a>
        </div>
        <div>{'• data: '}{source}</div>
      </div>
    </div>
  );
}
