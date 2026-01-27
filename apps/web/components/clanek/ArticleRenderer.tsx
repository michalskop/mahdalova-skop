// components/clanek/ArticleRenderer.tsx

'use client';

import { Anchor, Paper, Title, Text, Container, Stack, useMantineTheme } from '@mantine/core';
import { Global } from '@mantine/styles';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import type { MDXComponents } from 'mdx/types';
import type { ImageProps } from 'next/image';
import { CodeBlock, MediaBox } from './MediaBox'; // Import the MediaBox component
import { TestComponent } from '@/components/mdx/TestComponent';
import { FlourishEmbed } from '@/components/mdx/FlourishEmbed';
import ScrollyTelling from '@/components/common/ScrollyTelling';
import { PartyFace } from '@/components/politics/PartyFace';
import { MotionsStancesTable } from '@/components/politics/MotionsStancesTable';
import { normalizeAuthor, splitAuthors } from '@/utils/authorUtils';
import RawHtmlEmbed from '@/components/common/RawHtmlEmbed';
// import yaml from 'js-yaml';

interface ArticleProps {
  mdxSource: MDXRemoteSerializeResult;
  title?: string;
  date?: string;
  author?: string;
  translator?: string;
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
  slug = '',
  scrollyContent,
  htmlContent,
  backgroundColor,
  textColor,
  withContainer = true  // Default to true for backward compatibility
}: ArticleProps) {

  const [mounted, setMounted] = useState(false);
  const theme = useMantineTheme();

  // Ensure no hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }

  const components: MDXComponents = {
    MediaBox, // Register MediaBox directly, allowing remarkBoxPlugin to handle box syntax
    TestComponent,
    FlourishEmbed,
    PartyFace,
    MotionsStancesTable: (props) => <MotionsStancesTable {...props} fileData={mdxSource.scope.tableData as any} />,
    code: CodeBlock,  // This handles the ```box syntax

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

    ScrollyTelling: ({ yamlFile }) => {
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
        />
      );
    },

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
          <Text size="sm" c={textColor || 'dimmed'}>
            {author ? (
              <>
                {splitAuthors(author).map((authorName, index, arr) => (
                  <span key={`${authorName}-${index}`}>
                    <Anchor
                      component={Link}
                      href={`/autor/${normalizeAuthor(authorName)}`}
                      underline="hover"
                      c={textColor || 'dimmed'}
                    >
                      {authorName.toUpperCase()}
                    </Anchor>
                    {index < arr.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </>
            ) : null}

            {(author || translator) ? ' • ' : ''}

            {translator ? (
              <>
                {'PŘEKLAD: '}
                {splitAuthors(translator).map((translatorName, index, arr) => (
                  <span key={`${translatorName}-${index}`}>
                    <Anchor
                      component={Link}
                      href={`/autor/${normalizeAuthor(translatorName)}`}
                      underline="hover"
                      c={textColor || 'dimmed'}
                    >
                      {translatorName.toUpperCase()}
                    </Anchor>
                    {index < arr.length - 1 ? ', ' : ''}
                  </span>
                ))}
                {' • '}
              </>
            ) : null}

            {new Date(date).toLocaleDateString('cs-CZ')}
          </Text>
        )}

        <div className="article-content">
          {htmlContent ? <RawHtmlEmbed html={htmlContent} assetBasePath={`/clanek/_articles/${slug}`} /> : null}
          <MDXRemote {...mdxSource} components={components} />
        </div>
      </Stack>
    </Paper>
  );

  // Conditionally wrap with Container
  return withContainer ? (
    <Container size="md" pb="lg" style={{ overflow: 'visible' }}>
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
