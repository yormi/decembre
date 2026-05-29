---
name: grill-me
description: Grilling session that challenges your plan against the existing domain model, sharpens terminology, and updates documentation (context.md, learnings) inline as decisions crystallise. Use when user wants to stress-test a plan against their project's language and documented decisions.
---

<what-to-do>

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time, waiting for feedback on each question before continuing.

If a question can be answered by exploring the repo, explore the repo instead.

</what-to-do>

<supporting-info>

## Domain awareness

During codebase exploration, also look for existing documentation:

- **Glossary / common language** — per-subproject `context.md`. Conventions, entry shape, when to challenge fuzzy language, when to update inline: [`team/lib/glossary-discipline.md`](../../../team/lib/glossary-discipline.md).
- **Decisions / forks** — per-subproject `learnings/NNNN-slug.md`. Format + three-criteria filter: [`team/lib/learnings-discipline.md`](../../../team/lib/learnings-discipline.md).

Both files are created lazily — only when there's something to write.

## During the session

### Challenge against the glossary

Apply `lib/glossary-discipline.md` live: flag glossary conflicts the moment they surface, sharpen fuzzy terms with a proposed canonical form, cross-reference against code when a stated rule disagrees, and update `context.md` inline (not batched) as terms resolve.

### Discuss concrete scenarios

When domain relationships are being discussed, stress-test them with specific scenarios. Invent scenarios that probe edge cases and force the user to be precise about the boundaries between concepts.

### Offer learnings sparingly

Only offer to write a learning when all three are true:

1. **Hard to reverse** — the cost of changing your mind later is meaningful
2. **Surprising without context** — a future reader will wonder "why did they do it this way?"
3. **The result of a real trade-off** — there were genuine alternatives and you picked one for specific reasons

If any of the three is missing, skip it — capture elsewhere instead. Format + placement: [`team/lib/learnings-discipline.md`](../../../team/lib/learnings-discipline.md). Voice is research-notebook (*we tried X, found Y; considered A vs B, picked B because Z*), not corporate ADR.

</supporting-info>
