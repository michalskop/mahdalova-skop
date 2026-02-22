'use client';

import {
  Anchor,
  Badge,
  Box,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import type { MantineSize } from '@mantine/core';
import type { Article } from '../lib/getArticles';

type Preset = 'sidebar' | 'cards' | 'list';
type ImagePos = 'top' | 'left' | 'right' | 'none';
type CardBg = 'white' | 'cream' | 'transparent';
type SortOrder = 'default' | 'newest';

interface RelatedArticlesProps {
  // Data (injected from scope by ArticleRenderer)
  pool?: Article[];

  // Filtering (set by author in MDX)
  filter?: string | string[];
  tag?: string;
  slugs?: string[];   // hard-coded list; overrides filter/tag when provided
  count?: number;

  // Heading — pass false to suppress the heading and its border entirely
  heading?: string | false;

  // Sort order
  sort?: SortOrder;

  // Preset
  preset?: Preset;

  // Layout overrides
  columns?: 1 | 2 | 3 | 4;
  imagePosition?: ImagePos;
  cardBackground?: CardBg;
  titleSize?: MantineSize;

  // Show/hide toggles
  showExcerpt?: boolean;
  showImage?: boolean;
  showDate?: boolean;
  showReadingTime?: boolean;
  showAuthor?: boolean;
  showFormatBadge?: boolean;
  showEmbed?: boolean;
  showTopicBadge?: boolean;

  // App-specific
  articleBasePath?: string;
  locale?: string;
}

interface PresetConfig {
  columns: 1 | 2 | 3 | 4;
  imagePosition: ImagePos;
  cardBackground: CardBg;
  titleSize: MantineSize;
  showAuthor: boolean;
  showExcerpt: boolean;
  showDate: boolean;
  showReadingTime: boolean;
  showFormatBadge: boolean;
  showTopicBadge: boolean;
  showEmbed: boolean;
  showImage: boolean;
}

const PRESET_DEFAULTS: Record<Preset, PresetConfig> = {
  sidebar: {
    columns: 1,
    imagePosition: 'left',
    cardBackground: 'transparent',
    titleSize: 'sm',
    showAuthor: false,
    showExcerpt: false,
    showDate: true,
    showReadingTime: false,
    showFormatBadge: true,
    showTopicBadge: false,
    showEmbed: false,
    showImage: true,
  },
  cards: {
    columns: 3,
    imagePosition: 'top',
    cardBackground: 'white',
    titleSize: 'md',
    showAuthor: true,
    showExcerpt: true,
    showDate: true,
    showReadingTime: false,
    showFormatBadge: true,
    showTopicBadge: false,
    showEmbed: false,
    showImage: true,
  },
  list: {
    columns: 1,
    imagePosition: 'left',
    cardBackground: 'white',
    titleSize: 'lg',
    showAuthor: true,
    showExcerpt: true,
    showDate: true,
    showReadingTime: true,
    showFormatBadge: true,
    showTopicBadge: true,
    showEmbed: false,
    showImage: true,
  },
};

function getFilterLabel(filter: string | string[] | undefined): string | null {
  if (!filter) return null;
  const first = Array.isArray(filter) ? filter[0] : filter;
  if (!first) return null;
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function useFilterColor(filter: string | string[] | undefined): string {
  const theme = useMantineTheme();
  const first = Array.isArray(filter) ? filter[0] : filter;
  const val = (first ?? '').toLowerCase();

  const map: Record<string, string> = {
    analýza: theme.colors.brand[6],
    analyza: theme.colors.brand[6],
    kontext: theme.colors.brandNavy[6],
    komentář: theme.colors.brandOrange[6],
    komentar: theme.colors.brandOrange[6],
    komentare: theme.colors.brandOrange[6],
    podcast: theme.colors.brandTeal[6],
    data: theme.colors.brandTeal[6],
  };

  return map[val] ?? theme.colors.brand[6];
}

function cardBgValue(bg: CardBg): string {
  if (bg === 'white') return 'background.2';
  if (bg === 'cream') return 'background.1';
  return 'transparent';
}

interface MiniCardProps {
  article: Article;
  imagePosition: ImagePos;
  cardBackground: CardBg;
  titleSize: MantineSize;
  showExcerpt: boolean;
  showImage: boolean;
  showDate: boolean;
  showReadingTime: boolean;
  showAuthor: boolean;
  showFormatBadge: boolean;
  showEmbed: boolean;
  showTopicBadge: boolean;
  articleBasePath: string;
  locale: string;
}

function MiniCard({
  article,
  imagePosition,
  cardBackground,
  titleSize,
  showExcerpt,
  showImage,
  showDate,
  showReadingTime,
  showAuthor,
  showFormatBadge,
  showEmbed,
  showTopicBadge,
  articleBasePath,
  locale,
}: MiniCardProps) {
  const theme = useMantineTheme();
  const href = `${articleBasePath}/${article.slug}`;
  const bg = cardBgValue(cardBackground);
  const filterColor = useFilterColor(article.filter);
  const filterLabel = getFilterLabel(article.filter);

  const badges = (
    <Group gap={4} wrap="wrap">
      {showFormatBadge && filterLabel && (
        <Badge size="xs" style={{ backgroundColor: filterColor, color: '#fff' }}>
          {filterLabel}
        </Badge>
      )}
      {showTopicBadge && article.topic && (
        <Badge size="xs" variant="outline" color="brandNavy.6">
          {article.topic}
        </Badge>
      )}
    </Group>
  );

  const dateText = (showDate || showReadingTime) && (
    <Text size="xs" c="dimmed">
      {showDate && new Date(article.date).toLocaleDateString(locale)}
      {showDate && showReadingTime && article.readingTime ? ' · ' : ''}
      {showReadingTime && article.readingTime ? `${article.readingTime} min` : ''}
    </Text>
  );

  const titleEl = (
    <Anchor href={href} underline="hover" c="inherit" target="_blank" rel="noopener noreferrer">
      <Text fw={600} size={titleSize} lh={1.3}>
        {article.title}
      </Text>
    </Anchor>
  );

  const excerpt = showExcerpt && article.excerpt && (
    <Text size="sm" c="dimmed" lineClamp={3}>
      {article.excerpt}
    </Text>
  );

  const authorText = showAuthor && article.author && (
    <Text size="xs" c="dimmed">
      {article.author}
    </Text>
  );

  const embed = showEmbed && article.embedHtml && (
    <Box dangerouslySetInnerHTML={{ __html: article.embedHtml }} />
  );

  const textBlock = (
    <Stack gap={4} style={{ flex: 1 }}>
      {badges}
      {titleEl}
      {excerpt}
      {dateText}
      {authorText}
      {embed}
    </Stack>
  );

  const hasImage = showImage && article.coverImage;

  if (!hasImage || imagePosition === 'none') {
    return (
      <Box bg={bg} p={cardBackground !== 'transparent' ? 'sm' : 0} style={{ borderRadius: 6 }}>
        {textBlock}
      </Box>
    );
  }

  if (imagePosition === 'top') {
    return (
      <Box bg={bg} style={{ borderRadius: 6, overflow: 'hidden' }}>
        <Anchor href={href} display="block" target="_blank" rel="noopener noreferrer">
          <Image
            src={article.coverImage!}
            alt={article.title}
            height={140}
            style={{ objectFit: 'cover', display: 'block', width: '100%' }}
          />
        </Anchor>
        <Box p="sm">
          {textBlock}
        </Box>
      </Box>
    );
  }

  // left or right — fixed-size container enforces uniform thumbnail dimensions
  const imgEl = (
    <Anchor
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ flexShrink: 0, width: 120, height: 90, display: 'block', overflow: 'hidden', borderRadius: 4 }}
    >
      <Image
        src={article.coverImage!}
        alt={article.title}
        style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
      />
    </Anchor>
  );

  return (
    <Box bg={bg} p={cardBackground !== 'transparent' ? 'sm' : 0} style={{ borderRadius: 6 }}>
      <Group gap="sm" align="flex-start" wrap="nowrap">
        {imagePosition === 'left' && imgEl}
        {textBlock}
        {imagePosition === 'right' && imgEl}
      </Group>
    </Box>
  );
}

