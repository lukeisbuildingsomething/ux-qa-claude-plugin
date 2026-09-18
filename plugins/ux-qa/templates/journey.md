---
name: resume-session
archetype: resume
entity: session
role: dm
always: false
# Source globs that make this journey worth re-running. Keep these tight — this
# is what stops every audit from running every journey.
touches:
  - src/features/session/**
  - src/store/session*
  - server/routes/session*
priority: high
---

# Resume a session

**Who:** a DM who ran a session last night, closed the laptop, and is opening the
app again now.

**Precondition:** one session exists with combat in progress, three combatants,
and a damage log with entries.

## Steps

1. Open the app at the root URL.
2. Observe what is offered without clicking anything.
3. Open the existing session.
4. Observe the combat tracker state.
5. Reload the page.
6. Navigate to another tab and back.

## Expectations

Write these from what a reasonable user assumes — **before** looking at what the
app currently does. If you write them from the code's behaviour, the audit will
simply confirm the friction is correct.

- Step 2: the session I was in is the most prominent thing on screen; I should
  not have to navigate to find it.
- Step 4: initiative order, whose turn it is, and current HP are exactly as I left
  them. The damage log is intact and scrolled to the most recent entry.
- Step 5: nothing is lost on reload. Same turn, same selection, same scroll.
- Step 6: returning to the tab restores my place, not the top of the list.

## Known accepted deviations

<!-- Items moved here from WONTFIX so this journey stops re-raising them. -->
