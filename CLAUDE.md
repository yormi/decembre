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
- Formulas, current math → code (`calc.js`, `model.js`) is the source of truth; `derivation.md` is **optional**, kept only where code-only reading is genuinely hostile (dense integrators, multi-step coupling).
- Decisions, trade-offs, rejected alternatives, why-this-number → `*/learnings/NNNN-slug.md` (numbered, dated, append-only — see Learnings below).
- Per-element values, magic numbers, datasets → `data.js` or calibration files.
- Implementation walkthroughs, code excerpts, paths to consumers.

**Operating rules:**
- *Not auto-enforceable → not a spec.* Manual-review items go to team process (Catherine's #review), not `spec.md`.
- *Edit in place when superseded — no vestigial entries.* History lives in git, not supersedes chains or strikethrough.
- *Slug uniqueness is per spec file.* No central ledger.

**When a spec gains complexity (formulas, tables, edge cases), split it.** `spec.md` keeps normative claims; *what the code does* → the code itself (`calc.js`, `model.js`, `data.js`); *why-this-number* + *why-this-decision* → `learnings/NNNN-slug.md`. Only add `derivation.md` if a real reader hits friction reading the code end-to-end. Target: 5-minute read.

**Migration:** lazy. Existing `derivation.md` files stay until next touched; when next touched, move formulas to code (or code comments at the call site), move why-this-number to a learning, and delete the file. Exceptions kept by maintainer judgment.

## Learnings

A **learning** records a decision or fork: what we picked, what we rejected, why. `derivation.md` answers *"how does the current model compute X?"*; learnings answer *"why is the model shaped this way?"*. Together: spec + code + data = current truth (HEAD); derivation.md = current math explanation; learnings/ = log of decisions that shaped HEAD.

**Where:** `<subproject>/learnings/NNNN-slug.md`, numbered per-subproject (no global counter). Lives at the highest subproject scope the decision applies to — foliar-only → `nutrition/tomato/foliar-strategy/learnings/`; cross-crop → `nutrition/learnings/`; project-wide → root `learnings/`.

**Entry shape:** title + dated 1-3 sentence default. Optional sections (Status, Considered Options, Consequences) only when they earn their keep. Voice: research-notebook *(we tried X, found Y; considered A vs B, picked B because Z)*, not corporate ADR prose.

**Three-criteria filter** — write a learning when all three fire:
1. *Hard to reverse* — meaningful cost to change later.
2. *Surprising without context* — a future reader will wonder "why this way?".
3. *Real trade-off* — genuine alternatives existed.

Otherwise it's just current state — capture in `derivation.md` (math) or `spec.md` (rule).

**Append-only by default.** Prune only when a learning has zero forward value (e.g. a calibration we'll never retry). Superseded learnings get a new file referencing the old; old stays.

**Migration:** lazy. Existing flat `learnings.md` files stay until next touched; when next touched, split into numbered files.

## Code style — Elm-influenced JS

Calc/model layers are pure (no I/O, no globals, no `Date.now`).
Beyond purity, write JS in a shape that would translate
mechanically to Elm later — the safety wins are real even
without the compiler.

- **Discriminated unions as tagged objects.** Variant data
  carries a `kind` discriminant: `{kind: 'foliar', ...}`,
  `{kind: 'fertigation', ...}`. Branch on `kind`. No
  duck-typing, no "if this field exists then…".
- **Exhaustive switches.** Every `switch (x.kind)` ends with
  `default: throw new Error(`unreachable: ${x.kind}`)` (the
  Elm `_ -> Debug.todo` equivalent). New variant added →
  every switch breaks loud, not silent.
- **Result / Maybe shapes for partial functions.** When a
  calc can fail (missing input, out-of-range), return
  `{ok: true, value}` / `{ok: false, error}` or
  `{some: true, value}` / `{some: false}` — never `null`,
  never throw for expected branches. Throw only for true
  invariant violations.
- **Immutable data.** No in-place mutation of inputs.
  Functions return new objects. Spread freely; arrays via
  `.map` / `.filter` / `.reduce`, never `.push` on a passed-
  in array.
- **Total functions over defaults.** Prefer signatures that
  force the caller to handle every case over silent
  defaults that paper over missing inputs.
- **No nullable mixed-shape returns.** A function returns
  one shape, not "object or null or number." If it can
  return nothing, use Maybe.

Lazy migration: existing code stays until next touched;
when you edit a calc/model function, refactor its shape to
match. No big-bang rewrite.

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
