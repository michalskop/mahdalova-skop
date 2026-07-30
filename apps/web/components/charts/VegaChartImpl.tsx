'use client';

import { useEffect, useRef, useState } from 'react';
import type { TooltipHandler } from 'vega';
import { robotoCondensed } from '@/app/fonts';
import ChartCard from './ChartCard';
import { renderTitle } from './chartText';
import { useChartGroup } from './ChartGroupContext';

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

export default function VegaChartImpl({ chartId, spec: propSpec, mini = false, bare: bareProp = false }: VegaChartProps) {
  const { bare: bareFromGroup } = useChartGroup();
  const bare = bareProp || bareFromGroup;
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
        tooltip: makeDpbpTooltipHandler(),
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
        <div ref={containerRef} style={{ width: '100%', minHeight: 160 }} />
      </div>
    );
  }

  const isConcat = spec ? isConcatSpec(spec) : false;
  const totalWidth = spec?._total_width as number | undefined;

  return (
    <ChartCard title={meta.title} subtitle={meta.subtitle} source={meta.source}>
      <style>{TOOLTIP_CSS}</style>
      <div style={{ overflowX: isConcat ? 'auto' : 'hidden' }}>
        <div
          ref={containerRef}
          style={{
            width: isConcat && totalWidth ? `${totalWidth}px` : '100%',
            minHeight: 200,
          }}
        />
      </div>
    </ChartCard>
  );
}
