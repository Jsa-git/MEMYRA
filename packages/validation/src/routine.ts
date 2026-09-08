import { PHOTO_INTERVALS, ROUTINE_PERIODS, TRACKING_DURATIONS } from '@memyra/domain';
import { z } from 'zod';

export const routinePlanInputSchema = z.strictObject({
  durationDays: z.union(TRACKING_DURATIONS.map((value) => z.literal(value))),
  photoIntervalDays: z.union(PHOTO_INTERVALS.map((value) => z.literal(value))),
  periods: z.array(z.enum(ROUTINE_PERIODS)).min(1).max(2),
});

export const routineCheckInInputSchema = z.strictObject({
  localDate: z.iso.date(),
  period: z.enum(ROUTINE_PERIODS),
  completed: z.boolean(),
});
