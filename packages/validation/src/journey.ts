import {
  APPROXIMATE_AGES,
  JOURNEY_CONTEXTS,
  JOURNEY_GOALS,
  JOURNEY_STATUSES,
  SKIN_AREA_REGIONS,
  SKIN_AREA_SIDES,
  isSkinAreaSideAllowed,
  type CreateJourneyInput,
} from '@memyra/domain';
import { z } from 'zod';

export const skinAreaSchema = z
  .strictObject({ region: z.enum(SKIN_AREA_REGIONS), side: z.enum(SKIN_AREA_SIDES) })
  .superRefine(({ region, side }, context) => {
    if (!isSkinAreaSideAllowed(region, side))
      context.addIssue({
        code: 'custom',
        path: ['side'],
        message: 'O lado selecionado não é válido para esta região.',
      });
  });

export const createJourneyInputSchema: z.ZodType<CreateJourneyInput> = z.strictObject({
  name: z.string().trim().min(2).max(80),
  skinArea: skinAreaSchema,
  context: z.enum(JOURNEY_CONTEXTS),
  approximateAge: z.enum(APPROXIMATE_AGES),
  goal: z.enum(JOURNEY_GOALS),
});
export type ValidatedCreateJourneyInput = z.infer<typeof createJourneyInputSchema>;
export const updateJourneyInputSchema = createJourneyInputSchema;

export const updateJourneyStatusInputSchema = z.strictObject({
  status: z.enum(JOURNEY_STATUSES),
});
export type ValidatedUpdateJourneyStatusInput = z.infer<typeof updateJourneyStatusInputSchema>;

export const journeyIdSchema = z.uuid();
