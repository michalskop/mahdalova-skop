// components/a/MediaBox.tsx
import { Paper, useMantineTheme, useMantineColorScheme } from '@mantine/core';
import { Global } from '@mantine/styles';
// import ReactMarkdown from 'react-markdown';
import React from 'react';
import { DetailedHTMLProps, HTMLAttributes } from 'react';
// import rehypeRaw from 'rehype-raw';

interface MediaBoxProps {
  children: string;
}

export function MediaBox({ children }: MediaBoxProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  // Function to convert markdown links in HTML content
  const convertMarkdownLinks = (content: string) => {
    // Convert markdown links [text](url) to HTML <a> tags
    return content.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="box-content">$1</a>'
    );
  };

  // Function to convert markdown headings to H3 tags
  function convertMarkdownHeadersToH3(markdown: string): string {
    // Remove <p> tags around headers and convert headers to <h3> tags
    return markdown.replace(/<p>(#{1,6}\s+.*?)<\/p>/g, (match, p1) => {
      return p1.replace(/^#{1,6}\s+(.*)$/gm, '<h3>$1</h3>');
    });
  }
  

  // Process the content
  const processedContent = convertMarkdownLinks(convertMarkdownHeadersToH3(children));

  return (
    <>
      <Global
        styles={{
          'a.box-content': {
            color: theme.colors.brand[3],
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
            '&:active': {
              color: theme.colors.brand[5],
            },
            '&:visited': {
              color: theme.colors.brand[2],
            },
          },
        }}
      />
      <Paper
        shadow="xs"
        px="md"
        py="xs"
        radius="md"
        my="lg"
        style={{
          backgroundColor:
            colorScheme === 'dark'
              ? theme.colors.gray[8]
              : theme.colors.brandNavy[6],
          color: theme.colors.background[1],
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: processedContent }} />
      </Paper>
    </>
  );
}

type CodeBlockProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

export function CodeBlock(props: CodeBlockProps): JSX.Element {
  const { className, children } = props;

  if (className === 'language-box') {
    return <MediaBox>{String(children)}</MediaBox>;
  }

  return <code {...props} />;
}