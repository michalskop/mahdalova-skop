// components/a/ArticleRenderer.tsx
'use client';

import { Anchor, Paper, Title, Text, Container, Stack, useMantineTheme } from '@mantine/core';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { MdxClient } from '@repo/ui/components/MdxClient';
import type { MDXComponents } from 'mdx/types';
import { CodeBlock } from './MediaBox';
import { InfoBox } from './InfoBox'; // Import the InfoBox component
import { FlourishEmbed } from '@/components/mdx/FlourishEmbed';
import ScrollyTelling from '@/components/common/ScrollyTelling';
import Timeline from '@/components/common/Timeline';
import RawHtmlEmbed from '@/components/common/RawHtmlEmbed';
import HtmlEmbed from '@/components/a/HtmlEmbed';
import { PartyFace } from '@/components/politics/PartyFace';
import { MotionsStancesTable } from '@/components/politics/MotionsStancesTable';
import RelatedArticlesComponent from '@repo/ui/components/RelatedArticles';
import { Flag } from '@repo/ui/components/Flag';
import { KeyNumbers } from '@repo/ui/components/KeyNumbers';
import { Figure } from './Figure';
import SupportBanner from '@/components/common/SupportBanner';
import ArticleByline from '@/components/a/ArticleByline';
import VegaChart from '@/components/charts/VegaChart';
// English one-off charts for translated articles (ported from apps/web / apps/datatimes-org)
import { BrazilGainsChartEn, BrazilRegionsChartEn } from '@/components/charts/BrazilProcChartsEn';
import BrazilMunicipalMapEn from '@/components/charts/BrazilMunicipalMapEn';
import { BrazilRunoffTimelineEn, BrazilRunoffStatesEn } from '@/components/charts/BrazilRunoffChartsEn';
import { CduPredictionTimelineEn, CduThresholdDotsEn } from '@/components/charts/CduPredictionChartsEn';
import SenatSlozeniEn from '@/components/charts/SenatSlozeniEn';
import ChartCard from '@/components/charts/ChartCard';
import type { Article } from '@repo/ui/lib/getArticles';
// import yaml from 'js-yaml';

// Article layout constants (see packages/ui/DESIGN.md → Article layout), the
// same as on DataTimes.cz. Fonts come from the theme (IBM Plex Serif body /
// IBM Plex Sans headings, set in ThemeProvider).
const ARTICLE_MAX_WIDTH = 800;            // reading column width (px)
const ARTICLE_BODY_FONT_SIZE = '1.0625rem'; // body copy = 17px
const ARTICLE_TITLE_WEIGHT = 600;         // H1 weight (IBM Plex Sans SemiBold)

interface ArticleProps {
  mdxSource: MDXRemoteSerializeResult;
  title?: string;
  date?: string;
  author?: string;
  translator?: string;
  shareUrl?: string;
  slug: string;
  scrollyContent?: any; // Add scrollyContent to the ArticleProps
  htmlContent?: string | null;
  backgroundColor?: string;  // Optional background color
  textColor?: string;       // Optional text color
  withContainer?: boolean;  // Optional flag to control Container wrapper
  withSupportBanner?: boolean; // Full-width donate strip below the article (default true)
}

