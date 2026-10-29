'use client';

// One-off grafy k článkům o srbských volbách 2026:
//  - <SerbiaNightTimeline /> volební noc 25.–26. 10. 2026: predikce DataTimes × průběžné sčítání RIK v čase
// Data generuje _data_pipeline/build.py u článku do serbia2026Data.ts. Stavba, barvy a pomocníci jako
// BrazilRunoffCharts.tsx; vínová × královská modrá je čitelná i pro barvoslepé.

import { useState } from 'react';
import ChartCard from './ChartCard';
import ChartLegend from './ChartLegend';
import { C, FONT, fmt, useWidth, Tooltip, type Tip } from './BrazilPredictionCharts';
import { NIGHT, STAV } from './serbia2026Data';
import { VOTES } from './serbia2026AnalyzaData';

// Barvy uskupení podle jejich dominantních barev, převedené do naší palety (Kateřina 29. 10. 2026):
// studenti používají tmavou karmínovou (#a81a32 na studenti.org.rs), SNS tmavou modrou (#242970 v logu).
const STU = '#a03250';  // Studentská listina – brandDeepRed.6
const SNS = '#4a51ab';  // Vučićova SNS – brandRoyalBlue.6

type P = { m: number; c: number; s: number; slo: number; shi: number; sr: number; n: number; nlo: number; nhi: number; nr: number };
const ALL: P[] = NIGHT.map(([m, c, s, slo, shi, sr, n, nlo, nhi, nr]) => ({ m, c, s, slo, shi, sr, n, nlo, nhi, nr }));
const LAST = ALL[ALL.length - 1];
const M0 = 70, M1 = 480;   // 21:10–04:00 SEČ; potom už se predikce ani sčítání viditelně nemění
const PTS = ALL.filter((p) => p.m <= M1);

const hhmm = (m: number) => {
  const t = Math.round(m) + 20 * 60;
  return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};
const at = (hm: string) => { const [h, mi] = hm.split(':').map(Number); return ((h + 24 - 20) % 24) * 60 + mi; };
const covAt = (m: number) => { let p = ALL[0]; for (const q of ALL) { if (q.m <= m) p = q; else break; } return p.c; };

// Události noci (SEČ). Časy ověřené v _data_pipeline/vystup.json a v rešerši k článku.
export type NightEvent = { m: number; label: string; short: string };
const EVENTS: NightEvent[] = [
  { m: at('22:01'), label: 'predikce: studenti vyhrají', short: 'predikce' },
  { m: at('23:14'), label: 'sčítání: studenti poprvé vedou', short: 'sčítání' },
];

const TL_LEGEND = [
  { key: 'stu', label: 'Studentská listina', color: STU },
  { key: 'sns', label: 'Vučićova SNS', color: SNS },
  { key: 'count', label: 'průběžné sčítání (čárkovaně)', color: C.beige },
];
const SOURCE = 'živý model Mahdalová & Škop nad průběžnými výsledky [Republičke izborne komisije](https://www.rik.parlament.gov.rs/)';

