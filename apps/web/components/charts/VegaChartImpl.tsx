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
  const { title: _t, _source: _s, _total_width: _w, _toggle_legend: _l, ...rest } = spec as Record<string, unknown>;
  return { ...rest, title: null };
}

function toggleLegendConfig(spec: Record<string, unknown> | null) {
  if (!spec || spec._toggle_legend !== true) return null;
  const color = (spec.encoding as Record<string, unknown> | undefined)?.color as {
    field?: string;
    scale?: { domain?: unknown[]; range?: string[] };
  } | undefined;
  if (!color?.field || !color.scale?.domain?.length) return null;
  return {
    field: color.field,
    items: color.scale.domain.map((label, index) => ({
      label: String(label),
      color: color.scale?.range?.[index] ?? '#777',
    })),
  };
}

function filterHiddenSeries(spec: Record<string, unknown>, field: string, hidden: Set<string>) {
  if (!hidden.size) return spec;
  const filterData = (data: unknown) => {
    if (!data || typeof data !== 'object') return data;
    const typed = data as { values?: Record<string, unknown>[] };
    return Array.isArray(typed.values)
      ? { ...typed, values: typed.values.filter(row => !hidden.has(String(row[field]))) }
      : data;
  };
  return {
    ...spec,
    data: filterData(spec.data),
    ...(Array.isArray(spec.layer) ? {
      layer: (spec.layer as Record<string, unknown>[]).map(layer => ({
        ...layer,
        data: filterData(layer.data),
      })),
    } : {}),
  };
}

function stripVegaTooltips(spec: Record<string, unknown>): Record<string, unknown> {
  const stripEncoding = (encoding: unknown) => {
    if (!encoding || typeof encoding !== 'object') return encoding;
    const { tooltip: _tooltip, ...rest } = encoding as Record<string, unknown>;
    return rest;
  };
  const layers = Array.isArray(spec.layer)
    ? (spec.layer as Record<string, unknown>[]).map(layer => ({
        ...layer,
        encoding: stripEncoding(layer.encoding),
      }))
    : spec.layer;
  return {
    ...spec,
    encoding: stripEncoding(spec.encoding),
    ...(layers ? { layer: layers } : {}),
  };
}

function markType(mark: unknown) {
  if (typeof mark === 'string') return mark;
  if (mark && typeof mark === 'object') return (mark as { type?: string }).type;
  return undefined;
}

function pointerTooltipAt(spec: Record<string, unknown>, ratio: number, hiddenSeries?: Set<string>): PointerTooltip | null {
  const encoding = spec.encoding as Record<string, { field?: string; scale?: { domain?: unknown[]; range?: string[] } }> | undefined;
  const xField = encoding?.x?.field;
  const layers = Array.isArray(spec.layer) ? spec.layer as Record<string, unknown>[] : [];
  const seriesLayers = layers.filter(layer => ['line', 'area'].includes(markType(layer.mark) ?? ''));
  // Most charts keep one shared dataset at the top level. Some layered specs
  // repeat it inside each layer; use the first available layer dataset there.
  const values = (spec.data as { values?: Record<string, unknown>[] } | undefined)?.values
    ?? layers
      .map(layer => (layer.data as { values?: Record<string, unknown>[] } | undefined)?.values)
      .find(layerValues => layerValues?.length);
  if (!values?.length || !xField || !seriesLayers.length) return null;

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
    const valueField = ((seriesLayers[0].encoding as Record<string, { field?: string }> | undefined)?.y?.field);
    if (!valueField) return null;
    for (const row of nearestRows) {
      const series = String(row[seriesField]);
      if (hiddenSeries?.has(series)) continue;
      const value = row[valueField];
      if (typeof value === 'number') {
        rows.push({ label: series, value: numberFormat.format(value), color: colorForSeries(series) });
      }
    }
  } else {
    const row = nearestRows[0];
    if (!row) return null;
    // Without a categorical series field, areas usually encode a reference
    // band. The tooltip should enumerate the actual lines, not a band edge.
    const valueLayers = seriesLayers.filter(layer => markType(layer.mark) === 'line');
    for (const layer of valueLayers) {
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
    rows.sort((a, b) => {
      const aYear = /^\d{4}$/.test(a.label) ? Number(a.label) : null;
      const bYear = /^\d{4}$/.test(b.label) ? Number(b.label) : null;
      return aYear !== null && bYear !== null ? bYear - aYear : 0;
    });
  }

  return rows.length ? {
    label: new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(nearest)),
    rows,
  } : null;
}

