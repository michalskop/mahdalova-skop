'use client';

import { useEffect, useRef, useState } from 'react';
import type { TooltipHandler } from 'vega';
import { robotoCondensed } from '@/app/fonts';
import ChartCard from './ChartCard';
import { renderTitle } from './chartText';
import { useChartGroup } from './ChartGroupContext';

type PointerTooltipRow = {
  label: string;
  value: string;
  color?: string;
};

type PointerTooltip = {
  label: string;
  rows: PointerTooltipRow[];
};

// Jednotná typografie grafů (závazná škála,
// docs/design/DESIGN.md §9, revize 2026-07-12):
// Roboto Condensed všude, titulek 24/bold, podtitulek 17, datové popisky 14/bold,
// legenda 14, osy/hodnoty 13, patička 13, minimum 10 (jen drobné anotace) –
// vše #333333 (kromě titulku #1a1a1a). Větší stupnice pro čitelnost ve sdílených screenshotech.
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
// Tooltip: béžové pozadí, Roboto Slab, hodnota obarvena barvou příslušného prvku
// (bar/bod/plocha) – barvu čte vlastní handler ze scenegraphu (item.fill/stroke).
const TOOLTIP_CSS = `
#vg-tooltip-element.dpbp-theme {
  background: rgba(248, 246, 240, 0.95);
  border: 1px solid #e8e3d2;
  border-radius: 7px;
  box-shadow: 0 4px 10px rgba(16, 20, 50, 0.14);
  color: #1a1a1a;
  font-family: var(--font-roboto-slab), Georgia, serif;
  font-size: 13px;
  line-height: 1.4;
  padding: 8px 12px;
  max-width: 300px;
  pointer-events: none;
  position: fixed;
  z-index: 9999;
  display: none;
}
#vg-tooltip-element.dpbp-theme.visible { display: block; }
#vg-tooltip-element.dpbp-theme table { border-collapse: collapse; }
#vg-tooltip-element.dpbp-theme td.key {
  color: #555;
  font-weight: 400;
  padding-right: 10px;
  white-space: nowrap;
}
#vg-tooltip-element.dpbp-theme td.value {
  font-weight: 700;
  max-width: 200px;
}
`;

// Vlastní tooltip handler: hodnotu obarví barvou prvku (fill → stroke → fallback #1a1a1a).
function makeDpbpTooltipHandler(): TooltipHandler {
  let el: HTMLElement | null = null;
  function getEl() {
    if (!el) {
      el = document.getElementById('vg-tooltip-element');
      if (!el) {
        el = document.createElement('div');
        el.id = 'vg-tooltip-element';
        document.body.appendChild(el);
      }
    }
    el.className = 'dpbp-theme';
    return el;
  }
  return (_handler, event, item, value) => {
    const tip = getEl();
    if (!value || value === '') { tip.classList.remove('visible'); return; }
    const sceneItem = item as unknown as Record<string, unknown> | null;
    const markColor = (sceneItem?.fill as string) || (sceneItem?.stroke as string) || '#1a1a1a';
    let html = '<table>';
    if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        html += `<tr><td class="key">${k}:</td><td class="value" style="color:${markColor}">${v}</td></tr>`;
      }
    } else {
      html += `<tr><td class="value" style="color:${markColor}">${value}</td></tr>`;
    }
    html += '</table>';
    tip.innerHTML = html;
    tip.classList.add('visible');
    const pad = 12;
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    const x = event.clientX + pad + tw > window.innerWidth ? event.clientX - tw - pad : event.clientX + pad;
    const y = event.clientY + pad + th > window.innerHeight ? event.clientY - th - pad : event.clientY + pad;
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
  };
}
const CHART_FONT_CONFIG = {
  font: CHART_FONT,
  axis: { labelFont: CHART_FONT, titleFont: CHART_FONT, labelFontSize: 10.5, titleFontSize: 10.5, labelColor: '#333333', titleColor: '#333333' },
  legend: {
    labelFont: CHART_FONT, titleFont: CHART_FONT, labelFontSize: 14, titleFontSize: 14, labelColor: '#333333',
    orient: 'top', symbolType: LEGEND_SYMBOL, symbolSize: 280, symbolStrokeWidth: 0,
    layout: { top: { anchor: 'middle' } },
  },
  text: { font: CHART_FONT, fontSize: 12 },
  header: { labelFont: CHART_FONT, titleFont: CHART_FONT },
};

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
  // Renders just this chart's own title (still per-panel, e.g. a colored
  // country badge) plus the chart itself — no card background/padding, no
  // subtitle, no source, no signature. For grouping several charts under one
  // shared ChartCard (see ChartRow) instead of stacking N identical headers
  // and footers.
  bare?: boolean;
}

