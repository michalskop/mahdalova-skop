import { Title, Container, Paper, Text } from '@mantine/core';
import RotatingWord from '@/components/frontpage/RotatingWord';

const HeroTitle = () => {
  return (
    <Paper py={80} mb="lg" bg="background.6" radius="md">
      <Container>
        <Title 
          order={1}
          ta="right"
          size="calc(2.5rem + 1.5vw)"
          style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}
          c="brand"
          fw="bold"
        >
          Mahdalová & Škop
        </Title>
        <Title
          order={2}
          ta="center"
          size="xl"
          c="gray"
          style={{ fontSize: 'clamp(1.25rem, 4vw, 2.5rem)' }}
          mt="md"
        >
          <RotatingWord />
        </Title>
      </Container>
    </Paper>
  );
};

export default HeroTitle;