// components/clanek/MediaBox.tsx
import { Paper, useMantineTheme, useMantineColorScheme } from '@mantine/core';
import React from 'react';
import { DetailedHTMLProps, HTMLAttributes } from 'react';

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

type CodeBlockProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

export function CodeBlock(props: CodeBlockProps): JSX.Element {
  return <code {...props} />;
}
