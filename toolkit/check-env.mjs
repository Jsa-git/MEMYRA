import { readFile } from 'node:fs/promises';

const env = await readFile('.env.example', 'utf8');
const required = [
  'APP_ENV=',
  'DATABASE_URL=',
  'BETTER_AUTH_URL=',
  'BETTER_AUTH_SECRET=',
  'S3_BUCKET=',
];
const missing = required.filter((key) => !env.includes(key));
if (missing.length) {
  console.error(`Missing environment examples: ${missing.join(', ')}`);
  process.exitCode = 1;
} else if (/=(?:sk-[A-Za-z0-9]|AKIA[A-Z0-9]{16})/.test(env)) {
  console.error('Potential real secret in .env.example.');
  process.exitCode = 1;
} else console.log('Environment contract check passed.');
