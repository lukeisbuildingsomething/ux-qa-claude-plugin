#!/usr/bin/env node
// Optional nightly full sweep. The in-session loop only audits journeys that
// intersect the day's changes; this one runs everything, once, while you sleep.
//
// Windows Task Scheduler / cron:
//   node path/to/nightly-sweep.mjs /path/to/project
//
// Requires `claude` on PATH.
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const project = process.argv[2] || process.cwd();

const prompt = [
  'Run the ux-audit-loop skill over every journey in .claude/ux-qa/journeys/.',
  'This is an unattended run: there is no one to answer questions.',
  'Apply Tier 1 fixes and commit them to a branch named ux-qa/nightly-<date>.',
  'Do not push. Do not merge. Do not open a PR.',
  'Append Tier 2 items to DECISIONS.md, respecting the cap of 5 open items.',
  'Write a two-line summary to .claude/ux-qa/log.md and exit.'
].join(' ');

const res = spawnSync(
  'claude',
  ['-p', prompt, '--permission-mode', 'acceptEdits', '--output-format', 'json'],
  { cwd: project, stdio: 'inherit', shell: process.platform === 'win32' }
);

process.exit(res.status ?? 1);
