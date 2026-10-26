'use client';

// One-off grafy k článku volby-brazilie-2026-10-26-proc-vyhral-lula (oficiální výsledky TSE po obcích):
//  - <BrazilGainsChart />   kolik hlasů kandidáti získali mezi 1. a 2. kolem a odkud se mohly vzít
//  - <BrazilRegionsChart /> Lulův čistý náskok v hlasech po regionech, 1. kolo → 2. kolo
// Data generuje _data_pipeline/build.py do brazil2026ProcData.ts. Stavba a barvy jako BrazilPredictionCharts.tsx.

import { useState } from 'react';
import ChartCard from './ChartCard';
import { C, FONT, fmt, useWidth, Tooltip, type Tip } from './BrazilPredictionCharts';
import { GAINS, REGIONS } from './brazil2026ProcData';

const SOURCE = 'oficiální výsledky [TSE](https://resultados.tse.jus.br/) po obcích, výpočet DataTimes.cz';
const mil = (v: number, d = 1) => fmt(v / 1e6, d);
const LULA_LIGHT = '#fda668';   // brandOrange.3
const FLAVIO_LIGHT = '#4fd6b4'; // brandEmeraldMint.4

export function BrazilGainsChart() {
  const [ref, W] = useWidth<HTMLDivElement>();
  const [tip, setTip] = useState<Tip>(null);
  const narrow = W < 600;
  const L = narrow ? 0 : 150, R = narrow ? 8 : 150, T = 10, rowH = narrow ? 64 : 52;
  const MAX = 66e6;
  const x = (v: number) => L + (v / MAX) * (W - L - R);
  const rows = [
    { n: 'Lula', r1: GAINS.lula_r1, r2: GAINS.lula_r2, col: C.lula, light: LULA_LIGHT },
    { n: 'Flávio Bolsonaro', r1: GAINS.flavio_r1, r2: GAINS.flavio_r2, col: C.flavio, light: FLAVIO_LIGHT },
  ];
  const H = T + rows.length * rowH + 26;
  const lab: React.CSSProperties = { fontSize: narrow ? 12 : 13, fill: C.ink, fontFamily: FONT };
  const ticks = [0, 20e6, 40e6, 60e6];

  return (
    <div style={{ clear: 'both' }}>
      <ChartCard title={`Lula přidal mezi koly ${mil(GAINS.lula_r2 - GAINS.lula_r1)} milionu hlasů, Flávio Bolsonaro ${mil(GAINS.flavio_r2 - GAINS.flavio_r1)} milionu`}
        subtitle="Počet hlasů v 1. kole (plná část) a přírůstek ve 2. kole (světlá část), v milionech" source={SOURCE}>
        <div ref={ref} style={{ position: 'relative', width: '100%' }}>
          {W > 0 && (
            <svg width={W} height={H} role="img" style={{ display: 'block', overflow: 'visible' }}
              aria-label={`Lula měl v 1. kole ${mil(GAINS.lula_r1)} milionu hlasů a ve 2. kole ${mil(GAINS.lula_r2)} milionu. Flávio Bolsonaro ${mil(GAINS.flavio_r1)} a ${mil(GAINS.flavio_r2)} milionu.`}>
              {ticks.map((v) => (
                <g key={v}>
                  <line x1={x(v)} x2={x(v)} y1={T} y2={T + rows.length * rowH} stroke={C.grid} />
                  <text x={x(v)} y={T + rows.length * rowH + 16} textAnchor="middle" style={{ fontSize: 11.5, fill: C.ink, fontFamily: FONT }}>{v / 1e6} mil.</text>
                </g>
              ))}
              {rows.map((d, i) => {
                const cy = T + i * rowH + rowH / 2 + (narrow ? 8 : 0);
                const show = () => setTip({ x: x(d.r2), y: cy, body: <><strong>{d.n}</strong><br />
                  1. kolo {d.r1.toLocaleString('cs-CZ')} hlasů<br />2. kolo <strong>{d.r2.toLocaleString('cs-CZ')}</strong><br />
                  přírůstek +{(d.r2 - d.r1).toLocaleString('cs-CZ')}</> });
                return (
                  <g key={d.n}>
                    <text x={narrow ? 0 : L - 10} y={narrow ? cy - 16 : cy + 4} textAnchor={narrow ? 'start' : 'end'} style={{ ...lab, fontWeight: 600, fill: d.col }}>{d.n}</text>
                    <rect x={x(0)} y={cy - 10} width={x(d.r1) - x(0)} height={20} fill={d.col} rx={2} />
                    <rect x={x(d.r1)} y={cy - 10} width={x(d.r2) - x(d.r1)} height={20} fill={d.light} rx={2} />
                    <text x={x(d.r1) - 6} y={cy + 4} textAnchor="end" style={{ ...lab, fill: '#fff', fontWeight: 600 }}>{mil(d.r1)}</text>
                    <text x={x(d.r2) + 6} y={cy + 4} style={{ ...lab, fontWeight: 600 }}>
                      {narrow ? `+${mil(d.r2 - d.r1)}` : `+${mil(d.r2 - d.r1)} → ${mil(d.r2)} mil.`}
                    </text>
                    <rect x={0} y={cy - rowH / 2} width={W} height={rowH} fill="transparent" onPointerMove={show} onPointerDown={show} onPointerLeave={() => setTip(null)} />
                  </g>
                );
              })}
            </svg>
          )}
          <Tooltip tip={tip} width={W} />
        </div>
        <p style={{ fontFamily: FONT, fontSize: 15, lineHeight: 1.5, color: C.ink2, margin: '10px 0 0' }}>
          Kde se nové hlasy mohly vzít: deset vyřazených kandidátů mělo v 1. kole dohromady {mil(GAINS.ostatni_r1)} milionu hlasů, prázdných a neplatných lístků bylo ve 2. kole o {mil(GAINS.prazdne_ubylo)} milionu méně a k volbám přišlo o {mil(GAINS.prislo_navic)} milionu lidí víc. Kdo konkrétně ke komu přešel, výsledky neukazují.
        </p>
      </ChartCard>
    </div>
  );
}

