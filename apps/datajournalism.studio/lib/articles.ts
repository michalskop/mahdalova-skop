// lib/articles.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import { remarkBoxPlugin } from './remark-box-plugin'; // Your custom plugin
import { remarkFlourishPlugin } from './remark-flourish-plugin';
import type { ScrollyContent } from '@/types/scrolly';
import type { TimelineContent } from '@/types/timeline';


export async function getArticleBySlug(directorySlug: string) {
  const articlesDirectory = path.join(process.cwd(), 'app/a/_articles');
  const articleDir = path.join(articlesDirectory, directorySlug);
  const fullPath = path.join(articleDir, 'index.md');

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Article ${directorySlug} not found`);
  }

  // Read the main article content
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  // Optional raw HTML include
  let htmlContent: string | null = null;
  if (typeof data.htmlInclude === 'string' && data.htmlInclude.trim().length > 0) {
    const htmlPath = path.join(articleDir, data.htmlInclude);
    if (!fs.existsSync(htmlPath)) {
      throw new Error(`htmlInclude file not found: ${directorySlug}/${data.htmlInclude}`);
    }
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
  }
  
  // Check for and load scrollytelling.yaml if it exists
  let scrollyContent: ScrollyContent | null = null;
  const scrollyPath = path.join(articleDir, 'scrollytelling.yaml');
  if (fs.existsSync(scrollyPath)) {
    const scrollyFile = fs.readFileSync(scrollyPath, 'utf8');
    scrollyContent = yaml.load(scrollyFile) as ScrollyContent;
  }

  // Find and load data for Timeline components (supports multiple instances)
  const timelineData: Record<string, TimelineContent> = {};
  const timelineRegex = /<Timeline[^>]*yamlFile="([^"]+)"[^>]*\/>/g;
  let timelineMatch: RegExpExecArray | null;
  while ((timelineMatch = timelineRegex.exec(content)) !== null) {
    const yamlFile = timelineMatch[1];
    if (!yamlFile) continue;
    if (timelineData[yamlFile]) continue;
    const timelinePath = path.join(articleDir, yamlFile);
    if (!fs.existsSync(timelinePath)) {
      throw new Error(`Timeline yaml file not found: ${directorySlug}/${yamlFile}`);
    }
    const timelineFile = fs.readFileSync(timelinePath, 'utf8');
    timelineData[yamlFile] = yaml.load(timelineFile) as TimelineContent;
  }

  const mdxSource = await serialize(content, {
    scope: {
      timelineData: timelineData,
    },
    mdxOptions: {
      remarkPlugins: [remarkGfm, remarkBoxPlugin, remarkFlourishPlugin],
    },
  });

  // Use the directory name as the slug
  return {
    slug: directorySlug,
    mdxSource,
    scrollyContent,
    htmlContent,
    tags: data.tags || [],
    content,
    title: data.title || 'Untitled',
    date: data.date || '',
    author: data.author || 'Anonymous',
    excerpt: data.excerpt || '',
    coverImage: data.coverImage || null,
  };
}
