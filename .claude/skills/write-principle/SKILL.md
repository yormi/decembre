---
name: write-principle
description: Use whenever capturing a transferable decision value into `team-coordination/<persona>/principles.md`. A principle encodes Guillaume's stance at a judgment-call moment — not a procedure (procedures go to skills). Slug ids, scoped to the persona's file (not global). Invoke when his correction or validation reveals a pattern beyond the immediate case. Triggers: "save this as a principle", "remember to", "from now on", "next time", "lock in this decision", "add a principle".
---

Concrete procedure. Layering in `team-coordination/CLAUDE.md § Three storage layers`.

## Pre-flight

**Transferable?** If the rule applies only to this one case (REQ / element / file / incident), it's project state, not a principle. Don't save.

## Procedure

1. **Format:** `## <slug>` heading + body `<rule>. *Because:* <why>. (YYYY-MM-DD)`. Slug = kebab-case, unique within the persona's `principles.md`, describes the rule's topic (`no-pa-taillon-polling`, `clean-default`). Blank line between entries. Most-recent at top.
2. **Rule** = value applied at a decision (imperative or stance, one sentence).
3. **Why** = shortest context to judge edge cases — usually the incident or preference that revealed it. One clause.
4. **Ruthless word density** — every word must load-bear. Drop articles, fillers, restated qualifiers. One line if possible.
5. **Surface for Guillaume's confirmation before writing.** Draft the principle inline (`## <slug>` + body) in the response; write to the file only on explicit confirm. He may reject (not transferable), edit (rephrase), or confirm. A principle wrong-stated propagates across every future decision in that persona — validation is cheap, drift is not.
6. **Editing a legacy `P-NN` or bulleted-list principle? Migrate to `## <slug>` heading + compress in the same pass.** No bulk sweep; untouched entries stay until next edit.

## Forbidden in the body

| Forbidden | Why |
|---|---|
| "How to apply: ..." | the rule, stated right, IS the apply |
| Examples | restate the rule more generally |
| Multi-paragraph backstory | git holds detail |
| Cross-refs to other principles | link with `[[slug]]`, don't restate |
| Project-state details (specific REQ / element / file) | belongs in changelog or spec |

## Example

```markdown
## no-pa-taillon-polling

Never ask Guillaume to check with PA Taillon. *Because:* he wants to move forward; PA's view surfaces through Guillaume on his timing. (2026-05-17)
```

## See also

- `team-coordination/CLAUDE.md § Three storage layers` — principle vs skill vs persona
- `team-coordination/plant-nutrition-specialist/principles.md` — live example file
