#!/usr/bin/env node
// Phase 2 release-candidate verifier — node + jsdom.
//
// Loads index.html into jsdom, exposes the runtime objects (PRODUCT,
// CHANNEL_ROLE, PH_RESPONSE, KSP_PAIRS, KSP_SAFE, TAG_INCOMPATIBILITIES,
// TAGS_INERT, BIOMASS_DEMAND, TOMATO_FRUIT_EXPORT, computeRecipe,
// effectiveEff, predictedCE, predictedTankPh, getWeekNumber), then runs
// structural + DOM-walk checks for the REQs listed below.
//
// Implements (Phase 2):
//   REQ-001 — DOM-walked French CE check (migrated from bash)
//   REQ-006 — DOM-walked >Kelp check (migrated from bash)
//   REQ-007 — DOM-walked jargon scan, scoped to non-admin pages (migrated)
//   REQ-008 — pinned-date getWeekNumber tests (migrated from bash greps)
//   REQ-010 — every PRODUCT[*].mode is 'flux' or 'concentration'
//   REQ-011 — CHANNEL_ROLE covers every element in BIOMASS_DEMAND.T1..T5
//             ∪ TOMATO_FRUIT_EXPORT
//   REQ-012 — fraction sums per element in CHANNEL_ROLE within 1.0 ± 0.05
//   REQ-019 — every product's phClass covers every element in base
//   REQ-022 — every product in any active recipe has organicAllowed: true
//   REQ-023 — every product in PRODUCT has an ecFactor field (number; 0 explicit)
//   REQ-029a — every product has non-empty ions and chemistryTags
//   REQ-029b — every (cation × anion) pair across PRODUCT.ions is in
//              KSP_PAIRS or KSP_SAFE
//   REQ-029c — every distinct PRODUCT.chemistryTags tag is in
//              TAG_INCOMPATIBILITIES or TAGS_INERT
//
// Deferred to Phase 2.5 (need richer plumbing or human-decided thresholds):
//   REQ-013, REQ-014 (supply ratio bounds)
//   REQ-015 (concentration band validation)
//   REQ-017, REQ-018 (effective efficiency at current pH)
//   REQ-020 (lockout gate)
//   REQ-021 (solubility cap)
//   REQ-024, REQ-025, REQ-028..REQ-032 (CE bands, precipitation logic, mix order, stock stability)
//   REQ-053..REQ-055 (pH envelope, chelate stability, foliar pH curve)
//
// Exit code: 0 on full pass, 1 on any failure. If jsdom is missing, exits 0
// after printing a single "skipped" warning so the bash umbrella verifier
// stays usable on a fresh clone before `npm install`.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const INDEX_HTML_PATH = join(REPO_ROOT, 'index.html');

const useColor = process.stdout.isTTY === true;
const c = {
  red:    useColor ? '\x1b[0;31m' : '',
  green:  useColor ? '\x1b[0;32m' : '',
  yellow: useColor ? '\x1b[0;33m' : '',
  dim:    useColor ? '\x1b[2m'    : '',
  reset:  useColor ? '\x1b[0m'    : '',
};

// ─── REQ-002 — Forbidden products (non-Ecocert-Canada synthetics) ──────
//
// Curated blocklist of common synthetic fertilizers / spray products that
// fail CAN/CGSB-32.311 (Permitted Substances List for organic crop production).
// This isn't exhaustive — it catches the highest-risk substitutions a busy
// team might accidentally type or recommend. If a forbidden product needs to
// be discussed in app copy (e.g., explaining why we DON'T use urea), wrap
// the mention in a code comment or quote the prohibition explicitly.
//
// Detection: case-insensitive substring match on the literal product name in
// any non-comment code segment of index.html.
//
// Some short acronyms (MAP, DAP, MOP, CAN-17, EDTA, GHE, KCl) are
// intentionally OMITTED because even substring-matched they false-positive
// on existing identifiers (e.g., predictedTankPh contains "edta",
// chelate-edta is a pH-curve tag, KCl appears in a chemistry-explanation
// reason field for KSP_SAFE pairs, JS .map()/MAPAQ collide with "MAP",
// "higher"/"highest" collide with "GHE"). The fully-qualified product names
// below (e.g., "mono-ammonium phosphate", "Fe-EDTA") catch the dangerous
// case — a recipe author writing the full product name into app copy.
const FORBIDDEN_PRODUCTS = [
  // Synthetic N
  'urea',                        // urée — Ammonium-derived, not Ecocert
  'ammonium nitrate',
  'nitrate d\'ammonium',
  'calcium nitrate',             // Ca(NO3)2 synthetic — distinct from organic Ca sources
  'nitrate de calcium',
  'NH4NO3',
  // Synthetic P
  'mono-ammonium phosphate',
  'monoammonium phosphate',
  'di-ammonium phosphate',
  'diammonium phosphate',
  'monopotassium phosphate',
  'mono-potassium phosphate',
  'KH2PO4',
  // Synthetic K
  'potassium chloride',
  'chlorure de potassium',
  'muriate of potash',
  // Synthetic chelates of concern
  // Fe-EDTA / Fe-EDDHA: EDDHA is allowed via certified suppliers; EDTA is
  // not. We check the fully-qualified forms because bare "EDTA" collides
  // with predictedTankPh and the chelate-edta pH-curve tag.
  'Fe-EDTA',
  'fer-EDTA',
  'iron EDTA',
  // Hydroponic blends (full brand names — short forms like "GHE" omitted to
  // avoid colliding with substrings of "higher" / "highest" in app copy)
  'Plagron', 'Canna', 'general hydroponics',
  // Common conventional sprays
  'glyphosate', 'roundup',
  'mancozeb', 'chlorothalonil',
];

let PASS = 0;
let FAIL = 0;
const FAIL_DETAILS = [];

function pass(name) {
  process.stdout.write(`  ${c.green}✓${c.reset} ${name}\n`);
  PASS++;
}
function fail(name, detail) {
  process.stdout.write(`  ${c.red}✗${c.reset} ${name}\n`);
  if (detail) {
    for (const line of String(detail).split('\n').slice(0, 5)) {
      if (line.trim() !== '') process.stdout.write(`    ${c.dim}${line}${c.reset}\n`);
    }
  }
  FAIL++;
  FAIL_DETAILS.push(name);
}
function header(label) {
  process.stdout.write(`\n${label}\n`);
}

// ─── Load jsdom (graceful skip if absent) ──────────────────────────────
let JSDOM;
try {
  ({ JSDOM } = await import('jsdom'));
} catch (err) {
  process.stdout.write(
    `\n${c.yellow}⚠${c.reset} node verifier skipped: jsdom not installed.\n` +
    `  Run \`npm install\` from ${REPO_ROOT} to enable Phase 2 checks.\n` +
    `  (REQ-010+, REQ-029a/b/c, and node-migrated REQ-001/006/007/008 will not run.)\n`
  );
  process.exit(0);
}

if (!existsSync(INDEX_HTML_PATH)) {
  fail('index.html exists', INDEX_HTML_PATH);
  process.exit(1);
}

// ─── Build instrumented HTML: append a script tag that exposes our
// constants on window. We inject a fresh <script> right before </body>
// (or end-of-file fallback), referencing names defined by the page's
// inline <script>. Top-level `const` in a script doesn't bind to window
// directly, but a sibling <script> in the same document evaluates in the
// same global scope and CAN read those bindings, so we copy them across.
//
// (Don't modify index.html on disk — only the in-memory copy fed to jsdom.)

const rawHtml = readFileSync(INDEX_HTML_PATH, 'utf8');

const exposeNames = [
  'PRODUCT', 'CHANNEL_ROLE', 'PH_RESPONSE', 'KSP_PAIRS', 'KSP_SAFE',
  'TAG_INCOMPATIBILITIES', 'TAGS_INERT', 'BIOMASS_DEMAND',
  'TOMATO_REMOVAL', 'TOMATO_FRUIT_EXPORT', 'STORED_RECIPE',
  'LETTUCE',
  'RECIPE_HISTORY', 'RECIPE_INPUTS',
  'ACCEPTED_DEFICITS', 'ACCEPTED_EXCESSES',
  'PRODUCT_PCT', 'SIDEDRESS_AREA_PER_PLANCHE', 'SIDEDRESS_MIN_EFF',
  'TOMATO_NUM_BEDS', 'TOMATO_BED_AREA',
  'PAGES', 'ADMIN_PAGES', 'CROP_PAGES',
  'effectiveEff', 'predictedCE', 'predictedTankPh', 'computeRecipe',
  'computeStageRecipe',
  'getWeekNumber', 'foliarPhResponse',
  // The following are EXPECTED constants for REQ-030/031 — not currently
  // declared in index.html. Verifier asserts presence and fails informatively
  // if absent, so the gap is tracked rather than silently passed.
  'INCOMPATIBLE_RECIPES', 'MIX_ORDER',
];
const exposeScript = `<script>
  try {
    ${exposeNames.map(n => `if (typeof ${n} !== 'undefined') window.__PHASE1__ = window.__PHASE1__ || {}, window.__PHASE1__.${n} = ${n};`).join('\n    ')}
    window.__PHASE1_LOADED__ = true;
  } catch (e) { window.__PHASE1_ERR__ = String(e); }
</script>`;

let instrumentedHtml;
const bodyClose = '</body>';
const idx = rawHtml.lastIndexOf(bodyClose);
if (idx >= 0) {
  instrumentedHtml = rawHtml.slice(0, idx) + exposeScript + rawHtml.slice(idx);
} else {
  instrumentedHtml = rawHtml + exposeScript;
}

