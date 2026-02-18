// components/clanek/MediaBox.tsx
import { Paper, useMantineTheme, useMantineColorScheme } from '@mantine/core';
// import { Global } from '@mantine/styles';
// import ReactMarkdown from 'react-markdown';
import React from 'react';
import { DetailedHTMLProps, HTMLAttributes } from 'react';
// import rehypeRaw from 'rehype-raw';

interface MediaBoxProps {
  children: React.ReactNode;
  float?: 'right' | 'left' | 'none';
}

export function MediaBox({ children, float }: MediaBoxProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  const floatStyle: React.CSSProperties =
    float === 'right'
      ? { float: 'right', width: '45%', maxWidth: '400px', marginLeft: '1.5rem', marginBottom: '1rem' }
      : float === 'left'
      ? { float: 'left', width: '45%', maxWidth: '400px', marginRight: '1.5rem', marginBottom: '1rem' }
      : {};

  return (
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
        ...floatStyle,
      }}
    >
      {children}
    </Paper>
  );
}

// Legacy string-based MediaBox used by CodeBlock (```box syntax)
interface LegacyMediaBoxProps {
  children: string;
}

function LegacyMediaBox({ children }: LegacyMediaBoxProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  const convertMarkdownLinks = (content: string) => {
    return content.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;">$1</a>'
    );
  };

  function convertMarkdownHeadersToH3(markdown: string): string {
    return markdown.replace(/<p>(#{1,6}\s+.*?)<\/p>/g, (match, p1) => {
      return p1.replace(/^#{1,6}\s+(.*)$/gm, '<h3>$1</h3>');
    });
  }

  const processedContent = convertMarkdownLinks(convertMarkdownHeadersToH3(children));

  return (
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
  );
}

type CodeBlockProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

export function CodeBlock(props: CodeBlockProps): JSX.Element {
  const { className, children } = props;

  if (className === 'language-box') {
    return <LegacyMediaBox>{String(children)}</LegacyMediaBox>;
  }

  return <code {...props} />;
}
