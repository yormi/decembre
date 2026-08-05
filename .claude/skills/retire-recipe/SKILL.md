---
name: retire-recipe
description: Use BEFORE editing any live STORED recipe channel — `STORED_RECIPE.tomato.{fertigation,sidedress,foliaire}`, `STORED_RECIPE.nursery.fertigation`, or `STORED_RECIPE.lettuce.fertigation` (each defined in its own subproject `stored.js`). Captures the current stored recipe state into `RECIPE_HISTORY` so the audit trail stays intact for organic certification. Invoke when the user asks to change a fertigation dose, retire a spray, swap a sidedress product, or any edit to a hand-stored recipe value. Do NOT use for plant-need edits (`RECIPE_INPUTS`, `TOMATO_FRUIT_EXPORT`, `BIOMASS_DEMAND`, model-input constants) — those are model inputs, not stored recipes.
---

# Retire a recipe

Every edit to a STORED recipe channel (`STORED_RECIPE.tomato.{fertigation, sidedress, foliaire}`, `STORED_RECIPE.nursery.fertigation`, `STORED_RECIPE.lettuce.fertigation`) must capture the OLD state into `RECIPE_HISTORY` before the live constant is edited. Rendered by the Historique des nutriments admin page (`#admin/historique-nutriments`).

**Where the data lives (source of truth = the `.js` source files, NOT the running app):**

| Channel | Live-constant source file | RECIPE_HISTORY |
|---|---|---|
| fertigation | `nutrition/tomato/protocol/fertigation/stored.js` | `app/admin/nutrition/historique/history.js` |
| sidedress | `nutrition/tomato/protocol/sidedress/stored.js` | (same) |
| foliaire | `nutrition/tomato/protocol/foliar/stored.js` | (same) |
| nursery (semis feed) | `protocol/fertigation/lettuce/seedlings-week-2-to-transplant.js` | (same) |
| lettuce (production fertigation) | `protocol/fertigation/lettuce/transplanted.js` | (same) |

Tomato `stored.js` assigns `window.STORED_RECIPE.tomato.<channel> = {...}`; nursery assigns `window.STORED_RECIPE.nursery.fertigation = {...}` (flat `{product: dose}`, per-litre — mirror `NURSERY_RECIPE_DEFAULT`); lettuce assigns `window.STORED_RECIPE.lettuce.fertigation = {...}` (flat `{product: dose}`, grams per weekly block — mirror `LETTUCE_FERTIGATION_RECIPE` in `app/core/state.js`). `RECIPE_HISTORY` is the array in `history.js` at `const RECIPE_HISTORY = [`.

Flat snapshot shapes — capture ONLY the triggered channel (the render diffs per-channel; don't paste other channels in):
- Nursery: `fullSnapshot: { nursery: { Ocean_15_1_1, AcadiePoisson, AcadieKelp, IronSulfate } }`.
- Lettuce: `fullSnapshot: { lettuce: { Potassium, Bore } }`.

**Out of scope:** `RECIPE_INPUTS`, `TOMATO_FRUIT_EXPORT`, `BIOMASS_DEMAND`, and lettuce model-input constants (`LETTUCE` bilan per-100 m², `LETTUCE_SOL_RECIPE`). Edits to those shift the FP-target output of `computeStageRecipe(stage)` (Block 7 drift gauge) but do NOT change `STORED_RECIPE.tomato.fertigation` outside this skill — hand-stored audit-trail channel (current values are Haifa-heritage; PA Taillon recommendation is the FP target, not STORED).

## Pre-flight

1. Confirm with user in one sentence: which channel, what's changing, why. Flag Ecocert / CAN-CGSB-32.311 status for any new product.
2. If it's a typo / non-material edit (no dose change), skip this skill and just edit.

## Step 1 — capture the snapshot from the source files

Read the trigger channel's source file (table above) and copy its current literal values into `fullSnapshot`.

- **Tomato trigger** → capture all THREE tomato channels (`fertigation`, `sidedress`, `foliaire`), so reviewers see the complete applied tomato recipe at that date.
- **Nursery or lettuce trigger** → capture ONLY that channel — each is a single-channel crop with its own lineage; the render diffs per-channel.
- The source `.js` files are the source of truth. **Do NOT read the running browser app** — the dev-server bundle can be stale (un-rebuilt), so the live page may show a prior recipe. The data structures in the files are authoritative.
- Copy the object literals verbatim, preserving legacy key names (e.g. tomato fertigation boron sits under the key `borax` even though the product is Solubore — keep `borax`; the render path labels it).
- `fullSnapshot` shapes: tomato `{ fertigation: {T1..T5}, sidedress: {T1..T5}, foliaire: {masterVol, backpacks, area, A:[...], B:[...]} }`; nursery `{ nursery: {product: dose} }`; lettuce `{ lettuce: {Potassium, Bore} }`.

## Step 2 — append the new RECIPE_HISTORY entry

Edit `app/admin/nutrition/historique/history.js` at `const RECIPE_HISTORY = [`. Insert at TOP (most-recent-first):

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

Only after step 2 is saved, apply the change in the channel's `stored.js` source file (table above). For lettuce, also keep `LETTUCE_FERTIGATION_RECIPE` (`app/core/state.js`) in step — it's the operator-facing source the mirror tracks.

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
- **Don't read the running browser app for the snapshot.** The dev-server bundle can be stale (un-rebuilt), showing a prior recipe. Read the `stored.js` source files — they're authoritative.
- **Don't fabricate snapshots from memory.** Copy the current literals out of the source files verbatim.
- **Don't invoke this skill for model inputs** — `RECIPE_INPUTS`, `TOMATO_FRUIT_EXPORT`, `BIOMASS_DEMAND`, lettuce-side. Edit those freely.
- **Don't skip step 2 for "small" changes.** A 4 → 2 g Cu cut is exactly what Ecocert audits.

## Cross-references

- Live STORED source files (source of truth):
  - `nutrition/tomato/protocol/fertigation/stored.js`
  - `nutrition/tomato/protocol/sidedress/stored.js`
  - `nutrition/tomato/protocol/foliar/stored.js`
- `app/admin/nutrition/historique/history.js`: `RECIPE_HISTORY` array + entry-shape doc.
- `app/index.html`: `window.STORED_RECIPE = { tomato: {} }` boot stub (channels assigned by the `stored.js` files above); `captureCurrentSnapshot()` browser helper still exists in `app/core/nutriment.js` but is NOT used by this skill.
- `working files/changelog.md`: append-only (separate from the audit trail).
- CLAUDE.md: parallel-session staleness, organic-cert flagging.
