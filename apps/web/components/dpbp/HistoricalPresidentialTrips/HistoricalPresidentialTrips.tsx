'use client';

import { useMemo, useState } from 'react';
import tripsData from './data.json';
import ChartSignature from '../ChartSignature';

type RawTrip = {
  president: 'Václav Havel' | 'Václav Klaus';
  n: number;
  d: string;
  end: string;
  di: number;
  z: string;
  iso: string;
  desc: string;
};

type Data = Record<'Václav Havel' | 'Václav Klaus', RawTrip[]>;
type PresidentKey = 'havel' | 'klaus';
type Trip = { d: string; di: number; countries: string[]; desc: string };

const DATA = tripsData as Data;
const COLORS: Record<PresidentKey, string> = { havel: '#6267A3', klaus: '#DE1743' };
const LABELS: Record<PresidentKey, string> = { havel: 'Havel', klaus: 'Klaus' };
const DAYS_PER_YEAR = 365;

function uniqueTrips(rows: RawTrip[]): Trip[] {
  const grouped = new Map<string, Trip>();
  for (const row of rows) {
    const current = grouped.get(row.d);
    if (current) {
      if (!current.countries.includes(row.z)) current.countries.push(row.z);
      if (row.desc && !current.desc.includes(row.desc)) current.desc += `; ${row.desc}`;
    } else {
      grouped.set(row.d, { d: row.d, di: row.di, countries: [row.z], desc: row.desc });
    }
  }
  return Array.from(grouped.values()).sort((a, b) => a.d.localeCompare(b.d));
}

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString('cs-CZ', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
}

const TRIPS: Record<PresidentKey, Trip[]> = {
  havel: uniqueTrips(DATA['Václav Havel']),
  klaus: uniqueTrips(DATA['Václav Klaus']),
};

type Hover = { president: PresidentKey; trip: Trip; left: number; top: number } | null;

