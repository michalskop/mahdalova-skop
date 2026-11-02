// app/about/page.tsx – English port of the Czech DataTimes.cz /o-nas page
// (apps/web/app/o-nas). Same layout: wavy timeline, closing note with the
// newsletter, contacts and the "Support us" accordion.
import type { Metadata } from 'next';
import { Box, Container } from '@mantine/core';
import { ContactsBlock } from '@/components/common/ContactsBlock';
import { ibmPlexSans, ibmPlexSerif } from '../fonts';
import fontStyles from './pageFonts.module.css';
import AboutScrolly from './AboutScrolly';
import ClosingNote from './ClosingNote';
import SupportAccordion from './SupportAccordion';

export const metadata: Metadata = {
  title: 'About us',
  description:
    'Who we are, why we do data journalism and which specific problem we can help solve. Data. Context. Clarity. Courage.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About us — DataTimes',
    description:
      'Who we are, why we do data journalism and which specific problem we can help solve.',
    url: '/about',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <Container
      size="lg"
      bg="background.1"
      maw={1200}
      w="100%"
      p={0}
      m="0 auto"
      className={`${ibmPlexSerif.variable} ${ibmPlexSans.variable} ${fontStyles.fonts}`}
    >
      {/* Timeline – starts the page; the first card carries the intro */}
      <Box px={{ base: 12, md: 40 }} pt={{ base: 24, md: 44 }}>
        <AboutScrolly />
      </Box>

      {/* Closing note – the timeline's fading tail points here */}
      <ClosingNote />

      <ContactsBlock />

      {/* Ways to support us – same content as /support, as an accordion */}
      <SupportAccordion />
    </Container>
  );
}
