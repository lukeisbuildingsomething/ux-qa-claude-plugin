---
description: Run the full synthetic-user UX audit now, ignoring the change detector.
argument-hint: "[optional: journey name, or 'all']"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent
---

Invoke the `ux-audit-loop` skill and follow it exactly.

Override step 1 (journey selection) as follows:
- If `$ARGUMENTS` names a journey, run only that one.
- If `$ARGUMENTS` is `all`, run every journey in `.claude/ux-qa/journeys/`.
- If `$ARGUMENTS` is empty, run the four journeys with the most `always: true` or
  highest-centrality entities.

Everything else — the parallel persona review, the triage caps, silent Tier 1
fixes, the two-sentence report — stays exactly as the skill specifies. In
particular, still do not paste the findings list into the conversation.
