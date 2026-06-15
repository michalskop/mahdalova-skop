// app/special/page.tsx â€” Landing page vÅ¡ech speciÃ¡lÅ¯
import { Box, Group, Stack, Title, Paper, SimpleGrid, Container } from '@mantine/core';
import type { Metadata } from 'next';
import { Arrow } from '@repo/ui/components/Arrow';
import SupportBanner from '@/components/common/SupportBanner';

export const metadata: Metadata = {
  title: 'SpeciÃ¡ly',
  description: 'SpeciÃ¡lnÃ­ projekty a investigativnÃ­ sÃ©rie MahdalovÃ¡ & Skop.',
  alternates: { canonical: '/specialy' },
  openGraph: {
    title: 'SpeciÃ¡ly',
    description: 'SpeciÃ¡lnÃ­ projekty a investigativnÃ­ sÃ©rie MahdalovÃ¡ & Skop.',
    url: '/specialy',
    type: 'website',
  },
};

const BG = '#044d5e';
const WHITE = '#ffffff';

const TILES = [
  {
    href: '/specialy/data-pro-budouci-premierku',
    title: 'Data pro budoucÃ­ premiÃ©rku',
    bg: '#ff3f30',
    external: false,
    logo: 'dpbp',
    coverImage: '/images/specials/data-pro-budouci-premierku.svg',
  },
  {
    href: '/specialy/svobodna-media',
    title: 'SvobodnÃ¡ mÃ©dia',
    bg: '#812840',
    external: false,
    logo: 'tv',
    coverImage: '/images/specials/svobodna-media.svg',
  },
  {
    href: '/specialy/investigace',
    title: 'M & Å  investigace',
    bg: '#351040',
    external: false,
    logo: 'lupa',
    coverImage: '/images/specials/investigace.svg',
  },
  {
    href: 'https://snemovna.datatimes.cz',
    title: 'SnÄ›movna DataTimes.cz',
    bg: '#2f325c',
    external: true,
    logo: 'flag',
    coverImage: '/images/specials/snemovna.svg',
  },
  {
    href: 'https://mandaty.cz',
    title: 'MandÃ¡ty.cz',
    bg: 'linear-gradient(90deg, #f71b4b, #101432)',
    external: true,
    logo: 'mandaty',
    coverImage: '/images/specials/mandaty.svg',
  },
  {
    href: '/specialy/klima',
    title: 'Data o klimatu',
    bg: 'linear-gradient(135deg, #2a3f04, #639e0a)',
    external: false,
    logo: 'klima',
    coverImage: '/images/specials/klima.svg',
  },
];

/* â”€â”€ Tile â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function SpecialPageTile({ href, title, bg, external, coverImage }: typeof TILES[0]) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="specials-tile"
      style={{
        textDecoration: 'none',
        display: 'block',
        borderRadius: 12,
        overflow: 'hidden',
        aspectRatio: '1 / 1',
        position: 'relative',
        background: bg,
        transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        cursor: 'pointer',
      }}
    >
      {coverImage && (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 20px 18px', minHeight: 72, display: 'flex', alignItems: 'flex-start' }}>
        <Title order={3} style={{
          color: WHITE,
          fontFamily: "'Roboto Slab', Georgia, serif",
          fontWeight: 500,
          fontSize: 'var(--mantine-font-size-lg)',
          lineHeight: 1.35,
        }}>
          {title}
        </Title>
      </div>
    </a>
  );
}

export default function SpecialsLandingPage() {
  return (
    <Container size="lg" bg="background.2" maw="1200px" w="100%" p={0} m="0 auto">
      <style>{`
        .specials-tile { position: relative; }
        .specials-tile:hover { transform: scale(1.025); }
        .specials-tile::after {
          content: '';
          position: absolute;
          inset: 0;
          border: 1px solid var(--mantine-color-default-border);
          border-radius: inherit;
          pointer-events: none;
          z-index: 10;
        }
      `}</style>
      <Paper py={20} bg={BG} radius={0} style={{ minHeight: '60vh' }}>
        <Group gap={0} align="flex-start" wrap="wrap">
          {/* LevÃ½ sloupec â€” nadpis (stejnÃ¡ Å¡Ã­Å™ka jako u ArticlesSection) */}
          <Stack
            w={{ base: '100%', md: 200 }}
            mb={{ base: 'xs', md: 0 }}
            pt={15}
            pl={{ base: 'md', md: 'md' }}
          >
            <a
              href="/specialy"
              style={{ textDecoration: 'none', display: 'inline-flex', maxWidth: '100%', color: WHITE }}
            >
              <Title
                order={2}
                ta="left"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '5px', color: WHITE, fontFamily: "'Roboto Slab', serif" }}
              >
                SpeciÃ¡ly
                <Arrow size={80} color={WHITE} />
              </Title>
            </a>
          </Stack>

          {/* PravÃ½ sloupec â€” dlaÅ¾dice */}
          <Box flex={1}>
            <Container size="lg" px="md" py={16}>
              <SimpleGrid cols={{ base: 1, xs: 2, sm: 3 }} spacing="md">
                {TILES.map(tile => (
                  <SpecialPageTile key={tile.title} {...tile} />
                ))}
              </SimpleGrid>
            </Container>
          </Box>
        </Group>
      </Paper>
      <SupportBanner />
    </Container>
  );
}
