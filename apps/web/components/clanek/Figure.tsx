'use client';

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
 * normal full-width block. Registered as `<Figure />` in ArticleRenderer.
 */
export function Figure({ src = '', alt = '', caption, side = 'right', slug = '' }: FigureProps) {
  const resolvedSrc = src.startsWith('http')
    ? src
    : `/clanek/_articles/${slug}/images/${src.replace('images/', '')}`;

  const className =
    side === 'center' ? styles.center : side === 'left' ? styles.left : styles.right;

  return (
    <figure className={className}>
      {/* Plain <img>: a fixed-width bleed layout does not benefit from the
          next/image sizing used for full-width article images. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={resolvedSrc} alt={alt} className={styles.img} />
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  );
}

export default Figure;
