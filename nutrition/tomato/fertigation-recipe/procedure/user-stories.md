# Tomate — fertigation-recipe — procedure

Procedural data layer behind the operator-facing tomato fertigation page:
stage resolution from ISO week, step-source data shape, step-inclusion
rule, stock-volume computation. Operator-visible UI claims (page header,
card shape, anchor placements) live in `operator/user-stories.md`. Model claims
(sizing, supply) in `model/spec.md`.

---

## REQ-182 — stage-from-iso-week

The current tomato production stage is resolved automatically from the
current ISO week. The resolution is the sole source of the stage value
consumed by every procedure step on the page; no operator override.

---

## REQ-183 — stored-recipe-is-sole-source

All gram quantities shown on the page come exclusively from the
locked stored fertigation recipe for the current stage — for every
product that recipe carries. The page never reads the
first-principles recipe and applies no runtime adjustment factor on
top of stored values.

---

## REQ-185 — dosatron-verification-in-first-prep-step

The first weekly preparation step includes a verification that the
Dosatron injection ratio is set to 2 % (silver ring on the unit).
The 2 % value is the source of truth Philip reads on the page; if
the ring shows a different ratio he resets it to 2 %.

---

## REQ-186 — steps-from-structured-source

Every step in both cards renders deterministically from a structured
data source (title, description, optional amount, optional
"Pourquoi"). No step prose lives inline in markup.

---

## REQ-187 — pourquoi-included-only-above-importance-bar

A "Pourquoi" explanation is included on a step only when skipping
the step causes meaningful damage to equipment, recipe quality, or
audit trail (operational importance ≥ 4 on a 5-point scale).
Educational or decorative rationales are omitted.

---

## REQ-188 — stock-volume-calc-quarter-bucket

The weekly stock-barrel water volume consumed by the preparation
card is computed as a single litre value, rounded up to the nearest
quarter of a 20 L bucket (5 L). Formula constants live in the
fertigation-recipe model spec.

---

## REQ-190 — prep-completion-slack-post

The last step of the Lundi-matin preparation instructs the operator
to post a record (date, stage, quantities) to the team Slack
channel `#recherche-et-developpement`.

---

## REQ-191 — empty-barrel-slack-post

The daily verification card instructs the operator, when the stock
barrel is found empty, to post `Solution tomate vide - [Jour]` to
`#recherche-et-developpement`.
