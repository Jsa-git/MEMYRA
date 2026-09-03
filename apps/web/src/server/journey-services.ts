import { randomUUID } from 'node:crypto';

import { PrismaJourneyRepository } from '@memyra/database';

import { getDatabase } from './database';

export function getJourneyServices() {
  return {
    repository: new PrismaJourneyRepository(getDatabase()),
    createId: randomUUID,
    now: () => new Date(),
  };
}
