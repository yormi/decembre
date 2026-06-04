# Tomate — fertigation-recipe — operator

UI invariants for the operator-facing tomato fertigation page Philip
reads weekly and on weekday mornings. Procedural data shape (stage
resolution, step source, calc rules) lives in `procedure/user-stories.md`;
model claims in `model/spec.md`.

---

## tomato-only-render

The page renders only for tomato. Lettuce and seedling-lettuce
fertigation are separate pages in their own subprojects; this page
shows no crop selector and no lettuce or seedling content.

---

## stage-shown-as-readonly-header-label

The current stage value (resolved per `procedure — stage-from-iso-week`)
is shown in the page header as a read-only label. The page exposes no
operator-facing stage selector.

---

## single-visible-prep-card

The page renders one visible card: the weekly preparation card
("Vendredi matin — préparer la solution"). The daily verification
card ("Lundi à vendredi — vérification matinale") is kept in
markup but hidden. No configuration card, no diagnostic /
success-criteria card.

---

## stock-volume-inline-in-prep-step

The stock-barrel water volume (computed per `procedure —
stock-volume-calc-quarter-bucket`) is displayed inline in the relevant
preparation step. The radiation driver behind the calculation is not
surfaced to the operator.

---

## missing-stored-stage-error-card

When the locked stored fertigation recipe has no entry for the
current stage, the preparation card is replaced by an error card
naming the stage. The page never silently displays zero-gram
quantities.
