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
  introChart?: string;
  intro?: { title: string; textBefore: string; textAfter: string; textClosing?: string };
  tiles?: Array<{ slug: string; topic: string; fullWidth?: boolean }>;
  postSupportTiles?: Array<{ slug: string; topic: string; fullWidth?: boolean }>;
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

// Chapters with dedicated static page.tsx files – excluded from dynamic generation
// to prevent output file collision in `output: 'export'` builds.
const STATIC_CHAPTER_ROUTES = new Set(['01-demografie']);

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
  return { title: `${meta.title} – Data pro budoucí premiérku` };
}

export default function ChapterPage({ params }: { params: { chapter: string } }) {
  const meta = loadMeta(params.chapter);
  if (!meta) notFound();

  const introCard = meta.cardOrder.length > 0 ? loadCard(params.chapter, meta.cardOrder[0]) : null;
  const introChartSpec = meta.introChart ? loadChartSpec(meta.introChart) : null;

  const onePagerFm = meta.onePager
    ? loadArticleFrontmatter(params.chapter, meta.onePager.slug)
    : null;

  // Unified tile grid, 4 pairs (8 tiles) in fixed editorial order:
  // Pár 1: Explainer (vlevo) | Svět/Evropa (vpravo)
  // Pár 2: mezinárodní kontext (vlevo) | hlavní analýza 01 (vpravo)
  // Pár 3: hlavní analýza 02 (vlevo) | hlavní analýza 03 (vpravo)
  // Pár 4: datová investigace (vlevo) | komparace/solution journalism (vpravo)
  const tiles = (meta.tiles ?? [])
    .map(t => ({ ...t, fm: loadArticleFrontmatter(params.chapter, t.slug) }))
    .filter(t => t.fm != null);

  const postSupportTiles = (meta.postSupportTiles ?? [])
    .map(t => ({ ...t, fm: loadArticleFrontmatter(params.chapter, t.slug) }))
    .filter(t => t.fm != null);

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
              <a
                href="https://www.mahdalova-skop.cz/specialy/data-pro-budouci-premierku"
                aria-label="Zpět na Data pro budoucí premiérku"
                style={{ display: 'block' }}
              >
                <ProfileHead initialRandom style={{ width: 120, height: 120, display: 'block' }} />
              </a>
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
              .dpbp-tile-grid { grid-template-columns: 1fr !important; }
              .dpbp-tile-grid > * { grid-column: 1 !important; }
            }
            .dpbp-tile-grid > *:last-child:nth-child(odd) {
              grid-column: 1 / -1;
            }
          `}</style>
        </Container>
      </Box>

      <Container size="md" style={{ padding: '0 16px' }}>
        {/* Intro: titulek → textBefore → infobox s číslem → textAfter → graf */}
        {meta.intro && (
          <Box style={{ paddingTop: 32 }}>
            <Title order={2} style={{
              fontFamily: 'var(--font-roboto-slab), Georgia, serif',
              fontSize: '1.6rem',
              fontWeight: 700,
              color: '#1a1a1a',
              lineHeight: 1.25,
              marginBottom: 16,
            }}>
              {meta.intro.title}
            </Title>
            <Text style={{
              fontFamily: 'var(--font-roboto-slab), Georgia, serif',
              fontSize: 16,
              lineHeight: 1.65,
              color: '#2a2a2a',
              marginBottom: 20,
            }}>
              {meta.intro.textBefore}
            </Text>
            {introCard && <ImpactCard card={introCard} />}
            <Text style={{
              fontFamily: 'var(--font-roboto-slab), Georgia, serif',
              fontSize: 16,
              lineHeight: 1.65,
              color: '#2a2a2a',
              marginBottom: 20,
            }}>
              {meta.intro.textAfter}
            </Text>
            {introChartSpec && <VegaChart spec={introChartSpec} />}
            {meta.intro.textClosing && (
              <Text style={{
                fontFamily: 'var(--font-roboto-slab), Georgia, serif',
                fontSize: 16,
                lineHeight: 1.65,
                color: '#2a2a2a',
                marginTop: 20,
              }}>
                {meta.intro.textClosing}
              </Text>
            )}
          </Box>
        )}

        {/* Shrnutí – full-width dlaždice */}
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

        {/* 4 páry dlaždic (2 sloupce) – viz pořadí v meta.tiles */}
        {tiles.length > 0 && (
          <Box>
            <SectionDivider accent={meta.accent} />
            <Box
              className="dpbp-tile-grid"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 8 }}
            >
              {tiles.map(t => (
                <div key={t.slug} style={t.fullWidth ? { gridColumn: '1 / -1' } : undefined}>
                  <DpbpArticleCard
                    href={`/specialy/data-pro-budouci-premierku/${params.chapter}/${t.slug}`}
                    title={t.fm!.title}
                    excerpt={t.fm!.excerpt}
                    author={t.fm!.author}
                    chapterTitle={meta.title}
                    primaryChartSpec={null}
                    image={t.fm!.logo}
                    accent={meta.accent}
                    type={t.topic}
                    stacked={!t.fullWidth}
                  />
                </div>
              ))}
            </Box>
          </Box>
        )}

        <Box style={{ marginTop: 24 }}>
          <SupportBanner />
        </Box>

        {/* Pokračování kapitoly – dlaždice zařazené pod support banner */}
        {postSupportTiles.length > 0 && (
          <Box
            className="dpbp-tile-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginTop: 24, marginBottom: 8 }}
          >
            {postSupportTiles.map(t => (
              <div key={t.slug} style={t.fullWidth ? { gridColumn: '1 / -1' } : undefined}>
                <DpbpArticleCard
                  href={`/specialy/data-pro-budouci-premierku/${params.chapter}/${t.slug}`}
                  title={t.fm!.title}
                  excerpt={t.fm!.excerpt}
                  author={t.fm!.author}
                  chapterTitle={meta.title}
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
