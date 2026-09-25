'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

// Horní hrana nejvyššího písmena titulku (px od horního okraje jeho řádku),
// spočtená z metriky skutečně použitého písma přes canvas.measureText.
function glyphTopOffset(el: HTMLElement) {
  const cs = getComputedStyle(el);
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return 0;
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const m = ctx.measureText(el.textContent || 'Á');
  const content = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent;
  const lh = parseFloat(cs.lineHeight);
  const halfLeading = Number.isFinite(lh) ? (lh - content) / 2 : 0;
  return halfLeading + m.fontBoundingBoxAscent - m.actualBoundingBoxAscent;
}

interface ChartSignatureProps {
  size?: number | string;
  color?: string;
  layout?: 'inline' | 'stacked';
  textSize?: number | string;
  textWeight?: number;
  style?: React.CSSProperties;
  /** Titulek grafu: horní okraj kolečka se zarovná s horní hranou jeho nejvyššího písmena. */
  titleRef?: RefObject<HTMLElement | null>;
}

export default function ChartSignature({
  size = 22,
  color = '#101432',
  layout = 'inline',
  textSize,
  textWeight = 400,
  style,
  titleRef,
}: ChartSignatureProps) {
  const selfRef = useRef<HTMLAnchorElement>(null);
  const [alignTop, setAlignTop] = useState<number | null>(null);
  useIsoLayoutEffect(() => {
    const title = titleRef?.current, self = selfRef.current;
    if (!title || !self) return;
    const measure = () => {
      const parent = self.parentElement;
      const svg = self.querySelector('svg');
      if (!parent || !svg) return;
      // bez vlastního posunu: kde by kolečko bylo, a kde je horní hrana písmen
      const selfTop = self.getBoundingClientRect().top - (parseFloat(self.style.marginTop) || 0);
      const svgInSelf = svg.getBoundingClientRect().top - self.getBoundingClientRect().top;
      const target = title.getBoundingClientRect().top + glyphTopOffset(title);
      setAlignTop(Math.max(0, Math.round((target - selfTop - svgInSelf) * 2) / 2));
    };
    measure();
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(title);
    return () => ro.disconnect();
  }, [titleRef]);
  const stacked = layout === 'stacked';
  const fontSize = textSize ?? (
    typeof size === 'number' ? size * (stacked ? 0.47 : 0.52) : 14
  );

  return (
    <Link
      href="https://datatimes.cz"
      target="_blank"
      rel="noopener noreferrer"
      ref={selfRef}
      className="dpbp-chart-signature"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: stacked ? 'column' : 'row',
        gap: stacked ? 3 : 6,
        textDecoration: 'none',
        textAlign: 'center',
        fontFamily: 'var(--font-roboto-slab), Georgia, serif',
        fontSize,
        fontWeight: textWeight,
        color, lineHeight: 1, ...style,
        ...(titleRef ? { alignSelf: 'flex-start', marginTop: alignTop ?? 0 } : null),
      }}
    >
      <svg width={size} height={size} viewBox="112 112 276 276" style={{ flex: '0 0 auto', display: 'block' }}>
        <defs>
          <linearGradient id="chartSignatureGradient" x1="1" x2="0.25" y1="0.5" y2="1">
            <stop offset="0%" stopColor="#ffdc33" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffdc33" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffdc33" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffdc33" stopOpacity="1" />
          </linearGradient>
        </defs>
        <g transform="rotate(-30 250 250)">
          <path fill="none" stroke="#ffdc33" strokeWidth="76" strokeLinecap="round" d="M 250 350 A 100 100 0 0 0 336.60254037844385 300" />
          <path fill="none" stroke="#f76800" strokeWidth="76" strokeLinecap="round" d="M 336.6025403784439 300 A 100 100 0 0 0 250 150" />
          <path fill="none" stroke="#de1743" strokeWidth="76" strokeLinecap="round" d="M 250 150 A 100 100 0 0 0 250 350" />
          <path fill="none" stroke="url(#chartSignatureGradient)" strokeWidth="76" strokeLinecap="round" d="M 250 350 A 100 100 0 0 0 336.60254037844385 300" />
        </g>
      </svg>
      DataTimes.cz
    </Link>
  );
}
