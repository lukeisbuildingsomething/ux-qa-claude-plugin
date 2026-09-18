#!/usr/bin/env node
// PostToolUse(Edit|Write): record that a UI-bearing file changed.
// Silent. Never blocks, never prints anything Claude sees.
import { readStdin, projectRoot, loadConfig, isUiFile, readState, writeState } from './lib.mjs';

const input = readStdin();
const root = projectRoot(input);
const cfg = loadConfig(root);
if (!cfg.autoTrigger) process.exit(0);

const ti = input.tool_input || {};
const candidates = [ti.file_path, ti.path, ti.notebook_path].filter(Boolean);
if (Array.isArray(ti.edits)) for (const e of ti.edits) if (e.file_path) candidates.push(e.file_path);

const hits = candidates.filter((f) => isUiFile(f, cfg, root));
if (hits.length === 0) process.exit(0);

const state = readState(root);
const set = new Set(state.files || []);
for (const h of hits) set.add(h);
state.files = [...set];
writeState(root, state);
process.exit(0);
