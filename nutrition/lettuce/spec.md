# Nutrition — Salanova (specs modèle / recette)

Salanova post-transplant nutrition specs: tissue composition (DW%, mineral
concentration), front-load defaults, lockout caps for lettuce, fertigation
recipe constraints.

Cross-crop nutrition rules (chemistry, products, organic cert, mass-balance
framing) live in `nutrition/spec.md`. UI-side specs for the Salanova Nutrition
admin page live in `nutrition/lettuce/app/spec.md`.

No Salanova-specific specs are wired today (2026-05-09). Cross-crop
specs in `nutrition/spec.md` (notably REQ-024 CE bands, REQ-025 foliar burn
cap, REQ-062 single-fertigation-tank workflow) cover lettuce alongside
tomato.

Add new specs here with the next available REQ-NNN id from the global pool
(see `requirements.md` "How to add a new spec" section).
