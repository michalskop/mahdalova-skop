// components/clanek/ArticleRenderer.tsx
'use client';

import { Paper, Title, Text, Container, Stack, useMantineTheme, useMantineColorScheme } from '@mantine/core';
import { Global } from '@mantine/styles';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import type { MDXComponents } from 'mdx/types';
import type { ImageProps } from 'next/image';
import { CodeBlock, MediaBox} from './MediaBox'; // Import the MediaBox component

interface ArticleProps {
  mdxSource: MDXRemoteSerializeResult;
  title?: string;
  date?: string;
  slug?: string;
}

export function ArticleRenderer({ mdxSource, title, date, slug }: ArticleProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);

    // Ensure no hydration mismatch
    useEffect(() => {
      setMounted(true);
    }, []);
  
    if (!mounted) {
      return null;
    }

  const components: MDXComponents = {
    MediaBox, // Register MediaBox directly, allowing remarkBoxPlugin to handle box syntax
    code: CodeBlock,  // This handles the ```box syntax

    h1: ({ children }) => (
      <Title order={1} mt="xl" mb="md" 
        styles={(theme) => ({
          root: {
            color: colorScheme === 'dark'
              ? theme.colors.brand[7]  // darker shade for dark mode
              : theme.colors.brand[6],  // normal shade for light mode
          }
        })}
      >
        {children}
      </Title>
    ),
    
    h2: ({ children }) => (
      <Title order={2} mt="xl" mb="md" 
        styles={(theme) => ({
          root: {
            color: colorScheme === 'dark'
              ? theme.colors.brand[7]
              : theme.colors.brand[6],
          },
        })}
      >
        {children}
      </Title>
    ),
    
    h3: ({ children }) => (
      <Title order={3} mt="lg" mb="md">
        {children}
      </Title>
    ),
    
    p: ({ children }) => (
      <Text component="div" mb="md" size="lg">
        {children}
      </Text>
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
          <Image {...imageProps} />
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
      <thead style={{ backgroundColor: '#f9f9f9' }}>
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
  };

  return (
    <Container size="md" pb="lg">
      <Global
        styles={{
          a: {
            color: theme.colors.brand[6],
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
      <Paper
        shadow="0"
        p="md"
        pt="xl"
        withBorder
        styles={{
          root: {
            backgroundColor: colorScheme === 'dark'
              ? theme.colors.gray[7]
              : theme.colors.background[1],
          }
        }}
      >
        <Stack gap="md">
          {title && (
            <Title
              order={1}
              size="h1"
              fw={500}
              styles={{
                root: {
                  color: colorScheme === 'dark'
                    ? theme.colors.brand[7]
                    : theme.colors.brand[6],
                  fontSize: '2.75rem',
                }
              }}
            >
              {title}
            </Title>
          )}
          
          {date && (
            <Text size="sm" c="dimmed">
              {new Date(date).toLocaleDateString('cs-CZ')}
            </Text>
          )}
          
          <div className="article-content">
            <MDXRemote {...mdxSource} components={components} />
          </div>
        </Stack>
      </Paper>
    </Container>
  );
}
