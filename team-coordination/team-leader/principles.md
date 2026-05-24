# Principles — team-leader

## multi-stage-in-one-session

When Guillaume green-lights "do the full N stages", sequence as N coder subagents with verifier-green gate + commit between each — even within one session. Each stage independently revertible via `git revert <commit>`. *Because:* per-stage commits preserve revertability regardless of session boundaries (6-stage `app/index.html` carve, 5523→2341 lines, 2026-05-16). (2026-05-16)

## surface-owned-mismatch-dont-punt

When a mailbox entry's natural work surface lands outside the persona's owned globs, surface the partition to Guillaume (test-writer / coder / pruner targets vs. owned vs. never-touch — table form). Never auto-attempt-note-then-loop-guard. *Because:* the original surface cut is a starting prior, not a hard wall; punt-by-attempt-note loses the wave (2026-05-15 PO mailbox episode). (2026-05-15)

## auto-commit-per-pass

Once tests + verifier are green and the current pass's scope is acknowledged, commit immediately. One PR-shaped change per commit; do not accumulate uncommitted state for a "final" commit. *Because:* multi-wave uncommitted state is unrevertible piecemeal; per-pass commits keep history bisectable. (2026-05-13)

## amend-spec-on-direct-ruling

When Guillaume's direct ruling contradicts a spec body, amend the spec body in place to match the ruling (overrides team-leader's default "no spec edits"). *Because:* Guillaume's autonomy directives give team-leader PO-like authority on this case; routing wastes the wave. (2026-05-12)

## test-depth-matches-spec-demand

Before grading a Wave 1 test "shape-only / weak", check what the spec actually demands. If the spec is shape-only (cert-5 "structural" REQs typical), the test correctly mirrors the spec — depth complaint routes to PO / spec-pruner, not back to test-writer. *Because:* re-spawning test-writers to write deeper tests than the spec demands wastes the wave and drifts tests away from spec. (2026-05-12)

## tests-pin-to-spec-not-impl

When a spec encodes a "policy vs current-implementation drift" note (spec says X, code does Y), always pin tests to the spec, not the current code. Wave 2 coder converges impl to spec. *Because:* spec is floor and ceiling; tests that pin current-but-wrong impl freeze the drift and turn Wave 2 fixes into spurious test failures. (2026-05-12)

## wave-scope-flexibility

Default to "all subprojects with `spec.md` in scope" but accept narrower scoping when Guillaume asks (e.g. "nutrition/tomato and nested only"). *Because:* a 6-subproject wave reviewable in one head-context; a 19-subproject diff overflows it. (2026-05-12)

## wave-1-reconciles-existing-tests

Wave 1 runs against every subproject with a `spec.md`, including ones that already have `*.test.mjs`. Test-writer's job is to reconcile to the current spec, not skip on file existence. *Because:* specs drift; "test file exists" ≠ "test matches current normative claims". (2026-05-12)

## clean-tree-scope-test-code-only

Phase −1 clean-tree scope is test + code files only (`*.test.mjs`, `test-helpers.mjs`, `calc.js`, `model.js`, `data.js`, `app/logic.js`, `package.json` test script). Other surfaces (`team-coordination/`, `working files/`, in-flight spec edits) may be dirty. *Because:* team-leader's blast radius is the test/code surface; locking the whole tree blocks the wave on unrelated work. (2026-05-12)
