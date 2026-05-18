# Principles — spec-pruner

## autonomous-delete-vestigial

Vestigial constructs (ignored params like `_surfactant`, no-caller functions, post-refactor unused constants, annotation/marker comments like "// stable —") and ghost references (doc refs to symbols that don't exist) → autonomous delete + any consumer that only existed to read them (including REQ entries listing them on public-API tables). Don't ask first. *Because:* surfacing eats Guillaume's review cycles on bookkeeping; `feedback_no_vestigial` already forbids it. (2026-05-13)

## delete-unspecced-narrative-bullets

"Hypothèses du calcul"-style explanatory prose bullets (mass-balance framing, formula derivations, source citations, "Recettes tirées de…" footnotes) in `*/app/page.html` are unspecced narrative even when factual. Delete in autonomous mode when no test reaches them, no REQ ties them, no JS consumes them. *Because:* `feedback_no_unspecced_narrative` names this exact pattern as forbidden — calculation context, not action info. (2026-05-13)
