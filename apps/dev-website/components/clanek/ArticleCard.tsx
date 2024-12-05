// components/clanek/ArticleCard.tsx
'use client';

// import { IconBookmark, IconHeart, IconShare } from '@tabler/icons-react';
import {
  Card,
  Image,
  Text,
  // ActionIcon,
  Badge,
  Group,
  Center,
  // Avatar,
  useMantineTheme,
  useMantineColorScheme,
  // rem,
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
}

export function ArticleCard({ 
  title,
  excerpt,
  date,
  author,
  slug,
  coverImage,
  tags 
}: ArticleCardProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const linkProps = { href: `/clanek/${slug}` };

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
          {/* <Avatar
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(author)}`}
            size={36}
            radius="xl"
            mr="xs"
          /> */}
          <div>
            {/* <Text fz="sm" inline>
              {author}
            </Text> */}
            <Text 
              fz="sm"
              inline
              c="dimmed"
              // style={{ marginTop: '4px' }}
            >
              {new Date(date).toLocaleDateString('cs-CZ')}
            </Text>
          </div>
        </Center>

        <Group gap={8} mr={0}>
          {/* <ActionIcon className={classes.action}>
            <IconHeart 
              style={{ width: rem(16), height: rem(16) }} 
              color={theme.colors.red[6]} 
            />
          </ActionIcon>
          <ActionIcon className={classes.action}>
            <IconBookmark
              style={{ width: rem(16), height: rem(16) }}
              color={theme.colors.yellow[7]}
            />
          </ActionIcon> */}
          {/* <ActionIcon className={classes.action}>
            <IconShare 
              style={{ width: rem(16), height: rem(16) }} 
              color={theme.colors.blue[6]} 
            />
          </ActionIcon> */}
        </Group>
      </Group>
    </Card>
  );
}