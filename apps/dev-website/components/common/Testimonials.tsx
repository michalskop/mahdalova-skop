// components/Testimonials.tsx
'use client';

import { useState, useEffect } from 'react';
import { Paper, Text, Title, Container, Box } from '@mantine/core';
import { keyframes } from '@emotion/react';
import { testimonials } from '@/data/testimonials';

const slideUpIn = keyframes`
  from { transform: translateY(20%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const slideUpOut = keyframes`
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(-20%); opacity: 0; }
`;

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);  // Start transition
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
        );
        setIsTransitioning(false);  // End transition
      }, 1000);  // This should be half of your animation duration
      
    }, 8000);
  
    return () => clearInterval(timer);
  }, []);
  

  const current = testimonials[currentIndex];

  return (
    <Container size="md" my="xl">
      <Paper
        shadow="sm"
        p="xl"
        radius="md"
        style={{
          height: "300px",
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(45deg, var(--mantine-color-yellow-6) 0%, var(--mantine-color-orange-6) 100%)',
        }}
      >
        <Box
          key={current.id}
          style={{
            animation: `${isTransitioning ? slideUpOut : slideUpIn} 1.2s ease-in-out`,
            color: 'gray-1',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            opacity: isTransitioning ? 0 : 1,
            transition: 'opacity 1.2s ease-in-out',
          }}
        >
          <Text
            size="xl"
            style={{
              fontStyle: 'italic',
              lineHeight: 1.6,
              marginBottom: '2rem',
            }}
          >
            &ldquo;{current.text}&rdquo;
          </Text>
          
          <Box>
            <Title order={4} mb={5}>
              {current.author}
            </Title>
            <Text size="sm" opacity={0.9}>
              {current.position}
            </Text>
            <Text size="sm" opacity={0.8} mt={5}>
              {current.date}
            </Text>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}