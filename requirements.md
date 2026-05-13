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
| `yield-range/spec.md` | Salanova nursery time-to-canopy-cap model (canopy-density driven, no decay) |
| `yield-range/app/spec.md` | Yield Range admin page UI |
| `yield-range/doc/yield-range-calibration-2026-spring.md` | Empirical cohort observations anchoring the yield-range model |

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

## REQ-139 — App must call subproject namespace, no inline reimplementation

**Statement:** Every subproject under `nutrition/` and `yield-range/` that
exposes a public computation through a `window.<Namespace>` (the
`model.js` convention) is the **sole source** of that computation.
App-side renderers in `app/index.html` and any consumer under
`nutrition/<crop>/app/` (`buildNutriment`, page builders, Block builders,
Salanova builders, gap-grid builders, etc.) MUST invoke the namespaced
function. Inlining the same arithmetic — copying the formula out of
`calc.js` / `model.js` into the consumer — is forbidden, even when "just
for this one branch".

**Rationale:** Drift between an inlined copy and the model module
produces silent bugs that flip operator-facing levers backward. The
codified incident (2026-05-10): the Nutrition admin page's FP-mode
foliar branch inlined `(g × pct × 1000 / area × cov)` per element
instead of calling `window.FoliarRecipeTomato.computeFoliarSupply`. The
inline drifted from the model's signature: it ignored the `sprayCount`
and `surfactant` opts that operators set in Block 5, so the live
re-render didn't react to those levers. Same drift class will recur on
fertigation and sidedress as soon as their subprojects gain a supply
function — today they expose only sizers (`computeStageRecipe`,
`computeStageSidedress`) with no `computeFertigationSupply` /
`computeSidedressSupply` counterpart, so consumers compute their supply
inline. **The fix shape when a consumer needs a function the
subproject doesn't yet expose is to ADD the function in the subproject,
not to inline the arithmetic.** Subprojects own both the sizer (recipe)
and the renderer (supply) axes. (TODO follow-up: add
`computeFertigationSupply` to `nutrition/tomato/fertigation-recipe/`
and `computeSidedressSupply` to `nutrition/tomato/sidedress-recipe/`,
then extend the verifier blacklist below to cover their formula
shapes.)

