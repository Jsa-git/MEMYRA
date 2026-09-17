import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { requireCurrentActor } from '../../../src/server/current-actor';
import { getDatabase } from '../../../src/server/database';

export async function GET(): Promise<Response> {
  try {
    const actor = await requireCurrentActor(await headers());
    const user = await getDatabase().user.findUnique({
      where: { id: actor.userId },
      select: { onboardingCompletedAt: true },
    });
    if (!user) return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
    const pendingJourney = await getDatabase().journey.findFirst({
      where: { userId: actor.userId, status: 'ACTIVE', photos: { none: {} } },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
    const resumePath = !user.onboardingCompletedAt
      ? '/onboarding'
      : pendingJourney
        ? `/journey/${pendingJourney.id}/start`
        : '/journey';
    return NextResponse.json(
      { onboardingCompleted: Boolean(user.onboardingCompletedAt), resumePath },
      { headers: { 'cache-control': 'private, no-store' } },
    );
  } catch {
    return NextResponse.json({ code: 'AUTHENTICATION_REQUIRED' }, { status: 401 });
  }
}
