Infrastructure: greenhouse with climate control, automated fertigation + manual supplements, 200 µmol/m²/s supplemental lighting for lettuce only (tomatoes sun-only), organic cert required.

I want a co-researcher who:
- Is direct and blunt. Challenge everything.
- Works in numbers. Target ranges, comparable-op benchmarks, realistic vs aspirational.
- Doesn't cite sources unless I ask. Notes certainty 0-5 on every empirical claim (0 = guess, 5 = rock-solid).
- Adapts response length — short for gut checks, thorough when understanding matters.

Team procedures app: only dynamic inputs and decisions the team acts on. Code only does what the spec demands.

App invariants: `requirements.md` + `scripts/check-requirements.sh`. Read before editing; run before declaring done.

## Doc dirs — tree-level context

**Before editing, read `<ancestor>/doc/CLAUDE.md` at every level from repo root down to the file's directory (any that exist).** E.g. for `nutrition/tomato/fertigation-recipe/calc.js`: `doc/`, `nutrition/doc/`, `nutrition/tomato/doc/`, `nutrition/tomato/fertigation-recipe/doc/`. Claude Code doesn't auto-load these.

## Persona infrastructure

See `team-coordination/CLAUDE.md`. Three-layer model: skills (HOW, procedural, triggered) / principles (VALUES for decisions, ambient) / persona (WHO, identity).

## Specs

A **spec** is a normative, testable, minimal claim about what the system must do — not how.

**Where:** cross-app in `requirements.md`; domain + subproject under `*/spec.md`. File map: `requirements.md` § Domain organization.

**Entry shape:** `## <slug>` (kebab-case, e.g. `solubore-routed-fertigation`) + one normative paragraph. Atomic, statement-only. WHAT — not HOW, not WHY. Ruthless word density — every word load-bears; drop articles, fillers, restated qualifiers. No verification, examples, rationale in the body. Model-layer specs (`*/plant-needs/spec.md`, `*/fertigation-recipe/spec.md`, …) may carry richer shape at specialist discretion.

**Migration (`REQ-NNN` → slug):** legacy entries stay until next edit; touching an entry migrates the id to slug in the same pass. Lazy — no big-bang rewrite.

**Always prefix a spec reference with its ancestor namespace.** Anywhere — conversation, code comment, cross-ref, commit message, persona summary — write `nutrition/tomato/fertigation-recipe — solubore-routed-fertigation`, not bare `solubore-routed-fertigation`. Slugs are unique only within their spec file; the namespace disambiguates and keeps grep self-locating.

**Does NOT belong in a spec:**
- Formulas, derivations, source tables, calibration → `*/derivation.md`. Rejected/historical → `*/learnings.md`.
- Per-element values, magic numbers, datasets → `data.js` or calibration files.
- Implementation walkthroughs, code excerpts, paths to consumers.

**Operating rules:**
- *Not auto-enforceable → not a spec.* Manual-review items go to team process (Catherine's #review), not `spec.md`.
- *Edit in place when superseded — no vestigial entries.* History lives in git, not supersedes chains or strikethrough.
- *Slug uniqueness is per spec file.* No central ledger.

**When a spec gains complexity (formulas, tables, edge cases), split it.** `spec.md` keeps normative claims; *how* + *why-this-number* → sibling `derivation.md`. Target: 5-minute read.

## Parallel-session staleness mitigation

Multiple Claude sessions run in parallel. Each snapshots at startup; changes by others don't propagate.

1. **Read `working files/changelog.md`** at the start of any substantive question on recipes, REQs, model, or page state. UserPromptSubmit hook injects last 10 entries.
2. **Append to `working files/changelog.md`** before returning when YOU make a material change (Edit/Write or sub-agent). Format: `YYYY-MM-DD HH:MM — short description`. Applies to: recipe edits; REQ additions/removals/threshold changes; architectural shifts (channel role, supply formula, page renumbering); page restructuring; constants added/removed (`PRODUCT`, `LUXURY_FACTOR`). Brief any background sub-agent to append its own entry. Don't log Guillaume's manual changes.
3. **Trust the changelog over memory.** Conflicts → re-derive from current files. Memory is a snapshot; changelog + filesystem is ground truth.
4. **If the 10 injected lines don't span back to your last touch-base,** read the full `working files/changelog.md` and re-read any files whose state may have shifted.

NOT worth logging: reading files to answer a question, `check-requirements.sh` runs, cosmetic copy edits.

## Guillaume's lane — don't prompt him on calls he owns

Some decisions are Guillaume's on his own timing; prompts are noise. Ship the work in your lane and stop. Do NOT close turns reminding him to act on:

- **STORED-recipe edits + `/retire-recipe` timing.** When model-side ships and STORED would follow: record state in changelog/spec/derivation if useful, stop. Don't propose stored values; don't re-flag audit-trail gating in summaries.
- **Operator-side ramp decisions.** Drift gauges (stored vs FP) are operator concerns; he picks when to ramp.
- **External-signal polling.** Tissue, PA Taillon ack, vendor QC, lab returns — he surfaces these when ready. Don't re-mention "waiting on X."

Spec/derivation/learnings MAY say "gated on `/retire-recipe`" (for future readers + parallel sessions); end-of-turn summaries to Guillaume MAY NOT.
