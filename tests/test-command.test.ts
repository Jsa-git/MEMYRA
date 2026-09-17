import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

import { expect, it } from 'vitest';

it('passes test exclusions literally through the platform shell', () => {
  const manifest = JSON.parse(readFileSync('package.json', 'utf8')) as {
    scripts: { test: string };
  };
  expect(manifest.scripts.test.startsWith('vitest run ')).toBe(true);
  const argumentsOnly = manifest.scripts.test.slice('vitest run '.length);
  // On Linux, an unquoted glob expands into E2E filenames before Vitest sees it.
  const output = execSync(
    `"${process.execPath}" -e "console.log(JSON.stringify(process.argv.slice(1)))" -- ${argumentsOnly}`,
    { encoding: 'utf8' },
  );
  expect(output.trim()).toBe(JSON.stringify(['--exclude', 'tests/e2e/**', '--exclude', 'work/**']));
});
