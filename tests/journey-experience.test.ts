import { describe, expect, it } from 'vitest';
import {
  calendarDaysBetween,
  canRecordCheckIn,
  journeyNextStep,
  trackingDate,
  trackingDay,
} from '@memyra/domain';
import { routinePlanInputSchema } from '@memyra/validation';

describe('journey experience', () => {
  const ready = {
    active: true,
    photoCount: 1,
    hasPlan: true,
    todayComplete: true,
    photoDue: false,
  };
  it('chooses exactly one next step from the real journey state', () => {
    expect(journeyNextStep(ready)).toBe('complete');
    expect(journeyNextStep({ ...ready, active: false })).toBe('inactive');
    expect(journeyNextStep({ ...ready, photoCount: 0, hasPlan: false })).toBe('photo');
    expect(journeyNextStep({ ...ready, hasPlan: false })).toBe('plan');
    expect(journeyNextStep({ ...ready, todayComplete: false })).toBe('check-in');
    expect(journeyNextStep({ ...ready, photoDue: true, todayComplete: false })).toBe('photo');
  });
  it('counts local calendar dates, not elapsed 24-hour windows', () => {
    expect(calendarDaysBetween('2026-09-16', '2026-09-16')).toBe(0);
    expect(trackingDate(new Date('2026-09-17T02:00:00Z'))).toBe('2026-09-16');
    expect(trackingDay(new Date('2026-09-17T02:59:00Z'), new Date('2026-09-17T03:01:00Z'))).toBe(2);
  });
  it('rejects future check-ins, pre-plan dates and duplicate periods', () => {
    const start = new Date('2026-09-16T12:00:00Z');
    expect(canRecordCheckIn('2026-09-17', start, start)).toBe(false);
    expect(canRecordCheckIn('2026-09-15', start, start)).toBe(false);
    expect(canRecordCheckIn('2026-09-16', start, start)).toBe(true);
    expect(
      routinePlanInputSchema.safeParse({
        durationDays: 30,
        photoIntervalDays: 7,
        periods: ['MORNING', 'MORNING'],
      }).success,
    ).toBe(false);
  });
});
