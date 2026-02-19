'use client';
import _ScrollyTelling from '@repo/ui/components/ScrollyTelling';
import type { ScrollyStep, ScrollyContent } from '@repo/ui/types/scrolly';

interface ScrollyTellingProps {
  steps: ScrollyStep[];
  defaultContent?: ScrollyContent['defaultContent'];
  className?: string;
  textAlignment?: 'left' | 'right';
  slug?: string;
}

const ScrollyTelling = (props: ScrollyTellingProps) => (
  <_ScrollyTelling articleBasePath="/a/_articles" {...props} />
);

export default ScrollyTelling;
