#!/usr/bin/env bash
# Local hot-reload dev server for the Décembre operations app.
#
# Serves the repo root on http://localhost:8765 with live-reload on file
# changes. Edits to index.html auto-refresh the browser.
#
# Usage:
#   ./scripts/dev-server.sh
#
# Stop:
#   pkill -f live-server
#
# For a persistent server that survives terminal exits, use:
#   ./scripts/dev-server-daemon.sh start
#
# Requires: fnm with Node 22 available, npx (ships with Node).

set -euo pipefail

PORT=8765

# Node 22 is required. live-server's dependency graph doesn't resolve on Node 16.
eval "$(fnm env)"
fnm use 22 >/dev/null

# Free the port if a previous server is still bound.
if ss -tln 2>/dev/null | grep -q ":${PORT} "; then
  echo "Port ${PORT} in use, killing previous server..."
  pkill -f "http\.server ${PORT}" 2>/dev/null || true
  pkill -f "live-server.*${PORT}" 2>/dev/null || true
  sleep 1
fi

echo "Starting live-server on http://localhost:${PORT} ..."
exec npx --yes live-server --port="${PORT}" --no-browser --quiet
