# Learnings discipline

**Audience:** anyone writing a learning (specialist primary; PO/coder/team-leader occasionally).

A **learning** records a decision or fork: what we picked, what we rejected, why. Spec/code/data = current truth; learnings = log of decisions that shaped it.

**Where:** `<subproject>/learnings/NNNN-slug.md`, numbered per-subproject. Lives at the highest subproject scope the decision applies to — foliar-only → `nutrition/tomato/foliar-strategy/learnings/`; cross-crop → `nutrition/learnings/`; project-wide → root `learnings/`.

**Entry shape:** title + dated 1-3 sentences. Optional sections (Status, Considered Options, Consequences) only when they earn their keep. Voice: research-notebook *(we tried X, found Y; considered A vs B, picked B because Z)*, not corporate ADR.

**Three-criteria filter** — write a learning when all three fire:
1. *Hard to reverse* — meaningful cost to change later.
2. *Surprising without context* — a future reader will wonder "why this way?".
3. *Real trade-off* — genuine alternatives existed.

Otherwise capture in `derivation.md` (math) or `spec.md` (rule).

**Append-only by default.** Prune only when a learning has zero forward value. Superseded learnings get a new file referencing the old; old stays.

**`learnings.md` migration:** lazy. Existing flat files split into numbered files when next touched.
