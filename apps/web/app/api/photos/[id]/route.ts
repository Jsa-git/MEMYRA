import { journeyIdSchema } from '@memyra/validation';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { requireCurrentActor } from '../../../../src/server/current-actor';
import { getDatabase } from '../../../../src/server/database';
import { deletePrivatePhoto } from '../../../../src/server/photo-storage';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const actor = await requireCurrentActor(await headers());
    const id = journeyIdSchema.safeParse((await params).id);
    if (!id.success) return NextResponse.json({ code: 'VALIDATION_ERROR' }, { status: 400 });
    const photo = await getDatabase().photoRecord.findFirst({ where: { id: id.data, journey: { userId: actor.userId } }, select: { id: true, storageKey: true } });
    if (!photo) return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
    await deletePrivatePhoto(photo.storageKey);
    await getDatabase().photoRecord.delete({ where: { id: photo.id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'INTERNAL_ERROR';
    if (code === 'AUTHENTICATION_REQUIRED') return NextResponse.json({ code }, { status: 401 });
    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
