'use client';

import { useEffect, useRef, useState } from 'react';
import { robotoCondensed } from '@/app/fonts';
import ChartSignature from './ChartSignature';

// Jednotná typografie grafů (viz Flourish vzor a DESIGN.md §Grafy):
// Roboto Condensed všude, titulek 20/bold, podtitulek 14, osy/hodnoty 13,
// legenda 13,5, patička 14 – vše #333333 (kromě titulku #1a1a1a).
const CHART_FONT = `${robotoCondensed.style.fontFamily}, Arial, sans-serif`;
// Legenda: čtvercová tlačítka se zakulacenými rohy, standardně nahoře na středu
// (vypínání sérií řeší per-spec param s bind: "legend").
const LEGEND_SYMBOL = 'M -0.45 -0.65 L 0.45 -0.65 Q 0.65 -0.65 0.65 -0.45 L 0.65 0.45 Q 0.65 0.65 0.45 0.65 L -0.45 0.65 Q -0.65 0.65 -0.65 0.45 L -0.65 -0.45 Q -0.65 -0.65 -0.45 -0.65 Z';
// České formátování čísel a datumů ve Vega (osy, tooltipy): desetinná čárka,
// nezlomitelná mezera jako oddělovač tisíců. Bez toho d3 renderuje "41.2" a "20,000".
const CS_NUMBER_LOCALE = {
  decimal: ',',
  thousands: ' ',
  grouping: [3],
  currency: ['', ' Kč'],
  minus: '−',
};
const CS_TIME_LOCALE = {
  dateTime: '%A %e. %B %Y, %X',
  date: '%d.%m.%Y',
  time: '%H:%M:%S',
  periods: ['dop.', 'odp.'],
  days: ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota'],
  shortDays: ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so'],
  months: ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'],
  shortMonths: ['led', 'úno', 'bře', 'dub', 'kvě', 'čvn', 'čvc', 'srp', 'zář', 'říj', 'lis', 'pro'],
};
const CHART_FONT_CONFIG = {
  font: CHART_FONT,
  axis: { labelFont: CHART_FONT, titleFont: CHART_FONT, labelFontSize: 13, titleFontSize: 13, labelColor: '#333333', titleColor: '#333333' },
  legend: {
    labelFont: CHART_FONT, titleFont: CHART_FONT, labelFontSize: 13.5, titleFontSize: 13.5, labelColor: '#333333',
    orient: 'top', symbolType: LEGEND_SYMBOL, symbolSize: 280, symbolStrokeWidth: 0,
    layout: { top: { anchor: 'middle' } },
  },
  text: { font: CHART_FONT, fontSize: 13 },
  header: { labelFont: CHART_FONT, titleFont: CHART_FONT },
};

// Patička: _source ve specu obsahuje UZ JEN zdroj dat (bez autorů) –
// autory s prolinkem na DataTimes.cz doplňuje komponenta u každého grafu.
// Markdownové odkazy [text](url) ve zdroji se vykreslí jako <a>.
function renderSource(src: string) {
  const parts: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(src)) !== null) {
    if (m.index > last) parts.push(src.slice(last, m.index));
    parts.push(
      <a key={i++} href={m[2]} target="_blank" rel="noopener noreferrer"
        style={{ color: '#333333', textDecoration: 'underline' }}>
        {m[1]}
      </a>
    );
    last = m.index + m[0].length;
  }
  parts.push(src.slice(last));
  return parts;
}

function mergeFontConfig(config: unknown): Record<string, unknown> {
  const base = typeof config === 'object' && config !== null ? config as Record<string, unknown> : {};
  return {
    ...base,
    ...CHART_FONT_CONFIG,
    axis: { ...(base.axis as object ?? {}), ...CHART_FONT_CONFIG.axis },
    legend: { ...(base.legend as object ?? {}), ...CHART_FONT_CONFIG.legend },
    text: { ...(base.text as object ?? {}), ...CHART_FONT_CONFIG.text },
  };
}

export interface VegaChartProps {
  chartId?: string;
  spec?: Record<string, unknown>;
  mini?: boolean;
}

function isConcatSpec(spec: Record<string, unknown>) {
  return 'vconcat' in spec || 'hconcat' in spec || 'concat' in spec;
}

function stripMeta(spec: Record<string, unknown>): Record<string, unknown> {
  // Exclude display fields we render ourselves; suppress Vega title explicitly
  const { title: _t, _source: _s, _total_width: _w, ...rest } = spec as Record<string, unknown>;
  return { ...rest, title: null };
}

