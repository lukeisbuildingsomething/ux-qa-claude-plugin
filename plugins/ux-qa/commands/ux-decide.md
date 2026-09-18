---
description: Clear any UX decisions that are waiting, instead of getting them one per turn.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
---

Read `.claude/ux-qa/DECISIONS.md`.

Decisions normally surface on their own, one per turn, as you work. This command
exists for when you want to clear the backlog in one sitting instead.

If the queue is empty, say so in one line and stop.

Otherwise work the items **one at a time, highest severity first**, each as an
`AskUserQuestion`:

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
