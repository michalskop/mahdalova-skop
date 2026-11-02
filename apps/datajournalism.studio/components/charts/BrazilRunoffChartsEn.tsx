'use client';

// English one-off charts for the article elections-brazil-2026-10-25-lula-wins-runoff-prediction
// (translated from apps/web/components/charts/BrazilRunoffCharts.tsx):
//  - <BrazilRunoffTimelineEn /> runoff election night: DataTimes prediction vs running count by share counted
//  - <BrazilRunoffStatesEn />   predicted final result by state (Lula's share of the two-candidate vote)
// Self-contained apart from ChartCard and ChartLegend: palette, helpers and data are copied here.
// Data values unchanged from apps/web/components/charts/brazil2026RunoffData.ts.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import ChartCard from './ChartCard';
import ChartLegend from './ChartLegend';

const C = {
  ink: '#101432',
  ink2: '#4c4f8e',
  grid: '#eeeae2',
  beige: '#bcbcb0',
  bandRun: '#e9ecf4',
  flavio: '#0b6b4e',
  lula: '#f76800',
};
const FONT = 'var(--font-roboto-condensed), Arial, sans-serif';
const fmt = (v: number, d = 1) => v.toFixed(d);

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

type Tip = { x: number; y: number; body: ReactNode } | null;

function Tooltip({ tip, width }: { tip: Tip; width: number }) {
  if (!tip) return null;
  const right = tip.x > width - 240;
  return (
    <div
      style={{
        position: 'absolute', pointerEvents: 'none', top: Math.max(0, tip.y - 60),
        left: right ? undefined : tip.x + 14, right: right ? width - tip.x + 14 : undefined,
        background: '#fff', border: `1px solid ${C.grid}`, borderRadius: 6, padding: '8px 10px',
        fontFamily: FONT, fontSize: 12.5, lineHeight: 1.45, color: C.ink,
        boxShadow: '0 4px 14px rgba(16,20,50,.10)', whiteSpace: 'nowrap', zIndex: 2,
      }}
    >
      {tip.body}
    </div>
  );
}

