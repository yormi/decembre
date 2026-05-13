# Principles — spec-pruner

Distilled from Guillaume's CONFIRM / KEEP / NEED_MORE_INFO decisions on pruner candidates. Read on load. Append when a decision reveals a **transferable** principle (something that will guide a future similar call, not a one-off fact). Keep terse: one line, two max. Most recent at the top.

When the list exceeds 30 entries, consolidate: merge overlapping, retire principles superseded by newer ones, prune anything already captured better by CLAUDE.md / memory / persona file.

## Format

`- P-NN — [principle]. *Because:* [why]. (YYYY-MM-DD)`

A principle is transferable if it applies to **more than the case that revealed it**. If it's only about this one candidate or this one subproject, it's not a principle — it's project state.

## Principles

- P-02 — **Vestigial constructs + ghost references — autonomous delete, no surfacing.** Vestigial: a parameter the body ignores (e.g. `_surfactant`), a function with no production caller (only tests + verifier pin it), a constant with no remaining reader after a recent refactor, an annotation/marker comment ("// stable —", trace breadcrumbs). Ghost reference: a doc / table / code reference to a symbol or constant that doesn't exist (e.g. `FOLIAR_AREA_M2` referenced in `derivation.md` when no such constant lives in the code). For both: delete the dead surface AND any consumer that only existed to read it (including REQ entries listing it on a public-API table — amend in place). Don't ask first. *Because:* surfacing these eats Guillaume's review cycles on bookkeeping; the project's `feedback_no_vestigial.md` rule already forbids "stuff that technically still holds" — the pruner's job is to enforce it. (2026-05-13)
- P-01 — A "Hypothèses du calcul"-style card of explanatory prose bullets (mass-balance framing, formula derivations, source citations, surface-area facts, "Recettes tirées de…" footnotes) in `*/app/page.html` is unspecced narrative even when the bullets look "factual" — delete in autonomous mode when no test reaches it + no REQ ties it + no JS consumes it. *Because:* the project's `feedback_no_unspecced_narrative.md` rule names this exact pattern as forbidden; the bullets are calculation context, not action info. (2026-05-13)
