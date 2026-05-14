#!/usr/bin/env bash
# Atomically claim the next REQ-NNN id and append a row to the ledger.
#
# Usage:   scripts/claim-req.sh <target-spec-path> <persona-name>
# Stdout:  the claimed id (e.g. "REQ-155")
# Stderr:  diagnostics on misuse
#
# Closes the parallel-session collision pattern documented in
# team-coordination/plant-nutrition-specialist/from-model-challenger-done.md
# (C3 entry). Acquires an exclusive flock on the
# ledger, scans the spec tree + ledger tail for the highest REQ-NNN, computes
# next, appends a claim row, releases the lock. The lock release is implicit
# on process exit.

set -euo pipefail

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <target-spec-path> <persona-name>" >&2
  exit 2
fi

target_path="$1"
persona="$2"
ledger="team-coordination/req-ledger.md"

if [ ! -f "$ledger" ]; then
  echo "Ledger missing: $ledger (run from repo root)" >&2
  exit 1
fi

exec 9>>"$ledger"
flock -w 5 9 || { echo "Could not acquire ledger lock within 5s" >&2; exit 1; }

max=$(
  {
    grep -hoE 'REQ-[0-9]+' requirements.md 2>/dev/null
    find nutrition yield-range -name 'spec.md' -type f -exec grep -hoE 'REQ-[0-9]+' {} + 2>/dev/null
    grep -hoE 'REQ-[0-9]+' "$ledger"
  } | sed 's/REQ-//' | sort -un | tail -1
)

next=$((max + 1))
claimed=$(printf "REQ-%03d" "$next")

timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
session_id="${CLAUDE_SESSION_ID:-claude-code}"
echo "$timestamp — $claimed — $persona — $session_id — $target_path" >&9

echo "$claimed"