export function SerbiaNightTimeline({ events = [] }: { events?: NightEvent[] }) {
  const [ref, W] = useWidth<HTMLDivElement>();
  const [tip, setTip] = useState<Tip>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [active, setActive] = useState<string[]>(TL_LEGEND.map((l) => l.key));
  const on = (k: string) => active.includes(k);
  const narrow = W < 640;
  const H = narrow ? 400 : 440;
  const M = { l: narrow ? 30 : 40, r: narrow ? 12 : 96, t: 40, b: 46 };
  const Y0 = 30, Y1 = 62;
  // lomená časová osa: rozhodující první dvě hodiny (21:10–23:30) dostanou víc než polovinu šířky
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
      <strong>{hhmm(p.m)} SEČ</strong> · sečteno {fmt(p.c, p.c < 10 ? 2 : 1)} % voličů<br />
      <span style={{ color: STU }}>●</span> studenti: predikce <strong>{fmt(p.s, 1)} %</strong>
      <span style={{ color: C.ink2 }}> ({fmt(p.slo, 1)}–{fmt(p.shi, 1)})</span>, sečteno {fmt(p.sr, 1)} %<br />
      <span style={{ color: SNS }}>●</span> SNS: predikce <strong>{fmt(p.n, 1)} %</strong>
      <span style={{ color: C.ink2 }}> ({fmt(p.nlo, 1)}–{fmt(p.nhi, 1)})</span>, sečteno {fmt(p.nr, 1)} %
    </> });
  }

  const endX = x(M1);
  return (
    <div style={{ clear: 'both' }}>
      <ChartCard title="Predikce viděla vítězství studentů o hodinu a čtvrt dřív než průběžné sčítání"
        subtitle={`Podíl na platných hlasech (%): predikce konečného výsledku s 90% intervalem a průběžně sečtené hlasy • 25.–26. října 2026, SEČ`} source={SOURCE}>
        <ChartLegend items={TL_LEGEND} activeKeys={active} onChange={setActive} />
        <div ref={ref} style={{ position: 'relative', width: '100%' }}>
          {W > 0 && (
            <svg width={W} height={H} role="img" style={{ display: 'block', overflow: 'visible' }}
              aria-label={`Predikce DataTimes.cz ukazovala od 21:44 v čele Studentskou listinu a od 22:01 se intervaly nejistoty obou listin už nepřekrývaly. Průběžné sčítání ukázalo studenty v čele až ve 23:14. Konečný stav: studenti ${fmt(LAST.sr, 1)} %, SNS ${fmt(LAST.nr, 1)} %.`}>
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
                  <text x={x(v)} y={H - M.b + 31} textAnchor="middle" style={{ ...tick, fontSize: 10.5, fill: C.ink2 }}>{fmt(covAt(v), covAt(v) < 10 ? 1 : 0)} %</text>
                </g>
              ))}
              <line x1={x(MB)} x2={x(MB)} y1={M.t} y2={H - M.b} stroke={C.beige} strokeDasharray="2 3" />
              <text x={x(MB) + 4} y={H - M.b - 6} style={{ ...tick, fontSize: 10.5, fill: C.ink2 }}>osa zhuštěná →</text>
              {!narrow && <text x={M.l - 7} y={H - M.b + 31} textAnchor="end" style={{ ...tick, fontSize: 10.5, fill: C.ink2 }}>sečteno</text>}

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
                  <text x={endX + 6} y={y(LAST.sr) + 4} style={{ ...labB, fill: STU }}>{fmt(LAST.sr, 1)} %</text>
                  <text x={endX + 6} y={y(LAST.sr) + 18} style={{ ...lab, fill: STU }}>studenti</text>
                  <text x={endX + 6} y={y(LAST.nr) + 4} style={{ ...labB, fill: SNS }}>{fmt(LAST.nr, 1)} %</text>
                  <text x={endX + 6} y={y(LAST.nr) + 18} style={{ ...lab, fill: SNS }}>SNS</text>
                  <text x={endX + 6} y={y(LAST.nr) + 34} style={{ ...lab, fontSize: 10.5, fill: C.ink2 }}>konečný stav</text>
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
          Plná čára je predikce konečného podílu, pás kolem ní 90% interval nejistoty, čárkovaně průběžně sečtené hlasy. Pod časem je podíl už sečtených voličů. Časová osa je od 23:30 zhuštěná. Úplně první odhady z doby, kdy byla sečtena necelá setina procenta voličů, a hodnoty mimo osu jsou oříznuté. Konečný stav = {STAV}, sečteno {fmt(LAST.c, 1)} % voličů.
        </p>
      </ChartCard>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// <SerbiaVotesChart /> k článku volby-srbsko-2026-10-26-studenti: hlasy 2023 × 2026 podle RIK
// (data serbia2026AnalyzaData.ts z _data_pipeline/build.py u článku). Vodorovné dvojice pruhů,
// hodnoty přímo u pruhů; světlejší pruh = 2023, sytý = 2026.

