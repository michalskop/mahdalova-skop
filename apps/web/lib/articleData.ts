// lib/articleData.ts
// Společné jádro článku: jaká data si text bere ze složky (YAML, JSON, CSV, HTML), jak se řadí pool
// souvisejících článků a jakými pluginy se Markdown zpracuje. Používá ho stavba webu (lib/articles.ts,
// soubory z disku) i náhled konceptu v hubu (app/nahled, soubory přes fetch) – proto tu nesmí být `fs`.
// Náhled tak vykresluje přesně to, co vyjde; nic se nekopíruje (9. 11. 2026).
import yaml from 'js-yaml';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { remarkBoxPlugin } from './remark-box-plugin';
import { remarkFlourishPlugin } from './remark-flourish-plugin';
import { remarkGalleryPlugin } from './remark-gallery-plugin';
import { remarkFlagPlugin } from './remark-flag-plugin';
import { remarkCzechTypography } from './remark-czech-typography';
import type { ScrollyContent } from '@/types/scrolly';
import type { TimelineContent } from '@/types/timeline';

/** Přečte soubor ze složky článku (cesta relativně ke složce); null = soubor neexistuje. */
export type ReadArticleFile = (relPath: string) => Promise<string | null>;

export const ARTICLE_MDX_OPTIONS = {
  remarkPlugins: [remarkGfm, remarkBoxPlugin, remarkFlourishPlugin, remarkGalleryPlugin, remarkFlagPlugin, remarkCzechTypography],
  rehypePlugins: [[rehypeRaw, { passThrough: ['mdxJsxFlowElement', 'mdxJsxTextElement', 'mdxFlowExpression', 'mdxTextExpression', 'mdxjsEsm'] }]],
} as any;

export function parseCsv(content: string) {
  const text = content.replace(/^﻿/, '');
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

function filesOf(content: string, re: RegExp): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  re.lastIndex = 0;
  while ((m = re.exec(content)) !== null) {
    if (m[1] && !out.includes(m[1])) out.push(m[1]);
  }
  return out;
}

/**
 * Načte všechna data, která text článku odkazuje. `where` je jen pro chybové hlášky (slug).
 * Chybějící povinný soubor = chyba (stejně jako dřív při stavbě webu).
 */
export async function loadArticleData(content: string, frontmatter: Record<string, any>, read: ReadArticleFile, where: string) {
  const need = async (rel: string, what: string) => {
    const text = await read(rel);
    if (text === null) throw new Error(`${what} not found: ${where}/${rel}`);
    return text;
  };

  // Optional raw HTML include
  let htmlContent: string | null = null;
  if (typeof frontmatter.htmlInclude === 'string' && frontmatter.htmlInclude.trim().length > 0) {
    htmlContent = await need(frontmatter.htmlInclude, 'htmlInclude file');
  }

  // Optional scrollytelling.yaml
  let scrollyContent: ScrollyContent | null = null;
  const scrollyFile = await read('scrollytelling.yaml');
  if (scrollyFile !== null) scrollyContent = yaml.load(scrollyFile) as ScrollyContent;

  // Timeline / RouteTimeline (same YAML format, multiple instances)
  const timelineData: Record<string, TimelineContent> = {};
  for (const f of filesOf(content, /<(?:Route)?Timeline\b[^>]*yamlFile="([^"]+)"[^>]*\/>/g)) {
    timelineData[f] = yaml.load(await need(f, 'Timeline yaml file')) as TimelineContent;
  }

  // KeyNumbers
  const keyNumbersData: Record<string, any> = {};
  for (const f of filesOf(content, /<KeyNumbers[^>]*yamlFile="([^"]+)"[^>]*\/?>/g)) {
    keyNumbersData[f] = yaml.load(await need(f, 'KeyNumbers yaml file'));
  }

  // StyledTable (CSV-backed tables)
  const styledTableData: Record<string, { headers: string[]; rows: Record<string, string>[] }> = {};
  for (const f of filesOf(content, /<StyledTable[^>]*csvFile="([^"]+)"[^>]*\/?>/g)) {
    styledTableData[f] = parseCsv(await need(f, 'StyledTable csvFile'));
  }

  // AttendanceSwarm (JSON)
  const attendanceSwarmData: Record<string, any[]> = {};
  for (const f of filesOf(content, /<AttendanceSwarm[^>]*dataFile="([^"]+)"[^>]*\/?>/g)) {
    attendanceSwarmData[f] = JSON.parse(await need(f, 'AttendanceSwarm dataFile'));
  }

  // VegaChart (Vega-Lite spec JSON)
  const vegaChartData: Record<string, any> = {};
  for (const f of filesOf(content, /<VegaChart[^>]*dataFile="([^"]+)"[^>]*\/?>/g)) {
    vegaChartData[f] = JSON.parse(await need(f, 'VegaChart dataFile'));
  }

  // HtmlEmbed (only .html files)
  const htmlEmbedData: Record<string, string> = {};
  for (const f of filesOf(content, /<HtmlEmbed[^>]*file="([^"]+)"[^>]*\/?>/g)) {
    if (!f.endsWith('.html')) throw new Error(`HtmlEmbed only supports .html files: ${where}/${f}`);
    htmlEmbedData[f] = await need(f, 'HtmlEmbed file');
  }

  // MotionsStancesTable (first instance, optional)
  let tableData: any[] = [];
  const match = content.match(/<MotionsStancesTable[^>]*dataFile="([^"]+)"/);
  if (match && match[1]) {
    const text = await read(match[1]);
    if (text !== null) {
      try { tableData = JSON.parse(text); } catch (e) { console.error(`Failed to parse JSON from ${where}/${match[1]}`, e); }
    }
  }

  // osobnosti.json (medailonky for the inline <Person> component), optional
  let personsData: Record<string, any> = {};
  const persons = await read('osobnosti.json');
  if (persons !== null) {
    try { personsData = JSON.parse(persons); } catch (e) { console.error(`Failed to parse JSON from ${where}/osobnosti.json`, e); }
  }

  return {
    htmlContent,
    scrollyContent,
    scope: { tableData, timelineData, keyNumbersData, styledTableData, htmlEmbedData, attendanceSwarmData, vegaChartData, personsData },
  };
}

/** Pořadí poolu pro RelatedArticles: nejvíc společných tagů první, jinak původní pořadí (stabilní řazení). */
export function rankRelatedPool<T extends { slug: string; tags?: string[] }>(pool: T[], slug: string, tags: string[] = []): T[] {
  const ownTags = new Set<string>(tags.map((t) => t.toLowerCase()));
  const shared = (a: T) => (a.tags || []).filter((t) => ownTags.has(t.toLowerCase())).length;
  return pool
    .filter((a) => a.slug !== slug)
    .map((a, i) => ({ a, i, s: shared(a) }))
    .sort((x, y) => y.s - x.s || x.i - y.i)
    .map((x) => x.a);
}
