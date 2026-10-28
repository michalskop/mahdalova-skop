import Link from 'next/link';
import VegaChart from '@/components/charts/VegaChart';
import GenreBadge from './GenreBadge';
import CardThumbImage from './CardThumbImage';
import { hexToRgbString } from '@/utils/colorUtils';
import styles from './DpbpArticleCard.module.css';

interface DpbpArticleCardProps {
  href: string;
  title: string;
  excerpt: string;
  author: string;
  primaryChartSpec: Record<string, unknown> | null;
  accent?: string;
  type?: string;
  image?: string;
  /** Poměr stran obrázku (např. "1200 / 630"): náhled se zobrazí celý, ne jako ořezaný pruh. */
  imageAspect?: string;
  stacked?: boolean;
}

export default function DpbpArticleCard({
  href,
  title,
  excerpt,
  author,
  primaryChartSpec,
  accent = '#de1743',
  type = 'Analýza',
  image,
  imageAspect,
  stacked = false,
}: DpbpArticleCardProps) {
  return (
    <Link
      href={href}
      className={stacked ? `${styles.card} ${styles.stacked}` : styles.card}
      style={{
        borderTopColor: accent,
        ['--card-accent' as string]: accent,
        ['--card-accent-rgb' as string]: hexToRgbString(accent),
      }}
    >
      {(image || primaryChartSpec) && (
        <div className={styles.thumb} style={imageAspect ? { aspectRatio: imageAspect, height: 'auto' } : undefined}>
          {image ? (
            imageAspect ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className={styles.thumbImg} />
            ) : (
              <CardThumbImage src={image} className={styles.thumbImg} />
            )
          ) : (
            <VegaChart spec={primaryChartSpec!} mini />
          )}
        </div>
      )}
      <div className={styles.body}>
        <div className={styles.head}>
          <h3 className={styles.title}>{title}</h3>
          <GenreBadge topic={type} />
        </div>
        <p className={styles.desc}>{excerpt}</p>
        <div className={styles.meta}>
          <span>{author}</span>
        </div>
      </div>
    </Link>
  );
}
