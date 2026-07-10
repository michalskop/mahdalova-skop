import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Box, Button, Container, Divider, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import SupportBanner from '@/components/common/SupportBanner';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import { kviffBranches, kviffSources } from './data';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mahdalova-skop.cz';
const COVER = `${BASE_URL}/images/specials/karlovy-vary.svg`;

export const metadata: Metadata = {
  title: 'Karlovy Vary v datech',
  description: 'Datový speciál o historii, filmech, cenách, hostech, genderu, zemích, tématech a návštěvnosti Mezinárodního filmového festivalu Karlovy Vary.',
  alternates: { canonical: '/specialy/karlovy-vary' },
  openGraph: {
    title: 'Karlovy Vary v datech',
    description: 'Datový speciál o historii, filmech, cenách, hostech, genderu, zemích, tématech a návštěvnosti KVIFF.',
    url: '/specialy/karlovy-vary',
    type: 'website',
    images: [{ url: COVER, width: 1200, height: 630, alt: 'Karlovy Vary v datech' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Karlovy Vary v datech',
    description: 'Datový speciál o Mezinárodním filmovém festivalu Karlovy Vary.',
    images: [COVER],
  },
};

const keyNumbers = [
  { value: '1946', label: 'začátek festivalu' },
  { value: '1994', label: 'nová každoroční éra' },
  { value: '128 133', label: 'prodaných vstupenek v roce 2025' },
  { value: '8', label: 'analytických větví speciálu' },
];

export default function KarlovyVarySpecialPage() {
  return (
    <Container size="lg" bg="background.2" maw="1200px" w="100%" p={0} m="0 auto">
      <Box component="section" style={{ background: '#101010', color: '#f8f6f0' }}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={0}>
          <Stack gap="lg" p={{ base: 24, md: 48 }} justify="center" mih={{ base: 520, md: 640 }}>
            <Badge w="fit-content" color="yellow" variant="light">Speciál</Badge>
            <Title order={1} style={{ fontFamily: "'Roboto Slab', Georgia, serif", fontSize: 'clamp(2.4rem, 6vw, 5.8rem)', lineHeight: 0.95, maxWidth: 760 }}>
              Karlovy Vary v datech
            </Title>
            <Text size="xl" maw={680} c="#f1eadf">
              Kdo vypráví světový film, kdo získává prestiž a co ukazuje osmdesát let festivalu, když se nedíváme jen na červený koberec, ale na filmy, země, ceny, tvůrce, témata a publikum.
            </Text>
            <Group>
              <Button component={Link} href="/specialy/karlovy-vary/historie-festivalu" color="yellow" variant="filled">
                Začít historií
              </Button>
              <Button component={Link} href="#analyzy" color="gray" variant="outline">
                Projít analýzy
              </Button>
            </Group>
          </Stack>
          <Box
            aria-hidden="true"
            style={{
              minHeight: 420,
              backgroundImage: 'url(/images/specials/karlovy-vary.svg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </SimpleGrid>
      </Box>

      <Box component="section" px={{ base: 16, md: 24 }} py={{ base: 28, md: 42 }}>
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
          {keyNumbers.map((item) => (
            <Paper key={item.label} p="lg" radius={8} withBorder bg="#fffaf0">
              <Text fw={800} size="xl" c="#101010">{item.value}</Text>
              <Text size="sm" c="dimmed">{item.label}</Text>
            </Paper>
          ))}
        </SimpleGrid>
      </Box>

      <Box component="section" px={{ base: 16, md: 24 }} py={{ base: 20, md: 36 }}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          <Stack>
            <Title order={2} style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>Co tím zjišťujeme</Title>
            <Text size="lg">
              Karlovarský festival je kulturní instituce, na které se dá sledovat geopolitika filmu, návrat střední Evropy do festivalového provozu, proměna filmové prestiže i otázka, kdo dostává prostor vyprávět.
            </Text>
            <Text>
              Hlavní stránka drží celek pohromadě. Jednotlivé analýzy půjdou do hloubky: historie, vítězové Crystal Globe, hosté, gender, země, témata, návštěvnost a tržby.
            </Text>
          </Stack>
          <Paper p="lg" radius={8} withBorder>
            <Title order={3} mb="sm" style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>Metodická hranice</Title>
            <Text>
              Data dělíme na digitální éru s lepším pokrytím a archivní éru, kde budeme opatrně oddělovat ověřené ceny, data ročníků a zatím nekompletní filmový program. Gender neodvozujeme ze jmen, tržby nemícháme s festivalovou návštěvností.
            </Text>
          </Paper>
        </SimpleGrid>
      </Box>

      <Divider my="md" />

      <Box id="analyzy" component="section" px={{ base: 16, md: 24 }} py={{ base: 28, md: 42 }}>
        <Group justify="space-between" align="end" mb="lg">
          <Title order={2} style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>Analýzy</Title>
          <Text c="dimmed">Pracovní série, průběžně doplňovaná daty</Text>
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
          {kviffBranches.map((branch) => (
            <Paper
              key={branch.slug}
              component={Link}
              href={`/specialy/karlovy-vary/${branch.slug}`}
              p="lg"
              radius={8}
              withBorder
              style={{ textDecoration: 'none', color: 'inherit', minHeight: 260, borderTop: `6px solid ${branch.accent}` }}
            >
              <Stack h="100%" justify="space-between">
                <Stack gap="xs">
                  <Badge w="fit-content" variant="light" color={branch.status === 'ready' ? 'green' : branch.status === 'research' ? 'orange' : 'gray'}>
                    {branch.status === 'ready' ? 'draft text' : branch.status === 'research' ? 'rešerše' : 'draft'}
                  </Badge>
                  <Text tt="uppercase" size="xs" fw={800} c="dimmed">{branch.kicker}</Text>
                  <Title order={3} style={{ fontFamily: "'Roboto Slab', Georgia, serif", lineHeight: 1.18 }}>{branch.title}</Title>
                  <Text size="sm" c="dimmed">{branch.excerpt}</Text>
                </Stack>
                <Text size="sm" fw={700}>Otevřít kapitolu</Text>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Box>

      <Box component="section" px={{ base: 16, md: 24 }} py={{ base: 28, md: 42 }} bg="#f8f6f0">
        <Title order={2} mb="md" style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>Zdroje a interpretační vrstva</Title>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          <Stack>
            {kviffSources.map((source) => (
              <Text key={source}>• {source}</Text>
            ))}
          </Stack>
          <Text>
            Oficiální archiv používáme pro fakta: ročníky, filmy, ceny, hosty a festivalová čísla. Filmová kritika, mimo jiné Kamil Fila, vstupuje jako výkladová vrstva: pomáhá popsat, jak byl festival čten, kritizován a rámován v českém veřejném prostoru.
          </Text>
        </SimpleGrid>
      </Box>

      <SupportBanner />
      <SubscribeNewsletter actionUrl="https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088" />
    </Container>
  );
}

