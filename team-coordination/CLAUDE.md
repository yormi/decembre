# team-coordination/

Persona infrastructure: identity, decision values, procedures, cross-persona handoffs.

## Three storage layers

Separates HOW from WHEN/WHY from WHO. Conflating muddies all three.

- **Skills — HOW.** Procedural, triggered by task-description match. Executable, shareable. Lives in `.claude/skills/` (project) or `~/.claude/skills/` (user).
- **Principles — VALUES.** Stance Guillaume aligned on at a judgment call. Ambient, loaded on persona entry. Persona-local, append-only. Lives in `<persona>/principles.md`.
- **Persona — WHO.** Identity, scope, lane boundaries. Guillaume-curated. Lives in `.claude/agents/<persona>.md`.

Filing rule: repeatable how-to → skill. Judgment-call stance → principle. What the persona is → persona.

## Principles convention

One `principles.md` per persona, under `<persona>/`.

Persona reads on entry. When Guillaume's decisions reveal a transferable value, **draft the principle inline and surface for his confirmation before writing to the file** — he may reject, edit, or confirm. Only write on explicit confirm; a wrong-stated principle propagates across every future decision in that persona.

Format: `## <slug>` heading + body `<rule>. *Because:* <why>. (YYYY-MM-DD)`. Slug = kebab-case, unique within the file (persona-scoped, not global). Blank line between entries. Most-recent at top. Legacy `P-NN` ids or bulleted-list entries migrate to `## <slug>` heading lazily on next edit.

>30 entries → consolidate: merge overlap, retire superseded, prune what CLAUDE.md / memory / skills cover.

## Cross-persona handoffs: `<recipient>/from-<sender>.md` ↔ `<recipient>/from-<sender>-done.md`

Producer-consumer mailbox. Lives under **recipient's** subdir, named for **sender** (e.g. `team-leader/from-product-owner.md` = PO writes, team-leader reads). Producer appends to pending; consumer cuts to `-done.md` once processed, appends outcome block. `-done.md` is transient buffer until any downstream verifier consumes; then deletable. Spec/code is ground truth, not the archive.

`from-` and `-done` are reserved — no persona uses either, so hyphens in persona names parse unambiguously.

Multi-sender recipients get one channel per sender (no fan-in). Team-leader treats its two channels as one logical queue, sender tagged by filename.

Live instances:

| Pending | Producer | Consumer | Outcome block |
|---|---|---|---|
| `plant-nutrition-specialist/from-model-challenger.md` | model-challenger | specialist | `### Challenger verdict — PASS \| FAIL` |
| `team-leader/from-product-owner.md` | product-owner | team-leader | `### Team-leader outcome (YYYY-MM-DD)` |
| `team-leader/from-plant-nutrition-specialist.md` | specialist | team-leader | `### Team-leader outcome (YYYY-MM-DD)` |

## Working files are transient context

Applies to every persona-local working file — `drafts.md`, scratchpads, plans, ledgers. Holds **PENDING + resolutions ≤7 days**. Nothing older.

On resolution: forward-applicable pattern → principle in `<persona>/principles.md`, then prune body. No pattern → prune directly. Audit lives in git log; spec/code is ground truth.

No-op / byte-identical re-fire / trivial diff: exit silent, do not append.
