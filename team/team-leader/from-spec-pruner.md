# team-leader ← spec-pruner

Sweep / prune notifications from the spec-pruner persona. Each entry names what was deleted or updated, citing `file:line`.

## Format

Append at the top (most recent first):

```
## YYYY-MM-DD HH:MM — <subproject-path-or-sweep-scope>

**Scope:** <what was walked>
**Deletions / updates:** <count> · `file:line` list inline
**Verifier:** npm test X/X · npm run check Y/0
**Punted:** <out-of-lane items surfaced for other personas>
```

## Entries

