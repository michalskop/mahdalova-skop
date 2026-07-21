import type { CSSProperties } from 'react';
import Link from 'next/link';
import ArticleByline from './ArticleByline';
import styles from './ArticleHeader.module.css';

// Náležitosti článku podle vzoru The Nerve: titulek, perex, byline (autoři,
// datum, sdílení, audio) a náhledový (hero) obrázek s redakčním přepínačem.

interface Crumb {
  label: string;
  href?: string;
}

interface ArticleHeaderProps {
  crumbs: Crumb[];
  /** Barva odkazů v drobečkové navigaci – accent kapitoly (mění se per kapitola). */
  accent?: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  shareUrl: string;
  heroImage?: string;
  /** Redakční přepínač: zobrazit náhledový obrázek v těle článku. Default false.
   *  Obrázek (coverImage) se použije jako OG při sdílení bez ohledu na tuto volbu. */
  showHero?: boolean;
  heroCaption?: string;
}

export default function ArticleHeader({
  crumbs,
  accent,
  title,
  excerpt,
  author,
  date,
  shareUrl,
  heroImage,
  showHero = false,
  heroCaption,
}: ArticleHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.crumb} style={accent ? ({ ['--crumb-accent']: accent } as CSSProperties) : undefined}>
        {crumbs.map((c, i) => (
          <span key={`${c.label}-${i}`}>
            {c.href ? <Link href={c.href}>{c.label}</Link> : c.label}
            {i < crumbs.length - 1 && <span className={styles.sep}>›</span>}
          </span>
        ))}
      </div>

      <h1 className={styles.title}>{title}</h1>
      {excerpt && <p className={styles.perex}>{excerpt}</p>}

      <ArticleByline author={author} date={date} shareUrl={shareUrl} shareTitle={title} audio />

      {showHero && heroImage && (
        <figure className={styles.hero}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroImage} alt="" />
          {heroCaption && <figcaption>{heroCaption}</figcaption>}
        </figure>
      )}
    </header>
  );
}
