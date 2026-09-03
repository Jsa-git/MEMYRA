import { describe, expect, it } from 'vitest';

import { POST } from '../apps/web/app/api/journeys/route';

describe('POST /api/journeys', () => {
  it('returns a stable 400 error for malformed JSON', async () => {
    const response = await POST(
      new Request('http://localhost/api/journeys', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{invalid',
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ code: 'INVALID_JSON' });
  });
});
