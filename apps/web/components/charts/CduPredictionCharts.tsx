'use client';

// One-off grafy k článku volby-nemecko-2026-09-20-cdu-meklenbursko:
//  - <CduPredictionTimeline />  celá volební noc: predikce DataTimes × průběžné sčítání × ARD/ZDF
//  - <CduThresholdDots />       každý odhad proti konečnému výsledku a hranici 5 %
// SVG se kreslí v reálných pixelech podle šířky kontejneru (písmo se neškáluje),
// pod 600 px přepíná na úspornější rozvržení popisků.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { PRED, COUNT } from './cduMv2026Data';

// Barvy výhradně ze závazné palety (ThemeProvider.tsx)
const C = {
  ink: '#101432',        // brandNavy.9
  ink2: '#4c4f8e',       // brandNavy.7
  muted: '#6267a3',      // brandNavy.6
  grid: '#eeeae2',       // background.4
  beige: '#bcbcb0',      // background.9 – tmavá béžová
  bandIn: '#fff7d9',     // brandYellow.1 – CDU ve sněmu
  bandOut: '#fff0ed',    // brandCoralRed.0 – CDU mimo sněm
  inText: '#a47d03',     // brandYellow.9 – popisek „CDU ve sněmu“
  outText: '#c93020',    // brandCoralRed.7 – popisek „CDU mimo sněm“
  model: '#de1743',      // brand.6
  count: '#bcbcb0',      // background.9
  tv: '#f76800',         // brandOrange.6 – exit polly a projekce ARD/ZDF
  tvText: '#cc5f00',     // brandOrange.7 – jejich popisky (čitelnější na světlých plochách)
  final: '#0e926a',      // brandEmeraldMint.6
  surface: '#fdfbf7',    // background.1 (pozadí článku)
};
const FINAL = 4.888;
const FONT = 'var(--mantine-font-family-headings, "IBM Plex Sans", sans-serif)';

