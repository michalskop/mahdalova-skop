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
  variant?: 'article' | 'landing' | 'hero';
  chapterContents?: ChapterContents;
}

export default function ChapterRail({
  currentChapter,
  variant = 'article',
  chapterContents = {},
}: ChapterRailProps) {
  const [panelMode, setPanelMode] = useState<'closed' | 'chapters' | 'articleList'>('closed');
  const [activePanelTarget, setActivePanelTarget] = useState<'top' | 'bottom' | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string>(currentChapter);

  // Local hover flag so tooltips ONLY render in the menu where mouse is actively hovering
  const [isHoveredHere, setIsHoveredHere] = useState(false);

  // Global hover state synchronized via CustomEvent across all ChapterRail instances
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  useEffect(() => {
    const handleHoverEvent = (e: Event) => {
      const customEv = e as CustomEvent<string | null>;
      setHoveredSlug(customEv.detail);
    };
    window.addEventListener('dpbp-chapter-hover', handleHoverEvent);
    return () => window.removeEventListener('dpbp-chapter-hover', handleHoverEvent);
  }, []);

  const triggerHover = (slug: string | null) => {
    window.dispatchEvent(new CustomEvent('dpbp-chapter-hover', { detail: slug }));
  };

  const handleMouseEnterRail = () => setIsHoveredHere(true);
  const handleMouseLeaveRail = () => {
    setIsHoveredHere(false);
    triggerHover(null);
  };

  const currentChapterMeta = DPBP_CHAPTERS.find(c => c.slug === currentChapter) ?? DPBP_CHAPTERS[0];

  // Active chapter being inspected (prioritizes hover -> selected panel chapter -> current chapter)
  const activeSlug =
    hoveredSlug ??
    (panelMode === 'articleList' ? selectedSlug : currentChapter);

  const activeChapterMeta = DPBP_CHAPTERS.find(c => c.slug === activeSlug) ?? currentChapterMeta;

  // Selected chapter for article list window
  const selectedChapterMeta = DPBP_CHAPTERS.find(c => c.slug === selectedSlug) ?? activeChapterMeta;
  const articles: ChapterArticleItem[] = (chapterContents[selectedChapterMeta.slug] ?? []).map(item =>
    typeof item === 'string'
      ? { slug: item, title: item, href: `/specialy/data-pro-budouci-premierku/${selectedChapterMeta.slug}` }
      : item
  );

  // Close panel on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPanelMode('closed');
        setActivePanelTarget(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTopDashClick = (slug: string) => {
    if (panelMode === 'articleList' && selectedSlug === slug && activePanelTarget === 'top') {
      setPanelMode('closed');
      setActivePanelTarget(null);
    } else {
      setSelectedSlug(slug);
      setPanelMode('articleList');
      setActivePanelTarget('top');
    }
  };

  const handleBottomDashClick = (slug: string) => {
    if (panelMode === 'articleList' && selectedSlug === slug && activePanelTarget === 'bottom') {
      setPanelMode('closed');
      setActivePanelTarget(null);
    } else {
      setSelectedSlug(slug);
      setPanelMode('articleList');
      setActivePanelTarget('bottom');
    }
  };

  const toggleChaptersOverview = () => {
    if (panelMode === 'chapters' && activePanelTarget === 'top') {
      setPanelMode('closed');
      setActivePanelTarget(null);
    } else {
      setPanelMode('chapters');
      setActivePanelTarget('top');
    }
  };

  // 1. HERO VARIANT (Dark hero header in chapter landing page)
  if (variant === 'hero') {
    return (
      <div className={styles.heroContainer}>
        <div className={styles.heroHeadRow}>
          <div className={styles.heroHeadMeta}>
            <span className={styles.heroEyebrow}>
              <Link href="/specialy/data-pro-budouci-premierku" className={styles.heroCrumbLink} style={{ color: activeChapterMeta.accent }}>
                Data pro budoucí premiérku
              </Link>{' '}
              · Kapitola {activeChapterMeta.id}
            </span>
            <h1 className={styles.heroTitle}>{activeChapterMeta.title}</h1>
          </div>

          <div className={styles.heroProfileWrap}>
            <Link href="/specialy/data-pro-budouci-premierku" aria-label="Zpět na Data pro budoucí premiérku">
              <ProfileHead silColor={activeChapterMeta.accent} style={{ width: 120, height: 120, display: 'block' }} />
            </Link>
          </div>
        </div>

        {/* Clean 15 progress dashes without borders or text labels */}
        <div
          className={styles.heroRail}
          onMouseEnter={handleMouseEnterRail}
          onMouseLeave={handleMouseLeaveRail}
        >
          <div className={styles.heroProgress}>
            {DPBP_CHAPTERS.map(chapter => {
              const isHovered = chapter.slug === hoveredSlug;
              const isActive = chapter.slug === activeSlug;

              return (
                <div key={chapter.id} className={styles.dashItem}>
                  {isHovered && isHoveredHere && panelMode === 'closed' && (
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
                    onMouseEnter={() => triggerHover(chapter.slug)}
                    onFocus={() => triggerHover(chapter.slug)}
                    onClick={() => handleTopDashClick(chapter.slug)}
                    aria-label={`Kapitola ${chapter.id}: ${chapter.title}`}
                  />
                </div>
              );
            })}
          </div>

          {/* HERO OKNO / PANEL (rozbalí se přímo pod posuvníky v hero hlavičce po kliknutí!) */}
          {panelMode === 'articleList' && activePanelTarget === 'top' && (
            <div
              className={styles.windowPanel}
              style={{ ['--chapter-accent' as string]: selectedChapterMeta.accent } as CSSProperties}
            >
              <div className={styles.windowHeader}>
                <div className={styles.windowTitleGroup}>
                  <span className={styles.panelDot} style={{ background: selectedChapterMeta.accent }} aria-hidden />
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
                    className={styles.closeBtn}
                    onClick={() => {
                      setPanelMode('closed');
                      setActivePanelTarget(null);
                    }}
                    aria-label="Zavřít okno (Esc)"
                  >
                    <IconX size={16} />
                  </button>
                </div>
              </div>

              {articles.length > 0 ? (
                <ul className={styles.articleList}>
                  {articles.map(article => (
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
        </div>
      </div>
    );
  }

  // 2. ARTICLE / LANDING RAIL (pod audio lištou + 3. dolní sticky nav)
  return (
    <>
      <nav
        className={`${styles.rail} ${variant === 'landing' ? styles.landing : styles.article}`}
        aria-label="Navigace mezi kapitolami projektu"
        style={{ ['--active-chapter' as string]: activeChapterMeta.accent } as CSSProperties}
        onMouseEnter={handleMouseEnterRail}
        onMouseLeave={handleMouseLeaveRail}
      >
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
                onClick={toggleChaptersOverview}
                aria-expanded={panelMode === 'chapters' && activePanelTarget === 'top'}
                aria-label={panelMode === 'chapters' ? 'Skrýt obsah' : 'Zobrazit obsah'}
              >
                <span>Obsah</span>
                <IconChevronDown
                  style={{
                    transform: panelMode === 'chapters' && activePanelTarget === 'top' ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.18s ease',
                  }}
                  aria-hidden
                />
              </button>
            </div>

            {/* Řádek 2: Kapitola XX/15 + svislá čárka + Název kapitoly (dynamicky reaguje na hover ve všech menu!) */}
            <div className={styles.row2}>
              <span className={styles.number}>Kapitola {activeChapterMeta.id}/15</span>
              <span className={styles.accent} aria-hidden />
              <Link className={styles.title} href={chapterHref(activeChapterMeta.slug)}>
                {activeChapterMeta.title}
              </Link>
            </div>
          </div>
        </div>

        {/* 15 Vodorovných čárek – svítí JEN JEDNA barva synchronizovaně přes všechny komponenty */}
        <div className={styles.progress}>
          {DPBP_CHAPTERS.map(chapter => {
            const isHovered = chapter.slug === hoveredSlug;
            const isActive = chapter.slug === activeSlug;

            return (
              <div key={chapter.id} className={styles.dashItem}>
                {isHovered && isHoveredHere && panelMode === 'closed' && (
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
                  onMouseEnter={() => triggerHover(chapter.slug)}
                  onFocus={() => triggerHover(chapter.slug)}
                  onClick={() => handleTopDashClick(chapter.slug)}
                  aria-label={`Kapitola ${chapter.id}: ${chapter.title}`}
                />
              </div>
            );
          })}
        </div>

        {/* HORNÍ OKNO / PANEL (zobrazuje se POUZE při kliknutí v HORNÍM menu!) */}
        {panelMode === 'chapters' && activePanelTarget === 'top' && (
          <div className={styles.windowPanel}>
            <div className={styles.windowHeader}>
              <span className={styles.windowHeaderTitle}>Všechny kapitoly speciálu</span>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => {
                  setPanelMode('closed');
                  setActivePanelTarget(null);
                }}
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
                  onMouseEnter={() => triggerHover(chapter.slug)}
                  onClick={() => {
                    setSelectedSlug(chapter.slug);
                    setPanelMode('articleList');
                    setActivePanelTarget('top');
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

        {panelMode === 'articleList' && activePanelTarget === 'top' && (
          <div
            className={styles.windowPanel}
            style={{ ['--chapter-accent' as string]: selectedChapterMeta.accent } as CSSProperties}
          >
            <div className={styles.windowHeader}>
              <div className={styles.windowTitleGroup}>
                <span className={styles.panelDot} style={{ background: selectedChapterMeta.accent }} aria-hidden />
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
                  onClick={() => {
                    setPanelMode('chapters');
                    setActivePanelTarget('top');
                  }}
                >
                  <IconArrowLeft size={14} />
                  <span>Obsah</span>
                </button>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={() => {
                    setPanelMode('closed');
                    setActivePanelTarget(null);
                  }}
                  aria-label="Zavřít okno (Esc)"
                >
                  <IconX size={16} />
                </button>
              </div>
            </div>

            {articles.length > 0 ? (
              <ul className={styles.articleList}>
                {articles.map(article => (
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

      {/* 3. DOLNÍ STICKY NAVIGAČNÍ LIŠTA */}
      <nav
        className={`${styles.stickyRail} ${variant === 'landing' ? styles.stickyLanding : styles.stickyArticle}`}
        aria-label="Rychlá navigace kapitol (dole)"
        onMouseEnter={handleMouseEnterRail}
        onMouseLeave={handleMouseLeaveRail}
      >
        {/* DOLNÍ OKNO S TITULKY ČLÁNKŮ (zobrazuje se POUZE při kliknutí v DOLNÍM menu!) */}
        {panelMode === 'articleList' && activePanelTarget === 'bottom' && (
          <div
            className={styles.windowPanel}
            style={{ ['--chapter-accent' as string]: selectedChapterMeta.accent } as CSSProperties}
          >
            <div className={styles.windowHeader}>
              <div className={styles.windowTitleGroup}>
                <span className={styles.panelDot} style={{ background: selectedChapterMeta.accent }} aria-hidden />
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
                  className={styles.closeBtn}
                  onClick={() => {
                    setPanelMode('closed');
                    setActivePanelTarget(null);
                  }}
                  aria-label="Zavřít okno (Esc)"
                >
                  <IconX size={16} />
                </button>
              </div>
            </div>

            {articles.length > 0 ? (
              <ul className={styles.articleList}>
                {articles.map(article => (
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

        {/* 15 Vodorovných posuvníků v dolním menu */}
        <div className={styles.stickyProgress}>
          {DPBP_CHAPTERS.map(chapter => {
            const isHovered = chapter.slug === hoveredSlug;
            const isActive = chapter.slug === activeSlug;

            return (
              <div key={chapter.id} className={styles.dashItem}>
                {isHovered && isHoveredHere && panelMode === 'closed' && (
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
                  onMouseEnter={() => triggerHover(chapter.slug)}
                  onFocus={() => triggerHover(chapter.slug)}
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
