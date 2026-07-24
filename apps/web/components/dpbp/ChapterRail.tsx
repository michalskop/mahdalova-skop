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
  // Separate panel modes for top and bottom rails so panels open in the rail that was clicked
  const [topPanelMode, setTopPanelMode] = useState<'closed' | 'chapters' | 'articleList'>('closed');
  const [bottomPanelMode, setBottomPanelMode] = useState<'closed' | 'chapters' | 'articleList'>('closed');

  const [topSelectedSlug, setTopSelectedSlug] = useState<string>(currentChapter);
  const [bottomSelectedSlug, setBottomSelectedSlug] = useState<string>(currentChapter);

  // Synchronized hover state across both top and bottom menus
  const [sharedHoveredSlug, setSharedHoveredSlug] = useState<string | null>(null);

  const currentChapterMeta = DPBP_CHAPTERS.find(c => c.slug === currentChapter) ?? DPBP_CHAPTERS[0];

  // The active chapter being inspected (prioritizes hover -> active top/bottom selected -> current chapter)
  const activeSlug =
    sharedHoveredSlug ??
    (topPanelMode === 'articleList'
      ? topSelectedSlug
      : bottomPanelMode === 'articleList'
      ? bottomSelectedSlug
      : currentChapter);

  const activeChapterMeta = DPBP_CHAPTERS.find(c => c.slug === activeSlug) ?? currentChapterMeta;

  // Selected chapter for top article list window
  const topSelectedMeta = DPBP_CHAPTERS.find(c => c.slug === topSelectedSlug) ?? currentChapterMeta;
  const topArticles: ChapterArticleItem[] = (chapterContents[topSelectedMeta.slug] ?? []).map(item =>
    typeof item === 'string'
      ? { slug: item, title: item, href: `/specialy/data-pro-budouci-premierku/${topSelectedMeta.slug}` }
      : item
  );

  // Selected chapter for bottom article list window
  const bottomSelectedMeta = DPBP_CHAPTERS.find(c => c.slug === bottomSelectedSlug) ?? currentChapterMeta;
  const bottomArticles: ChapterArticleItem[] = (chapterContents[bottomSelectedMeta.slug] ?? []).map(item =>
    typeof item === 'string'
      ? { slug: item, title: item, href: `/specialy/data-pro-budouci-premierku/${bottomSelectedMeta.slug}` }
      : item
  );

  // Close panels on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setTopPanelMode('closed');
        setBottomPanelMode('closed');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTopDashClick = (slug: string) => {
    setBottomPanelMode('closed');
    if (topPanelMode === 'articleList' && topSelectedSlug === slug) {
      setTopPanelMode('closed');
    } else {
      setTopSelectedSlug(slug);
      setTopPanelMode('articleList');
    }
  };

  const handleBottomDashClick = (slug: string) => {
    setTopPanelMode('closed');
    if (bottomPanelMode === 'articleList' && bottomSelectedSlug === slug) {
      setBottomPanelMode('closed');
    } else {
      setBottomSelectedSlug(slug);
      setBottomPanelMode('articleList');
    }
  };

  const toggleTopChaptersOverview = () => {
    setBottomPanelMode('closed');
    setTopPanelMode(prev => (prev === 'chapters' ? 'closed' : 'chapters'));
  };

  return (
    <>
      {/* HORNÍ NAVIGAČNÍ LIŠTA (v hlavičce článku / landing page) */}
      <nav
        className={`${styles.rail} ${variant === 'landing' ? styles.landing : styles.article}`}
        aria-label="Navigace mezi kapitolami projektu"
        style={{ ['--active-chapter' as string]: activeChapterMeta.accent } as CSSProperties}
        onMouseLeave={() => setSharedHoveredSlug(null)}
      >
        {variant === 'article' ? (
          <div className={styles.primary}>
            <div className={styles.identity}>
              {/* Řádek 1: Data pro budoucí premiérku + barevné logo (hlava koukající vlevo) + svislá čárka + Obsah ↓ */}
              <div className={styles.row1}>
                <Link href={DPBP_HOME} className={styles.project}>
                  <span>Data pro budoucí premiérku</span>
                  <ProfileHead
                    silColor={activeChapterMeta.accent}
                    style={{ width: 18, height: 18 }}
                  />
                </Link>
                <span className={styles.accent} aria-hidden />
                <button
                  className={styles.toggle}
                  type="button"
                  onClick={toggleTopChaptersOverview}
                  aria-expanded={topPanelMode === 'chapters'}
                  aria-label={topPanelMode === 'chapters' ? 'Skrýt obsah' : 'Zobrazit obsah'}
                >
                  <span>Obsah</span>
                  <IconChevronDown
                    style={{
                      transform: topPanelMode === 'chapters' ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.18s ease',
                    }}
                    aria-hidden
                  />
                </button>
              </div>

              {/* Řádek 2: Kapitola XX/15 + svislá čárka + Název kapitoly (dynamicky reaguje na hover v obou menu!) */}
              <div className={styles.row2}>
                <span className={styles.number}>Kapitola {activeChapterMeta.id}/15</span>
                <span className={styles.accent} aria-hidden />
                <Link className={styles.title} href={chapterHref(activeChapterMeta.slug)}>
                  {activeChapterMeta.title}
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
              onClick={toggleTopChaptersOverview}
              aria-expanded={topPanelMode === 'chapters'}
              aria-label={topPanelMode === 'chapters' ? 'Skrýt obsah' : 'Zobrazit obsah'}
            >
              <span>Obsah</span>
              <IconChevronDown
                style={{
                  transform: topPanelMode === 'chapters' ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.18s ease',
                }}
                aria-hidden
              />
            </button>
          </div>
        )}

        {/* 15 Vodorovných čárek – svítí JEN JEDNA barva, nad kterou je právě myš / aktivní kapitola */}
        <div className={styles.progress}>
          {DPBP_CHAPTERS.map(chapter => {
            const isHovered = chapter.slug === sharedHoveredSlug;
            const isActive = chapter.slug === activeSlug;

            return (
              <div key={chapter.id} className={styles.dashItem}>
                {isHovered && topPanelMode === 'closed' && (
                  <div
                    className={styles.dashPointerTooltip}
                    style={{ ['--chapter-accent' as string]: chapter.accent } as CSSProperties}
                  >
                    <span className={styles.tooltipNum} style={{ color: chapter.accent }}>
                      {chapter.id}
                    </span>
                    <span className={styles.tooltipTitle}>{chapter.title}</span>
                  </div>
                )}
                <button
                  type="button"
                  className={`${styles.dashBtn} ${isActive ? styles.dashActive : ''}`}
                  style={{ ['--preview-color' as string]: chapter.accent } as CSSProperties}
                  onMouseEnter={() => setSharedHoveredSlug(chapter.slug)}
                  onFocus={() => setSharedHoveredSlug(chapter.slug)}
                  onClick={() => handleTopDashClick(chapter.slug)}
                  aria-label={`Kapitola ${chapter.id}: ${chapter.title}`}
                />
              </div>
            );
          })}
        </div>

        {/* HORNÍ OKNO / PANEL */}
        {topPanelMode === 'chapters' && (
          <div className={styles.windowPanel}>
            <div className={styles.windowHeader}>
              <span className={styles.windowHeaderTitle}>Všechny kapitoly speciálu</span>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setTopPanelMode('closed')}
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
                  onMouseEnter={() => setSharedHoveredSlug(chapter.slug)}
                  onClick={() => {
                    setTopSelectedSlug(chapter.slug);
                    setTopPanelMode('articleList');
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

        {topPanelMode === 'articleList' && (
          <div
            className={styles.windowPanel}
            style={{ ['--chapter-accent' as string]: topSelectedMeta.accent } as CSSProperties}
          >
            <div className={styles.windowHeader}>
              <div className={styles.windowTitleGroup}>
                <span className={styles.panelDot} style={{ background: topSelectedMeta.accent }} aria-hidden />
                <Link
                  href={chapterHref(topSelectedMeta.slug)}
                  className={styles.windowTitleLink}
                  title="Přejít na úvodní stránku kapitoly"
                >
                  <strong className={styles.windowTitle}>
                    {topSelectedMeta.id} · {topSelectedMeta.title}
                  </strong>
                </Link>
              </div>

              <div className={styles.windowHeaderActions}>
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => setTopPanelMode('chapters')}
                >
                  <IconArrowLeft size={14} />
                  <span>Obsah</span>
                </button>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={() => setTopPanelMode('closed')}
                  aria-label="Zavřít okno (Esc)"
                >
                  <IconX size={16} />
                </button>
              </div>
            </div>

            {topArticles.length > 0 ? (
              <ul className={styles.articleList}>
                {topArticles.map(article => (
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

      {/* DOLNÍ STICKY NAVIGAČNÍ LIŠTA */}
      <nav
        className={styles.stickyRail}
        aria-label="Rychlá navigace kapitol (dole)"
        onMouseLeave={() => setSharedHoveredSlug(null)}
      >
        {/* DOLNÍ OKNO S TITULKY ČLÁNKŮ (pokud bylo kliknuto v dolním menu!) */}
        {bottomPanelMode === 'articleList' && (
          <div
            className={styles.windowPanel}
            style={{ ['--chapter-accent' as string]: bottomSelectedMeta.accent } as CSSProperties}
          >
            <div className={styles.windowHeader}>
              <div className={styles.windowTitleGroup}>
                <span className={styles.panelDot} style={{ background: bottomSelectedMeta.accent }} aria-hidden />
                <Link
                  href={chapterHref(bottomSelectedMeta.slug)}
                  className={styles.windowTitleLink}
                  title="Přejít na úvodní stránku kapitoly"
                >
                  <strong className={styles.windowTitle}>
                    {bottomSelectedMeta.id} · {bottomSelectedMeta.title}
                  </strong>
                </Link>
              </div>

              <div className={styles.windowHeaderActions}>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={() => setBottomPanelMode('closed')}
                  aria-label="Zavřít okno (Esc)"
                >
                  <IconX size={16} />
                </button>
              </div>
            </div>

            {bottomArticles.length > 0 ? (
              <ul className={styles.articleList}>
                {bottomArticles.map(article => (
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

        {/* 15 Vodorovných posuvníků v dolním menu (provázané s horním menu!) */}
        <div className={styles.stickyProgress}>
          {DPBP_CHAPTERS.map(chapter => {
            const isHovered = chapter.slug === sharedHoveredSlug;
            const isActive = chapter.slug === activeSlug;

            return (
              <div key={chapter.id} className={styles.dashItem}>
                {isHovered && bottomPanelMode === 'closed' && (
                  <div
                    className={styles.dashPointerTooltip}
                    style={{ ['--chapter-accent' as string]: chapter.accent } as CSSProperties}
                  >
                    <span className={styles.tooltipNum} style={{ color: chapter.accent }}>
                      {chapter.id}
                    </span>
                    <span className={styles.tooltipTitle}>{chapter.shortTitle}</span>
                  </div>
                )}
                <button
                  type="button"
                  className={`${styles.dashBtn} ${isActive ? styles.dashActive : ''}`}
                  style={{ ['--preview-color' as string]: chapter.accent } as CSSProperties}
                  onMouseEnter={() => setSharedHoveredSlug(chapter.slug)}
                  onFocus={() => setSharedHoveredSlug(chapter.slug)}
                  onClick={() => handleBottomDashClick(chapter.slug)}
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
