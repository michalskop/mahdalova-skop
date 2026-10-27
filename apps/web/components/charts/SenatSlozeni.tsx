'use client';

// Senát 2026 – nové složení: statický amfiteátr všech 81 křesel (klon amfiteátru ze SenatDruheKolo bez živých dat,
// bez „rozhoduje se“, přepínače a popisků po stranách). Vyklikávací legenda klubů, jméno po najetí / klepnutí na křeslo.
// <SenatSlozeni dataUrl="/clanek/_articles/<slug>/slozeni.json" />  (slozeni.json vyrábí _data_pipeline/slozeni.py u článku)

import { useEffect, useMemo, useState } from 'react';
import ChartCard from './ChartCard';
import { hemicycle } from './SenatDruheKolo';

const INK = '#101432';
const MUTED = '#4c4f8e';
const LINE = '#e6e3d9';
const OFF = '#e3e0d6'; // upozaděné křeslo
const FONT = 'var(--font-roboto-condensed), Arial, sans-serif';

type Klub = { id: string; nazev: string; kratce: string; barva: string };
type Sedadlo = { jmeno: string; obvod: number; obvodNazev: string; klub: string; nove: boolean; kolo?: number; navrh?: string };
type Data = { stav?: string; kluby: Klub[]; sedadla: Sedadlo[] };

export default function SenatSlozeni({ dataUrl }: { dataUrl: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [off, setOff] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => { fetch(dataUrl).then((r) => r.json()).then(setData).catch(() => {}); }, [dataUrl]);

  const pts = useMemo(() => hemicycle(81), []);
  // křesla po klubech v pořadí legendy (stejně jako amfiteátr 2. kola), uvnitř klubu podle obvodu
  const seats = useMemo(() => {
    if (!data) return [];
    return data.kluby.flatMap((k) => data.sedadla.filter((s) => s.klub === k.id).sort((a, b) => a.obvod - b.obvod));
  }, [data]);

  if (!data) return <div style={{ fontFamily: FONT, color: MUTED, padding: '1em 0' }}>Načítám složení Senátu…</div>;

  const klub = (id: string) => data.kluby.find((k) => k.id === id);
  const toggle = (id: string) => setOff((o) => { const n = new Set(o); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const h = hover !== null ? seats[hover] : null;
  const hk = h ? klub(h.klub) : undefined;

  return (
    <ChartCard
      title="Nové složení Senátu"
      subtitle="81 senátorů a senátorek podle klubů. U 27 letos zvolených uvádíme předpokládaný klub, počty v klubech se ustálí po volbách."
      source="ČSÚ, senat.cz; výpočet DataTimes.cz"
    >
      <div style={{ fontFamily: FONT, color: INK }}>
        {/* legenda = počty klubů, vyklikávací */}
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
            aria-label={`Amfiteátr 81 křesel Senátu: ${data.kluby.map((k) => `${k.kratce} ${data.sedadla.filter((s) => s.klub === k.id).length}`).join(', ')}`}>
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
            <text x={300} y={282} textAnchor="middle" fontSize={14} fill={MUTED}>senátorů a senátorek</text>
          </svg>
          {h && (
            <div style={{ position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)', background: '#fff', border: `1px solid ${LINE}`, borderRadius: 6, padding: '5px 9px', fontSize: 13, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
              <b>{h.jmeno}</b> · {h.obvod} {h.obvodNazev} · {hk?.kratce}{h.nove ? ' · nově zvolen/a 2026' : ''}
            </div>
          )}
        </div>

        <div style={{ fontSize: 12.5, color: MUTED, marginTop: 4 }}>Kliknutím na klub ho vypnete. Většina = 41 hlasů.</div>
      </div>
    </ChartCard>
  );
}
