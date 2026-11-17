'use client';

// Dlaždice speciálu „Jací jsme byli, jací jsme“ v karuselu Speciály na titulce (SpecialsHero).
// Dva návrhy ke schválení (Kateřina 17. 11. 2026), náhled ?dlazdice=roky|tecky:
//   roky  = statická mapa (dlazdice-v3.png) a pod ní odometr 1989 → 2026,
//   tecky = letopočty stojí, na mapě pomalu přibývají města s demonstracemi po dnech v týdnu 17.–25. 11. 1989
//           (od Národní třídy po Letnou; města s akcí už před 17. 11., např. Teplice, svítí od začátku)
//           a Praha pulzuje podle počtu účastníků (vrchol Letná 25. 11., až 800 000 lidí); pak cyklus znovu.
//           Kateřina 17. 11. 2026: zpomalit, točit se jen ten jeden týden; po načtení svítí VŠECHNA města
//           (celé 9. 11. – 26. 12.), pak města po 17. 11. pozvolna zhasnou, týden proběhne a zbytek se
//           rovnoměrně doplní. Vše plynule: města z téhož dne se rozsvěcují postupně, každé s náběhem.
// Data: app/specialy/jaci-jsme-byli-jaci-jsme-1989-2026/_data/dlazdice-demonstrace.json (generuje _cover_pipeline/motiv.cjs).

import { useEffect, useRef, useState } from 'react';
import data from '@/app/specialy/jaci-jsme-byli-jaci-jsme-1989-2026/_data/dlazdice-demonstrace.json';
import RokyHlavicka from './RokyHlavicka';
import s from './RokyHlavicka.module.css';

const ZAKLAD = 'https://media.datatimes.org/datatimes-cz/articles/2026/11/jaci-jsme-byli-jaci-jsme-1989-2026/dlazdice-zaklad-v2.png';
// Kateřina 17. 11. 2026: na dlaždici víc do běla – města bílá s růžovou září, rok 2026 růžový
const BOD = '#ffffff', ZARE = '#ff8099';
const OD_DNE = 8; // 17. 11. 1989 (den 0 = 9. 11.)
const DO_DNE = 16; // 25. 11. 1989, Letná
const DEN_MS = 1100; // jeden den týdne 17.–25. 11.
const VSE_MS = 3500; // celá mapa (všechna města listopad–prosinec) – tak dlaždice začíná
const ZHASINANI_MS = 2800; // města po 17. 11. pozvolna a postupně zhasnou (ta dřívější svítí dál)
const BEH_MS = (DO_DNE - OD_DNE + 1) * DEN_MS;
const DOPLNIT_MS = 5000; // po Letné se zbytek doplní rovnoměrně, ne zrychleně (Kateřina 17. 11. 2026: plynuleji)
const NABEH_MS = 900; // jedno město se rozsvítí / zhasne pozvolna
const CYKLUS = VSE_MS + ZHASINANI_MS + BEH_MS + DOPLNIT_MS;

// stálý „náhodný“ posun pro město (0–1), aby se města z téhož dne nerozsvítila naráz
const posun = (n: string) => { let h = 7; for (const ch of n) h = (h * 31 + ch.charCodeAt(0)) % 9973; return h / 9973; };
const pozdejsi = data.body.filter((b) => b.d > DO_DNE)
  .map((b) => ({ n: b.n, k: b.d + posun(b.n) })).sort((x, y) => x.k - y.k);
/** Kdy (ms od začátku běhu 17. 11.) se město rozsvítí; −Infinity = svítí pořád (akce už před 17. 11.). */
const ROZSVIT = new Map(data.body.map((b) => {
  if (b.d < OD_DNE) return [b.n, -Infinity] as const;
  if (b.d <= DO_DNE) return [b.n, (b.d - OD_DNE + 0.85 * posun(b.n)) * DEN_MS] as const;
  const i = pozdejsi.findIndex((x) => x.n === b.n);
  return [b.n, BEH_MS + ((i + 0.5) / pozdejsi.length) * (DOPLNIT_MS - NABEH_MS)] as const;
}));
const hladce = (x: number) => { const c = Math.min(1, Math.max(0, x)); return c * c * (3 - 2 * c); };