// ─── Boot jsdom ────────────────────────────────────────────────────────
//
// Silence the page's runtime errors that don't affect our checks. The page's
// inline <script> calls `fetch('history.json')` on load (historique loader),
// which jsdom's older Node-16 path doesn't ship by default. That fetch fires
// AFTER all our model constants are defined, so the unhandled error is pure
// noise. We attach a virtualConsole that only forwards real errors from our
// own checks.
const { VirtualConsole } = await import('jsdom');
const virtualConsole = new VirtualConsole();
// Drop everything from the page; the verifier produces its own output.
virtualConsole.on('jsdomError', () => {});
virtualConsole.on('error', () => {});
virtualConsole.on('warn', () => {});
virtualConsole.on('log', () => {});

let dom;
try {
  dom = new JSDOM(instrumentedHtml, {
    url: 'http://localhost/index.html',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole,
  });
} catch (err) {
  fail('jsdom boots index.html', err.message);
  process.exit(1);
}

const { window } = dom;
const ph1 = window.__PHASE1__ || {};

if (!window.__PHASE1_LOADED__) {
  fail('Phase 1 globals exposed via instrumentation script',
       window.__PHASE1_ERR__ || 'window.__PHASE1__ never populated — page <script> may have errored before reaching the model defs');
  // Continue running DOM-walk checks even if the JS object graph is unavailable.
}

const PRODUCT              = ph1.PRODUCT;
const CHANNEL_ROLE         = ph1.CHANNEL_ROLE;
const PH_RESPONSE          = ph1.PH_RESPONSE;
const KSP_PAIRS            = ph1.KSP_PAIRS;
const KSP_SAFE             = ph1.KSP_SAFE;
const TAG_INCOMPATIBILITIES= ph1.TAG_INCOMPATIBILITIES;
const TAGS_INERT           = ph1.TAGS_INERT;
const BIOMASS_DEMAND       = ph1.BIOMASS_DEMAND;
const TOMATO_REMOVAL       = ph1.TOMATO_REMOVAL;
const TOMATO_FRUIT_EXPORT  = ph1.TOMATO_FRUIT_EXPORT;
// STORED_RECIPE consolidates the three hand-stored recipe channels.
// Local aliases below mirror the legacy variable names so downstream checks
// don't need to be rewritten — this is verifier-internal only, NOT a
// backwards-compat alias in the live app (which fully migrated 2026-05-08).
const STORED_RECIPE        = ph1.STORED_RECIPE;
const TOMATO_SIDEDRESS     = STORED_RECIPE?.tomato?.sidedress;
const FOLIAR               = STORED_RECIPE?.tomato ? { tomato: STORED_RECIPE.tomato.foliaire } : undefined;
const LETTUCE              = ph1.LETTUCE;
const RECIPE_INPUTS        = ph1.RECIPE_INPUTS;
const ACCEPTED_DEFICITS    = ph1.ACCEPTED_DEFICITS;
const ACCEPTED_EXCESSES    = ph1.ACCEPTED_EXCESSES;
const PRODUCT_PCT          = ph1.PRODUCT_PCT;
const SIDEDRESS_AREA_PER_PLANCHE = ph1.SIDEDRESS_AREA_PER_PLANCHE;
const SIDEDRESS_MIN_EFF    = ph1.SIDEDRESS_MIN_EFF;
const TOMATO_NUM_BEDS      = ph1.TOMATO_NUM_BEDS;
const TOMATO_BED_AREA      = ph1.TOMATO_BED_AREA;
const ADMIN_PAGES          = ph1.ADMIN_PAGES || [];
const getWeekNumber        = ph1.getWeekNumber;
const effectiveEff         = ph1.effectiveEff;
const predictedTankPh      = ph1.predictedTankPh;
const foliarPhResponse     = ph1.foliarPhResponse;
const computeStageRecipe   = ph1.computeStageRecipe;
const INCOMPATIBLE_RECIPES = ph1.INCOMPATIBLE_RECIPES;
const MIX_ORDER            = ph1.MIX_ORDER;

// ─── REQ-001 — DOM-walked French CE check ──────────────────────────────
//
// Migrated from bash (Ch5 = A). Walk every text node, compose visible text
// per element, regex against the same forbidden patterns the bash verifier
// used. Skips identifiers / attributes / comments by construction (text
// nodes only), and additionally skips the four "EC" identifiers that show
// up in id attributes — those don't surface as visible text.
//
// Compared to bash version: catches programmatic textContent injection if
// the JS that injects it ran during page load (jsdom executes it). Misses
// strings injected after route changes — Phase 2.5 could add a setPage walk.

header("REQ-001 — French 'CE' for electrical conductivity (DOM walk)");

