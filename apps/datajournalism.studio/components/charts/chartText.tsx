// Shared rich-text renderers for chart titles/subtitles/sources — used by
// both ChartCard (a single chart's own header/footer) and ChartRow (one
// shared header/footer for a group of charts), so the two never drift into
// two different badge/swatch implementations.

// Perceived brightness (YIQ) → pick black or white text so a badge of any
// background color stays legible without hardcoding per-color text choices.
export function contrastTextColor(bgHex: string): string {
  const hex = bgHex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? '#1a1a1a' : '#ffffff';
}

// Title rich-text syntax: {word|#hexcolor} renders as a colored pill badge
// (background = hexcolor, text = auto black/white for contrast) — e.g. to
// name an entity (a country, a party) whose color also appears in the
// chart's own series/legend, so the headline visually ties back to the
// chart. A title with no {..|..} markers renders exactly as before.
export function renderTitle(title: string) {
  const parts: React.ReactNode[] = [];
  const re = /\{([^|{}]+)\|(#[0-9a-fA-F]{6})\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(title)) !== null) {
    if (m.index > last) parts.push(title.slice(last, m.index));
    const bg = m[2];
    parts.push(
      <span key={i++} style={{
        background: bg,
        color: contrastTextColor(bg),
        borderRadius: 0,
        padding: '1px 6px',
        whiteSpace: 'nowrap',
      }}>
        {m[1]}
      </span>
    );
    last = m.index + m[0].length;
  }
  parts.push(title.slice(last));
  return parts;
}

// Subtitle rich-text syntax: {line}, {dashed} and {band} render small inline
// swatches that actually mirror a chart's own mark styling (2.5px solid +
// point marker for a "current year" line; a 1.8px dashed stroke, no point,
// for a comparison-year line; a translucent 0.15-opacity rectangle for a
// band) — a plain text/Unicode glyph can't carry stroke width, dash pattern
// or opacity, so this draws real SVG/CSS instead. Neutral ink-gray, since
// these explain what a *mark type* means (this year vs. a past year vs. a
// historical range), not which color belongs to which entity — that's the
// title badge or legend. A subtitle with none of these markers renders
// exactly as before.
export function renderSubtitle(subtitle: string) {
  const parts: React.ReactNode[] = [];
  const re = /\{(line|dashed|band)\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(subtitle)) !== null) {
    if (m.index > last) parts.push(subtitle.slice(last, m.index));
    if (m[1] === 'line') {
      parts.push(
        <svg key={i++} width="22" height="12" style={{ verticalAlign: 'middle', margin: '0 2px' }}>
          <line x1="1" y1="6" x2="16" y2="6" stroke="#333333" strokeWidth="2.5" />
          <circle cx="16" cy="6" r="2.5" fill="#333333" />
        </svg>
      );
    } else if (m[1] === 'dashed') {
      parts.push(
        <svg key={i++} width="22" height="12" style={{ verticalAlign: 'middle', margin: '0 2px' }}>
          <line x1="1" y1="6" x2="20" y2="6" stroke="#333333" strokeWidth="1.8" strokeDasharray="4,3" />
        </svg>
      );
    } else {
      parts.push(
        <span key={i++} style={{
          display: 'inline-block',
          width: 16, height: 11,
          background: '#333333',
          opacity: 0.15,
          verticalAlign: 'middle',
          margin: '0 2px',
        }} />
      );
    }
    last = m.index + m[0].length;
  }
  parts.push(subtitle.slice(last));
  return parts;
}

export function renderSource(src: string) {
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

export function shouldUseStackedBrand(title?: string, subtitle?: string) {
  return (title?.length ?? 0) > 58 || (subtitle?.length ?? 0) > 92;
}
