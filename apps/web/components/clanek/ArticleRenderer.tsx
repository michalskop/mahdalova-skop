// components/clanek/ArticleRenderer.tsx

'use client';

import { Anchor, Paper, Title, Text, Container, Stack, useMantineTheme } from '@mantine/core';
import Image from 'next/image';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { MdxClient } from '@repo/ui/components/MdxClient';
import type { MDXComponents } from 'mdx/types';
import type { ImageProps } from 'next/image';
import { CodeBlock } from './MediaBox';
import { InfoBox } from './InfoBox'; // Import the InfoBox component
import { TestComponent } from '@/components/mdx/TestComponent';
import { FlourishEmbed } from '@/components/mdx/FlourishEmbed';
import ScrollyTelling from '@/components/common/ScrollyTelling';
import Timeline from '@/components/common/Timeline';
import { PartyFace } from '@/components/politics/PartyFace';
import { Person } from '@/components/politics/Person';
import { MotionsStancesTable } from '@/components/politics/MotionsStancesTable';
import ArticleByline from '@/components/dpbp/ArticleByline';
import RawHtmlEmbed from '@/components/common/RawHtmlEmbed';
import HtmlEmbed from '@/components/clanek/HtmlEmbed';
import AttendanceSwarm from '@/components/mdx/AttendanceSwarm';
import VegaChart from '@/components/charts/VegaChart';
import ChartRow from '@/components/charts/ChartRow';
import RelatedArticlesComponent from '@repo/ui/components/RelatedArticles';
import { KeyNumbers } from '@repo/ui/components/KeyNumbers';
import { Gauge } from '@repo/ui/components/Gauge';
import { PhotoGallery } from '@repo/ui/components/PhotoGallery';
import type { GalleryImage } from '@repo/ui/components/PhotoGallery';
import type { Article } from '@repo/ui/lib/getArticles';
import { ibmPlexSans, ibmPlexSerif } from '@/app/fonts';
// import yaml from 'js-yaml';

// Experimental: articles listed here render their body in IBM Plex Serif
// instead of the site default (Roboto Slab). Scoped preview before deciding
// whether to switch the whole site over. Only the font-family changes –
// sizes and colours are untouched.
const IBM_PLEX_SERIF_SLUGS = new Set<string>([
  'analyza-2026-08-23-pricovy-politicka-setkani',
]);

