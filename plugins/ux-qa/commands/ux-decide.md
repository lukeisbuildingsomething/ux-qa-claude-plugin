---
description: Work through the queued UX product decisions, one at a time.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
---

Read `.claude/ux-qa/DECISIONS.md`.

If the queue is empty, say so in one line and stop.

Otherwise take the **highest-severity open item only** — not the whole queue —
and put it to the user with `AskUserQuestion`. Frame it as a choice, never as a
report:

- the question is the product decision in plain language, one sentence
- option 1 is your recommended default, labelled `(Recommended)`
- option 2 is the realistic alternative
- option 3 is `Won't fix`
- each option's description says what the user gets and what it costs

Then:

- **Chosen fix** → implement it now, re-run the affected journey to confirm, mark
  the item resolved in `DECISIONS.md`, and add the resulting principle as one
  line in `PRODUCT_EXPECTATIONS.md` so it never has to be decided again.
- **Won't fix** → move it to `WONTFIX.md` with the date and a one-line reason.
  It is now permanently dead; the triage agent will never raise it again.

Then ask whether to continue to the next item. One decision per exchange. The
point of this command is that the user spends their attention on product
judgement, not on reading a backlog.
