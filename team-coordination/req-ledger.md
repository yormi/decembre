# REQ-NNN claim ledger

Append-only log of REQ-NNN allocations across all parallel Claude sessions on this checkout. Closes the silent-allocation race documented in `team-coordination/plant-nutrition-specialist/from-model-challenger-done.md` (C3 entry — "second REQ-145 collision in one day across parallel sessions — silent allocation is losing to clock skew").

## How allocation works

1. Persona invokes `scripts/claim-req.sh <target-spec-path> <persona-name>`.
2. Wrapper acquires `flock` on this file, scans `requirements.md` + `nutrition/**/spec.md` + `yield-range/**/spec.md` + this ledger's tail for the highest `REQ-NNN`, computes `next = max + 1`, appends a claim row below, releases the lock, echoes the claimed id.
3. Persona writes the spec entry under that id and commits.

Subproject scaffolding (`/new-subproject` and similar) calls the wrapper N times back-to-back under one outer `flock` to reserve a contiguous range.

## Format

`YYYY-MM-DDTHH:MM:SSZ — REQ-NNN — <persona> — <session-id-or-claude-code> — <intended target spec path>`

One claim per line. Most recent at the bottom (true append).

## Bypassing the wrapper

`scripts/check-requirements.sh` emits a soft warning when a committed REQ has no ledger row. Don't bypass — the warning is the visible end of the same race that prompted this ledger.

## Claims

2026-05-14T07:30:00Z — REQ-154 — seed — bootstrap — nutrition/tomato/fertigation-recipe/spec.md
2026-05-15T12:28:09Z — REQ-155 — plant-nutrition-specialist — claude-code — nutrition/tomato/fertigation-recipe/spec.md
2026-05-15T19:06:15Z — REQ-156 — product-owner — claude-code — nutrition/spec.md
2026-05-15T19:19:25Z — REQ-157 — product-owner — claude-code — nutrition/spec.md
2026-05-16T01:40:52Z — REQ-158 — product-owner — claude-code — requirements.md
2026-05-16T19:00:50Z — REQ-159 — product-owner — claude-code — nutrition/spec.md
2026-05-16T19:00:50Z — REQ-160 — product-owner — claude-code — nutrition/spec.md
2026-05-16T19:00:50Z — REQ-161 — product-owner — claude-code — nutrition/spec.md
2026-05-16T19:00:50Z — REQ-162 — product-owner — claude-code — nutrition/spec.md
2026-05-16T19:00:50Z — REQ-163 — product-owner — claude-code — nutrition/tomato/app/spec.md
2026-05-16T20:43:17Z — REQ-164 — plant-nutrition-specialist — claude-code — nutrition/soil-contribution/spec.md
2026-05-16T20:46:49Z — REQ-165 — plant-nutrition-specialist — claude-code — nutrition/lettuce/plant-needs/spec.md
2026-05-16T20:46:49Z — REQ-166 — plant-nutrition-specialist — claude-code — nutrition/lettuce/plant-needs/spec.md
2026-05-16T20:46:49Z — REQ-167 — plant-nutrition-specialist — claude-code — nutrition/lettuce/plant-needs/spec.md
2026-05-16T20:46:49Z — REQ-168 — plant-nutrition-specialist — claude-code — nutrition/lettuce/plant-needs/spec.md
2026-05-16T20:46:49Z — REQ-169 — plant-nutrition-specialist — claude-code — nutrition/lettuce/plant-needs/spec.md
2026-05-16T21:07:44Z — REQ-170 — plant-nutrition-specialist — claude-code — /home/guillaume/Documents/Random_Projects/decembre/nutrition/tomato/foliar-recipe/spec.md
2026-05-17T16:27:27Z — REQ-171 — plant-nutrition-specialist — claude-code — yield-range/spec.md
2026-05-17T16:36:25Z — REQ-172 — plant-nutrition-specialist — claude-code — yield-range/spec.md
2026-05-17T16:36:25Z — REQ-173 — plant-nutrition-specialist — claude-code — yield-range/spec.md
2026-05-17T16:36:25Z — REQ-174 — plant-nutrition-specialist — claude-code — yield-range/spec.md
2026-05-17T16:36:25Z — REQ-175 — plant-nutrition-specialist — claude-code — yield-range/spec.md
2026-05-17T16:59:41Z — REQ-176 — product-owner — claude-code — nutrition/lettuce/app/spec.md
2026-05-18T00:15:56Z — REQ-177 — product-owner — claude-code — nutrition/lettuce/app/spec.md
2026-05-18T00:15:56Z — REQ-178 — product-owner — claude-code — nutrition/lettuce/app/spec.md
2026-05-18T00:15:56Z — REQ-179 — product-owner — claude-code — nutrition/lettuce/app/spec.md
2026-05-18T00:15:56Z — REQ-180 — product-owner — claude-code — nutrition/lettuce/app/spec.md
