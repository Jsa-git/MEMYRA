import { expect, test } from '@playwright/test';

test('installation page offers honest manual instructions and fits narrow screens', async ({
  page,
}) => {
  await page.goto('/instalar');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('A um toque.');
  await page.getByRole('button', { name: 'Instalar Pelmorya', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Leve para a tela inicial.' })).toBeVisible();
  await page.getByRole('button', { name: 'iPhone / iPad', exact: true }).click();
  await expect(page.getByText('Abra esta página no Safari.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Android', exact: true }).click();
  await expect(page.getByText('Abra esta página no Chrome.', { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(
    page.getByRole('button', { name: 'Instalar Pelmorya', exact: true }),
  ).toBeInViewport();
});

test('native prompt acceptance is not reported as installation until appinstalled', async ({
  page,
}) => {
  await page.goto('/instalar');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.evaluate(() => {
    window.dispatchEvent(
      Object.assign(new Event('beforeinstallprompt'), {
        prompt: () => Promise.resolve(),
        userChoice: Promise.resolve({ outcome: 'accepted' }),
      }),
    );
  });
  await expect(page.getByText('Confirme no navegador para adicionar o app.')).toBeVisible();
  await page.getByRole('button', { name: 'Instalar Pelmorya', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Instalação solicitada');
  await expect(page.getByRole('link', { name: 'Abrir minha jornada' })).toHaveCount(0);
  await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')));
  await expect(page.getByRole('link', { name: 'Abrir minha jornada' })).toBeVisible();
});

test('dismissed and failed native prompts leave usable installation instructions', async ({
  page,
}) => {
  await page.goto('/instalar');
  await page.evaluate(() => navigator.serviceWorker.ready);
  for (const outcome of ['dismissed', 'error']) {
    await page.evaluate((result) => {
      window.dispatchEvent(
        Object.assign(new Event('beforeinstallprompt'), {
          prompt: () =>
            result === 'error' ? Promise.reject(new Error('unavailable')) : Promise.resolve(),
          userChoice: Promise.resolve({ outcome: 'dismissed' }),
        }),
      );
    }, outcome);
    await expect(page.getByText('Confirme no navegador para adicionar o app.')).toBeVisible();
    await page.getByRole('button', { name: 'Instalar Pelmorya', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Leve para a tela inicial.' })).toBeVisible();
    await expect(page.getByRole('status')).toContainText(
      outcome === 'error' ? 'Não foi possível' : 'Tudo bem',
    );
  }
});

test('manifest, icons and service worker are public and offline navigation holds no account data', async ({
  page,
  context,
  request,
}) => {
  const manifest = await request.get('/manifest.webmanifest');
  expect(manifest.ok()).toBe(true);
  expect(await manifest.json()).toMatchObject({
    name: 'Pelmorya',
    display: 'standalone',
    start_url: '/journey',
  });
  const icon = await request.get('/app-icons/192');
  expect(icon.headers()['content-type']).toContain('image/png');
  expect((await icon.body()).readUInt32BE(16)).toBe(192);
  const sw = await request.get('/sw.js');
  expect(sw.headers()['cache-control']).toContain('no-store');
  await page.goto('/instalar');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  // Edge's page-level offline emulation does not cut the worker's connection.
  // Fail fetch in the actual worker to exercise its navigation fallback, without
  // changing the application worker or touching an authenticated route online.
  const worker = context.serviceWorkers().find((item) => item.url().endsWith('/sw.js'));
  expect(worker).toBeDefined();
  await worker!.evaluate(() => {
    globalThis.fetch = () => Promise.reject(new TypeError('Synthetic network failure'));
  });
  const response = await page.goto('/journey/synthetic-offline-check');
  expect(response?.fromServiceWorker()).toBe(true);
  expect(response?.status()).toBe(503);
  await expect(page.getByRole('heading')).toHaveText('Seu cuidado pode esperar a conexão.');
  expect(await page.evaluate(() => caches.keys())).toEqual([]);
});
