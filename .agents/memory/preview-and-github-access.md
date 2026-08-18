---
name: Preview and GitHub access
description: Environment-specific guidance for preview port reuse and secure GitHub pushes.
---

The workspace can retain an old artifact preview process after its workflow is removed, so a new Vite workflow may report that its configured port is already in use even when the new workflow is stopped. GitHub remotes should remain credentialless; use a one-off authenticated push rather than persisting a token in `.git/config`.

**Why:** A stale mockup server occupied the web port during the BabiesIQ workflow setup, and the first Git push auth format was rejected even though the token had read access.

**How to apply:** Check the listener and workflow logs before restarting after a port timeout. Start standalone Vite with an explicit host/port/strict-port command, clean only the identified stale process, and use a temporary authenticated Git header for pushes.