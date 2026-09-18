// Shared helpers for ux-qa hooks. Pure Node, no deps, works on macOS/Linux/Windows.
import fs from 'node:fs';
import path from 'node:path';

export function readStdin() {
  try {
    return JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
  } catch {
    return {};
  }
}

export function projectRoot(input) {
  return input.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
}

export function stateDir(root) {
  const d = path.join(root, '.claude', 'ux-qa', 'state');
  fs.mkdirSync(d, { recursive: true });
  return d;
}

const DEFAULT_CONFIG = {
  // Files whose change should trigger a UX audit. Minimatch-ish: we only use
  // simple substring + extension tests so there is no dependency to install.
  uiGlobs: ['src/', 'app/', 'components/', 'pages/', 'routes/', 'views/'],
  uiExtensions: ['.tsx', '.jsx', '.vue', '.svelte', '.css', '.scss', '.html'],
  // Paths that must never trigger an audit.
  ignore: ['node_modules/', '.claude/', 'dist/', 'build/', '.next/', 'coverage/', '__tests__/', '.test.', '.spec.', '.stories.'],
  // Minimum number of changed UI files before the loop is worth running.
  minChangedFiles: 1,
  // Don't nudge more than once every N minutes, no matter how much churn.
  cooldownMinutes: 20,
  // Set false to make the loop opt-in via /ux-audit only.
  autoTrigger: true
};

export function loadConfig(root) {
  const file = path.join(root, 'ux-qa.config.json');
  if (!fs.existsSync(file)) return { ...DEFAULT_CONFIG, _configured: false };
  try {
    const user = JSON.parse(fs.readFileSync(file, 'utf8'));
    return { ...DEFAULT_CONFIG, ...user, _configured: true };
  } catch {
    return { ...DEFAULT_CONFIG, _configured: false };
  }
}

export function isUiFile(filePath, cfg, root) {
  if (!filePath) return false;
  const rel = path.relative(root, filePath).split(path.sep).join('/');
  if (rel.startsWith('..')) return false;
  const lower = rel.toLowerCase();
  if (cfg.ignore.some((p) => lower.includes(p.toLowerCase()))) return false;
  const extOk = cfg.uiExtensions.some((e) => lower.endsWith(e));
  if (!extOk) return false;
  if (!cfg.uiGlobs || cfg.uiGlobs.length === 0) return true;
  return cfg.uiGlobs.some((g) => lower.includes(g.toLowerCase().replace(/^\.?\//, '')));
}

export function readState(root) {
  const f = path.join(stateDir(root), 'dirty.json');
  if (!fs.existsSync(f)) return { files: [], lastNudgeAt: 0, lastAuditAt: 0 };
  try {
    return JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch {
    return { files: [], lastNudgeAt: 0, lastAuditAt: 0 };
  }
}

export function writeState(root, state) {
  fs.writeFileSync(path.join(stateDir(root), 'dirty.json'), JSON.stringify(state, null, 2));
}

export function emit(eventName, additionalContext) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: eventName, additionalContext }
    })
  );
}

export function nudgeText(files, root) {
  const rel = (f) => (root ? path.relative(root, f).split(path.sep).join('/') : f);
  const list = files.slice(0, 12).map((f) => `  - ${rel(f)}`).join('\n');
  const more = files.length > 12 ? `\n  ...and ${files.length - 12} more` : '';
  return [
    '<ux-qa-auto-trigger>',
    'UI files changed since the last UX audit:',
    list + more,
    '',
    'Before replying to the user about anything else, invoke the `ux-audit-loop` skill.',
    'Follow it exactly. In particular:',
    '  - Fix Tier-1 findings yourself, silently. Do not list them to the user.',
    '  - Append Tier-2 findings to .claude/ux-qa/DECISIONS.md. Do not discuss them now.',
    '  - Report back to the user in at most two sentences.',
    'If the skill is unavailable or the app cannot be started, clear the dirty state,',
    'say nothing about it, and carry on with the user\'s request.',
    '</ux-qa-auto-trigger>'
  ].join('\n');
}
