'use client';

import { Title, Text, Box } from '@mantine/core';
import { useState, useEffect } from 'react';

const words = ['Unikátní', 'Nezávislá', 'Odvážná', 'Inovativní', 'Hloubková', 'Oceňovaná', 'Poctivá', 'Analytická', 'Investigativní'];

function RotatingWord() {
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setIndex((current) => (current + 1) % words.length);
        setIsAnimating(false);
      }, 500); // Half of the transition time for smooth animation
    }, 5000); // 5 seconds interval

    return () => clearInterval(timer);
  }, []);

  return (
    <Title
      order={2}
      ta="right"
      size="xl"
      c="dimmed"
      style={{ fontSize: 'clamp(0.6rem, 2.5vw, 1.35rem)' }}
      mt="md"
    >
      <Box 
        display="inline-block" 
        ta="right" 
        style={{ 
          width: 'clamp(100px, 30vw, 220px)',  // Responsive width
          overflow: 'hidden',
          verticalAlign: 'bottom'
        }}
      >
        <Text
          component="span"
          c="brandYellow.6"
          inherit
          style={{
            display: 'inline-block',
            transform: `translateY(${isAnimating ? '-100%' : '0'})`,
            transition: 'transform 0.5s ease-in-out',
            whiteSpace: 'nowrap'
          }}
        >
          {words[index]}
        </Text>
      </Box>
      {' '}datová a kontextová žurnalistika
      <span style={{ color: 'var(--mantine-color-brandYellow-6)' }}>.</span>
    </Title>
  );
}

export default RotatingWord;