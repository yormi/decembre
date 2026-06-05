#!/usr/bin/env bash
# PostToolUse hook — auto-spawn challenger critique on derivation.md edits.
#
# Wired in .claude/settings.json. Receives the standard Claude Code hook JSON
# payload on stdin. When the edited file matches "*/derivation.md", spawns a
# detached headless `claude -p` session loaded with the model-challenger
# persona; the spawned session reads the diff and appends findings to
# team/model-challenger/drafts.md, then exits.
#
# Design notes:
# - Only fires for Edit / Write / NotebookEdit on derivation.md files. Other
#   tool calls and other file types exit 0 immediately.
# - The spawned process is detached (nohup + &) so the originating tool call
#   returns instantly — the critique runs in the background.
# - One spawn per matching edit. Multiple edits in a short window trigger
#   multiple spawns; each one appends its own dated section to drafts.md.
#   If this gets noisy in practice, add a debounce file here.
# - All errors are swallowed (the hook must not block the user's tool call).

set -uo pipefail

payload=$(cat 2>/dev/null || echo '{}')

# Extract tool name + file path. jq is available; if missing, exit silently.
if ! command -v jq >/dev/null 2>&1; then exit 0; fi

tool=$(printf '%s' "$payload" | jq -r '.tool_name // empty' 2>/dev/null || echo '')
file=$(printf '%s' "$payload" | jq -r '.tool_input.file_path // empty' 2>/dev/null || echo '')

case "$tool" in
  Edit|Write|NotebookEdit|MultiEdit) ;;
  *) exit 0 ;;
esac

case "$file" in
  */derivation.md) ;;
  *) exit 0 ;;
esac

# Resolve repo root from the edited file's directory.
repo_root=$(git -C "$(dirname "$file")" rev-parse --show-toplevel 2>/dev/null || echo '')
if [[ -z "$repo_root" ]]; then exit 0; fi

# Only fire inside the decembre repo.
if [[ "$repo_root" != "/home/guillaume/Documents/Random_Projects/decembre" ]]; then exit 0; fi

# Sanity-check claude CLI is on PATH; if not, skip.
if ! command -v claude >/dev/null 2>&1; then exit 0; fi

# Build the spawn prompt. Use a relative file path so it reads cleanly.
rel_file="${file#$repo_root/}"

read -r -d '' prompt <<PROMPT
You are auto-spawned in Mode A (headless auto-critique) of the model-challenger workflow.

The file '${rel_file}' was just edited. Load .claude/agents/model-challenger.md, follow the Mode A protocol:

1. Read CLAUDE.md, ${rel_file}, the sibling spec.md, the parent PO spec.md.
2. Read 'git diff HEAD -- ${rel_file}' (fall back to HEAD~1..HEAD if no working-tree diff).
3. Run the three-angle critique (Blindspots / Complexity).
4. Append findings under a new dated subsection of team/model-challenger/drafts.md. Each finding ends with \` · \\\`PENDING\\\`\`.
5. Do NOT touch any other file. No changelog, no spec edits, no requests.md writes.
6. If the diff is trivial (typo / comment-only / no claim moved), write one line acknowledging the no-op pass and exit.

Exit silent on completion.
PROMPT

# Detached background spawn. All output to /dev/null — the spawned session
# writes its findings to the drafts file directly.
cd "$repo_root"
nohup claude -p "$prompt" </dev/null >/dev/null 2>&1 &
disown 2>/dev/null || true

exit 0
