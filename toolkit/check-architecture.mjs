import { readFile } from 'node:fs/promises';
import { walk, fail } from './lib.mjs';

const sourceFiles = (await walk()).filter((file) =>
  /packages[\\/]domain[\\/]src[\\/].+\.ts$/.test(file),
);
const forbidden = /from\s+['"](?:next|react|@memyra\/(?:database|ui))(?:\/|['"])/;
const violations = [];
for (const file of sourceFiles) {
  if (forbidden.test(await readFile(file, 'utf8'))) violations.push(file);
}
if (violations.length)
  fail('Domain boundary imports forbidden framework/infrastructure code:', violations);
else console.log(`Architecture check passed (${sourceFiles.length} domain source file(s)).`);
