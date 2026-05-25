# Spec discipline

**Audience:** anyone authoring spec entries (PO for `requirements.md` + domain-level `spec.md`; specialist for model-layer `spec.md`).

A **spec** is a normative, testable, minimal claim about what the system must do — not how.

**Where:** cross-app in `requirements.md`; domain + subproject under `*/spec.md`. File map: `requirements.md` § Domain organization.

**Entry shape:** `## <slug>` (kebab-case, e.g. `solubore-routed-fertigation`) + one normative paragraph. Atomic, statement-only. WHAT — not HOW, not WHY. Every word load-bears; drop articles, fillers, restated qualifiers. No verification, examples, rationale in the body. Model-layer specs may carry richer shape at specialist discretion.

**Migration (`REQ-NNN` → slug):** lazy — touching an entry migrates the id to slug in the same pass.

**Always prefix a spec reference with its ancestor namespace.** Anywhere — conversation, code, cross-ref, commit, persona summary — write `nutrition/tomato/fertigation-recipe — solubore-routed-fertigation`, not bare `solubore-routed-fertigation`.

**Does NOT belong in a spec:**
- Formulas, math chains, coefficients, algorithm steps, worked examples → `*/derivation.md` (see `plant-nutrition-specialist.md § Derivation`).
- Decisions, trade-offs, rejected alternatives, why-this-number → `*/learnings/NNNN-slug.md` (see `lib/learnings-discipline.md`).
- Per-element values, magic numbers, datasets → `data.js` or calibration files.
- Implementation walkthroughs, code excerpts, paths to consumers.

**Operating rules:**
- *Not auto-enforceable → not a spec.* Manual-review items go to team process (Catherine's #review), not `spec.md`.
- *Edit in place when superseded — no vestigial entries.* History lives in git, not supersedes chains or strikethrough.
- *Slug uniqueness is per spec file.* No central ledger.

**Verifier:** `scripts/check-requirements.sh` enforces spec entries listed in `requirements.md`. Read before editing either; run `npm run check` before declaring done.
