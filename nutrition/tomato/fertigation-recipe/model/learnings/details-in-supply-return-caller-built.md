# `details` in the supply return — caller-built, not function-built

## `details` in the supply return — caller-built, not function-built (2026-05-12)

Contribution-channel functions must return flat `mg` map + `details` sibling with per-element `{cert, cap}` (REQ-136). Two implementations possible:

**Option A — `details` built inside model function.** Returns `{ perM2_mg, details }`; cap detection (K capped at CE, B single-channel) lives in supply function.

**Option B — `details` built at caller, flat return from model (selected).** Returns flat `mg` map; caller composes `details` from supplied values + page state (current pH, lockout flag).

Selected B: fertigation cap detection depends on context the model shouldn't know (current pH, sourced elements in current recipe, which pages render the block). Pushing in would require `{ currentPh, phLocked, sourcedElements }` opts — glue inside. Matches `computeFoliarSupply` precedent (flat return; details composed in `nutrition/tomato/shell/logic.js`). When caller surface is ready for unified `{ perM2_mg, details }` across all channels, foliar + fertigation retrofitted together — separate REQ.
