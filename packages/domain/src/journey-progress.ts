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

export function calculateRoutineStreak(completedDates: readonly string[], today: string) {
  const completed = new Set(completedDates);
  const date = new Date(`${today}T12:00:00Z`);
  if (!completed.has(today)) date.setUTCDate(date.getUTCDate() - 1);
  let streak = 0;
  while (completed.has(date.toISOString().slice(0, 10))) {
    streak += 1;
    date.setUTCDate(date.getUTCDate() - 1);
  }
  return streak;
}
