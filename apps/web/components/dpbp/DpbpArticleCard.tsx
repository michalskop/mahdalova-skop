import Link from 'next/link';
import VegaChart from './VegaChart';
import { hexToRgbString } from '@/utils/colorUtils';
import styles from './DpbpArticleCard.module.css';

interface DpbpArticleCardProps {
  href: string;
  title: string;
  excerpt: string;
  author: string;
  chapterTitle: string;
  primaryChartSpec: Record<string, unknown> | null;
  accent?: string;
  type?: string;
  image?: string;
  stacked?: boolean;
}

export default function DpbpArticleCard({
  href,
  title,
  excerpt,
  author,
  chapterTitle,
  primaryChartSpec,
  accent = '#de1743',
  type = 'Analýza',
  image,
  stacked = false,
}: DpbpArticleCardProps) {
  return (
    <Link
      href={href}
      className={stacked ? `${styles.card} ${styles.stacked}` : styles.card}
      style={{ borderTopColor: accent, ['--card-accent-rgb' as string]: hexToRgbString(accent) }}
    >
      {(image || primaryChartSpec) && (
        <div className={styles.thumb}>
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className={styles.thumbImg} />
          ) : (
            <VegaChart spec={primaryChartSpec!} mini />
          )}
        </div>
      )}
      <div className={styles.body}>
        <div className={styles.topic}>{chapterTitle} · {type}</div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.desc}>{excerpt}</p>
        <div className={styles.meta}>
          <span>{author}</span>
        </div>
      </div>
    </Link>
  );
}
