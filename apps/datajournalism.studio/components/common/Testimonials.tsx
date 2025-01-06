// components/common/Testimonials.tsx
'use client';

import { useRef } from 'react';
import { Carousel } from '@mantine/carousel';
import { Group, Stack, Paper, Title, rem, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import Autoplay from 'embla-carousel-autoplay';
import { testimonials } from '@/data/testimonials';
import { TestimonialCard } from '@/components/common/TestimonialCard';
import { IconChevronLeft, IconChevronRight, IconArrowRight, IconArrowLeft } from '@tabler/icons-react';
import { Arrow } from '@/components/common/Arrow';

import '@mantine/carousel/styles.css';

function Testimonials() {
  const autoplay = useRef(Autoplay({ delay: 8000, stopOnInteraction: true }));
  const isMobile = useMediaQuery('(max-width: 48em)');
  const theme = useMantineTheme();

  return (
    <Paper 
      bg="brandDeepRed.5"
      p={isMobile ? 'xs' : 'md'}
      >
      <Group 
        gap={0}
        align="flex-start"
        wrap="wrap"
      >
        <Stack 
          w={{ base: '100%', md: 200 }}
          mb={{ base: 'xs', md: 0 }}
          pt={15}
          pl={{ base: 'md', md: 'md' }}
        >
          <Title 
            order={2} 
            ta={{ base: 'left', sm: 'right' }}
            style={{ display: 'flex', alignItems: 'right', justifyContent: 'flex-start'}}
            c={theme.colors.background[0]}
            pb="lg"
          >
            Testimonials
            {/* <Arrow size={80} color={ theme.colors.background[0] } /> */}
          </Title>
        </Stack>
      </Group>
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
