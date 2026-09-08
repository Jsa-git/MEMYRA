import { consentTypes } from '@memyra/domain';
import { z } from 'zod';

export const recordConsentsInputSchema = z.strictObject({
  types: z.array(z.enum(consentTypes)).min(1).max(3),
  version: z.literal('2026-09-08'),
});

export const deleteAccountInputSchema = z.strictObject({
  confirmation: z.literal('EXCLUIR MINHA CONTA'),
});
