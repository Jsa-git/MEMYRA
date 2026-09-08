export const ROUTINE_PERIODS = ['MORNING', 'EVENING'] as const;
export type RoutinePeriod = (typeof ROUTINE_PERIODS)[number];
export const TRACKING_DURATIONS = [30, 60, 90] as const;
export const PHOTO_INTERVALS = [7, 14, 30] as const;

export interface RoutinePlan {
  readonly id: string;
  readonly journeyId: string;
  readonly durationDays: number;
  readonly photoIntervalDays: number;
  readonly periods: readonly RoutinePeriod[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
