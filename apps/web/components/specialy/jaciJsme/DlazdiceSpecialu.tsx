'use client';

// Dlaždice speciálu „Jací jsme byli, jací jsme“ v karuselu Speciály na titulce (SpecialsHero).
// Dva návrhy ke schválení (Kateřina 17. 11. 2026), náhled ?dlazdice=roky|tecky:
//   roky  = statická mapa (dlazdice-v3.png) a pod ní odometr 1989 → 2026,
//   tecky = letopočty stojí, na mapě pomalu přibývají města s demonstracemi po dnech v týdnu 17.–25. 11. 1989
//           (od Národní třídy po Letnou; města s akcí už před 17. 11., např. Teplice, svítí od začátku)
//           a Praha pulzuje podle počtu účastníků (vrchol Letná 25. 11., až 800 000 lidí); pak cyklus znovu.
//           Kateřina 17. 11. 2026: zpomalit, točit se jen ten jeden týden.
// Data: app/specialy/jaci-jsme-byli-jaci-jsme-1989-2026/_data/dlazdice-demonstrace.json (generuje _cover_pipeline/motiv.cjs).

import { useEffect, useRef, useState } from 'react';
import data from '@/app/specialy/jaci-jsme-byli-jaci-jsme-1989-2026/_data/dlazdice-demonstrace.json';
import RokyHlavicka from './RokyHlavicka';
import s from './RokyHlavicka.module.css';

const ZAKLAD = 'https://media.datatimes.org/datatimes-cz/articles/2026/11/jaci-jsme-byli-jaci-jsme-1989-2026/dlazdice-zaklad-v1.png';
const BOD = '#de1743', ZARE = '#ff8099';
const OD_DNE = 8; // 17. 11. 1989 (den 0 = 9. 11.)
const DO_DNE = 16; // 25. 11. 1989, Letná
const DEN_MS = 1100; // jeden den
const DRZET_MS = 3000; // po Letné chvíli stojí celá mapa
const ZHASNOUT_MS = 900;
const BEH_MS = (DO_DNE - OD_DNE + 1) * DEN_MS;
const CYKLUS = BEH_MS + DRZET_MS + ZHASNOUT_MS;
const MAX_PRAHA = Math.max(...data.praha.map((p) => p[1]));
const MESICE = ['listopadu', 'prosince'];
const datum = (d: number) => (d < 22 ? `${9 + d}. ${MESICE[0]}` : `${d - 21}. ${MESICE[1]}`);
const PRAHA = data.body.find((b) => b.n === 'Praha')!;

/** Velikost Prahy v čase t (dny): každý den s číslem „blikne“ úměrně odmocnině počtu lidí a dozní. */
function prahaSila(t: number) {
  let m = 0;
  for (const [d, v] of data.praha) {
    if (d > t) break;
    m = Math.max(m, Math.sqrt(v / MAX_PRAHA) * Math.exp(-(t - d) / 0.7));
  }
  return m;
}

function Tecky() {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState(DO_DNE + 0.99); // server a reduced-motion: stav po Letné
  const [zhasnuti, setZhasnuti] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0, start = 0, vidim = false;
    const krok = (cas: number) => {
      if (!start) start = cas;
      const f = (cas - start) % CYKLUS;
      setT(OD_DNE + Math.min(f, BEH_MS - 1) / DEN_MS);
      const z = f - BEH_MS - DRZET_MS;
      setZhasnuti(z > 0 ? z / ZHASNOUT_MS : 0);
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
  const p = prahaSila(t);
  const svit = 1 - zhasnuti;
  return (
    <div ref={ref} style={{ position: 'absolute', inset: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={ZAKLAD} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <svg viewBox={`0 0 ${data.sirka} ${data.vyska}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden>
        <defs>
          <radialGradient id="dlz-zare"><stop offset="0" stopColor={ZARE} stopOpacity="0.6" /><stop offset="1" stopColor={ZARE} stopOpacity="0" /></radialGradient>
        </defs>
        <g opacity={svit}>
          {data.body.map((b) => {
            if (b.d > t) return null;
            const novy = b.d < OD_DNE ? 0 : Math.max(0, 1 - (t - b.d) / 1.2); // čerstvě přibylé město krátce zazáří
            const r = data.r * (1 + 0.8 * novy);
            return (
              <g key={b.n} opacity={'sk' in b ? data.skOpacity : 1}>
                <circle cx={b.x} cy={b.y} r={r * (2.6 + 2 * novy)} fill="url(#dlz-zare)" />
                <circle cx={b.x} cy={b.y} r={r} fill={BOD} stroke={ZARE} strokeWidth={2.2} />
              </g>
            );
          })}
          {PRAHA.d <= t && p > 0.02 && (
            <>
              <circle cx={PRAHA.x} cy={PRAHA.y} r={data.r * (2 + 16 * p)} fill="url(#dlz-zare)" opacity={Math.min(1, 0.4 + p)} />
              <circle cx={PRAHA.x} cy={PRAHA.y} r={data.r * (1.2 + 6 * p)} fill="none" stroke={ZARE} strokeWidth={3} opacity={0.35 + 0.6 * p} />
            </>
          )}
        </g>
        <text x={60} y={72} fill="#ffffff" fillOpacity={0.75 * svit} fontSize={44} fontWeight={600}
          fontFamily="var(--mantine-font-family-headings), 'IBM Plex Sans', Arial, sans-serif">
          {datum(Math.min(Math.floor(t), DO_DNE))} 1989
        </text>
      </svg>
    </div>
  );
}

export default function DlazdiceSpecialu() {
  const [v, setV] = useState<'roky' | 'tecky'>('roky');
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('dlazdice');
    if (q === 'roky' || q === 'tecky') setV(q);
  }, []);
  return (
    <>
      {v === 'tecky' && <Tecky />}
      <div style={{ position: 'absolute', left: 0, right: 0, top: '55%', containerType: 'inline-size', pointerEvents: 'none' }}>
        <RokyHlavicka dlazdice staticke={v === 'tecky'} key={v} />
      </div>
    </>
  );
}
