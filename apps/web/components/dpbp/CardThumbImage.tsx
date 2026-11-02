'use client';

import { useEffect, useRef, useState } from 'react';

// Náhled v kartě speciálu: v rámečku na šířku (1200 × 630) se obrázek ořízne,
// jen když tím nepřijde o víc než ~20 %, jinak se ukáže celý a okolo zůstane
// klidný pruh barvy. Stejné pravidlo jako packages/ui/src/lib/coverFit.ts
// (tam pro náhledy 5:4; balíček tenhle modul neexportuje).
const MAX_COVER_CROP = 0.2;
function fitFor(w: number, h: number, target: number): 'cover' | 'contain' {
  if (!w || !h) return 'cover';
  const r = w / h;
  const crop = r > target ? 1 - target / r : 1 - r / target;
  return crop > MAX_COVER_CROP ? 'contain' : 'cover';
}
export default function CardThumbImage({ src, className, ratio = 1200 / 630 }: { src: string; className?: string; ratio?: number }) {
  const ref = useRef<HTMLImageElement | null>(null);
  const [fit, setFit] = useState<'cover' | 'contain'>(src.endsWith('.svg') ? 'contain' : 'cover');

  useEffect(() => {
    const el = ref.current;
    if (el && el.naturalWidth && !src.endsWith('.svg')) setFit(fitFor(el.naturalWidth, el.naturalHeight, ratio));
  }, [src, ratio]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt=""
      loading="lazy"
      className={className}
      style={{ objectFit: fit }}
      onLoad={(e) => {
        if (!src.endsWith('.svg')) setFit(fitFor(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight, ratio));
      }}
    />
  );
}
