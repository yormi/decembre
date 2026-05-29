# Tomate — foliar-strategy — operator

## Problem

The mixing recipe and the spray schedule live in separate model outputs. Without a single operator-facing surface, the team has to reconcile per-recipe doses and per-day assignments by hand each morning.

## Solution

A read-only operator surface with two views: **recipe sheet** (per-recipe weighing instructions) and **weekly calendar** (which recipe to spray which day). Both views render deterministically from the foliar-strategy model output.

---

## recipe-sheet-per-recipe

The recipe sheet renders one block per non-empty recipe key in
`STORED_RECIPE.tomato.foliaire` (today: `A` oligos + `B` Ca²⁺).
Each block shows the product list with weighing quantities exactly
as stored — operator page is a direct view of the hand-stored
recipe (same pattern as fertigation + sidedress operator pages),
not a derivation from the model strategy. Predicted CE, predicted
tank pH, and the surfactant flag are NOT surfaced (builder-only).

---

## no-frequency-input

The surface carries no spray-count input, no day-picker, no
recipe-on / recipe-off toggle. The model decides what gets
sprayed and when; the operator surface is read-only on those
axes. Operator inputs that DO appear (e.g. tissue-read feedback
fields) are scoped to upstream model inputs, not strategy
overrides.

---

## Out of Scope

- Operator-side day override — the calendar is read-only on this surface; day shifts require editing `nutrition — farm-working-days` data (see `procedure — no-operator-day-override`).
- Frequency input — model decides spray count per recipe (see `no-frequency-input`).
