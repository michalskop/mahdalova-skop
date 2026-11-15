'use client';

// „Česko od vašeho narození“: čtenář zadá rok narození (např. 1920–2025) a dostane sadu ukazatelů
// „v roce vašeho narození × dnes“. Pro rok před začátkem řady bere první rok řady a řekne to,
// pro rok po jejím konci poslední. Každá dlaždice má mini průběh celé řady se dvěma značkami.
// Data = JSON ve složce článku (`dataFile`), scope.jaciJsmeData (lib/articleData.ts).
// Formát: typ OdNarozeniData níže; vzor: …-1989-a-dnes/_data_pipeline/05_interaktivni.py.

import { useEffect, useId, useMemo, useState } from 'react';
import ChartCard from '@/components/charts/ChartCard';
import { ChybiData, DNES, EDGE, FONT, FONT_PLEX, GRID, INK, MUTED, TEHDY, num, sJednotkou, typo } from './spolecne';

export type OdNarozeniUkazatel = {
  nazev: string;
  jednotka?: string;               // „roku“, „%“, „Kčs/Kč“ (Kčs do 1992, pak Kč), prázdné = počet
  desetinna?: number;
  porovnani?: 'rozdil' | 'pomer';  // rozdíl (+9,4 roku, u % v p. b.) nebo poměr (1,9krát víc)
  jednotka_rozdil?: string;        // přepíše jednotku rozdílu (u % výchozí „p. b.“)
  rada: Record<string, number>;    // { "1989": 68.14, … }
  zdroj?: string;
  pozn?: string;
};

// Volitelná sekce „Lidé ve vašem věku tehdy × dnes“: stejně staří lidé při sčítání 1991 × 2021
// (podle dnešního věku čtenáře). Data: …-1989-a-dnes/_data_pipeline/06_stejne_stari.py.
export type PodleVekuSkupina = {
  od: number;
  do: number;
  nazev: string;                   // „Třicátníci“
  ukazatele: { nazev: string; tehdy: number; dnes: number; pozn?: string }[]; // podíly v %
};

export type PodleVeku = {
  title?: string;
  rok_tehdy: number;               // 1991
  rok_dnes: number;                // 2021
  skupiny: PodleVekuSkupina[];
  pozn?: string;
  zdroj?: string;
};

export type OdNarozeniData = {
  title?: string;
  podle_veku?: PodleVeku;
  subtitle?: string;
  rok_min?: number;
  rok_max?: number;
  vychozi?: number;
  ukazatele: OdNarozeniUkazatel[];
  zdroj?: string;
};

export interface OdNarozeniProps {
  data?: OdNarozeniData;
  dataFile?: string;
  title?: string;
  subtitle?: string;
  source?: string;
}

function jednotkaProRok(j: string | undefined, rok: number) {
  if (j === 'Kčs/Kč') return rok <= 1992 ? 'Kčs' : 'Kč';
  return j;
}

function zmena(u: OdNarozeniUkazatel, a: number, b: number) {
  const d = u.desetinna ?? 0;
  if ((u.porovnani ?? 'rozdil') === 'pomer') {
    if (a === 0) return '–';
    const r = b / a;
    if (Math.abs(r - 1) < 0.005) return 'beze změny';
    if (r >= 1) return `${num(r, r < 10 ? 1 : 0)}krát víc`;
    return `o ${sJednotkou((1 - r) * 100, 0, '%')} méně`;
  }
  const rozdil = b - a;
  const j = u.jednotka_rozdil ?? (u.jednotka === '%' ? 'p. b.' : u.jednotka);
  if (Math.abs(rozdil) < Math.pow(10, -d) / 2) return 'beze změny';
  return `${rozdil > 0 ? '+' : ''}${sJednotkou(rozdil, d, j)}`;
}

function uplynulo(n: number) {
  if (n === 1) return 'uplynul 1 rok';
  if (n < 5) return `uplynuly ${n} roky`;
  return `uplynulo ${num(n)} let`;
}

function Prubeh({ body, rokA, rokB }: { body: [number, number][]; rokA: number; rokB: number }) {
  if (body.length < 2) return null;
  const x0 = body[0][0], x1 = body[body.length - 1][0];
  const ys = body.map((b) => b[1]);
  const y0 = Math.min(...ys), y1 = Math.max(...ys);
  const X = (x: number) => ((x - x0) / (x1 - x0 || 1)) * 100;
  const Y = (y: number) => 32 - ((y - y0) / (y1 - y0 || 1)) * 28;
  return (
    <div aria-hidden style={{ marginTop: 8 }}>
      <svg viewBox="0 0 100 34" preserveAspectRatio="none" width="100%" height="34" style={{ display: 'block', overflow: 'visible' }}>
        <polyline points={body.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')} fill="none" stroke="#9a9cc4" strokeWidth={1.6} vectorEffect="non-scaling-stroke" />
        <line x1={X(rokA)} x2={X(rokA)} y1={0} y2={34} stroke={TEHDY} strokeWidth={2.4} vectorEffect="non-scaling-stroke" />
        <line x1={X(rokB)} x2={X(rokB)} y1={0} y2={34} stroke={DNES} strokeWidth={2.4} vectorEffect="non-scaling-stroke" />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: MUTED, marginTop: 2 }}>
        <span>{x0}</span><span>{x1}</span>
      </div>
    </div>
  );
}

