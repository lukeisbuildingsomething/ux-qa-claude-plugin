---
description: Escape hatch. Open UX decisions are asked automatically after every audit, so you should never need this.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
---

Read `.claude/ux-qa/DECISIONS.md`.

Open decisions are asked automatically at the end of every audit, all of them, as
clickable questions. You should never need to run this — it exists only as a
manual escape hatch for when an audit ran unattended and nobody was there to
answer.

If the queue is empty, say so in one line and stop.

Otherwise ask the items **highest severity first, up to four in a single
`AskUserQuestion` call**, then repeat until the queue is empty. Each question:

- the question is the decision in plain language, one sentence, no jargon
- option 1 is your recommendation, labelled `(Recommended)`
- option 2 is the realistic alternative
- option 3 is `Leave it alone`
- each description is one short line: what they get, what it costs

After each answer:

- **Chosen fix** → implement it now, re-run the affected journey to confirm, mark
  the item resolved in `DECISIONS.md`, and add the resulting principle as one
  line in `PRODUCT_EXPECTATIONS.md` so it is never asked again.
- **Leave it alone** → move it to `WONTFIX.md` with the date and a one-line
  reason. Permanently dead; never raised again in any wording.

Then go straight to the next item without summarising the last one. Stop when the
queue is empty or the user says enough.
