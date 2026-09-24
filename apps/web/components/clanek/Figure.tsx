'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { fixCzechTypography } from '@/lib/remark-czech-typography';
import styles from './figure.module.css';

/* Captions arrive as a plain JSX attribute string, so markdown inside them is not
   parsed by MDX. Support the inline subset captions actually use: [text](url),
   **bold** and _italic_ / *italic*. Czech typography (nbsp) is applied to text. */
const INLINE_MD = /\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)|\*\*([^*]+)\*\*|_([^_]+)_|\*([^*]+)\*/g;

function renderCaption(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  INLINE_MD.lastIndex = 0;
  while ((m = INLINE_MD.exec(text))) {
    if (m.index > last) out.push(fixCzechTypography(text.slice(last, m.index)));
    const key = m.index;
    if (m[1] !== undefined) {
      out.push(
        <a key={key} href={m[2]} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
          {fixCzechTypography(m[1])}
        </a>,
      );
    } else if (m[3] !== undefined) {
      out.push(<strong key={key}>{fixCzechTypography(m[3])}</strong>);
    } else {
      out.push(<em key={key}>{fixCzechTypography(m[4] ?? m[5])}</em>);
    }
    last = INLINE_MD.lastIndex;
  }
  if (last < text.length) out.push(fixCzechTypography(text.slice(last)));
  return out;
}

interface FigureProps {
  /** Image source. A relative `images/…` path is resolved against the article folder. */
  src?: string;
  alt?: string;
  /** Optional italic caption shown under the image and over the enlarged photo.
   *  Supports inline markdown: [odkaz](url), **tučně**, _kurzíva_. */
  caption?: string;
  /** Placement: float left/right and bleed out of the column, or a centered
   *  non-floated block (good for tall/portrait visuals). Defaults to right. */
  side?: 'left' | 'right' | 'center';
  /** Article slug – injected by ArticleRenderer, used to resolve `images/…` paths. */
  slug?: string;
}

/**
 * A floated photo that bleeds out of the reading column on its outer edge while
 * the running text wraps around the inner edge. On mobile it collapses to a
 * normal full-width block. Clicking the photo opens a full-screen lightbox so
 * readers can inspect details. Registered as `<Figure />` in ArticleRenderer.
 */
export function Figure({ src = '', alt = '', caption, side = 'right', slug = '' }: FigureProps) {
  const [open, setOpen] = useState(false);

  const resolvedSrc = src.startsWith('http')
    ? src
    : `/clanek/_articles/${slug}/images/${src.replace('images/', '')}`;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const className =
    side === 'center' ? styles.center : side === 'left' ? styles.left : styles.right;

  return (
    <figure className={className}>
      {/* Plain <img>: a fixed-width bleed layout does not benefit from the
          next/image sizing used for full-width article images. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolvedSrc}
        alt={alt}
        className={styles.img}
        role="button"
        tabIndex={0}
        aria-label="Zvětšit fotografii"
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(true);
          }
        }}
      />
      {caption ? <figcaption className={styles.caption}>{renderCaption(caption)}</figcaption> : null}

      {open ? (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={alt || 'Fotografie'}
          onClick={() => setOpen(false)}
        >
          <div className={styles.lightboxFrame}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resolvedSrc} alt={alt} className={styles.lightboxImg} />
            {caption ? <div className={styles.lightboxCaption}>{renderCaption(caption)}</div> : null}
          </div>
          <button
            type="button"
            className={styles.lightboxClose}
            aria-label="Zavřít"
            onClick={() => setOpen(false)}
          >
            {/* SVG instead of the "×" glyph: font metrics push the glyph off
                the circle's optical centre, a drawn cross sits dead centre. */}
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                d="M6 6 L18 18 M18 6 L6 18"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </button>
        </div>
      ) : null}
    </figure>
  );
}

export default Figure;
