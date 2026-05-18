# team-coordination/

Cross-persona handshake files. Two recurring patterns.

## Producer → consumer mailbox: `<recipient>/from-<sender>.md` ↔ `<recipient>/from-<sender>-done.md`

Channel lives under the **recipient's** subdir, named for the **sender** (e.g. `team-leader/from-product-owner.md` = product-owner writes, team-leader reads). Producer appends to pending. Consumer cuts the entry to `-done.md` once processed, appends an outcome block under the original. `-done.md` is transient buffer between consumer action and any downstream verifier check (e.g. challenger PASS); once the verifier consumes its signal, the entry can be deleted — spec/code current state is the ground truth, not the archive.

`from-` and `-done` are reserved — no persona uses either, so hyphens in persona names parse unambiguously.

Multi-sender recipients get one channel per sender (no fan-in). Team-leader treats its two channels as one logical queue, sender tagged by filename.

Live instances:

| Pending | Done buffer | Producer | Consumer | Outcome block |
|---|---|---|---|---|
| `plant-nutrition-specialist/from-model-challenger.md` | same `-done.md` | model-challenger | specialist | `### Challenger verdict — PASS \| FAIL` |
| `team-leader/from-product-owner.md` | same `-done.md` | product-owner | team-leader | `### Team-leader outcome (YYYY-MM-DD)` |
| `team-leader/from-plant-nutrition-specialist.md` | same `-done.md` | specialist | team-leader | `### Team-leader outcome (YYYY-MM-DD)` |

## Persona-local principles: `<persona>/principles.md`

One file per persona. Persona reads its own on entry; appends `- P-NN — [principle]. *Because:* [why]. (YYYY-MM-DD)` when Guillaume's decisions reveal a transferable pattern. Compounds autonomy.
