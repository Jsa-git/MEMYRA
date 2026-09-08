import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { requireCurrentActor } from '../../../src/server/current-actor';
import { getDatabase } from '../../../src/server/database';

export async function POST(): Promise<Response> {
  try {
    const actor = await requireCurrentActor(await headers());
    await getDatabase().user.update({ where: { id: actor.userId }, data: { onboardingCompletedAt: new Date() } });
    return NextResponse.json({ completed: true });
  } catch { return NextResponse.json({ code: 'AUTHENTICATION_REQUIRED' }, { status: 401 }); }
}
