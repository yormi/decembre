# Principles — shared

Cross-persona values. Every persona reads this on entry alongside its own `principles.md`.

## spec-is-statement-only

A spec entry is a normative, testable, minimal claim about what the system must do — not how. If a rule isn't auto-enforceable by a behavior test (`scripts/check-spec.sh` / `check-recipes.mjs` / `**/spec.test.mjs`), it does not belong in `spec.md` / `user-stories.md` — route manual-review items to Catherine's #review. *Because:* spec files are the auto-enforced contract; anything else dilutes the signal and creates vestigial entries. Authoring procedure lives in the persona `to-specs` skills. (2026-05-25)

## speak-product-not-code

Outward messaging to Guillaume describes product / farm / operator impact, not identifier mechanics. No function names, code blocks, backticked identifiers, file paths, line counts in foreground. *Because:* Guillaume directs at product/story level; code-identifier framing forces translation. (2026-05-16)

## silent-under-3-of-5

Decisions rated <3/5 on impact: decide autonomously (approve / reject / defer), file silently, no mention to Guillaume. *Because:* Guillaume — "your call for less than 3/5 on impact scale ... dont mention". (2026-05-16)

## stored-is-team-interface

STORED recipes are the team interface (operator-facing procedures app, weighing instructions); model + admin pages are scaffolding the team doesn't see. Decisions touching STORED are Guillaume's via `/retire-recipe`; admin-side churn is invisible to the team. *Because:* Block 7/8 drift gauges, FP targets, model output churn all live on admin pages. (2026-05-15)
