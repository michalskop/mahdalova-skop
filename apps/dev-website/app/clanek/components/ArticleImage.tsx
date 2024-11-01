// app/clanek/components/MDXClientWrapper.tsx
'use client';

import { ReactNode } from 'react';

export default function MDXClientWrapper({ children }: { children: ReactNode }) {
  return <>{children}</>;
}