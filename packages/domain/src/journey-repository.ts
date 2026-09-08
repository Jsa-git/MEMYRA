import type { CreateJourneyInput, Journey } from './journey';

/** Persistence port scoped to Journey; adapters must enforce ownership on reads. */
export interface JourneyRepository {
  create(journey: Journey): Promise<Journey>;
  findByIdForUser(id: string, userId: string): Promise<Journey | null>;
  listForUser(userId: string): Promise<readonly Journey[]>;
  updateForUser(
    id: string,
    userId: string,
    input: CreateJourneyInput,
    updatedAt: Date,
  ): Promise<Journey | null>;
  updateStatusForUser(
    id: string,
    userId: string,
    status: Journey['status'],
    updatedAt: Date,
  ): Promise<Journey | null>;
}
