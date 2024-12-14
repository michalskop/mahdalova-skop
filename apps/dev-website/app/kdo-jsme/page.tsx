// app/about/page.tsx
import { Title, Text, Container, Paper } from '@mantine/core';
import Testimonials from '@/components/common/Testimonials';
import { ContactsBlock } from '@/components/common/ContactsBlock';

const AboutPage = () => {
  return (
    <Container 
      size="lg"
      bg="background.2"
      maw="1200px"
      w="100%"
      p={0}
      m="0 auto"
    >
      <Paper py={50} bg="brandRoyalBlue.9" radius={0}>
        <Container>
          <Title 
            order={1}
            ta="right"
            size="calc(2rem + 1.5vw)"
            style={{ fontSize: 'clamp(2rem, 6vw, 4rem)' }}
            c="brand"
            fw="bold"
          >
            Mahdalová & Škop
          </Title>
          <Text
            c="background.1"
            size="xl"
            >Jestliže jeden říká, že venku prší, a druhý, že venku svítí slunce, není nutné citovat oba. Novinář/ka má otevřít okno a zjistit skutečný stav věcí. Takhle chápeme novinářské řemeslo a takhle budeme pracovat i nadále.
          </Text>
        </Container>
      </Paper>

      <Testimonials />
        
      <ContactsBlock />
    </Container>
  );
};

export default AboutPage;