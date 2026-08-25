'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMantineTheme, useMantineColorScheme } from '@mantine/core';
import styles from './PhotoGallery.module.css';

/** Změří reálný počet sloupců CSS gridu a překreslí při změně šířky. */
function useColumnCount(ref: React.RefObject<HTMLElement | null>, fallback: number) {
  const [cols, setCols] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const tracks = getComputedStyle(el)
        .gridTemplateColumns.split(' ')
        .filter((t) => t && t !== '0px').length;
      if (tracks > 0) setCols(tracks);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return cols;
}

export interface GalleryImage {
  /** Plná URL fotky (rozřešená z názvu souboru ve wrapperu aplikace). */
  src: string;
  /** Popisek přes spodní okraj fotky (výsuvný panel). */
  caption?: string;
  /** Nepovinný zdroj / autor fotky (menší, pod popiskem). */
  credit?: string;
  /** Alternativní text pro čtečky. */
  alt?: string;
}

interface PhotoGalleryProps {
  images: GalleryImage[];
  /** Kolik náhledů ukázat ve sbaleném stavu, než se zbytek schová pod "+N". */
  previewCount?: number;
}

const CameraIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 8a2 2 0 0 1 2-2h1.2l.9-1.4A1 1 0 0 1 9 4h6a1 1 0 0 1 .9.6L16.8 6H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <circle cx="12" cy="12.5" r="3.2" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const CollapseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="m7 14 5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CaptionIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 6h14M5 11h14M5 16h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export function PhotoGallery({ images, previewCount }: PhotoGalleryProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const [expanded, setExpanded] = useState(false);
  // Popisky jsou ve výchozím stavu otevřené; tady evidujeme ty zavřené.
  const [closedCaptions, setClosedCaptions] = useState<Set<number>>(() => new Set());
  const figureRefs = useRef<Array<HTMLElement | null>>([]);
  const gridRef = useRef<HTMLDivElement | null>(null);
  // Kolik náhledů ukázat: buď pevně z propu, nebo dynamicky = plné dva řádky.
  const columns = useColumnCount(gridRef, 4);
  const effectivePreview = previewCount ?? columns * 2;

  const accent = theme.colors.brand[6];
  const mat = colorScheme === 'dark' ? theme.colors.gray[8] : theme.colors.background[2];

  const cssVars = {
    '--pg-accent': accent,
    '--pg-mat': mat,
  } as React.CSSProperties;

  if (!images || images.length === 0) return null;

  const openAt = (index: number) => {
    setExpanded(true);
    // po přepnutí do rozbaleného stavu odroluj na kliknutou fotku
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        figureRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  };

  const collapse = () => setExpanded(false);

  const toggleCaption = (index: number) =>
    setClosedCaptions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  // --- Sbalený stav: mřížka náhledů ---
  if (!expanded) {
    const hasMore = images.length > effectivePreview;
    const shown = hasMore ? images.slice(0, effectivePreview) : images;

    return (
      <div className={styles.wrapper} style={cssVars}>
        <div className={styles.grid} ref={gridRef}>
          {shown.map((img, i) => {
            const isLastWithMore = hasMore && i === shown.length - 1;
            return (
              <button
                key={i}
                type="button"
                className={styles.thumb}
                onClick={() => openAt(i)}
                aria-label={`Otevřít fotogalerii, fotka ${i + 1} z ${images.length}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className={styles.thumbImg} src={img.src} alt={img.alt || img.caption || ''} loading="lazy" />
                {isLastWithMore ? (
                  <span className={styles.moreOverlay}>+{images.length - effectivePreview + 1}</span>
                ) : (
                  <span className={styles.badge}>{i + 1}</span>
                )}
              </button>
            );
          })}
        </div>
        <div
          className={styles.hint}
          role="button"
          tabIndex={0}
          onClick={() => openAt(0)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openAt(0);
            }
          }}
        >
          <CameraIcon />
          <span>Galerie · {images.length} {plural(images.length)} — klikněte pro zvětšení</span>
        </div>
      </div>
    );
  }

  // --- Rozbalený stav: svislý sloupec velkých fotek ---
  return (
    <div className={styles.wrapper} style={cssVars}>
      <div className={styles.stack}>
        {images.map((img, i) => {
          const hasCaption = Boolean(img.caption || img.credit);
          const isClosed = closedCaptions.has(i);
          return (
            <figure
              key={i}
              className={styles.figure}
              ref={(el) => {
                figureRefs.current[i] = el;
              }}
            >
              <div className={styles.frame}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className={styles.fullImg} src={img.src} alt={img.alt || img.caption || ''} loading="lazy" />
                <span className={styles.counter}>{i + 1} / {images.length}</span>

                {hasCaption && !isClosed && (
                  <figcaption className={styles.captionPanel}>
                    <button
                      type="button"
                      className={styles.captionClose}
                      onClick={() => toggleCaption(i)}
                      aria-label="Skrýt popisek"
                    >
                      ×
                    </button>
                    {img.caption && <span className={styles.captionText}>{img.caption}</span>}
                    {img.credit && <span className={styles.credit}>{img.credit}</span>}
                  </figcaption>
                )}

                {hasCaption && isClosed && (
                  <button
                    type="button"
                    className={styles.captionReopen}
                    onClick={() => toggleCaption(i)}
                    aria-label="Zobrazit popisek"
                  >
                    <CaptionIcon />
                    Popisek
                  </button>
                )}
              </div>
            </figure>
          );
        })}
      </div>
      <div className={styles.collapseBar}>
        <button type="button" className={styles.collapseBtn} onClick={collapse}>
          <CollapseIcon />
          Sbalit galerii
        </button>
      </div>
    </div>
  );
}

function plural(n: number): string {
  if (n === 1) return 'fotka';
  if (n >= 2 && n <= 4) return 'fotky';
  return 'fotek';
}

export default PhotoGallery;
