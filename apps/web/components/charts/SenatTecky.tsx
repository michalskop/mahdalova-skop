'use client';

// Tečkový pruh: 27 teček = 27 nově zvolených senátorů a senátorek, barva = odpověď v naší Volební kalkulačce.
// Pořadí: pro → nevím → proti → kalkulačku nevyplnil/a. Najetím / klepnutím na tečku jméno a odpověď.
// <SenatTecky dataUrl="/clanek/_articles/<slug>/tecky.json" q={16} />   jedna otázka
// <SenatTecky dataUrl="…" />                                           přehled všech otázek (seřazeno podle počtu „pro“)
// tecky.json vyrábí _data_pipeline/kalkulacka_index.py u článku.

import { useEffect, useState } from 'react';
import ChartCard from './ChartCard';

const INK = '#101432';
const MUTED = '#4c4f8e';
const LINE = '#e6e3d9';
const FONT = 'var(--font-roboto-condensed), Arial, sans-serif';
// pro × proti: modrozelená × oranžová – rozliší je i barvoslepí (žádná červená × zelená)
const BARVA: Record<string, string> = { p: '#06677d' /* brandTeal.7 */, v: '#c9c4b5', n: '#f76800' /* brandOrange.6 */, x: 'none' };
const SLOVO: Record<string, string> = { p: 'pro', v: 'nevím', n: 'proti', x: 'neodpověděl/a' };
const PORADI = ['p', 'v', 'n', 'x'];

type Otazka = { q: number; otazka: string; pro: number; proti: number; nevim: number; nevyplnil: number; celkem: number };
type Senator = { jmeno: string; obvod: number; odpovedi: Record<string, string> };
type Data = { otazky: Otazka[]; senatori: Senator[] };

const cache: Record<string, Promise<Data>> = {};
const load = (url: string) => (cache[url] ??= fetch(url).then((r) => r.json()));

function Pruh({ o, senatori, kompakt }: { o: Otazka; senatori: Senator[]; kompakt?: boolean }) {
  const [hover, setHover] = useState<number | null>(null);
  const tecky = PORADI.flatMap((k) => senatori.filter((s) => s.odpovedi[String(o.q)] === k).map((s) => ({ s, k })));
  const N = tecky.length, krok = 22, r = 8.6, x0 = 11, W = x0 * 2 + krok * (N - 1);
  const vetsina = Math.floor(N / 2) + 1;
  const h = hover !== null ? tecky[hover] : null;
  const pocty: Record<string, number> = { p: o.pro, v: o.nevim, n: o.proti, x: o.nevyplnil };
  return (
    <div style={{ margin: kompakt ? '0 0 14px' : '0', position: 'relative' }}>
      <div style={{ fontSize: kompakt ? 15 : 17, fontWeight: 700, lineHeight: 1.3, marginBottom: 6 }}>{o.otazka}</div>
      <svg viewBox={`0 0 ${W} 34`} style={{ width: '100%', display: 'block' }} role="img"
        aria-label={`${o.otazka} Pro ${o.pro}, nevím ${o.nevim}, proti ${o.proti}, neodpověděli ${o.nevyplnil} z ${N} nově zvolených.`}>
        {/* hranice většiny: mezi 14. a 15. tečkou zleva */}
        <line x1={x0 + krok * (vetsina - 0.5)} x2={x0 + krok * (vetsina - 0.5)} y1={1} y2={33} stroke={MUTED} strokeWidth={1.2} strokeDasharray="2 2" />
        {tecky.map(({ k }, i) => (
          <circle key={i} cx={x0 + krok * i} cy={17} r={k === 'x' ? r - 1 : r} fill={BARVA[k]}
            stroke={k === 'x' ? '#9a9a92' : hover === i ? INK : 'none'} strokeWidth={k === 'x' ? 1.6 : 2}
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onClick={() => setHover(i)} style={{ cursor: 'pointer' }} />
        ))}
      </svg>
      <div style={{ fontSize: 14, color: MUTED, marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: '2px 14px' }}>
        {PORADI.filter((k) => pocty[k] > 0).map((k) => (
          <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 5, background: k === 'x' ? 'transparent' : BARVA[k], border: k === 'x' ? '1.6px solid #9a9a92' : 'none', boxSizing: 'border-box' }} />
            <span style={k === 'p' ? { color: BARVA.p, fontWeight: 700 } : k === 'n' ? { color: '#b34d00', fontWeight: 700 } : undefined}>{SLOVO[k]} {pocty[k]}</span>
          </span>
        ))}
      </div>
      {h && (
        <div style={{ position: 'absolute', left: '50%', top: kompakt ? -6 : -10, transform: 'translateX(-50%)', background: '#fff', border: `1px solid ${LINE}`, borderRadius: 6, padding: '4px 9px', fontSize: 13, pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 2 }}>
          <b>{h.s.jmeno}</b> ({h.s.obvod}) · {SLOVO[h.k]}
        </div>
      )}
    </div>
  );
}

export default function SenatTecky({ dataUrl, q }: { dataUrl: string; q?: number }) {
  const [data, setData] = useState<Data | null>(null);
  useEffect(() => { load(dataUrl).then(setData).catch(() => {}); }, [dataUrl]);
  if (!data) return <div style={{ fontFamily: FONT, color: MUTED, padding: '1em 0' }}>Načítám odpovědi…</div>;

  if (q !== undefined) {
    const o = data.otazky.find((x) => x.q === q);
    if (!o) return null;
    return (
      <div style={{ fontFamily: FONT, color: INK, margin: '1.4em 0', clear: 'both' }}>
        <Pruh o={o} senatori={data.senatori} />
      </div>
    );
  }
  const vse = [...data.otazky].sort((a, b) => b.pro - a.pro);
  return (
    <ChartCard
      title="Jak odpovídali noví senátoři a senátorky"
      subtitle="Každá tečka reprezentuje jednoho z 27 letos zvolených. Odpovědi z naší Volební kalkulačky, seřazeno podle počtu odpovědí „pro“. Čárkovaně hranice většiny (14 z 27)."
      source="Volební kalkulačka 2026 (KohoVolit.eu, DataTimes.cz); zvolení: ČSÚ"
    >
      <div style={{ fontFamily: FONT, color: INK }}>
        {vse.map((o) => <Pruh key={o.q} o={o} senatori={data.senatori} kompakt />)}
      </div>
    </ChartCard>
  );
}
