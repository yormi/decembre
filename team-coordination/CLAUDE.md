# team-coordination/

Persona infrastructure: identity, decision values, procedures, cross-persona handoffs.

## Four storage layers

Separates HOW from WHEN/WHY from WHO. Conflating muddies all three.

- **Skills — HOW, cross-persona.** Procedural, triggered by task-description match. Executable, shareable across personas + sessions. Lives in `.claude/skills/` (project) or `~/.claude/skills/` (user). Slash-invocable.
- **Procedures — HOW, persona-local.** Procedural how-to specific to one persona (queue-processing, mailbox sweeps, fan-out, wave orchestration). Loaded only when triggered, NOT on persona entry — keeps persona load slim. Lives in `<persona>/procedures/<name>.md`. Persona file says "when X, follow `procedures/<name>.md`". Not slash-invocable; reachable only through the persona.
- **Principles — VALUES.** Stance Guillaume aligned on at a judgment call. Ambient, loaded on persona entry. Persona-local, append-only. Lives in `<persona>/principles.md`.
- **Persona — WHO.** Identity, scope, lane boundaries. Guillaume-curated. Lives in `.claude/agents/<persona>.md`.

Filing rule: repeatable cross-persona how-to → skill. Persona-local how-to → procedure. Judgment-call stance → principle. What the persona is → persona.

## Procedures convention

Persona files MUST NOT pre-load mailboxes, inbox files (`from-*.md`, `from-*-done.md`), drafts queues, full spec-tree scans, or any other queue-state on entry. Those reads happen inside the procedure that needs them, at trigger time.

Persona file `Inputs at session start` minimum: persona file itself, `CLAUDE.md`, `team-coordination/CLAUDE.md`, `requirements.md`, own `principles.md`, `_shared/principles.md`, recent `working files/changelog.md`. Anything else (in-scope spec, derivation, inbox, drafts) lives in the relevant procedure.

Trigger phrasing in persona file: "When Guillaume asks to <X>, follow `procedures/<name>.md`." Procedure file is self-contained — assumes the persona is already loaded, lists its own reads + steps + writes.

## Principles convention

One `principles.md` per persona, under `<persona>/`.

Persona reads its own `principles.md` + the shared `_shared/principles.md` on entry. When Guillaume's decisions reveal a transferable value, **draft the principle inline and surface for his confirmation before writing to the file** — he may reject, edit, or confirm. Only write on explicit confirm; a wrong-stated principle propagates across every future decision in that persona. Cross-persona values land in `_shared/`; persona-specific applications stay in `<persona>/`.

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
