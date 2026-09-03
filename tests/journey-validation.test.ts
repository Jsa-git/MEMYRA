import { describe, expect, it } from 'vitest';
import {
  createJourneyInputSchema,
  updateJourneyStatusInputSchema,
} from '../packages/validation/src/index.js';

const validInput = {
  name: 'Minha jornada',
  skinArea: { region: 'FACE', side: 'NOT_APPLICABLE' },
  context: 'POST_ACNE_MARK',
  approximateAge: 'THREE_TO_SIX_MONTHS',
  goal: 'TRACK_EVOLUTION',
} as const;

describe('createJourneyInputSchema', () => {
  it('accepts controlled fields and trims name', () =>
    expect(createJourneyInputSchema.parse({ ...validInput, name: '  Minha jornada  ' }).name).toBe(
      'Minha jornada',
    ));
  it.each(['A', 'A'.repeat(81)])('rejects invalid name length', (name) =>
    expect(createJourneyInputSchema.safeParse({ ...validInput, name }).success).toBe(false),
  );
  it('rejects incoherent side', () =>
    expect(
      createJourneyInputSchema.safeParse({
        ...validInput,
        skinArea: { region: 'ARM', side: 'NOT_APPLICABLE' },
      }).success,
    ).toBe(false));
  it('rejects userId', () =>
    expect(
      createJourneyInputSchema.safeParse({ ...validInput, userId: 'other-user' }).success,
    ).toBe(false));
  it('rejects free notes', () =>
    expect(
      createJourneyInputSchema.safeParse({ ...validInput, notes: 'texto livre' }).success,
    ).toBe(false));
});

describe('updateJourneyStatusInputSchema', () => {
  it('accepts a known status without ownership fields', () =>
    expect(updateJourneyStatusInputSchema.parse({ status: 'COMPLETED' })).toEqual({
      status: 'COMPLETED',
    }));

  it('rejects client-supplied ownership', () =>
    expect(
      updateJourneyStatusInputSchema.safeParse({ status: 'COMPLETED', userId: 'other-user' })
        .success,
    ).toBe(false));
});
