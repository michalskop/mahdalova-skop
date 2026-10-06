import type { Metadata } from 'next';
import { Box, Container } from '@mantine/core';
import SubscribeNewsletter from '@/components/common/SubscribeNewsletter';
import closingStyles from '../o-nas/ClosingNote.module.css';
import SupportScrolly from './SupportScrolly';

const NEWSLETTER_URL = 'https://mahdalovaskop.ecomailapp.cz/public/subscribe/1/43c2cd496486bcc27217c3e790fb4088';

export const metadata: Metadata = {
  title: 'Jak nás podpořit',
  description:
    'Sdílejte, nastavte si nás ve Googlu, odebírejte newsletter, pošlete tip, pomozte s Volební kalkulačkou – nebo nás podpořte finančně.',
  alternates: { canonical: '/podporte-nas' },
  openGraph: {
    title: 'Jak nás podpořit — DataTimes.cz',
    description:
      'Nezávislou datovou žurnalistiku neudrží jen peníze. Většina způsobů podpory je zdarma a zabere minutu.',
    url: '/podporte-nas',
    type: 'website',
  },
};

export default function SupportPage() {
  return (
    <Container size="lg" bg="background.1" maw={1200} w="100%" p={0} m="0 auto">
      <Box px={{ base: 12, md: 40 }} pt={{ base: 24, md: 44 }}>
        <SupportScrolly />
      </Box>

      {/* Thank-you note + newsletter stripe (the #newsletter stop links here) */}
      <section className={closingStyles.section}>
        <div className={closingStyles.text}>
          <p>Děkujeme, že jste s{' '}námi.</p>
          <p className={closingStyles.highlight}>Každý krok nám pomáhá dostat data na světlo.</p>
        </div>
        <div id="newsletter" className={closingStyles.newsletter}>
          <SubscribeNewsletter actionUrl={NEWSLETTER_URL} />
        </div>
      </section>
    </Container>
  );
}