export function RelatedArticles({
  pool = [],
  filter,
  tag,
  slugs,
  count = 4,
  heading,
  sort = 'default',
  preset = 'cards',
  columns,
  imagePosition,
  cardBackground,
  titleSize,
  showExcerpt,
  showImage,
  showDate,
  showReadingTime,
  showAuthor,
  showFormatBadge,
  showEmbed,
  showTopicBadge,
  articleBasePath = '/clanek',
  locale = 'cs-CZ',
}: RelatedArticlesProps) {
  const theme = useMantineTheme();
  const defaults = PRESET_DEFAULTS[preset];

  // Explicit props override preset defaults
  const effectiveColumns    = columns        ?? defaults.columns;
  const effectiveImgPos     = imagePosition  ?? defaults.imagePosition;
  const effectiveBg         = cardBackground ?? defaults.cardBackground;
  const effectiveTitleSize  = titleSize      ?? defaults.titleSize;
  const effectiveShowExcerpt      = showExcerpt      ?? defaults.showExcerpt;
  const effectiveShowImage        = showImage        ?? defaults.showImage;
  const effectiveShowDate         = showDate         ?? defaults.showDate;
  const effectiveShowReadingTime  = showReadingTime  ?? defaults.showReadingTime;
  const effectiveShowAuthor       = showAuthor       ?? defaults.showAuthor;
  const effectiveShowFormatBadge  = showFormatBadge  ?? defaults.showFormatBadge;
  const effectiveShowEmbed        = showEmbed        ?? defaults.showEmbed;
  const effectiveShowTopicBadge   = showTopicBadge   ?? defaults.showTopicBadge;

  const defaultHeading = locale.startsWith('cs') ? 'Čtěte dál' : 'Read more';
  const effectiveHeading = heading === false ? null : (heading ?? defaultHeading);

  // Build display list
  let items: Article[];
  if (slugs && slugs.length > 0) {
    // Hard-coded list: preserve author-specified order, look up from pool
    const bySlug = new Map(pool.map(a => [a.slug, a]));
    items = slugs.flatMap(s => { const a = bySlug.get(s); return a ? [a] : []; });
  } else {
    // Filter pool (already sorted by score)
    items = pool;
    if (filter) {
      const f = Array.isArray(filter) ? filter : [filter];
      items = items.filter(a => {
        const af = Array.isArray(a.filter) ? a.filter : [a.filter ?? ''];
        return f.some(v => af.includes(v));
      });
    }
    if (tag) {
      items = items.filter(a => a.tags?.includes(tag));
    }
    if (sort === 'newest') {
      items = [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }
  const displayed = items.slice(0, count);

  if (displayed.length === 0) return null;

  return (
    <Box my="xl">
      {effectiveHeading && (
        <Title
          order={3}
          c="brand.6"
          mb="xs"
          pb="xs"
          style={{ borderBottom: `2px solid ${theme.colors.background[2]}` }}
        >
          {effectiveHeading}
        </Title>
      )}
      <SimpleGrid cols={{ base: 1, sm: effectiveColumns }}>
        {displayed.map(article => (
          <MiniCard
            key={article.slug}
            article={article}
            imagePosition={effectiveImgPos}
            cardBackground={effectiveBg}
            titleSize={effectiveTitleSize}
            showExcerpt={effectiveShowExcerpt}
            showImage={effectiveShowImage}
            showDate={effectiveShowDate}
            showReadingTime={effectiveShowReadingTime}
            showAuthor={effectiveShowAuthor}
            showFormatBadge={effectiveShowFormatBadge}
            showEmbed={effectiveShowEmbed}
            showTopicBadge={effectiveShowTopicBadge}
            articleBasePath={articleBasePath}
            locale={locale}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
}

export default RelatedArticles;
