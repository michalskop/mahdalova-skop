// lib/articles.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import { remarkBoxPlugin } from './remark-box-plugin';
import type { ScrollyContent } from '@/types/scrolly';


const articlesDirectory = path.join(process.cwd(), 'app/clanek/_articles');

export async function getArticleBySlug(directorySlug: string) {
  const articleDir = path.join(articlesDirectory, directorySlug);
  const fullPath = path.join(articleDir, 'index.md');
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Article ${directorySlug} not found`);
  }

  // Read the main article content
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  // Check for and load scrollytelling.yaml if it exists
  let scrollyContent: ScrollyContent | null = null;
  const scrollyPath = path.join(articleDir, 'scrollytelling.yaml');
  if (fs.existsSync(scrollyPath)) {
    const scrollyFile = fs.readFileSync(scrollyPath, 'utf8');
    scrollyContent = yaml.load(scrollyFile) as ScrollyContent;
  }

    // Find and load data for KalkulackaTable
  let tableData: any[] = [];
  const tableRegex = /<MotionsStancesTable[^>]*dataFile="([^"]+)"/;
  const match = content.match(tableRegex);

  if (match && match[1]) {
    const dataFilePath = path.join(articleDir, match[1]);
    if (fs.existsSync(dataFilePath)) {
      try {
        const dataFileContent = fs.readFileSync(dataFilePath, 'utf8');
        tableData = JSON.parse(dataFileContent);
      } catch (e) {
        console.error(`Failed to parse JSON from ${dataFilePath}`, e);
      }
    }
  }

  const mdxSource = await serialize(content, {
    scope: {
      tableData: tableData,
    },
    mdxOptions: {
      remarkPlugins: [remarkGfm, remarkBoxPlugin],
    },
  });

  // Use the directory name as the slug
  return {
    slug: directorySlug,
    mdxSource,
    scrollyContent,
    tags: data.tags || [],
    content,
    title: data.title || 'Untitled',
    date: data.date || '',
    author: data.author || 'Anonymous',
    excerpt: data.excerpt || '',
    coverImage: data.coverImage || null,
  };
}