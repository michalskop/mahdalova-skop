import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Container, Box } from '@mantine/core';
import VegaChart from '@/components/dpbp/VegaChart';
import { FollowBar } from '@/components/common/FollowBar';
import ArticleRating from '@/components/common/ArticleRating';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import RawHtmlEmbed from '@/components/common/RawHtmlEmbed';
import ArticleHeader from '@/components/dpbp/ArticleHeader';
import { FlourishEmbed } from '@/components/mdx/FlourishEmbed';
import PresidentialTripsMap from '@/components/dpbp/PresidentialTripsMap/PresidentialTripsMap';
import MandateCalendar from '@/components/dpbp/MandateCalendar/MandateCalendar';
import HistoricalPresidentialTrips from '@/components/dpbp/HistoricalPresidentialTrips/HistoricalPresidentialTrips';
import VetoChart from '@/components/dpbp/VetoChart/VetoChart';
import ChartSignature from '@/components/dpbp/ChartSignature';
import { readableAccent } from '@/utils/colorUtils';

const CONTENT_ROOT = path.join(process.cwd(), 'app/specialy/data-pro-budouci-premierku/_content');

function loadArticle(chapterSlug: string, articleSlug: string) {
  const p = path.join(CONTENT_ROOT, chapterSlug, 'articles', `${articleSlug}.mdx`);
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, 'utf8');
  const { data, content } = matter(raw);

  // Articles with raw HTML/SVG containing literal "{...}" (e.g. inline <style>
  // blocks with CSS) can't go through the MDX/JSX parser at all – MDX always
  // tries to read "{" as a JS expression, even inside what looks like plain
  // HTML text, and fails ("Could not parse expression with acorn"). Such
  // articles set `htmlInclude` in frontmatter pointing to a sibling .html
  // file, rendered via dangerouslySetInnerHTML instead of MDXRemote – same
  // mechanism the older /clanek/_articles/ system uses.
  let htmlContent: string | null = null;
  if (typeof data.htmlInclude === 'string') {
    const htmlPath = path.join(CONTENT_ROOT, chapterSlug, 'articles', data.htmlInclude);
    if (fs.existsSync(htmlPath)) {
      htmlContent = fs.readFileSync(htmlPath, 'utf8');
    }
  }

  return {
    frontmatter: data as {
      title: string;
      excerpt: string;
      author: string;
      date: string;
      coverImage?: string;
      heroInArticle?: boolean;
    },
    content,
    htmlContent,
  };
}

function loadChapterMeta(chapterSlug: string) {
  const p = path.join(CONTENT_ROOT, chapterSlug, '_meta.json');
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8')) as { title: string; accent: string };
}

// Chapters with a dedicated static hub page.tsx – excluded from dynamic
// generation to prevent output file collision in `output: 'export'` builds.
// Note: this only applies to the chapter HUB route ([chapter]/page.tsx);
// individual articles for 01-demografie are generated dynamically here.
const STATIC_CHAPTER_ROUTES = new Set<string>([]);

