'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TooltipHandler } from 'vega';
import { robotoCondensed } from '@/app/fonts';
import ChartCard from './ChartCard';
import ChartLegend, { type ChartLegendInactiveStyle } from './ChartLegend';
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
// Nativní Vega legenda používá stejný symbol. Interaktivní vypínání sérií
// zajišťuje sdílený React ChartLegend přes `_toggle_legend: true`.
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
// Tooltip (závazně všude, DESIGN.md §10 → Tooltip): béžová karta, text ink blue
// #101432. Nahoře lišta v barvě položky (sloupec/bod/série) s jejím názvem bílým
// písmem – u světlých barev (šedá „ostatní“) ink blue písmem. Řádky pod ní
// klíč + hodnota ink blue; řádek pojmenovaný podle série má na kraji čtvereček
// v barvě série.
const TOOLTIP_INK = '#101432';
const TOOLTIP_CSS = `
#vg-tooltip-element.dpbp-theme {
  background: rgba(248, 246, 240, 0.97);
  border: 1px solid #e8e3d2;
  border-radius: 7px;
  box-shadow: 0 4px 10px rgba(16, 20, 50, 0.14);
  color: ${TOOLTIP_INK};
  font-family: var(--font-roboto-slab), Georgia, serif;
  font-size: 13px;
  line-height: 1.4;
  padding: 0;
  overflow: hidden;
  max-width: 320px;
  pointer-events: none;
  position: fixed;
  z-index: 9999;
  display: none;
}
#vg-tooltip-element.dpbp-theme.visible { display: block; }
#vg-tooltip-element.dpbp-theme .dt-tt-head {
  font-weight: 700;
  font-size: 13.5px;
  padding: 5px 12px;
  white-space: nowrap;
}
#vg-tooltip-element.dpbp-theme table { border-collapse: collapse; margin: 6px 12px 8px; }
#vg-tooltip-element.dpbp-theme table.dt-tt-list { margin: 2px 0 0; font-size: 12px; line-height: 1.3; }
#vg-tooltip-element.dpbp-theme table.dt-tt-list td { padding: 0 14px 0 0; white-space: nowrap; vertical-align: top; }
@media (max-width: 600px) {
  #vg-tooltip-element.dpbp-theme table.dt-tt-list { font-size: 10px; }
  #vg-tooltip-element.dpbp-theme table.dt-tt-list td { white-space: normal; padding-right: 8px; }
}
#vg-tooltip-element.dpbp-theme td.key {
  color: ${TOOLTIP_INK};
  font-weight: 400;
  padding-right: 12px;
  white-space: nowrap;
}
#vg-tooltip-element.dpbp-theme td.value {
  color: ${TOOLTIP_INK};
  font-weight: 700;
  max-width: 200px;
}
#vg-tooltip-element.dpbp-theme .dt-tt-swatch {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 2px;
  margin-right: 6px;
  vertical-align: 0;
}
`;

// Světlá barva (šedá „ostatní“, pastelové odstíny) → v liště ink blue písmo místo bílého.
function isLightColor(color: string): boolean {
  const probe = document.createElement('span');
  probe.style.color = color;
  document.body.appendChild(probe);
  const rgb = getComputedStyle(probe).color.match(/\d+(\.\d+)?/g)?.map(Number) ?? [0, 0, 0];
  probe.remove();
  const [r, g, b] = rgb.map(c => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45;
}

function escapeHtml(v: unknown): string {
  return String(v).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]!));
}

// Barvy sérií ze všech barevných škál specu (top-level i vrstvy): {Česko: '#de1743', …}.
// Souhrnný tooltip za celou kategorii (např. skupina sloupců Česko × Rakousko) má
// řádky pojmenované podle sérií – každý se pak obarví barvou své série.
function seriesColorMap(spec: Record<string, unknown>): Record<string, string> {
  const map: Record<string, string> = {};
  const units = [spec, ...(Array.isArray(spec.layer) ? spec.layer as Record<string, unknown>[] : [])];
  for (const unit of units) {
    const scale = ((unit.encoding as Record<string, unknown> | undefined)?.color as
      { scale?: { domain?: unknown[]; range?: unknown[] } } | undefined)?.scale;
    scale?.domain?.forEach((label, i) => {
      const color = scale.range?.[i];
      if (typeof color === 'string') map[String(label)] = color;
    });
  }
  return map;
}

