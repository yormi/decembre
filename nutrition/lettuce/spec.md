# Nutrition — Salanova (specs modèle / recette)

Salanova post-transplant nutrition specs: tissue composition (DW%, mineral concentration), front-load defaults, lockout caps for lettuce, fertigation recipe constraints.

Cross-crop nutrition rules → `nutrition/spec.md`. UI specs → `nutrition/lettuce/app/spec.md`.

No Salanova-specific specs are wired today (2026-05-09). Cross-crop specs cover lettuce alongside tomato — notably REQ-024 (CE bands), REQ-025 (foliar burn cap), REQ-062 (single-fertigation-tank workflow).

Allocate new REQ-NNN via `scripts/claim-req.sh <spec-path> <persona>` from repo root.
