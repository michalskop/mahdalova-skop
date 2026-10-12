'use client';

// Průběh predikce během sčítání (karta města v ObceKvPredikceMapa).
// Data: prubeh_kv.json (prubeh_predikce.py) – stav modelu po každé dávce ČSÚ, podíly v promile.
// Plná čára = predikce konečného podílu, tmavší pás = 90% interval, světlejší = 99% interval, tečkovaně = konečný výsledek,
// volitelně čárkovaně = průběžně sečtený podíl. Zelené čáry = milníky „víme“ (m), tmavá čára = vybraný okamžik;
// okamžik se vybírá tažením svislé čáry (úchyt na ose x, čas nahoře) nebo klikem v grafu (onIdx); pruhy pod grafem se přepočítají.
// Klikací legenda nad grafem zapíná a vypíná kandidátky a průběžné sčítání.

import { useState } from 'react';

export type PrubehList = { a: string; strana?: string; v: number; s: number | null; c?: string | null; e: number[]; lo: number[]; hi: number[]; lo99: number[]; hi99: number[]; n0: number[]; ms: number[] };
export type MilnikKey = 'vitez' | 'slozeni' | 'poradi' | 'mandaty' | 'postup' | 'kolo1';  // poslední dva = Senát
export type Milnik = { i: number; ok: boolean; p: number; a?: string; d?: string };
export type PrubehZ = { t: number[]; f: number[]; nc: number[]; nt: number; konec: number; l: PrubehList[]; m: Partial<Record<MilnikKey, Milnik>> };

export const MILNIKY: Record<MilnikKey, string> = { vitez: 'vítěz', slozeni: 'složení zastupitelstva', poradi: 'pořadí stran', mandaty: 'počty mandátů', postup: 'postupující do 2. kola', kolo1: 'vítěz v 1. kole' };
const KRATCE: Record<MilnikKey, string> = { vitez: 'vítěz', slozeni: 'složení', poradi: 'pořadí', mandaty: 'mandáty', postup: 'postup do 2. kola', kolo1: 'vítěz 1. kola' };

const INK = '#101432';
const MUTED = '#4c4f8e';
const OK = '#2e9e5b';
const BAD = '#c77700';  // nesplněné tvrzení – oranžově, většinou šlo o těsný rozdíl

