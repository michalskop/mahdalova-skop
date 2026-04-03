// lib/articles.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { remarkBoxPlugin } from './remark-box-plugin'; // Your custom plugin
import { remarkFlourishPlugin } from './remark-flourish-plugin';
import type { ScrollyContent } from '@/types/scrolly';
import type { TimelineContent } from '@/types/timeline';
import { getArticles } from '@/components/common/getArticles';


function parseCsv(content: string) {
  const text = content.replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (!lines.length) return { headers: [] as string[], rows: [] as Record<string, string>[] };

  const detectDelimiter = (line: string) => {
    const commas = (line.match(/,/g) || []).length;
    const semis = (line.match(/;/g) || []).length;
    return semis > commas ? ';' : ',';
  };

  const delimiter = detectDelimiter(lines[0]);

  const parseLine = (line: string) => {
    const out: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
          continue;
        }
        inQuotes = !inQuotes;
        continue;
      }

      if (!inQuotes && ch === delimiter) {
        out.push(cur.trim());
        cur = '';
        continue;
      }

      cur += ch;
    }

    out.push(cur.trim());
    return out;
  };

  const headers = parseLine(lines[0]).map((h) => h.replace(/^"|"$/g, '').trim());
  const rows = lines.slice(1).map((line) => {
    const cells = parseLine(line).map((c) => c.replace(/^"|"$/g, ''));
    const rec: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rec[h] = cells[idx] ?? '';
    });
    return rec;
  });

  return { headers, rows };
}


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

  // Find and load data for StyledTable (CSV-backed tables; supports multiple instances)
  const styledTableData: Record<string, { headers: string[]; rows: Record<string, string>[] }> = {};
  const styledTableRegex = /<StyledTable[^>]*csvFile="([^"]+)"[^>]*\/?>/g;
  let styledMatch: RegExpExecArray | null;
  while ((styledMatch = styledTableRegex.exec(content)) !== null) {
    const csvFile = styledMatch[1];
    if (!csvFile) continue;
    if (styledTableData[csvFile]) continue;

    const csvPath = path.join(articleDir, csvFile);
    if (!fs.existsSync(csvPath)) {
      throw new Error(`StyledTable csvFile not found: ${directorySlug}/${csvFile}`);
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    styledTableData[csvFile] = parseCsv(csvContent);
  }

  // Find and load HTML files for HtmlEmbed components (supports multiple instances)
  const htmlEmbedData: Record<string, string> = {};
  const htmlEmbedRegex = /<HtmlEmbed[^>]*file="([^"]+)"[^>]*\/?>/g;
  let htmlMatch: RegExpExecArray | null;
  while ((htmlMatch = htmlEmbedRegex.exec(content)) !== null) {
    const htmlFile = htmlMatch[1];
    if (!htmlFile) continue;
    if (htmlEmbedData[htmlFile]) continue;

    // Security: only allow .html files
    if (!htmlFile.endsWith('.html')) {
      throw new Error(`HtmlEmbed only supports .html files: ${directorySlug}/${htmlFile}`);
    }

    const htmlPath = path.join(articleDir, htmlFile);
    if (!fs.existsSync(htmlPath)) {
      throw new Error(`HtmlEmbed file not found: ${directorySlug}/${htmlFile}`);
    }

    htmlEmbedData[htmlFile] = fs.readFileSync(htmlPath, 'utf8');
  }

  // Pre-fetch article pool for RelatedArticles MDX component
  const relatedArticlesPool = await getArticles(9999, undefined, true);
  const filteredPool = relatedArticlesPool.filter(a => a.slug !== directorySlug);

  const mdxSource = await serialize(content, {
    scope: {
      timelineData: timelineData,
      styledTableData: styledTableData,
      htmlEmbedData: htmlEmbedData,
      relatedArticlesPool: filteredPool,
    },
    mdxOptions: {
      remarkPlugins: [remarkGfm, remarkBoxPlugin, remarkFlourishPlugin],
      rehypePlugins: [[rehypeRaw, { passThrough: ['mdxJsxFlowElement', 'mdxJsxTextElement', 'mdxFlowExpression', 'mdxTextExpression', 'mdxjsEsm'] }]],
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
