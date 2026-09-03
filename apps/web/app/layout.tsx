import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';

const sans = Manrope({ subsets: ['latin'], variable: '--font-memyra-sans', display: 'swap' });
const serif = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-memyra-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'MEMYRA', template: '%s · MEMYRA' },
  description: 'Sua jornada de cuidado, registrada com consistência.',
};

export const viewport: Viewport = { themeColor: '#f8f4ea' };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
