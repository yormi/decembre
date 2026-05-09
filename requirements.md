# Specs — Décembre operations app

User-stated specs that the app must satisfy. Each is testable; the
release-candidate validator (`scripts/check-requirements.sh`) verifies them
automatically before a push.

## How this works

1. User states a spec → it gets added here (or in a domain spec file under
   `nutrition/`) with an ID, statement, rationale, and verification strategy.
2. Verification strategy is encoded as a check in `scripts/check-requirements.sh`
   (or `scripts/check-recipes.mjs` for jsdom-based runtime checks).
3. Before pushing, run `./scripts/check-requirements.sh`. If anything fails,
   fix before pushing.

Specs are expressed in plain prose first, then translated into `grep`
patterns or other testable assertions. The script's job is to fail loudly
on regressions, not to be exhaustive.

## Domain organization

This file holds **cross-app specs** (UI text rules, URL routing, generic
utilities). Domain-specific specs live alongside the app code they govern:

| File | Scope |
|---|---|
| `requirements.md` (this file) | Cross-app: UI language, URL routing, ISO week numbering |
| `nutrition/spec.md` | Cross-crop nutrition: chemistry, products, organic cert, mass-balance framing, recipe-model architecture |
| `nutrition/tomato/spec.md` | Tomato-specific nutrition: per-stage demand, fruit export, biomass, channel-ownership |
| `nutrition/tomato/app/spec.md` | Tomato Nutrition admin page UI (Bilan / Block 1-7 / drift gauge) |
| `nutrition/lettuce/spec.md` | Salanova post-transplant nutrition (model/recipe) |
| `nutrition/lettuce/app/spec.md` | Salanova admin subpage UI |
| `nutrition/nursery/spec.md` | Semis laitue nutrition (seedling DW%, cell volume cap) |
| `nutrition/nursery/app/spec.md` | Semis admin subpage UI |
| `yield-range/spec.md` | Salanova nursery yield prediction model (RGR-multiplier + RootCap) |
| `yield-range/derivation.md` | Yield Range math model formulas, stress functions, constants history, calibration anchors |
| `yield-range/calibration-data.md` | Observed cohort weights anchoring the yield model |
| `yield-range/app/spec.md` | Yield Range admin page UI specs |
| `yield-range/app/derivation.md` | Yield Range app source rationale + design history |

Other domains (irrigation, IPM, harvest, climate, etc.) currently live in
this file. They will be split out into their own `<domain>/spec.md` files
as their spec count grows.

REQ-NNN ids are drawn from a single global pool — adding a spec to any
file uses the next available id and never collides with another file.

---

## REQ-001 — French "CE" for electrical conductivity

**Statement:** All user-facing UI text uses **"CE"** (Conductivité Électrique),
not **"EC"** (English abbreviation).

**Rationale:** The app is operated by a French-speaking team. Mixing English
and French abbreviations creates confusion. "CE" is the standard French
abbreviation; "EC" is the English one.

**Scope:**

| In scope (must be CE) | Out of scope (EC OK) |
|---|---|
| Visible HTML text content | HTML/CSS/JS identifiers (`id="page-ec"`, variable names like `ecBtn`) |
| Button labels, headers, descriptions | HTML / JS / CSS comments |
| Diagnostic memos, instructions | Source code traceability comments |
| Step descriptions, tooltips | Lab report quotes (e.g., Berger Labs water analysis showing "EC: 0.10 mmhos/cm") |

**French grammar reminders:**
- CE is feminine: "**la** CE" (not "le CE")
- No elision in front of "C" (consonant sound): "la CE" (not "l'CE")
- "Mesurer **la** CE", "baisse **de** CE" (not "baisse d'CE")

**Verification:** `check-requirements.sh` greps for forbidden patterns inside
`index.html` user-facing text and fails if found. Patterns include:

- `>EC` followed by space/dash/colon (text content starting with EC)
- French phrases combined with EC: `EC pour-through`, `Mesurer EC`,
  `Mesurer l'EC`, `EC du`, `EC dans`, `EC qui`, `EC trop`, `EC stable`,
  `EC plus (basse|haute)`, `baisse d'EC`, `d'EC plus`, `l'EC `

