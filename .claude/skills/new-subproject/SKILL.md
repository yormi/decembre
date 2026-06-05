---
name: new-subproject
description: Use when carving out a new subproject under the spec tree (e.g. `nutrition/<crop>/<topic>/`, `yield-range/<topic>/`, a new top-level domain). Scaffolds the conventional file layout (`spec.md` + optional `derivation.md` / `data.js` / `calc.js` / `model.js`) and either starts blank ("from scratch") or extracts existing work (spec entries, sections, code) out of a parent file into the new home. Mirrors the conventions established by `nutrition/tomato/plant-needs/`, `nutrition/tomato/sidedress-recipe/`, `nutrition/compost-contribution/`, `yield-range/`. Does NOT cover spec-entry writing itself — see the `to-specs` skill for slug naming + entry shape.
---

# Carve out a subproject

Self-contained slice: `spec.md` (normative claims) + optional `derivation.md` (formulas/rationale) + optional code triplet `data.js` / `calc.js` / `model.js` (constants → pure functions → `window.*` namespace). Canonical examples: `nutrition/tomato/plant-needs/`, `nutrition/tomato/sidedress-recipe/`, `nutrition/compost-contribution/`, `yield-range/`.

## Pre-flight — ask the user, in order

Repeat answers back in one block before scaffolding.

1. **Intent — what one question does this subproject answer?** One sentence. Becomes the opening paragraph of `spec.md`. If it doesn't compress to one sentence, push back — not carved cleanly enough.
2. **Path.** Cross-crop nutrition → `nutrition/<topic>/`; crop-specific → `nutrition/<crop>/<topic>/`; standalone domain → `<topic>/`. Propose, let user redirect.
3. **Mode — from scratch OR extracting?**
   - From scratch: scaffold, leave spec section with `<!-- specs to be added -->`.
   - Extracting: ask the extraction questions below.
4. **Code component?** Owns constants/functions/`window.*` → scaffold `data.js` / `calc.js` / `model.js`. Spec-only → docs only.

### If extracting

- Which spec entries move? (Keep their existing slug ids.)
- Which parent `spec.md` sections move?
- Which code symbols move? Map each to `data.js` / `calc.js` / `model.js`.
- Source location? Usually `app/index.html` (build-source, not `dist/index.html`). Read `working files/changelog.md` and parent `spec.md` first.

## Scaffold — `spec.md`

```markdown
# <Crop or domain> — <subproject name>

<One-paragraph intent — the one-sentence answer expanded to ~3 sentences.>

This file is the *spec*. <If applicable: derivations live in `derivation.md`; app-side specs in `<path>/app/user-stories.md`.>

The <model | spec | subsystem> answers exactly one question: **"<the one question>"**

It does NOT answer:
- <out-of-scope item — point at where it IS answered>

---

## Contract  <!-- only if code surface exists -->

### Inputs

| Name | Type | Range | Source |
|------|------|-------|--------|

### Output

`<functionName(args)>` returns `{ ... }`.

---

## Cert scale

Same scale as `nutrition/tomato/plant-needs/spec.md`.

---

<!-- From scratch: -->
<!-- specs to be added — see CLAUDE.md "Specs" section -->

<!-- Extracting: paste moved spec entries verbatim. -->

---

## Inherited specs

- **`<slug>`** (`<path>/spec.md`) — short description.
```

Match the closest sibling subproject's flavor — read it before writing.

## Scaffold — `derivation.md` (only if formulas/source tables exist)

```markdown
# <Crop> — <subproject> · derivation

How the model is built. Spec is in `spec.md`. This file: derivation, source tables, rationale, refinement triggers, implementation map.
```

Don't create empty `derivation.md`.

## Scaffold — code triplet (only if code component)

Mirror `nutrition/tomato/sidedress-recipe/`:

- `data.js` — constants, lookup tables.
- `calc.js` — pure functions. May read `window.*` set up upstream (e.g. `window.PlantNeedsTomato`).
- `model.js` — declares `window.<SubprojectName>`, exposes public API.

Wire into `app/index.html` with three `<!-- @include path -->` markers in dependency order (`data.js` → `calc.js` → `model.js`), next to the parent subproject's includes.

If extracting, **move** symbols (don't copy). Verify byte-identical build when no behavior changed: `npm run build` then `md5sum dist/index.html` before/after.

## Update the parent (if extracting)

1. Remove moved sections from parent `spec.md`.
2. Add a "Subprojects" section near the top:
   ```markdown
   ## Subprojects

   - **`<topic>/spec.md`** — <one-line intent>. Owns `<symbol1>`, `<symbol2>`.
   ```
3. `grep` for the old path elsewhere in the project — update to new path.

## Wire verification (if extracting wired specs)

Spec ids don't change on extraction. If code moved behind a different path/namespace, update verifier `import` / `window.*` lookups. The behavior test asserts the claim, not the id keyword.

From scratch: don't pre-wire empty checks. Add verification when the first spec lands.

## Run the verifier

```bash
npm run check
```

Same-or-better wired count. Fix any regression before declaring done.

## Append changelog entry

Per CLAUDE.md "Parallel-session staleness mitigation": append one line at the top of the most-recent date section in `working files/changelog.md`. Format: `HH:MM — <path>/ subproject created [from scratch | extracted from <source>]. Owns <symbols>. Files: spec.md (<sections>), [derivation.md, code triplet]. <verifier result>.`

Search the changelog for `subproject created` to match established verbosity (short for from-scratch, longer for extractions).

## Anti-patterns

- **Spec ids are slugs (kebab-case), unique within their target spec file.** There is NO central REQ-NNN allocation, ledger, or claim-req.sh anymore — to add a spec entry, pick a unique kebab-case slug within that file (check existing headings for collision) and write `## <slug>`. Extracting → keep existing slug ids. From scratch → pick descriptive slugs per the `to-specs` skill.
- **No empty companion files.** Create `derivation.md` only with content.
- **Move code when extracting, don't copy.** Duplicate constants in `app/index.html` create a divergence bomb. Replace source block with `@include` markers in the same slot to keep the build artifact byte-identical.
- **Don't skip the parent-spec update.** A child invisible from the parent is invisible top-down.
- **`app/index.html` vs `dist/index.html`.** Always edit `app/index.html`; `dist/` is the build artifact.
- **Don't invoke `/retire-recipe` here.** That's for `STORED_RECIPE.tomato.{fertigation,sidedress,foliaire}` value changes only.

## Cross-references

- CLAUDE.md "Specs" section — what is/isn't a spec; verifier model.
- `nutrition/tomato/plant-needs/` — canonical spec + derivation + code-triplet split.
- `nutrition/tomato/sidedress-recipe/` — most recent extraction.
- `nutrition/compost-contribution/` — cross-crop subproject at `nutrition/<topic>/`.
- `yield-range/` — standalone top-level domain.
- `scripts/check-recipes.mjs` / `scripts/check-spec.sh` — verifier.
- `scripts/build.mjs` — `@include` resolver.
- `working files/changelog.md` — staleness mitigation.
