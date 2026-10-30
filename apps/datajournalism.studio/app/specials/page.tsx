// app/specials/page.tsx – thematic series (English counterpart of /specialy on DataTimes.cz)
import { Container, Paper, Title, Text, SimpleGrid, Anchor } from '@mantine/core';
import { getArticles } from '@/components/common/getArticles';
import { ArticlesSection } from '@/components/common/ArticlesSection';

export const metadata = { title: 'Specials' };

// Projects that so far exist only in the Czech edition or as standalone tools
const moreProjects = [
  { href: 'https://www.datatimes.cz/specialy/data-pro-budouci-premierku', title: 'Data for the Future Prime Minister', text: 'Fifteen chapters on what the data say about Czech policy (in Czech).' },
  { href: 'https://www.datatimes.cz/specialy/svobodna-media', title: 'Free Media', text: 'Our series on press freedom and public service media (in Czech).' },
  { href: 'https://www.datatimes.cz/specialy/klima', title: 'Climate Data', text: 'Data on the climate crisis (in Czech).' },
  { href: 'https://www.datatimes.cz/specialy/kviff', title: 'Karlovy Vary Film Festival in Data', text: 'The festival in numbers (in Czech).' },
  { href: 'https://volebnikalkulacka.cz/', title: 'Voting Advice Applications', text: 'Since 2006, helping millions of voters in many countries compare their views with parties and candidates.' },
  { href: 'https://mandaty.cz', title: 'Mandáty.cz', text: 'Our seat-projection model for the Czech Chamber of Deputies (in Czech).' },
];

export default async function SpecialsPage() {
  const elections = await getArticles(100, 'work');
  const czech = elections.filter((a) => a.tags?.some((t) => /elections 2026/i.test(t)));
  const world = elections.filter((a) => !czech.includes(a) && a.tags?.some((t) => t.toLowerCase() === 'elections'));

  return (
    <Container size="lg" bg="background.2" maw="1200px" w="100%" p={0} m="0 auto">
      <ArticlesSection sectionTitle="Elections around the world" articles={world} themeColor="brand" />
      <ArticlesSection sectionTitle="Czech elections 2026" articles={czech} themeColor="brandRoyalBlue.6" />

      <Paper py={30} px="md" bg="brandRoyalBlue.9" radius={0}>
        <Title order={2} c="brand" mb="md">More projects</Title>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {moreProjects.map((p) => (
            <Paper key={p.href} p="md" radius="md" bg="background.1">
              <Anchor href={p.href} target="_blank" rel="noopener noreferrer" fw={700} c="brandRoyalBlue.9">
                {p.title} ↗
              </Anchor>
              <Text size="sm" mt={6} c="brandRoyalBlue.9">{p.text}</Text>
            </Paper>
          ))}
        </SimpleGrid>
      </Paper>
    </Container>
  );
}
