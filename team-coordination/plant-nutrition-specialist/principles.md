# Principles — plant-nutrition-specialist

## conservative-physics-floor-extrapolation

When extrapolating a constant beyond a single solid anchor (one breeder spec, one lab reading, one published reference), declare the conservative-physics or geometric floor as the basis — not a fit/regression through unmeasured intermediate points. *Because:* a curve anchored on one row coincides with reality only at that row and over-predicts everywhere else; the mechanistic baseline is the conservative floor (yield-range cap-basis switch, 2026-05-17). (2026-05-17)

## fan-out-multi-subproject

When work spans 4+ subprojects in one session (tree-wide hygiene, cross-cutting reframe, post-batch cleanup), fan out: Phase 0 triage + per-subproject `todo/<subproject>.md`, Phase 1 deputies in parallel, Phase 2 orchestrator synthesizes + deletes resolved todos. *Because:* one inbox + N parallel lanes outruns one serializer. (2026-05-17)

## no-pa-taillon-polling

Never ask Guillaume to check with PA Taillon. Take the most defensible default and ship; PA's view surfaces through Guillaume on his timing. *Because:* Guillaume — "we need to move forward, can't wait on that". (2026-05-17)

## fork-only-on-yield-and-uncertain

Surface a fork to Guillaume only when yield-impact is high AND I'm genuinely uncertain. Default = decide and ship. *Because:* asking on plumbing/hygiene/scrubs is noise; low-medium yield-impact = take the most defensible call. (2026-05-17)

## no-integrator-edits-in-subagent-brief

When spawning sub-agents for specialist tasks, never brief them to edit page-level integrator files (`app/index.html`, `*/app/logic.js`, `*/app/page.html`, `dist/`). Page-integrator changes file to team-leader inbox for coder cascade. *Because:* persona boundary; F1 brief shipped out-of-jurisdiction edits (2026-05-16). (2026-05-16)

## back-compat-plus-lever-aware

When extending a static capability map with an operator-lever axis (surfactant, sprayCount, pH), expose BOTH forms: the back-compat default-regime map AND the lever-aware function. Drop the back-compat key only after all callers migrate. *Because:* changing shape unilaterally breaks in-app consumers and forces same-PR coder rewrite that violates the persona boundary. (2026-05-16)

## dl-as-ceiling-not-null

When a lab reading is below detection limit (<DL), record the DL value as a conservative ceiling with reduced cert (2 vs 4 for direct readings), not `null` / em-dash. Pair with a refinement trigger in `derivation.md`. *Because:* preserves the "every wired element exposes a numeric value" downstream contract; DL is an upper bound, not nothing. (2026-05-16)

## fp-churn-invisible-to-team

FP-target churn and admin-page output are invisible to the team per [[stored-is-team-interface]]. Drop "team would see this gap" / "stable target for team" framing from refit recommendations. *Because:* model can refit as often as the spec demands; only STORED edits via `/retire-recipe` reach the team. (2026-05-15)

## pin-constant-to-derivation

When a derived value (FP target, model output) and a hand-coded constant are supposed to be equal, pin the constant to the function output via a structural invariant REQ + verifier, not documentation or trust. *Because:* hand-locked anchors silently drift after a reference-frame shift (REQ-098 dropping compost-subtraction made PA Taillon a 58% Mg mismatch, 2026-05-14). (2026-05-14)
