'use client';

import { Title, Text, Box } from '@mantine/core';
import { useState, useEffect } from 'react';

const words = ['Nezávislá', 'Unikátní', 'Odvážná', 'Inovativní', 'In-depth', 'Oceňovaná', 'Poctivá'];

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
      style={{ fontSize: 'clamp(1.25rem, 4vw, 2.5rem)' }}
      mt="md"
    >
      <Box 
        display="inline-block" 
        ta="right" 
        style={{ 
          width: 'clamp(100px, 30vw, 200px)',  // Responsive width
          overflow: 'hidden',
          verticalAlign: 'bottom'
        }}
      >
        <Text
          component="span"
          c="teal"
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
    </Title>
  );
}

export default RotatingWord;