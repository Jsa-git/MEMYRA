import { randomUUID } from 'node:crypto';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createPrismaClient, type PrismaClient } from './client';
import { PrismaJourneyRepository } from './journey-repository';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const describeDatabase = testDatabaseUrl ? describe : describe.skip;

describeDatabase('PrismaJourneyRepository with PostgreSQL', () => {
  let prisma: PrismaClient;
  const userId = randomUUID();
  const otherUserId = randomUUID();

  beforeAll(async () => {
    if (!testDatabaseUrl) return;
    prisma = createPrismaClient(testDatabaseUrl);
    await prisma.user.create({
      data: {
        id: userId,
        name: 'Usuário de integração',
        email: `integration-${userId}@memyra.example.invalid`,
      },
    });
    await prisma.user.create({
      data: {
        id: otherUserId,
        name: 'Outro usuário de integração',
        email: `integration-${otherUserId}@memyra.example.invalid`,
      },
    });
  });

  afterAll(async () => {
    if (!testDatabaseUrl || !prisma) return;
    await prisma.journey.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: { in: [userId, otherUserId] } } });
    await prisma.$disconnect();
  });

  it('creates and reloads a journey for its owner', async () => {
    const repository = new PrismaJourneyRepository(prisma);
    const now = new Date();
    const created = await repository.create({
      id: randomUUID(),
      userId,
      name: 'Jornada de integração',
      status: 'ACTIVE',
      skinArea: { region: 'FACE', side: 'LEFT' },
      context: 'POST_ACNE_MARK',
      approximateAge: 'ONE_TO_THREE_MONTHS',
      goal: 'TRACK_EVOLUTION',
      startedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    await expect(repository.findByIdForUser(created.id, userId)).resolves.toEqual(created);
    await expect(repository.findByIdForUser(created.id, randomUUID())).resolves.toBeNull();
    await expect(repository.listForUser(userId)).resolves.toEqual([created]);
    await expect(repository.listForUser(otherUserId)).resolves.toEqual([]);

    const second = await repository.create({
      ...created,
      id: randomUUID(),
      name: 'Segunda jornada de integração',
      skinArea: { region: 'ARM', side: 'RIGHT' },
      createdAt: new Date(now.getTime() + 1_000),
      updatedAt: new Date(now.getTime() + 1_000),
    });
    await expect(repository.listForUser(userId)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: created.id }),
        expect.objectContaining({ id: second.id }),
      ]),
    );
    await expect(
      repository.updateStatusForUser(created.id, otherUserId, 'COMPLETED', new Date()),
    ).resolves.toBeNull();
    await expect(repository.findByIdForUser(created.id, userId)).resolves.toMatchObject({
      status: 'ACTIVE',
    });
  });

  it('cascades user deletion through journeys, skin areas and consents', async () => {
    const cascadeUserId = randomUUID();
    const journeyId = randomUUID();
    await prisma.user.create({
      data: {
        id: cascadeUserId,
        name: 'Cascade test',
        email: `cascade-${cascadeUserId}@example.invalid`,
        journeys: {
          create: {
            id: journeyId,
            name: 'Jornada descartável',
            context: 'OTHER',
            approximateAge: 'UNKNOWN',
            goal: 'OTHER',
            startedAt: new Date(),
            skinArea: { create: { id: randomUUID(), bodyRegion: 'ARM', side: 'LEFT' } },
          },
        },
        consents: {
          create: {
            id: randomUUID(),
            type: 'PRIVACY',
            version: 'test-v1',
            accepted: true,
            acceptedAt: new Date(),
          },
        },
      },
    });

    await prisma.user.delete({ where: { id: cascadeUserId } });

    await expect(prisma.journey.count({ where: { id: journeyId } })).resolves.toBe(0);
    await expect(prisma.skinArea.count({ where: { journeyId } })).resolves.toBe(0);
    await expect(prisma.consentRecord.count({ where: { userId: cascadeUserId } })).resolves.toBe(0);
  });
});
