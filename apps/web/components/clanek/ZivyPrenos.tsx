'use client';

// Online reportáž: příspěvky z JSON souboru článku, nejnovější nahoře.
// <ZivyPrenos dataUrl="/clanek/_articles/<slug>/zive.json" slug="<slug>" />
// Soubor obsahuje pole „zive“: [{ cas: "15:20", text: "…", obrazek?: "images/zive/x.png", alt?: "…", rekap?: Rekap }]
// Text: odstavce oddělené prázdným řádkem, **tučně** a [odkaz](url).
// rekap = tabulka průběžné rekapitulace (sestavuje rekapitulace.py v článku).

import { Fragment, useEffect, useState } from 'react';
import { pollJson } from '@/lib/pollJson';

const INK = '#101432';
const MUTED = '#4c4f8e';
const RED = '#D04646';
const FONT = 'var(--font-roboto-condensed), Arial, sans-serif';

// stejný semafor jako mapa SenatPredikceMapa
const STAV = {
  jiste: { label: 'S jistotou víme', color: '#2e9e5b', bg: '#eaf6ef' },
  temer: { label: 'Téměř jisté', color: '#d98a00', bg: '#fdf4e3' },
  cekame: { label: 'Čekáme na sečtené hlasy', color: '#8a8676', bg: '#f3f1ea' },
} as const;
type Stav = keyof typeof STAV;
type RekapRadek = { stav: Stav; ob: number; obvod: string; vysledek: string; secteno?: number };
type Prispevek = { cas: string; text: string; obrazek?: string; alt?: string; rekap?: RekapRadek[] };

function inline(s: string) {
  // **tučně** a [text](url)
  const parts = s.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((p, i) => {
    const b = /^\*\*([^*]+)\*\*$/.exec(p);
    if (b) return <strong key={i}>{b[1]}</strong>;
    const a = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(p);
    if (a) return <a key={i} href={a[2]} target="_blank" rel="noopener noreferrer">{a[1]}</a>;
    return <Fragment key={i}>{p}</Fragment>;
  });
}

function RekapTabulka({ rows }: { rows: RekapRadek[] }) {
  return (
    <div style={{ fontFamily: FONT, color: INK, border: '1px solid #e6e3d9', borderRadius: 8, overflow: 'hidden', background: '#fff', marginTop: 4 }}>
      {(Object.keys(STAV) as Stav[]).map((s) => {
        const list = rows.filter((r) => r.stav === s);
        if (!list.length) return null;
        const st = STAV[s];
        return (
          <section key={s}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: st.bg, borderTop: '1px solid #e6e3d9', borderLeft: `5px solid ${st.color}` }}>
              <span style={{ width: 11, height: 11, borderRadius: 6, background: st.color, flex: '0 0 auto' }} />
              <strong style={{ fontSize: 16 }}>{st.label}</strong>
              <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: 15, color: st.color }}>{list.length}</span>
            </div>
            {list.map((r, i) => (
              <div
                key={r.ob}
                style={{
                  // obvod a výsledek pod sebou – čitelné i v úzkém sloupci na mobilu
                  display: 'grid', gridTemplateColumns: '2.2em minmax(0, 1fr) auto', alignItems: 'baseline',
                  gap: '0 10px', padding: '8px 14px', fontSize: 15, lineHeight: 1.35,
                  borderTop: i ? '1px solid #f1efe7' : 'none',
                }}
              >
                <span style={{ color: MUTED, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{r.ob}</span>
                <span>
                  <strong>{r.obvod}</strong>
                  <span style={{ display: 'block', color: '#2b2f5c' }}>{r.vysledek}</span>
                </span>
                <span style={{ color: MUTED, fontSize: 13, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                  {r.secteno !== undefined ? `${r.secteno} %` : ''}
                </span>
              </div>
            ))}
          </section>
        );
      })}
      <div style={{ padding: '7px 14px', fontSize: 12.5, color: MUTED, borderTop: '1px solid #e6e3d9' }}>
        Číslo vpravo = podíl sečtených okrsků. Jisté = pravděpodobnost ≥ 99 % a aspoň 30 % sečtených okrsků, téměř jisté = ≥ 90 % a aspoň 15 %.
      </div>
    </div>
  );
}

export default function ZivyPrenos({ dataUrl, slug }: { dataUrl: string; slug: string }) {
  const [items, setItems] = useState<Prispevek[] | null>(null);

  // nové příspěvky se načtou samy (obnova každou minutu, jen na viditelné kartě)
  useEffect(() => pollJson(dataUrl, (d) => setItems(((d as { zive?: Prispevek[] }).zive ?? []))), [dataUrl]);

  if (!items) return null;
  const sorted = [...items].sort((a, b) => b.cas.localeCompare(a.cas));

  return (
    <div style={{ clear: 'both', margin: '1.5em 0', borderLeft: `3px solid ${RED}`, paddingLeft: 18 }}>
      {sorted.map((p, i) => (
        <article key={`${p.cas}-${i}`} style={{ position: 'relative', paddingBottom: 22, marginBottom: 22, borderBottom: i < sorted.length - 1 ? '1px solid #e6e3d9' : 'none' }}>
          <span style={{ position: 'absolute', left: -25, top: 4, width: 11, height: 11, borderRadius: 6, background: i === 0 ? RED : '#fff', border: `2px solid ${RED}` }} />
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 15, color: i === 0 ? RED : MUTED, marginBottom: 6 }}>
            {p.cas}{i === 0 ? ' · nejnovější' : ''}
          </div>
          {p.text.split(/\n\s*\n/).map((para, j) => (
            <p key={j} style={{ margin: '0 0 0.7em', color: INK, fontSize: '1.0625rem', lineHeight: 1.6 }}>{inline(para)}</p>
          ))}
          {p.rekap && <RekapTabulka rows={p.rekap} />}
          {p.obrazek && (
            <img
              src={p.obrazek.startsWith('http') ? p.obrazek : `/clanek/_articles/${slug}/${p.obrazek}`}
              alt={p.alt ?? ''}
              loading="lazy"
              style={{ display: 'block', maxWidth: '100%', height: 'auto', borderRadius: 6, border: '1px solid #e6e3d9', marginTop: 6 }}
            />
          )}
        </article>
      ))}
    </div>
  );
}
