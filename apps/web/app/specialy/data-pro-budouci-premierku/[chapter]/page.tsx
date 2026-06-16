import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container, Title, Text, Box } from '@mantine/core';
import ImpactCard, { type ImpactCardData } from '@/components/dpbp/ImpactCard';
import DpbpArticleCard from '@/components/dpbp/DpbpArticleCard';
import VegaChart from '@/components/dpbp/VegaChart';
import ProfileHead from '@/components/dpbp/ProfileHead';
import { FollowBar } from '@/components/common/FollowBar';
import ArticleRating from '@/components/common/ArticleRating';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import SupportBanner from '@/components/common/SupportBanner';

const CONTENT_ROOT = path.join(process.cwd(), 'app/specialy/data-pro-budouci-premierku/_content');
const CHARTS_ROOT  = path.join(process.cwd(), 'public/dpbp/charts');

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
  articles: Array<{ slug: string; primaryChart: string }>;
  intro?: { title: string; textBefore: string; textAfter: string };
}

function loadMeta(chapterSlug: string): ChapterMeta | null {
  const p = path.join(CONTENT_ROOT, chapterSlug, '_meta.json');
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
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

function loadChartSpec(chartId: string): Record<string, unknown> | null {
  const p = path.join(CHARTS_ROOT, `${chartId}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function SectionDivider({ accent }: { accent: string }) {
  return (
    <Box style={{ margin: '40px 0', display: 'flex', justifyContent: 'center' }}>
      <Box style={{ width: 48, height: 3, background: accent, borderRadius: 2 }} />
    </Box>
  );
}

export async function generateStaticParams() {
  if (!fs.existsSync(CONTENT_ROOT)) return [];
  return fs.readdirSync(CONTENT_ROOT)
    .filter(d => fs.statSync(path.join(CONTENT_ROOT, d)).isDirectory())
    .map(d => ({ chapter: d }));
}

export async function generateMetadata({ params }: { params: { chapter: string } }) {
  const meta = loadMeta(params.chapter);
  if (!meta) return {};
  return { title: `${meta.title} – Data pro budoucí premiérku` };
}

export default function ChapterPage({ params }: { params: { chapter: string } }) {
  const meta = loadMeta(params.chapter);
  if (!meta) notFound();

  const cards = meta.cardOrder.map(id => loadCard(params.chapter, id));
  const onePagerFm = meta.onePager
    ? loadArticleFrontmatter(params.chapter, meta.onePager.slug)
    : null;
  const articles = meta.articles.map(a => {
    const fm = loadArticleFrontmatter(params.chapter, a.slug);
    const chartSpec = loadChartSpec(a.primaryChart);
    return { ...a, fm, chartSpec };
  });
  const introCard = meta.intro ? loadCard(params.chapter, meta.cardOrder[0]) : null;
  const introChartSpec = meta.intro ? loadChartSpec(meta.articles[0]?.primaryChart) : null;

  return (
    <Box style={{ background: '#fdfbf7', minHeight: '100vh' }}>
      {/* Chapter header */}
      <Box style={{ background: '#101432', padding: '48px 0 40px' }}>
        <Container size="md">
          <Box className="dpbp-chapter-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24 }}>
            <Box style={{ minWidth: 0 }}>
              <Text size="xs" style={{ color: '#f8f6f0', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                <Link href="/specialy/data-pro-budouci-premierku" className="dpbp-crumb-link" style={{ textDecoration: 'none' }}>Data pro budoucí premiérku</Link> · Kapitola {meta.id}
              </Text>
              <Title order={1} style={{ color: '#f8f6f0', fontFamily: 'var(--font-roboto-slab), Georgia, serif', fontSize: '2rem', fontWeight: 800, WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
                {meta.title}
              </Title>
              <Box style={{ width: 48, height: 3, background: meta.accent, marginTop: 16 }} />
            </Box>
            <Box className="dpbp-chapter-head-profile" style={{ flex: '0 0 auto' }}>
              <ProfileHead style={{ maxHeight: 120, width: 'auto', display: 'block' }} />
            </Box>
          </Box>
          <style>{`
            .dpbp-crumb-link {
              color: #de1743;
              padding: 1px 4px;
              margin: -1px -4px;
              border-radius: 3px;
              transition: background-color 0.18s ease, color 0.18s ease;
            }
            .dpbp-crumb-link:hover,
            .dpbp-crumb-link:focus-visible {
              background-color: #de1743;
              color: #101432;
            }
            @media (max-width: 768px) {
              .dpbp-chapter-head-profile { display: none; }
            }
          `}</style>
        </Container>
      </Box>

      <Container size="md" style={{ padding: '0 16px' }}>
        {/* Intro: titulek → text → číslo v boxu → text → graf */}
        {meta.intro && (
          <Box style={{ paddingTop: 32 }}>
            <Title order={2} style={{
              fontFamily: 'Roboto Slab, Georgia, serif',
              fontSize: '1.6rem',
              fontWeight: 700,
              color: '#1a1a1a',
              lineHeight: 1.25,
              marginBottom: 16,
            }}>
              {meta.intro.title}
            </Title>
            <Text style={{
              fontFamily: 'Roboto Slab, Georgia, serif',
              fontSize: 16,
              lineHeight: 1.65,
              color: '#2a2a2a',
            }}>
              {meta.intro.textBefore}
            </Text>
            {introCard && <ImpactCard card={introCard} />}
            <Text style={{
              fontFamily: 'Roboto Slab, Georgia, serif',
              fontSize: 16,
              lineHeight: 1.65,
              color: '#2a2a2a',
            }}>
              {meta.intro.textAfter}
            </Text>
            {introChartSpec && <VegaChart spec={introChartSpec} />}
          </Box>
        )}

        {/* One-pager — navy, small top gap */}
        {onePagerFm && meta.onePager && (
          <Box style={{ paddingTop: 32 }}>
            <DpbpArticleCard
              href={`/specialy/data-pro-budouci-premierku/${params.chapter}/${meta.onePager.slug}`}
              title={onePagerFm.title}
              excerpt={onePagerFm.excerpt}
              author={onePagerFm.author}
              chapterTitle={meta.title}
              primaryChartSpec={null}
              image={onePagerFm?.logo ?? meta.onePager?.logo ?? undefined}
              accent="#101432"
              type="Shrnutí"
            />
          </Box>
        )}

        {/* Pairs: divider before each pair except pair[1] which is preceded by SupportBanner */}
        {articles.map((art, i) => {
          const card = cards[i] ?? null;
          const pairAccent = card?.accent ?? meta.accent;
          const chapterLogo = meta.onePager?.logo ?? null;
          const thumbImage = (!art.chartSpec && chapterLogo) ? chapterLogo : undefined;
          return (
            <Box key={art.slug}>
              {i === 1
                ? <Box style={{ margin: '8px 0 0' }}><SupportBanner /></Box>
                : <SectionDivider accent={pairAccent} />}
              {card && <ImpactCard card={card} />}
              {art.fm && (
                <DpbpArticleCard
                  href={`/specialy/data-pro-budouci-premierku/${params.chapter}/${art.slug}`}
                  title={art.fm.title}
                  excerpt={art.fm.excerpt}
                  author={art.fm.author}
                  chapterTitle={meta.title}
                  primaryChartSpec={art.chartSpec}
                  image={thumbImage}
                  accent={pairAccent}
                />
              )}
            </Box>
          );
        })}
      </Container>

      {/* End-of-chapter engagement */}
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
