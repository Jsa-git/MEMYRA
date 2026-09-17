import { expect, test } from '@playwright/test';

test('Pelmorya login is readable and password visibility is reversible', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveTitle(/Pelmorya/);
  await expect(page.getByRole('heading', { name: 'Entre na Pelmorya.' })).toBeVisible();
  await expect(page.getByLabel('Senha', { exact: true })).toHaveAttribute('type', 'password');
  await page.getByRole('button', { name: 'Mostrar senha' }).click();
  await expect(page.getByLabel('Senha', { exact: true })).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Ocultar senha' }).click();
  await expect(page.getByLabel('Senha', { exact: true })).toHaveAttribute('type', 'password');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('registration documents exist and explain the development limitations', async ({ page }) => {
  await page.goto('/register');
  await expect(page.getByRole('link', { name: 'Termos de Uso' })).toHaveAttribute('href', '/terms');
  await expect(page.getByRole('link', { name: 'Política de Privacidade' })).toHaveAttribute(
    'href',
    '/privacy',
  );
  await page.goto('/privacy');
  await expect(page.getByRole('heading', { name: 'Seus registros são pessoais.' })).toBeVisible();
  await expect(page.getByText(/Documento informativo de desenvolvimento/)).toBeVisible();
  await page.goto('/terms');
  await expect(
    page.getByRole('heading', { name: 'Um acompanhamento, não um diagnóstico.' }),
  ).toBeVisible();
});
