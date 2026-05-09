#!/usr/bin/env bash
# Local hot-reload dev server for the Décembre operations app.
#
# Starts two processes:
#   1. scripts/build.mjs --watch   — watches app/ + nutrition/ etc., regenerates
#                                    index.html on every change (~5ms).
#   2. live-server                 — serves repo root, pushes browser reload
#                                    when index.html (the build artifact) changes.
#
# End-to-end edit→reload typically lands under 500ms.
#
# Usage:
#   ./scripts/dev-server.sh
#
# Stop:
#   pkill -f live-server ; pkill -f 'build\.mjs'
#
# For a persistent server that survives terminal exits, use:
#   ./scripts/dev-server-daemon.sh start
#
# Requires: fnm with Node 22 available, npx (ships with Node).

set -euo pipefail

PORT=8765
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

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

# Stop any orphan build watcher from a previous session.
pkill -f 'scripts/build\.mjs --watch' 2>/dev/null || true

# Start the build watcher in the background; tear it down when this script exits.
echo "Starting build watcher..."
( cd "${PROJECT_ROOT}" && exec node scripts/build.mjs --watch ) &
BUILD_PID=$!
trap 'kill "${BUILD_PID}" 2>/dev/null || true' EXIT

echo "Starting live-server on http://localhost:${PORT} ..."
exec npx --yes live-server --port="${PORT}" --no-browser --quiet
