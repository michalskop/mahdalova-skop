'use client';

import { Paper, Title, useMantineTheme } from '@mantine/core';
import { ArticleCard } from '@repo/ui/components/ArticleCard';
import { Arrow } from '@repo/ui/components/Arrow';
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
  const theme = useMantineTheme();
  const light = theme.colors.background[0];
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
              {/* bylineFull: v bočních kartách je pro jméno samostatný řádek pod
                  datem, tak ukaž celé jméno (i u dvojice), ne zkrácené příjmení. */}
              <ArticleCard {...article} articleBasePath={articleBasePath} locale={locale} bylineFull />
            </div>
          ))}
        </div>
      </div>

      {/* „Více" jako původní nadpis rubriky „Výběr": velký sans nadpis +
          vlnovková šipka, u levého okraje celého bloku, odkaz na výpis rubriky.
          Obal s justify-content:flex-start drží odkaz vlevo bez ohledu na
          zděděný text-align rodiče. */}
      <div className={classes.moreRow}>
        <a className={classes.more} href={moreLink}>
          <Title order={2} c={light} className={classes.moreTitle}>
            {moreLabel}
            <Arrow size={80} color={light} />
          </Title>
        </a>
      </div>
    </Paper>
  );
}
