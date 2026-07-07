'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import travelDaysData from './data.json';

type HoverInfo = { text: string; left: number; top: number } | null;

type TripDetail = { z: string; m: string; t: string };
type TravelDays = {
  zeman: Record<string, TripDetail>;
  pavel: Record<string, TripDetail>;
  zemanDi: number[];
  pavelDi: number[];
};
const TRAVEL = travelDaysData as TravelDays;

function countTripsUpTo(di: number[], counter: number): number {
  let n = 0;
  for (const v of di) if (v <= counter) n++;
  return n;
}

function formatCzDate(d: Date): string {
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' });
}

function tripTooltip(president: string, d: Date, detail: TripDetail | undefined): string {
  if (!detail) return `${president} · ${formatCzDate(d)} · doma`;
  const place = detail.m ? `${detail.z} (${detail.m})` : detail.z;
  return `${president} · ${formatCzDate(d)} · ${place} · ${detail.t}`;
}

const COLORS = { Z: '#DE1743', P: '#6267A3' };
const NOT_TRAVEL = '#F1ECDF';
const NOT_YET = '#F1ECDF';
const OCEAN = '#F8F6F0';

const ZEMAN_START = new Date(Date.UTC(2013, 2, 8));
const PAVEL_START = new Date(Date.UTC(2023, 2, 9));

const MONTH_LABELS = ['led', 'úno', 'bře', 'dub', 'kvě', 'čvn', 'čvc', 'srp', 'zář', 'říj', 'lis', 'pro'];

const CELL = 5.2;
const CELL_GAP = 0.9;
const MONTH_GAP = 6;
const YEAR_LABEL_W = 56;
const COLS = 7;
const ROWS = 5; // ceil(31/7)
const MONTH_W = COLS * (CELL + CELL_GAP);
const MONTH_H = ROWS * (CELL + CELL_GAP);
const ROW_H = MONTH_H + 20;

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function todayUTC(): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()));
}

type DayCell = { d: number; di: number; zDate: Date; pDate: Date; zDetail?: TripDetail; pDetail?: TripDetail };
type MonthBlock = { month: number; days: DayCell[] };
type YearBlock = { yearIndex: number; yearStart: number; yearEnd: number; months: MonthBlock[] };

function buildGrid(maxDi: number, zemanDetail: Record<string, TripDetail>, pavelDetail: Record<string, TripDetail>): YearBlock[] {
  const years: YearBlock[] = [];
  let yearBlock: YearBlock | null = null;
  let monthBlock: MonthBlock | null = null;
  let curYearStart = 0;

  for (let di = 0; di <= maxDi; di++) {
    const zDate = new Date(ZEMAN_START.getTime() + di * 86400000);
    const pDate = new Date(PAVEL_START.getTime() + di * 86400000);
    const m = zDate.getUTCMonth() + 1;
    const day = zDate.getUTCDate();

    if (!yearBlock || di - curYearStart >= 365) {
      curYearStart = di;
      yearBlock = { yearIndex: years.length + 1, yearStart: curYearStart, yearEnd: Math.min(curYearStart + 364, maxDi), months: [] };
      years.push(yearBlock);
      monthBlock = null;
    }
    if (!monthBlock || monthBlock.month !== m) {
      monthBlock = { month: m, days: [] };
      yearBlock.months.push(monthBlock);
    }

    monthBlock.days.push({
      d: day,
      di,
      zDate,
      pDate,
      zDetail: zemanDetail[toISO(zDate)],
      pDetail: pavelDetail[toISO(pDate)],
    });
  }
  return years;
}

interface GridProps {
  years: YearBlock[];
  counter: number;
  width: number;
  showZeman: boolean;
  showPavel: boolean;
  zemanDi: number[];
  pavelDi: number[];
  containerRef: React.RefObject<HTMLDivElement>;
  onHover: (info: HoverInfo) => void;
}

