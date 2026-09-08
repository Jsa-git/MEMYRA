import { describe, expect, it } from 'vitest';
import { photoMetadataSchema } from '@memyra/validation';

const valid = {
  uploadId: 'a73d532b-eab0-4c18-b532-7919e6e86d74',
  capturedAt: '2026-09-08T18:00:00.000Z',
  width: '1200',
  height: '1600',
  orientation: 'PORTRAIT',
  framing: 'CENTERED',
  distance: 'CLOSE',
  lighting: 'EVEN',
};

describe('photo metadata validation', () => {
  it('accepts only the minimized capture contract', () => {
    expect(photoMetadataSchema.parse(valid)).toMatchObject({ width: 1200, height: 1600 });
  });

  it('rejects GPS, unknown metadata and unsafe dimensions', () => {
    expect(photoMetadataSchema.safeParse({ ...valid, latitude: -23.5 }).success).toBe(false);
    expect(photoMetadataSchema.safeParse({ ...valid, width: '12001' }).success).toBe(false);
    const withoutIdempotencyKey: Partial<typeof valid> = { ...valid };
    delete withoutIdempotencyKey.uploadId;
    expect(photoMetadataSchema.safeParse(withoutIdempotencyKey).success).toBe(false);
  });
});
