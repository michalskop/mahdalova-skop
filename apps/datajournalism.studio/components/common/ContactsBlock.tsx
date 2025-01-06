// components/common/ContactsBlock.tsx
'use client';

import { Grid, Paper, Text, Title, Group, Stack, Anchor, Box, rem,useMantineTheme }from '@mantine/core';
import { Global } from '@mantine/styles';
import { 
  IconMail, 
  IconPhone, 
  IconBrandX, 
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
  const theme = useMantineTheme();

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
        c={theme.colors.brand[6]}
        style={{ cursor: 'pointer' }}
        onClick={handleReveal}
      >
        email@... Click to display
      </Text>
    );
  }

  return (
    <Group gap={8} c={theme.colors.brand[6]}>
      <Text>{emailUser}@{emailDomain}</Text>
      <Anchor 
        component="button"
        size="sm"
        onClick={handleCopy}
        c={theme.colors.brandNavy[6]}
      >
        {isCopied ? 'Copied!' : 'Copy'}
      </Anchor>
    </Group>
  );
}

export function ContactsBlock() {
  const theme = useMantineTheme();
  
  return (
    <>
    <Global
      styles={{
        '#contacts a': {
          color: theme.colors.brand[6],
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
          '&:active': {
            color: theme.colors.brand[6],
          },
          '&:visited': {
            color: theme.colors.brand[6],
          },
        },
      }}
    />
    <Paper
      id="contacts" 
      style={{ scrollMarginTop: '100px' }}
      p="lg"
      bg="background.2"
    >
      {/* <Container size="md" my="xl"> */}
        <Stack 
            w={{ base: '100%', md: 200 }}
            mb={{ base: 'xs', md: 0 }}
            pt={15}
            pl={{ base: 'md', md: 'md' }}
          >
          <Title 
            order={2}
            mb="xs"  // margin bottom
            size="h2" // or specific size like "28px"
            c={theme.colors.brandNavy[9]}
          >
            Contacts
          </Title>
        </Stack>
        <Grid gutter="md">
          {contacts.map((person) => (
            <Grid.Col key={person.name} span={{ base: 12, sm: 6 }}>
              <Paper
                // shadow="xs"
                p="md"
                radius="md"
                // withBorder
                style={{
                  height: '100%',
                }}
              >
                <Stack gap="md">
                  <Text size="xl" fw={700}
                    c={theme.colors.brand[6]}
                  >
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
                      <Text>AT:</Text>
                      <Anchor href={`tel:${person.phoneAT.replace(/\s/g, '')}`} underline="hover">
                        {person.phoneAT}
                      </Anchor>
                    </Group>
                    <Group gap="xs" ml={28} mt={5}>
                      <Text>CZ:</Text>
                      <Anchor href={`tel:${person.phoneCZ.replace(/\s/g, '')}`} underline="hover">
                        {person.phoneCZ}
                      </Anchor>
                    </Group>
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
                      <IconBrandX 
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
      {/* </Container> */}
    </Paper>
    </>
  );
}