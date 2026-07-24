'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { IconChevronDown } from '@tabler/icons-react';
import { chapterHref, DPBP_CHAPTERS, DPBP_HOME } from './chapterNavigation';
import ProfileHead from './ProfileHead';
import type { ChapterContents } from './chapterContents.server';
import styles from './ChapterRail.module.css';

interface ChapterRailProps {
  currentChapter: string;
  variant?: 'article' | 'landing';
  chapterContents?: ChapterContents;
}

export default function ChapterRail({
  currentChapter,
  variant = 'article',
  chapterContents = {},
}: ChapterRailProps) {
  const [open, setOpen] = useState(false);
  const [previewSlug, setPreviewSlug] = useState(currentChapter);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [stickyTooltipVisible, setStickyTooltipVisible] = useState(false);
  const current = DPBP_CHAPTERS.find(chapter => chapter.slug === currentChapter);
  if (!current) return null;
  const preview = DPBP_CHAPTERS.find(chapter => chapter.slug === previewSlug) ?? current;
  const previewArticles = chapterContents[preview.slug] ?? [];

  const tooltip = (
    <div className={styles.tooltip} role="tooltip">
      <div className={styles.tooltipHeading}>
        <span style={{ background: preview.accent }} aria-hidden />
        <strong>{preview.id} · {preview.title}</strong>
      </div>
      {previewArticles.length > 0 ? (
        <ul>
          {previewArticles.map(title => <li key={title}>{title}</li>)}
        </ul>
      ) : (
        <p>Obsah kapitoly připravujeme.</p>
      )}
    </div>
  );

  return (
    <>
      <nav
        className={`${styles.rail} ${variant === 'landing' ? styles.landing : styles.article}`}
        aria-label="Navigace mezi kapitolami projektu"
        style={{ ['--active-chapter' as string]: current.accent } as CSSProperties}
        onMouseLeave={() => {
          setOpen(false);
          setTooltipVisible(false);
          setPreviewSlug(currentChapter);
        }}
      >
        {variant === 'article' ? (
          <div className={styles.primary}>
            <div className={styles.identity}>
              <Link href={DPBP_HOME} className={styles.project}>
                <ProfileHead silColor={current.accent} style={{ width: 18, height: 18 }} />
                <span>Data pro budoucí premiérku</span>
              </Link>
              <div className={styles.current}>
                <span className={styles.number}>Kapitola {current.id}/15</span>
                <span className={styles.accent} aria-hidden />
                <Link className={styles.title} href={chapterHref(current.slug)}>
                  {current.title}
                </Link>
                <span className={styles.accent} aria-hidden />
                <button
                  className={styles.toggle}
                  type="button"
                  onClick={() => setOpen(value => !value)}
                  onMouseEnter={() => setOpen(true)}
                  aria-expanded={open}
                  aria-controls="dpbp-chapter-list"
                  aria-label={open ? 'Skrýt obsah speciálu' : 'Zobrazit obsah speciálu'}
                >
                  <span>Obsah speciálu</span>
                  <IconChevronDown aria-hidden />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.landingCompact}>
            <span className={styles.landingLabel}>Kapitoly</span>
            <button
              className={styles.toggle}
              type="button"
              onClick={() => setOpen(value => !value)}
              onMouseEnter={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="dpbp-chapter-list"
              aria-label={open ? 'Skrýt obsah speciálu' : 'Zobrazit obsah speciálu'}
            >
              <span>Obsah speciálu</span>
              <IconChevronDown aria-hidden />
            </button>
          </div>
        )}

        <div
          className={styles.progress}
          onMouseLeave={() => {
            setTooltipVisible(false);
            setPreviewSlug(currentChapter);
          }}
        >
          {DPBP_CHAPTERS.map(chapter => (
            <Link
              key={chapter.id}
              className={chapter.slug === previewSlug ? styles.progressActive : undefined}
              href={chapterHref(chapter.slug)}
              style={{ ['--preview-color' as string]: chapter.accent } as CSSProperties}
              onMouseEnter={() => {
                setPreviewSlug(chapter.slug);
                setTooltipVisible(true);
              }}
              onFocus={() => {
                setPreviewSlug(chapter.slug);
                setTooltipVisible(true);
              }}
              aria-label={`${chapter.id}: ${chapter.title}`}
            />
          ))}
        </div>

        {tooltipVisible && tooltip}

        {open && (
          <div className={styles.chapterList} id="dpbp-chapter-list">
            {DPBP_CHAPTERS.map(chapter => (
              <Link
                key={chapter.id}
                className={styles.chapterLink}
                href={chapterHref(chapter.slug)}
                aria-current={chapter.slug === currentChapter ? 'page' : undefined}
                style={{ ['--chapter-dot' as string]: chapter.accent } as CSSProperties}
              >
                <span className={styles.chapterNumber}>{chapter.id}</span>
                <span className={styles.dot} aria-hidden />
                <span>{chapter.title}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>

      {variant === 'article' && (
        <nav
          className={styles.sticky}
          aria-label="Rychlá navigace kapitol"
          onMouseLeave={() => {
            setStickyTooltipVisible(false);
            setPreviewSlug(currentChapter);
          }}
        >
          {stickyTooltipVisible && <div className={styles.stickyTooltip}>{tooltip}</div>}
          <div className={styles.stickyScroll}>
            {DPBP_CHAPTERS.map(chapter => (
              <Link
                key={chapter.id}
                className={styles.pill}
                href={chapterHref(chapter.slug)}
                aria-current={chapter.slug === currentChapter ? 'page' : undefined}
                style={{ ['--chapter-dot' as string]: chapter.accent } as CSSProperties}
                onMouseEnter={() => {
                  setPreviewSlug(chapter.slug);
                  setStickyTooltipVisible(true);
                }}
                onFocus={() => {
                  setPreviewSlug(chapter.slug);
                  setStickyTooltipVisible(true);
                }}
              >
                <span className={styles.pillDot} aria-hidden />
                <span>{chapter.shortTitle}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
