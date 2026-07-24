import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container, Title, Text, Box } from '@mantine/core';
import ImpactCard, { type ImpactCardData } from '@/components/dpbp/ImpactCard';
import DpbpArticleCard from '@/components/dpbp/DpbpArticleCard';
import ArticleByline from '@/components/dpbp/ArticleByline';
import VegaChart from '@/components/dpbp/VegaChart';
import ProfileHead from '@/components/dpbp/ProfileHead';
import ChapterRail from '@/components/dpbp/ChapterRail';
import { FollowBar } from '@/components/common/FollowBar';
import ArticleRating from '@/components/common/ArticleRating';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import SupportBanner from '@/components/common/SupportBanner';
import RawHtmlEmbed from '@/components/common/RawHtmlEmbed';
import { readableAccent } from '@/utils/colorUtils';

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
  // Alternativa k Vega grafu: syrové HTML/SVG (např. ručně vytvořený interaktivní
  // graf). Renderuje se přes RawHtmlEmbed. Má přednost před introChart.
  introChartHtml?: string;
  // Vedoucí článek, který slouží jako otvírák kapitoly na landingu: jeho titulek,
  // perex, autoři a OG se použijí pro úvodní blok + odkaz „Číst celý článek".
  // Zároveň se vyloučí z mřížky dlaždic (aby nebyl dvakrát).
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
  // Historické pole – dlaždice, které dřív visely pod support bannerem. Nově se
  // slučují do jedné mřížky (viz redakční feedback: žádné dlaždice po banneru).
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
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

// Dlaždice s fullWidth zabírá celý řádek a resetuje párování; poloviční dlaždice,
// která by zůstala v řádku sama (poslední bez souseda), se roztáhne přes celý řádek.
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

// Jemná koncová značka úvodního textu – aby bylo poznat, kde úvod končí a kde
// začíná sekce dlaždic (viz redakční feedback).
function IntroEndMark({ accent }: { accent: string }) {
  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '30px 0 8px' }}>
      <Box style={{ flex: 1, height: 1, background: '#e8e3d2' }} />
      <Box style={{ width: 8, height: 8, background: accent, borderRadius: 1 }} />
      <Box style={{ flex: 1, height: 1, background: '#e8e3d2' }} />
    </Box>
  );
}

// Chapters with dedicated static page.tsx files – excluded from dynamic generation
// to prevent output file collision in `output: 'export'` builds. Prázdné: všechny
// kapitoly (včetně 01-demografie) jedou přes tuto jednotnou šablonu.
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
  return { title: `${meta.title} – Data pro budoucí premiérku` };
}

