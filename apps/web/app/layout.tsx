import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';
import { PwaProvider } from './components/pwa-provider';

const sans = Manrope({ subsets: ['latin'], variable: '--font-memyra-sans', display: 'swap' });
const serif = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-memyra-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Pelmorya', template: '%s · Pelmorya' },
  description: 'Sua jornada de cuidado, registrada com consistência.',
  applicationName: 'Pelmorya',
  appleWebApp: { capable: true, title: 'Pelmorya', statusBarStyle: 'default' },
  icons: {
    icon: [{ url: '/app-icons/192', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/app-icons/180', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = { themeColor: '#2B1833', viewportFit: 'cover' };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <PwaProvider>{children}</PwaProvider>
      </body>
    </html>
  );
}
