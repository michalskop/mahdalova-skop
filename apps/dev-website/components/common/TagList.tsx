// components/TagList.tsx
import { Badge, Group, useMantineTheme } from '@mantine/core';

interface TagListProps {
  tags: string[];
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  spacing?: number;
}

export function TagList({ tags, size = 'sm', spacing = 2 }: TagListProps) {
  const theme = useMantineTheme();

  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <Group gap={spacing} mt="md">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="gradient"
          gradient={{ from: theme.colors.brand[3], to: theme.colors.brand[8] }}
          size={size}
        >
          {tag}
        </Badge>
      ))}
    </Group>
  );
}