// Data: Brazil 2026 presidential runoff (25–26 Oct 2026), live Mahdalová & Škop model on TSE data, as of 00:58 CET.
// RUNOFF rows: [minutes after 21:00 CET, predicted Lula %, interval low, interval high, running count Lula %, % of voters counted]
// STATES: Lula's estimated two-candidate share, interval, % of voters counted, first-round winner
const RUNOFF: (number | null)[][] = [[12.83, 51.543, null, null, 59.149, 0.37], [14.83, 51.584, null, null, 56.484, 0.5], [16.83, 51.598, null, null, 56.142, 0.51], [132.28, 51.697, 47.585, 55.809, 55.151, 0.61], [134.28, 51.706, 47.728, 55.684, 54.326, 0.73], [136.28, 51.756, 47.804, 55.707, 54.272, 0.75], [138.28, 51.662, 48.376, 54.948, 52.596, 1.64], [140.28, 51.623, 48.493, 54.752, 52.114, 1.9], [142.08, 51.619, 48.518, 54.719, 52.058, 1.98], [144.8, 51.592, 48.625, 54.56, 51.666, 2.38], [146.8, 51.589, 48.716, 54.462, 51.615, 2.73], [148.8, 51.569, 48.934, 54.203, 51.267, 3.33], [150.8, 51.58, 48.973, 54.187, 51.342, 3.45], [152.8, 51.57, 49.264, 53.877, 51.383, 4.51], [155.05, 51.564, 49.36, 53.768, 51.203, 5.22], [157.05, 51.569, 49.372, 53.767, 51.23, 5.28], [159.3, 51.553, 49.796, 53.31, 51.002, 7.47], [161.55, 51.547, 49.81, 53.284, 50.798, 7.63], [163.8, 51.55, 49.84, 53.259, 50.818, 8.52], [165.8, 51.578, 50.083, 53.074, 50.467, 10.17], [167.55, 51.575, 50.086, 53.064, 50.539, 10.26], [169.8, 51.583, 50.392, 52.773, 50.213, 12.93], [171.55, 51.582, 50.555, 52.608, 50.099, 13.26], [174.05, 51.585, 50.634, 52.536, 50.105, 14.11], [175.8, 51.58, 50.694, 52.465, 49.89, 15.62], [178.05, 51.58, 50.694, 52.465, 49.888, 15.63], [180.05, 51.592, 50.753, 52.432, 49.778, 17.15], [182.05, 51.594, 50.759, 52.429, 49.758, 17.34], [184.3, 51.609, 50.795, 52.424, 49.773, 18.4], [186.8, 51.617, 50.882, 52.351, 49.575, 19.99], [188.8, 51.617, 50.891, 52.343, 49.646, 20.81], [191.3, 51.629, 50.993, 52.265, 49.659, 23.0], [193.8, 51.638, 51.025, 52.251, 49.565, 23.67], [196.3, 51.65, 51.125, 52.175, 49.933, 27.07], [199.3, 51.683, 51.267, 52.099, 49.668, 29.26], [202.55, 51.705, 51.341, 52.068, 49.84, 33.73], [205.55, 51.711, 51.383, 52.039, 49.881, 37.16], [208.8, 51.722, 51.419, 52.024, 49.811, 39.71], [212.05, 51.732, 51.464, 51.999, 50.045, 43.59], [215.55, 51.736, 51.487, 51.985, 50.102, 45.93], [219.07, 51.741, 51.526, 51.955, 50.2, 50.59], [222.57, 51.751, 51.567, 51.935, 50.421, 55.76], [228.18, 51.762, 51.601, 51.922, 50.585, 60.06], [231.93, 51.764, 51.626, 51.901, 51.042, 64.76], [235.93, 51.771, 51.648, 51.893, 50.99, 68.2]];
const STATES: { k: string; n: string; l: number; lo: number; hi: number; c: number; lead: number; k1: string | null }[] = [{"k": "AC", "n": "Acre", "l": 33.43, "lo": 33.4, "hi": 33.46, "c": 98.4, "lead": -143317, "k1": "F"}, {"k": "AL", "n": "Alagoas", "l": 60.76, "lo": 60.67, "hi": 60.84, "c": 89.7, "lead": 408186, "k1": "L"}, {"k": "AM", "n": "Amazonas", "l": 54.02, "lo": 53.95, "hi": 54.09, "c": 92.1, "lead": 170444, "k1": "L"}, {"k": "AP", "n": "Amapá", "l": 52.88, "lo": 52.86, "hi": 52.9, "c": 99.1, "lead": 24286, "k1": "L"}, {"k": "BA", "n": "Bahia", "l": 71.35, "lo": 71.14, "hi": 71.56, "c": 55.7, "lead": 3878239, "k1": "L"}, {"k": "CE", "n": "Ceará", "l": 68.96, "lo": 68.83, "hi": 69.09, "c": 75.7, "lead": 2218696, "k1": "L"}, {"k": "DF", "n": "Federal District", "l": 45.72, "lo": 45.69, "hi": 45.74, "c": 97.6, "lead": -154651, "k1": "F"}, {"k": "ES", "n": "Espírito Santo", "l": 43.67, "lo": 43.63, "hi": 43.7, "c": 96.6, "lead": -290895, "k1": "F"}, {"k": "GO", "n": "Goiás", "l": 40.38, "lo": 40.26, "hi": 40.5, "c": 80.8, "lead": -756625, "k1": "F"}, {"k": "MA", "n": "Maranhão", "l": 69.53, "lo": 69.47, "hi": 69.59, "c": 91.2, "lead": 1578153, "k1": "L"}, {"k": "MG", "n": "Minas Gerais", "l": 50.48, "lo": 50.33, "hi": 50.63, "c": 64.3, "lead": 121617, "k1": "F"}, {"k": "MS", "n": "Mato Grosso do Sul", "l": 40.39, "lo": 40.36, "hi": 40.42, "c": 97.5, "lead": -299090, "k1": "F"}, {"k": "MT", "n": "Mato Grosso", "l": 33.94, "lo": 33.83, "hi": 34.05, "c": 86.6, "lead": -656655, "k1": "F"}, {"k": "PA", "n": "Pará", "l": 55.01, "lo": 54.93, "hi": 55.08, "c": 88.3, "lead": 489653, "k1": "L"}, {"k": "PB", "n": "Paraíba", "l": 67.48, "lo": 67.43, "hi": 67.54, "c": 93.7, "lead": 930194, "k1": "L"}, {"k": "PE", "n": "Pernambuco", "l": 69.22, "lo": 69.07, "hi": 69.37, "c": 72.2, "lead": 2285933, "k1": "L"}, {"k": "PI", "n": "Piauí", "l": 75.87, "lo": 75.64, "hi": 76.1, "c": 67.6, "lead": 1129245, "k1": "L"}, {"k": "PR", "n": "Paraná", "l": 37.43, "lo": 37.41, "hi": 37.44, "c": 98.0, "lead": -1724707, "k1": "F"}, {"k": "RJ", "n": "Rio de Janeiro", "l": 46.63, "lo": 46.12, "hi": 47.15, "c": 18.4, "lead": -659821, "k1": "F"}, {"k": "RN", "n": "Rio Grande do Norte", "l": 65.73, "lo": 65.62, "hi": 65.84, "c": 85.8, "lead": 677783, "k1": "L"}, {"k": "RO", "n": "Rondônia", "l": 30.39, "lo": 30.27, "hi": 30.51, "c": 88.5, "lead": -379720, "k1": "F"}, {"k": "RR", "n": "Roraima", "l": 27.54, "lo": 27.5, "hi": 27.58, "c": 99.8, "lead": -136208, "k1": "F"}, {"k": "RS", "n": "Rio Grande do Sul", "l": 42.16, "lo": 42.08, "hi": 42.26, "c": 83.3, "lead": -1049820, "k1": "F"}, {"k": "SC", "n": "Santa Catarina", "l": 30.56, "lo": 30.5, "hi": 30.63, "c": 89.9, "lead": -1803103, "k1": "F"}, {"k": "SE", "n": "Sergipe", "l": 69.25, "lo": 68.45, "hi": 70.04, "c": 22.6, "lead": 549158, "k1": "L"}, {"k": "SP", "n": "São Paulo", "l": 46.16, "lo": 45.99, "hi": 46.33, "c": 51.2, "lead": -2014736, "k1": "F"}, {"k": "TO", "n": "Tocantins", "l": 48.63, "lo": 48.59, "hi": 48.67, "c": 96.9, "lead": -25000, "k1": "F"}, {"k": "ZZ", "n": "Voters abroad", "l": 53.91, "lo": 51.93, "hi": 55.88, "c": 64.4, "lead": 28595, "k1": null}];
const STAV = '00:58 CET';

