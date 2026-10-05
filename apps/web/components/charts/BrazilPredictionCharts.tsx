'use client';

// One-off graf k článku volby-brazilie-2026-10-04-prvni-kolo-vyhrava-bolsonaro:
//  - <BrazilPredictionTimeline /> celá volební noc: predikce DataTimes × průběžné sčítání TSE
//  - <BrazilRunoffDots />  průzkumy × průběžné sčítání × predikce DataTimes proti hranici 50 %
// Stejná stavba jako CduThresholdDots (CduPredictionCharts.tsx): SVG v reálných pixelech,
// pod 600 px úspornější rozvržení popisků.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import ChartCard from './ChartCard';
import ChartLegend from './ChartLegend';
import { PRED, COUNT } from './brazil2026Data';

// Barvy výhradně ze závazné palety (ThemeProvider.tsx)
const C = {
  ink: '#101432',        // brandNavy.9
  ink2: '#4c4f8e',       // brandNavy.7
  grid: '#eeeae2',       // background.4
  beige: '#bcbcb0',      // background.9
  bandWin: '#fffdf0',    // brandYellow.0 – vítězství už v 1. kole
  bandRun: '#e9ecf4',    // brandNavy.0 – druhé kolo
  winText: '#a47d03',    // brandYellow.9
  runText: '#4c4f8e',    // brandNavy.7
  flavio: '#0b6b4e',     // brandEmeraldMint[7] – s oranžovou čitelné i pro barvoslepé (deuteranopie/protanopie)
  lula: '#f76800',       // brandOrange.6 – ne červená: červená × zelená barvoslepí nerozliší
  model: '#de1743',      // brand.6
  surface: '#f8f6f0',    // background.2 – pozadí ChartCard
};
const FONT = 'var(--font-roboto-condensed), Arial, sans-serif';
const fmt = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

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

type Row = {
  t: string; n: string; f: number; l: number; kind: 'poll' | 'count' | 'model';
  fLo?: number; fHi?: number; lLo?: number; lHi?: number; note?: string;
};

