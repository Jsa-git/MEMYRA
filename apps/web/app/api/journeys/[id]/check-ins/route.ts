import { randomUUID } from 'node:crypto';
import { canRecordCheckIn } from '@memyra/domain';
import { journeyIdSchema, routineCheckInInputSchema } from '@memyra/validation';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { requireCurrentActor } from '../../../../../src/server/current-actor';
import { getDatabase } from '../../../../../src/server/database';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const actor = await requireCurrentActor(await headers());
    const id = journeyIdSchema.safeParse((await params).id);
    const input = routineCheckInInputSchema.safeParse(await request.json());
    if (!id.success || !input.success)
      return NextResponse.json({ code: 'VALIDATION_ERROR' }, { status: 400 });
    const plan = await getDatabase().routinePlan.findFirst({
      where: { journeyId: id.data, journey: { userId: actor.userId, status: 'ACTIVE' } },
      select: { id: true, periods: true, createdAt: true },
    });
    if (!plan) return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
    if (!canRecordCheckIn(input.data.localDate, plan.createdAt, new Date()))
      return NextResponse.json({ code: 'INVALID_CHECK_IN_DATE' }, { status: 400 });
    if (!plan.periods.includes(input.data.period))
      return NextResponse.json({ code: 'PERIOD_NOT_IN_PLAN' }, { status: 409 });
    const checkIn = await getDatabase().routineCheckIn.upsert({
      where: {
        routinePlanId_localDate_period: {
          routinePlanId: plan.id,
          localDate: input.data.localDate,
          period: input.data.period,
        },
      },
      create: { id: randomUUID(), routinePlanId: plan.id, ...input.data },
      update: { completed: input.data.completed },
      select: { id: true, completed: true },
    });
    return NextResponse.json(checkIn);
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTHENTICATION_REQUIRED')
      return NextResponse.json({ code: 'AUTHENTICATION_REQUIRED' }, { status: 401 });
    if (error instanceof SyntaxError)
      return NextResponse.json({ code: 'INVALID_JSON' }, { status: 400 });
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