export function BrazilRegionsChart() {
  const [ref, W] = useWidth<HTMLDivElement>();
  const [tip, setTip] = useState<Tip>(null);
  const narrow = W < 600;
  const L = narrow ? 0 : 120, R = 16, T = 30, rowH = narrow ? 56 : 44;
  const A = -6.5e6, B = 15e6;
  const x = (v: number) => L + ((v - A) / (B - A)) * (W - L - R);
  const H = T + REGIONS.length * rowH + 26;
  const bottom = T + REGIONS.length * rowH;
  const lab: React.CSSProperties = { fontSize: narrow ? 12 : 13, fill: C.ink, fontFamily: FONT };
  const ticks = [-5e6, 0, 5e6, 10e6, 15e6];

  return (
    <div style={{ clear: 'both' }}>
      <ChartCard title="Lula zvýšil náskok na severovýchodě a na jihovýchodě srazil ztrátu na polovinu"
        subtitle="Rozdíl hlasů mezi Lulou a Fláviem Bolsonarem po regionech, 1. kolo (kroužek) → 2. kolo (šipka), v milionech" source={SOURCE}>
        <div ref={ref} style={{ position: 'relative', width: '100%' }}>
          {W > 0 && (
            <svg width={W} height={H} role="img" style={{ display: 'block', overflow: 'visible' }}
              aria-label="Severovýchod: Lulův náskok vzrostl z 11,1 na 13,7 milionu hlasů. Jihovýchod: ztráta klesla z 5,7 na 2,8 milionu. Jih a středozápad zůstaly výrazně pro Flávia Bolsonara, sever skončil téměř nerozhodně.">
              <defs>
                <marker id="brArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0,0 L10,5 L0,10 z" fill={C.ink} />
                </marker>
              </defs>
              <text x={x(0) + 6} y={T - 12} style={{ ...lab, fontSize: 12, fontWeight: 600, fill: C.lula }}>náskok Luly →</text>
              <text x={x(0) - 6} y={T - 12} textAnchor="end" style={{ ...lab, fontSize: 12, fontWeight: 600, fill: C.flavio }}>← náskok Flávia</text>
              {ticks.map((v) => (
                <g key={v}>
                  <line x1={x(v)} x2={x(v)} y1={T - 4} y2={bottom} stroke={v === 0 ? C.ink : C.grid} strokeWidth={v === 0 ? 1.5 : 1} />
                  <text x={x(v)} y={bottom + 16} textAnchor="middle" style={{ fontSize: 11.5, fill: C.ink, fontFamily: FONT }}>{v === 0 ? '0' : `${v > 0 ? '+' : '−'}${Math.abs(v / 1e6)}`}</text>
                </g>
              ))}
              {REGIONS.map((d, i) => {
                const cy = T + i * rowH + rowH / 2 + (narrow ? 8 : 0);
                const show = () => setTip({ x: x(Math.max(d.r1, d.r2)), y: cy, body: <><strong>{d.n}</strong><br />
                  Lula ze dvou kandidátů: {fmt(d.l1, 1)} % → <strong>{fmt(d.l2, 1)} %</strong><br />
                  rozdíl hlasů: {d.r1.toLocaleString('cs-CZ')} → <strong>{d.r2.toLocaleString('cs-CZ')}</strong><br />
                  účast {d.u > 0 ? '+' : '−'}{fmt(Math.abs(d.u), 1)} bodu</> });
                const col = d.r2 >= 0 ? C.lula : C.flavio;
                return (
                  <g key={d.n}>
                    <text x={narrow ? 0 : L - 10} y={narrow ? cy - 16 : cy + 4} textAnchor={narrow ? 'start' : 'end'} style={{ ...lab, fontWeight: 600 }}>{d.n}</text>
                    <line x1={x(d.r1)} x2={x(d.r2)} y1={cy} y2={cy} stroke={C.ink} strokeWidth={2} markerEnd={Math.abs(x(d.r2) - x(d.r1)) > 8 ? 'url(#brArrow)' : undefined} />
                    <circle cx={x(d.r1)} cy={cy} r={5} fill={C.surface} stroke={C.ink} strokeWidth={2} />
                    <text x={x(Math.max(d.r1, d.r2)) + 10} y={cy + 4} style={{ ...lab, fontWeight: 600, fill: col }}>
                      {d.r2 >= 0 ? '+' : '−'}{Math.abs(d.r2) < 1e5 ? `${Math.abs(d.r2).toLocaleString('cs-CZ')} hlasů` : `${mil(Math.abs(d.r2))} mil.`}
                    </text>
                    <rect x={0} y={cy - rowH / 2} width={W} height={rowH} fill="transparent" onPointerMove={show} onPointerDown={show} onPointerLeave={() => setTip(null)} />
                  </g>
                );
              })}
            </svg>
          )}
          <Tooltip tip={tip} width={W} />
        </div>
      </ChartCard>
    </div>
  );
}