export async function generateStaticParams() {
  if (!fs.existsSync(CONTENT_ROOT)) return [];
  const params: Array<{ chapter: string; article: string }> = [];
  for (const chapter of fs.readdirSync(CONTENT_ROOT)) {
    if (STATIC_CHAPTER_ROUTES.has(chapter)) continue;
    const articlesDir = path.join(CONTENT_ROOT, chapter, 'articles');
    if (!fs.existsSync(articlesDir)) continue;
    for (const file of fs.readdirSync(articlesDir)) {
      if (file.endsWith('.mdx')) {
        params.push({ chapter, article: file.replace(/\.mdx$/, '') });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }: { params: { chapter: string; article: string } }) {
  const art = loadArticle(params.chapter, params.article);
  if (!art) return {};
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.mahdalova-skop.cz';
  const cover = (art.frontmatter as { coverImage?: string }).coverImage;
  return {
    title: `${art.frontmatter.title} – Data pro budoucí premiérku`,
    description: art.frontmatter.excerpt,
    ...(cover
      ? {
          openGraph: {
            title: art.frontmatter.title,
            description: art.frontmatter.excerpt,
            images: [{ url: `${baseUrl}${cover}`, width: 1200, height: 630 }],
          },
          twitter: { card: 'summary_large_image', images: [`${baseUrl}${cover}`] },
        }
      : {}),
  };
}

const mdxComponents = {
  VegaChart: ({ chartId }: { chartId: string }) => <VegaChart chartId={chartId} />,
  FlourishEmbed,
  PresidentialTripsMap,
  MandateCalendar,
  HistoricalPresidentialTrips,
  VetoChart,
  ChartSignature,
};

export default function ArticlePage({ params }: { params: { chapter: string; article: string } }) {
  const art = loadArticle(params.chapter, params.article);
  if (!art) notFound();

  const chapterMeta = loadChapterMeta(params.chapter);
  const { frontmatter: fm, content, htmlContent } = art;
  const accent = chapterMeta?.accent ?? '#de1743';
  // Body text (h2/links) needs WCAG-safe contrast on the white article
  // background – the raw accent can be a light brand colour picked for hue
  // variety on dark/decorative surfaces (logo, borders), which some chapters'
  // accents fail as text. Divider rule and blockquote border stay on the raw
  // accent since they're decorative, not text.
  const textAccent = readableAccent(accent);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.mahdalova-skop.cz';
  const shareUrl = `${baseUrl}/specialy/data-pro-budouci-premierku/${params.chapter}/${params.article}`;

  return (
    <Box style={{ background: '#fdfbf7', minHeight: '100vh' }}>
      {/* Article header – náležitosti (titulek, perex, autoři, datum, sdílení,
          audio stopa, náhledový obrázek s redakčním přepínačem heroInArticle) */}
      <ArticleHeader
        crumbs={[
          { label: 'Data pro budoucí premiérku', href: '/specialy/data-pro-budouci-premierku' },
          { label: chapterMeta?.title ?? 'Kapitola', href: `/specialy/data-pro-budouci-premierku/${params.chapter}` },
        ]}
        title={fm.title}
        excerpt={fm.excerpt}
        author={fm.author}
        date={fm.date}
        shareUrl={shareUrl}
        heroImage={fm.coverImage}
        showHero={fm.heroInArticle === true}
      />

      {/* Article body */}
      <Container size="sm" style={{ padding: '32px 16px 48px' }}>
        <div className="dpbp-article">
          {htmlContent ? (
            <RawHtmlEmbed html={htmlContent} assetBasePath={`/specialy/data-pro-budouci-premierku/_content/${params.chapter}/articles`} />
          ) : (
            <MDXRemote
              source={content}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [[rehypeRaw, { passThrough: ['mdxJsxFlowElement', 'mdxJsxTextElement', 'mdxFlowExpression', 'mdxTextExpression', 'mdxjsEsm'] }]],
                },
              }}
            />
          )}
        </div>
      </Container>

      {/* End-of-article engagement */}
      <Container size="md" style={{ padding: '0 16px' }}>
        <FollowBar />
      </Container>
      <Container size="md" bg="background.2" maw="928px" w="100%" p={0} m="0 auto">
        <ArticleRating />
      </Container>
      <Container size="md" p={0} m="0 auto" maw="928px" w="100%">
        <SubscribeNewsletter actionUrl="https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088" position="center" />
      </Container>

      {/* dangerouslySetInnerHTML: React při SSR escapuje apostrofy v textovém
          obsahu <style> na &#x27;, klient je pak porovnává s neescapovaným
          zněním a hlásí hydration mismatch. innerHTML porovnání textu obchází. */}
      <style dangerouslySetInnerHTML={{ __html: `
        .dpbp-article h2 {
          font-family: 'Roboto Slab', Georgia, serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: ${textAccent};
          margin: 2em 0 0.6em;
        }
        .dpbp-article h3 {
          font-family: 'Roboto Slab', Georgia, serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: #101432;
          margin: 1.5em 0 0.5em;
        }
        .dpbp-article p {
          font-family: 'Roboto Slab', Georgia, serif;
          font-size: 1.125rem;
          line-height: 1.7;
          color: #333;
          margin: 0 0 1em;
        }
        .dpbp-article ul, .dpbp-article ol {
          font-family: 'Roboto Slab', Georgia, serif;
          font-size: 1.125rem;
          line-height: 1.7;
          color: #333;
          padding-left: 1.4em;
          margin: 0 0 1em;
        }
        .dpbp-article strong { color: #101432; }
        .dpbp-article a { color: ${textAccent}; }
        .dpbp-article hr { border: none; border-top: 1px solid #e8e2d9; margin: 2em 0; }
        .dpbp-article blockquote {
          border-left: 3px solid ${accent};
          padding-left: 1em;
          color: #555;
          margin: 1.5em 0;
        }
        .dpbp-article em { color: #555; }
        .dpbp-article table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5em 0;
          font-family: 'Roboto Slab', Georgia, serif;
          font-size: 0.9rem;
          overflow-x: auto;
          display: block;
        }
        .dpbp-article thead { background: #f0ede6; }
        .dpbp-article th {
          padding: 8px 12px;
          font-weight: 700;
          text-align: left;
          border-bottom: 2px solid #e8e2d9;
          color: #101432;
          white-space: nowrap;
        }
        .dpbp-article td {
          padding: 8px 12px;
          border-bottom: 1px solid #e8e2d9;
          color: #333;
        }
        .dpbp-article tr:last-child td { border-bottom: none; }
      ` }} />
    </Box>
  );
}
