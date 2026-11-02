'use client';

// One-off grafy k článku volby-brazilie-2026-10-25-druhe-kolo-vyhrava-lula:
//  - <BrazilRunoffTimeline /> volební noc 2. kola: predikce DataTimes × průběžné sčítání podle sečtené části
//  - <BrazilRunoffStates />   odhad konečného výsledku po státech (Lulův podíl na hlasech pro dva kandidáty)
// Data generuje _data_pipeline/build.py u článku do brazil2026RunoffData.ts. Stavba a barvy jako
// BrazilPredictionCharts.tsx (1. kolo).

import { useState } from 'react';
import ChartCard from './ChartCard';
import ChartLegend from './ChartLegend';
import { C, FONT, fmt, useWidth, Tooltip, type Tip } from './BrazilPredictionCharts';
import { RUNOFF, STATES, STAV } from './brazil2026RunoffData';

type P = { m: number; s: number; lo: number | null; hi: number | null; r: number; c: number };
const PTS: P[] = RUNOFF.map(([m, s, lo, hi, r, c]) => ({ m: m!, s: s!, lo, hi, r: r!, c: c! }));
const LAST = PTS[PTS.length - 1];

const hhmm = (m: number) => {
  const t = Math.floor(m) + 21 * 60;
  return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

const TL_LEGEND = [
  { key: 'model', label: 'Predikce: Lula (pás = 90% interval)', color: C.lula },
  { key: 'count', label: 'Průběžné sčítání: Lula', color: C.ink2 },
];
const SOURCE = 'živý model Mahdalová & Škop nad průběžnými daty [TSE](https://resultados.tse.jus.br/)';

export function BrazilRunoffTimeline() {
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
  // úsek, kdy průběžné sčítání ukazovalo v čele Flávia
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
      <strong>{hhmm(p.m)} SEČ</strong> · sečteno {fmt(p.c, 1)} % voličů<br />
      <span style={{ color: C.lula }}>●</span> predikce Lula <strong>{fmt(p.s, 2)} %</strong>
      {p.lo !== null && <span style={{ color: C.ink2 }}> ({fmt(p.lo, 1)}–{fmt(p.hi!, 1)})</span>}<br />
      <span style={{ color: C.ink2 }}>●</span> průběžně Lula {fmt(p.r, 2)} %, Flávio {fmt(100 - p.r, 2)} %
    </> });
  }

  return (
    <div style={{ clear: 'both' }}>
      <ChartCard title="Průběžné sčítání kolísalo, predikce celou noc ukazovala Lulu"
        subtitle={`Lulův podíl na hlasech pro dva kandidáty (%) podle sečtené části • 25.–26. října 2026, stav ${STAV}`} source={SOURCE}>
        <ChartLegend items={TL_LEGEND} activeKeys={active} onChange={setActive} />
        <div ref={ref} style={{ position: 'relative', width: '100%' }}>
          {W > 0 && (
            <svg width={W} height={H} role="img" style={{ display: 'block', overflow: 'visible' }}
              aria-label={`Predikce DataTimes.cz dávala Lulovi celou noc mezi ${fmt(Math.min(...PTS.map((p) => p.s)), 1)} a ${fmt(Math.max(...PTS.map((p) => p.s)), 1)} %. Průběžné sčítání mezitím kleslo pod 50 % a Flávio Bolsonaro v něm vedl.`}>
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
                  <text x={x(v)} y={H - M.b + 18} textAnchor="middle" style={tick}>{v} %</text>
                </g>
              ))}
              <text x={W - M.r} y={H - 4} textAnchor="end" style={{ ...tick, fill: C.ink2 }}>sečteno, % zapsaných voličů →</text>
              <line x1={M.l} x2={W - M.r} y1={y(50)} y2={y(50)} stroke={C.ink} strokeWidth={1.5} strokeDasharray="6 4" />
              <text x={M.l + 6} y={y(50) - 7} style={{ ...labB, fill: C.lula }}>{narrow ? '' : '↑ vítězí Lula'}</text>
              <text x={M.l + 6} y={y(Y0) - 8} style={{ ...labB, fill: C.flavio }}>↓ pod čarou by vítězil Flávio Bolsonaro</text>

              {on('model') && <path d={bandD} fill={C.lula} opacity={0.16} />}
              {on('count') && bFrom && bTo && (
                <text x={(x(bFrom.c) + x(bTo.c)) / 2} y={y(48.6)} textAnchor="middle" style={{ ...labB, fill: C.ink2 }}>
                  {narrow ? 'průběžně vedl Flávio' : `${hhmm(bFrom.m)}–${hhmm(bTo.m)}: průběžně vedl Flávio`}
                </text>
              )}
              {on('count') && <path d={line('r')} fill="none" stroke={C.ink2} strokeWidth={2} strokeDasharray="4 3" strokeLinejoin="round" />}
              {on('model') && <path d={line('s')} fill="none" stroke={C.lula} strokeWidth={3} strokeLinejoin="round" />}
              {on('model') && (
                <text x={x(LAST.c) - 4} y={y(LAST.s) - 12} textAnchor="end" style={{ ...labB, fill: C.lula }}>predikce {fmt(LAST.s, 2)} %</text>
              )}
              {on('count') && (
                <text x={x(LAST.c) - 4} y={yc(LAST.r) + 18} textAnchor="end" style={{ ...labB, fill: C.ink2 }}>průběžně {fmt(LAST.r, 2)} %</text>
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
          Osa x ukazuje, jak velká část voličů už byla sečtena (podle okrsků, v nichž jsou zapsaní). Počáteční výkyvy průběžného sčítání nad 56 % a interval nejistoty z prvních minut jsou oříznuté.
        </p>
      </ChartCard>
    </div>
  );
}

