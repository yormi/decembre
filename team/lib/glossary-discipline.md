# Glossary discipline

**Audience:** anyone shaping or stress-testing domain language — PO (during grilling / spec authoring), specialist (when naming model concepts), team-leader (when routing waves whose terminology drifts across handoffs).

A **glossary** records the project's canonical terms: what a word means here, what it does NOT mean, what aliases to avoid. Spec/code = current truth; the glossary = the shared vocabulary the spec and code are written in.

**Where:** `<subproject>/context.md`, at the highest subproject scope the term applies to — foliar-only → `nutrition/tomato/foliar-strategy/context.md`; cross-crop → `nutrition/context.md`; project-wide → root `context.md`. Lazy creation: file appears when the first term is resolved.

## Entry shape

```md
# {Context name}

{One or two sentences: what this context is and why it exists.}

## Language

**Term**:
One- or two-sentence definition. What it IS, not what it does.
_Avoid_: alias-1, alias-2
```

Group under subheadings only when natural clusters emerge. A flat list is fine.

## Rules

- **Be opinionated.** Multiple words for the same concept → pick one, list others as `_Avoid_:` aliases.
- **Flag conflicts explicitly.** Term used two ways → call it out in a `## Flagged ambiguities` section with a proposed resolution.
- **Tight definitions.** One or two sentences. Define what the term IS, not what it does.
- **Only context-specific terms.** General programming / general agronomy concepts don't belong — only words whose meaning is specific to Décembre's domain (crop × stage × layer). Test: would a generic textbook define this the same way? If yes, skip.
- **Show relationships.** Bold cross-references between terms; express cardinality where it matters.

## During a conversation

- **Conflict with the glossary** → call it out the moment it surfaces: *"`context.md` defines X as Y, but you seem to mean Z — which is it?"*
- **Fuzzy or overloaded term** → propose a precise canonical term and ask. *"You said 'recipe' — do you mean the operator-facing block or the model's `computeFoliarSupply` output? Those are different things."*
- **Code disagrees** → grep the codebase; if it contradicts the stated meaning, surface the contradiction before continuing.
- **Resolved term** → update `context.md` inline, in the same turn. Do not batch.

## Single vs multi-context

Most subprojects: one `context.md` at their root.

Project-wide vocabulary that cuts across subprojects → root `context.md` (or a `CONTEXT-MAP.md` listing per-subproject contexts when there are enough to warrant a map; not needed yet).

`context.md` is a glossary — **not** a spec, scratchpad, or decision log. Implementation details belong in `spec.md`; rejected alternatives in `learnings/`; math in `derivation.md`.