function Grid({ years, counter, width, showZeman, showPavel, zemanDi, pavelDi, containerRef, onHover }: GridProps) {
  function showTip(e: React.MouseEvent, text: string) {
    const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
    const box = containerRef.current!.getBoundingClientRect();
    onHover({ text, left: rect.left - box.left + rect.width / 2, top: rect.top - box.top });
  }
  const height = years.length * ROW_H;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: 'block', background: OCEAN }}>
      {years.map((yb, yi) => {
        const revealedEnd = Math.min(yb.yearEnd, counter);
        const zYearCount = revealedEnd >= yb.yearStart ? zemanDi.filter(v => v >= yb.yearStart && v <= revealedEnd).length : 0;
        const pYearCount = revealedEnd >= yb.yearStart ? pavelDi.filter(v => v >= yb.yearStart && v <= revealedEnd).length : 0;
        return (
      <g key={yb.yearIndex} transform={`translate(0, ${yi * ROW_H})`}>
          <text x={0} y={ROW_H / 2 - 3} fontSize={9.5} fontWeight={700} fill="#101432" fontFamily="'Roboto Condensed', Arial, sans-serif">
            {yb.yearIndex}. rok
          </text>
          {showZeman && (
            <text x={0} y={ROW_H / 2 + 8} fontSize={7.5} fontWeight={700} fill={COLORS.Z} fontFamily="'Roboto Condensed', Arial, sans-serif">
              Z {zYearCount}
            </text>
          )}
          {showPavel && (
            <text x={0} y={ROW_H / 2 + 18} fontSize={7.5} fontWeight={700} fill={COLORS.P} fontFamily="'Roboto Condensed', Arial, sans-serif">
              P {pYearCount}
            </text>
          )}
          {yb.months.map(mb => {
            const mx = YEAR_LABEL_W + (mb.month - 1) * (MONTH_W + MONTH_GAP);
            return (
              <g key={mb.month} transform={`translate(${mx}, 12)`}>
                <text x={0} y={-2.5} fontSize={5.8} fill="#8a8577" fontFamily="'Roboto Condensed', Arial, sans-serif">
                  {MONTH_LABELS[mb.month - 1]}
                </text>
                {mb.days.map(day => {
                  const col = (day.d - 1) % COLS;
                  const row = Math.floor((day.d - 1) / COLS);
                  const revealed = day.di <= counter;
                  const x = col * (CELL + CELL_GAP);
                  const y = row * (CELL + CELL_GAP);
                  const topFill = !showZeman ? OCEAN : !revealed ? NOT_YET : day.zDetail ? COLORS.Z : NOT_TRAVEL;
                  const bottomFill = !showPavel ? OCEAN : !revealed ? NOT_YET : day.pDetail ? COLORS.P : NOT_TRAVEL;
                  if (!revealed) {
                    return <rect key={day.d} x={x} y={y} width={CELL} height={CELL} fill={NOT_YET} />;
                  }
                  const zActive = showZeman && !!day.zDetail;
                  const pActive = showPavel && !!day.pDetail;
                  if (topFill === bottomFill) {
                    // no activity visible in this cell (or nothing revealed/shown) – fully inert
                    return <rect key={day.d} x={x} y={y} width={CELL} height={CELL} fill={topFill} />;
                  }
                  const zTip = tripTooltip('Zeman', day.zDate, day.zDetail);
                  const pTip = tripTooltip('Pavel', day.pDate, day.pDetail);
                  return (
                    <g key={day.d}>
                      <rect
                        x={x} y={y} width={CELL} height={CELL / 2} fill={topFill}
                        onMouseEnter={zActive ? (e => showTip(e, zTip)) : undefined}
                        onMouseLeave={zActive ? (() => onHover(null)) : undefined}
                        style={{ cursor: zActive ? 'pointer' : 'default' }}
                      />
                      <rect
                        x={x} y={y + CELL / 2} width={CELL} height={CELL / 2} fill={bottomFill}
                        onMouseEnter={pActive ? (e => showTip(e, pTip)) : undefined}
                        onMouseLeave={pActive ? (() => onHover(null)) : undefined}
                        style={{ cursor: pActive ? 'pointer' : 'default' }}
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </g>
        );
      })}
    </svg>
  );
}

export default function MandateCalendar() {
  const [counter, setCounter] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showZeman, setShowZeman] = useState(true);
  const [showPavel, setShowPavel] = useState(true);
  const [hover, setHover] = useState<HoverInfo>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const maxCounter = useMemo(() => {
    const today = todayUTC();
    return Math.round((today.getTime() - PAVEL_START.getTime()) / 86400000);
  }, []);

  useEffect(() => { setCounter(maxCounter); }, [maxCounter]);

  const years = useMemo(() => buildGrid(maxCounter, TRAVEL.zeman, TRAVEL.pavel), [maxCounter]);
  const width = YEAR_LABEL_W + 12 * (MONTH_W + MONTH_GAP);

  useEffect(() => {
    if (!playing) return;
    const step = Math.max(1, Math.round(maxCounter / 260));
    const id = setInterval(() => {
      setCounter(v => {
        const next = v + step;
        if (next >= maxCounter) { setPlaying(false); return maxCounter; }
        return next;
      });
    }, 30);
    return () => clearInterval(id);
  }, [playing, maxCounter]);

  const zemanCount = useMemo(() => countTripsUpTo(TRAVEL.zemanDi, counter), [counter]);
  const pavelCount = useMemo(() => countTripsUpTo(TRAVEL.pavelDi, counter), [counter]);

  return (
    <div style={{ margin: '24px 0' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14, flexWrap: 'wrap',
        background: '#101432', padding: '10px 14px', borderRadius: 4,
      }}>
        <span style={{ fontFamily: 'var(--font-roboto-slab), Georgia, serif', fontSize: 22, fontWeight: 700, color: '#fdfbf7', fontVariantNumeric: 'tabular-nums' }}>
          {counter}. den mandátu
        </span>
        <span style={{ fontFamily: "'Roboto Condensed', Arial, sans-serif", fontSize: 12, color: 'rgba(253,251,247,0.7)', fontVariantNumeric: 'tabular-nums' }}>
          Zeman: {zemanCount} {zemanCount === 1 ? 'cesta' : zemanCount < 5 ? 'cesty' : 'cest'} · Pavel: {pavelCount} {pavelCount === 1 ? 'cesta' : pavelCount < 5 ? 'cesty' : 'cest'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
        <button
          onClick={() => setShowZeman(v => !v)}
          aria-pressed={showZeman}
          style={{
            display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontFamily: "'Roboto Condensed', Arial, sans-serif",
            color: showZeman ? '#333' : '#aaa', background: 'none', border: 'none', padding: 0, cursor: 'pointer', opacity: showZeman ? 1 : 0.5,
          }}
        >
          <span style={{ width: 10, height: 10, background: COLORS.Z, display: 'inline-block', borderRadius: 2 }} />
          Zeman
        </button>
        <button
          onClick={() => setShowPavel(v => !v)}
          aria-pressed={showPavel}
          style={{
            display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontFamily: "'Roboto Condensed', Arial, sans-serif",
            color: showPavel ? '#333' : '#aaa', background: 'none', border: 'none', padding: 0, cursor: 'pointer', opacity: showPavel ? 1 : 0.5,
          }}
        >
          <span style={{ width: 10, height: 10, background: COLORS.P, display: 'inline-block', borderRadius: 2 }} />
          Pavel
        </button>
      </div>

      <div ref={containerRef} style={{ position: 'relative' }}>
        <Grid years={years} counter={counter} width={width} showZeman={showZeman} showPavel={showPavel} zemanDi={TRAVEL.zemanDi} pavelDi={TRAVEL.pavelDi} containerRef={containerRef} onHover={setHover} />
        {hover && (
          <div
            style={{
              position: 'absolute', left: hover.left, top: hover.top, transform: 'translate(-50%, calc(-100% - 8px))',
              background: '#101432', color: '#fdfbf7', padding: '5px 9px', borderRadius: 4, fontSize: 11.5,
              fontFamily: "'Roboto Condensed', Arial, sans-serif", whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 10,
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            }}
          >
            {hover.text}
            <div style={{
              position: 'absolute', left: '50%', top: '100%', transform: 'translateX(-50%)',
              width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
              borderTop: '5px solid #101432',
            }} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
        <button
          onClick={() => { if (counter >= maxCounter) setCounter(0); setPlaying(p => !p); }}
          aria-label={playing ? 'Pozastavit kalendář mandátu' : 'Přehrát kalendář mandátu'}
          style={{ width: 32, height: 32, borderRadius: 4, border: '1px solid #c9c2af', background: '#fff', cursor: 'pointer', flex: '0 0 auto' }}
        >
          {playing ? '⏸' : '▶'}
        </button>
        <input
          type="range"
          min={0}
          max={maxCounter}
          value={counter}
          onChange={e => { setPlaying(false); setCounter(Number(e.target.value)); }}
          style={{ flex: 1, accentColor: '#de1743' }}
        />
        <span style={{ fontFamily: "'Roboto Condensed', Arial, sans-serif", fontSize: 12, color: '#888', minWidth: 60, textAlign: 'right' }}>
          {counter}/{maxCounter}
        </span>
      </div>
      <p style={{ fontFamily: "'Roboto Condensed', Arial, sans-serif", fontSize: 12, color: '#888', marginTop: 6 }}>
        Mřížka zachycuje aktivity po dnešní den mandátu ({maxCounter} dní od inaugurace) – denně přibude další den, u obou prezidentů stejně. Každá kostička znamená jeden den mandátu. Aktivita prezidentů se vybarví v den zahájení zahraniční cesty a u obou zobrazujeme právě tento den, neboť u Zemana většinou neznáme délku pobytu na jeho zahraniční cestě.
      </p>
    </div>
  );
}
