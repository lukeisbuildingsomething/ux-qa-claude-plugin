---
name: ux-audit-loop
description: Run a synthetic-user UX audit after a UI change. Drives the app through its journeys in a browser, has persona reviewers critique the result, silently fixes safe friction, and asks the user about everything that needs their judgement in one batch of clickable questions. Use when UI files have changed, when the ux-qa auto-trigger fires, or when the user asks for a UX audit, journey audit, or product review.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent, AskUserQuestion
---

# UX audit loop

Your job is to find and remove **journey and convenience gaps** — not bugs. Bugs
announce themselves. Friction does not: the user re-types something the app
already knew, loses a filter on reload, lands on a dead page after creating an
object, or hits an empty state that tells them nothing.

The person you work for is doing this to **stop being the primary tester**. Two
rules follow from that. Hold both:

1. Never hand them a list to read. Lists are review work in a new costume.
2. Never make them remember to come back for something, run a command, or open a
   file. A queue they have to drain is a queue that rots.

So: fix what you can prove is safe, and **ask everything that needs their
judgement right now, as clickable questions** — not later, not behind a command,
not in a file they have to open. Questions are cheap because they are one click.
Homework is expensive. This process is fully automatic or it has failed.

## Preconditions

1. Read `ux-qa.config.json` at the project root. If it is missing, invoke the
   `ux-bootstrap` skill yourself and continue — do not ask the user to run it.
2. Read `.claude/ux-qa/PRODUCT_EXPECTATIONS.md`. This is the contract you audit
   against.
3. Read `.claude/ux-qa/WONTFIX.md` if present. Anything matching an entry there
   is dead — never raise it again, in any wording.
4. Read `.claude/ux-qa/state/dirty.json` to see which files changed.

## Step 1 — Pick the journeys (do not run them all)

Read `.claude/ux-qa/journeys/*.md`. Select only journeys whose `touches:`
frontmatter intersects the changed files, plus any journey marked
`always: true`. Cap at **4 journeys**. If nothing intersects, clear the dirty
state and stop silently — a styling tweak does not deserve a browser run.

## Step 2 — Run them in a browser

Start the app using `startCommand` from the config; wait for `baseURL` to answer.
Then, for each selected journey, dispatch **one `ux-journey-runner` subagent per
journey, all in a single message so they run in parallel**. Give each the journey
file path, the baseURL, and the viewport list.

Each runner returns a structured observation record: what it did, what it saw,
screenshots on disk, console errors, and network calls. Runners do not judge and
do not edit files.

If the app will not start, write one line to `.claude/ux-qa/log.md`, clear the
dirty state, and carry on. Never make the user debug the harness.

## Step 3 — Critique with fresh eyes

Dispatch these persona subagents **in parallel, in one message**, handing each the
observation records, the screenshot paths, and `PRODUCT_EXPECTATIONS.md`:

- `ux-novice` — first-timer; unclear affordances, missing guidance, empty states
- `ux-power` — tenth-time user; repetition, missing defaults, absent shortcuts
- `ux-returning` — came back tomorrow; lost context, forgotten preferences
- `ux-mobile` — one thumb, small screen, bad network

They run with clean context on purpose. A persona that has read your reasoning
converges on your opinion, which is how this whole exercise becomes theatre.
**They must look at the screenshots**, not just the DOM text. Most convenience
gaps are visible and not readable.

## Step 4 — Triage

Dispatch the `ux-triage` subagent with all persona output. It deduplicates,
drops WONTFIX matches, and sorts every surviving finding into exactly one tier:

**Tier 1 — fix now, say nothing.** The finding violates a written line in
`PRODUCT_EXPECTATIONS.md`, the fix is local, reversible, and involves no product
choice. Preserving a filter, disabling a button while submitting, adding a
loading state, focusing the first field, redirecting somewhere useful after
create, adding a confirm to a destructive action, carrying a known value forward.

