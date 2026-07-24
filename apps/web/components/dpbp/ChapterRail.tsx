'use client';

import { useState, useEffect, type CSSProperties } from 'react';
import Link from 'next/link';
import { IconChevronDown, IconX, IconArrowLeft } from '@tabler/icons-react';
import { chapterHref, DPBP_CHAPTERS, DPBP_HOME } from './chapterNavigation';
import ProfileHead from './ProfileHead';
import type { ChapterContents, ChapterArticleItem } from './chapterContents.server';
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
  // Strict single-window state: 'closed' | 'chapters' | 'articleList'
  const [panelMode, setPanelMode] = useState<'closed' | 'chapters' | 'articleList'>('closed');
  const [selectedSlug, setSelectedSlug] = useState<string>(currentChapter);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [hoveredStickySlug, setHoveredStickySlug] = useState<string | null>(null);

  const currentChapterMeta = DPBP_CHAPTERS.find(c => c.slug === currentChapter) ?? DPBP_CHAPTERS[0];

  // Header display prioritizes hover over selected chapter
  const displayChapter = DPBP_CHAPTERS.find(c => c.slug === (hoveredSlug ?? selectedSlug ?? currentChapter)) ?? currentChapterMeta;

  // Selected chapter for article list window
  const selectedChapterMeta = DPBP_CHAPTERS.find(c => c.slug === selectedSlug) ?? displayChapter;

  const selectedArticles: ChapterArticleItem[] = (chapterContents[selectedChapterMeta.slug] ?? []).map(item =>
    typeof item === 'string'
      ? { slug: item, title: item, href: `/specialy/data-pro-budouci-premierku/${selectedChapterMeta.slug}` }
      : item
  );

  // Close panel on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPanelMode('closed');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDashClick = (slug: string) => {
    if (panelMode === 'articleList' && selectedSlug === slug) {
      setPanelMode('closed');
    } else {
      setSelectedSlug(slug);
      setPanelMode('articleList');
    }
  };

  const toggleChaptersOverview = () => {
    if (panelMode === 'chapters') {
      setPanelMode('closed');
    } else {
      setPanelMode('chapters');
    }
  };

  return (
    <>
      <nav
        className={`${styles.rail} ${variant === 'landing' ? styles.landing : styles.article}`}
        aria-label="Navigace mezi kapitolami projektu"
        style={{ ['--active-chapter' as string]: displayChapter.accent } as CSSProperties}
        onMouseLeave={() => setHoveredSlug(null)}
      >
        {variant === 'article' ? (
          <div className={styles.primary}>
            <div className={styles.identity}>
              {/* Řádek 1: Data pro budoucí premiérku + barevné logo (hlava koukající vlevo na název) + tenká svislá čárka + Obsah ↓ */}
              <div className={styles.row1}>
                <Link href={DPBP_HOME} className={styles.project}>
                  <span>Data pro budoucí premiérku</span>
                  <ProfileHead
                    silColor={displayChapter.accent}
                    style={{ width: 18, height: 18 }}
                  />
                </Link>
                <span className={styles.accent} aria-hidden />
                <button
                  className={styles.toggle}
                  type="button"
                  onClick={toggleChaptersOverview}
                  aria-expanded={panelMode === 'chapters'}
                  aria-label={panelMode === 'chapters' ? 'Skrýt obsah' : 'Zobrazit obsah'}
                >
                  <span>Obsah</span>
                  <IconChevronDown
                    style={{
                      transform: panelMode === 'chapters' ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.18s ease',
                    }}
                    aria-hidden
                  />
                </button>
              </div>

              {/* Řádek 2: Kapitola XX/15 + svislá čárka + Název kapitoly */}
              <div className={styles.row2}>
                <span className={styles.number}>Kapitola {displayChapter.id}/15</span>
                <span className={styles.accent} aria-hidden />
                <Link className={styles.title} href={chapterHref(displayChapter.slug)}>
                  {displayChapter.title}
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.landingCompact}>
            <span className={styles.landingLabel}>Kapitoly</span>
            <button
              className={styles.toggle}
              type="button"
              onClick={toggleChaptersOverview}
              aria-expanded={panelMode === 'chapters'}
              aria-label={panelMode === 'chapters' ? 'Skrýt obsah' : 'Zobrazit obsah'}
            >
              <span>Obsah</span>
              <IconChevronDown
                style={{
                  transform: panelMode === 'chapters' ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.18s ease',
                }}
                aria-hidden
              />
            </button>
          </div>
        )}

        {/* 15 Vodorovných čárek / Posuvník */}
        <div className={styles.progress}>
          {DPBP_CHAPTERS.map(chapter => {
            const isHovered = chapter.slug === hoveredSlug;
            const isSelected = panelMode === 'articleList' && chapter.slug === selectedSlug;
            const isCurrent = chapter.slug === currentChapter;
            const isActive = isHovered || isSelected || isCurrent;

            return (
              <button
                key={chapter.id}
                type="button"
                className={`${styles.dashBtn} ${isActive ? styles.dashActive : ''}`}
                style={{ ['--preview-color' as string]: chapter.accent } as CSSProperties}
                onMouseEnter={() => setHoveredSlug(chapter.slug)}
                onFocus={() => setHoveredSlug(chapter.slug)}
                onClick={() => handleDashClick(chapter.slug)}
                aria-label={`Kapitola ${chapter.id}: ${chapter.title}`}
              />
            );
          })}
        </div>

        {/* JEDINÉ OKNO / PANEL */}
        {panelMode === 'chapters' && (
          <div className={styles.windowPanel}>
            <div className={styles.windowHeader}>
              <span className={styles.windowHeaderTitle}>Všechny kapitoly speciálu</span>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setPanelMode('closed')}
                aria-label="Zavřít okno (Esc)"
              >
                <IconX size={16} />
              </button>
            </div>

            <div className={styles.chapterGrid}>
              {DPBP_CHAPTERS.map(chapter => (
                <button
                  key={chapter.id}
                  type="button"
                  className={styles.chapterGridItem}
                  style={{ ['--chapter-accent' as string]: chapter.accent } as CSSProperties}
                  onMouseEnter={() => setHoveredSlug(chapter.slug)}
                  onClick={() => {
                    setSelectedSlug(chapter.slug);
                    setPanelMode('articleList');
                  }}
                >
                  <span className={styles.chapterGridNum} style={{ color: chapter.accent }}>
                    {chapter.id}
                  </span>
                  <span className={styles.dot} style={{ background: chapter.accent }} aria-hidden />
                  <span className={styles.chapterGridTitle}>{chapter.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {panelMode === 'articleList' && (
          <div
            className={styles.windowPanel}
            style={{ ['--chapter-accent' as string]: selectedChapterMeta.accent } as CSSProperties}
          >
            <div className={styles.windowHeader}>
              <div className={styles.windowTitleGroup}>
                <span className={styles.panelDot} style={{ background: selectedChapterMeta.accent }} aria-hidden />
                {/* Nadpis ve tvaru "09 · Energie a energetická bezpečnost" (bez slova Kapitola) */}
                <Link
                  href={chapterHref(selectedChapterMeta.slug)}
                  className={styles.windowTitleLink}
                  title="Přejít na úvodní stránku kapitoly"
                >
                  <strong className={styles.windowTitle}>
                    {selectedChapterMeta.id} · {selectedChapterMeta.title}
                  </strong>
                </Link>
              </div>

              <div className={styles.windowHeaderActions}>
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => setPanelMode('chapters')}
                >
                  <IconArrowLeft size={14} />
                  <span>Obsah</span>
                </button>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={() => setPanelMode('closed')}
                  aria-label="Zavřít okno (Esc)"
                >
                  <IconX size={16} />
                </button>
              </div>
            </div>

            {selectedArticles.length > 0 ? (
              <ul className={styles.articleList}>
                {selectedArticles.map(article => (
                  <li key={article.href || article.title}>
                    <Link href={article.href} className={styles.articleLink}>
                      <span>{article.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyNotice}>Obsah kapitoly připravujeme.</p>
            )}
          </div>
        )}
      </nav>

      {/* Sticky spodní lišta na mobilu i desktopu (pro články i landing pages všech kapitol) */}
      <nav className={styles.sticky} aria-label="Rychlá navigace kapitol">
        <div className={styles.stickyScroll}>
          {DPBP_CHAPTERS.map(chapter => {
            const isCurrent = chapter.slug === currentChapter;
            const isHovered = chapter.slug === hoveredStickySlug;
            const isSelected = panelMode === 'articleList' && chapter.slug === selectedSlug;
            const isActive = isCurrent || isHovered || isSelected;

            return (
              <div key={chapter.id} className={styles.stickyPillWrapper}>
                {isHovered && (
                  <div
                    className={styles.stickyTooltip}
                    style={{ ['--chapter-accent' as string]: chapter.accent } as CSSProperties}
                  >
                    <strong>{chapter.id}</strong> {chapter.shortTitle}
                  </div>
                )}
                <button
                  type="button"
                  className={`${styles.pillDotOnly} ${isActive ? styles.pillActive : ''}`}
                  style={{ ['--chapter-dot' as string]: chapter.accent } as CSSProperties}
                  onMouseEnter={() => setHoveredStickySlug(chapter.slug)}
                  onMouseLeave={() => setHoveredStickySlug(null)}
                  onClick={() => handleDashClick(chapter.slug)}
                  aria-label={`Kapitola ${chapter.id}: ${chapter.title}`}
                />
              </div>
            );
          })}
        </div>
      </nav>
    </>
  );
}
