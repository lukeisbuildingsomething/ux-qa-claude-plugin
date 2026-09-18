# ux-qa

A Claude Code plugin that audits UI changes for **journey and convenience gaps**
— the things that aren't bugs but make an app feel unfinished — fixes the safe
ones without telling you, and queues only genuine product decisions.

The design constraint is that this must *remove* review work. A tool that hands
you a findings list after every change has moved the fatigue, not reduced it.

## How it triggers

Fully automatic, with a cheap-to-expensive escalation:

1. **`PostToolUse`** watches `Edit`/`Write` and marks the project dirty when a UI
   file changes. Silent, ~5ms.
2. **`Stop`** fires when the turn ends, injecting the audit instruction.
3. **`UserPromptSubmit`** is the fallback — if the audit somehow didn't run, it
   injects before your next message is handled. (Stop-hook semantics differ
   across Claude Code versions; this guarantees the loop runs either way.)

Noise controls, all in `ux-qa.config.json`: a 20-minute cooldown, a minimum
changed-file count, and journey selection scoped to what you actually touched.
A CSS tweak never spins up a browser.

## What it does once triggered

```
select ≤4 relevant journeys
  → ux-journey-runner subagents drive them in Playwright, in parallel
      (screenshots at every step, plus reload/navigate-away persistence probes)
  → ux-novice / ux-power / ux-returning / ux-mobile critique in parallel,
      each with a clean context window, looking at the screenshots
  → ux-triage dedupes and tiers, capped hard
      Tier 1  → fixed silently, logged, never mentioned
      Tier 2  → all of them asked right now, as clickable questions
                (a reproduced crash lands here first — out of scope to fix,
                 never out of scope to tell you about)
      Tier 3  → discarded
  → one sentence, then the questions — nothing left for you to chase
```

Nothing in this loop ever asks you to run a command, open a file, or remember to
come back. If a decision is open and you're there, it gets asked. That is the
entire contract.

It also never writes a finding down instead of acting on it. Every finding ends
the turn as a silent fix, a question, or a discard — there is no backlog file,
because one written to be read later outlives its reason and misleads whoever
finds it.

The personas run as **separate subagents** on purpose. Persona prompts inside one
context converge on the same opinion — you get four voices agreeing with your
own reasoning. Separate context windows is what makes the divergence real.

Triage runs on `opus` and everything else on `sonnet`, because deciding what
*not* to show you is the judgement-heavy step.

## Install

```bash
# in the repo containing this README
git init && git add -A && git commit -m "ux-qa plugin"
gh repo create ux-qa-marketplace --private --source=. --push
```

Then in Claude Code:

```
/plugin marketplace add <your-username>/ux-qa-marketplace
/plugin install ux-qa@luke
```

Plugins install per-user (`~/.claude/plugins/cache/`), so this is available in
every project on that machine. Enable it per-project in `.claude/settings.json`:

```json
{ "enabledPlugins": { "ux-qa@luke": true } }
```

During development you can skip the marketplace entirely:
`claude --plugin-dir /path/to/plugins/ux-qa`

## Per project, once

```
/ux-bootstrap
```

This reads the codebase and derives journeys from it — see below. It also writes
`ux-qa.config.json`; check `baseURL` and `startCommand` before the first run.

Requires `playwright` as a dev dependency in the project.

## Where the journeys come from

This is the part that has to be app-specific, and it is generated, not
hand-written. `/ux-bootstrap` runs the `ux-journey-authoring` skill, which:

1. **Inventories** the app: routes and screens, mutations (every place state the
   user cares about changes), persisted state (every `localStorage` key, query
   param and preference — each one is an implicit promise to remember
   something), and entities plus roles.
2. **Ranks** entities by centrality — default route, mutation count, link-in
   count — and takes the top 3.
3. **Crosses** those with a fixed set of ten friction archetypes: first run,
   create, edit, resume, repeat, recover, abandon, scale, mobile, second role.
   The archetypes are universal; the nouns are yours. That's what makes
   `resume-session.md` come out of EmberDM and `repeat-last-trip.md` out of the
   camping app without anyone writing either.
4. **Prunes to ≤10.** Ten journeys that run in two minutes beat forty that never
   run.

Re-run `/ux-bootstrap --refresh` when routes change; it regenerates journeys and
leaves your accumulated expectations, decisions and won't-fixes alone.

## The accumulating files

- `.claude/ux-qa/PRODUCT_EXPECTATIONS.md` — the contract, **capped at 80 lines**.
  Every resolved decision adds one line so it's never decided twice. At the cap
  it prunes lines nothing has matched recently rather than merging live ones,
  because triage can only auto-fix against a *specific* expectation — generalise
  the file and silent fixes turn back into questions for you.
- `.claude/ux-qa/WONTFIX.md` — permanently dead findings. Triage kills matches on
  sight, in any wording.
- `.claude/ux-qa/DECISIONS.md` — crash-safe holding pen so nothing is lost
  between turns. **You never open this.** It only ever holds items from an
  unattended run, and it is drained automatically — asked first — the next time
  an audit runs with you present.
- `.claude/ux-qa/log.md` — what got fixed silently, if you ever want to look.

## Commands

| | |
|---|---|
| `/ux-bootstrap` | derive journeys, expectations and config for this project |
| `/ux-audit [journey\|all]` | force a run now |
| `/ux-decide` | escape hatch you shouldn't need — decisions are asked automatically |

## Installing

This repo is itself a plugin marketplace (`.claude-plugin/marketplace.json`), and
it is registered locally as the `luke` marketplace pointing at this directory.
A directory-source marketplace is read **in place**, so the working tree *is* the
installed plugin: edit a file under `plugins/ux-qa/` and the change is live on the
next session start. No build, no upload, no version bump, no removing an old copy.

`dist/ux-qa.plugin` still exists for handing the plugin to someone else, and
`bash build.sh` regenerates it. Installing that file is the manual path — it
lands in a separate `local-desktop-app-uploads` marketplace and will not upgrade
a copy installed any other way.

### On another machine

The repo is public, so there is nothing to authenticate. Once per device, in a
terminal `claude` session:

```
/plugin marketplace add lukeisbuildingsomething/ux-qa-claude-plugin
/plugin install ux-qa@luke
```

Those devices track what has been **pushed**, not the working tree, so a change
made on the dev machine reaches them after a push plus `/plugin marketplace
update luke`.

## Optional: nightly full sweep

The in-session loop only audits journeys that intersect the day's changes.
`hooks/scripts/nightly-sweep.mjs` runs *all* of them headless and leaves fixes on
a branch. Point Task Scheduler or cron at it.

## Turning it down

In `ux-qa.config.json`: `"autoTrigger": false` makes everything opt-in via
`/ux-audit`. Raise `cooldownMinutes` or `minChangedFiles` if it's running more
often than it earns.
