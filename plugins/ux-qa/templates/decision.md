# UX decisions queue

Buffer of decisions waiting their turn. Items surface automatically, one per
turn, as you work — you should never need to open this file. It exists so
nothing is lost between turns. `/ux-decide` clears the backlog in one sitting if
you would rather do that.

Resolved items move to the bottom. Rejected items move to `WONTFIX.md`.

---

## [open] <one-line title>

- **Date:** YYYY-MM-DD
- **Journey:** <journey name>
- **Severity:** loses work | blocks | slows | annoys
- **Observed:** <what the app does now>
- **Expected:** <what a reasonable user assumes>
- **Why this needs you:** <the tradeoff, the new concept, or the scope question>
- **Recommended default:** <what I'd do, and why>
- **Cost of doing nothing:** <what stays broken, and for whom>
- **Evidence:** <screenshot path>

---

## Resolved

<!-- ## [resolved YYYY-MM-DD] title — decision taken, and the expectation line it produced -->
