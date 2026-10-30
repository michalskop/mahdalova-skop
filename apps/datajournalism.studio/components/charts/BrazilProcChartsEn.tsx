'use client';

// English variant of BrazilProcCharts.tsx for elections-brazil-2026-10-26-why-lula-won (datajournalism.studio).
//  - <BrazilGainsChartEn />   votes gained between the 1st and 2nd round and where they could have come from
//  - <BrazilRegionsChartEn /> Lula's net vote margin by region, 1st round → 2nd round
// Same data (brazil2026ProcData.ts), same layout and colours; labels in English, decimal point.

import { useState } from 'react';
import ChartCard from './ChartCard';
import { C, FONT, useWidth, Tooltip, type Tip } from './BrazilPredictionCharts';
import { GAINS, REGIONS } from './brazil2026ProcData';

const SOURCE = 'official [TSE](https://resultados.tse.jus.br/) results by municipality, DataTimes calculation';
const fmt = (v: number, d = 1) => v.toFixed(d);
const REGION_EN: Record<string, string> = { 'Severovýchod': 'North-east', 'Sever': 'North', 'Jihovýchod': 'South-east', 'Středozápad': 'Centre-West', 'Jih': 'South' };
const rn = (n: string) => REGION_EN[n] ?? n;
const mil = (v: number, d = 1) => fmt(v / 1e6, d);
// Party colours, same as the municipal map and covers (Kateřina 30. 10., previously flag colours):
// Lula = PT red brandCoralRed, Flávio = PL blue brandRoyalBlue (not PL green next to red, for colour-blind readers).
const LULA = '#e8412c';        // brandCoralRed.6
const LULA_TEXT = '#a32318';   // brandCoralRed.8
const LULA_LIGHT = '#ffcec6';  // brandCoralRed.1
const FLAVIO = '#4a51ab';      // brandRoyalBlue.6
const FLAVIO_TEXT = '#383d82'; // brandRoyalBlue.7
const FLAVIO_LIGHT = '#c9d0f5'; // brandRoyalBlue.1

