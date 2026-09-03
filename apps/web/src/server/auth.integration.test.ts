import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createPrismaClient, type PrismaClient } from '@memyra/database';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const describeDatabase = testDatabaseUrl ? describe : describe.skip;

describeDatabase('Better Auth with PostgreSQL', () => {
  const origin = 'http://127.0.0.1:3000';
  const email = `auth-${crypto.randomUUID()}@example.invalid`;
  const password = 'memyra-test-password-2026';
  let prisma: PrismaClient;
  let auth: Awaited<ReturnType<typeof loadAuth>>;
  let sessionCookie = '';

  async function loadAuth() {
    process.env.DATABASE_URL = testDatabaseUrl!;
    process.env.BETTER_AUTH_URL = origin;
    process.env.BETTER_AUTH_SECRET = 'integration-only-secret-at-least-32-characters';
    const { getAuth } = await import('./auth');
    return getAuth();
  }

  async function authRequest(path: string, init: RequestInit = {}) {
    const requestHeaders = new Headers(init.headers);
    requestHeaders.set('content-type', 'application/json');
    requestHeaders.set('origin', origin);
    return auth.handler(
      new Request(`${origin}/api/auth/${path}`, {
        ...init,
        headers: requestHeaders,
      }),
    );
  }

  function cookieFrom(response: Response): string {
    const setCookies = response.headers.getSetCookie();
    if (setCookies.length === 0) throw new Error('Expected Better Auth to issue a session cookie.');
    return setCookies.map((value) => value.split(';', 1)[0]).join('; ');
  }

  beforeAll(async () => {
    if (!testDatabaseUrl) return;
    prisma = createPrismaClient(testDatabaseUrl);
    auth = await loadAuth();
  });

  afterAll(async () => {
    if (!testDatabaseUrl || !prisma) return;
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (user) await prisma.user.delete({ where: { id: user.id } });
    await prisma.$disconnect();
  });

  it('signs up and persists a server-side session', async () => {
    const response = await authRequest('sign-up/email', {
      method: 'POST',
      body: JSON.stringify({ name: 'Pessoa de teste', email, password }),
    });
    expect(response.status).toBe(200);
    sessionCookie = cookieFrom(response);

    const sessionResponse = await authRequest('get-session', {
      headers: { cookie: sessionCookie },
    });
    const session = (await sessionResponse.json()) as { user?: { email?: string } } | null;
    expect(session?.user?.email).toBe(email);
    await expect(prisma.session.count({ where: { user: { email } } })).resolves.toBe(1);
  });

  it('logs out and rejects reuse of the revoked session', async () => {
    const logout = await authRequest('sign-out', {
      method: 'POST',
      headers: { cookie: sessionCookie },
      body: '{}',
    });
    expect(logout.status).toBe(200);

    const revoked = await authRequest('get-session', { headers: { cookie: sessionCookie } });
    expect(await revoked.json()).toBeNull();
  });

  it('logs in again and creates a new persistent session', async () => {
    const login = await authRequest('sign-in/email', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    expect(login.status).toBe(200);

    const cookie = cookieFrom(login);
    const sessionResponse = await authRequest('get-session', { headers: { cookie } });
    const session = (await sessionResponse.json()) as { user?: { email?: string } } | null;
    expect(session?.user?.email).toBe(email);
  });
});
