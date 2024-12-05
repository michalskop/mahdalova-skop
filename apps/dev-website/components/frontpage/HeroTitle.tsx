import { Title, Container, Paper, Text } from '@mantine/core';
import RotatingWord from '@/components/frontpage/RotatingWord';

const HeroTitle = () => {
  return (
    <Paper py={80} bg="brandRoyalBlue.9" radius={0}>
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
        
        <RotatingWord />
      </Container>
    </Paper>
  );
};

export default HeroTitle;