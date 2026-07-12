// FooterCentered.tsx
import { Anchor, Group, ActionIcon, rem, Stack, Center } from '@mantine/core'; // Add Stack
import { IconBrandBluesky, IconBrandInstagram, IconBrandX, IconBrandSpotify, IconBrandFacebook, IconRss } from '@tabler/icons-react';
import LogoWithText from '../common/LogoWithText';
import classes from './FooterCentered.module.css';

const links = [
  // { link: '#', label: 'Newsletter'},
  { link: '/kdo-jsme#kontakty', label: 'Kontakt' },
  // { link: 'https://datajournalism.studio/', label: 'Data Journalism Studio'},
];

export function FooterCentered() {
  const contacts = {
    social: {
      bluesky: "katemahdalova.bsky.social",
      threads: "@katemahdalova",
      twitter: "@data_zurnalist",
      spotify: "mahdalova-skop",
      facebook: "datovazurnalistika1",
      instagram: "katemahdalova"
    }
  }

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

          <Anchor href={`https://creators.spotify.com/pod/show/${contacts.social.spotify}`} target="_blank"  underline="hover">
            <ActionIcon size="lg" variant="default" radius="xl">
              <IconBrandSpotify style={{ width: rem(18), height: rem(18) }} stroke={1.5} />  
            </ActionIcon>
          </Anchor>

          <Anchor href={`https://${contacts.social.bluesky}`} target="_blank"  underline="hover">
            <ActionIcon size="lg" variant="default" radius="xl">
              <IconBrandBluesky style={{ width: rem(18), height: rem(18) }} stroke={1.5} />  
            </ActionIcon>
          </Anchor>

          <Anchor href={`https://twitter.com/${contacts.social.twitter}`} target="_blank"  underline="hover">
            <ActionIcon size="lg" variant="default" radius="xl">
              <IconBrandX style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
            </ActionIcon>
          </Anchor>

          <Anchor href={`https://facebook.com/${contacts.social.facebook}`} target="_blank"  underline="hover">
            <ActionIcon size="lg" variant="default" radius="xl">
              <IconBrandFacebook style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
            </ActionIcon>
          </Anchor>

          <Anchor href={`https://instagram.com/${contacts.social.instagram}`} target="_blank"  underline="hover">
            <ActionIcon size="lg" variant="default" radius="xl">
              <IconBrandInstagram style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
            </ActionIcon>
          </Anchor>

          <Anchor href="/rss.xml" title="RSS feed" underline="hover">
            <ActionIcon size="lg" variant="default" radius="xl">
              <IconRss style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
            </ActionIcon>
          </Anchor>

        </Group>
      </Stack>
    </div>
  );
}