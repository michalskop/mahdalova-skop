// components/a/MediaBox.tsx
import { Paper, useMantineTheme, useMantineColorScheme } from '@mantine/core';
import React from 'react';
import { DetailedHTMLProps, HTMLAttributes } from 'react';
import styles from './box.module.css';

interface MediaBoxProps {
  children: React.ReactNode;
  float?: 'right' | 'left' | 'none';
}

export function MediaBox({ children, float }: MediaBoxProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  const floatClass =
    float === 'right' ? styles.floatRight :
    float === 'left'  ? styles.floatLeft  :
    undefined;

  return (
    <Paper
      shadow="xs"
      px="md"
      py="xs"
      radius="md"
      my="lg"
      className={floatClass}
      style={{
        backgroundColor:
          colorScheme === 'dark'
            ? theme.colors.gray[8]
            : theme.colors.brandNavy[6],
        color: theme.colors.background[1],
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
