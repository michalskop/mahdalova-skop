// FooterCentered.tsx
import { Anchor, Group, ActionIcon, rem, Stack, Center } from '@mantine/core'; // Add Stack
import { IconBrandTwitter, IconBrandYoutube, IconBrandInstagram } from '@tabler/icons-react';
import LogoWithText from '../common/LogoWithText';
import classes from './FooterCentered.module.css';

const links = [
  { link: '#', label: 'Newsletter'},
  { link: '/', label: 'Kontakt' },
  { link: 'https://datajournalism.studio/', label: 'Data Journalism Studio'},
];

export function FooterCentered() {
  const items = links.map((link) => (
    <Anchor
      c="dimmed"
      key={link.label}
      href={link.link}
      lh={1}
      onClick={(event) => {
        if (link.link.startsWith('http')) {
          window.open(link.link, '_blank', 'noopener,noreferrer');
          event.preventDefault();
        }
      }}
      size="sm"
    >
      {link.label}
    </Anchor>
  ));

  return (
    <div className={classes.footer}>
      <Stack className={classes.inner}>
        <Center w="100%">
            <LogoWithText size="md" />
        </Center>
        <Group className={classes.links} justify="center" w="100%">
          {items}
        </Group>
        <Group gap="xs" justify="center" w="100%">
          <ActionIcon size="lg" variant="default" radius="xl">
            <IconBrandTwitter style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
          </ActionIcon>
          <ActionIcon size="lg" variant="default" radius="xl">
            <IconBrandYoutube style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
          </ActionIcon>
          <ActionIcon size="lg" variant="default" radius="xl">
            <IconBrandInstagram style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
          </ActionIcon>
        </Group>
      </Stack>
    </div>
  );
}