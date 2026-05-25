---
name: to-specs
audience: product-owner
description: PO-side spec writing. Two artifacts in scope — `user-stories.md` for PO surfaces (operator/builder/procedure/app UI) with Problem/Solution/<slug-entries>/Out of Scope/Further Notes; cross-app + domain-level `spec.md` (root `spec.md`, `nutrition/spec.md`, `nutrition/<crop>/spec.md`, `yield-range/spec.md`) for cross-cutting normative claims. Covers track gate, slug naming, atomic statement-only shape, forbidden content, lazy `REQ-NNN`→slug migration, namespace-prefix cross-refs. Triggers: "write a spec", "add a spec", "spec this", "user story", "capture as a rule", "lock this in", "migrate REQ-NNN".
---

Philosophy in `team-coordination/lib/spec-discipline.md`. Model-surface spec writing is the specialist's — see `team-coordination/plant-nutrition-specialist/skills/to-specs.md`.

## Track gate — pick first

| Surface | Artifact | Wrappers |
|---|---|---|
| Cross-app invariant (CE label, hash routing, week numbering, French copy) | root `spec.md` | none |
| Domain-wide nutrition rule | `nutrition/spec.md` | none |
| Crop-specific normative claim | `nutrition/<crop>/spec.md` or `yield-range/spec.md` | none |
| PO surface (operator UI, builder UI, procedure, app surface, grower-facing behavior) | `<dir>/user-stories.md` | `## Problem`, `## Solution`, `## Out of Scope`, `## Further Notes` |
| Domain vocabulary / glossary (terms, cross-cutting nouns, units) | `<dir>/context.md` | free-form prose |

Decision rule: cross-cutting invariant or domain rule → spec. Grower-facing UI behavior → user-stories. Term definition → context.

## Procedure — both artifacts

1. **Pick file.** Cross-app → root `spec.md`. Domain → `nutrition/<crop>/spec.md`. PO surface → nearest `<dir>/user-stories.md`. When in doubt, scope down.
2. **Pick slug.** Kebab-case, unique in file, describes claim not implementation (`weekly-calendar-rendered`, not `render-weekly-cal-fn`).
3. **Write `## <slug>` + one normative paragraph.** Atomic (two paragraphs = two entries). Statement-only — WHAT, not HOW, not WHY. Ruthless word density; every word load-bears. Plain English; no code identifiers unless load-bearing contract symbols. Same shape for both artifacts.
4. **Editing a legacy `REQ-NNN`? Rename to slug** and fix in-file references. No repo-wide sweep; untouched legacy entries stay until next edit.
5. **Cross-references carry ancestor namespace:** `nutrition/tomato/foliar-strategy/operator — weekly-calendar-rendered`, not bare. Slugs unique per file.
6. **Superseding? Edit in place.** Git holds history. No `~~strikethrough~~`, no "still technically holds" branches.

## PO-surface extras (user-stories.md)

- **Wrapper sections.** Open with `## Problem` (grower's POV) + `## Solution` (grower's POV). Close with `## Out of Scope` + `## Further Notes` (optional).
- **Slug entries sit at `## <slug>` level** alongside the wrappers — flat, no nesting under a `## User Stories` umbrella.
- **Order is append-only.** New slug entries go after existing ones. Numbers (positional, e.g. `path#3`) are stable references in conversation; written cross-refs always use slug.
- **No REQ-NNN allocation.** PO surfaces don't claim REQ ids. Slugs only.

## Cross-app / domain `spec.md` extras

- **No wrappers.** File is slug entries top to bottom.
- **REQ-NNN allocation** still applies when a new claim lands (see `lib/req-allocation.md`).
- **Stays statement-only.** Formulas / per-element data → specialist's model-layer `derivation.md` (you flag, specialist writes).

## Forbidden in the body (both artifacts)

| Forbidden | Goes to |
|---|---|
| Formulas, source tables, per-element data | specialist's `derivation.md` |
| Code identifiers, file paths | drop |
| Examples, rationale, why | commit message / `learnings/<slug>.md` |
| Verification pointer | drop — behavior test IS the verification |
| Cert grade, source citation | specialist's `derivation.md` |

Behavior test = assertion in `scripts/check-spec.sh` / `check-recipes.mjs` / `**/spec.test.mjs` exercising the rule against real code. NOT a `grep`-for-keyword.

## Examples

### Cross-app / domain entry (spec.md)

```markdown
## farm-working-days

Décembre operates Monday through Friday. Cross-crop scheduling treats Saturday and Sunday as non-working days; no fertigation, sidedress, or foliar activity is dispatched on those days.
```

### PO-surface file (user-stories.md)

```markdown
## Problem

Operators don't know which spray to mix on which day; the calendar lives only in the model output.

## Solution

The operator surface renders a weekly spray calendar derived from the model, plus a per-recipe weighing block.

## weekly-calendar-rendered

The operator surface renders the weekly spray calendar derived from `foliar-strategy/model — sprays-spread-across-farm-working-days`. Read-only on this surface.

## recipe-sheet-per-recipe

The operator surface shows one weighing block per recipe in the strategy. Each block lists products, doses, predicted CE/pH, and surfactant flag.

## Out of Scope

- Operator-side day override (forbidden by `procedure — no-operator-day-override`).
- Frequency input on this surface (forbidden by `procedure — no-frequency-input`).
```

## See also

- `team-coordination/lib/spec-discipline.md` — shape, two-track gate, operating rules
- `team-coordination/plant-nutrition-specialist/skills/to-specs.md` — model-surface counterpart
- `nutrition/tomato/foliar-strategy/operator/user-stories.md` — canonical PO-surface example (post-Phase-4 migration)
