---
name: ux-journey-authoring
description: Derive an app's UX journey specs from its own code. Use when bootstrapping ux-qa in a new project, when the user asks how to generate journeys, or when routes and features have drifted from the existing journey files.
allowed-tools: Read, Glob, Grep, Write, Bash
---

# Deriving journeys from the codebase

Journeys are unique per app — but the **friction archetypes are not**. Never
write a generic journey list. Extract the app's own nouns and verbs from its
code, then cross them with the fixed archetype set below. That is what makes the
output specific to EmberDM or the camping planner without anyone hand-authoring
it.

## Step 1 — Inventory the app (read-only)

Produce four lists. Cite file paths for each entry.

**Routes / screens.** React Router config, file-based routes, top-level page
components, tab or modal surfaces that behave like screens. Note which is the
default landing route and which routes are linked from the most places — that
link-in count is your centrality proxy.

**Mutations.** Every place the app changes state the user cares about: form
submits, `POST`/`PUT`/`PATCH`/`DELETE` handlers on the server, store actions,
optimistic updates. Each mutation implies an object that gets created, edited or
destroyed.

**Persisted state.** `localStorage` / `sessionStorage` keys, URL query params,
cookies, server-side user preferences, anything in a settings table. This list is
gold: **every key here is a promise the app is implicitly making to remember
something**, and most convenience gaps are that promise being broken somewhere.

**Entities and roles.** The domain nouns the mutations operate on, and the
distinct kinds of user (EmberDM: DM vs. player; a property app: owner vs.
tenant). If the app has more than one role, roles multiply the journeys — audit
the non-primary role too, it is always the neglected one.

## Step 2 — Rank

Score each entity by: appears in the default route, referenced by the most
mutations, highest link-in count, mentioned most in the README or CLAUDE.md.
Take the **top 3 entities**. Everything else is out of scope for v1.

## Step 3 — Cross with the archetypes

For each of the top entities, instantiate the archetypes that actually apply. Use
the app's own vocabulary in the title — `resume-session.md`, not
`returning-user-flow.md`.

| # | Archetype | The question it asks | Skip when |
|---|-----------|----------------------|-----------|
| 1 | **First run** | Zero data, zero knowledge. Does the app say what to do next? | never skip |
| 2 | **Create** | Making the entity for the first time. Where do I land after? | never skip |
| 3 | **Edit / correct** | Changing it later. Is my context preserved? | entity is immutable |
| 4 | **Resume** | Closed the tab, came back tomorrow. What was lost? | no persisted state |
| 5 | **Repeat** | Doing yesterday's action again. Am I re-entering known data? | one-shot flows |
| 6 | **Recover** | Wrong input, wrong click, destructive action. Undo or confirm? | never skip |
| 7 | **Abandon** | Interrupted halfway. Is the draft there when I return? | no multi-step flow |
| 8 | **Scale** | 50 of them instead of 3. Search, filter, sort, bulk? | hard cardinality cap |
| 9 | **Mobile** | One thumb, small screen. Is the primary action reachable? | desktop-only by design |
| 10 | **Second role** | The non-primary user's path through the same feature. | single-role app |

Then **prune to at most 10 journeys total.** Ten good journeys that run in two
minutes beat forty that never run. Prefer archetypes 1, 2, 4, 6 — first run,
create, resume and recover catch the large majority of real friction.

## Step 4 — Write the files

One file per journey in `.claude/ux-qa/journeys/`, using the template at
`${CLAUDE_PLUGIN_ROOT}/templates/journey.md`. The two fields that matter most:

- `touches:` — the source globs that make this journey worth re-running. This is
  what keeps the automatic loop cheap; get it right or every audit runs
  everything.
- **Expectations** — what a reasonable user assumes *at each step*, written
  before you look at what the app does. Writing these from the code's actual
  behaviour defeats the purpose: you will simply describe the friction as
  correct. Write the expectation first, then observe.

## Step 5 — Seed the expectations file

Write `.claude/ux-qa/PRODUCT_EXPECTATIONS.md` from
`${CLAUDE_PLUGIN_ROOT}/templates/PRODUCT_EXPECTATIONS.md`, then add any
app-specific lines the inventory implies. Every persisted-state key from step 1
that *should* survive a reload but does not is a line in this file.

Hard cap: **80 lines.** This is a contract the model must hold in working memory,
not documentation. Keep every line specific — a general line cannot be matched to
a concrete violation, and an expectation triage cannot match is an expectation
that never produces a silent fix.

## Keeping journeys current

Re-run this when routes or mutations change shape. A journey whose steps no
longer match the app is worse than no journey — it produces confident findings
about a screen that does not exist.
