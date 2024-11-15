// app/about/page.tsx
import { Title, Text, Container, Stack } from '@mantine/core';
import Testimonials from '@/components/common/Testimonials';
import { ContactsBlock } from '@/components/common/ContactsBlock';

const AboutPage = () => {
  return (
    <Container size="lg" py="xl">
      <Title>About Us</Title>
      <Text>Information about us will be displayed here.</Text>

      <section>
          <Testimonials />
        </section>
      <ContactsBlock />
    </Container>
  );
};

export default AboutPage;