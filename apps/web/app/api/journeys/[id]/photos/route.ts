import { randomUUID } from 'node:crypto';
import { storePhotoAttempt } from '@memyra/application';

import { journeyIdSchema, photoMetadataSchema } from '@memyra/validation';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

import { requireCurrentActor } from '../../../../../src/server/current-actor';
import { getDatabase } from '../../../../../src/server/database';
import { deletePrivatePhoto, uploadPrivatePhoto } from '../../../../../src/server/photo-storage';

const MAX_PHOTO_BYTES = 4_000_000;
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

function hasImageSignature(bytes: Uint8Array, type: string) {
  if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === 'image/png')
    return bytes
      .slice(0, 8)
      .every((value, index) => value === [137, 80, 78, 71, 13, 10, 26, 10][index]);
  return (
    type === 'image/webp' &&
    new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' &&
    new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP'
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const actor = await requireCurrentActor(await headers());
    const id = journeyIdSchema.safeParse((await params).id);
    if (!id.success) return NextResponse.json({ code: 'VALIDATION_ERROR' }, { status: 400 });
    const journey = await getDatabase().journey.findFirst({
      where: { id: id.data, userId: actor.userId },
      select: { id: true },
    });
    if (!journey) return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
    const photos = await getDatabase().photoRecord.findMany({
      where: { journeyId: id.data },
      orderBy: { capturedAt: 'desc' },
      select: {
        id: true,
        capturedAt: true,
        width: true,
        height: true,
        orientation: true,
        qualityStatus: true,
        processingStatus: true,
      },
    });
    return NextResponse.json({ photos }, { headers: { 'cache-control': 'private, no-store' } });
  } catch (error) {
    return photoError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const actor = await requireCurrentActor(await headers());
    const id = journeyIdSchema.safeParse((await params).id);
    if (!id.success) return NextResponse.json({ code: 'VALIDATION_ERROR' }, { status: 400 });
    const journey = await getDatabase().journey.findFirst({
      where: { id: id.data, userId: actor.userId },
      select: { id: true, status: true, skinArea: { select: { id: true } } },
    });
    if (!journey?.skinArea) return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 });
    if (journey.status !== 'ACTIVE')
      return NextResponse.json({ code: 'JOURNEY_NOT_ACTIVE' }, { status: 409 });
    const consent = await getDatabase().consentRecord.findFirst({
      where: { userId: actor.userId, type: 'PHOTO_PROCESSING', accepted: true, revokedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!consent) return NextResponse.json({ code: 'PHOTO_CONSENT_REQUIRED' }, { status: 403 });

    if (Number(request.headers.get('content-length')) > 4_200_000)
      return NextResponse.json({ code: 'PHOTO_TOO_LARGE' }, { status: 413 });
    const form = await request.formData();
    const file = form.get('photo');
    const metadata = photoMetadataSchema.safeParse(
      Object.fromEntries(
        [
          'uploadId',
          'capturedAt',
          'width',
          'height',
          'orientation',
          'framing',
          'distance',
          'lighting',
        ].map((key) => [key, form.get(key)]),
      ),
    );
    if (
      !(file instanceof File) ||
      !metadata.success ||
      !allowedTypes.has(file.type) ||
      file.size < 12 ||
      file.size > MAX_PHOTO_BYTES
    )
      return NextResponse.json({ code: 'INVALID_PHOTO' }, { status: 400 });
    const sourceBytes = await file.arrayBuffer();
    if (!hasImageSignature(new Uint8Array(sourceBytes).slice(0, 16), file.type))
      return NextResponse.json({ code: 'INVALID_PHOTO' }, { status: 400 });
    const capturedAt = new Date(metadata.data.capturedAt);
    if (
      capturedAt.getTime() > Date.now() + 300_000 ||
      capturedAt.getTime() < Date.now() - 604_800_000
    )
      return NextResponse.json({ code: 'INVALID_CAPTURE_TIME' }, { status: 400 });
    const existing = await getDatabase().photoRecord.findFirst({
      where: { uploadId: metadata.data.uploadId, journeyId: journey.id },
      select: { id: true },
    });
    if (existing) return NextResponse.json(existing, { status: 200 });
    const photoId = randomUUID();
    const skinAreaId = journey.skinArea.id;
    const normalized = await sharp(Buffer.from(sourceBytes), {
      failOn: 'warning',
      limitInputPixels: 40_000_000,
    })
      .rotate()
      .jpeg({ quality: 90, chromaSubsampling: '4:4:4' })
      .toBuffer({ resolveWithObject: true })
      .catch(() => null);
    if (!normalized) return NextResponse.json({ code: 'INVALID_PHOTO' }, { status: 400 });
    if (
      !normalized.info.width ||
      !normalized.info.height ||
      normalized.info.width < 320 ||
      normalized.info.height < 320
    )
      return NextResponse.json({ code: 'INVALID_PHOTO_DIMENSIONS' }, { status: 400 });
    const orientation =
      normalized.info.width === normalized.info.height
        ? 'SQUARE'
        : normalized.info.width > normalized.info.height
          ? 'LANDSCAPE'
          : 'PORTRAIT';
    const uploadedKey = `${photoId}.jpg`;
    const normalizedBytes = normalized.data.buffer.slice(
      normalized.data.byteOffset,
      normalized.data.byteOffset + normalized.data.byteLength,
    ) as ArrayBuffer;
    const photo = await storePhotoAttempt({
      upload: () => uploadPrivatePhoto(uploadedKey, normalizedBytes, 'image/jpeg'),
      insert: () =>
        getDatabase().photoRecord.create({
          data: {
            id: photoId,
            uploadId: metadata.data.uploadId,
            journeyId: journey.id,
            skinAreaId,
            capturedAt,
            storageKey: uploadedKey,
            width: normalized.info.width,
            height: normalized.info.height,
            orientation,
            framing: 'NOT_ASSESSED',
            distance: metadata.data.distance,
            lighting: 'NOT_ASSESSED',
            qualityStatus: 'ACCEPTED',
            processingStatus: 'STORED',
          },
          select: { id: true },
        }),
      removeOwnedObject: () => deletePrivatePhoto(uploadedKey),
      ownsCompleted: (result) => result.id === photoId,
      isDefiniteFailure: (error) =>
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        ['P2002', 'P2003', 'P2025'].includes(String(error.code)),
      findCompleted: () =>
        getDatabase().photoRecord.findFirst({
          where: { uploadId: metadata.data.uploadId, journeyId: journey.id },
          select: { id: true },
        }),
    });
    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    return photoError(error);
  }
}

function photoError(error: unknown): Response {
  const code = error instanceof Error ? error.message : 'INTERNAL_ERROR';
  if (code === 'AUTHENTICATION_REQUIRED') return NextResponse.json({ code }, { status: 401 });
  if (code === 'PHOTO_STORAGE_NOT_CONFIGURED') return NextResponse.json({ code }, { status: 503 });
  return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 });
}
