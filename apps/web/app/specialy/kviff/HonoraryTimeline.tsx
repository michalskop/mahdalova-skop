'use client';

import { useMemo, useRef, useState } from 'react';
import ChartLegend from './ChartLegend';
import type { HonorRecipient } from './honors';

// Kostičkový unit chart podle vzoru MandateCalendar (Cesty prezidentů,
// Efektivní vládnutí): SVG s viewBox škáluje na 100 % šířky karty, takže
// se řada vždy vejde na šířku beze scrollování a chová se responzivně.
// Všechny informace o osobnosti (jméno, zemi, profesi, rok, zdůvodnění
// festivalu) jsou přímo v hover tooltipu – u tak krátkého textu není
// potřeba samostatný klikací panel navíc.

const NUM_FONT_FAMILY = 'var(--font-roboto-condensed), Arial, sans-serif';
const COLOR_WOMAN = 'var(--mantine-color-brand-6)';
const COLOR_MAN = 'var(--mantine-color-brandNavy-6)';
const VIEW_W = 1000;

type HoverInfo = { recipient: HonorRecipient; left: number; top: number } | null;

export default function HonoraryTimeline({ recipients }: { recipients: HonorRecipient[] }) {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set(['woman', 'man']));
  const [hover, setHover] = useState<HoverInfo>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const years = useMemo(
    () => Array.from(new Set(recipients.map((r) => r.year))).sort((a, b) => a - b),
    [recipients],
  );
  const maxStack = useMemo(
    () => Math.max(...years.map((year) => recipients.filter((r) => r.year === year).length)),
    [years, recipients],
  );

  const colW = VIEW_W / years.length;
  const sq = Math.min(colW * 0.58, 26);
  const sqGap = sq * 0.24;
  const gridHeight = maxStack * sq + (maxStack - 1) * sqGap;
  const topPad = 6;
  const labelGap = 8;
  const labelHeight = 15;
  const height = topPad + gridHeight + labelGap + labelHeight + 4;

  function showTip(e: React.MouseEvent, recipient: HonorRecipient) {
    const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
    const box = containerRef.current!.getBoundingClientRect();
    const margin = 115;
    const left = Math.min(Math.max(rect.left - box.left + rect.width / 2, margin), box.width - margin);
    setHover({ recipient, left, top: rect.top - box.top });
  }

  return (
    <div>
      <ChartLegend
        items={[
          { key: 'woman', label: 'ženy', color: COLOR_WOMAN },
          { key: 'man', label: 'muži', color: COLOR_MAN },
        ]}
        onChange={(keys) => setActiveKeys(new Set(keys))}
      />
      <div ref={containerRef} style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${VIEW_W} ${height}`} width="100%" style={{ display: 'block' }}>
          {years.map((year, yi) => {
            const yearRecipients = recipients.filter((r) => r.year === year);
            const xCenter = colW * (yi + 0.5);
            const hasWoman = yearRecipients.some((r) => r.gender === 'woman');
            return (
              <g key={year}>
                {yearRecipients.map((recipient, ri) => {
                  const y = topPad + gridHeight - (ri + 1) * sq - ri * sqGap;
                  const visible = activeKeys.has(recipient.gender);
                  return (
                    <rect
                      key={`${recipient.year}-${recipient.name}`}
                      aria-label={`${recipient.year}: ${recipient.name}, ${recipient.country}`}
                      x={xCenter - sq / 2}
                      y={y}
                      width={sq}
                      height={sq}
                      rx={4}
                      fill={recipient.gender === 'woman' ? COLOR_WOMAN : COLOR_MAN}
                      opacity={visible ? 1 : 0.14}
                      style={{
                        transition: 'opacity 0.15s',
                        cursor: visible ? 'help' : 'default',
                        pointerEvents: visible ? 'auto' : 'none',
                      }}
                      onMouseEnter={(e) => showTip(e, recipient)}
                      onMouseLeave={() => setHover(null)}
                    />
                  );
                })}
                <text
                  x={xCenter}
                  y={topPad + gridHeight + labelGap + labelHeight * 0.8}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={800}
                  fontFamily={NUM_FONT_FAMILY}
                  fill={hasWoman ? 'var(--mantine-color-brand-8)' : 'var(--mantine-color-background-7)'}
                >
                  {String(year).slice(2)}
                </text>
              </g>
            );
          })}
        </svg>

        {hover && (
          <div
            style={{
              position: 'absolute',
              left: hover.left,
              top: hover.top,
              transform: 'translate(-50%, calc(-100% - 8px))',
              background: 'rgba(248,246,240,0.95)',
              color: '#1a1a1a',
              padding: '9px 12px',
              borderRadius: 7,
              fontSize: 13,
              fontFamily: 'var(--font-roboto-slab), Georgia, serif',
              width: 230,
              pointerEvents: 'none',
              zIndex: 10,
              border: '1px solid #e8e3d2',
              boxShadow: '0 4px 10px rgba(16,20,50,0.14)',
              lineHeight: 1.4,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14 }}>{hover.recipient.name}</div>
            <div style={{ color: '#333333' }}>{hover.recipient.country} · {hover.recipient.roleCz}</div>
            <div style={{ color: '#333333' }}>
              {hover.recipient.year}
              {hover.recipient.status === 'announced' ? ' · oznámeno' : ''}
            </div>
            <div style={{ marginTop: 5, color: '#1a1a1a' }}>{hover.recipient.citationCz}</div>
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '100%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '5px solid rgba(248,246,240,0.97)',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
