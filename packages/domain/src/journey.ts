import type { SkinArea } from './skin-area';

export const JOURNEY_STATUSES = ['ACTIVE', 'COMPLETED', 'ARCHIVED'] as const;
export type JourneyStatus = (typeof JOURNEY_STATUSES)[number];
export const JOURNEY_CONTEXTS = [
  'POST_ACNE_MARK',
  'AFTER_INJURY_MARK',
  'TONE_CHANGE',
  'POST_INFLAMMATORY_MARK',
  'OTHER',
  'UNKNOWN',
] as const;
export type JourneyContext = (typeof JOURNEY_CONTEXTS)[number];
export const APPROXIMATE_AGES = [
  'LESS_THAN_ONE_MONTH',
  'ONE_TO_THREE_MONTHS',
  'THREE_TO_SIX_MONTHS',
  'SIX_TO_TWELVE_MONTHS',
  'ONE_TO_TWO_YEARS',
  'MORE_THAN_TWO_YEARS',
  'UNKNOWN',
] as const;
export type ApproximateAge = (typeof APPROXIMATE_AGES)[number];
export const JOURNEY_GOALS = [
  'EVEN_APPEARANCE',
  'REDUCE_MARK_APPEARANCE',
  'BUILD_CONSISTENT_ROUTINE',
  'TRACK_EVOLUTION',
  'OTHER',
] as const;
export type JourneyGoal = (typeof JOURNEY_GOALS)[number];

export interface Journey {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly status: JourneyStatus;
  readonly skinArea: SkinArea;
  readonly context: JourneyContext;
  readonly approximateAge: ApproximateAge;
  readonly goal: JourneyGoal;
  readonly startedAt: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/** User-controlled fields only. Ownership is supplied by the application layer. */
export interface CreateJourneyInput {
  readonly name: string;
  readonly skinArea: SkinArea;
  readonly context: JourneyContext;
  readonly approximateAge: ApproximateAge;
  readonly goal: JourneyGoal;
}
