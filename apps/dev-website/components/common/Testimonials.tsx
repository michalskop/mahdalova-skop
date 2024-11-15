// components/common/Testimonials.tsx
'use client';

import '@mantine/carousel/styles.css';
import { useRef, useEffect } from 'react';
import { Carousel, type Embla } from '@mantine/carousel';
import { Paper, Text, Title, Container, rem } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import Autoplay from 'embla-carousel-autoplay';
import { testimonials } from '@/data/testimonials';
import type { TestimonialData } from '@/data/testimonials';

function Testimonials() {
  const autoplay = useRef(
    Autoplay({
      delay: 8000,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
    })
  );
  const embla = useRef<Embla | null>(null);
  const isMobile = useMediaQuery('(max-width: 48em)');

  // Common control styles based on device type
  const controlStyles = {
    width: isMobile ? '40px' : '30px',
    height: isMobile ? '40px' : '30px',
    minWidth: 'auto',
    border: '1px solid var(--mantine-color-brand-6)',
    backgroundColor: 'var(--mantine-color-body)',
  };

  // Reset autoplay when component mounts
  useEffect(() => {
    if (embla.current) {
      autoplay.current.reset();
    }
  }, []);

  return (
    <Container size="md" p={isMobile ? 'xs' : 'md'}>
      <Title order={2} style={{ textAlign: 'center', marginBottom: isMobile ? '0.5rem' : '1rem' }}>
        Co o nás píší jiní
      </Title>
      <Carousel
        loop
        getEmblaApi={setEmbla => {
          embla.current = setEmbla;
          // Start autoplay when carousel is initialized
          if (setEmbla) {
            autoplay.current.reset();
          }
        }}
        withIndicators
        withControls
        height={250}
        slideGap="md"
        nextControlProps={{
          style: { 
            ...controlStyles,
            right: isMobile ? -20 : -40 
          }
        }}
        previousControlProps={{
          style: { 
            ...controlStyles,
            left: isMobile ? -20 : -40 
          }
        }}
        plugins={[autoplay.current]}
        styles={{
          viewport: {
            padding: isMobile ? '0 20px' : '0 40px',
          },
          control: {
            '&[data-inactive]': {
              opacity: 0,
              cursor: 'default',
            },
          },
          indicator: {
            width: 8,
            height: 8,
            backgroundColor: 'var(--mantine-color-gray-4)'
          }
        }}
      >
        {testimonials.map((item: TestimonialData) => (
          <Carousel.Slide key={item.id}>
            <Paper
              shadow="sm"
              p={isMobile ? 'sm' : 'xl'}
              radius="md"
              style={{
                backgroundColor: 'var(--mantine-color-background-2)',
                border: '1px solid var(--mantine-color-brand-6)',
                height: '100%',
              }}
            >
              <div className="flex flex-col justify-between h-full">
                <Text 
                  size={isMobile ? 'md' : 'xl'} 
                  className="italic"
                  style={{ 
                    lineHeight: isMobile ? '1.3' : '1.5',
                    fontSize: isMobile ? rem(18) : rem(20)
                  }}
                >
                  &ldquo;{item.text}&rdquo;
                </Text>
                
                <div className="mt-4">
                  <Title 
                    order={4} 
                    className="mb-1"
                    size={isMobile ? 'h5' : 'h4'}
                  >
                    {item.author}
                  </Title>
                  <Text 
                    size={isMobile ? 'xs' : 'sm'} 
                    c="dimmed"
                  >
                    {item.position}
                  </Text>
                  <Text 
                    size={isMobile ? 'xs' : 'sm'} 
                    c="dimmed" 
                    mt={2}
                  >
                    {item.date}
                  </Text>
                </div>
              </div>
            </Paper>
          </Carousel.Slide>
        ))}
      </Carousel>
    </Container>
  );
}

export default Testimonials;