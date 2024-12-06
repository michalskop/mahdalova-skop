// components/common/Testimonials.tsx
'use client';

import { useRef } from 'react';
import { Carousel } from '@mantine/carousel';
import { Paper, Title, rem } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import Autoplay from 'embla-carousel-autoplay';
import { testimonials } from '@/data/testimonials';
import { TestimonialCard } from '@/components/common/TestimonialCard';
import { IconChevronLeft, IconChevronRight, IconArrowRight, IconArrowLeft } from '@tabler/icons-react';

import '@mantine/carousel/styles.css';

function Testimonials() {
  const autoplay = useRef(Autoplay({ delay: 8000, stopOnInteraction: true }));
  const isMobile = useMediaQuery('(max-width: 48em)');

  return (
    <Paper 
      bg="brandDeepRed.5"
      p={isMobile ? 'xs' : 'md'}
      >
      <Title order={2} ta="center" mb={isMobile ? 'md' : 'xl'} c="background.0">
        Co o nás říkají
      </Title>
      <Carousel
        loop
        withIndicators
        height={300}
        slideSize={{ base: '100%', sm: '50%', md: '25%' }}
        slideGap={{ base: 0, sm: 'md' }}
        align="start"
        plugins={[autoplay.current]}
        nextControlIcon={<IconChevronRight style={{ width: rem(20), height: rem(20) }} />}
        previousControlIcon={<IconChevronLeft style={{ width: rem(20), height: rem(20) }} />}
        // styles={{
        //   indicator: {
        //     width: 8,
        //     height: 8,
        //     // backgroundColor: 'var(--mantine-color-gray-4)'
        //   }
        // }}
      >
        {testimonials.map((item) => (
          <Carousel.Slide key={item.id}>
            <TestimonialCard {...item} />
          </Carousel.Slide>
        ))}
      </Carousel>
    </Paper>
  );
}

export default Testimonials;