/** Jas města (0–1) a záblesk čerstvého rozsvícení v čase f (ms) smyčky. */
function mesto(n: string, d: number, f: number) {
  if (f < VSE_MS) return { jas: 1, zablesk: 0 };
  if (f < VSE_MS + ZHASINANI_MS) {
    if (d < OD_DNE) return { jas: 1, zablesk: 0 };
    const start = posun(n) * (ZHASINANI_MS - NABEH_MS);
    return { jas: 1 - hladce((f - VSE_MS - start) / NABEH_MS), zablesk: 0 };
  }
  const g = f - VSE_MS - ZHASINANI_MS - ROZSVIT.get(n)!;
  return { jas: hladce(g / NABEH_MS), zablesk: d < OD_DNE ? 0 : Math.max(0, 1 - g / 1800) * (g > 0 ? 1 : 0) };
}
const MAX_PRAHA = Math.max(...data.praha.map((p) => p[1]));
const PRAHA = data.body.find((b) => b.n === 'Praha')!;

/** Síla Prahy v den t: každý den s číslem „blikne“ úměrně odmocnině počtu lidí a pozvolna dozní. */
function prahaSila(t: number) {
  let m = 0;
  for (const [d, v] of data.praha) {
    if (d > t) break;
    m = Math.max(m, Math.sqrt(v / MAX_PRAHA) * Math.exp(-(t - d) / 0.9));
  }
  return m;
}

function Tecky() {
  const ref = useRef<HTMLDivElement>(null);
  const [f, setF] = useState(0); // server a reduced-motion: celá mapa
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0, start = 0, vidim = false;
    const krok = (cas: number) => {
      if (!start) start = cas;
      setF((cas - start) % CYKLUS);
      if (vidim) raf = requestAnimationFrame(krok);
    };
    const io = new IntersectionObserver(([z]) => {
      vidim = z.isIntersecting;
      cancelAnimationFrame(raf);
      if (vidim) { start = 0; raf = requestAnimationFrame(krok); }
    }, { threshold: 0.3 });
    if (ref.current) io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);
  const g = f - VSE_MS - ZHASINANI_MS;
  // Praha pulzuje jen během týdne 17.–25. 11. a pak pozvolna dozní
  const p = g < 0 ? 0 : prahaSila(OD_DNE + Math.min(g, BEH_MS + 2500) / DEN_MS);
  return (
    <div ref={ref} style={{ position: 'absolute', inset: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={ZAKLAD} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <svg viewBox={`0 0 ${data.sirka} ${data.vyska}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden>
        <defs>
          <radialGradient id="dlz-zare"><stop offset="0" stopColor={ZARE} stopOpacity="0.6" /><stop offset="1" stopColor={ZARE} stopOpacity="0" /></radialGradient>
        </defs>
        {data.body.map((b) => {
          const { jas, zablesk } = mesto(b.n, b.d, f);
          if (jas <= 0.01) return null;
          const r = data.r * (1 + 0.7 * zablesk);
          return (
            <g key={b.n} opacity={jas * ('sk' in b ? data.skOpacity : 1)}>
              <circle cx={b.x} cy={b.y} r={r * (2.6 + 2 * zablesk)} fill="url(#dlz-zare)" />
              <circle cx={b.x} cy={b.y} r={r} fill={BOD} stroke={ZARE} strokeWidth={2.2} />
            </g>
          );
        })}
        {p > 0.02 && (
          <>
            <circle cx={PRAHA.x} cy={PRAHA.y} r={data.r * (2 + 16 * p)} fill="url(#dlz-zare)" opacity={Math.min(1, 0.4 + p)} />
            <circle cx={PRAHA.x} cy={PRAHA.y} r={data.r * (1.2 + 6 * p)} fill="none" stroke={ZARE} strokeWidth={3} opacity={0.35 + 0.6 * p} />
          </>
        )}
      </svg>
    </div>
  );
}

export default function DlazdiceSpecialu() {
  const [v, setV] = useState<'roky' | 'tecky'>('tecky');
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('dlazdice');
    if (q === 'roky' || q === 'tecky') setV(q);
  }, []);
  return (
    <>
      {v === 'tecky' && <Tecky />}
      <div style={{ position: 'absolute', left: 0, right: 0, top: '54%', containerType: 'inline-size', pointerEvents: 'none' }}>
        <RokyHlavicka dlazdice staticke={v === 'tecky'} ruzova={v === 'tecky'} key={v} />
      </div>
    </>
  );
}
