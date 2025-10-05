'use client';

import dynamic from 'next/dynamic';

export const ThemeProviderClient = dynamic(
  () => import('./ThemeProvider'),
  { ssr: false }
);
