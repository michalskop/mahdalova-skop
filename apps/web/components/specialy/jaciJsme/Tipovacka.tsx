'use client';

// „Tipněte si, než to ukážeme“ – čtenář posuvníkem (nebo číslem) odhadne hodnotu, tlačítkem Ukázat
// odkryje skutečnost tehdy × dnes, krátké vysvětlení a zdroj. Tip zůstává vidět, nic se neukládá.
// Data = JSON ve složce článku (`dataFile`), načtený při stavbě webu (lib/articleData.ts →
// scope.jaciJsmeData). Formát: typ TipovackaData níže; vzor generátoru:
// analyza-2026-11-17-jaci-jsme-byli-jaci-jsme-1989-a-dnes/_data_pipeline/05_interaktivni.py.

import { useId, useState } from 'react';
import ChartCard from '@/components/charts/ChartCard';
import { ChybiData, DNES, FONT, FONT_PLEX, GRID, INK, MUTED, Pruh, TEHDY, num, sJednotkou, tlacitko, tlacitkoObrys, typo } from './spolecne';

export type TipovackaData = {
  title?: string;
  subtitle?: string;
  otazka: string;
  jednotka: string;          // dlouhá jednotka do vět („trestných činů“, „%“)
  min: number;
  max: number;
  krok?: number;
  vychozi?: number;          // kde posuvník začíná (např. hodnota tehdy)
  desetinna?: number;
  tehdy: { rok: number | string; hodnota: number; popisek?: string };
  dnes: { rok: number | string; hodnota: number; popisek?: string };
  vysvetleni?: string;
  zdroj?: string;            // [text](url); více zdrojů oddělit středníkem
};

export interface TipovackaProps {
  data?: TipovackaData;
  dataFile?: string;
  title?: string;
  subtitle?: string;
  source?: string;
}

export default function Tipovacka({ data, dataFile, title, subtitle, source }: TipovackaProps) {
  const id = useId();
  const start = data ? data.vychozi ?? Math.round((data.min + data.max) / 2) : 0;
  const [tip, setTip] = useState<number>(start);
  const [text, setText] = useState<string>(String(start));
  const [ukazano, setUkazano] = useState(false);

  if (!data) return <ChybiData co="Tipovacka" dataFile={dataFile} />;

  const d = data.desetinna ?? 0;
  const krok = data.krok ?? 1;
  const kratka = data.jednotka.length <= 2 ? data.jednotka : undefined; // %, ‰ k číslům v pruzích
  const strop = Math.max(data.max, data.tehdy.hodnota, data.dnes.hodnota);
  const nastav = (v: number) => {
    const c = Math.min(data.max, Math.max(data.min, v));
    setTip(c);
    setText(String(c).replace('.', ','));
  };

  const skutecne = data.dnes.hodnota;
  const odchylka = tip - skutecne;
  const rel = skutecne !== 0 ? Math.abs(odchylka) / Math.abs(skutecne) : 0;
  const hodnoceni = rel <= 0.05
    ? 'Trefa! Váš tip se od skutečnosti liší nejvýš o 5 %.'
    : `Váš tip byl o ${sJednotkou(Math.abs(odchylka), d, kratka)} ${odchylka > 0 ? 'vyšší' : 'nižší'} než skutečnost (o ${sJednotkou(rel * 100, 0, '%')}).`;

  return (
    <ChartCard title={title ?? data.title} subtitle={subtitle ?? data.subtitle} source={source ?? data.zdroj}>
      <div style={{ fontFamily: FONT, color: INK }}>
        <p id={`${id}-q`} style={{ fontFamily: FONT_PLEX, fontSize: 18, fontWeight: 600, lineHeight: 1.35, margin: '0 0 14px' }}>
          {typo(data.otazka)}
        </p>

        <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px 10px', marginBottom: 6 }}>
          <span style={{ fontSize: 15, color: MUTED }}>Váš tip:</span>
          <span style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.1 }}>{num(tip, d)}</span>
          <span style={{ fontSize: 16 }}>{data.jednotka}</span>
        </div>

        <input
          type="range"
          min={data.min}
          max={data.max}
          step={krok}
          value={tip}
          disabled={ukazano}
          aria-labelledby={`${id}-q`}
          aria-valuetext={sJednotkou(tip, d, data.jednotka)}
          onChange={(e) => nastav(Number(e.target.value))}
          style={{ width: '100%', height: 32, accentColor: DNES, cursor: ukazano ? 'default' : 'pointer', margin: '4px 0 0' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: MUTED, marginBottom: 12 }}>
          <span>{num(data.min, d)}</span>
          <span>{num(data.max, d)}</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 15 }}>
            nebo napište číslo:
            <input
              type="text"
              inputMode="decimal"
              value={text}
              disabled={ukazano}
              onChange={(e) => {
                setText(e.target.value);
                const v = Number(e.target.value.replace(/\s/g, '').replace(',', '.'));
                if (Number.isFinite(v) && e.target.value.trim() !== '') setTip(Math.min(data.max, Math.max(data.min, v)));
              }}
              onBlur={() => nastav(tip)}
              style={{ width: 110, fontFamily: FONT, fontSize: 16, padding: '7px 8px', border: `1px solid ${GRID}`, borderRadius: 4, background: '#fff', color: INK }}
            />
          </label>
          {!ukazano ? (
            <button type="button" onClick={() => setUkazano(true)} style={tlacitko()}>Ukázat</button>
          ) : (
            <button type="button" onClick={() => { setUkazano(false); nastav(start); }} style={tlacitkoObrys}>Zkusit znovu</button>
          )}
        </div>

        <div aria-live="polite">
          {ukazano && (
            <div style={{ marginTop: 16 }}>
              <Pruh
                popisek={<><strong style={{ color: TEHDY }}>{data.tehdy.popisek ?? `Rok ${data.tehdy.rok}`}</strong></>}
                hodnota={sJednotkou(data.tehdy.hodnota, d, kratka)}
                podil={data.tehdy.hodnota / strop}
                barva={TEHDY}
              />
              <Pruh
                popisek={<strong>Váš tip</strong>}
                hodnota={sJednotkou(tip, d, kratka)}
                podil={tip / strop}
                barva={INK}
                obrys
              />
              <Pruh
                popisek={<><strong style={{ color: DNES }}>{data.dnes.popisek ?? `Rok ${data.dnes.rok}`}</strong></>}
                hodnota={sJednotkou(skutecne, d, kratka)}
                podil={skutecne / strop}
                barva={DNES}
              />
              <p style={{ fontFamily: FONT_PLEX, fontSize: 16, fontWeight: 600, lineHeight: 1.4, margin: '14px 0 6px' }}>{typo(hodnoceni)}</p>
              {data.vysvetleni && <p style={{ fontFamily: FONT_PLEX, fontSize: 16, lineHeight: 1.5, margin: 0 }}>{typo(data.vysvetleni)}</p>}
            </div>
          )}
        </div>
      </div>
    </ChartCard>
  );
}