---

## REQ-005 — URL hash reflects current page (and subpage)

**Statement:** Every page the user can navigate to, and every "subpage"
selector that changes what they're looking at, MUST be encoded in the URL
hash so hot-reload and bookmarks land on the same view.

The hash format is hierarchical: `#[admin/]page[/crop]`. The routing
contract has three pieces:

1. **Pages** are listed in the `PAGES` const in `index.html`. Every
   `<div id="page-XXX-content">` must have its slug in `PAGES`.
2. **Subpages** (currently: crop) are listed per page in `CROP_PAGES`.
   A page omitted from `CROP_PAGES` has no subpage segment in the URL.
3. **Setters** that mutate routed state (`setPage`, `setCrop`,
   `setDiagCrop`, plus any future subpage setter) MUST call `syncHash()`
   so the URL is rewritten when the user clicks.

**Rationale:** Without this, hot-reload sends the team back to the
default page mid-task and shareable links don't work. The cost of
forgetting is silent — the app still functions, it just loses its
position. The check has to fail loudly for new pages.

**Scope today:**

| Routed state | Source-of-truth | URL segment |
|---|---|---|
| Current page | `currentPage` | first non-`admin` segment |
| Crop on fertigation/irrigation | `currentCrop` (global) | second segment |
| Crop on diagnostic | `diagCrop` (page-local) | second segment |
| Admin mode | `parseHash().admin` | leading `admin/` |

**Verification:** `check-requirements.sh`:

- Extracts every `id="page-XXX-content"` slug and asserts it appears
  in the `const PAGES = [...]` declaration.
- Asserts `parseHash()` and `syncHash()` are defined.
- Asserts `setPage`, `setCrop`, `setDiagCrop` each call `syncHash()`
  inside their function body.

**When you add a new page:** register it in `PAGES`, add a
`page === 'newpage' ? 'block' : 'none'` line in `setPage` for its
content div, and add a button that calls `setPage('newpage')`. If it
has crop variants, add it to `CROP_PAGES`. If it has a different
subpage axis (stage, week, etc.) introduce a new const + setter and
extend `parseHash`/`syncHash` to encode it — and add the corresponding
grep check here.

---

## REQ-006 — "Algue" instead of "Kelp"

**Statement:** All user-facing UI text uses **"Algue"** (or "Algues") instead
of **"Kelp"**.

**Rationale:** The team is French-speaking. The product label
("Acadie Algues liquides") already uses the French term — using "Kelp"
in the UI forces a mental translation and breaks consistency with the
bottle the worker is holding.

**Scope:**

| In scope (must be Algue) | Out of scope (Kelp OK) |
|---|---|
| Visible HTML text content | HTML/CSS/JS identifiers (`id="out-kelp"`) |
| JS string literals rendered to the UI | Source code comments (`// Kelp stays at 2 mL/L`) |

**Verification:** `check-requirements.sh` greps for `>Kelp` patterns
inside HTML text content and fails if found.

---

## REQ-007 — No English/horticulture jargon in user-facing text

**Statement:** User-facing UI text must avoid English or specialist
horticulture terms that an *ouvrier agricole québécois* wouldn't readily
understand. Use plain French equivalents.

**Rationale:** The app is operated daily by field staff. Unfamiliar
terms cause hesitation, mistranslation, or mistakes. The cost of
"sounding precise" with a jargon term isn't worth the operational
friction. Comments and source-code identifiers are exempt — they're for
the developer, not the team.

**Denylist (current):**

| Forbidden | French replacement | Where it surfaces |
|---|---|---|
| `dryback` | `assèchement` (or `assèchement contrôlé` when emphasising intent) | Tensiometric vigor notes (low/normal/high) |

**How to extend:** when a term comes up that the team can't parse,
append it to the denylist table above with its French replacement, then
add the term to the `JARGON_DENY` array in
`scripts/check-requirements.sh`. The check fails on any new occurrence
inside HTML text or JS string literals (lines starting with `//` are
excluded so the term can still appear in dev comments).

**Verification:** `check-requirements.sh` greps each denylisted term
across `index.html` excluding comment lines. Any hit fails the check.

---

## REQ-008 — ISO 8601 week numbering

