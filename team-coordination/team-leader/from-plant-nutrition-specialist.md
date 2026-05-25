# team-leader ← plant-nutrition-specialist

Spec-change notifications from the plant-nutrition-specialist persona. Each entry names one subproject whose `spec.md` changed (REQs added, edited, or deleted) and signals to the team-leader that test / code / prune work is now pending there.

The team-leader reads this file at session start. When it processes an entry — by running the relevant wave(s) for that subproject — it cuts the entry from this file and appends it to `from-plant-nutrition-specialist-done.md` with a one-line outcome.

## Format

Append at the top (most recent first):

```
## YYYY-MM-DD HH:MM — <subproject-path-relative-to-repo>

**Change type:** added | edited | deleted (one or more)
**REQs affected:** REQ-NNN, REQ-NNN, ...
**Summary:** 1–2 sentences on what changed in the spec.
**Suggested waves:** test-writer · coder · pruner (any/all — leader decides final scope)
```

`<subproject-path>` is the directory holding the changed `spec.md`, e.g. `nutrition/tomato/fertigation-recipe`.

A single turn that touches multiple subprojects writes one entry per subproject.

## Entries

## 2026-05-24 21:24 — nutrition/tomato/foliar-strategy/model

**Change type:** added, edited
**REQs affected:** REQ-195 (added — multi-recipe strategy structure), REQ-196 (added — per-recipe weekly leaf-tolerance cap, oligo=1 Ca=3 cert 3), REQ-197 (added — `sprayCount = min(sprays-to-close-gap, leaf-tolerance-cap)` per recipe), REQ-198 (added — day-spread rule over `nutrition — farm-working-days`), REQ-115 (edited — returns `{doses, sprayCount}` bundle, opts `sprayCount` → `recipeKind`), REQ-116 (edited — reshaped around `computeFoliarStrategy(stage, gap)`), REQ-101 (edited — per-recipe coverage axis, Ca constants), REQ-103 (edited — `computeFoliarStrategy` added to namespace surface), REQ-112 (held transitionally — legacy override to avoid test churn this PR)
**Summary:** Model contract reshaped per the 2026-05-24 PO grill: strategy now contains many recipes; frequency is model output not operator input; per-recipe leaf-tolerance cap bounds the model-computed weekly count; day assignments spread over the farm-working-days set. Coder follow-up flagged: JS namespace `FoliarRecipeTomato` → `FoliarStrategyTomato`; Ca recipe `data.js` entry + `computeFoliarSupply` Ca slot wiring.
**Suggested waves:** test-writer · coder · pruner

**Mailbox entry written by PO on 2026-05-24 23:05** because spawned specialist agent completed without writing it (PO's spawn brief omitted the notify-team-leader step). Specialist's work is authoritative; this entry just relays it.



