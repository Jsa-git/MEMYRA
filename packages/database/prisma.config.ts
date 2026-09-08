import { resolve } from 'node:path';

import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

config({ path: resolve(import.meta.dirname, '../../.env.local'), quiet: true });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations', seed: 'tsx prisma/seed.ts' },
  // Prisma 7 removed datasource.directUrl. CLI operations use DIRECT_URL while
  // the application runtime continues to use the pooled DATABASE_URL.
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? 'postgresql://localhost:5432/memyra',
  },
});
