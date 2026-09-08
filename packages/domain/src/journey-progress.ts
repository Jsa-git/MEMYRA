export function calculateCycleProgress(day: number, durationDays: number) {
  if (durationDays <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((Math.max(1, day) / durationDays) * 100)));
}

export function calculateConsistency(input: {
  completedCheckIns: number;
  activeDays: number;
  periodsPerDay: number;
}) {
  const expected = Math.max(0, input.activeDays) * Math.max(0, input.periodsPerDay);
  if (expected === 0) return 0;
  return Math.min(100, Math.max(0, Math.round((input.completedCheckIns / expected) * 100)));
}
