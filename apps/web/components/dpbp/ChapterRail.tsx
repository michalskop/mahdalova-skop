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

  const handleMouseLeaveRail = () => {
    triggerHover(null);
  };

  const currentChapterMeta = DPBP_CHAPTERS.find(c => c.slug === currentChapter) ?? DPBP_CHAPTERS[0];

  // Active chapter being inspected (prioritizes hover -> selected panel chapter -> current chapter)
  const activeSlug =
    hoveredSlug ??
    (panelMode === 'articleList' ? selectedSlug : currentChapter);

  const activeChapterMeta = DPBP_CHAPTERS.find(c => c.slug === activeSlug) ?? currentChapterMeta;

  // Chapter displayed inside the opened modal panel (updates dynamically in real-time on hover!)
  const displayChapterSlug = hoveredSlug ?? selectedSlug;
  const displayChapterMeta = DPBP_CHAPTERS.find(c => c.slug === displayChapterSlug) ?? activeChapterMeta;
  const displayArticles: ChapterArticleItem[] = (chapterContents[displayChapterMeta.slug] ?? []).map(item =>
    typeof item === 'string'
      ? { slug: item, title: item, href: `/specialy/data-pro-budouci-premierku/${displayChapterMeta.slug}` }
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

  const toggleTopChaptersOverview = () => {
    if (panelMode === 'chapters' && activePanelTarget === 'top') {
      setPanelMode('closed');
      setActivePanelTarget(null);
    } else {
      setPanelMode('chapters');
      setActivePanelTarget('top');
    }
  };

  const toggleBottomChaptersOverview = () => {
    if (panelMode === 'chapters' && activePanelTarget === 'bottom') {
      setPanelMode('closed');
      setActivePanelTarget(null);
    } else {
      setPanelMode('chapters');
      setActivePanelTarget('bottom');
    }
  };

  return (
    <>
      {/* HORNÍ ZÁHLAVÍ / MENU */}
      {variant === 'hero' ? (
        /* 1. HERO ZÁHLAVÍ (na landing page kapitoly v tmavém poli #101432) */
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
                <ProfileHead silColor={activeChapterMeta.accent} style={{ width: '100%', height: '100%', display: 'block' }} />
              </Link>
            </div>
          </div>

          {/* 15 Vodorovných posuvníků v hero záhlaví bez rámečku */}
          <div
            className={styles.heroRail}
            onMouseLeave={handleMouseLeaveRail}
          >
            <div className={styles.heroProgress}>
              {DPBP_CHAPTERS.map(chapter => {
                const isActive = chapter.slug === activeSlug;

                return (
                  <div key={chapter.id} className={styles.dashItem}>
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

            {/* HERO OKNO / PANEL (Tmavé reverzní pozadí s 5% průsvitností a živou aktualizací při hoveru) */}
            {panelMode === 'articleList' && activePanelTarget === 'top' && (
              <div
                className={`${styles.windowPanel} ${styles.heroWindowPanel}`}
                style={{ ['--chapter-accent' as string]: displayChapterMeta.accent } as CSSProperties}
              >
                <div className={styles.windowHeader}>
                  <div className={styles.windowTitleGroup}>
                    <span className={styles.panelDot} style={{ background: displayChapterMeta.accent }} aria-hidden />
                    <Link
                      href={chapterHref(displayChapterMeta.slug)}
                      className={styles.windowTitleLink}
                      title="Přejít na úvodní stránku kapitoly"
                    >
                      <strong className={styles.windowTitle}>
                        {displayChapterMeta.id} · {displayChapterMeta.title}
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

                {displayArticles.length > 0 ? (
                  <ul className={styles.articleList}>
                    {displayArticles.map(article => (
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
      ) : (
        /* 2. HORNÍ MENU POD AUDIO LIŠTOU (pouze v článcích) */
        <nav
          className={`${styles.rail} ${variant === 'landing' ? styles.landing : styles.article}`}
          aria-label="Navigace mezi kapitolami projektu (nahoře)"
          style={{ ['--active-chapter' as string]: activeChapterMeta.accent } as CSSProperties}
          onMouseLeave={handleMouseLeaveRail}
        >
          <div className={styles.primary}>
            <div className={styles.identity}>
              {/* Řádek 1: Data pro budoucí premiérku + barevná hlava + Obsah ↓ */}
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

              {/* Řádek 2: Kapitola XX/15 | Název kapitoly */}
              <div className={styles.row2}>
                <span className={styles.number}>Kapitola {activeChapterMeta.id}/15</span>
                <span className={styles.accent} aria-hidden />
                <Link className={styles.title} href={chapterHref(activeChapterMeta.slug)}>
                  {activeChapterMeta.title}
                </Link>
              </div>
            </div>
          </div>

          {/* 15 Vodorovných posuvníků */}
          <div className={styles.progress}>
            {DPBP_CHAPTERS.map(chapter => {
              const isActive = chapter.slug === activeSlug;

              return (
                <div key={chapter.id} className={styles.dashItem}>
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

          {/* HORNÍ OKNO / PANEL (s živou aktualizací při hoveru na jiné kapitoly) */}
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
              style={{ ['--chapter-accent' as string]: displayChapterMeta.accent } as CSSProperties}
            >
              <div className={styles.windowHeader}>
                <div className={styles.windowTitleGroup}>
                  <span className={styles.panelDot} style={{ background: displayChapterMeta.accent }} aria-hidden />
                  <Link
                    href={chapterHref(displayChapterMeta.slug)}
                    className={styles.windowTitleLink}
                    title="Přejít na úvodní stránku kapitoly"
                  >
                    <strong className={styles.windowTitle}>
                      {displayChapterMeta.id} · {displayChapterMeta.title}
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

              {displayArticles.length > 0 ? (
                <ul className={styles.articleList}>
                  {displayArticles.map(article => (
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
      )}

      {/* DOLNÍ STICKY MENU (s živou aktualizací při hoveru na jiné kapitoly) */}
      <nav
        className={`${styles.rail} ${styles.stickyRail} ${variant === 'hero' || variant === 'landing' ? styles.stickyLanding : styles.stickyArticle}`}
        aria-label="Rychlá navigace kapitol (dole sticky)"
        style={{ ['--active-chapter' as string]: activeChapterMeta.accent } as CSSProperties}
        onMouseLeave={handleMouseLeaveRail}
      >
        <div className={styles.primary}>
          <div className={styles.identity}>
            {/* Řádek 1: Data pro budoucí premiérku + barevná hlava + Obsah ↓ */}
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
                onClick={toggleBottomChaptersOverview}
                aria-expanded={panelMode === 'chapters' && activePanelTarget === 'bottom'}
                aria-label={panelMode === 'chapters' ? 'Skrýt obsah' : 'Zobrazit obsah'}
              >
                <span>Obsah</span>
                <IconChevronDown
                  style={{
                    transform: panelMode === 'chapters' && activePanelTarget === 'bottom' ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.18s ease',
                  }}
                  aria-hidden
                />
              </button>
            </div>

            {/* Řádek 2: Kapitola XX/15 | Název kapitoly */}
            <div className={styles.row2}>
              <span className={styles.number}>Kapitola {activeChapterMeta.id}/15</span>
              <span className={styles.accent} aria-hidden />
              <Link className={styles.title} href={chapterHref(activeChapterMeta.slug)}>
                {activeChapterMeta.title}
              </Link>
            </div>
          </div>
        </div>

        {/* 15 Vodorovných posuvníků */}
        <div className={styles.progress}>
          {DPBP_CHAPTERS.map(chapter => {
            const isActive = chapter.slug === activeSlug;

            return (
              <div key={chapter.id} className={styles.dashItem}>
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

        {/* DOLNÍ OKNO / PANEL */}
        {panelMode === 'chapters' && activePanelTarget === 'bottom' && (
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
                    setActivePanelTarget('bottom');
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

        {panelMode === 'articleList' && activePanelTarget === 'bottom' && (
          <div
            className={styles.windowPanel}
            style={{ ['--chapter-accent' as string]: displayChapterMeta.accent } as CSSProperties}
          >
            <div className={styles.windowHeader}>
              <div className={styles.windowTitleGroup}>
                <span className={styles.panelDot} style={{ background: displayChapterMeta.accent }} aria-hidden />
                <Link
                  href={chapterHref(displayChapterMeta.slug)}
                  className={styles.windowTitleLink}
                  title="Přejít na úvodní stránku kapitoly"
                >
                  <strong className={styles.windowTitle}>
                    {displayChapterMeta.id} · {displayChapterMeta.title}
                  </strong>
                </Link>
              </div>

              <div className={styles.windowHeaderActions}>
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => {
                    setPanelMode('chapters');
                    setActivePanelTarget('bottom');
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

            {displayArticles.length > 0 ? (
              <ul className={styles.articleList}>
                {displayArticles.map(article => (
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
    </>
  );
}
