/* global self, fetch, Response, URL */
// Pelmorya PWA v1. Network-only: no CacheStorage, offline photos, queue or analytics.
// New versions activate after old clients close; never force reload during a capture.
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

const offlinePage = `<!doctype html><html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#2B1833"><title>Sem conexão · Pelmorya</title>
<style>html{color-scheme:dark;background:#2B1833;color:#F4ECDF;font:16px/1.6 system-ui}
body{margin:0;min-height:100dvh;display:grid;place-items:center}main{max-width:28rem;padding:2rem}
small{letter-spacing:.16em;color:#A7C957}h1{font:2.7rem/1.1 Georgia,serif}p{opacity:.85}
a{display:inline-flex;min-height:48px;align-items:center;background:#A7C957;color:#18181F;padding:0 1.5rem;border-radius:1rem;text-decoration:none;font-weight:700}
a:focus-visible{outline:2px solid #F4ECDF;outline-offset:5px}</style></head>
<body><main><small>PELMORYA</small><h1>Seu cuidado pode esperar a conexão.</h1>
<p>Conecte-se à internet para acessar sua jornada. Fotografias e registros não ficam disponíveis offline nesta versão.</p>
<a href="/journey">Tentar novamente</a></main></body></html>`;

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  // Never intercept APIs, POSTs, images, signed URLs, RSC or other origins.
  if (
    request.method !== 'GET' ||
    request.mode !== 'navigate' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/')
  )
    return;
  event.respondWith(
    fetch(request, { cache: 'no-store' }).catch(
      () =>
        new Response(offlinePage, {
          status: 503,
          headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
        }),
    ),
  );
});