function rokyVeku(n: number) {
  if (n === 1) return 'rok';
  if (n >= 2 && n <= 4) return 'roky';
  return 'let';
}

function VekovyPruh({ rok, hodnota, barva }: { rok: number; hodnota: number; barva: string }) {
  const w = Math.max(0, Math.min(100, hodnota));
  const uvnitr = w > 55;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
      <span style={{ width: 36, flex: '0 0 auto', fontSize: 13, fontWeight: 700, color: barva }}>{rok}</span>
      <div style={{ position: 'relative', flex: '1 1 auto', height: 20 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${w}%`, background: barva, borderRadius: 2 }} />
        <span style={{
          position: 'absolute', top: 0, bottom: 0, display: 'flex', alignItems: 'center', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap',
          ...(uvnitr ? { right: `${100 - w}%`, paddingRight: 6, color: '#fff' } : { left: `${w}%`, paddingLeft: 5, color: INK }),
        }}>
          {sJednotkou(hodnota, 1, '%')}
        </span>
      </div>
    </div>
  );
}

function StejneStari({ pv, rok, letos }: { pv: PodleVeku; rok: number; letos: number }) {
  const vek = letos - rok;
  const sk = pv.skupiny.find((g) => vek >= g.od && vek <= g.do);
  const od = Math.min(...pv.skupiny.map((g) => g.od));
  const doV = Math.max(...pv.skupiny.map((g) => g.do));
  return (
    <section style={{ marginTop: 22, paddingTop: 14, borderTop: `1px solid ${EDGE}` }}>
      <div style={{ fontFamily: FONT_PLEX, fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{typo(pv.title ?? 'Lidé ve vašem věku tehdy × dnes')}</div>
      <div style={{ fontFamily: FONT_PLEX, fontSize: 16, lineHeight: 1.45, marginBottom: 10 }}>
        {vek < 0 ? null : sk
          ? typo(`Letos je vám nebo bude ${vek} ${rokyVeku(vek)}. Srovnáváme lidi ve věku ${sk.od}–${sk.do} let při sčítání ${pv.rok_tehdy} a ${pv.rok_dnes}, takže výsledek neovlivní, že Česko mezitím zestárlo.`)
          : typo(`Letos je vám nebo bude ${vek} ${rokyVeku(vek)}. Srovnání stejně starých lidí ze sčítání ${pv.rok_tehdy} a ${pv.rok_dnes} máme pro věk ${od}–${doV} let.`)}
      </div>
      {sk && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 230px), 1fr))', gap: 10 }}>
            {sk.ukazatele.map((u, i) => {
              const rozdil = u.dnes - u.tehdy;
              return (
                <div key={i} style={{ background: '#fff', border: `1px solid ${EDGE}`, borderRadius: 6, padding: '10px 12px 8px', minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
                    <span style={{ fontSize: 15.5, fontWeight: 700, lineHeight: 1.25 }}>{typo(u.nazev)}</span>
                    <span style={{ fontSize: 14, whiteSpace: 'nowrap' }}>
                      {Math.abs(rozdil) < 0.05 ? 'beze změny' : `${rozdil > 0 ? '+' : ''}${sJednotkou(rozdil, 1, 'p. b.')}`}
                    </span>
                  </div>
                  <VekovyPruh rok={pv.rok_tehdy} hodnota={u.tehdy} barva={TEHDY} />
                  <VekovyPruh rok={pv.rok_dnes} hodnota={u.dnes} barva={DNES} />
                  {u.pozn && <div style={{ fontSize: 12.5, color: MUTED, marginTop: 4 }}>{typo(u.pozn)}</div>}
                </div>
              );
            })}
          </div>
          {pv.pozn && <div style={{ fontSize: 12.5, color: MUTED, marginTop: 8, lineHeight: 1.35 }}>{typo(pv.pozn)}</div>}
        </>
      )}
    </section>
  );
}

export default function OdNarozeni({ data, dataFile, title, subtitle, source }: OdNarozeniProps) {
  const id = useId();
  const rokMin = data?.rok_min ?? 1920;
  const rokMax = data?.rok_max ?? 2025;
  const [text, setText] = useState<string>(data?.vychozi ? String(data.vychozi) : '');
  const [letos, setLetos] = useState<number | null>(null);
  useEffect(() => setLetos(new Date().getFullYear()), []); // až v prohlížeči – statický export se tak nerozejde

  const rady = useMemo(() => (data?.ukazatele ?? []).map((u) => {
    const body = Object.entries(u.rada).map(([r, v]) => [Number(r), v] as [number, number]).sort((a, b) => a[0] - b[0]);
    return { u, body, prvni: body[0]?.[0], posledni: body[body.length - 1]?.[0] };
  }), [data]);

  if (!data) return <ChybiData co="OdNarozeni" dataFile={dataFile} />;

  const rok = /^\d{4}$/.test(text.trim()) ? Number(text.trim()) : null;
  const platny = rok !== null && rok >= rokMin && rok <= rokMax;
  const chyba = text.trim() !== '' && !platny;
  const nejdrivePrvni = Math.min(...rady.map((r) => r.prvni));
  const nejpozdejiPrvni = Math.max(...rady.map((r) => r.prvni));

  const najdi = (body: [number, number][], r: number) => {
    const c = Math.min(body[body.length - 1][0], Math.max(body[0][0], r));
    return body.find((b) => b[0] === c) ?? body.reduce((a, b) => (Math.abs(b[0] - c) < Math.abs(a[0] - c) ? b : a));
  };

  return (
    <ChartCard title={title ?? data.title} subtitle={subtitle ?? data.subtitle} source={source ?? data.zdroj}>
      <div style={{ fontFamily: FONT, color: INK }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 12px', marginBottom: 6 }}>
          <label htmlFor={`${id}-rok`} style={{ fontFamily: FONT_PLEX, fontSize: 18, fontWeight: 600 }}>Rok vašeho narození:</label>
          <input
            id={`${id}-rok`}
            type="number"
            inputMode="numeric"
            min={rokMin}
            max={rokMax}
            step={1}
            value={text}
            placeholder={String(data.vychozi ?? 1989)}
            aria-invalid={chyba}
            aria-describedby={`${id}-pozn`}
            onChange={(e) => setText(e.target.value)}
            style={{ width: 110, fontFamily: FONT, fontSize: 22, fontWeight: 700, padding: '6px 10px', border: `1px solid ${chyba ? DNES : GRID}`, borderRadius: 4, background: '#fff', color: INK }}
          />
        </div>
        <input
          type="range"
          min={rokMin}
          max={rokMax}
          step={1}
          value={platny ? (rok as number) : (data.vychozi ?? 1989)}
          aria-label="Rok narození"
          onChange={(e) => setText(e.target.value)}
          style={{ width: '100%', height: 32, accentColor: TEHDY, cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: MUTED }}>
          <span>{rokMin}</span><span>{rokMax}</span>
        </div>

        <div id={`${id}-pozn`} aria-live="polite" style={{ fontFamily: FONT_PLEX, fontSize: 16, lineHeight: 1.45, margin: '12px 0 14px', minHeight: 23 }}>
          {chyba && <span style={{ color: DNES, fontWeight: 600 }}>Zadejte rok mezi {rokMin} a {rokMax}.</span>}
          {platny && (
            <>
              <strong>Narodili jste se v roce {rok}</strong>
              {letos !== null && letos > (rok as number) ? `, od té doby ${uplynulo(letos - (rok as number))}` : ''}
              .
              {(rok as number) < nejpozdejiPrvni && (
                <> {typo(nejdrivePrvni === nejpozdejiPrvni
                  ? `Údaje začínají až v roce ${nejdrivePrvni}, proto místo roku ${rok} ukazujeme rok ${nejdrivePrvni}.`
                  : `Údaje začínají až v letech ${nejdrivePrvni}–${nejpozdejiPrvni}, proto u každého ukazatele ukazujeme jeho nejstarší rok.`)}</>
              )}
            </>
          )}
        </div>

        {platny && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 230px), 1fr))', gap: 10 }}>
            {rady.filter((r) => r.body.length).map(({ u, body }, i) => {
              const [rA, vA] = najdi(body, rok as number);
              const [rB, vB] = body[body.length - 1];
              const d = u.desetinna ?? 0;
              const posun = rA !== rok;
              return (
                <div key={i} style={{ background: '#fff', border: `1px solid ${EDGE}`, borderRadius: 6, padding: '10px 12px 8px', minWidth: 0 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 700, lineHeight: 1.25, marginBottom: 6 }}>{typo(u.nazev)}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, color: TEHDY, fontWeight: 700 }}>{!posun ? `${rA}, váš rok` : rA > (rok as number) ? `${rA}, nejstarší údaj` : `${rA}, nejnovější údaj`}</div>
                      <div style={{ fontSize: 21, fontWeight: 700, color: TEHDY, lineHeight: 1.2 }}>{sJednotkou(vA, d, jednotkaProRok(u.jednotka, rA))}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: DNES, fontWeight: 700 }}>{rB}, dnes</div>
                      <div style={{ fontSize: 21, fontWeight: 700, color: DNES, lineHeight: 1.2 }}>{sJednotkou(vB, d, jednotkaProRok(u.jednotka, rB))}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 14.5, marginTop: 4 }}>Změna: <strong>{zmena(u, vA, vB)}</strong></div>
                  <Prubeh body={body} rokA={rA} rokB={rB} />
                  {(u.pozn || u.zdroj) && (
                    <div style={{ fontSize: 12.5, color: MUTED, marginTop: 4, lineHeight: 1.35 }}>
                      {typo([u.pozn, u.zdroj].filter(Boolean).join(' · '))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {platny && letos !== null && data.podle_veku && <StejneStari pv={data.podle_veku} rok={rok as number} letos={letos} />}
      </div>
    </ChartCard>
  );
}