**Cert:** 4 — bright-line normative rule; auto-enforcement is partial
(the registry catches regression on existing call sites and the
blacklist catches new drift on the foliar formula shape, but the
verifier can't enumerate every future inline reimplementation a priori).

**Verification:** Two layers in `scripts/check-recipes.mjs`:

1. **Registry-driven positive check.** A small inline registry of
   `(namespace, function, expectedConsumer)` tuples. For each tuple,
   assert the consumer file (today: `app/index.html`) contains
   `window.<Namespace>.<function>` at least once. Seed:
   - `FoliarRecipeTomato.computeFoliarSupply`
   - `FoliarRecipeTomato.computeFoliarRecipeForGap`
   - `CompostContribution.releasePerWeek`

   Catches regressions where someone deletes a call site and reinlines
   the math. Extend the registry whenever a new public namespace
   function gains a consumer.

2. **Inline-formula blacklist.** Forbid the foliar-supply formula shape
   `PRODUCT_PCT.<XSO4_X|Solubore_B|NaMoO4_Mo>) / area * 1000 * cov`
   inside `app/index.html` — the exact pattern that drifted on
   2026-05-10. Today, after the foliar fix, this pattern should not
   appear inline anywhere; if it reappears the check fails.

   Blacklist is foliar-only at first. Extend with fertigation and
   sidedress formula shapes once `computeFertigationSupply` and
   `computeSidedressSupply` exist.

**When you add a new subproject namespace function with a consumer:**
add a tuple to the registry. **When you inline a formula in
`app/index.html`:** stop, move the formula into the subproject's
`calc.js` (and expose it on `model.js`), then call the namespaced
function from the consumer.

---

## REQ-144 — Operator-facing prose is a deterministic render of spec

**Statement:** Inside any DOM container carrying
`data-prose-check="strict"`, every visible text node (descendant text not
inside `<script>` / `<style>`) MUST have an ancestor element carrying a
`data-prose-source` attribute whose value is one of:

- `"derived:<funcName>"` — the string is emitted by a function declared
  in source (`function funcName(`, `const funcName = (`, etc.). The
  function operates on data structures governed by the spec. The
  verifier confirms `<funcName>` is declared somewhere in `app/`,
  `nutrition/`, or `yield-range/`.
- `"REQ-NNN"` — the string is a deterministic render of bytes owned by
  spec entry `REQ-NNN`. The bytes live in a `Renders:` block inside that
  spec entry; the build step (`scripts/build.mjs`) parses every
  `Renders:` block across the spec tree and injects them into
  `dist/index.html` as `window.SPEC_STRINGS`. The runtime helper
  `renderSpec(reqId, key, interp)` resolves the lookup + optional `${var}`
  substitution. The verifier asserts `REQ-NNN` appears as `^## REQ-NNN`
  in the spec tree.
- `"label"` — static UI scaffolding with no semantic claim about the
  world (page titles, section headers, column headers, button labels).
  Reserved for nomenclature; never used for advice, interpretation, or
  warnings.

**Removed 2026-05-11** per Guillaume's *"deterministic render of the
spec"* directive:

- `"stable:<short-tag>"` — honor-coded self-attestation, invisible to
  any cross-check. Replaced by REQ-NNN + `Renders:` blocks: prose that
  used to be stable-annotated in code moves into a spec entry as a
  named render string.
- Bare `"derived"` — accepted any function-rendered output without a
  pointer. Replaced by `derived:<funcName>` so the function is checked
  against the source declaration set.

**Rationale:** "Deterministic render of the spec" means every byte
visible to the team traces to spec or to data governed by spec. The
escape hatches (`stable:<tag>`, bare `derived`) were trust-based —
nothing prevented a string from drifting from its source comment, and
nothing tied a `derived` claim to an actual function. Failing those
shapes loudly forces every operator-facing string to anchor on either
(a) a function declared in source or (b) bytes owned by a spec entry.
No third option.

**Cert:** 5 — every accepted value has a mechanical cross-check
(function declaration set OR spec entry OR static-label declaration).

**Scope (opt-in by design):**

REQ-144 enforcement only applies inside containers explicitly marked
`data-prose-check="strict"`. This is deliberate — retrofitting every
existing text node in one pass would be a large slog. The migration
plan is:

1. The rule + verifier land first.
2. When a developer (Claude or otherwise) materially touches an operator
   container, they opt that container into `strict` mode and tag each
   text node with `data-prose-source`. From that point on, drift on
   that container fails the check.
3. New operator surfaces (new pages, new blocks) opt in from day one.
4. Periodically, dedicate a session to retrofitting the cleanest unmarked
   containers (Block 5 levers + the pH-lock reminder is the natural
   starting point — already 100 % auto-derived plus one stable annotation
   to migrate into a new REQ Renders: block).

The verifier prints the count of opted-in containers so the migration
is visible.

**Verification:** `scripts/check-recipes.mjs` — `header('REQ-144 …')`
block. Procedure:

1. Find every element matching `[data-prose-check="strict"]`. Print the
   count.
2. For each strict container, walk its text-node descendants (skipping
   `<script>` / `<style>`).
3. For each text node, walk up ancestors looking for the nearest
   `data-prose-source` attribute. If none → fail with the offending text
   snippet and the container path.
4. Validate the attribute value:
   - `derived:<fn>`: assert `<fn>` is in the declared-function set
     (scanned from `app/`, `nutrition/`, `yield-range/` source files).
   - `REQ-NNN`: assert `REQ-NNN` appears as a `^## REQ-NNN` header in
     the spec tree.
   - `label`: accept (no further validation).
   - `derived` (bare) or `stable:*`: fail with deprecation notice.
   - Any other shape: fail.

**When you add a new operator-facing prose block:** add
`data-prose-check="strict"` to the container. For each text-bearing
element inside, set `data-prose-source` to one of the three accepted
shapes. If the prose can't be derived from data and isn't a static
label, **add it to a spec entry as a `Renders:` block first**, then
render it via `renderSpec()`. Run `npm run check`.

**`Renders:` block convention** (consumed by `scripts/build.mjs`):

Inside a spec entry headed by `## REQ-NNN`, declare named render strings
as fenced code blocks with the info string `render <key>`:

````
## REQ-NNN — title

**Renders:** (bytes owned by this entry)

```render Ca
Sol Ca-saturé — réservoir essentiellement inépuisable...
```

```render P
Banque P "coffre" ; même au taux de drawdown actuel...
```
````

The build step:
1. Walks every `spec.md` + `requirements.md` file.
2. Groups fenced `render <key>` blocks by the nearest preceding
   `^## REQ-NNN` header.
3. Emits `window.SPEC_STRINGS = { 'REQ-NNN': { 'key': '...' } }` inline
   in `dist/index.html` via the `<!-- @spec-strings -->` marker.
4. Fails the build on duplicate keys within a REQ entry or across
   entries.

The `${var}` placeholder in the string body is substituted by
`renderSpec(reqId, key, { var: value })` at render time.

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
