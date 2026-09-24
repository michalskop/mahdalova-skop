import type { Metadata } from 'next';
import { Box, Container } from '@mantine/core';
import { ContactsBlock } from '@/components/common/ContactsBlock';
import AboutScrolly from './AboutScrolly';
import ClosingNote from './ClosingNote';

export const metadata: Metadata = {
  title: 'O nás',
  description:
    'Kdo jsme, proč děláme datovou žurnalistiku a jaký konkrétní problém umíme řešit. Data. Kontext. Srozumitelnost. Odvaha.',
  alternates: { canonical: '/o-nas' },
  openGraph: {
    title: 'O nás — DataTimes / Mahdalová & Škop',
    description:
      'Kdo jsme, proč děláme datovou žurnalistiku a jaký konkrétní problém umíme řešit.',
    url: '/o-nas',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <Container size="lg" bg="background.1" maw={1200} w="100%" p={0} m="0 auto">
      {/* Timeline – starts the page; the first card carries the intro */}
      <Box px={{ base: 12, md: 40 }} pt={{ base: 24, md: 44 }}>
        <AboutScrolly />
      </Box>

      {/* Closing note – the timeline's fading tail points here */}
      <ClosingNote />

      <ContactsBlock />
    </Container>
  );
}
