import { createJourney } from '@memyra/application';
import { createJourneyInputSchema } from '@memyra/validation';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { requireCurrentActor } from '../../../src/server/current-actor';
import { getJourneyServices } from '../../../src/server/journey-services';

export async function POST(request: Request) {
  try {
    const input: unknown = await request.json();
    const parsed = createJourneyInputSchema.safeParse(input);
    if (!parsed.success) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', issues: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const journey = await createJourney(
      await requireCurrentActor(await headers()),
      parsed.data,
      getJourneyServices(),
    );
    return NextResponse.json({ id: journey.id }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ code: 'INVALID_JSON' }, { status: 400 });
    }
    const code = error instanceof Error ? error.message : 'INTERNAL_ERROR';
    if (code === 'AUTHENTICATION_REQUIRED') {
      return NextResponse.json({ code }, { status: 401 });
    }
    if (code === 'DATABASE_NOT_CONFIGURED') {
      return NextResponse.json({ code }, { status: 503 });
    }
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