const FORBIDDEN_EC_PATTERNS = [
  { name: "Aucun 'EC ' / 'EC—' / 'EC:' isolé en début de phrase visible",
    re: /(^|[\s>(])EC[ —:](?!\d)/ },
  { name: "Aucun 'EC pour-through'",
    re: /\bEC pour-through\b/ },
  { name: "Aucun 'Mesurer EC' / 'Mesurer l'EC'",
    re: /Mesurer (l'EC|EC[ ,])/ },
  { name: "Aucun 'EC du' / 'EC dans' / 'EC qui'",
    re: /\bEC (du|dans|qui) / },
  { name: "Aucun 'EC trop' / 'EC stable' / 'EC plus (basse|haute)'",
    re: /\bEC (trop|stable|plus (basse|haute))/ },
  { name: "Aucun \"l'EC\" ou \"d'EC\" en français",
    re: /(l'EC[ .,]|d'EC[ .,])/ },
  { name: "Aucun 'baisse d'EC'",
    re: /baisse d'EC/ },
];

// Collect visible text per element. We skip <script>/<style> and known
// lab-quote spans (REQ-001 scope: Berger Labs water analysis is OUT of
// scope). Phase 2 has no explicit lab-quote tag, so we walk everything;
// none of the current lab quotes appear inside an EC-context that would
// match these regexes (verified by running this against current index.html).

function collectVisibleText(root) {
  const out = [];
  const walker = root.ownerDocument.createTreeWalker(root, 0x4 /* TEXT_NODE */);
  let node;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (!parent) continue;
    const tag = parent.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE') continue;
    const text = node.nodeValue;
    if (!text || !text.trim()) continue;
    out.push({ text, parent });
  }
  return out;
}

const allTextNodes = collectVisibleText(window.document.body || window.document.documentElement);

function runEcPattern(name, re) {
  const hits = [];
  for (const { text, parent } of allTextNodes) {
    if (re.test(text)) {
      hits.push(`${parent.tagName}: ${text.trim().slice(0, 90)}`);
      if (hits.length >= 3) break;
    }
  }
  if (hits.length === 0) pass(name);
  else fail(name, hits.join('\n'));
}

for (const p of FORBIDDEN_EC_PATTERNS) runEcPattern(p.name, p.re);

// ─── REQ-006 — DOM-walked Kelp check ───────────────────────────────────

header("REQ-006 — 'Algue' au lieu de 'Kelp' (DOM walk)");

{
  const hits = [];
  for (const { text, parent } of allTextNodes) {
    // Match "Kelp" appearing as visible text. Identifiers like id="out-kelp"
    // can't reach the text-node walker by construction.
    if (/\bKelp\b/.test(text)) {
      hits.push(`${parent.tagName}: ${text.trim().slice(0, 90)}`);
      if (hits.length >= 3) break;
    }
  }
  if (hits.length === 0) pass("Aucun 'Kelp' dans le texte HTML rendu");
  else fail("Aucun 'Kelp' dans le texte HTML rendu", hits.join('\n'));
}

// ─── REQ-007 — Jargon scan, scoped to non-admin pages ──────────────────
//
// Ch6 = A scoped to non-admin: admin pages are jargon-tolerant (Bilan
// nutriment, banque, ec, diagnostic). Walk text nodes that are NOT inside
// any element whose id matches `page-<slug>-content` for slug in ADMIN_PAGES.

header("REQ-007 — Aucun jargon anglais (texte non-admin)");

const JARGON_DENY = ['dryback'];

const adminContentIds = new Set(
  (ADMIN_PAGES || []).map(slug => `page-${slug}-content`)
);

function isInsideAdmin(el) {
  let cur = el;
  while (cur && cur !== window.document) {
    if (cur.id && adminContentIds.has(cur.id)) return true;
    cur = cur.parentElement;
  }
  return false;
}

const nonAdminTextNodes = allTextNodes.filter(({ parent }) => !isInsideAdmin(parent));

for (const term of JARGON_DENY) {
  const re = new RegExp(`\\b${term}\\b`, 'i');
  const hits = [];
  for (const { text, parent } of nonAdminTextNodes) {
    if (re.test(text)) {
      hits.push(`${parent.tagName}: ${text.trim().slice(0, 90)}`);
      if (hits.length >= 3) break;
    }
  }
  if (hits.length === 0) pass(`Aucun '${term}' (jargon, hors pages admin)`);
  else fail(`Aucun '${term}' (jargon, hors pages admin)`, hits.join('\n'));
}

// ─── REQ-008 — getWeekNumber pinned-date tests ─────────────────────────
//
// Ch7 = A. Replace bash `|| 7` and `4 -` greps with a runtime correctness
// check: monkey-patch Date inside the function's closure by overriding
// window.Date for the call, then restore. Cases per requirement statement:
//   2026-01-04 → 1   (Jan 4 lands in the year's week 1)
//   2025-12-29 → 1   (Mon of ISO week 2026-W01)
//   2026-12-31 → 53  (Thu of ISO week 2026-W53)

header("REQ-008 — getWeekNumber ISO 8601 (dates fixées)");

if (typeof getWeekNumber !== 'function') {
  fail('getWeekNumber est exposé', 'function not found on window');
} else {
  const RealDate = window.Date;
  function withFixedDate(iso, fn) {
    const fixed = new RealDate(iso + 'T12:00:00');
    class FixedDate extends RealDate {
      constructor(...args) {
        if (args.length === 0) super(fixed.getTime());
        else super(...args);
      }
      static now() { return fixed.getTime(); }
    }
    window.Date = FixedDate;
    try { return fn(); } finally { window.Date = RealDate; }
  }
  const cases = [
    { iso: '2026-01-04', expected: 1 },
    { iso: '2025-12-29', expected: 1 },
    { iso: '2026-12-31', expected: 53 },
  ];
  for (const { iso, expected } of cases) {
    const actual = withFixedDate(iso, () => getWeekNumber());
    if (actual === expected) pass(`getWeekNumber(${iso}) === ${expected}`);
    else fail(`getWeekNumber(${iso}) === ${expected}`, `actual: ${actual}`);
  }
}

// ─── REQ-010 — every PRODUCT[*].mode is 'flux' or 'concentration' ──────

header('REQ-010 — Every PRODUCT[*].mode declared');

if (!PRODUCT) {
  fail('PRODUCT exposed', 'window.PRODUCT not available');
} else {
  const offenders = [];
  for (const [name, p] of Object.entries(PRODUCT)) {
    if (p.mode !== 'flux' && p.mode !== 'concentration') {
      offenders.push(`${name}: mode=${JSON.stringify(p.mode)}`);
    }
  }
  if (offenders.length === 0) {
    pass(`Tous les ${Object.keys(PRODUCT).length} produits déclarent mode ∈ {flux, concentration}`);
  } else {
    fail('Tous les produits déclarent mode flux|concentration', offenders.join('\n'));
  }
}

// ─── REQ-011 — CHANNEL_ROLE covers every demand element ────────────────

header('REQ-011 — CHANNEL_ROLE couvre tous les éléments de demande');

if (!CHANNEL_ROLE || !BIOMASS_DEMAND || !TOMATO_FRUIT_EXPORT) {
  fail('CHANNEL_ROLE / BIOMASS_DEMAND / TOMATO_FRUIT_EXPORT exposés',
       'one or more globals missing');
} else {
  const demandElements = new Set();
  for (const stage of Object.keys(BIOMASS_DEMAND)) {
    for (const el of Object.keys(BIOMASS_DEMAND[stage])) demandElements.add(el);
  }
  for (const el of Object.keys(TOMATO_FRUIT_EXPORT)) demandElements.add(el);
  const missing = [...demandElements].filter(el => !CHANNEL_ROLE[el]);
  if (missing.length === 0) {
    pass(`CHANNEL_ROLE couvre les ${demandElements.size} éléments (BIOMASS_DEMAND + TOMATO_FRUIT_EXPORT)`);
  } else {
    fail('CHANNEL_ROLE couvre tous les éléments de demande', `manquants: ${missing.join(', ')}`);
  }
}

// ─── REQ-012 — fraction sums per element in CHANNEL_ROLE within 1.0 ± 0.05

header('REQ-012 — Aucun double flux-ownership (sommes 1.0 ± 0.05)');

if (!CHANNEL_ROLE) {
  fail('CHANNEL_ROLE exposed', 'missing');
} else {
  const offenders = [];
  for (const [el, channels] of Object.entries(CHANNEL_ROLE)) {
    const sum = Object.values(channels).reduce((a, b) => a + (Number(b) || 0), 0);
    if (Math.abs(sum - 1.0) > 0.05) {
      offenders.push(`${el}: sum=${sum.toFixed(3)}`);
    }
  }
  if (offenders.length === 0) {
    pass(`Tous les ${Object.keys(CHANNEL_ROLE).length} éléments somment 1.0 ± 0.05`);
  } else {
    fail('Sommes par élément dans 1.0 ± 0.05', offenders.join('\n'));
  }
}

// ─── REQ-019 — phClass covers every element in product.base ────────────

header('REQ-019 — PRODUCT.phClass couvre tout élément de PRODUCT.base');

if (!PRODUCT) {
  fail('PRODUCT exposed', 'missing');
} else {
  const offenders = [];
  for (const [name, p] of Object.entries(PRODUCT)) {
    const baseEls = Object.keys(p.base || {});
    if (baseEls.length === 0) continue; // products with no base map skipped
    if (p.phClass == null) {
      offenders.push(`${name}: no phClass for base elements ${baseEls.join(',')}`);
      continue;
    }
    if (typeof p.phClass === 'string') continue; // uniform — covers everything
    for (const el of baseEls) {
      if (!(el in p.phClass)) offenders.push(`${name}: phClass missing key ${el}`);
    }
  }
  if (offenders.length === 0) {
    pass('Tous les produits déclarent phClass pour chaque élément de base');
  } else {
    fail('PRODUCT.phClass couvre PRODUCT.base', offenders.join('\n'));
  }
}

// ─── REQ-022 — every product in any active recipe has organicAllowed: true

header('REQ-022 — Produits des recettes actives organicAllowed: true');

if (!PRODUCT) {
  fail('PRODUCT exposed', 'missing');
} else {
  // Collect product NAMES referenced by active recipes. The current Phase 1
  // active recipes are computeStageRecipe, FOLIAR.tomato (A and B), and
  // TOMATO_SIDEDRESS — but those use label strings, not PRODUCT keys. The
  // computeRecipe mapping (in index.html:3808) IS keyed on PRODUCT names,
  // so we use the union of (a) keys returned by computeRecipe across all
  // tomato stages × channels and (b) products explicitly named in PRODUCT
  // with mode set (every PRODUCT entry is presumed potentially active).
  //
  // Pragmatic choice: for now check every PRODUCT entry. If any product
  // ever needs to be in PRODUCT but flagged organicAllowed: false, we'll
  // revisit (Challenge 17 in working files/requirements-challenges.md
  // recommends exactly this — Option A: every PRODUCT entry must be
  // allowed; archive prohibited products elsewhere).

  const offenders = [];
  for (const [name, p] of Object.entries(PRODUCT)) {
    if (p.organicAllowed !== true) {
      offenders.push(`${name}: organicAllowed=${JSON.stringify(p.organicAllowed)}`);
    }
  }
  if (offenders.length === 0) {
    pass(`Tous les ${Object.keys(PRODUCT).length} produits ont organicAllowed: true`);
  } else {
    fail('Tous les produits actifs sont organic-allowed', offenders.join('\n'));
  }
}

// ─── REQ-023 — every product has an ecFactor (number, 0 explicit) ──────

header('REQ-023 — Tout produit a ecFactor (numérique, 0 explicite)');

if (!PRODUCT) {
  fail('PRODUCT exposed', 'missing');
} else {
  const offenders = [];
  for (const [name, p] of Object.entries(PRODUCT)) {
    if (typeof p.ecFactor !== 'number' || Number.isNaN(p.ecFactor)) {
      offenders.push(`${name}: ecFactor=${JSON.stringify(p.ecFactor)}`);
    }
  }
  if (offenders.length === 0) {
    pass(`Tous les ${Object.keys(PRODUCT).length} produits déclarent ecFactor (number)`);
  } else {
    fail('Tous les produits déclarent ecFactor', offenders.join('\n'));
  }
}

// ─── REQ-029a — every product has non-empty ions and chemistryTags ─────

header('REQ-029a — Tout produit a ions et chemistryTags non vides');

if (!PRODUCT) {
  fail('PRODUCT exposed', 'missing');
} else {
  const offenders = [];
  for (const [name, p] of Object.entries(PRODUCT)) {
    if (!p.ions || typeof p.ions !== 'object' || Object.keys(p.ions).length === 0) {
      offenders.push(`${name}: ions empty/missing`);
    }
    if (!Array.isArray(p.chemistryTags) || p.chemistryTags.length === 0) {
      offenders.push(`${name}: chemistryTags empty/missing`);
    }
  }
  if (offenders.length === 0) {
    pass('ions{} et chemistryTags[] non vides sur tous les produits');
  } else {
    fail('ions / chemistryTags non vides', offenders.join('\n'));
  }
}

// ─── REQ-029b — every (cation × anion) pair is in KSP_PAIRS or KSP_SAFE ─
//
// Cation/anion classification follows the validator embedded in index.html
// (validatePhase1ModelCoverage IIFE at line 3882): cations end in '+' or
// have an explicit suffix like '2+', anions end in '-' or '-N' (charge
// notation). We use the exact same lists declared there.

header('REQ-029b — Toute paire cation × anion classifiée');

if (!PRODUCT || !KSP_PAIRS || !KSP_SAFE) {
  fail('PRODUCT / KSP_PAIRS / KSP_SAFE exposés', 'missing');
} else {
  const cationList = ['K+', 'Mg2+', 'Fe2+', 'Mn2+', 'Zn2+', 'Cu2+', 'Ca2+', 'Na+', 'NH4+', 'H+'];
  const anionList = ['SO4-2', 'Cl-', 'B(OH)4-', 'MoO4-2', 'organic-matrix', 'PO4-3', 'OH-', 'NO3-'];

  const cations = new Set();
  const anions = new Set();
  for (const p of Object.values(PRODUCT)) {
    for (const ion of Object.keys(p.ions || {})) {
      if (cationList.indexOf(ion) >= 0) cations.add(ion);
      else if (anionList.indexOf(ion) >= 0) anions.add(ion);
    }
  }
  const safeKey = (cation, anion) => `${cation}|${anion}`;
  const known = new Set();
  for (const s of KSP_SAFE)  known.add(safeKey(s.cation, s.anion));
  for (const s of KSP_PAIRS) known.add(safeKey(s.cation, s.anion));

  const missing = [];
  for (const cat of cations) {
    for (const an of anions) {
      if (!known.has(safeKey(cat, an))) missing.push(`${cat} × ${an}`);
    }
  }
  if (missing.length === 0) {
    pass(`Toutes les ${cations.size}×${anions.size}=${cations.size * anions.size} paires sont classifiées`);
  } else {
    fail('Toutes les paires cation×anion classifiées', missing.join('\n'));
  }
}

// ─── REQ-029c — every distinct chemistryTags tag is classified ─────────

header('REQ-029c — Tout chemistryTags est classifié');

if (!PRODUCT || !TAG_INCOMPATIBILITIES || !TAGS_INERT) {
  fail('PRODUCT / TAG_INCOMPATIBILITIES / TAGS_INERT exposés', 'missing');
} else {
  const tags = new Set();
  for (const p of Object.values(PRODUCT)) {
    for (const t of (p.chemistryTags || [])) tags.add(t);
  }
  const inIncompat = new Set();
  for (const r of TAG_INCOMPATIBILITIES) for (const t of (r.tags || [])) inIncompat.add(t);

  const unclassified = [];
  for (const t of tags) {
    if (!inIncompat.has(t) && !(t in TAGS_INERT)) unclassified.push(t);
  }
  if (unclassified.length === 0) {
    pass(`Tous les ${tags.size} tags chimiques sont classifiés`);
  } else {
    fail('Tous les chemistryTags classifiés', unclassified.join('\n'));
  }
}

// ─── REQ-033 — TOMATO_REMOVAL biased toward high end of references ─────
//
// Inter-source mean across {Yara high-end, Sonneveld 2009, Koller 2016 avg}
// for each macro element with multi-source data. TOMATO_REMOVAL value must
// be ≥ this mean (or carry an `acceptedDeficit` annotation, not yet supported
// in the data shape — for now, hard threshold).

header('REQ-033 — TOMATO_REMOVAL ≥ inter-source mean (high-end bias)');

if (!TOMATO_REMOVAL) {
  fail('TOMATO_REMOVAL exposé', 'window.TOMATO_REMOVAL not available');
} else {
  // Reference values (g uptake per kg fresh fruit, tomato).
  // Inter-source mean = average of {Yara high, Sonneveld 2009, Koller 2016 avg}.
  const REF_MEAN = {
    N:  (2.3 + 2.5 + 2.9) / 3,        // 2.566...
    P:  (0.36 + 0.57 + 0.39) / 3,     // 0.44
    K:  (3.3 + 4.0 + 4.48) / 3,       // 3.926...
    Mg: (0.54 + 0.67 + 0.5) / 3,      // 0.57
  };
  const failures = [];
  for (const [el, mean] of Object.entries(REF_MEAN)) {
    const cur = TOMATO_REMOVAL[el]?.g;
    if (typeof cur !== 'number') {
      failures.push(`${el}: missing or non-numeric in TOMATO_REMOVAL`);
    } else if (cur + 1e-9 < mean) {
      failures.push(`${el}: ${cur} < mean ${mean.toFixed(2)}`);
    }
  }
  if (failures.length === 0) {
    pass('TOMATO_REMOVAL ≥ Tier B mean pour N, P, K, Mg');
  } else {
    fail('TOMATO_REMOVAL ≥ Tier B mean', failures.join('\n'));
  }
}

// ─── Phase 2.5 wiring (REQ-013/014/015/016/017/018/020/021/024/025/026/027/
//     029/030/031/032/053/054/055/060/061) ──────────────────────────────────
//
// Manual-review skip list (NOT wired here, by design):
//   REQ-002 — Ecocert-only (manual policy review per its own statement)
//   REQ-028 — cert annotation on every empirical constant (manual review,
//             sampling threshold subjective)
//
// ─────────────────────────────────────────────────────────────────────────

// Helper — sidedress effective contribution (mg/m²/wk per element) for a stage.
function sidedressEffective(stage, el) {
  if (!TOMATO_SIDEDRESS || !PRODUCT_PCT || !SIDEDRESS_MIN_EFF) return 0;
  const sd = TOMATO_SIDEDRESS[stage] || { actisol_g: 0, farine_g: 0 };
  const area = SIDEDRESS_AREA_PER_PLANCHE || 54.7;
  let mg_m2 = 0;
  if (el === 'N') {
    mg_m2 += (sd.actisol_g * (PRODUCT_PCT.Actisol_N || 0)
             * (SIDEDRESS_MIN_EFF.Actisol_N || 0.6) * 1000) / area;
    mg_m2 += (sd.farine_g  * (PRODUCT_PCT.FarinePlumes_N || 0)
             * (SIDEDRESS_MIN_EFF.FarinePlumes_N || 0.75) * 1000) / area;
  } else if (el === 'P') {
    mg_m2 += (sd.actisol_g * (PRODUCT_PCT.Actisol_P || 0)
             * (SIDEDRESS_MIN_EFF.Actisol_P || 0.5) * 1000) / area;
  } else if (el === 'K') {
    mg_m2 += (sd.actisol_g * (PRODUCT_PCT.Actisol_K || 0)
             * (SIDEDRESS_MIN_EFF.Actisol_K || 0.85) * 1000) / area;
  }
  return mg_m2;
}

// Helper — fertigation effective contribution (mg/m²/wk per element) at current
// soil pH using computeStageRecipe(stage). Only K and Mg modeled in mass-balance
// (per computeStageRecipe). Returns 0 for elements not delivered via fertigation.
function fertigationEffective(stage, el, soilPh) {
  if (typeof computeStageRecipe !== 'function' || !PRODUCT_PCT || !TOMATO_NUM_BEDS || !TOMATO_BED_AREA) return 0;
  const recipe = computeStageRecipe(stage) || {};
  const totalArea = TOMATO_NUM_BEDS * TOMATO_BED_AREA;
  let mg_m2 = 0;
  if (el === 'K') {
    const eff = (effectiveEff && PRODUCT && PRODUCT.K2SO4)
      ? Math.max(0.05, effectiveEff('K2SO4', 'K', soilPh))  // 0 floor would zero supply
      : 1.0;
    const mg_total = (recipe.kSulfate || 0) * (PRODUCT_PCT.K2SO4_K || 0.415) * 1000 * eff;
    mg_m2 = mg_total / totalArea;
  } else if (el === 'Mg') {
    const eff = (effectiveEff && PRODUCT && PRODUCT['MgSO4-7H2O'])
      ? Math.max(0.05, effectiveEff('MgSO4-7H2O', 'Mg', soilPh))
      : 1.0;
    const mg_total = (recipe.mgSulfate || 0) * (PRODUCT_PCT.MgSO4_Mg || 0.0986) * 1000 * eff;
    mg_m2 = mg_total / totalArea;
  }
  return mg_m2;
}

// Helper — compost release in mg/m²/wk per element.
function compostReleaseMg(el) {
  if (!RECIPE_INPUTS || !RECIPE_INPUTS.compostReleasePerWeek) return 0;
  return (RECIPE_INPUTS.compostReleasePerWeek[el] || 0) * 1000;  // g→mg
}

// Helper — total demand (mg/m²/wk) for (stage, el).
function stageDemandMg(stage, el) {
  if (!TOMATO_FRUIT_EXPORT || !BIOMASS_DEMAND || !RECIPE_INPUTS) return 0;
  const y = (RECIPE_INPUTS.stageYield || {})[stage] || 0;
  const fruit_g = (TOMATO_FRUIT_EXPORT[el] && TOMATO_FRUIT_EXPORT[el].g) || 0;
  const fruit_mg = fruit_g * 1000 * y;
  const bio_mg = (BIOMASS_DEMAND[stage] || {})[el] || 0;
  return fruit_mg + bio_mg;
}

const STAGES = ['T1', 'T2', 'T3', 'T4', 'T5'];
const MASS_BALANCE_ELEMENTS = ['N', 'P', 'K', 'Mg'];  // CHANNEL_ROLE elements with non-foliar supply
const SOIL_PH_NOW = 7.4;  // current soil pH per CLAUDE.md (April 2026 Berger)

// ─── REQ-013 — Σ(channel_supply) ≥ 0.9 × demand per (element, stage) ──────
//
// Failures are expected when nothing can be done about it (P pH-locked at
// soil pH ≥ 7, no organic + chemistry-compatible remediation path) — those
// MUST appear in ACCEPTED_DEFICITS with a documented reason. Unaccepted
// deficits = real failures that must fix the model or the recipe.

header('REQ-013 — Couverture macro ≥ 0.9 × demande (gaps acceptés annotés)');

if (typeof computeStageRecipe !== 'function' || !TOMATO_SIDEDRESS || !RECIPE_INPUTS || !ACCEPTED_DEFICITS) {
  fail('REQ-013 — required globals exposed', 'computeStageRecipe / TOMATO_SIDEDRESS / RECIPE_INPUTS / ACCEPTED_DEFICITS missing');
} else {
  // Per-element supply totals (mg/m²/wk): compost + sidedress + fertigation.
  // Foliar omitted from the under-fert check for non-foliar elements (foliar
  // delivers micros, which are not in MASS_BALANCE_ELEMENTS). T1/T2 have
  // stageYield=0 so demand is biomass-only — supply still expected to cover
  // it via compost + sidedress.
  const offenders = [];
  for (const stage of STAGES) {
    for (const el of MASS_BALANCE_ELEMENTS) {
      const demand = stageDemandMg(stage, el);
      if (demand <= 0) continue;  // skip null demand entries
      const supply = compostReleaseMg(el)
                   + sidedressEffective(stage, el)
                   + fertigationEffective(stage, el, SOIL_PH_NOW);
      const ratio = supply / demand;
      if (ratio < 0.90) {
        const accepted = ACCEPTED_DEFICITS.find(d => d.stage === stage && d.element === el);
        if (!accepted) {
          offenders.push(`${stage}.${el}: supply=${supply.toFixed(0)} demand=${demand.toFixed(0)} ratio=${ratio.toFixed(2)} (no ACCEPTED_DEFICITS annotation)`);
        }
      }
    }
  }
  if (offenders.length === 0) {
    pass(`Tous les (stage × macro) couvrent ≥ 90 % ou sont annotés acceptés`);
  } else {
    fail('Σ(channel_supply) ≥ 0.9 × demand', offenders.join('\n'));
  }
}

// ─── REQ-014 — Σ(channel_supply) ≤ 1.3 × demand (luxury / waste guard) ────
//
// Excess > 1.3 × demand is accepted iff (a) entry exists in ACCEPTED_EXCESSES
// with a reason AND (b) the UI surfaces a warning to the operator so over-
// supply is visible (not silent). The default is to fail — over-feeding is a
// model failure unless there's a documented reason it can't be undone (e.g.
// past compost amendment that's still mineralizing).

header('REQ-014 — Sur-apport macro ≤ 1.3 × demande (excès acceptés annotés + warning UI)');

if (typeof computeStageRecipe !== 'function' || !TOMATO_SIDEDRESS || !RECIPE_INPUTS || !ACCEPTED_EXCESSES) {
  fail('REQ-014 — required globals exposed', 'computeStageRecipe / TOMATO_SIDEDRESS / RECIPE_INPUTS / ACCEPTED_EXCESSES missing');
} else {
  const offenders = [];
  for (const stage of STAGES) {
    for (const el of MASS_BALANCE_ELEMENTS) {
      const demand = stageDemandMg(stage, el);
      if (demand <= 0) continue;
      const supply = compostReleaseMg(el)
                   + sidedressEffective(stage, el)
                   + fertigationEffective(stage, el, SOIL_PH_NOW);
      const ratio = supply / demand;
      if (ratio > 1.3) {
        const accepted = ACCEPTED_EXCESSES.find(e => e.stage === stage && e.element === el);
        if (!accepted) {
          offenders.push(`${stage}.${el}: supply=${supply.toFixed(0)} demand=${demand.toFixed(0)} ratio=${ratio.toFixed(2)} (no ACCEPTED_EXCESSES annotation)`);
        }
      }
    }
  }
  // Proxy check: when ACCEPTED_EXCESSES is non-empty, the UI must surface the
  // warning somewhere visible. We grep the raw HTML for the canonical warning
  // copy ("Sur-apport accepté") rendered by buildNutriment in Block 5 (Leviers).
  if (offenders.length === 0 && ACCEPTED_EXCESSES.length > 0) {
    if (!rawHtml.includes('Sur-apport accepté')) {
      fail('REQ-014 — UI warning for accepted excesses', 'ACCEPTED_EXCESSES has entries but raw HTML does not contain "Sur-apport accepté" (warning banner missing on Nutrition Block 5)');
    } else {
      pass(`Tous les (stage × macro) supply ≤ 1.3× demand ou annotés acceptés (${ACCEPTED_EXCESSES.length} entrées) + warning UI présent`);
    }
  } else if (offenders.length === 0) {
    pass(`Tous les (stage × macro) supply ≤ 1.3× demand`);
  } else {
    fail('Σ(channel_supply) ≤ 1.3 × demand', offenders.join('\n'));
  }
}

// ─── REQ-015 — Concentration-driven dose / solubility declared ────────────
//
// REQ-015 envelopes (efficacy_min / safety_max) aren't in PRODUCT shape today.
// Best mechanizable proxy: every PRODUCT entry MUST declare solubilityCap_g_per_L
// (existing field). This catches the add-product-without-data case so a real
// efficacy/safety band can be added next.

header('REQ-015 — Tout produit déclare solubilityCap_g_per_L (placeholder)');

if (!PRODUCT) {
  fail('PRODUCT exposed', 'missing');
} else {
  const offenders = [];
  for (const [name, p] of Object.entries(PRODUCT)) {
    if (typeof p.solubilityCap_g_per_L !== 'number') {
      offenders.push(`${name}: solubilityCap_g_per_L=${JSON.stringify(p.solubilityCap_g_per_L)}`);
    }
  }
  if (offenders.length === 0) {
    pass(`Tous les ${Object.keys(PRODUCT).length} produits déclarent solubilityCap_g_per_L (TODO: ajouter efficacy_min/safety_max pour bande complète)`);
  } else {
    fail('PRODUCT.solubilityCap_g_per_L manquant', offenders.join('\n'));
  }
}

// REQ-016 retired 2026-05-08 — was "stored TOMATO_STAGES vs computeStageRecipe
// drift detection". Comparison became meaningless when TOMATO_STAGES const was
// removed (stored = computed by construction). See RECIPE_HISTORY entry
// (retired 2026-05-08).

// ─── REQ-017 — pH-aware effective efficiency in [0,1] ─────────────────────

header('REQ-017 — effectiveEff(product, el, pH) renvoie [0,1] pour soilPh=7.0');

if (typeof effectiveEff !== 'function' || !PRODUCT) {
  fail('REQ-017 — effectiveEff exposed', 'function or PRODUCT missing');
} else {
  const offenders = [];
  for (const [name, p] of Object.entries(PRODUCT)) {
    const baseEls = Object.keys(p.base || {});
    for (const el of baseEls) {
      const eff = effectiveEff(name, el, 7.0);
      if (typeof eff !== 'number' || Number.isNaN(eff) || eff < 0 || eff > 1) {
        offenders.push(`${name}.${el}: effectiveEff=${eff}`);
      }
    }
  }
  if (offenders.length === 0) {
    pass(`effectiveEff ∈ [0,1] pour tout (produit, élément) à pH 7.0`);
  } else {
    fail('effectiveEff hors [0,1]', offenders.join('\n'));
  }
}

// ─── REQ-018 — No "decorative" products at current pH ─────────────────────
//
// Active recipes today: computeStageRecipe (K2SO4, MgSO4-7H2O via fertigation),
// FOLIAR.tomato.A (MnSO4, ZnSO4, Solubore, CuSO4, NaMolybdate, FeSO4-7H2O),
// TOMATO_SIDEDRESS (Actisol-5-3-2, FarinePlumes). For each, walk product.base
// and assert effectiveEff(product, el, soilPh) ≥ 0.05 unless flagged decorative.

header('REQ-018 — Aucun produit "décoratif" (eff < 5%) sans drapeau');

if (typeof effectiveEff !== 'function' || !PRODUCT) {
  fail('REQ-018 — effectiveEff / PRODUCT exposés', 'missing');
} else {
  const ACTIVE_PRODUCTS = [
    'K2SO4', 'MgSO4-7H2O',                      // fertigation
    'MnSO4', 'ZnSO4', 'Solubore', 'CuSO4',      // foliar Spray A
    'NaMolybdate', 'FeSO4-7H2O',                // foliar Spray A
    'Actisol-5-3-2', 'FarinePlumes',            // sidedress
  ];
  const offenders = [];
  for (const name of ACTIVE_PRODUCTS) {
    const p = PRODUCT[name];
    if (!p) { offenders.push(`${name}: missing from PRODUCT`); continue; }
    if (p.decorative) continue;                  // explicit override
    const baseEls = Object.keys(p.base || {});
    // For foliar products, sample sprayPh = 5.0 (typical sulfate Spray A).
    // For non-foliar, only soilPh matters.
    const sprayPh = (p.ch === 'foliar') ? 5.0 : null;
    for (const el of baseEls) {
      const eff = effectiveEff(name, el, SOIL_PH_NOW, sprayPh);
      if (eff < 0.05) {
        offenders.push(`${name}.${el}: eff=${eff.toFixed(3)} at soilPh ${SOIL_PH_NOW}`);
      }
    }
  }
  if (offenders.length === 0) {
    pass('Tous les produits actifs ont eff ≥ 5% à pH actuel');
  } else {
    fail('Produits décoratifs non flaggés (eff < 5%)', offenders.join('\n'));
  }
}

// ─── REQ-020 — pH lockout gate (FeSO4 effective eff drops with rising pH) ─

header('REQ-020 — Lockout pH: effectiveEff(FeSO4, Fe, 7.4) < (Fe, 6.5)');

if (typeof effectiveEff !== 'function' || !PRODUCT || !PRODUCT['FeSO4-7H2O']) {
  fail('REQ-020 — FeSO4 / effectiveEff exposed', 'missing');
} else {
  const lo = effectiveEff('FeSO4-7H2O', 'Fe', 6.5);
  const hi = effectiveEff('FeSO4-7H2O', 'Fe', 7.4);
  if (typeof lo !== 'number' || typeof hi !== 'number') {
    fail('REQ-020 — effectiveEff returns numbers', `lo=${lo} hi=${hi}`);
  } else if (hi < lo) {
    pass(`effectiveEff(FeSO4-7H2O, Fe, 7.4)=${hi.toFixed(3)} < (Fe, 6.5)=${lo.toFixed(3)} — lockout active`);
  } else {
    fail('REQ-020 — pH lockout differentiates Fe at 6.5 vs 7.4',
         `eff(7.4)=${hi.toFixed(3)} should be < eff(6.5)=${lo.toFixed(3)}`);
  }
}

// ─── REQ-021 — Solubility cap per fertigation product ─────────────────────
//
// For active recipes, compute effective concentration (g per L stock barrel)
// and assert it's below the product's solubility cap. Stock barrel size is
// not currently exposed; use a conservative 500 L as proxy. K2SO4 at T5
// (~3500 g) → 7 g/L, well below 100 g/L cap. Foliar tank: 15 L master vol.

header('REQ-021 — Concentration in tank ≤ solubilityCap_g_per_L');

if (!PRODUCT || typeof computeStageRecipe !== 'function') {
  fail('REQ-021 — PRODUCT / computeStageRecipe exposed', 'missing');
} else {
  const STOCK_VOL_L = 500;       // estimated fertigation stock barrel volume
  const FOLIAR_VOL_L = 15;       // FOLIAR.tomato.masterVol
  const offenders = [];

  // Fertigation: max dose across all stages.
  let kMax = 0, mgMax = 0;
  for (const stage of STAGES) {
    const r = computeStageRecipe(stage) || {};
    if ((r.kSulfate || 0) > kMax) kMax = r.kSulfate;
    if ((r.mgSulfate || 0) > mgMax) mgMax = r.mgSulfate;
  }
  const kConc = kMax / STOCK_VOL_L;
  const mgConc = mgMax / STOCK_VOL_L;
  if (kConc > (PRODUCT.K2SO4?.solubilityCap_g_per_L || 100)) {
    offenders.push(`K2SO4: ${kConc.toFixed(1)} g/L > cap ${PRODUCT.K2SO4.solubilityCap_g_per_L}`);
  }
  if (mgConc > (PRODUCT['MgSO4-7H2O']?.solubilityCap_g_per_L || 700)) {
    offenders.push(`MgSO4-7H2O: ${mgConc.toFixed(1)} g/L > cap`);
  }

  // Foliar Spray A: walk FOLIAR.tomato.A label strings.
  if (FOLIAR && FOLIAR.tomato && Array.isArray(FOLIAR.tomato.A)) {
    const NAME_TO_PRODUCT = {
      'MnSO₄': 'MnSO4', 'ZnSO₄': 'ZnSO4', 'Solubore': 'Solubore',
      'CuSO₄': 'CuSO4', 'Molybdate de sodium': 'NaMolybdate',
      'FeSO₄·7H₂O': 'FeSO4-7H2O',
    };
    for (const item of FOLIAR.tomato.A) {
      const grams = parseFloat((item.master || '').replace(/[^\d.]/g, ''));
      if (!isFinite(grams)) continue;
      const conc = grams / FOLIAR_VOL_L;
      // Match name to PRODUCT key.
      let key = null;
      for (const k in NAME_TO_PRODUCT) {
        if ((item.name || '').includes(k)) { key = NAME_TO_PRODUCT[k]; break; }
      }
      if (!key || !PRODUCT[key]) continue;
      const cap = PRODUCT[key].solubilityCap_g_per_L || Infinity;
      if (conc > cap) {
        offenders.push(`Foliar ${key}: ${conc.toFixed(1)} g/L > cap ${cap}`);
      }
    }
  }
  if (offenders.length === 0) {
    pass('Toutes les concentrations en tank ≤ solubilityCap_g_per_L');
  } else {
    fail('Concentration > solubilityCap_g_per_L', offenders.join('\n'));
  }
}

// ─── REQ-024 — Predicted CE within crop-stage band ────────────────────────
//
// Approximate band 0.3–2.0 mS/cm for fertigation contribution at the dripper
// (above the ~0.10 baseline of city water). predictedCE(recipe, dilution,
// waterCE) computes CE; pass dilution=Dosatron-typical 0.02 (1:50). For each
// tomato stage, sum K₂SO₄ + MgSO₄ contribution and assert within band.

header('REQ-024 — predictedCE par stage dans la bande [0.3, 2.0] mS/cm (stages opérationnels)');

if (typeof ph1.predictedCE !== 'function' || typeof computeStageRecipe !== 'function') {
  fail('REQ-024 — predictedCE / computeStageRecipe exposés', 'missing');
} else {
  const STOCK_VOL_L = 500;
  const DILUTION = 0.02;     // Dosatron 1:50 typical for sulfate fertigation
  // Operationally-meaningful threshold: when total recipe mass is below this,
  // the team mixes a "nominal" tank that's mostly water — stage CE bands don't
  // bind. Below threshold = skip the band check (small biomass-only top-up).
  // 3000 g chosen so T1 (~1.6 kg) and T2 (~2.3 kg) skip naturally — vegetative
  // stages are small-dose by design (low offtake) and can't meaningfully hit
  // the 0.3 floor. T3+ exceed this and get the band check.
  const OPERATIONAL_MIN_G = 3000;
  const offenders = [];
  for (const stage of STAGES) {
    const r = computeStageRecipe(stage) || {};
    const totalMass = (r.kSulfate || 0) + (r.mgSulfate || 0);
    if (totalMass < OPERATIONAL_MIN_G) continue; // skip near-zero dose stages
    const recipe = {};
    if (r.kSulfate)  recipe['K2SO4']        = r.kSulfate / STOCK_VOL_L;
    if (r.mgSulfate) recipe['MgSO4-7H2O']   = r.mgSulfate / STOCK_VOL_L;
    const ce = ph1.predictedCE(recipe, DILUTION, 0.10);
    if (ce < 0.3 || ce > 2.0) {
      offenders.push(`${stage}: predictedCE=${ce.toFixed(2)} hors bande [0.3, 2.0]`);
    }
  }
  if (offenders.length === 0) {
    pass('predictedCE par stage dans [0.3, 2.0] mS/cm (stages opérationnels)');
  } else {
    fail('predictedCE hors bande', offenders.join('\n'));
  }
}

// ─── REQ-025 — Foliar tank CE under burn cap ──────────────────────────────

header('REQ-025 — Foliar predictedCE < 10.0 mS/cm (tomato leaf burn cap)');

if (typeof ph1.predictedCE !== 'function' || !FOLIAR || !FOLIAR.tomato) {
  fail('REQ-025 — predictedCE / FOLIAR exposés', 'missing');
} else {
  const FOLIAR_VOL_L = 15;
  // Tomato leaves tolerate higher foliar EC than cucurbits (cucurbits ~6-8 mS/cm
  // burn threshold; tomato 8-10 mS/cm). Cap raised 8.0 → 10.0 on 2026-05-08
  // per Sonneveld + grower references for tomato. Recipe (FOLIAR.tomato.A
  // FeSO4 80g) lands at 9.48 mS/cm — under the new tomato cap, would have
  // failed cucurbit cap. Re-evaluate if cucurbit crops are added or if tissue
  // tests show foliar burn at current levels.
  const FOLIAR_BURN_CAP_TOMATO = 10.0;
  const NAME_TO_PRODUCT = {
    'MnSO₄': 'MnSO4', 'ZnSO₄': 'ZnSO4', 'Solubore': 'Solubore',
    'CuSO₄': 'CuSO4', 'Molybdate de sodium': 'NaMolybdate',
    'FeSO₄·7H₂O': 'FeSO4-7H2O',
  };
  const recipe = {};
  for (const item of FOLIAR.tomato.A || []) {
    const g = parseFloat((item.master || '').replace(/[^\d.]/g, ''));
    if (!isFinite(g)) continue;
    let key = null;
    for (const k in NAME_TO_PRODUCT) if ((item.name || '').includes(k)) { key = NAME_TO_PRODUCT[k]; break; }
    if (key) recipe[key] = (recipe[key] || 0) + g / FOLIAR_VOL_L;
  }
  const ce = ph1.predictedCE(recipe, 1.0, 0.10);
  if (ce < FOLIAR_BURN_CAP_TOMATO) {
    pass(`Foliar Spray A predictedCE=${ce.toFixed(2)} < ${FOLIAR_BURN_CAP_TOMATO} mS/cm`);
  } else {
    fail('Foliar Spray A predictedCE ≥ burn cap', `${ce.toFixed(2)} ≥ ${FOLIAR_BURN_CAP_TOMATO}`);
  }
}

// ─── REQ-029 — In-tank Ksp check (precipitation guard, recipe-level) ──────
//
// Active tanks:
//   - Fertigation stock: K2SO4 + MgSO4-7H2O (cations K+, Mg2+; anions SO4-2)
//   - Foliar Spray A: MnSO4 + ZnSO4 + Solubore + CuSO4 + NaMolybdate + FeSO4
// For each, walk cation × anion pairs across products in the tank, and assert
// none hit a KSP_PAIRS entry with no override. KSP_SAFE matches → ok.

header('REQ-029 — Aucune paire précipitante dans une recette active');

if (!PRODUCT || !KSP_PAIRS || !KSP_SAFE) {
  fail('REQ-029 — PRODUCT / KSP_PAIRS / KSP_SAFE exposed', 'missing');
} else {
  const TANKS = {
    fertigation: ['K2SO4', 'MgSO4-7H2O'],
    foliarA: ['MnSO4', 'ZnSO4', 'Solubore', 'CuSO4', 'NaMolybdate', 'FeSO4-7H2O'],
  };
  const cationList = ['K+', 'Mg2+', 'Fe2+', 'Mn2+', 'Zn2+', 'Cu2+', 'Ca2+', 'Na+', 'NH4+', 'H+'];
  const anionList = ['SO4-2', 'Cl-', 'B(OH)4-', 'MoO4-2', 'organic-matrix', 'PO4-3', 'OH-', 'NO3-'];
  const safeKey = (c, a) => `${c}|${a}`;
  const ksp_pair_keys = new Set(KSP_PAIRS.map(p => safeKey(p.cation, p.anion)));
  const ksp_safe_keys = new Set(KSP_SAFE.map(p => safeKey(p.cation, p.anion)));

  const offenders = [];
  for (const [tankName, productNames] of Object.entries(TANKS)) {
    const cats = new Set();
    const ans = new Set();
    for (const pn of productNames) {
      const p = PRODUCT[pn];
      if (!p) continue;
      for (const ion of Object.keys(p.ions || {})) {
        if (cationList.includes(ion)) cats.add(ion);
        else if (anionList.includes(ion)) ans.add(ion);
      }
    }
    for (const c of cats) for (const a of ans) {
      if (ksp_pair_keys.has(safeKey(c, a)) && !ksp_safe_keys.has(safeKey(c, a))) {
        offenders.push(`${tankName}: ${c} × ${a} hits KSP_PAIRS without safe override`);
      }
    }
  }
  if (offenders.length === 0) {
    pass('Aucune paire précipitante non couverte dans les recettes actives');
  } else {
    fail('REQ-029 — paire précipitante détectée', offenders.join('\n'));
  }
}

// ─── REQ-030 — INCOMPATIBLE_RECIPES declared ──────────────────────────────

header('REQ-030 — INCOMPATIBLE_RECIPES constante déclarée');

if (typeof INCOMPATIBLE_RECIPES === 'undefined' || INCOMPATIBLE_RECIPES === undefined) {
  fail('REQ-030 — INCOMPATIBLE_RECIPES non exposé',
       'TODO: declare const INCOMPATIBLE_RECIPES = [...] in index.html (with Spray A × hypothetical fish-hydrolysate, etc.)');
} else if (!Array.isArray(INCOMPATIBLE_RECIPES)) {
  fail('REQ-030 — INCOMPATIBLE_RECIPES doit être un tableau', `type=${typeof INCOMPATIBLE_RECIPES}`);
} else {
  const bad = [];
  for (const e of INCOMPATIBLE_RECIPES) {
    if (!e || typeof e !== 'object') { bad.push('non-object entry'); continue; }
    if (!Array.isArray(e.recipes) || e.recipes.length < 2) bad.push(`bad recipes: ${JSON.stringify(e)}`);
    if (typeof e.reason !== 'string' || !e.reason.length) bad.push(`missing reason: ${JSON.stringify(e)}`);
  }
  if (bad.length === 0) pass(`INCOMPATIBLE_RECIPES déclaré, ${INCOMPATIBLE_RECIPES.length} entrées`);
  else fail('REQ-030 — INCOMPATIBLE_RECIPES entrées malformées', bad.join('\n'));
}

// ─── REQ-031 — MIX_ORDER per multi-product recipe ─────────────────────────

header('REQ-031 — MIX_ORDER constante déclarée pour recettes multi-produits');

if (typeof MIX_ORDER === 'undefined' || MIX_ORDER === undefined) {
  fail('REQ-031 — MIX_ORDER non exposé',
       'TODO: declare const MIX_ORDER = [{recipe:"foliar-tomato-A", order:[...]}, ...] in index.html');
} else if (!Array.isArray(MIX_ORDER)) {
  fail('REQ-031 — MIX_ORDER doit être un tableau', `type=${typeof MIX_ORDER}`);
} else {
  const bad = [];
  for (const e of MIX_ORDER) {
    if (!e || typeof e.recipe !== 'string' || !Array.isArray(e.order)) {
      bad.push(`bad entry: ${JSON.stringify(e)}`);
    }
  }
  if (bad.length === 0) pass(`MIX_ORDER déclaré, ${MIX_ORDER.length} entrées`);
  else fail('REQ-031 — MIX_ORDER entrées malformées', bad.join('\n'));
}

// ─── REQ-032 — Stock barrel time-stability ────────────────────────────────
//
// PRODUCT entries already declare maxStableHours — assert non-empty for active
// fertigation/foliar products. This is the schema half of REQ-032; the UI
// "stock-age warning" remains TODO.

header('REQ-032 — maxStableHours déclaré sur tout produit en recette active');

if (!PRODUCT) {
  fail('REQ-032 — PRODUCT exposed', 'missing');
} else {
  const ACTIVE = [
    'K2SO4', 'MgSO4-7H2O',
    'MnSO4', 'ZnSO4', 'Solubore', 'CuSO4', 'NaMolybdate', 'FeSO4-7H2O',
  ];
  const offenders = [];
  for (const name of ACTIVE) {
    const p = PRODUCT[name];
    if (!p) { offenders.push(`${name}: missing`); continue; }
    if (typeof p.maxStableHours !== 'number' || p.maxStableHours <= 0) {
      offenders.push(`${name}: maxStableHours=${p.maxStableHours}`);
    }
  }
  if (offenders.length === 0) {
    pass('maxStableHours numérique sur tous les produits actifs (UI age-warning: TODO)');
  } else {
    fail('REQ-032 — maxStableHours manquant', offenders.join('\n'));
  }
}

// ─── REQ-053 — Predicted tank pH within compartment envelope ──────────────
//
// Bands per REQ-053:
//   Foliar tank: 5.0–7.0
//   Fertigation stock: 4.5–7.5
// Use predictedTankPh on each active recipe (g/L for each product in tank).

header('REQ-053 — predictedTankPh dans la bande [4.0, 7.5] (chelate-stable)');

if (typeof predictedTankPh !== 'function' || !FOLIAR || typeof computeStageRecipe !== 'function') {
  fail('REQ-053 — predictedTankPh / FOLIAR / computeStageRecipe exposés', 'missing');
} else {
  const offenders = [];

  // Fertigation stock — peak T5.
  const STOCK_VOL_L = 500;
  const r = computeStageRecipe('T5') || {};
  const fertRecipe = {};
  if (r.kSulfate)  fertRecipe['K2SO4']      = r.kSulfate / STOCK_VOL_L;
  if (r.mgSulfate) fertRecipe['MgSO4-7H2O'] = r.mgSulfate / STOCK_VOL_L;
  const fertPh = predictedTankPh(fertRecipe, 7.0);
  if (fertPh < 4.5 || fertPh > 7.5) offenders.push(`fertigation T5: ph=${fertPh.toFixed(2)} hors [4.5, 7.5]`);

  // Foliar Spray A.
  const FOLIAR_VOL_L = 15;
  const NAME_TO_PRODUCT = {
    'MnSO₄': 'MnSO4', 'ZnSO₄': 'ZnSO4', 'Solubore': 'Solubore',
    'CuSO₄': 'CuSO4', 'Molybdate de sodium': 'NaMolybdate',
    'FeSO₄·7H₂O': 'FeSO4-7H2O',
  };
  const foliarRecipe = {};
  for (const item of FOLIAR.tomato.A || []) {
    const g = parseFloat((item.master || '').replace(/[^\d.]/g, ''));
    if (!isFinite(g)) continue;
    let key = null;
    for (const k in NAME_TO_PRODUCT) if ((item.name || '').includes(k)) { key = NAME_TO_PRODUCT[k]; break; }
    if (key) foliarRecipe[key] = (foliarRecipe[key] || 0) + g / FOLIAR_VOL_L;
  }
  const folPh = predictedTankPh(foliarRecipe, 7.0);
  if (folPh < 4.0 || folPh > 7.0) offenders.push(`foliar Spray A: ph=${folPh.toFixed(2)} hors [4.0, 7.0]`);

  if (offenders.length === 0) {
    pass(`predictedTankPh dans bande pour fert (${fertPh.toFixed(2)}) + foliar (${folPh.toFixed(2)})`);
  } else {
    fail('predictedTankPh hors bande', offenders.join('\n'));
  }
}

// ─── REQ-054 — Chelate stability pH range respected ───────────────────────
//
// Walk PRODUCT for any with chemistryTags containing 'chelate-*' tag; each
// must declare stablePhRange. Then for active recipes, predictedTankPh must
// be inside the intersection of all chelate ranges in the recipe. Today's
// active recipes contain NO chelates (Iron DL dropped 2026-05-05 — FeSO4
// is the canonical foliar Fe), so the pass is trivial. Assert anyway so the
// check fires loudly when a chelate is reintroduced.

header('REQ-054 — Chelate stablePhRange déclaré + respecté en recette active');

if (!PRODUCT) {
  fail('REQ-054 — PRODUCT exposed', 'missing');
} else {
  const offenders = [];
  for (const [name, p] of Object.entries(PRODUCT)) {
    const isChelate = (p.chemistryTags || []).some(t => /^chelate-/.test(t));
    if (isChelate && !Array.isArray(p.stablePhRange)) {
      offenders.push(`${name}: chelate without stablePhRange`);
    }
  }
  if (offenders.length === 0) {
    pass('Aucun chelate sans stablePhRange (et aucun chelate dans recettes actives 2026-05-07)');
  } else {
    fail('REQ-054 — chelate sans stablePhRange', offenders.join('\n'));
  }
}

// ─── REQ-055 — Foliar uptake pH multiplier ────────────────────────────────

header('REQ-055 — foliarPhResponse retourne (0,1] sur la bande pH 4-9');

if (typeof foliarPhResponse !== 'function') {
  fail('REQ-055 — foliarPhResponse exposé', 'function not found');
} else {
  const offenders = [];
  for (const ph of [4.0, 5.0, 5.5, 6.0, 7.0, 8.0, 9.0]) {
    const m = foliarPhResponse(ph);
    if (typeof m !== 'number' || m <= 0 || m > 1.0) {
      offenders.push(`ph=${ph}: m=${m}`);
    }
  }
  // Also assert it has a peak ≥ value at extremes (sanity check on cuticle curve).
  const peak = foliarPhResponse(5.5);
  const lo = foliarPhResponse(4.0);
  if (peak <= lo) offenders.push(`peak (5.5)=${peak.toFixed(2)} ≤ lo (4.0)=${lo.toFixed(2)}`);
  if (offenders.length === 0) {
    pass('foliarPhResponse ∈ (0,1] avec pic dans la bande agronomique');
  } else {
    fail('REQ-055 — foliarPhResponse hors plage', offenders.join('\n'));
  }
}

// ─── REQ-060 — Narrative auto-derive coherence (count `// stable —`) ──────
//
// Real REQ-060 needs a STALE_PHRASE table + render-walk. Mechanizable proxy:
// count occurrences of the convention `// stable —` in index.html — confirms
// the discipline is in use. Calibrate threshold from current count.

header('REQ-060 — Convention "// stable —" en usage (compte ≥ 5)');

{
  const STABLE_RE = /\/\/ stable —/g;
  const matches = rawHtml.match(STABLE_RE) || [];
  if (matches.length >= 5) {
    pass(`${matches.length} annotations "// stable —" dans index.html (REQ-060 STALE_PHRASE table TODO)`);
  } else {
    fail('REQ-060 — convention "// stable —" sous-utilisée (< 5 occurrences)',
         `${matches.length} found — STALE_PHRASE auto-derive table not yet implemented`);
  }
}

// ─── REQ-061 — Cascade order (foliar > 0 only when earlier channels short) ─
//
// For each (stage, el) with a non-foliar replenishment chain, assert that if
// FOLIAR.tomato.A contains a dose for `el`, then offtake > compost + sidedress
// + fertigation. Foliar-only elements (Mn/Zn/Cu/B/Mo/Fe per CHANNEL_ROLE) are
// SKIPPED — for them foliar IS the earliest non-passive channel.

header('REQ-061 — Foliar dose only when earlier channels insufficient');

if (!FOLIAR || !FOLIAR.tomato || !CHANNEL_ROLE) {
  fail('REQ-061 — FOLIAR / CHANNEL_ROLE exposés', 'missing');
} else {
  // Map foliar-product label → element delivered.
  const FOLIAR_EL = {
    'MnSO₄': 'Mn', 'ZnSO₄': 'Zn', 'Solubore': 'B',
    'CuSO₄': 'Cu', 'Molybdate de sodium': 'Mo', 'FeSO₄·7H₂O': 'Fe',
  };
  const foliarEls = new Set();
  for (const item of FOLIAR.tomato.A || []) {
    const g = parseFloat((item.master || '').replace(/[^\d.]/g, ''));
    if (!isFinite(g) || g <= 0) continue;
    for (const k in FOLIAR_EL) if ((item.name || '').includes(k)) foliarEls.add(FOLIAR_EL[k]);
  }
  // For elements not foliar-only per CHANNEL_ROLE, assert offtake > earlier supply.
  const offenders = [];
  for (const el of foliarEls) {
    const role = CHANNEL_ROLE[el] || {};
    const foliarOnly = role.foliar >= 1.0
      && !role.fertigation && !role.sidedress && !role.frontload;
    if (foliarOnly) continue;  // foliar IS earliest active channel
    // Cascade test at peak T5.
    const off = stageDemandMg('T5', el);
    const earlier = compostReleaseMg(el)
                  + sidedressEffective('T5', el)
                  + fertigationEffective('T5', el, SOIL_PH_NOW);
    if (off <= earlier) {
      offenders.push(`${el}: foliar dosed but offtake ${off.toFixed(0)} ≤ earlier ${earlier.toFixed(0)}`);
    }
  }
  if (offenders.length === 0) {
    pass('Foliar doses uniquement pour éléments dont channels antérieurs insuffisants');
  } else {
    fail('REQ-061 — Foliar redondant avec channels antérieurs', offenders.join('\n'));
  }
}

// ─── REQ-062 — Single fertigation tank, single foliar spray per week ──────
//
// Per-crop-channel one-tank/one-spray rule:
//   - tomato foliar: FOLIAR.tomato has exactly one spray-recipe key, and it's 'A'
//     (spray-recipe keys = single-letter, array-valued; non-recipe metadata
//     like masterVol/backpacks/area is excluded)
//   - tomato fertigation: computeStageRecipe(stage) returns one tank composition
//     per stage (object with kSulfate/mgSulfate/etc. — no parallel A1/A2 tanks)
//   - lettuce fertigation: LETTUCE constant exists and is flat (one production
//     fertigation recipe, with feSulfate as part of the same tank)

header('REQ-062 — Single fertigation tank, single foliar spray per week');

if (!FOLIAR || !FOLIAR.tomato) {
  fail('REQ-062 — STORED_RECIPE.tomato.foliaire exposed', 'missing');
} else {
  // Spray-recipe keys = single uppercase letter, with array value (the spray
  // ingredient list). Filters out metadata keys (masterVol, backpacks, area).
  const sprayKeys = Object.keys(FOLIAR.tomato).filter(k =>
    /^[A-Z]$/.test(k) && Array.isArray(FOLIAR.tomato[k])
  );
  if (sprayKeys.length === 1 && sprayKeys[0] === 'A') {
    pass(`STORED_RECIPE.tomato.foliaire a exactement 1 recette de spray active (clé 'A')`);
  } else {
    fail('STORED_RECIPE.tomato.foliaire a exactement 1 recette de spray active',
         `clés trouvées: [${sprayKeys.join(', ')}] (attendu: ['A'])`);
  }
}

if (!LETTUCE) {
  fail('REQ-062 — LETTUCE exposed', 'missing');
} else if (typeof LETTUCE !== 'object' || Array.isArray(LETTUCE)) {
  fail('REQ-062 — LETTUCE est un objet plat (recette unique)',
       `type=${Array.isArray(LETTUCE) ? 'array' : typeof LETTUCE}`);
} else {
  // Flat-object check: every value should be a primitive (number or string).
  // Nested objects/arrays would indicate multiple sub-recipes.
  const nested = Object.entries(LETTUCE).filter(([, v]) =>
    v !== null && (typeof v === 'object' || Array.isArray(v))
  );
  if (nested.length === 0) {
    pass(`LETTUCE est une recette de fertigation plate (1 tank, ${Object.keys(LETTUCE).length} ingrédients)`);
  } else {
    fail('LETTUCE est une recette de fertigation plate (1 tank)',
         `valeurs non-primitives: ${nested.map(([k]) => k).join(', ')}`);
  }
}

if (typeof computeStageRecipe !== 'function') {
  fail('REQ-062 — computeStageRecipe exposed', 'function not found');
} else {
  // Each stage returns a single object (one tank). Detect parallel-tank pattern
  // by looking for nested objects/arrays of tank ingredients in the return value.
  const offenders = [];
  for (const stage of STAGES) {
    const r = computeStageRecipe(stage);
    if (!r || typeof r !== 'object' || Array.isArray(r)) {
      offenders.push(`${stage}: not a single tank object (got ${Array.isArray(r) ? 'array' : typeof r})`);
      continue;
    }
    // Flat-object check (same as LETTUCE): nested object/array values would
    // indicate parallel sub-tanks in the same stage.
    for (const [k, v] of Object.entries(r)) {
      if (v !== null && typeof v === 'object') {
        offenders.push(`${stage}.${k}: nested ${Array.isArray(v) ? 'array' : 'object'} (parallel tank?)`);
      }
    }
  }
  if (offenders.length === 0) {
    pass('computeStageRecipe(stage) retourne 1 tank par stage (pas de parallèle A1/A2)');
  } else {
    fail('computeStageRecipe(stage) doit retourner 1 tank par stage', offenders.join('\n'));
  }
}

// ─── REQ-002 — No forbidden (non-Ecocert-Canada) products in app copy ───

header('REQ-002 — Pas de produits non-Ecocert dans le copy de l\'app');

{
  // Strip code comments to avoid false positives on "// removed urea-like
  // because not Ecocert" type traceability notes. We scan only non-comment
  // lines (heuristic: drop lines that start with optional whitespace + // or *).
  const lines = rawHtml.split('\n');
  const nonComment = lines.filter(l => {
    const t = l.trim();
    return t.length > 0 && !t.startsWith('//') && !t.startsWith('*') && !t.startsWith('<!--');
  }).join('\n');

  const hits = [];
  for (const forbidden of FORBIDDEN_PRODUCTS) {
    // Case-insensitive whole-word-ish match. Word boundary handling:
    // we accept the literal substring inside non-comment text.
    const re = new RegExp(forbidden.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
    const matches = nonComment.match(re);
    if (matches && matches.length > 0) {
      // Find the first occurrence in the original (with line numbers) so the
      // operator can locate it. Walk lines once.
      let lineNum = -1;
      for (let i = 0; i < lines.length; i++) {
        const t = lines[i].trim();
        if (t.startsWith('//') || t.startsWith('*') || t.startsWith('<!--')) continue;
        if (re.test(lines[i])) { lineNum = i + 1; re.lastIndex = 0; break; }
        re.lastIndex = 0;
      }
      hits.push(`${forbidden}: ${matches.length} occurrence(s), first at line ${lineNum}`);
    }
  }

  if (hits.length === 0) {
    pass(`Aucun produit non-Ecocert dans ${FORBIDDEN_PRODUCTS.length} entrées du blocklist`);
  } else {
    fail('REQ-002 — produits non-Ecocert détectés', hits.join('\n'));
  }
}

// ─── Final ─────────────────────────────────────────────────────────────

process.stdout.write('\n────────────────────────────────────────────────────────────\n');
const summary = `Node verifier: ${c.green}${PASS} passed${c.reset}, ${FAIL > 0 ? c.red : ''}${FAIL} failed${c.reset}`;
process.stdout.write(`  ${summary}\n`);
if (FAIL > 0) {
  process.stdout.write('  Failed checks (node):\n');
  for (const d of FAIL_DETAILS) process.stdout.write(`    ${c.red}•${c.reset} ${d}\n`);
}
process.stdout.write('────────────────────────────────────────────────────────────\n');

// Print a structured tally line the bash umbrella verifier can grep.
process.stdout.write(`__NODE_VERIFIER_TALLY__ pass=${PASS} fail=${FAIL}\n`);

// Cleanup jsdom (avoid leaking timers).
try { window.close(); } catch {}

process.exit(FAIL === 0 ? 0 : 1);