export function ArticleRenderer({ 
  mdxSource,
  title,
  date,
  author,
  translator,
  shareUrl,
  slug = '',
  scrollyContent,
  htmlContent,
  backgroundColor,
  textColor,
  withContainer = true,  // Default to true for backward compatibility
  withSupportBanner = true
}: ArticleProps) {
  const theme = useMantineTheme();

  const resolveThemeColor = (spec: unknown): string | undefined => {
    if (typeof spec !== 'string') return undefined;
    const s = spec.trim();
    if (!s) return undefined;

    const m = /^([A-Za-z0-9_-]+)\.(\d)$/.exec(s);
    if (m) {
      const key = m[1];
      const shade = Number(m[2]);
      const scale = (theme.colors as Record<string, readonly string[] | undefined>)[key];
      if (Array.isArray(scale) && shade >= 0 && shade <= 9) return scale[shade];
      return s;
    }

    const scale = (theme.colors as Record<string, readonly string[] | undefined>)[s];
    if (Array.isArray(scale)) return scale[6];

    return s;
  };

  const Tr = ({ bg, style, children, ...rest }: any) => (
    <tr
      style={{
        borderBottom: '1px solid #ddd',
        background: resolveThemeColor(bg),
        ...(style || {}),
      }}
      {...rest}
    >
      {children}
    </tr>
  );

  const Td = ({ bg, style, children, ...rest }: any) => (
    <td
      style={{
        padding: '8px',
        textAlign: 'left',
        background: resolveThemeColor(bg),
        ...(style || {}),
      }}
      {...rest}
    >
      {children}
    </td>
  );

  const Th = ({ bg, style, children, ...rest }: any) => (
    <th
      style={{
        padding: '8px',
        fontWeight: 'bold',
        textAlign: 'left',
        background: resolveThemeColor(bg),
        ...(style || {}),
      }}
      {...rest}
    >
      {children}
    </th>
  );

  const Swatch = ({ color, size = '1.2em', style, ...rest }: any) => (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        background: resolveThemeColor(color),
        borderRadius: 3,
        border: '1px solid rgba(0,0,0,.15)',
        verticalAlign: 'middle',
        ...(style || {}),
      }}
      {...rest}
    />
  );

  const StyledTable = ({ csvFile, bgColumn = 'bg-color' }: any) => {
    const data = (mdxSource.scope as any)?.styledTableData as
      | Record<string, { headers: string[]; rows: Record<string, string>[] }>
      | undefined;
    const table = csvFile ? data?.[csvFile] : undefined;

    if (!csvFile) return <div className="text-red-500">StyledTable: missing csvFile</div>;
    if (!table) return <div className="text-red-500">StyledTable: data not found for {csvFile}</div>;

    const headers = (table.headers || []).filter((h) => h !== bgColumn);
    const rows = table.rows || [];

    return (
      <div style={{ overflowX: 'auto', margin: '20px 0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: theme.colors.background[2] }}>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              {headers.map((h) => (
                <th key={h} style={{ padding: '8px', fontWeight: 'bold', textAlign: 'left' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => {
              const bg = r?.[bgColumn];
              return (
                <Tr key={idx} bg={bg}>
                  {headers.map((h) => (
                    <Td key={h}>{r?.[h] ?? ''}</Td>
                  ))}
                </Tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const components: MDXComponents = {
    InfoBox,  // Register InfoBox for info/data boxes (covers box, mediabox, infobox fences)
    FlourishEmbed,
    Flag: (props: any) => <Flag {...props} size={props.size ? Number(props.size) : undefined} />,
    PartyFace,
    MotionsStancesTable: (props) => <MotionsStancesTable {...props} fileData={mdxSource.scope.tableData as any} />,
    code: CodeBlock,  // This handles the ```box syntax

    Tr,
    Td,
    Th,
    Swatch,
    StyledTable,

    h1: ({ children }) => (
      <Title 
        order={1}
        mt="xs"
        mb="md"
        c={textColor} // Use provided text color
        styles={(theme) => ({
          root: {
            color: theme.colors.brand[6],  // normal shade for light mode
          }
        })}
      >
        {children}
      </Title>
    ),
    
    h2: ({ children }) => (
      <Title order={2} mt="xl" mb="md"
        c={textColor}
        styles={(theme) => ({
          root: {
            color: theme.colors.brand[6],
          },
        })}
      >
        {children}
      </Title>
    ),
    
    h3: ({ children }) => (
      <Title order={3} mt="lg" mb="md"
        c={textColor}>
        {children}
      </Title>
    ),
    
    p: ({ children }) => (
      <Text component="div" mb="md" size="lg" fz={ARTICLE_BODY_FONT_SIZE} c={textColor}>
        {children}
      </Text>
    ),

    a: ({ children, href }) => (
      <Anchor
        href={href}
        underline='always'
        target="_blank"
        rel="noopener noreferrer"
        c={textColor || theme.colors.brand[6]}
      > 
        {children}
      </Anchor>
    ),
    
    img: (props) => {
      const imageSrc = props.src
        ? props.src.startsWith('http') 
          ? props.src 
          : `/a/_articles/${slug}/images/${props.src.replace('images/', '')}`
        : '';

      // Native responsive image: keeps the natural aspect ratio (no forced
      // 800×400 that distorted square/portrait images). The export uses
      // images.unoptimized, so next/image added nothing here.
      return (
        <img
          src={imageSrc}
          alt={props.alt || ''}
          loading="lazy"
          style={{ display: 'block', maxWidth: '100%', height: 'auto', margin: '24px auto' }}
        />
      );
    },

    ScrollyTelling: (props) => {
      const { yamlFile, ...rest } = props as any;
      // Now we can use the pre-loaded content directly
      if (!scrollyContent) {
        return <div className="text-red-500">Scrollytelling content not found</div>;
      }

      return (
        <ScrollyTelling
          steps={scrollyContent.steps}
          defaultContent={scrollyContent.defaultContent}
          textAlignment={scrollyContent.textAlignment}
          className="my-8"
          slug={slug}
          {...rest}
        />
      );
    },

    Timeline: ({ yamlFile }) => {
      const timelineData = (mdxSource.scope as any)?.timelineData as Record<string, any> | undefined;
      const content = yamlFile ? timelineData?.[yamlFile] : undefined;

      if (!content) {
        return <div className="text-red-500">Timeline content not found</div>;
      }

      return <Timeline content={content} slug={slug} className="my-8" />;
    },

    RelatedArticles: (props) => {
      // DJS section keys (frontmatter `filter`) → reader-facing labels for the
      // format badge in related boxes ("work" → Elections, "blog" → Context).
      const relabel = (f: string) => ({ work: 'Elections', blog: 'Context' } as Record<string, string>)[f.trim().toLowerCase()] ?? f;
      const pool = ((((mdxSource.scope as any)?.relatedArticlesPool as Article[] | undefined) ?? [])).map((a) => ({
        ...a,
        filter: Array.isArray(a.filter) ? a.filter.map(relabel) : a.filter ? relabel(a.filter) : a.filter,
      }));
      // Full-width box (cards in rows of three) without a filter/tag: always whole rows, at least
      // 6 cards. Missing places are filled from the pool (sorted by shared tags in lib/articles.ts);
      // unknown hand-picked slugs are dropped. Side boxes (position/float) and other presets unchanged.
      const full = !props.position && !props.float && (!props.preset || props.preset === 'cards');
      let extra: Record<string, unknown> = {};
      if (full && !props.filter && !props.tag) {
        const known = new Set(pool.map((a) => a.slug));
        const picked: string[] = (props.slugs ?? []).filter((s: string) => known.has(s));
        const target = Math.max(6, Math.ceil(picked.length / 3) * 3);
        const fill = pool.map((a) => a.slug).filter((s) => !picked.includes(s)).slice(0, target - picked.length);
        extra = { slugs: [...picked, ...fill], count: target };
      }
      return (
        <RelatedArticlesComponent
          pool={pool}
          articleBasePath="/a"
          authorBasePath="/author"
          locale="en-GB"
          heading="Read more"
          {...props}
          {...extra}
        />
      );
    },

    Figure: (props: any) => <Figure slug={slug} {...props} />,
    SupportBanner: (props: any) => <SupportBanner {...props} />,
    KeyNumbers: ({ yamlFile, ...props }: any) => {
      if (yamlFile) {
        const keyNumbersData = (mdxSource.scope as any)?.keyNumbersData as Record<string, any> | undefined;
        const data = keyNumbersData?.[yamlFile];
        if (!data) {
          return <div className="text-red-500">KeyNumbers data not found for {yamlFile}</div>;
        }
        return <KeyNumbers label={data.label ?? 'Key numbers'} numbers={data.numbers} {...props} />;
      }
      return <KeyNumbers label="Key numbers" {...props} />;
    },
    VegaChart: ({ dataFile }: { dataFile?: string }) => {
      const vegaChartData = (mdxSource.scope as any)?.vegaChartData as Record<string, any> | undefined;
      const spec = dataFile ? vegaChartData?.[dataFile] : undefined;
      if (!dataFile || !spec) {
        return <div className="text-red-500">VegaChart data not found for {dataFile}</div>;
      }
      return <VegaChart spec={spec} />;
    },
    BrazilGainsChartEn,
    BrazilRegionsChartEn,
    BrazilMunicipalMapEn,
    BrazilRunoffTimelineEn,
    BrazilRunoffStatesEn,
    CduPredictionTimelineEn,
    CduThresholdDotsEn,
    SenatSlozeniEn,

    // With title/subtitle/source the embed is wrapped in ChartCard (same frame as other charts).
    HtmlEmbed: ({ file, title, subtitle, source, ...rest }) => {
      const htmlEmbedData = (mdxSource.scope as any)?.htmlEmbedData as Record<string, string> | undefined;
      const htmlContent = file ? htmlEmbedData?.[file] : undefined;
      const embed = <HtmlEmbed file={file} slug={slug} htmlContent={htmlContent} {...rest} />;
      return title || subtitle || source ? <ChartCard title={title} subtitle={subtitle} source={source}>{embed}</ChartCard> : embed;
    },
  };

  const content = (
    <Paper
      shadow="0"
      p="md"
      pt="xl"
      className='markdown-content'
      c="brandNavy.9"
      styles={{
        root: {
          backgroundColor: backgroundColor || theme.colors.background[1],
        }
      }}
    >
      <Stack gap="md">
        {title && (
          <Title
            order={1}
            size="h1"
            fw={ARTICLE_TITLE_WEIGHT}
            c={textColor}
            className="article-hero-title"
            styles={{
              root: {
                color: textColor || theme.colors.brand[6],
                // Size is responsive via .article-hero-title in globals.css
                // (2.625rem ≥769px / 2rem ≤768px); no inline fontSize here.
              }
            }}
          >
            {title}
          </Title>
        )}

        {date && author ? (
          <ArticleByline
            author={author}
            translator={translator}
            date={date}
            shareUrl={shareUrl ?? ''}
            shareTitle={title ?? ''}
          />
        ) : date ? (
          <>
            <Text size="sm" c={textColor || 'dimmed'}>
              {new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
            {translator && (
              <Text size="sm" c={textColor || 'dimmed'} mt={-12}>
                {translator}
              </Text>
            )}
          </>
        ) : null}

        <div className="article-content">
          {htmlContent ? <RawHtmlEmbed html={htmlContent} assetBasePath={`/a/_articles/${slug}`} /> : null}
          <MdxClient {...mdxSource} components={components} />
        </div>

        {withSupportBanner ? (
          <div style={{ clear: 'both', marginTop: '0.5rem' }}>
            <SupportBanner />
          </div>
        ) : null}
      </Stack>
    </Paper>
  );

  // Conditionally wrap with Container. Link colours for the article body come
  // from `.article-links` rules in app/globals.css; the optional per-article
  // textColor is passed down as a CSS custom property.
  return withContainer ? (
    <Container
      size="md"
      // Reading column 800px as on DataTimes.cz (after The Nerve).
      maw={ARTICLE_MAX_WIDTH}
      pb="lg"
      className="article-links"
      style={{
        overflow: 'visible',
        ...(textColor ? ({ '--article-link-color': textColor } as React.CSSProperties) : {}),
      }}
    >
      {content}
    </Container>
  ) : content;
}
