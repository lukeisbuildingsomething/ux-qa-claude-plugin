#!/usr/bin/env node
// UserPromptSubmit: guaranteed fallback trigger. If UI files are still marked
// dirty when the user speaks again, inject the audit instruction before Claude
// starts working. This is the injection point that exists in every version.
import { readStdin, projectRoot, loadConfig, readState, writeState, emit, nudgeText } from './lib.mjs';

const input = readStdin();
const root = projectRoot(input);
const cfg = loadConfig(root);
if (!cfg.autoTrigger) process.exit(0);

const state = readState(root);
const files = state.files || [];
if (files.length < cfg.minChangedFiles) process.exit(0);

// If the Stop hook already nudged for this exact batch and the audit ran, files
// would have been cleared. Still dirty means the audit did not happen.
const now = Date.now();
if (now - (state.lastPromptNudgeAt || 0) < 60 * 1000) process.exit(0);

state.lastPromptNudgeAt = now;
writeState(root, state);

emit('UserPromptSubmit', nudgeText(files, root));
process.exit(0);