const fmt = (v: number, d = 2) => v.toFixed(d).replace('.', ',');
const hhmm = (m: number) => {
  const t = Math.floor(m);
  return `${String((18 + Math.floor(t / 60)) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

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
  const right = tip.x > width - 220;
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

// Víceřádkový popisek v SVG
function Lines({ x, y, lines, anchor = 'start', lh = 15, styles }: {
  x: number; y: number; lines: string[]; anchor?: 'start' | 'end'; lh?: number; styles: React.CSSProperties[];
}) {
  return (
    <text x={x} y={y} textAnchor={anchor}>
      {lines.map((l, i) => (
        <tspan key={i} x={x} dy={i ? lh : 0} style={styles[Math.min(i, styles.length - 1)]}>{l}</tspan>
      ))}
    </text>
  );
}

type SeriesKey = 'model' | 'count' | 'tv';
const SERIES: { key: SeriesKey; label: string; short: string; swatch: ReactNode }[] = [
  { key: 'model', label: 'Predikce DataTimes', short: 'Predikce', swatch: <i style={{ width: 20, height: 3, borderRadius: 2, background: C.model }} /> },
  { key: 'count', label: 'Průběžně sečteno', short: 'Sečteno', swatch: <i style={{ width: 20, height: 3, borderRadius: 2, background: C.count }} /> },
  { key: 'tv', label: 'Exit poll / projekce ARD, ZDF', short: 'ARD, ZDF', swatch: <i style={{ width: 10, height: 10, borderRadius: '50%', background: C.tv }} /> },
];

function Legend({ hidden, toggle, narrow }: { hidden: Set<SeriesKey>; toggle: (k: SeriesKey) => void; narrow: boolean }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', marginBottom: 6 }}>
      {SERIES.map((s) => {
        const off = hidden.has(s.key);
        return (
          <button
            key={s.key}
            type="button"
            aria-pressed={!off}
            title={off ? 'Zobrazit' : 'Skrýt'}
            onClick={() => toggle(s.key)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 8px', borderRadius: 4,
              border: 'none', background: 'transparent', cursor: 'pointer',
              fontFamily: FONT, fontSize: 13, color: C.ink2, opacity: off ? 0.4 : 1,
              textDecoration: off ? 'line-through' : 'none',
            }}
          >
            {s.swatch}{narrow ? s.short : s.label}
          </button>
        );
      })}
    </div>
  );
}

const TV = [
  { m: 0, v: 5.5, n: 'ARD exit poll', t: '18:00', lab: 'ARD exit poll 5,5 %', short: 'ARD 5,5 %', dy: 4 },
  { m: 0, v: 5.0, n: 'ZDF exit poll', t: '18:00', lab: 'ZDF exit poll 5,0 %', short: 'ZDF 5,0 %', dy: -6 },
  { m: 27, v: 5.1, n: 'Forschungsgruppe Wahlen (ZDF)', t: '18:27', lab: 'FGW projekce 5,1 %', short: 'FGW 5,1 %', dy: -6 },
  { m: 253, v: 4.9, n: 'ARD projekce', t: '22:13' },
  { m: 260, v: 4.9, n: 'ZDF projekce', t: '22:20' },
];

const PULSE_CSS = `
@keyframes cduPulse { 0% { transform: scale(1); opacity: .55 } 70% { transform: scale(2.6); opacity: 0 } 100% { transform: scale(2.6); opacity: 0 } }
.cdu-pulse { transform-box: fill-box; transform-origin: center; animation: cduPulse 3.6s ease-out infinite; }
@media (prefers-reduced-motion: reduce) { .cdu-pulse { animation: none; opacity: 0 } }
`;

export function CduPredictionTimeline() {
  const [ref, W] = useWidth<HTMLDivElement>();
  const [tip, setTip] = useState<Tip>(null);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);
  const [hidden, setHidden] = useState<Set<SeriesKey>>(new Set());
  const toggle = (k: SeriesKey) => setHidden((h) => { const n = new Set(h); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const show = (k: SeriesKey) => !hidden.has(k);

  const narrow = W < 600;
  const H = narrow ? 460 : 470;
  const M = { l: narrow ? 30 : 44, r: narrow ? 8 : 150, t: 18, b: 34 };
  const X1 = 375, Y0 = narrow ? 3.25 : 3.4, Y1 = 5.75;
  const x = (m: number) => M.l + (m / X1) * (W - M.l - M.r);
  const y = (v: number) => M.t + ((Y1 - v) / (Y1 - Y0)) * (H - M.t - M.b);
  const step = (pts: number[][]) =>
    pts.map((p, i) => (i ? `H${x(p[0]).toFixed(1)}V${y(p[1]).toFixed(1)}` : `M${x(p[0]).toFixed(1)},${y(p[1]).toFixed(1)}`)).join('');

  const lab: React.CSSProperties = { fontSize: narrow ? 11.5 : 12.5, fill: C.ink, fontFamily: FONT };
  const labB: React.CSSProperties = { ...lab, fontWeight: 600 };
  const labM: React.CSSProperties = { ...lab, fontSize: narrow ? 11 : 12, fill: C.ink2 };
  const tick: React.CSSProperties = { fontSize: 11.5, fill: C.muted, fontFamily: FONT };
  const aX = 132.27, aV = 4.879, aC = 4.409;   // 20:12 – predikce a průběžné sčítání
  const fX = 75.53, fV = 4.46, fC = 3.792;     // 19:15 – první záznam
  const yTicks = (narrow ? [3.8, 4.0, 4.2, 4.4, 4.6, 4.8, 5.0, 5.2, 5.4, 5.6] : [3.6, 3.8, 4.0, 4.2, 4.4, 4.6, 4.8, 5.0, 5.2, 5.4, 5.6]);
  const xTicks = narrow ? [0, 60, 120, 180, 240, 300, 360] : [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360];
  const lh = narrow ? 14 : 15;

  function onMove(e: React.PointerEvent<SVGRectElement>) {
    const r = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
    const sx = e.clientX - r.left, sy = e.clientY - r.top;
    const tv = show('tv') && TV.find((d) => Math.abs(x(d.m) - sx) < 9 && Math.abs(y(d.v) - sy) < 11);
    if (tv) {
      setHover(null);
      setTip({
        x: x(tv.m), y: y(tv.v),
        body: <><strong>{tv.t} · {tv.n}</strong><br /><span style={{ color: C.ink2 }}>odhad</span> {fmt(tv.v, 1)} %<br /><span style={{ color: C.ink2 }}>výsledek</span> {fmt(FINAL, 1)} %</>,
      });
      return;
    }
    const m = ((sx - M.l) / (W - M.l - M.r)) * X1;
    if ((!show('model') && !show('count')) || m < PRED[0][0] - 3) { setTip(null); setHover(null); return; }
    let i = 0;
    while (i < PRED.length - 1 && PRED[i + 1][0] <= m) i++;
    const p = PRED[i], c = COUNT[i];
    const py = y(show('model') ? p[1] : c[1]);
    setHover({ x: x(p[0]), y: py });
    setTip({
      x: x(p[0]), y: py,
      body: <>
        <strong>{hhmm(p[0])}</strong> · sečteno {fmt(p[2], 1)} % okrsků<br />
        {show('model') && <><span style={{ color: C.model }}>●</span> predikce <strong>{fmt(p[1])} %</strong><br /></>}
        {show('count') && <><span style={{ color: C.count }}>●</span> průběžně {fmt(c[1])} %<br /></>}
        <span style={{ color: C.ink2 }}>výsledek</span> {fmt(FINAL)} %
      </>,
    });
  }
  const leave = () => { setTip(null); setHover(null); };

  // Poloha popisků
  const bracketY = y(5.64);
  const predLines = narrow
    ? ['20:12 predikce', 'CDU 4,88 %', 'CDU mimo sněm']
    : ['20:12 predikce DataTimes.cz', 'CDU 4,88 %', 'výsledek už se nezmění,', 'CDU se do sněmu nedostane'];
  const countLines = narrow
    ? ['průběžně sečteno', 'CDU 4,4 %', 'ještě poroste']
    : ['průběžné sčítání:', 'CDU 4,4 %', 'hodnota ještě poroste, do výsledku zasáhnou větší sídla'];
  const tvLines = narrow ? ['ARD, ZDF:', 'pod 5 %', 'až ve 22:13'] : ['22:13 ARD, 22:20 ZDF:', 'poprvé pod 5 % (4,9 %)'];
  const bottomY = y(Y0) - (2 * lh + 4);

  return (
    <div style={{ margin: '24px 0 8px' }}>
      <style>{PULSE_CSS}</style>
      <p style={{ fontFamily: FONT, fontSize: 15, lineHeight: 1.5, color: C.beige, margin: '0 0 10px' }}>
        Ani jedna ze 116 aktualizací predikce nepostavila CDU nad pětiprocentní hranici. Veřejnoprávní stanice ji pod čáru poprvé posunuly až ve 22:13.
      </p>
      <Legend hidden={hidden} toggle={toggle} narrow={W > 0 && narrow} />
      <div ref={ref} style={{ position: 'relative', width: '100%' }}>
        {W > 0 && (
          <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }} role="img"
            aria-label="Predikce CDU během volební noci: od 19:15 stále pod hranicí 5 %, od 20:12 do 0,01 bodu od konečného výsledku 4,888 %. ARD a ZDF ukázaly CDU pod 5 % až ve 22:13 a 22:20.">
            <rect x={x(0)} y={y(Y1)} width={x(X1) - x(0)} height={y(5) - y(Y1)} fill={C.bandIn} />
            <rect x={x(0)} y={y(5)} width={x(X1) - x(0)} height={y(Y0) - y(5)} fill={C.bandOut} />
            {yTicks.map((v) => (
              <g key={v}>
                {v !== 5 && <line x1={x(0)} x2={x(X1)} y1={y(v)} y2={y(v)} stroke={C.grid} />}
                <text x={M.l - 7} y={y(v) + 4} textAnchor="end" style={tick}>{fmt(v, 1)}</text>
              </g>
            ))}
            {xTicks.map((m) => (
              <g key={m}>
                <line x1={x(m)} x2={x(m)} y1={H - M.b} y2={H - M.b + 4} stroke={C.count} />
                <text x={x(m)} y={H - M.b + 18} textAnchor="middle" style={tick}>{hhmm(m)}</text>
              </g>
            ))}

            <line x1={x(0)} x2={x(X1)} y1={y(5)} y2={y(5)} stroke={C.ink} strokeWidth={1.5} />
            {narrow ? (
              <>
                <text x={x(X1) - 2} y={y(5) - 6} textAnchor="end" style={labB}>hranice 5 %</text>
                <text x={x(X1) - 4} y={y(Y1) + 14} textAnchor="end" style={{ ...labB, fill: C.inText }}>CDU ve sněmu</text>
                <text x={x(X1) - 4} y={y(Y0) - 8} textAnchor="end" style={{ ...labB, fill: C.outText }}>CDU mimo sněm</text>
              </>
            ) : (
              <>
                <text x={x(X1) + 10} y={y(5) + 4} style={labB}>hranice 5 %</text>
                <text x={x(X1) + 10} y={y(5) - 44} style={{ ...labB, fill: C.inText }}>↑ CDU ve sněmu</text>
                <text x={x(X1) + 10} y={y(5) + 84} style={{ ...labB, fill: C.outText }}>↓ CDU mimo sněm</text>
              </>
            )}

            {show('count') && <path d={step(COUNT)} fill="none" stroke={C.count} strokeWidth={2} strokeLinejoin="round" />}
            {show('model') && <path d={step(PRED)} fill="none" stroke={C.model} strokeWidth={2.5} strokeLinejoin="round" />}

            {/* 19:15 – první záznam: svislá přerušovaná linka až k dolnímu okraji */}
            {(show('model') || show('count')) && (
              <line x1={x(fX)} x2={x(fX)} y1={y(show('model') ? fV : fC) + 5} y2={y(Y0)} stroke={C.ink2} strokeWidth={0.75} strokeDasharray="2 3" />
            )}
            <Lines x={x(fX) - 6} y={bottomY} anchor="end" lh={lh} styles={[{ ...labM, fontStyle: 'italic' }]}
              lines={narrow ? ['čeká se', 'na sčítání'] : ['čeká se na první', 'sečtené okrsky']} />
            {show('count') && (
              <Lines x={x(fX) + 6} y={bottomY} lh={lh} styles={[labM]}
                lines={narrow ? ['3,8 %', '25 % okrsků'] : ['průběžně sečteno 3,8 %', '(25 % okrsků)']} />
            )}
            {show('model') && (
              <Lines x={x(fX) - 8} y={y(fV) - 4} anchor="end" lh={lh} styles={[{ ...labB, fill: C.model }]}
                lines={narrow ? ['predikce', 'DataTimes.cz'] : ['predikce', 'DataTimes.cz']} />
            )}

            {/* náskok před ARD – tmavá béžová závorka */}
            {show('model') && show('tv') && (
              <>
                <path d={`M${x(aX)},${bracketY + 6}V${bracketY}H${x(253)}V${bracketY + 6}`} fill="none" stroke={C.beige} strokeWidth={1.25} />
                <line x1={x(253)} x2={x(253)} y1={bracketY + 6} y2={y(4.9) - 8} stroke={C.beige} strokeWidth={1.25} strokeDasharray="2 3" />
                <text x={(x(aX) + x(253)) / 2} y={bracketY - 7} textAnchor="middle" style={{ ...labB, fill: C.beige }}>{narrow ? 'náskok 2 h' : 'náskok 2 h 01 min'}</text>
              </>
            )}

            {/* 20:12 – predikce: pulzující kolečko, přerušovaná linka nahoru */}
            {show('model') && (
              <>
                <line x1={x(aX)} x2={x(aX)} y1={y(aV) - 7} y2={bracketY + 6} stroke={C.model} strokeWidth={1} strokeDasharray="3 3" />
                <circle className="cdu-pulse" cx={x(aX)} cy={y(aV)} r={6} fill={C.model} />
                <circle cx={x(aX)} cy={y(aV)} r={5} fill={C.model} stroke={C.surface} strokeWidth={2} />
                <Lines x={x(aX) + 8} y={y(5.64) + 22} lh={lh + 1} styles={[labB, { ...labB, fill: C.model }, labM]} lines={predLines} />
              </>
            )}

            {/* 20:12 – průběžné sčítání */}
            {show('count') && (
              <>
                <line x1={x(aX)} x2={x(aX)} y1={y(aC) + 5} y2={y(aC) + 26} stroke={C.ink2} strokeWidth={0.75} strokeDasharray="2 3" />
                <circle cx={x(aX)} cy={y(aC)} r={4} fill={C.count} stroke={C.surface} strokeWidth={1.5} />
                <Lines x={x(aX) + 8} y={y(aC) + 30} lh={lh} styles={[labB, labB, labM]} lines={countLines} />
              </>
            )}

            {show('tv') && (
              <>
                {TV.map((d) => (
                  <circle key={d.n} cx={x(d.m)} cy={y(d.v)} r={5.5} fill={C.tv} stroke={C.surface} strokeWidth={2} />
                ))}
                {TV.filter((d) => d.lab).map((d) => (
                  <text key={d.n} x={x(d.m) + 10} y={y(d.v) + (d.dy ?? 0)} style={{ ...lab, fill: C.tvText }}>{narrow ? d.short : d.lab}</text>
                ))}
                <line x1={x(256.5)} x2={x(256.5)} y1={y(4.9) + 8} y2={y(4.66)} stroke={C.tv} />
                <Lines x={x(256.5) + 6} y={y(4.66) + 10} lh={lh} styles={[{ ...lab, fill: C.tvText }, { ...labM, fill: C.tvText }]} lines={tvLines} />
              </>
            )}

            {hover && (
              <>
                <line x1={hover.x} x2={hover.x} y1={M.t} y2={H - M.b} stroke={C.ink} opacity={0.25} />
                <circle cx={hover.x} cy={hover.y} r={4.5} fill={show('model') ? C.model : C.count} stroke="#fff" strokeWidth={2} />
              </>
            )}
            <rect x={x(0) - 8} y={M.t} width={x(X1) - x(0) + 8} height={H - M.t - M.b} fill="transparent"
              onPointerMove={onMove} onPointerLeave={leave} onPointerDown={onMove} />
          </svg>
        )}
        <Tooltip tip={tip} width={W} />
      </div>
    </div>
  );
}

const ROWS = [
  { t: '18:00', n: 'ARD exit poll', v: 5.5, m: false },
  { t: '18:00', n: 'ZDF exit poll', v: 5.0, m: false },
  { t: '18:27', n: 'Forschungsgruppe Wahlen', v: 5.1, m: false },
  { t: '19:15', n: 'Predikce DataTimes', v: 4.46, m: true, note: '25 % okrsků' },
  { t: '20:00', n: 'Predikce DataTimes', v: 4.779, m: true, note: '65 % okrsků' },
  { t: '20:12', n: 'Predikce DataTimes', v: 4.879, m: true, note: '72 % okrsků' },
  { t: '22:13', n: 'ARD projekce', v: 4.9, m: false },
  { t: '22:20', n: 'ZDF projekce', v: 4.9, m: false },
];

export function CduThresholdDots() {
  const [ref, W] = useWidth<HTMLDivElement>();
  const [tip, setTip] = useState<Tip>(null);
  const narrow = W < 600;
  const L = narrow ? 8 : 220, R = 16, T = 30;
  const rowH = narrow ? 46 : 34;
  const A = 4.3, B = 5.6;
  const x = (v: number) => L + ((v - A) / (B - A)) * (W - L - R);
  const H = T + ROWS.length * rowH + 30;
  const bottom = T + ROWS.length * rowH - 4;
  const lab = { fontSize: narrow ? 12 : 12.5, fill: C.ink, fontFamily: FONT };
  const labM = { ...lab, fontSize: 12, fill: C.ink2 };
  const ticks = narrow ? [4.4, 4.8, 5.2, 5.6] : [4.4, 4.6, 4.8, 5.0, 5.2, 5.4, 5.6];

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', margin: '24px 0 8px' }}>
      {W > 0 && (
        <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }} role="img"
          aria-label="Odhady CDU proti konečnému výsledku 4,888 %: tři první odhady ARD a ZDF byly na hranici 5 % či nad ní, všechny predikce DataTimes pod ní.">
          <rect x={x(A)} y={T - 10} width={x(5) - x(A)} height={bottom - T + 10} fill={C.bandOut} />
          <rect x={x(5)} y={T - 10} width={x(B) - x(5)} height={bottom - T + 10} fill={C.bandIn} />
          <text x={x(5) + 8} y={T - 16} style={{ ...labM, fontWeight: 600, fill: C.inText }}>CDU ve sněmu →</text>
          <text x={x(5) - 8} y={T - 16} textAnchor="end" style={{ ...labM, fontWeight: 600, fill: C.outText }}>← CDU mimo sněm</text>
          {ticks.map((v) => (
            <g key={v}>
              {v !== 5 && <line x1={x(v)} x2={x(v)} y1={T - 10} y2={bottom} stroke={C.grid} />}
              <text x={x(v)} y={bottom + 18} textAnchor="middle" style={{ fontSize: 11.5, fill: C.muted, fontFamily: FONT }}>{fmt(v, 1)} %</text>
            </g>
          ))}
          <line x1={x(5)} x2={x(5)} y1={T - 10} y2={bottom} stroke={C.ink} strokeWidth={1.5} />
          <line x1={x(FINAL)} x2={x(FINAL)} y1={T - 10} y2={bottom} stroke={C.final} strokeWidth={1.5} strokeDasharray="5 4" />
          {ROWS.map((d, i) => {
            const cy = T + i * rowH + rowH / 2 + (narrow ? 4 : -6);
            const col = d.m ? C.model : C.tv;
            const wrong = d.v >= 5;
            const dec = d.m ? 2 : 1;
            const showTip = () => setTip({
              x: x(d.v), y: cy,
              body: <><strong>{d.t} · {d.n}</strong><br />odhad {fmt(d.v, dec)} %{d.note ? ` · ${d.note}` : ''}<br />
                <span style={{ color: C.ink2 }}>výsledek</span> {fmt(FINAL, dec)} %<br />
                {wrong ? 'CDU by prošla do sněmu – špatný závěr' : 'CDU mimo sněm – správný závěr'}</>,
            });
            return (
              <g key={i}>
                <text x={narrow ? L : 0} y={narrow ? cy - 12 : cy + 4} style={{ ...lab, fontWeight: d.m ? 600 : 400, fill: d.m ? C.ink : C.tvText }}>{d.t}  {d.n}</text>
                <line x1={x(FINAL)} x2={x(d.v)} y1={cy} y2={cy} stroke={col} strokeWidth={2} opacity={0.5} />
                <circle cx={x(d.v)} cy={cy} r={6} fill={col} stroke={C.surface} strokeWidth={2} />
                <rect x={0} y={cy - rowH / 2 - (narrow ? 8 : 0)} width={W} height={rowH} fill="transparent"
                  onPointerMove={showTip} onPointerDown={showTip} onPointerLeave={() => setTip(null)} />
              </g>
            );
          })}
        </svg>
      )}
      <Tooltip tip={tip} width={W} />
    </div>
  );
}