**Statement:** `getWeekNumber()` returns the ISO 8601 week number of the
current local date. Mondays start the week; the week containing the
year's first Thursday is week 1.

**Rationale:** Auto-stage selection on the fertigation page (and any
future week-driven recommendation) reads this function. A naive
implementation that adds `jan4.getDay()` to a day count silently
shifts the result by one week whenever Jan 4 falls on a Sunday
(JavaScript's `getDay()` returns `0` for Sunday, but ISO treats Sunday
as day 7 of the previous week). This bug shipped once — the team
operated for weeks on the wrong stage before the off-by-one was
noticed in 2026. The check exists to prevent a quiet reintroduction
during a future "cleanup".

**Implementation contract:**

The function must use the **Thursday-pivot algorithm**:

1. Take today's date.
2. Normalize the weekday so Mon=1..Sun=7 (in JS: `getDay() || 7`).
3. Shift the date by `4 - dayNum` days to land on the Thursday of the
   current ISO week.
4. Divide the day-count from Jan 1 of that Thursday's year by 7 and
   round up.

This is the only shape that handles year-rollover weeks correctly
(e.g. Dec 29 2025 belongs to ISO week 2026-W01).

**Verification:** `check-requirements.sh` asserts that
`getWeekNumber()`'s body contains both:

- `|| 7` — the Sun=0 → 7 normalization
- `4 -` — the Thursday-pivot offset

If either disappears, the check fails. Brittle on purpose: those two
fragments are the two halves of the algorithm; losing either is the
exact regression to guard against.

---

## How to add a new spec

1. Pick the right file (cross-app → here; nutrition → under `nutrition/`).
2. Append a new section with the next available ID (REQ-NNN) from the
   global pool. Check both `requirements.md` and every `nutrition/**/spec.md`
   to find the next free id.
3. Write the statement, rationale, scope, and verification strategy.
4. Translate the verification strategy into checks in
   `scripts/check-requirements.sh` (or `scripts/check-recipes.mjs`).
5. Run `./scripts/check-requirements.sh` to confirm it passes for the
   current state of the code.
6. Commit the spec file and the script together.

### Conventions for the REQ-coverage tally

The release-candidate validator prints `REQs wired: X/Y` based on string-matching:

- **Documented (Y)**: counted by scanning `requirements.md` and
  `nutrition/**/spec.md` for `^## REQ-` headers (deduplicated). Every spec
  MUST start its section with `## REQ-NNN — title` (where NNN is digits,
  optionally with a letter suffix like `029a`).
- **Wired (X)**: counted by scanning the verifier scripts for these exact
  patterns:
  - bash (`scripts/check-requirements.sh`): `echo "REQ-NNN — ..."`
    introducing a new check section
  - node (`scripts/check-recipes.mjs`): `header('REQ-NNN — ...')` OR
    `header("REQ-NNN — ...")` introducing a new check

If you wire a new spec but use different syntax (e.g., printing the REQ
number inside a sub-check label rather than as a section header), the tally
will under-count. Stick to the patterns above so the tally stays accurate.

### Principle: enforceable or not a spec

If a proposed spec cannot be automatically enforced by
`scripts/check-requirements.sh` (or its node verifier), it doesn't belong in
this document or the domain spec files. Manual-review intentions live in:

- The team's review process (e.g., Catherine's #review Slack channel)
- Code review checklists
- Periodic audit runs

Examples of un-enforceable items that have been intentionally removed:
- "Cert level on every empirical claim" (was REQ-003) — no reliable grep distinguishes load-bearing claims from incidental numbers
- "Predicted vs measured tank pH drift" (was REQ-056) — needs measurement-logging infrastructure we don't have
- "Operator safety pH warnings" (was REQ-057) — needs UI walk + judgment about which warnings count

The bar: a spec either has a working `check_*` function in the bash verifier
or a `header('REQ-NNN ...')` block in the node verifier. Aspirational specs
without enforcement become drift over time.

If a spec is enforceable IN PRINCIPLE but the data isn't available yet
(e.g., tissue-test-calibrated uptake fractions), defer until data arrives —
don't add it as a placeholder. Track the data dependency in
`working files/changelog.md` instead.
