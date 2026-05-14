---
name: new-subproject
description: Use when carving out a new subproject under the spec tree (e.g. `nutrition/<crop>/<topic>/`, `yield-range/<topic>/`, a new top-level domain). Scaffolds the conventional file layout (`spec.md` + optional `derivation.md` / `data.js` / `calc.js` / `model.js`) and either starts blank ("from scratch") or extracts existing work (REQs, sections, code) out of a parent file into the new home. Mirrors the conventions established by `nutrition/tomato/plant-needs/`, `nutrition/tomato/sidedress-recipe/`, `nutrition/compost-contribution/`, `yield-range/`. Does NOT manage REQ-range allocation — Guillaume picks numbers himself or they ride along when extracting.
---

# Carve out a subproject

A "subproject" here = a self-contained slice with its own `spec.md` (normative claims), optionally `derivation.md` (formulas + rationale), and optionally a code triplet `data.js` / `calc.js` / `model.js` (constants → pure functions → public `window.*` namespace). Examples in the repo: `nutrition/tomato/plant-needs/`, `nutrition/tomato/sidedress-recipe/`, `nutrition/compost-contribution/`, `yield-range/`.

The point of the skill: the boilerplate is mechanical (scaffold files, match section headings, append parent-spec pointer, register in build pipeline, log to changelog) and easy to half-do. This skill enforces the full pass.

## Pre-flight — gather intent (ask the user, in order)

Ask each of these explicitly. Don't guess. Repeat back the user's answers in one block before scaffolding so they can correct.

1. **Intent — what one question does this subproject answer?** One sentence. (e.g., "How much sidedress per planche per week to cover the N gap after compost release?"). This becomes the opening paragraph of `spec.md`. If the user can't compress it to one sentence, push back — the subproject probably isn't carved cleanly enough yet.
2. **Path — where does it live?** Match existing patterns: cross-crop nutrition concerns sit at `nutrition/<topic>/` (compost-contribution); crop-specific at `nutrition/<crop>/<topic>/` (plant-needs, sidedress-recipe); standalone domain at `<topic>/` (yield-range). Propose a path based on intent, let the user redirect.
3. **Mode — from scratch OR extracting existing work?**
   - **From scratch**: just scaffold the file layout, leave REQ section empty (or with `<!-- specs to be added -->` placeholder).
   - **Extracting**: ask what to pull and from where (next section).
4. **Has a code component?** — does this subproject own constants / functions / a `window.*` namespace, or is it spec-only (like a pure rationale doc)? If yes → scaffold `data.js` / `calc.js` / `model.js`; if no → spec docs only.

### If "extracting", also ask:

- **Which REQs move?** List by number. They keep their existing IDs — never renumber. (The user said: "I don't want to manage REQ-range reservation" — this skill never invents new numbers either.)
- **Which sections of the parent `spec.md` move?** (e.g., the "Demand model" section that became `plant-needs/spec.md`.)
- **Which code symbols move?** Constants (e.g. `SIDEDRESS_AREA_PER_PLANCHE`), functions (`computeStageSidedress`), IIFE wirings (`wireFpSidedress`). Map each to `data.js` / `calc.js` / `model.js`.
- **Source location.** Usually `app/index.html` (the build-source authoring file, not root `index.html` which is the build artifact). Read both `working files/changelog.md` and the parent `spec.md` first to understand existing structure.

## Scaffold — `spec.md` skeleton

