// app/specialy/data-pro-budouci-premierku/01-demografie/page.tsx
import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import { Box, Container } from '@mantine/core';
import RawHtmlEmbed from '@/components/common/RawHtmlEmbed';

export const metadata: Metadata = {
  title: 'Demografie | Data pro budoucí premiérku',
  description: 'Vymíráme? Co se skutečně děje s českou populací a proč samotná čísla k pochopení nestačí.',
  alternates: { canonical: '/specialy/data-pro-budouci-premierku/01-demografie' },
  openGraph: {
    title: 'Demografie | Data pro budoucí premiérku',
    description: 'Vymíráme? Co se skutečně děje s českou populací a proč samotná čísla k pochopení nestačí.',
    url: '/specialy/data-pro-budouci-premierku/01-demografie',
    type: 'article',
  },
};

export default function DemografieHubPage() {
  const htmlPath = path.join(
    process.cwd(),
    'app/clanek/_articles/data-pro-budouci-premierku-02-demografie/demografie-hub.html'
  );
  const html = fs.readFileSync(htmlPath, 'utf8');

  return (
    <Box style={{ background: '#fdfbf7', minHeight: '100vh' }}>
      <Container size="md" style={{ padding: '0 16px' }}>
        <RawHtmlEmbed
          html={html}
          assetBasePath="/clanek/_articles/data-pro-budouci-premierku-02-demografie"
        />
      </Container>
    </Box>
  );
}