**Tier 2 — needs the human's judgement.** Anything that changes what the product
*is*: new UI surface, new concept, a real tradeoff, a guess at intent, or
anything touching money, auth, or data deletion semantics.

**Tier 3 — discard.** Taste, speculation, "could also add", anything not grounded
in an observation from step 2.

Triage does not edit files.

## Step 5 — Fix the safe ones silently

Implement every Tier 1 item yourself, now. Then re-run the affected journeys once
to confirm the fix landed and nothing regressed. Append one line per fix to
`.claude/ux-qa/log.md` in the form `YYYY-MM-DD | journey | what changed`.

**Do not report these to the user.** This is the whole point — they asked for
less review work, not a changelog.

## Step 6 — Ask every open decision, right now

First read `.claude/ux-qa/DECISIONS.md`. Anything buffered there from an earlier
turn joins this turn's Tier 2 items. **That buffer is yours to drain, never the
user's.** It must not survive a turn in which someone was present to answer.

Sort the combined set by severity and put the top **up to four** to the user in a
**single `AskUserQuestion` call**, at the end of this turn, before you finish
speaking. Several questions in one call is correct and expected: it is one
interaction, not a list. Asking four is always better than asking one and leaving
three for the user to chase.

Each question:

- The product decision in plain language, **one sentence, no jargon**. Say what
  the user experiences, not what the code does.
- Option 1 is your recommendation, labelled `(Recommended)`.
- Option 2 is the realistic alternative.
- Option 3 is `Leave it alone`.
- Each description is one short line: what they get, what it costs.

Act on the answers immediately: implement each, re-run the affected journeys to
confirm, and add each resulting principle as one line in
`PRODUCT_EXPECTATIONS.md` so it is never asked again. `Leave it alone` goes to
`WONTFIX.md` with the date — permanently dead, never raised again in any wording.
Remove every answered item from `DECISIONS.md`.

If more than four survived, the remainder stays in `DECISIONS.md` and is asked
**first**, automatically, on the very next audit. Never tell the user it is
there.

### Never do any of these

- **Never tell the user to run a command.** Not `/ux-decide`, not `/ux-audit`,
  not anything. If a decision is open and they are here, ask it now.
- **Never name a ux-qa file to them** — not `DECISIONS.md`, not `log.md`, not
  `PRODUCT_EXPECTATIONS.md`. That is your bookkeeping, not their homework.
- **Never describe what is queued, pending, waiting, or buffered.** If it is
  worth mentioning, it is worth asking as a question instead.
- **Never leave something as a thing they must remember to come back to.**
- **Never report Tier 1 fixes, counts, or audit status.**

### When to stay silent

Only these two, and when they hold you say nothing about ux-qa at all — no
mention of what is open:

- Nobody is there to answer: an unattended, scheduled, or headless run.
- The user is mid-flow on something urgent and unrelated. Their task outranks
  your audit, always.

In both cases the items sit in `DECISIONS.md` and are asked, unprompted, at the
top of the next audit where someone is present. Low severity is **not** a reason
to stay silent any more — batch it into the same call instead.

## Step 7 — Learn

If a Tier 1 fix or a decision revealed a principle not yet written down, add one
line to `PRODUCT_EXPECTATIONS.md`. Keep that file under **40 lines, forever.**
When it would exceed that, merge or generalise existing lines instead of
appending. A 200-line expectations file is a file the model skims and ignores.

If a journey's steps no longer match the app, update the journey file.

## Step 8 — Close out

Clear `files` in `.claude/ux-qa/state/dirty.json` and set `lastAuditAt`.

Say **at most one sentence** before the questions. Good:

> Checked character creation and resume-session, fixed a few small things — a
> couple of calls worth making:

Then the `AskUserQuestion`. Never paste the findings. Never paste the fix list.
Never explain the tiers. Never append a status line about what else is open or
how to see it. The questions are the whole report, and when there are none, one
sentence is the whole report.