export const hhmm = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
export const trvani = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h ${m % 60 ? `${m % 60} min` : ''}`.trim() : `${m} min`);

// stav (index dávky) platný v čase m: poslední dávka, která do té doby přišla
export const stavV = (z: PrubehZ, m: number) => { let i = 0; while (i + 1 < z.t.length && z.t[i + 1] <= m) i++; return i; };

export default function PrubehPredikceGraf({ z, width, cas, onCas }: { z: PrubehZ; width: number; cas: number; onCas: (m: number) => void }) {
  const [sectene, setSectene] = useState(false);
  const [hov, setHov] = useState<number | null>(null);
  const [tah, setTah] = useState(false);
  const [skryte, setSkryte] = useState<Record<string, boolean>>({});
  if (!width || !z.t.length) return null;
  const narrow = width < 560;
  const W = width, H = narrow ? 280 : 350, L = 34, R = narrow ? 8 : 118, B = 40;
  const ms = (Object.keys(MILNIKY) as MilnikKey[]).filter((k) => z.m[k]).sort((a, b) => z.m[a]!.i - z.m[b]!.i);
  const T = 18 + 12 * ms.length;
  const leg = z.l.map((l, j) => j).slice(0, 10);                                   // v legendě
  const big = leg.filter((j) => !(skryte[j] ?? z.l[j].v < 50));                     // zobrazené (výchozí: výsledek ≥ 5 %)
  const x0 = z.t[0], x1 = Math.max(z.konec, x0 + 30);
  const yMax = Math.min(1000, Math.max(50, ...big.flatMap((j) => [...z.l[j].hi99, z.l[j].v, ...(sectene ? z.l[j].n0 : [])])) * 1.05);
  const X = (m: number) => L + ((m - x0) / (x1 - x0)) * (W - L - R);
  const Y = (v: number) => T + (1 - v / yMax) * (H - T - B);
  const end = (i: number) => (i + 1 < z.t.length ? z.t[i + 1] : x1);
  const step = (arr: number[]) => arr.map((v, i) => `${X(z.t[i])},${Y(v)} ${X(end(i))},${Y(v)}`).join(' ');
  const band = (hi: number[], lo: number[]) => step(hi) + ' ' + step(lo).split(' ').reverse().join(' ');
  const krok = yMax > 400 ? 100 : 50;
  const hod = [30, 60, 120, 180, 240].find((h) => ((W - L - R) * h) / (x1 - x0) >= 46) ?? 360;  // popisky času aspoň 46 px od sebe
  // čas (minuty) v daném místě grafu – plynule, nezávisle na dávkách
  const casV = (clientX: number, el: Element) => {
    const px = Math.min(W - R, Math.max(L, clientX - el.getBoundingClientRect().left));
    return Math.round(x0 + ((px - L) / (W - L - R)) * (x1 - x0));
  };

  const labs = big.map((j) => ({ j, y: Y(z.l[j].v) })).sort((a, b) => a.y - b.y);
  for (let i = 1; i < labs.length; i++) if (labs[i].y - labs[i - 1].y < 13) labs[i].y = labs[i - 1].y + 13;
  const xi = X(Math.min(x1, Math.max(x0, cas)));
  const bx = Math.min(Math.max(L, xi - 22), W - R - 44);

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 6px', marginBottom: 6 }}>
        {leg.map((j) => {
          const on = !(skryte[j] ?? z.l[j].v < 50); const c = z.l[j].c ?? '#999';
          return (
            <button key={j} type="button" onClick={() => setSkryte({ ...skryte, [j]: on })}
              style={{ fontFamily: 'inherit', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 5, border: '1px solid #e2dfd4', background: '#fff', borderRadius: 12, padding: '1px 9px', cursor: 'pointer', color: on ? INK : '#9a988f' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: on ? c : 'transparent', border: `1.5px solid ${c}` }} />{z.l[j].a}
            </button>
          );
        })}
        <button type="button" onClick={() => setSectene(!sectene)}
          style={{ fontFamily: 'inherit', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 5, border: '1px solid #e2dfd4', background: '#fff', borderRadius: 12, padding: '1px 9px', cursor: 'pointer', color: sectene ? INK : '#9a988f' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, border: `1.5px solid ${sectene ? INK : '#b5b2a6'}`, background: sectene ? INK : 'transparent' }} />sčítání
        </button>
      </div>
      <svg width={W} height={H} role="img" aria-label="Průběh predikce během sčítání" style={{ display: 'block', cursor: 'ew-resize', touchAction: 'pan-y', userSelect: 'none', WebkitUserSelect: 'none' }}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setTah(true); onCas(casV(e.clientX, e.currentTarget)); }}
        onPointerMove={(e) => { const m = casV(e.clientX, e.currentTarget); if (tah) { if (m !== cas) onCas(m); } else setHov(m); }}
        onPointerUp={() => setTah(false)} onPointerCancel={() => setTah(false)} onPointerLeave={() => setHov(null)}>
        {Array.from({ length: Math.floor(yMax / krok) + 1 }, (_, i) => i * krok).map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} stroke="#efece4" />
            <text x={L - 5} y={Y(v) + 4} fontSize={11} textAnchor="end" fill={MUTED}>{v / 10} %</text>
          </g>
        ))}
        {Array.from({ length: 40 }, (_, i) => Math.ceil(x0 / hod) * hod + i * hod).filter((m) => m <= x1).map((m) => (
          <text key={m} x={X(m)} y={H - B + 30} fontSize={11} textAnchor="middle" fill={MUTED}>{hhmm(m)}</text>
        ))}
        {big.map((j) => {
          const l = z.l[j]; const c = l.c ?? '#999';
          return (
            <g key={j} pointerEvents="none">
              <polygon points={band(l.hi99, l.lo99)} fill={c} opacity={0.08} />
              <polygon points={band(l.hi, l.lo)} fill={c} opacity={0.16} />
              {sectene && <polyline points={step(l.n0)} fill="none" stroke={c} strokeWidth={1.1} strokeDasharray="4 3" opacity={0.8} />}
              <polyline points={step(l.e)} fill="none" stroke={c} strokeWidth={2} />
              <line x1={L} x2={W - R} y1={Y(l.v)} y2={Y(l.v)} stroke={c} strokeWidth={1.2} strokeDasharray="1.5 3.5" />
            </g>
          );
        })}
        {!narrow && labs.map(({ j, y }) => (
          <text key={j} x={W - R + 6} y={y + 4} fontSize={11.5} fontWeight={700} fill={z.l[j].c ?? MUTED}>
            {z.l[j].a.length > 13 ? z.l[j].a.slice(0, 12) + '…' : z.l[j].a} {(z.l[j].v / 10).toFixed(1).replace('.', ',')} %
          </text>
        ))}
        <g pointerEvents="none">
          <line x1={X(z.konec)} x2={X(z.konec)} y1={T} y2={H - B} stroke="#a9a698" strokeWidth={1.5} />
          <text x={X(z.konec) - 4} y={T - 4} fontSize={11} textAnchor="end" fill="#8a877a">konec sčítání {hhmm(z.konec)}</text>
          {ms.map((k, n) => {
            const mm = z.m[k]!; const x = X(z.t[mm.i]); const col = mm.ok ? OK : BAD; const y = 12 + 12 * n;
            const right = x > W - R - 100;
            return (
              <g key={k}>
                <line x1={x} x2={x} y1={y + 2} y2={H - B} stroke={col} strokeWidth={1.4} strokeDasharray="4 3" />
                <text x={right ? x - 4 : x + 4} y={y + 4} fontSize={11} fontWeight={700} fill={col} textAnchor={right ? 'end' : 'start'}>{KRATCE[k]} {hhmm(z.t[mm.i])}</text>
              </g>
            );
          })}
          {hov != null && !tah && Math.abs(hov - cas) > 2 && <line x1={X(hov)} x2={X(hov)} y1={T} y2={H - B} stroke={INK} strokeWidth={1} opacity={0.3} />}
          <line x1={L} x2={W - R} y1={H - B} y2={H - B} stroke="#cfccc0" />
          <line x1={xi} x2={xi} y1={T} y2={H - B} stroke={INK} strokeWidth={2} />
          {/* čas nahoře na čáře, úchyt se šipkami dole na ose */}
          <rect x={bx} y={T - 1} width={44} height={17} rx={3} fill={INK} />
          <text x={bx + 22} y={T + 11} fontSize={11.5} fontWeight={700} textAnchor="middle" fill="#fff">{hhmm(Math.round(cas))}</text>
          <circle cx={xi} cy={H - B} r={11} fill={INK} stroke="#fff" strokeWidth={2} />
          <path d={`M${xi - 2.5} ${H - B - 4.5} l-4.5 4.5 4.5 4.5 M${xi + 2.5} ${H - B - 4.5} l4.5 4.5 -4.5 4.5`} stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

// Pruhy pro vybraný okamžik: horní = sčítání (podíl z dosud sečtených okrsků), spodní = predikce s 90% intervalem,
// černá ryska = konečný výsledek. Pod pruhy: od kdy byla predikce a od kdy samo sčítání trvale do 1 p. b. od výsledku.
export function PrubehPruhy({ z, idx, nazvy }: { z: PrubehZ; idx: number; nazvy: Record<string, string> }) {
  const pc = (v: number) => `${(v / 10).toFixed(1).replace('.', ',')} %`;
  const pl = (n: number) => (n === 1 ? 'mandát' : n >= 2 && n <= 4 ? 'mandáty' : 'mandátů');
  const mx = Math.max(300, ...z.l.map((l) => Math.max(l.v, l.hi[idx], l.n0[idx]))) * 1.03;
  const X = (v: number) => `${(v / mx) * 100}%`;
  // první stav, od kterého hodnota zůstala až do konce do 1 p. b. (10 promile) od výsledku
  const trvale = (arr: number[], v: number) => { let i = arr.length - 1; while (i > 0 && Math.abs(arr[i - 1] - v) <= 10) i--; return i; };
  const hodnota = { width: 92, flex: 'none', fontSize: 12.5, color: MUTED, whiteSpace: 'nowrap' as const, textAlign: 'right' as const };
  return (
    <div>
      <div style={{ display: 'grid', gap: 12 }}>
        {z.l.map((l, j) => {
          const c = l.c ?? '#b8b4a6';
          return (
            <div key={j}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 15 }}>
                <span style={{ minWidth: 0 }}>
                  <strong>{l.a}</strong>
                  {(l.strana ?? nazvy[l.a]) && (l.strana ?? nazvy[l.a]) !== l.a && <span style={{ color: MUTED, fontSize: 13 }}> · {l.strana ?? nazvy[l.a]}</span>}
                </span>
                <span style={{ whiteSpace: 'nowrap' }}>
                  <span style={{ color: MUTED, fontSize: 13 }}>výsledek </span><strong>{pc(l.v)}</strong>
                  {l.s != null && <span style={{ color: MUTED, marginLeft: 6 }}>{l.s} {pl(l.s)}</span>}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <div style={{ position: 'relative', height: 8, background: '#f1efe7', borderRadius: 3 }}>
                    <div style={{ position: 'absolute', left: 0, width: X(l.n0[idx]), top: 0, bottom: 0, background: c, opacity: 0.35, borderRadius: 3 }} />
                  </div>
                  <div style={{ position: 'relative', height: 10, background: '#f1efe7', borderRadius: 3, marginTop: 4 }}>
                    <div style={{ position: 'absolute', left: 0, width: X(l.e[idx]), top: 0, bottom: 0, background: c, borderRadius: 3 }} />
                    {l.hi[idx] > l.lo[idx] && (
                      <div style={{ position: 'absolute', left: X(l.lo[idx]), width: `calc(${X(l.hi[idx])} - ${X(l.lo[idx])})`, top: -2, bottom: -2, border: `1.5px solid ${INK}`, borderRadius: 3, opacity: 0.45 }} />
                    )}
                  </div>
                  <div title={`výsledek ${pc(l.v)}`} style={{ position: 'absolute', left: `calc(${X(l.v)} - 1px)`, top: -3, bottom: -3, width: 2, background: INK }} />
                </div>
                <div style={{ display: 'grid', gap: 1, lineHeight: '13px' }}>
                  <span style={hodnota}>sčítání {pc(l.n0[idx])}</span>
                  <span style={{ ...hodnota, color: INK }}>predikce <strong>{pc(l.e[idx])}</strong></span>
                </div>
              </div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 1 }}>
                interval predikce {pc(l.lo[idx])}–{pc(l.hi[idx])}{l.ms.length ? ` · ${l.ms[idx]} ${pl(l.ms[idx])}` : ''}
                {l.v >= 50 && (() => {
                  const p = trvale(l.e, l.v), s = trvale(l.n0, l.v);
                  return p < s ? <> · do 1 b. od výsledku: predikce od <strong style={{ color: INK }}>{hhmm(z.t[p])}</strong>, sčítání až od {hhmm(z.t[s])}</> : null;
                })()}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 12.5, color: MUTED, marginTop: 10 }}>
        Horní pruh = sčítání (podíl z dosud sečtených okrsků), spodní = naše predikce s 90% intervalem (rámeček), černá ryska = konečný výsledek.
      </div>
    </div>
  );
}