export default function VegaChartImpl({ chartId, spec: propSpec, mini = false }: VegaChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [spec, setSpec] = useState<Record<string, unknown> | null>(propSpec ?? null);
  const [meta, setMeta] = useState<{ title?: string; subtitle?: string; source?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const viewRef = useRef<{ finalize: () => void } | null>(null);

  function extractMeta(data: Record<string, unknown>) {
    const t = data.title;
    const titleObj = t && typeof t === 'object' ? (t as Record<string, unknown>) : null;
    return {
      title: typeof t === 'string' ? t : (titleObj?.text as string | undefined),
      subtitle: titleObj?.subtitle as string | undefined,
      source: data._source as string | undefined,
    };
  }

  useEffect(() => {
    if (propSpec) {
      setMeta(extractMeta(propSpec));
      return;
    }
    if (!chartId) return;
    fetch(`/dpbp/charts/${chartId}.json`)
      .then(r => {
        if (!r.ok) throw new Error(`${r.status} ${r.url}`);
        return r.json();
      })
      .then(data => {
        setMeta(extractMeta(data));
        setSpec(data);
      })
      .catch(e => setError(String(e)));
  }, [chartId, propSpec]);

  useEffect(() => {
    if (!spec || !containerRef.current) return;

    const base = stripMeta(spec);
    let final: Record<string, unknown>;

    if (mini) {
      final = {
        ...base,
        width: 'container',
        height: 110,
        autosize: { type: 'fit-x', contains: 'padding' },
        background: 'transparent',
        config: {
          ...(typeof base.config === 'object' && base.config !== null ? base.config : {}),
          axis: { disable: true, grid: false, ticks: false, labels: false, title: false },
          legend: { disable: true },
          view: { stroke: null },
          padding: 0,
        },
      };
    } else if (isConcatSpec(base)) {
      // width:'container' is unsupported on concat specs in Vega-Lite v5 – leave widths alone
      final = { ...base, background: '#f8f6f0', config: mergeFontConfig(base.config) };
    } else {
      final = {
        ...base,
        background: '#f8f6f0',
        width: 'container',
        autosize: { type: 'fit-x', contains: 'padding' },
        config: mergeFontConfig(base.config),
      };
    }

    import('vega-embed').then(({ default: embed }) => {
      if (!containerRef.current) return;
      viewRef.current?.finalize();
      embed(containerRef.current, final as never, {
        actions: false,
        renderer: 'svg',
        formatLocale: CS_NUMBER_LOCALE,
        timeFormatLocale: CS_TIME_LOCALE,
      }).then(result => {
        viewRef.current = result.view as unknown as { finalize: () => void };
      }).catch(e => setError(String(e)));
    });

    return () => { viewRef.current?.finalize(); };
  }, [spec, mini]);

  if (error) return (
    <div style={{ padding: '8px', color: '#de1743', fontSize: '12px', fontFamily: 'monospace' }}>
      Chyba grafu: {error}
    </div>
  );

  if (mini) {
    return (
      <div ref={containerRef} style={{ width: '100%', minHeight: 110, overflow: 'hidden' }} />
    );
  }

  const isConcat = spec ? isConcatSpec(spec) : false;
  const totalWidth = spec?._total_width as number | undefined;

  // Always render the same 3-part structure (header · chart · source) so React
  // never needs to insert elements before containerRef, avoiding reconciliation
  // re-ordering that would place the header below the chart.
  return (
    <div style={{
      background: '#f8f6f0',
      borderRadius: 4,
      padding: '20px 16px 14px',
      margin: '2em 0',
    }}>
      {/* Header – always present; content appears once meta loads.
          Vpravo podpis DataTimes.cz (horizontální varianta loga). */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: (meta.title || meta.subtitle) ? 14 : 0 }}>
      <div style={{ minWidth: 0 }}>
        {meta.title && (
          <div style={{
            fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif',
            fontSize: 20,
            fontWeight: 700,
            lineHeight: 1.2,
            color: '#1a1a1a',
            marginBottom: meta.subtitle ? 4 : 0,
          }}>
            {meta.title}
          </div>
        )}
        {meta.subtitle && (
          <div style={{
            fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif',
            fontSize: 14,
            lineHeight: 1.3,
            color: '#333333',
          }}>
            {meta.subtitle}
          </div>
        )}
      </div>
      {(meta.title || meta.subtitle) && (
        <ChartSignature size={30} style={{ flex: '0 0 auto', marginTop: 2 }} />
      )}
      </div>

      {/* Chart canvas */}
      <div style={{ overflowX: isConcat ? 'auto' : 'hidden' }}>
        <div
          ref={containerRef}
          style={{
            width: isConcat && totalWidth ? `${totalWidth}px` : '100%',
            minHeight: 200,
          }}
        />
      </div>

      {/* Source */}
      {meta.source && (
        <div style={{
          fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif',
          fontSize: 14,
          color: '#333333',
          marginTop: 10,
          lineHeight: 1.45,
        }}>
          {'• autoři: '}
          <a href="https://datatimes.cz" target="_blank" rel="noopener noreferrer"
            style={{ color: '#333333', textDecoration: 'underline' }}>
            Kateřina Mahdalová &amp; Michal Škop
          </a>
          {' • data: '}
          {renderSource(meta.source)}
        </div>
      )}
    </div>
  );
}
