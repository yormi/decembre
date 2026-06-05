# computeFertigationSupply — recipe-arg shape decision

## per-element-supply `computeFertigationSupply` — recipe-arg shape decision (2026-05-12)

Three signatures considered before locking the canonical g-keyed shape.

**Option A — Canonical g-keyed input (selected).** Function expects exactly `{ kSulfate_g, mgSulfate_g, solubore_g }`. Caller reshapes from any upstream source.

**Option B — Polymorphic input.** Accepts FP literal shape (`{ 'K2SO4', 'MgSO4-7H2O', 'Solubore' }`) or stored shape (`{ kSulfate, mgSulfate }`) and normalizes internally. *Rejected:* violates SRP at model boundary (`feedback_model_srp.md`). Shape detection is glue, belongs to caller. Polymorphic boundaries accumulate dead branches.

**Option C — Stage-mode signature.** Takes `(stage, { mode: 'fp' | 'stored' })` and reaches into `FP_RECIPE_T5` or `STORED_RECIPE`. *Rejected:* breaks pure-function discipline (model reads globals — `feedback_pure_code.md`), breaks SRP (mode flags smuggle source-selection into model), breaks symmetry with `computeFoliarSupply` (verifier exercises recipe arg directly with stub recipes; stage-mode would lose that lever).

**Principle (saved to `feedback_model_srp.md`):** model/calc functions accept pre-normalized inputs and apply one rule. Shape detection, source selection, reshape — caller-side glue. No mode flags at model boundary.
