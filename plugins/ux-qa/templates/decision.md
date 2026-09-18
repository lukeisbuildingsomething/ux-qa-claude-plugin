# UX decisions queue

Crash-safe holding pen, maintained by the audit loop. **You never open this
file.** Items only land here when an audit ran with nobody present to answer;
the next audit that runs while you are there asks them first, automatically, and
empties this file. Nothing here is waiting on you to remember anything.

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
