import { describe, expect, it, vi } from 'vitest';

import {
  mapJourney,
  PrismaJourneyRepository,
  type JourneyPrismaClient,
} from './journey-repository';

const row = {
  id: '10000000-0000-4000-8000-000000000001',
  userId: '00000000-0000-4000-8000-000000000001',
  name: 'Minha jornada',
  status: 'ACTIVE',
  context: 'POST_ACNE_MARK',
  approximateAge: 'ONE_TO_THREE_MONTHS',
  goal: 'TRACK_EVOLUTION',
  startedAt: new Date('2026-09-02T10:00:00Z'),
  createdAt: new Date('2026-09-02T10:00:00Z'),
  updatedAt: new Date('2026-09-02T10:00:00Z'),
  skinArea: { bodyRegion: 'FACE', side: 'LEFT' },
};

describe('PrismaJourneyRepository', () => {
  it('maps the persistence row into the domain model', () => {
    expect(mapJourney(row)).toMatchObject({
      id: row.id,
      context: 'POST_ACNE_MARK',
      skinArea: { region: 'FACE', side: 'LEFT' },
    });
  });

  it('always scopes lookup by journey and owner', async () => {
    const findFirst = vi.fn().mockResolvedValue(row);
    const repository = new PrismaJourneyRepository({
      journey: { create: vi.fn(), findFirst },
    } as unknown as JourneyPrismaClient);

    await repository.findByIdForUser(row.id, row.userId);

    expect(findFirst).toHaveBeenCalledWith({
      where: { id: row.id, userId: row.userId },
      include: { skinArea: true },
    });
  });

  it('always scopes lists by owner', async () => {
    const findMany = vi.fn().mockResolvedValue([row]);
    const repository = new PrismaJourneyRepository({
      journey: { findMany },
    } as unknown as JourneyPrismaClient);

    await repository.listForUser(row.userId);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: row.userId } }),
    );
  });

  it('updates only when both journey and owner match', async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 0 });
    const transaction = vi.fn((operation: (client: unknown) => unknown) =>
      Promise.resolve(operation({ journey: { updateMany, findFirst: vi.fn() } })),
    );
    const repository = new PrismaJourneyRepository({
      journey: {},
      $transaction: transaction,
    } as unknown as JourneyPrismaClient);

    await expect(
      repository.updateStatusForUser(row.id, 'another-user', 'COMPLETED', row.updatedAt),
    ).resolves.toBeNull();
    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: row.id, userId: 'another-user' } }),
    );
  });
});
