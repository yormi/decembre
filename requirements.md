# Specs — Décembre operations app

Cross-app PO-scope specs. Verified by `scripts/check-requirements.sh` and
`scripts/check-recipes.mjs`. Domain-specific specs live alongside their
code under `nutrition/**/spec.md` and `yield-range/**/spec.md`.

## Domain organization

| File | Scope |
|---|---|
| `requirements.md` (this file) | Cross-app: UI language, URL routing, ISO week numbering |
| `nutrition/spec.md` | Cross-crop nutrition: mass-balance, channel cascade, pH-aware efficiency, lockout gates, crop-level channel-role coverage |
| `nutrition/chemistry/spec.md` | Cross-crop chemistry: product catalog, pH-response, mixing compatibility (Ksp / tags / mix order / incompatible recipes / stock stability), tank-level CE + pH predictions |
| `nutrition/tomato/spec.md` | Tomato nutrition: per-stage demand, fruit export, biomass, mass-balance coupling |
| `nutrition/tomato/shell/spec.md` | Tomato Nutrition admin page chrome (header inputs, ceiling, recipe-mode toggle, drift block, single-source-of-truth read) |
| `nutrition/tomato/plant-needs/builder/spec.md` | Plant-needs builder block on the admin page (Block 1) |
| `nutrition/tomato/foliar-recipe/builder/spec.md` | Foliar builder block on the admin page (Block 5/6) |
| `nutrition/tomato/fertigation-recipe/builder/spec.md` | Fertigation builder block on the admin page (supply vs demand + drift sub-block) |
| `nutrition/tomato/sidedress-recipe/builder/spec.md` | Sidedress builder block on the admin page (supply vs demand + drift sub-block) |
| `nutrition/tomato/fertigation-recipe/operator/spec.md` | Operator-facing tomato fertigation page UI |
| `nutrition/tomato/fertigation-recipe/procedure/spec.md` | Procedural data layer behind the operator fertigation page (stage, steps, calc) |
| `nutrition/lettuce/spec.md` | Salanova post-transplant nutrition (model/recipe) |
| `nutrition/lettuce/app/spec.md` | Salanova admin subpage UI |
| `nutrition/nursery/spec.md` | Semis laitue nutrition (seedling DW%, cell volume cap) |
| `nutrition/nursery/app/spec.md` | Semis admin subpage UI |
| `yield-range/spec.md` | Salanova nursery time-to-canopy-cap model |
| `yield-range/app/spec.md` | Yield Range admin page UI |
| `yield-range/doc/yield-range-calibration-2026-spring.md` | Empirical cohort observations anchoring the yield-range model |

REQ-NNN ids are drawn from a single global pool — claim via
`scripts/claim-req.sh <target-spec-path> <persona>` from the repo root.

Domain/page specs do NOT restate these REQs — they apply by
default unless a page opts out (with reason).

---

## REQ-001 — French "CE" for electrical conductivity

All user-facing UI text uses **"CE"** (Conductivité Électrique), not "EC".
Out of scope: HTML/CSS/JS identifiers, code comments, lab-report quotes.
CE is feminine ("la CE"); no elision before consonant ("la CE", not "l'CE").

---

## REQ-005 — URL hash reflects current page (and subpage)

Every navigable page and every subpage selector that changes what the user is
looking at MUST be encoded in the URL hash so hot-reload and bookmarks land on
the same view. Hash format is hierarchical: `#[admin/]page[/crop]`. Contract:

1. Pages listed in the `PAGES` const in `index.html`; every
   `<div id="page-XXX-content">` must have its slug in `PAGES`.
2. Subpages (currently: crop) listed per page in `CROP_PAGES`.
3. Setters that mutate routed state (`setPage`, `setCrop`, `setDiagCrop`,
   plus any future subpage setter) MUST call `syncHash()`.

| Routed state | Source-of-truth | URL segment |
|---|---|---|
| Current page | `currentPage` | first non-`admin` segment |
| Crop on fertigation/irrigation | `currentCrop` (global) | second segment |
| Crop on diagnostic | `diagCrop` (page-local) | second segment |
| Admin mode | `parseHash().admin` | leading `admin/` |

---

## REQ-006 — "Algue" instead of "Kelp"

All user-facing UI text uses **"Algue"** / "Algues" instead of "Kelp".
Out of scope: HTML/CSS/JS identifiers and code comments.

---

## REQ-007 — No English/horticulture jargon in user-facing text

User-facing UI text must avoid English or specialist horticulture terms that an
*ouvrier agricole québécois* wouldn't readily understand. Use plain French.
Comments and source identifiers are exempt.

