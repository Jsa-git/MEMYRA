import type {
  Journey,
  JourneyContext,
  JourneyGoal,
  JourneyStatus,
  JourneyRepository,
  CreateJourneyInput,
  SkinAreaRegion,
  SkinAreaSide,
} from '@memyra/domain';

import type { PrismaClient } from './generated/prisma/client';

type JourneyRow = {
  id: string;
  userId: string;
  name: string;
  status: string;
  context: string;
  approximateAge: string;
  goal: string;
  startedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  skinArea: { bodyRegion: string; side: string } | null;
};

export type JourneyPrismaClient = Pick<PrismaClient, 'journey' | 'skinArea' | '$transaction'>;

/** Prisma adapter for the Journey aggregate. Ownership is part of every read. */
export class PrismaJourneyRepository implements JourneyRepository {
  constructor(private readonly prisma: JourneyPrismaClient) {}

  async create(journey: Journey): Promise<Journey> {
    const row = await this.prisma.journey.create({
      data: {
        id: journey.id,
        userId: journey.userId,
        name: journey.name,
        status: journey.status,
        context: journey.context,
        approximateAge: journey.approximateAge,
        goal: journey.goal,
        startedAt: journey.startedAt,
        createdAt: journey.createdAt,
        updatedAt: journey.updatedAt,
        skinArea: {
          create: {
            id: randomUUID(),
            bodyRegion: journey.skinArea.region,
            side: journey.skinArea.side,
            createdAt: journey.createdAt,
            updatedAt: journey.updatedAt,
          },
        },
      },
      include: { skinArea: true },
    });

    return mapJourney(row);
  }

  async findByIdForUser(id: string, userId: string): Promise<Journey | null> {
    const row = await this.prisma.journey.findFirst({
      where: { id, userId },
      include: { skinArea: true },
    });
    return row ? mapJourney(row) : null;
  }

  async listForUser(userId: string): Promise<readonly Journey[]> {
    const rows = await this.prisma.journey.findMany({
      where: { userId },
      include: { skinArea: true },
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
    });
    return rows.map(mapJourney);
  }

  async updateStatusForUser(
    id: string,
    userId: string,
    status: JourneyStatus,
    updatedAt: Date,
  ): Promise<Journey | null> {
    return this.prisma.$transaction(async (transaction) => {
      const result = await transaction.journey.updateMany({
        where: { id, userId },
        data: { status, updatedAt },
      });
      if (result.count !== 1) return null;

      const row = await transaction.journey.findFirst({
        where: { id, userId },
        include: { skinArea: true },
      });
      return row ? mapJourney(row) : null;
    });
  }

  async updateForUser(
    id: string,
    userId: string,
    input: CreateJourneyInput,
    updatedAt: Date,
  ): Promise<Journey | null> {
    return this.prisma.$transaction(async (transaction) => {
      const result = await transaction.journey.updateMany({
        where: { id, userId },
        data: {
          name: input.name,
          context: input.context,
          approximateAge: input.approximateAge,
          goal: input.goal,
          updatedAt,
        },
      });
      if (result.count !== 1) return null;
      await transaction.skinArea.update({
        where: { journeyId: id },
        data: { bodyRegion: input.skinArea.region, side: input.skinArea.side, updatedAt },
      });
      const row = await transaction.journey.findFirst({
        where: { id, userId },
        include: { skinArea: true },
      });
      return row ? mapJourney(row) : null;
    });
  }
}

export function mapJourney(row: JourneyRow): Journey {
  if (!row.skinArea) throw new Error(`Journey ${row.id} has no skin area.`);
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    status: row.status as JourneyStatus,
    skinArea: {
      region: row.skinArea.bodyRegion as SkinAreaRegion,
      side: row.skinArea.side as SkinAreaSide,
    },
    context: row.context as JourneyContext,
    approximateAge: row.approximateAge as Journey['approximateAge'],
    goal: row.goal as JourneyGoal,
    startedAt: row.startedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
import { randomUUID } from 'node:crypto';
