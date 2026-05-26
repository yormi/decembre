#!/usr/bin/env bash
# Release-candidate validator — checks user-facing specs in index.html
# against the rules defined in spec.md (cross-app) and every
# nutrition/**/spec.md (domain-scoped).
#
# Run before pushing. Exit 0 = all pass; non-zero = at least one failure.
#
# Usage:
#   ./scripts/check-spec.sh
#
# Add new checks below as new REQ-NNN sections gain verification strategies
# in any of the spec files (spec.md or nutrition/**/spec.md).

set -uo pipefail
cd "$(dirname "$0")/.."

# Verifier reads the built artifact, not the source. Run `npm run build` first
# (the `npm run check` script chains them; running this script directly assumes
# dist/index.html is current).
INDEX="dist/index.html"
if [ ! -f "$INDEX" ]; then
  echo "  ✗ $INDEX not found. Run \`npm run build\` first (or use \`npm run check\`)." >&2
  exit 1
fi

PASS=0
FAIL=0
FAIL_DETAILS=()

if [ -t 1 ]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[0;33m'
  DIM='\033[2m'
  RESET='\033[0m'
else
  RED=''
  GREEN=''
  YELLOW=''
  DIM=''
  RESET=''
fi

# pass NAME — record a pass
pass() {
  printf "  ${GREEN}✓${RESET} %s\n" "$1"
  PASS=$((PASS + 1))
}

# fail NAME [SAMPLES...] — record a fail and show offending matches
fail() {
  local name="$1"
  shift
  printf "  ${RED}✗${RESET} %s\n" "$name"
  if [ $# -gt 0 ]; then
    while IFS= read -r line; do
      [ -n "$line" ] && printf "    ${DIM}%s${RESET}\n" "$line"
    done <<< "$1"
  fi
  FAIL=$((FAIL + 1))
  FAIL_DETAILS+=("$name")
}

# check_no_match NAME PATTERN — pass if grep finds nothing in index.html
check_no_match() {
  local name="$1"
  local pattern="$2"
  local matches
  matches=$(grep -nE "$pattern" "$INDEX" 2>/dev/null | head -3 || true)
  if [ -z "$matches" ]; then
    pass "$name"
  else
    fail "$name" "$matches"
  fi
}

# check_match NAME PATTERN — pass if grep finds the pattern at least once.
# Use for invariants that REQUIRE a binding to exist (e.g., one page reading
# from another's source-of-truth constant).
check_match() {
  local name="$1"
  local pattern="$2"
  if grep -qE "$pattern" "$INDEX" 2>/dev/null; then
    pass "$name"
  else
    fail "$name" "expected pattern not found: $pattern"
  fi
}

# check_in_function NAME FNNAME NEEDLE — pass if NEEDLE (literal substring)
# appears anywhere inside FNNAME's body. Uses awk to scan from
# `function FNNAME(` up to the next top-level `}`. Used by REQ-005 to assert
# routed-state setters call syncHash().
check_in_function() {
  local name="$1"
  local fn="$2"
  local needle="$3"
  if awk -v fn="$fn" -v needle="$needle" '
      $0 ~ ("^function " fn "[ (]") { inside=1; next }
      inside && /^}/ { inside=0 }
      inside && index($0, needle) > 0 { found=1 }
      END { exit found ? 0 : 1 }
    ' "$INDEX"; then
    pass "$name"
  else
    fail "$name" "expected '$needle' inside function $fn"
  fi
}

echo
echo "════════════════════════════════════════════════════════════"
echo "  Release Candidate — Spec Validation"
echo "════════════════════════════════════════════════════════════"
echo

# REQ-001 (French 'CE'), REQ-006 (Kelp), REQ-007 (jargon, scoped non-admin),
# and REQ-008 (ISO week pinned-date tests) moved to scripts/check-recipes.mjs
# as part of Phase 2 (challenge walkthrough Ch4=B / Ch5=A / Ch6=A scoped /
# Ch7=A). The node verifier runs after the bash checks below.

# ─── REQ-004 — Bilan reads from source-of-truth recipes ───
echo "REQ-004 — Bilan reads from source-of-truth recipes"

check_match \
  "Bilan appelle computeStageRecipe(stage) (fertigation)" \
  'computeStageRecipe\(stage\)'

check_match \
  "Bilan lit STORED_RECIPE.tomato.foliaire.A (Spray hebdomadaire)" \
  'STORED_RECIPE\.tomato\.foliaire\.A'

# Spray B (CaCl₂ anti-BER) retiré 2026-05-06 — voir REQ-004 ligne « Foliaire ».

check_match \
  "Bilan lit STORED_RECIPE.tomato.sidedress[stage] (engrais sol granulaire)" \
  'STORED_RECIPE\.tomato\.sidedress\[stage\]'

check_match \
  "Bilan lit BIOMASS_DEMAND[stage] (demande végétative)" \
  'BIOMASS_DEMAND\[stage\]'

check_match \
  "Bilan lit TOMATO_FRUIT_EXPORT[el] (export fruit seul)" \
  'TOMATO_FRUIT_EXPORT\[el\]'

# ─── REQ-005 — URL hash reflects current page (and subpage) ───
echo
echo "REQ-005 — URL hash reflects current page (and subpage)"

check_match "parseHash() défini" 'function parseHash\('
check_match "syncHash() défini"  'function syncHash\('

# Routed-state setters must rewrite the URL when state changes.
check_in_function "setPage() appelle syncHash()"     "setPage"     'syncHash('
check_in_function "setCrop() appelle syncHash()"     "setCrop"     'syncHash('
check_in_function "setDiagCrop() appelle syncHash()" "setDiagCrop" 'syncHash('

# Every <div id="page-XXX-content"> slug must be registered in the PAGES const,
# otherwise navigating to it from the URL silently falls back to the default page.
content_slugs=$(grep -oE 'id="page-[a-z]+-content"' "$INDEX" \
                | sed -E 's/id="page-(.*)-content"/\1/' \
                | sort -u)
pages_decl=$(grep -E 'const PAGES = ' "$INDEX" | head -1)

if [ -z "$pages_decl" ]; then
  fail "PAGES const trouvé dans $INDEX" "expected: const PAGES = [...]"
else
  missing=""
  for slug in $content_slugs; do
    if ! echo "$pages_decl" | grep -qE "'$slug'"; then
      missing="$missing $slug"
    fi
  done
  if [ -z "$missing" ]; then
    pass "Toutes les <div id='page-X-content'> sont enregistrées dans PAGES"
  else
    fail "Toutes les <div id='page-X-content'> sont enregistrées dans PAGES" \
         "manquantes:$missing"
  fi
fi

# REQ-006 (>Kelp), REQ-007 (jargon scoped non-admin) and REQ-008 (ISO week)
# now live in scripts/check-recipes.mjs — see node section below.

# ─── REQ-009 — Solar weekly 20-year averages ───
echo
echo "REQ-009 — SOLAR_BY_WEEK = moyennes 20 ans (semaines 1-18)"

# Format: "week:value". Single bash array, looped over to verify each line in
# index.html. If any week deviates, the consolidated check fails with the
# offending week numbers listed.
solar_expected=(
  "1:2695" "2:2940" "3:3430" "4:3920" "5:4655" "6:5390"
  "7:6125" "8:6860" "9:7595" "10:8330" "11:9065" "12:9660"
  "13:10290" "14:10780" "15:11270" "16:11760" "17:12250" "18:12740"
)
solar_missing=""
for entry in "${solar_expected[@]}"; do
  wk="${entry%%:*}"
  val="${entry##*:}"
  # Tolerant pattern: VALUE followed by comma, then "// week N"
  if ! grep -qE "^\s+${val},\s*//\s*week\s+${wk}\b" "$INDEX"; then
    solar_missing="$solar_missing wk${wk}(${val})"
  fi
done
if [ -z "$solar_missing" ]; then
  pass "Toutes les 18 valeurs hebdomadaires correspondent aux moyennes 20 ans"
else
  fail "Toutes les 18 valeurs hebdomadaires correspondent aux moyennes 20 ans" \
       "manquantes ou modifiées:$solar_missing"
fi

# ─── Node verifier (Phase 2) — REQ-001/006/007/008 (migrated) plus
# REQ-010, 011, 012, 019, 022, 023, 029a, 029b, 029c.
# Runs scripts/check-recipes.mjs via jsdom. If node or jsdom is missing, the
# node script prints a single "skipped" warning and exits 0 — this keeps a
# fresh-clone friendly path: you can still run the bash checks without
# `npm install`. Phase 2.5 REQs (013-018, 020-021, 024-032, 053-057) are
# tracked but deferred until thresholds + plumbing are pinned.
echo
echo "════════════════════════════════════════════════════════════"
echo "  Phase 2 — Node verifier (recipe-model invariants)"
echo "════════════════════════════════════════════════════════════"

NODE_PASS=0
NODE_FAIL=0
node_tally_line=""
if command -v node >/dev/null 2>&1; then
  # Capture both the live output and the trailing tally line. We tee the live
  # stream to the operator's terminal AND to a temp file so we can extract
  # __NODE_VERIFIER_TALLY__ for the umbrella sum.
  node_tmp="$(mktemp)"
  trap 'rm -f "$node_tmp"' EXIT
  set +e
  node scripts/check-recipes.mjs 2>&1 | tee "$node_tmp"
  node_rc=${PIPESTATUS[0]}
  set -e
  node_tally_line=$(grep '^__NODE_VERIFIER_TALLY__' "$node_tmp" | tail -1 || true)
  if [ -n "$node_tally_line" ]; then
    NODE_PASS=$(echo "$node_tally_line" | sed -E 's/.*pass=([0-9]+).*/\1/')
    NODE_FAIL=$(echo "$node_tally_line" | sed -E 's/.*fail=([0-9]+).*/\1/')
  elif [ "$node_rc" -ne 0 ]; then
    # Node exited non-zero without printing the tally line (e.g. unhandled
    # exception before checks ran). Count it as one failure so the umbrella
    # tally surfaces it.
    NODE_FAIL=1
    FAIL_DETAILS+=("Node verifier exited ${node_rc} before producing tally")
  fi
  PASS=$((PASS + NODE_PASS))
  FAIL=$((FAIL + NODE_FAIL))
else
  printf "  ${YELLOW}⚠${RESET} node not found — Phase 2 checks skipped.\n"
  printf "  Install Node.js + run \`npm install\` to enable REQ-010+ verification.\n"
fi

# ─── Ledger coverage (soft, informational) ───
# Counts spec REQs that have no row in team/req-ledger.md.
# Pre-wrapper REQs (everything before REQ-155) don't have ledger rows by
# construction; the count is informational, not a failure. Drift up over
# time = wrapper bypass; drift down = backfill.
LEDGER_FILE="team/req-ledger.md"
if [ -f "$LEDGER_FILE" ]; then
  SPEC_REQS=$(
    {
      grep -hoE 'REQ-[0-9]+[a-z]*' spec.md 2>/dev/null
      find nutrition yield-range -name 'spec.md' -type f -exec grep -hoE 'REQ-[0-9]+[a-z]*' {} + 2>/dev/null
    } | sort -u
  )
  LEDGER_REQS=$(grep -hoE 'REQ-[0-9]+[a-z]*' "$LEDGER_FILE" 2>/dev/null | sort -u)
  UNLEDGERED=$(comm -23 <(echo "$SPEC_REQS") <(echo "$LEDGER_REQS") | grep -c 'REQ-' || true)
else
  UNLEDGERED="(no ledger)"
fi

# ─── Final ───
echo
echo "════════════════════════════════════════════════════════════"
BASH_PASS=$((PASS - NODE_PASS))
BASH_FAIL=$((FAIL - NODE_FAIL))
if [ "$FAIL" -eq 0 ]; then
  printf "  Result: ${GREEN}%d passed${RESET}, %d failed — ${GREEN}✓ READY${RESET}\n" "$PASS" "$FAIL"
  printf "    bash: %d pass · node: %d pass\n" "$BASH_PASS" "$NODE_PASS"
else
  printf "  Result: ${GREEN}%d passed${RESET}, ${RED}%d failed${RESET} — ${RED}✗ FIX REQUIRED${RESET}\n" "$PASS" "$FAIL"
  printf "    bash: %d pass / %d fail · node: %d pass / %d fail\n" \
    "$BASH_PASS" "$BASH_FAIL" "$NODE_PASS" "$NODE_FAIL"
  if [ ${#FAIL_DETAILS[@]} -gt 0 ]; then
    echo
    echo "  Failed checks (bash):"
    for d in "${FAIL_DETAILS[@]}"; do
      printf "    ${RED}•${RESET} %s\n" "$d"
    done
  fi
  if [ "$NODE_FAIL" -gt 0 ]; then
    echo "  (Node failures listed in the node-verifier section above.)"
  fi
fi
printf "    REQs un-ledgered: %s (informational; pre-wrapper or bypass)\n" \
  "$UNLEDGERED"
echo "════════════════════════════════════════════════════════════"
echo

[ "$FAIL" -eq 0 ]
