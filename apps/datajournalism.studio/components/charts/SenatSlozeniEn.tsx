'use client';

// English version of apps/web/components/charts/SenatSlozeni.tsx (datatimes.org).
// Static hemicycle of all 81 Senate seats with a clickable club legend; name on hover / tap.
// Self-contained: hemicycle() and the card frame are inlined so the component does not depend on
// ChartCard / SenatDruheKolo being ported.
// <SenatSlozeniEn dataUrl="/a/_articles/<slug>/slozeni.json" />

import { useEffect, useMemo, useState } from 'react';

const INK = '#101432';
const MUTED = '#4c4f8e';
const LINE = '#e6e3d9';
const OFF = '#e3e0d6'; // de-emphasised seat
const FONT = 'var(--font-roboto-condensed), Arial, sans-serif';

type Klub = { id: string; nazev: string; kratce: string; barva: string };
type Sedadlo = { jmeno: string; obvod: number; obvodNazev: string; klub: string; nove: boolean; kolo?: number; navrh?: string };
type Data = { stav?: string; kluby: Klub[]; sedadla: Sedadlo[] };

function hemicycle(n: number) {
  const rows = 5, r0 = 110, r1 = 280;
  const radii = Array.from({ length: rows }, (_, i) => r0 + ((r1 - r0) * i) / (rows - 1));
  const sum = radii.reduce((s, x) => s + x, 0);
  const counts = radii.map((r) => Math.round((n * r) / sum));
  counts[rows - 1] += n - counts.reduce((s, x) => s + x, 0);
  const pts: { x: number; y: number; a: number; r: number }[] = [];
  radii.forEach((r, i) => {
    const k = counts[i];
    for (let j = 0; j < k; j++) {
      const a = Math.PI - (j * Math.PI) / (k - 1);
      pts.push({ x: 300 + r * Math.cos(a), y: 292 - r * Math.sin(a), a, r });
    }
  });
  return pts.sort((p, q) => q.a - p.a || p.r - q.r);
}

export default function SenatSlozeniEn({ dataUrl }: { dataUrl: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [off, setOff] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => { fetch(dataUrl).then((r) => r.json()).then(setData).catch(() => {}); }, [dataUrl]);

  const pts = useMemo(() => hemicycle(81), []);
  const seats = useMemo(() => {
    if (!data) return [];
    return data.kluby.flatMap((k) => data.sedadla.filter((s) => s.klub === k.id).sort((a, b) => a.obvod - b.obvod));
  }, [data]);

  if (!data) return <div style={{ fontFamily: FONT, color: MUTED, padding: '1em 0' }}>Loading Senate composition…</div>;

  const klub = (id: string) => data.kluby.find((k) => k.id === id);
  const toggle = (id: string) => setOff((o) => { const n = new Set(o); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const h = hover !== null ? seats[hover] : null;
  const hk = h ? klub(h.klub) : undefined;

  return (
    <div style={{ background: '#f8f6f0', borderRadius: 4, padding: '28px 16px 24px', margin: '1em 0', fontFamily: FONT, color: INK }}>
      <div style={{ fontWeight: 700, fontSize: 20, lineHeight: 1.2, color: '#1a1a1a', marginBottom: 6 }}>The new composition of the Senate</div>
      <div style={{ fontSize: 16, lineHeight: 1.3, color: '#333333', marginBottom: 22 }}>
        All 81 senators by club. For the 27 elected this year we show the expected club; club numbers will settle after the election.
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
        {data.kluby.map((k) => {
          const on = !off.has(k.id);
          const n = data.sedadla.filter((s) => s.klub === k.id).length;
          return (
            <button key={k.id} type="button" onClick={() => toggle(k.id)} aria-pressed={on} title={`${k.nazev}: ${n}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
                border: `1px solid ${on ? LINE : 'transparent'}`, background: on ? '#fff' : 'transparent', opacity: on ? 1 : 0.5,
                fontFamily: FONT, fontSize: 14, color: INK,
              }}>
              <span style={{ width: 11, height: 11, borderRadius: 6, background: k.barva }} />
              <span>{k.kratce}</span>
              <b style={{ fontVariantNumeric: 'tabular-nums' }}>{n}</b>
            </button>
          );
        })}
      </div>

      <div style={{ position: 'relative' }}>
        <svg viewBox="0 -18 600 330" style={{ width: '100%', display: 'block' }} role="img"
          aria-label={`Hemicycle of the 81 Senate seats: ${data.kluby.map((k) => `${k.kratce} ${data.sedadla.filter((s) => s.klub === k.id).length}`).join(', ')}`}>
          {pts.map((p, i) => {
            const s = seats[i];
            if (!s) return null;
            const k = klub(s.klub);
            return (
              <circle key={i} cx={p.x} cy={p.y} r={14} fill={!k || off.has(k.id) ? OFF : k.barva}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onClick={() => setHover(i)}
                style={{ transition: 'fill .6s ease', cursor: 'pointer' }} />
            );
          })}
          <text x={300} y={258} textAnchor="middle" fontSize={34} fontWeight={700} fill={INK}>81</text>
          <text x={300} y={282} textAnchor="middle" fontSize={14} fill={MUTED}>senators</text>
        </svg>
        {h && (
          <div style={{ position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)', background: '#fff', border: `1px solid ${LINE}`, borderRadius: 6, padding: '5px 9px', fontSize: 13, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
            <b>{h.jmeno}</b> · district {h.obvod} {h.obvodNazev} · {hk?.kratce}{h.nove ? ' · newly elected 2026' : ''}
          </div>
        )}
      </div>

      <div style={{ fontSize: 12.5, color: MUTED, marginTop: 4 }}>Click a club to hide it. Majority = 41 votes.</div>

      <div style={{ fontSize: 16, color: '#333333', marginTop: 18, lineHeight: 1.5 }}>
        <div>
          {'• authors: '}
          <a href="https://www.datatimes.org" target="_blank" rel="noopener noreferrer" style={{ color: '#333333', textDecoration: 'underline' }}>
            Kateřina Mahdalová &amp; Michal Škop
          </a>
        </div>
        <div>• data: ČSÚ (Czech Statistical Office), senat.cz; calculation by DataTimes</div>
      </div>
    </div>
  );
}
