import { updateJourneyStatus } from '@memyra/application';
import { journeyIdSchema, updateJourneyStatusInputSchema } from '@memyra/validation';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { requireCurrentActor } from '../../../../src/server/current-actor';
import { getJourneyServices } from '../../../../src/server/journey-services';

export async function PATCH(
  request: Request,
  { params }: Readonly<{ params: Promise<{ id: string }> }>,
) {
  try {
    const actor = await requireCurrentActor(await headers());
    const id = journeyIdSchema.safeParse((await params).id);
    const input = updateJourneyStatusInputSchema.safeParse(await request.json());
    if (!id.success || !input.success) {
      return NextResponse.json({ code: 'VALIDATION_ERROR' }, { status: 400 });
    }

    const services = getJourneyServices();
    const journey = await updateJourneyStatus(
      actor,
      id.data,
      input.data.status,
      services.repository,
      services.now,
    );
    if (!journey) return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });

    return NextResponse.json({ id: journey.id, status: journey.status });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ code: 'INVALID_JSON' }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'AUTHENTICATION_REQUIRED') {
      return NextResponse.json({ code: 'AUTHENTICATION_REQUIRED' }, { status: 401 });
    }
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