function isConcatSpec(spec: Record<string, unknown>) {
  return 'vconcat' in spec || 'hconcat' in spec || 'concat' in spec;
}

function stripMeta(spec: Record<string, unknown>): Record<string, unknown> {
  // Exclude display fields we render ourselves; suppress Vega title explicitly
  const { title: _t, _source: _s, _total_width: _w, ...rest } = spec as Record<string, unknown>;
  return { ...rest, title: null };
}

function markType(mark: unknown) {
  if (typeof mark === 'string') return mark;
  if (mark && typeof mark === 'object') return (mark as { type?: string }).type;
  return undefined;
}

function pointerTooltipAt(spec: Record<string, unknown>, ratio: number): PointerTooltip | null {
  const values = (spec.data as { values?: Record<string, unknown>[] } | undefined)?.values;
  const encoding = spec.encoding as Record<string, { field?: string; scale?: { domain?: unknown[]; range?: string[] } }> | undefined;
  const xField = encoding?.x?.field;
  const layers = Array.isArray(spec.layer) ? spec.layer as Record<string, unknown>[] : [];
  const lineLayers = layers.filter(layer => markType(layer.mark) === 'line');
  if (!values?.length || !xField || !lineLayers.length) return null;

  const dateTransform = (spec.transform as { calculate?: string; as?: string }[] | undefined)
    ?.find(transform => transform.as === xField && transform.calculate?.includes('toDate'));
  const rawDateField = dateTransform?.calculate?.match(/datum\.([A-Za-z0-9_]+)/)?.[1] ?? xField;
  const datedRows = values
    .map(row => ({ row, date: new Date(String(row[rawDateField])) }))
    .filter(item => !Number.isNaN(item.date.getTime()));
  if (!datedRows.length) return null;

  const timestamps = Array.from(new Set(datedRows.map(item => item.date.getTime()))).sort((a, b) => a - b);
  const target = timestamps[0] + Math.max(0, Math.min(1, ratio)) * (timestamps[timestamps.length - 1] - timestamps[0]);
  const nearest = timestamps.reduce((best, current) =>
    Math.abs(current - target) < Math.abs(best - target) ? current : best,
  );
  const nearestRows = datedRows.filter(item => item.date.getTime() === nearest).map(item => item.row);
  const seriesField = encoding?.color?.field;
  const colorScale = encoding?.color?.scale;
  const colorForSeries = (series: string) => {
    const index = colorScale?.domain?.findIndex(value => String(value) === series) ?? -1;
    return index >= 0 ? colorScale?.range?.[index] : undefined;
  };
  const numberFormat = new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 2 });
  const rows: PointerTooltipRow[] = [];

  if (seriesField) {
    const valueField = ((lineLayers[0].encoding as Record<string, { field?: string }> | undefined)?.y?.field);
    if (!valueField) return null;
    for (const row of nearestRows) {
      const series = String(row[seriesField]);
      const value = row[valueField];
      if (typeof value === 'number') {
        rows.push({ label: series, value: numberFormat.format(value), color: colorForSeries(series) });
      }
    }
  } else {
    const row = nearestRows[0];
    if (!row) return null;
    for (const layer of lineLayers) {
      const layerEncoding = layer.encoding as Record<string, { field?: string }> | undefined;
      const valueField = layerEncoding?.y?.field;
      if (!valueField || typeof row[valueField] !== 'number') continue;
      const tooltipEncoding = layerEncoding?.tooltip as unknown as { field?: string; title?: string }[] | undefined;
      const title = tooltipEncoding?.find(item => item.field === valueField)?.title;
      const mark = layer.mark as { color?: string; stroke?: string } | undefined;
      rows.push({
        label: title ?? valueField.replace(/^rate_/, ''),
        value: numberFormat.format(row[valueField] as number),
        color: mark?.color ?? mark?.stroke,
      });
    }
  }

  return rows.length ? {
    label: new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(nearest)),
    rows,
  } : null;
}

