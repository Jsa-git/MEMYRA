import { deleteAccountInputSchema } from '@memyra/validation';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { requireCurrentActor } from '../../../src/server/current-actor';
import { getDatabase } from '../../../src/server/database';

export async function DELETE(request: Request) {
  try {
    const actor = await requireCurrentActor(await headers());
    const input = deleteAccountInputSchema.safeParse(await request.json());
    if (!input.success)
      return NextResponse.json({ code: 'CONFIRMATION_REQUIRED' }, { status: 400 });
    const result = await getDatabase().user.deleteMany({ where: { id: actor.userId } });
    if (result.count !== 1) return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof SyntaxError)
      return NextResponse.json({ code: 'INVALID_JSON' }, { status: 400 });
    if (error instanceof Error && error.message === 'AUTHENTICATION_REQUIRED')
      return NextResponse.json({ code: 'AUTHENTICATION_REQUIRED' }, { status: 401 });
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
