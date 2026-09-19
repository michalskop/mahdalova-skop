'use client';

import { Paper } from '@mantine/core';
import { ArticleCard } from '@repo/ui/components/ArticleCard';
import type { Article } from '@repo/ui/lib/getArticles';
import classes from './FeaturedHero.module.css';

// Hero blok homepage (styl The Nerve): vlevo velký hlavní článek (cover +
// titulek + perex + autor), vpravo tři nejnovější jako kompaktní vodorovné
// karty a pod nimi tlačítko „Více". Celá šířka, žádný boční nadpis.
interface FeaturedHeroProps {
  articles: Article[];
  articleBasePath?: string;
  locale?: string;
  /** Barva pozadí bloku (token palety nebo hex). */
  themeColor?: string;
  /** Kam vede „Více" (výpis rubriky). */
  moreLink?: string;
  moreLabel?: string;
}

export function FeaturedHero({
  articles,
  articleBasePath,
  locale,
  themeColor = 'brand',
  moreLink = '/vyber',
  moreLabel = 'Více',
}: FeaturedHeroProps) {
  const lead = articles[0];
  const side = articles.slice(1, 4);
  if (!lead) return null;

  return (
    <Paper bg={themeColor} radius={0} py={16} className={classes.block}>
      <div className={classes.grid}>
        <div className={classes.lead}>
          <ArticleCard {...lead} articleBasePath={articleBasePath} locale={locale} />
        </div>

        <div className={classes.side}>
          {side.map((article) => (
            <div key={article.slug} className={classes.sideItem}>
              <ArticleCard {...article} articleBasePath={articleBasePath} locale={locale} />
            </div>
          ))}

          <a className={classes.more} href={moreLink}>
            {moreLabel}
            <span className={classes.moreArrow} aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </Paper>
  );
}
