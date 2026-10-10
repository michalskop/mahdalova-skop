'use client';

// Online reportáž: příspěvky z JSON souboru článku, nejnovější nahoře.
// <ZivyPrenos dataUrl="/clanek/_articles/<slug>/predikce.json" slug="<slug>" />
// Soubor obsahuje pole „zive“: [{ cas: "15:20", text: "…", obrazek?: "images/zive/x.png", alt?: "…" }]
// Text: odstavce oddělené prázdným řádkem, **tučně** a [odkaz](url).

import { Fragment, useEffect, useState } from 'react';

const INK = '#101432';
const MUTED = '#4c4f8e';
const RED = '#D04646';

type Prispevek = { cas: string; text: string; obrazek?: string; alt?: string };

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

export default function ZivyPrenos({ dataUrl, slug }: { dataUrl: string; slug: string }) {
  const [items, setItems] = useState<Prispevek[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`${dataUrl}?t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => { if (alive) setItems((d.zive ?? []) as Prispevek[]); });
    return () => { alive = false; };
  }, [dataUrl]);

  if (!items) return null;
  const sorted = [...items].sort((a, b) => b.cas.localeCompare(a.cas));

  return (
    <div style={{ clear: 'both', margin: '1.5em 0', borderLeft: `3px solid ${RED}`, paddingLeft: 18 }}>
      {sorted.map((p, i) => (
        <article key={`${p.cas}-${i}`} style={{ position: 'relative', paddingBottom: 22, marginBottom: 22, borderBottom: i < sorted.length - 1 ? '1px solid #e6e3d9' : 'none' }}>
          <span style={{ position: 'absolute', left: -25, top: 4, width: 11, height: 11, borderRadius: 6, background: i === 0 ? RED : '#fff', border: `2px solid ${RED}` }} />
          <div style={{ fontFamily: 'var(--font-roboto-condensed), Arial, sans-serif', fontWeight: 700, fontSize: 15, color: i === 0 ? RED : MUTED, marginBottom: 6 }}>
            {p.cas}{i === 0 ? ' · nejnovější' : ''}
          </div>
          {p.text.split(/\n\s*\n/).map((para, j) => (
            <p key={j} style={{ margin: '0 0 0.7em', color: INK, fontSize: '1.0625rem', lineHeight: 1.6 }}>{inline(para)}</p>
          ))}
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
