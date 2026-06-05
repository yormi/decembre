---
name: retire-recipe
description: Use BEFORE editing any of the three live STORED recipe channels — `STORED_RECIPE.tomato.fertigation`, `STORED_RECIPE.tomato.sidedress`, or `STORED_RECIPE.tomato.foliaire` (each defined in its own subproject `procedure/stored.js`). Captures the current stored recipe state into `RECIPE_HISTORY` so the audit trail stays intact for organic certification. Invoke when the user asks to change a fertigation dose, retire a spray, swap a sidedress product, or any edit to a hand-stored recipe value. Do NOT use for plant-need edits (`RECIPE_INPUTS`, `TOMATO_FRUIT_EXPORT`, `BIOMASS_DEMAND`, lettuce-side constants) — those are model inputs, not stored recipes.
---

# Retire a recipe

Every edit to `STORED_RECIPE.tomato.{fertigation, sidedress, foliaire}` must capture the OLD state into `RECIPE_HISTORY` before the live constant is edited. Rendered by the Historique des nutriments admin page (`#admin/historique-nutriments`).

**Where the data lives (source of truth = the `.js` source files, NOT the running app):**

| Channel | Live-constant source file | RECIPE_HISTORY |
|---|---|---|
| fertigation | `nutrition/tomato/fertigation-recipe/procedure/stored.js` | `app/historique-nutriments/history.js` |
| sidedress | `nutrition/tomato/sidedress-recipe/procedure/stored.js` | (same) |
| foliaire | `nutrition/tomato/foliar-strategy/procedure/stored.js` | (same) |

Each `stored.js` assigns `window.STORED_RECIPE.tomato.<channel> = {...}`. `RECIPE_HISTORY` is the array in `history.js` at `const RECIPE_HISTORY = [`.

**Out of scope:** `RECIPE_INPUTS`, `TOMATO_FRUIT_EXPORT`, `BIOMASS_DEMAND`, lettuce-side constants. Edits to those shift the FP-target output of `computeStageRecipe(stage)` (Block 7 drift gauge) but do NOT change `STORED_RECIPE.tomato.fertigation` outside this skill — hand-stored audit-trail channel (current values are Haifa-heritage; PA Taillon recommendation is the FP target, not STORED).

## Pre-flight

1. Confirm with user in one sentence: which channel, what's changing, why. Flag Ecocert / CAN-CGSB-32.311 status for any new product.
2. If it's a typo / non-material edit (no dose change), skip this skill and just edit.

## Step 1 — capture the snapshot from the source files

Read the THREE `procedure/stored.js` source files (table above) and copy their current literal values into the `fullSnapshot` — all three channels go in even when only one is the trigger, so reviewers see the complete applied recipe at that date.

- The source `.js` files are the source of truth. **Do NOT read the running browser app** — the dev-server bundle can be stale (un-rebuilt), so the live page may show a prior recipe. The data structures in the files are authoritative.
- Copy the object literals verbatim, preserving legacy key names (e.g. fertigation boron sits under the key `borax` even though the product is Solubore — keep `borax` in the snapshot; the render path labels it).
- `fullSnapshot` shape mirrors `STORED_RECIPE.tomato`: `{ fertigation: {T1..T5}, sidedress: {T1..T5}, foliaire: {masterVol, backpacks, area, A:[...], B:[...]} }`.

## Step 2 — append the new RECIPE_HISTORY entry

Edit `app/historique-nutriments/history.js` at `const RECIPE_HISTORY = [`. Insert at TOP (most-recent-first):

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

Only after step 2 is saved, apply the change in the channel's `procedure/stored.js` source file (table above) — `STORED_RECIPE.tomato.{fertigation, sidedress, foliaire}`.

## Step 4 — verify

```bash
bash scripts/check-spec.sh
```

Fix any regression before declaring done.

## Step 5 — log to changelog

Append one line at the top of the most-recent date section in `working files/changelog.md`:

```
- 09:30 — STORED_RECIPE.tomato.foliaire.A Cu retiré (4 g → 2 g par 15 L). Snapshot complet capturé dans RECIPE_HISTORY. 56/56 PASS.
```

## Anti-patterns

- **Don't edit the live constant before capturing.** If you already did, restore from `git diff` BEFORE staging, run the skill, re-apply.
- **Don't read the running browser app for the snapshot.** The dev-server bundle can be stale (un-rebuilt), showing a prior recipe. Read the `procedure/stored.js` source files — they're authoritative.
- **Don't fabricate snapshots from memory.** Copy the current literals out of the source files verbatim.
- **Don't invoke this skill for model inputs** — `RECIPE_INPUTS`, `TOMATO_FRUIT_EXPORT`, `BIOMASS_DEMAND`, lettuce-side. Edit those freely.
- **Don't skip step 2 for "small" changes.** A 4 → 2 g Cu cut is exactly what Ecocert audits.

## Cross-references

- Live STORED source files (source of truth):
  - `nutrition/tomato/fertigation-recipe/procedure/stored.js`
  - `nutrition/tomato/sidedress-recipe/procedure/stored.js`
  - `nutrition/tomato/foliar-strategy/procedure/stored.js`
- `app/historique-nutriments/history.js`: `RECIPE_HISTORY` array + entry-shape doc.
- `app/index.html`: `window.STORED_RECIPE = { tomato: {} }` boot stub (channels assigned by the `stored.js` files above); `captureCurrentSnapshot()` browser helper still exists in `app/operator/nutriment.js` but is NOT used by this skill.
- `working files/changelog.md`: append-only (separate from the audit trail).
- CLAUDE.md: parallel-session staleness, organic-cert flagging.
