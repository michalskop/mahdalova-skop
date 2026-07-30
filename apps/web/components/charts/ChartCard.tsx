'use client';

import { robotoCondensed } from '@/app/fonts';
import ChartSignature from './ChartSignature';
import { renderTitle, renderSubtitle, renderSource, shouldUseStackedBrand } from './chartText';

const CHART_FONT = `${robotoCondensed.style.fontFamily}, Arial, sans-serif`;

export interface ChartCardProps {
  title?: string;
  subtitle?: string;
  source?: string;
  children: React.ReactNode;
}

export default function ChartCard({ title, subtitle, source, children }: ChartCardProps) {
  const stackedBrand = shouldUseStackedBrand(title, subtitle);
  const hasHeader = Boolean(title || subtitle);

  return (
    <div style={{
      background: '#f8f6f0',
      borderRadius: 4,
      padding: '28px 16px 24px',
      margin: '1em 0',
    }}>
      {hasHeader && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          alignItems: 'center',
          columnGap: 18,
          marginBottom: 8,
        }}>
          <div style={{ minWidth: 0 }}>
            {title && (
              <div className="dpbp-chart-title" style={{
                fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif',
                fontWeight: 700,
                lineHeight: 1.2,
                color: '#1a1a1a',
                marginBottom: subtitle ? 6 : 0,
              }}>
                {renderTitle(title)}
              </div>
            )}
            {subtitle && (
              <div className="dpbp-chart-subtitle" style={{
                fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif',
                lineHeight: 1.3,
                color: '#333333',
              }}>
                {renderSubtitle(subtitle)}
              </div>
            )}
          </div>
          <ChartSignature
            size={30}
            layout={stackedBrand ? 'stacked' : 'inline'}
            textWeight={400}
            style={{ lineHeight: 1, alignSelf: 'center' }}
          />
        </div>
      )}

      <div style={{ marginTop: 22 }}>
        {children}
      </div>

      {source && (
        <div className="dpbp-chart-footer" style={{
          fontFamily: CHART_FONT,
          color: '#333333',
          fontSize: 16,
          marginTop: 18,
          lineHeight: 1.5,
        }}>
          <div>
            {'• autoři: '}
            <a href="https://datatimes.cz" target="_blank" rel="noopener noreferrer"
              style={{ color: '#333333', textDecoration: 'underline' }}>
              Kateřina Mahdalová &amp; Michal Škop
            </a>
          </div>
          <div style={{ whiteSpace: 'pre-line' }}>{'• data: '}{renderSource(source)}</div>
        </div>
      )}
    </div>
  );
}
