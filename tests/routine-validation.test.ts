import { describe, expect, it } from 'vitest';
import { routineCheckInInputSchema, routinePlanInputSchema } from '@memyra/validation';

describe('routine contracts', () => {
  it('accepts only explicit tracking intervals and at least one label-backed period', () => {
    expect(routinePlanInputSchema.safeParse({ durationDays: 30, photoIntervalDays: 14, periods: ['MORNING'] }).success).toBe(true);
    expect(routinePlanInputSchema.safeParse({ durationDays: 45, photoIntervalDays: 14, periods: [] }).success).toBe(false);
  });

  it('validates idempotent daily check-in coordinates', () => {
    expect(routineCheckInInputSchema.safeParse({ localDate: '2026-09-08', period: 'EVENING', completed: true }).success).toBe(true);
    expect(routineCheckInInputSchema.safeParse({ localDate: '08/09/2026', period: 'NOON', completed: true }).success).toBe(false);
  });
});
