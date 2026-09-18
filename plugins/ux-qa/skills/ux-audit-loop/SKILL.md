---
name: ux-audit-loop
description: Run a synthetic-user UX audit after a UI change. Drives the app through its journeys in a browser, has persona reviewers critique the result, silently fixes safe friction, and asks the user about the one thing that needs their judgement. Use when UI files have changed, when the ux-qa auto-trigger fires, or when the user asks for a UX audit, journey audit, or product review.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent, AskUserQuestion
---

# UX audit loop

Your job is to find and remove **journey and convenience gaps** — not bugs. Bugs
announce themselves. Friction does not: the user re-types something the app
already knew, loses a filter on reload, lands on a dead page after creating an
object, or hits an empty state that tells them nothing.

The person you work for is doing this to **stop being the primary tester**. Two
rules follow from that, and they pull against each other. Hold both:

1. Never hand them a list. Lists are review work in a new costume.
2. Never make them remember to come back for something. A queue they have to
   drain is a queue that rots.

So: fix what you can prove is safe, and **ask about the single most important
thing right now, as one question with one click** — not later, not in a file
they have to open.

## Preconditions

1. Read `ux-qa.config.json` at the project root. If it is missing, run
   `/ux-bootstrap` first and stop.
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

## Step 6 — Ask about ONE decision, right now

Take the **single highest-severity Tier 2 item** and put it to the user with
`AskUserQuestion`, at the end of this turn, before you finish speaking.

- The question is the product decision in plain language, **one sentence, no
  jargon**. Say what the user experiences, not what the code does.
- Option 1 is your recommendation, labelled `(Recommended)`.
- Option 2 is the realistic alternative.
- Option 3 is `Leave it alone`.
- Each description is one short line: what they get, what it costs.

Then act on the answer immediately: implement it, re-run the affected journey to
confirm, and add the resulting principle as one line in
`PRODUCT_EXPECTATIONS.md` so it is never asked again. `Leave it alone` goes to
`WONTFIX.md` with the date — permanently dead, never raised again in any wording.

**Exactly one question per turn. Never two, never a list of three.** Every other
Tier 2 item goes to `.claude/ux-qa/DECISIONS.md` as a buffer and surfaces one at
a time on later turns, highest severity first. The user should never need to open
that file; it exists so nothing is lost between turns.

### When to stay silent instead

Do not ask if any of these hold — buffer it and move on:

- The item is below `annoys` severity. Not everything deserves an interruption.
- You already asked a ux-qa question earlier in this same turn.
- The user is mid-flow on something urgent and this is unrelated. Their current
  task outranks your audit, always.
- This is an unattended or scheduled run with nobody there to answer.

A buffered item surfaces on the next audit. Nothing is lost by waiting.

## Step 7 — Learn

If a Tier 1 fix or a decision revealed a principle not yet written down, add one
line to `PRODUCT_EXPECTATIONS.md`. Keep that file under **40 lines, forever.**
When it would exceed that, merge or generalise existing lines instead of
appending. A 200-line expectations file is a file the model skims and ignores.

If a journey's steps no longer match the app, update the journey file.

## Step 8 — Close out

Clear `files` in `.claude/ux-qa/state/dirty.json` and set `lastAuditAt`.

Say **at most one sentence** before the question. Good:

> Checked character creation and resume-session, fixed a few small things — one
> call worth making:

Then the `AskUserQuestion`. Never paste the findings. Never paste the fix list.
Never explain the tiers. The question is the whole report.
