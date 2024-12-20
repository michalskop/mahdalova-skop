// lib/articles.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import { remarkBoxPlugin } from './remark-box-plugin'; // Your custom plugin
// import { Article, ArticleMetadata } from '@/types/article'; // Import the Article type

export async function getArticleBySlug(slug: string) {
  const articlesDirectory = path.join(process.cwd(), 'app/clanek/_articles');
  const fullPath = path.join(articlesDirectory, `${slug}/index.md`);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Article ${slug} not found`);
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm, remarkBoxPlugin],
    },
  });

  return {
    slug,
    mdxSource, // This should be MDXRemoteSerializeResult
    tags: data.tags || [],
    content,
    title: data.title || 'Untitled',
    date: data.date || '',
    author: data.author || 'Anonymous',
    excerpt: data.excerpt || '',
    coverImage: data.coverImage || null,
  };
}
