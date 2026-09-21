#!/usr/bin/env bash
# PreToolUse: block any tool call that names a frozen file. List: scripts/frozen-files.txt
cd "$(dirname "$0")/.." || exit 0
input=$(cat)
while IFS= read -r frozen; do
  [ -z "$frozen" ] && continue
  if printf '%s' "$input" | grep -qF -- "$frozen"; then
    echo "BLOCKED: '$frozen' is frozen (scripts/frozen-files.txt). Do not edit, move, or overwrite it." >&2
    exit 2
  fi
done < scripts/frozen-files.txt
exit 0
