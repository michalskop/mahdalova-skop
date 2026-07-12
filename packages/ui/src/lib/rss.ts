// lib/rss.ts
import fs from 'fs';
import path from 'path';
import { Feed } from 'feed';
import type { Article } from './getArticles';

export interface BuildRssFeedOptions {
  title: string;
  description: string;
  siteUrl: string;
  feedPath: string;
  language: string;
  articleBasePath: string;
  articles: Article[];
  copyright: string;
  /** Absolute path to the app's public/ dir, used to resolve real byte sizes for local cover images. */
  publicDir?: string;
}

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

// RSS <enclosure length> is meant to be the file's real byte size. Rather than
// fake it with 0 (invalid per the spec, and flagged by feed validators), we
// resolve it from the file on disk and simply omit the enclosure if we can't.
function resolveImageEnclosure(coverImage: string | null, siteUrl: string, publicDir?: string) {
  if (!coverImage) return undefined;

  const isExternal = /^https?:\/\//.test(coverImage);
  const url = isExternal ? coverImage : `${siteUrl}${coverImage}`;
  const type = MIME_TYPES[path.extname(coverImage).toLowerCase()];
  if (!type) return undefined;

  if (isExternal || !publicDir) return undefined;

  const filePath = path.join(publicDir, coverImage.replace(/^\//, ''));
  if (!fs.existsSync(filePath)) return undefined;

  const { size } = fs.statSync(filePath);
  return { url, type, length: size };
}

export function buildRssFeed({
  title,
  description,
  siteUrl,
  feedPath,
  language,
  articleBasePath,
  articles,
  copyright,
  publicDir,
}: BuildRssFeedOptions): Feed {
  const feed = new Feed({
    title,
    description,
    id: siteUrl,
    link: siteUrl,
    language,
    copyright,
    updated: articles.length ? new Date(articles[0].date) : new Date(),
    feedLinks: {
      rss: `${siteUrl}${feedPath}`,
    },
  });

  for (const article of articles) {
    const url = `${siteUrl}${article.href ?? `${articleBasePath}/${article.slug}`}`;
    feed.addItem({
      title: article.title,
      id: url,
      link: url,
      description: article.excerpt,
      author: article.author
        ? article.author.split(/,|&/).map((name) => ({ name: name.trim() })).filter((a) => a.name)
        : undefined,
      date: new Date(article.date),
      image: resolveImageEnclosure(article.coverImage, siteUrl, publicDir),
    });
  }

  return feed;
}
