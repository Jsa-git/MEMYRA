import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { requireCurrentActor } from '../../../src/server/current-actor';
import { getDatabase } from '../../../src/server/database';

export async function GET(): Promise<Response> {
  try {
    const actor = await requireCurrentActor(await headers());
    const user = await getDatabase().user.findUnique({ where: { id: actor.userId }, select: { onboardingCompletedAt: true } });
    if (!user) return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
    return NextResponse.json({ onboardingCompleted: Boolean(user.onboardingCompletedAt) }, { headers: { 'cache-control': 'private, no-store' } });
  } catch { return NextResponse.json({ code: 'AUTHENTICATION_REQUIRED' }, { status: 401 }); }
}
