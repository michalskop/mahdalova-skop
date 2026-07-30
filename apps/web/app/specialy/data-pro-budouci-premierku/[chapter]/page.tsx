import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container, Title, Text, Box } from '@mantine/core';
import ImpactCard, { type ImpactCardData } from '@/components/dpbp/ImpactCard';
import DpbpArticleCard from '@/components/dpbp/DpbpArticleCard';
import ArticleByline from '@/components/dpbp/ArticleByline';
import VegaChart from '@/components/charts/VegaChart';
import ProfileHead from '@/components/dpbp/ProfileHead';
import ChapterRail from '@/components/dpbp/ChapterRail';
import { FollowBar } from '@/components/common/FollowBar';
import ArticleRating from '@/components/common/ArticleRating';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import SupportBanner from '@/components/common/SupportBanner';
import RawHtmlEmbed from '@/components/common/RawHtmlEmbed';
import { readableAccent } from '@/utils/colorUtils';
import { loadChapterContents } from '@/components/dpbp/chapterContents.server';
import { chapterAccent } from '@/components/dpbp/chapterNavigation';

const CONTENT_ROOT = path.join(process.cwd(), 'app/specialy/data-pro-budouci-premierku/_content');
const CHARTS_ROOT  = path.join(process.cwd(), 'public/specialy/dpbp/charts');

const NEWSLETTER_URL = 'https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088';

interface ChapterMeta {
  id: string;
  slug: string;
  title: string;
  accent: string;
  author: string;
  date: string;
  cardOrder: string[];
  onePager: { slug: string; logo: string | null } | null;
  introChart?: string;
  introChartHtml?: string;
  openerArticle?: string;
  intro?: {
    title: string;
    textBefore: string;
    textAfter: string;
    textClosing?: string;
    chartTitle?: string;
    chartCaption?: string;
  };
  tiles?: ChapterTile[];
  postSupportTiles?: ChapterTile[];
}

interface ChapterTile {
  slug: string;
  topic: string;
  fullWidth?: boolean;
  related?: Array<{ slug: string; label: string }>;
}

function loadMeta(chapterSlug: string): ChapterMeta | null {
  const p = path.join(CONTENT_ROOT, chapterSlug, '_meta.json');
  if (!fs.existsSync(p)) return null;
  const meta = JSON.parse(fs.readFileSync(p, 'utf8')) as Omit<ChapterMeta, 'accent'>;
  // Barva nepochází z JSONu, ale z kanonické palety – viz chapterNavigation.ts.
  return { ...meta, accent: chapterAccent(chapterSlug) };
}

function withRowSpan<T extends { fullWidth?: boolean }>(list: T[]): Array<T & { span: boolean }> {
  let col = 0;
  return list.map((t, i) => {
    if (t.fullWidth) {
      col = 0;
      return { ...t, span: true };
    }
    const aloneInRow = col === 0 && i === list.length - 1;
    col = aloneInRow ? 0 : (col + 1) % 2;
    return { ...t, span: aloneInRow };
  });
}

function loadCard(chapterSlug: string, cardId: string): ImpactCardData | null {
  const p = path.join(CONTENT_ROOT, chapterSlug, 'cards', `${cardId}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function loadArticleFrontmatter(chapterSlug: string, articleSlug: string) {
  const p = path.join(CONTENT_ROOT, chapterSlug, 'articles', `${articleSlug}.mdx`);
  if (!fs.existsSync(p)) return null;
  const { data } = matter(fs.readFileSync(p, 'utf8'));
  return data as { title: string; excerpt: string; author: string; date: string; primaryChart: string; logo?: string };
}

function loadRelatedArticles(
  chapterSlug: string,
  related: Array<{ slug: string; label: string }> | undefined
) {
  return (related ?? [])
    .map(item => ({ ...item, fm: loadArticleFrontmatter(chapterSlug, item.slug) }))
    .filter(item => item.fm != null);
}

function loadChartSpec(chartId: string): Record<string, unknown> | null {
  const p = path.join(CHARTS_ROOT, `${chartId}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function loadIntroChartHtml(chapterSlug: string, file: string): string | null {
  const p = path.join(CONTENT_ROOT, chapterSlug, file);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, 'utf8');
}

function IntroEndMark({ accent }: { accent: string }) {
  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '30px 0 8px' }}>
      <Box style={{ flex: 1, height: 1, background: '#e8e3d2' }} />
      <Box style={{ width: 8, height: 8, background: accent, borderRadius: 1 }} />
      <Box style={{ flex: 1, height: 1, background: '#e8e3d2' }} />
    </Box>
  );
}

