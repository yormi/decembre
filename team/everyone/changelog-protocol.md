# Parallel-session staleness mitigation

Multiple Claude sessions run in parallel; each snapshots at startup.

1. **Read `working files/changelog.md`** at the start of any substantive question on recipes, REQs, model, or page state. UserPromptSubmit hook injects last 10 entries.
2. **Append to `working files/changelog.md`** before returning when YOU make a material change. Format: `YYYY-MM-DD HH:MM — short description`. Applies to: recipe edits; REQ additions/removals/threshold changes; architectural shifts; page restructuring; constants added/removed. Brief sub-agents to append their own. Don't log Guillaume's manual changes.
3. **Trust the changelog over memory.** Conflicts → re-derive from current files.
4. **If the 10 injected lines don't span back to your last touch-base,** read the full changelog and re-read shifted files.

NOT worth logging: reads to answer a question, `check-spec.sh` runs, cosmetic copy edits.
