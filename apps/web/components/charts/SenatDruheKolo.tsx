'use client';

// Senát 2026 – 2. kolo: živý amfiteátr 81 křesel, rafičky z predikce Michala Škopa
// (volby2026-2.datatimes.cz) a online přehled „už víme“, nejnovější nahoře.
// Data si stránka bere sama z API predikce (CORS *), obnova každých 30 s na viditelné kartě.
// <SenatDruheKolo apiUrl="https://volby2026-2.datatimes.cz/api/latest.json" klubyUrl="/clanek/_articles/<slug>/kluby.json" />
// kluby.json: složení klubů bez 27 končících senátorů + předpokládaný klub každého kandidáta (viz soubor).

import { useEffect, useMemo, useRef, useState } from 'react';
import { pollJson } from '@/lib/pollJson';
import ChartCard from './ChartCard';
import ChartSignature from './ChartSignature';

const INK = '#101432';
const MUTED = '#4c4f8e';
const LINE = '#e6e3d9';
const OFF = '#e3e0d6'; // upozaděné křeslo
const PEND = '#c4c0b2'; // obrys křesla, o kterém se rozhoduje
const RED = '#D04646';
const OK = '#2e9e5b';
const FONT = 'var(--font-roboto-condensed), Arial, sans-serif';

type Cand = { color: string; no?: number; name: string; party: string; r1?: number; share?: number };
type Ob = {
  ob: number; name: string; status: string; n_total?: number; n_counted?: number; final?: boolean; unsure?: boolean;
  a?: Cand; b?: Cand; winner?: Cand;
  a_share?: number; p_a?: number; p_b?: number; sd?: number; margin_votes?: number | null;
  needle?: number; needle_lo?: number; needle_hi?: number; needle_counted?: number | null;
};
type Ev = { first_seen: string; name: string; party: string; pred: { p: number; share: number; n_counted: number; n_total: number }; revoked?: boolean; final?: boolean };
type Api = { generated: string; se2: Record<string, Ob>; se2_reported_precincts: number; decided?: Record<string, Ev> };
type Klub = { id: string; nazev: string; kratce: string; barva: string };
type KandInfo = { klub: string; z?: boolean; navrh?: string };
type Kluby = { kluby: Klub[]; trvajici: Record<string, number>; kandidati: Record<string, Record<string, KandInfo>>; poznamka?: string };

const F1 = (x: number) => x.toFixed(1).replace('.', ',');
const PCT = (p: number) => (p >= 0.995 ? '>99 %' : p <= 0.005 ? '<1 %' : `${F1(p * 100)} %`);
const hhmm = (iso: string) => iso.slice(11, 16);