const ST_LEGEND = [
  { key: 'lula', label: 'Vyhrává Lula', color: C.lula },
  { key: 'flavio', label: 'Vyhrává Flávio Bolsonaro', color: C.flavio },
];

export function BrazilRunoffStates() {
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

  return (
    <div style={{ clear: 'both' }}>
      <ChartCard title="Lula drží severovýchod, Flávio jih a středozápad. Minas Gerais se přiklání k Lulovi"
        subtitle={`Predikce Lulova konečného podílu na hlasech pro dva kandidáty (%) podle států • stav ${STAV}`} source={SOURCE}>
        <ChartLegend items={ST_LEGEND} />
        <div ref={ref} style={{ position: 'relative', width: '100%' }}>
          {W > 0 && (
            <svg width={W} height={H} role="img" style={{ display: 'block', overflow: 'visible' }}
              aria-label={`Predikce po státech: Lula vede ve ${rows.filter((r) => r.k !== 'ZZ' && r.l > 50).length} státech, Flávio Bolsonaro ve ${rows.filter((r) => r.k !== 'ZZ' && r.l < 50).length}. Nejvyšší podíl má Lula v Piauí, nejnižší v Roraimě.`}>
              {ticks.map((v) => (
                <g key={v}>
                  {v !== 50 && <line x1={x(v)} x2={x(v)} y1={T - 6} y2={bottom} stroke={C.grid} />}
                  <text x={x(v)} y={bottom + 16} textAnchor="middle" style={{ fontSize: 11.5, fill: C.ink, fontFamily: FONT }}>{v} %</text>
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
                    <span style={{ color: C.lula }}>●</span> Lula <strong>{fmt(d.l, 1)} %</strong> <span style={{ color: C.ink2 }}>({fmt(d.lo, 1)}–{fmt(d.hi, 1)})</span><br />
                    <span style={{ color: C.flavio }}>●</span> Flávio Bolsonaro <strong>{fmt(100 - d.l, 1)} %</strong><br />
                    <span style={{ color: C.ink2 }}>sečteno {fmt(d.c, 0)} % voličů{d.k1 ? ` · 1. kolo vyhrál ${d.k1 === 'F' ? 'Flávio' : 'Lula'}` : ''}</span></>,
                });
                return (
                  <g key={d.k}>
                    <text x={L - 8} y={cy + 4} textAnchor="end" style={{ ...lab, fontWeight: flip || d.k === 'ZZ' ? 600 : 400, fontStyle: d.k === 'ZZ' ? 'italic' : undefined }}>
                      {narrow && d.k === 'ZZ' ? 'zahraničí' : d.n}
                    </text>
                    <rect x={Math.min(x(50), x(d.l))} y={cy - 7} width={Math.abs(x(d.l) - x(50))} height={14} fill={col} opacity={d.k === 'ZZ' ? 0.55 : 1} rx={2} />
                    <text x={x(d.l) + (win ? 6 : -6)} y={cy + 4} textAnchor={win ? 'start' : 'end'} style={{ ...lab, fontWeight: 600, fill: col }}>
                      {fmt(d.l, 1)}
                    </text>
                    {flip && !narrow && (
                      <text x={x(d.l) + 44} y={cy + 4} style={{ ...lab, fill: C.ink2 }}>v 1. kole vedl Flávio</text>
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
          Číslo u sloupce je Lulův odhadovaný podíl; Flávio Bolsonaro má zbytek do 100 %. V popisku po najetí myší je 90% interval nejistoty a to, kolik voličů už bylo v daném státě sečteno.
        </p>
      </ChartCard>
    </div>
  );
}
