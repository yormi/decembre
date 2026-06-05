# Procedure — run a wave (Phase −2 → Wave 3 → final check)

**Trigger:** dispatched from `skills/process-mailbox.md` after schema validation passes. Also: Guillaume says "run a wave on X" or "full sweep".

## Subproject discovery (full-sweep only)

```bash
find . \( -name spec.md -o -name user-stories.md \) -not -path './node_modules/*' -not -path './dist/*' -not -path './.claude/*' -not -path './.git/*'
```

Plus root `spec.md` (treated as one subproject). Each unique dir containing `spec.md` (model surface) or `user-stories.md` (PO surface) = one subproject = one test-writer + coder + pruner.

For incremental waves, scope comes from the mailbox entries (dedup across files).

## Test layer reminder

Distinct from the verifier. Executable assertions in `node:test`, run via `npm test`.

- Built-in `node:test` only (jsdom is the sole dev-dep; keep it that way).
- File path: `<subproject>/*.test.mjs`, default `spec.test.mjs`.
- Each `REQ-NNN` maps to ≥1 `test('REQ-NNN — <statement>', ...)`.
- DOM tests follow the jsdom pattern from `scripts/check-recipes.mjs`.

If `package.json` lacks a `test` script, add `"test": "node --test '**/*.test.mjs'"` **before Wave 1** (avoids 19 parallel writers fighting over the file).

## Phase −2 — Auto-commit owned surface

Before wave kickoff (not between waves):

1. `git status --porcelain`. Partition dirty paths into owned-dirty / foreign-dirty.
2. Owned-dirty empty → skip to Phase −1.
3. Owned-dirty non-empty:
   - `package.json`: peek at the diff. If anything other than the `"test":` entry, **don't stage it**; warn Guillaume; proceed without it.
   - Stage remaining owned-dirty paths explicitly by path. Never `git add -A`.
   - Commit: `Checkpoint: team-leader Phase −2 — pre-wave owned-surface snapshot` + bullet list of paths.
   - Commit fails → `awaiting-Guillaume`, stop. No amend, no retry.

Foreign-dirty paths are someone else's in-flight work. Leave them.

## Phase −1 — Verify clean owned surface

`git status --porcelain` again. Any owned path still dirty → refuse, surface the list (means Phase −2 carved out package.json or similar). Foreign-dirty is fine. Never bypass — the point is the wave's diff is revertible with one `git reset`.

## Wave-based execution

Three waves, strict order, parallel within each.

**Wave 1 — test-writers.** One Agent call per subproject, parallel. Read spec, identify uncovered REQs, write `node:test` tests. No edits outside `*.test.mjs`.

**Wave 2 — coders.** After Wave 1 returns, run `npm test` to capture failure baseline. Spawn one coder per subproject, parallel. Read tests, run them, write minimal code in `calc.js` / `model.js` / `data.js` / `app/logic.js` to pass. No test edits.

**Wave 3 — pruners.** Run `npm test` to confirm green. Spawn one pruner per subproject, parallel. Follows `spec-pruner.md` discipline with trigger override: delete where "no test reaches this code".

**Final check.** `npm test` AND `npm run check` both green. If red, surface deletions causing it and offer revert.

**Changelog.** One consolidated entry: N subprojects, M new tests, K lines pruned, T REQs wired.

## Subagent prompt templates

Pass absolute paths. Include never-touch list. Require structured return report.

### Return-size discipline

Every sub-agent prompt (test-writer / coder / pruner / any `Explore` or `general-purpose` discovery agent) MUST cap return at <2k words, structured, with NO quoted file bodies. Findings cite `file:line` only; the leader Reads the cited range if needed. Sub-agent transcripts land in this conversation's context as full tokens — long raw returns are a primary driver of >200k-token sessions. Prompt template:

> Return: <structured fields>. Hard cap: 2000 words. No quoted file contents — cite `file:line` and let me Read the range.

### Test-writer (Wave 1)

```
You are spawned by the team-leader. Read /home/guillaume/Documents/Random_Projects/decembre/.claude/agents/test-writer.md and adopt that role. Subproject: <ABSOLUTE_PATH>. Framework: node:test. Files: <subproject>/*.test.mjs.
Inputs you MUST read: subproject's spec.md AND derivation.md (model-layer subprojects — derivation is the formal blueprint; cover its worked examples + coefficients + algorithm steps, not just spec headers).
Node: run `npm test` under Node ≥ 18 (`fnm use lts-latest`). Default Node 16.20.2 silently no-ops module-level `describe`/`test`, producing false-green reports — false greens propagate as missing coverage through Wave 2 + Wave 3.
Never touch: STORED_RECIPE.tomato.*, RECIPE_HISTORY, dist/, package.json.
Return: test files added, REQs now covered, derivation worked examples covered, items you could not test and why.
```

After all Wave 1 subagents return, leader re-runs `npm test` itself to establish the true baseline (same Node ≥ 18 rule).

### Coder (Wave 2)

```
You are spawned by the team-leader. Read /home/guillaume/Documents/Random_Projects/decembre/.claude/agents/coder.md and adopt that role. Subproject: <ABSOLUTE_PATH>.
Inputs you MUST read: subproject's spec.md AND derivation.md (model-layer subprojects — derivation is the formal blueprint your code implements: formulas, coefficients, algorithm steps, worked examples) + the failing tests.
Failing tests: <PASTE_FILTERED_NPM_TEST_OUTPUT>.
Never touch: *.test.mjs, spec.md, derivation.md, STORED_RECIPE.tomato.*, RECIPE_HISTORY, dist/, scripts/check-spec.sh, package.json. (scripts/check-recipes.mjs IS owned — REQ matchers OK.)
Return: files modified, REQs now passing, failures you could not fix and why.
```

### Pruner (Wave 3)

```
You are spawned by the team-leader. Read /home/guillaume/Documents/Random_Projects/decembre/.claude/agents/spec-pruner.md — but swap the trigger: delete code where "no test reaches it", not "no REQ traces to it".
"Reached" = node:test imports the symbol, transitively calls a function that does, or symbol appears in a render-block exercised by jsdom. Grep + import-graph.

Subproject: <ABSOLUTE_PATH>.
Autonomous mode:
- Prove (whole-repo grep) zero callers AND zero test imports → delete now.
- KEEP at certainty ≤ 3.
- Borderline → leave in place, surface in report.
Never touch: STORED_RECIPE.tomato.*, RECIPE_HISTORY, dist/, *.test.mjs, scripts/check-spec.sh, spec.md, user-stories.md.
Run `npm test` + `npm run check`. If either breaks, revert this subproject's deletions and report cause.
Return: deletions applied, borderline items surfaced, npm test + check status.
```

## Parallelism

Dispatch all Wave-N subagents in one message. Strict serial across waves. `subagent_type: "general-purpose"`. For 19+ subprojects, prefer `run_in_background: true` and aggregate when all return.

## Confirmation gates

Stop and ask Guillaume when:

- Subagent reports a **spec gap** — route to product-owner or specialist.
- Subagent proposes touching `STORED_RECIPE.*` or `RECIPE_HISTORY` — always escalate (use `/retire-recipe`).
- `npm test` OR `npm run check` red and cause unclear from subagent report.
- Wave 3 total deletions exceed 200 lines tree-wide — surface candidates for batch review.

Otherwise: keep moving.
