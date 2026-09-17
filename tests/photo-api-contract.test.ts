import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  actor: vi.fn(),
  journey: vi.fn(),
  consent: vi.fn(),
  photo: vi.fn(),
  upload: vi.fn(),
  remove: vi.fn(),
}));
vi.mock('../apps/web/node_modules/next/headers.js', () => ({
  headers: () => Promise.resolve(new Headers()),
}));
vi.mock('../apps/web/src/server/current-actor', () => ({ requireCurrentActor: mocks.actor }));
vi.mock('../apps/web/src/server/database', () => ({
  getDatabase: () => ({
    journey: { findFirst: mocks.journey },
    consentRecord: { findFirst: mocks.consent },
    photoRecord: { findFirst: mocks.photo },
  }),
}));
vi.mock('../apps/web/src/server/photo-storage', () => ({
  uploadPrivatePhoto: mocks.upload,
  deletePrivatePhoto: mocks.remove,
}));
import { POST } from '../apps/web/app/api/journeys/[id]/photos/route';

const id = 'a73d532b-eab0-4c18-b532-7919e6e86d74';
const context = { params: Promise.resolve({ id }) };
function request() {
  const data = new FormData();
  for (const [key, value] of Object.entries({
    uploadId: id,
    capturedAt: new Date().toISOString(),
    width: '640',
    height: '480',
    orientation: 'LANDSCAPE',
    distance: 'CLOSE',
    framing: 'NOT_ASSESSED',
    lighting: 'NOT_ASSESSED',
  }))
    data.set(key, value);
  data.set(
    'photo',
    new File(
      [new Uint8Array([255, 216, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])],
      'invalid.jpg',
      { type: 'image/jpeg' },
    ),
  );
  return new Request('http://localhost/api/journeys/' + id + '/photos', {
    method: 'POST',
    body: data,
  });
}
describe('photo API boundary (no database/storage connection)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.actor.mockResolvedValue({ userId: 'owner' });
    mocks.journey.mockResolvedValue({ id, status: 'ACTIVE', skinArea: { id } });
    mocks.consent.mockResolvedValue({ id });
    mocks.photo.mockResolvedValue(null);
  });
  it('rejects unauthenticated access before reading an image', async () => {
    mocks.actor.mockRejectedValue(new Error('AUTHENTICATION_REQUIRED'));
    expect((await POST(request(), context)).status).toBe(401);
    expect(mocks.upload).not.toHaveBeenCalled();
  });
  it('does not disclose or mutate another person’s journey', async () => {
    mocks.journey.mockResolvedValue(null);
    expect((await POST(request(), context)).status).toBe(404);
    expect(mocks.upload).not.toHaveBeenCalled();
  });
  it('requires photo consent', async () => {
    mocks.consent.mockResolvedValue(null);
    expect((await POST(request(), context)).status).toBe(403);
    expect(mocks.upload).not.toHaveBeenCalled();
  });
  it('reports a corrupt JPEG as invalid input, not internal failure', async () => {
    const response = await POST(request(), context);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ code: 'INVALID_PHOTO' });
    expect(mocks.upload).not.toHaveBeenCalled();
    expect(mocks.remove).not.toHaveBeenCalled();
  });
  it('returns the existing record on a repeated operation', async () => {
    mocks.photo.mockResolvedValue({ id: 'existing' });
    const response = await POST(request(), context);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: 'existing' });
    expect(mocks.upload).not.toHaveBeenCalled();
  });
});
