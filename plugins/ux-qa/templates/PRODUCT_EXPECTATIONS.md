# Product expectations

The contract every UI change is audited against.

Hard cap: **80 lines.** When adding a line would exceed it, **prune, do not
merge.** Drop the line whose journey no audit has exercised in the last ~20 runs,
or that no finding has matched since it was written. Never blend two specific
lines into one general one: triage can only auto-fix a finding when it violates a
*specific* written line, so a vague expectation silently converts silent fixes
into questions for the human. Specificity is the whole value of this file.

A file that grows without limit gets skimmed and stops working.

## Global

- Never ask for data the app already knows — from this session, this context, or the last one.
- Filters, sorts, tabs, selections and view modes survive reload and navigation.
- Work in progress survives an accidental close. Drafts are never silently lost.
- The current URL reproduces the current screen. If it doesn't, state is in the wrong place.
- Destructive actions have a confirm or an undo. Non-destructive ones have neither.
- Every action acknowledges itself within 100ms, before the result arrives.
- After creating something, land the user somewhere useful — usually the thing they just made.
- Empty states say what this is and what to do next, with the action right there.
- Errors say what to do about it, not what went wrong internally. Never lose the user's input on error.
- Frequently repeated desktop actions have a keyboard path. Escape closes, Enter submits.
- Primary workflows complete without leaving the screen they started on.
- Fields with an obvious correct value are pre-filled, not left blank.
- On mobile, the primary action is reachable with one thumb without scrolling.
- Anything that can be remembered as a preference, is.
- Long lists get search, filter and sort before they get long.

## App-specific

<!-- Added by the audit loop as principles are discovered. Keep them concrete. -->
