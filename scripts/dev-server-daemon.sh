#!/usr/bin/env bash
# Persistent dev server via user-systemd.
# Survives terminal exits, Claude Code session restarts, etc. Use this instead
# of dev-server.sh for long sessions.
#
# Start:  ./scripts/dev-server-daemon.sh
# Stop:   ./scripts/dev-server-daemon.sh stop
# Status: ./scripts/dev-server-daemon.sh status
# Logs:   journalctl --user -u decembre-devserver -f

set -euo pipefail

UNIT=decembre-devserver
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

case "${1:-start}" in
  start)
    systemctl --user stop "${UNIT}.service" 2>/dev/null || true
    systemd-run --user --unit="${UNIT}" \
      --working-directory="${REPO_DIR}" \
      --description="Décembre live-server" \
      "${REPO_DIR}/scripts/dev-server.sh"
    sleep 5
    if curl -sI http://localhost:8765/ | head -1 | grep -q 200; then
      echo "Running on http://localhost:8765"
    else
      echo "Failed to start. Check: journalctl --user -u ${UNIT} -n 30"
      exit 1
    fi
    ;;
  stop)
    systemctl --user stop "${UNIT}.service" 2>/dev/null || true
    echo "Stopped."
    ;;
  status)
    systemctl --user status "${UNIT}.service" --no-pager || true
    ;;
  *)
    echo "Usage: $0 {start|stop|status}"
    exit 1
    ;;
esac
