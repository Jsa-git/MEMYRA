import { describe, expect, it, vi } from 'vitest';

import { createJourney, getJourney, listJourneys, updateJourneyStatus } from '@memyra/application';
import type { Journey, JourneyRepository } from '@memyra/domain';

const input = {
  name: '  Minha jornada  ',
  skinArea: { region: 'FACE', side: 'LEFT' },
  context: 'POST_ACNE_MARK',
  approximateAge: 'ONE_TO_THREE_MONTHS',
  goal: 'TRACK_EVOLUTION',
} as const;

describe('Journey application', () => {
  function repository(overrides: Partial<JourneyRepository> = {}): JourneyRepository {
    return {
      create: vi.fn(),
      findByIdForUser: vi.fn(),
      listForUser: vi.fn().mockResolvedValue([]),
      updateStatusForUser: vi.fn(),
      ...overrides,
    };
  }

  it('injects ownership, ids and timestamps on the server', async () => {
    const create = vi.fn((journey: Journey) => Promise.resolve(journey));
    const journeyRepository = repository({ create });
    const now = new Date('2026-09-02T12:00:00.000Z');

    const journey = await createJourney({ userId: 'server-user' }, input, {
      repository: journeyRepository,
      createId: () => 'journey-id',
      now: () => now,
    });

    expect(journey).toMatchObject({
      id: 'journey-id',
      userId: 'server-user',
      name: 'Minha jornada',
      status: 'ACTIVE',
      startedAt: now,
    });
    expect(create).toHaveBeenCalledOnce();
  });

  it('always scopes reads to the current actor', async () => {
    const findByIdForUser = vi.fn(() => Promise.resolve(null));
    const journeyRepository = repository({ findByIdForUser });

    await expect(
      getJourney({ userId: 'owner-id' }, 'journey-id', journeyRepository),
    ).resolves.toBeNull();
    expect(findByIdForUser).toHaveBeenCalledWith('journey-id', 'owner-id');
  });

  it('always scopes lists to the current actor', async () => {
    const listForUser = vi.fn().mockResolvedValue([]);
    await listJourneys({ userId: 'owner-id' }, repository({ listForUser }));
    expect(listForUser).toHaveBeenCalledWith('owner-id');
  });

  it('always scopes updates to the current actor', async () => {
    const updateStatusForUser = vi.fn().mockResolvedValue(null);
    const now = new Date('2026-09-03T12:00:00.000Z');

    await updateJourneyStatus(
      { userId: 'owner-id' },
      'journey-id',
      'COMPLETED',
      repository({ updateStatusForUser }),
      () => now,
    );

    expect(updateStatusForUser).toHaveBeenCalledWith('journey-id', 'owner-id', 'COMPLETED', now);
  });
});