export default function HistoricalPresidentialTrips() {
  const [hover, setHover] = useState<Hover>(null);

  const years = useMemo(() => Array.from({ length: 10 }, (_, year) => ({
    year,
    havel: TRIPS.havel.filter((trip) => Math.floor(trip.di / DAYS_PER_YEAR) === year),
    klaus: TRIPS.klaus.filter((trip) => Math.floor(trip.di / DAYS_PER_YEAR) === year),
  })), []);

  const width = 700;
  const height = 310;
  const margin = { top: 22, right: 18, bottom: 42, left: 42 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const max = 35;
  const groupW = plotW / years.length;
  const barW = 20;

  function y(value: number) { return margin.top + plotH - (value / max) * plotH; }

  return (
    <div style={{ margin: '24px 0', background: '#F8F6F0', padding: '18px 16px 14px', borderRadius: 4 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'center', columnGap: 18, marginBottom: 8 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', fontSize: 22, fontWeight: 700, color: '#101432', lineHeight: 1.16 }}>
            Zahraniční cesty Havla a Klause po letech mandátu
          </div>
          <div style={{ fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', fontSize: 16, color: '#333333', marginTop: 6 }}>
            Počet cest podle unikátního data zahájení · celé české prezidentské mandáty
          </div>
        </div>
        <ChartSignature size={30} layout="stacked" textWeight={400} style={{ lineHeight: 1 }} />
      </div>

      <div style={{ display: 'flex', gap: 18, margin: '12px 0 4px', fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', fontSize: 13 }}>
        {(Object.keys(LABELS) as PresidentKey[]).map((president) => (
          <span key={president} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 11, height: 11, borderRadius: 2, background: COLORS[president], display: 'inline-block' }} />
            {LABELS[president]} · {TRIPS[president].length} cest
          </span>
        ))}
      </div>

      <div style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: 'block', overflow: 'visible' }} role="img" aria-label="Počet zahraničních cest Václava Havla a Václava Klause v jednotlivých letech mandátu">
          {[0, 10, 20, 30].map((tick) => (
            <g key={tick}>
              <line x1={margin.left} x2={width - margin.right} y1={y(tick)} y2={y(tick)} stroke="#d8d1bf" strokeWidth={1} />
              <text x={margin.left - 8} y={y(tick) + 4} textAnchor="end" fontSize={11} fill="#5d5a52" fontFamily="var(--font-roboto-condensed), Arial, sans-serif">{tick}</text>
            </g>
          ))}
          {years.map((row) => {
            const center = margin.left + row.year * groupW + groupW / 2;
            return (
              <g key={row.year}>
                {(['havel', 'klaus'] as PresidentKey[]).map((president, index) => {
                  const trips = row[president];
                  const x = center + (index === 0 ? -barW - 2 : 2);
                  const top = y(trips.length);
                  return (
                    <g key={president}>
                      <rect x={x} y={top} width={barW} height={margin.top + plotH - top} rx={2} fill={COLORS[president]}>
                        <title>{`${LABELS[president]}, ${row.year + 1}. rok: ${trips.length} cest`}</title>
                      </rect>
                      <text x={x + barW / 2} y={top - 5} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={COLORS[president]} fontFamily="var(--font-roboto-condensed), Arial, sans-serif">{trips.length}</text>
                      {trips.map((trip, tripIndex) => {
                        const segmentH = (margin.top + plotH - top) / trips.length;
                        return (
                          <rect
                            key={trip.d}
                            x={x}
                            y={top + tripIndex * segmentH}
                            width={barW}
                            height={Math.max(segmentH, 1)}
                            fill="transparent"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={(event) => {
                              const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
                              const host = (event.currentTarget.ownerSVGElement?.parentElement as HTMLElement).getBoundingClientRect();
                              const rawLeft = rect.left - host.left + rect.width / 2;
                              setHover({ president, trip, left: Math.min(Math.max(rawLeft, 138), host.width - 138), top: rect.top - host.top });
                            }}
                            onMouseLeave={() => setHover(null)}
                          />
                        );
                      })}
                    </g>
                  );
                })}
                <text x={center} y={height - 15} textAnchor="middle" fontSize={12} fill="#333333" fontFamily="var(--font-roboto-condensed), Arial, sans-serif">{row.year + 1}.</text>
              </g>
            );
          })}
          <text x={margin.left + plotW / 2} y={height - 1} textAnchor="middle" fontSize={11} fill="#5d5a52" fontFamily="var(--font-roboto-condensed), Arial, sans-serif">rok mandátu</text>
        </svg>

        {hover && (
          <div style={{ position: 'absolute', left: hover.left, top: hover.top, transform: 'translate(-50%, calc(-100% - 8px))', width: 260, background: 'rgba(248,246,240,0.97)', border: '1px solid #e8e3d2', boxShadow: '0 4px 10px rgba(16,20,50,0.14)', borderRadius: 7, padding: '8px 10px', zIndex: 10, pointerEvents: 'none', fontFamily: 'var(--font-roboto-slab), Georgia, serif', fontSize: 12, lineHeight: 1.4 }}>
            <div style={{ fontWeight: 700, color: COLORS[hover.president] }}>{LABELS[hover.president]} · {hover.trip.countries.join(' + ')}</div>
            <div>{formatDate(hover.trip.d)} · {hover.trip.di}. den mandátu</div>
            {hover.trip.desc && <div style={{ marginTop: 4, color: '#333333' }}>{hover.trip.desc}</div>}
          </div>
        )}
      </div>

      <p style={{ fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', fontSize: 16, color: '#333333', marginTop: 8, lineHeight: 1.45 }}>
        Klaus cestoval v každém roce mandátu častěji než Havel. Graf spojuje zastávky se stejným počátečním datem do jedné cesty; vícestátní cesta se proto počítá jen jednou.
      </p>
      <div style={{ fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', fontSize: 12, color: '#333333', marginTop: 10, lineHeight: 1.5 }}>
        <div>• autoři: <a href="https://datatimes.cz" target="_blank" rel="noopener noreferrer" style={{ color: '#333333', textDecoration: 'underline' }}>Kateřina Mahdalová &amp; Michal Škop</a></div>
        <div>• data: Kancelář prezidenta republiky a rešeršní oddělení Českého rozhlasu</div>
      </div>
    </div>
  );
}
