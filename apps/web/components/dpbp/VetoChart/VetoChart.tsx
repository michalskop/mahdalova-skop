'use client';

import { useMemo, useRef, useState } from 'react';
import vetoData from './data.json';
import ChartSignature from '../ChartSignature';

type Veto = {
  p: 'Havel' | 'Klaus' | 'Zeman' | 'Pavel';
  n: number;      // pořadí veta u daného prezidenta
  d: string;      // ISO datum vrácení zákona
  dl: string;     // český popisek data
  law: string;    // zkrácený název zákona
  note: string;   // doplňující poznámka k zákonu
  why: string;    // prezidentovo odůvodnění
  A: number | null; N: number | null; Z: number | null; // hlasování o setrvání
  rd: string | null; // datum opakovaného hlasování
  o: 'prehlasovano' | 'padl' | 'neprojednan';
  sb: string | null; // číslo ve Sbírce zákonů
};
const VETOES = vetoData as Veto[];

type HoverInfo = { veto: Veto; left: number; top: number } | null;

const COLORS: Record<Veto['p'], string> = {
  Havel: '#2E8B6E',
  Klaus: '#C08A00',
  Zeman: '#DE1743',
  Pavel: '#6267A3',
};
const PRESIDENTS: Veto['p'][] = ['Havel', 'Klaus', 'Zeman', 'Pavel'];
// začátky prezidentských období (u Havla vznik ČR)
const ERAS: { p: Veto['p']; from: number }[] = [
  { p: 'Havel', from: 1993.09 },
  { p: 'Klaus', from: 2003.18 },
  { p: 'Zeman', from: 2013.18 },
  { p: 'Pavel', from: 2023.19 },
];

const VIEW_W = 720;
const PLOT_L = 40;
const PLOT_R = VIEW_W - 10;
const PLOT_T = 26;
const PLOT_B = 290; // osa x
const BAND_Y = 318; // pás „sněmovna už nehlasovala“
const VIEW_H = 352;
const X0 = 1993;
const X1 = 2027.3;
const YMAX = 180; // hlasů pro

function yearOf(iso: string): number {
  return Number(iso.slice(0, 4)) + (Number(iso.slice(5, 7)) - 1) / 12 + (Number(iso.slice(8, 10)) - 1) / 365;
}
function xPos(iso: string): number {
  return PLOT_L + ((yearOf(iso) - X0) / (X1 - X0)) * (PLOT_R - PLOT_L);
}
function yPos(votes: number): number {
  return PLOT_T + ((YMAX - Math.min(votes, YMAX)) / YMAX) * (PLOT_B - PLOT_T);
}
const Y101 = yPos(101);

function voteLine(v: Veto): string | null {
  if (v.A === null) return null;
  return `pro ${v.A} · proti ${v.N} · zdrželo se ${v.Z}`;
}

function outcomeText(v: Veto): string {
  if (v.o === 'prehlasovano') {
    const kdy = v.rd ? ` ${v.rd.slice(8, 10).replace(/^0/, '')}. ${v.rd.slice(5, 7).replace(/^0/, '')}. ${v.rd.slice(0, 4)}` : '';
    return `Sněmovna veto přehlasovala${kdy}${v.sb ? `, zákon vyšel jako ${v.sb} Sb.` : '.'}`;
  }
  if (v.o === 'padl') return 'Sněmovna veto nepřehlasovala – zákon padl.';
  return 'Sněmovna o vráceném zákonu už nehlasovala – návrh spadl pod stůl s koncem volebního období.';
}

