---
name: to-specs
audience: plant-nutrition-specialist
description: Specialist-side spec writing for model + algorithmic surfaces. Pair of files — `<dir>/spec.md` (atomic normative claims, WHAT must hold) + sibling `<dir>/derivation.md` (faithful blueprint — every formula, coefficient with uncertainty, algorithm step, I/O shape, worked example). Covers slug naming, atomic statement-only shape, forbidden content, lazy migration, namespace-prefix cross-refs. Triggers: "write a spec", "add a spec", "spec this", "capture as a rule", "lock this in", model-layer derivation work.
---

Philosophy in `team/everyone/principles.md § spec-is-statement-only`. PO-side spec writing (cross-app, domain, PO surfaces) is the PO's — see `team/product-owner/skills/to-specs.md`.

## Scope — model + algorithmic surfaces only

| Surface | Artifact pair |
|---|---|
| Model layer (`*/model/`) | `spec.md` + `derivation.md` (mandatory) |
| Algorithmic subproject (`fertigation-recipe/`, `foliar-strategy/`, `sidedress-recipe/`, `plant-needs/`, `nursery/*`, `chemistry/`, etc.) | `spec.md` + `derivation.md` (mandatory when math present) |

PO-level REQs (`nutrition/spec.md`, `nutrition/tomato/spec.md`, `nutrition/lettuce/spec.md`, root `spec.md`) are **fixed contracts** — read, do not edit. Unsatisfiable → flag in spec, don't rewrite.

## Procedure

1. **Pick file.** Nearest `*/spec.md` inside the model/algorithmic subproject you own.
2. **Pick slug.** Kebab-case, unique in file, describes claim not implementation (`solubore-routed-fertigation`, not `compute-fert-fn`).
3. **Write `## <slug>` + one normative paragraph.** Atomic (two paragraphs = two entries). Statement-only — WHAT, not HOW, not WHY. Ruthless word density; every word load-bears. Plain English; no code identifiers unless load-bearing contract symbols.
4. **Editing a legacy `REQ-NNN` heading? Rename to slug** and fix in-file references. No repo-wide sweep; untouched legacy entries stay until next edit.
5. **Cross-references carry ancestor namespace:** `nutrition/tomato/foliar-strategy/model — sprays-spread-across-farm-working-days`, not bare. Slugs unique per file.
6. **Formulas / source tables / per-element data → split** to sibling `derivation.md`. Rejected alternatives → `learnings/<slug>.md`. Spec ≤ 5-min read.
7. **Superseding? Edit in place.** Git holds history. No `~~strikethrough~~`, no "still technically holds" branches.

## Derivation discipline (sibling derivation.md)

**Model-layer subprojects (`*/model/`) MUST carry a `derivation.md`.** Other layers (`builder/`, `procedure/`, `operator/`) carry one only if a real reader hits friction reading the code end-to-end.

Every model `derivation.md` covers:
1. **Every formula the code computes** — math notation, variable names matching code naming.
2. **Every coefficient + its uncertainty measurement** — table form, one row per number.
3. **Every algorithm as numbered steps** — math-flavored, not pseudocode.
4. **Every input / output data-structure shape** — schema, not implementation type.
5. **At least one worked example per non-trivial branch** — input → intermediate → output, numbers traceable to the coefficients table.

**Migration of existing `derivation.md` files:** lazy. When next touched, audit against the faithful-blueprint bar and upgrade.

## Spec ids

Spec ids are per-file-unique slugs. There is NO central REQ-NNN allocation, ledger, or claim-req.sh anymore — to add a spec entry, pick a unique kebab-case slug within that file (check existing headings for collision) and write `## <slug>`.

## Forbidden in spec body

| Forbidden | Goes to |
|---|---|
| Formulas, source tables, per-element data | `derivation.md` |
| Code identifiers, file paths | drop / `derivation.md` if load-bearing |
| Examples, rationale, why | `derivation.md` / `learnings/<slug>.md` |
| Verification pointer | drop — behavior test IS the verification |
| Cert grade, source citation | `derivation.md` |

Behavior test = assertion in `scripts/check-spec.sh` / `check-recipes.mjs` / `**/spec.test.mjs` exercising the rule against real code. NOT a `grep`-for-keyword.

## Example — model-surface entry (spec.md)

```markdown
## passive-supply-reads-mg-m2-wk

Every contribution channel exposes per-element supply in mg/m²/wk. The plant-need block reads supply through a single integrator call; no channel-specific code in the render path.
```

## See also

- `team/product-owner/skills/to-specs.md` — PO-surface counterpart
- `nutrition/tomato/plant-needs/spec.md` — canonical model-layer spec

This skill's **Derivation discipline** section IS the faithful-blueprint contract. The persona file carries only a pointer here.
