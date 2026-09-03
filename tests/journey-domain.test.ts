import { describe, expect, it } from 'vitest';
import { isSkinAreaSideAllowed } from '../packages/domain/src/index.js';

describe('SkinArea', () => {
  it.each(['FACE', 'NECK', 'CHEST', 'BACK'] as const)('accepts NOT_APPLICABLE for %s', (region) =>
    expect(isSkinAreaSideAllowed(region, 'NOT_APPLICABLE')).toBe(true),
  );
  it.each(['ARM', 'HAND', 'LEG'] as const)('requires LEFT or RIGHT for %s', (region) => {
    expect(isSkinAreaSideAllowed(region, 'LEFT')).toBe(true);
    expect(isSkinAreaSideAllowed(region, 'RIGHT')).toBe(true);
    expect(isSkinAreaSideAllowed(region, 'NOT_APPLICABLE')).toBe(false);
  });
  it('allows every side for OTHER', () => {
    expect(
      ['LEFT', 'RIGHT', 'NOT_APPLICABLE'].every((side) =>
        isSkinAreaSideAllowed('OTHER', side as 'LEFT' | 'RIGHT' | 'NOT_APPLICABLE'),
      ),
    ).toBe(true);
  });
});
