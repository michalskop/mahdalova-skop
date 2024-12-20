// components/TagList.tsx
'use client';

import { Badge, Group, MantineTheme, useMantineTheme, Container } from '@mantine/core';

interface TagListProps {
  tags: string[];
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  spacing?: number;
}

export function TagList({ tags, size = 'sm', spacing = 8 }: TagListProps) {
  const theme = useMantineTheme();

  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <Container>
      <Group gap={spacing} mt="xs">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="gradient"
            gradient={{ from: theme.colors.brand[6], to: theme.colors.brand[6] }}
            size={size}
            autoContrast
          >
            {tag}
          </Badge>
        ))}
      </Group>
    </Container>
  );
}