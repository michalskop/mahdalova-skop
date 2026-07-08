'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

// ── Public data types ─────────────────────────────────────────────────────────

export interface SwarmDatum {
  id: string;
  /** Full display name shown in tooltip */
  label: string;
  /** Group key — matched against GroupConfig.id */
  group: string;
  /** Attendance rate, 0–1 */
  value: number;
  present?: number;
  absent?: number;
  unknown?: number;
  /** Any extra text shown at bottom of tooltip (e.g. committee list) */
  extra?: string;
}

export interface GroupConfig {
  id: string;
  /** Short label shown inside the face icon */
  label: string;
  color: string;
  /** Use dark text inside the face icon (for light colors like KDU yellow) */
  darkText?: boolean;
}

// ── Built-in PSP10 party preset ───────────────────────────────────────────────

export const PSP10_GROUPS: GroupConfig[] = [
  { id: 'ANO2011',  label: 'ANO',  color: '#272a59' },
  { id: 'MS',       label: 'Moto', color: '#1a9fbd' },
  { id: 'SPD',      label: 'SPD',  color: '#a47d03' },
  { id: 'ODS',      label: 'ODS',  color: '#5e66d5' },
  { id: 'TOP09',    label: 'TOP',  color: '#812840' },
  { id: 'STAN',     label: 'STAN', color: '#ff1a4a' },
  { id: 'KDU-ČSL', label: 'KDU',  color: '#ffcf02', darkText: true },
  { id: 'Piráti',  label: 'Pir',  color: '#111111' },
];

// ── Face path (30×30 viewBox) — 3 rounded corners, top-right sharp ────────────

const FACE_D =
  'M 11.29 0 Q 0 0 0 11.29 L 0 18.71 Q 0 30 11.29 30 L 18.71 30 Q 30 30 30 18.71 L 30 0 L 11.29 0 Z';

// ── Beeswarm placement ────────────────────────────────────────────────────────

interface PlacedDot {
  datum: SwarmDatum;
  dx: number;
}

function placeBeeswarm(
  items: SwarmDatum[],
  getY: (v: number) => number,
  size: number,
  maxDx: number,
): PlacedDot[] {
  const gap = 1.5;
  const step = size + gap;
  const placed: Array<{ y: number; dx: number }> = [];
  const result: PlacedDot[] = new Array(items.length);

  const sorted = items
    .map((datum, i) => ({ datum, i }))
    .sort((a, b) => a.datum.value - b.datum.value);

  for (const { datum, i } of sorted) {
    const y = getY(datum.value);
    const candidates: number[] = [0];
    for (let s = 1; s * step <= maxDx + step * 0.5; s++) {
      if (s * step <= maxDx) candidates.push(s * step);
      if (-s * step >= -maxDx) candidates.push(-s * step);
    }
    let dx = candidates[placed.length % candidates.length] ?? 0;
    for (const c of candidates) {
      if (placed.every((p) => Math.hypot(p.dx - c, p.y - y) >= step)) {
        dx = c;
        break;
      }
    }
    placed.push({ y, dx });
    result[i] = { datum, dx };
  }
  return result;
}

// ── Chart config ──────────────────────────────────────────────────────────────

const MARGIN  = { top: 24, right: 70, bottom: 72, left: 46 };
const HEIGHT  = 370;
const DOT     = 8;
const ICON    = 32;

interface ReferenceLine {
  value: number;
  label?: string;
}

// ── Main chart component ──────────────────────────────────────────────────────

interface AttendanceSwarmChartProps {
  data: SwarmDatum[];
  /** Ordered group config. Defaults to PSP10_GROUPS. */
  groups?: GroupConfig[];
  title?: string;
  subtitle?: string;
  source?: string;
  /** Y-axis domain, default [0, 1] */
  yDomain?: [number, number];
  /** Format a y value for axis labels, default "X %" */
  formatY?: (v: number) => string;
  referenceLines?: ReferenceLine[];
}

