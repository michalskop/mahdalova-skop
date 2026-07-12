// app/rss.xml/route.ts
import path from 'path';
import { getArticles } from '@/components/common/getArticles';
import { buildRssFeed } from '@repo/ui/lib/rss';

export async function GET() {
  // No `useExplicitPromotion` – RSS readers expect strict reverse-chronological order.
  const articles = await getArticles(30);

  const feed = buildRssFeed({
    title: 'Mahdalová & Škop',
    description: 'Příběhy ukryté v datech – datová a kontextová žurnalistika.',
    siteUrl: 'https://www.mahdalova-skop.cz',
    feedPath: '/rss.xml',
    language: 'cs',
    articleBasePath: '/clanek',
    articles,
    copyright: `© ${new Date().getFullYear()} Mahdalová & Škop`,
    publicDir: path.join(process.cwd(), 'public'),
  });

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
