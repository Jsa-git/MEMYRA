import { describe, expect, it } from 'vitest';
import { PHOTO_ORIENTATIONS, PHOTO_PROCESSING_STATUSES, PHOTO_QUALITY_STATUSES } from '@memyra/domain';

describe('photo lifecycle vocabulary', () => {
  it('keeps capture and processing states explicit', () => {
    expect(PHOTO_ORIENTATIONS).toEqual(['PORTRAIT', 'LANDSCAPE', 'SQUARE']);
    expect(PHOTO_QUALITY_STATUSES).toContain('REJECTED');
    expect(PHOTO_PROCESSING_STATUSES).toContain('DELETED');
  });
});
