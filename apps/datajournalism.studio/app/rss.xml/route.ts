// app/rss.xml/route.ts
import path from 'path';
import { getArticles } from '@/components/common/getArticles';
import { buildRssFeed } from '@repo/ui/lib/rss';

export async function GET() {
  // No `useExplicitPromotion` – RSS readers expect strict reverse-chronological order.
  const articles = await getArticles(30);

  const feed = buildRssFeed({
    title: 'Data Journalism Studio',
    description: 'We make data talk. Stories hidden in data - unique data and context journalism.',
    siteUrl: 'https://www.datajournalism.studio',
    feedPath: '/rss.xml',
    language: 'en',
    articleBasePath: '/a',
    articles,
    copyright: `© ${new Date().getFullYear()} Data Journalism Studio`,
    publicDir: path.join(process.cwd(), 'public'),
  });

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
