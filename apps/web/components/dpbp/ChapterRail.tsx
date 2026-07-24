'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { IconBook2, IconHome } from '@tabler/icons-react';
import { chapterHref, DPBP_CHAPTERS, DPBP_HOME } from './chapterNavigation';
import styles from './ChapterRail.module.css';

interface ChapterRailProps {
  currentChapter: string;
}

export default function ChapterRail({ currentChapter }: ChapterRailProps) {
  const current = DPBP_CHAPTERS.find(chapter => chapter.slug === currentChapter);

  return (
    <nav className={styles.rail} aria-label="Kapitoly projektu">
      <p className={styles.heading}>Kapitoly</p>
      <div className={styles.scroll}>
        <div className={styles.utility}>
          <Link className={styles.link} href={DPBP_HOME} aria-label="Hlavní stránka projektu">
            <IconHome className={styles.icon} aria-hidden />
            <span>Projekt</span>
          </Link>
          <Link
            className={styles.link}
            href={chapterHref(currentChapter)}
            aria-label={current ? `Landing kapitoly ${current.title}` : 'Landing aktuální kapitoly'}
          >
            <IconBook2 className={styles.icon} aria-hidden />
            <span>Aktuální</span>
          </Link>
        </div>
        <div className={styles.chapters}>
          {DPBP_CHAPTERS.map(chapter => (
            <Link
              key={chapter.id}
              className={`${styles.link} ${styles.chapterLink}`}
              href={chapterHref(chapter.slug)}
              aria-current={chapter.slug === currentChapter ? 'page' : undefined}
              aria-label={`Kapitola ${chapter.id}: ${chapter.title}`}
              style={{ ['--chapter-dot' as string]: chapter.accent } as CSSProperties}
            >
              <span className={styles.dot} aria-hidden />
              <span className={styles.chapterLabel}>{chapter.shortTitle}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
