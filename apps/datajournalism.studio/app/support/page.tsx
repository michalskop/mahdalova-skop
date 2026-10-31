// app/support/page.tsx – English port of the Czech DataTimes.cz /podporte-nas
// page (apps/web/app/podporte-nas).
import type { Metadata } from 'next';
import { Box, Container } from '@mantine/core';
import NewsletterStripe from '@/components/about/NewsletterStripe';
import { ibmPlexSans, ibmPlexSerif } from '../fonts';
import fontStyles from '../about/pageFonts.module.css';
import closingStyles from '../about/ClosingNote.module.css';
import SupportScrolly from './SupportScrolly';

export const metadata: Metadata = {
  title: 'How to support us',
  description:
    'Share our stories, make us a preferred source on Google, subscribe to the newsletter, send us a tip, help with the Voting Advice Application – or support us financially.',
  alternates: { canonical: '/support' },
  openGraph: {
    title: 'How to support us — DataTimes',
    description:
      'Independent data journalism cannot be sustained by money alone. Most ways to support us are free and take a minute.',
    url: '/support',
    type: 'website',
  },
};

export default function SupportPage() {
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
      <Box px={{ base: 12, md: 40 }} pt={{ base: 24, md: 44 }}>
        <SupportScrolly />
      </Box>

      {/* Thank-you note + newsletter stripe (the #newsletter stop links here) */}
      <section className={closingStyles.section}>
        <div className={closingStyles.text}>
          <p>Thank you for being with us.</p>
          <p className={closingStyles.highlight}>Every step helps us bring data to light.</p>
        </div>
        <div id="newsletter" className={closingStyles.newsletter}>
          <NewsletterStripe />
        </div>
      </section>
    </Container>
  );
}
