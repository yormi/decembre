## Infrastructure:
- greenhouse with climate control
- automated fertigation + manual supplements
- 200 µmol/m²/s supplemental lighting + sun for lettuce only (tomatoes sun-only)
- organic cert required

Co-researcher mode:
- Direct and blunt. Challenge everything.
- Numbers — target ranges, comparable-op benchmarks, realistic vs aspirational.
- No source citations unless asked. Certainty 0-5 on every empirical claim (0 = guess, 5 = rock-solid).
- Length adapts — short for gut checks, thorough when understanding matters.

Writing-density bar: would removing this change a future reader's behavior? If no, cut.

Team procedures app: only dynamic inputs and decisions the team acts on. Code only does what the spec demands.

App invariants: `requirements.md` + `scripts/check-requirements.sh`. Read before editing; run before declaring done.

## Doc dirs — tree-level context

**Before editing, read `<ancestor>/doc/CLAUDE.md` at every level from repo root down to the file's directory (any that exist).** E.g. for `nutrition/tomato/fertigation-recipe/calc.js`: `doc/`, `nutrition/doc/`, `nutrition/tomato/doc/`, `nutrition/tomato/fertigation-recipe/doc/`. Claude Code doesn't auto-load these.

## Persona infrastructure

See `team-coordination/CLAUDE.md`. Three-layer model: skills (HOW, procedural, triggered) / principles (VALUES for decisions, ambient) / persona (WHO, identity).

## Specs

A **spec** is a normative, testable, minimal claim about what the system must do — not how.

**Where:** cross-app in `requirements.md`; domain + subproject under `*/spec.md`. File map: `requirements.md` § Domain organization.

**Entry shape:** `## <slug>` (kebab-case, e.g. `solubore-routed-fertigation`) + one normative paragraph. Atomic, statement-only. WHAT — not HOW, not WHY. Every word load-bears; drop articles, fillers, restated qualifiers. No verification, examples, rationale in the body. Model-layer specs may carry richer shape at specialist discretion.

**Migration (`REQ-NNN` → slug):** lazy — touching an entry migrates the id to slug in the same pass.

**Always prefix a spec reference with its ancestor namespace.** Anywhere — conversation, code, cross-ref, commit, persona summary — write `nutrition/tomato/fertigation-recipe — solubore-routed-fertigation`, not bare `solubore-routed-fertigation`.

**Does NOT belong in a spec:**
- Formulas, math chains, coefficients, algorithm steps, worked examples → `*/derivation.md` (see Derivation below).
- Decisions, trade-offs, rejected alternatives, why-this-number → `*/learnings/NNNN-slug.md` (numbered, dated, append-only — see Learnings below).
- Per-element values, magic numbers, datasets → `data.js` or calibration files.
- Implementation walkthroughs, code excerpts, paths to consumers.

**Operating rules:**
- *Not auto-enforceable → not a spec.* Manual-review items go to team process (Catherine's #review), not `spec.md`.
- *Edit in place when superseded — no vestigial entries.* History lives in git, not supersedes chains or strikethrough.
- *Slug uniqueness is per spec file.* No central ledger.

## Derivation

**`spec.md` + `derivation.md` are the semantic source of truth for the model.** Code is **one valid implementation** that passes the tests derived from spec + derivation. Either could be re-derived in another language (Elm, Python, …) from spec + derivation alone — that is the bar.

**Model-layer subprojects (`*/model/`) MUST carry a `derivation.md`.** Other layers (`builder/`, `procedure/`, `operator/`) carry one only if a real reader hits friction reading the code end-to-end.

**Faithful-blueprint contents** — every model `derivation.md` covers:
1. **Every formula the code computes** — math notation, variable names matching code naming.
2. **Every coefficient + its cert + its source** — table form, one row per number.
3. **Every algorithm as numbered steps** — math-flavored, not pseudocode.
4. **Every input / output data-structure shape** — schema, not implementation type.
5. **At least one worked example per non-trivial branch** — input → intermediate → output, numbers traceable to the coefficients table.

**Lane discipline:**
- **Specialist** writes `model/{spec,derivation}.md` and does NOT touch code.
- **Test-writer** reads spec + derivation → writes failing tests.
- **Coder** reads spec + derivation + failing tests → writes minimum code to pass.
- **Pruner** reads code → deletes anything not traceable to a spec/derivation line.

**Drift detection:** code drifts from derivation → tests fail (tests come from derivation). Derivation drifts from code → pruner catches in `audit-walk`. Both drift without spec → `scripts/check-requirements.sh` catches.

**Migration of existing `derivation.md` files:** lazy. When next touched, audit against the faithful-blueprint bar and upgrade. Most current files lean narrative; they'll need expansion to schema + worked examples to clear the bar.

## Learnings

A **learning** records a decision or fork: what we picked, what we rejected, why. Spec/code/data = current truth; learnings = log of decisions that shaped it.

**Where:** `<subproject>/learnings/NNNN-slug.md`, numbered per-subproject. Lives at the highest subproject scope the decision applies to — foliar-only → `nutrition/tomato/foliar-strategy/learnings/`; cross-crop → `nutrition/learnings/`; project-wide → root `learnings/`.

**Entry shape:** title + dated 1-3 sentences. Optional sections (Status, Considered Options, Consequences) only when they earn their keep. Voice: research-notebook *(we tried X, found Y; considered A vs B, picked B because Z)*, not corporate ADR.

**Three-criteria filter** — write a learning when all three fire:
1. *Hard to reverse* — meaningful cost to change later.
2. *Surprising without context* — a future reader will wonder "why this way?".
3. *Real trade-off* — genuine alternatives existed.

Otherwise capture in `derivation.md` (math) or `spec.md` (rule).

**Append-only by default.** Prune only when a learning has zero forward value. Superseded learnings get a new file referencing the old; old stays.

**`learnings.md` migration:** lazy. Existing flat files split into numbered files when next touched.

## Parallel-session staleness mitigation

Multiple Claude sessions run in parallel; each snapshots at startup.

1. **Read `working files/changelog.md`** at the start of any substantive question on recipes, REQs, model, or page state. UserPromptSubmit hook injects last 10 entries.
2. **Append to `working files/changelog.md`** before returning when YOU make a material change. Format: `YYYY-MM-DD HH:MM — short description`. Applies to: recipe edits; REQ additions/removals/threshold changes; architectural shifts; page restructuring; constants added/removed. Brief sub-agents to append their own. Don't log Guillaume's manual changes.
3. **Trust the changelog over memory.** Conflicts → re-derive from current files.
4. **If the 10 injected lines don't span back to your last touch-base,** read the full changelog and re-read shifted files.

NOT worth logging: reads to answer a question, `check-requirements.sh` runs, cosmetic copy edits.

## Guillaume's lane — don't prompt him on calls he owns

Ship the work in your lane and stop. Do NOT close turns reminding him to act on:

- **STORED-recipe edits + `/retire-recipe` timing.** Record state in changelog/spec/derivation if useful, stop. Don't propose stored values; don't re-flag audit-trail gating.
- **Operator-side ramp decisions.** Drift gauges (stored vs FP) are operator concerns; he picks when to ramp.
- **External-signal polling.** Tissue, PA Taillon ack, vendor QC, lab returns — don't re-mention "waiting on X."

Spec/derivation/learnings MAY say "gated on `/retire-recipe`" (for future readers + parallel sessions); end-of-turn summaries MAY NOT.