// Vlastní tooltip handler: první položka tooltipu (název kategorie/prvku) je
// barevná lišta nahoře, zbytek tabulka ink blue. Barva lišty = barva série, pokud
// se název shoduje s doménou color škály, jinak barva prvku (fill → stroke).
// Neviditelné pásy (souhrnný tooltip za kategorii) mají fill ink blue.
function makeDpbpTooltipHandler(seriesColors: Record<string, string> = {}): TooltipHandler {
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
    const fill = sceneItem?.fill as string | undefined;
    const markColor = (fill && fill !== 'transparent' && fill !== 'none' ? fill : '') || (sceneItem?.stroke as string) || TOOLTIP_INK;
    const entries = value && typeof value === 'object'
      ? Object.entries(value as Record<string, unknown>)
      : [['', value] as [string, unknown]];
    const [, headValue] = entries[0];
    const headColor = seriesColors[String(headValue)] ?? markColor;
    const headText = isLightColor(headColor) ? TOOLTIP_INK : '#ffffff';
    let html = `<div class="dt-tt-head" style="background:${headColor};color:${headText}">${escapeHtml(headValue)}</div>`;
    if (entries.length > 1) {
      html += '<table>';
      for (const [k, v] of entries.slice(1)) {
        const swatch = seriesColors[k] ? `<span class="dt-tt-swatch" style="background:${seriesColors[k]}"></span>` : '';
        // Víceřádková hodnota (seznam jmen) jde pod klíč přes celou šíři; řádky s tabulátorem
        // se rozdělí do sloupců (např. 2 × 17 jmen v grafu řádů u článku o státních vyznamenáních).
        if (typeof v === 'string' && v.includes('\n')) {
          const rows = v.split('\n').map(l => `<tr>${l.split('\t').map(c => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('');
          html += `<tr><td class="key" colspan="2">${swatch}${escapeHtml(k)}</td></tr>`
            + `<tr><td colspan="2"><table class="dt-tt-list">${rows}</table></td></tr>`;
          continue;
        }
        html += `<tr><td class="key">${swatch}${escapeHtml(k)}</td><td class="value">${escapeHtml(v)}</td></tr>`;
      }
      html += '</table>';
    }
    // seznam jmen smí být širší, ale nikdy přes okraj obrazovky (mobil)
    tip.style.maxWidth = html.includes('dt-tt-list') ? 'min(600px, calc(100vw - 16px))' : '';
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
  // facet (mřížka dlaždic) má stejně jako concat pevné šířky dílčích grafů, width:'container' neumí
  return 'vconcat' in spec || 'hconcat' in spec || 'concat' in spec || 'facet' in spec;
}

function stripMeta(spec: Record<string, unknown>): Record<string, unknown> {
  // Exclude display fields we render ourselves; suppress Vega title explicitly
  const {
    title: _t,
    _source: _s,
    _total_width: _w,
    _toggle_legend: _l,
    _legend_inactive_style: _lis,
    _legend_hide_mode: _lhm,
    _click_detail: _cd,
    _facet_fill: _ff,
    ...rest
  } = spec as Record<string, unknown>;
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
    inactiveStyle: spec._legend_inactive_style === 'strikethrough'
      ? 'strikethrough' as ChartLegendInactiveStyle
      : 'muted' as ChartLegendInactiveStyle,
    items: color.scale.domain.map((label, index) => ({
      label: String(label),
      color: color.scale?.range?.[index] ?? '#777',
    })),
  };
}

function applyHiddenSeriesOpacity(
  spec: Record<string, unknown>,
  field: string,
  hidden: Set<string>,
  mode: 'opacity' | 'filter' = 'opacity',
): Record<string, unknown> {
  if (!hidden.size) return spec;
  const test = `indexof(${JSON.stringify(Array.from(hidden))}, datum[${JSON.stringify(field)}]) < 0`;
  // `_legend_hide_mode: 'filter'` – vypnutá řada se z dat vyřadí (skládané sloupce se přeskládají
  // bez „děr“); výchozí režim jen zprůhlední značky a nechá osy i stack beze změny.
  if (mode === 'filter') {
    const transform = Array.isArray(spec.transform) ? spec.transform : [];
    return { ...spec, transform: [{ filter: test }, ...transform] };
  }
  const withOpacity = (unit: Record<string, unknown>): Record<string, unknown> => {
    const mark = unit.mark;
    const markOpacity = mark && typeof mark === 'object' && typeof (mark as { opacity?: unknown }).opacity === 'number'
      ? (mark as { opacity: number }).opacity
      : 1;
    const encoding = unit.encoding && typeof unit.encoding === 'object'
      ? unit.encoding as Record<string, unknown>
      : {};
    return {
      ...unit,
      encoding: {
        ...encoding,
        opacity: {
          condition: { test, value: markOpacity },
          value: 0,
        },
      },
    };
  };
  return Array.isArray(spec.layer)
    ? { ...spec, layer: (spec.layer as Record<string, unknown>[]).map(withOpacity) }
    : withOpacity(spec);
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

// `_click_detail` ve specu: kliknutí na značku otevře pod grafem panel s křížkem (vzor Flourish
// „popup panel“). `field` = text s položkami oddělenými \n (případně \t), `title` = pole do
// nadpisu panelu, `rows` = řádky s hodnotami (format 'pct' = procenta).
type ClickDetailConfig = {
  field: string;
  // volitelně: seznamy podle klíče (aby se dlouhý text neopakoval u každé značky)
  key?: string;
  items?: Record<string, string>;
  title?: string[];
  rows?: { field: string; label: string; format?: 'pct' }[];
  // volitelně: vodorovný pruh rozdělený na části (např. ženy × muži) s počty
  split?: { field: string; label: string; color: string }[];
};

function clickDetailConfig(spec: Record<string, unknown> | null): ClickDetailConfig | null {
  const cfg = spec?._click_detail as ClickDetailConfig | undefined;
  return cfg?.field ? cfg : null;
}

function ClickDetailPanel({ cfg, datum, onClose }: { cfg: ClickDetailConfig; datum: Record<string, unknown>; onClose: () => void }) {
  const raw = datum[cfg.field] ?? (cfg.key && cfg.items ? cfg.items[String(datum[cfg.key])] : '');
  // Řádek začínající „## “ otevírá oddíl (např. „## Ženy (13)“); bez oddílů jeden seřazený seznam.
  const sections: { head?: string; items: string[] }[] = [];
  for (const line of String(raw ?? '').split('\n')) {
    if (line.startsWith('## ')) { sections.push({ head: line.slice(3), items: [] }); continue; }
    if (!sections.length) sections.push({ items: [] });
    sections[sections.length - 1].items.push(...line.split('\t').map(s => s.trim()).filter(Boolean));
  }
  sections.forEach(s => s.items.sort((a, b) => a.localeCompare(b, 'cs')));
  const title = (cfg.title ?? []).map(f => datum[f]).filter(Boolean).join(' · ');
  return (
    <div style={{
      position: 'relative', marginTop: 10, padding: '10px 14px 12px', border: '1px solid #e8e3d2', borderRadius: 7,
      background: '#fdfbf7', color: TOOLTIP_INK, fontFamily: CHART_FONT, fontSize: 13.5, lineHeight: 1.4,
    }}>
      <button
        type="button"
        aria-label="Zavřít"
        onClick={onClose}
        style={{
          position: 'absolute', top: 6, right: 8, border: 'none', background: 'transparent', cursor: 'pointer',
          fontSize: 22, lineHeight: 1, color: TOOLTIP_INK, padding: 4,
        }}
      >×</button>
      {title && <div style={{ fontWeight: 700, fontSize: 15, paddingRight: 28 }}>{title}</div>}
      {cfg.rows?.length ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 16px', margin: '2px 0 8px' }}>
          {cfg.rows.map(r => {
            const v = datum[r.field];
            const text = r.format === 'pct' && typeof v === 'number'
              ? `${Math.round(v * 100)} %`
              : String(v ?? '');
            return <span key={r.field}>{r.label}: <strong>{text}</strong></span>;
          })}
        </div>
      ) : null}
      {cfg.split?.length ? (() => {
        const parts = cfg.split.map(p => ({ ...p, n: Number(datum[p.field] ?? 0) }));
        const total = parts.reduce((a, p) => a + p.n, 0) || 1;
        return (
          <div style={{ margin: '0 0 10px' }}>
            <div style={{ display: 'flex', height: 22, borderRadius: 3, overflow: 'hidden' }}>
              {parts.filter(p => p.n > 0).map(p => (
                <div key={p.field} style={{
                  width: `${(p.n / total) * 100}%`, background: p.color, color: '#ffffff', fontSize: 12, fontWeight: 700,
                  display: 'flex', alignItems: 'center', paddingLeft: 6, whiteSpace: 'nowrap', overflow: 'hidden',
                }}>{p.n}</div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: 12.5, marginTop: 3 }}>
              {parts.map(p => (
                <span key={p.field}>
                  <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 2, background: p.color, marginRight: 5 }} />
                  {p.label}: <strong>{p.n}</strong> ({Math.round((p.n / total) * 100)} %)
                </span>
              ))}
            </div>
          </div>
        );
      })() : null}
      {sections.map((sec, i) => (
        <div key={sec.head ?? i} style={{ marginTop: i ? 8 : 0 }}>
          {sec.head && <div style={{ fontWeight: 700, borderBottom: '1px solid #e8e3d2', marginBottom: 3 }}>{sec.head}</div>}
          <div style={{ columnWidth: 190, columnGap: 18 }}>
            {sec.items.map(item => <div key={item} style={{ breakInside: 'avoid' }}>{item}</div>)}
          </div>
        </div>
      ))}
    </div>
  );
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
  const hasEnteredViewRef = useRef(false);
  const initialRevealDoneRef = useRef(false);
  const pendingRevealSeriesRef = useRef<string[]>([]);
  const toggleLegend = useMemo(() => toggleLegendConfig(spec), [spec]);
  const clickDetail = useMemo(() => clickDetailConfig(spec), [spec]);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);

  const animateDataMarks = useCallback((direction: 'show' | 'hide', series?: string[]) => {
    const container = containerRef.current;
    if (!container || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return Promise.resolve();
    }
    const seriesColors = series?.length
      ? toggleLegend?.items
          .filter(item => series.includes(item.label))
          .map(item => item.color) ?? []
      : null;
    const normalizeColor = (color: string) => {
      const probe = document.createElement('span');
      probe.style.color = color;
      document.body.appendChild(probe);
      const normalized = getComputedStyle(probe).color;
      probe.remove();
      return normalized;
    };
    const normalizedSeriesColors = seriesColors?.map(normalizeColor);
    const marks = Array.from(container.querySelectorAll<SVGGraphicsElement>(
      '.mark-line path, .mark-area path, .mark-symbol path, .mark-rule path',
    )).filter(mark => {
      if (!normalizedSeriesColors) return true;
      const styles = getComputedStyle(mark);
      return normalizedSeriesColors.includes(styles.stroke) || normalizedSeriesColors.includes(styles.fill);
    });
    if (!marks.length) return Promise.resolve();

    const keyframes = direction === 'show'
      ? [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }]
      : [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 0 100%)' }];
    const finalClipPath = direction === 'show'
      ? 'inset(0 0 0 0)'
      : 'inset(0 0 0 100%)';
    const animations = marks.map(mark => mark.animate(keyframes, {
      duration: 1600,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'forwards',
    }));
    return Promise.all(animations.map(animation => animation.finished.catch(() => undefined))).then(() => {
      // Preserve the exact final frame before removing the Web Animations
      // layer. Otherwise clip-path briefly jumps from a nearly-open inset to
      // `none`, which causes a visible flash at the end of the reveal.
      marks.forEach(mark => { mark.style.clipPath = finalClipPath; });
      animations.forEach(animation => animation.cancel());
    });
  }, [toggleLegend]);

  useEffect(() => {
    setHiddenSeries(new Set());
    setDetail(null);
    initialRevealDoneRef.current = false;
    pendingRevealSeriesRef.current = [];
  }, [spec]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      hasEnteredViewRef.current = true;
      if (!initialRevealDoneRef.current && container.querySelector('svg')) {
        initialRevealDoneRef.current = true;
        void animateDataMarks('show');
      }
      observer.disconnect();
    }, { threshold: 0.18 });
    observer.observe(container);
    return () => observer.disconnect();
  }, [animateDataMarks]);

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
    const hideMode = spec._legend_hide_mode === 'filter' ? 'filter' : 'opacity';
    const base = toggleLegend ? applyHiddenSeriesOpacity(stripped, toggleLegend.field, hiddenSeries, hideMode) : stripped;
    let final: Record<string, unknown>;
    let facetFit: { w: number; cols: number; tile: number } | null = null;

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
      // `_facet_fill`: mřížka (facet) vyplní celou šíři karty – šířku dlaždice dopočítáme z kontejneru,
      // na úzkém displeji ubereme sloupec. { label: šířka popisků osy Y v px, minColumns }
      const fill = spec._facet_fill as { label?: number; narrowColumns?: number } | undefined;
      const inner = (final.spec ?? null) as Record<string, unknown> | null;
      if (fill && inner && 'facet' in final && containerRef.current) {
        const w = containerRef.current.getBoundingClientRect().width;
        const baseCols = Number(final.columns ?? 3);
        const cols = w < 420 ? 1 : w < 560 ? Math.min(baseCols, fill.narrowColumns ?? 2) : baseCols;
        const spacing = final.spacing as { column?: number } | number | undefined;
        const gap = typeof spacing === 'number' ? spacing : spacing?.column ?? 16;
        const tile = Math.max(80, Math.floor((w - cols * (fill.label ?? 40) - (cols - 1) * gap - 4) / cols));
        final = { ...final, columns: cols, spec: { ...inner, width: tile } };
        facetFit = { w, cols, tile };
      }
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
      const render = (finalSpec: Record<string, unknown>, attempt: number): void => {
        if (!containerRef.current) return;
        viewRef.current?.finalize();
        // Vega Embed appends its wrapper. During hot reload or a spec update the
        // finalized SVG otherwise remains in the container and doubles its height.
        containerRef.current.replaceChildren();
        embed(containerRef.current, finalSpec as never, {
          actions: false,
          renderer: 'svg',
          formatLocale: CS_NUMBER_LOCALE,
          timeFormatLocale: CS_TIME_LOCALE,
          tooltip: hasPointerTooltip ? false : makeDpbpTooltipHandler(seriesColorMap(spec)),
        }).then(result => {
          viewRef.current = result.view as unknown as { finalize: () => void };
          // _facet_fill: popisky os mají jinou šířku, než jsme odhadli – jednou změříme skutečnou
          // šířku mřížky a dlaždice o rozdíl rozšíříme/zúžíme, aby graf sahal přesně od kraje do kraje.
          if (facetFit && attempt === 0) {
            const svg = containerRef.current?.querySelector('svg');
            const diff = facetFit.w - (svg?.getBoundingClientRect().width ?? facetFit.w);
            if (Math.abs(diff) > 2) {
              const inner = finalSpec.spec as Record<string, unknown>;
              const tile = facetFit.tile + Math.floor(diff / facetFit.cols);
              render({ ...finalSpec, spec: { ...inner, width: tile } }, 1);
              return;
            }
          }
          const cd = clickDetailConfig(spec);
          if (cd) {
            result.view.addEventListener('click', (_event, item) => {
              const datum = (item as { datum?: Record<string, unknown> } | null | undefined)?.datum;
              if (datum && (datum[cd.field] || (cd.key && cd.items?.[String(datum[cd.key])]))) setDetail(datum);
            });
          }
          const pendingSeries = pendingRevealSeriesRef.current;
          if (pendingSeries.length) {
            pendingRevealSeriesRef.current = [];
            void animateDataMarks('show', pendingSeries);
          } else if (hasEnteredViewRef.current && !initialRevealDoneRef.current) {
            initialRevealDoneRef.current = true;
            void animateDataMarks('show');
          }
        }).catch(e => setError(String(e)));
      };
      render(final, 0);
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
  // The vertical crosshair guide is meaningful only for time-series charts that
  // read a value at the cursor's x (line/area). Categorical charts (bar/dot) use
  // per-mark tooltips instead, so the guide there is just visual noise.
  const hasPointerGuide = spec ? Boolean(pointerTooltipAt(spec, 0)) : false;
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
      {hasPointerGuide && hoverRatio !== null && (
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
            padding: 0,
            overflow: 'hidden',
            border: '1px solid #e8e3d2',
            borderRadius: 7,
            background: 'rgba(248, 246, 240, 0.97)',
            boxShadow: '0 4px 10px rgba(16, 20, 50, 0.14)',
            color: TOOLTIP_INK,
            fontFamily: 'var(--font-roboto-slab), Georgia, serif',
            fontSize: 13,
            lineHeight: 1.35,
            pointerEvents: 'none',
          }}
        >
          {/* Lišta nahoře: datum/kategorie bílým písmem na ink blue (časová řada
              nemá jednu barvu položky – barvy sérií nesou čtverečky v řádcích). */}
          <div style={{
            fontWeight: 700,
            fontSize: 13.5,
            color: '#ffffff',
            background: TOOLTIP_INK,
            whiteSpace: 'nowrap',
            padding: '5px 10px',
          }}>{tooltip.label}</div>
          <div style={{ padding: '6px 10px 8px' }}>
          {tooltip.rows.map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 14 }}>
              <span style={{ color: TOOLTIP_INK, whiteSpace: 'nowrap' }}>
                {row.color && (
                  <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 2, marginRight: 6, background: row.color }} />
                )}
                {row.label}
              </span>
              <strong style={{ color: TOOLTIP_INK, whiteSpace: 'nowrap' }}>{row.value}</strong>
            </div>
          ))}
          </div>
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
          {/* A "\n" in a panel title splits it into a bold name line and a
              regular-weight, non-wrapping detail line (e.g. "ANO\n0 → 7 602"),
              so every panel of the row reads the same way. */}
          {meta.title && meta.title.split('\n').map((line, i) => (
            <div key={i} style={i === 0 ? undefined : { fontWeight: 400, color: '#333333', whiteSpace: 'nowrap' }}>
              {renderTitle(line)}
            </div>
          ))}
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
        <ChartLegend
          items={toggleLegend.items.map(item => ({ key: item.label, ...item }))}
          activeKeys={toggleLegend.items.filter(item => !hiddenSeries.has(item.label)).map(item => item.label)}
          inactiveStyle={toggleLegend.inactiveStyle}
          marginBottom={8}
          onChange={activeKeys => {
            const active = new Set(activeKeys);
            const nextHidden = new Set(toggleLegend.items.filter(item => !active.has(item.label)).map(item => item.label));
            const turningOff = Array.from(nextHidden).filter(label => !hiddenSeries.has(label));
            const turningOn = Array.from(hiddenSeries).filter(label => !nextHidden.has(label));
            if (turningOff.length) {
              void animateDataMarks('hide', turningOff).then(() => setHiddenSeries(nextHidden));
              return;
            }
            if (turningOn.length) pendingRevealSeriesRef.current = turningOn;
            setHiddenSeries(nextHidden);
          }}
        />
      )}
      <div style={{ overflowX: isConcat ? 'auto' : 'hidden', cursor: clickDetail ? 'pointer' : undefined }}>
        {chartCanvas(200, isConcat && totalWidth ? `${totalWidth}px` : '100%')}
      </div>
      {clickDetail && detail && <ClickDetailPanel cfg={clickDetail} datum={detail} onClose={() => setDetail(null)} />}
    </ChartCard>
  );
}
