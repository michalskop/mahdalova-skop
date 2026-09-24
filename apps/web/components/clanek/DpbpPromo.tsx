import Link from 'next/link';
import ProfileHead from '@/components/dpbp/ProfileHead';
import styles from './DpbpPromo.module.css';

// Inline "inliner" pointing from a regular /clanek article into the
// Data pro budoucí premiérku special (default: chapter Demografie).
// Floats like the other side asides (shared --dt-bleed-* tokens):
//   <DpbpPromo />                        → right, chapter Demografie
//   <DpbpPromo float="left" title="…" href="/specialy/…" text="…" />
interface DpbpPromoProps {
  title?: string;
  text?: string;
  href?: string;
  cta?: string;
  float?: 'right' | 'left' | 'none';
}

export default function DpbpPromo({
  title = 'Vymíráme?',
  text = 'Proč se v Česku rodí nejméně dětí za 240 let, co slibují politici a co podle dat opravdu funguje.',
  href = '/specialy/data-pro-budouci-premierku/01-demografie',
  cta = 'Kapitola Demografie',
  float = 'right',
}: DpbpPromoProps) {
  const floatClass = float === 'left' ? styles.floatLeft : float === 'right' ? styles.floatRight : '';
  return (
    <Link href={href} className={`${styles.card} ${floatClass}`} aria-label={`${title} – speciál Data pro budoucí premiérku`}>
      <span className={styles.head} aria-hidden>
        <ProfileHead />
      </span>
      <span className={styles.body}>
        <span className={styles.kicker}>Speciál Data pro budoucí premiérku</span>
        <span className={styles.title}>{title}</span>
        <span className={styles.text}>{text}</span>
        <span className={styles.cta}>{cta} →</span>
      </span>
    </Link>
  );
}
