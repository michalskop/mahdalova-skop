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
// import yaml from 'js-yaml';

// Article layout constants (see packages/ui/DESIGN.md → Article layout).
// Fonts themselves come from the theme (IBM Plex Serif body / IBM Plex Sans
// headings, set in ThemeProvider). These control the reading column and text
// sizing, applied to every article.
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
                // (2.625rem ≥769px / 2rem ≤768px); no inline fontSize here –
                // inline would beat the media query.
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
      // Narrower reading column (800px) after The Nerve, vs. Mantine size="md"
      // (960px). Text ends up ~736px wide after the container + Paper padding.
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
