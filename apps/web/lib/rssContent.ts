// lib/rssContent.ts
// Plný text článku jako čisté HTML pro <content:encoded> v RSS (MSN, Flipboard,
// Feedly…). Čtečky nespustí naše React komponenty, proto se markdown článku
// převede na obyčejné HTML: boxy → citace, <Figure> → obrázek s popiskem,
// interaktivní grafy a mapy → odkaz „najdete v článku“, vložené boxy
// (RelatedArticles, SupportBanner) pryč. Relativní odkazy a obrázky dostanou
// absolutní adresu webu.
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { remarkCzechTypography } from './remark-czech-typography';

const ARTICLES_DIR = path.join(process.cwd(), 'app/clanek/_articles');

// Komponenty, které do čtečky nepatří vůbec (navigace, výzvy, vlaječky).
const DROP = new Set([
  'RelatedArticles', 'SupportBanner', 'PreferredSource', 'DpbpPromo', 'Flag', 'Swatch',
  'script', 'style', 'noscript', 'summary',
]);
// Obalové prvky: ponechat jen jejich obsah.
const UNWRAP = new Set(['Person', 'PartyFace', 'span', 'strong', 'i', 'b', 'em', 'div', 'details', 'ChartRow']);

const PLACEHOLDER = 'interactive-placeholder';

type Node = any;

const boxParser = unified().use(remarkParse).use(remarkGfm);

function attr(node: Node, name: string): string | undefined {
  const a = (node.attributes || []).find((x: Node) => x.type === 'mdxJsxAttribute' && x.name === name);
  return typeof a?.value === 'string' ? a.value : undefined;
}

function inlineMarkdown(text: string): Node[] {
  const first = boxParser.parse(text).children[0];
  return first?.type === 'paragraph' ? first.children : [{ type: 'text', value: text }];
}

function placeholder(articleUrl: string, label = 'Interaktivní graf'): Node {
  return {
    type: 'paragraph',
    data: { [PLACEHOLDER]: true },
    children: [
      { type: 'text', value: `📊 ${label} najdete v ` },
      { type: 'link', url: articleUrl, children: [{ type: 'text', value: 'článku na DataTimes.cz' }] },
      { type: 'text', value: '.' },
    ],
  };
}

function imageNodes(src: string, alt: string, caption: string | undefined, resolve: (u: string) => string): Node[] {
  const nodes: Node[] = [
    { type: 'paragraph', children: [{ type: 'image', url: resolve(src), alt, title: null }] },
  ];
  if (caption) nodes.push({ type: 'paragraph', children: [{ type: 'emphasis', children: inlineMarkdown(caption) }] });
  return nodes;
}

function transform(children: Node[], ctx: { articleUrl: string; resolve: (u: string) => string; flow: boolean }): Node[] {
  const out: Node[] = [];
  for (const node of children) {
    switch (node.type) {
      case 'mdxjsEsm':
      case 'mdxFlowExpression':
      case 'mdxTextExpression':
      case 'html':
        continue;

      case 'code': {
        const lang = node.lang || '';
        if (lang === 'box' || lang === 'mediabox' || lang === 'infobox') {
          const inner = boxParser.parse(node.value).children;
          out.push({ type: 'blockquote', children: transform(inner, { ...ctx, flow: true }) });
        } else if (lang === 'fotogalerie' || lang === 'gallery') {
          for (const raw of String(node.value).split(/\r?\n/)) {
            const [src, caption, credit] = raw.trim().replace(/^[-*]\s+/, '').split('|').map((p) => p.trim());
            if (!src) continue;
            const text = [caption, credit].filter(Boolean).join(' · ');
            out.push(...imageNodes(src, caption || '', text || undefined, ctx.resolve));
          }
        } else {
          out.push(node);
        }
        continue;
      }

      case 'image':
        out.push({ ...node, url: ctx.resolve(node.url) });
        continue;

      case 'link':
        out.push({ ...node, url: ctx.resolve(node.url), children: transform(node.children, ctx) });
        continue;

      case 'mdxJsxFlowElement':
      case 'mdxJsxTextElement': {
        const name: string = node.name || '';
        const isFlow = node.type === 'mdxJsxFlowElement';
        if (!name || DROP.has(name)) continue;

        if (name === 'Figure' || name === 'img') {
          const src = attr(node, 'src');
          if (src) {
            const nodes = imageNodes(src, attr(node, 'alt') || '', attr(node, 'caption'), ctx.resolve);
            out.push(...(isFlow ? nodes : nodes[0].children));
          }
          continue;
        }
        if (name === 'br') {
          out.push({ type: 'break' });
          continue;
        }
        if (name === 'InfoBox') {
          out.push({ type: 'blockquote', children: transform(node.children || [], { ...ctx, flow: true }) });
          continue;
        }
        if (name === 'iframe') {
          if (isFlow) out.push(placeholder(ctx.articleUrl, 'Vložený obsah'));
          continue;
        }
        if (UNWRAP.has(name) || (node.children?.length && !isFlow)) {
          out.push(...transform(node.children || [], { ...ctx, flow: isFlow }));
          continue;
        }
        if (node.children?.length) {
          out.push(...transform(node.children, ctx));
          continue;
        }
        // Graf, mapa, tabulka nebo jiná interaktivní komponenta bez textového obsahu.
        if (isFlow) out.push(placeholder(ctx.articleUrl));
        continue;
      }

      default:
        out.push(node.children ? { ...node, children: transform(node.children, ctx) } : node);
    }
  }

  // Víc grafů za sebou = jeden odkaz; prázdné odstavce pryč.
  return out.filter((node, i) => {
    if (node.type === 'paragraph' && node.children?.length === 0) return false;
    const prev = out[i - 1];
    return !(node.data?.[PLACEHOLDER] && prev?.data?.[PLACEHOLDER]);
  });
}

/**
 * HTML celého článku pro RSS. Vrací undefined, když článek nemá index.md
 * (např. kapitoly speciálů mimo _articles) nebo když se markdown nepodaří
 * převést – feed pak u článku nechá jen perex.
 */
export function getRssContent(slug: string, articleUrl: string, siteUrl: string, coverImage?: string | null) {
  const file = path.join(ARTICLES_DIR, slug, 'index.md');
  if (!fs.existsSync(file)) return undefined;

  const resolve = (url: string) => {
    if (!url || /^(https?:|mailto:|tel:)/.test(url)) return url;
    if (url.startsWith('#')) return `${articleUrl}${url}`;
    if (url.startsWith('/')) return `${siteUrl}${url}`;
    return `${siteUrl}/clanek/_articles/${slug}/images/${url.replace(/^\.?\/?(images\/)?/, '')}`;
  };

  try {
    const { content } = matter(fs.readFileSync(file, 'utf8'));
    const processor = unified()
      .use(remarkParse)
      .use(remarkMdx)
      .use(remarkGfm)
      .use(remarkCzechTypography)
      .use(remarkRehype)
      .use(rehypeStringify);
    const tree = processor.parse(content);
    tree.children = transform(tree.children, { articleUrl, resolve, flow: true });
    if (coverImage) {
      tree.children.unshift({
        type: 'paragraph',
        children: [{ type: 'image', url: resolve(coverImage), alt: '', title: null }],
      } as Node);
    }
    const hast = processor.runSync(tree);
    return processor.stringify(hast);
  } catch (e) {
    console.error(`RSS: článek ${slug} se nepodařilo převést na HTML`, e);
    return undefined;
  }
}
