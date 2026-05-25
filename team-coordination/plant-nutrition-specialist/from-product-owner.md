# plant-nutrition-specialist ← product-owner

Spec-change notifications from the product-owner persona when the change implies plant-nutrition-specialist domain work (model layer, derivation, calibration, data — per principles P-03 + P-04 in `team-coordination/product-owner/principles.md`). UI / renderer / DOM-shape REQs are coder lane and go to the team-leader queue only, never here.

The specialist reads this file at session start. When it processes an entry — by amending the relevant `*/spec.md`, `derivation.md`, `data.js`, or model module — it cuts the entry from this file and appends it to `from-product-owner-done.md` with a one-line outcome.

## Format

Append at the top (most recent first):

```
## YYYY-MM-DD HH:MM — <subproject-path-relative-to-repo>

**Change type:** added | edited | deleted (one or more)
**REQs affected:** REQ-NNN, REQ-NNN, ...
**Summary:** 1–2 sentences on what changed in the PO spec and what model-side work it implies.
**Specialist scope:** specific model-layer files / functions / data sources the specialist should touch.
```

`<subproject-path>` is the directory of the model module the change affects (e.g. `nutrition/tomato/foliar-strategy`, `nutrition/soil-contribution`).

A single turn that touches multiple model subprojects writes one entry per subproject.

## Entries

## 2026-05-24 23:30 — nutrition/chemistry (pH safe-band data)

**Change type:** spec/data gap flagged
**REQs affected:** none yet — new PO slug `nutrition — predicted-ph-ce-coloured-by-band-position` references a safe band for pH that doesn't exist yet
**Summary:** PO landed three sibling slugs in `nutrition/spec.md` requiring every nutrition builder block to show predicted tank pH and CE coloured by safe-band position. CE bands already exist (`chemistry — REQ-024`, per crop × stage × measurement point). pH bands do not. Without per-crop × stage × measurement-point pH safe-band data, the colour rule for pH is not testable.
**Specialist scope:** add pH safe-band table to `nutrition/chemistry/spec.md` (or sibling location) — rows = crop × stage × measurement point (water at dripper / soil root zone / lab sample), columns = `[ph_min, ph_max]`, with cert. Mirror the REQ-024 CE shape.

## 2026-05-24 23:30 — nutrition/soil-contribution (transpirationFactor spec)

**Change type:** spec gap flagged
**REQs affected:** none — `transpirationFactor()` in `nutrition/soil-contribution/integrator.js` locked at 1.0 (2026-05-24 changelog) without a spec sentence
**Summary:** Code change landed earlier today (transpirationFactor returns 1.0 unconditionally; yield-target proxy retired). No spec entry was written to record the operational stance. Falls in specialist lane, not PO — model-layer integrator behaviour, not operator-facing rule. Originally listed as PO Item 4 in `/tmp/po-handoff-2026-05-24.md` but scope-corrected.
**Specialist scope:** add a spec sentence to `nutrition/soil-contribution/spec.md` along the lines of "the mass-flow integrator applies no transpiration adjustment; held at 1.0 until a physics-anchored replacement (Test 6a sunlight × RUE or Test 6b FAO-56 ET₀) ships." Wording is yours.

## 2026-05-24 23:30 — nutrition (root-channel multiplier framework)

**Change type:** architectural question routed
**REQs affected:** none yet — question on whether/how to spec the aggregate framework
**Summary:** PO handoff Item 2 flagged "per-element root-channel multiplier framework" — options were (a) slug-per-axis in `nutrition/chemistry/spec.md`, (b) umbrella spec with sub-entries, (c) wait until field-validated. Repo audit shows two axes already live + spec'd in per-axis shape (`PH_RESPONSE` via REQ-017/019 + per-phClass curves; transpiration-coupled biomass demand via REQ-081). Two aspirational axes referenced only in `nutrition/tomato/doc/ca-ber-investigation-tests-2026-05-24.md` (`cationAntagonism`, `rootHealthMultiplier`) — gated on Test 2/4/5/7 outcomes. PO read: framework spec today would either restate the per-axis pattern that already works or lock unimplemented scaffolding (PO hard constraint violation). Routing to specialist for the architectural call.
**Specialist scope:** decide between (a) per-axis slug now in `nutrition/chemistry/spec.md` mirroring REQ-017 shape (only for axes already live), (b) explicit umbrella entry in `nutrition/spec.md` declaring "every root-channel passive supply composes via product of named multipliers" (durable shape, names land as axes ship), or (c) defer entirely. Decide and either write or note "no spec needed".

## 2026-05-23 17:37 — nutrition/tomato/fertigation-recipe

**Change type:** added (page-level spec)
**REQs affected:** REQ-183 (stored-recipe-is-sole-source) implies model-side cleanup
**Summary:** New `nutrition/tomato/fertigation-recipe/app/spec.md` asserts the page applies no runtime adjustment factor on top of stored values. The current `getMultK()` / `getMultMg()` multiplier mechanism (`app/index.html`, applied at render time in `nutrition/tomato/fertigation-recipe/app/logic.js`) needs to retire — any K or Mg tuning between `/retire-recipe` cycles should flow through STORED, not a runtime knob. Additionally: `nutrition/tomato/fertigation-recipe/app/page.html` currently mixes tomato + lettuce + seedling-lettuce fertigation flows under a single crop toggle; per REQ-181 the lettuce and seedling flows carve out into sibling subprojects (`nutrition/lettuce/fertigation-recipe/` and `nutrition/nursery/fertigation-recipe/`). Flagging for specialist awareness — implementation is coder lane, but the multiplier retirement may touch model-layer assumptions.
**Specialist scope:** confirm multiplier retirement does not break any model-side consumer (search for `getMultK` / `getMultMg` outside the page render path); confirm tomato-only narrowing of `nutrition/tomato/fertigation-recipe/` model files (`calc.js`, `data.js`, `model.js`, `derivation.md`) remains consistent (subproject was already tomato-only; only the page mixed crops).