| Forbidden | French replacement | Where it surfaces |
|---|---|---|
| `dryback` | `assèchement` (or `assèchement contrôlé` when emphasising intent) | Tensiometric vigor notes (low/normal/high) |

Extend via the `JARGON_DENY` array in `scripts/check-requirements.sh`.

---

## REQ-008 — ISO 8601 week numbering

`getWeekNumber()` returns the ISO 8601 week number of the current local date
using the **Thursday-pivot algorithm** (Mondays start the week; week 1 contains
the year's first Thursday). A naive `jan4.getDay()`-based implementation
silently shifts by one week when Jan 4 falls on a Sunday — this bug shipped
once in 2026; the check exists to prevent quiet reintroduction.

Contract:
1. Take today's date.
2. Normalize weekday so Mon=1..Sun=7 (`getDay() || 7`).
3. Shift by `4 - dayNum` days to the Thursday of the current ISO week.
4. Divide day-count from Jan 1 of that Thursday's year by 7 and round up.

This shape handles year-rollover (e.g. Dec 29 2025 → ISO 2026-W01).

---

## REQ-139 — App must call subproject namespace, no inline reimplementation

Every subproject under `nutrition/` and `yield-range/` that exposes a public
computation through a `window.<Namespace>` (the `model.js` convention) is the
**sole source** of that computation. App-side renderers in `app/index.html`
and any consumer under `nutrition/<crop>/app/` MUST invoke the namespaced
function. Inlining the same arithmetic — copying the formula out of `calc.js`
/ `model.js` into the consumer — is forbidden. When a consumer needs a
function the subproject doesn't yet expose, ADD the function in the
subproject; don't inline the arithmetic. Subprojects own both the sizer
(recipe) and the renderer (supply) axes.

---

## REQ-144 — Operator-facing prose is a deterministic render of spec

Inside any DOM container carrying `data-prose-check="strict"`, every visible
text node MUST have an ancestor element carrying a `data-prose-source`
attribute whose value is one of:

- `"derived:<funcName>"` — the string is emitted by a function declared in
  source (`function funcName(`, `const funcName = (`, etc.). The verifier
  confirms `<funcName>` is declared somewhere in `app/`, `nutrition/`, or
  `yield-range/`.
- `"REQ-NNN"` — the string is a deterministic render of bytes owned by spec
  entry `REQ-NNN`. The bytes live in a `Renders:` block inside that spec
  entry; `scripts/build.mjs` parses every `render <key>` fenced block and
  injects them into `dist/index.html` as `window.SPEC_STRINGS`. Runtime
  helper `renderSpec(reqId, key, interp)` resolves lookup + optional `${var}`
  substitution.
- `"label"` — static UI scaffolding with no semantic claim (page titles,
  section headers, column headers, button labels). Never used for advice,
  interpretation, or warnings.

Enforcement is opt-in: REQ-144 applies only inside containers explicitly
marked `data-prose-check="strict"`. New operator surfaces opt in from day
one; existing containers migrate when materially touched. The verifier
prints the count of opted-in containers so migration is visible.

**`Renders:` block convention** (consumed by `scripts/build.mjs`): inside a
spec entry headed by `## REQ-NNN`, declare named render strings as fenced
code blocks with the info string `render <key>`:

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

The build groups blocks by nearest preceding `^## REQ-NNN` header, emits
`window.SPEC_STRINGS = { 'REQ-NNN': { 'key': '...' } }` via the
`<!-- @spec-strings -->` marker, and fails on duplicate keys within or
across entries.

---

## REQ-158 — Identifier names in project text are unabbreviated

Every function name, variable name, and object-property name in JS source
under `app/`, `nutrition/`, `yield-range/`, plus identifier references in
backticks inside `spec.md` files and `team-coordination/**` markdown, MUST be
a full word — no abbreviations. The verifier maintains a denylist with a
whitelist for domain terms (`cert`, `cap`, `pH`, unit suffixes `mg` / `kg` /
`g` / `L` / `m²`, and `REQ-NNN` identifiers).

---

## REQ-coverage tally — verifier conventions

The release-candidate validator prints `REQs wired: X/Y` by string-matching:

- **Documented (Y)**: `^## REQ-` headers across `requirements.md` and
  `nutrition/**/spec.md` (deduplicated). Every spec MUST start with
  `## REQ-NNN — title` (NNN = digits, optional letter suffix like `029a`).
- **Wired (X)**: scanned for these exact patterns:
  - bash (`scripts/check-requirements.sh`): `echo "REQ-NNN — ..."`
  - node (`scripts/check-recipes.mjs`): `header('REQ-NNN — ...')` or
    `header("REQ-NNN — ...")`

Stick to these patterns so the tally stays accurate.