export default function VegaChartImpl({ chartId, spec: propSpec, mini = false, bare: bareProp = false }: VegaChartProps) {
  const { bare: bareFromGroup, hoverRatio: sharedHoverRatio, setHoverRatio: setSharedHoverRatio } = useChartGroup();
  const bare = bareProp || bareFromGroup;
  const containerRef = useRef<HTMLDivElement>(null);
  const [spec, setSpec] = useState<Record<string, unknown> | null>(propSpec ?? null);
  const [meta, setMeta] = useState<{ title?: string; subtitle?: string; source?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [localHoverRatio, setLocalHoverRatio] = useState<number | null>(null);
  const [pointerTooltip, setPointerTooltip] = useState<(PointerTooltip & { x: number; y: number }) | null>(null);
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
    fetch(`/specialy/dpbp/charts/${chartId}.json`)
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
        // bare charts sit inside a shared ChartCard (see ChartRow), which
        // already paints the Ink Wash background — painting it again here
        // would be harmless (same color) but relying on transparency is
        // more correct if that shared background ever changes.
        background: bare ? 'transparent' : '#f8f6f0',
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
        tooltip: pointerTooltipAt(spec, 0) ? false : makeDpbpTooltipHandler(),
      }).then(result => {
        viewRef.current = result.view as unknown as { finalize: () => void };
      }).catch(e => setError(String(e)));
    });

    return () => { viewRef.current?.finalize(); };
  }, [spec, mini, bare]);

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

  const hoverRatio = setSharedHoverRatio ? sharedHoverRatio : localHoverRatio;
  const setHoverRatio = setSharedHoverRatio ?? setLocalHoverRatio;
  const chartCanvas = (minHeight: number, width: string = '100%') => (
    <div
      style={{ position: 'relative', width, minHeight }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        setHoverRatio(ratio);
        const tooltip = spec ? pointerTooltipAt(spec, ratio) : null;
        setPointerTooltip(tooltip ? {
          ...tooltip,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        } : null);
      }}
      onPointerLeave={() => {
        setHoverRatio(null);
        setPointerTooltip(null);
      }}
    >
      <div ref={containerRef} style={{ width: '100%' }} />
      {hoverRatio !== null && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            insetBlock: 0,
            left: `${hoverRatio * 100}%`,
            width: 1,
            background: '#777',
            opacity: 0.55,
            pointerEvents: 'none',
          }}
        />
      )}
      {pointerTooltip && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            left: pointerTooltip.x,
            top: pointerTooltip.y,
            transform: pointerTooltip.x > 180 ? 'translate(calc(-100% - 10px), 10px)' : 'translate(10px, 10px)',
            zIndex: 4,
            minWidth: 132,
            padding: '8px 10px',
            border: '1px solid #e8e3d2',
            borderRadius: 7,
            background: 'rgba(248, 246, 240, 0.97)',
            boxShadow: '0 4px 10px rgba(16, 20, 50, 0.14)',
            color: '#1a1a1a',
            fontFamily: 'var(--font-roboto-slab), Georgia, serif',
            fontSize: 13,
            lineHeight: 1.35,
            pointerEvents: 'none',
          }}
        >
          <div style={{ marginBottom: 4, color: '#555', whiteSpace: 'nowrap' }}>{pointerTooltip.label}</div>
          {pointerTooltip.rows.map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 14 }}>
              <span style={{ color: '#555', whiteSpace: 'nowrap' }}>{row.label}</span>
              <strong style={{ color: row.color ?? '#1a1a1a', whiteSpace: 'nowrap' }}>{row.value}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (bare) {
    return (
      <div>
        <style>{TOOLTIP_CSS}</style>
        {/* Fixed-height header (room for 2 lines @ 14px/1.2) regardless of
            whether this panel's title actually wraps — so the chart canvas
            below starts at the same y in every panel of the row, whether
            its neighbor's title took one line or two. */}
        <div style={{
          fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif',
          fontWeight: 700,
          fontSize: 14,
          lineHeight: 1.2,
          color: '#1a1a1a',
          minHeight: 34,
          marginBottom: 8,
        }}>
          {meta.title && renderTitle(meta.title)}
        </div>
        {chartCanvas(160)}
      </div>
    );
  }

  const isConcat = spec ? isConcatSpec(spec) : false;
  const totalWidth = spec?._total_width as number | undefined;

  return (
    <ChartCard title={meta.title} subtitle={meta.subtitle} source={meta.source}>
      <style>{TOOLTIP_CSS}</style>
      <div style={{ overflowX: isConcat ? 'auto' : 'hidden' }}>
        {chartCanvas(200, isConcat && totalWidth ? `${totalWidth}px` : '100%')}
      </div>
    </ChartCard>
  );
}
