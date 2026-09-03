import { createPrismaClient } from '@memyra/database';

const globalDatabase = globalThis as unknown as {
  memyraPrisma?: ReturnType<typeof createPrismaClient>;
};

export function getDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_NOT_CONFIGURED');

  const prisma = globalDatabase.memyraPrisma ?? createPrismaClient(connectionString);
  if (process.env.NODE_ENV !== 'production') globalDatabase.memyraPrisma = prisma;
  return prisma;
}
