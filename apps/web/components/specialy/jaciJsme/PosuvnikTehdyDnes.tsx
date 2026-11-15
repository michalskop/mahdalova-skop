'use client';

// Posuvník mezi dvěma stavy pruhového grafu (1989 × dnes): při tažení se pruhy plynule přelijí
// z hodnot tehdy na dnešní, barva přechází z šedomodré (tehdy) do karmínové (dnes), velký rok
// ukazuje, ke kterému stavu má graf blíž. Tlačítka 1989 / dnes stav přehrají animací.
// Data = JSON ve složce článku (`dataFile`), scope.jaciJsmeData (lib/articleData.ts).
// Formát: typ PosuvnikData níže; vzor: …-1989-a-dnes/_data_pipeline/05_interaktivni.py.

import { useEffect, useId, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import ChartCard from '@/components/charts/ChartCard';
import { ChybiData, DNES, FONT, FONT_PLEX, INK, MUTED, Pruh, TEHDY, mix, num, sJednotkou, srOnly, typo } from './spolecne';

export type PosuvnikPolozka = {
  nazev: string;
  tehdy: number;
  dnes: number;
  rok_tehdy?: number | string; // jen když se liší od popisek_tehdy (např. sčítání 1991)
  rok_dnes?: number | string;
  pozn?: string;
};

export type PosuvnikData = {
  title?: string;
  subtitle?: string;
  jednotka?: string;          // „%“, „roku“…
  max?: number;               // pevný konec škály (u podílů 100); jinak 110 % maxima
  desetinna?: number;
  popisek_tehdy?: string;     // „1989“
  popisek_dnes?: string;      // „2025“ / „dnes“
  polozky: PosuvnikPolozka[];
  zdroj?: string;
};

export interface PosuvnikTehdyDnesProps {
  data?: PosuvnikData;
  dataFile?: string;
  title?: string;
  subtitle?: string;
  source?: string;
}

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export default function PosuvnikTehdyDnes({ data, dataFile, title, subtitle, source }: PosuvnikTehdyDnesProps) {
  const id = useId();
  const [t, setT] = useState(0); // 0 = tehdy, 1 = dnes
  const anim = useRef<number | null>(null);
  useEffect(() => () => { if (anim.current) cancelAnimationFrame(anim.current); }, []);

  if (!data) return <ChybiData co="PosuvnikTehdyDnes" dataFile={dataFile} />;

  const d = data.desetinna ?? 1;
  const pT = data.popisek_tehdy ?? 'tehdy';
  const pD = data.popisek_dnes ?? 'dnes';
  const strop = data.max ?? Math.max(...data.polozky.flatMap((p) => [p.tehdy, p.dnes])) * 1.1;
  const barva = mix(TEHDY, DNES, t);

  const prehraj = (cil: number) => {
    if (anim.current) cancelAnimationFrame(anim.current);
    const odkud = t;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setT(cil);
      return;
    }
    const dur = 900 * Math.abs(cil - odkud) || 1;
    const t0 = performance.now();
    const krok = (now: number) => {
      const x = Math.min(1, (now - t0) / dur);
      setT(odkud + (cil - odkud) * ease(x));
      if (x < 1) anim.current = requestAnimationFrame(krok);
    };
    anim.current = requestAnimationFrame(krok);
  };

  const stav = t < 0.02 ? pT : t > 0.98 ? pD : `mezi ${pT} a ${pD}`;
  const roky = (p: PosuvnikPolozka) =>
    (p.rok_tehdy !== undefined && String(p.rok_tehdy) !== pT) || (p.rok_dnes !== undefined && String(p.rok_dnes) !== pD)
      ? ` (${p.rok_tehdy ?? pT} → ${p.rok_dnes ?? pD})`
      : '';

  const tlac = (aktivni: boolean): CSSProperties => ({
    fontFamily: FONT, fontSize: 15, fontWeight: 700, minHeight: 40, padding: '6px 14px', borderRadius: 4,
    cursor: 'pointer', border: `2px solid ${aktivni ? INK : '#c9c9bd'}`, background: aktivni ? '#d4d4c8' : 'transparent', color: INK,
  });

  return (
    <ChartCard title={title ?? data.title} subtitle={subtitle ?? data.subtitle} source={source ?? data.zdroj}>
      <div style={{ fontFamily: FONT, color: INK }}>
        {/* Velký rok: prolnutí popisku tehdy a dnes */}
        <div aria-hidden style={{ position: 'relative', height: 58, fontFamily: FONT_PLEX, fontWeight: 700, fontSize: 52, lineHeight: '58px' }}>
          <span style={{ position: 'absolute', left: 0, top: 0, color: TEHDY, opacity: 1 - t }}>{pT}</span>
          <span style={{ position: 'absolute', left: 0, top: 0, color: DNES, opacity: t }}>{pD}</span>
        </div>

        {/* Ovládání */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '6px 0 16px' }}>
          <button type="button" onClick={() => prehraj(0)} style={tlac(t < 0.5)} aria-label={`Ukázat stav ${pT}`}>{pT}</button>
          <input
            type="range"
            min={0}
            max={1000}
            step={1}
            value={Math.round(t * 1000)}
            aria-label={`Posunout graf mezi ${pT} a ${pD}`}
            aria-valuetext={stav}
            onChange={(e) => { if (anim.current) cancelAnimationFrame(anim.current); setT(Number(e.target.value) / 1000); }}
            style={{ flex: '1 1 auto', minWidth: 0, height: 32, accentColor: barva, cursor: 'pointer' }}
          />
          <button type="button" onClick={() => prehraj(1)} style={tlac(t >= 0.5)} aria-label={`Ukázat stav ${pD}`}>{pD}</button>
        </div>

        {/* Pruhy */}
        <div aria-hidden>
          {data.polozky.map((p, i) => {
            const v = p.tehdy + (p.dnes - p.tehdy) * t;
            return (
              <Pruh
                key={i}
                animace={false}
                popisek={<>{typo(p.nazev)}<span style={{ color: MUTED, fontSize: 13.5 }}>{roky(p)}</span></>}
                hodnota={sJednotkou(v, d, data.jednotka)}
                podil={v / strop}
                barva={barva}
                znacka={t > 0.04 ? { podil: p.tehdy / strop, barva: TEHDY, titulek: `${pT}: ${sJednotkou(p.tehdy, d, data.jednotka)}` } : null}
              />
            );
          })}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: MUTED, marginTop: 4, visibility: t > 0.04 ? 'visible' : 'hidden' }}>
            <span style={{ width: 2, height: 14, background: TEHDY, opacity: 0.75, display: 'inline-block' }} />
            svislá čárka = hodnota {pT}
          </div>
          {data.polozky.some((p) => p.pozn) && (
            <div style={{ fontSize: 13.5, color: MUTED, marginTop: 4 }}>
              {data.polozky.filter((p) => p.pozn).map((p) => `${p.nazev}: ${p.pozn}`).join(' · ')}
            </div>
          )}
        </div>

        {/* Pro čtečky obrazovky celá tabulka najednou */}
        <div style={srOnly}><table>
          <caption>{title ?? data.title}</caption>
          <thead><tr><th scope="col">Ukazatel</th><th scope="col">{pT}</th><th scope="col">{pD}</th></tr></thead>
          <tbody>
            {data.polozky.map((p, i) => (
              <tr key={i}>
                <th scope="row">{p.nazev}{roky(p)}</th>
                <td>{sJednotkou(p.tehdy, d, data.jednotka)}</td>
                <td>{sJednotkou(p.dnes, d, data.jednotka)}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
        <span id={`${id}-stav`} style={srOnly} aria-live="polite">{stav === pT || stav === pD ? `Graf ukazuje ${stav}.` : ''}</span>
      </div>
    </ChartCard>
  );
}
