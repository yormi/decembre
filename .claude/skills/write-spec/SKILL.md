---
name: write-spec
description: Use whenever writing, editing, or migrating a spec entry in `**/spec.md` or `requirements.md`. Covers file pick, slug naming, atomic statement-only shape, forbidden content, lazy `REQ-NNN`→slug migration, splitting to `derivation.md` / `learnings.md`, namespace-prefix cross-refs. Invoke even without the word "spec" — "capture this as a rule", "lock this in", "we should always do X" all qualify. Triggers: "write a spec", "add a spec", "spec this", "capture this as a rule", "make it a spec", "migrate REQ-NNN", "lock this in".
---

Concrete procedure. Philosophy in `CLAUDE.md § Specs`.

## Procedure

1. **Pick file.** Cross-app → `requirements.md`. Domain → `nutrition/<crop>/spec.md`. Subproject → nearest `*/spec.md`. When in doubt, scope down.
2. **Pick slug.** Kebab-case, unique in file, describes claim not implementation (`fertigation-routes-mo`, not `compute-fert-fn`).
3. **Write `## <slug>` + one normative paragraph.** Atomic (two paragraphs = two entries). Statement-only, WHAT — not HOW, not WHY. Ruthless word density — every word must load-bear; drop articles, fillers, restated qualifiers. Plain English; no code identifiers unless load-bearing contract symbols.
4. **Editing a legacy `REQ-NNN`? Rename to slug** and fix in-file references. No repo-wide sweep; untouched legacy entries stay until next edit.
5. **Cross-references carry ancestor namespace:** `nutrition/tomato/fertigation-recipe — solubore-routed-fertigation`, not bare. Slugs unique per file.
6. **Formulas / source tables / per-element data → split** to sibling `derivation.md`. Rejected alternatives → `learnings.md`. `spec.md` ≤ 5-min read.
7. **Superseding? Edit in place.** Git holds history. No `~~strikethrough~~`, no "still technically holds" branches.

## Forbidden in the body

| Forbidden | Goes to |
|---|---|
| Formulas, source tables, per-element data | `derivation.md` |
| Code identifiers, file paths | drop / `derivation.md` if load-bearing |
| Examples, rationale, why | `derivation.md` |
| Verification pointer | drop — behavior test IS the verification |
| Cert grade, source citation | `derivation.md` |

Behavior test = assertion in `scripts/check-requirements.sh` / `check-recipes.mjs` / `**/spec.test.mjs` exercising the rule against real code. NOT a `grep`-for-keyword.

## Example

```markdown
## passive-supply-reads-mg-m2-wk

Every contribution channel exposes per-element supply in mg/m²/wk. The plant-need block reads supply through a single integrator call; no channel-specific code in the render path.
```

## See also

- `CLAUDE.md § Specs` — shape, operating rules, namespace
- `nutrition/tomato/plant-needs/spec.md` — canonical model-layer spec
