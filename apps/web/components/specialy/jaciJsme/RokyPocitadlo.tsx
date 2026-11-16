'use client';

// Hlavička speciálu „Jací jsme byli, jací jsme – 1989 × 2026“: spodní rok naběhne jako počítadlo
// 1989 → 1990 → … → 2026 a zastaví se (Kateřina 16. 11. 2026: „jako kalendář nebo počítačka“).
// Server a čtečky obrazovky dostanou rovnou 2026; animace se vynechá při prefers-reduced-motion.

import { useEffect, useState } from 'react';

const OD = 1989;
const DO = 2026;
const TRVANI = 2600; // ms
const PRODLEVA = 350; // ms – ať čtenář stihne zachytit výchozí 1989

// zrychlí a ke konci zpomalí, aby poslední roky (2020…2026) šly přečíst
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function RokyPocitadlo({ className }: { className?: string }) {
  const [rok, setRok] = useState(DO);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let start = 0;
    setRok(OD);
    const krok = (cas: number) => {
      if (!start) start = cas;
      const t = Math.min(1, (cas - start) / TRVANI);
      setRok(OD + Math.round((DO - OD) * ease(t)));
      if (t < 1) raf = requestAnimationFrame(krok);
    };
    const timer = window.setTimeout(() => { raf = requestAnimationFrame(krok); }, PRODLEVA);
    return () => { window.clearTimeout(timer); cancelAnimationFrame(raf); };
  }, []);

  return (
    <span className={className} aria-label={String(DO)}>
      <span aria-hidden>{rok}</span>
    </span>
  );
}
