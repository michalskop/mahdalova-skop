import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Box, Button, Container, Divider, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import SupportBanner from '@/components/common/SupportBanner';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import { getKviffBranch, kviffBranches, kviffSources } from '../data';

type PageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return kviffBranches.map((branch) => ({ slug: branch.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const branch = getKviffBranch(params.slug);
  if (!branch) return { title: 'Analýza nenalezena' };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.mahdalova-skop.cz';
  const image = `${baseUrl}/images/specials/karlovy-vary.svg`;

  return {
    title: `${branch.title} | Karlovy Vary v datech`,
    description: branch.excerpt,
    alternates: { canonical: `/specialy/karlovy-vary/${branch.slug}` },
    openGraph: {
      title: `${branch.title} | Karlovy Vary v datech`,
      description: branch.excerpt,
      url: `/specialy/karlovy-vary/${branch.slug}`,
      type: 'article',
      images: [{ url: image, width: 1200, height: 630, alt: branch.title }],
    },
  };
}

export default function KviffBranchPage({ params }: PageProps) {
  const branch = getKviffBranch(params.slug);
  if (!branch) notFound();

  return (
    <Container size="lg" bg="background.2" maw="1200px" w="100%" p={0} m="0 auto">
      <Box component="article">
        <Box style={{ background: '#101010', color: '#f8f6f0' }} px={{ base: 18, md: 44 }} py={{ base: 34, md: 64 }}>
          <Stack gap="md" maw={860}>
            <Button component={Link} href="/specialy/karlovy-vary" variant="subtle" color="yellow" w="fit-content" px={0}>
              Karlovy Vary v datech
            </Button>
            <Badge w="fit-content" style={{ background: branch.accent, color: '#101010' }}>{branch.kicker}</Badge>
            <Title order={1} style={{ fontFamily: "'Roboto Slab', Georgia, serif", fontSize: 'clamp(2.2rem, 5vw, 4.8rem)', lineHeight: 1 }}>
              {branch.title}
            </Title>
            <Text size="xl" c="#f1eadf">{branch.excerpt}</Text>
          </Stack>
        </Box>

        <Box px={{ base: 16, md: 24 }} py={{ base: 24, md: 36 }}>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
            {branch.metrics.map((metric) => (
              <Paper key={metric} p="md" radius={8} withBorder style={{ borderTop: `5px solid ${branch.accent}` }}>
                <Text fw={800}>{metric}</Text>
              </Paper>
            ))}
          </SimpleGrid>
        </Box>

        <Box px={{ base: 16, md: 24 }} py={{ base: 12, md: 24 }}>
          <Stack gap="xl" maw={860}>
            {branch.sections.map((section) => (
              <Stack key={section.heading} gap="sm">
                <Title order={2} style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>{section.heading}</Title>
                {section.body.map((paragraph) => (
                  <Text key={paragraph} size="lg" lh={1.65}>{paragraph}</Text>
                ))}
              </Stack>
            ))}
          </Stack>
        </Box>

        <Box px={{ base: 16, md: 24 }} py={{ base: 24, md: 36 }}>
          <Paper p="lg" radius={8} withBorder bg="#fffaf0">
            <Title order={3} mb="sm" style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>Co doplníme v datové fázi</Title>
            <Text>
              Tato kapitola je založená jako redakční a metodologický draft. Další krok je napojit finální dataset z oficiálního archivu KVIFF, ověřit sekundární zdroje a doplnit vizualizace.
            </Text>
          </Paper>
        </Box>

        <Divider my="md" />

        <Box px={{ base: 16, md: 24 }} py={{ base: 24, md: 36 }}>
          <Group justify="space-between" align="end" mb="md">
            <Title order={2} style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>Další kapitoly</Title>
            <Button component={Link} href="/specialy/karlovy-vary" variant="outline">Zpět na landing page</Button>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            {kviffBranches.filter((item) => item.slug !== branch.slug).map((item) => (
              <Paper
                key={item.slug}
                component={Link}
                href={`/specialy/karlovy-vary/${item.slug}`}
                p="md"
                radius={8}
                withBorder
                style={{ textDecoration: 'none', color: 'inherit', borderTop: `5px solid ${item.accent}` }}
              >
                <Text size="xs" fw={800} tt="uppercase" c="dimmed">{item.kicker}</Text>
                <Title order={4} mt={4} style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>{item.title}</Title>
              </Paper>
            ))}
          </SimpleGrid>
        </Box>

        <Box px={{ base: 16, md: 24 }} py={{ base: 24, md: 36 }} bg="#f8f6f0">
          <Title order={3} mb="sm" style={{ fontFamily: "'Roboto Slab', Georgia, serif" }}>Pracovní zdroje</Title>
          <Stack gap={4}>
            {kviffSources.map((source) => (
              <Text key={source}>• {source}</Text>
            ))}
          </Stack>
        </Box>
      </Box>

      <SupportBanner />
      <SubscribeNewsletter actionUrl="https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088" />
    </Container>
  );
}