// ---------- rafička (port gauge() z volby2026-2.datatimes.cz) ----------
function Gauge({ d }: { d: Ob }) {
  const cx = 110, cy = 108, r = 84;
  const cl = (v: number) => Math.max(-1, Math.min(1, v));
  const ang = (v: number) => Math.PI * (1 - (cl(v) + 1) / 2);
  const P = (v: number, rr: number) => [cx + rr * Math.cos(ang(v)), cy - rr * Math.sin(ang(v))];
  const arc = (v1: number, v2: number, rr: number) => {
    const p1 = P(v1, rr), p2 = P(v2, rr);
    return `M${p1[0].toFixed(1)},${p1[1].toFixed(1)} A${rr},${rr} 0 0 1 ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  };
  const Z = [0, 0.27, 0.52, 1], OP = [0.22, 0.38, 0.6]; // šance 50–75 %, 75–90 %, 90–99 %
  const ca = d.a!.color, cb = d.b!.color;
  const nn = P(d.needle ?? 0, r - 8), t1 = P(0, r - 12), t2 = P(0, r + 12);
  const c = d.needle_counted == null ? null : P(d.needle_counted, r + 13);
  const L = P(-1, r), R = P(1, r);
  return (
    <svg viewBox="0 -4 220 138" style={{ width: '100%', maxWidth: 300, display: 'block', margin: '2px auto 0' }} role="img"
      aria-label={`rafička: predikce, odhad podílu ${F1((d.a_share ?? 0.5) * 100)} %`}>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <path d={arc(-Z[i + 1], -Z[i], r)} fill="none" stroke={cb} strokeOpacity={OP[i]} strokeWidth={16} />
          <path d={arc(Z[i], Z[i + 1], r)} fill="none" stroke={ca} strokeOpacity={OP[i]} strokeWidth={16} />
        </g>
      ))}
      {[0.27, 0.52, -0.27, -0.52].map((z) => {
        const a = P(z, r - 10), b = P(z, r + 10);
        return <line key={z} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#fff" strokeWidth={1.5} />;
      })}
      {!d.final && d.needle_lo != null && d.needle_hi != null && (
        <path d={arc(d.needle_lo, Math.max(d.needle_hi, d.needle_lo + 0.01), r - 15)} fill="none" stroke={INK} strokeOpacity={0.85} strokeWidth={5} strokeLinecap="round" />
      )}
      <line x1={t1[0]} y1={t1[1]} x2={t2[0]} y2={t2[1]} stroke={INK} strokeOpacity={0.7} strokeWidth={2} />
      {c && <circle cx={c[0]} cy={c[1]} r={3.5} fill={MUTED}><title>sečtený podíl</title></circle>}
      <line x1={cx} y1={cy} x2={nn[0]} y2={nn[1]} stroke={INK} strokeWidth={3.5} strokeLinecap="round" style={{ transition: 'all .8s ease' }} />
      <circle cx={cx} cy={cy} r={7} fill={INK} />
      <text x={L[0]} y={cy + 13} textAnchor="middle" fontSize={9} fontWeight={700} fill={INK}>&gt;99 %</text>
      <text x={R[0]} y={cy + 13} textAnchor="middle" fontSize={9} fontWeight={700} fill={INK}>&gt;99 %</text>
      <text x={cx} y={cy + 25} textAnchor="middle" fontSize={10} letterSpacing=".08em" fill={MUTED}>PREDIKCE</text>
      <text x={cx} y={cy - r - 17} textAnchor="middle" fontSize={9} fill={MUTED}>50 : 50</text>
    </svg>
  );
}

// Karta obvodu s rafičkou – samostatně čitelná i jako screenshot na sítě.
function ObvodKarta({ d: d0, ev, kand, kluby }: { d: Ob; ev?: Ev; kand?: Record<string, KandInfo>; kluby: Klub[] }) {
  // barva kandidáta = barva předpokládaného klubu (stejná jako v amfiteátru), jinak barva z predikce
  const recol = (x: Cand) => ({ ...x, color: kluby.find((k) => k.id === kand?.[x.name]?.klub)?.barva ?? x.color });
  const d: Ob = { ...d0, a: recol(d0.a!), b: recol(d0.b!) };
  const a = d.a!, b = d.b!;
  const fin = !!d.final, pre = d.status === 'no_data' || !d.n_counted;
  const pa = d.a_share ?? 0.5, aWin = (d.p_a ?? 0.5) >= 0.5;
  const decided = fin || (ev && !ev.revoked);
  const navrh = (x: Cand) => kand?.[x.name]?.navrh ?? x.party;
  const Name = ({ x, win, right, col }: { x: Cand; win: boolean; right?: boolean; col: string }) => (
    <div style={{ borderTop: `5px solid ${col}`, paddingTop: 5, textAlign: right ? 'right' : 'left', opacity: win || !decided ? 1 : 0.6 }}>
      <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.2 }}>{x.name}</div>
      <div style={{ fontSize: 12, color: MUTED }}>{navrh(x)}</div>
    </div>
  );
  const Col = ({ sh, p, win, right }: { sh: number; p: number; win: boolean; right?: boolean }) => (
    <div style={{ textAlign: right ? 'right' : 'left', opacity: win || !decided ? 1 : 0.6 }}>
      <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>{F1(sh * 100)} %</div>
      <div style={{ fontSize: 11, color: MUTED }}>{fin ? 'podíl hlasů' : 'odhad podílu hlasů'}</div>
      <div style={{ fontSize: 12, marginTop: 3 }}>{fin ? (win ? <b>zvolen{kand?.[(right ? a : b).name]?.z ? 'a' : ''}</b> : ' ') : <>šance na zvolení <b>{PCT(p)}</b></>}</div>
    </div>
  );
  const pct = d.n_total ? Math.min(100, ((d.n_counted ?? 0) / d.n_total) * 100) : 0;
  const stitek = fin ? 'sečteno' : decided ? 'rozhodnuto' : pre ? 'před sčítáním' : Math.max(d.p_a ?? 0, d.p_b ?? 0) >= 0.95 ? 'velmi pravděpodobné' : 'nerozhodnuto';
  return (
    <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 10, padding: 12, fontFamily: FONT, color: INK, maxWidth: 440 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <strong style={{ fontSize: 15 }}>{d.ob} · {d.name}</strong>
        <span style={{
          fontSize: 11, borderRadius: 999, padding: '4px 10px', whiteSpace: 'nowrap',
          background: decided ? OK : 'transparent', color: decided ? '#fff' : MUTED, border: `1px ${pre && !decided ? 'dashed' : 'solid'} ${decided ? OK : LINE}`,
        }}>{stitek}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, minHeight: 62, alignItems: 'start' }}>
        <Name x={b} win={!aWin} col={b.color} />
        <Name x={a} win={aWin} right col={a.color} />
      </div>
      {d.needle != null && <Gauge d={d} />}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 6 }}>
        <Col sh={1 - pa} p={d.p_b ?? 0.5} win={!aWin} />
        <Col sh={pa} p={d.p_a ?? 0.5} win={aWin} right />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12, color: MUTED, marginTop: 8 }}>
        <span>sečteno <b style={{ color: INK }}>{d.n_counted ?? 0}</b> z {d.n_total} okrsků ({F1(pct)} %)</span>
        <span>1. kolo: {F1((b.r1 ?? 0) * 100)} % : {F1((a.r1 ?? 0) * 100)} %</span>
      </div>
      <div style={{ height: 4, background: LINE, borderRadius: 3, marginTop: 5 }}>
        <i style={{ display: 'block', height: '100%', width: `${pct}%`, background: MUTED, borderRadius: 3 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: 11, color: MUTED }}>
        <span>Predikce: Michal Škop · data ČSÚ</span>
        <ChartSignature size={16} textSize={12} />
      </div>
    </div>
  );
}

// Zkopíruje větu nad sebou (+ odkaz na článek) – rovnou na sociální sítě.
function KopirujVetu() {
  const [ok, setOk] = useState(false);
  return (
    <button type="button"
      onClick={(e) => {
        const p = (e.currentTarget.closest('article')?.querySelector('[data-veta]') as HTMLElement | null)?.innerText.trim() ?? '';
        const url = window.location.origin + window.location.pathname;
        navigator.clipboard?.writeText(`${p} Živě: ${url}`).then(() => { setOk(true); setTimeout(() => setOk(false), 1800); });
      }}
      style={{ fontFamily: FONT, fontSize: 13, padding: '4px 10px', marginBottom: 10, borderRadius: 6, cursor: 'pointer', border: `1px solid ${LINE}`, background: ok ? OK : '#fff', color: ok ? '#fff' : MUTED }}>
      {ok ? 'Zkopírováno' : 'Kopírovat větu'}
    </button>
  );
}

// ---------- amfiteátr ----------
type Seat = { klub: string | null; kind: 'new' | 'r1' | 'stay' | 'pend'; ob?: number; title: string; jmeno?: string; obvod?: string };

function hemicycle(n: number) {
  const rows = 5, r0 = 110, r1 = 280;
  const radii = Array.from({ length: rows }, (_, i) => r0 + ((r1 - r0) * i) / (rows - 1));
  const sum = radii.reduce((s, x) => s + x, 0);
  const counts = radii.map((r) => Math.round((n * r) / sum));
  counts[rows - 1] += n - counts.reduce((s, x) => s + x, 0);
  const pts: { x: number; y: number; a: number; r: number }[] = [];
  radii.forEach((r, i) => {
    const k = counts[i];
    for (let j = 0; j < k; j++) {
      const a = Math.PI - (j * Math.PI) / (k - 1);
      pts.push({ x: 300 + r * Math.cos(a), y: 292 - r * Math.sin(a), a, r });
    }
  });
  return pts.sort((p, q) => q.a - p.a || p.r - q.r);
}

export default function SenatDruheKolo({ apiUrl, klubyUrl, feedUrl }: { apiUrl: string; klubyUrl: string; feedUrl?: string }) {
  const [api, setApi] = useState<Api | null>(null);
  const [kl, setKl] = useState<Kluby | null>(null);
  const [vse, setVse] = useState(false); // ukázat i senátory, kterým mandát trvá
  const [off, setOff] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => pollJson(apiUrl, (d) => setApi(d as Api), 30_000), [apiUrl]);
  useEffect(() => { fetch(klubyUrl).then((r) => r.json()).then(setKl).catch(() => {}); }, [klubyUrl]);

  const model = useMemo(() => {
    if (!api || !kl) return null;
    const ev: Record<string, Ev> = api.decided ?? {};
    const obs = Object.values(api.se2).sort((x, y) => x.ob - y.ob);
    const klubOf = (ob: number, name: string) => kl.kandidati[String(ob)]?.[name]?.klub ?? 'nez';
    const isZ = (ob: number, name: string) => kl.kandidati[String(ob)]?.[name]?.z ?? /ová$|á$/.test(name);
    const r1: Seat[] = [], r2: Seat[] = [], pend: Seat[] = [];
    const feed: { ob: Ob; ev?: Ev; time: string; winner: Cand; aWin: boolean }[] = [];
    for (const d of obs) {
      if (d.status === 'decided_r1' && d.winner) {
        r1.push({ klub: klubOf(d.ob, d.winner.name), kind: 'r1', ob: d.ob, jmeno: d.winner.name, obvod: d.name, title: `${d.ob} ${d.name}: ${d.winner.name} (zvolen${isZ(d.ob, d.winner.name) ? 'a' : ''} v 1. kole)` });
        continue;
      }
      const e = ev[String(d.ob)];
      const dec = d.final || (e && !e.revoked);
      if (dec && d.a && d.b) {
        const aWin = e && !e.revoked ? e.name === d.a.name : (d.p_a ?? 0) >= 0.5;
        const w = aWin ? d.a : d.b;
        r2.push({ klub: klubOf(d.ob, w.name), kind: 'new', ob: d.ob, jmeno: w.name, obvod: d.name, title: `${d.ob} ${d.name}: ${w.name}` });
        feed.push({ ob: d, ev: e, time: e?.first_seen ?? api.generated, winner: w, aWin });
      } else {
        pend.push({ klub: null, kind: 'pend', ob: d.ob, title: `${d.ob} ${d.name}: rozhoduje se` });
      }
    }
    feed.sort((x, y) => y.time.localeCompare(x.time));
    const seats: Seat[] = [];
    const tally = kl.kluby.map((k) => {
      const nw = [...r1, ...r2].filter((s) => s.klub === k.id);
      seats.push(...nw);
      const stay = kl.trvajici[k.id] ?? 0;
      for (let i = 0; i < stay; i++) seats.push({ klub: k.id, kind: 'stay', title: `${k.nazev}: mandát trvá` });
      return { k, stay, r1: nw.filter((s) => s.kind === 'r1').length, r2: nw.filter((s) => s.kind === 'new').length };
    });
    seats.push(...pend);
    return { seats, tally, feed, pend: obs.filter((d) => pend.some((p) => p.ob === d.ob)), isZ, nR2: obs.filter((d) => d.status !== 'decided_r1').length };
  }, [api, kl]);

  const pts = useMemo(() => hemicycle(81), []);

  // pod ~620 px šířky se popisky do grafu nevejdou čitelně → seznam pod grafem
  const boxRef = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setNarrow(el.clientWidth < 620));
    ro.observe(el);
    return () => ro.disconnect();
  }, [model !== null]);

  // popisky: nově zvolení (1. i 2. kolo), levá/pravá polovina, svisle rozestoupené, aby se nepřekrývaly
  const labels = useMemo(() => {
    if (!model) return [];
    const all = pts.map((p, i) => ({ p, i, s: model.seats[i] }))
      .filter((x) => x.s && (x.s.kind === 'new' || x.s.kind === 'r1') && x.s.klub && !off.has(x.s.klub));
    const place = (arr: typeof all, left: boolean) => {
      const a = [...arr].sort((x, y) => x.p.y - y.p.y);
      const gap = 24, top = -8, bot = 316;
      const ys = a.map((x) => x.p.y);
      for (let k = 0; k < ys.length; k++) ys[k] = Math.max(ys[k], k ? ys[k - 1] + gap : top);
      if (ys.length && ys[ys.length - 1] > bot) {
        ys[ys.length - 1] = bot;
        for (let k = ys.length - 2; k >= 0; k--) ys[k] = Math.min(ys[k], ys[k + 1] - gap);
      }
      return a.map((x, k) => ({ ...x, s: x.s!, y: ys[k], left }));
    };
    // rovnoměrně na obě strany: levější polovina křesel (podle úhlu) vlevo, zbytek vpravo
    const byAng = [...all].sort((x, y) => y.p.a - x.p.a);
    const half = Math.ceil(byAng.length / 2);
    return [...place(byAng.slice(0, half), true), ...place(byAng.slice(half), false)];
  }, [model, pts, off]);

  if (!api || !kl || !model) return <div style={{ fontFamily: FONT, color: MUTED, padding: '1em 0' }}>Načítám data predikce…</div>;

  const rep = api.se2_reported_precincts;
  const total = model.pend.concat(model.feed.map((f) => f.ob)).reduce((s, d) => s + (d.n_total ?? 0), 0);
  const color = (s: Seat) => {
    if (s.kind === 'pend') return '#fff';
    const k = kl.kluby.find((x) => x.id === s.klub);
    if (!k || off.has(k.id)) return OFF;
    if (s.kind === 'stay' && !vse) return OFF;
    return k.barva;
  };
  const toggle = (id: string) => setOff((o) => { const n = new Set(o); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const hoverSeat = hover !== null ? model.seats[hover] : null;
  // navrhující strany jako „KDU-ČSL + ODS + STAN“
  const navrhOf = (ob: number, w: Cand) => (kl.kandidati[String(ob)]?.[w.name]?.navrh ?? w.party).split(', ').join(' + ');

  const stav = rep === 0
    ? `Zatím nemáme data. Volební místnosti se ${Date.now() < Date.parse('2026-10-17T14:00:00+02:00') ? 'zavírají' : 'zavřely'} ve 14:00, čekáme na první sečtené okrsky z Českého statistického úřadu.`
    : model.feed.length === model.nR2 && model.pend.length === 0
      ? `Ve všech ${model.nR2} obvodech 2. kola je rozhodnuto.`
      : `Sčítá se: sečteno ${rep.toLocaleString('cs')} z ${total.toLocaleString('cs')} okrsků, rozhodnuto ${model.feed.length} z ${model.nR2} obvodů.`;

  return (
    <div style={{ clear: 'both' }}>
      <ChartCard
        title="Kdo usedne v Senátu"
        subtitle={`27 křesel, o kterých se letos rozhodlo nebo rozhoduje. Data z ${hhmm(api.generated)}, obnova sama každých 30 s.`}
        source="ČSÚ, senat.cz; predikce: Michal Škop, DataTimes.cz"
      >
        <div style={{ fontFamily: FONT, color: INK }}>
          <div style={{ fontSize: 15, lineHeight: 1.4, marginBottom: 10, display: 'flex', gap: 8, alignItems: 'baseline' }}>
            <span style={{ width: 9, height: 9, borderRadius: 5, flex: '0 0 auto', background: rep ? OK : '#d98a00', transform: 'translateY(-1px)' }} />
            <span>{stav}</span>
          </div>

          {/* legenda = počty klubů, vyklikávací */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
            {model.tally.filter((t) => t.stay + t.r1 + t.r2 > 0).map(({ k, stay, r1, r2 }) => {
              const on = !off.has(k.id);
              return (
                <button key={k.id} type="button" onClick={() => toggle(k.id)} aria-pressed={on}
                  title={`${k.nazev}: ${stay} senátorů s trvajícím mandátem, ${r1} zvolen(o) v 1. kole, ${r2} ve 2. kole`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
                    border: `1px solid ${on ? LINE : 'transparent'}`, background: on ? '#fff' : 'transparent', opacity: on ? 1 : 0.5,
                    fontFamily: FONT, fontSize: 14, color: INK,
                  }}>
                  <span style={{ width: 11, height: 11, borderRadius: 6, background: k.barva }} />
                  <span>{k.kratce}</span>
                  <b style={{ fontVariantNumeric: 'tabular-nums' }}>{stay + r1}</b>
                  {r2 > 0 && <b style={{ color: OK }}>+{r2}</b>}
                </button>
              );
            })}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', fontSize: 14 }}>
              <span style={{ width: 11, height: 11, borderRadius: 6, border: `2px solid ${PEND}`, boxSizing: 'border-box' }} />
              rozhoduje se <b>{model.pend.length}</b>
            </span>
          </div>

          <div ref={boxRef} style={{ position: 'relative' }}>
            <svg viewBox={narrow ? '0 -18 600 330' : '-262 -18 1124 348'} style={{ width: '100%', display: 'block' }} role="img" aria-label="Amfiteátr 81 křesel Senátu">
              {/* popisky nově zvolených po stranách, vodicí čáry vedou pod křesly */}
              {!narrow && labels.map((l) => (
                <line key={`l${l.i}`} x1={l.p.x} y1={l.p.y} x2={l.left ? -4 : 604} y2={l.y} stroke={MUTED} strokeOpacity={0.45} strokeWidth={1.2} />
              ))}
              {!narrow && labels.map((l) => (
                <text key={`t${l.i}`} x={l.left ? -10 : 610} y={l.y + 6} textAnchor={l.left ? 'end' : 'start'} fontSize={17} fontWeight={700} fill={INK}>
                  {l.s.jmeno}
                </text>
              ))}
              {pts.map((p, i) => {
                const s = model.seats[i];
                if (!s) return null;
                return (
                  <circle key={i} cx={p.x} cy={p.y} r={14} fill={color(s)}
                    stroke={s.kind === 'pend' ? PEND : 'none'} strokeWidth={s.kind === 'pend' ? 2 : 1.5}
                    strokeDasharray={s.kind === 'pend' ? '3 2.5' : undefined}
                    onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onClick={() => setHover(i)}
                    style={{ transition: 'fill .6s ease, cx .8s ease, cy .8s ease', cursor: 'pointer' }} />
                );
              })}
              <text x={300} y={258} textAnchor="middle" fontSize={34} fontWeight={700} fill={INK}>{81 - model.pend.length - (vse ? 0 : model.tally.reduce((s, t) => s + t.stay, 0))}</text>
              <text x={300} y={282} textAnchor="middle" fontSize={14} fill={MUTED}>{vse ? 'senátorů známe' : 'z 27 křesel známe'}</text>
            </svg>
            {hoverSeat && (
              <div style={{ position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)', background: '#fff', border: `1px solid ${LINE}`, borderRadius: 6, padding: '5px 9px', fontSize: 13, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
                {hoverSeat.title}
              </div>
            )}
          </div>

          {/* na úzkém displeji místo popisků v grafu seznam jmen po klubech */}
          {narrow && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 210px), 1fr))', gap: '10px 18px', margin: '6px 0 12px' }}>
            {kl.kluby.map((k) => {
              const list = model.seats.filter((s) => s.klub === k.id && (s.kind === 'new' || s.kind === 'r1')).sort((x, y) => (x.ob ?? 0) - (y.ob ?? 0));
              if (!list.length) return null;
              return (
                <div key={k.id} style={{ borderTop: `4px solid ${k.barva}`, paddingTop: 5, opacity: off.has(k.id) ? 0.35 : 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{k.kratce} <span style={{ color: OK }}>+{list.length}</span></div>
                  {list.map((s) => (
                    <div key={s.ob} style={{ fontSize: 13.5, lineHeight: 1.35 }}>
                      <strong>{s.jmeno}</strong> <span style={{ color: MUTED }}>· {s.obvod}{s.kind === 'r1' ? ' (1. kolo)' : ''}</span>
                    </div>
                  ))}
                </div>
              );
            })}
            {model.pend.length > 0 && (
              <div style={{ borderTop: `4px dashed ${PEND}`, paddingTop: 5 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>rozhoduje se {model.pend.length}</div>
                {[...model.pend].sort((x, y) => x.ob - y.ob).map((d) => (
                  <div key={d.ob} style={{ fontSize: 13.5, lineHeight: 1.35, color: MUTED }}>{d.name}</div>
                ))}
              </div>
            )}
          </div>}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            <button type="button" onClick={() => setVse((v) => !v)} aria-pressed={vse}
              style={{ fontFamily: FONT, fontSize: 14, padding: '8px 14px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${INK}`, background: vse ? INK : '#fff', color: vse ? '#fff' : INK }}>
              {vse ? 'Jen 27 volených křesel' : 'Celý Senát (81)'}
            </button>
            <span style={{ fontSize: 12.5, color: MUTED }}>Kliknutím na klub ho vypnete. Většina = 41 hlasů.</span>
          </div>
          {kl.poznamka && <div style={{ fontSize: 12.5, color: MUTED, marginTop: 8, lineHeight: 1.4 }}>{kl.poznamka}</div>}
        </div>
      </ChartCard>

      {/* online reportáž: embed feedu predikce (feedUrl), jinak vlastní přehled; nejnovější nahoře */}
      {feedUrl ? (
        <iframe src={feedUrl} title="Online reportáž: 2. kolo senátních voleb" width="100%" height={600} loading="lazy"
          style={{ border: 0, display: 'block', margin: '1.5em 0', background: '#fff' }} />
      ) : (
      <div style={{ borderLeft: `3px solid ${RED}`, paddingLeft: 18, margin: '1.5em 0' }}>
        {model.feed.length === 0 && (
          <p style={{ fontFamily: FONT, color: MUTED, margin: 0 }}>Jakmile predikce v některém obvodu ukáže vítěze s jistotou nad 99 %, objeví se tady nahoře.</p>
        )}
        {model.feed.map(({ ob: d, ev, time, winner, aWin }, i) => {
          const z = model.isZ(d.ob, winner.name);
          const share = aWin ? d.a_share ?? 0.5 : 1 - (d.a_share ?? 0.5);
          const klub = kl.kluby.find((k) => k.id === (kl.kandidati[String(d.ob)]?.[winner.name]?.klub ?? 'nez'));
          return (
            <article key={d.ob} style={{ position: 'relative', paddingBottom: 22, marginBottom: 22, borderBottom: i < model.feed.length - 1 ? `1px solid ${LINE}` : 'none' }}>
              <span style={{ position: 'absolute', left: -25, top: 4, width: 11, height: 11, borderRadius: 6, background: i === 0 ? RED : '#fff', border: `2px solid ${RED}` }} />
              <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 15, color: i === 0 ? RED : MUTED, marginBottom: 6 }}>
                {hhmm(time)}{i === 0 ? ' · nejnovější' : ''}
              </div>
              <p data-veta style={{ margin: '0 0 0.4em', color: INK, fontSize: '1.0625rem', lineHeight: 1.6 }}>
                Ve druhém kole senátních voleb v{' '}obvodu {d.ob} ({d.name}) {d.final ? `vyhrál${z ? 'a' : ''}` : 'vyhrává'}{' '}
                <strong>{winner.name}</strong> ({navrhOf(d.ob, winner)}) s{' '}{F1(share * 100)}{' '}%.
              </p>
              <div style={{ fontFamily: FONT, fontSize: 13, color: MUTED, marginBottom: 6 }}>
                {d.final
                  ? 'Sečteny všechny okrsky.'
                  : `Podle predikce, sečteno ${d.n_total ? F1(((d.n_counted ?? 0) / d.n_total) * 100) : 0} % okrsků.`}
                {klub && klub.id !== 'nez' ? ` Předpokládaný klub: ${klub.nazev}.` : ''}
              </div>
              <KopirujVetu />
              <ObvodKarta d={d} ev={ev} kand={kl.kandidati[String(d.ob)]} kluby={kl.kluby} />
            </article>
          );
        })}
      </div>
      )}

      {model.pend.length > 0 && (
        <>
          <h3 style={{ fontFamily: FONT, color: INK, margin: '1.2em 0 0.6em' }}>Kde se ještě rozhoduje</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 330px), 1fr))', gap: 10 }}>
            {[...model.pend].sort((x, y) => Math.abs((y.p_a ?? 0.5) - 0.5) - Math.abs((x.p_a ?? 0.5) - 0.5) || x.ob - y.ob).map((d) => (
              <ObvodKarta key={d.ob} d={d} ev={api.decided?.[String(d.ob)]} kand={kl.kandidati[String(d.ob)]} kluby={kl.kluby} />
            ))}
          </div>
          <p style={{ fontFamily: FONT, fontSize: 12.5, color: MUTED, lineHeight: 1.45, marginTop: 10 }}>
            Rafička ukazuje predikci: nahoře 50 : 50, na koncích stupnice šance na vítězství nad 99 %. Vpravo je kandidát s lepším výsledkem 1. kola.
            Tmavý oblouk uvnitř je 90% interval, šedá tečka dosud sečtený podíl. Seřazeno od nejjasnějších.
          </p>
        </>
      )}
    </div>
  );
}
