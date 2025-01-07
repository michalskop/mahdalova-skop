// app/clanek/components/MDXWrapper.tsx
'use client';

import { ReactNode } from 'react';
import { Container, Title, Text, Stack, Group, Paper } from '@mantine/core';
import Image from 'next/image';

const components = {
  h1: (props: any) => (
    <Title order={1} mb="lg" {...props} />
  ),
  h2: (props: any) => (
    <Title order={2} mt="xl" mb="md" {...props} />
  ),
  p: (props: any) => (
    <Text component="p" mb="md" {...props} />
  ),
  img: (props: any) => {
    const imagePath = `/clanek/${props.src}`;
    return (
      <Image
        src={imagePath}
        alt={props.alt || ''}
        width={800}
        height={400}
        className="rounded-lg"
      />
    );
  },
  Group,
  Stack,
  Paper,
  Text,
  Title,
};

interface MDXWrapperProps {
  children: ReactNode;
}

export default function MDXWrapper({ children }: MDXWrapperProps) {
  return <div className="mdx-content">{children}</div>;
}

export { components };