const hhmm = (m: number) => {
  const t = Math.floor(m);
  return `${String((22 + Math.floor(t / 60)) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

const TL_LEGEND = [
  { key: 'flavio', label: 'Predikce: Flávio Bolsonaro', color: C.flavio },
  { key: 'lula', label: 'Predikce: Lula', color: C.lula },
  { key: 'count', label: 'Průběžné sčítání TSE', color: C.beige },
];
const TL_SOURCE = 'archiv predikcí Mahdalová & Škop; průběžné sčítání [TSE](https://resultados.tse.jus.br/) podle [The Rio Times](https://www.riotimesonline.com/brazil-election-first-round-results-lula-flavio-2026)';

export function BrazilPredictionTimeline() {
  const [ref, W] = useWidth<HTMLDivElement>();
  const [tip, setTip] = useState<Tip>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [active, setActive] = useState<string[]>(TL_LEGEND.map((l) => l.key));
  const on = (k: string) => active.includes(k);
  const narrow = W < 700;
  const H = narrow ? 420 : 440;
  const M = { l: narrow ? 34 : 44, r: narrow ? 10 : 24, t: 30, b: 34 };
  const X0 = 15, X1 = 142, Y0 = 40, Y1 = 52;
  const x = (m: number) => M.l + ((m - X0) / (X1 - X0)) * (W - M.l - M.r);
  const y = (v: number) => M.t + ((Y1 - v) / (Y1 - Y0)) * (H - M.t - M.b);
  const step = (k: number) =>
    PRED.map((p, i) => (i ? `H${x(p[0]).toFixed(1)}V${y(p[k]).toFixed(1)}` : `M${x(p[0]).toFixed(1)},${y(p[k]).toFixed(1)}`)).join('') + `H${x(PRED[PRED.length - 1][0] + 1).toFixed(1)}`;
  const lab: React.CSSProperties = { fontSize: narrow ? 11.5 : 12.5, fill: C.ink, fontFamily: FONT };
  const labB: React.CSSProperties = { ...lab, fontWeight: 600 };
  const tick: React.CSSProperties = { fontSize: 11.5, fill: C.ink, fontFamily: FONT };
  const yTicks = narrow ? [40, 44, 48, 52] : [40, 42, 44, 46, 48, 50, 52];
  const xTicks = narrow ? [30, 60, 90, 120] : [15, 30, 45, 60, 75, 90, 105, 120, 135];
  const LEAD = PRED.findIndex((p) => p[1] > p[2]);   // 22:23 – Flávio v predikci poprvé (a natrvalo) v čele
  const last = PRED[PRED.length - 1];
  const px = (v: number) => Math.round(v) + 0.5;

  function onMove(e: React.PointerEvent<SVGRectElement>) {
    const r = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
    const sx = e.clientX - r.left;
    const m = X0 + ((sx - M.l) / (W - M.l - M.r)) * (X1 - X0);
    const c = on('count') && COUNT.find((d) => Math.abs(x(d.m) - sx) < 8);
    if (c) {
      setHover(null);
      setTip({ x: x(c.m), y: y(c.f), body: <><strong>{c.t} · průběžné sčítání TSE</strong><br />sečteno {fmt(c.sec, 2)} % okrsků<br />
        <span style={{ color: C.flavio }}>●</span> Flávio Bolsonaro {fmt(c.f, 2)} %<br /><span style={{ color: C.lula }}>●</span> Lula {fmt(c.l, 2)} %</> });
      return;
    }
    if (m < PRED[0][0] - 2) { setTip(null); setHover(null); return; }
    let i = 0;
    while (i < PRED.length - 1 && PRED[i + 1][0] <= m) i++;
    const p = PRED[i];
    setHover(i);
    setTip({ x: x(p[0]), y: y(Math.max(p[1], p[2])), body: <>
      <strong>{hhmm(p[0])}</strong> · sečteno {fmt(p[3], 1)} % hlasů<br />
      <span style={{ color: C.flavio }}>●</span> Flávio Bolsonaro <strong>{fmt(p[1], 2)} %</strong><br />
      <span style={{ color: C.lula }}>●</span> Lula <strong>{fmt(p[2], 2)} %</strong>
    </> });
  }

  return (
    <div style={{ clear: 'both' }}>
      <ChartCard title="Vítězství Bolsonara jsme predikovali od 0,8 % sečtených hlasů"
        subtitle="Predikce konečného podílu na platných hlasech (%) • 4.–5. října 2026, čas SELČ" source={TL_SOURCE}>
        <ChartLegend items={TL_LEGEND} activeKeys={active} onChange={setActive} />
        <div ref={ref} style={{ position: 'relative', width: '100%' }}>
          {W > 0 && (
            <svg width={W} height={H} role="img" style={{ display: 'block', overflow: 'visible' }}
              aria-label="Predikce DataTimes.cz během volební noci: od 22:23 SELČ je Flávio Bolsonaro trvale před Lulou a ani jednou nepřekročí 47,1 %. Průběžné sčítání TSE ho přitom ukazovalo nad 50 %.">
              <rect x={M.l} y={y(Y1)} width={W - M.l - M.r} height={y(50) - y(Y1)} fill={C.bandWin} />
              {yTicks.map((v) => (
                <g key={v}>
                  {v !== 50 && <line x1={M.l} x2={W - M.r} y1={y(v)} y2={y(v)} stroke={C.grid} />}
                  <text x={M.l - 7} y={y(v) + 4} textAnchor="end" style={tick}>{v}</text>
                </g>
              ))}
              {xTicks.map((m) => (
                <g key={m}>
                  <line x1={x(m)} x2={x(m)} y1={H - M.b} y2={H - M.b + 4} stroke={C.beige} />
                  <text x={x(m)} y={H - M.b + 18} textAnchor="middle" style={tick}>{hhmm(m)}</text>
                </g>
              ))}
              <line x1={M.l} x2={W - M.r} y1={y(50)} y2={y(50)} stroke={C.ink} strokeWidth={1.5} strokeDasharray="6 4" />
              {narrow
                ? <text x={W - M.r} y={y(50) - 8} textAnchor="end" style={{ ...labB, fill: C.winText }}>50 %</text>
                : <text x={M.l + 6} y={y(50) - 8} style={{ ...labB, fill: C.winText }}>50 % – nad touto čarou by kandidát vyhrál už v 1. kole</text>}

              {on('count') && COUNT.map((d) => (
                <g key={d.t}>
                  <line x1={px(x(d.m))} x2={px(x(d.m))} y1={y(d.f)} y2={y(d.l)} stroke={C.beige} strokeDasharray="2 3" />
                  <circle cx={x(d.m)} cy={y(d.f)} r={5} fill={C.surface} stroke={C.flavio} strokeWidth={2} />
                  <circle cx={x(d.m)} cy={y(d.l)} r={5} fill={C.surface} stroke={C.lula} strokeWidth={2} />
                </g>
              ))}
              {on('count') && (
                <text x={x(COUNT[0].m) - 8} y={y(COUNT[0].f) + 4} textAnchor="end" style={{ ...labB, fill: C.ink2 }}>
                  {narrow ? 'sčítání TSE' : 'průběžně sečteno: Flávio 51,2 %'}
                </text>
              )}
              {on('count') && !narrow && (
                <text x={x(COUNT[0].m) - 8} y={y(COUNT[0].l) + 4} textAnchor="end" style={{ ...lab, fill: C.ink2 }}>Lula 40,7 %</text>
              )}

              {on('lula') && <path d={step(2)} fill="none" stroke={C.lula} strokeWidth={2.5} strokeLinejoin="round" />}
              {on('flavio') && <path d={step(1)} fill="none" stroke={C.flavio} strokeWidth={2.5} strokeLinejoin="round" />}

              {/* 22:23 – Flávio poprvé v čele predikce */}
              {on('flavio') && on('lula') && (
                <>
                  <line x1={px(x(PRED[LEAD][0]))} x2={px(x(PRED[LEAD][0]))} y1={y(PRED[LEAD][1]) - 8} y2={y(49.3)} stroke={C.model} strokeDasharray="3 3" />
                  <circle cx={x(PRED[LEAD][0])} cy={y(PRED[LEAD][1])} r={5} fill={C.model} stroke={C.surface} strokeWidth={2} />
                  <text x={x(PRED[LEAD][0]) + 6} y={y(49.3) + 4} style={{ ...labB, fill: C.model }}>
                    <tspan x={x(PRED[LEAD][0]) + 6}>{hhmm(PRED[LEAD][0])} Flávio v čele predikce</tspan>
                    <tspan x={x(PRED[LEAD][0]) + 6} dy={15} style={{ ...lab, fill: C.model }}>{narrow ? 'sečteno 0,8 % hlasů' : 'sečteno 0,8 % hlasů – a v čele už zůstal'}</tspan>
                  </text>
                </>
              )}
              {on('flavio') && (
                <text x={x(last[0]) - 2} y={y(last[1]) - 9} textAnchor="end" style={{ ...labB, fill: C.flavio }}>Flávio {fmt(last[1], 2)} %</text>
              )}
              {on('lula') && (
                <text x={x(last[0]) - 2} y={y(last[2]) + 19} textAnchor="end" style={{ ...labB, fill: C.lula }}>Lula {fmt(last[2], 2)} %</text>
              )}

              {hover !== null && (
                <>
                  <line x1={x(PRED[hover][0])} x2={x(PRED[hover][0])} y1={M.t} y2={H - M.b} stroke={C.ink} opacity={0.25} />
                  {on('flavio') && <circle cx={x(PRED[hover][0])} cy={y(PRED[hover][1])} r={4.5} fill={C.flavio} stroke="#fff" strokeWidth={2} />}
                  {on('lula') && <circle cx={x(PRED[hover][0])} cy={y(PRED[hover][2])} r={4.5} fill={C.lula} stroke="#fff" strokeWidth={2} />}
                </>
              )}
              <rect x={M.l - 8} y={M.t} width={W - M.l - M.r + 8} height={H - M.t - M.b} fill="transparent" style={{ touchAction: 'pan-y' }}
                onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => { setTip(null); setHover(null); }} />
            </svg>
          )}
          <Tooltip tip={tip} width={W} />
        </div>
        <p style={{ fontFamily: FONT, fontSize: 15, lineHeight: 1.5, color: C.ink2, margin: '10px 0 0' }}>
          Ani jedna ze {PRED.length} aktualizací predikce DataTimes.cz nedala Fláviovi Bolsonarovi víc než 47,03 %. Od 23:32, kdy byla sečtena necelá třetina hlasů, se odhad pro oba kandidáty už nepohnul o víc než desetinu bodu.
        </p>
      </ChartCard>
    </div>
  );
}

const ROWS: Row[] = [
  { t: '23.–28. 9.', n: 'Průzkum AtlasIntel', f: 43.1, l: 46.2, kind: 'poll', note: 'chyba ±1 bod' },
  { t: '2.–3. 10.', n: 'Průzkum Quaest', f: 45, l: 46, kind: 'poll', note: 'chyba ±2 body' },
  { t: '3. 10.', n: 'Průzkum Datafolha', f: 42, l: 45, kind: 'poll', note: 'chyba ±2 body' },
  { t: '4. 10.', n: 'Průběžné sčítání', f: 50.2, l: 41.63, kind: 'count', note: 'sečteno 47,26 % okrsků' },
  { t: '4. 10.', n: 'Predikce DataTimes.cz', f: 47.01, l: 45.22, kind: 'model', fLo: 46.7, fHi: 47.32, lLo: 44.91, lHi: 45.53, note: 'ze 47,26 % okrsků' },
];

const LEGEND = [
  { key: 'flavio', label: 'Flávio Bolsonaro (PL)', color: C.flavio },
  { key: 'lula', label: 'Lula (PT)', color: C.lula },
];
const SOURCE = 'predikce Mahdalová & Škop; průběžné sčítání [TSE](https://resultados.tse.jus.br/); průzkumy podle [The Rio Times](https://www.riotimesonline.com/brazil-final-polls-before-the-vote-lula-flavio-datafolha-quaest-2026/) a [The Rio Times](https://www.riotimesonline.com/brazil-election-2026-atlasintel-poll-lula-leads-first-round-runoff-tie/)';

export function BrazilRunoffDots() {
  const [ref, W] = useWidth<HTMLDivElement>();
  const [tip, setTip] = useState<Tip>(null);
  const [active, setActive] = useState<string[]>(['flavio', 'lula']);
  const narrow = W < 600;
  const L = narrow ? 8 : 230, R = 16, T = 34;
  const rowH = narrow ? 50 : 40;
  const A = 40, B = 52;
  const x = (v: number) => L + ((v - A) / (B - A)) * (W - L - R);
  const H = T + ROWS.length * rowH + 30;
  const bottom = T + ROWS.length * rowH - 4;
  const lab = { fontSize: narrow ? 12 : 12.5, fill: C.ink, fontFamily: FONT };
  const labM = { ...lab, fontSize: 12 };
  const ticks = narrow ? [40, 44, 48, 52] : [40, 42, 44, 46, 48, 50, 52];
  const on = (k: string) => active.includes(k);

  return (
    <div style={{ clear: 'both' }}>
      <ChartCard title="Průběžné číslo slibovalo vítězství v 1. kole, predikce druhé kolo"
        subtitle="Podíl na platných hlasech (%) • průzkumy před volbami, sčítání a predikce 4. října 2026" source={SOURCE}>
        <ChartLegend items={LEGEND} activeKeys={active} onChange={setActive} />
        <div ref={ref} style={{ position: 'relative', width: '100%' }}>
          {W > 0 && (
            <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }} role="img"
              aria-label="Průzkumy čekaly Lulu před Flávio Bolsonarem. Průběžné sčítání při 47 % okrsků ukazovalo Flávia nad 50 %, predikce DataTimes.cz ho odhaduje na 47,0 % proti 45,2 % pro Lulu – tedy první místo, ale druhé kolo.">
              <rect x={x(A)} y={T - 10} width={x(50) - x(A)} height={bottom - T + 10} fill={C.bandRun} opacity={0.6} />
              <rect x={x(50)} y={T - 10} width={x(B) - x(50)} height={bottom - T + 10} fill={C.bandWin} />
              <text x={x(50) + 6} y={T - 16} style={{ ...labM, fontWeight: 600, fill: C.winText }}>{narrow ? 'výhra v 1. kole →' : 'prezident už v 1. kole →'}</text>
              <text x={x(50) - 6} y={T - 16} textAnchor="end" style={{ ...labM, fontWeight: 600, fill: C.runText }}>← druhé kolo 25. října</text>
              {ticks.map((v) => (
                <g key={v}>
                  {v !== 50 && <line x1={x(v)} x2={x(v)} y1={T - 10} y2={bottom} stroke={C.grid} />}
                  <text x={x(v)} y={bottom + 18} textAnchor="middle" style={{ fontSize: 11.5, fill: C.ink, fontFamily: FONT }}>{v} %</text>
                </g>
              ))}
              <line x1={x(50)} x2={x(50)} y1={T - 10} y2={bottom} stroke={C.ink} strokeWidth={1.5} strokeDasharray="6 4" />
              {ROWS.map((d, i) => {
                const cy = T + i * rowH + rowH / 2 + (narrow ? 6 : -6);
                const isModel = d.kind === 'model';
                const dec = d.kind === 'poll' ? 1 : 2;
                const showTip = () => setTip({
                  x: x(Math.max(d.f, d.l)), y: cy,
                  body: <>
                    <strong>{d.t} · {d.n}</strong>{d.note ? <span style={{ color: C.ink2 }}> · {d.note}</span> : null}<br />
                    <span style={{ color: C.flavio }}>●</span> Flávio Bolsonaro <strong>{fmt(d.f, dec)} %</strong>
                    {d.fLo !== undefined && <span style={{ color: C.ink2 }}> ({fmt(d.fLo, 2)}–{fmt(d.fHi!, 2)})</span>}<br />
                    <span style={{ color: C.lula }}>●</span> Lula <strong>{fmt(d.l, dec)} %</strong>
                    {d.lLo !== undefined && <span style={{ color: C.ink2 }}> ({fmt(d.lLo, 2)}–{fmt(d.lHi!, 2)})</span>}<br />
                    {d.f > 50 ? 'Flávio by vyhrál už v 1. kole' : `${d.f > d.l ? 'Flávio' : 'Lula'} první, rozhodne druhé kolo`}
                  </>,
                });
                return (
                  <g key={i}>
                    {isModel && <rect x={narrow ? 0 : 0} y={cy - rowH / 2 - (narrow ? 12 : 0) + 2} width={W} height={rowH - 4} fill={C.model} opacity={0.06} rx={3} />}
                    <text x={narrow ? L : 0} y={narrow ? cy - 14 : cy + 4}
                      style={{ ...lab, fontWeight: d.kind === 'poll' ? 400 : 600, fill: isModel ? C.model : C.ink }}>
                      {d.t}  {d.n}
                    </text>
                    {on('flavio') && on('lula') && (
                      <line x1={x(d.l)} x2={x(d.f)} y1={cy} y2={cy} stroke={C.beige} strokeWidth={2} />
                    )}
                    {isModel && on('flavio') && <rect x={x(d.fLo!)} y={cy - 7} width={x(d.fHi!) - x(d.fLo!)} height={14} fill={C.flavio} opacity={0.22} rx={2} />}
                    {isModel && on('lula') && <rect x={x(d.lLo!)} y={cy - 7} width={x(d.lHi!) - x(d.lLo!)} height={14} fill={C.lula} opacity={0.22} rx={2} />}
                    {on('lula') && <circle cx={x(d.l)} cy={cy} r={isModel ? 6.5 : 5.5} fill={C.lula} stroke={C.surface} strokeWidth={2} opacity={d.kind === 'poll' ? 0.75 : 1} />}
                    {on('flavio') && <circle cx={x(d.f)} cy={cy} r={isModel ? 6.5 : 5.5} fill={C.flavio} stroke={C.surface} strokeWidth={2} opacity={d.kind === 'poll' ? 0.75 : 1} />}
                    {!narrow && on('flavio') && (d.kind !== 'poll') && (
                      <text x={x(d.f) + (d.f > d.l ? 10 : -10)} y={cy + 4} textAnchor={d.f > d.l ? 'start' : 'end'}
                        style={{ ...labM, fontWeight: 600, fill: C.flavio }}>{fmt(d.f, 2)} %</text>
                    )}
                    {!narrow && on('lula') && (d.kind !== 'poll') && (
                      <text x={x(d.l) + (d.l > d.f ? 10 : -10)} y={cy + 4} textAnchor={d.l > d.f ? 'start' : 'end'}
                        style={{ ...labM, fontWeight: 600, fill: C.lula }}>{fmt(d.l, 2)} %</text>
                    )}
                    <rect x={0} y={cy - rowH / 2 - (narrow ? 12 : 0)} width={W} height={rowH} fill="transparent"
                      onPointerMove={showTip} onPointerDown={showTip} onPointerLeave={() => setTip(null)} />
                  </g>
                );
              })}
            </svg>
          )}
          <Tooltip tip={tip} width={W} />
        </div>
        <p style={{ fontFamily: FONT, fontSize: 15, lineHeight: 1.5, color: C.ink2, margin: '10px 0 0' }}>
          Průzkumy čekaly v čele Lulu, průběžné sčítání vítězství Flávia Bolsonara už v prvním kole. Predikce DataTimes.cz říká obojí jinak: Flávio skončí první, ale pod 50 % – i na hraně svého intervalu nejistoty (47,32 %).
        </p>
      </ChartCard>
    </div>
  );
}

const CANDS = [
  { n: 'Flávio Bolsonaro', p: 'PL', c: 50.2, v: 47.01, lo: 46.7, hi: 47.32, col: C.flavio },
  { n: 'Lula da Silva', p: 'PT', c: 41.63, v: 45.22, lo: 44.91, hi: 45.53, col: C.lula },
  { n: 'Augusto Cury', p: 'Avante', c: 2.96, v: 2.87, lo: 2.73, hi: 3.02, col: C.ink2 },
  { n: 'Renan Santos', p: 'Missão', c: 2.32, v: 2.23, lo: 2.12, hi: 2.34, col: C.ink2 },
  { n: 'Ronaldo Caiado', p: 'PSD', c: 2.38, v: 2.18, lo: 2.07, hi: 2.29, col: C.ink2 },
  { n: 'Romeu Zema', p: 'Novo', c: 0.29, v: 0.28, lo: 0.26, hi: 0.29, col: C.ink2 },
  { n: 'dalších šest kandidátů', p: '', c: 0.22, v: 0.21, col: C.ink2 },
];
const CAND_LEGEND = [
  { key: 'pred', label: 'Predikce DataTimes.cz (sloupec)', color: C.ink2 },
  { key: 'count', label: 'Průběžně sečteno, 47 % okrsků (čárka)', color: C.ink },
];
const CAND_SOURCE = 'predikce Mahdalová & Škop ze stavu sčítání 47,26 % okrsků (23:44 SELČ); průběžné výsledky [TSE](https://resultados.tse.jus.br/)';

export function BrazilCandidatesBars() {
  const [ref, W] = useWidth<HTMLDivElement>();
  const [tip, setTip] = useState<Tip>(null);
  const [active, setActive] = useState<string[]>(['pred', 'count']);
  const on = (k: string) => active.includes(k);
  const narrow = W < 600;
  const L = narrow ? 0 : 190, R = narrow ? 70 : 150, T = 26;
  const rowH = narrow ? 52 : 40;
  const B = 52;
  const x = (v: number) => L + (v / B) * (W - L - R);
  const H = T + CANDS.length * rowH + 28;
  const bottom = T + CANDS.length * rowH - 6;
  const lab = { fontSize: narrow ? 12 : 13, fill: C.ink, fontFamily: FONT };
  const ticks = narrow ? [0, 25, 50] : [0, 10, 20, 30, 40, 50];

  return (
    <div style={{ clear: 'both' }}>
      <ChartCard title="Průběžný součet Bolsonara nadsazoval, Lulu podceňoval"
        subtitle="Podíl na platných hlasech v 1. kole (%) • průběžné sčítání a predikce DataTimes.cz, 4. října 2026" source={CAND_SOURCE}>
        <ChartLegend items={CAND_LEGEND} activeKeys={active} onChange={setActive} />
        <div ref={ref} style={{ position: 'relative', width: '100%' }}>
          {W > 0 && (
            <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }} role="img"
              aria-label="Predikce proti průběžnému sčítání: Flávio Bolsonaro 47,01 % (průběžně 50,20 %), Lula 45,22 % (průběžně 41,63 %), Augusto Cury 2,87 %, Renan Santos 2,23 %, Ronaldo Caiado 2,18 %, Romeu Zema 0,28 %, ostatní 0,21 %.">
              {ticks.map((v) => (
                <g key={v}>
                  {v !== 50 && <line x1={x(v)} x2={x(v)} y1={T - 8} y2={bottom} stroke={C.grid} />}
                  <text x={x(v)} y={bottom + 18} textAnchor="middle" style={{ fontSize: 11.5, fill: C.ink, fontFamily: FONT }}>{v} %</text>
                </g>
              ))}
              <line x1={x(50)} x2={x(50)} y1={T - 8} y2={bottom} stroke={C.ink} strokeWidth={1.5} strokeDasharray="6 4" />
              <text x={x(50)} y={T - 12} textAnchor="middle" style={{ ...lab, fontSize: 11.5, fontWeight: 600, fill: C.winText }}>50 % = prezident v 1. kole</text>
              {CANDS.map((d, i) => {
                const cy = T + i * rowH + rowH / 2 + (narrow ? 8 : 0);
                const big = i < 2;
                const bh = big ? 16 : 10;
                const showTip = () => setTip({
                  x: x(Math.max(d.v, d.c)), y: cy,
                  body: <><strong>{d.n}{d.p ? ` (${d.p})` : ''}</strong><br />
                    predikce <strong>{fmt(d.v, 2)} %</strong>{d.lo !== undefined && <span style={{ color: C.ink2 }}> ({fmt(d.lo, 2)}–{fmt(d.hi!, 2)})</span>}<br />
                    průběžně {fmt(d.c, 2)} %</>,
                });
                return (
                  <g key={d.n}>
                    <text x={narrow ? 0 : L - 10} y={narrow ? cy - bh / 2 - 6 : cy + 4} textAnchor={narrow ? 'start' : 'end'}
                      style={{ ...lab, fontWeight: big ? 600 : 400, fill: big ? d.col : C.ink }}>
                      {d.n}{d.p && !narrow ? ` · ${d.p}` : ''}
                    </text>
                    {on('pred') && <rect x={x(0)} y={cy - bh / 2} width={x(d.v) - x(0)} height={bh} fill={d.col} opacity={big ? 1 : 0.55} rx={2} />}
                    {on('pred') && d.lo !== undefined && big && (
                      <g stroke={C.ink} strokeWidth={1.5}>
                        <line x1={x(d.lo)} x2={x(d.hi!)} y1={cy} y2={cy} />
                        <line x1={x(d.lo)} x2={x(d.lo)} y1={cy - 4} y2={cy + 4} />
                        <line x1={x(d.hi!)} x2={x(d.hi!)} y1={cy - 4} y2={cy + 4} />
                      </g>
                    )}
                    {on('count') && (
                      <>
                        <line x1={x(d.c)} x2={x(d.c)} y1={cy - bh / 2 - 5} y2={cy + bh / 2 + 5} stroke={C.ink} strokeWidth={2} />
                        {big && <line x1={x(d.v)} x2={x(d.c)} y1={cy + bh / 2 + 5} y2={cy + bh / 2 + 5} stroke={C.ink} strokeWidth={1} strokeDasharray="2 2" />}
                      </>
                    )}
                    <text x={x(Math.max(on('pred') ? d.v : 0, on('count') ? d.c : 0)) + 8} y={cy + 4} style={{ ...lab, fontWeight: 600 }}>
                      {on('pred') ? `${fmt(d.v, 2)} %` : `${fmt(d.c, 2)} %`}
                      {on('pred') && on('count') && big && !narrow && <tspan style={{ fontWeight: 400, fill: C.ink2 }}>{`  průběžně ${fmt(d.c, 2)} %`}</tspan>}
                    </text>
                    <rect x={0} y={cy - rowH / 2} width={W} height={rowH} fill="transparent"
                      onPointerMove={showTip} onPointerDown={showTip} onPointerLeave={() => setTip(null)} />
                  </g>
                );
              })}
            </svg>
          )}
          <Tooltip tip={tip} width={W} />
        </div>
        <p style={{ fontFamily: FONT, fontSize: 15, lineHeight: 1.5, color: C.ink2, margin: '10px 0 0' }}>
          Svislá čárka ukazuje průběžně sečtený podíl, sloupec predikci konečného výsledku. U Flávia Bolsonara a Luly je ve sloupci vyznačen i interval nejistoty modelu. Menší kandidáti se mezi sčítáním a predikcí liší jen o desetiny bodu.
        </p>
      </ChartCard>
    </div>
  );
}
