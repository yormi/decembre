#!/usr/bin/env bash
# Persistent dev server via user-systemd (permanent enabled unit).
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
    # Unit file: ~/.config/systemd/user/decembre-devserver.service (enabled, Restart=always).
    systemctl --user restart "${UNIT}.service"
    # Poll the port instead of a fixed sleep (first build + live-server boot
    # can take >5s, which used to print a false "Failed to start").
    for _ in $(seq 1 20); do
      if curl -sI http://localhost:8765/ 2>/dev/null | head -1 | grep -q 200; then
        echo "Running on http://localhost:8765"
        exit 0
      fi
      sleep 1
    done
    echo "Failed to start. Check: journalctl --user -u ${UNIT} -n 30"
    exit 1
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
