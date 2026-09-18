---
description: Derive this app's UX journeys, expectations file and config from its own code. Run once per project.
argument-hint: "[optional: --refresh to regenerate journeys after routes changed]"
allowed-tools: Read, Write, Glob, Grep, Bash
---

Set up the ux-qa loop for this project.

1. Invoke the `ux-journey-authoring` skill and follow it exactly to inventory the
   app and derive its journeys. Do not skip the inventory — generic journeys make
   the whole loop worthless.

2. Create `.claude/ux-qa/` containing:
   - `journeys/` — the derived journey files (at most 10)
   - `PRODUCT_EXPECTATIONS.md` — seeded from the plugin template plus any
     app-specific lines the inventory implies, capped at 80 lines
   - `DECISIONS.md` — empty queue, from the plugin template
   - `WONTFIX.md` — empty
   - `log.md` — empty
   - `.gitignore` containing `state/`, `log.md` and `DECISIONS.md`. `state/`
     holds screenshots, scratch scripts and `auth.json` — a live Playwright
     session that must never be committed. `log.md` is append-only churn and
     `DECISIONS.md` is a transient buffer; both conflict on every branch and
     neither is worth reviewing. The contract files — `journeys/`,
     `PRODUCT_EXPECTATIONS.md`, `WONTFIX.md` and `ux-qa.config.json` — **are**
     committed: they are reviewable spec.
   - Never write a credential into `ux-qa.config.json`. Seed steps reference an
     environment variable (`"$UX_QA_PASSWORD"`) and the file says which one to
     set. A password in a config file is a published password.

3. Create `ux-qa.config.json` at the project root:

```json
{
  "baseURL": "http://localhost:5173",
  "startCommand": "npm run dev",
  "readyTimeoutMs": 60000,
  "viewports": [
    { "name": "desktop", "width": 1440, "height": 900 },
    { "name": "mobile", "width": 390, "height": 844 }
  ],
  "uiGlobs": ["src/"],
  "uiExtensions": [".tsx", ".jsx", ".css"],
  "ignore": ["node_modules/", ".claude/", "dist/", ".test.", ".stories."],
  "minChangedFiles": 1,
  "cooldownMinutes": 20,
  "autoTrigger": true,
  "seed": {
    "note": "Optional. Commands or Playwright steps to get the app into a usable logged-in state before a journey runs.",
    "steps": []
  }
}
```

   Fill `baseURL`, `startCommand` and `uiGlobs` from what this project actually
   uses — read `package.json` and the dev server config rather than guessing.

4. Check whether `playwright` is a dev dependency. If not, **install it yourself**
   with the project's own package manager (`npm i -D playwright`, or the pnpm /
   yarn / bun equivalent — detect it from the lockfile) and run
   `npx playwright install chromium`. Do not hand the user a command to run. If
   the install fails, write the error to `.claude/ux-qa/log.md` and say one
   sentence about it — that is the one case where they genuinely have to act.

5. Add to the project's `CLAUDE.md` (create it if absent) a short block:

```
## UX expectations
Before finishing any change that touches the UI, check it against
.claude/ux-qa/PRODUCT_EXPECTATIONS.md. If the change reveals a new UX principle,
add one line there.
```

6. If `$ARGUMENTS` contains `--refresh`, do not overwrite `PRODUCT_EXPECTATIONS.md`,
   `WONTFIX.md` or `DECISIONS.md` — those carry accumulated judgement. Regenerate
   only the journey files, and report which journeys were added, changed or
   removed.

Finish by listing the journeys you derived, one line each, and nothing more.
