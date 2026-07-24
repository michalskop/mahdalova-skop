'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { IconChevronDown } from '@tabler/icons-react';
import { chapterHref, DPBP_CHAPTERS, DPBP_HOME } from './chapterNavigation';
import ProfileHead from './ProfileHead';
import styles from './ChapterRail.module.css';

interface ChapterRailProps {
  currentChapter: string;
  variant?: 'article' | 'landing';
}

export default function ChapterRail({ currentChapter, variant = 'article' }: ChapterRailProps) {
  const [open, setOpen] = useState(false);
  const current = DPBP_CHAPTERS.find(chapter => chapter.slug === currentChapter);
  if (!current) return null;

  return (
    <>
      <nav
        className={`${styles.rail} ${variant === 'landing' ? styles.landing : styles.article}`}
        aria-label="Navigace mezi kapitolami projektu"
        style={{ ['--active-chapter' as string]: current.accent } as CSSProperties}
      >
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

        <div className={styles.progress} aria-hidden>
          {DPBP_CHAPTERS.map(chapter => (
            <span
              key={chapter.id}
              className={chapter.slug === currentChapter ? styles.progressActive : undefined}
            />
          ))}
        </div>

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
        <nav className={styles.sticky} aria-label="Rychlá navigace kapitol">
          <div className={styles.stickyScroll}>
            {DPBP_CHAPTERS.map(chapter => (
              <Link
                key={chapter.id}
                className={styles.pill}
                href={chapterHref(chapter.slug)}
                aria-current={chapter.slug === currentChapter ? 'page' : undefined}
                style={{ ['--chapter-dot' as string]: chapter.accent } as CSSProperties}
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
