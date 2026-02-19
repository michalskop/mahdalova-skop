'use client';

import {
  Card,
  Image,
  Text,
  Badge,
  Group,
  Center,
  useMantineTheme,
} from '@mantine/core';
import classes from './ArticleCard.module.css';

interface ArticleCardProps {
  title: string;
  excerpt: string;
  date: string;
  author: string;
  slug: string;
  coverImage: string | null;
  tags: string[];
  articleBasePath?: string;
  locale?: string;
}

export function ArticleCard({
  title,
  excerpt,
  date,
  author,
  slug,
  coverImage,
  tags,
  articleBasePath = '/clanek',
  locale = 'cs-CZ',
}: ArticleCardProps) {
  const theme = useMantineTheme();
  const linkProps = { href: `${articleBasePath}/${slug}` };

  return (
    <Card withBorder radius="md" className={classes.card}>
      <Card.Section>
        <a {...linkProps}>
          <Image
            src={coverImage || '/placeholder-image.jpg'}
            height={180}
            alt={title}
          />
        </a>
      </Card.Section>

      {tags.length > 0 && (
        <Badge
          key={tags[0]}
          className={classes.rating}
          variant="gradient"
          gradient={{ from: theme.colors.brand[3], to: theme.colors.brand[8] }}
        >
          {tags[0]}
        </Badge>
      )}

      <Text
        className={classes.title}
        fw={500}
        component="a"
        {...linkProps}
        size='lg'
      >
        {title}
      </Text>

      <Text fz="sm" c="dimmed" lineClamp={4}>
        {excerpt}
      </Text>

      <Group justify="space-between" className={classes.footer}>
        <Center>
          <div>
            <Text
              fz="sm"
              inline
              c="dimmed"
            >
              {new Date(date).toLocaleDateString(locale)}
            </Text>
          </div>
        </Center>

        <Group gap={8} mr={0}>
        </Group>
      </Group>
    </Card>
  );
}
