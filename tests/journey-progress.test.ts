import { describe, expect, it } from 'vitest';
import { calculateConsistency, calculateCycleProgress } from '../packages/domain/src/index.js';

describe('journey progress', () => {
  it('keeps cycle progress between zero and one hundred', () => {
    expect(calculateCycleProgress(15, 30)).toBe(50);
    expect(calculateCycleProgress(45, 30)).toBe(100);
    expect(calculateCycleProgress(1, 0)).toBe(0);
  });

  it('calculates consistency from expected routine moments', () => {
    expect(calculateConsistency({ completedCheckIns: 10, activeDays: 7, periodsPerDay: 2 })).toBe(
      71,
    );
    expect(calculateConsistency({ completedCheckIns: 2, activeDays: 0, periodsPerDay: 0 })).toBe(0);
    expect(calculateConsistency({ completedCheckIns: 9, activeDays: 2, periodsPerDay: 2 })).toBe(
      100,
    );
  });
});
