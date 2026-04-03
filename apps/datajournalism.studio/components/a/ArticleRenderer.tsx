// components/a/ArticleRenderer.tsx
'use client';

import { Anchor, Paper, Title, Text, Container, Stack, useMantineTheme } from '@mantine/core';
import { Global } from '@mantine/styles';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import type { MDXComponents } from 'mdx/types';
import type { ImageProps } from 'next/image';
import { CodeBlock } from './MediaBox';
import { InfoBox } from './InfoBox'; // Import the InfoBox component
import { FlourishEmbed } from '@/components/mdx/FlourishEmbed';
import ScrollyTelling from '@/components/common/ScrollyTelling';
import Timeline from '@/components/common/Timeline';
import RawHtmlEmbed from '@/components/common/RawHtmlEmbed';
import HtmlEmbed from '@/components/a/HtmlEmbed';
import RelatedArticlesComponent from '@repo/ui/components/RelatedArticles';
import type { Article } from '@repo/ui/lib/getArticles';
// import yaml from 'js-yaml';

interface ArticleProps {
  mdxSource: MDXRemoteSerializeResult;
  title?: string;
  date?: string;
  author?: string;
  slug: string;
  scrollyContent?: any; // Add scrollyContent to the ArticleProps
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
  slug = '',
  scrollyContent,
  htmlContent,
  backgroundColor,
  textColor,
  withContainer = true  // Default to true for backward compatibility
}: ArticleProps) {
  const [mounted, setMounted] = useState(false);
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

  // Ensure no hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }

  const components: MDXComponents = {
    InfoBox,  // Register InfoBox for info/data boxes (covers box, mediabox, infobox fences)
    FlourishEmbed,
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
          : `/a/_articles/${slug}/images/${props.src.replace('images/', '')}`
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
          articleBasePath="/a"
          locale="en-US"
          heading="Read more"
          {...props}
        />
      );
    },

    HtmlEmbed: ({ file, ...rest }) => {
      const htmlEmbedData = (mdxSource.scope as any)?.htmlEmbedData as Record<string, string> | undefined;
      const htmlContent = file ? htmlEmbedData?.[file] : undefined;
      return <HtmlEmbed file={file} slug={slug} htmlContent={htmlContent} {...rest} />;
    },
  };

  const content = (
    <Paper
      shadow="0"
      p="md"
      pt="xl"
      className='markdown-content'
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
            fw={500}
            c={textColor}
            styles={{
              root: {
                color: textColor || theme.colors.brand[6],
                fontSize: '2.75rem',
              }
            }}
          >
            {title}
          </Title>
        )}

        {date && (
          <Text size="sm" c={textColor || "dimmed"}>
            {author ? `${author.toUpperCase()} • ` : ''}
            {new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        )}

        <div className="article-content">
          {htmlContent ? <RawHtmlEmbed html={htmlContent} assetBasePath={`/a/_articles/${slug}`} /> : null}
          <MDXRemote {...mdxSource} components={components} />
        </div>
      </Stack>
    </Paper>
  );

  // Conditionally wrap with Container
  return withContainer ? (
    <Container size="md" pb="lg">
      <Global
        styles={{
          '.markdown-content a': {
            color: textColor || theme.colors.brand[6],
            textDecoration: 'none',
            '&:hover': {
              color: theme.colors.brand[7],
            },
            '&:active': {
              color: theme.colors.brand[8],
            },
            '&:visited': {
              color: theme.colors.brand[5],
            },
          },
        }}
      />
      {content}
    </Container>
  ) : content;
}
