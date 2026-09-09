import { expect, test, type Page } from '@playwright/test';

const password = 'memyra-e2e-password';

async function register(page: Page, email: string) {
  await page.goto('/register');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(password);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  for (let step = 0; step < 2; step += 1)
    await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Começar minha jornada' }).click();
  await expect(page).toHaveURL(/\/journey\/new\?guided=1$/);
  await page.goto('/journey');
}

async function login(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/journey$/);
}

async function createJourney(page: Page, journeyName: string) {
  await page.getByRole('link', { name: 'Iniciar minha jornada' }).click();
  await page.getByText('Rosto', { exact: true }).click();
  await page.getByText('Não se aplica', { exact: true }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByText('Outra', { exact: true }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByText('Não sei informar', { exact: true }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByText('Outro objetivo cosmético', { exact: true }).click();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByLabel('Nome da jornada').fill(journeyName);
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Criar jornada' }).click();
  await expect(page).toHaveURL(/\/journey\/[0-9a-f-]+$/);
}

test('persists an owned journey across login and denies cross-user access', async ({ page }) => {
  const suffix = `${Date.now()}-${test.info().project.name}`;
  const ownerEmail = `owner-${suffix}@example.invalid`;
  const intruderEmail = `intruder-${suffix}@example.invalid`;
  const journeyName = `Jornada E2E ${suffix}`;

  await register(page, ownerEmail);
  await expect(
    page.getByRole('heading', { name: 'Sua jornada começa com um primeiro registro.' }),
  ).toBeVisible();
  await createJourney(page, journeyName);
  await expect(page.getByRole('heading', { name: journeyName })).toBeVisible();

  const journeyUrl = new URL(page.url());
  const journeyId = journeyUrl.pathname.split('/').at(-1)!;
  await page.reload();
  await expect(page.getByRole('heading', { name: journeyName })).toBeVisible();
  await page.getByRole('link', { name: 'Suas jornadas' }).click();
  await expect(page.getByText(journeyName, { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Sair' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/journey');
  await expect(page).toHaveURL(/\/login$/);
  const unauthenticatedCreate = await page.request.post('/api/journeys', {
    data: {
      name: 'Não deve existir',
      skinArea: { region: 'FACE', side: 'LEFT' },
      context: 'OTHER',
      approximateAge: 'UNKNOWN',
      goal: 'OTHER',
    },
  });
  expect(unauthenticatedCreate.status()).toBe(401);
  expect(await unauthenticatedCreate.json()).toEqual({ code: 'AUTHENTICATION_REQUIRED' });

  await register(page, intruderEmail);
  await page.goto(journeyUrl.pathname);
  await expect(page.getByRole('heading', { name: /não foi encontrada/i })).toBeVisible();

  const crossUserPatch = await page.request.patch(`/api/journeys/${journeyId}`, {
    data: { status: 'COMPLETED' },
  });
  expect(crossUserPatch.status()).toBe(404);
  expect(await crossUserPatch.json()).toEqual({ code: 'NOT_FOUND' });

  await page.getByRole('button', { name: 'Sair' }).click();
  await login(page, ownerEmail);
  await expect(page.getByText(journeyName, { exact: true })).toBeVisible();
  await page.getByText(journeyName, { exact: true }).click();
  await expect(page.getByRole('heading', { name: journeyName })).toBeVisible();

  await page.getByRole('link', { name: 'Editar informações' }).click();
  await page.getByLabel('Nome').fill(`${journeyName} editada`);
  await page.getByRole('button', { name: 'Salvar alterações' }).click();
  await expect(page.getByRole('heading', { name: `${journeyName} editada` })).toBeVisible();
  await page.getByRole('button', { name: 'Arquivar jornada' }).click();
  await expect(page.getByRole('button', { name: 'Reativar jornada' })).toBeVisible();

  await page.getByRole('link', { name: 'Ajustes' }).click();
  await expect(page.getByText('Termos de uso')).toBeVisible();
  await expect(page.getByText('Política de privacidade')).toBeVisible();
});