export default function VetoChart() {
  const [show, setShow] = useState<Record<Veto['p'], boolean>>({ Havel: true, Klaus: true, Zeman: true, Pavel: true });
  const [hover, setHover] = useState<HoverInfo>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // rozmístění bodů s rozražením kolizí (stejný termín + stejný počet hlasů)
  const dots = useMemo(() => {
    const placed: { x: number; y: number; v: Veto }[] = [];
    const sorted = [...VETOES].sort((a, b) => a.d.localeCompare(b.d));
    for (const v of sorted) {
      const y = v.A !== null && v.o !== 'neprojednan' ? yPos(v.A) : BAND_Y;
      let x = xPos(v.d);
      let guard = 0;
      while (placed.some(q => Math.abs(q.x - x) < 8 && Math.abs(q.y - y) < 8) && guard < 20) {
        x += 8;
        guard++;
      }
      placed.push({ x, y, v });
    }
    return placed;
  }, []);

  function showTip(e: React.MouseEvent, veto: Veto) {
    const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
    const box = containerRef.current!.getBoundingClientRect();
    const left = Math.min(Math.max(rect.left - box.left + rect.width / 2, 135), box.width - 135);
    setHover({ veto, left, top: rect.top - box.top });
  }

  const counts = useMemo(() => {
    const c: Record<string, { total: number; over: number }> = {};
    for (const p of PRESIDENTS) c[p] = { total: 0, over: 0 };
    for (const v of VETOES) {
      c[v.p].total++;
      if (v.o === 'prehlasovano') c[v.p].over++;
    }
    return c;
  }, []);

  return (
    <div style={{ margin: '24px 0', background: '#F8F6F0', padding: '18px 16px', borderRadius: 4 }}>
      {/* Titulek přes celou šířku, podpis na švu hlavičky vpravo (viz DESIGN.md §9) */}
      <div style={{
        fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', fontSize: 20, fontWeight: 700,
        color: '#101432', lineHeight: 1.2,
      }}>
        93 vet a jedna hranice: 101 hlasů
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '4px 0 6px' }}>
        <ChartSignature size={30} style={{ lineHeight: 1 }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 4, flexWrap: 'wrap' }}>
        {PRESIDENTS.map(p => (
          <button
            key={p}
            onClick={() => setShow(s => ({ ...s, [p]: !s[p] }))}
            aria-pressed={show[p]}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif',
              color: show[p] ? '#333' : '#aaa', background: 'none', border: 'none', padding: 0, cursor: 'pointer', opacity: show[p] ? 1 : 0.5,
            }}
          >
            <span style={{ width: 10, height: 10, background: COLORS[p], display: 'inline-block', borderRadius: 2 }} />
            {p} {counts[p].total}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10, flexWrap: 'wrap', fontSize: 12, fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', color: '#666' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, background: '#888', display: 'inline-block', borderRadius: '50%' }} />
          veto přehlasováno, zákon platí
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, background: '#F8F6F0', border: '2px solid #888', display: 'inline-block', borderRadius: '50%' }} />
          veto uspělo, zákon padl
        </span>
      </div>

      <div ref={containerRef} style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ display: 'block' }}>
          {/* předěly prezidentských období */}
          {ERAS.map((era, i) => {
            const x = PLOT_L + ((era.from - X0) / (X1 - X0)) * (PLOT_R - PLOT_L);
            return (
              <g key={era.p}>
                {i > 0 && <line x1={x} y1={PLOT_T - 12} x2={x} y2={BAND_Y + 12} stroke="#d9d3c2" strokeWidth={1} />}
                <text x={x + 6} y={PLOT_T - 12} fontSize={13} fontWeight={700} fill={COLORS[era.p]} fontFamily="var(--font-roboto-condensed), Arial, sans-serif">
                  {era.p}
                </text>
              </g>
            );
          })}

          {/* mřížka a osa y */}
          {[50, 150].map(t => (
            <g key={t}>
              <line x1={PLOT_L} y1={yPos(t)} x2={PLOT_R} y2={yPos(t)} stroke="#e5dfd0" strokeWidth={1} />
              <text x={PLOT_L - 5} y={yPos(t) + 3.5} fontSize={10} fill="#8a8577" textAnchor="end" fontFamily="var(--font-roboto-condensed), Arial, sans-serif">{t}</text>
            </g>
          ))}
          <line x1={PLOT_L} y1={PLOT_B} x2={PLOT_R} y2={PLOT_B} stroke="#c9c2af" strokeWidth={1} />
          {[1995, 2000, 2005, 2010, 2015, 2020, 2025].map(y => (
            <text key={y} x={PLOT_L + ((y - X0) / (X1 - X0)) * (PLOT_R - PLOT_L)} y={PLOT_B + 14} fontSize={10} fill="#8a8577" textAnchor="middle" fontFamily="var(--font-roboto-condensed), Arial, sans-serif">
              {y}
            </text>
          ))}

          {/* hranice přehlasování */}
          <line x1={PLOT_L} y1={Y101} x2={PLOT_R} y2={Y101} stroke="#101432" strokeWidth={1.4} strokeDasharray="7 4" />
          <text x={PLOT_R} y={Y101 + 16} fontSize={11.5} fontWeight={700} fill="#101432" textAnchor="end" fontFamily="var(--font-roboto-condensed), Arial, sans-serif">
            101 hlasů pro zákon = hranice přehlasování veta
          </text>
          <text x={PLOT_L - 5} y={Y101 + 3.5} fontSize={10} fontWeight={700} fill="#101432" textAnchor="end" fontFamily="var(--font-roboto-condensed), Arial, sans-serif">101</text>

          {/* pás neprojednaných */}
          <text x={PLOT_L} y={BAND_Y + 4} fontSize={10} fill="#8a8577" fontFamily="var(--font-roboto-condensed), Arial, sans-serif">
            bez hlasování:
          </text>

          {dots.map(({ x, y, v }) => {
            if (!show[v.p]) return null;
            const filled = v.o === 'prehlasovano';
            return (
              <circle
                key={`${v.p}${v.n}`}
                cx={x}
                cy={y}
                r={5.5}
                fill={filled ? COLORS[v.p] : '#F8F6F0'}
                fillOpacity={filled ? 0.9 : 1}
                stroke={COLORS[v.p]}
                strokeWidth={filled ? 0 : 2}
                style={{ cursor: 'pointer' }}
                onMouseEnter={e => showTip(e, v)}
                onMouseLeave={() => setHover(null)}
                onClick={e => showTip(e, v)}
              />
            );
          })}
        </svg>

        {hover && (
          <div
            style={{
              position: 'absolute', left: hover.left, top: hover.top, transform: 'translate(-50%, calc(-100% - 9px))',
              background: '#101432', color: '#fdfbf7', padding: '8px 11px', borderRadius: 4, fontSize: 12,
              fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', width: 260, pointerEvents: 'none', zIndex: 10,
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)', lineHeight: 1.45,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
              <span style={{ color: hover.veto.p === 'Zeman' ? '#ff7a99' : hover.veto.p === 'Pavel' ? '#aeb3e0' : hover.veto.p === 'Havel' ? '#7fd4b6' : '#f0c05a' }}>
                {hover.veto.p}
              </span>
              {' · '}{hover.veto.n}. veto{' · '}{hover.veto.dl}
            </div>
            <div style={{ color: 'rgba(253,251,247,0.9)' }}>{hover.veto.law}</div>
            {hover.veto.why && (
              <div style={{ marginTop: 5, paddingTop: 5, borderTop: '1px solid rgba(253,251,247,0.2)', color: 'rgba(253,251,247,0.85)' }}>
                {hover.veto.why}
              </div>
            )}
            <div style={{ marginTop: 5, color: 'rgba(253,251,247,0.7)' }}>
              {voteLine(hover.veto) && <div>{voteLine(hover.veto)}</div>}
              <div>{outcomeText(hover.veto)}</div>
            </div>
            <div style={{
              position: 'absolute', left: '50%', top: '100%', transform: 'translateX(-50%)',
              width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
              borderTop: '5px solid #101432',
            }} />
          </div>
        )}
      </div>

      <p style={{ fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', fontSize: 12, color: '#333333', marginTop: 8 }}>
        Každý bod je jedno prezidentské veto (1993–2026), výška bodu udává počet poslanců, kteří při opakovaném hlasování zvedli ruku pro vrácený
        zákon. Nad přerušovanou čarou 101 hlasů sněmovna veto přehlasovala a zákon platí, pod ní zákon padl. V pásu dole jsou veta, o kterých už
        sněmovna nestihla hlasovat. Vícero zákonů vetovaných najednou počítáme jako jedno veto. Najetím nebo klepnutím na bod se zobrazí zákon,
        prezidentovo odůvodnění i výsledek hlasování.
      </p>
      <p style={{ fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', fontSize: 14, color: '#333333', marginTop: 10 }}>
        • autoři: <a href="https://datatimes.cz" target="_blank" rel="noopener noreferrer" style={{ color: '#333333', textDecoration: 'underline' }}>Kateřina Mahdalová &amp; Michal Škop</a> • data: Poslanecká sněmovna PČR, Wikipedie
      </p>
    </div>
  );
}
