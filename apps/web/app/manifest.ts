import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Pelmorya',
    short_name: 'Pelmorya',
    description: 'Sua rotina, suas fotografias e sua trajetória de cuidado, em um só lugar.',
    lang: 'pt-BR',
    start_url: '/journey',
    scope: '/',
    display: 'standalone',
    background_color: '#2B1833',
    theme_color: '#2B1833',
    prefer_related_applications: false,
    icons: [
      { src: '/app-icons/192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/app-icons/512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/app-icons/512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
