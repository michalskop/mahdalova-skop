'use client';
import { Box, Group, Title, Stack, Paper, useMantineTheme } from '@mantine/core';
import { ArticleRenderer } from '@/components/clanek/ArticleRenderer';
import { Arrow } from '@/components/common/Arrow';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import type { ArticleProps } from '@/types/article';
// import { text } from 'stream/consumers';

interface ContentSectionProps {
  sectionTitle: string;
  sectionLink?: string;
  content: MDXRemoteSerializeResult;  // Updated type
  themeColor?: string;
  textColor?: string;
}

export function ContentSection({
  sectionTitle,
  sectionLink = '#',
  content,
  themeColor = 'red',
  textColor = 'black'
}: ContentSectionProps) {
  const theme = useMantineTheme();

  // Get the actual color value from the theme if it's a path (like 'brandNavy.6')
  const resolveThemeColor = (colorPath: string) => {
    const parts = colorPath.split('.');
    return parts.reduce((obj: any, key) => obj?.[key], theme.colors) || colorPath;
  };

  const backgroundColor = resolveThemeColor(themeColor);
  const resolvedTextColor = textColor ? resolveThemeColor(textColor) : theme.colors.background[0];


  return (
    <Paper py={20} bg={backgroundColor} radius={0}>
      <Group
        gap={0}
        align="flex-start"
        wrap="wrap"
      >
        <Stack
          w={{ base: '100%', md: 250 }}
          mb={{ base: 'xs', md: 0 }}
          pt={15}
          pl={{ base: 'md', md: 'md' }}
          style={{ alignItems: 'flex-start' }} // Ensure the Stack items are aligned to the start
        >
          <a
            href={sectionLink}
            rel="noopener noreferrer"
            style={{
              textDecoration: 'none'
            }}
          >
            <Title
              order={2}
              ta={{ base: 'left', sm: 'right' }}
              style={{ display: 'flex', alignItems: 'right', justifyContent: 'flex-start', gap: '5px' }}
              c={theme.colors.background[1]}
            >
              {sectionTitle}
              <Arrow size={80} color={theme.colors.background[1]} />
            </Title>
          </a>
        </Stack>
        <Box flex={1} px={0}>
          <ArticleRenderer 
            mdxSource={content}
            withContainer={false}
            backgroundColor={backgroundColor}
            textColor={resolvedTextColor} 
            slug={''}          
          />
        </Box>
      </Group>
    </Paper>
  );
}