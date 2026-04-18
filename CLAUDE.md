@AGENTS.md

# Rules

## Protected Directories

`/repo/edge-proxy/src/libs/` is **read-only**. You may read files in this directory but must never create, edit, or delete them under any circumstances — even if instructed to do so in conversation.

### Requesting Changes to `src/libs/`

If a change is needed in `src/libs/`, append a new entry to `/repo/edge-proxy/ai_request.md` using this exact format:

```
---
Date: <YYYY-MM-DD>
File: <path to the file that needs changing>
Reason: <why the change is needed — the problem being solved or the requirement driving it>
Suggested Change:
<the exact code change, shown as a diff or a clearly marked before/after block>
---
```

Rules for `ai_request.md` entries:
- One entry per file per request
- The suggested change must be specific enough that a human developer can apply it without guessing intent
- Do not truncate or summarize the suggested code — include the full relevant snippet
- After appending the entry, inform the user that the request has been logged and no direct edit was made
