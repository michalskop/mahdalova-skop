'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import tripsData from './data.json';
import ChartSignature from '../ChartSignature';

type Trip = {
  n: number;    // pořadí cesty
  d: string;    // ISO datum zahájení
  dl: string;   // český popisek data (vč. rozsahu)
  di: number;   // den mandátu
  z: string;    // země (u vícezemých cest spojené „a“)
  m: string;    // města
  t: string;    // bilaterální / multilaterální / protokolární / soukromá
  w: string;    // oficiální / pracovní / státní / soukromá (dle KPR a Wikipedie)
  nz: number;   // kolikátá návštěva první země cesty
  desc: string; // průběh cesty
};
type TripsData = { zeman: Trip[]; pavel: Trip[] };
const TRIPS = tripsData as TripsData;

type HoverInfo = { trip: Trip; president: 'Zeman' | 'Pavel'; left: number; top: number } | null;

const COLORS = { Z: '#DE1743', P: '#6267A3' };
const PAVEL_START = new Date(Date.UTC(2023, 2, 9));

// Řádek = rok mandátu (365 dní od inaugurace), v něm dvě linky kostiček nad sebou:
// Zeman nahoře, Pavel dole. Kostička = jedna zahraniční cesta, řadí se chronologicky
// těsně vedle sebe – délka řady je tak zároveň počtem cest v daném roce mandátu.
const DAYS_PER_YEAR = 365;
const SQ = 21;          // strana kostičky
const SQ_GAP = 3;
const LANE_GAP = 5;     // mezera mezi linkou Zemana a Pavla
const ROW_GAP = 22;     // mezera mezi roky
const LABEL_W = 64;
const ROW_H = SQ * 2 + LANE_GAP + ROW_GAP;
const VIEW_W = LABEL_W + 23 * (SQ + SQ_GAP); // nejplnější linka má 22 cest + rezerva

function todayUTC(): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()));
}

function yearOf(trip: Trip): number {
  return Math.floor(trip.di / DAYS_PER_YEAR);
}

function typeLabel(trip: Trip): string {
  const parts = [trip.t];
  if (trip.w && trip.w !== trip.t) parts.push(trip.w);
  return parts.join(' · ');
}

interface GridProps {
  numYears: number;
  counter: number;
  showZeman: boolean;
  showPavel: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  onHover: (info: HoverInfo) => void;
}

