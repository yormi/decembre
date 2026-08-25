#!/usr/bin/env bash
# Render a markdown file to a shareable PDF.
# Usage: scripts/md-to-pdf.sh <input.md> <output.pdf> "<Title>"
set -euo pipefail
tmp=$(mktemp --suffix=.html)
node "$(dirname "$0")/md-to-pdf-html.mjs" "$1" "$tmp" "${3:-Document}"
chromium --headless --disable-gpu --no-sandbox --no-pdf-header-footer \
  --print-to-pdf="$2" "$tmp" 2>/dev/null
rm -f "$tmp"
echo "wrote $2"
