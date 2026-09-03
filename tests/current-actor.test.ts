import { beforeEach, describe, expect, it, vi } from 'vitest';

const getSession = vi.fn();

vi.mock('../apps/web/src/server/auth', () => ({
  getAuth: () => ({ api: { getSession } }),
}));

import { getCurrentActor, requireCurrentActor } from '../apps/web/src/server/current-actor';

describe('authenticated actor resolution', () => {
  beforeEach(() => getSession.mockReset());

  it('derives ownership only from a valid server session', async () => {
    getSession.mockResolvedValue({ user: { id: 'authenticated-user' }, session: {} });
    const headers = new Headers({ cookie: 'session=opaque' });

    await expect(getCurrentActor(headers)).resolves.toEqual({ userId: 'authenticated-user' });
    expect(getSession).toHaveBeenCalledWith({ headers });
  });

  it('returns null for an invalid session', async () => {
    getSession.mockResolvedValue(null);
    await expect(getCurrentActor(new Headers())).resolves.toBeNull();
  });

  it('rejects a protected operation without a session', async () => {
    getSession.mockResolvedValue(null);
    await expect(requireCurrentActor(new Headers())).rejects.toThrow('AUTHENTICATION_REQUIRED');
  });
});
