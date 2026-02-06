#!/usr/bin/env node
/**
 * Fetch GitHub Actions run logs into logs/ so Cursor can read them.
 * Requires: gh CLI installed and authenticated (gh auth login).
 *
 * Usage:
 *   npm run ci:fetch-logs           # fetch latest run
 *   npm run ci:fetch-logs 123456    # fetch run by ID
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const logsDir = path.join(root, 'logs');
fs.mkdirSync(logsDir, { recursive: true });

const runIdArg = process.argv[2];
let runId = runIdArg;

if (!runId || runId === 'latest') {
  const list = spawnSync(
    'gh',
    ['run', 'list', '--limit', '1', '--json', 'databaseId,conclusion,displayTitle', '-q', '.[0]'],
    { cwd: root, encoding: 'utf-8' }
  );
  if (list.status !== 0) {
    console.error('gh run list failed. Run: gh auth login');
    process.exit(1);
  }
  const row = JSON.parse(list.stdout.trim());
  runId = String(row.databaseId);
  console.error(`Latest run: ${runId} (${row.conclusion}) - ${row.displayTitle}`);
}

const outPath = path.join(logsDir, `ci-${runId}.log`);
const view = spawnSync('gh', ['run', 'view', runId, '--log'], {
  cwd: root,
  encoding: 'utf-8',
});
if (view.status !== 0) {
  console.error('gh run view failed:', view.stderr || view.error);
  process.exit(1);
}

fs.writeFileSync(outPath, view.stdout, 'utf-8');
console.log(`Saved to ${path.relative(root, outPath)}`);
