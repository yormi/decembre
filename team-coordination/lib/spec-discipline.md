# Spec discipline

**Audience:** anyone authoring spec entries (PO for cross-app `spec.md`, domain-level `spec.md`, PO-surface `user-stories.md`; specialist for model-layer `spec.md`).

A **spec** is a normative, testable, minimal claim about what the system must do — not how.

## Two tracks

| Surface | Artifact | Wrappers | Authored by |
|---|---|---|---|
| Model / algorithmic (math, coefficients, formulas) | `<dir>/spec.md` + sibling `derivation.md` | none | specialist |
| PO surface (operator UI, builder UI, procedure, app surface, grower-facing behavior) | `<dir>/user-stories.md` | `## Problem`, `## Solution`, `## Out of Scope`, `## Further Notes` | PO |
| Domain vocabulary / glossary (terms, cross-cutting nouns, units) | `<dir>/context.md` | free-form prose | PO |

Decision rule: math/coefficients/algorithm → spec. Grower-facing behavior → user-stories. Definition of a term used across surfaces → context.

**Where:** cross-app in root `spec.md`; domain + subproject under `*/spec.md` or `*/user-stories.md` per track. File map: root `spec.md` § Domain organization.

## Entry shape — both tracks

`## <slug>` (kebab-case, e.g. `solubore-routed-fertigation`, `weekly-calendar-rendered`) + one normative paragraph. Atomic, statement-only. WHAT — not HOW, not WHY. Every word load-bears; drop articles, fillers, restated qualifiers. No verification, examples, rationale in the body. Model-layer specs may carry richer shape at specialist discretion.

**PO-surface order is append-only.** New slug entries go after existing ones. Numbers (positional, e.g. `path#3`) are stable references in conversation; written cross-refs always use slug. Append-only keeps positional numbers durable.

**No REQ-NNN allocation on PO surfaces.** User-stories slugs are unbounded — no central ledger claim. REQ-NNN allocation still applies on model surfaces (see `lib/req-allocation.md`).

**Migration (`REQ-NNN` → slug):** lazy — touching an entry migrates the id to slug in the same pass.

**Always prefix a spec reference with its ancestor namespace.** Anywhere — conversation, code, cross-ref, commit, persona summary — write `nutrition/tomato/fertigation-recipe — solubore-routed-fertigation`, not bare `solubore-routed-fertigation`.

## Does NOT belong in a spec / user-stories entry

- Formulas, math chains, coefficients, algorithm steps, worked examples → `*/derivation.md` (see `plant-nutrition-specialist.md § Derivation`).
- Decisions, trade-offs, rejected alternatives, why-this-number → `*/learnings/NNNN-slug.md` (see `lib/learnings-discipline.md`).
- Per-element values, magic numbers, datasets → `data.js` or calibration files.
- Implementation walkthroughs, code excerpts, paths to consumers.
- Domain vocabulary / term definitions → `*/context.md`.

## Operating rules

- *Not auto-enforceable → not a spec.* Manual-review items go to team process (Catherine's #review), not `spec.md` / `user-stories.md`.
- *Edit in place when superseded — no vestigial entries.* History lives in git, not supersedes chains or strikethrough.
- *Slug uniqueness is per file.* No central ledger for slugs.

## Verifier

`scripts/check-spec.sh` enforces spec entries listed in the root `spec.md`. Read before editing either; run `npm run check` before declaring done.
