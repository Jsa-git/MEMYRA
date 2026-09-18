import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

import manifest from '../apps/web/app/manifest';
import { GET } from '../apps/web/app/app-icons/[size]/route';

type WorkerEvent = {
  request: { method: string; mode: string; url: string };
  respondWith: (response: Promise<Response>) => void;
};

function worker() {
  const handlers: Record<string, (event: WorkerEvent) => void> = {};
  const network = vi.fn().mockResolvedValue(new Response('online'));
  const cacheOpen = vi.fn();
  runInNewContext(readFileSync('apps/web/public/sw.js', 'utf8'), {
    self: {
      location: { origin: 'https://pelmorya.example' },
      clients: { claim: vi.fn() },
      addEventListener: (name: string, handler: (event: WorkerEvent) => void) => {
        handlers[name] = handler;
      },
    },
    fetch: network,
    caches: { open: cacheOpen },
    URL,
    Response,
  });
  return { handlers, network, cacheOpen };
}

describe('Pelmorya installable app', () => {
  it('keeps identity and navigation on the existing origin without user data', () => {
    const value = manifest();
    expect(value.id).toBe('/');
    expect(value.scope).toBe('/');
    expect(value.start_url).toBe('/journey');
    expect(value.display).toBe('standalone');
    expect(value.theme_color).toBe('#2B1833');
    expect(value.icons?.map((icon) => icon.sizes)).toEqual(['192x192', '512x512', '512x512']);
  });

  it.each(['180', '192', '512'])('serves a real square PNG icon of size %s', async (size) => {
    const response = await GET(new Request('https://pelmorya.example'), {
      params: Promise.resolve({ size }),
    });
    const bytes = Buffer.from(await response.arrayBuffer());
    expect(response.headers.get('content-type')).toBe('image/png');
    expect(bytes.subarray(1, 4).toString()).toBe('PNG');
    expect(bytes.readUInt32BE(16)).toBe(Number(size));
    expect(bytes.readUInt32BE(20)).toBe(Number(size));
  });

  it('rejects unbounded icon sizes', async () => {
    const response = await GET(new Request('https://pelmorya.example'), {
      params: Promise.resolve({ size: '100000' }),
    });
    expect(response.status).toBe(404);
  });

  it.each([
    ['POST', 'navigate', 'https://pelmorya.example/journey'],
    ['GET', 'navigate', 'https://pelmorya.example/api/photos/123/access'],
    ['GET', 'cors', 'https://storage.example/private/photo?token=synthetic'],
    ['GET', 'navigate', 'https://external.example/'],
    ['GET', 'cors', 'https://pelmorya.example/journey?_rsc=synthetic'],
    ['GET', 'no-cors', 'https://pelmorya.example/image.jpg'],
  ])('does not intercept %s %s %s', (method, mode, url) => {
    const { handlers, network, cacheOpen } = worker();
    const respondWith = vi.fn();
    handlers.fetch?.({ request: { method, mode, url }, respondWith });
    expect(respondWith).not.toHaveBeenCalled();
    expect(network).not.toHaveBeenCalled();
    expect(cacheOpen).not.toHaveBeenCalled();
  });

  it('only serves a generic 503 offline message after a navigation network failure', async () => {
    const { handlers, network, cacheOpen } = worker();
    network.mockRejectedValue(new Error('offline'));
    const request = {
      method: 'GET',
      mode: 'navigate',
      url: 'https://pelmorya.example/journey/private-id',
    };
    let result: Promise<Response> | undefined;
    handlers.fetch?.({
      request,
      respondWith: (response) => {
        result = response;
      },
    });
    const response = await result;
    expect(response?.status).toBe(503);
    expect(response?.headers.get('cache-control')).toBe('no-store');
    const body = await response?.text();
    expect(body).toContain('Sem conexão');
    expect(body).not.toContain('private-id');
    expect(network).toHaveBeenCalledWith(request, { cache: 'no-store' });
    expect(cacheOpen).not.toHaveBeenCalled();
  });

  it('preserves server errors instead of masking them as successful offline pages', async () => {
    const { handlers, network, cacheOpen } = worker();
    network.mockResolvedValue(new Response('server error', { status: 500 }));
    let result: Promise<Response> | undefined;
    handlers.fetch?.({
      request: { method: 'GET', mode: 'navigate', url: 'https://pelmorya.example/journey' },
      respondWith: (response) => {
        result = response;
      },
    });
    expect((await result)?.status).toBe(500);
    expect(cacheOpen).not.toHaveBeenCalled();
  });
});