type P = { m: number; s: number; lo: number | null; hi: number | null; r: number; c: number };
const PTS: P[] = RUNOFF.map(([m, s, lo, hi, r, c]) => ({ m: m!, s: s!, lo, hi, r: r!, c: c! }));
const LAST = PTS[PTS.length - 1];

const hhmm = (m: number) => {
  const t = Math.floor(m) + 21 * 60;
  return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

const TL_LEGEND = [
  { key: 'model', label: 'Prediction: Lula (band = 90% interval)', color: C.lula },
  { key: 'count', label: 'Running count: Lula', color: C.ink2 },
];
const SOURCE = 'live Mahdalová & Škop model on running data from the [TSE](https://resultados.tse.jus.br/)';

export function BrazilRunoffTimelineEn() {
  const [ref, W] = useWidth<HTMLDivElement>();
  const [tip, setTip] = useState<Tip>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [active, setActive] = useState<string[]>(TL_LEGEND.map((l) => l.key));
  const on = (k: string) => active.includes(k);
  const narrow = W < 640;
  const H = narrow ? 380 : 420;
  const M = { l: narrow ? 30 : 40, r: narrow ? 10 : 20, t: 26, b: 44 };
  const X1 = Math.max(10, Math.ceil(LAST.c / 10) * 10);
  const Y0 = 46, Y1 = 56;
  const x = (c: number) => M.l + (c / X1) * (W - M.l - M.r);
  const y = (v: number) => M.t + ((Y1 - v) / (Y1 - Y0)) * (H - M.t - M.b);
  const yc = (v: number) => y(Math.max(Y0, Math.min(Y1, v)));
  const line = (k: 's' | 'r') => PTS.map((p, i) => `${i ? 'L' : 'M'}${x(p.c).toFixed(1)},${yc(p[k]).toFixed(1)}`).join('');
  const band = PTS.filter((p) => p.lo !== null && p.hi !== null);
  const bandD = band.length
    ? band.map((p, i) => `${i ? 'L' : 'M'}${x(p.c).toFixed(1)},${yc(p.hi!).toFixed(1)}`).join('') +
      [...band].reverse().map((p) => `L${x(p.c).toFixed(1)},${yc(p.lo!).toFixed(1)}`).join('') + 'Z'
    : '';
  // stretch during which the running count showed Flávio ahead
  const below = PTS.filter((p) => p.c >= 1 && p.r < 50);
  const bFrom = below[0], bLast = below[below.length - 1];
  const bTo = bLast && (PTS.find((p) => p.m > bLast.m && p.r >= 50) ?? bLast);
  const lab: React.CSSProperties = { fontSize: narrow ? 11.5 : 12.5, fill: C.ink, fontFamily: FONT };
  const labB: React.CSSProperties = { ...lab, fontWeight: 600 };
  const tick: React.CSSProperties = { fontSize: 11.5, fill: C.ink, fontFamily: FONT };
  const yTicks = narrow ? [46, 50, 54] : [46, 48, 50, 52, 54, 56];
  const xTicks = Array.from({ length: X1 / 10 + 1 }, (_, i) => i * 10).filter((v) => !narrow || v % 20 === 0);

  function onMove(e: React.PointerEvent<SVGRectElement>) {
    const r = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
    const c = ((e.clientX - r.left - M.l) / (W - M.l - M.r)) * X1;
    let i = 0;
    while (i < PTS.length - 1 && Math.abs(PTS[i + 1].c - c) <= Math.abs(PTS[i].c - c)) i++;
    const p = PTS[i];
    setHover(i);
    setTip({ x: x(p.c), y: yc(Math.max(p.s, p.r)), body: <>
      <strong>{hhmm(p.m)} CET</strong> · {fmt(p.c, 1)}% of voters counted<br />
      <span style={{ color: C.lula }}>●</span> prediction Lula <strong>{fmt(p.s, 2)}%</strong>
      {p.lo !== null && <span style={{ color: C.ink2 }}> ({fmt(p.lo, 1)}–{fmt(p.hi!, 1)})</span>}<br />
      <span style={{ color: C.ink2 }}>●</span> running count Lula {fmt(p.r, 2)}%, Flávio {fmt(100 - p.r, 2)}%
    </> });
  }

  return (
    <div style={{ clear: 'both' }}>
      <ChartCard title="The running count swung, the prediction showed Lula ahead all night"
        subtitle={`Lula's share of the two-candidate vote (%) by share of voters counted • 25–26 October 2026, as of ${STAV}`} source={SOURCE}>
        <ChartLegend items={TL_LEGEND} activeKeys={active} onChange={setActive} />
        <div ref={ref} style={{ position: 'relative', width: '100%' }}>
          {W > 0 && (
            <svg width={W} height={H} role="img" style={{ display: 'block', overflow: 'visible' }}
              aria-label={`The DataTimes.cz prediction gave Lula between ${fmt(Math.min(...PTS.map((p) => p.s)), 1)} and ${fmt(Math.max(...PTS.map((p) => p.s)), 1)}% all night. Meanwhile the running count fell below 50% and showed Flávio Bolsonaro in the lead.`}>
              <rect x={M.l} y={y(50)} width={W - M.l - M.r} height={y(Y0) - y(50)} fill={C.bandRun} opacity={0.7} />
              {yTicks.map((v) => (
                <g key={v}>
                  {v !== 50 && <line x1={M.l} x2={W - M.r} y1={y(v)} y2={y(v)} stroke={C.grid} />}
                  <text x={M.l - 7} y={y(v) + 4} textAnchor="end" style={tick}>{v}</text>
                </g>
              ))}
              {xTicks.map((v) => (
                <g key={v}>
                  <line x1={x(v)} x2={x(v)} y1={H - M.b} y2={H - M.b + 4} stroke={C.beige} />
                  <text x={x(v)} y={H - M.b + 18} textAnchor="middle" style={tick}>{v}%</text>
                </g>
              ))}
              <text x={W - M.r} y={H - 4} textAnchor="end" style={{ ...tick, fill: C.ink2 }}>counted, % of registered voters →</text>
              <line x1={M.l} x2={W - M.r} y1={y(50)} y2={y(50)} stroke={C.ink} strokeWidth={1.5} strokeDasharray="6 4" />
              <text x={M.l + 6} y={y(50) - 7} style={{ ...labB, fill: C.lula }}>{narrow ? '' : '↑ Lula wins'}</text>
              <text x={M.l + 6} y={y(Y0) - 8} style={{ ...labB, fill: C.flavio }}>↓ below the line, Flávio Bolsonaro would win</text>

              {on('model') && <path d={bandD} fill={C.lula} opacity={0.16} />}
              {on('count') && bFrom && bTo && (
                <text x={(x(bFrom.c) + x(bTo.c)) / 2} y={y(48.6)} textAnchor="middle" style={{ ...labB, fill: C.ink2 }}>
                  {narrow ? 'Flávio led the count' : `${hhmm(bFrom.m)}–${hhmm(bTo.m)}: Flávio led the running count`}
                </text>
              )}
              {on('count') && <path d={line('r')} fill="none" stroke={C.ink2} strokeWidth={2} strokeDasharray="4 3" strokeLinejoin="round" />}
              {on('model') && <path d={line('s')} fill="none" stroke={C.lula} strokeWidth={3} strokeLinejoin="round" />}
              {on('model') && (
                <text x={x(LAST.c) - 4} y={y(LAST.s) - 12} textAnchor="end" style={{ ...labB, fill: C.lula }}>prediction {fmt(LAST.s, 2)}%</text>
              )}
              {on('count') && (
                <text x={x(LAST.c) - 4} y={yc(LAST.r) + 18} textAnchor="end" style={{ ...labB, fill: C.ink2 }}>running count {fmt(LAST.r, 2)}%</text>
              )}
              {hover !== null && (
                <>
                  <line x1={x(PTS[hover].c)} x2={x(PTS[hover].c)} y1={M.t} y2={H - M.b} stroke={C.ink} opacity={0.25} />
                  {on('model') && <circle cx={x(PTS[hover].c)} cy={yc(PTS[hover].s)} r={4.5} fill={C.lula} stroke="#fff" strokeWidth={2} />}
                  {on('count') && <circle cx={x(PTS[hover].c)} cy={yc(PTS[hover].r)} r={4.5} fill={C.ink2} stroke="#fff" strokeWidth={2} />}
                </>
              )}
              <rect x={M.l - 8} y={M.t} width={W - M.l - M.r + 8} height={H - M.t - M.b} fill="transparent" style={{ touchAction: 'pan-y' }}
                onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => { setTip(null); setHover(null); }} />
            </svg>
          )}
          <Tooltip tip={tip} width={W} />
        </div>
        <p style={{ fontFamily: FONT, fontSize: 15, lineHeight: 1.5, color: C.ink2, margin: '10px 0 0' }}>
          The x-axis shows what share of voters had already been counted (by the polling stations where they are registered). Early swings of the running count above 56% and the uncertainty interval from the first minutes are cropped.
        </p>
      </ChartCard>
    </div>
  );
}

