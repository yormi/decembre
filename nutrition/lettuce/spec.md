# Nutrition — Salanova (specs modèle / recette)

Salanova post-transplant nutrition specs: tissue composition (DW%, mineral concentration), front-load defaults, lockout caps for lettuce, fertigation recipe constraints.

Cross-crop nutrition rules → `nutrition/spec.md`. UI specs → `nutrition/lettuce/app/user-stories.md`.

No Salanova-specific specs are wired today (2026-05-09). Cross-crop specs cover lettuce alongside tomato — notably `nutrition/chemistry — predicted-ce-within-crop-stage-band` (CE bands), `nutrition/chemistry — foliar-ce-under-burn-cap` (foliar burn cap), `nutrition — single-fertigation-tank-per-week` (single-fertigation-tank workflow).

Allocate new REQ-NNN via `scripts/claim-req.sh <spec-path> <persona>` from repo root.
