import { readFile } from 'node:fs/promises';
import { relative } from 'node:path';
import { walk, fail } from './lib.mjs';

const files = (await walk()).filter((file) =>
  /[\\/](?:apps|packages)[\\/].+\.(?:ts|tsx|js|mjs|json)$/.test(file),
);
async function matching(pattern) {
  const matches = [];
  for (const file of files) {
    if (pattern.test(await readFile(file, 'utf8'))) matches.push(relative(process.cwd(), file));
    pattern.lastIndex = 0;
  }
  return matches;
}
const privateKeyFiles = await matching(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/);
const publicPhotoPatterns = await matching(/S3_BUCKET_PUBLIC|public-read|makePublic\s*\(/);
const gpsPhotoPatterns = await matching(/PhotoRecord[\s\S]{0,500}\b(?:latitude|longitude|gps)\b/i);
if (privateKeyFiles.length) fail('Possible private key committed:', privateKeyFiles);
if (publicPhotoPatterns.length)
  fail('Possible public photo-storage configuration:', publicPhotoPatterns);
if (gpsPhotoPatterns.length) fail('GPS-like field found near PhotoRecord:', gpsPhotoPatterns);
if (!process.exitCode) console.log('Security static checks passed.');