const ST_LEGEND = [
  { key: 'lula', label: 'Lula wins', color: C.lula },
  { key: 'flavio', label: 'Flávio Bolsonaro wins', color: C.flavio },
];

export function BrazilRunoffStatesEn() {
  const [ref, W] = useWidth<HTMLDivElement>();
  const [tip, setTip] = useState<Tip>(null);
  const narrow = W < 600;
  const rows = [...STATES].sort((a, b) => b.l - a.l);
  const L = narrow ? 118 : 160, R = narrow ? 44 : 120, T = 26, rowH = narrow ? 21 : 22;
  const A = 25, B = 80;
  const x = (v: number) => L + ((v - A) / (B - A)) * (W - L - R);
  const H = T + rows.length * rowH + 26;
  const bottom = T + rows.length * rowH;
  const lab: React.CSSProperties = { fontSize: narrow ? 11.5 : 12.5, fill: C.ink, fontFamily: FONT };
  const ticks = narrow ? [30, 50, 70] : [30, 40, 50, 60, 70, 80];
  const nL = rows.filter((r) => r.k !== 'ZZ' && r.l > 50).length;
  const nF = rows.filter((r) => r.k !== 'ZZ' && r.l < 50).length;

  return (
    <div style={{ clear: 'both' }}>
      <ChartCard title="Lula holds the north-east, Flávio the south and centre-west. Minas Gerais leans to Lula"
        subtitle={`Predicted final share of the two-candidate vote for Lula (%) by state • as of ${STAV}`} source={SOURCE}>
        <ChartLegend items={ST_LEGEND} />
        <div ref={ref} style={{ position: 'relative', width: '100%' }}>
          {W > 0 && (
            <svg width={W} height={H} role="img" style={{ display: 'block', overflow: 'visible' }}
              aria-label={`Prediction by state: Lula leads in ${nL} states, Flávio Bolsonaro in ${nF}. Lula's highest share is in Piauí, his lowest in Roraima.`}>
              {ticks.map((v) => (
                <g key={v}>
                  {v !== 50 && <line x1={x(v)} x2={x(v)} y1={T - 6} y2={bottom} stroke={C.grid} />}
                  <text x={x(v)} y={bottom + 16} textAnchor="middle" style={{ fontSize: 11.5, fill: C.ink, fontFamily: FONT }}>{v}%</text>
                </g>
              ))}
              <text x={x(50) + 6} y={T - 12} style={{ ...lab, fontWeight: 600, fill: C.lula }}>Lula →</text>
              <text x={x(50) - 6} y={T - 12} textAnchor="end" style={{ ...lab, fontWeight: 600, fill: C.flavio }}>← Flávio</text>
              {rows.map((d, i) => {
                const cy = T + i * rowH + rowH / 2;
                const win = d.l > 50;
                const col = win ? C.lula : C.flavio;
                const flip = d.k1 === 'F' && win;
                const showTip = () => setTip({
                  x: x(d.l), y: cy,
                  body: <><strong>{d.n}</strong><br />
                    <span style={{ color: C.lula }}>●</span> Lula <strong>{fmt(d.l, 1)}%</strong> <span style={{ color: C.ink2 }}>({fmt(d.lo, 1)}–{fmt(d.hi, 1)})</span><br />
                    <span style={{ color: C.flavio }}>●</span> Flávio Bolsonaro <strong>{fmt(100 - d.l, 1)}%</strong><br />
                    <span style={{ color: C.ink2 }}>{fmt(d.c, 0)}% of voters counted{d.k1 ? ` · first round won by ${d.k1 === 'F' ? 'Flávio' : 'Lula'}` : ''}</span></>,
                });
                return (
                  <g key={d.k}>
                    <text x={L - 8} y={cy + 4} textAnchor="end" style={{ ...lab, fontWeight: flip || d.k === 'ZZ' ? 600 : 400, fontStyle: d.k === 'ZZ' ? 'italic' : undefined }}>
                      {narrow && d.k === 'ZZ' ? 'abroad' : d.n}
                    </text>
                    <rect x={Math.min(x(50), x(d.l))} y={cy - 7} width={Math.abs(x(d.l) - x(50))} height={14} fill={col} opacity={d.k === 'ZZ' ? 0.55 : 1} rx={2} />
                    <text x={x(d.l) + (win ? 6 : -6)} y={cy + 4} textAnchor={win ? 'start' : 'end'} style={{ ...lab, fontWeight: 600, fill: col }}>
                      {fmt(d.l, 1)}
                    </text>
                    {flip && !narrow && (
                      <text x={x(d.l) + 44} y={cy + 4} style={{ ...lab, fill: C.ink2 }}>Flávio led in round 1</text>
                    )}
                    <rect x={0} y={cy - rowH / 2} width={W} height={rowH} fill="transparent"
                      onPointerMove={showTip} onPointerDown={showTip} onPointerLeave={() => setTip(null)} />
                  </g>
                );
              })}
              <line x1={x(50)} x2={x(50)} y1={T - 6} y2={bottom} stroke={C.ink} strokeWidth={1.5} strokeDasharray="6 4" />
            </svg>
          )}
          <Tooltip tip={tip} width={W} />
        </div>
        <p style={{ fontFamily: FONT, fontSize: 15, lineHeight: 1.5, color: C.ink2, margin: '10px 0 0' }}>
          The number next to each bar is Lula&apos;s estimated share; Flávio Bolsonaro has the remainder up to 100%. Hovering shows the 90% uncertainty interval and how many voters had already been counted in that state.
        </p>
      </ChartCard>
    </div>
  );
}