const VSOURCE = 'Republička izborna komisija: [výsledky 2026](https://www.rik.parlament.gov.rs/) a 2023, vlastní výpočet';
const VCOL: Record<string, string> = { sns: SNS, srs: SNS, opo: STU, sps: C.beige, ost: C.beige, nep: C.grid, nev: C.grid };
const mil = (v: number) => (v >= 1e6 ? `${fmt(v / 1e6, 2)} mil.` : `${Math.round(v / 1000).toLocaleString('cs-CZ')} tis.`);

export function SerbiaVotesChart() {
  const [ref, W] = useWidth<HTMLDivElement>();
  const narrow = W < 600;
  const L = narrow ? 0 : 230, R = narrow ? 70 : 80, rowH = narrow ? 64 : 48, bar = 15;
  const max = Math.max(...VOTES.flatMap(([, a, b]) => [a, b]));
  const x = (v: number) => (v / max) * (W - L - R);
  const H = VOTES.length * rowH + 8;
  const lab: React.CSSProperties = { fontSize: narrow ? 12 : 13, fill: C.ink, fontFamily: FONT };
  return (
    <div style={{ clear: 'both' }}>
      <ChartCard title="Vučićova listina dostala skoro stejně hlasů jako v roce 2023. Studenti o 1,4 milionu víc než tehdejší hlavní opozice"
        subtitle="Počet hlasů v parlamentních volbách 2023 a 2026 podle skupin kandidátek a počet zapsaných voličů, kteří nepřišli" source={VSOURCE}>
        <div style={{ display: 'flex', gap: 18, fontFamily: FONT, fontSize: 13, color: C.ink, margin: '0 0 10px', flexWrap: 'wrap' }}>
          <span><span style={{ display: 'inline-block', width: 14, height: 10, background: C.ink, opacity: 0.35, marginRight: 6 }} />2023 (světlejší pruh)</span>
          <span><span style={{ display: 'inline-block', width: 14, height: 10, background: C.ink, marginRight: 6 }} />2026</span>
        </div>
        <div ref={ref} style={{ width: '100%' }}>
          {W > 0 && (
            <svg width={W} height={H} role="img" style={{ display: 'block', overflow: 'visible' }}
              aria-label="Vučićova listina měla v roce 2023 1,78 milionu hlasů, v roce 2026 1,73 milionu. Hlavní opozice měla v roce 2023 0,90 milionu hlasů, studentská listina v roce 2026 2,35 milionu. Počet lidí, kteří nepřišli k volbám, klesl z 2,68 na 1,99 milionu.">
              {VOTES.map(([n, a, b, k], i) => {
                const y0 = i * rowH + (narrow ? 18 : 6);
                const col = VCOL[k];
                return (
                  <g key={n}>
                    <text x={narrow ? 0 : L - 10} y={narrow ? y0 - 5 : y0 + bar + 2} textAnchor={narrow ? 'start' : 'end'} style={{ ...lab, fontWeight: 600 }}>
                      {narrow ? n.replace(' (2023) / ', ' / ').replace(' (2026)', '') : n.replace(' (2023) / Studentská listina (2026)', ' 2023 / studenti 2026')}
                    </text>
                    <rect x={L} y={y0} width={Math.max(1, x(a))} height={bar} fill={col} opacity={0.35} rx={2} />
                    <text x={L + x(a) + 6} y={y0 + bar - 3} style={{ ...lab, fill: C.ink2 }}>{a ? mil(a) : '–'}</text>
                    <rect x={L} y={y0 + bar + 2} width={Math.max(1, x(b))} height={bar} fill={col} rx={2} />
                    <text x={L + x(b) + 6} y={y0 + 2 * bar - 1} style={{ ...lab, fontWeight: 600 }}>{b ? mil(b) : 'na Vučićově listině'}</text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>
        <p style={{ fontFamily: FONT, fontSize: 15, lineHeight: 1.5, color: C.ink2, margin: '10px 0 0' }}>
          Srbská radikální strana kandidovala v roce 2023 samostatně, letos na Vučićově listině. Údaje za rok 2026 jsou ze stavu sčítání 29. října 7:20 (8 338 z 8 392 volebních míst). „Nepřišli k volbám“ = zapsaní voliči v sečtených místech, kteří nehlasovali.
        </p>
      </ChartCard>
    </div>
  );
}
