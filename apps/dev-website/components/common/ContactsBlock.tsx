// components/ContactsBlock.tsx
'use client';

import { Container, Grid, Paper, Text, Title, Group, Stack, Anchor, Box, rem } from '@mantine/core';
import { 
  IconMail, 
  IconPhone, 
  IconBrandTwitter, 
  IconBrandThreads,
  IconBrandBluesky 
} from '@tabler/icons-react';
import { useState } from 'react';

interface ContactPerson {
  name: string;
  emailUser: string;  // part before @
  emailDomain: string;  // part after @
  phoneCZ: string;
  phoneAT: string;
  social: {
    bluesky: string;
    threads: string;
    twitter: string;
  };
}

const contacts: ContactPerson[] = [
  {
    name: "Kateřina Mahdalová",
    emailUser: "datovazurnalistika",
    emailDomain: "gmail.com",
    phoneCZ: "+420 722 279 346",
    phoneAT: "+43 690 10 20 33 88",
    social: {
      bluesky: "katemahdalova.bsky.social",
      threads: "@katemahdalova",
      twitter: "@data_zurnalist"
    }
  },
  {
    name: "Michal Škop",
    emailUser: "michal",
    emailDomain: "datajurnalism.studio",
    phoneCZ: "+420 735 518 529",
    phoneAT: "+43 690 10 26 31 60",
    social: {
      bluesky: "michalskop.bsky.social",
      threads: "@skopmichal",
      twitter: "@skopmichal"
    }
  }
];

// Component for protected email display
function ProtectedEmail({ emailUser, emailDomain }: { emailUser: string; emailDomain: string }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleCopy = () => {
    const email = `${emailUser}@${emailDomain}`;
    navigator.clipboard.writeText(email);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isRevealed) {
    return (
      <Text 
        component="span" 
        c="blue" 
        style={{ cursor: 'pointer' }}
        onClick={handleReveal}
      >
        email@... Klikněte pro zobrazení
      </Text>
    );
  }

  return (
    <Group gap={8}>
      <Text>{emailUser}@{emailDomain}</Text>
      <Anchor 
        component="button"
        size="sm"
        onClick={handleCopy}
      >
        {isCopied ? 'Copied!' : 'Copy'}
      </Anchor>
    </Group>
  );
}

export function ContactsBlock() {
  return (
    <Box id="kontakty" style={{ scrollMarginTop: '100px' }}>
    <Container size="md" my="xl">
      <Title 
        order={2}
        mb="xs"  // margin bottom
        size="h2" // or specific size like "28px"
      >
        Kontakty
      </Title>
      <Grid gutter="md">
        {contacts.map((person) => (
          <Grid.Col key={person.name} span={{ base: 12, sm: 6 }}>
            <Paper
              shadow="sm"
              p="md"
              radius="md"
              withBorder
              style={{
                height: '100%',
              }}
            >
              <Stack gap="md">
                <Text size="xl" fw={700}>
                  {person.name}
                </Text>

                {/* Email - Protected Version */}
                <Group gap="xs">
                  <IconMail 
                    style={{ width: rem(20), height: rem(20) }}
                    stroke={1.5}
                  />
                  <ProtectedEmail 
                    emailUser={person.emailUser}
                    emailDomain={person.emailDomain}
                  />
                </Group>

                {/* Phone Numbers */}
                <Box>
                  <Group gap="xs">
                    <IconPhone 
                      style={{ width: rem(20), height: rem(20) }}
                      stroke={1.5}
                    />
                    {/* <Text>CZ:</Text> */}
                    <Anchor href={`tel:${person.phoneCZ.replace(/\s/g, '')}`} underline="hover">
                      {person.phoneCZ}
                    </Anchor>
                  </Group>
                  {/* <Group gap="xs" ml={28} mt={5}>
                    <Text>AT:</Text>
                    <Anchor href={`tel:${person.phoneAT.replace(/\s/g, '')}`} underline="hover">
                      {person.phoneAT}
                    </Anchor>
                  </Group> */}
                </Box>

                {/* Social Media */}
                <Stack gap="xs">
                  <Group gap="xs">
                    <IconBrandBluesky 
                      style={{ width: rem(20), height: rem(20) }}
                      stroke={1.5}
                    />
                    <Anchor 
                      href={`https://${person.social.bluesky}`}
                      underline="hover"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {person.social.bluesky}
                    </Anchor>
                  </Group>

                  <Group gap="xs">
                    <IconBrandThreads 
                      style={{ width: rem(20), height: rem(20) }}
                      stroke={1.5}
                    />
                    <Anchor 
                      href={`https://threads.net/${person.social.threads.replace('@', '')}`}
                      underline="hover"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {person.social.threads}
                    </Anchor>
                  </Group>

                  <Group gap="xs">
                    <IconBrandTwitter 
                      style={{ width: rem(20), height: rem(20) }}
                      stroke={1.5}
                    />
                    <Anchor 
                      href={`https://x.com/${person.social.twitter.replace('@', '')}`}
                      underline="hover"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {person.social.twitter}
                    </Anchor>
                  </Group>
                </Stack>
              </Stack>
            </Paper>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
    </Box>
  );
}