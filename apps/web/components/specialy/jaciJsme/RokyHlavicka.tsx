'use client';

// Letopočty v hlavičce speciálu „Jací jsme byli, jací jsme – 1989 × 2026“: odometr.
// Pod pevným 1989 se číslice plynule odvalí jako na počítadle kilometrů a zastaví se na 2026.
// Kateřina 17. 11. 2026 vybrala ze tří návrhů (kalendář s klapkami, časová osa, odometr) odometr.
// Server a čtečky obrazovky dostanou rovnou 2026; při prefers-reduced-motion se nic nehýbe.

import { useEffect, useState } from 'react';
import s from './RokyHlavicka.module.css';

const OD = 1989;
const DO = 2026;
const TRVANI = 2800; // ms
const PRODLEVA = 400; // ms – ať čtenář zachytí výchozí 1989

export default function RokyHlavicka() {
  const [cil, setCil] = useState(DO);
  const [jede, setJede] = useState(false);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    setCil(OD);
    const t = window.setTimeout(() => { setJede(true); setCil(DO); }, PRODLEVA);
    return () => window.clearTimeout(t);
  }, []);
  // řád m (tisíce … jednotky): váleček nese číslice od floor(OD/m) do floor(DO/m), poloha = floor(cil/m)
  const rady = [1000, 100, 10, 1].map((m) => {
    const z = Math.floor(OD / m), k = Math.floor(DO / m);
    const cifry = Array.from({ length: k - z + 1 }, (_, i) => (z + i) % 10);
    return { m, z, cifry };
  });
  return (
    <div className={s.obal} role="img" aria-label="1989 a 2026">
      <div className={s.odometr} aria-hidden>
        <div className={s.odoTehdy}>1989</div>
        <div className={s.odoDnes}><div className={s.okno}>
          {rady.map(({ m, z, cifry }) => (
            <span key={m} className={s.valecek}>
              <span
                className={s.pas}
                style={{
                  transform: `translateY(${-(Math.floor(cil / m) - z)}em)`,
                  transition: jede ? `transform ${TRVANI}ms cubic-bezier(0.65, 0, 0.35, 1)` : 'none',
                }}
              >
                {cifry.map((c, i) => <span key={i}>{c}</span>)}
              </span>
            </span>
          ))}
        </div></div>
      </div>
    </div>
  );
}
