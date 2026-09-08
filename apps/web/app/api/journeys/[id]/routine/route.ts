import { randomUUID } from 'node:crypto';
import { journeyIdSchema, routinePlanInputSchema } from '@memyra/validation';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { requireCurrentActor } from '../../../../../src/server/current-actor';
import { getDatabase } from '../../../../../src/server/database';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const actor = await requireCurrentActor(await headers());
    const id = journeyIdSchema.safeParse((await params).id);
    const input = routinePlanInputSchema.safeParse(await request.json());
    if (!id.success || !input.success) return NextResponse.json({ code: 'VALIDATION_ERROR' }, { status: 400 });
    const journey = await getDatabase().journey.findFirst({ where: { id: id.data, userId: actor.userId }, select: { id: true } });
    if (!journey) return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
    const plan = await getDatabase().routinePlan.upsert({ where: { journeyId: journey.id }, create: { id: randomUUID(), journeyId: journey.id, ...input.data }, update: input.data, select: { id: true } });
    return NextResponse.json(plan);
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ code: 'INVALID_JSON' }, { status: 400 });
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
