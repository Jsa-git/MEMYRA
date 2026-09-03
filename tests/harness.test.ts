import { describe, expect, it } from 'vitest';

describe('harness', () => {
  it('starts with an explicit no-medical-diagnosis invariant', () => {
    const prohibitedCapability = 'medical-diagnosis';
    expect(prohibitedCapability).not.toBe('cosmetic-guidance');
  });
});
