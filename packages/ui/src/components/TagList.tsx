'use client';
import { Badge, Group, useMantineTheme, Container } from '@mantine/core';
import Link from 'next/link';
import { normalizeTag } from '../lib/tagNormalizer';

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
    // Stejný 800px sloupec jako text článku a lišta Sledujte DataTimes pod ním
    // (výchozí Container má 960 px, takže štítky ujížděly doleva), vycentrované.
    <Container maw={800} px="md">
      <Group gap={spacing} mt="xs" justify="center">
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/tag/${normalizeTag(tag)}`}
            style={{
              textDecoration: 'none',
            }}
          >
            <Badge
              variant="gradient"
              gradient={{ from: theme.colors.brand[6], to: theme.colors.brand[6] }}
              size={size}
              autoContrast
              style={{
                cursor: 'pointer',
              }}
            >
              {tag}
            </Badge>
          </Link>
        ))}
      </Group>
    </Container>
  );
}
