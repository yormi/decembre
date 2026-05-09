---
name: retire-recipe
description: Use BEFORE editing any of the three live STORED recipe channels in index.html — `STORED_RECIPE.tomato.fertigation`, `STORED_RECIPE.tomato.sidedress`, or `STORED_RECIPE.tomato.foliaire`. Captures the current stored recipe state into `RECIPE_HISTORY` so the audit trail stays intact for organic certification. Invoke when the user asks to change a fertigation dose, retire a spray, swap a sidedress product, or any edit to a hand-stored recipe value. Do NOT use for plant-need edits (`RECIPE_INPUTS`, `TOMATO_FRUIT_EXPORT`, `BIOMASS_DEMAND`, lettuce-side constants) — those are model inputs, not stored recipes.
---

# Retire a recipe

Audit-trail procedure for organic-cert. Every change to `STORED_RECIPE.tomato.fertigation`, `STORED_RECIPE.tomato.sidedress`, or `STORED_RECIPE.tomato.foliaire` (the three hand-stored tomato recipe channels) must capture the OLD state into `RECIPE_HISTORY` before the live constant is edited. The Historique des nutriments admin page (`#admin/historique-nutriments`) renders these entries.

**Out of scope:** plant-need / model inputs (`RECIPE_INPUTS`, `TOMATO_FRUIT_EXPORT`, `BIOMASS_DEMAND`) and lettuce-side constants. Editing those does shift the FP-target output of `computeStageRecipe(stage)` (used by the Block 7 stored-vs-FP drift gauge), but it does NOT change `STORED_RECIPE.tomato.fertigation` — that's hand-locked at PA Taillon's April 2026 values and only changes via deliberate edits.

## Pre-flight

1. Confirm the change with the user in one sentence: which channel under `STORED_RECIPE.tomato`, what's changing, and why. Note Ecocert / CAN-CGSB-32.311 status if a new product is being introduced (per CLAUDE.md memory: always flag organic-cert status).
2. Confirm the user wants the change logged for audit. If they say it's a typo fix or a non-material edit (no actual dose change), skip this skill and just edit.

## Step 1 — capture the live snapshot

The user runs this in their browser DevTools console on the running app:

```js
copy(JSON.stringify(captureCurrentSnapshot(), null, 2))
```

That helper lives in `index.html` near `RECIPE_HISTORY` and returns `structuredClone(STORED_RECIPE.tomato)` — the full `{ fertigation, sidedress, foliaire }` object as it currently exists. All three channels go into the audit even when only one is the direct trigger of the retirement, so future reviewers see the complete applied recipe at that date.

Ask the user to paste the JSON back into the chat. This is the `fullSnapshot` payload for the new entry.

If the dev server isn't running, start it via the `static-dev-server` skill first.

## Step 2 — append the new RECIPE_HISTORY entry

Edit `index.html` at the `RECIPE_HISTORY` array (search for `const RECIPE_HISTORY = [`). Insert the new entry at the TOP of the array (most-recent-first), above any existing entries. Shape:

```js
{
  retired: 'YYYY-MM-DD',                    // today's date
  recipe: '<live-constant-name>',           // 'STORED_RECIPE.tomato.fertigation' | 'STORED_RECIPE.tomato.sidedress' | 'STORED_RECIPE.tomato.foliaire.A' etc.
  summary: '<one-line FR, ~60 chars>',      // shows in the table row
  reason: '<why — full sentence FR>',       // shows on expand
  replacedBy: '<pointer to the new value>', // optional, shows on expand
  fullSnapshot: { ...paste from step 1... },
},
```

Field rules:
- `summary`: short, French, table-row friendly. e.g., `"Dose Cu réduite 4 g → 2 g par 15 L"`.
- `reason`: 1-2 sentences with the *why*. Cite the trigger (tissue test, image diagnostic, audit finding, agronomist call from PA Taillon, etc.) so a future reviewer can reconstruct the call.
- `replacedBy`: name the new state in plain language. Optional but recommended.
- `fullSnapshot`: must be the OLD state (pre-edit). Do not edit the live constant before this entry is in.

## Step 3 — edit the live constant

Only after step 2 is saved, apply the actual recipe change to the live constant under `STORED_RECIPE.tomato.{fertigation, sidedress, foliaire}`.

## Step 4 — verify

Run from the project root:

```bash
bash scripts/check-requirements.sh
```

All previously passing REQs must still pass. If any regress, investigate before declaring done — do not commit a regressed REQ.

## Step 5 — log to changelog

Append a one-line entry at the top of the most-recent date section in `working files/changelog.md`. Format: `HH:MM — short FR description, retire-recipe + actual change summary`. Example:

```
- 09:30 — STORED_RECIPE.tomato.foliaire.A Cu retiré (4 g → 2 g par 15 L). Snapshot complet capturé dans RECIPE_HISTORY. 56/56 PASS.
```

## Anti-patterns

- **Do not edit the live constant before capturing the snapshot.** If you've already edited and forgot to capture, restore from `git diff` BEFORE staging, then run the skill, then re-apply.
- **Do not fabricate snapshots from memory or git history.** Always use `captureCurrentSnapshot()` against the live page.
- **Do not invoke this skill for plant-need / model edits** — `RECIPE_INPUTS`, `TOMATO_FRUIT_EXPORT`, `BIOMASS_DEMAND`, and lettuce-side constants are not triggers. Edit them freely. (Note: such edits shift the FP-target output of `computeStageRecipe(stage)` shown in the Block 7 drift gauge, but they do NOT change `STORED_RECIPE.tomato.fertigation` — that's a locked constant.)
- **Do not skip step 2 because "the change is small".** A 4 → 2 g cut on Cu is exactly the kind of change Ecocert audits will ask about.

## Cross-references

- `index.html`: `STORED_RECIPE`, `RECIPE_HISTORY`, `captureCurrentSnapshot()`, `buildHistoriqueNutriments()`.
- `working files/changelog.md`: append-only changelog (separate from the audit trail).
- CLAUDE.md: parallel-session staleness mitigation, organic-cert flagging rule.
