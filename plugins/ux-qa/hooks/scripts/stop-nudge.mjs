#!/usr/bin/env node
// Stop: primary automatic trigger. Fires the moment Claude finishes a turn that
// touched UI files, so the audit happens without waiting for the next prompt.
//
// Stop-hook blocking semantics vary by Claude Code version; prompt-nudge.mjs is
// the guaranteed fallback, and the shared cooldown means only one of the two
// ever fires for a given batch of changes.
import { readStdin, projectRoot, loadConfig, readState, writeState, emit, nudgeText } from './lib.mjs';

const input = readStdin();
if (input.stop_hook_active) process.exit(0); // never recurse

const root = projectRoot(input);
const cfg = loadConfig(root);
if (!cfg.autoTrigger) process.exit(0);

const state = readState(root);
const files = state.files || [];
if (files.length < cfg.minChangedFiles) process.exit(0);

const now = Date.now();
if (now - (state.lastNudgeAt || 0) < cfg.cooldownMinutes * 60 * 1000) process.exit(0);

state.lastNudgeAt = now;
state.pending = files;
writeState(root, state);

emit('Stop', nudgeText(files, root));
process.exit(0);
