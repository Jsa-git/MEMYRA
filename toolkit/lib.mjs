import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const ignored = new Set(['.git', '.next', 'coverage', 'dist', 'node_modules', 'outputs', 'work']);

export async function walk(root = process.cwd()) {
  const files = [];
  async function visit(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (ignored.has(entry.name)) continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) await visit(path);
      else files.push(path);
    }
  }
  await visit(root);
  return files;
}

export async function textFiles() {
  const allowed = new Set(['.ts', '.tsx', '.js', '.mjs', '.json', '.md', '.yml', '.yaml']);
  return (await walk()).filter((file) => allowed.has(extname(file)));
}

export async function findMatches(pattern) {
  const matches = [];
  for (const file of await textFiles()) {
    const content = await readFile(file, 'utf8');
    if (pattern.test(content)) matches.push(relative(process.cwd(), file));
    pattern.lastIndex = 0;
  }
  return matches;
}

export function fail(message, files = []) {
  console.error(message);
  for (const file of files) console.error(`- ${file}`);
  process.exitCode = 1;
}
