'use client';

// English one-off charts for the Serbia 2026 election articles
// (translated from apps/web/components/charts/SerbiaElectionCharts.tsx):
//  - <SerbiaNightTimelineEn /> election night 25–26 Oct 2026: DataTimes prediction vs RIK running count over time
//    (article elections-serbia-2026-10-25-students-defeat-vucic-prediction)
//  - <SerbiaVotesChartEn />    votes 2023 vs 2026 by RIK (article elections-serbia-2026-10-26-why-vucic-lost)
// Self-contained apart from ChartCard and ChartLegend: palette and helpers copied here (decimal point instead of comma).
// Data values unchanged, see serbia2026DataEn.ts.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import ChartCard from './ChartCard';
import ChartLegend from './ChartLegend';
import { NIGHT, STAV, VOTES } from './serbia2026DataEn';

const C = {
  ink: '#101432',
  ink2: '#4c4f8e',
  grid: '#eeeae2',
  beige: '#bcbcb0',
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

// Colours of the two camps converted to our palette: the students use dark crimson, SNS dark blue.
const STU = '#a03250';  // Student List – brandDeepRed.6
const SNS = '#4a51ab';  // Vučić's SNS – brandRoyalBlue.6

type P = { m: number; c: number; s: number; slo: number; shi: number; sr: number; n: number; nlo: number; nhi: number; nr: number };
const ALL: P[] = NIGHT.map(([m, c, s, slo, shi, sr, n, nlo, nhi, nr]) => ({ m, c, s, slo, shi, sr, n, nlo, nhi, nr }));
const LAST = ALL[ALL.length - 1];
const M0 = 70, M1 = 480;   // 21:10–04:00 CET; after that neither the prediction nor the count visibly changes
const PTS = ALL.filter((p) => p.m <= M1);

const hhmm = (m: number) => {
  const t = Math.round(m) + 20 * 60;
  return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};
const at = (hm: string) => { const [h, mi] = hm.split(':').map(Number); return ((h + 24 - 20) % 24) * 60 + mi; };
const covAt = (m: number) => { let p = ALL[0]; for (const q of ALL) { if (q.m <= m) p = q; else break; } return p.c; };

export type NightEvent = { m: number; label: string; short: string };
const EVENTS: NightEvent[] = [
  { m: at('21:29'), label: 'Vučić concedes', short: 'Vučić' },
  { m: at('22:01'), label: 'prediction: students win', short: 'prediction' },
  { m: at('23:14'), label: 'count: students lead for the first time', short: 'count' },
];

const TL_LEGEND = [
  { key: 'stu', label: 'Student List', color: STU },
  { key: 'sns', label: 'Vučić’s SNS', color: SNS },
  { key: 'count', label: 'running count (dashed)', color: C.beige },
];
const SOURCE = 'live Mahdalová & Škop model on running results from the [Republic Electoral Commission (RIK)](https://www.rik.parlament.gov.rs/)';

export function SerbiaNightTimelineEn({ events = [] }: { events?: NightEvent[] }) {
  const [ref, W] = useWidth<HTMLDivElement>();
  const [tip, setTip] = useState<Tip>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [active, setActive] = useState<string[]>(TL_LEGEND.map((l) => l.key));
  const on = (k: string) => active.includes(k);
  const narrow = W < 640;
  const H = narrow ? 400 : 440;
  const M = { l: narrow ? 30 : 40, r: narrow ? 12 : 96, t: 40, b: 46 };
  const Y0 = 30, Y1 = 62;
  // broken time axis: the decisive first two hours (21:10–23:30) get more than half of the width
  const MB = at('23:30'), FB = 0.55;
  const fx = (m: number) => { const v = Math.max(M0, Math.min(M1, m)); return v <= MB ? ((v - M0) / (MB - M0)) * FB : FB + ((v - MB) / (M1 - MB)) * (1 - FB); };
  const x = (m: number) => M.l + fx(m) * (W - M.l - M.r);
  const xInv = (px: number) => { const f = (px - M.l) / (W - M.l - M.r); return f <= FB ? M0 + (f / FB) * (MB - M0) : MB + ((f - FB) / (1 - FB)) * (M1 - MB); };
  const y = (v: number) => M.t + ((Y1 - v) / (Y1 - Y0)) * (H - M.t - M.b);
  const yc = (v: number) => y(Math.max(Y0, Math.min(Y1, v)));
  const line = (k: 's' | 'sr' | 'n' | 'nr') => PTS.map((p, i) => `${i ? 'L' : 'M'}${x(p.m).toFixed(1)},${yc(p[k]).toFixed(1)}`).join('');
  const band = (lo: 'slo' | 'nlo', hi: 'shi' | 'nhi') =>
    PTS.map((p, i) => `${i ? 'L' : 'M'}${x(p.m).toFixed(1)},${yc(p[hi]).toFixed(1)}`).join('') +
    [...PTS].reverse().map((p) => `L${x(p.m).toFixed(1)},${yc(p[lo]).toFixed(1)}`).join('') + 'Z';
  const lab: React.CSSProperties = { fontSize: narrow ? 11.5 : 12.5, fill: C.ink, fontFamily: FONT };
  const labB: React.CSSProperties = { ...lab, fontWeight: 600 };
  const tick: React.CSSProperties = { fontSize: 11.5, fill: C.ink, fontFamily: FONT };
  const yTicks = narrow ? [30, 40, 50, 60] : [30, 35, 40, 45, 50, 55, 60];
  const xTicks = narrow ? [at('21:30'), at('22:30'), at('23:30'), at('02:00'), at('04:00')] : [at('21:30'), at('22:00'), at('22:30'), at('23:00'), at('23:30'), at('01:00'), at('02:30'), at('04:00')];
  const evs = [...EVENTS, ...events].sort((a, b) => a.m - b.m);

  function onMove(e: React.PointerEvent<SVGRectElement>) {
    const r = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
    const m = xInv(e.clientX - r.left);
    let i = 0;
    while (i < PTS.length - 1 && Math.abs(PTS[i + 1].m - m) <= Math.abs(PTS[i].m - m)) i++;
    const p = PTS[i];
    setHover(i);
    setTip({ x: x(p.m), y: yc(Math.max(p.s, p.n)), body: <>
      <strong>{hhmm(p.m)} CET</strong> · {fmt(p.c, p.c < 10 ? 2 : 1)}% of voters counted<br />
      <span style={{ color: STU }}>●</span> students: prediction <strong>{fmt(p.s, 1)}%</strong>
      <span style={{ color: C.ink2 }}> ({fmt(p.slo, 1)}–{fmt(p.shi, 1)})</span>, counted {fmt(p.sr, 1)}%<br />
      <span style={{ color: SNS }}>●</span> SNS: prediction <strong>{fmt(p.n, 1)}%</strong>
      <span style={{ color: C.ink2 }}> ({fmt(p.nlo, 1)}–{fmt(p.nhi, 1)})</span>, counted {fmt(p.nr, 1)}%
    </> });
  }

  const endX = x(M1);
  return (
    <div style={{ clear: 'both' }}>
      <ChartCard title="The prediction confirmed Vučić’s defeat within half an hour; the running count showed it only after 11 pm"
        subtitle="Share of valid votes (%): prediction of the final result with 90% interval, and votes counted so far • 25–26 October 2026, CET" source={SOURCE}>
        <ChartLegend items={TL_LEGEND} activeKeys={active} onChange={setActive} />
        <div ref={ref} style={{ position: 'relative', width: '100%' }}>
          {W > 0 && (
            <svg width={W} height={H} role="img" style={{ display: 'block', overflow: 'visible' }}
              aria-label={`Vučić conceded defeat at around 21:29. From 21:44 the DataTimes.cz prediction showed the Student List in the lead, and from 22:01 the uncertainty intervals of the two lists no longer overlapped. The running count showed the students ahead only at 23:14. Final state: students ${fmt(LAST.sr, 1)}%, SNS ${fmt(LAST.nr, 1)}%.`}>
              {yTicks.map((v) => (
                <g key={v}>
                  <line x1={M.l} x2={endX} y1={y(v)} y2={y(v)} stroke={v === 50 ? C.beige : C.grid} strokeDasharray={v === 50 ? '6 4' : undefined} />
                  <text x={M.l - 7} y={y(v) + 4} textAnchor="end" style={tick}>{v}</text>
                </g>
              ))}
              {xTicks.map((v) => (
                <g key={v}>
                  <line x1={x(v)} x2={x(v)} y1={H - M.b} y2={H - M.b + 4} stroke={C.beige} />
                  <text x={x(v)} y={H - M.b + 17} textAnchor="middle" style={tick}>{hhmm(v)}</text>
                  <text x={x(v)} y={H - M.b + 31} textAnchor="middle" style={{ ...tick, fontSize: 10.5, fill: C.ink2 }}>{fmt(covAt(v), covAt(v) < 10 ? 1 : 0)}%</text>
                </g>
              ))}
              <line x1={x(MB)} x2={x(MB)} y1={M.t} y2={H - M.b} stroke={C.beige} strokeDasharray="2 3" />
              <text x={x(MB) + 4} y={H - M.b - 6} style={{ ...tick, fontSize: 10.5, fill: C.ink2 }}>axis compressed →</text>
              {!narrow && <text x={M.l - 7} y={H - M.b + 31} textAnchor="end" style={{ ...tick, fontSize: 10.5, fill: C.ink2 }}>counted</text>}

              {evs.map((ev, i) => (
                <g key={ev.label}>
                  <line x1={x(ev.m)} x2={x(ev.m)} y1={M.t - 6 - (i % 2) * 14} y2={H - M.b} stroke={C.ink} strokeWidth={1} opacity={0.45} />
                  <text x={x(ev.m) + 4} y={M.t - 10 - (i % 2) * 14} style={{ ...labB, fontSize: narrow ? 10.5 : 12 }}>{hhmm(ev.m)} {narrow ? ev.short : ev.label}</text>
                </g>
              ))}

              {on('stu') && <path d={band('slo', 'shi')} fill={STU} opacity={0.16} />}
              {on('sns') && <path d={band('nlo', 'nhi')} fill={SNS} opacity={0.16} />}
              {on('count') && on('stu') && <path d={line('sr')} fill="none" stroke={STU} strokeWidth={1.8} strokeDasharray="4 3" opacity={0.85} />}
              {on('count') && on('sns') && <path d={line('nr')} fill="none" stroke={SNS} strokeWidth={1.8} strokeDasharray="4 3" opacity={0.85} />}
              {on('stu') && <path d={line('s')} fill="none" stroke={STU} strokeWidth={3} strokeLinejoin="round" />}
              {on('sns') && <path d={line('n')} fill="none" stroke={SNS} strokeWidth={3} strokeLinejoin="round" />}

              {!narrow && (
                <>
                  <text x={endX + 6} y={y(LAST.sr) + 4} style={{ ...labB, fill: STU }}>{fmt(LAST.sr, 1)}%</text>
                  <text x={endX + 6} y={y(LAST.sr) + 18} style={{ ...lab, fill: STU }}>students</text>
                  <text x={endX + 6} y={y(LAST.nr) + 4} style={{ ...labB, fill: SNS }}>{fmt(LAST.nr, 1)}%</text>
                  <text x={endX + 6} y={y(LAST.nr) + 18} style={{ ...lab, fill: SNS }}>SNS</text>
                  <text x={endX + 6} y={y(LAST.nr) + 34} style={{ ...lab, fontSize: 10.5, fill: C.ink2 }}>final state</text>
                </>
              )}
              {hover !== null && (
                <>
                  <line x1={x(PTS[hover].m)} x2={x(PTS[hover].m)} y1={M.t} y2={H - M.b} stroke={C.ink} opacity={0.25} />
                  {on('stu') && <circle cx={x(PTS[hover].m)} cy={yc(PTS[hover].s)} r={4.5} fill={STU} stroke="#fff" strokeWidth={2} />}
                  {on('sns') && <circle cx={x(PTS[hover].m)} cy={yc(PTS[hover].n)} r={4.5} fill={SNS} stroke="#fff" strokeWidth={2} />}
                </>
              )}
              <rect x={M.l - 8} y={M.t} width={endX - M.l + 8} height={H - M.t - M.b} fill="transparent" style={{ touchAction: 'pan-y' }}
                onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => { setTip(null); setHover(null); }} />
            </svg>
          )}
          <Tooltip tip={tip} width={W} />
        </div>
        <p style={{ fontFamily: FONT, fontSize: 15, lineHeight: 1.5, color: C.ink2, margin: '10px 0 0' }}>
          The solid line is the prediction of the final share, the band around it the 90% uncertainty interval, the dashed line the votes counted so far. Below each time is the share of voters already counted. The time axis is compressed from 23:30. The very first estimates, made when less than a hundredth of a per cent of voters had been counted, and values outside the axis are cut off. Final state = {STAV}, {fmt(LAST.c, 1)}% of voters counted.
        </p>
      </ChartCard>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// <SerbiaVotesChartEn />: votes 2023 vs 2026 by RIK. Horizontal pairs of bars, values next to the bars;
// lighter bar = 2023, solid = 2026.

const VSOURCE = 'Republic Electoral Commission (RIK): [2026 results](https://www.rik.parlament.gov.rs/) and 2023, own calculation';
const VCOL: Record<string, string> = { sns: SNS, srs: SNS, opo: STU, sps: C.beige, ost: C.beige, nep: C.grid, nev: C.grid };
const mil = (v: number) => (v >= 1e6 ? `${fmt(v / 1e6, 2)}m` : `${Math.round(v / 1000).toLocaleString('en-GB')}k`);

export function SerbiaVotesChartEn() {
  const [ref, W] = useWidth<HTMLDivElement>();
  const narrow = W < 600;
  const L = narrow ? 0 : 270, R = narrow ? 70 : 80, rowH = narrow ? 64 : 48, bar = 15;
  const max = Math.max(...VOTES.flatMap(([, a, b]) => [a, b]));
  const x = (v: number) => (v / max) * (W - L - R);
  const H = VOTES.length * rowH + 8;
  const lab: React.CSSProperties = { fontSize: narrow ? 12 : 13, fill: C.ink, fontFamily: FONT };
  return (
    <div style={{ clear: 'both' }}>
      <ChartCard title="Vučić’s list won almost as many votes as in 2023. The students won 1.4 million more than the main opposition did then"
        subtitle="Votes in the 2023 and 2026 parliamentary elections by group of lists, and registered voters who did not vote" source={VSOURCE}>
        <div style={{ display: 'flex', gap: 18, fontFamily: FONT, fontSize: 13, color: C.ink, margin: '0 0 10px', flexWrap: 'wrap' }}>
          <span><span style={{ display: 'inline-block', width: 14, height: 10, background: C.ink, opacity: 0.35, marginRight: 6 }} />2023 (lighter bar)</span>
          <span><span style={{ display: 'inline-block', width: 14, height: 10, background: C.ink, marginRight: 6 }} />2026</span>
        </div>
        <div ref={ref} style={{ width: '100%' }}>
          {W > 0 && (
            <svg width={W} height={H} role="img" style={{ display: 'block', overflow: 'visible' }}
              aria-label="Vučić’s list had 1.78 million votes in 2023 and 1.73 million in 2026. The main opposition had 0.90 million votes in 2023, the Student List 2.35 million in 2026. The number of people who did not vote fell from 2.68 to 1.99 million.">
              {VOTES.map(([n, a, b, k], i) => {
                const y0 = i * rowH + (narrow ? 18 : 6);
                const col = VCOL[k];
                return (
                  <g key={n}>
                    <text x={narrow ? 0 : L - 10} y={narrow ? y0 - 5 : y0 + bar + 2} textAnchor={narrow ? 'start' : 'end'} style={{ ...lab, fontWeight: 600 }}>
                      {narrow ? n.replace(' (2023) / ', ' / ').replace(' (2026)', '') : n.replace(' (2023) / Student List (2026)', ' 2023 / students 2026')}
                    </text>
                    <rect x={L} y={y0} width={Math.max(1, x(a))} height={bar} fill={col} opacity={0.35} rx={2} />
                    <text x={L + x(a) + 6} y={y0 + bar - 3} style={{ ...lab, fill: C.ink2 }}>{a ? mil(a) : '–'}</text>
                    <rect x={L} y={y0 + bar + 2} width={Math.max(1, x(b))} height={bar} fill={col} rx={2} />
                    <text x={L + x(b) + 6} y={y0 + 2 * bar - 1} style={{ ...lab, fontWeight: 600 }}>{b ? mil(b) : 'on Vučić’s list'}</text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>
        <p style={{ fontFamily: FONT, fontSize: 15, lineHeight: 1.5, color: C.ink2, margin: '10px 0 0' }}>
          The Serbian Radical Party ran on its own in 2023 and on Vučić’s list this year. Figures for 2026 reflect the count as of 07:20 on 29 October (8,338 of 8,392 polling stations). “Did not vote” = registered voters at counted polling stations who did not cast a ballot.
        </p>
      </ChartCard>
    </div>
  );
}