export default function ChapterPage({ params }: { params: { chapter: string } }) {
  const meta = loadMeta(params.chapter);
  if (!meta) notFound();

  // The per-card `accent` field in cards/*.json is an unused legacy default
  // (always crimson) – only cardOrder[0] is ever rendered, as the chapter's
  // intro number box, so it should match the chapter's own accent instead.
  // readableAccent() darkens it if needed – the raw accent can be a light
  // brand colour (bright yellow/teal/mint) picked for hue variety on dark or
  // decorative surfaces, which fails contrast as bold text on this card's
  // white background.
  const introCardRaw = meta.cardOrder.length > 0 ? loadCard(params.chapter, meta.cardOrder[0]) : null;
  const introCard = introCardRaw ? { ...introCardRaw, accent: readableAccent(meta.accent) } : null;
  const introChartSpec = meta.introChart ? loadChartSpec(meta.introChart) : null;
  const introChartHtml = meta.introChartHtml ? loadIntroChartHtml(params.chapter, meta.introChartHtml) : null;

  const onePagerFm = meta.onePager
    ? loadArticleFrontmatter(params.chapter, meta.onePager.slug)
    : null;

  // Vedoucí článek jako otvírák kapitoly (Option A): landing ukazuje jeho začátek
  // + „Číst celý článek", sdílení míří na jeho URL (má OG, titulek, perex, autory).
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.mahdalova-skop.cz';
  const openerFm = meta.openerArticle ? loadArticleFrontmatter(params.chapter, meta.openerArticle) : null;
  const openerHref = meta.openerArticle
    ? `/specialy/data-pro-budouci-premierku/${params.chapter}/${meta.openerArticle}`
    : null;

  // Jedna souvislá mřížka dlaždic. Historické `postSupportTiles` se slučují na
  // konec `tiles`; vedoucí (otvírákový) článek se z mřížky vyloučí, ať není dvakrát.
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
      <ChapterRail currentChapter={params.chapter} />

      {/* Chapter header – jeden masthead, název kapitoly je největší prvek stránky */}
      <Box style={{ background: '#101432', padding: '52px 0 44px' }}>
        <Container size="md">
          <Box className="dpbp-chapter-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 28 }}>
            <Box style={{ minWidth: 0 }}>
              <Text size="xs" style={{ color: '#f8f6f0', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
                <Link href="/specialy/data-pro-budouci-premierku" className="dpbp-crumb-link" style={{ textDecoration: 'none' }}>Data pro budoucí premiérku</Link> · Kapitola {meta.id}
              </Text>
              <Title order={1} style={{ color: '#f8f6f0', fontFamily: 'var(--font-roboto-slab), Georgia, serif', fontSize: 'clamp(2.1rem, 5vw, 2.9rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.01em', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
                {meta.title}
              </Title>
              <Box style={{ width: 64, height: 4, background: meta.accent, marginTop: 20, borderRadius: 2 }} />
            </Box>
            <Box className="dpbp-chapter-head-profile" style={{ flex: '0 0 auto' }}>
              <a
                href="https://www.mahdalova-skop.cz/specialy/data-pro-budouci-premierku"
                aria-label="Zpět na Data pro budoucí premiérku"
                style={{ display: 'block' }}
              >
                <ProfileHead silColor={meta.accent} style={{ width: 120, height: 120, display: 'block' }} />
              </a>
            </Box>
          </Box>
          {/* CSS předáváme přes dangerouslySetInnerHTML, ne jako textového
              potomka <style>. Textový potomek React na serveru HTML-escapuje
              (znak `>` v `.dpbp-tile-grid > *` → `&gt;`), na klientu ne –
              což rozbíjí hydrataci. */}
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
        {/* Intro: kicker → titulek → text → statistika → text → graf → uzávěr */}
        {meta.intro && (
          <Box style={{ paddingTop: 40 }}>
            <Text component="div" style={{
              fontSize: 12,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 700,
              marginBottom: 16,
            }}>
              <Link href="/specialy/data-pro-budouci-premierku" style={{ color: readableAccent(meta.accent), textDecoration: 'none' }}>Data pro budoucí premiérku</Link>
              <span style={{ color: '#b3ab98', margin: '0 7px' }}>›</span>
              <Link href={`/specialy/data-pro-budouci-premierku/${params.chapter}`} style={{ color: readableAccent(meta.accent), textDecoration: 'none' }}>{meta.title}</Link>
              <span style={{ color: '#b3ab98', margin: '0 7px' }}>›</span>
              <span style={{ color: readableAccent(meta.accent) }}>Úvod</span>
            </Text>
            <Title order={2} style={{
              fontFamily: 'var(--font-roboto-slab), Georgia, serif',
              fontSize: openerFm ? '2rem' : '1.6rem',
              fontWeight: openerFm ? 800 : 700,
              color: readableAccent(meta.accent),
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
              marginBottom: openerFm ? 14 : 20,
            }}>
              {openerFm?.title ?? meta.intro.title}
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

        {/* Sekce dlaždic – jeden pojmenovaný blok, souhrn + rovnocenná mřížka */}
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

            {/* Souhrn kapitoly – dlaždice přes celou šířku, piktogram jako náhled */}
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

        {/* Support banner – až za VŠEMI dlaždicemi */}
        <Box style={{ marginTop: 40 }}>
          <SupportBanner />
        </Box>
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
