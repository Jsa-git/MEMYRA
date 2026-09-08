import { randomUUID } from 'node:crypto';

import { recordConsentsInputSchema } from '@memyra/validation';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { requireCurrentActor } from '../../../src/server/current-actor';
import { getDatabase } from '../../../src/server/database';

export async function GET(): Promise<Response> {
  try {
    const actor = await requireCurrentActor(await headers());
    const records = await getDatabase().consentRecord.findMany({
      where: { userId: actor.userId },
      orderBy: { createdAt: 'desc' },
      select: { type: true, version: true, accepted: true, acceptedAt: true, revokedAt: true },
    });
    return NextResponse.json({ records });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTHENTICATION_REQUIRED')
      return NextResponse.json({ code: 'AUTHENTICATION_REQUIRED' }, { status: 401 });
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const actor = await requireCurrentActor(await headers());
    const input = recordConsentsInputSchema.safeParse(await request.json());
    if (!input.success)
      return NextResponse.json({ code: 'VALIDATION_ERROR' }, { status: 400 });
    const now = new Date();
    await getDatabase().consentRecord.createMany({
      data: [...new Set(input.data.types)].map((type) => ({
        id: randomUUID(), userId: actor.userId, type, version: input.data.version,
        accepted: true, acceptedAt: now, createdAt: now,
      })),
      skipDuplicates: true,
    });
    return NextResponse.json({ accepted: true }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError)
      return NextResponse.json({ code: 'INVALID_JSON' }, { status: 400 });
    if (error instanceof Error && error.message === 'AUTHENTICATION_REQUIRED')
      return NextResponse.json({ code: 'AUTHENTICATION_REQUIRED' }, { status: 401 });
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
