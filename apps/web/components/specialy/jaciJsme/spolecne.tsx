'use client';

// Společné kousky interaktivních prvků speciálu „Jací jsme byli, jací jsme – 1989 × 2026“
// (Tipovacka, PosuvnikTehdyDnes, OdNarozeni): barvy, písma, české formáty čísel a pruh s popiskem.
// Dokumentace: packages/ui/DESIGN.md → „Interaktivní prvky speciálu 1989 × 2026“.

import { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { fixCzechTypography } from '@/lib/remark-czech-typography';

export const TEHDY = '#6267a3'; // brandNavy.6 – 1989, historie
export const DNES = '#de1743';  // brand.6 – dnešek
export const INK = '#101432';   // brandNavy.9
export const MUTED = '#4c4f8e'; // brandNavy.7
export const KARTA = '#f8f6f0'; // background.2
export const GRID = '#d4d4c8';  // background.7
export const EDGE = '#e8e3d2';
export const FONT = 'var(--font-roboto-condensed), Arial, sans-serif';
// IBM Plex Sans = písmo nadpisů z ThemeProvideru (Mantine ho vystavuje jako proměnnou; --font-ibm-plex-sans na <body> není)
export const FONT_PLEX = 'var(--mantine-font-family-headings), Arial, sans-serif';

const NBSP = ' ';

/** České číslo: pevná mezera mezi tisíci, desetinná čárka. */
export function num(v: number, d = 0) {
  return v
    .toLocaleString('cs-CZ', { minimumFractionDigits: d, maximumFractionDigits: d })
    .replace(/[  ]/g, NBSP)
    .replace('-', '−');
}

/** Číslo s jednotkou spojenou pevnou mezerou („46,8 %“, „68,1 roku“). */
export function sJednotkou(v: number, d: number, jednotka?: string) {
  return jednotka ? `${num(v, d)}${NBSP}${jednotka}` : num(v, d);
}

/** Text z JSON → české typografické pevné mezery (jednopísmenné předložky, číslo + %). */
export const typo = (s?: string) => (s ? (fixCzechTypography(s) as string) : '');

/** Lineární míchání dvou barev #rrggbb (t = 0 → a, t = 1 → b). */
export function mix(a: string, b: string, t: number) {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [ar, ag, ab] = p(a);
  const [br, bg, bb] = p(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, '0');
  return `#${c(ar, br)}${c(ag, bg)}${c(ab, bb)}`;
}

export const srOnly: CSSProperties = {
  position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden',
  clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0,
};

export const tlacitko = (aktivni = true): CSSProperties => ({
  fontFamily: FONT, fontSize: 16, fontWeight: 700, lineHeight: 1.2,
  padding: '9px 18px', minHeight: 44, borderRadius: 4, cursor: aktivni ? 'pointer' : 'default',
  border: `2px solid ${INK}`, background: aktivni ? INK : 'transparent', color: aktivni ? '#fff' : INK,
});

export const tlacitkoObrys: CSSProperties = {
  ...tlacitko(false), cursor: 'pointer', fontWeight: 400,
};

export function ChybiData({ co, dataFile }: { co: string; dataFile?: string }) {
  return <div className="text-red-500">{co}: data nenalezena ({dataFile ?? 'chybí dataFile'})</div>;
}

/**
 * Vodorovný pruh na společné škále: popisek nad pruhem, hodnota uvnitř pruhu (vejde-li se),
 * jinak hned za ním. `podil` = 0–1 šířky stopy. `obrys` = jen orámovaný pruh (čtenářův tip).
 */
export function Pruh({
  popisek, hodnota, podil, barva, obrys = false, znacka, animace = true,
}: {
  popisek: ReactNode; hodnota: string; podil: number; barva: string; obrys?: boolean;
  znacka?: { podil: number; barva: string; titulek: string } | null; animace?: boolean;
}) {
  // při prvním vykreslení pruh vyroste z nuly (jen s animací; posuvník kreslí bez ní)
  const [vyrostl, setVyrostl] = useState(!animace);
  useEffect(() => {
    if (vyrostl) return;
    const f = requestAnimationFrame(() => setVyrostl(true));
    return () => cancelAnimationFrame(f);
  }, [vyrostl]);
  const cil = Math.max(0, Math.min(1, podil)) * 100;
  const w = vyrostl ? cil : 0;
  const uvnitr = cil > 55;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontFamily: FONT, fontSize: 15, color: INK, marginBottom: 3, lineHeight: 1.25 }}>{popisek}</div>
      <div style={{ position: 'relative', height: 26 }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: `${w}%`,
          background: obrys ? 'repeating-linear-gradient(135deg, #fff 0 5px, #ecebe4 5px 10px)' : barva,
          border: obrys ? `2px solid ${INK}` : 'none', boxSizing: 'border-box', borderRadius: 2,
          transition: animace ? 'width 700ms cubic-bezier(.2,.7,.2,1)' : 'none',
          minWidth: obrys ? 3 : 0,
        }} />
        {znacka && (
          <div title={znacka.titulek} aria-hidden style={{
            position: 'absolute', top: -3, bottom: -3, width: 2, marginLeft: -1,
            left: `${Math.max(0, Math.min(1, znacka.podil)) * 100}%`, background: znacka.barva, opacity: 0.75,
          }} />
        )}
        <div style={{
          position: 'absolute', top: 0, bottom: 0, display: 'flex', alignItems: 'center', zIndex: 1,
          fontFamily: FONT, fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap',
          ...(uvnitr
            ? { right: `${100 - w}%`, paddingRight: 8, color: obrys ? INK : '#fff', opacity: vyrostl ? 1 : 0 }
            : { left: `${w}%`, marginLeft: 4, padding: '0 4px', color: INK, background: 'rgba(248,246,240,0.92)', height: 20, alignSelf: 'center', top: 3, bottom: 'auto' }),
          transition: animace ? 'left 700ms cubic-bezier(.2,.7,.2,1), right 700ms cubic-bezier(.2,.7,.2,1)' : 'none',
        }}>
          {hodnota}
        </div>
      </div>
    </div>
  );
}