const STATIC_CHAPTER_ROUTES = new Set<string>([]);

export async function generateStaticParams() {
  if (!fs.existsSync(CONTENT_ROOT)) return [];
  return fs.readdirSync(CONTENT_ROOT)
    .filter(d => fs.statSync(path.join(CONTENT_ROOT, d)).isDirectory())
    .filter(d => !STATIC_CHAPTER_ROUTES.has(d))
    .map(d => ({ chapter: d }));
}

export async function generateMetadata({ params }: { params: { chapter: string } }) {
  const meta = loadMeta(params.chapter);
  if (!meta) return {};
  return {
    title: `${meta.title} – Data pro budoucí premiérku`,
    alternates: {
      canonical: `/specialy/data-pro-budouci-premierku/${params.chapter}`,
    },
  };
}

export default function ChapterPage({ params }: { params: { chapter: string } }) {
  const meta = loadMeta(params.chapter);
  if (!meta) notFound();
  const chapterContents = loadChapterContents(CONTENT_ROOT);

  const introCardRaw = meta.cardOrder.length > 0 ? loadCard(params.chapter, meta.cardOrder[0]) : null;
  const introCard = introCardRaw ? { ...introCardRaw, accent: readableAccent(meta.accent) } : null;
  const introChartSpec = meta.introChart ? loadChartSpec(meta.introChart) : null;
  const introChartHtml = meta.introChartHtml ? loadIntroChartHtml(params.chapter, meta.introChartHtml) : null;

  const onePagerFm = meta.onePager
    ? loadArticleFrontmatter(params.chapter, meta.onePager.slug)
    : null;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.mahdalova-skop.cz';
  const openerFm = meta.openerArticle ? loadArticleFrontmatter(params.chapter, meta.openerArticle) : null;
  const openerHref = meta.openerArticle
    ? `/specialy/data-pro-budouci-premierku/${params.chapter}/${meta.openerArticle}`
    : null;

  const tiles = withRowSpan(
    [...(meta.tiles ?? []), ...(meta.postSupportTiles ?? [])]
      .filter(t => t.slug !== meta.openerArticle)
      .map(t => ({
        ...t,
        fm: loadArticleFrontmatter(params.chapter, t.slug),
        relatedArticles: loadRelatedArticles(params.chapter, t.related),
      }))
      .filter(t => t.fm != null)
  );

  return (
    <Box style={{ background: '#fdfbf7', minHeight: '100vh', paddingBottom: 76 }}>
      {/* Chapter header – dynamicky reaguje na hover ve všech menu a drží sticky pod hlavní lištou */}
      <Box style={{ position: 'sticky', top: 56, zIndex: 90, background: '#101432', padding: '24px 0 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Container size="md">
          <ChapterRail currentChapter={params.chapter} variant="hero" chapterContents={chapterContents} />
          <style
            dangerouslySetInnerHTML={{
              __html: `
            .dpbp-crumb-link {
              color: ${meta.accent};
              padding: 1px 4px;
              margin: -1px -4px;
              border-radius: 3px;
              transition: background-color 0.18s ease, color 0.18s ease;
            }
            .dpbp-crumb-link:hover,
            .dpbp-crumb-link:focus-visible {
              background-color: ${meta.accent};
              color: #101432;
            }
            @media (max-width: 768px) {
              .dpbp-chapter-head-profile { display: none; }
              .dpbp-tile-grid { grid-template-columns: 1fr !important; }
              .dpbp-tile-grid > * { grid-column: 1 !important; }
            }
          `,
            }}
          />
        </Container>
      </Box>

      <Container size="md" style={{ padding: '0 16px' }}>
        {/* Intro: kicker → titulek → text → audio player & menu jako v článku → statistika → text → graf → uzávěr */}
        {meta.intro && (
          <Box style={{ paddingTop: 40 }}>
            <style>{`
              .dpbpOpenerTitleLink {
                text-decoration: none !important;
                transition: text-decoration-color 0.18s ease;
              }
              .dpbpOpenerTitleLink:hover,
              .dpbpOpenerTitleLink:focus-visible {
                text-decoration: underline !important;
                text-decoration-color: var(--accent-underline) !important;
                text-underline-offset: 4px !important;
              }
              .dpbpKickerLink {
                color: var(--accent-color) !important;
                text-decoration: none !important;
                padding: 2px 6px;
                margin: -2px -6px;
                border-radius: 4px;
                transition: background-color 0.18s ease, color 0.18s ease;
              }
              .dpbpKickerLink:hover,
              .dpbpKickerLink:focus-visible {
                background-color: var(--accent-color) !important;
                color: #ffffff !important;
              }
            `}</style>
            <Title order={2} style={{
              fontFamily: 'var(--font-roboto-slab), Georgia, serif',
              fontSize: openerFm ? '2rem' : '1.6rem',
              fontWeight: openerFm ? 800 : 700,
              color: readableAccent(meta.accent),
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
              marginBottom: openerFm ? 14 : 20,
            }}>
              {openerFm && openerHref ? (
                <Link
                  href={openerHref}
                  className="dpbpOpenerTitleLink"
                  style={{
                    color: 'inherit',
                    ['--accent-underline' as string]: readableAccent(meta.accent),
                  } as React.CSSProperties}
                >
                  {openerFm.title}
                </Link>
              ) : (
                meta.intro.title
              )}
            </Title>
            {openerFm && (
              <Text style={{
                fontFamily: 'var(--font-roboto-slab), Georgia, serif',
                fontSize: 19,
                lineHeight: 1.5,
                color: '#3a3730',
                marginBottom: 10,
              }}>
                {openerFm.excerpt}
              </Text>
            )}
            {openerFm && openerHref && (
              <Box style={{ marginBottom: 24 }}>
                <ArticleByline
                  author={openerFm.author}
                  date={openerFm.date}
                  shareUrl={`${baseUrl}${openerHref}`}
                  shareTitle={openerFm.title}
                  audio
                />
              </Box>
            )}
            <Text style={{
              fontFamily: 'var(--font-roboto-slab), Georgia, serif',
              fontSize: 17,
              lineHeight: 1.7,
              color: '#2b2a27',
              marginBottom: 22,
            }}>
              {meta.intro.textBefore}
            </Text>
            {introCard && <ImpactCard card={introCard} />}
            <Text style={{
              fontFamily: 'var(--font-roboto-slab), Georgia, serif',
              fontSize: 17,
              lineHeight: 1.7,
              color: '#2b2a27',
              marginBottom: 22,
            }}>
              {meta.intro.textAfter}
            </Text>
            {introChartHtml ? (
              <Box component="figure" style={{ margin: '8px 0 24px' }}>
                <RawHtmlEmbed html={introChartHtml} />
              </Box>
            ) : introChartSpec ? (
              <Box component="figure" style={{ margin: '8px 0 24px' }}>
                {meta.intro.chartTitle && (
                  <Text style={{
                    fontFamily: 'var(--font-roboto-slab), Georgia, serif',
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    color: readableAccent(meta.accent),
                    marginBottom: 12,
                  }}>
                    {meta.intro.chartTitle}
                  </Text>
                )}
                <VegaChart spec={introChartSpec} />
                {meta.intro.chartCaption && (
                  <Text component="figcaption" style={{ fontSize: 12.5, color: '#5a564d', lineHeight: 1.5, marginTop: 10 }}>
                    {meta.intro.chartCaption}
                  </Text>
                )}
              </Box>
            ) : null}
            {meta.intro.textClosing && (
              <Text style={{
                fontFamily: 'var(--font-roboto-slab), Georgia, serif',
                fontSize: 17,
                lineHeight: 1.7,
                color: '#2b2a27',
                marginTop: 4,
              }}>
                {meta.intro.textClosing}
              </Text>
            )}
            {openerHref && (
              <Box style={{ marginTop: 20 }}>
                <Link href={openerHref} style={{
                  display: 'inline-block',
                  color: readableAccent(meta.accent),
                  fontFamily: 'var(--font-roboto-slab), Georgia, serif',
                  fontWeight: 700,
                  fontSize: 17,
                  textDecoration: 'none',
                }}>
                  Číst celý článek →
                </Link>
              </Box>
            )}
            <IntroEndMark accent={meta.accent} />
          </Box>
        )}

        {/* Sekce dlaždic */}
        {(onePagerFm || tiles.length > 0) && (
          <Box style={{ paddingTop: 20 }}>
            <Box style={{ marginBottom: 20 }}>
              <Title order={2} style={{
                fontFamily: 'var(--font-roboto-slab), Georgia, serif',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: readableAccent(meta.accent),
                marginBottom: 8,
              }}>
                Co v této kapitole najdete
              </Title>
              <Text style={{ fontSize: 14.5, color: '#5a564d', lineHeight: 1.55, maxWidth: '64ch' }}>
                Osm hlavních textů vede od vysvětlení demografických ukazatelů přes české dopady až k možnostem politiky. Pod nimi najdete navazující analýzy, které jednotlivé části rozvíjejí.
              </Text>
            </Box>

            {onePagerFm && meta.onePager && (
              <Box style={{ marginBottom: 18 }}>
                <DpbpArticleCard
                  href={`/specialy/data-pro-budouci-premierku/${params.chapter}/${meta.onePager.slug}`}
                  title={onePagerFm.title}
                  excerpt={onePagerFm.excerpt}
                  author={onePagerFm.author}
                  primaryChartSpec={null}
                  image={onePagerFm?.logo ?? meta.onePager?.logo ?? undefined}
                  accent={meta.accent}
                  type="Souhrn kapitoly"
                />
              </Box>
            )}

            {tiles.length > 0 && (
              <Box
                className="dpbp-tile-grid"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}
              >
                {tiles.map(t => (
                  <div key={t.slug} style={{ gridColumn: t.span ? '1 / -1' : 'auto' }}>
                    <DpbpArticleCard
                      href={`/specialy/data-pro-budouci-premierku/${params.chapter}/${t.slug}`}
                      title={t.fm!.title}
                      excerpt={t.fm!.excerpt}
                      author={t.fm!.author}
                      primaryChartSpec={null}
                      image={t.fm!.logo}
                      accent={meta.accent}
                      type={t.topic}
                      stacked={!t.fullWidth}
                    />
                  </div>
                ))}
              </Box>
            )}
          </Box>
        )}

        <Box style={{ marginTop: 40 }}>
          <SupportBanner />
        </Box>
      </Container>

      <Container size="md" style={{ padding: '0 16px' }}>
        <FollowBar />
      </Container>
      <Container
        size="md"
        bg="background.2"
        maw="928px"
        w="100%"
        p={0}
        m="0 auto"
      >
        <ArticleRating />
      </Container>
      <Container size="md" p={0} m="0 auto" maw="928px" w="100%">
        <SubscribeNewsletter actionUrl={NEWSLETTER_URL} position="center" />
      </Container>
    </Box>
  );
}