export function BrazilGainsChartEn() {
  const [ref, W] = useWidth<HTMLDivElement>();
  const [tip, setTip] = useState<Tip>(null);
  const narrow = W < 600;
  const L = narrow ? 0 : 150, R = narrow ? 8 : 150, T = 10, rowH = narrow ? 64 : 52;
  const MAX = 66e6;
  const x = (v: number) => L + (v / MAX) * (W - L - R);
  const rows = [
    { n: 'Lula', r1: GAINS.lula_r1, r2: GAINS.lula_r2, col: LULA, text: LULA_TEXT, inner: C.ink, light: LULA_LIGHT },
    { n: 'Flávio Bolsonaro', r1: GAINS.flavio_r1, r2: GAINS.flavio_r2, col: FLAVIO, text: FLAVIO_TEXT, inner: '#fff', light: FLAVIO_LIGHT },
  ];
  const H = T + rows.length * rowH + 26;
  const lab: React.CSSProperties = { fontSize: narrow ? 12 : 13, fill: C.ink, fontFamily: FONT };
  const ticks = [0, 20e6, 40e6, 60e6];

  return (
    <div style={{ clear: 'both' }}>
      <ChartCard title={`Lula added ${mil(GAINS.lula_r2 - GAINS.lula_r1)} million votes between the rounds, Flávio Bolsonaro ${mil(GAINS.flavio_r2 - GAINS.flavio_r1)} million`}
        subtitle="Votes in the 1st round (solid) and the gain in the 2nd round (light), in millions" source={SOURCE}>
        <div ref={ref} style={{ position: 'relative', width: '100%' }}>
          {W > 0 && (
            <svg width={W} height={H} role="img" style={{ display: 'block', overflow: 'visible' }}
              aria-label={`Lula had ${mil(GAINS.lula_r1)} million votes in the 1st round and ${mil(GAINS.lula_r2)} million in the 2nd. Flávio Bolsonaro had ${mil(GAINS.flavio_r1)} and ${mil(GAINS.flavio_r2)} million.`}>
              {ticks.map((v) => (
                <g key={v}>
                  <line x1={x(v)} x2={x(v)} y1={T} y2={T + rows.length * rowH} stroke={C.grid} />
                  <text x={x(v)} y={T + rows.length * rowH + 16} textAnchor="middle" style={{ fontSize: 11.5, fill: C.ink, fontFamily: FONT }}>{v / 1e6}m</text>
                </g>
              ))}
              {rows.map((d, i) => {
                const cy = T + i * rowH + rowH / 2 + (narrow ? 8 : 0);
                const show = () => setTip({ x: x(d.r2), y: cy, body: <><strong>{d.n}</strong><br />
                  1st round {d.r1.toLocaleString('en-GB')} votes<br />2nd round <strong>{d.r2.toLocaleString('en-GB')}</strong><br />
                  gain +{(d.r2 - d.r1).toLocaleString('en-GB')}</> });
                return (
                  <g key={d.n}>
                    <text x={narrow ? 0 : L - 10} y={narrow ? cy - 16 : cy + 4} textAnchor={narrow ? 'start' : 'end'} style={{ ...lab, fontWeight: 600, fill: d.text }}>{d.n}</text>
                    <rect x={x(0)} y={cy - 10} width={x(d.r1) - x(0)} height={20} fill={d.col} rx={2} />
                    <rect x={x(d.r1)} y={cy - 10} width={x(d.r2) - x(d.r1)} height={20} fill={d.light} rx={2} />
                    <text x={x(d.r1) - 6} y={cy + 4} textAnchor="end" style={{ ...lab, fill: d.inner, fontWeight: 600 }}>{mil(d.r1)}</text>
                    <text x={x(d.r2) + 6} y={cy + 4} style={{ ...lab, fontWeight: 600 }}>
                      {narrow ? `+${mil(d.r2 - d.r1)}` : `+${mil(d.r2 - d.r1)} → ${mil(d.r2)}m`}
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
          Where the new votes could have come from: the ten eliminated candidates received {mil(GAINS.ostatni_r1)} million votes between them in the 1st round, there were {mil(GAINS.prazdne_ubylo)} million fewer blank and invalid ballots in the 2nd round, and {mil(GAINS.prislo_navic)} million more people turned out to vote. The results do not show exactly who switched to whom.
        </p>
      </ChartCard>
    </div>
  );
}

export function BrazilRegionsChartEn() {
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
      <ChartCard title="Lula widened his lead in the North-east and halved his deficit in the South-east"
        subtitle="Vote margin between Lula and Flávio Bolsonaro by region, 1st round (circle) → 2nd round (arrow), in millions" source={SOURCE}>
        <div ref={ref} style={{ position: 'relative', width: '100%' }}>
          {W > 0 && (
            <svg width={W} height={H} role="img" style={{ display: 'block', overflow: 'visible' }}
              aria-label="North-east: Lula's lead grew from 11.1 to 13.7 million votes. South-east: his deficit fell from 5.7 to 2.8 million. The South and the Centre-West remained strongly for Flávio Bolsonaro; the North ended almost level.">
              <defs>
                <marker id="brArrowEn" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0,0 L10,5 L0,10 z" fill={C.ink} />
                </marker>
              </defs>
              <text x={x(0) + 6} y={T - 12} style={{ ...lab, fontSize: 12, fontWeight: 600, fill: LULA_TEXT }}>Lula leads →</text>
              <text x={x(0) - 6} y={T - 12} textAnchor="end" style={{ ...lab, fontSize: 12, fontWeight: 600, fill: FLAVIO_TEXT }}>← Flávio leads</text>
              {ticks.map((v) => (
                <g key={v}>
                  <line x1={x(v)} x2={x(v)} y1={T - 4} y2={bottom} stroke={v === 0 ? C.ink : C.grid} strokeWidth={v === 0 ? 1.5 : 1} />
                  <text x={x(v)} y={bottom + 16} textAnchor="middle" style={{ fontSize: 11.5, fill: C.ink, fontFamily: FONT }}>{v === 0 ? '0' : `${v > 0 ? '+' : '−'}${Math.abs(v / 1e6)}`}</text>
                </g>
              ))}
              {REGIONS.map((d, i) => {
                const cy = T + i * rowH + rowH / 2 + (narrow ? 8 : 0);
                const show = () => setTip({ x: x(Math.max(d.r1, d.r2)), y: cy, body: <><strong>{rn(d.n)}</strong><br />
                  Lula, two-candidate share: {fmt(d.l1, 1)}% → <strong>{fmt(d.l2, 1)}%</strong><br />
                  vote margin: {d.r1.toLocaleString('en-GB')} → <strong>{d.r2.toLocaleString('en-GB')}</strong><br />
                  turnout {d.u > 0 ? '+' : '−'}{fmt(Math.abs(d.u), 1)} points</> });
                const col = d.r2 >= 0 ? LULA_TEXT : FLAVIO_TEXT;
                return (
                  <g key={d.n}>
                    <text x={narrow ? 0 : L - 10} y={narrow ? cy - 16 : cy + 4} textAnchor={narrow ? 'start' : 'end'} style={{ ...lab, fontWeight: 600 }}>{rn(d.n)}</text>
                    <line x1={x(d.r1)} x2={x(d.r2)} y1={cy} y2={cy} stroke={C.ink} strokeWidth={2} markerEnd={Math.abs(x(d.r2) - x(d.r1)) > 8 ? 'url(#brArrowEn)' : undefined} />
                    <circle cx={x(d.r1)} cy={cy} r={5} fill={C.surface} stroke={C.ink} strokeWidth={2} />
                    <text x={x(Math.max(d.r1, d.r2)) + 10} y={cy + 4} style={{ ...lab, fontWeight: 600, fill: col }}>
                      {d.r2 >= 0 ? '+' : '−'}{Math.abs(d.r2) < 1e5 ? `${Math.abs(d.r2).toLocaleString('en-GB')} votes` : `${mil(Math.abs(d.r2))}m`}
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
