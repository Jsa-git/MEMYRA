import { prismaAdapter } from '@better-auth/prisma-adapter';
import { betterAuth } from 'better-auth';

import { getDatabase } from './database';

function requiredEnvironment(name: 'BETTER_AUTH_SECRET' | 'BETTER_AUTH_URL'): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name}_REQUIRED`);
  return value;
}

function createAuth() {
  const baseURL = requiredEnvironment('BETTER_AUTH_URL');
  return betterAuth({
    appName: 'MEMYRA',
    baseURL,
    secret: requiredEnvironment('BETTER_AUTH_SECRET'),
    database: prismaAdapter(getDatabase(), {
      provider: 'postgresql',
      transaction: true,
    }),
    emailAndPassword: {
      enabled: true,
    },
    advanced: {
      database: {
        generateId: 'uuid',
      },
      useSecureCookies: process.env.NODE_ENV === 'production',
    },
    trustedOrigins: [baseURL],
    user: {
      deleteUser: {
        enabled: false,
      },
    },
  });
}

type AuthInstance = ReturnType<typeof createAuth>;
let authInstance: AuthInstance | undefined;

export function getAuth(): AuthInstance {
  authInstance ??= createAuth();
  return authInstance;
}
