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

type PointInfo = { veto: Veto; left: number; top: number } | null;

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
  const [hover, setHover] = useState<PointInfo>(null);
  const [detail, setDetail] = useState<PointInfo>(null);
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

  function showDetail(e: React.MouseEvent, veto: Veto) {
    e.stopPropagation();
    const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
    const box = containerRef.current!.getBoundingClientRect();
    const left = Math.min(Math.max(rect.left - box.left + rect.width / 2, 165), box.width - 165);
    const top = Math.min(Math.max(rect.top - box.top + 18, 8), 190);
    setDetail({ veto, left, top });
    setHover(null);
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
    <div style={{ margin: '24px 0', background: '#F8F6F0', padding: '18px 16px 14px', borderRadius: 4 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        alignItems: 'center',
        columnGap: 18,
        marginBottom: 8,
      }}>
        <div style={{
          fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', fontSize: 20, fontWeight: 700,
          color: '#101432', lineHeight: 1.2,
        }}>
          93 vet a jedna hranice: 101 hlasů
        </div>
        <ChartSignature size={30} layout="inline" textWeight={400} style={{ lineHeight: 1, alignSelf: 'center' }} />
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
                onClick={e => showDetail(e, v)}
              />
            );
          })}
        </svg>

        {/* Krátký hover tooltip; dlouhé detaily se otevírají kliknutím do panelu. */}
        {hover && (
          <div
            style={{
              position: 'absolute', left: hover.left, top: hover.top, transform: 'translate(-50%, calc(-100% - 9px))',
              background: 'rgba(248,246,240,0.95)', color: '#1a1a1a', padding: '8px 11px', borderRadius: 7, fontSize: 12,
              fontFamily: 'var(--font-roboto-slab), Georgia, serif', width: 230, pointerEvents: 'none', zIndex: 10,
              border: '1px solid #e8e3d2', boxShadow: '0 4px 10px rgba(16,20,50,0.14)', lineHeight: 1.45,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
              <span style={{ color: COLORS[hover.veto.p] }}>
                {hover.veto.p}
              </span>
              {' · '}{hover.veto.n}. veto{' · '}{hover.veto.dl}
            </div>
            <div style={{ color: '#1a1a1a' }}>{hover.veto.law}</div>
            <div style={{ marginTop: 5, color: '#de1743', fontWeight: 700 }}>
              Kliknutím otevřete detail
            </div>
            <div style={{
              position: 'absolute', left: '50%', top: '100%', transform: 'translateX(-50%)',
              width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
              borderTop: '5px solid rgba(248,246,240,0.97)',
            }} />
          </div>
        )}

        {detail && (
          <div
            role="dialog"
            aria-label={`Detail veta: ${detail.veto.p}, ${detail.veto.n}. veto`}
            style={{
              position: 'absolute',
              left: detail.left,
              top: detail.top,
              transform: 'translateX(-50%)',
              width: 'min(330px, calc(100% - 18px))',
              background: 'rgba(248,246,240,0.95)',
              color: '#1a1a1a',
              padding: '12px 14px 13px',
              borderRadius: 7,
              fontSize: 12,
              fontFamily: 'var(--font-roboto-slab), Georgia, serif',
              zIndex: 20,
              border: '1px solid #e8e3d2',
              boxShadow: '0 8px 22px rgba(16,20,50,0.18)',
              lineHeight: 1.45,
            }}
          >
            <button
              type="button"
              aria-label="Zavřít detail"
              onClick={() => setDetail(null)}
              style={{
                position: 'absolute',
                right: 7,
                top: 6,
                width: 24,
                height: 24,
                border: 0,
                background: 'transparent',
                color: '#333333',
                fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif',
                fontSize: 18,
                lineHeight: 1,
                cursor: 'pointer',
              }}
            >
              ×
            </button>
            <div style={{ paddingRight: 22, fontWeight: 700, fontSize: 13, marginBottom: 3 }}>
              <span style={{ color: COLORS[detail.veto.p] }}>
                {detail.veto.p}
              </span>
              {' · '}{detail.veto.n}. veto · {detail.veto.dl}
            </div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{detail.veto.law}</div>
            {detail.veto.why && (
              <div style={{ paddingTop: 6, borderTop: '1px solid #e8e3d2', color: '#333333' }}>
                {detail.veto.why}
              </div>
            )}
            <div style={{ marginTop: 7, color: '#333333' }}>
              {voteLine(detail.veto) && <div>{voteLine(detail.veto)}</div>}
              <div>{outcomeText(detail.veto)}</div>
            </div>
          </div>
        )}
      </div>

      <p style={{ fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', fontSize: 14, color: '#333333', marginTop: 8, lineHeight: 1.5 }}>
        Každý bod je jedno prezidentské veto (1993–2026), výška bodu udává počet poslanců, kteří při opakovaném hlasování zvedli ruku pro vrácený
        zákon. Nad přerušovanou čarou 101 hlasů sněmovna veto přehlasovala a zákon platí, pod ní zákon padl. V pásu dole jsou veta, o kterých už
        sněmovna nestihla hlasovat. Vícero zákonů vetovaných najednou počítáme jako jedno veto. Najetím nebo klepnutím na bod se zobrazí zákon,
        prezidentovo odůvodnění i výsledek hlasování.
      </p>
      <div style={{ fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', fontSize: 12, color: '#333333', marginTop: 10, lineHeight: 1.5 }}>
        <div>• autoři: <a href="https://datatimes.cz" target="_blank" rel="noopener noreferrer" style={{ color: '#333333', textDecoration: 'underline' }}>Kateřina Mahdalová &amp; Michal Škop</a></div>
        <div>• data: Poslanecká sněmovna PČR</div>
      </div>
    </div>
  );
}
