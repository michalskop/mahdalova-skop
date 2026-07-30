import ChartFrame, { NUM_FONT } from './ChartFrame';
import { countryPresence2026, countryPresenceTotal, czCountry } from './countries';

// Treemap produkčních zemí – transplantát „Big Five" treemapu z World Cup
// speciálu Reuters (pár velkých dlaždic vs. šedá masa „ostatních"). Ukazuje
// koncentraci programu do několika zemí a zároveň délku ocasu. Domácí země
// (Česko) je zvýrazněná zlatě jako záměrná in-chart anotace „to jsme my".

const TOP_N = 10;
const VIEW_W = 1000;
const VIEW_H = 500;

type Tile = { cz: string; value: number; kind: 'home' | 'named' | 'other'; note?: string };

type Rect = Tile & { x: number; y: number; w: number; h: number };

const FILL: Record<Tile['kind'], string> = {
  home: 'var(--mantine-color-brandYellow-8)', // #bd9103 – domácí kinematografie
  named: 'var(--mantine-color-brandNavy-6)', // #6267a3
  other: 'var(--mantine-color-background-8)', // #c8c8bc – šedá masa
};

const TEXT_ON: Record<Tile['kind'], string> = {
  home: '#101432',
  named: '#ffffff',
  other: '#1a1a1a',
};

// Squarified treemap (Bruls et al.) – řádky se skládají podél kratší strany
// tak, aby dlaždice byly co nejblíž čtverci.
function squarify(tiles: Tile[], width: number, height: number): Rect[] {
  const total = tiles.reduce((s, t) => s + t.value, 0);
  const scale = (width * height) / total;
  const items = tiles.map((t) => ({ ...t, area: t.value * scale }));
  const out: Rect[] = [];
  const box = { x: 0, y: 0, w: width, h: height };

  const worst = (row: typeof items, side: number) => {
    const areas = row.map((r) => r.area);
    const sum = areas.reduce((a, b) => a + b, 0);
    const mx = Math.max(...areas);
    const mn = Math.min(...areas);
    return Math.max((side * side * mx) / (sum * sum), (sum * sum) / (side * side * mn));
  };

  const layout = (row: typeof items) => {
    const sum = row.reduce((a, b) => a + b.area, 0);
    const horizontal = box.w >= box.h;
    const side = horizontal ? box.h : box.w;
    const thickness = sum / side;
    let pos = horizontal ? box.y : box.x;
    for (const r of row) {
      const len = r.area / thickness;
      if (horizontal) {
        out.push({ ...r, x: box.x, y: pos, w: thickness, h: len });
      } else {
        out.push({ ...r, x: pos, y: box.y, w: len, h: thickness });
      }
      pos += len;
    }
    if (horizontal) { box.x += thickness; box.w -= thickness; }
    else { box.y += thickness; box.h -= thickness; }
  };

  let row: typeof items = [];
  const queue = [...items];
  while (queue.length) {
    const side = Math.min(box.w, box.h);
    const next = queue[0];
    if (row.length === 0) { row.push(next); queue.shift(); continue; }
    if (worst([...row, next], side) <= worst(row, side)) { row.push(next); queue.shift(); }
    else { layout(row); row = []; }
  }
  if (row.length) layout(row);
  return out;
}

export default function FilmOriginsTreemap() {
  const sorted = [...countryPresence2026].sort((a, b) => b.count - a.count);
  const top = sorted.slice(0, TOP_N);
  const rest = sorted.slice(TOP_N);
  const restSum = rest.reduce((s, r) => s + r.count, 0);
  const top5Share = Math.round((sorted.slice(0, 5).reduce((s, r) => s + r.count, 0) / countryPresenceTotal) * 100);

  const tiles: Tile[] = [
    ...top.map<Tile>((row) => ({
      cz: czCountry(row.country),
      value: row.count,
      kind: row.country === 'Czech Republic' ? 'home' : 'named',
      note: row.country === 'Czech Republic' ? 'domácí' : undefined,
    })),
    { cz: 'Ostatní země', value: restSum, kind: 'other', note: `${rest.length} zemí, každá 1–${rest[0]?.count ?? 1} filmů` },
  ];

  const rects = squarify(tiles, VIEW_W, VIEW_H);

  return (
    <ChartFrame
      title={`Pět zemí stojí za dvěma pětinami programu`}
      subtitle={`Filmy 60. ročníku (2026) podle uvedené produkční země; jeden film může mít víc zemí. Top 5 zemí = ${top5Share} % všech účastí, celkem ${countryPresenceTotal} účastí z 65 zemí.`}
      source="Oficiální archiv filmu KVIFF, lokální country export"
      fullWidth
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" role="img" aria-label="Treemap produkčních zemí 60. ročníku: velikost dlaždice odpovídá počtu filmů dané země. Největší jsou Francie, USA a Česko; 55 dalších zemí tvoří dohromady ostatní menší dlaždice." style={{ display: 'block' }}>
        {rects.map((r) => {
          const pad = 8;
          const showName = r.w > 78 && r.h > 40;
          const showValue = r.w > 44 && r.h > 30;
          const nameSize = Math.max(13, Math.min(30, r.w / 6));
          return (
            <g key={r.cz}>
              <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={FILL[r.kind]} stroke="#f8f6f0" strokeWidth={3} rx={3}>
                <title>{`${r.cz}: ${r.value}`}</title>
              </rect>
              {showName && (
                <text x={r.x + pad} y={r.y + pad + nameSize * 0.85} style={{ ...NUM_FONT, fontSize: nameSize, fontWeight: 800, fill: TEXT_ON[r.kind] }}>
                  {r.cz}
                </text>
              )}
              {showValue && (
                <text x={r.x + pad} y={showName ? r.y + pad + nameSize * 0.85 + nameSize * 0.95 : r.y + r.h / 2 + 6} style={{ ...NUM_FONT, fontSize: Math.max(12, nameSize * 0.7), fontWeight: 700, fill: TEXT_ON[r.kind] }}>
                  {r.value}
                </text>
              )}
              {r.note && r.w > 120 && r.h > 66 && (
                <text x={r.x + pad} y={r.y + r.h - pad} style={{ ...NUM_FONT, fontSize: 12, fill: TEXT_ON[r.kind], opacity: 0.85 }}>
                  {r.note}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <p style={{ ...NUM_FONT, fontSize: 14, color: '#333333', marginTop: 10, lineHeight: 1.5 }}>
        Velikost dlaždice odpovídá počtu filmů, u kterých je země uvedena jako produkční. Domácí Česko je třetí největší; menší evropské a mimoevropské kinematografie se dělí o zbytek programu.
      </p>
    </ChartFrame>
  );
}
