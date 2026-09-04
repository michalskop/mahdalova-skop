'use client';

import { useState, useEffect } from 'react';
import styles from './figure.module.css';

interface FigureProps {
  /** Image source. A relative `images/…` path is resolved against the article folder. */
  src?: string;
  alt?: string;
  /** Optional italic caption shown under the image. */
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
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}

      {open ? (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={alt || 'Fotografie'}
          onClick={() => setOpen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resolvedSrc} alt={alt} className={styles.lightboxImg} />
          <button
            type="button"
            className={styles.lightboxClose}
            aria-label="Zavřít"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>
      ) : null}
    </figure>
  );
}

export default Figure;
