---
name: retire-recipe
description: Use BEFORE editing any of the three live STORED recipe channels in index.html — `STORED_RECIPE.tomato.fertigation`, `STORED_RECIPE.tomato.sidedress`, or `STORED_RECIPE.tomato.foliaire`. Captures the current stored recipe state into `RECIPE_HISTORY` so the audit trail stays intact for organic certification. Invoke when the user asks to change a fertigation dose, retire a spray, swap a sidedress product, or any edit to a hand-stored recipe value. Do NOT use for plant-need edits (`RECIPE_INPUTS`, `TOMATO_FRUIT_EXPORT`, `BIOMASS_DEMAND`, lettuce-side constants) — those are model inputs, not stored recipes.
---

# Retire a recipe

Every edit to `STORED_RECIPE.tomato.{fertigation, sidedress, foliaire}` must capture the OLD state into `RECIPE_HISTORY` before the live constant is edited. Rendered by the Historique des nutriments admin page (`#admin/historique-nutriments`).

**Out of scope:** `RECIPE_INPUTS`, `TOMATO_FRUIT_EXPORT`, `BIOMASS_DEMAND`, lettuce-side constants. Edits to those shift the FP-target output of `computeStageRecipe(stage)` (Block 7 drift gauge) but do NOT change `STORED_RECIPE.tomato.fertigation` — hand-locked at PA Taillon's April 2026 values.

## Pre-flight

1. Confirm with user in one sentence: which channel, what's changing, why. Flag Ecocert / CAN-CGSB-32.311 status for any new product.
2. If it's a typo / non-material edit (no dose change), skip this skill and just edit.

## Step 1 — capture the live snapshot

User runs in browser DevTools console:

```js
copy(JSON.stringify(captureCurrentSnapshot(), null, 2))
```

`captureCurrentSnapshot()` lives in `index.html` near `RECIPE_HISTORY` and returns `structuredClone(STORED_RECIPE.tomato)` — all three channels go in even when only one is the trigger, so reviewers see the complete applied recipe at that date.

User pastes the JSON back into chat. That's the `fullSnapshot` payload.

If dev server isn't running, start it via the `static-dev-server` skill.

## Step 2 — append the new RECIPE_HISTORY entry

Edit `index.html` at `const RECIPE_HISTORY = [`. Insert at TOP (most-recent-first):

```js
{
  retired: 'YYYY-MM-DD',
  recipe: '<live-constant-name>',           // e.g. 'STORED_RECIPE.tomato.foliaire.A'
  summary: '<one-line FR, ~60 chars>',      // shows in table row
  reason: '<why — full sentence FR>',       // shows on expand
  replacedBy: '<pointer to new value>',     // optional
  fullSnapshot: { ...paste from step 1... },
},
```

- `summary`: short French, e.g. `"Dose Cu réduite 4 g → 2 g par 15 L"`.
- `reason`: 1-2 sentences with the trigger (tissue test, image diagnostic, PA Taillon call, audit finding).
- `replacedBy`: name the new state in plain language. Recommended.
- `fullSnapshot`: OLD state. Do not edit the live constant before this entry is in.

## Step 3 — edit the live constant

Only after step 2 is saved, apply the change to `STORED_RECIPE.tomato.{fertigation, sidedress, foliaire}`.

## Step 4 — verify

```bash
bash scripts/check-requirements.sh
```

Fix any regression before declaring done.

## Step 5 — log to changelog

Append one line at the top of the most-recent date section in `working files/changelog.md`:

```
- 09:30 — STORED_RECIPE.tomato.foliaire.A Cu retiré (4 g → 2 g par 15 L). Snapshot complet capturé dans RECIPE_HISTORY. 56/56 PASS.
```

## Anti-patterns

- **Don't edit the live constant before capturing.** If you already did, restore from `git diff` BEFORE staging, run the skill, re-apply.
- **Don't fabricate snapshots from memory or git.** Always use `captureCurrentSnapshot()` against the live page.
- **Don't invoke this skill for model inputs** — `RECIPE_INPUTS`, `TOMATO_FRUIT_EXPORT`, `BIOMASS_DEMAND`, lettuce-side. Edit those freely.
- **Don't skip step 2 for "small" changes.** A 4 → 2 g Cu cut is exactly what Ecocert audits.

## Cross-references

- `index.html`: `STORED_RECIPE`, `RECIPE_HISTORY`, `captureCurrentSnapshot()`, `buildHistoriqueNutriments()`.
- `working files/changelog.md`: append-only (separate from the audit trail).
- CLAUDE.md: parallel-session staleness, organic-cert flagging.
