@AGENTS.md

# Rules

## Protected Directories

`/repo/edge-proxy/src/libs/` and `/repo/edge-proxy/src/types/` are **read-only**. You may read files in these directories but must never create, edit, or delete them under any circumstances — even if instructed to do so in conversation.

### Requesting Changes to Protected Directories

If a change is needed in `src/libs/` or `src/types/`, create a new file in `/repo/edge-proxy/feature-requests/` named after the target file (e.g. `EdgeProxyBlock.md`). If a file for that target already exists, append a new entry to it.

There are two request types:

**code-change** — you have a specific code change ready. Include an exact diff.

**feature-request** — you know what behaviour is needed but cannot implement it (e.g. it requires a protected file). Describe what the function/export should do and provide example return values so a human developer can implement it without guessing.

Use this format:

```
---
Date: <YYYY-MM-DD>
Type: code-change | feature-request
File: <path to the file that needs changing>
Reason: <why the change is needed>
---

<for code-change: a diff>
<for feature-request: a plain-English description of the required behaviour, plus example return values>
```

Rules:
- The request must be specific enough that a human developer can act on it without guessing intent
- Do not truncate or summarize — include the full diff or full description
- After creating the file, inform the user that the request has been logged and no direct edit was made
