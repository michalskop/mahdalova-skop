'use client';

import { forwardRef, type SVGProps } from 'react';

export const WORLD_MAP_VIEWPORT = {
  width: 960,
  top: 85,
  height: 520,
} as const;

export const WORLD_MAP_DEFAULT_VIEW = {
  zoom: 1.15,
  offset: { x: -69, y: -29 },
  projection: {
    scale: 190,
    translate: { x: 500, y: 415 },
    rotate: [-12, 0] as const,
  },
} as const;

export const WorldMapViewport = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  ({ children, style, viewBox, ...props }, ref) => (
    <svg
      ref={ref}
      viewBox={viewBox ?? `0 ${WORLD_MAP_VIEWPORT.top} ${WORLD_MAP_VIEWPORT.width} ${WORLD_MAP_VIEWPORT.height}`}
      preserveAspectRatio="xMidYMid meet"
      style={{
        display: 'block',
        width: '100%',
        height: 'auto',
        cursor: 'grab',
        touchAction: 'none',
        ...style,
      }}
      {...props}
    >
      {children}
    </svg>
  ),
);

WorldMapViewport.displayName = 'WorldMapViewport';
