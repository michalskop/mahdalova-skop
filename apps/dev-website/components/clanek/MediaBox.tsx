// components/clanek/MediaBox.tsx
import { Paper, useMantineTheme, useMantineColorScheme } from '@mantine/core';
import ReactMarkdown from 'react-markdown';
import React from 'react';
import { DetailedHTMLProps, HTMLAttributes } from 'react';
import rehypeRaw from 'rehype-raw';

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
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );
  };

  // Process the content
  const processedContent = convertMarkdownLinks(children);

  return (
    <Paper
      shadow="xs"
      p="md"
      radius="md"
      style={{
        backgroundColor:
          colorScheme === 'dark'
            ? theme.colors.gray[8]
            : theme.colors.background[7],
      }}
    >
      <div dangerouslySetInnerHTML={{ __html: processedContent }} />
    </Paper>
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