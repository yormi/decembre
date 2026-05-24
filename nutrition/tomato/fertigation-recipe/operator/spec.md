# Tomate — fertigation-recipe — operator

UI invariants for the operator-facing tomato fertigation page Philip
reads weekly and on weekday mornings. Procedural data shape (stage
resolution, step source, calc rules) lives in `procedure/spec.md`;
model claims in `model/spec.md`.

---

## REQ-181 — tomato-only-render

The page renders only for tomato. Lettuce and seedling-lettuce
fertigation are separate pages in their own subprojects; this page
shows no crop selector and no lettuce or seedling content.

---

## REQ-192 — stage-shown-as-readonly-header-label

The current stage value (resolved per procedure REQ-182) is shown in
the page header as a read-only label. The page exposes no
operator-facing stage selector.

*Supersedes REQ-182 (header-label portion).*

---

## REQ-184 — two-card-shape

The page renders exactly two cards: a weekly preparation card
("Lundi matin — préparer la solution") and a daily verification
card ("Mardi à vendredi — vérification matinale"). No configuration
card, no diagnostic / success-criteria card.

---

## REQ-193 — stock-volume-inline-in-prep-step

The stock-barrel water volume (computed per procedure REQ-188) is
displayed inline in the relevant preparation step. The radiation
driver behind the calculation is not surfaced to the operator.

*Supersedes REQ-188 (anchor-placement portion).*

---

## REQ-189 — missing-stored-stage-error-card

When the locked stored fertigation recipe has no entry for the
current stage, the preparation card is replaced by an error card
naming the stage. The page never silently displays zero-gram
quantities.
