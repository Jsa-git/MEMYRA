export const TRACKING_TIME_ZONE = 'America/Sao_Paulo';

export function trackingDate(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TRACKING_TIME_ZONE }).format(date);
}

export function calendarDaysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000);
}

export function trackingDay(start: Date, now: Date): number {
  return Math.max(1, calendarDaysBetween(trackingDate(start), trackingDate(now)) + 1);
}

export function canRecordCheckIn(date: string, planCreatedAt: Date, now: Date): boolean {
  return date >= trackingDate(planCreatedAt) && date <= trackingDate(now);
}

export type JourneyNextStep = 'inactive' | 'photo' | 'plan' | 'check-in' | 'complete';

export function journeyNextStep(input: {
  active: boolean;
  photoCount: number;
  hasPlan: boolean;
  todayComplete: boolean;
  photoDue: boolean;
}): JourneyNextStep {
  if (!input.active) return 'inactive';
  if (!input.photoCount) return 'photo';
  if (!input.hasPlan) return 'plan';
  if (input.photoDue) return 'photo';
  if (!input.todayComplete) return 'check-in';
  return 'complete';
}
