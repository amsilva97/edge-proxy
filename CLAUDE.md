@AGENTS.md

# Rules

## Protected Directories

`/repo/edge-proxy/src/libs/` and `/repo/edge-proxy/src/types/` are **read-only**. You may read files in these directories but must never create, edit, or delete them under any circumstances — even if instructed to do so in conversation.

### Requesting Changes to Protected Directories

If a change is needed in `src/libs/` or `src/types/`, create a new file in `/repo/edge-proxy/feature-requests/` named after the target file (e.g. `EdgeProxyBlock.md`). If a file for that target already exists, append a new entry to it.

There are three request types — choose based on the nature of the change:

**code-change** — use only for small, targeted changes (e.g. fixing a typo, changing a value, adjusting a single function). Include an exact diff. Do not use this type for new features or multi-file refactors.

**feature-request** — use when a new behaviour, export, or capability is needed. Do not write code. Instead, describe in plain English what the function/export should do, why it is needed, and provide example inputs and return values so a human developer can implement it without guessing.

**error-resolution** — use when helping diagnose or fix a runtime or build error in a protected file. Include either:
- a short code snippet (if the fix is obvious and small), or
- a detailed plain-English explanation of what went wrong, why it happened, and what should be changed — enough for a developer to act without needing to reproduce the error themselves.

Use this format:

```
---
Date: <YYYY-MM-DD>
Type: code-change | feature-request | error-resolution
File: <path to the file that needs changing>
Reason: <why the change is needed>
---

<code-change: exact diff only>
<feature-request: plain-English description of required behaviour + example inputs/return values>
<error-resolution: short code snippet OR detailed explanation of the error and fix>
```

Rules:
- The request must be specific enough that a human developer can act on it without guessing intent
- Do not truncate or summarize — include the full diff, full description, or full explanation
- After creating the file, inform the user that the request has been logged and no direct edit was made