export function AttendanceSwarmChart({
  data,
  groups = PSP10_GROUPS,
  title = 'Účast na hlasováních',
  subtitle = 'Jeden bod = jeden poslanec/poslankyně. Najeďte myší pro detail.',
  source,
  yDomain = [0, 1],
  formatY = (v) => `${Math.round(v * 100)} %`,
  referenceLines = [{ value: 0.5, label: '50 %' }],
}: AttendanceSwarmChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth]   = useState(0);
  const [tooltip, setTooltip] = useState<{ datum: SwarmDatum; group: GroupConfig; x: number; y: number } | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => setWidth(entries[0]?.contentRect.width ?? 0));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const hideTooltip = useCallback(() => setTooltip(null), []);

  // Build ordered group list — only include groups that have data
  const groupMap = new Map(groups.map((g) => [g.id, g]));
  const activeGroups = groups
    .map((g) => ({
      config: g,
      items: data.filter((d) => d.group === g.id),
    }))
    .filter((g) => g.items.length > 0);

  // Also include any group ids in data that have no config (show with fallback style)
  const knownIds = new Set(groups.map((g) => g.id));
  const unknownIds: string[] = [];
  data.filter((d) => !knownIds.has(d.group)).forEach((d) => {
    if (!unknownIds.includes(d.group)) unknownIds.push(d.group);
  });
  const unknown = unknownIds;
  for (const id of unknown) {
    activeGroups.push({
      config: { id, label: id, color: '#bcbcb0' },
      items: data.filter((d) => d.group === id),
    });
  }

  const innerW = Math.max(width - MARGIN.left - MARGIN.right, 0);
  const innerH = HEIGHT - MARGIN.top - MARGIN.bottom;
  const [yMin, yMax] = yDomain;
  const yScale = (v: number) => innerH * (1 - (v - yMin) / (yMax - yMin));
  const bw = activeGroups.length > 0 ? innerW / activeGroups.length : 0;

  const yTicks = yScale === undefined ? [] : (() => {
    const count = 5;
    return Array.from({ length: count + 1 }, (_, i) => yMin + (i / count) * (yMax - yMin));
  })();

  return (
    <div
      style={{
        width: '100%',
        padding: '20px 16px 16px',
        background: '#f8f6f0',
        fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif',
        color: '#1a1a1a',
        margin: '0 -16px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.2, marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 13, color: '#666', lineHeight: 1.3 }}>{subtitle}</div>
        </div>
        <a
          href="https://datatimes.cz"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}
        >
          <DtpLogo />
          <span style={{ fontSize: 10, fontWeight: 700, color: '#1a1a1a', whiteSpace: 'nowrap' }}>
            Mahdalová &amp; Škop
          </span>
        </a>
      </div>

      {/* SVG */}
      <div ref={wrapRef} style={{ width: '100%', position: 'relative' }}>
        {width > 0 && (
          <svg width={width} height={HEIGHT} overflow="visible" style={{ display: 'block' }}>
            <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>

              {/* Y gridlines + labels */}
              {yTicks.map((t) => {
                const y = yScale(t);
                return (
                  <g key={t}>
                    <line x1={0} x2={innerW} y1={y} y2={y}
                      stroke={t === yMin ? '#aaa' : '#ddd'}
                      strokeDasharray={t === yMin ? undefined : '3 3'}
                      opacity={0.6}
                    />
                    <text x={-8} y={y} dy="0.35em" textAnchor="end" fontSize={11} fill="#888" fontFamily="inherit">
                      {formatY(t)}
                    </text>
                  </g>
                );
              })}

              {/* Reference lines */}
              {referenceLines.map((ref) => (
                <g key={ref.value}>
                  <line
                    x1={0} x2={innerW} y1={yScale(ref.value)} y2={yScale(ref.value)}
                    stroke="#666" strokeWidth={1.5} strokeDasharray="5 3" opacity={0.7}
                  />
                  {ref.label && (
                    <text x={innerW + 5} y={yScale(ref.value)} dy="0.35em" fontSize={10} fill="#666" fontFamily="inherit">
                      {ref.label}
                    </text>
                  )}
                </g>
              ))}

              {/* Groups */}
              {activeGroups.map(({ config, items }, gi) => {
                const cx = (gi + 0.5) * bw;
                const maxDx = Math.max(bw / 2 - DOT / 2 - 1, 0);
                const avg = items.reduce((s, d) => s + d.value, 0) / items.length;
                const placed = placeBeeswarm(items, yScale, DOT, maxDx);
                const faceScale = DOT / 30;
                const halfDot = DOT / 2;
                const iconScale = ICON / 30;

                return (
                  <g key={config.id}>
                    {/* Column guide */}
                    <line x1={cx} x2={cx} y1={0} y2={innerH}
                      stroke="#ccc" strokeDasharray="3 3" opacity={0.4} />

                    {/* Average bar */}
                    <line
                      x1={cx - bw * 0.28} x2={cx + bw * 0.28}
                      y1={yScale(avg)} y2={yScale(avg)}
                      stroke={config.color} strokeWidth={2} opacity={0.65}
                    />

                    {/* Dots */}
                    <g transform={`translate(${cx},0)`}>
                      {[...placed]
                        .sort((a, b) =>
                          tooltip?.datum.id === a.datum.id ? 1
                          : tooltip?.datum.id === b.datum.id ? -1
                          : 0
                        )
                        .map(({ datum, dx }) => {
                          const iy = yScale(datum.value);
                          const isHov = tooltip?.datum.id === datum.id;
                          const dimmed = tooltip !== null && !isHov;
                          const pa = (datum.present ?? 0) + (datum.absent ?? 0);
                          const total = pa + (datum.unknown ?? 0);
                          const fewSessions = total > 0 && total < 7;
                          return (
                            <g
                              key={datum.id}
                              transform={`translate(${dx - halfDot},${iy - halfDot})`}
                              style={{ cursor: 'pointer' }}
                              onMouseEnter={(e) => setTooltip({ datum, group: config, x: e.clientX, y: e.clientY })}
                              onMouseMove={(e) => setTooltip((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                              onMouseLeave={hideTooltip}
                            >
                              <path
                                d={FACE_D}
                                transform={`scale(${faceScale})`}
                                fill={config.color}
                                stroke={config.color}
                                fillOpacity={dimmed ? 0.1 : isHov ? 0.9 : fewSessions ? 0.12 : 0.4}
                                strokeOpacity={dimmed ? 0.15 : isHov ? 1 : fewSessions ? 0.25 : 0.65}
                                strokeWidth={(isHov ? 2 : 1) / faceScale}
                              />
                            </g>
                          );
                        })}
                    </g>

                    {/* X-axis party face */}
                    <g transform={`translate(${cx - ICON / 2},${innerH + 8})`}>
                      <path d={FACE_D} transform={`scale(${iconScale})`} fill={config.color} />
                      <text
                        x={ICON / 2} y={ICON * 0.62}
                        textAnchor="middle" fontSize={8.5} fontWeight={700}
                        fontFamily="inherit"
                        fill={config.darkText ? '#1a1a1a' : '#ffffff'}
                      >
                        {config.label}
                      </text>
                    </g>

                    {/* Count */}
                    <text
                      x={cx} y={innerH + 8 + ICON + 12}
                      textAnchor="middle" fontSize={10} fill="#888" fontFamily="inherit"
                    >
                      {`n=${items.length}`}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        )}

        {tooltip && <SwarmTooltip tooltip={tooltip} formatY={formatY} containerRef={wrapRef} />}
      </div>

      {source && (
        <div style={{ marginTop: 12, fontSize: 11, color: '#999' }}>{source}</div>
      )}
    </div>
  );
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

function SwarmTooltip({
  tooltip,
  formatY,
  containerRef,
}: {
  tooltip: { datum: SwarmDatum; group: GroupConfig; x: number; y: number };
  formatY: (v: number) => string;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const ttRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });

  useEffect(() => {
    const tt = ttRef.current;
    if (!tt) return;
    const margin = 10;
    const ttW = tt.offsetWidth || 200;
    const ttH = tt.offsetHeight || 120;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let x = Math.max(margin, Math.min(tooltip.x + 14, vw - ttW - margin));
    let y = Math.max(margin, Math.min(tooltip.y - ttH / 2, vh - ttH - margin));
    setPos({ left: x, top: y });
  }, [tooltip]);

  const { datum, group } = tooltip;

  return (
    <div
      ref={ttRef}
      style={{
        position: 'fixed',
        left: pos.left,
        top: pos.top,
        zIndex: 9999,
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.10)',
        borderRadius: 8,
        boxShadow: '0 4px 18px rgba(0,0,0,0.13)',
        padding: '11px 13px',
        minWidth: 200,
        maxWidth: 280,
        pointerEvents: 'none',
        fontFamily: 'var(--font-roboto-slab), Georgia, serif',
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 3 }}>
        {datum.label}
      </div>
      <div style={{ fontSize: 11, color: group.color, fontWeight: 600, marginBottom: 6 }}>
        {group.label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>
        {formatY(datum.value)}
      </div>
      {(datum.present != null || datum.absent != null || datum.unknown != null) && (
        <div style={{ fontSize: 11, color: '#888', marginTop: 2, lineHeight: 1.6 }}>
          {datum.present != null && <span>přítomen/na: {datum.present}×</span>}
          {datum.absent != null && <><br /><span>nepřítomen/na: {datum.absent}×</span></>}
          {datum.unknown != null && datum.unknown > 0 && <><br /><span>neznámo: {datum.unknown}×</span></>}
        </div>
      )}
      {datum.extra && (
        <div style={{
          fontSize: 11, color: '#555', marginTop: 6, paddingTop: 6,
          borderTop: '1px solid rgba(0,0,0,0.08)', lineHeight: 1.4,
        }}>
          {datum.extra}
        </div>
      )}
    </div>
  );
}

// ── DataTimes logo ────────────────────────────────────────────────────────────

function DtpLogo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="112 112 276 276" aria-hidden="true">
      <defs>
        <linearGradient id="dtpGradAS" x1="1" x2="0.25" y1="0.5" y2="1">
          <stop offset="0%"   stopColor="#ffdc33" stopOpacity="0" />
          <stop offset="50%"  stopColor="#ffdc33" stopOpacity="0" />
          <stop offset="50%"  stopColor="#ffdc33" stopOpacity="1" />
          <stop offset="100%" stopColor="#ffdc33" stopOpacity="1" />
        </linearGradient>
      </defs>
      <g transform="rotate(-30 250 250)">
        <path fill="none" stroke="#ffdc33" strokeWidth="76" strokeLinecap="round" d="M 250 350 A 100 100 0 0 0 336.60254037844385 300" />
        <path fill="none" stroke="#f76800" strokeWidth="76" strokeLinecap="round" d="M 336.6025403784439 300 A 100 100 0 0 0 250 150" />
        <path fill="none" stroke="#de1743" strokeWidth="76" strokeLinecap="round" d="M 250 150 A 100 100 0 0 0 250 350" />
        <path fill="none" stroke="url(#dtpGradAS)" strokeWidth="76" strokeLinecap="round" d="M 250 350 A 100 100 0 0 0 336.60254037844385 300" />
      </g>
    </svg>
  );
}

// ── MDX wrapper — loads data from articles.ts scope ───────────────────────────

interface AttendanceSwarmProps {
  dataFile?: string;
  title?: string;
  subtitle?: string;
  source?: string;
}

export default function AttendanceSwarm({
  dataFile,
  title,
  subtitle,
  source,
  // injected by ArticleRenderer from mdxSource.scope
  ...rest
}: AttendanceSwarmProps & { attendanceSwarmData?: Record<string, SwarmDatum[]> }) {
  if (!dataFile) {
    return <div style={{ color: 'red', padding: '1rem' }}>AttendanceSwarm: missing dataFile prop</div>;
  }
  const attendanceSwarmData = (rest as any).attendanceSwarmData as Record<string, SwarmDatum[]> | undefined;
  const data = attendanceSwarmData?.[dataFile];
  if (!data) {
    return <div style={{ color: 'red', padding: '1rem' }}>AttendanceSwarm: data not found for {dataFile}</div>;
  }
  return (
    <AttendanceSwarmChart
      data={data}
      title={title}
      subtitle={subtitle}
      source={source}
    />
  );
}
