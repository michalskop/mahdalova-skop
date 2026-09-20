'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArticleCard } from '@repo/ui/components/ArticleCard';

export default function CoverPreview() {
  const [ready, setReady] = useState(false);
  const [cover, setCover] = useState({ image: '', title: 'Titulek článku', excerpt: 'Náhled skutečné homepage karty DataTimes.' });
  useEffect(() => {
    setReady(true);
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      const d = event.data;
      if (d?.type !== 'datatimes-cover-preview' || typeof d.image !== 'string' || !d.image.startsWith('blob:')) return;
      if (new URL(d.image.slice(5)).origin !== window.location.origin) return;
      setCover({ image: d.image, title: String(d.title || 'Titulek článku').slice(0, 300), excerpt: String(d.excerpt || '').slice(0, 600) });
    };
    window.addEventListener('message', receive);
    window.parent.postMessage({ type: 'datatimes-cover-preview-ready' }, window.location.origin);
    return () => window.removeEventListener('message', receive);
  }, []);
  if (!ready) return null;
  return createPortal(<main style={{ position: 'fixed', inset: 0, overflow: 'auto', zIndex: 10000, background: '#fdfbf7', padding: 16 }}>
    <div style={{ maxWidth: 420, margin: '0 auto', containerType: 'inline-size', pointerEvents: 'none' }}>
      <ArticleCard title={cover.title} excerpt={cover.excerpt} coverImage={cover.image || null}
        coverFit="cover" date="2026-09-17" author="DataTimes" slug="preview" tags={[]} />
    </div>
  </main>, document.body);
}
