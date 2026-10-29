// app/rss.xml/route.ts
import path from 'path';
import { getArticles } from '@/components/common/getArticles';
import { buildRssFeed } from '@repo/ui/lib/rss';
import { getRssContent } from '@/lib/rssContent';

const SITE_URL = 'https://www.mahdalova-skop.cz';

export async function GET() {
  // No `useExplicitPromotion` – RSS readers expect strict reverse-chronological order.
  const articles = await getArticles(30);

  const feed = buildRssFeed({
    title: 'DataTimes.cz',
    description: 'Příběhy ukryté v datech – datová a kontextová žurnalistika.',
    siteUrl: SITE_URL,
    feedPath: '/rss.xml',
    language: 'cs',
    articleBasePath: '/clanek',
    articles,
    copyright: `© ${new Date().getFullYear()} DataTimes.cz`,
    publicDir: path.join(process.cwd(), 'public'),
    // Plné texty pro agregátory (MSN, Flipboard, Feedly) – samotný perex nestačí.
    getContent: (article, url) => getRssContent(article.slug, url, SITE_URL, article.coverImage),
  });

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
