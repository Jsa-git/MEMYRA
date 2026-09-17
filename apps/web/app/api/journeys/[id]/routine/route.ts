import { randomUUID } from 'node:crypto';
import { journeyIdSchema, routinePlanInputSchema } from '@memyra/validation';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { requireCurrentActor } from '../../../../../src/server/current-actor';
import { getDatabase } from '../../../../../src/server/database';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const actor = await requireCurrentActor(await headers());
    const id = journeyIdSchema.safeParse((await params).id);
    const input = routinePlanInputSchema.safeParse(await request.json());
    if (!id.success || !input.success)
      return NextResponse.json({ code: 'VALIDATION_ERROR' }, { status: 400 });
    const journey = await getDatabase().journey.findFirst({
      where: { id: id.data, userId: actor.userId },
      select: { id: true, status: true },
    });
    if (!journey) return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
    if (journey.status !== 'ACTIVE')
      return NextResponse.json({ code: 'JOURNEY_NOT_ACTIVE' }, { status: 409 });
    const current = await getDatabase().routinePlan.findUnique({
      where: { journeyId: journey.id },
      select: { periods: true, durationDays: true, photoIntervalDays: true },
    });
    if (
      current &&
      (current.durationDays !== input.data.durationDays ||
        current.photoIntervalDays !== input.data.photoIntervalDays ||
        [...current.periods].sort().join(',') !== [...input.data.periods].sort().join(','))
    )
      return NextResponse.json({ code: 'PLAN_CHANGE_REQUIRES_NEW_CYCLE' }, { status: 409 });
    const plan = current
      ? await getDatabase().routinePlan.findUnique({
          where: { journeyId: journey.id },
          select: { id: true },
        })
      : await getDatabase().routinePlan.create({
          data: { id: randomUUID(), journeyId: journey.id, ...input.data },
          select: { id: true },
        });
    return NextResponse.json(plan);
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002')
      return NextResponse.json({ code: 'PLAN_ALREADY_EXISTS' }, { status: 409 });
    if (error instanceof Error && error.message === 'AUTHENTICATION_REQUIRED')
      return NextResponse.json({ code: 'AUTHENTICATION_REQUIRED' }, { status: 401 });
    if (error instanceof SyntaxError)
      return NextResponse.json({ code: 'INVALID_JSON' }, { status: 400 });
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