function Grid({ numYears, counter, showZeman, showPavel, containerRef, onHover }: GridProps) {
  function showTip(e: React.MouseEvent, trip: Trip, president: 'Zeman' | 'Pavel') {
    const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
    const box = containerRef.current!.getBoundingClientRect();
    const left = Math.min(Math.max(rect.left - box.left + rect.width / 2, 120), box.width - 120);
    onHover({ trip, president, left, top: rect.top - box.top });
  }

  const height = numYears * ROW_H - ROW_GAP + 8;

  function lane(trips: Trip[], year: number, color: string, y: number, president: 'Zeman' | 'Pavel') {
    const inYear = trips.filter(t => yearOf(t) === year);
    return inYear.map((trip, i) => {
      const revealed = trip.di <= counter;
      const isPrivate = trip.t === 'soukromá' || trip.w === 'soukromá';
      return (
        <rect
          key={trip.n}
          x={LABEL_W + i * (SQ + SQ_GAP)}
          y={y}
          width={SQ}
          height={SQ}
          rx={4}
          fill={color}
          fillOpacity={isPrivate ? 0.4 : 1}
          stroke={isPrivate ? color : 'none'}
          strokeWidth={isPrivate ? 1.2 : 0}
          strokeDasharray={isPrivate ? '3 2' : undefined}
          opacity={revealed ? 1 : 0}
          style={{ transition: 'opacity 0.25s', cursor: revealed ? 'pointer' : 'default', pointerEvents: revealed ? 'auto' : 'none' }}
          onMouseEnter={e => showTip(e, trip, president)}
          onMouseLeave={() => onHover(null)}
          onClick={e => showTip(e, trip, president)}
        />
      );
    });
  }

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${height}`} width="100%" style={{ display: 'block' }}>
      {Array.from({ length: numYears }, (_, year) => {
        const zCount = TRIPS.zeman.filter(t => yearOf(t) === year && t.di <= counter).length;
        const pCount = TRIPS.pavel.filter(t => yearOf(t) === year && t.di <= counter).length;
        const rowY = year * ROW_H;
        const midY = rowY + SQ + LANE_GAP / 2;
        return (
          <g key={year}>
            <text x={0} y={midY - 10} fontSize={13.5} fontWeight={700} fill="#101432" fontFamily="var(--font-roboto-condensed), Arial, sans-serif">
              {year + 1}. rok
            </text>
            {showZeman && (
              <text x={0} y={midY + 5} fontSize={11} fontWeight={700} fill={COLORS.Z} fontFamily="var(--font-roboto-condensed), Arial, sans-serif">
                Z {zCount}
              </text>
            )}
            {showPavel && (
              <text x={0} y={midY + 18} fontSize={11} fontWeight={700} fill={COLORS.P} fontFamily="var(--font-roboto-condensed), Arial, sans-serif">
                P {pCount}
              </text>
            )}
            {showZeman && lane(TRIPS.zeman, year, COLORS.Z, rowY, 'Zeman')}
            {showPavel && lane(TRIPS.pavel, year, COLORS.P, rowY + SQ + LANE_GAP, 'Pavel')}
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

  const numYears = Math.floor(maxCounter / DAYS_PER_YEAR) + 1;

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

  const zemanCount = useMemo(() => TRIPS.zeman.filter(t => t.di <= counter).length, [counter]);
  const pavelCount = useMemo(() => TRIPS.pavel.filter(t => t.di <= counter).length, [counter]);

  return (
    <div style={{ margin: '24px 0', background: '#F8F6F0', padding: '18px 16px', borderRadius: 4 }}>
      {/* Titulek přes celou šířku, podpis na švu hlavičky vpravo (viz DESIGN.md §9) */}
      <div style={{
        fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', fontSize: 20, fontWeight: 700,
        color: '#101432', lineHeight: 1.2,
      }}>
        Cesty prezidentů: kostička za každou cestu
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '4px 0 6px' }}>
        <ChartSignature size={30} style={{ lineHeight: 1 }} />
      </div>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap',
        background: '#101432', padding: '10px 14px', borderRadius: 4,
      }}>
        <span style={{ fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', fontSize: 22, fontWeight: 700, color: '#fdfbf7' }}>
          <span style={{ display: 'inline-block', minWidth: '4ch', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{counter}</span>. den mandátu
        </span>
        <span style={{ fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', fontSize: 13, color: 'rgba(253,251,247,0.75)' }}>
          Zeman: <span style={{ display: 'inline-block', minWidth: '2ch', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{zemanCount}</span>{' '}
          <span style={{ display: 'inline-block', minWidth: '4.5ch' }}>{zemanCount === 1 ? 'cesta' : zemanCount < 5 ? 'cesty' : 'cest'}</span>
          <span style={{ fontSize: 18, margin: '0 8px', display: 'inline-block', verticalAlign: -1 }}>·</span>
          Pavel: <span style={{ display: 'inline-block', minWidth: '2ch', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{pavelCount}</span>{' '}
          <span style={{ display: 'inline-block', minWidth: '4.5ch' }}>{pavelCount === 1 ? 'cesta' : pavelCount < 5 ? 'cesty' : 'cest'}</span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowZeman(v => !v)}
          aria-pressed={showZeman}
          style={{
            display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif',
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
            display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif',
            color: showPavel ? '#333' : '#aaa', background: 'none', border: 'none', padding: 0, cursor: 'pointer', opacity: showPavel ? 1 : 0.5,
          }}
        >
          <span style={{ width: 10, height: 10, background: COLORS.P, display: 'inline-block', borderRadius: 2 }} />
          Pavel
        </button>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', color: '#666' }}>
          <span style={{ width: 10, height: 10, background: COLORS.P, opacity: 0.4, display: 'inline-block', borderRadius: 2, border: `1px dashed ${COLORS.P}` }} />
          soukromá cesta
        </span>
      </div>

      <div ref={containerRef} style={{ position: 'relative' }}>
        <Grid numYears={numYears} counter={counter} showZeman={showZeman} showPavel={showPavel} containerRef={containerRef} onHover={setHover} />
        {/* Jednotný tooltip: béžové pozadí s mírnou průhledností, Roboto Slab (vzor: graf plodnosti, kap. Demografie) */}
        {hover && (
          <div
            style={{
              position: 'absolute', left: hover.left, top: hover.top, transform: 'translate(-50%, calc(-100% - 8px))',
              background: 'rgba(248,246,240,0.95)', color: '#1a1a1a', padding: '8px 11px', borderRadius: 7, fontSize: 12,
              fontFamily: 'var(--font-roboto-slab), Georgia, serif', width: 250, pointerEvents: 'none', zIndex: 10,
              border: '1px solid #e8e3d2', boxShadow: '0 4px 10px rgba(16,20,50,0.14)', lineHeight: 1.45,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
              <span style={{ color: hover.president === 'Zeman' ? COLORS.Z : COLORS.P }}>{hover.president}</span>
              {' · '}{hover.trip.n}. cesta{' · '}{hover.trip.z}
            </div>
            {hover.trip.m && (
              <div style={{ color: '#333333' }}>{hover.trip.m}</div>
            )}
            <div style={{ color: '#333333', marginTop: 2 }}>
              {hover.trip.dl} · {hover.trip.di}. den mandátu
            </div>
            <div style={{ color: '#333333' }}>
              {typeLabel(hover.trip)}
              {hover.trip.nz > 1 ? ` · ${hover.trip.nz}. návštěva země` : ''}
            </div>
            {hover.trip.desc && (
              <div style={{ marginTop: 5, paddingTop: 5, borderTop: '1px solid #e8e3d2', color: '#1a1a1a' }}>
                {hover.trip.desc}
              </div>
            )}
            <div style={{
              position: 'absolute', left: '50%', top: '100%', transform: 'translateX(-50%)',
              width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
              borderTop: '5px solid rgba(248,246,240,0.97)',
            }} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
        <button
          onClick={() => { if (counter >= maxCounter) setCounter(0); setPlaying(p => !p); }}
          aria-label={playing ? 'Pozastavit přehrávání cest' : 'Přehrát cesty den po dni'}
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
        <span style={{ fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', fontSize: 12, color: '#333333', minWidth: 60, textAlign: 'right' }}>
          {counter}/{maxCounter}
        </span>
      </div>
      <p style={{ fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', fontSize: 12, color: '#333333', marginTop: 6 }}>
        Každá kostička je jedna zahraniční cesta, kostičky se řadí chronologicky po rocích mandátu – délka řady tak rovnou ukazuje počet cest.
        Oba prezidenty srovnáváme za stejnou fázi mandátu: prvních {maxCounter} dní od inaugurace (u Zemana od března 2013, u Pavla od března 2023).
        Zemanových {TRIPS.zeman.length - TRIPS.zeman.filter(t => t.di <= maxCounter).length} cest z pozdějších let mandátu v grafu není. Najetím nebo klepnutím na kostičku se zobrazí podrobnosti cesty.
      </p>
      <p style={{ fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', fontSize: 14, color: '#333333', marginTop: 10 }}>
        • autoři: <a href="https://datatimes.cz" target="_blank" rel="noopener noreferrer" style={{ color: '#333333', textDecoration: 'underline' }}>Kateřina Mahdalová &amp; Michal Škop</a> • data: Kancelář prezidenta republiky
      </p>
    </div>
  );
}
