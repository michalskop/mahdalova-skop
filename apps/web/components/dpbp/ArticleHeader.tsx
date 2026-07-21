import Link from 'next/link';
import { splitAuthors, normalizeAuthor } from '@/utils/authorUtils';
import styles from './ArticleHeader.module.css';

// Náležitosti článku podle vzoru The Nerve: titulek, perex, autoři s foto,
// datum, ikony sítí, audio stopa (zatím zástupná) a náhledový (hero) obrázek
// s redakčním přepínačem. Server-komponent – ikony sítí jsou prosté odkazy,
// takže není potřeba klientský JS.

const AUTHOR_PHOTOS: Record<string, string> = {
  'Kateřina Mahdalová': '/authors/km_circle.png',
  'Michal Škop': '/authors/ms_circle.png',
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface Crumb {
  label: string;
  href?: string;
}

interface ArticleHeaderProps {
  crumbs: Crumb[];
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

function shareTargets(url: string, title: string) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const ut = encodeURIComponent(`${title} ${url}`);
  return [
    {
      label: 'E-mail',
      href: `mailto:?subject=${t}&body=${u}`,
      svg: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M4 7l8 6 8-6" /></svg>
      ),
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-8h2.4l.4-3h-2.8V8.1c0-.9.3-1.5 1.7-1.5H16.4V4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1V10H8v3h2.1v8h3.4z" /></svg>
      ),
    },
    {
      label: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 3h3l-7 8 8.2 10h-6.4l-5-6.1L7 21H4l7.5-8.6L3.5 3H10l4.5 5.5L17.5 3zm-1.1 16h1.7L8.7 4.8H6.9L16.4 19z" /></svg>
      ),
    },
    {
      label: 'Threads',
      href: `https://www.threads.net/intent/post?text=${ut}`,
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.3 11.3c-.1 0-.2-.1-.3-.1-.2-2.9-1.8-4.6-4.5-4.6-1.6 0-3 .7-3.8 2l1.5 1c.6-.9 1.4-1.1 2.3-1.1 1.3 0 2.4.9 2.6 2.5-.6-.1-1.2-.2-1.9-.2-2.6 0-4.3 1.4-4.2 3.4.1 1.9 1.7 2.9 3.4 2.8 1.6-.1 3.2-.9 3.6-3.3.5.3.9.8 1 1.6.2 1.1-.4 2.5-1.3 3.3-.9.9-2 1.4-3.7 1.4-3 0-5-2-5.1-5.6C6 8.3 8 6.3 11.1 6.3c2.2 0 4 1 4.9 2.9l.3.1zm-4 5.2c-.9.1-1.9-.3-1.9-1.2 0-.7.7-1.3 2-1.3.6 0 1.1.1 1.7.2-.2 1.7-1.1 2.2-1.8 2.3z" /></svg>
      ),
    },
    {
      label: 'Bluesky',
      href: `https://bsky.app/intent/compose?text=${ut}`,
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 10.7C10.7 8.2 7.4 5.6 5.5 5.2 3.8 4.9 3.1 6 3.1 7.5c0 1.5.9 4.5 1.4 5.3.9 1.4 2.4 1.6 3.8 1.4-2.3.4-3 1.7-2 3.2.9 1.3 2.6 1.4 3.5-.5.3-.6.5-1.3.2-2 .2.7.3 1.4.6 2 .9 1.9 2.6 1.8 3.5.5 1.1-1.5.3-2.8-2-3.2 1.4.2 2.9 0 3.8-1.4.5-.8 1.4-3.8 1.4-5.3 0-1.5-.7-2.6-2.4-2.3-1.9.4-5.2 3-6.5 5.5z" /></svg>
      ),
    },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 8v11H3V8h3.5zM4.7 3.5a2 2 0 110 4 2 2 0 010-4zM21 21h-3.5v-5.6c0-1.4-.5-2.3-1.7-2.3-.9 0-1.5.6-1.7 1.2-.1.2-.1.5-.1.8V21H8.5s.1-9.6 0-11h3.5v1.6c.5-.8 1.3-1.9 3.2-1.9 2.3 0 4 1.5 4 4.8V21z" /></svg>
      ),
    },
    {
      label: 'Reddit',
      href: `https://www.reddit.com/submit?url=${u}&title=${t}`,
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.1c0-1-.8-1.7-1.7-1.7-.5 0-.9.2-1.2.5-1.1-.8-2.7-1.3-4.4-1.4l.8-3.4 2.4.5c0 .6.5 1.1 1.2 1.1.6 0 1.2-.5 1.2-1.2S21 5.3 20.4 5.3c-.5 0-.9.3-1.1.7l-2.8-.6c-.2 0-.3.1-.4.3l-.9 3.9c-1.7.1-3.3.6-4.4 1.4-.3-.3-.7-.5-1.2-.5-1 0-1.7.8-1.7 1.7 0 .7.4 1.2.9 1.5v.5c0 2.4 2.8 4.4 6.3 4.4s6.3-2 6.3-4.4v-.5c.6-.3 1-.9 1-1.5zM8.7 13.3c0-.6.5-1.2 1.2-1.2s1.1.5 1.1 1.2-.5 1.1-1.1 1.1-1.2-.5-1.2-1.1zm6.6 3.1c-.8.8-2.3.9-2.8.9s-2-.1-2.8-.9c-.1-.1-.1-.3 0-.4.1-.1.3-.1.4 0 .5.5 1.5.7 2.4.7s1.9-.2 2.4-.7c.1-.1.3-.1.4 0 .1.1.1.3 0 .4zm-.2-1.9c-.6 0-1.1-.5-1.1-1.2s.5-1.2 1.1-1.2 1.2.5 1.2 1.2-.5 1.2-1.2 1.2z" /></svg>
      ),
    },
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${ut}`,
      svg: (
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 00-7.7 13.6L3 21l4.5-1.2A9 9 0 1012 3zm0 2a7 7 0 016 10.6l-.3.5.6 2.2-2.3-.6-.5.3A7 7 0 1112 5zm-2.7 3.3c-.2 0-.5 0-.7.3-.3.3-.9.9-.9 2.1s.9 2.5 1 2.6c.1.2 1.7 2.8 4.3 3.8 2.1.8 2.5.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.3l-1.4-.7c-.2-.1-.4-.1-.6.1l-.6.8c-.1.2-.3.2-.5.1-.7-.3-1.4-.6-2-1.4-.5-.6-.8-1.2-.9-1.4-.1-.2 0-.3.1-.4l.4-.5c.1-.2.1-.3.2-.5 0-.2 0-.3 0-.4l-.7-1.6c-.1-.4-.3-.4-.5-.4z" /></svg>
      ),
    },
  ];
}

const WAVE = [30, 60, 45, 80, 55, 95, 40, 70, 50, 85, 35, 65, 48, 90, 42, 60, 30, 75, 52, 38];

export default function ArticleHeader({
  crumbs,
  title,
  excerpt,
  author,
  date,
  shareUrl,
  heroImage,
  showHero = false,
  heroCaption,
}: ArticleHeaderProps) {
  const authors = splitAuthors(author);
  return (
    <header className={styles.header}>
      <div className={styles.crumb}>
        {crumbs.map((c, i) => (
          <span key={`${c.label}-${i}`}>
            {c.href ? <Link href={c.href}>{c.label}</Link> : c.label}
            {i < crumbs.length - 1 && <span className={styles.sep}>›</span>}
          </span>
        ))}
      </div>

      <h1 className={styles.title}>{title}</h1>
      {excerpt && <p className={styles.perex}>{excerpt}</p>}

      <div className={styles.byline}>
        <div className={styles.authors}>
          <div className={styles.avatars}>
            {authors.map((name) =>
              AUTHOR_PHOTOS[name] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={name} src={AUTHOR_PHOTOS[name]} alt={name} />
              ) : (
                <span className={styles.mono} key={name} title={name} aria-hidden="true">
                  {initials(name)}
                </span>
              )
            )}
          </div>
          <div>
            <div className={styles.names}>
              {authors.map((name, i) => (
                <span key={name}>
                  <Link href={`/autor/${normalizeAuthor(name)}`}>{name}</Link>
                  {i < authors.length - 1 ? ' & ' : ''}
                </span>
              ))}
            </div>
            <div className={styles.date}>{formatDate(date)}</div>
          </div>
        </div>

        <div className={styles.share} aria-label="Sdílet">
          {shareTargets(shareUrl, title).map((s) => (
            <a key={s.label} href={s.href} aria-label={s.label} target="_blank" rel="noopener noreferrer">
              {s.svg}
            </a>
          ))}
        </div>
      </div>

      <div className={styles.audio}>
        <div className={styles.play} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z" /></svg>
        </div>
        <div className={styles.wave} aria-hidden="true">
          {WAVE.map((h, i) => (
            <span key={i} style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className={styles.lbl}>
          <b>Poslechnout článek</b>
          <br />
          audio doplníme
        </div>
      </div>

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
