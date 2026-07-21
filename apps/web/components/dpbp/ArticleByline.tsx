import Link from 'next/link';
import {
  IconMail,
  IconBrandMeta,
  IconBrandX,
  IconBrandThreads,
  IconBrandBluesky,
  IconBrandLinkedin,
  IconBrandReddit,
  IconBrandWhatsapp,
} from '@tabler/icons-react';
import { splitAuthors, normalizeAuthor } from '@/utils/authorUtils';
import CopyLinkButton from './CopyLinkButton';
import styles from './ArticleHeader.module.css';

// Sdílená byline: autoři s foto, datum, funkční ostré ikony sdílení (Tabler)
// a volitelně audio stopa. Používá ji hlavička článku i otvírák kapitoly.

const AUTHOR_PHOTOS: Record<string, string> = {
  'Kateřina Mahdalová': '/authors/km_circle.png',
  'Michal Škop': '/authors/ms_circle.png',
};

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Sdílení míří na cílový článek (má OG obrázek, titulek a perex/description),
// takže se odkaz na sítích rozbalí kvalitně.
function shareTargets(url: string, title: string) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const ut = encodeURIComponent(`${title} ${url}`);
  const sz = 17;
  return [
    { label: 'E-mail', href: `mailto:?subject=${t}&body=${u}`, icon: <IconMail size={sz} stroke={1.8} /> },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, icon: <IconBrandMeta size={sz} stroke={1.8} /> },
    { label: 'X', href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`, icon: <IconBrandX size={sz} stroke={1.8} /> },
    { label: 'Threads', href: `https://www.threads.net/intent/post?text=${ut}`, icon: <IconBrandThreads size={sz} stroke={1.8} /> },
    { label: 'Bluesky', href: `https://bsky.app/intent/compose?text=${ut}`, icon: <IconBrandBluesky size={sz} stroke={1.8} /> },
    { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, icon: <IconBrandLinkedin size={sz} stroke={1.8} /> },
    { label: 'Reddit', href: `https://www.reddit.com/submit?url=${u}&title=${t}`, icon: <IconBrandReddit size={sz} stroke={1.8} /> },
    { label: 'WhatsApp', href: `https://wa.me/?text=${ut}`, icon: <IconBrandWhatsapp size={sz} stroke={1.8} /> },
  ];
}

const WAVE = [30, 60, 45, 80, 55, 95, 40, 70, 50, 85, 35, 65, 48, 90, 42, 60, 30, 75, 52, 38];

interface ArticleBylineProps {
  author: string;
  date: string;
  shareUrl: string;
  shareTitle: string;
  audio?: boolean;
}

export default function ArticleByline({ author, date, shareUrl, shareTitle, audio = false }: ArticleBylineProps) {
  const authors = splitAuthors(author);
  return (
    <>
      <div className={styles.byline}>
        <div className={styles.authors}>
          <div className={styles.avatars}>
            {authors.map((name) =>
              AUTHOR_PHOTOS[name] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={name} src={AUTHOR_PHOTOS[name]} alt={name} />
              ) : (
                <span className={styles.mono} key={name} title={name} aria-hidden="true">{initials(name)}</span>
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
          {shareTargets(shareUrl, shareTitle).map((s) => (
            <a key={s.label} href={s.href} aria-label={s.label} target="_blank" rel="noopener noreferrer">
              {s.icon}
            </a>
          ))}
          <CopyLinkButton url={shareUrl} />
        </div>
      </div>

      {audio && (
        <div className={styles.audio}>
          <div className={styles.play} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z" /></svg>
          </div>
          <div className={styles.wave} aria-hidden="true">
            {WAVE.map((h, i) => (<span key={i} style={{ height: `${h}%` }} />))}
          </div>
          <div className={styles.lbl}><b>Poslechnout článek</b><br />audio doplníme</div>
        </div>
      )}
    </>
  );
}