Write `<path>/spec.md` with this structure (omit sections that don't apply, but keep them in this order):

```markdown
# <Crop or domain> — <subproject name>

<One-paragraph intent — the one-sentence answer from pre-flight, expanded to ~3 sentences. State what one question the model/spec answers.>

This file is the *spec* (what the system must do or be). <If applicable: Formulas, derivations, source tables, and refinement triggers live in `derivation.md` next door. App-side specs live in `<path>/app/spec.md`.>

The <model | spec | subsystem> answers exactly one question: **"<the one question>"**

It does NOT answer:
- <out-of-scope item 1 — point at where it IS answered>
- <out-of-scope item 2>

<Optional: Cross-channel scope paragraph — how this subproject couples to its parent / sibling subprojects.>

---

## Contract  <!-- only if this subproject has a code surface -->

### Inputs

| Name | Type | Range | Source |
|------|------|-------|--------|
| ...  | ...  | ...   | ...    |

### Output

`<functionName(args)>` returns:

```js
{ ... }
```

---

## Cert scale

Same single-cert transferability scale as `nutrition/tomato/plant-needs/spec.md` ("Cert scale" section — canonical).

---

<!-- For "from scratch" mode, leave the REQ section empty with this placeholder. -->
<!-- specs to be added — see CLAUDE.md "Specs" section for shape -->

<!-- For "extracting" mode, paste the moved REQ entries here verbatim (preserving REQ-NNN, Statement, Rationale, Verification, Cert). -->

---

## Inherited specs

<List parent / sibling REQs this subproject consumes or is consumed by, with file pointers.>

- **REQ-NNN** (`<path>/spec.md`) — short description.
```

Adapt — match the closest sibling subproject's flavor. Read it before writing (e.g. for a new `nutrition/<crop>/<topic>/`, mirror sidedress-recipe; for a standalone domain, mirror yield-range).

## Scaffold — `derivation.md` (if formulas / source tables exist)

```markdown
# <Crop> — <subproject> · derivation

How the model is built. The **spec** (what it must do or be) is in `spec.md`. This file is everything else: <derivation | source tables | rationale | refinement triggers | implementation map>.

---

## <Section as needed>
```

Only create this file if there's actually content to put in it. Empty `derivation.md` files are noise.

## Scaffold — code triplet (if there's a code component)

Mirror `nutrition/tomato/sidedress-recipe/`:

- `data.js` — constants, lookup tables, calibrated values.
- `calc.js` — pure functions. May read constants from `window.*` set up by upstream subprojects' `model.js` (e.g. `window.PlantNeedsTomato`).
- `model.js` — declares `window.<SubprojectName>` and exposes the public API surface (constants + computed helpers + main function).

Wire into `app/index.html` with three `<!-- @include path -->` markers in dependency order: `data.js` → `calc.js` → `model.js`. Read `app/index.html` and find the right slot — usually next to the parent subproject's includes.

If extracting, **move** the symbols (don't copy). Verify the build artifact (`dist/index.html`) stays byte-identical when no behavior changed: `npm run build` then `md5sum dist/index.html` before/after if cautious.

## Update the parent

If extracting from a parent `spec.md`:

1. Remove the moved sections from the parent.
2. Add a "Subprojects" section near the top of the parent listing the new child:
   ```markdown
   ## Subprojects

   - **`<topic>/spec.md`** — <one-line intent>. Owns `<symbol1>`, `<symbol2>`, ...
   ```
3. Cross-reference: anywhere else in the project that pointed at the moved REQs by file path (other `spec.md`s, `CLAUDE.md`, code comments) — `grep` for the old path and update to the new path.

## Wire verification (if extracting REQs that were already wired)

The verifier checks (`scripts/check-recipes.mjs` for runtime/DOM, `scripts/check-requirements.sh` for grep-based) keep working as-is — REQ numbers don't change, so existing `header('REQ-NNN ...')` blocks stay valid. But if the moved code now lives behind a different path or namespace, update the verifier's `import` / `window.*` lookups.

For "from scratch" mode: don't pre-wire empty checks. Add verification when the first REQ lands.

## Run the verifier

```bash
npm run check
```

All previously passing REQs must still pass. Same-or-better wired count. If anything regresses, fix before declaring done.

## Append changelog entry

Per CLAUDE.md "Parallel-session staleness mitigation": append a one-line entry at the top of the most-recent date section in `working files/changelog.md`. Format: `HH:MM — <path>/ subproject created [from scratch | extracted from <source>]. Owns <symbols>. Files: spec.md (<sections>), [derivation.md, code triplet]. <verifier result>.`

Match the verbosity of past subproject-creation entries (search the changelog for `subproject created` to see the established style — short for from-scratch, longer for extractions because the audit trail matters).

## Anti-patterns

- **Allocate REQs through the wrapper only.** When extracting REQs from a parent spec, keep their existing IDs (never renumber). When carving a "from scratch" subproject that needs new REQs, call `scripts/claim-req.sh <subproject>/spec.md <persona>` once per REQ — under one outer `flock team-coordination/req-ledger.md` if you need a contiguous range. Never grep the spec tree by hand to pick the next number; that's the parallel-session race the wrapper exists to close (`team-coordination/plant-nutrition-specialist/from-model-challenger-done.md` — C3 entry).
- **Don't create empty companion files.** No empty `derivation.md`. Create it only when you have content. Empty files become stale and confuse readers.
- **Don't copy code when extracting — move it.** Leaving a duplicate constant in `app/index.html` after extraction creates a divergence bomb. If the build artifact must stay byte-identical, replace the source block with `@include` markers in the same slot.
- **Don't skip the parent-spec update.** A subproject that exists on disk but isn't pointed to from the parent `spec.md` is invisible to anyone reading top-down.
- **Don't forget the `app/index.html` vs `dist/index.html` distinction.** Editing `dist/index.html` directly is wrong — it's a build artifact. Always edit `app/index.html` and let `npm run build` regenerate `dist/`.
- **Don't invoke `/retire-recipe` as part of subproject extraction.** That skill is for `STORED_RECIPE.tomato.{fertigation,sidedress,foliaire}` value changes only. Moving code to a new file is not a recipe change.

## Cross-references

- CLAUDE.md "Specs" section — what is and isn't a spec; REQ-NNN allocation; verifier model.
- `nutrition/tomato/plant-needs/` — canonical reference for spec + derivation + code-triplet split.
- `nutrition/tomato/sidedress-recipe/` — most recent extraction, closest pattern to copy.
- `nutrition/compost-contribution/` — cross-crop subproject (lives at `nutrition/<topic>/` not under a crop).
- `yield-range/` — standalone top-level domain (lives at `<topic>/`).
- `scripts/check-recipes.mjs` / `scripts/check-requirements.sh` — verifier; new REQs need a check entry to count as wired.
- `scripts/build.mjs` — `@include` resolver; how code triplets get inlined into `dist/index.html`.
- `working files/changelog.md` — append a one-line entry after scaffolding (per CLAUDE.md staleness mitigation).
