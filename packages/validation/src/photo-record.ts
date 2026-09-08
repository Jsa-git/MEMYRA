import { PHOTO_ORIENTATIONS } from '@memyra/domain';
import { z } from 'zod';

export const photoMetadataSchema = z.strictObject({
  capturedAt: z.iso.datetime({ offset: true }),
  width: z.coerce.number().int().min(320).max(12000),
  height: z.coerce.number().int().min(320).max(12000),
  orientation: z.enum(PHOTO_ORIENTATIONS),
  framing: z.literal('CENTERED'),
  distance: z.enum(['CLOSE', 'MEDIUM']),
  lighting: z.literal('EVEN'),
});
