'use client';

import { useEffect, useRef, useState } from 'react';

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
      final = { ...base, background: '#f8f6f0' };
    } else {
      final = {
        ...base,
        background: '#f8f6f0',
        width: 'container',
        autosize: { type: 'fit-x', contains: 'padding' },
      };
    }

    import('vega-embed').then(({ default: embed }) => {
      if (!containerRef.current) return;
      viewRef.current?.finalize();
      embed(containerRef.current, final as never, {
        actions: false,
        renderer: 'svg',
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
      {/* Header – always present; content appears once meta loads */}
      <div style={{ marginBottom: (meta.title || meta.subtitle) ? 14 : 0 }}>
        {meta.title && (
          <div style={{
            fontFamily: "'Roboto Slab', Georgia, serif",
            fontSize: 21,
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
            fontFamily: "'Roboto Slab', Georgia, serif",
            fontSize: 13,
            lineHeight: 1.3,
            color: '#666',
          }}>
            {meta.subtitle}
          </div>
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
          fontFamily: "'Roboto Slab', Georgia, serif",
          fontSize: 11,
          color: '#888',
          marginTop: 10,
        }}>
          {meta.source}
        </div>
      )}
    </div>
  );
}