interface ArticleProps {
  mdxSource: MDXRemoteSerializeResult;
  title?: string;
  date?: string;
  author?: string;
  translator?: string;
  shareUrl?: string;
  slug: string;
  scrollyContent?: any;     // Add scrollyContent to the ArticleProps
  htmlContent?: string | null;
  backgroundColor?: string;  // Optional background color
  textColor?: string;       // Optional text color
  withContainer?: boolean;  // Optional flag to control Container wrapper
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
  withContainer = true  // Default to true for backward compatibility
}: ArticleProps) {

  const theme = useMantineTheme();

  // IBM Plex experiment: body copy is IBM Plex Serif (weight 400, default),
  // while all headings are IBM Plex Sans. Set on the article wrapper so it
  // cascades to every Mantine component inside; sizes, weights and colours
  // stay exactly as configured elsewhere.
  const fontOverride: React.CSSProperties = IBM_PLEX_SERIF_SLUGS.has(slug)
    ? ({
        // Direct value so body copy (which just inherits font-family from
        // <body>) picks it up; the plain --mantine-font-family variable backs
        // components that re-evaluate it. Headings use their own variable →
        // IBM Plex Sans, so H2/H3 (and the main H1) render sans-serif.
        fontFamily: ibmPlexSerif.style.fontFamily,
        '--mantine-font-family': ibmPlexSerif.style.fontFamily,
        '--mantine-font-family-headings': ibmPlexSans.style.fontFamily,
      } as React.CSSProperties)
    : {};

  // The main article title (H1) uses IBM Plex Sans; its weight (600) is set on
  // the Title's fw prop below. (Headings already resolve to Sans via the
  // variable above, but the H1 sets it explicitly to be independent of it.)
  const titleFontOverride: React.CSSProperties = IBM_PLEX_SERIF_SLUGS.has(slug)
    ? ({ fontFamily: ibmPlexSans.style.fontFamily } as React.CSSProperties)
    : {};

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
    KeyNumbers: ({ yamlFile, ...props }) => {
      // If yamlFile is provided, use pre-loaded data from server
      if (yamlFile) {
        const keyNumbersData = (mdxSource.scope as any)?.keyNumbersData as Record<string, any> | undefined;
        const data = yamlFile ? keyNumbersData?.[yamlFile] : undefined;
        
        if (!data) {
          return <div className="text-red-500">KeyNumbers data not found for {yamlFile}</div>;
        }
        
        return <KeyNumbers label={data.label} numbers={data.numbers} {...props} />;
      }
      
      // Otherwise use inline data
      return <KeyNumbers {...props} />;
    },
    Gauge: (props) => <Gauge {...(props as any)} />,
    PhotoGallery: ({ images, previewCount }: any) => {
      const parsed: GalleryImage[] =
        typeof images === 'string' ? JSON.parse(images) : Array.isArray(images) ? images : [];
      const resolved = parsed.map((img) => ({
        ...img,
        src: img.src?.startsWith('http')
          ? img.src
          : `/clanek/_articles/${slug}/images/${img.src.replace('images/', '')}`,
      }));
      return <PhotoGallery images={resolved} previewCount={previewCount ? Number(previewCount) : undefined} />;
    },
    TestComponent,
    FlourishEmbed,
    PartyFace,
    Person: (props) => <Person {...props} data={(mdxSource.scope as any)?.personsData} />,
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
      <Text component="div" mb="md" size="lg" c={textColor}>
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
          : `/clanek/_articles/${slug}/images/${props.src.replace('images/', '')}`
        : '';

      const imageProps: ImageProps = {
        src: imageSrc,
        alt: props.alt || '',
        width: props.width ? Number(props.width) : 800,
        height: props.height ? Number(props.height) : 400,
        style: { maxWidth: '100%', height: 'auto' }
      };

      return (
        <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
          <Image 
            {...imageProps} 
            alt={props.alt || ''} 
          />
        </div>
      );
    },

    // Table components
    table: ({ children }) => (
      <div style={{ overflowX: 'auto', margin: '20px 0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead style={{ backgroundColor: theme.colors.background[2] }}>
        {children}
      </thead>
    ),
    tr: ({ children }) => (
      <tr style={{ borderBottom: '1px solid #ddd' }}>
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th style={{ padding: '8px', fontWeight: 'bold', textAlign: 'left' }}>
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td style={{ padding: '8px', textAlign: 'left' }}>
        {children}
      </td>
    ),

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
      const pool = (mdxSource.scope as any)?.relatedArticlesPool as Article[] | undefined;
      return (
        <RelatedArticlesComponent
          pool={pool ?? []}
          articleBasePath="/clanek"
          locale="cs-CZ"
          {...props}
        />
      );
    },

    HtmlEmbed: ({ file, ...rest }) => {
      const htmlEmbedData = (mdxSource.scope as any)?.htmlEmbedData as Record<string, string> | undefined;
      const htmlContent = file ? htmlEmbedData?.[file] : undefined;
      return <HtmlEmbed file={file} slug={slug} htmlContent={htmlContent} {...rest} />;
    },

    AttendanceSwarm: ({ dataFile, title, subtitle, source }: { dataFile?: string; title?: string; subtitle?: string; source?: string }) => {
      const attendanceSwarmData = (mdxSource.scope as any)?.attendanceSwarmData as Record<string, any[]> | undefined;
      return <AttendanceSwarm attendanceSwarmData={attendanceSwarmData} dataFile={dataFile} title={title} subtitle={subtitle} source={source} />;
    },

    VegaChart: ({ dataFile }: { dataFile?: string }) => {
      const vegaChartData = (mdxSource.scope as any)?.vegaChartData as Record<string, any> | undefined;
      const spec = dataFile ? vegaChartData?.[dataFile] : undefined;
      if (!dataFile || !spec) {
        return <div className="text-red-500">VegaChart data not found for {dataFile}</div>;
      }
      return <VegaChart spec={spec} />;
    },

    ChartRow,

  };

  const content = (
    <Paper
      shadow="0"
      p="md"
      pt="xl"
      className='markdown-content'
      c="gray.8"
      style={fontOverride}
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
            fw={IBM_PLEX_SERIF_SLUGS.has(slug) ? 600 : 500}
            c={textColor}
            style={titleFontOverride}
            className={IBM_PLEX_SERIF_SLUGS.has(slug) ? 'article-hero-title' : undefined}
            styles={{
              root: {
                color: textColor || theme.colors.brand[6],
                // Default articles keep the fixed 2.75rem. For the IBM Plex
                // experiment the size is responsive via .article-hero-title in
                // globals.css, so no inline size here (inline would beat the
                // media query).
                ...(IBM_PLEX_SERIF_SLUGS.has(slug) ? {} : { fontSize: '2.75rem' }),
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
          <Text size="sm" c={textColor || 'dimmed'}>
            {new Date(date).toLocaleDateString('cs-CZ')}
          </Text>
        ) : null}

        <div className="article-content">
          {htmlContent ? <RawHtmlEmbed html={htmlContent} assetBasePath={`/clanek/_articles/${slug}`} /> : null}
          <MdxClient {...mdxSource} components={components} />
        </div>
      </Stack>
    </Paper>
  );

  // Conditionally wrap with Container. Link colours for the article body come
  // from `.article-links` rules in app/globals.css; the optional per-article
  // textColor is passed down as a CSS custom property.
  return withContainer ? (
    <Container
      size="md"
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
