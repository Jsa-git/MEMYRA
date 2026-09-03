import { createPrismaClient } from '../src/client';

const databaseUrl = process.env.DATABASE_URL;

if (process.env.NODE_ENV === 'production' || process.env.APP_ENV === 'production') {
  throw new Error('Development seed is disabled in production.');
}

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to seed the development database.');
}

const prisma = createPrismaClient(databaseUrl);

// Stable synthetic test identity. example.invalid cannot receive real e-mail.
await prisma.user.upsert({
  where: { id: '00000000-0000-4000-8000-000000000001' },
  update: {},
  create: {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Usuário de teste',
    email: 'seed-user@memyra.example.invalid',
    emailVerified: false,
  },
});

await prisma.$disconnect();