export default function VegaChartImpl({ chartId, spec: propSpec, mini = false, bare: bareProp = false }: VegaChartProps) {
  const { bare: bareFromGroup, hoverRatio: sharedHoverRatio, setHoverRatio: setSharedHoverRatio, hoverY: sharedHoverY, setHoverY: setSharedHoverY } = useChartGroup();
  const bare = bareProp || bareFromGroup;
  const containerRef = useRef<HTMLDivElement>(null);
  const [spec, setSpec] = useState<Record<string, unknown> | null>(propSpec ?? null);
  const [meta, setMeta] = useState<{ title?: string; subtitle?: string; source?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [localHoverRatio, setLocalHoverRatio] = useState<number | null>(null);
  const [pointerTooltip, setPointerTooltip] = useState<(PointerTooltip & { x: number; y: number }) | null>(null);
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(() => new Set());
  const viewRef = useRef<{ finalize: () => void } | null>(null);
  const toggleLegend = toggleLegendConfig(spec);

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
      setError(null);
      setMeta(extractMeta(propSpec));
      setSpec(propSpec);
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

    const hasPointerTooltip = Boolean(pointerTooltipAt(spec, 0));
    const stripped = hasPointerTooltip ? stripVegaTooltips(stripMeta(spec)) : stripMeta(spec);
    const base = toggleLegend ? filterHiddenSeries(stripped, toggleLegend.field, hiddenSeries) : stripped;
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
      // Vega Embed appends its wrapper. During hot reload or a spec update the
      // finalized SVG otherwise remains in the container and doubles its height.
      containerRef.current.replaceChildren();
      embed(containerRef.current, final as never, {
        actions: false,
        renderer: 'svg',
        formatLocale: CS_NUMBER_LOCALE,
        timeFormatLocale: CS_TIME_LOCALE,
        tooltip: hasPointerTooltip ? false : makeDpbpTooltipHandler(),
      }).then(result => {
        viewRef.current = result.view as unknown as { finalize: () => void };
      }).catch(e => setError(String(e)));
    });

    return () => {
      viewRef.current?.finalize();
    };
  }, [spec, mini, bare, hiddenSeries]);

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
  const inGroup = Boolean(setSharedHoverRatio);
  // In a ChartRow (small multiples), every panel shows the tooltip for the SAME
  // week — driven by the shared hover ratio — so the countries can be compared
  // at a glance even in panels the cursor isn't over. It sits at the shared
  // vertical guide. Standalone charts keep the classic cursor-following tooltip.
  const groupTooltip = inGroup && hoverRatio !== null && spec ? pointerTooltipAt(spec, hoverRatio) : null;
  const tooltip = inGroup ? groupTooltip : pointerTooltip;
  const plotInsetLeft = 42;
  const plotInsetRight = 8;
  const guidePosition = (ratio: number) =>
    `calc(${ratio * 100}% + ${plotInsetLeft - ratio * (plotInsetLeft + plotInsetRight)}px)`;
  const chartCanvas = (minHeight: number, width: string = '100%') => (
    <div
      style={{ position: 'relative', width, minHeight }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const plotWidth = Math.max(1, rect.width - plotInsetLeft - plotInsetRight);
        const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left - plotInsetLeft) / plotWidth));
        setHoverRatio(ratio);
        if (inGroup) {
          setSharedHoverY?.(event.clientY - rect.top);
        } else {
          const t = spec ? pointerTooltipAt(spec, ratio, hiddenSeries) : null;
          setPointerTooltip(t ? { ...t, x: event.clientX - rect.left, y: event.clientY - rect.top } : null);
        }
      }}
      onPointerLeave={() => {
        setHoverRatio(null);
        if (inGroup) setSharedHoverY?.(null);
        else setPointerTooltip(null);
      }}
    >
      <div ref={containerRef} style={{ width: '100%' }} />
      {hoverRatio !== null && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            insetBlock: 0,
            left: guidePosition(hoverRatio),
            width: 1,
            background: '#777',
            opacity: 0.55,
            pointerEvents: 'none',
          }}
        />
      )}
      {tooltip && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            ...(inGroup
              ? {
                  left: guidePosition(hoverRatio ?? 0),
                  top: sharedHoverY ?? 8,
                  transform: `${(hoverRatio ?? 0) > 0.6 ? 'translateX(calc(-100% - 8px))' : 'translateX(8px)'} ${
                    (sharedHoverY ?? 0) > 180 ? 'translateY(calc(-100% - 10px))' : 'translateY(10px)'
                  }`,
                }
              : {
                  left: (tooltip as PointerTooltip & { x: number; y: number }).x,
                  top: (tooltip as PointerTooltip & { x: number; y: number }).y,
                  transform: `${(tooltip as PointerTooltip & { x: number }).x > 180 ? 'translateX(calc(-100% - 10px))' : 'translateX(10px)'} ${
                    (tooltip as PointerTooltip & { y: number }).y > 180 ? 'translateY(calc(-100% - 10px))' : 'translateY(10px)'
                  }`,
                }),
            zIndex: 4,
            minWidth: 132,
            padding: '7px 10px 8px',
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
          <div style={{
            fontWeight: 700,
            fontSize: 13.5,
            color: '#1a1a1a',
            whiteSpace: 'nowrap',
            paddingBottom: 4,
            marginBottom: 5,
            borderBottom: '1px solid #e8e3d2',
          }}>{tooltip.label}</div>
          {tooltip.rows.map(row => (
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
      {toggleLegend && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 14,
          margin: '2px 0 8px',
          fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif',
          fontSize: 13,
        }}>
          {toggleLegend.items.map(item => {
            const enabled = !hiddenSeries.has(item.label);
            return (
              <button
                key={item.label}
                type="button"
                aria-pressed={enabled}
                onClick={() => setHiddenSeries(current => {
                  const next = new Set(current);
                  if (next.has(item.label)) next.delete(item.label);
                  else next.add(item.label);
                  return next;
                })}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: 0,
                  border: 0,
                  background: 'transparent',
                  color: enabled ? '#333' : '#888',
                  cursor: 'pointer',
                  opacity: enabled ? 1 : 0.55,
                }}
              >
                <span aria-hidden="true" style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: enabled ? item.color : 'transparent',
                  border: `2px solid ${item.color}`,
                  boxSizing: 'border-box',
                }} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
      <div style={{ overflowX: isConcat ? 'auto' : 'hidden' }}>
        {chartCanvas(200, isConcat && totalWidth ? `${totalWidth}px` : '100%')}
      </div>
    </ChartCard>
  );
}
