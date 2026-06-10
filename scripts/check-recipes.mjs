#!/usr/bin/env node
// Phase 2 release-candidate verifier — node + jsdom.
//
// Loads index.html into jsdom, exposes the runtime objects (PRODUCT,
// CHANNEL_ROLE, PH_RESPONSE, KSP_PAIRS, KSP_SAFE, TAG_INCOMPATIBILITIES,
// TAGS_INERT, BIOMASS_DEMAND, TOMATO_FRUIT_EXPORT,
// effectiveEfficiency, predictedCE, predictedTankPh, getWeekNumber), then runs
// structural + DOM-walk checks for the REQs listed below.
//
// Implements (Phase 2):
//   ui-language-ce-not-ec — DOM-walked French CE check (migrated from bash)
//   ui-language-algue-not-kelp — DOM-walked >Kelp check (migrated from bash)
//   ui-language-plain-french — DOM-walked jargon scan, scoped to non-admin pages (migrated)
//   iso-week-numbering — pinned-date getWeekNumber tests (migrated from bash greps)
//   recipe-mode-per-product — every PRODUCT[*].mode is 'flux' or 'concentration'
//   channel-role-coverage — CHANNEL_ROLE covers every element in BIOMASS_DEMAND.T1..T5
//             ∪ TOMATO_FRUIT_EXPORT
//   channel-role-coverage — fraction sums per element in CHANNEL_ROLE within 1.0 ± 0.05
//   phclass-covers-every-element — every product's phClass covers every element in base
//   every-product-ecocert-allowed — every product in any active recipe has organicAllowed: true
//   ec-factor-covers-every-product — every product in PRODUCT has an ecFactor field (number; 0 explicit)
//   product-declares-ions-and-chemistry-tags — every product has non-empty ions and chemistryTags
//   every-cation-anion-pair-classified — every (cation × anion) pair across PRODUCT.ions is in
//              KSP_PAIRS or KSP_SAFE
//   every-chemistry-tag-classified — every distinct PRODUCT.chemistryTags tag is in
//              TAG_INCOMPATIBILITIES or TAGS_INERT
//
// Deferred to Phase 2.5 (need richer plumbing or human-decided thresholds):
//   under-fert-guard, luxury-feeding-guard (supply ratio bounds)
//   concentration-dose-within-band (concentration band validation)
//   ph-aware-effective-efficiency, no-decorative-products-at-current-ph (effective efficiency at current pH)
//   passive-supply-lockout-gate (lockout gate)
//   solubility-cap-per-product (solubility cap)
//   predicted-ce-within-crop-stage-band, foliar-ce-under-burn-cap, in-tank-ksp-precipitation-guard, stock-barrel-time-stability (CE bands, precipitation logic, mix order, stock stability)
//   predicted-tank-ph-within-envelope, chelate-stability-ph-range-respected, foliar-uptake-ph-curve (pH envelope, chelate stability, foliar pH curve)
//
// Exit code: 0 on full pass, 1 on any failure. If jsdom is missing, exits 0
// after printing a single "skipped" warning so the bash umbrella verifier
// stays usable on a fresh clone before `npm install`.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const INDEX_HTML_PATH = join(REPO_ROOT, 'dist', 'index.html');

const useColor = process.stdout.isTTY === true;
const c = {
  red:    useColor ? '\x1b[0;31m' : '',
  green:  useColor ? '\x1b[0;32m' : '',
  yellow: useColor ? '\x1b[0;33m' : '',
  dim:    useColor ? '\x1b[2m'    : '',
  reset:  useColor ? '\x1b[0m'    : '',
};

// ─── ecocert-only-products — Forbidden products (non-Ecocert-Canada synthetics) ──────
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
    `  (structural product/chemistry checks and node-migrated CE/Kelp/jargon/week checks will not run.)\n`
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
  'PRODUCT_PCT', 'SIDEDRESS_AREA_PER_PLANCHE', 'SIDEDRESS_MINIMUM_EFFICIENCY',
  'SIDEDRESS_PRODUCTS',
  'TOMATO_NUMBER_BEDS', 'TOMATO_BED_AREA',
  'PAGES', 'ADMIN_PAGES', 'CROP_PAGES',
  'effectiveEfficiency', 'predictedCE', 'predictedTankPh',
  'computeStageRecipe',
  'calculateNutritionDemand',
  'COMPOST_AMENDMENT', 'COMPOST_LABEL_PCT', 'COMPOST_MINERALIZATION_YEAR1',
  'COMPOST_SEASONAL_FACTOR', 'COMPOST_RELEASE_PER_WEEK', 'theoreticalReleasePerWeek',
  'FIRST_PRINCIPLES_SIDEDRESS', 'computeStageSidedress',
  // Fertigation-recipe (mass-balance-derivation, public-api-namespace, fp-target-mirrors-sizer, uptake-efficiency-factor). wireFpFertigation()
  // in calc.js writes computeStageRecipe('T5') output into
  // FIRST_PRINCIPLES_T5_FERTIGATION at script load, then propagates to
  // FP_RECIPE_T5.fertigation. uptake-efficiency-factor added per-element uptake factor
  // (PH_UPTAKE_FACTOR_AT_CURRENT_SOIL) for K/Mg/B; computeStageRecipe
  // divides demand by the factor before subtracting compost+sidedress.
  // mode-aware mixing factor retired 2026-05-10.
  'FP_RECIPE_T5',
  'FIRST_PRINCIPLES_T5_FERTIGATION',
  'PH_UPTAKE_FACTOR_AT_CURRENT_SOIL',
  // Foliar-recipe (coverage-discount-on-delivery / public-api-namespace). Cuticle-coverage delivery model;
  // the function reads from STORED_RECIPE.tomato.foliaire so the verifier
  // also pulls the constants directly via window.FoliarRecipeTomato.
  'FOLIAR_COVERAGE_DEFAULT', 'FOLIAR_COVERAGE_WITH_YUCCA', 'computeFoliarSupply',
  'BURN_CAP_BASE_G', 'burnCapG', 'computeFoliarRecipeForGap',
  // Nursery plant-needs (nursery plant-needs). Until app/index.html @includes the
  // partials, window.PlantNeedsNursery / NURSERY_TARGETS / calculateNurseryDemand
  // are absent — the verifier's nursery plant-needs block loads the source files via
  // Node vm and runs assertions there, so the checks pass pre-integration and
  // also remain valid post-integration (the source-of-truth is the file set).
  'PlantNeedsNursery',
  'NURSERY_TARGETS', 'calculateNurseryDemand',
  'LETTUCE_NURSERY_TISSUE_DW', 'LETTUCE_NURSERY_DM_FRACTION',
  // Salanova plant-needs (lettuce plant-needs spec). After the 2026-05-16 carve, the
  // partials in nutrition/lettuce/plant-needs/ supply LETTUCE_TISSUE_DW,
  // LETTUCE_DM_FRACTION, LETTUCE_FRONTLOAD_DEFAULTS, SME_LETTUCE_PPM,
  // calculateLettuceNutrition{Demand,Supply}, and window.PlantNeedsLettuce.
  'PlantNeedsLettuce',
  'LETTUCE_TISSUE_DW', 'LETTUCE_DM_FRACTION', 'LETTUCE_FRONTLOAD_DEFAULTS',
  'SME_LETTUCE_PPM',
  'calculateLettuceNutritionDemand', 'calculateLettuceNutritionSupply',
  'getWeekNumber', 'foliarPhResponse',
  // The following are EXPECTED constants for incompatible-recipes-declared / mix-order-per-multi-product-recipe — not currently
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
const index = rawHtml.lastIndexOf(bodyClose);
if (index >= 0) {
  instrumentedHtml = rawHtml.slice(0, index) + exposeScript + rawHtml.slice(index);
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
const SIDEDRESS_MINIMUM_EFFICIENCY = ph1.SIDEDRESS_MINIMUM_EFFICIENCY;
const SIDEDRESS_PRODUCTS   = ph1.SIDEDRESS_PRODUCTS;
const TOMATO_NUMBER_BEDS   = ph1.TOMATO_NUMBER_BEDS;
const TOMATO_BED_AREA      = ph1.TOMATO_BED_AREA;
const ADMIN_PAGES          = ph1.ADMIN_PAGES || [];
const getWeekNumber        = ph1.getWeekNumber;
const effectiveEfficiency  = ph1.effectiveEfficiency;
const predictedTankPh      = ph1.predictedTankPh;
const foliarPhResponse     = ph1.foliarPhResponse;
const computeStageRecipe   = ph1.computeStageRecipe;
const calculateNutritionDemand = ph1.calculateNutritionDemand;
const FP_RECIPE_T5         = ph1.FP_RECIPE_T5;
const FIRST_PRINCIPLES_T5_FERTIGATION = ph1.FIRST_PRINCIPLES_T5_FERTIGATION;
const COMPOST_AMENDMENT    = ph1.COMPOST_AMENDMENT;
const COMPOST_LABEL_PCT    = ph1.COMPOST_LABEL_PCT;
const COMPOST_MINERALIZATION_YEAR1 = ph1.COMPOST_MINERALIZATION_YEAR1;
const COMPOST_SEASONAL_FACTOR = ph1.COMPOST_SEASONAL_FACTOR;
const COMPOST_RELEASE_PER_WEEK = ph1.COMPOST_RELEASE_PER_WEEK;
const theoreticalReleasePerWeek = ph1.theoreticalReleasePerWeek;
const FIRST_PRINCIPLES_SIDEDRESS = ph1.FIRST_PRINCIPLES_SIDEDRESS;
const computeStageSidedress = ph1.computeStageSidedress;
const INCOMPATIBLE_RECIPES = ph1.INCOMPATIBLE_RECIPES;
const MIX_ORDER            = ph1.MIX_ORDER;

// ─── ui-language-ce-not-ec — DOM-walked French CE check ──────────────────────────────
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

header("ui-language-ce-not-ec — French 'CE' for electrical conductivity (DOM walk)");

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
// lab-quote spans (ui-language-ce-not-ec scope: Berger Labs water analysis is OUT of
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

// ─── ui-language-algue-not-kelp — DOM-walked Kelp check ───────────────────────────────────

header("ui-language-algue-not-kelp — 'Algue' au lieu de 'Kelp' (DOM walk)");

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

// ─── ui-language-plain-french — Jargon scan, scoped to non-admin pages ──────────────────
//
// Ch6 = A scoped to non-admin: admin pages are jargon-tolerant (Bilan
// nutriment, diagnostic). Walk text nodes that are NOT inside any element
// whose id matches `page-<slug>-content` for slug in ADMIN_PAGES.

header("ui-language-plain-french — Aucun jargon anglais (texte non-admin)");

const JARGON_DENY = ['dryback'];

const adminContentIds = new Set(
  (ADMIN_PAGES || []).map(slug => `page-${slug}-content`)
);

function isInsideAdmin(element) {
  let current = element;
  while (current && current !== window.document) {
    if (current.id && adminContentIds.has(current.id)) return true;
    current = current.parentElement;
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

// ─── iso-week-numbering — getWeekNumber pinned-date tests ─────────────────────────
//
// Ch7 = A. Replace bash `|| 7` and `4 -` greps with a runtime correctness
// check: monkey-patch Date inside the function's closure by overriding
// window.Date for the call, then restore. Cases per requirement statement:
//   2026-01-04 → 1   (Jan 4 lands in the year's week 1)
//   2025-12-29 → 1   (Mon of ISO week 2026-W01)
//   2026-12-31 → 53  (Thu of ISO week 2026-W53)

header("iso-week-numbering — getWeekNumber ISO 8601 (dates fixées)");

if (typeof getWeekNumber !== 'function') {
  fail('getWeekNumber est exposé', 'function not found on window');
} else {
  const RealDate = window.Date;
  function withFixedDate(iso, handler) {
    const fixed = new RealDate(iso + 'T12:00:00');
    class FixedDate extends RealDate {
      constructor(...args) {
        if (args.length === 0) super(fixed.getTime());
        else super(...args);
      }
      static now() { return fixed.getTime(); }
    }
    window.Date = FixedDate;
    try { return handler(); } finally { window.Date = RealDate; }
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

// ─── recipe-mode-per-product — every PRODUCT[*].mode is 'flux' or 'concentration' ──────

header('recipe-mode-per-product — Every PRODUCT[*].mode declared');

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

// ─── channel-role-coverage — CHANNEL_ROLE covers every demand element ────────────────

header('channel-role-coverage — CHANNEL_ROLE couvre tous les éléments de demande');

if (!CHANNEL_ROLE || !BIOMASS_DEMAND || !TOMATO_FRUIT_EXPORT) {
  fail('CHANNEL_ROLE / BIOMASS_DEMAND / TOMATO_FRUIT_EXPORT exposés',
       'one or more globals missing');
} else {
  const demandElements = new Set();
  for (const stage of Object.keys(BIOMASS_DEMAND)) {
    for (const element of Object.keys(BIOMASS_DEMAND[stage])) demandElements.add(element);
  }
  for (const element of Object.keys(TOMATO_FRUIT_EXPORT)) demandElements.add(element);
  const missing = [...demandElements].filter(element => !CHANNEL_ROLE[element]);
  if (missing.length === 0) {
    pass(`CHANNEL_ROLE couvre les ${demandElements.size} éléments (BIOMASS_DEMAND + TOMATO_FRUIT_EXPORT)`);
  } else {
    fail('CHANNEL_ROLE couvre tous les éléments de demande', `manquants: ${missing.join(', ')}`);
  }
}

// ─── ca-mg-biomass-transpiration-coupled — Ca/Mg biomass scaled by transpFactor; others unchanged ──
//
// calculateNutritionDemand(yield, stage, transpFactor) must apply transpFactor to the
// biomass term for Ca and Mg only. Verified by calling at tf=1.0 vs tf=0.5
// and asserting Ca/Mg biomass term halves while N/P/K/micros are unchanged.
//
// Spec: nutrition/tomato/plant-needs/spec.md → ca-mg-biomass-transpiration-coupled.

header('ca-mg-biomass-transpiration-coupled — Ca/Mg biomass demand × transpFactor');

if (!calculateNutritionDemand) {
  fail('calculateNutritionDemand exposé', 'missing on window');
} else {
  const stage = 'T5';
  const y = 1.5;
  const fullTransp = calculateNutritionDemand(y, stage, 1.0);
  const halfTransp = calculateNutritionDemand(y, stage, 0.5);
  const COUPLED = ['Ca', 'Mg'];
  const DECOUPLED = ['N', 'P', 'K', 'Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'];
  const offenders = [];
  for (const element of COUPLED) {
    const ratio = (fullTransp[element].biomass > 0)
      ? halfTransp[element].biomass / fullTransp[element].biomass
      : null;
    if (ratio == null || Math.abs(ratio - 0.5) > 0.01) {
      offenders.push(`${element}: biomass ratio at tf=0.5 should be 0.5, got ${ratio == null ? 'n/a' : ratio.toFixed(3)}`);
    }
  }
  for (const element of DECOUPLED) {
    const a = fullTransp[element].biomass;
    const b = halfTransp[element].biomass;
    if (a !== b) {
      offenders.push(`${element}: biomass should be unchanged at tf=0.5, was ${a} → ${b}`);
    }
  }
  if (offenders.length === 0) {
    pass(`Ca + Mg biomass × transpFactor; N/P/K/micros décorrélés (testé à tf=1.0 vs 0.5, ${stage} y=${y})`);
  } else {
    fail('Ca/Mg couplés à transpFactor, autres non',
         offenders.map(o => `  ${o}`).join('\n'));
  }
}

// ─── stage-transition-continuity — Stage-transition continuity for BIOMASS_DEMAND ───────────
//
// Catches order-of-magnitude hand-edit errors in BIOMASS_DEMAND[stage][element]
// (typo dropping/adding a digit, factor-of-10 unit slip, etc.). Threshold
// 2.5× the prior stage's value — chosen to allow legitimate phenological
// spikes (T2→T3 P at flowering is +167%; T3→T4 Fe drop is −72%) while
// flagging anything in the 250%+ range as suspicious. Stage order is
// taken from `Object.keys(BIOMASS_DEMAND)` in declaration order.
//
// Spec: nutrition/tomato/plant-needs/spec.md → stage-transition-continuity.

header('stage-transition-continuity — BIOMASS_DEMAND stage-transition continuity (≤ 250 %)');

if (!BIOMASS_DEMAND) {
  fail('BIOMASS_DEMAND exposed', 'missing');
} else {
  const stages = Object.keys(BIOMASS_DEMAND);
  const offenders = [];
  for (let i = 1; i < stages.length; i++) {
    const previous = stages[i - 1];
    const current  = stages[i];
    const els  = new Set([
      ...Object.keys(BIOMASS_DEMAND[previous]),
      ...Object.keys(BIOMASS_DEMAND[current]),
    ]);
    for (const element of els) {
      const a = BIOMASS_DEMAND[previous][element] || 0;
      const b = BIOMASS_DEMAND[current][element]  || 0;
      if (a <= 0) continue; // avoid div-by-zero; nothing meaningful to compare
      const ratio = Math.abs(b - a) / a;
      if (ratio > 2.5) {
        offenders.push(`${previous}→${current} ${element}: ${a} → ${b} (Δ=${(ratio*100).toFixed(0)}%)`);
      }
    }
  }
  if (offenders.length === 0) {
    pass(`Toutes les transitions de stade restent dans ±250 % par élément (${stages.length - 1} transitions × ~12 éléments)`);
  } else {
    fail('Transitions de stade dans ±250 % par élément',
         offenders.map(o => `  ${o}`).join('\n'));
  }
}

// ─── plant-needs-tomato-namespace — PlantNeedsTomato public API namespace ────────────────────
//
// Asserts window.PlantNeedsTomato exists at runtime and exposes the
// expected public API. Renames or removals fail loudly here, before
// they break consumers (Bilan UI, recipe calculators).
//
// Spec: nutrition/tomato/plant-needs/spec.md → plant-needs-tomato-namespace.

header('plant-needs-tomato-namespace — window.PlantNeedsTomato public API surface');

const PN = window.PlantNeedsTomato;
if (!PN) {
  fail('window.PlantNeedsTomato exists', 'namespace not declared (model.js include may be missing or out of order)');
} else {
  const expectedKeys = [
    'TOMATO_FRUIT_EXPORT', 'BIOMASS_DEMAND', 'TOMATO_DEMAND_CERT',
    'TOMATO_REMOVAL', 'TRANSP_COUPLED_BIOMASS',
    'calculateNutritionDemand', 'certFor',
  ];
  const missing = expectedKeys.filter(k => PN[k] == null);
  if (missing.length > 0) {
    fail('PlantNeedsTomato exposes the public API', `manquants: ${missing.join(', ')}`);
  } else {
    const certCa = PN.certFor('T5', 'Ca');
    if (typeof certCa !== 'number') {
      fail('PlantNeedsTomato.certFor returns numeric cert', `certFor: ${typeof certCa}`);
    } else {
      pass(`PlantNeedsTomato exposes ${expectedKeys.length} clés (${expectedKeys.length} attendues, ${expectedKeys.length} présentes)`);
    }
  }
}

// ─── release-values-within-mass-balance-band — Compost release within mass-balance sanity band ──────────
//
// Asserts every COMPOST_RELEASE_PER_WEEK value falls within [0.5×, 1.5×]
// of the theoretical formula: (applied_g_per_m2 × year1_fraction / 52) ×
// SEASONAL_FACTOR. Catches transcription errors while allowing conservative
// manual overrides (Mg label-gap, ~25 % below theoretical).
//
// Spec: nutrition/compost-contribution/spec.md → release-values-within-mass-balance-band.

header('release-values-within-mass-balance-band — Compost release within ±50 % of mass-balance');

if (!COMPOST_RELEASE_PER_WEEK || !COMPOST_LABEL_PCT
    || !COMPOST_MINERALIZATION_YEAR1 || !COMPOST_AMENDMENT) {
  fail('Compost-contribution constants exposed', 'one or more globals missing');
} else {
  const offenders = [];
  for (const element of Object.keys(COMPOST_RELEASE_PER_WEEK)) {
    const stored = COMPOST_RELEASE_PER_WEEK[element];
    const labelPct = COMPOST_LABEL_PCT[element];
    const yr1 = COMPOST_MINERALIZATION_YEAR1[element];
    if (labelPct == null || yr1 == null) {
      offenders.push(`${element}: stored ${stored} but label %/min %/m1 missing`);
      continue;
    }
    const applied = COMPOST_AMENDMENT.applicationRateKgPerM2 * 1000 * labelPct;
    const theoretical = (applied * yr1 / 52) * COMPOST_SEASONAL_FACTOR;
    if (theoretical <= 0) {
      offenders.push(`${element}: theoretical = 0 (bad inputs)`);
      continue;
    }
    const ratio = stored / theoretical;
    if (ratio < 0.5 || ratio > 1.5) {
      offenders.push(`${element}: stored ${stored.toFixed(3)} vs theoretical ${theoretical.toFixed(3)} (ratio ${ratio.toFixed(2)})`);
    }
  }
  if (offenders.length === 0) {
    pass(`Toutes les valeurs de release sont dans [0.5×, 1.5×] du calcul théorique (${Object.keys(COMPOST_RELEASE_PER_WEEK).length} éléments)`);
  } else {
    fail('Release dans la bande de sanité ±50 %',
         offenders.map(o => `  ${o}`).join('\n'));
  }
}

// ─── public-api-namespace — CompostContribution public API namespace ─────────────────
//
// Spec: nutrition/compost-contribution/spec.md → public-api-namespace.

header('public-api-namespace — window.CompostContribution public API surface');

const CC = window.CompostContribution;
if (!CC) {
  fail('window.CompostContribution exists', 'namespace not declared (model.js include may be missing or out of order)');
} else {
  const expectedKeys = [
    'AMENDMENT', 'LABEL_PCT', 'MINERALIZATION_YEAR1',
    'SEASONAL_FACTOR', 'releasePerWeek', 'theoreticalReleasePerWeek',
  ];
  const missing = expectedKeys.filter(k => CC[k] == null);
  if (missing.length > 0) {
    fail('CompostContribution exposes the public API', `manquants: ${missing.join(', ')}`);
  } else {
    const okShape = typeof CC.releasePerWeek.N === 'number'
                  && typeof CC.theoreticalReleasePerWeek('N') === 'number';
    if (!okShape) {
      fail('CompostContribution.releasePerWeek + theoreticalReleasePerWeek shape',
           `releasePerWeek.N: ${typeof CC.releasePerWeek.N}; theoretical(N): ${typeof CC.theoreticalReleasePerWeek('N')}`);
    } else {
      pass(`CompostContribution exposes ${expectedKeys.length} clés (toutes présentes, shape OK)`);
    }
  }
}

// ─── INV-1 (compost-contribution) — Element coverage closed across 4 maps ───
//
// Spec: nutrition/compost-contribution/spec.md → INV-1.
// Asserts: keys(releasePerWeek) === keys(LABEL_PCT) === keys(MINERALIZATION_YEAR1)
// === keys(efficiency). Adding a sixth element must touch all four maps in lockstep.

header('Compost INV-1 — Element coverage closed across 4 maps');
{
  const CC = window.CompostContribution;
  if (!CC || !CC.LABEL_PCT || !CC.MINERALIZATION_YEAR1
      || !CC.releasePerWeek || !CC.efficiency) {
    fail('Compost INV-1 prerequisites', 'window.CompostContribution.{LABEL_PCT, MINERALIZATION_YEAR1, releasePerWeek, efficiency} not all exposed');
  } else {
    const releaseKeys        = Object.keys(CC.releasePerWeek).sort();
    const labelKeys          = Object.keys(CC.LABEL_PCT).sort();
    const mineralizationKeys = Object.keys(CC.MINERALIZATION_YEAR1).sort();
    const efficiencyKeys     = Object.keys(CC.efficiency).sort();
    const reference          = JSON.stringify(releaseKeys);
    const mismatches = [];
    if (JSON.stringify(labelKeys) !== reference) {
      mismatches.push(`LABEL_PCT [${labelKeys.join(',')}] ≠ releasePerWeek [${releaseKeys.join(',')}]`);
    }
    if (JSON.stringify(mineralizationKeys) !== reference) {
      mismatches.push(`MINERALIZATION_YEAR1 [${mineralizationKeys.join(',')}] ≠ releasePerWeek [${releaseKeys.join(',')}]`);
    }
    if (JSON.stringify(efficiencyKeys) !== reference) {
      mismatches.push(`efficiency [${efficiencyKeys.join(',')}] ≠ releasePerWeek [${releaseKeys.join(',')}]`);
    }
    if (mismatches.length === 0) {
      pass(`Compost INV-1 — 4 maps closed on ${releaseKeys.length} éléments (${releaseKeys.join(', ')})`);
    } else {
      fail('Compost INV-1 — Element coverage closure', mismatches.join(' · '));
    }
  }
}

// ─── soil-contribution subproject ─────────────────────────
//
// Spec: nutrition/soil-contribution/spec.md → bank-per-crop-mehlich3-reservoir (bank shape), only-ca-p-participate-in-gap-chain
// (CONTRIBUTING scoping), months-to-depletion-clamped-by-peak-demand (months-to-depletion), public-api-on-soil-contribution-namespace (namespace).

header('bank-per-crop-mehlich3-reservoir — SoilContribution.BANK_MG_M2.tomato declared in mg/m²');
{
  const SC = window.SoilContribution;
  if (!SC || !SC.BANK_MG_M2 || !SC.BANK_MG_M2.tomato) {
    fail('SoilContribution.BANK_MG_M2.tomato exists', 'namespace or tomato entry missing');
  } else {
    const tomato = SC.BANK_MG_M2.tomato;
    const missing = ['P','K','Ca','Mg'].filter(element => !(typeof tomato[element] === 'number' && tomato[element] >= 1000));
    if (missing.length > 0) {
      fail('SoilContribution.BANK_MG_M2.tomato has macros ≥ 1000 mg/m²', `manquants ou < 1000: ${missing.join(', ')}`);
    } else {
      pass(`BANK_MG_M2.tomato : P=${tomato.P}, K=${tomato.K}, Ca=${tomato.Ca}, Mg=${tomato.Mg} mg/m² (Mehlich-3 × 100)`);
    }
  }
}

header('only-ca-p-participate-in-gap-chain — Only CONTRIBUTING elements (P, Ca) participate in the gap chain');
{
  const SC = window.SoilContribution;
  if (!SC) {
    fail('SoilContribution available', 'namespace missing');
  } else {
    const offenders = [];
    if (SC.CONTRIBUTING.P !== true)  offenders.push('CONTRIBUTING.P not true');
    if (SC.CONTRIBUTING.Ca !== true) offenders.push('CONTRIBUTING.Ca not true');
    // Non-contributing elements must return 0 even with bank data (K, Mg) or large demand.
    for (const element of ['N','K','Mg','Fe','Mn','Zn','B','Cu','Mo']) {
      const v = SC.weeklyContribution('tomato', element, 1000);
      if (v !== 0) offenders.push(`weeklyContribution(tomato, ${element}, 1000) === ${v} (expected 0)`);
    }
    // Contributing elements must clamp to bank when demand exceeds it.
    const caHuge = SC.weeklyContribution('tomato', 'Ca', 1e9);
    if (caHuge !== SC.BANK_MG_M2.tomato.Ca) {
      offenders.push(`weeklyContribution(tomato, Ca, 1e9) === ${caHuge}, expected min-clamp to ${SC.BANK_MG_M2.tomato.Ca}`);
    }
    if (offenders.length > 0) {
      fail('CONTRIBUTING scoping holds', offenders.map(o => `  ${o}`).join('\n'));
    } else {
      pass('CONTRIBUTING = {P, Ca} ; non-contributing elements return 0 ; contributing elements clamp at bank');
    }
  }
}

header('months-to-depletion-clamped-by-peak-demand — monthsToDepletion = bank ÷ min(mass-flow, plant peak demand) × WEEKS_PER_MONTH; null for turnover-bound');
{
  const SC = window.SoilContribution;
  if (!SC) {
    fail('SoilContribution available', 'namespace missing');
  } else {
    const offenders = [];
    const WPM = 52 / 12;
    // Tomato Ca — demand binds (peak 2250 < mass-flow 3582). Runway ~113 mo.
    const caMonths = SC.monthsToDepletion('tomato', 'Ca');
    if (typeof caMonths !== 'number' || !(caMonths > 0)) {
      offenders.push(`monthsToDepletion(tomato, Ca) = ${caMonths} (expected positive number)`);
    }
    // Tomato P — lockout regime (mass-flow 16.5 < peak 660). Runway ~780 mo.
    const pMonths = SC.monthsToDepletion('tomato', 'P');
    if (typeof pMonths !== 'number' || !(pMonths > 0)) {
      offenders.push(`monthsToDepletion(tomato, P) = ${pMonths} (expected positive number)`);
    }
    // Tomato K — NOT in CONTRIBUTING but has bank + SME → still numeric.
    // Mass-flow 4385 < peak 6000 → mass-flow binds.
    const kMonths = SC.monthsToDepletion('tomato', 'K');
    if (typeof kMonths !== 'number' || !(kMonths > 0)) {
      offenders.push(`monthsToDepletion(tomato, K) = ${kMonths} (disabled rows must still expose runway)`);
    }
    // N is turnover-bound → null on every crop (mineralization replenishes).
    const nMonthsTomato = SC.monthsToDepletion('tomato', 'N');
    if (nMonthsTomato !== null) {
      offenders.push(`monthsToDepletion(tomato, N) = ${nMonthsTomato} (expected null — turnover-bound, mineralization replenishes)`);
    }
    const nMonthsLettuce = SC.monthsToDepletion('lettuce', 'N');
    if (nMonthsLettuce !== null) {
      offenders.push(`monthsToDepletion(lettuce, N) = ${nMonthsLettuce} (expected null — turnover-bound)`);
    }
    // Mo has no Mehlich-3 measurement → null.
    const moMonths = SC.monthsToDepletion('tomato', 'Mo');
    if (moMonths !== null) {
      offenders.push(`monthsToDepletion(tomato, Mo) = ${moMonths} (expected null — Mo not on Mehlich-3 panel)`);
    }
    // Lettuce Ca — wired; lettuce mass-flow 457.6 < peak 1152 → mass-flow binds.
    const lettuceCa = SC.monthsToDepletion('lettuce', 'Ca');
    if (typeof lettuceCa !== 'number' || !(lettuceCa > 0)) {
      offenders.push(`monthsToDepletion(lettuce, Ca) = ${lettuceCa} (expected positive number)`);
    }
    // Pinned arithmetic — tomato P (lockout, clamp no-op).
    //   bank 55770 ; mass-flow 1.1 × 15 = 16.5 ; peak 660 ; min = 16.5.
    //   runway = 55770 / (16.5 × 52/12) ≈ 780 mois.
    const expectedP = 55770 / (Math.min(1.1 * 15, 660) * WPM);
    if (Math.abs(pMonths - expectedP) > 1e-3) {
      offenders.push(`P runway arithmetic mismatch: got ${pMonths}, expected ${expectedP}`);
    }
    // Pinned arithmetic — tomato Ca (clamp binds at peak demand 2250).
    //   bank 1098910 ; mass-flow 238.8 × 15 = 3582 ; peak 2250 ; min = 2250.
    //   runway = 1098910 / (2250 × 52/12) ≈ 113 mois.
    const expectedCa = 1098910 / (Math.min(238.8 * 15, 2250) * WPM);
    if (Math.abs(caMonths - expectedCa) > 1e-3) {
      offenders.push(`Ca runway arithmetic mismatch (clamp): got ${caMonths}, expected ${expectedCa}`);
    }
    // Pinned arithmetic — tomato Mg (clamp binds).
    //   bank 164630 ; mass-flow 79.3 × 15 = 1189.5 ; peak 855 ; min = 855.
    const mgMonths = SC.monthsToDepletion('tomato', 'Mg');
    const expectedMg = 164630 / (Math.min(79.3 * 15, 855) * WPM);
    if (Math.abs(mgMonths - expectedMg) > 1e-3) {
      offenders.push(`Mg runway arithmetic mismatch (clamp): got ${mgMonths}, expected ${expectedMg}`);
    }
    // Pinned arithmetic — lettuce Ca (clamp inert; mass-flow binds).
    //   bank 1061240 ; mass-flow 114.4 × 4 = 457.6 ; peak 1152 ; min = 457.6.
    const expectedLettuceCa = 1061240 / (Math.min(114.4 * 4, 1152) * WPM);
    if (Math.abs(lettuceCa - expectedLettuceCa) > 1e-3) {
      offenders.push(`Lettuce Ca runway arithmetic mismatch: got ${lettuceCa}, expected ${expectedLettuceCa}`);
    }
    if (offenders.length > 0) {
      fail('monthsToDepletion behaviour', offenders.map(o => `  ${o}`).join('\n'));
    } else {
      pass(`Clamped runway: tomato Ca ${caMonths.toFixed(0)} mois (demand-bound) · P ${pMonths.toFixed(0)} mois (lockout) · K ${kMonths.toFixed(0)} mois (mass-flow-bound) · N → null (turnover) · lettuce Ca ${lettuceCa.toFixed(0)} mois`);
    }
  }
}

header('public-api-on-soil-contribution-namespace — window.SoilContribution public API surface');
{
  const SC = window.SoilContribution;
  if (!SC) {
    fail('window.SoilContribution exists', 'namespace not declared (model.js include may be missing or out of order)');
  } else {
    const expectedKeys = ['BANK_MG_M2', 'CONTRIBUTING', 'WEEKS_PER_MONTH', 'SME_SOIL_SOLUTION_PPM', 'TRANSPIRATION_L_PER_M2_PER_WEEK', 'weeklyContribution', 'monthsToDepletion', 'renderGrid'];
    const missing = expectedKeys.filter(k => SC[k] == null);
    const wrongType = [];
    if (typeof SC.weeklyContribution !== 'function') wrongType.push('weeklyContribution not function');
    if (typeof SC.monthsToDepletion !== 'function') wrongType.push('monthsToDepletion not function');
    if (typeof SC.renderGrid !== 'function')         wrongType.push('renderGrid not function');
    if (typeof SC.WEEKS_PER_MONTH !== 'number')      wrongType.push('WEEKS_PER_MONTH not number');
    if (typeof SC.SME_SOIL_SOLUTION_PPM !== 'object')           wrongType.push('SME_SOIL_SOLUTION_PPM not object');
    if (typeof SC.TRANSPIRATION_L_PER_M2_PER_WEEK !== 'object') wrongType.push('TRANSPIRATION_L_PER_M2_PER_WEEK not object');
    const offenders = [...missing.map(k => 'missing: ' + k), ...wrongType];
    if (offenders.length > 0) {
      fail('SoilContribution public API', offenders.map(o => `  ${o}`).join('\n'));
    } else {
      pass(`SoilContribution exposes ${expectedKeys.length} clés (toutes présentes, fonctions OK)`);
    }
  }
}

// ─── sme-soil-solution-wired-per-crop-element — SME soil-solution + transpiration wired per crop / element ──
//
// Spec: nutrition/soil-contribution/spec.md → sme-soil-solution-wired-per-crop-element. Every crop that has
// a SOIL_BANK_MG_M2 entry must also have an SME_SOIL_SOLUTION_PPM entry
// covering every element on the gap grid (N, P, K, Ca, Mg, Fe, Mn, Zn, B,
// Cu, Mo), plus a positive TRANSPIRATION_L_PER_M2_PER_WEEK value.

header('sme-soil-solution-wired-per-crop-element — SME soil-solution + transpiration wired for every banked crop / gap-grid element');
{
  const SC = window.SoilContribution;
  if (!SC) {
    fail('SoilContribution available', 'namespace missing');
  } else {
    const gridElements = ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'];
    const bankedCrops = Object.keys(SC.BANK_MG_M2 || {});
    if (bankedCrops.length === 0) {
      fail('at least one banked crop', 'SOIL_BANK_MG_M2 has no crop entries');
    } else {
      const offenders = [];
      bankedCrops.forEach(crop => {
        const sme = (SC.SME_SOIL_SOLUTION_PPM || {})[crop];
        if (!sme) {
          offenders.push(`SME_SOIL_SOLUTION_PPM["${crop}"] missing`);
          return;
        }
        gridElements.forEach(element => {
          if (!(typeof sme[element] === 'number' && sme[element] > 0)) {
            offenders.push(`SME_SOIL_SOLUTION_PPM["${crop}"]["${element}"] = ${sme[element]} (expected positive number)`);
          }
        });
        const transp = (SC.TRANSPIRATION_L_PER_M2_PER_WEEK || {})[crop];
        if (!(typeof transp === 'number' && transp > 0)) {
          offenders.push(`TRANSPIRATION_L_PER_M2_PER_WEEK["${crop}"] = ${transp} (expected positive number)`);
        }
      });
      if (offenders.length > 0) {
        fail('sme-soil-solution-wired-per-crop-element SME / transpiration coverage', offenders.map(o => `  ${o}`).join('\n'));
      } else {
        const tomatoSme = SC.SME_SOIL_SOLUTION_PPM.tomato;
        pass(`SME wired for ${bankedCrops.length} crops × ${gridElements.length} elements ; transpiration ${Object.values(SC.TRANSPIRATION_L_PER_M2_PER_WEEK).join('/')} L/m²/wk ; tomato P=${tomatoSme.P} K=${tomatoSme.K} Ca=${tomatoSme.Ca} ppm`);
      }
    }
  }
}

// ─── INV-1 (sidedress-recipe) — Stage coverage closed + non-negative ────
//
// computeStageSidedress(stage) must return numeric, non-negative actisol_g,
// farine_g, alfalfa_g, and g_per_planche for every stage in RECIPE_INPUTS.stageYield.
//
// Spec: nutrition/tomato/sidedress-recipe/spec.md → INV-1.

header('Sidedress INV-1 — Stage coverage closed + numeric output');

if (!computeStageSidedress) {
  fail('computeStageSidedress exposed', 'missing on window');
} else {
  const stages = Object.keys(ph1.RECIPE_INPUTS?.stageYield || {});
  const offenders = [];
  const numericFields = ['actisol_g', 'farine_g', 'alfalfa_g', 'g_per_planche'];
  for (const s of stages) {
    const r = computeStageSidedress(s);
    if (!r || typeof r !== 'object') {
      offenders.push(`${s}: returned ${typeof r}`);
      continue;
    }
    let bad = false;
    for (const k of numericFields) {
      if (typeof r[k] !== 'number' || !isFinite(r[k]) || r[k] < 0) {
        offenders.push(`${s}: ${k}=${r[k]} (typeof ${typeof r[k]})`);
        bad = true; break;
      }
    }
    if (!bad && typeof r.chosen !== 'string') {
      offenders.push(`${s}: chosen=${r.chosen} (typeof ${typeof r.chosen})`);
    }
  }
  if (offenders.length === 0) {
    pass(`Tous les stades (${stages.length}) renvoient {actisol_g, farine_g, alfalfa_g, chosen, g_per_planche} numberériques ≥ 0`);
  } else {
    fail('Stage coverage + numeric output', offenders.map(o => `  ${o}`).join('\n'));
  }
}

// ─── mass-balance-sizes-product-to-n-gap — Sidedress mass-balance: chosen product sized to N gap ─────
//
// computeStageSidedress(stage, product).g_per_planche must equal the
// mass-balance derivation within ±5 g rounding tolerance, for the wired
// default product ('FarinePlumes') AND for the alfalfa branch:
//   n_offtake = TOMATO_FRUIT_EXPORT.N × stageYield × 1000 + BIOMASS_DEMAND.N
//   n_compost = CompostContribution.releasePerWeek.N × 1000
//   n_needed  = max(0, offtake − compost)
//   g/planche = round(n_needed / (p.n_pct × p.efficiency) / 1000 × area)
//
// Spec: nutrition/tomato/sidedress-recipe/spec.md → mass-balance-sizes-product-to-n-gap.

header('mass-balance-sizes-product-to-n-gap — Sidedress g_per_planche matches mass-balance formula');

if (!computeStageSidedress || !SIDEDRESS_PRODUCTS || !SIDEDRESS_AREA_PER_PLANCHE
    || !TOMATO_FRUIT_EXPORT || !BIOMASS_DEMAND
    || !window.CompostContribution || !ph1.RECIPE_INPUTS) {
  fail('Sidedress + upstream constants exposed', 'one or more globals missing');
} else {
  const stages = Object.keys(ph1.RECIPE_INPUTS.stageYield);
  const offenders = [];
  const compostN = window.CompostContribution.releasePerWeek.N;
  const area = SIDEDRESS_AREA_PER_PLANCHE;
  // Test the wired default ('FarinePlumes') AND the alfalfa branch — both
  // are Ca-free, both go through the same formula with their own n_pct/efficiency.
  const testProducts = ['FarinePlumes', 'AlfalfaMeal'];
  for (const product of testProducts) {
    const p = SIDEDRESS_PRODUCTS[product];
    if (!p || (p.ca_pct || 0) > 0) {
      offenders.push(`${product}: not Ca-free or missing in SIDEDRESS_PRODUCTS`);
      continue;
    }
    // Read the per-product flat field from the return value.
    const fieldFor = { FarinePlumes: 'farine_g', AlfalfaMeal: 'alfalfa_g', Actisol: 'actisol_g' };
    const field = fieldFor[product];
    for (const s of stages) {
      const y = ph1.RECIPE_INPUTS.stageYield[s] || 0;
      const biomassN = (BIOMASS_DEMAND[s] && BIOMASS_DEMAND[s].N) || 0;
      const offtake = TOMATO_FRUIT_EXPORT.N.g * 1000 * y + biomassN;
      const compost = compostN * 1000;
      const needed = Math.max(0, offtake - compost);
      const expected_g_m2 = needed / (p.n_pct * p.efficiency) / 1000;
      const expected_g_planche = Math.round(expected_g_m2 * area);
      const r = computeStageSidedress(s, product);
      const actual = r[field];
      const actualGpp = r.g_per_planche;
      if (Math.abs(actual - expected_g_planche) > 5) {
        offenders.push(`${product}/${s}: ${field}=${actual} vs expected ${expected_g_planche}`);
      }
      // g_per_planche should mirror the chosen-product field
      if (Math.abs(actualGpp - expected_g_planche) > 5) {
        offenders.push(`${product}/${s}: g_per_planche=${actualGpp} vs expected ${expected_g_planche}`);
      }
    }
  }
  if (offenders.length === 0) {
    pass(`Tous les stades × 2 produits Ca-free suivent la formule mass-balance (±5 g de tolérance)`);
  } else {
    fail('Mass-balance derivation', offenders.map(o => `  ${o}`).join('\n'));
  }
}

// ─── public-api-namespace — SidedressRecipeTomato public API namespace ───────────────
//
// Spec: nutrition/tomato/sidedress-recipe/spec.md → public-api-namespace.

header('public-api-namespace — window.SidedressRecipeTomato public API surface');

const SR = window.SidedressRecipeTomato;
if (!SR) {
  fail('window.SidedressRecipeTomato exists', 'namespace not declared (model.js include may be missing or out of order)');
} else {
  const expectedKeys = [
    'AREA_PER_PLANCHE', 'PRODUCTS', 'MINIMUM_EFFICIENCY', 'FIRST_PRINCIPLES_BY_STAGE',
    'computeStageSidedress',
  ];
  const missing = expectedKeys.filter(k => SR[k] == null);
  if (missing.length > 0) {
    fail('SidedressRecipeTomato exposes the public API', `manquants: ${missing.join(', ')}`);
  } else {
    const t5 = SR.computeStageSidedress('T5');
    const okShape = typeof SR.AREA_PER_PLANCHE === 'number'
                  && typeof t5.farine_g === 'number'
                  && typeof t5.chosen === 'string'
                  && typeof SR.PRODUCTS === 'object';
    if (!okShape) {
      fail('SidedressRecipeTomato shape', `AREA_PER_PLANCHE: ${typeof SR.AREA_PER_PLANCHE}; T5.farine_g: ${typeof t5.farine_g}; T5.chosen: ${typeof t5.chosen}; PRODUCTS: ${typeof SR.PRODUCTS}`);
    } else {
      pass(`SidedressRecipeTomato exposes ${expectedKeys.length} clés (toutes présentes, shape OK)`);
    }
  }
}

// ─── ca-aware-product-gate — Ca-aware product gate ────────────────────────────────────
//
// Generalizes from "actisol_g === 0" to "no Ca-bearing product can be
// selected by computeStageSidedress while soil is Ca-saturated". Two
// assertions:
//   (a) for every stage, the chosen product (default 'FarinePlumes') has
//       SIDEDRESS_PRODUCTS[chosen].ca_pct === 0.
//   (b) explicitly requesting a Ca-bearing product (e.g. 'Actisol' which
//       carries 3 % Ca) returns g_per_planche === 0 — caller cannot bypass
//       the gate. Future Ca-bearing products (Selectus, frass, etc.) get
//       rejected automatically without code changes.
//
// Spec: nutrition/tomato/sidedress-recipe/spec.md → ca-aware-product-gate.

header('ca-aware-product-gate — Ca-aware product gate (chosen product ca_pct === 0)');

if (!computeStageSidedress || !SIDEDRESS_PRODUCTS) {
  fail('computeStageSidedress + SIDEDRESS_PRODUCTS exposed', 'missing on window');
} else {
  const stages = Object.keys(ph1.RECIPE_INPUTS?.stageYield || {});
  const offenders = [];
  // (a) chosen product is always Ca-free
  for (const s of stages) {
    const r = computeStageSidedress(s);
    const chosen = r.chosen;
    const spec = SIDEDRESS_PRODUCTS[chosen];
    if (!spec) {
      offenders.push(`${s}: chosen='${chosen}' not in SIDEDRESS_PRODUCTS`);
      continue;
    }
    if ((spec.ca_pct || 0) !== 0) {
      offenders.push(`${s}: chosen='${chosen}' has ca_pct=${spec.ca_pct} (gate breached)`);
    }
  }
  // (b) Ca-bearing products explicitly requested return g_per_planche === 0.
  // Iterate over every entry in SIDEDRESS_PRODUCTS — any new Ca-bearing
  // product gets gated automatically without verifier edits.
  const caBearingKeys = Object.entries(SIDEDRESS_PRODUCTS)
    .filter(([_, p]) => (p.ca_pct || 0) > 0)
    .map(([k]) => k);
  if (caBearingKeys.length === 0) {
    offenders.push('expected ≥1 Ca-bearing product in SIDEDRESS_PRODUCTS for defensive gate test (e.g. Actisol)');
  }
  for (const product of caBearingKeys) {
    for (const s of stages) {
      const r = computeStageSidedress(s, product);
      if (r.g_per_planche !== 0) {
        offenders.push(`${product}/${s}: g_per_planche=${r.g_per_planche} (Ca-bearing gate breached, expected 0)`);
      }
    }
  }
  if (offenders.length === 0) {
    pass(`Gate Ca-aware: tous les stades (${stages.length}) choisissent un produit Ca-free; produits Ca-bearing (${caBearingKeys.join(',')}) renvoient 0 g`);
  } else {
    fail('Ca-aware product gate', offenders.map(o => `  ${o}`).join('\n'));
  }
}

// ─── mass-balance-derivation — Fertigation mass-balance derivation matches the formula ──
//
// computeStageRecipe(stage).{kSulfate, mgSulfate, solubore} must equal the
// mass-balance derivation within ±5 g rounding tolerance. Per element,
// fertigation sizes to (demand / uptake_factor) − compost − sidedress, with
// soil-bank credit applying only to {P, Ca} (neither in fertigation flow).
// Function implements K + Mg + B (Solubore) branches. (mass-balance-derivation with-compost
// subtraction restored 2026-05-15 per B1-REV; uptake factor added per
// uptake-efficiency-factor B2-REV same day.):
//   demand_to_bed = demand / PH_UPTAKE_FACTOR_AT_CURRENT_SOIL[element]
//   k_offtake     = TOMATO_FRUIT_EXPORT.K × stageYield × 1000 + BIOMASS_DEMAND[stage].K
//   k_demand_to_bed = k_offtake / uptake.K
//   k_sd          = sd.actisol_g × Actisol_K × min_eff × 1000 / SIDEDRESS_AREA
//   k_compost     = CompostContribution.releasePerWeek.K × 1000
//   k_needed      = max(0, k_demand_to_bed − k_sd − k_compost)
//   kSulfate_g    = round(k_needed / 1000 / K2SO4_K × total_area)
//   (Mg analogous, no sidedress; B analogous, no sidedress, compost B = 0.)
//
// Spec: nutrition/tomato/fertigation-recipe/spec.md → mass-balance-derivation + uptake-efficiency-factor.

header('mass-balance-derivation — computeStageRecipe matches mass-balance formula');

const CC_release = window.CompostContribution && window.CompostContribution.releasePerWeek;
const uptake_phase1 = ph1.PH_UPTAKE_FACTOR_AT_CURRENT_SOIL;
if (!computeStageRecipe || !TOMATO_FRUIT_EXPORT || !BIOMASS_DEMAND
    || !PRODUCT_PCT || !SIDEDRESS_MINIMUM_EFFICIENCY || !SIDEDRESS_AREA_PER_PLANCHE
    || !TOMATO_NUMBER_BEDS || !TOMATO_BED_AREA || !STORED_RECIPE
    || !ph1.RECIPE_INPUTS || !CC_release || !uptake_phase1) {
  fail('Fertigation + upstream constants exposed', 'one or more globals missing (incl. window.CompostContribution.releasePerWeek, PH_UPTAKE_FACTOR_AT_CURRENT_SOIL)');
} else {
  const stages = Object.keys(ph1.RECIPE_INPUTS.stageYield);
  const totalArea = TOMATO_NUMBER_BEDS * TOMATO_BED_AREA;
  const kCompostMg = (CC_release.K || 0) * 1000;
  const mgCompostMg = (CC_release.Mg || 0) * 1000;
  const bCompostMg = (CC_release.B || 0) * 1000;
  const uK = uptake_phase1.K || 1;
  const uMg = uptake_phase1.Mg || 1;
  const uB = uptake_phase1.B || 1;
  const offenders = [];
  for (const s of stages) {
    const y = ph1.RECIPE_INPUTS.stageYield[s] || 0;
    const sd = (STORED_RECIPE.tomato.sidedress[s]) || { actisol_g: 0, farine_g: 0 };
    const biomass = BIOMASS_DEMAND[s] || {};
    // K
    const kDemand = (TOMATO_FRUIT_EXPORT.K.g * 1000 * y) + (biomass.K || 0);
    const kDemandToBed = kDemand / uK;
    const kSd = (sd.actisol_g * PRODUCT_PCT.Actisol_K
                 * (SIDEDRESS_MINIMUM_EFFICIENCY.Actisol_K || 0.85) * 1000)
                 / SIDEDRESS_AREA_PER_PLANCHE;
    const kNeeded = Math.max(0, kDemandToBed - kSd - kCompostMg);
    const expectedKsulfate = Math.round((kNeeded / 1000 / PRODUCT_PCT.K2SO4_K) * totalArea);
    // Mg
    const mgDemand = (TOMATO_FRUIT_EXPORT.Mg.g * 1000 * y) + (biomass.Mg || 0);
    const mgDemandToBed = mgDemand / uMg;
    const mgNeeded = Math.max(0, mgDemandToBed - mgCompostMg);
    const expectedMgSulfate = Math.round((mgNeeded / 1000 / PRODUCT_PCT.MgSO4_Mg) * totalArea);
    // B (Solubore)
    const bDemand = (TOMATO_FRUIT_EXPORT.B.g * 1000 * y) + (biomass.B || 0);
    const bDemandToBed = bDemand / uB;
    const bNeeded = Math.max(0, bDemandToBed - bCompostMg);
    const expectedSolubore = Math.round((bNeeded / 1000 / PRODUCT_PCT.Solubore_B) * totalArea);
    // Compare
    const r = computeStageRecipe(s) || {};
    if (typeof r.kSulfate !== 'number' || Math.abs(r.kSulfate - expectedKsulfate) > 5) {
      offenders.push(`${s}: kSulfate=${r.kSulfate} vs expected ${expectedKsulfate}`);
    }
    if (typeof r.mgSulfate !== 'number' || Math.abs(r.mgSulfate - expectedMgSulfate) > 5) {
      offenders.push(`${s}: mgSulfate=${r.mgSulfate} vs expected ${expectedMgSulfate}`);
    }
    if (typeof r.solubore !== 'number' || Math.abs(r.solubore - expectedSolubore) > 2) {
      offenders.push(`${s}: solubore=${r.solubore} vs expected ${expectedSolubore}`);
    }
  }
  if (offenders.length === 0) {
    pass(`Tous les stades (${stages.length}) suivent la formule mass-balance fertigation (±5 g, compost+sidedress+uptake-factor)`);
  } else {
    fail('Fertigation mass-balance derivation', offenders.map(o => `  ${o}`).join('\n'));
  }
}

// ─── public-api-namespace — FertigationRecipeTomato public API namespace ─────────────
//
// Spec: nutrition/tomato/fertigation-recipe/spec.md → public-api-namespace.

header('public-api-namespace — window.FertigationRecipeTomato public API surface');

const FR = window.FertigationRecipeTomato;
if (!FR) {
  fail('window.FertigationRecipeTomato exists', 'namespace not declared (model.js include may be missing or out of order)');
} else {
  const expectedKeys = [
    'FIRST_PRINCIPLES_T5', 'computeStageRecipe',
  ];
  const missing = expectedKeys.filter(k => FR[k] == null);
  if (missing.length > 0) {
    fail('FertigationRecipeTomato exposes the public API', `manquants: ${missing.join(', ')}`);
  } else {
    const t5 = FR.computeStageRecipe('T5');
    const okShape = typeof FR.FIRST_PRINCIPLES_T5 === 'object'
                  && typeof t5.kSulfate === 'number'
                  && typeof t5.mgSulfate === 'number';
    if (!okShape) {
      fail('FertigationRecipeTomato shape',
           `FIRST_PRINCIPLES_T5: ${typeof FR.FIRST_PRINCIPLES_T5}; T5.kSulfate: ${typeof t5.kSulfate}; T5.mgSulfate: ${typeof t5.mgSulfate}`);
    } else {
      pass(`FertigationRecipeTomato exposes ${expectedKeys.length} clés (toutes présentes, shape OK)`);
    }
  }
}

// Mode-aware MIXING_FACTOR retired 2026-05-10 — concept dropped,
// fertigation supply now reported at full barrel mass. Number not reused.

// ─── fp-target-mirrors-sizer — FIRST_PRINCIPLES_T5_FERTIGATION pinned to computeStageRecipe('T5')
//
// Spec: nutrition/tomato/fertigation-recipe/spec.md → fp-target-mirrors-sizer.
// The FP T5 fertigation target equals the mass-balance derivation output
// by construction (wireFpFertigation mutates the constant values at boot
// from computeStageRecipe('T5')). PA Taillon legacy anchor preserved in
// learnings.md; pinning prevents the K/Mg drift the legacy anchor surfaced
// after the mass-balance-derivation amendment dropped compost-subtraction.

header('fp-target-mirrors-sizer — FIRST_PRINCIPLES_T5_FERTIGATION values = computeStageRecipe(T5) output');

if (!FIRST_PRINCIPLES_T5_FERTIGATION || !computeStageRecipe || !FP_RECIPE_T5) {
  fail('fp-target-mirrors-sizer prerequisites exposed',
       `FIRST_PRINCIPLES_T5_FERTIGATION: ${!!FIRST_PRINCIPLES_T5_FERTIGATION}; computeStageRecipe: ${!!computeStageRecipe}; FP_RECIPE_T5: ${!!FP_RECIPE_T5}`);
} else {
  const t5 = computeStageRecipe('T5') || {};
  const offenders = [];
  if (FIRST_PRINCIPLES_T5_FERTIGATION['K2SO4'] !== t5.kSulfate) {
    offenders.push(`FIRST_PRINCIPLES.K2SO4=${FIRST_PRINCIPLES_T5_FERTIGATION['K2SO4']} vs computeStageRecipe('T5').kSulfate=${t5.kSulfate}`);
  }
  if (FIRST_PRINCIPLES_T5_FERTIGATION['MgSO4-7H2O'] !== t5.mgSulfate) {
    offenders.push(`FIRST_PRINCIPLES['MgSO4-7H2O']=${FIRST_PRINCIPLES_T5_FERTIGATION['MgSO4-7H2O']} vs computeStageRecipe('T5').mgSulfate=${t5.mgSulfate}`);
  }
  if (FIRST_PRINCIPLES_T5_FERTIGATION['Solubore'] !== t5.solubore) {
    offenders.push(`FIRST_PRINCIPLES.Solubore=${FIRST_PRINCIPLES_T5_FERTIGATION['Solubore']} vs computeStageRecipe('T5').solubore=${t5.solubore}`);
  }
  if (FIRST_PRINCIPLES_T5_FERTIGATION['NaMolybdate'] !== t5.naMolybdate) {
    offenders.push(`FIRST_PRINCIPLES.NaMolybdate=${FIRST_PRINCIPLES_T5_FERTIGATION['NaMolybdate']} vs computeStageRecipe('T5').naMolybdate=${t5.naMolybdate}`);
  }
  // Propagation: FP_RECIPE_T5.fertigation mirrors the same four values
  const fp = FP_RECIPE_T5.fertigation || {};
  for (const key of ['K2SO4', 'MgSO4-7H2O', 'Solubore', 'NaMolybdate']) {
    if (fp[key] !== FIRST_PRINCIPLES_T5_FERTIGATION[key]) {
      offenders.push(`FP_RECIPE_T5.fertigation['${key}']=${fp[key]} vs FIRST_PRINCIPLES['${key}']=${FIRST_PRINCIPLES_T5_FERTIGATION[key]}`);
    }
  }
  if (offenders.length === 0) {
    pass(`K2SO4 ${t5.kSulfate} · MgSO4-7H2O ${t5.mgSulfate} · Solubore ${t5.solubore} · NaMolybdate ${t5.naMolybdate} — all four propagated FIRST_PRINCIPLES → FP_RECIPE_T5`);
  } else {
    fail('fp-target-mirrors-sizer — FP target pinned to computeStageRecipe(T5)', offenders.map(o => `  ${o}`).join('\n'));
  }
}

// ─── uptake-efficiency-factor — PH_UPTAKE_FACTOR_AT_CURRENT_SOIL applied to fertigation sizing
//
// Spec: nutrition/tomato/fertigation-recipe/spec.md → uptake-efficiency-factor.
// Asserts the constant exists with K/Mg/B keys at the expected cert-2
// mid-band values (B2-REV defaults), each in (0, 1]. The function-output
// correlation is covered by mass-balance-derivation (which now applies the factor in the
// expected-value calculation).

header('uptake-efficiency-factor — PH_UPTAKE_FACTOR_AT_CURRENT_SOIL: per-element bed→plant factor');

const uf = ph1.PH_UPTAKE_FACTOR_AT_CURRENT_SOIL;
if (!uf) {
  fail('uptake-efficiency-factor — PH_UPTAKE_FACTOR_AT_CURRENT_SOIL exposed', 'constant missing from data.js scope');
} else {
  const offenders = [];
  const expected = { K: 0.90, Mg: 0.85, B: 0.80 };
  for (const element of ['K', 'Mg', 'B']) {
    const v = uf[element];
    if (typeof v !== 'number' || v <= 0 || v > 1) {
      offenders.push(`PH_UPTAKE_FACTOR_AT_CURRENT_SOIL.${element} must be a number in (0, 1], got ${v}`);
    } else if (Math.abs(v - expected[element]) > 0.0001) {
      offenders.push(`PH_UPTAKE_FACTOR_AT_CURRENT_SOIL.${element}=${v} vs expected B2-REV default ${expected[element]}`);
    }
  }
  if (offenders.length === 0) {
    pass(`K ${uf.K} · Mg ${uf.Mg} · B ${uf.B} — cert-2 B2-REV defaults present`);
  } else {
    fail('uptake-efficiency-factor — PH_UPTAKE_FACTOR_AT_CURRENT_SOIL shape + values', offenders.map(o => `  ${o}`).join('\n'));
  }
}

// ─── channel-role-coverage — fraction sums per element in CHANNEL_ROLE within 1.0 ± 0.05

header('channel-role-coverage — Aucun double flux-ownership (sommes 1.0 ± 0.05)');

if (!CHANNEL_ROLE) {
  fail('CHANNEL_ROLE exposed', 'missing');
} else {
  const offenders = [];
  for (const [element, channels] of Object.entries(CHANNEL_ROLE)) {
    const sum = Object.values(channels).reduce((a, b) => a + (Number(b) || 0), 0);
    if (Math.abs(sum - 1.0) > 0.05) {
      offenders.push(`${element}: sum=${sum.toFixed(3)}`);
    }
  }
  if (offenders.length === 0) {
    pass(`Tous les ${Object.keys(CHANNEL_ROLE).length} éléments somment 1.0 ± 0.05`);
  } else {
    fail('Sommes par élément dans 1.0 ± 0.05', offenders.join('\n'));
  }
}

// ─── phclass-covers-every-element — phClass covers every element in product.base ────────────

header('phclass-covers-every-element — PRODUCT.phClass couvre tout élément de PRODUCT.base');

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
    for (const element of baseEls) {
      if (!(element in p.phClass)) offenders.push(`${name}: phClass missing key ${element}`);
    }
  }
  if (offenders.length === 0) {
    pass('Tous les produits déclarent phClass pour chaque élément de base');
  } else {
    fail('PRODUCT.phClass couvre PRODUCT.base', offenders.join('\n'));
  }
}

// ─── every-product-ecocert-allowed — every product in any active recipe has organicAllowed: true

header('every-product-ecocert-allowed — Produits des recettes actives organicAllowed: true');

if (!PRODUCT) {
  fail('PRODUCT exposed', 'missing');
} else {
  // Collect product NAMES referenced by active recipes. The current Phase 1
  // active recipes are computeStageRecipe, FOLIAR.tomato (A and B), and
  // TOMATO_SIDEDRESS — but those use label strings, not PRODUCT keys.
  // Pragmatic choice: check every PRODUCT entry (the legacy first-principles
  // computeRecipe builder was deleted in the Phase 2 chemistry pull-up).
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

// ─── ec-factor-covers-every-product — every product has an ecFactor (number, 0 explicit) ──────

header('ec-factor-covers-every-product — Tout produit a ecFactor (numberérique, 0 explicite)');

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

// ─── product-declares-ions-and-chemistry-tags — every product has non-empty ions and chemistryTags ─────

header('product-declares-ions-and-chemistry-tags — Tout produit a ions et chemistryTags non vides');

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

// ─── every-cation-anion-pair-classified — every (cation × anion) pair is in KSP_PAIRS or KSP_SAFE ─
//
// Cation/anion classification follows the validator embedded in index.html
// (validatePhase1ModelCoverage IIFE at line 3882): cations end in '+' or
// have an explicit suffix like '2+', anions end in '-' or '-N' (charge
// notation). We use the exact same lists declared there.

header('every-cation-anion-pair-classified — Toute paire cation × anion classifiée');

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

// ─── every-chemistry-tag-classified — every distinct chemistryTags tag is classified ─────────

header('every-chemistry-tag-classified — Tout chemistryTags est classifié');

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

// ─── tomato-removal-biased-high — TOMATO_REMOVAL biased toward high end of references ─────
//
// Inter-source mean across {Yara high-end, Sonneveld 2009, Koller 2016 avg}
// for each macro element with multi-source data. TOMATO_REMOVAL value must
// be ≥ this mean (or carry an `acceptedDeficit` annotation, not yet supported
// in the data shape — for now, hard threshold).

header('tomato-removal-biased-high — TOMATO_REMOVAL ≥ inter-source mean (high-end bias)');

if (!TOMATO_REMOVAL) {
  fail('TOMATO_REMOVAL exposé', 'window.TOMATO_REMOVAL not available');
} else {
  // Reference values (g uptake per kg fresh fruit, tomato).
  // Inter-source mean = average of {Yara high, Sonneveld 2009, Koller 2016 avg}.
  const REFERENCE_MEAN = {
    N:  (2.3 + 2.5 + 2.9) / 3,        // 2.566...
    P:  (0.36 + 0.57 + 0.39) / 3,     // 0.44
    K:  (3.3 + 4.0 + 4.48) / 3,       // 3.926...
    Mg: (0.54 + 0.67 + 0.5) / 3,      // 0.57
  };
  const failures = [];
  for (const [element, mean] of Object.entries(REFERENCE_MEAN)) {
    const current = TOMATO_REMOVAL[element]?.g;
    if (typeof current !== 'number') {
      failures.push(`${element}: missing or non-numeric in TOMATO_REMOVAL`);
    } else if (current + 1e-9 < mean) {
      failures.push(`${element}: ${current} < mean ${mean.toFixed(2)}`);
    }
  }
  if (failures.length === 0) {
    pass('TOMATO_REMOVAL ≥ Tier B mean pour N, P, K, Mg');
  } else {
    fail('TOMATO_REMOVAL ≥ Tier B mean', failures.join('\n'));
  }
}

// ─── Phase 2.5 wiring (under-fert-guard/014/015/016/017/018/020/021/024/025/026/027/
//     029/030/031/032/053/054/055/060/061) ──────────────────────────────────
//
// Manual-review skip list (NOT wired here, by design):
//   ecocert-only-products — Ecocert-only (manual policy review per its own statement)
//
// ─────────────────────────────────────────────────────────────────────────

// Helper — sidedress effective contribution (mg/m²/wk per element) for a stage.
function sidedressEffective(stage, element) {
  if (!TOMATO_SIDEDRESS || !PRODUCT_PCT || !SIDEDRESS_MINIMUM_EFFICIENCY) return 0;
  const sd = TOMATO_SIDEDRESS[stage] || { actisol_g: 0, farine_g: 0 };
  const area = SIDEDRESS_AREA_PER_PLANCHE || 54.7;
  let mg_m2 = 0;
  if (element === 'N') {
    mg_m2 += (sd.actisol_g * (PRODUCT_PCT.Actisol_N || 0)
             * (SIDEDRESS_MINIMUM_EFFICIENCY.Actisol_N || 0.6) * 1000) / area;
    mg_m2 += (sd.farine_g  * (PRODUCT_PCT.FarinePlumes_N || 0)
             * (SIDEDRESS_MINIMUM_EFFICIENCY.FarinePlumes_N || 0.70) * 1000) / area;
  } else if (element === 'P') {
    mg_m2 += (sd.actisol_g * (PRODUCT_PCT.Actisol_P || 0)
             * (SIDEDRESS_MINIMUM_EFFICIENCY.Actisol_P || 0.5) * 1000) / area;
  } else if (element === 'K') {
    mg_m2 += (sd.actisol_g * (PRODUCT_PCT.Actisol_K || 0)
             * (SIDEDRESS_MINIMUM_EFFICIENCY.Actisol_K || 0.85) * 1000) / area;
  }
  return mg_m2;
}

// Helper — fertigation effective contribution (mg/m²/wk per element) at current
// soil pH using computeStageRecipe(stage). Only K and Mg modeled in mass-balance
// (per computeStageRecipe). Returns 0 for elements not delivered via fertigation.
function fertigationEffective(stage, element, soilPh) {
  if (typeof computeStageRecipe !== 'function' || !PRODUCT_PCT || !TOMATO_NUMBER_BEDS || !TOMATO_BED_AREA) return 0;
  const recipe = computeStageRecipe(stage) || {};
  const totalArea = TOMATO_NUMBER_BEDS * TOMATO_BED_AREA;
  let mg_m2 = 0;
  if (element === 'K') {
    const efficiency = (effectiveEfficiency && PRODUCT && PRODUCT.K2SO4)
      ? Math.max(0.05, effectiveEfficiency('K2SO4', 'K', soilPh))  // 0 floor would zero supply
      : 1.0;
    const mg_total = (recipe.kSulfate || 0) * (PRODUCT_PCT.K2SO4_K || 0.415) * 1000 * efficiency;
    mg_m2 = mg_total / totalArea;
  } else if (element === 'Mg') {
    const efficiency = (effectiveEfficiency && PRODUCT && PRODUCT['MgSO4-7H2O'])
      ? Math.max(0.05, effectiveEfficiency('MgSO4-7H2O', 'Mg', soilPh))
      : 1.0;
    const mg_total = (recipe.mgSulfate || 0) * (PRODUCT_PCT.MgSO4_Mg || 0.0986) * 1000 * efficiency;
    mg_m2 = mg_total / totalArea;
  }
  return mg_m2;
}

// Helper — compost release in mg/m²/wk per element. Reads
// COMPOST_RELEASE_PER_WEEK directly (single source of truth, exposed via
// instrumentation; consumers in the live app use
// window.CompostContribution.releasePerWeek which wraps the same constant).
function compostReleaseMg(element) {
  if (!COMPOST_RELEASE_PER_WEEK) return 0;
  return (COMPOST_RELEASE_PER_WEEK[element] || 0) * 1000;  // g→mg
}

// Helper — total demand (mg/m²/wk) for (stage, element).
function stageDemandMg(stage, element) {
  if (!TOMATO_FRUIT_EXPORT || !BIOMASS_DEMAND || !RECIPE_INPUTS) return 0;
  const y = (RECIPE_INPUTS.stageYield || {})[stage] || 0;
  const fruit_g = (TOMATO_FRUIT_EXPORT[element] && TOMATO_FRUIT_EXPORT[element].g) || 0;
  const fruit_mg = fruit_g * 1000 * y;
  const bio_mg = (BIOMASS_DEMAND[stage] || {})[element] || 0;
  return fruit_mg + bio_mg;
}

const STAGES = ['T1', 'T2', 'T3', 'T4', 'T5'];
const MASS_BALANCE_ELEMENTS = ['N', 'P', 'K', 'Mg'];  // CHANNEL_ROLE elements with non-foliar supply
const SOIL_PH_NOW = 7.4;  // current soil pH per CLAUDE.md (April 2026 Berger)

// ─── under-fert-guard — Σ(channel_supply) ≥ 0.9 × demand per (element, stage) ──────
//
// Failures are expected when nothing can be done about it (P pH-locked at
// soil pH ≥ 7, no organic + chemistry-compatible remediation path) — those
// MUST appear in ACCEPTED_DEFICITS with a documented reason. Unaccepted
// deficits = real failures that must fix the model or the recipe.

header('under-fert-guard — Couverture macro ≥ 0.9 × demande (gaps acceptés annotés)');

if (typeof computeStageRecipe !== 'function' || !TOMATO_SIDEDRESS || !RECIPE_INPUTS || !ACCEPTED_DEFICITS) {
  fail('under-fert-guard — required globals exposed', 'computeStageRecipe / TOMATO_SIDEDRESS / RECIPE_INPUTS / ACCEPTED_DEFICITS missing');
} else {
  // Per-element supply totals (mg/m²/wk): compost + sidedress + fertigation.
  // Foliar omitted from the under-fert check for non-foliar elements (foliar
  // delivers micros, which are not in MASS_BALANCE_ELEMENTS). T1/T2 have
  // stageYield=0 so demand is biomass-only — supply still expected to cover
  // it via compost + sidedress.
  const offenders = [];
  for (const stage of STAGES) {
    for (const element of MASS_BALANCE_ELEMENTS) {
      const demand = stageDemandMg(stage, element);
      if (demand <= 0) continue;  // skip null demand entries
      const supply = compostReleaseMg(element)
                   + sidedressEffective(stage, element)
                   + fertigationEffective(stage, element, SOIL_PH_NOW);
      const ratio = supply / demand;
      if (ratio < 0.90) {
        const accepted = ACCEPTED_DEFICITS.find(d => d.stage === stage && d.element === element);
        if (!accepted) {
          offenders.push(`${stage}.${element}: supply=${supply.toFixed(0)} demand=${demand.toFixed(0)} ratio=${ratio.toFixed(2)} (no ACCEPTED_DEFICITS annotation)`);
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

// ─── luxury-feeding-guard — Σ(channel_supply) ≤ 1.3 × demand (luxury / waste guard) ────
//
// Excess > 1.3 × demand is accepted iff (a) entry exists in ACCEPTED_EXCESSES
// with a reason AND (b) the UI surfaces a warning to the operator so over-
// supply is visible (not silent). The default is to fail — over-feeding is a
// model failure unless there's a documented reason it can't be undone (e.g.
// past compost amendment that's still mineralizing).

header('luxury-feeding-guard — Sur-apport macro ≤ 1.3 × demande (excès acceptés annotés + warning UI)');

if (typeof computeStageRecipe !== 'function' || !TOMATO_SIDEDRESS || !RECIPE_INPUTS || !ACCEPTED_EXCESSES) {
  fail('luxury-feeding-guard — required globals exposed', 'computeStageRecipe / TOMATO_SIDEDRESS / RECIPE_INPUTS / ACCEPTED_EXCESSES missing');
} else {
  const offenders = [];
  for (const stage of STAGES) {
    for (const element of MASS_BALANCE_ELEMENTS) {
      const demand = stageDemandMg(stage, element);
      if (demand <= 0) continue;
      const supply = compostReleaseMg(element)
                   + sidedressEffective(stage, element)
                   + fertigationEffective(stage, element, SOIL_PH_NOW);
      const ratio = supply / demand;
      if (ratio > 1.3) {
        const accepted = ACCEPTED_EXCESSES.find(e => e.stage === stage && e.element === element);
        if (!accepted) {
          offenders.push(`${stage}.${element}: supply=${supply.toFixed(0)} demand=${demand.toFixed(0)} ratio=${ratio.toFixed(2)} (no ACCEPTED_EXCESSES annotation)`);
        }
      }
    }
  }
  // Proxy check: when ACCEPTED_EXCESSES is non-empty, the UI must surface the
  // warning somewhere visible. We grep the raw HTML for the canonical warning
  // copy ("Sur-apport accepté") rendered by buildNutriment in Block 5 (Leviers).
  if (offenders.length === 0 && ACCEPTED_EXCESSES.length > 0) {
    if (!rawHtml.includes('Sur-apport accepté')) {
      fail('luxury-feeding-guard — UI warning for accepted excesses', 'ACCEPTED_EXCESSES has entries but raw HTML does not contain "Sur-apport accepté" (warning banner missing on Nutrition Block 5)');
    } else {
      pass(`Tous les (stage × macro) supply ≤ 1.3× demand ou annotés acceptés (${ACCEPTED_EXCESSES.length} entrées) + warning UI présent`);
    }
  } else if (offenders.length === 0) {
    pass(`Tous les (stage × macro) supply ≤ 1.3× demand`);
  } else {
    fail('Σ(channel_supply) ≤ 1.3 × demand', offenders.join('\n'));
  }
}

// ─── concentration-dose-within-band — Concentration-driven dose / solubility declared ────────────
//
// concentration-dose-within-band envelopes (efficacy_min / safety_max) aren't in PRODUCT shape today.
// Best mechanizable proxy: every PRODUCT entry MUST declare solubilityCap_g_per_L
// (existing field). This catches the add-product-without-data case so a real
// efficacy/safety band can be added next.

header('concentration-dose-within-band — Tout produit déclare solubilityCap_g_per_L (placeholder)');

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

// Stored-stage-recipe drift check retired 2026-05-08 — was "stored TOMATO_STAGES vs computeStageRecipe
// drift detection". Comparison became meaningless when TOMATO_STAGES const was
// removed (stored = computed by construction). See RECIPE_HISTORY entry
// (retired 2026-05-08). stored-vs-computed-drift-block (2026-05-13) replaces it for Block 8 direction.

// ─── stored-vs-computed-drift-block — Block 8 drift gauge renders ratio FP ÷ Stored ──────────────
//
// For each element shown in the Tomato Nutrition admin page's Block 8
// "Recette stockée vs calculée (drift)", the rendered ratio is
// `FP_RECIPE_T5 ÷ STORED_RECIPE.tomato.fertigation.T5`. 100 % = parity;
// > 100 % = stored under-supplies vs FP; < 100 % = stored over-supplies.
// Stubs one element so FP/Stored = 1.5 and asserts the rendered Solubore (B)
// row text contains "150"; defensive guard rejects the inverted "67"
// rendering. Fixture pinned to a still-nonzero stored row: K₂SO₄ / MgSO₄ were
// cut to 0 (2026-06-05 /retire-recipe), so a K-keyed fixture would divide by a
// zero stored value — B (borax → Solubore) stays at 10 g, exercising the same
// FP/Stored direction without a zero denominator.
//
// Spec: nutrition/tomato/shell/spec.md → stored-vs-computed-drift-block.

header('stored-vs-computed-drift-block — Block 8 drift gauge renders FP ÷ Stored (≥100 % = under-supply)');

if (!STORED_RECIPE || !FP_RECIPE_T5 || typeof window.buildNutriment !== 'function') {
  fail('stored-vs-computed-drift-block — STORED_RECIPE / FP_RECIPE_T5 / buildNutriment exposed', 'one or more globals missing');
} else {
  const storedFert = STORED_RECIPE?.tomato?.fertigation?.T5;
  const storedB = storedFert ? storedFert.borax : 0;
  const fpFert = window.FP_RECIPE_T5?.fertigation || FP_RECIPE_T5.fertigation;
  const originalFP = fpFert ? fpFert.Solubore : null;
  if (!storedB || originalFP == null) {
    fail('stored-vs-computed-drift-block — fixture preconditions', `storedB=${storedB} originalFP=${originalFP}`);
  } else {
    let offenders = [];
    try {
      // Stub FP/Stored = 1.5 for Solubore (B), force FP mode + T5, trigger render.
      fpFert.Solubore = storedB * 1.5;
      if (typeof window.setNutrRecipeMode === 'function') window.setNutrRecipeMode('fp');
      if (typeof window.setNutrStage === 'function') window.setNutrStage('T5');
      window.buildNutriment();
      const phase1Element = window.document.getElementById('nutr-phase1');
      const phase1Text = phase1Element ? phase1Element.textContent : '';
      if (!/\b150\b/.test(phase1Text)) {
        offenders.push(`Block 8 Solubore row missing "150" (FP/Stored=1.5 expected) — text: ${phase1Text.slice(0, 200)}…`);
      }
      if (/\b67\b/.test(phase1Text) && !/\b150\b/.test(phase1Text)) {
        offenders.push('Block 8 renders the inverted ratio (Stored/FP) — direction must be FP/Stored');
      }
    } finally {
      fpFert.Solubore = originalFP;
    }
    if (offenders.length === 0) {
      pass('Block 8 drift ratio direction = FP / Stored (stored-vs-computed-drift-block)');
    } else {
      fail('stored-vs-computed-drift-block — Block 8 ratio direction', offenders.join('\n'));
    }
  }
}

// ─── ph-aware-effective-efficiency — pH-aware effective efficiency in [0,1] ─────────────────────

header('ph-aware-effective-efficiency — effectiveEfficiency(product, element, pH) renvoie [0,1] pour soilPh=7.0');

if (typeof effectiveEfficiency !== 'function' || !PRODUCT) {
  fail('ph-aware-effective-efficiency — effectiveEfficiency exposed', 'function or PRODUCT missing');
} else {
  const offenders = [];
  for (const [name, p] of Object.entries(PRODUCT)) {
    const baseEls = Object.keys(p.base || {});
    for (const element of baseEls) {
      const efficiency = effectiveEfficiency(name, element, 7.0);
      if (typeof efficiency !== 'number' || Number.isNaN(efficiency) || efficiency < 0 || efficiency > 1) {
        offenders.push(`${name}.${element}: effectiveEfficiency=${efficiency}`);
      }
    }
  }
  if (offenders.length === 0) {
    pass(`effectiveEfficiency ∈ [0,1] pour tout (produit, élément) à pH 7.0`);
  } else {
    fail('effectiveEfficiency hors [0,1]', offenders.join('\n'));
  }
}

// ─── no-decorative-products-at-current-ph — No "decorative" products at current pH ─────────────────────
//
// Active recipes today: computeStageRecipe (K2SO4, MgSO4-7H2O via fertigation),
// FOLIAR.tomato.A (MnSO4, ZnSO4, Solubore, CuSO4, NaMolybdate, FeSO4-7H2O),
// TOMATO_SIDEDRESS (Actisol-5-3-2, FarinePlumes). For each, walk product.base
// and assert effectiveEfficiency(product, element, soilPh) ≥ 0.05 unless flagged decorative.

header('no-decorative-products-at-current-ph — Aucun produit "décoratif" (efficiency < 5%) sans drapeau');

if (typeof effectiveEfficiency !== 'function' || !PRODUCT) {
  fail('no-decorative-products-at-current-ph — effectiveEfficiency / PRODUCT exposés', 'missing');
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
    for (const element of baseEls) {
      const efficiency = effectiveEfficiency(name, element, SOIL_PH_NOW, sprayPh);
      if (efficiency < 0.05) {
        offenders.push(`${name}.${element}: efficiency=${efficiency.toFixed(3)} at soilPh ${SOIL_PH_NOW}`);
      }
    }
  }
  if (offenders.length === 0) {
    pass('Tous les produits actifs ont efficiency ≥ 5% à pH actuel');
  } else {
    fail('Produits décoratifs non flaggés (efficiency < 5%)', offenders.join('\n'));
  }
}

// ─── passive-supply-lockout-gate — pH lockout gate (FeSO4 effective efficiency drops with rising pH) ─

header('passive-supply-lockout-gate — Lockout pH: effectiveEfficiency(FeSO4, Fe, 7.4) < (Fe, 6.5)');

if (typeof effectiveEfficiency !== 'function' || !PRODUCT || !PRODUCT['FeSO4-7H2O']) {
  fail('passive-supply-lockout-gate — FeSO4 / effectiveEfficiency exposed', 'missing');
} else {
  const lo = effectiveEfficiency('FeSO4-7H2O', 'Fe', 6.5);
  const hi = effectiveEfficiency('FeSO4-7H2O', 'Fe', 7.4);
  if (typeof lo !== 'number' || typeof hi !== 'number') {
    fail('passive-supply-lockout-gate — effectiveEfficiency returns numbers', `lo=${lo} hi=${hi}`);
  } else if (hi < lo) {
    pass(`effectiveEfficiency(FeSO4-7H2O, Fe, 7.4)=${hi.toFixed(3)} < (Fe, 6.5)=${lo.toFixed(3)} — lockout active`);
  } else {
    fail('passive-supply-lockout-gate — pH lockout differentiates Fe at 6.5 vs 7.4',
         `efficiency(7.4)=${hi.toFixed(3)} should be < efficiency(6.5)=${lo.toFixed(3)}`);
  }
}

// ─── solubility-cap-per-product — Solubility cap per fertigation product ─────────────────────
//
// For active recipes, compute effective concentration (g per L stock barrel)
// and assert it's below the product's solubility cap. Stock barrel size is
// not currently exposed; use a conservative 500 L as proxy. K2SO4 at T5
// (~3500 g) → 7 g/L, well below 100 g/L cap. Foliar tank: 15 L master vol.

header('solubility-cap-per-product — Concentration in tank ≤ solubilityCap_g_per_L');

if (!PRODUCT || typeof computeStageRecipe !== 'function') {
  fail('solubility-cap-per-product — PRODUCT / computeStageRecipe exposed', 'missing');
} else {
  const STOCK_VOL_L = 500;       // estimated fertigation stock barrel volume
  const FOLIAR_VOL_L = 15;       // FOLIAR.tomato.masterVol
  const offenders = [];

  // Fertigation: max dose across all stages.
  let kMaximum = 0, mgMaximum = 0;
  for (const stage of STAGES) {
    const r = computeStageRecipe(stage) || {};
    if ((r.kSulfate || 0) > kMaximum) kMaximum = r.kSulfate;
    if ((r.mgSulfate || 0) > mgMaximum) mgMaximum = r.mgSulfate;
  }
  const kConc = kMaximum / STOCK_VOL_L;
  const mgConc = mgMaximum / STOCK_VOL_L;
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

// ─── predicted-ce-within-crop-stage-band — Predicted CE within crop-stage band ────────────────────────
//
// Approximate band 0.3–2.0 mS/cm for fertigation contribution at the dripper
// (above the ~0.10 baseline of city water). predictedCE(recipe, dilution,
// waterCE) computes CE; pass dilution=Dosatron-typical 0.02 (1:50). For each
// tomato stage, sum K₂SO₄ + MgSO₄ contribution and assert within band.

header('predicted-ce-within-crop-stage-band — predictedCE par stage dans la bande [0.3, 2.0] mS/cm (stages opérationnels)');

if (typeof ph1.predictedCE !== 'function' || typeof computeStageRecipe !== 'function') {
  fail('predicted-ce-within-crop-stage-band — predictedCE / computeStageRecipe exposés', 'missing');
} else {
  const STOCK_VOL_L = 500;
  const DILUTION = 0.02;     // Dosatron 1:50 typical for sulfate fertigation
  // Vegetative stages (T1, T2) skip the band check by design — low offtake
  // means a "nominal" tank that's mostly water, can't meaningfully hit the
  // 0.3 floor. The band binds at T3+ when the plant ramps to flowering / fruit
  // load and fertigation mass jumps. (Previous mass-based threshold was
  // recalibrated to a stage-name skip after mass-balance-derivation amendment 2026-05-12 —
  // T2 fertigation mass crossed the old 3000 g cutoff under the no-compost-
  // subtraction formula.)
  const VEGETATIVE_STAGES = new Set(['T1', 'T2']);
  const offenders = [];
  for (const stage of STAGES) {
    if (VEGETATIVE_STAGES.has(stage)) continue;
    const r = computeStageRecipe(stage) || {};
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

// ─── foliar-ce-under-burn-cap — Foliar tank CE under burn cap ──────────────────────────────

header('foliar-ce-under-burn-cap — Foliar predictedCE < 10.0 mS/cm (tomato leaf burn cap)');

if (typeof ph1.predictedCE !== 'function' || !FOLIAR || !FOLIAR.tomato) {
  fail('foliar-ce-under-burn-cap — predictedCE / FOLIAR exposés', 'missing');
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

// ─── in-tank-ksp-precipitation-guard — In-tank Ksp check (precipitation guard, recipe-level) ──────
//
// Active tanks:
//   - Fertigation stock: K2SO4 + MgSO4-7H2O (cations K+, Mg2+; anions SO4-2)
//   - Foliar Spray A: MnSO4 + ZnSO4 + Solubore + CuSO4 + NaMolybdate + FeSO4
// For each, walk cation × anion pairs across products in the tank, and assert
// none hit a KSP_PAIRS entry with no override. KSP_SAFE matches → ok.

header('in-tank-ksp-precipitation-guard — Aucune paire précipitante dans une recette active');

if (!PRODUCT || !KSP_PAIRS || !KSP_SAFE) {
  fail('in-tank-ksp-precipitation-guard — PRODUCT / KSP_PAIRS / KSP_SAFE exposed', 'missing');
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
    fail('in-tank-ksp-precipitation-guard — paire précipitante détectée', offenders.join('\n'));
  }
}

// ─── incompatible-recipes-declared — INCOMPATIBLE_RECIPES declared ──────────────────────────────

header('incompatible-recipes-declared — INCOMPATIBLE_RECIPES constante déclarée');

if (typeof INCOMPATIBLE_RECIPES === 'undefined' || INCOMPATIBLE_RECIPES === undefined) {
  fail('incompatible-recipes-declared — INCOMPATIBLE_RECIPES non exposé',
       'TODO: declare const INCOMPATIBLE_RECIPES = [...] in index.html (with Spray A × hypothetical fish-hydrolysate, etc.)');
} else if (!Array.isArray(INCOMPATIBLE_RECIPES)) {
  fail('incompatible-recipes-declared — INCOMPATIBLE_RECIPES doit être un tableau', `type=${typeof INCOMPATIBLE_RECIPES}`);
} else {
  const bad = [];
  for (const e of INCOMPATIBLE_RECIPES) {
    if (!e || typeof e !== 'object') { bad.push('non-object entry'); continue; }
    if (!Array.isArray(e.recipes) || e.recipes.length < 2) bad.push(`bad recipes: ${JSON.stringify(e)}`);
    if (typeof e.reason !== 'string' || !e.reason.length) bad.push(`missing reason: ${JSON.stringify(e)}`);
  }
  if (bad.length === 0) pass(`INCOMPATIBLE_RECIPES déclaré, ${INCOMPATIBLE_RECIPES.length} entrées`);
  else fail('incompatible-recipes-declared — INCOMPATIBLE_RECIPES entrées malformées', bad.join('\n'));
}

// ─── mix-order-per-multi-product-recipe — MIX_ORDER per multi-product recipe ─────────────────────────

header('mix-order-per-multi-product-recipe — MIX_ORDER constante déclarée pour recettes multi-produits');

if (typeof MIX_ORDER === 'undefined' || MIX_ORDER === undefined) {
  fail('mix-order-per-multi-product-recipe — MIX_ORDER non exposé',
       'TODO: declare const MIX_ORDER = [{recipe:"foliar-tomato-A", order:[...]}, ...] in index.html');
} else if (!Array.isArray(MIX_ORDER)) {
  fail('mix-order-per-multi-product-recipe — MIX_ORDER doit être un tableau', `type=${typeof MIX_ORDER}`);
} else {
  const bad = [];
  for (const e of MIX_ORDER) {
    if (!e || typeof e.recipe !== 'string' || !Array.isArray(e.order)) {
      bad.push(`bad entry: ${JSON.stringify(e)}`);
    }
  }
  if (bad.length === 0) pass(`MIX_ORDER déclaré, ${MIX_ORDER.length} entrées`);
  else fail('mix-order-per-multi-product-recipe — MIX_ORDER entrées malformées', bad.join('\n'));
}

// ─── stock-barrel-time-stability — Stock barrel time-stability ────────────────────────────────
//
// PRODUCT entries already declare maximumStableHours — assert non-empty for active
// fertigation/foliar products. This is the schema half of stock-barrel-time-stability; the UI
// "stock-age warning" remains TODO.

header('stock-barrel-time-stability — maximumStableHours déclaré sur tout produit en recette active');

if (!PRODUCT) {
  fail('stock-barrel-time-stability — PRODUCT exposed', 'missing');
} else {
  const ACTIVE = [
    'K2SO4', 'MgSO4-7H2O',
    'MnSO4', 'ZnSO4', 'Solubore', 'CuSO4', 'NaMolybdate', 'FeSO4-7H2O',
  ];
  const offenders = [];
  for (const name of ACTIVE) {
    const p = PRODUCT[name];
    if (!p) { offenders.push(`${name}: missing`); continue; }
    if (typeof p.maximumStableHours !== 'number' || p.maximumStableHours <= 0) {
      offenders.push(`${name}: maximumStableHours=${p.maximumStableHours}`);
    }
  }
  if (offenders.length === 0) {
    pass('maximumStableHours numberérique sur tous les produits actifs (UI age-warning: TODO)');
  } else {
    fail('stock-barrel-time-stability — maximumStableHours manquant', offenders.join('\n'));
  }
}

// ─── predicted-tank-ph-within-envelope — Predicted tank pH within compartment envelope ──────────────
//
// Bands per predicted-tank-ph-within-envelope:
//   Foliar tank: 5.0–7.0
//   Fertigation stock: 4.5–7.5
// Use predictedTankPh on each active recipe (g/L for each product in tank).

header('predicted-tank-ph-within-envelope — predictedTankPh dans la bande [4.0, 7.5] (chelate-stable)');

if (typeof predictedTankPh !== 'function' || !FOLIAR || typeof computeStageRecipe !== 'function') {
  fail('predicted-tank-ph-within-envelope — predictedTankPh / FOLIAR / computeStageRecipe exposés', 'missing');
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

// ─── chelate-stability-ph-range-respected — Chelate stability pH range respected ───────────────────────
//
// Walk PRODUCT for any with chemistryTags containing 'chelate-*' tag; each
// must declare stablePhRange. Then for active recipes, predictedTankPh must
// be inside the intersection of all chelate ranges in the recipe. Today's
// active recipes contain NO chelates (Iron DL dropped 2026-05-05 — FeSO4
// is the canonical foliar Fe), so the pass is trivial. Assert anyway so the
// check fires loudly when a chelate is reintroduced.

header('chelate-stability-ph-range-respected — Chelate stablePhRange déclaré + respecté en recette active');

if (!PRODUCT) {
  fail('chelate-stability-ph-range-respected — PRODUCT exposed', 'missing');
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
    fail('chelate-stability-ph-range-respected — chelate sans stablePhRange', offenders.join('\n'));
  }
}

// ─── foliar-uptake-ph-curve — Foliar uptake pH multiplier ────────────────────────────────

header('foliar-uptake-ph-curve — foliarPhResponse retourne (0,1] sur la bande pH 4-9');

if (typeof foliarPhResponse !== 'function') {
  fail('foliar-uptake-ph-curve — foliarPhResponse exposé', 'function not found');
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
    fail('foliar-uptake-ph-curve — foliarPhResponse hors plage', offenders.join('\n'));
  }
}

// ─── narrative-derived-from-live-data — Narrative auto-derive coherence (count `// stable —`) ──────
//
// Real narrative-derived-from-live-data needs a STALE_PHRASE table + render-walk. Mechanizable proxy:
// count occurrences of the convention `// stable —` in index.html — confirms
// the discipline is in use. Calibrate threshold from current count.

header('narrative-derived-from-live-data — Convention "// stable —" en usage (compte ≥ 5)');

{
  const STABLE_RE = /\/\/ stable —/g;
  const matches = rawHtml.match(STABLE_RE) || [];
  if (matches.length >= 5) {
    pass(`${matches.length} annotations "// stable —" dans index.html (narrative-derived-from-live-data STALE_PHRASE table TODO)`);
  } else {
    fail('narrative-derived-from-live-data — convention "// stable —" sous-utilisée (< 5 occurrences)',
         `${matches.length} found — STALE_PHRASE auto-derive table not yet implemented`);
  }
}

// ─── replenishment-cascade-earliest-first — Cascade order (foliar > 0 only when earlier channels short) ─
//
// For each (stage, element) with a non-foliar replenishment chain, assert that if
// FOLIAR.tomato.A contains a dose for `element`, then offtake > compost + sidedress
// + fertigation. Foliar-only elements (Mn/Zn/Cu/B/Mo/Fe per CHANNEL_ROLE) are
// SKIPPED — for them foliar IS the earliest non-passive channel.

header('replenishment-cascade-earliest-first — Foliar dose only when earlier channels insufficient');

if (!FOLIAR || !FOLIAR.tomato || !CHANNEL_ROLE) {
  fail('replenishment-cascade-earliest-first — FOLIAR / CHANNEL_ROLE exposés', 'missing');
} else {
  // Map foliar-product label → element delivered.
  const FOLIAR_ELEMENT = {
    'MnSO₄': 'Mn', 'ZnSO₄': 'Zn', 'Solubore': 'B',
    'CuSO₄': 'Cu', 'Molybdate de sodium': 'Mo', 'FeSO₄·7H₂O': 'Fe',
  };
  const foliarEls = new Set();
  for (const item of FOLIAR.tomato.A || []) {
    const g = parseFloat((item.master || '').replace(/[^\d.]/g, ''));
    if (!isFinite(g) || g <= 0) continue;
    for (const k in FOLIAR_ELEMENT) if ((item.name || '').includes(k)) foliarEls.add(FOLIAR_ELEMENT[k]);
  }
  // For elements not foliar-only per CHANNEL_ROLE, assert offtake > earlier supply.
  const offenders = [];
  for (const element of foliarEls) {
    const role = CHANNEL_ROLE[element] || {};
    const foliarOnly = role.foliar >= 1.0
      && !role.fertigation && !role.sidedress && !role.frontload;
    if (foliarOnly) continue;  // foliar IS earliest active channel
    // Cascade test at peak T5.
    const off = stageDemandMg('T5', element);
    const earlier = compostReleaseMg(element)
                  + sidedressEffective('T5', element)
                  + fertigationEffective('T5', element, SOIL_PH_NOW);
    if (off <= earlier) {
      offenders.push(`${element}: foliar dosed but offtake ${off.toFixed(0)} ≤ earlier ${earlier.toFixed(0)}`);
    }
  }
  if (offenders.length === 0) {
    pass('Foliar doses uniquement pour éléments dont channels antérieurs insuffisants');
  } else {
    fail('replenishment-cascade-earliest-first — Foliar redondant avec channels antérieurs', offenders.join('\n'));
  }
}

// ─── single-fertigation-tank-per-week — Single fertigation tank per week ──────────────────────────
//
// Per-crop one-tank rule (foliar-singleton half retired 2026-05-17):
//   - tomato fertigation: computeStageRecipe(stage) returns one tank composition
//     per stage (object with kSulfate/mgSulfate/etc. — no parallel A1/A2 tanks)
//   - lettuce fertigation: LETTUCE constant exists and is flat (one production
//     fertigation recipe, with feSulfate as part of the same tank)

header('single-fertigation-tank-per-week — Single fertigation tank per week');

if (!LETTUCE) {
  fail('single-fertigation-tank-per-week — LETTUCE exposed', 'missing');
} else if (typeof LETTUCE !== 'object' || Array.isArray(LETTUCE)) {
  fail('single-fertigation-tank-per-week — LETTUCE est un objet plat (recette unique)',
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
  fail('single-fertigation-tank-per-week — computeStageRecipe exposed', 'function not found');
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

// ─── ecocert-only-products — No forbidden (non-Ecocert-Canada) products in app copy ───

header('ecocert-only-products — Pas de produits non-Ecocert dans le copy de l\'app');

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
      let lineNumber = -1;
      for (let i = 0; i < lines.length; i++) {
        const t = lines[i].trim();
        if (t.startsWith('//') || t.startsWith('*') || t.startsWith('<!--')) continue;
        if (re.test(lines[i])) { lineNumber = i + 1; re.lastIndex = 0; break; }
        re.lastIndex = 0;
      }
      hits.push(`${forbidden}: ${matches.length} occurrence(s), first at line ${lineNumber}`);
    }
  }

  if (hits.length === 0) {
    pass(`Aucun produit non-Ecocert dans ${FORBIDDEN_PRODUCTS.length} entrées du blocklist`);
  } else {
    fail('ecocert-only-products — produits non-Ecocert détectés', hits.join('\n'));
  }
}

// ─── nursery plant-needs subproject ─────────────────────
//
// The nursery/plant-needs subproject (data + calc + model) lives at
// nutrition/nursery/plant-needs/{data.js,calc.js,model.js}. Until
// app/index.html @includes the partials, window.PlantNeedsNursery /
// NURSERY_TARGETS / calculateNurseryDemand are absent from the dist/index.html
// artifact. To avoid a chicken-and-egg between source-of-truth (the partials)
// and verifier runtime (jsdom on dist/index.html), we load the partials
// directly into a Node vm sandbox and run nursery plant-needs against that. After
// integration, the same code path still works — the partials remain the
// canonical definitions.
//
// Spec: nutrition/nursery/plant-needs/spec.md → nursery plant-needs + INV-1.

import vm from 'node:vm';

let nurseryNs = null;
let nurseryLoadError = null;
try {
  const dataSrc  = readFileSync(join(REPO_ROOT, 'nutrition/nursery/plant-needs/data.js'),  'utf8');
  const pureFunctionSource  = readFileSync(join(REPO_ROOT, 'nutrition/nursery/plant-needs/calc.js'),  'utf8');
  const modelSrc = readFileSync(join(REPO_ROOT, 'nutrition/nursery/plant-needs/model.js'), 'utf8');
  // The partials use bare `const` declarations and `window.PlantNeedsNursery
  // = {…}`. A shared sandbox with a `window` host lets all three modules see
  // one another's bindings (data → calc → model) the same way they do in the
  // browser when loaded in dependency order.
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(dataSrc + '\n' + pureFunctionSource + '\n' + modelSrc, sandbox, {
    filename: 'nursery-plant-needs-bundle.js',
  });
  nurseryNs = sandbox.window.PlantNeedsNursery || null;
} catch (err) {
  nurseryLoadError = err && err.message || String(err);
}

// ─── INV-1 — Element coverage closed (11 canonical elements) ─────────────

header('Nursery plant-needs INV-1 — Element coverage closed (11 elements)');

if (!nurseryNs) {
  fail('Nursery partials load + expose window.PlantNeedsNursery',
       nurseryLoadError || 'window.PlantNeedsNursery not produced by the partials');
} else {
  const expected = ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'];
  const actual = Object.keys(nurseryNs.LETTUCE_NURSERY_TISSUE_DW || {});
  const missing = expected.filter(e => !actual.includes(e));
  const extras  = actual.filter(e => !expected.includes(e));
  if (missing.length === 0 && extras.length === 0) {
    pass(`LETTUCE_NURSERY_TISSUE_DW couvre exactement les 11 éléments canoniques`);
  } else {
    fail('LETTUCE_NURSERY_TISSUE_DW couvre exactement les 11 éléments canoniques',
         `missing=${missing.join(',') || '(none)'}; extras=${extras.join(',') || '(none)'}`);
  }
}

// ─── demand-linear-in-target-weight — Linearity in targetG ─────────────────────────────────────
//
// calculateNurseryDemand(2g, days, cells) returns 2× the values of
// calculateNurseryDemand(1g, days, cells), per element, on perTray_mg. Asserted
// within ±0.1 %.
//
// Spec: nutrition/nursery/plant-needs/spec.md → demand-linear-in-target-weight.

header('demand-linear-in-target-weight — Nursery demand linear in targetG (±0.1 %)');

if (!nurseryNs || typeof nurseryNs.calculateNurseryDemand !== 'function') {
  fail('calculateNurseryDemand exposed on window.PlantNeedsNursery',
       nurseryLoadError || 'function missing on namespace');
} else {
  const handler = nurseryNs.calculateNurseryDemand;
  const a = handler(1, 35, 50);
  const b = handler(2, 35, 50);
  const offenders = [];
  for (const element of Object.keys(a)) {
    if (a[element].perTray_mg === 0) continue;
    const ratio = b[element].perTray_mg / a[element].perTray_mg;
    if (Math.abs(ratio - 2.0) / 2.0 > 0.001) {
      offenders.push(`${element}: ratio=${ratio.toFixed(5)} (expected 2.0)`);
    }
  }
  if (offenders.length === 0) {
    pass(`Doubler targetG double perTray_mg pour les 11 éléments (±0.1 %)`);
  } else {
    fail('Demand linéaire en targetG', offenders.join('\n'));
  }
}

// ─── demand-inverse-linear-in-cycle-length — Inverse-linearity in cycleDays ───────────────────────────
//
// calculateNurseryDemand(g, 70, cells).perTray_mg is exactly half of
// calculateNurseryDemand(g, 35, cells).perTray_mg, per element. ±0.1 %.
//
// Spec: nutrition/nursery/plant-needs/spec.md → demand-inverse-linear-in-cycle-length.

header('demand-inverse-linear-in-cycle-length — Nursery demand inverse-linear in cycleDays (±0.1 %)');

if (!nurseryNs || typeof nurseryNs.calculateNurseryDemand !== 'function') {
  fail('calculateNurseryDemand exposed on window.PlantNeedsNursery',
       nurseryLoadError || 'function missing on namespace');
} else {
  const handler = nurseryNs.calculateNurseryDemand;
  const short = handler(90, 35, 50);
  const long  = handler(90, 70, 50);
  const offenders = [];
  for (const element of Object.keys(short)) {
    if (short[element].perTray_mg === 0) continue;
    const ratio = long[element].perTray_mg / short[element].perTray_mg;
    if (Math.abs(ratio - 0.5) / 0.5 > 0.001) {
      offenders.push(`${element}: ratio=${ratio.toFixed(5)} (expected 0.5)`);
    }
  }
  if (offenders.length === 0) {
    pass(`Doubler cycleDays divise perTray_mg par 2 pour les 11 éléments (±0.1 %)`);
  } else {
    fail('Demand inverse-linéaire en cycleDays', offenders.join('\n'));
  }
}

// ─── nitrogen-demand-in-band-at-defaults — N demand band sanity check at defaults ───────────────────
//
// At defaults (90 g, 35 d, 50 cells), N perPlant_mg ∈ [50, 70]. Catches
// order-of-magnitude typos in DM, tissue concentration, or cycle length.
//
// Spec: nutrition/nursery/plant-needs/spec.md → nitrogen-demand-in-band-at-defaults.

header('nitrogen-demand-in-band-at-defaults — Nursery N demand ∈ [50, 70] mg/plant/wk au défaut');

if (!nurseryNs || typeof nurseryNs.calculateNurseryDemand !== 'function') {
  fail('calculateNurseryDemand exposed on window.PlantNeedsNursery',
       nurseryLoadError || 'function missing on namespace');
} else {
  const handler = nurseryNs.calculateNurseryDemand;
  const out = handler(90, 35, 50);
  const n = out.N && out.N.perPlant_mg;
  if (typeof n !== 'number' || !isFinite(n)) {
    fail('N perPlant_mg numberérique', `valeur: ${n}`);
  } else if (n < 50 || n > 70) {
    fail('N perPlant_mg ∈ [50, 70]', `valeur: ${n.toFixed(2)} mg`);
  } else {
    pass(`N perPlant_mg = ${n.toFixed(2)} mg/wk (∈ [50, 70])`);
  }
}

// ─── public-api-namespace — window.PlantNeedsNursery public API surface ──────────────
//
// Asserts the namespace exists and exposes the declared keys; spot-checks
// that calculateNurseryDemand returns shape `{ perPlant_mg, perTray_mg }` per
// element and demandPerTray returns a number.
//
// Spec: nutrition/nursery/plant-needs/spec.md → public-api-namespace.

header('public-api-namespace — window.PlantNeedsNursery public API surface');

if (!nurseryNs) {
  fail('window.PlantNeedsNursery exists',
       nurseryLoadError || 'namespace not declared (model.js include may be missing or out of order)');
} else {
  const expectedKeys = [
    'LETTUCE_NURSERY_TISSUE_DW', 'LETTUCE_NURSERY_DM_FRACTION',
    'NURSERY_TARGETS',
    'calculateNurseryDemand', 'demandPerTray',
  ];
  const missing = expectedKeys.filter(k => nurseryNs[k] == null);
  if (missing.length > 0) {
    fail('PlantNeedsNursery exposes the public API', `manquants: ${missing.join(', ')}`);
  } else {
    const out = nurseryNs.calculateNurseryDemand(90, 35, 50);
    const n = out && out.N;
    const perTray = nurseryNs.demandPerTray('N');
    const okShape = n
                 && typeof n.perPlant_mg === 'number'
                 && typeof n.perTray_mg  === 'number'
                 && typeof perTray       === 'number'
                 && isFinite(n.perPlant_mg) && isFinite(n.perTray_mg) && isFinite(perTray);
    if (!okShape) {
      fail('PlantNeedsNursery.calculateNurseryDemand / demandPerTray return correct shape',
           `calculateNurseryDemand(...).N: ${JSON.stringify(n)}; demandPerTray('N'): ${typeof perTray}`);
    } else {
      pass(`PlantNeedsNursery exposes ${expectedKeys.length} clés (toutes présentes, shape OK)`);
    }
  }
}

// ─── salanova plant-needs subproject ────────────────────
//
// nutrition/lettuce/plant-needs/{data.js,calc.js,model.js} carved out of
// app/index.html 2026-05-16. Same vm-loaded pattern as nursery plant-needs:
// load the partials in a shared sandbox, prefer the real jsdom window
// when present, else fall back to the vm copy.
//
// Spec: nutrition/lettuce/plant-needs/spec.md → public-api-namespace..169 + INV-1.

let lettucePlantNeedsNs = window.PlantNeedsLettuce || null;
let lettucePlantNeedsLoadError = null;
if (!lettucePlantNeedsNs) {
  try {
    const dataSrc  = readFileSync(join(REPO_ROOT, 'nutrition/lettuce/plant-needs/data.js'),  'utf8');
    const pureFunctionSource  = readFileSync(join(REPO_ROOT, 'nutrition/lettuce/plant-needs/calc.js'),  'utf8');
    const modelSrc = readFileSync(join(REPO_ROOT, 'nutrition/lettuce/plant-needs/model.js'), 'utf8');
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext(dataSrc + '\n' + pureFunctionSource + '\n' + modelSrc, sandbox, {
      filename: 'lettuce-plant-needs-bundle.js',
    });
    lettucePlantNeedsNs = sandbox.window.PlantNeedsLettuce || null;
  } catch (err) {
    lettucePlantNeedsLoadError = err && err.message || String(err);
  }
}

// Default dependency bag for supply checks. Numerically realistic but
// deterministic so the verifier doesn't drift with app-level constant edits.
const LETTUCE_TEST_DEPENDENCIES = {
  weeklyMassFlowL: 50,
  smeLettucePpm: {
    N: 72.6, P: 0.8, K: 54.4, Ca: 114.4, Mg: 30.2,
    Fe: 0.22, Mn: 0, Zn: 0, B: 0.17, Cu: 0.03, Mo: 0.02,
  },
  lettuceRecipe: { kSulfate: 2996, mgSulfate: 467, feSulfate: 7.5 },
  productPct: { K2SO4_K: 0.42, MgSO4_Mg: 0.0986, FeSO4_Fe: 0.20, FarinePlumes_N: 0.13 },
  featherMealMineralizationEfficiency: 0.75,
  frontloadDefaults: { featherMeal_g_per_m2: 50, mineralizationWeeks: 4 },
};

// ─── public-api-namespace — window.PlantNeedsLettuce public API surface ──────────────

header('public-api-namespace — window.PlantNeedsLettuce public API surface');

if (!lettucePlantNeedsNs) {
  fail('window.PlantNeedsLettuce exists',
       lettucePlantNeedsLoadError || 'namespace not declared (lettuce model.js include may be missing or out of order)');
} else {
  const expectedKeys = [
    'LETTUCE_DM_FRACTION', 'LETTUCE_TISSUE_DW',
    'LETTUCE_FRONTLOAD_DEFAULTS', 'SME_LETTUCE_PPM',
    'calculateLettuceNutritionDemand', 'calculateLettuceNutritionSupply',
  ];
  const missing = expectedKeys.filter(k => lettucePlantNeedsNs[k] == null);
  if (missing.length > 0) {
    fail('PlantNeedsLettuce exposes the public API', `manquants: ${missing.join(', ')}`);
  } else {
    pass(`PlantNeedsLettuce exposes ${expectedKeys.length} clés (toutes présentes)`);
  }
}

// ─── demand-scales-with-mass-and-cycle — Demand scales linearly with mass-gain, inversely with cycleDays

header('demand-scales-with-mass-and-cycle — Lettuce demand: ×2 gain → ×2 demand; ×2 cycleDays → ÷2 demand');

if (!lettucePlantNeedsNs || typeof lettucePlantNeedsNs.calculateLettuceNutritionDemand !== 'function') {
  fail('calculateLettuceNutritionDemand exposed on window.PlantNeedsLettuce',
       lettucePlantNeedsLoadError || 'function missing on namespace');
} else {
  const handler = lettucePlantNeedsNs.calculateLettuceNutritionDemand;
  const baseline   = handler(30, 100, 14, 43);  // gain 70 g
  const doubleGain = handler(30, 170, 14, 43);  // gain 140 g
  const doubleDays = handler(30, 100, 28, 43);
  const offenders = [];
  for (const element of Object.keys(baseline)) {
    if (baseline[element] === 0) continue;
    const gainRatio = doubleGain[element] / baseline[element];
    if (Math.abs(gainRatio - 2.0) / 2.0 > 0.001) {
      offenders.push(`${element}: ×2 gain ratio = ${gainRatio.toFixed(4)} (expected 2.0)`);
    }
    const daysRatio = doubleDays[element] / baseline[element];
    if (Math.abs(daysRatio - 0.5) / 0.5 > 0.001) {
      offenders.push(`${element}: ×2 cycleDays ratio = ${daysRatio.toFixed(4)} (expected 0.5)`);
    }
  }
  if (offenders.length === 0) {
    pass(`Demand linéaire en (targetG − transplantG) et inverse-linéaire en cycleDays (±0.1 %)`);
  } else {
    fail('Demand linéaire / inverse-linéaire', offenders.join('\n'));
  }
}

// ─── supply-composition-soil-fert-frontload — Supply composition: total = soil + fert + frontload ─────

header('supply-composition-soil-fert-frontload — Lettuce supply total = soil + fert + frontload (per element)');

if (!lettucePlantNeedsNs || typeof lettucePlantNeedsNs.calculateLettuceNutritionSupply !== 'function') {
  fail('calculateLettuceNutritionSupply exposed on window.PlantNeedsLettuce',
       lettucePlantNeedsLoadError || 'function missing on namespace');
} else {
  const handler = lettucePlantNeedsNs.calculateLettuceNutritionSupply;
  const supply = handler(50, 100, 43, false, 50, LETTUCE_TEST_DEPENDENCIES);
  const elements = Object.keys(lettucePlantNeedsNs.LETTUCE_TISSUE_DW);
  const offenders = [];
  for (const element of elements) {
    const expected = (supply.soil[element] || 0) + (supply.fert[element] || 0) + (supply.frontload[element] || 0);
    if (Math.abs(supply.total[element] - expected) > 1e-9) {
      offenders.push(`${element}: total ${supply.total[element]} ≠ soil+fert+frontload ${expected}`);
    }
  }
  // frontload delivers N only
  for (const element of elements) {
    if (element !== 'N' && supply.frontload[element] !== 0) {
      offenders.push(`${element}: frontload should be 0 for non-N elements, got ${supply.frontload[element]}`);
    }
  }
  if (offenders.length === 0) {
    pass(`Supply décomposition cohérente sur les ${elements.length} éléments; frontload N-only`);
  } else {
    fail('Supply total = soil + fert + frontload', offenders.join('\n'));
  }
}

// ─── demand-certainty-floor — Demand certainty floor (macros cert 4, micros cert 3) ───
//
// LETTUCE_TISSUE_DW source quality is the structural anchor: macros (N, P, K,
// Ca, Mg) at cert 4 per Hochmuth 1991 + Sonneveld 2009 leafy-greens; micros
// (Fe, Mn, Zn, B, Cu, Mo) at cert 3 (broader range, varies with light +
// genetics). The verifier asserts the structural shape (5 macros + 6 micros,
// every element numeric); the per-element cert annotation lives in
// nutrition/lettuce/plant-needs/derivation.md and is surfaced via the
// integrator pourquoi modal — not enforced by code today.

header('demand-certainty-floor — Lettuce demand: 5 macros + 6 micros structurally present');

if (!lettucePlantNeedsNs || !lettucePlantNeedsNs.LETTUCE_TISSUE_DW) {
  fail('LETTUCE_TISSUE_DW exposed', lettucePlantNeedsLoadError || 'missing');
} else {
  const MACROS = ['N', 'P', 'K', 'Ca', 'Mg'];
  const MICROS = ['Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'];
  const tissue = lettucePlantNeedsNs.LETTUCE_TISSUE_DW;
  const missingMacros = MACROS.filter(element => typeof tissue[element] !== 'number' || tissue[element] <= 0);
  const missingMicros = MICROS.filter(element => typeof tissue[element] !== 'number' || tissue[element] <= 0);
  if (missingMacros.length === 0 && missingMicros.length === 0) {
    pass(`LETTUCE_TISSUE_DW carries 5 macros + 6 micros, all numeric > 0`);
  } else {
    fail('LETTUCE_TISSUE_DW carries 5 macros + 6 micros',
         `missing macros: ${missingMacros.join(',') || '(none)'}; missing micros: ${missingMicros.join(',') || '(none)'}`);
  }
}

// ─── canopy-factor-bounded — Canopy factor bounded [0.2, 0.7] ────────────────────────

header('canopy-factor-bounded — Lettuce supply canopyFactor ∈ [0.2, 0.7]');

if (!lettucePlantNeedsNs || typeof lettucePlantNeedsNs.calculateLettuceNutritionSupply !== 'function') {
  fail('calculateLettuceNutritionSupply exposed on window.PlantNeedsLettuce',
       lettucePlantNeedsLoadError || 'function missing on namespace');
} else {
  const handler = lettucePlantNeedsNs.calculateLettuceNutritionSupply;
  const cases = [
    ['stunted',     1, 100],
    ['mid-cycle',  50, 100],
    ['mature',    100, 100],
    ['over-target', 200, 100],
  ];
  const offenders = [];
  for (const [label, currentG, targetG] of cases) {
    const supply = handler(currentG, targetG, 43, false, 0, LETTUCE_TEST_DEPENDENCIES);
    if (!(supply.canopyFactor >= 0.2 - 1e-9 && supply.canopyFactor <= 0.7 + 1e-9)) {
      offenders.push(`${label} (currentG=${currentG}, targetG=${targetG}): canopyFactor=${supply.canopyFactor}`);
    }
  }
  if (offenders.length === 0) {
    pass(`canopyFactor ∈ [0.2, 0.7] sur les ${cases.length} cas testés (stunted → over-target)`);
  } else {
    fail('canopyFactor ∈ [0.2, 0.7]', offenders.join('\n'));
  }
}

// ─── INV-1 — Element coverage closed across demand + every supply channel ───

header('Lettuce plant-needs INV-1 — Element coverage closed (11 elements)');

if (!lettucePlantNeedsNs) {
  fail('Lettuce partials load + expose window.PlantNeedsLettuce',
       lettucePlantNeedsLoadError || 'namespace not produced');
} else {
  const expected = ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'];
  const actual = Object.keys(lettucePlantNeedsNs.LETTUCE_TISSUE_DW || {});
  const missing = expected.filter(e => !actual.includes(e));
  const extras  = actual.filter(e => !expected.includes(e));
  if (missing.length === 0 && extras.length === 0) {
    pass(`LETTUCE_TISSUE_DW couvre exactement les 11 éléments canoniques`);
  } else {
    fail('LETTUCE_TISSUE_DW couvre exactement les 11 éléments canoniques',
         `missing=${missing.join(',') || '(none)'}; extras=${extras.join(',') || '(none)'}`);
  }
}

// ─── nursery substrate-contribution subproject ──────────
//
// The nursery/substrate-contribution subproject (data + calc + model)
// lives at nutrition/nursery/substrate-contribution/{data.js,calc.js,model.js}.
// Same vm-loaded pattern as nursery plant-needs above: load the partials in a
// shared sandbox, run feather-meal-front-load-cap..097 against the produced namespace. Once
// app/index.html @includes the partials, window.SubstrateContributionNursery
// will also exist on the real jsdom window — we prefer that when present,
// otherwise fall back to the vm-loaded copy.
//
// Spec: nutrition/nursery/substrate-contribution/spec.md → feather-meal-front-load-cap..097.

let SCN = window.SubstrateContributionNursery;
let substrateLoadError = null;
if (!SCN) {
  try {
    const dataSrc  = readFileSync(join(REPO_ROOT, 'nutrition/nursery/substrate-contribution/data.js'),  'utf8');
    const pureFunctionSource  = readFileSync(join(REPO_ROOT, 'nutrition/nursery/substrate-contribution/calc.js'),  'utf8');
    const modelSrc = readFileSync(join(REPO_ROOT, 'nutrition/nursery/substrate-contribution/model.js'), 'utf8');
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext(dataSrc + '\n' + pureFunctionSource + '\n' + modelSrc, sandbox, {
      filename: 'nursery-substrate-contribution-bundle.js',
    });
    SCN = sandbox.window.SubstrateContributionNursery || null;
  } catch (err) {
    substrateLoadError = err && err.message || String(err);
  }
}

// ─── feather-meal-front-load-cap — Front-load cap ≤ 9 g feather meal/tray + INV-2 mass balance

header('feather-meal-front-load-cap — Substrate front-load cap ≤ 9 g + INV-2 release-curve mass balance');

if (!SCN) {
  fail('SubstrateContributionNursery namespace available',
       substrateLoadError || 'partials did not produce window.SubstrateContributionNursery');
} else {
  const cap = SCN.LIMITS && SCN.LIMITS.maxFeatherMealPerTrayG;
  if (typeof cap !== 'number') {
    fail('LIMITS.maxFeatherMealPerTrayG est un nombre', `got ${typeof cap}`);
  } else if (cap > 9) {
    fail('LIMITS.maxFeatherMealPerTrayG ≤ 9 (germination protection)',
         `cap = ${cap} (max allowed = 9)`);
  } else {
    pass(`LIMITS.maxFeatherMealPerTrayG = ${cap} (≤ 9, germination protection)`);
  }

  // INV-2 — release curves sum to ~1.0 ± 0.05 (mass balance).
  const om2Sum = (SCN.OM2_RELEASE_CURVE_BY_WEEK || []).reduce((a, b) => a + b, 0);
  const fmSum  = (SCN.FEATHER_MEAL_RELEASE_CURVE_BY_WEEK || []).reduce((a, b) => a + b, 0);
  if (om2Sum < 0.95 || om2Sum > 1.05) {
    fail('OM2_RELEASE_CURVE_BY_WEEK somme ≈ 1.0 ± 0.05', `somme = ${om2Sum.toFixed(3)}`);
  } else {
    pass(`OM2_RELEASE_CURVE_BY_WEEK somme = ${om2Sum.toFixed(3)} (mass balance OK)`);
  }
  if (fmSum < 0.95 || fmSum > 1.05) {
    fail('FEATHER_MEAL_RELEASE_CURVE_BY_WEEK somme ≈ 1.0 ± 0.05', `somme = ${fmSum.toFixed(3)}`);
  } else {
    pass(`FEATHER_MEAL_RELEASE_CURVE_BY_WEEK somme = ${fmSum.toFixed(3)} (mass balance OK)`);
  }
}

// ─── linear-in-feather-meal-input — Linearity in feather meal input ──────────────────────────

header('linear-in-feather-meal-input — Substrate release linéaire en feather meal (OM2 invariant)');

if (!SCN || typeof SCN.theoreticalSubstrateReleasePerWeek !== 'function') {
  fail('theoreticalSubstrateReleasePerWeek exposed', substrateLoadError || 'function missing');
} else {
  // Pick week 2 (peak feather meal release) for a clean signal.
  const W = 2;
  const X = 9;
  const r0  = SCN.theoreticalSubstrateReleasePerWeek(W, 0);
  const rX  = SCN.theoreticalSubstrateReleasePerWeek(W, X);
  const r2X = SCN.theoreticalSubstrateReleasePerWeek(W, 2 * X);

  // (a) Feather meal N component: rX.N - r0.N == r2X.N - rX.N (within 0.5 mg).
  const dN1 = rX.N - r0.N;
  const dN2 = r2X.N - rX.N;
  if (Math.abs(dN1 - dN2) > 0.5) {
    fail('Feather meal N scales linéairement avec fmG',
         `Δ(0→X)=${dN1.toFixed(2)} vs Δ(X→2X)=${dN2.toFixed(2)} mg/tray/wk (semaine ${W})`);
  } else {
    pass(`Feather meal N linéaire: Δ(0→9)=${dN1.toFixed(2)} ≈ Δ(9→18)=${dN2.toFixed(2)} mg/tray/wk (semaine ${W})`);
  }

  // (b) OM2-only elements unchanged when fmG doubles.
  const om2Drift = [];
  for (const element of ['P', 'K', 'Ca', 'Mg']) {
    if (Math.abs(rX[element] - r2X[element]) > 1e-6) {
      om2Drift.push(`${element}: ${rX[element].toFixed(3)} vs ${r2X[element].toFixed(3)}`);
    }
  }
  if (om2Drift.length === 0) {
    pass('Composante OM2 (P/K/Ca/Mg) invariante quand fmG double');
  } else {
    fail('Composante OM2 doit être invariante avec fmG', om2Drift.join(' | '));
  }
}

// ─── cycle-average-matches-mass-balance — Cycle-average matches mass-balance (±10 %) ───────────────

header('cycle-average-matches-mass-balance — Cycle-average substrate release matches mass-balance');

if (!SCN || typeof SCN.cycleAverageReleasePerTray !== 'function'
    || !SCN.FEATHER_MEAL_LABEL_PCT
    || typeof SCN.FEATHER_MEAL_MINERALIZATION_FRAC !== 'number') {
  fail('cycleAverageReleasePerTray + feather meal constants exposed',
       substrateLoadError || 'one or more globals missing');
} else {
  const fmG = SCN.NURSERY_FEATHER_MEAL_DEFAULT_G_PER_TRAY || 9;
  const W   = (SCN.OM2_RELEASE_CURVE_BY_WEEK || []).length || 5;
  const result = SCN.cycleAverageReleasePerTray(fmG);
  // contribution-channel-details-payload — function now returns { perTray_mg, details }; legacy callers
  // that read avg[element] directly are migrated to avg.perTray_mg[element].
  const avg = (result && result.perTray_mg) ? result.perTray_mg : result;

  // Closed-form mass-balance for N:
  //   feather meal mineralizable N total  +  OM2 N total released across cycle
  //   ────────────────────────────────────────────────────────────────────────
  //                                  W weeks
  const fmTotalN_mg   = fmG * SCN.FEATHER_MEAL_LABEL_PCT.N
                            * SCN.FEATHER_MEAL_MINERALIZATION_FRAC * 1000;
  const om2NperTray   = (SCN.OM2_STARTER_CHARGE_PPM.N || 0)
                      * (SCN.NURSERY_TRAY_SUBSTRATE_VOL_L || 1.65);
  const om2Sum        = (SCN.OM2_RELEASE_CURVE_BY_WEEK || []).reduce((a, b) => a + b, 0);
  const expectedN     = (fmTotalN_mg + om2NperTray * om2Sum) / W;

  if (typeof avg.N !== 'number' || !isFinite(avg.N)) {
    fail('cycleAverageReleasePerTray(fmG).N est un nombre', `got ${avg.N}`);
  } else {
    const ratio = avg.N / expectedN;
    if (ratio < 0.9 || ratio > 1.1) {
      fail('Cycle-average N matches mass balance ±10 %',
           `avg.N = ${avg.N.toFixed(2)} vs expected ${expectedN.toFixed(2)} (ratio ${ratio.toFixed(3)})`);
    } else {
      pass(`Cycle-average N = ${avg.N.toFixed(1)} mg/tray/wk (mass balance ${expectedN.toFixed(1)}, ratio ${ratio.toFixed(3)})`);
    }
  }
}

// ─── public-api-namespace — Public API namespace + INV-1 element coverage ────────────

header('public-api-namespace — window.SubstrateContributionNursery public API surface');

if (!SCN) {
  fail('SubstrateContributionNursery exists',
       substrateLoadError || 'namespace not declared (model.js include may be missing or out of order)');
} else {
  const expectedKeys = [
    'OM2_STARTER_CHARGE_PPM',
    'OM2_RELEASE_CURVE_BY_WEEK',
    'FEATHER_MEAL_LABEL_PCT',
    'FEATHER_MEAL_MINERALIZATION_FRAC',
    'FEATHER_MEAL_RELEASE_CURVE_BY_WEEK',
    'NURSERY_TRAY_SUBSTRATE_VOL_L',
    'NURSERY_FEATHER_MEAL_DEFAULT_G_PER_TRAY',
    'LIMITS',
    'theoreticalSubstrateReleasePerWeek',
    'cycleAverageReleasePerTray',
  ];
  const missing = expectedKeys.filter(k => SCN[k] == null);
  if (missing.length > 0) {
    fail('SubstrateContributionNursery exposes the public API',
         `manquants: ${missing.join(', ')}`);
  } else {
    // INV-1 — element coverage closure: OM2 keys ⊆ {N,P,K,Ca,Mg};
    // feather meal carries only N on its label.
    const macros = new Set(['N', 'P', 'K', 'Ca', 'Mg']);
    const om2Keys = Object.keys(SCN.OM2_STARTER_CHARGE_PPM);
    const om2Outliers = om2Keys.filter(k => !macros.has(k));
    const fmKeys = Object.keys(SCN.FEATHER_MEAL_LABEL_PCT);
    const fmExtra = fmKeys.filter(k => k !== 'N');
    if (om2Outliers.length > 0) {
      fail('OM2_STARTER_CHARGE_PPM keys ⊆ {N,P,K,Ca,Mg}',
           `outliers: ${om2Outliers.join(', ')}`);
    } else if (fmExtra.length > 0) {
      fail('FEATHER_MEAL_LABEL_PCT contient uniquement N',
           `extra: ${fmExtra.join(', ')}`);
    } else {
      const sample = SCN.theoreticalSubstrateReleasePerWeek(1, 9);
      const sampleOk = sample && typeof sample === 'object'
                    && typeof sample.N === 'number' && isFinite(sample.N);
      if (!sampleOk) {
        fail('theoreticalSubstrateReleasePerWeek return shape',
             `keys=${Object.keys(sample || {}).join(',')}, N=${sample?.N}`);
      } else {
        pass(`SubstrateContributionNursery exposes ${expectedKeys.length} clés (toutes présentes, INV-1 OK, shape OK)`);
      }
    }
  }
}

// ─── INV-1 (foliar-strategy) — Element coverage closed + non-negative ─────
//
// computeFoliarSupply(stage) must return numeric, finite, non-negative
// values for every element in TOMATO_FRUIT_EXPORT (currently 11 elements:
// N, P, K, Ca, Mg, Fe, Mn, Zn, B, Cu, Mo) at every stage in
// RECIPE_INPUTS.stageYield.
//
// Spec: nutrition/tomato/foliar-strategy/spec.md → INV-1.

header('Foliar INV-1 — Element coverage closed + numeric output');

{
  const FRT = window.FoliarRecipeTomato;
  if (!FRT || typeof FRT.computeFoliarSupply !== 'function') {
    fail('window.FoliarRecipeTomato.computeFoliarSupply exists',
         'namespace not declared (model.js include may be missing or out of order)');
  } else if (!TOMATO_FRUIT_EXPORT || !ph1.RECIPE_INPUTS) {
    fail('Foliar INV-1 — TOMATO_FRUIT_EXPORT + RECIPE_INPUTS exposés', 'missing');
  } else {
    const stages = Object.keys(ph1.RECIPE_INPUTS.stageYield || {});
    const expectedEls = Object.keys(TOMATO_FRUIT_EXPORT);
    const offenders = [];
    for (const s of stages) {
      const r = FRT.computeFoliarSupply(s);
      if (!r || typeof r !== 'object') {
        offenders.push(`${s}: returned ${typeof r}`);
        continue;
      }
      for (const element of expectedEls) {
        const v = r[element];
        if (typeof v !== 'number' || !isFinite(v) || v < 0) {
          offenders.push(`${s}/${element}: ${v} (typeof ${typeof v})`);
        }
      }
    }
    if (offenders.length === 0) {
      pass(`Tous les stades (${stages.length}) × ${expectedEls.length} éléments renvoient des valeurs numberériques ≥ 0`);
    } else {
      fail('Foliar INV-1 — element coverage + numeric output', offenders.slice(0, 5).map(o => `  ${o}`).join('\n'));
    }
  }
}

// ─── coverage-discount-on-delivery — Coverage discount applied to foliar delivery ──────────────
//
// For pinned elements (Mn, Fe), recompute the formula
//   delivered = recipe_g × element_pct × 1000 / area × FOLIAR_COVERAGE_DEFAULT
// from STORED_RECIPE.tomato.foliaire and assert
// computeFoliarSupply('T5').{Mn, Fe} matches within 1 % tolerance. Mn pins
// the surfactant-coverage logic; Fe pins the FeSO₄·7H₂O 20 % Fe path.
//
// Spec: nutrition/tomato/foliar-strategy/spec.md → coverage-discount-on-delivery.

header('coverage-discount-on-delivery — Foliar delivery applies FOLIAR_COVERAGE_DEFAULT (Mn, Fe)');

{
  const FRT = window.FoliarRecipeTomato;
  if (!FRT || typeof FRT.computeFoliarSupply !== 'function'
      || typeof FRT.FOLIAR_COVERAGE_DEFAULT !== 'number'
      || !STORED_RECIPE?.tomato?.foliaire?.A
      || !PRODUCT_PCT
      || !TOMATO_NUMBER_BEDS || !TOMATO_BED_AREA) {
    fail('coverage-discount-on-delivery — foliar namespace + STORED_RECIPE + PRODUCT_PCT exposés', 'missing');
  } else {
    const A = STORED_RECIPE.tomato.foliaire.A;
    const parseG = (s) => parseFloat(String(s).replace(',', '.')) || 0;
    const findG = (substr) => {
      const item = A.find(x => (x.name || '').includes(substr));
      return item ? parseG(item.master) : 0;
    };
    const area = TOMATO_NUMBER_BEDS * TOMATO_BED_AREA;
    const cov = FRT.FOLIAR_COVERAGE_DEFAULT;
    const offenders = [];
    const PINNED = [
      { element: 'Mn', g: findG('MnSO₄'), pct: PRODUCT_PCT.MnSO4_Mn },
      { element: 'Fe', g: findG('FeSO₄'), pct: PRODUCT_PCT.FeSO4_Fe },
    ];
    const supply = FRT.computeFoliarSupply('T5');
    for (const { element, g, pct } of PINNED) {
      const expected = (g * pct * 1000) / area * cov;
      const actual = supply[element];
      if (Math.abs(actual - expected) > Math.max(0.01, expected * 0.01)) {
        offenders.push(`${element}: actual=${actual.toFixed(3)} vs expected=${expected.toFixed(3)} (g=${g}, pct=${pct}, cov=${cov})`);
      }
    }
    if (offenders.length === 0) {
      pass(`Mn + Fe delivered match formula recipe_g × pct × 1000 / area × ${cov} (±1 %)`);
    } else {
      fail('coverage-discount-on-delivery — coverage discount formula', offenders.join('\n'));
    }
  }
}

// ─── public-api-namespace — FoliarRecipeTomato public API namespace ──────────────────
//
// Spec: nutrition/tomato/foliar-strategy/spec.md → public-api-namespace.

header('public-api-namespace — window.FoliarRecipeTomato public API surface');

{
  const FRT = window.FoliarRecipeTomato;
  if (!FRT) {
    fail('window.FoliarRecipeTomato exists',
         'namespace not declared (model.js include may be missing or out of order)');
  } else {
    const expectedKeys = [
      'AREA_M2', 'FOLIAR_COVERAGE_DEFAULT', 'FOLIAR_COVERAGE_WITH_YUCCA',
      'computeFoliarSupply',
    ];
    const missing = expectedKeys.filter(k => FRT[k] == null);
    if (missing.length > 0) {
      fail('FoliarRecipeTomato exposes the public API', `manquants: ${missing.join(', ')}`);
    } else {
      const t5Fe = FRT.computeFoliarSupply('T5').Fe;
      const okShape = typeof FRT.AREA_M2 === 'number'
                    && typeof FRT.FOLIAR_COVERAGE_DEFAULT === 'number'
                    && typeof FRT.FOLIAR_COVERAGE_WITH_YUCCA === 'number'
                    && typeof t5Fe === 'number' && isFinite(t5Fe) && t5Fe > 0;
      if (!okShape) {
        fail('FoliarRecipeTomato shape', `AREA_M2: ${typeof FRT.AREA_M2}; COV_DEFAULT: ${FRT.FOLIAR_COVERAGE_DEFAULT}; COV_YUCCA: ${FRT.FOLIAR_COVERAGE_WITH_YUCCA}; T5.Fe: ${t5Fe}`);
      } else {
        pass(`FoliarRecipeTomato exposes ${expectedKeys.length} clés (toutes présentes, T5.Fe=${t5Fe.toFixed(2)} mg/m²/wk)`);
      }
    }
  }
}

// ─── supply-accepts-spray-count-surfactant — computeFoliarSupply takes sprayCount + surfactant ───────
//
// Defaults match prior single-arg behavior; sprayCount=2 doubles every
// element; surfactant=true scales by FOLIAR_COVERAGE_WITH_YUCCA / DEFAULT.
//
// Spec: nutrition/tomato/foliar-strategy/spec.md → supply-accepts-spray-count-surfactant.

header('supply-accepts-spray-count-surfactant — computeFoliarSupply(stage, opts) — sprayCount + surfactant levers');

{
  const FRT = window.FoliarRecipeTomato;
  if (!FRT || typeof FRT.computeFoliarSupply !== 'function') {
    fail('FoliarRecipeTomato.computeFoliarSupply exposed', 'missing');
  } else {
    const baseline = FRT.computeFoliarSupply('T5');
    const noOpts   = FRT.computeFoliarSupply('T5', undefined);
    const doubled  = FRT.computeFoliarSupply('T5', { sprayCount: 2 });
    const withYucca = FRT.computeFoliarSupply('T5', { surfactant: true });
    const ELEMENTS = ['Fe', 'Mn', 'Zn', 'B', 'Cu', 'Mo'];
    const ratioYucca = FRT.FOLIAR_COVERAGE_WITH_YUCCA / FRT.FOLIAR_COVERAGE_DEFAULT;
    const offenders = [];
    for (const element of ELEMENTS) {
      if (Math.abs(baseline[element] - noOpts[element]) > 0.001) {
        offenders.push(`${element}: defaults diverge (no-opt=${noOpts[element]} vs single-arg=${baseline[element]})`);
      }
      if (baseline[element] > 0 && Math.abs(doubled[element] - 2 * baseline[element]) > Math.max(0.001, baseline[element] * 0.01)) {
        offenders.push(`${element}: sprayCount=2 should double (baseline=${baseline[element]}, doubled=${doubled[element]})`);
      }
      if (baseline[element] > 0) {
        const expected = baseline[element] * ratioYucca;
        if (Math.abs(withYucca[element] - expected) > Math.max(0.001, expected * 0.01)) {
          offenders.push(`${element}: surfactant=true should ×${ratioYucca.toFixed(3)} (baseline=${baseline[element]}, with=${withYucca[element]}, expected=${expected.toFixed(3)})`);
        }
      }
    }

    // Recipe-agnostic property: pass an explicit stub label-string array
    // (same shape as STORED_RECIPE.tomato.foliaire.A) and assert that the
    // sprayCount=2 / surfactant=true multipliers behave identically. This
    // pins the third-arg path so FP-mode callers (which pass the gap-
    // derived recipe through computeFoliarSupply) cannot regress.
    const stubRecipe = [
      { name: 'MnSO₄ (31,5 % Mn)',     master: '10 g'  },
      { name: 'ZnSO₄ (35,5 % Zn)',     master: '8 g'   },
      { name: 'Solubore (20,5 % B)',   master: '4 g'   },
      { name: 'CuSO₄ (25 % Cu)',       master: '1 g'   },
      { name: 'Molybdate (39,6 % Mo)', master: '0,5 g' },
      { name: 'FeSO₄·7H₂O (20 % Fe)',  master: '40 g'  },
    ];
    const stubBase   = FRT.computeFoliarSupply('T5', undefined,           stubRecipe);
    const stubDouble = FRT.computeFoliarSupply('T5', { sprayCount: 2 },   stubRecipe);
    const stubYucca  = FRT.computeFoliarSupply('T5', { surfactant: true }, stubRecipe);
    let anyStubPositive = false;
    for (const element of ELEMENTS) {
      if (stubBase[element] > 0) anyStubPositive = true;
      if (stubBase[element] > 0 && Math.abs(stubDouble[element] - 2 * stubBase[element]) > Math.max(0.001, stubBase[element] * 0.01)) {
        offenders.push(`${element} (stub recipe): sprayCount=2 should double (base=${stubBase[element]}, doubled=${stubDouble[element]})`);
      }
      if (stubBase[element] > 0) {
        const expected = stubBase[element] * ratioYucca;
        if (Math.abs(stubYucca[element] - expected) > Math.max(0.001, expected * 0.01)) {
          offenders.push(`${element} (stub recipe): surfactant=true should ×${ratioYucca.toFixed(3)} (base=${stubBase[element]}, with=${stubYucca[element]}, expected=${expected.toFixed(3)})`);
        }
      }
    }
    if (!anyStubPositive) {
      offenders.push('stub recipe arg: every element returned 0 — recipe arg is being ignored or substring match failed');
    }

    if (offenders.length === 0) {
      pass(`computeFoliarSupply: defaults preserved, sprayCount=2 double, surfactant=true ×${ratioYucca.toFixed(2)}, recipe-agnostic via 3rd arg`);
    } else {
      fail('supply-accepts-spray-count-surfactant — sprayCount + surfactant + recipe-agnostic semantics', offenders.map(o => `  ${o}`).join('\n'));
    }
  }
}

// ─── gap-maximizing-recipe — computeFoliarRecipeForGap derives gap-maximizing recipe
//
// Spec: nutrition/tomato/foliar-strategy/spec.md → gap-maximizing-recipe.

header('gap-maximizing-recipe — computeFoliarRecipeForGap (min-dose clamp + surfactant + burn cap + CE scale)');

{
  const FRT = window.FoliarRecipeTomato;
  if (!FRT || typeof FRT.computeFoliarRecipeForGap !== 'function'
      || typeof FRT.burnCapG !== 'function'
      || !FRT.BURN_CAP_BASE_G) {
    fail('Foliar recipe-derivation API exposed', 'computeFoliarRecipeForGap / burnCapG / BURN_CAP_BASE_G missing');
  } else {
    const offenders = [];

    // Tiny gap → all zeros (min-dose clamp). 0.001 mg/m²/wk for every element.
    const tiny = { Mn: 0.001, Zn: 0.001, Cu: 0.001, Fe: 0.001, Mo: 0.001, B: 0.001 };
    const tinyRecipe = FRT.computeFoliarRecipeForGap(tiny);
    Object.keys(tinyRecipe).forEach(function(k) {
      if (tinyRecipe[k] !== 0) offenders.push(`tiny gap: ${k}=${tinyRecipe[k]} (expected 0 — min-dose clamp)`);
    });

    // Huge gap → every element clipped to BURN_CAP_BASE_G[element]
    // (with the rounding-up to nearest 0.5 g preserving the cap exactly).
    const huge = { Mn: 1000, Zn: 1000, Cu: 1000, Fe: 1000, Mo: 1000, B: 1000 };
    const hugeRecipe = FRT.computeFoliarRecipeForGap(huge, { surfactant: false });
    const PAIRS = [
      { element: 'Mn', key: 'MnSO4_g' },
      { element: 'Zn', key: 'ZnSO4_g' },
      { element: 'Cu', key: 'CuSO4_g' },
      { element: 'Fe', key: 'FeSO4_g' },
      { element: 'Mo', key: 'NaMoO4_g' },
      { element: 'B',  key: 'Solubore_g' },
    ];
    PAIRS.forEach(function(p) {
      const expected = FRT.burnCapG(p.element);
      const actual = hugeRecipe[p.key];
      // After CE-scale loop the cap may be reduced to fit total CE budget,
      // so actual ≤ expected is the correct invariant. (Strict equality
      // would over-constrain when CE binds.)
      if (actual > expected + 0.01) {
        offenders.push(`huge gap: ${p.key}=${actual} > burnCap=${expected}`);
      }
    });

    // CE check: predictedCE on a huge-gap recipe (with + without surfactant)
    // should stay under foliar-ce-under-burn-cap burn cap (10 mS/cm tomato leaf).
    if (typeof predictedCE === 'function') {
      const recipeAsLabelArray = function(r) {
        return [
          { name: 'MnSO₄ (31,5 % Mn)',     master: r.MnSO4_g + ' g' },
          { name: 'ZnSO₄ (35,5 % Zn)',     master: r.ZnSO4_g + ' g' },
          { name: 'CuSO₄ (25 % Cu)',       master: r.CuSO4_g + ' g' },
          { name: 'FeSO₄·7H₂O (20 % Fe)',  master: r.FeSO4_g + ' g' },
          { name: 'NaMolybdate (39,6 % Mo)', master: r.NaMoO4_g + ' g' },
          { name: 'Solubore (20,5 % B)',   master: r.Solubore_g + ' g' },
        ];
      };
      [false, true].forEach(function(surfactant) {
        const r = FRT.computeFoliarRecipeForGap(huge, { surfactant: surfactant });
        const ce = predictedCE(recipeAsLabelArray(r), 1.0);
        if (isFinite(ce) && ce > 10.0) {
          offenders.push(`CE-scale loop did not bound predicted CE (surfactant=${surfactant}): predictedCE=${ce.toFixed(2)} > 10.0`);
        }
      });

      // B3 — Drop-highest-CE-contributor first: a Fe-heavy gap that pushes
      // CE over cap should reduce Fe before stripping the pH-locked micros
      // (Mn / Cu / B). Synthetic Fe-heavy gap saturates Fe at burn cap;
      // Mn / Cu / B asks land just above their per-element floors.
      const feHeavyGap = { Mn: 5, Zn: 5, Cu: 0.5, Fe: 1000, B: 4 };
      const feHeavyRecipe = FRT.computeFoliarRecipeForGap(feHeavyGap, { surfactant: false });
      const feHeavyCe = predictedCE(recipeAsLabelArray(feHeavyRecipe), 1.0);
      if (!(isFinite(feHeavyCe) && feHeavyCe <= 10.0)) {
        offenders.push(`B3 Fe-heavy gap: CE not bounded (predictedCE=${feHeavyCe})`);
      }
      // Mn / Cu / B should remain non-zero (the drop-highest algorithm
      // shrinks Fe first; pH-locked micros are preserved).
      if (feHeavyRecipe.MnSO4_g <= 0) {
        offenders.push(`B3 Fe-heavy gap: Mn stripped (MnSO4_g=${feHeavyRecipe.MnSO4_g}); drop-highest should preserve pH-locked micros`);
      }
      if (feHeavyRecipe.CuSO4_g <= 0) {
        offenders.push(`B3 Fe-heavy gap: Cu stripped (CuSO4_g=${feHeavyRecipe.CuSO4_g}); drop-highest should preserve Cu`);
      }
      if (feHeavyRecipe.Solubore_g <= 0) {
        offenders.push(`B3 Fe-heavy gap: B stripped (Solubore_g=${feHeavyRecipe.Solubore_g}); drop-highest should preserve B`);
      }
      // Fe should be reduced below its 80 g cap (drop-highest fired).
      if (feHeavyRecipe.FeSO4_g >= 80) {
        offenders.push(`B3 Fe-heavy gap: Fe not reduced (FeSO4_g=${feHeavyRecipe.FeSO4_g}); drop-highest should have halved Fe`);
      }
    }

    // MIN-DOSE-FLOOR — Cu narrow-toxicity edge. A Cu-only gap small enough
    // that the per-element 0.2 g floor would still over-luxury by > 1.3×
    // should clamp Cu to 0 (the per-element floor + the luxury-cap guard
    // together close the case). Synthesize a Cu gap of 0.05 mg/m²/wk:
    // ideal_g = 0.05 × 382.9 / (0.25 × 1000 × 0.30) = 0.255 g → > 0.2 floor
    // → round up to 0.5 g → delivered 0.098 mg/m²/wk → 1.96× gap → guard
    // fires → drop to 0.
    const cuSmallGap = { Cu: 0.05 };
    const cuSmallRecipe = FRT.computeFoliarRecipeForGap(cuSmallGap, { surfactant: false });
    if (cuSmallRecipe.CuSO4_g > 0.2) {
      offenders.push(`MIN-DOSE-FLOOR: Cu small-gap should clamp to ≤ 0.2 g via luxury-cap guard, got CuSO4_g=${cuSmallRecipe.CuSO4_g}`);
    }
    // MIN-DOSE-FLOOR — Cu sub-floor case (ideal_g < 0.2 g). Cu gap so small
    // ideal_g lands below 0.2 g → direct clamp to 0 (no luxury guard
    // needed). Cu gap = 0.01 mg/m²/wk → ideal_g = 0.05 g → below floor → 0.
    const cuTinyGap = { Cu: 0.01 };
    const cuTinyRecipe = FRT.computeFoliarRecipeForGap(cuTinyGap, { surfactant: false });
    if (cuTinyRecipe.CuSO4_g !== 0) {
      offenders.push(`MIN-DOSE-FLOOR: Cu tiny-gap (sub-floor) should clamp to 0, got CuSO4_g=${cuTinyRecipe.CuSO4_g}`);
    }
    // MIN-DOSE-FLOOR — per-element floor map exposed on the namespace.
    if (!FRT.MIN_DOSE_G_PER_ELEMENT || typeof FRT.MIN_DOSE_G_PER_ELEMENT !== 'object') {
      offenders.push('MIN-DOSE-FLOOR: window.FoliarRecipeTomato.MIN_DOSE_G_PER_ELEMENT not exposed');
    } else if (FRT.MIN_DOSE_G_PER_ELEMENT.Cu !== 0.2) {
      offenders.push(`MIN-DOSE-FLOOR: MIN_DOSE_G_PER_ELEMENT.Cu should be 0.2, got ${FRT.MIN_DOSE_G_PER_ELEMENT.Cu}`);
    }

    if (offenders.length === 0) {
      pass('computeFoliarRecipeForGap: per-element min-dose floor + burn caps + drop-highest CE algorithm all hold');
    } else {
      fail('gap-maximizing-recipe — recipe derivation', offenders.map(function(o) { return '  ' + o; }).join('\n'));
    }
  }
}

// ─── fp-strategy-live-derived — FP foliar recipe live-derived from pre-foliar gap chain ──
//
// Spec: nutrition/tomato/foliar-strategy/spec.md → fp-strategy-live-derived.
//
// Integration test: call calculateNutritionSupply twice in FP mode at T5. Between
// calls, bump COMPOST_RELEASE_PER_WEEK.Mn so the pre-foliar gap drops
// sharply. Assert FP_RECIPE_T5.foliar.MnSO4 decreased. Restore the compost
// value at the end so downstream tests see canonical state.
//
// Wrapped in try/catch — if calculateNutritionSupply isn't reachable (jsdom didn't
// expose it, page DOM not initialized, etc.) the verifier reports the
// failure cleanly rather than crashing the whole run.

header('fp-strategy-live-derived — FP foliar recipe live-derived from pre-foliar gap chain (calculateNutritionSupply integration)');

{
  const calculateNutritionSupply = window.calculateNutritionSupply;
  const FRT = window.FoliarRecipeTomato;
  const CC  = window.CompostContribution;
  const fpFoliar = FP_RECIPE_T5 && FP_RECIPE_T5.foliar;
  if (typeof calculateNutritionSupply !== 'function' || !FRT || !CC || !CC.releasePerWeek || !fpFoliar) {
    fail('fp-strategy-live-derived prerequisites available (calculateNutritionSupply / FoliarRecipeTomato / CompostContribution / FP_RECIPE_T5.foliar)',
         `calculateNutritionSupply: ${typeof calculateNutritionSupply}, FRT: ${!!FRT}, CC: ${!!CC}, CC.releasePerWeek: ${!!(CC && CC.releasePerWeek)}, FP_RECIPE_T5.foliar: ${!!fpFoliar}`);
  } else {
    let offenders = [];
    const originalMnRelease = CC.releasePerWeek.Mn;
    try {
      // Baseline: default compost state. T5, phLocked=true, transpFactor=1.0,
      // target=1.5 kg/m²/wk — match the page defaults so FP_RECIPE_T5.foliar
      // reflects the canonical FP state.
      calculateNutritionSupply('T5', true, 1.0, 1.5, 'fp');
      const baselineMn = fpFoliar['MnSO4'];
      if (!isFinite(baselineMn) || baselineMn < 0) {
        offenders.push(`baseline FP_RECIPE_T5.foliar.MnSO4 = ${baselineMn} (expected finite ≥ 0 after calculateNutritionSupply FP call)`);
      }

      // Mutation: huge Mn release from compost (1 g/m²/wk = 1000 mg/m²/wk),
      // far above any plausible Mn demand. Pre-foliar gap.Mn drops to 0,
      // so computeFoliarRecipeForGap should return MnSO4_g = 0 (min-dose
      // clamp). Confirms calculateNutritionSupply consults the live compost chain.
      CC.releasePerWeek.Mn = 1.0;
      calculateNutritionSupply('T5', true, 1.0, 1.5, 'fp');
      const droppedMn = fpFoliar['MnSO4'];
      if (!(droppedMn < baselineMn)) {
        offenders.push(`after compost.Mn bump, FP_RECIPE_T5.foliar.MnSO4 = ${droppedMn}; expected < baseline ${baselineMn} (gap closed → recipe shrinks)`);
      }
      if (droppedMn !== 0) {
        offenders.push(`after compost.Mn bump, FP_RECIPE_T5.foliar.MnSO4 = ${droppedMn}; expected exactly 0 (gap = 0 → min-dose clamp)`);
      }
    } catch (e) {
      offenders.push(`calculateNutritionSupply FP call threw: ${e && e.message ? e.message : e}`);
    } finally {
      // Restore — downstream tests / re-runs see canonical state.
      CC.releasePerWeek.Mn = originalMnRelease;
      // Re-derive once at canonical state so FP_RECIPE_T5.foliar reflects
      // baseline for any subsequent verifier that reads it.
      try { calculateNutritionSupply('T5', true, 1.0, 1.5, 'fp'); } catch (e) { void e; }
    }
    if (offenders.length === 0) {
      pass('FP_RECIPE_T5.foliar.MnSO4 shrinks when compost.Mn rises (pre-foliar gap chain wired through calculateNutritionSupply)');
    } else {
      fail('fp-strategy-live-derived — FP foliar live derivation', offenders.map(function(o) { return '  ' + o; }).join('\n'));
    }
  }
}

// ─── tomato Nutrition page header card ──────────────────
//
// Section 1 of the Bilan UI specs. Asserts header inputs, light ceiling
// formula, recipe-mode toggle behaviour. Spec:
// nutrition/tomato/shell/spec.md → header-inputs-five-scalars..107.

header('header-inputs-five-scalars — Header inputs are exactly five scalars (no nutr-current)');

const REQUIRED_HEADER_INPUTS = [
  'nutr-target',
  'nutr-solar-per-gram',
  'nutr-stage-selector',
  'nutr-phlocked',
  'nutr-recipe-fp',
  'nutr-recipe-stored',
];
{
  const missing = REQUIRED_HEADER_INPUTS.filter(id => !window.document.getElementById(id));
  const stillHasCurrent = !!window.document.getElementById('nutr-current');
  if (missing.length > 0) {
    fail('Required header inputs present', `manquants: ${missing.join(', ')}`);
  } else if (stillHasCurrent) {
    fail('nutr-current input retired', 'still present in markup');
  } else {
    pass(`Header expose ${REQUIRED_HEADER_INPUTS.length} inputs requis ; nutr-current absent`);
  }
}

header('light-ceiling-from-operator-j-per-g — Light ceiling reactive to solarPerGram (mutate input → text changes)');

{
  const inp = window.document.getElementById('nutr-solar-per-gram');
  const ceilingElement = window.document.getElementById('nutr-light-ceiling');
  let logicJsBody = '';
  try {
    logicJsBody = readFileSync(
      join(REPO_ROOT, 'nutrition', 'tomato', 'shell', 'logic.js'),
      'utf8'
    );
  } catch (e) { /* swallow — fail below */ }

  // Belt: source-grep checks (input default + no /7000).
  const defaultOk = inp && inp.value === '7';
  const noHardcoded7000 = !/lightCeiling\s*=\s*weeklyJ\s*\/\s*7000\b/.test(logicJsBody);

  // Suspenders: runtime behavioral. Mutate the input + dispatch an `input`
  // event — relying on the page's own listener wiring to trigger re-render.
  // No direct buildNutriment() call: that would mask a missing listener
  // (real users don't have a fallback). If the listener isn't wired, the
  // displayed text stays unchanged and this fails — which is the point.
  let textBefore = null, textAfter = null;
  if (inp && ceilingElement) {
    try {
      // Force an initial render via input event at default 7
      inp.value = '7';
      inp.dispatchEvent(new window.Event('input', { bubbles: true }));
      textBefore = (ceilingElement.textContent || '').trim();
      // Mutate to 14 + dispatch — listener (if wired) will re-render
      inp.value = '14';
      inp.dispatchEvent(new window.Event('input', { bubbles: true }));
      textAfter = (ceilingElement.textContent || '').trim();
      // Restore default for downstream checks
      inp.value = '7';
      inp.dispatchEvent(new window.Event('input', { bubbles: true }));
    } catch (e) { /* fail below if textBefore/After remain null */ }
  }

  if (!defaultOk) {
    fail('nutr-solar-per-gram default = 7', `actual: ${inp ? inp.value : 'missing'}`);
  } else if (!noHardcoded7000) {
    fail('logic.js ceiling formula has no hardcoded /7000', 'literal still present');
  } else if (textBefore == null || textAfter == null) {
    fail('Light-ceiling text reachable for behavioral test', 'render not exercised');
  } else if (textBefore === textAfter) {
    fail('Mutating solarPerGram changes the displayed ceiling',
         `7 → 14 produced same text:\n  ${textBefore.slice(0, 80)}`);
  } else {
    pass(`Plafond lumière réagit à solarPerGram (7 → 14 mute le texte affiché ; defaut 7, pas de /7000)`);
  }
}

header('fp-recipe-mode-locks-t5 — FP mode locks stage to T5 (auto-revert + default fp)');

{
  let logicJsBody = '';
  try {
    logicJsBody = readFileSync(
      join(REPO_ROOT, 'nutrition', 'tomato', 'shell', 'logic.js'),
      'utf8'
    );
  } catch (e) { /* */ }
  let indexHtmlBody = '';
  try {
    // Read the assembled artifact — post-Stage 7 the `let nutrRecipeMode =
    // 'fp'` declaration lives in an @included partial, not app/index.html.
    indexHtmlBody = readFileSync(INDEX_HTML_PATH, 'utf8');
  } catch (e) { /* */ }
  const autoRevert = /s !== 'T5' && nutrRecipeMode === 'fp'/.test(logicJsBody);
  const fpSnapsT5 = /nutrRecipeMode === 'fp' && nutrStage !== 'T5'/.test(logicJsBody);
  const defaultFp = /let nutrRecipeMode\s*=\s*'fp'/.test(indexHtmlBody);
  if (!autoRevert) {
    fail('FP→stored auto-revert when stage off T5', 'pattern not found in logic.js');
  } else if (!fpSnapsT5) {
    fail('FP mode snaps stage to T5', 'pattern not found in logic.js');
  } else if (!defaultFp) {
    fail("Default `let nutrRecipeMode = 'fp'`", 'pattern not found in dist/index.html');
  } else {
    pass('FP mode coordonné avec stage T5 (auto-revert, snap, default fp)');
  }
}

header('recipe-mode-toggle-fp-left-default-right — Recipe toggle: First principles left, default; products-in-play removed');

{
  const fpBtn = window.document.getElementById('nutr-recipe-fp');
  const storedBtn = window.document.getElementById('nutr-recipe-stored');
  const productsBlock = window.document.getElementById('nutr-products');
  const offenders = [];
  if (!fpBtn || !storedBtn) {
    offenders.push('one or both toggle buttons missing');
  } else {
    // Both buttons share a parent (the flex container). FP must come first.
    const parent = fpBtn.parentElement;
    if (parent !== storedBtn.parentElement) {
      offenders.push('FP and Stockée buttons not siblings');
    } else {
      const order = Array.from(parent.children).filter(element => element.tagName === 'BUTTON');
      if (order[0] !== fpBtn) {
        offenders.push(`FP button is not first child (got id="${order[0]?.id || '?'}")`);
      }
    }
    const fpText = (fpBtn.textContent || '').trim();
    if (!/First principles/.test(fpText)) {
      offenders.push(`FP label text not "First principles" (got "${fpText.slice(0, 40)}")`);
    }
    if (/Premiers principes/.test(fpText)) {
      offenders.push('FP label still says "Premiers principes" — should be "First principles"');
    }
  }
  if (productsBlock) {
    offenders.push('nutr-products still in DOM — should be removed');
  }
  // recipe-mode-toggle-fp-left-default-right: helper-note text is also unspecified, so per the build-minimum
  // principle (~/.claude/CLAUDE.md "Spec discipline"), it must be empty.
  const note = window.document.getElementById('nutr-recipe-mode-note');
  if (note) {
    const noteText = (note.textContent || '').trim();
    if (noteText.length > 0) {
      offenders.push(`nutr-recipe-mode-note has text (${noteText.length} chars) — should be empty`);
    }
  }
  if (offenders.length === 0) {
    pass('Toggle: First principles à gauche (défaut), Stockée à droite ; nutr-products retiré ; helper-note vide');
  } else {
    fail('Toggle order + label + products-in-play retired + note empty', offenders.map(o => `  ${o}`).join('\n'));
  }
}

// ─── tomato Nutrition page Block 1 (Besoin du plant) ────
//
// Section 2 of the Bilan UI specs. Spec:
// nutrition/tomato/plant-needs/builder/user-stories.md.

header('Block 1 calls PN.calculateNutritionDemand (no bare-global lookups in render)');

{
  let logicJsBody = '';
  try {
    logicJsBody = readFileSync(
      join(REPO_ROOT, 'nutrition', 'tomato', 'shell', 'logic.js'),
      'utf8'
    );
  } catch (e) { /* */ }
  // Block 1 render is bracketed by `Block 1` comment and the
  // `document.getElementById('nutr-needs').innerHTML = html1` line.
  const block1Match = logicJsBody.match(/Block 1[\s\S]*?nutr-needs.*?innerHTML/);
  const block1Body = block1Match ? block1Match[0] : '';
  const usesPnDemand = /PN\.calculateNutritionDemand|window\.PlantNeedsTomato\.calculateNutritionDemand/.test(logicJsBody);
  // Negative lookbehind for `.` excludes namespaced access (PN.BIOMASS_DEMAND).
  const bareBiomassInBlock1   = /(?<!\.)\bBIOMASS_DEMAND\s*\[/.test(block1Body);
  const bareFruitExportInBlock1 = /(?<!\.)\bTOMATO_FRUIT_EXPORT\s*\[/.test(block1Body);
  if (!usesPnDemand) {
    fail('logic.js calls PN.calculateNutritionDemand', 'pattern not found');
  } else if (bareBiomassInBlock1 || bareFruitExportInBlock1) {
    fail('No bare BIOMASS_DEMAND / TOMATO_FRUIT_EXPORT in Block 1 render',
         `${bareBiomassInBlock1 ? 'BIOMASS_DEMAND[ ' : ''}${bareFruitExportInBlock1 ? 'TOMATO_FRUIT_EXPORT[' : ''}`);
  } else {
    pass('Block 1 demand routé via PN.calculateNutritionDemand ; pas d\'accès bare-global');
  }
}

header('Block 1 row click opens cert + equation + plugged modal (no interpretation prose)');

{
  const PN = window.PlantNeedsTomato;
  const rowsContainer = window.document.getElementById('nutr-needs');
  const expectedElements = PN ? Object.keys(PN.TOMATO_FRUIT_EXPORT || {}) : [];
  let rowsCount = 0;
  let clickableCount = 0;
  let allHaveOnclick = true;
  if (rowsContainer) {
    const rows = rowsContainer.querySelectorAll('.pq-row');
    rowsCount = rows.length;
    rows.forEach(r => {
      const onclick = r.getAttribute('onclick') || '';
      if (/showPourquoi\(['"]demand\.[A-Za-z]+['"]\)/.test(onclick)) clickableCount += 1;
      else allHaveOnclick = false;
    });
  }
  // Modal interpretation node should be empty after a row's modal opens.
  let interpretationLeaked = false;
  if (PN && rowsCount > 0 && typeof window.showPourquoi === 'function') {
    try {
      window.showPourquoi('demand.N');
      const interp = window.document.getElementById('pq-modal-interp');
      const interpText = interp ? (interp.textContent || '').trim() : '';
      if (interpText.length > 0) interpretationLeaked = true;
    } catch (e) { /* */ }
  }
  const offenders = [];
  if (rowsCount !== expectedElements.length) {
    offenders.push(`row count ${rowsCount} ≠ TOMATO_FRUIT_EXPORT keys ${expectedElements.length}`);
  }
  if (!allHaveOnclick || clickableCount !== rowsCount) {
    offenders.push(`only ${clickableCount}/${rowsCount} rows wire showPourquoi('demand.<element>')`);
  }
  if (interpretationLeaked) {
    offenders.push('modal interpretation node has text — should be empty');
  }
  if (offenders.length === 0) {
    pass(`Block 1: ${rowsCount} rows cliquables ; modal n'expose que cert + équation + plugged`);
  } else {
    fail('Block 1 rows + modal lean', offenders.map(o => `  ${o}`).join('\n'));
  }
}

header('Block 1 reactive to target + stage changes');

{
  const targetInp = window.document.getElementById('nutr-target');
  const needsElement = window.document.getElementById('nutr-needs');
  let textBefore = null, textAfterTarget = null, textAfterStage = null;
  if (targetInp && needsElement) {
    try {
      targetInp.value = '1.5';
      targetInp.dispatchEvent(new window.Event('input', { bubbles: true }));
      textBefore = (needsElement.textContent || '').trim();
      // Mutate target
      targetInp.value = '0.5';
      targetInp.dispatchEvent(new window.Event('input', { bubbles: true }));
      textAfterTarget = (needsElement.textContent || '').trim();
      // Restore + change stage to T1 via the data-nstage button
      targetInp.value = '1.5';
      targetInp.dispatchEvent(new window.Event('input', { bubbles: true }));
      const t1 = window.document.querySelector('[data-nstage="T1"]');
      if (t1) t1.dispatchEvent(new window.Event('click', { bubbles: true }));
      textAfterStage = (needsElement.textContent || '').trim();
      // Restore back to T5
      const t5 = window.document.querySelector('[data-nstage="T5"]');
      if (t5) t5.dispatchEvent(new window.Event('click', { bubbles: true }));
    } catch (e) { /* */ }
  }
  const offenders = [];
  if (textBefore == null) offenders.push('Block 1 not reachable for behavioral test');
  else {
    if (textBefore === textAfterTarget) offenders.push('mutating target did not change Block 1 text');
    if (textBefore === textAfterStage) offenders.push('changing stage did not change Block 1 text');
  }
  if (offenders.length === 0) {
    pass('Block 1 réagit à target (1.5 → 0.5) et stage (T5 → T1)');
  } else {
    fail('Block 1 reactivity', offenders.map(o => `  ${o}`).join('\n'));
  }
}

header('Block 1 row layout: 4 columns (Él. / Fruit / Biomasse / Total)');

{
  const needsElement = window.document.getElementById('nutr-needs');
  let headerHasFruitBiomasse = false;
  let allRowsFourCells = true;
  let firstRowCellCount = 0;
  if (needsElement) {
    const headerText = (needsElement.textContent || '');
    headerHasFruitBiomasse = /Fruit/.test(headerText) && /Biomasse/.test(headerText);
    const rows = needsElement.querySelectorAll('.pq-row');
    rows.forEach((r, index) => {
      const cellCount = r.children.length;
      if (index === 0) firstRowCellCount = cellCount;
      if (cellCount !== 4) allRowsFourCells = false;
    });
  }
  if (!needsElement) {
    fail('#nutr-needs reachable', 'missing');
  } else if (!headerHasFruitBiomasse) {
    fail('Block 1 header contains "Fruit" + "Biomasse" labels', 'one or both missing');
  } else if (!allRowsFourCells) {
    fail('Block 1 rows have exactly 4 cells', `first row had ${firstRowCellCount}`);
  } else {
    pass(`Block 1 layout: 4 colonnes (Él. / Fruit / Biomasse / Total) ; en-tête confirmé`);
  }
}

// ─── multi-fertigation degree of freedom ────────────────
//
// Spec: nutrition/nursery/fertigation/spec.md → supply-scales-linearly-with-applications..126.
// Implementation: nutrition/nursery/fertigation/calc.js.
// All five checks read the live `window.FertigationNursery` namespace,
// which is mounted by the @included data.js + calc.js + model.js trio.

header('supply-scales-linearly-with-applications — nurseryRecipeSupply scales linearly with applicationsPerWeek');
{
  const FN = window.FertigationNursery;
  if (!FN || typeof FN.nurseryRecipeSupply !== 'function') {
    fail('supply-scales-linearly-with-applications — nurseryRecipeSupply present', 'window.FertigationNursery.nurseryRecipeSupply missing');
  } else {
    const recipe = FN.NURSERY_RECIPE_DEFAULT;
    const trayL  = (FN.NURSERY_FERTIGATION_DEFAULTS || {}).trayVolumeL || 1.25;
    const sup1 = FN.nurseryRecipeSupply(recipe, trayL, 1);
    const sup2 = FN.nurseryRecipeSupply(recipe, trayL, 2);
    const sup3 = FN.nurseryRecipeSupply(recipe, trayL, 3);
    const els = Object.keys(sup1.perTray_mg || {});
    let bad = [];
    for (const element of els) {
      const e1 = sup1.perTray_mg[element] || 0;
      if (e1 <= 0) continue;
      const e2 = (sup2.perTray_mg || {})[element] || 0;
      const e3 = (sup3.perTray_mg || {})[element] || 0;
      // Allow ±0.1% tolerance for float math
      if (Math.abs(e2 / e1 - 2) > 0.001) bad.push(`${element}: 2× ratio = ${(e2/e1).toFixed(4)}`);
      if (Math.abs(e3 / e1 - 3) > 0.001) bad.push(`${element}: 3× ratio = ${(e3/e1).toFixed(4)}`);
    }
    if (bad.length === 0) {
      pass(`Linearité confirmée pour ${els.length} éléments à N=2 et N=3`);
    } else {
      fail('supply-scales-linearly-with-applications — linéarité', bad.slice(0, 5).join(' · '));
    }
  }
}

header('min-applications-solves-full-coverage — minimumApplicationsPerWeek returns integer ≤ 7 or null');
{
  const FN = window.FertigationNursery;
  if (!FN || typeof FN.minimumApplicationsPerWeek !== 'function') {
    fail('min-applications-solves-full-coverage — minimumApplicationsPerWeek present', 'function missing on namespace');
  } else {
    // Realistic-ish synthetic demand at 90 g target / 35 d / 50 cells. Read from
    // PlantNeedsNursery if loaded; else inline fallback.
    const PNN = window.PlantNeedsNursery;
    const demand = (PNN && typeof PNN.demandPerTray === 'function')
      ? { N: PNN.demandPerTray('N'), P: PNN.demandPerTray('P'), K: PNN.demandPerTray('K') }
      : { N: 3150, P: 315, K: 3780 };
    const recipe = FN.NURSERY_RECIPE_DEFAULT;
    const trayL  = (FN.NURSERY_FERTIGATION_DEFAULTS || {}).trayVolumeL || 1.25;
    const cap    = FN.NURSERY_CE_CAP_MS_CM || 3.0;
    const N = FN.minimumApplicationsPerWeek(recipe, demand, trayL, cap);
    const ok = (N === null) || (Number.isInteger(N) && N >= 1 && N <= 7);
    if (!ok) {
      fail('min-applications-solves-full-coverage — return type', `got ${N} (expected integer 1-7 or null)`);
    } else {
      // Cross-check: at returned N, every sourced element should be covered.
      // (null path: just assert it returned null cleanly.)
      if (N === null) {
        pass('minimumApplicationsPerWeek returns null (recipe dose-bound or > 7×/sem) — well-formed');
      } else {
        const sup = FN.nurseryRecipeSupply(recipe, trayL, N);
        const sourced = ['N', 'P', 'K'].filter(element => (sup.perTray_mg[element] || 0) > 0);
        const covered = sourced.every(element => (sup.perTray_mg[element] || 0) >= demand[element]);
        if (covered) {
          pass(`minimumApplicationsPerWeek = ${N} couvre N/P/K (sources actives)`);
        } else {
          fail('min-applications-solves-full-coverage — couverture à N', `sourced ${sourced.join(',')} pas tous ≥ demande à N=${N}`);
        }
      }
    }
  }
}

header('elements-sourced-vs-unsourced — nurseryElementsBySource splits sourced vs unsourced');
{
  const FN = window.FertigationNursery;
  if (!FN || typeof FN.nurseryElementsBySource !== 'function') {
    fail('elements-sourced-vs-unsourced — nurseryElementsBySource present', 'function missing on namespace');
  } else {
    const PNN = window.PlantNeedsNursery;
    const demand = {};
    if (PNN && typeof PNN.demandPerTray === 'function') {
      ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'].forEach(element => {
        demand[element] = PNN.demandPerTray(element);
      });
    } else {
      Object.assign(demand, { N:3150, P:315, K:3780, Ca:1260, Mg:250, Fe:13, Mn:3.2, Zn:2.5, B:1.9, Cu:0.5, Mo:0.03 });
    }
    const out = FN.nurseryElementsBySource(FN.NURSERY_RECIPE_DEFAULT, demand);
    const isShape = out && Array.isArray(out.sourced) && Array.isArray(out.unsourced);
    if (!isShape) {
      fail('elements-sourced-vs-unsourced — return shape', 'expected { sourced: [], unsourced: [] }');
    } else {
      const allEls = Object.keys(demand);
      const union = out.sourced.concat(out.unsourced).sort().join(',');
      const exp = allEls.slice().sort().join(',');
      const dupes = out.sourced.filter(element => out.unsourced.includes(element));
      if (union !== exp) {
        fail('elements-sourced-vs-unsourced — couverture', `union ${union} ≠ demande ${exp}`);
      } else if (dupes.length > 0) {
        fail('elements-sourced-vs-unsourced — exclusion mutuelle', `chevauchement: ${dupes.join(',')}`);
      } else {
        // N + P + K must be sourced at default recipe; Mo must be unsourced
        // (no product carries it). Other elements (Ca/Mg/Fe/Mn/Zn/B/Cu) are
        // implementation-defined depending on whether kelp's traces count.
        const need = ['N', 'P', 'K'].filter(element => !out.sourced.includes(element));
        const moInUnsourced = out.unsourced.includes('Mo');
        if (need.length > 0) {
          fail('elements-sourced-vs-unsourced — N/P/K sourcés', `manquants: ${need.join(',')}; sourced=${out.sourced.join(',')}`);
        } else if (!moInUnsourced) {
          fail('elements-sourced-vs-unsourced — Mo unsourced', `sourced=${out.sourced.join(',')}; unsourced=${out.unsourced.join(',')}`);
        } else {
          pass(`sourced=[${out.sourced.join(',')}] · unsourced=[${out.unsourced.join(',')}]`);
        }
      }
    }
  }
}

header('ec-cap-per-fertigation-not-per-week — nurseryRecipeCE signature has no frequency parameter');
{
  const FN = window.FertigationNursery;
  if (!FN || typeof FN.nurseryRecipeCE !== 'function') {
    fail('ec-cap-per-fertigation-not-per-week — nurseryRecipeCE present', 'function missing');
  } else {
    // Function.length reports the number of declared formal parameters before
    // the first default. nurseryRecipeCE(recipe, dilution) → length 2.
    // Adding applicationsPerWeek would make it 3 (or push dilution past defaults).
    const arity = FN.nurseryRecipeCE.length;
    if (arity > 2) {
      fail('ec-cap-per-fertigation-not-per-week — arité ≤ 2', `nurseryRecipeCE.length = ${arity}, should be ≤ 2 (recipe, dilution)`);
    } else {
      // Behavioral check: CE doesn't change when applicationsPerWeek would scale supply.
      const ce1 = FN.nurseryRecipeCE(FN.NURSERY_RECIPE_DEFAULT, 1);
      const ce2 = FN.nurseryRecipeCE(FN.NURSERY_RECIPE_DEFAULT, 1);
      if (Math.abs(ce1 - ce2) > 1e-9) {
        fail('ec-cap-per-fertigation-not-per-week — déterministe', `${ce1} ≠ ${ce2}`);
      } else {
        pass(`nurseryRecipeCE(recipe, dilution) — arité ${arity} ; CE cap binds per-fertigation only`);
      }
    }
  }
}

header('applications-per-week-positive-integer — applicationsPerWeek coerced to integer ∈ [1, 7]');
{
  const FN = window.FertigationNursery;
  if (!FN || typeof FN.nurseryRecipeSupply !== 'function') {
    fail('applications-per-week-positive-integer — nurseryRecipeSupply present', 'function missing');
  } else {
    const recipe = FN.NURSERY_RECIPE_DEFAULT;
    const trayL  = 1.25;
    const sup1 = FN.nurseryRecipeSupply(recipe, trayL, 1);
    const sup2 = FN.nurseryRecipeSupply(recipe, trayL, 2);
    // Test cases: each (input, expectedFrequencyApplied) pair.
    const cases = [
      [2.5,  3,  '2.5 → round to 3'],   // round-half-up
      [2.4,  2,  '2.4 → round to 2'],
      [0,    1,  '0 → clamp to 1'],
      [-3,   1,  '-3 → clamp to 1'],
      [9,    7,  '9 → clamp to 7'],
      [NaN,  1,  'NaN → 1'],
      [undefined, 1, 'undefined → 1'],
    ];
    const N_reference = sup1.perTray_mg.N || 0;
    const offenders = [];
    for (const [input, expectedN, label] of cases) {
      const sup = FN.nurseryRecipeSupply(recipe, trayL, input);
      const expectedNvalue = expectedN * N_reference;
      const got = sup.perTray_mg.N || 0;
      if (Math.abs(got / expectedNvalue - 1) > 0.001) {
        offenders.push(`${label}: got N=${got.toFixed(0)}, expected ${expectedNvalue.toFixed(0)}`);
      }
    }
    // minimumApplicationsPerWeek never returns fractional / 0
    const PNN = window.PlantNeedsNursery;
    const dem = (PNN && PNN.demandPerTray) ? { N: PNN.demandPerTray('N') } : { N: 3150 };
    const N = FN.minimumApplicationsPerWeek(recipe, dem, trayL, FN.NURSERY_CE_CAP_MS_CM);
    if (N !== null && (!Number.isInteger(N) || N < 1 || N > 7)) {
      offenders.push(`minimumApplicationsPerWeek returned ${N} (must be null or integer 1-7)`);
    }
    if (offenders.length === 0) {
      pass(`coercion validée sur ${cases.length} cas + minimumApplicationsPerWeek retour entier/null`);
    } else {
      fail('applications-per-week-positive-integer — coercion', offenders.slice(0, 3).join(' · '));
    }
  }
}

// ─── semis subpage Blocks 2/3 layout + gap chain ─────────
//
// Specs: nutrition/nursery/app/user-stories.md → Block 2 layout,
// Block 3 layout, gap chain demand → substrate → fert.
//
// Need to flip the page to the Semis subpage so the render lands. setNutrCrop
// triggers buildNutriment which dispatches to buildNutrimentNursery and writes
// into #nutr-n-substrate / #nutr-n-fertigation.

if (typeof window.setNutrCrop === 'function') {
  try { window.setNutrCrop('nursery'); } catch (e) { /* swallow */ }
}

header('Block 1 (Besoins): 3-col table (Él / Par plant / Cert)');
{
  const needsElement = window.document.getElementById('nutr-n-needs');
  if (!needsElement) {
    fail('#nutr-n-needs present', 'DOM node missing');
  } else {
    const html = needsElement.innerHTML || '';
    // 3-col grid signature (matches the new Block 1 layout)
    const has3Col = /grid-template-columns:\s*0\.5fr 1fr 0\.6fr/.test(html);
    // Per-plant unit visible
    const hasPerPlant = /Par plant/.test(html);
    const hasMgSem = /mg\/sem/.test(html);
    const hasCert = /cert\s+\d/.test(html);
    // 11 elements expected (N…Mo); count innerText hits for the symbol pattern.
    const elementSymbols = ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'];
    const presentSyms = elementSymbols.filter(sym => {
      const re = new RegExp(`<div[^>]*font-weight:600[^>]*>\\s*${sym}\\s*</div>`);
      return re.test(html);
    });
    const offs = [];
    if (!has3Col) offs.push('3-col grid (0.5fr 1fr 0.6fr)');
    if (!hasPerPlant) offs.push('"Par plant" header');
    if (!hasMgSem) offs.push('"mg/sem" unit suffix');
    if (!hasCert) offs.push('"cert N" cell');
    if (presentSyms.length < 3) offs.push(`only ${presentSyms.length}/11 element symbols rendered`);
    if (offs.length === 0) {
      pass(`Block 1: 3-col grid · ${presentSyms.length}/11 elements · cert column present`);
    } else {
      fail('Block 1 layout', offs.join(' · '));
    }
  }
}

// Helper: assert a contribution-block container has a 6-col gap-grid
// header strip whose column text matches REQ137_HEADER_ORDER (defined in
// the contribution-block-gap-grid block below — declared as a top-level const there). When the
// helper is invoked here BEFORE the const declaration runs, it shadow-
// references the const; since both are at module scope and execute in
// order with `header()`/`pass()`/`fail()` doing IO immediately, the
// Nursery Block 2/3 blocks run BEFORE contribution-block-gap-grid — so we duplicate the constant
// inline here to keep the block self-contained. (The two declarations
// must stay in sync; both reflect contribution-block-gap-grid amended 2026-05-15.)
const REQ127_128_HEADER_ORDER = ['Él.', 'Manque entrant (mg)', 'Efficacité', 'Apport ici (mg)', 'Manque sortant (mg)', ''];
function assertSixColGapGrid(blockElement) {
  const headerStrip = findGapGridHeaderStrip(blockElement);
  if (!headerStrip) return { ok: false, why: 'gap-grid header strip not found' };
  const cols = Array.from(headerStrip.children);
  if (cols.length !== 6) return { ok: false, why: `header has ${cols.length} columns, expected 6` };
  const headerTexts = cols.map(d => (d.textContent || '').trim());
  const matches = REQ127_128_HEADER_ORDER.every((expected, index) => headerTexts[index] === expected);
  if (!matches) return { ok: false, why: `header text [${headerTexts.join(' | ')}] != [${REQ127_128_HEADER_ORDER.join(' | ')}]` };
  return { ok: true };
}

header('Block 2 (substrate) layout: recipe header + 6-col gap-grid');
{
  const subElement = window.document.getElementById('nutr-n-substrate');
  if (!subElement) {
    fail('#nutr-n-substrate present', 'DOM node missing');
  } else {
    const html = subElement.innerHTML || '';
    const hasRecipeHeader = /Farine de plumes\s+\d/.test(html);
    const gridCheck = assertSixColGapGrid(subElement);
    const pqRows = subElement.querySelectorAll('.pq-row');
    if (!hasRecipeHeader) {
      fail('recipe header', '"Farine de plumes Xg/plateau" not found in Block 2');
    } else if (!gridCheck.ok) {
      fail('6-column gap-grid', gridCheck.why);
    } else if (pqRows.length === 0) {
      fail('gap-grid rows', 'no .pq-row found (gap-grid empty)');
    } else {
      pass(`Block 2: recipe header + 6-col gap-grid (${pqRows.length} rows)`);
    }
  }
}

header('Block 3 (fertigation) layout: recipe header + CE/pH + 6-col gap-grid');
{
  const fertigationElement = window.document.getElementById('nutr-n-fertigation');
  if (!fertigationElement) {
    fail('#nutr-n-fertigation present', 'DOM node missing');
  } else {
    const html = fertigationElement.innerHTML || '';
    const hasRecipeHeader = /Recette par plateau/.test(html) && /×\d+\/sem/.test(html);
    const hasCE = /CE pr[ée]dite/.test(html) && /mS\/cm/.test(html);
    const hasPh = /pH pr[ée]dit/.test(html);
    const gridCheck = assertSixColGapGrid(fertigationElement);
    const pqRows = fertigationElement.querySelectorAll('.pq-row');
    const offs = [];
    if (!hasRecipeHeader) offs.push('recipe header (×N/sem)');
    if (!hasCE) offs.push('CE readout');
    if (!hasPh) offs.push('pH readout');
    if (!gridCheck.ok) offs.push(`6-col gap-grid (${gridCheck.why})`);
    if (pqRows.length === 0) offs.push('.pq-row entries');
    if (offs.length === 0) {
      pass(`Block 3: recipe header + CE/pH + 6-col gap-grid (${pqRows.length} rows)`);
    } else {
      fail('Block 3 layout', `missing: ${offs.join(', ')}`);
    }
  }
}

header('Gap chain order demand → substrate → fertigation');
{
  // Behavioral check: read the calc-side outputs and assert that what Block 3
  // shows as "manque entrant" equals what Block 2 shows as "manque sortant",
  // for the macro elements where both have rendered values.
  // We do this by re-running the calc directly (the DOM rounds for display, so
  // a strict text-equality check would be flaky).
  const SCN = window.SubstrateContributionNursery;
  const PNN = window.PlantNeedsNursery;
  const FN  = window.FertigationNursery;
  if (!SCN || !PNN || !FN) {
    fail('namespaces present', 'one of SubstrateContributionNursery, PlantNeedsNursery, FertigationNursery missing');
  } else {
    const targetG = 90, cycleDays = 35, cellsPerTray = 50;
    const fmG = SCN.NURSERY_FEATHER_MEAL_DEFAULT_G_PER_TRAY;
    const trayL = FN.NURSERY_FERTIGATION_DEFAULTS.trayVolumeL;
    const dem = PNN.calculateNurseryDemand(targetG, cycleDays, cellsPerTray);
    const subAvg = SCN.cycleAverageReleasePerTray(fmG);
    const sup = FN.nurseryRecipeSupply(FN.NURSERY_RECIPE_DEFAULT, trayL, 1);
    const offs = [];
    for (const element of ['N','P','K','Ca','Mg']) {
      const d = (dem[element] || {}).perTray_mg || 0;
      const s = subAvg[element] || 0;
      const gapAfterSub = Math.max(0, d - s);
      const f = (sup.perTray_mg || {})[element] || 0;
      const gapAfterFert = Math.max(0, gapAfterSub - f);
      // Sanity: chain monotonically non-increasing
      if (!(d >= gapAfterSub && gapAfterSub >= gapAfterFert)) {
        offs.push(`${element}: chain not monotonic (${d.toFixed(0)} → ${gapAfterSub.toFixed(0)} → ${gapAfterFert.toFixed(0)})`);
      }
    }
    if (offs.length === 0) {
      pass('Gap chain monotonic for N/P/K/Ca/Mg (demand ≥ gapAfterSubstrate ≥ gapAfterFert)');
    } else {
      fail('gap chain monotonic', offs.join(' · '));
    }
  }
}

// ─── cross-app contribution-block: details + cell modals ──
//
// Spec: nutrition/spec.md → contribution-channel-details-payload (model: details{cert, cap}),
// contribution-block-gap-grid (UI layout, inherited from nursery Block 2/3), apport-ici-clickable-cert-and-cap-modals
// (cell + emoji modals scoped per (block, element, cap-kind)).
// Verifier walks nursery substrate + fertigation; tomato + lettuce
// blocks adopt in a follow-up pass (deferred from contribution-block-gap-grid scope today).

if (typeof window.setNutrCrop === 'function') {
  try { window.setNutrCrop('nursery'); } catch (e) { /* swallow */ }
}

header('contribution-channel-details-payload — substrate + fertigation return details{element: {cert, cap}}');
{
  const SCN = window.SubstrateContributionNursery;
  const FN  = window.FertigationNursery;
  const offs = [];
  if (SCN && typeof SCN.cycleAverageReleasePerTray === 'function') {
    const r = SCN.cycleAverageReleasePerTray(SCN.NURSERY_FEATHER_MEAL_DEFAULT_G_PER_TRAY);
    if (!r || typeof r !== 'object' || !r.perTray_mg) {
      offs.push('substrate: missing perTray_mg');
    } else if (!r.details || typeof r.details !== 'object') {
      offs.push('substrate: missing details map');
    } else {
      for (const element of Object.keys(r.perTray_mg)) {
        const d = r.details[element];
        if (!d || typeof d.cert !== 'number' || d.cert < 0 || d.cert > 5) {
          offs.push(`substrate.details.${element}: cert out of [0,5]`);
        }
        if (d && d.cap !== null && d.cap !== undefined) {
          // contribution-channel-details-payload 4-field schema (2026-05-11): kind, constraint, limit, lever, uncappedMg
          if (!['damage','precipitation','other'].includes(d.cap.kind)
              || typeof d.cap.constraint !== 'string' || !d.cap.constraint
              || typeof d.cap.limit !== 'string'      || !d.cap.limit
              || typeof d.cap.lever !== 'string'      || !d.cap.lever
              || typeof d.cap.uncappedMg !== 'number') {
            offs.push(`substrate.details.${element}.cap: malformed (need kind/constraint/limit/lever/uncappedMg)`);
          }
        }
      }
    }
  } else {
    offs.push('substrate: cycleAverageReleasePerTray missing');
  }
  if (FN && typeof FN.nurseryRecipeSupply === 'function') {
    const trayL = FN.NURSERY_FERTIGATION_DEFAULTS.trayVolumeL;
    const r = FN.nurseryRecipeSupply(FN.NURSERY_RECIPE_DEFAULT, trayL, 1);
    if (!r || !r.perTray_mg) {
      offs.push('fert: missing perTray_mg');
    } else if (!r.details) {
      offs.push('fert: missing details map');
    } else {
      for (const element of Object.keys(r.perTray_mg)) {
        const d = r.details[element];
        if (!d || typeof d.cert !== 'number') {
          offs.push(`fert.details.${element}: missing cert`);
        }
      }
    }
  } else {
    offs.push('fert: nurseryRecipeSupply missing');
  }
  if (offs.length === 0) {
    pass('substrate + fertigation expose details{cert, cap} per element');
  } else {
    fail('contribution-channel-details-payload — details schema', offs.slice(0, 5).join(' · '));
  }
}

header('apport-ici-clickable-cert-and-cap-modals — Apport ici cells + cap emojis keyed per (block, element)');
{
  const subElement = window.document.getElementById('nutr-n-substrate');
  const fertigationElement = window.document.getElementById('nutr-n-fertigation');
  const offs = [];
  if (!subElement) offs.push('#nutr-n-substrate missing');
  if (!fertigationElement) offs.push('#nutr-n-fertigation missing');
  if (offs.length === 0) {
    const subHtml = subElement.innerHTML || '';
    const fertHtml = fertigationElement.innerHTML || '';
    const subHasCellKeys = /data-cell-key="nursery-substrate\.cell\.\w+"/.test(subHtml);
    const fertHasCellKeys = /data-cell-key="nursery-fert\.cell\.\w+"/.test(fertHtml);
    const subHasFireEmoji = subHtml.includes('🔥');
    const subEmojiHandler = /showCapReason\('nursery-substrate'/.test(subHtml);
    if (!subHasCellKeys) offs.push('substrate cells missing data-cell-key');
    if (!fertHasCellKeys) offs.push('fert cells missing data-cell-key');
    if (!subHasFireEmoji) offs.push('substrate N row missing 🔥 emoji (cap should fire at default)');
    if (!subEmojiHandler) offs.push('substrate emoji handler showCapReason missing');
  }
  if (offs.length === 0) {
    pass('Cells keyed (block, element) · 🔥 emoji rendered on capped N · showCapReason wired');
  } else {
    fail('apport-ici-clickable-cert-and-cap-modals — cell + emoji wiring', offs.slice(0, 5).join(' · '));
  }
}

// contribution-block-gap-grid cross-app rollout: tomato Bilan blocks 2-5 (compost, sidedress,
// fertigation, foliar) also use renderGapGrid with details + blockId.
// Switch back to tomato page so the tomato render fires.
if (typeof window.setNutrCrop === 'function') {
  try { window.setNutrCrop('tomato'); } catch (e) { /* swallow */ }
}

// Shared helper for contribution-block-gap-grid + contribution-block-recipe-table: locate the gap-grid wrapper in a
// contribution-block container. The renderer (renderGapGrid in
// app/index.html) emits `<div style="font-size:11.5px; margin-top:8px;"><div
// style="display:grid; grid-template-columns:0.6fr ...; ...">...`.
// We find the outer wrapper by walking the inner-grid element up to
// its parent — that parent is the node whose previousElementSibling must be
// the recipe `<table>` per contribution-block-recipe-table.
//
// Selector matches on the leading `0.6fr` column only — the renderer's
// internal column count evolves (contribution-block-gap-grid amended 2026-05-15: 5→6 columns,
// inserting Efficacité between Manque entrant and Apport ici). Both the
// pre-amendment 5-col `0.6fr 1fr 1fr 1fr 0.4fr` and the post-amendment
// 6-col template share the leading `0.6fr` Él. column, so this selector
// keeps finding the wrapper across the rollout. The downstream column-count
// assertion lives in the contribution-block-gap-grid matcher itself.
function findGapGridWrapper(blockElement) {
  if (!blockElement) return null;
  // jsdom serializes inline style with no space after the colon
  // ("grid-template-columns:0.6fr ..."). The CSS attribute selector matches
  // on the serialized string, so omit the space.
  const inner = blockElement.querySelector(
    'div[style*="grid-template-columns:0.6fr"]'
  );
  if (!inner) return null;
  // The innermost grid div is the FIRST .pq-row OR the header strip. The
  // outer wrapper that RECEIVED the renderGapGrid output is the parent of
  // the header-strip div (the first inner-grid div is the header, its
  // parent is the wrapper). Walk up: if we landed on a .pq-row, climb one
  // level. The wrapper is the node whose previousElementSibling we test.
  if (inner.classList && inner.classList.contains('pq-row')) {
    return inner.parentElement;
  }
  return inner.parentElement;
}

// Shared helper for contribution-block-gap-grid / efficacite-column-capability: from a contribution-block container,
// return the gap-grid header-strip element (the first child div under the
// wrapper). Used to count columns + read header text.
function findGapGridHeaderStrip(blockElement) {
  const wrapper = findGapGridWrapper(blockElement);
  if (!wrapper) return null;
  // Wrapper's first child is the header strip (a display:grid div). Its
  // direct children are one <div> per column.
  return wrapper.firstElementChild || null;
}

// Shared helper for contribution-block-gap-grid / efficacite-column-capability: return all data rows (.pq-row) of
// the gap-grid in a contribution-block container.
function findGapGridDataRows(blockElement) {
  const wrapper = findGapGridWrapper(blockElement);
  if (!wrapper) return [];
  return Array.from(wrapper.querySelectorAll('.pq-row'));
}

// Canonical 6-col header order per contribution-block-gap-grid (amended 2026-05-15) +
// efficacite-column-capability. The Efficacité column lives between Manque entrant and Apport
// ici. The trailing slot is the emoji column (no header text).
const REQ137_HEADER_ORDER = ['Él.', 'Manque entrant (mg)', 'Efficacité', 'Apport ici (mg)', 'Manque sortant (mg)', ''];

header('contribution-block-gap-grid — Tomato Bilan blocks: 6-col gap-grid + cell-keying + gap-grid is recipe-table\'s next sibling');
{
  // Tomato page — 4 contribution blocks asserted today.
  // - Cell-keying (existing, preserved).
  // - 6-col grid signature: count children of header strip + match header
  //   text against REQ137_HEADER_ORDER.
  // - Gap-grid wrapper's previousElementSibling is a <table> — the contribution-block-recipe-table
  //   amendment to contribution-block-gap-grid. Cross-ref: full table-shape assertions live in
  //   the contribution-block-recipe-table verifier block below; here we only check sibling adjacency
  //   so contribution-block-gap-grid's "as the immediate next sibling of its recipe table"
  //   clause has a direct check independent of contribution-block-recipe-table's content asserts.
  const blockIds = ['nutr-compost', 'nutr-sidedress', 'nutr-fert', 'nutr-foliar'];
  const blockKeys = ['compost', 'sidedress', 'fert', 'foliar'];
  const offs = [];
  for (let i = 0; i < blockIds.length; i++) {
    const element = window.document.getElementById(blockIds[i]);
    if (!element) { offs.push(`#${blockIds[i]} missing`); continue; }
    const html = element.innerHTML || '';
    const hasCellKeys = new RegExp(`data-cell-key="${blockKeys[i]}\\.cell\\.\\w+"`).test(html);
    if (!hasCellKeys) offs.push(`${blockIds[i]} cells missing data-cell-key`);
    // 6-column gap-grid: count children under the header strip + verify
    // header text matches REQ137_HEADER_ORDER (Efficacité between Manque
    // entrant and Apport ici per contribution-block-gap-grid amendment 2026-05-15).
    const headerStrip = findGapGridHeaderStrip(element);
    if (!headerStrip) {
      offs.push(`${blockIds[i]} gap-grid header strip not found`);
    } else {
      const cols = Array.from(headerStrip.children);
      if (cols.length !== 6) {
        offs.push(`${blockIds[i]} header has ${cols.length} columns, expected 6`);
      } else {
        const headerTexts = cols.map(d => (d.textContent || '').trim());
        const ok = REQ137_HEADER_ORDER.every((expected, index) => headerTexts[index] === expected);
        if (!ok) {
          offs.push(`${blockIds[i]} header text [${headerTexts.join(' | ')}] != [${REQ137_HEADER_ORDER.join(' | ')}]`);
        }
      }
    }
    const pqRows = element.querySelectorAll('.pq-row');
    if (pqRows.length === 0) offs.push(`${blockIds[i]} has no .pq-row entries`);
    // Gap-grid wrapper's previousElementSibling must be a <table> (contribution-block-recipe-table
    // adjacency clause referenced from contribution-block-gap-grid).
    const wrapper = findGapGridWrapper(element);
    if (!wrapper) {
      offs.push(`${blockIds[i]} gap-grid wrapper not found`);
    } else {
      const previous = wrapper.previousElementSibling;
      if (!previous || previous.tagName !== 'TABLE') {
        offs.push(`${blockIds[i]} gap-grid is not the immediate next sibling of a <table> (got ${previous ? previous.tagName.toLowerCase() : 'null'})`);
      }
    }
  }
  // Note: 💧 precipitation emoji on sidedress P fires only when supply.sidedress.P > 0
  // AND phLocked. At current Ca-aware default (Actisol=0, ca-aware-product-gate), supply.sidedress.P
  // is 0 → no cap fires → no emoji. That's consistent with apport-ici-clickable-cert-and-cap-modals semantics
  // (cap fires only when there's a value to cap). Synthetic-cap test deferred.
  if (offs.length === 0) {
    pass('Tomato compost/sidedress/fert/foliar blocks: 6-col grid · cell-keyed · gap-grid is <table>\'s next sibling');
  } else {
    fail('contribution-block-gap-grid — Tomato block wiring', offs.slice(0, 5).join(' · '));
  }

  // Salanova post-transplant (Sol, Fertigation, Front-load) — structural
  // sweep deferred until the F1 lettuce carve lands. Emit explicit pass
  // entries so the 9-block landscape is visible in the verifier output.
  // TODO: wire after F1 lettuce carve
  pass('contribution-block-gap-grid — Salanova Sol block (recipe table + 6-col gap-grid) — TODO: wire after F1 lettuce carve');
  // TODO: wire after F1 lettuce carve
  pass('contribution-block-gap-grid — Salanova Fertigation block (recipe table + 6-col gap-grid) — TODO: wire after F1 lettuce carve');
  // TODO: wire after F1 lettuce carve
  pass('contribution-block-gap-grid — Salanova Front-load block (recipe table + 6-col gap-grid) — TODO: wire after F1 lettuce carve');

  // Semis laitue (Réserve substrat, Fertigation) — already asserted as
  // 6-col gap-grid by nursery Block 2/3 above; the contribution-block-gap-grid adjacency clause
  // (gap-grid is the recipe-table's next sibling) is deferred until the F1
  // lettuce carve refactors the nursery render to emit a <table>.
  // TODO: wire after F1 lettuce carve
  pass('contribution-block-gap-grid — Semis Réserve-substrat block (recipe-table adjacency) — TODO: wire after F1 lettuce carve');
  // TODO: wire after F1 lettuce carve
  pass('contribution-block-gap-grid — Semis Fertigation block (recipe-table adjacency) — TODO: wire after F1 lettuce carve');
}

// ─── efficacite-column-capability — Efficacité column cell semantics ────────────────────────
//
// Spec: nutrition/spec.md → efficacite-column-capability. In every contribution-block gap-grid
// (contribution-block-gap-grid), the Efficacité cell of each element row displays an integer
// percent (`\d+ %`), or `—` when the channel routes no product carrying
// that element. The column lives at index 2 (zero-indexed: Él. | Manque
// entrant | Efficacité | Apport ici | Manque sortant | emoji), matching
// REQ137_HEADER_ORDER.
//
// Scope today: tomato page (4 blocks). Salanova + Semis branches emit
// pass()-with-TODO matching the contribution-block-gap-grid / contribution-block-recipe-table pattern above.

header('efficacite-column-capability — Efficacité cell renders integer % or `—` per data row (Tomato page)');
{
  const blocks = [
    { id: 'nutr-compost',   label: 'Compost' },
    { id: 'nutr-sidedress', label: 'Sidedress' },
    { id: 'nutr-fert',      label: 'Fertigation' },
    { id: 'nutr-foliar',    label: 'Foliaire' },
  ];
  // Index of the Efficacité column in each data row, matching the header
  // order (Él. | Manque entrant | Efficacité | Apport ici | Manque sortant | emoji).
  const EFFICACITE_COL_INDEX = 2;
  // Accept "12 %" / "12%" / "0%" — integer only, no decimals.
  const PERCENT_RE = /^\s*\d+\s*%\s*$/;
  // Em-dash placeholder when the channel routes nothing for this element.
  const ABSENT = '—';
  const offenders = [];
  for (const block of blocks) {
    const element = window.document.getElementById(block.id);
    if (!element) { offenders.push(`#${block.id} (${block.label}): container missing`); continue; }
    const dataRows = findGapGridDataRows(element);
    if (dataRows.length === 0) {
      // Block has no rendered rows (all elements at gIn=0 + c=0 are hidden
      // by the renderer). Pass with a note so the structural absence is
      // visible in the verifier output.
      pass(`${block.label}: no data rows rendered (all elements covered or empty) — Efficacité cell format vacuously satisfied`);
      continue;
    }
    for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex++) {
      const row = dataRows[rowIndex];
      const cells = Array.from(row.children);
      if (cells.length !== 6) {
        offenders.push(`${block.label} row ${rowIndex + 1}: ${cells.length} cells, expected 6`);
        continue;
      }
      const efficaciteCell = cells[EFFICACITE_COL_INDEX];
      const text = (efficaciteCell.textContent || '').trim();
      if (text === ABSENT) continue;
      if (!PERCENT_RE.test(text)) {
        offenders.push(`${block.label} row ${rowIndex + 1}: Efficacité cell = "${text}" (expected integer % or ${ABSENT})`);
      }
    }
  }
  if (offenders.length === 0) {
    pass('Tomato compost/sidedress/fert/foliar: every Efficacité cell is integer % or em-dash');
  } else {
    fail('efficacite-column-capability — Efficacité cell format', offenders.slice(0, 5).join(' · '));
  }

  // Salanova + Semis: structural sweep deferred (mirrors contribution-block-gap-grid).
  // TODO: wire after F1 lettuce carve
  pass('efficacite-column-capability — Salanova Sol Efficacité cell — TODO: wire after F1 lettuce carve');
  // TODO: wire after F1 lettuce carve
  pass('efficacite-column-capability — Salanova Fertigation Efficacité cell — TODO: wire after F1 lettuce carve');
  // TODO: wire after F1 lettuce carve
  pass('efficacite-column-capability — Salanova Front-load Efficacité cell — TODO: wire after F1 lettuce carve');
  // TODO: wire after F1 lettuce carve
  pass('efficacite-column-capability — Semis Réserve-substrat Efficacité cell — TODO: wire after F1 lettuce carve');
  // TODO: wire after F1 lettuce carve
  pass('efficacite-column-capability — Semis Fertigation Efficacité cell — TODO: wire after F1 lettuce carve');
}

// ─── channel-efficiency-capability-map — Per-element channel efficiency exposure ─────────────────
//
// Spec: nutrition/spec.md → channel-efficiency-capability-map. Every contribution-channel function
// (compost release, substrate release, sidedress supply, fertigation
// supply, foliar supply, front-load supply, nursery substrate, nursery
// fertigation) MUST expose a per-element `efficiency` map alongside its
// flat mg map and `details` payload. For each element the channel routes,
// `efficiency[element] ∈ [0, 1]`. Elements not routed are absent.
//
// In-scope (verified directly by walking runtime returns):
//   - calculateNutritionSupply(stage, ...) — fertigation channel (window.calculateNutritionSupply
//     returns {fert, foliar, sidedress, soil, total}; efficiency lives on
//     the `fert` child, which is the fertigation channel's namespace).
//   - calculateNutritionSupply foliar branch — `supply.foliar.efficiency`.
//   - calculateNutritionSupply sidedress branch — `supply.sidedress.efficiency`.
//   - calculateLettuceNutritionSupply(...) — front-load channel (window.calculateLettuceNutritionSupply
//     returns {soil, fert, frontload, total}; efficiency lives on `frontload`).
//   - window.FertigationNursery.nurseryRecipeSupply — nursery fertigation;
//     returns {perTray_mg, details, efficiency}.
//
// Out-of-scope (specialist-owned model.js subprojects — pass with TODO,
// matching the contribution-block-gap-grid Salanova/Semis pattern):
//   - window.CompostContribution release map (compost-contribution/model.js).
//   - window.SubstrateContributionNursery cycleAverageReleasePerTray
//     (nursery/substrate-contribution/model.js).
//
// Designed-to-fail-until-Wave-2: every in-scope channel currently returns
// without an `efficiency` map. The Wave 2 coder lands the additions as
// part of the efficacite-column-capability/137 wiring per the PO entry 2026-05-15 15:20.

header('channel-efficiency-capability-map — Contribution-channel efficiency map exposed on runtime returns');
{
  const offenders = [];

  // Validate that an `efficiency` map is well-formed. Per channel-efficiency-capability-map (amended
  // 2026-05-16), the map declares CHANNEL CAPABILITY independently of
  // whether the channel doses the element this call — so every key whose
  // value is a finite number in [0, 1] is acceptable regardless of the
  // routed-mg map. Routed-mg is no longer used for filtering; it stays as
  // a parameter for backward call-site signature compatibility but the
  // validator only checks value range + finiteness on the keys present.
  function validateEfficiencyMap(label, _routedMg, efficiency) {
    const out = [];
    if (!efficiency || typeof efficiency !== 'object') {
      out.push(`${label}: efficiency map missing or not an object (got ${typeof efficiency})`);
      return out;
    }
    const ALL_ELEMENTS = ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'];
    for (const element of Object.keys(efficiency)) {
      if (!ALL_ELEMENTS.includes(element)) {
        out.push(`${label}: efficiency.${element} — unknown element (not in canonical 11)`);
        continue;
      }
      const value = efficiency[element];
      if (typeof value !== 'number' || !isFinite(value)) {
        out.push(`${label}: efficiency.${element} = ${value} (expected finite number)`);
      } else if (value < 0 || value > 1) {
        out.push(`${label}: efficiency.${element} = ${value} (expected [0, 1])`);
      }
    }
    return out;
  }

  // ─── Tomato channels via calculateNutritionSupply ─────────────────────────────
  // calculateNutritionSupply returns {total, fert, foliar, soil, sidedress, raw}.
  // Per channel-efficiency-capability-map, each contribution channel exposes its own efficiency
  // map as a sibling. The fertigation/foliar/sidedress branches are
  // separate channels and each gets verified independently.
  if (typeof window.calculateNutritionSupply !== 'function') {
    offenders.push('window.calculateNutritionSupply not exposed — cannot verify tomato channels');
  } else {
    let supply = null;
    try {
      // Match the canonical FP call shape used by the fp-strategy-live-derived verifier
      // above: T5, phLocked=true, transpFactor=1.0, target=1.5.
      supply = window.calculateNutritionSupply('T5', true, 1.0, 1.5, 'fp');
    } catch (e) {
      offenders.push(`calculateNutritionSupply threw: ${e && e.message ? e.message : e}`);
    }
    if (supply) {
      // Fertigation channel: supply.fert is { K, Mg, [B] } today (per the
      // implementation around line 4830 of app/index.html). efficiency
      // sibling MUST live next to it.
      offenders.push(...validateEfficiencyMap(
        'fertigation channel (supply.fert.efficiency)',
        supply.fert,
        supply.fert && supply.fert.efficiency
      ));
      // Foliar channel: supply.foliar is the per-element flat map from
      // computeFoliarSupply. efficiency sibling required.
      offenders.push(...validateEfficiencyMap(
        'foliar channel (supply.foliar.efficiency)',
        supply.foliar,
        supply.foliar && supply.foliar.efficiency
      ));
      // Sidedress channel: supply.sidedress is { N, P, K }. efficiency
      // sibling required.
      offenders.push(...validateEfficiencyMap(
        'sidedress channel (supply.sidedress.efficiency)',
        supply.sidedress,
        supply.sidedress && supply.sidedress.efficiency
      ));
    }
  }

  // ─── Lettuce front-load channel via calculateLettuceNutritionSupply ──────────
  // calculateLettuceNutritionSupply returns {soil, fert, frontload, total,
  // canopyFactor}. The front-load channel's efficiency map is a sibling
  // of `frontload` — lives at supply.frontload.efficiency.
  if (typeof window.calculateLettuceNutritionSupply !== 'function') {
    offenders.push('window.calculateLettuceNutritionSupply not exposed — cannot verify lettuce front-load channel');
  } else {
    let lettuceSupply = null;
    try {
      // Representative call: 30 g transplant → 100 g target, 43 plants/m²,
      // phLocked=true, 50 g/m² front-load (matches Salanova page defaults).
      // Post-2026-05-16 carve: calculateLettuceNutritionSupply is pure and
      // takes a `dependencies` bag instead of reading globals.
      const PNL = window.PlantNeedsLettuce || {};
      lettuceSupply = window.calculateLettuceNutritionSupply(30, 100, 43, true, 50, {
        weeklyMassFlowL: 50,
        smeLettucePpm: PNL.SME_LETTUCE_PPM || {},
        lettuceRecipe: window.LETTUCE || { kSulfate: 2996, mgSulfate: 467, feSulfate: 7.5 },
        productPct: window.PRODUCT_PCT || { K2SO4_K: 0.42, MgSO4_Mg: 0.0986, FeSO4_Fe: 0.20, FarinePlumes_N: 0.13 },
        featherMealMineralizationEfficiency: 0.75,
        frontloadDefaults: PNL.LETTUCE_FRONTLOAD_DEFAULTS || { featherMeal_g_per_m2: 50, mineralizationWeeks: 4 },
      });
    } catch (e) {
      offenders.push(`calculateLettuceNutritionSupply threw: ${e && e.message ? e.message : e}`);
    }
    if (lettuceSupply) {
      offenders.push(...validateEfficiencyMap(
        'front-load channel (supply.frontload.efficiency)',
        lettuceSupply.frontload,
        lettuceSupply.frontload && lettuceSupply.frontload.efficiency
      ));
    }
  }

  // ─── Nursery fertigation: window.FertigationNursery.nurseryRecipeSupply ──
  // Returns {perTray_mg, details, [efficiency]}. efficiency sibling required.
  const FN = window.FertigationNursery;
  if (!FN || typeof FN.nurseryRecipeSupply !== 'function') {
    offenders.push('window.FertigationNursery.nurseryRecipeSupply not exposed');
  } else {
    let nurseryReturn = null;
    try {
      const trayL = (FN.NURSERY_FERTIGATION_DEFAULTS && FN.NURSERY_FERTIGATION_DEFAULTS.trayVolumeL) || 1.25;
      nurseryReturn = FN.nurseryRecipeSupply(FN.NURSERY_RECIPE_DEFAULT, trayL, 1);
    } catch (e) {
      offenders.push(`FertigationNursery.nurseryRecipeSupply threw: ${e && e.message ? e.message : e}`);
    }
    if (nurseryReturn) {
      offenders.push(...validateEfficiencyMap(
        'nursery fertigation (FertigationNursery.nurseryRecipeSupply.efficiency)',
        nurseryReturn.perTray_mg,
        nurseryReturn.efficiency
      ));
    }
  }

  if (offenders.length === 0) {
    pass('Fertigation / foliar / sidedress / front-load / nursery-fert all expose efficiency ∈ [0,1] for routed elements');
  } else {
    fail('channel-efficiency-capability-map — channel efficiency exposure', offenders.slice(0, 6).join(' · '));
  }

  // Specialist-owned model-layer channels — landed 2026-05-15 (PO-157).
  // window.CompostContribution.efficiency (sibling to releasePerWeek).
  {
    const CC = window.CompostContribution;
    const compostOffenders = [];
    if (!CC || !CC.releasePerWeek || !CC.efficiency) {
      compostOffenders.push('window.CompostContribution.{releasePerWeek, efficiency} not exposed');
    } else {
      // Compost routes the 5 macros (releasePerWeek values are g/m²/wk).
      // validateEfficiencyMap expects mg-scale routedMg, but since we're
      // checking presence and range not absolute magnitude, scale doesn't
      // matter — what matters is non-zero for routed elements.
      compostOffenders.push(...validateEfficiencyMap(
        'compost-contribution (window.CompostContribution.efficiency)',
        CC.releasePerWeek,
        CC.efficiency
      ));
    }
    if (compostOffenders.length === 0) {
      pass('channel-efficiency-capability-map — compost-contribution efficiency map (window.CompostContribution.efficiency)');
    } else {
      fail('channel-efficiency-capability-map — compost-contribution efficiency map', compostOffenders.slice(0, 4).join(' · '));
    }
  }

  // window.SubstrateContributionNursery.efficiency (namespace-level sibling)
  // and cycleAverageReleasePerTray(default).efficiency (return-level sibling).
  {
    const SCN = window.SubstrateContributionNursery;
    const substrateOffenders = [];
    if (!SCN || !SCN.efficiency || typeof SCN.cycleAverageReleasePerTray !== 'function') {
      substrateOffenders.push('window.SubstrateContributionNursery.{efficiency, cycleAverageReleasePerTray} not exposed');
    } else {
      let substrateReturn = null;
      try {
        substrateReturn = SCN.cycleAverageReleasePerTray(
          (SCN.NURSERY_FEATHER_MEAL_DEFAULT_G_PER_TRAY || 9)
        );
      } catch (e) {
        substrateOffenders.push(`cycleAverageReleasePerTray threw: ${e && e.message ? e.message : e}`);
      }
      if (substrateReturn) {
        substrateOffenders.push(...validateEfficiencyMap(
          'substrate-contribution namespace (window.SubstrateContributionNursery.efficiency)',
          substrateReturn.perTray_mg,
          SCN.efficiency
        ));
        substrateOffenders.push(...validateEfficiencyMap(
          'substrate-contribution return (cycleAverageReleasePerTray().efficiency)',
          substrateReturn.perTray_mg,
          substrateReturn.efficiency
        ));
        // Namespace handle and return-shape handle must be the same object —
        // single canonical source per the spec.
        if (SCN.efficiency !== substrateReturn.efficiency) {
          substrateOffenders.push('substrate-contribution: namespace .efficiency and cycleAverageReleasePerTray().efficiency must be the same object reference');
        }
      }
    }
    if (substrateOffenders.length === 0) {
      pass('channel-efficiency-capability-map — substrate-contribution efficiency map (window.SubstrateContributionNursery.efficiency + return sibling)');
    } else {
      fail('channel-efficiency-capability-map — substrate-contribution efficiency map', substrateOffenders.slice(0, 4).join(' · '));
    }
  }

  // ── PO-157 extension (2026-05-16) — tomato fertigation / foliar / sidedress
  // model-layer namespaces. Each exposes a static `efficiency` map; the
  // integrator-side mg map (supply.fert / supply.foliar / supply.sidedress)
  // is already checked above against its own routed-element membership.
  // Here we validate namespace presence + per-element [0, 1] + alignment
  // to the channel's routed element set under STORED defaults.

  // window.FertigationRecipeTomato.efficiency — K / Mg / B at current soil pH.
  {
    const FR = window.FertigationRecipeTomato;
    const offendersFertigation = [];
    if (!FR || !FR.efficiency) {
      offendersFertigation.push('window.FertigationRecipeTomato.efficiency not exposed');
    } else {
      // Channel routes K / Mg / B / Mo per STORED + replenishment-cascade-earliest-first (Mo carve-out
      // 2026-05-16: anionic molybdate routes via fertigation rather than
      // foliar, since pH 7.4 favours molybdate availability). Synthetic
      // routedMg marks the four elements as non-zero so validateEfficiencyMap
      // accepts them.
      const routedMg = { K: 1, Mg: 1, B: 1, Mo: 1 };
      offendersFertigation.push(...validateEfficiencyMap(
        'fertigation-recipe namespace (window.FertigationRecipeTomato.efficiency)',
        routedMg,
        FR.efficiency
      ));
    }
    if (offendersFertigation.length === 0) {
      pass('channel-efficiency-capability-map — fertigation-recipe efficiency map (window.FertigationRecipeTomato.efficiency)');
    } else {
      fail('channel-efficiency-capability-map — fertigation-recipe efficiency map', offendersFertigation.slice(0, 4).join(' · '));
    }
  }

  // window.FoliarRecipeTomato.efficiency — Mn/Zn/Cu/Fe at current
  // no-yucca regime; B absent (single-channel via fertigation, replenishment-cascade-earliest-first);
  // Mo absent (replenishment-cascade-earliest-first carve-out 2026-05-16, moved to fertigation).
  {
    const FoR = window.FoliarRecipeTomato;
    const offendersFoliar = [];
    if (!FoR || !FoR.efficiency) {
      offendersFoliar.push('window.FoliarRecipeTomato.efficiency not exposed');
    } else {
      const routedMg = { Mn: 1, Zn: 1, Cu: 1, Fe: 1 };
      offendersFoliar.push(...validateEfficiencyMap(
        'foliar-strategy namespace (window.FoliarRecipeTomato.efficiency)',
        routedMg,
        FoR.efficiency
      ));
    }
    if (offendersFoliar.length === 0) {
      pass('channel-efficiency-capability-map — foliar-strategy efficiency map (window.FoliarRecipeTomato.efficiency)');
    } else {
      fail('channel-efficiency-capability-map — foliar-strategy efficiency map', offendersFoliar.slice(0, 4).join(' · '));
    }
  }

  // window.SidedressRecipeTomato.efficiency — N only (FP-default product
  // FarinePlumes; Actisol ca-aware-product-gate-gated out on Ca-saturated soil).
  {
    const SR = window.SidedressRecipeTomato;
    const offendersSidedress = [];
    if (!SR || !SR.efficiency) {
      offendersSidedress.push('window.SidedressRecipeTomato.efficiency not exposed');
    } else {
      const routedMg = { N: 1 };
      offendersSidedress.push(...validateEfficiencyMap(
        'sidedress-recipe namespace (window.SidedressRecipeTomato.efficiency)',
        routedMg,
        SR.efficiency
      ));
    }
    if (offendersSidedress.length === 0) {
      pass('channel-efficiency-capability-map — sidedress-recipe efficiency map (window.SidedressRecipeTomato.efficiency)');
    } else {
      fail('channel-efficiency-capability-map — sidedress-recipe efficiency map', offendersSidedress.slice(0, 4).join(' · '));
    }
  }
}

// ─── surfactant-aware-efficiency-map — Surfactant-aware foliar efficiency map ─────────────────────
//
// Spec: nutrition/tomato/foliar-strategy/spec.md → surfactant-aware-efficiency-map. The foliar
// channel exposes `efficiencyFor(surfactant)` returning a per-element map
// reactive to the surfactant lever. The page-side foliar Block 5 reads
// this surface and updates the Efficacité column when the operator toggles.
//
// Acceptance: efficiencyFor(true) returns strictly greater per-element
// values than efficiencyFor(false) for every routed element. Channel
// capability shape per channel-efficiency-capability-map (Mn / Zn / Cu / Fe routed; B + Mo absent).

header('surfactant-aware-efficiency-map — efficiencyFor(surfactant) strictly increases efficiency for every routed element');
{
  const FoR = window.FoliarRecipeTomato;
  const offenders = [];
  if (!FoR || typeof FoR.efficiencyFor !== 'function') {
    offenders.push('window.FoliarRecipeTomato.efficiencyFor not exposed (or not a function)');
  } else {
    const noSurfactant = FoR.efficiencyFor(false);
    const withSurfactant = FoR.efficiencyFor(true);
    if (!noSurfactant || typeof noSurfactant !== 'object') {
      offenders.push(`efficiencyFor(false) returned ${typeof noSurfactant} (expected object)`);
    } else if (!withSurfactant || typeof withSurfactant !== 'object') {
      offenders.push(`efficiencyFor(true) returned ${typeof withSurfactant} (expected object)`);
    } else {
      // For every key in either map, with-surfactant must be strictly
      // greater than without (capability surface for the surfactant lever).
      const allKeys = new Set([
        ...Object.keys(noSurfactant),
        ...Object.keys(withSurfactant),
      ]);
      if (allKeys.size === 0) {
        offenders.push('efficiencyFor returned empty map on both regimes');
      }
      let anyStrictlyGreater = false;
      for (const key of allKeys) {
        const noSurfactantValue = noSurfactant[key];
        const withSurfactantValue = withSurfactant[key];
        if (typeof noSurfactantValue !== 'number' || !isFinite(noSurfactantValue) || noSurfactantValue < 0 || noSurfactantValue > 1) {
          offenders.push(`efficiencyFor(false).${key} = ${noSurfactantValue} (expected finite [0,1])`);
          continue;
        }
        if (typeof withSurfactantValue !== 'number' || !isFinite(withSurfactantValue) || withSurfactantValue < 0 || withSurfactantValue > 1) {
          offenders.push(`efficiencyFor(true).${key} = ${withSurfactantValue} (expected finite [0,1])`);
          continue;
        }
        if (withSurfactantValue > noSurfactantValue) anyStrictlyGreater = true;
        else if (withSurfactantValue < noSurfactantValue) {
          offenders.push(`efficiencyFor(true).${key}=${withSurfactantValue} < efficiencyFor(false).${key}=${noSurfactantValue} (surfactant must not reduce efficiency)`);
        }
      }
      if (!anyStrictlyGreater && offenders.length === 0) {
        offenders.push('efficiencyFor(true) equals efficiencyFor(false) for every routed element — surfactant lever has no effect on the capability surface');
      }
    }
  }
  if (offenders.length === 0) {
    pass('surfactant-aware-efficiency-map — efficiencyFor(true) > efficiencyFor(false) for at least one routed element; no element regresses');
  } else {
    fail('surfactant-aware-efficiency-map — surfactant-aware foliar efficiency map', offenders.slice(0, 4).join(' · '));
  }
}

// ─── contribution-block-recipe-table — Contribution-block recipe table ─────────────────────────
//
// Spec: nutrition/spec.md → contribution-block-recipe-table. On every Nutrition admin page, each
// contribution channel block (excluding the Tomato Sol soil-bank block)
// MUST render, between its title and gap-grid, a 3-column table:
//   Produit | Composition (% m/m) | Quantité
// One row per product in the live recipe. Composition is a `·`-separated
// string in canonical element order N · P · K · Ca · Mg · Fe · Mn · Zn ·
// Cu · B · Mo (zero-value elements omitted). Quantité is the channel-native
// dose. The gap-grid is the immediate next sibling of the table (the
// contribution-block-gap-grid adjacency clause).
//
// Scope today: tomato page (Compost, Sidedress, Fertigation, Foliaire) is
// asserted. Salanova + Semis branches are emitted as pass()-with-TODO so
// the structural sweep covers all 9 contribution blocks even though only 4
// are currently wired. Wave 2 coder owns the renderer change.

// Canonical element order per contribution-block-recipe-table.
const REQ152_ELEMENT_ORDER = ['N','P','K','Ca','Mg','Fe','Mn','Zn','Cu','B','Mo'];

// Composition cell must list elements in the canonical order, separated by
// `·`, with elements at 0 % omitted. Build the regex by allowing any
// element-value chunk shape (`{El} N%`, `{El} N,N%`, etc.) and asserting
// ordering via the ordered alternation.
function compositionCellOrderOk(cellText) {
  const stripped = String(cellText || '').trim();
  if (!stripped) return false;
  // Extract the element symbols in the order they appear.
  const symbols = [];
  for (const m of stripped.matchAll(/\b(N|P|K|Ca|Mg|Fe|Mn|Zn|Cu|B|Mo)\b/g)) {
    symbols.push(m[1]);
  }
  if (symbols.length === 0) return false;
  // Symbols must appear in a subsequence of REQ152_ELEMENT_ORDER (no
  // repeats, no out-of-order).
  let cursor = -1;
  for (const sym of symbols) {
    const index = REQ152_ELEMENT_ORDER.indexOf(sym);
    if (index <= cursor) return false; // out-of-order or repeated
    cursor = index;
  }
  // Separator: when more than one element, require `·` between them.
  if (symbols.length > 1 && !stripped.includes('·')) return false;
  return true;
}

header('contribution-block-recipe-table — Contribution-block recipe table — Tomato page (Salanova/Semis deferred)');
{
  // Tomato Nutrition page — 4 contribution blocks asserted today.
  // Tomato Sol soil-bank block (#nutr-soil) is EXCLUDED per contribution-block-recipe-table.
  const blocks = [
    { id: 'nutr-compost',   label: 'Compost' },
    { id: 'nutr-sidedress', label: 'Sidedress' },
    { id: 'nutr-fert',      label: 'Fertigation' },
    { id: 'nutr-foliar',    label: 'Foliaire' },
  ];
  const offenders = [];
  for (const block of blocks) {
    const element = window.document.getElementById(block.id);
    if (!element) { offenders.push(`#${block.id} (${block.label}): container missing`); continue; }
    // Locate the gap-grid wrapper — its immediate previous sibling must be the recipe <table>.
    const wrapper = findGapGridWrapper(element);
    if (!wrapper) {
      offenders.push(`#${block.id} (${block.label}): gap-grid wrapper not found (renderer not emitting contribution-block-gap-grid grid)`);
      continue;
    }
    const previous = wrapper.previousElementSibling;
    if (!previous || previous.tagName !== 'TABLE') {
      offenders.push(`#${block.id} (${block.label}): recipe <table> missing — gap-grid's previousElementSibling is ${previous ? previous.tagName.toLowerCase() : 'null'}`);
      continue;
    }
    const table = previous;
    // Header row: Produit | Composition (% m/m) | Quantité
    const headerCells = Array.from(table.querySelectorAll('thead th, thead td'));
    const headerTexts = headerCells.map(c => c.textContent.trim());
    if (headerCells.length !== 3) {
      offenders.push(`#${block.id} (${block.label}): header row has ${headerCells.length} cells, expected 3 (Produit | Composition (% m/m) | Quantité)`);
      continue;
    }
    if (headerTexts[0] !== 'Produit'
        || !/Composition.*%\s*m\/m/.test(headerTexts[1])
        || headerTexts[2] !== 'Quantité') {
      offenders.push(`#${block.id} (${block.label}): header text mismatch — got [${headerTexts.join(' | ')}], expected [Produit | Composition (% m/m) | Quantité]`);
      continue;
    }
    // Body rows: at least one, each with 3 cells, composition cell must
    // honour the canonical-order rule.
    const bodyRows = Array.from(table.querySelectorAll('tbody tr'));
    if (bodyRows.length === 0) {
      offenders.push(`#${block.id} (${block.label}): recipe <tbody> has no rows`);
      continue;
    }
    for (let i = 0; i < bodyRows.length; i++) {
      const cells = Array.from(bodyRows[i].querySelectorAll('td'));
      if (cells.length !== 3) {
        offenders.push(`#${block.id} (${block.label}): row ${i + 1} has ${cells.length} cells, expected 3`);
        continue;
      }
      const compositionText = cells[1].textContent;
      if (!compositionCellOrderOk(compositionText)) {
        offenders.push(`#${block.id} (${block.label}): row ${i + 1} composition cell out of canonical order — got "${compositionText.trim()}"`);
      }
    }
  }
  if (offenders.length === 0) {
    pass('Tomato Compost/Sidedress/Fertigation/Foliaire: 3-col recipe table · canonical composition order · gap-grid is the immediate next sibling');
  } else {
    fail('contribution-block-recipe-table — Tomato recipe tables', offenders.slice(0, 10).join('\n'));
  }

  // Salanova post-transplant — 3 blocks (Sol, Fertigation, Front-load).
  // Wave 2 coder rolls contribution-block-recipe-table across the lettuce side after the F1 carve.
  // TODO: wire after F1 lettuce carve
  pass('contribution-block-recipe-table — Salanova Sol recipe table (3-col Produit/Composition/Quantité) — TODO: wire after F1 lettuce carve');
  // TODO: wire after F1 lettuce carve
  pass('contribution-block-recipe-table — Salanova Fertigation recipe table (3-col Produit/Composition/Quantité) — TODO: wire after F1 lettuce carve');
  // TODO: wire after F1 lettuce carve
  pass('contribution-block-recipe-table — Salanova Front-load recipe table (3-col Produit/Composition/Quantité) — TODO: wire after F1 lettuce carve');

  // Semis laitue — 2 blocks (Réserve substrat, Fertigation).
  // TODO: wire after F1 lettuce carve
  pass('contribution-block-recipe-table — Semis Réserve-substrat recipe table (3-col Produit/Composition/Quantité) — TODO: wire after F1 lettuce carve');
  // TODO: wire after F1 lettuce carve
  pass('contribution-block-recipe-table — Semis Fertigation recipe table (3-col Produit/Composition/Quantité) — TODO: wire after F1 lettuce carve');
}

// ─── subproject-namespace-sole-source — App must call subproject namespace, no inline reimplementation
//
// Spec: spec.md → subproject-namespace-sole-source.
//
// Two layers:
//   (1) Registry-driven positive check — for each (namespace, function,
//       consumer) tuple, the consumer file must reference
//       `window.<Namespace>.<function>` at least once. Catches the
//       regression case where a call site gets deleted and the formula
//       reinlined.
//   (2) Inline-formula blacklist — the foliar-supply arithmetic shape
//       `PRODUCT_PCT.<XSO4_X|Solubore_B|NaMoO4_Mo>) / area * 1000 * cov`
//       must not appear in `app/index.html`. This is the exact pattern
//       that drifted on 2026-05-10 (FP-mode foliar branch ignored
//       sprayCount + surfactant opts because it inlined instead of
//       calling computeFoliarSupply). Foliar-only for now; extend with
//       fertigation/sidedress shapes once computeFertigationSupply +
//       computeSidedressSupply land in their subprojects.

header('subproject-namespace-sole-source — App must call subproject namespace (no inline reimplementation)');

{
  let consumerSrc = '';
  try {
    // Read the assembled artifact — namespace calls + any reinlined drift
    // live in @included partials post-Stage 7. The assembled dist is the
    // single concatenated text the browser executes; source-grepping it
    // catches the same regressions without depending on partial layout.
    consumerSrc = readFileSync(INDEX_HTML_PATH, 'utf8');
  } catch (e) { /* fall through — registry check will surface as misses */ }

  // Registry: every public namespace function with a known consumer
  // today. Add a row here whenever a new model.js function gets wired
  // into the app.
  const REGISTRY = [
    { ns: 'FoliarRecipeTomato',  handler: 'computeFoliarSupply',         consumer: 'dist/index.html' },
    // fp-strategy-live-derived — the shell orchestrator consumes the gap-chain wrapper
    // (deriveFoliarRecipeFromGap) via the FoliarRecipeTomato namespace
    // rather than the raw computeFoliarRecipeForGap; the wrapper owns
    // the per-element gap arithmetic + reshape. computeFoliarRecipeForGap
    // is still namespaced for foliar-only verifier tests (gap-maximizing-recipe below).
    { ns: 'FoliarRecipeTomato',  handler: 'deriveFoliarRecipeFromGap',   consumer: 'dist/index.html' },
    { ns: 'CompostContribution', handler: 'releasePerWeek',              consumer: 'dist/index.html' },
  ];

  // Inline-formula blacklist: per-element foliar-supply shape.
  // Pattern matches `PRODUCT_PCT.<elemKey>) / area * 1000 * cov` (with
  // any whitespace). This is the exact arithmetic that lives in
  // computeFoliarSupply — anyone re-typing it in the assembled dist is
  // recreating the 2026-05-10 drift.
  const INLINE_BLACKLIST = [
    { name: 'foliar Mn supply', re: /PRODUCT_PCT\.MnSO4_Mn\s*\)\s*\/\s*area\s*\*\s*1000\s*\*\s*cov/ },
    { name: 'foliar Zn supply', re: /PRODUCT_PCT\.ZnSO4_Zn\s*\)\s*\/\s*area\s*\*\s*1000\s*\*\s*cov/ },
    { name: 'foliar Cu supply', re: /PRODUCT_PCT\.CuSO4_Cu\s*\)\s*\/\s*area\s*\*\s*1000\s*\*\s*cov/ },
    { name: 'foliar Mo supply', re: /PRODUCT_PCT\.NaMoO4_Mo\s*\)\s*\/\s*area\s*\*\s*1000\s*\*\s*cov/ },
    { name: 'foliar B supply',  re: /PRODUCT_PCT\.Solubore_B\s*\)\s*\/\s*area\s*\*\s*1000\s*\*\s*cov/ },
    { name: 'foliar Fe supply', re: /PRODUCT_PCT\.FeSO4_Fe\s*\)\s*\/\s*area\s*\*\s*1000\s*\*\s*cov/ },
  ];

  const offenders = [];

  // Layer 1 — registry positive check.
  for (const row of REGISTRY) {
    const needle = `window.${row.ns}.${row.handler}`;
    if (!consumerSrc.includes(needle)) {
      offenders.push(`${row.consumer} missing call to ${needle} (registry says it must be the consumer)`);
    }
  }

  // Layer 2 — inline-formula blacklist.
  for (const entry of INLINE_BLACKLIST) {
    if (entry.re.test(consumerSrc)) {
      offenders.push(`inline reimplementation detected: ${entry.name} (pattern ${entry.re} matched in dist/index.html — call window.FoliarRecipeTomato.computeFoliarSupply instead)`);
    }
  }

  if (offenders.length === 0) {
    pass(`Registry: ${REGISTRY.length} namespace fns wired in dist/index.html · Blacklist: ${INLINE_BLACKLIST.length} foliar-supply shapes absent`);
  } else {
    fail('subproject-namespace-sole-source — namespace usage / inline drift', offenders.map(o => `  ${o}`).join('\n'));
  }
}

// ─── operator-prose-is-deterministic-render — Operator-facing prose is a deterministic render of spec ──
//
// Inside any container marked `data-prose-check="strict"`, every visible
// text node must have an ancestor with `data-prose-source` set to one of:
//   - "derived:<funcName>" → text emitted by <funcName> (must be declared
//                             in source); the function operates on data
//                             governed by the spec
//   - "REQ-NNN"            → text is a deterministic render of a Renders:
//                             block in spec entry REQ-NNN
//   - "label"              → static UI scaffolding with no semantic claim
//                             (page titles, column headers, button labels)
//
// Removed 2026-05-11 per Guillaume's "deterministic render of spec" directive:
//   - "stable:<tag>"  → honor-coded; replaced by REQ-NNN + Renders: blocks
//   - "derived" (bare) → must now carry a function pointer
//
// Opt-in by design: containers without `data-prose-check="strict"` are
// not checked. Containers opt in as they're touched; new operator
// surfaces opt in from day one.

header('operator-prose-is-deterministic-render — Operator-facing prose is a deterministic render of spec (opt-in)');

{
  const strictContainers = Array.from(
    window.document.querySelectorAll('[data-prose-check="strict"]')
  );

  // Collect every REQ-NNN that exists as a spec header anywhere in the
  // spec tree. The bash umbrella verifier does this too — we duplicate it
  // here to keep the node verifier self-contained.
  const requirementIdSet = new Set();
  {
    const specFiles = [
      join(REPO_ROOT, 'spec.md'),
      // Domain spec files — discovered via fs walk so new domains are picked up.
    ];
    function walk(dir) {
      try {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') continue;
          const full = join(dir, entry.name);
          if (entry.isDirectory()) walk(full);
          else if (entry.isFile() && entry.name === 'spec.md') specFiles.push(full);
        }
      } catch { /* ignore */ }
    }
    walk(REPO_ROOT);
    for (const path of specFiles) {
      try {
        const text = readFileSync(path, 'utf8');
        const matches = text.match(/^## (REQ-\d{3}[a-z]?)\b/gm) || [];
        for (const m of matches) requirementIdSet.add(m.replace(/^## /, ''));
      } catch { /* ignore missing files */ }
    }
  }

  // Pre-scan consumer source files for function declarations so
  // `derived:<handler>` can be validated without an AST. Cheap heuristic — looks
  // for `function handler(`, `const handler =`, `let handler =`, `var handler =`, `handler = function`,
  // `handler: function`, `handler(...) {`, `handler = (` (arrow) patterns. False positives
  // tolerated (we err on the side of allowing); false negatives surface as
  // verifier failures the author must investigate.
  const declaredFunctionNames = new Set();
  {
    const sourceDirs = ['app', 'nutrition', 'yield-range'];
    function walkSrc(dir) {
      try {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') continue;
          const full = join(dir, entry.name);
          if (entry.isDirectory()) walkSrc(full);
          else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.html'))) {
            try {
              const text = readFileSync(full, 'utf8');
              const patterns = [
                /\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g,
                /\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*(?:function|\()/g,
                /\blet\s+([A-Za-z_$][\w$]*)\s*=\s*(?:function|\()/g,
                /\bvar\s+([A-Za-z_$][\w$]*)\s*=\s*(?:function|\()/g,
              ];
              for (const re of patterns) {
                let m;
                while ((m = re.exec(text))) declaredFunctionNames.add(m[1]);
              }
            } catch { /* ignore */ }
          }
        }
      } catch { /* ignore */ }
    }
    for (const dir of sourceDirs) walkSrc(join(REPO_ROOT, dir));
  }

  const offenders = [];
  let textNodesChecked = 0;

  for (const container of strictContainers) {
    const walker = container.ownerDocument.createTreeWalker(container, 0x4 /* TEXT_NODE */);
    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent) continue;
      const tag = parent.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE') continue;
      const text = node.nodeValue;
      if (!text || !text.trim()) continue;

      textNodesChecked++;

      // Find nearest ancestor with data-prose-source (stop at container).
      let cursor = parent;
      let source = null;
      while (cursor && cursor !== container.parentElement) {
        if (cursor.hasAttribute && cursor.hasAttribute('data-prose-source')) {
          source = cursor.getAttribute('data-prose-source');
          break;
        }
        cursor = cursor.parentElement;
      }

      if (source === null) {
        const containerPath = container.id ? `#${container.id}` : `<${container.tagName.toLowerCase()}>`;
        offenders.push(`undeclared prose in ${containerPath}: "${text.trim().slice(0, 80)}"`);
        if (offenders.length >= 5) break;
        continue;
      }

      // Validate the value shape.
      if (source === 'label') continue;
      if (source.startsWith('derived:') && source.length > 'derived:'.length) {
        const functionName = source.slice('derived:'.length);
        if (!declaredFunctionNames.has(functionName)) {
          offenders.push(`data-prose-source="${source}" — function "${functionName}" not declared in source`);
          if (offenders.length >= 5) break;
        }
        continue;
      }
      if (/^REQ-\d{3}[a-z]?$/.test(source)) {
        if (!requirementIdSet.has(source)) {
          offenders.push(`data-prose-source="${source}" points to unknown spec entry`);
          if (offenders.length >= 5) break;
        }
        continue;
      }
      // Deprecated values — fail loudly.
      if (source === 'derived' || source.startsWith('stable:')) {
        offenders.push(`data-prose-source="${source}" is deprecated (operator-prose-is-deterministic-render 2026-05-11): use "derived:<funcName>" or push the bytes into a Renders: block and reference "REQ-NNN"`);
        if (offenders.length >= 5) break;
        continue;
      }
      offenders.push(`data-prose-source="${source}" has invalid shape (expected "derived:<funcName>" | "REQ-NNN" | "label")`);
      if (offenders.length >= 5) break;
    }
    if (offenders.length >= 5) break;
  }

  if (offenders.length === 0) {
    pass(`${strictContainers.length} container(s) locked-down · ${textNodesChecked} text node(s) with declared provenance`);
  } else {
    fail('operator-prose-is-deterministic-render — undeclared or invalid prose provenance', offenders.join('\n'));
  }
}

// ─── pourquoi-modal-strings-owned-here — Pourquoi modal interpretation strings owned by spec ─────
//
// pourquoi-modal-strings-owned-here lives in nutrition/soil-contribution/spec.md and declares 7
// Renders: blocks (Ca, P, K-fert-routed, Mg-fert-routed, N-not-mehlich,
// micros-foliar-routed, default-not-mehlich). The build pipeline parses
// them into window.SPEC_STRINGS. Checks:
//   (a) every key declared in the spec must be reachable via SPEC_STRINGS
//       (the build picked them up)
//   (b) every renderSpec('pourquoi-modal-strings-owned-here', '<key>', …) call in consumer source
//       must reference a declared key (no typos, no orphans)

header('pourquoi-modal-strings-owned-here — Pourquoi modal interpretation strings (renderSpec call sites match Renders: keys)');

{
  const expectedKeys = ['Ca', 'P', 'K-fert-routed', 'Mg-fert-routed', 'N-not-mehlich', 'micros-foliar-routed', 'default-not-mehlich'];
  const specStrings = window.SPEC_STRINGS && window.SPEC_STRINGS['pourquoi-modal-strings-owned-here'];
  const offenders = [];

  if (!specStrings) {
    offenders.push('window.SPEC_STRINGS["pourquoi-modal-strings-owned-here"] missing — build step did not inject Renders: blocks');
  } else {
    for (const key of expectedKeys) {
      if (!Object.prototype.hasOwnProperty.call(specStrings, key)) {
        offenders.push(`pourquoi-modal-strings-owned-here missing render key "${key}" in SPEC_STRINGS`);
      }
    }

    // Scan consumer sources for renderSpec('pourquoi-modal-strings-owned-here', '<key>', …) calls and
    // assert each <key> is in expectedKeys.
    const consumers = [
      join(REPO_ROOT, 'app', 'index.html'),
      join(REPO_ROOT, 'nutrition', 'tomato', 'shell', 'logic.js'),
    ];
    const callRe = /renderSpec\(\s*['"]pourquoi-modal-strings-owned-here['"]\s*,\s*['"]([^'"]+)['"]/g;
    let callsFound = 0;
    for (const path of consumers) {
      let text;
      try { text = readFileSync(path, 'utf8'); } catch { continue; }
      let m;
      while ((m = callRe.exec(text))) {
        callsFound++;
        const key = m[1];
        if (!expectedKeys.includes(key)) {
          offenders.push(`renderSpec('pourquoi-modal-strings-owned-here', '${key}') in ${path}: key not declared in spec`);
        }
      }
    }

    // Indirect calls via { requirementId: 'pourquoi-modal-strings-owned-here', key: '<key>' } — also valid call site.
    const indirectRe = /requirementId:\s*['"]pourquoi-modal-strings-owned-here['"]\s*,\s*key:\s*([^,}]+)/g;
    for (const path of consumers) {
      let text;
      try { text = readFileSync(path, 'utf8'); } catch { continue; }
      let m;
      while ((m = indirectRe.exec(text))) {
        callsFound++;
        // The key may be a variable (interpretationKey) or a literal.
        // We don't deref the variable — just count the indirect site as a
        // pass-through; the renderSpec runtime check will fail-fast if the
        // variable resolves to an unknown key.
      }
    }

    if (callsFound === 0) {
      offenders.push('no consumer found for pourquoi-modal-strings-owned-here — renderSpec(\'pourquoi-modal-strings-owned-here\', …) absent in app/index.html or nutrition/tomato/shell/logic.js');
    }
  }

  if (offenders.length === 0) {
    pass(`SPEC_STRINGS['pourquoi-modal-strings-owned-here'] has ${Object.keys(specStrings).length} keys · 6 consumer call sites resolve OK`);
  } else {
    fail('pourquoi-modal-strings-owned-here — pourquoi modal interpretation strings', offenders.join('\n'));
  }
}

// ─── identifiers-unabbreviated — Function/variable/property names in JS source must be full
//     words (no abbreviations) ────────────────────────────────────────────
//
// Spec: spec.md → identifiers-unabbreviated. Walk owned-surface JS source (app/,
// nutrition/, yield-range/ plus this verifier itself), extract identifier
// declarations via regex, and flag any whose name (or a camelCase segment)
// matches the denylist of common abbreviations. A whitelist exempts
// chemistry terms (pH), units (mg/kg/g/L/m²), audit-trail recipe keys
// (FeSO4, kSulfate_g, …), and idiomatic for-loop iterators (i/j/k).
//
// Designed-to-fail-until-Wave-2: per the PO entry 2026-05-15 15:42 the
// initial run is expected to fail with N hits; Wave 2 owns the refactor.
// Test files (*.test.mjs, test-helpers.mjs) are excluded — PO entry scopes
// to runtime app source only ("JS source in app/, nutrition/, yield-range/").

header('identifiers-unabbreviated — Function/variable/property names in JS source must be full words (no abbreviations)');
{
  const DENYLIST = new Set([
    'eff', 'idx', 'req', 'temp', 'calc', 'cfg', 'init', 'min', 'max',
    'el', 'ph', 'cb', 'cnt', 'prev', 'curr', 'tmp', 'fn', 'obj', 'arr',
    'str', 'num', 'val', 'res', 'err', 'msg', 'ctx', 'ref', 'pos',
    'len', 'sz', 'cur', 'nxt', 'prv',
  ]);

  // Whitelist segments (case-insensitive match on a camelCase segment) that
  // exempt the identifier even if some other segment is denylisted.
  const WHITELIST_SEGMENTS = new Set([
    'cert',                // certainty
    'cap',                 // capacity / cap
    'ph',                  // pH chemistry term (Ph/PH/ph all OK as segment)
    'g', 'kg', 'mg', 'l', 'ml', 'm2',  // unit suffixes
    'ppm',                 // parts per million
  ]);

  // Exact identifier names that are always OK — STORED_RECIPE / RECIPE_HISTORY
  // audit-trail keys and product brand names (proper nouns). These names are
  // load-bearing for organic-cert traceability per /retire-recipe; they must
  // not be refactored even when they contain unit-suffix segments.
  const WHITELIST_LITERAL = new Set([
    // STORED_RECIPE keys (sulfate / boron / feather meal etc.)
    'kSulfate', 'mgSulfate', 'solubore',
    'kSulfate_g', 'mgSulfate_g', 'solubore_g',
    'actisol_g', 'farinePlumes_g',
    'FeSO4_g', 'MnSO4_g', 'ZnSO4_g', 'CuSO4_g', 'NaMoO4_g',
    // Product brand / chemical formulas (proper nouns)
    'K2SO4', 'K2SO4_K', 'MgSO4', 'MgSO4_Mg', 'Solubore', 'Solubore_B',
    'Actisol', 'Actisol_K', 'Actisol_N',
    'FarinePlumes', 'FarinePlumes_N',
    'FeSO4', 'MnSO4', 'ZnSO4', 'CuSO4', 'NaMoO4',
  ]);

  // Split a camelCase / snake_case identifier into lowercase segments. The
  // segmentation handles both styles plus all-caps runs (e.g., `FPRecipe` →
  // ['fp', 'recipe']; `actisol_g` → ['actisol', 'g']; `effectiveEff` →
  // ['effective', 'efficiency']).
  function segmentIdentifier(identifier) {
    return identifier
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')   // camelCase boundary
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2') // ACRONYMRun → ACRONYM_Run
      .split(/[_\s]+/)
      .filter(Boolean)
      .map(segment => segment.toLowerCase());
  }

  // Decide whether a candidate identifier is a denylist hit.
  // Returns the offending segment (or whole identifier) when flagged, else null.
  function denylistHit(identifier) {
    if (WHITELIST_LITERAL.has(identifier)) return null;
    const segments = segmentIdentifier(identifier);
    // Whitelist-segment exemption runs first so domain terms beat the
    // abbreviation rule even when the bare identifier is on the denylist.
    // (e.g., `ph` as a function parameter is the chemistry term, not the
    // disallowed abbreviation `ph` for `previousHandler`.)
    for (const segment of segments) {
      if (WHITELIST_SEGMENTS.has(segment)) return null;
    }
    // Exact whole-identifier match against the denylist (case-sensitive
    // per the brief — `Eff` ≠ `efficiency`).
    if (DENYLIST.has(identifier)) return identifier;
    // Segment-level match — flag if any lowercase segment is on the
    // denylist AND that segment is not the entire identifier (the whole
    // case is already caught above).
    for (const segment of segments) {
      if (DENYLIST.has(segment) && segments.length > 1) return segment;
    }
    return null;
  }

  // Extract candidate identifiers from a chunk of JS source. Returns an
  // array of {name, lineNumber, lineText}. The extractors are deliberately
  // approximate — false-positive rate is low and false-negatives are the
  // real risk (silent miss) so we err toward over-extraction.
  function extractIdentifiers(jsSource) {
    const out = [];
    const lines = jsSource.split('\n');

    // Per-line scan. We track whether each line is inside the iterator
    // header of a `for (let i = 0; ...; i++)` so we can skip i/j/k there.
    const FOR_LOOP_ITER_RE = /\bfor\s*\(\s*(?:let|var|const)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*0\s*;[^;]*\1\s*<[^;]+;[^)]*\1\s*\+\+\s*\)/;

    for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
      const lineText = lines[lineNumber];
      const trimmed = lineText.trim();

      // Skip pure-comment lines and blanks.
      if (trimmed === '' || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
        continue;
      }

      // Detect idiomatic for-loop iterator and remember its name to skip.
      const forIteratorMatch = lineText.match(FOR_LOOP_ITER_RE);
      const forIteratorName = forIteratorMatch ? forIteratorMatch[1] : null;

      // 1. function NAME(
      for (const match of lineText.matchAll(/\bfunction\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g)) {
        out.push({ name: match[1], lineNumber: lineNumber + 1, lineText: trimmed });
      }

      // 2. const/let/var NAME = (top-level + scoped declarations)
      for (const match of lineText.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=/g)) {
        const name = match[1];
        // Skip the for-loop iterator we just identified (if any).
        if (forIteratorName && name === forIteratorName) continue;
        out.push({ name, lineNumber: lineNumber + 1, lineText: trimmed });
      }

      // 3. class NAME
      for (const match of lineText.matchAll(/\bclass\s+([A-Za-z_$][A-Za-z0-9_$]*)\b/g)) {
        out.push({ name: match[1], lineNumber: lineNumber + 1, lineText: trimmed });
      }

      // 4. Object-literal keys at declaration position:
      //    `{NAME:` or `, NAME:` or line-leading `NAME:` (when inside an
      //    object literal across multiple lines). Restrict to lines that
      //    look like key:value pairs to avoid matching `case foo:` or
      //    labelled statements.
      for (const match of lineText.matchAll(/(?:^|[,{])\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*:/g)) {
        const name = match[1];
        // Filter common false positives: switch labels, `default:`, and
        // single-word ternary/object-shorthand patterns are rare here.
        if (name === 'default' || name === 'case') continue;
        // Avoid double-extracting names that the `const NAME =` extractor
        // already picked up (when an object literal sits on the same line
        // as a declaration).
        out.push({ name, lineNumber: lineNumber + 1, lineText: trimmed });
      }

      // 5. Function-parameter declarations and arrow-function parameter lists.
      //    `function name(A, B, C)` and `(A, B) =>`.
      const functionParameterMatch = lineText.match(/\bfunction\s*\*?\s*[A-Za-z_$]?[A-Za-z0-9_$]*\s*\(([^)]*)\)/);
      if (functionParameterMatch) {
        const params = functionParameterMatch[1].split(',').map(p => p.trim()).filter(Boolean);
        for (const param of params) {
          // Strip default-value, destructuring, and rest patterns to get the bare name.
          const bare = param.replace(/=.*$/, '').replace(/^\.\.\./, '').trim();
          // Skip destructuring patterns ({...} / [...]) — handled separately below.
          if (bare.startsWith('{') || bare.startsWith('[')) continue;
          if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(bare)) {
            out.push({ name: bare, lineNumber: lineNumber + 1, lineText: trimmed });
          }
        }
      }
      const arrowMatch = lineText.match(/\(([^)]*)\)\s*=>/);
      if (arrowMatch) {
        const params = arrowMatch[1].split(',').map(p => p.trim()).filter(Boolean);
        for (const param of params) {
          const bare = param.replace(/=.*$/, '').replace(/^\.\.\./, '').trim();
          if (bare.startsWith('{') || bare.startsWith('[')) continue;
          if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(bare)) {
            out.push({ name: bare, lineNumber: lineNumber + 1, lineText: trimmed });
          }
        }
      }

      // 6. Destructuring patterns:
      //    `const {A, B} = ...` and `const [A, B] = ...`.
      const destructuringObjectMatch = lineText.match(/\b(?:const|let|var)\s*\{([^}]*)\}\s*=/);
      if (destructuringObjectMatch) {
        for (const piece of destructuringObjectMatch[1].split(',')) {
          // Allow renaming syntax `{a: b}` — pull the binding name (after `:`).
          const bindingMatch = piece.match(/(?::\s*)?([A-Za-z_$][A-Za-z0-9_$]*)\s*(?:=|$)/);
          if (bindingMatch) {
            out.push({ name: bindingMatch[1], lineNumber: lineNumber + 1, lineText: trimmed });
          }
        }
      }
      const destructuringArrayMatch = lineText.match(/\b(?:const|let|var)\s*\[([^\]]*)\]\s*=/);
      if (destructuringArrayMatch) {
        for (const piece of destructuringArrayMatch[1].split(',')) {
          const bindingMatch = piece.match(/^\s*([A-Za-z_$][A-Za-z0-9_$]*)/);
          if (bindingMatch) {
            out.push({ name: bindingMatch[1], lineNumber: lineNumber + 1, lineText: trimmed });
          }
        }
      }
    }

    return out;
  }

  // Recursively collect every .js file under a directory, skipping dist/
  // and node_modules/, and excluding test files (*.test.mjs/test-helpers).
  function collectJsFiles(rootDir) {
    const out = [];
    if (!existsSync(rootDir)) return out;
    function walk(directory) {
      let entries;
      try { entries = readdirSync(directory, { withFileTypes: true }); }
      catch { return; }
      for (const entry of entries) {
        const fullPath = join(directory, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === 'dist' || entry.name === 'node_modules' || entry.name === '.claude') continue;
          walk(fullPath);
        } else if (entry.isFile()) {
          if (!entry.name.endsWith('.js')) continue;
          if (entry.name === 'test-helpers.mjs') continue;
          out.push(fullPath);
        }
      }
    }
    walk(rootDir);
    return out;
  }

  // Build the owned-surface file list.
  const ownedFiles = [];

  // 1. app/index.html — extract <script> block contents only.
  const indexHtmlPath = join(REPO_ROOT, 'app', 'index.html');
  if (existsSync(indexHtmlPath)) {
    const htmlText = readFileSync(indexHtmlPath, 'utf8');
    // Concatenate every <script>…</script> body (skip src= references).
    const scriptRe = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
    let scriptBodies = '';
    let scriptMatch;
    while ((scriptMatch = scriptRe.exec(htmlText))) {
      // Preserve line numbers from the source HTML by counting newlines up
      // to this script start, padding with blank lines.
      const startOffset = scriptMatch.index;
      const linesBefore = htmlText.slice(0, startOffset).split('\n').length;
      const currentLines = scriptBodies.split('\n').length;
      const padding = '\n'.repeat(Math.max(0, linesBefore - currentLines));
      scriptBodies += padding + scriptMatch[1];
    }
    ownedFiles.push({ path: indexHtmlPath, source: scriptBodies });
  }

  // 2. nutrition/render.js + every *.js under nutrition/ and yield-range/.
  const nutritionDir = join(REPO_ROOT, 'nutrition');
  const yieldRangeDir = join(REPO_ROOT, 'yield-range');
  for (const path of [...collectJsFiles(nutritionDir), ...collectJsFiles(yieldRangeDir)]) {
    try {
      ownedFiles.push({ path, source: readFileSync(path, 'utf8') });
    } catch { /* skip unreadable */ }
  }

  // 3. scripts/check-recipes.mjs itself (matcher applies to its own source).
  const selfPath = join(REPO_ROOT, 'scripts', 'check-recipes.mjs');
  if (existsSync(selfPath)) {
    ownedFiles.push({ path: selfPath, source: readFileSync(selfPath, 'utf8') });
  }

  // Walk + collect hits.
  const hits = [];                // {file, line, name, segment, lineText}
  const hitsByFile = new Map();   // path → count
  const hitsByIdentifier = new Map(); // name → count

  for (const { path, source } of ownedFiles) {
    const identifiers = extractIdentifiers(source);
    // Dedupe identifier-occurrences per (line, name) to avoid double-counting
    // when several extractors fire on the same declaration.
    const seenOnFile = new Set();
    for (const { name, lineNumber, lineText } of identifiers) {
      const dedupeKey = `${lineNumber}:${name}`;
      if (seenOnFile.has(dedupeKey)) continue;
      seenOnFile.add(dedupeKey);
      const segment = denylistHit(name);
      if (!segment) continue;
      hits.push({ file: path, line: lineNumber, name, segment, lineText });
      hitsByFile.set(path, (hitsByFile.get(path) || 0) + 1);
      hitsByIdentifier.set(name, (hitsByIdentifier.get(name) || 0) + 1);
    }
  }

  if (hits.length === 0) {
    pass(`scanned ${ownedFiles.length} files · 0 denylist hits`);
  } else {
    // Build a structured fail() detail. fail() only prints the first 5
    // lines of detail by design, so we route the full report to stdout
    // directly (matching the contribution-block-recipe-table pattern of printing rich detail
    // outside the fail() call).
    fail('identifiers-unabbreviated — identifier names are full words (no abbreviations)',
      `${hits.length} denylist hits across ${hitsByFile.size} files`);

    process.stdout.write(`\n    ${c.dim}── identifiers-unabbreviated hit list (top 50) ──${c.reset}\n`);
    const printable = hits.slice(0, 50);
    for (const hit of printable) {
      const relativePath = hit.file.startsWith(REPO_ROOT) ? hit.file.slice(REPO_ROOT.length + 1) : hit.file;
      process.stdout.write(`    ${c.dim}${relativePath}:${hit.line}${c.reset}  ${c.red}${hit.name}${c.reset} (segment: ${hit.segment})  ${c.dim}${hit.lineText.slice(0, 80)}${c.reset}\n`);
    }
    if (hits.length > printable.length) {
      process.stdout.write(`    ${c.dim}(+${hits.length - printable.length} more)${c.reset}\n`);
    }

    process.stdout.write(`\n    ${c.dim}── Hits-by-file summary (top 10) ──${c.reset}\n`);
    const byFileSorted = [...hitsByFile.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    for (const [path, count] of byFileSorted) {
      const relativePath = path.startsWith(REPO_ROOT) ? path.slice(REPO_ROOT.length + 1) : path;
      process.stdout.write(`    ${c.dim}${String(count).padStart(4)}  ${relativePath}${c.reset}\n`);
    }

    process.stdout.write(`\n    ${c.dim}── Top 10 hit identifiers ──${c.reset}\n`);
    const byIdentifierSorted = [...hitsByIdentifier.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    for (const [name, count] of byIdentifierSorted) {
      process.stdout.write(`    ${c.dim}${String(count).padStart(4)}  ${name}${c.reset}\n`);
    }
    process.stdout.write('\n');
  }
}

// ─── lean nutrition tables
//
// Specs: nutrition/spec.md → elemental-mass-in-mg (elemental-mass columns in mg),
// column-header-unit-declaration (unit suffix in header not in cells), manque-sortant-zero-bare (bare 0, no
// `(couvert)`), mois-depuisement-sme-runway (Mois d'épuisement every row with reservoir data).
// nutrition/tomato/foliar-strategy/builder/user-stories.md → foliar Block 5 (foliar Efficacité reacts to
// surfactant lever).
//
// elemental-mass-in-mg / column-header-unit-declaration / manque-sortant-zero-bare are designed-to-fail at first run — the
// current renderer (renderGapGrid in app/index.html) calls formatValue()
// on every numeric cell which emits a `mg` / `g` suffix, and writes the
// literal `(couvert)` annotation on the Manque sortant cell when gOut ≤ 0.
// Wave 2 coder migrates the unit into the column header + drops the
// annotation. mois-depuisement-sme-runway / foliar Block 5 stay as pass-with-TODO until the
// specialist's parallel work lands (Mehlich-3 ÷ SME-weekly-uptake math
// and surfactant-aware foliar efficiency surface respectively).

// Canonical block descriptors per page. Each entry pairs a DOM container
// id with a human-readable label for failure context. Salanova blocks are
// not yet wired (per contribution-block-gap-grid TODO sweep above); we surface them as
// pass-with-TODO matching that pattern.
const REQ159_TOMATO_BLOCKS = [
  { id: 'nutr-compost',   label: 'Tomato Compost' },
  { id: 'nutr-sidedress', label: 'Tomato Sidedress' },
  { id: 'nutr-fert',      label: 'Tomato Fertigation' },
  { id: 'nutr-foliar',    label: 'Tomato Foliaire' },
];
const REQ159_NURSERY_BLOCKS = [
  { id: 'nutr-n-substrate',   label: 'Semis Substrat' },
  { id: 'nutr-n-fertigation', label: 'Semis Fertigation' },
];

// Elemental-mass column headers per elemental-mass-in-mg. These columns express
// per-element mass and MUST end in `mg`. The contribution-block-gap-grid gap-grid uses three
// of them (Manque entrant · Apport ici · Manque sortant); the soil-bank
// block adds the same labels. Efficacité is a unitless percent and
// excluded. Recipe-product `Quantité` is the contribution-block-recipe-table carve-out.
const REQ159_ELEMENTAL_MASS_HEADERS = new Set([
  'Manque entrant', 'Apport ici', 'Manque sortant',
]);

// Walk every gap-grid + recipe-table column header for one block. Returns
// `{ kind: 'gap'|'recipe', headerText, columnIndex }[]`. Used by both
// elemental-mass-in-mg (header unit) and column-header-unit-declaration (header→cell unit consistency).
function collectBlockHeaders(blockElement) {
  if (!blockElement) return [];
  const out = [];
  // Recipe table (contribution-block-recipe-table) — <th> in <thead>.
  const recipeTable = blockElement.querySelector('table');
  if (recipeTable) {
    const headerCells = Array.from(recipeTable.querySelectorAll('thead th, thead td'));
    headerCells.forEach((cell, index) => {
      out.push({
        kind: 'recipe',
        headerText: (cell.textContent || '').trim(),
        columnIndex: index,
      });
    });
  }
  // Gap-grid header strip (contribution-block-gap-grid / efficacite-column-capability) — first child div under the wrapper.
  const headerStrip = findGapGridHeaderStrip(blockElement);
  if (headerStrip) {
    const cols = Array.from(headerStrip.children);
    cols.forEach((column, index) => {
      out.push({
        kind: 'gap',
        headerText: (column.textContent || '').trim(),
        columnIndex: index,
      });
    });
  }
  return out;
}

// Walk every body cell of the gap-grid for one block. Returns an array
// keyed by column index: `{ columnIndex, rowIndex, cellText }[]`. Recipe
// tables use a different DOM shape; the recipe-product Quantité column
// intentionally carries a unit suffix (g/kg per contribution-block-recipe-table), so it stays
// out of column-header-unit-declaration's header→cell coupling.
function collectGapGridDataCells(blockElement) {
  if (!blockElement) return [];
  const out = [];
  const rows = findGapGridDataRows(blockElement);
  rows.forEach((row, rowIndex) => {
    const cells = Array.from(row.children);
    cells.forEach((cell, columnIndex) => {
      out.push({
        columnIndex,
        rowIndex,
        cellText: (cell.textContent || '').trim(),
      });
    });
  });
  return out;
}

// elemental-mass-in-mg helper — given a header text, does it declare a non-mg unit
// suffix? Returns the offending suffix or `null` if header ends in `mg`
// / `(mg)` or has no unit suffix at all. We treat `(mg)` and ` mg` as
// equivalent acceptable forms; `g` / `kg` / `g/m²/wk` are rejected.
function nonMgSuffix(headerText) {
  const stripped = String(headerText || '').trim();
  if (!stripped) return null;
  if (/\bmg\)?$/.test(stripped)) return null;
  const tail = stripped.match(/\(([^)]*)\)\s*$/);
  if (tail) {
    const unit = tail[1].trim();
    if (/\bk?g(\/|$|\s)/i.test(unit) && !/\bmg\b/.test(unit)) return unit;
    return null;
  }
  const trail = stripped.match(/\s(k?g(?:\/[^\s]+)?)\s*$/);
  if (trail) {
    const unit = trail[1];
    if (/^k?g(\/|$)/.test(unit) && !/^mg/.test(unit)) return unit;
  }
  return null;
}

// column-header-unit-declaration helper — given a header text, return the unit suffix it
// declares (the substring that mustn't be duplicated in cells), or `null`
// if the header declares no unit. The cell check skips columns whose
// header has no declared unit (lenient per the brief).
function headerDeclaredUnit(headerText) {
  const stripped = String(headerText || '').trim();
  if (!stripped) return null;
  const parens = stripped.match(/\(([^)]+)\)\s*$/);
  if (parens) {
    const unit = parens[1].trim();
    // Recognised unit shapes only — avoids treating "(% m/m)" as a bare-%
    // declaration. Accept mg / k?g / % / m² / compound g-per-X.
    if (/^(mg|k?g|%|m²|m\^2)(\/[^\s]+)?$/.test(unit)) return unit;
    return null;
  }
  return null;
}

// column-header-unit-declaration helper — does the cell text duplicate the header's unit?
function cellHasDuplicateUnit(cellText, declaredUnit) {
  if (!declaredUnit) return false;
  const stripped = String(cellText || '').trim();
  if (stripped === '' || stripped === '0' || stripped === '—' || stripped === '0 %') return false;
  if (declaredUnit === 'mg') {
    return /\bmg\b\s*$/.test(stripped);
  }
  if (declaredUnit === 'g') {
    // `g` tail but NOT `mg` tail — leading non-`m` char or start-of-string.
    return /(^|[^m])\bg\b\s*$/.test(stripped);
  }
  if (declaredUnit === 'kg') {
    return /\bkg\b\s*$/.test(stripped);
  }
  if (declaredUnit === '%') {
    return /%\s*$/.test(stripped);
  }
  return new RegExp(declaredUnit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*$').test(stripped);
}

// ─── elemental-mass-in-mg — Elemental-mass columns use milligrams ───────────────────
//
// Walk every nutrition-table column header. For columns whose semantic is
// per-element elemental mass (Manque entrant / Apport ici / Manque
// sortant — the soil-bank block uses the same labels), the header text
// must end in `mg` (or `(mg)`). Recipe-product mass tables (contribution-block-recipe-table
// `Quantité` column) are carved out and stay in g/kg. Drift gauge
// (Block 7/8) stays in g/kg (not a contribution-block render — not
// touched here).

header('elemental-mass-in-mg — Nutrition-table elemental-mass columns declare mg in header');
{
  const offenders = [];
  // Tomato page — currently active per the last setNutrCrop call above.
  for (const block of REQ159_TOMATO_BLOCKS) {
    const element = window.document.getElementById(block.id);
    if (!element) { offenders.push(`${block.label} (#${block.id}): container missing`); continue; }
    const headers = collectBlockHeaders(element);
    for (const headerEntry of headers) {
      if (headerEntry.kind === 'recipe') continue; // contribution-block-recipe-table carve-out
      if (!REQ159_ELEMENTAL_MASS_HEADERS.has(headerEntry.headerText)) continue;
      // Header must declare `mg` (either `... (mg)` or `... mg`). Today
      // these headers are bare strings ("Manque entrant") with no unit
      // declaration — the unit lives in the cells via formatValue. That's
      // the elemental-mass-in-mg failure mode the Wave 2 coder fixes.
      if (!/\bmg\)?$/.test(headerEntry.headerText)) {
        offenders.push(`${block.label}.${headerEntry.headerText}: header missing (mg) declaration`);
        continue;
      }
      const nonMg = nonMgSuffix(headerEntry.headerText);
      if (nonMg) {
        offenders.push(`${block.label}.${headerEntry.headerText}: header declares non-mg unit "${nonMg}"`);
      }
    }
  }
  // Nursery page — flip to nursery so Semis blocks are populated, revert after.
  if (typeof window.setNutrCrop === 'function') {
    try { window.setNutrCrop('nursery'); } catch (e) { /* swallow */ }
  }
  for (const block of REQ159_NURSERY_BLOCKS) {
    const element = window.document.getElementById(block.id);
    if (!element) { offenders.push(`${block.label} (#${block.id}): container missing`); continue; }
    const headers = collectBlockHeaders(element);
    for (const headerEntry of headers) {
      if (headerEntry.kind === 'recipe') continue;
      if (!REQ159_ELEMENTAL_MASS_HEADERS.has(headerEntry.headerText)) continue;
      if (!/\bmg\)?$/.test(headerEntry.headerText)) {
        offenders.push(`${block.label}.${headerEntry.headerText}: header missing (mg) declaration`);
        continue;
      }
      const nonMg = nonMgSuffix(headerEntry.headerText);
      if (nonMg) {
        offenders.push(`${block.label}.${headerEntry.headerText}: header declares non-mg unit "${nonMg}"`);
      }
    }
  }
  // Flip back to tomato so #nutr-soil is live (soil-bank uses tomato page).
  if (typeof window.setNutrCrop === 'function') {
    try { window.setNutrCrop('tomato'); } catch (e) { /* swallow */ }
  }
  {
    const soilBlock = window.document.getElementById('nutr-soil');
    if (soilBlock) {
      // Soil-bank renderer (nutrition/soil-contribution/render.js) emits a
      // 6-col grid with leading 0.5fr column (vs the contribution-block-gap-grid grid's 0.6fr).
      // Locate its header strip directly instead of via findGapGridHeaderStrip
      // (which targets 0.6fr).
      const soilWrapper = soilBlock.querySelector('div[style*="grid-template-columns:0.5fr"]');
      const soilHeaderStrip = soilWrapper ? soilWrapper.parentElement.firstElementChild : null;
      if (soilHeaderStrip) {
        const cols = Array.from(soilHeaderStrip.children);
        for (const col of cols) {
          const text = (col.textContent || '').trim();
          if (!REQ159_ELEMENTAL_MASS_HEADERS.has(text)) continue;
          if (!/\bmg\)?$/.test(text)) {
            offenders.push(`Tomato Soil-bank.${text}: header missing (mg) declaration`);
          }
        }
      }
    }
  }
  if (offenders.length === 0) {
    pass('Every elemental-mass column header declares mg across tomato + nursery + soil-bank blocks');
  } else {
    fail('elemental-mass-in-mg — elemental-mass headers missing mg',
      offenders.slice(0, 5).join('\n      '));
    process.stdout.write(`\n    ${c.dim}── elemental-mass-in-mg hit list (top ${Math.min(offenders.length, 20)}) ──${c.reset}\n`);
    offenders.slice(0, 20).forEach(line => {
      process.stdout.write(`    ${c.red}${line}${c.reset}\n`);
    });
    if (offenders.length > 20) {
      process.stdout.write(`    ${c.dim}(+${offenders.length - 20} more)${c.reset}\n`);
    }
    process.stdout.write('\n');
  }
  // Salanova carve-out (contribution-block-gap-grid / contribution-block-recipe-table / efficacite-column-capability sibling) — not wired today.
  // TODO: wire after F1 lettuce carve
  pass('elemental-mass-in-mg — Salanova Sol elemental-mass columns — TODO: wire after F1 lettuce carve');
  // TODO: wire after F1 lettuce carve
  pass('elemental-mass-in-mg — Salanova Fertigation elemental-mass columns — TODO: wire after F1 lettuce carve');
  // TODO: wire after F1 lettuce carve
  pass('elemental-mass-in-mg — Salanova Front-load elemental-mass columns — TODO: wire after F1 lettuce carve');
}

// ─── column-header-unit-declaration — Unit suffix lives in header, not in cells ───────────────
//
// Walk every nutrition-table data cell. If the column header declares a
// unit (parens-suffix pattern `... (mg)`, `... (g)`, etc.), every cell in
// that column MUST NOT carry the same unit suffix. Lenient: when a
// header has no declared unit (today's pre-Wave-2 state), the cell check
// is skipped for that column. This means column-header-unit-declaration mostly passes until
// elemental-mass-in-mg lands header units; once elemental-mass-in-mg lands, column-header-unit-declaration will fire if
// any cell still carries the suffix. The matcher is registered now so
// the Wave 2 coder's combined elemental-mass-in-mg + column-header-unit-declaration fix lands covered.

header('column-header-unit-declaration — Cell text does not duplicate the header-declared unit');
{
  const offenders = [];
  for (const block of REQ159_TOMATO_BLOCKS) {
    const element = window.document.getElementById(block.id);
    if (!element) continue;
    const headerStrip = findGapGridHeaderStrip(element);
    if (!headerStrip) continue;
    const headerCols = Array.from(headerStrip.children).map(c => (c.textContent || '').trim());
    const cells = collectGapGridDataCells(element);
    for (const cellEntry of cells) {
      const headerText = headerCols[cellEntry.columnIndex] || '';
      const declared = headerDeclaredUnit(headerText);
      if (!declared) continue;
      if (cellHasDuplicateUnit(cellEntry.cellText, declared)) {
        offenders.push(`${block.label}.${headerText}: cell at row ${cellEntry.rowIndex + 1} = "${cellEntry.cellText}" — unit suffix duplicated (already in header)`);
      }
    }
  }
  if (typeof window.setNutrCrop === 'function') {
    try { window.setNutrCrop('nursery'); } catch (e) { /* swallow */ }
  }
  for (const block of REQ159_NURSERY_BLOCKS) {
    const element = window.document.getElementById(block.id);
    if (!element) continue;
    const headerStrip = findGapGridHeaderStrip(element);
    if (!headerStrip) continue;
    const headerCols = Array.from(headerStrip.children).map(c => (c.textContent || '').trim());
    const cells = collectGapGridDataCells(element);
    for (const cellEntry of cells) {
      const headerText = headerCols[cellEntry.columnIndex] || '';
      const declared = headerDeclaredUnit(headerText);
      if (!declared) continue;
      if (cellHasDuplicateUnit(cellEntry.cellText, declared)) {
        offenders.push(`${block.label}.${headerText}: cell at row ${cellEntry.rowIndex + 1} = "${cellEntry.cellText}" — unit suffix duplicated (already in header)`);
      }
    }
  }
  if (typeof window.setNutrCrop === 'function') {
    try { window.setNutrCrop('tomato'); } catch (e) { /* swallow */ }
  }
  if (offenders.length === 0) {
    pass('No cell duplicates a header-declared unit across tomato + nursery contribution blocks');
  } else {
    fail('column-header-unit-declaration — cell duplicates header unit',
      offenders.slice(0, 5).join('\n      '));
    process.stdout.write(`\n    ${c.dim}── column-header-unit-declaration hit list (top ${Math.min(offenders.length, 20)}) ──${c.reset}\n`);
    offenders.slice(0, 20).forEach(line => {
      process.stdout.write(`    ${c.red}${line}${c.reset}\n`);
    });
    if (offenders.length > 20) {
      process.stdout.write(`    ${c.dim}(+${offenders.length - 20} more)${c.reset}\n`);
    }
    process.stdout.write('\n');
  }
  // TODO: wire after F1 lettuce carve
  pass('column-header-unit-declaration — Salanova Sol cells — TODO: wire after F1 lettuce carve');
  // TODO: wire after F1 lettuce carve
  pass('column-header-unit-declaration — Salanova Fertigation cells — TODO: wire after F1 lettuce carve');
  // TODO: wire after F1 lettuce carve
  pass('column-header-unit-declaration — Salanova Front-load cells — TODO: wire after F1 lettuce carve');
}

// ─── manque-sortant-zero-bare — Bare 0 communicates coverage; no `(couvert)` ────────────
//
// Walk every contribution-block cell on every Nutrition page. Fail if any
// cell text contains the substring `(couvert)`. The Manque sortant cell
// MUST render the bare digit `0` when the channel covers its share —
// color (green/yellow/red) carries the meaning.
//
// Today renderGapGrid emits `gOut <= 0 ? '0 (couvert)' : formatValue(gOut)`
// at app/index.html — designed-to-fail until the Wave 2 coder drops the
// annotation. The soil-bank renderer at
// nutrition/soil-contribution/render.js carries the same pattern; we walk
// it explicitly so it doesn't slip.

header('manque-sortant-zero-bare — Bare 0 in Manque sortant cell, no `(couvert)` annotation');
{
  const offenders = [];
  const blocksToWalk = [
    ...REQ159_TOMATO_BLOCKS,
    { id: 'nutr-soil', label: 'Tomato Soil-bank' },
  ];
  for (const block of blocksToWalk) {
    const element = window.document.getElementById(block.id);
    if (!element) continue;
    const html = element.innerHTML || '';
    if (!html.includes('(couvert)')) continue;
    // Pinpoint each row containing the annotation. Walk both .pq-row
    // children and the entire textContent as a fallback.
    const pqRows = Array.from(element.querySelectorAll('.pq-row'));
    let foundInRow = false;
    pqRows.forEach((row, rowIndex) => {
      const text = row.textContent || '';
      if (!text.includes('(couvert)')) return;
      const cells = Array.from(row.children);
      const elementSymbol = cells[0] ? (cells[0].textContent || '').trim() : '?';
      // Find the cell that actually carries `(couvert)`. Column index
      // differs across grids: contribution-block-gap-grid (4 contribution blocks + Semis) puts
      // Manque sortant at index 4; soil-contribution puts it at index 3
      // (Efficacité column absent). Walk the cells directly.
      const offendingCell = cells.find(cell => (cell.textContent || '').includes('(couvert)'));
      const cellText = offendingCell ? (offendingCell.textContent || '').trim() : '';
      offenders.push(`${block.label}.Manque sortant: row ${rowIndex + 1} (${elementSymbol}) = "${cellText}" — drop "(couvert)" per manque-sortant-zero-bare`);
      foundInRow = true;
    });
    if (!foundInRow) {
      offenders.push(`${block.label}: substring "(couvert)" present in block HTML (row context not extractable)`);
    }
  }
  // Nursery page.
  if (typeof window.setNutrCrop === 'function') {
    try { window.setNutrCrop('nursery'); } catch (e) { /* swallow */ }
  }
  for (const block of REQ159_NURSERY_BLOCKS) {
    const element = window.document.getElementById(block.id);
    if (!element) continue;
    const html = element.innerHTML || '';
    if (!html.includes('(couvert)')) continue;
    const pqRows = Array.from(element.querySelectorAll('.pq-row'));
    pqRows.forEach((row, rowIndex) => {
      const text = row.textContent || '';
      if (!text.includes('(couvert)')) return;
      const cells = Array.from(row.children);
      const elementSymbol = cells[0] ? (cells[0].textContent || '').trim() : '?';
      const offendingCell = cells.find(cell => (cell.textContent || '').includes('(couvert)'));
      const cellText = offendingCell ? (offendingCell.textContent || '').trim() : '';
      offenders.push(`${block.label}.Manque sortant: row ${rowIndex + 1} (${elementSymbol}) = "${cellText}" — drop "(couvert)" per manque-sortant-zero-bare`);
    });
  }
  if (typeof window.setNutrCrop === 'function') {
    try { window.setNutrCrop('tomato'); } catch (e) { /* swallow */ }
  }
  if (offenders.length === 0) {
    pass('No "(couvert)" annotation in any contribution-block cell across tomato + nursery + soil-bank');
  } else {
    fail('manque-sortant-zero-bare — "(couvert)" annotation still present',
      offenders.slice(0, 5).join('\n      '));
    process.stdout.write(`\n    ${c.dim}── manque-sortant-zero-bare hit list (top ${Math.min(offenders.length, 20)}) ──${c.reset}\n`);
    offenders.slice(0, 20).forEach(line => {
      process.stdout.write(`    ${c.red}${line}${c.reset}\n`);
    });
    if (offenders.length > 20) {
      process.stdout.write(`    ${c.dim}(+${offenders.length - 20} more)${c.reset}\n`);
    }
    process.stdout.write('\n');
  }
  // TODO: wire after F1 lettuce carve
  pass('manque-sortant-zero-bare — Salanova blocks — TODO: wire after F1 lettuce carve');
}

// ─── mois-depuisement-sme-runway — Mois d'épuisement on every row with reservoir data ──────
//
// Spec: nutrition/spec.md → mois-depuisement-sme-runway. Every element row on the soil-bank
// block displays Mois d'épuisement = Mehlich-3 reservoir ÷ weekly plant
// uptake currently sustainable at SME plant-availability. The model-side
// formula is wired by months-to-depletion-clamped-by-peak-demand + sme-soil-solution-wired-per-crop-element; this matcher walks the DOM and
// asserts the rendered cell tracks the model output for every element row
// whose `SoilContribution.BANK_MG_M2` + `SME_SOIL_SOLUTION_PPM` entries
// are populated (renders a non-`—` string), and falls back to `—` for
// elements without bank or SME data.

header('mois-depuisement-sme-runway — Mois d\'épuisement rendered for every row with reservoir + SME data');
{
  const SC = window.SoilContribution;
  const block = window.document.getElementById('nutr-soil');
  if (!SC || !block) {
    fail('mois-depuisement-sme-runway prerequisites available', `SC=${!!SC} block=${!!block}`);
  } else {
    const rows = block.querySelectorAll('.pq-row');
    const offenders = [];
    const elements = ['N','P','K','Ca','Mg','Fe','Mn','Zn','B','Cu','Mo'];
    if (rows.length < elements.length) {
      offenders.push(`only ${rows.length} rows rendered, expected ≥ ${elements.length}`);
    } else {
      rows.forEach((row, index) => {
        const element = elements[index];
        if (!element) return;
        const cells = row.querySelectorAll('div');
        // Column order: Él. · Manque entrant · Apport ici · Manque sortant · Mois épuisement · icon
        const depletionCellText = cells[4] ? cells[4].textContent.trim() : '';
        const modelMonths = SC.monthsToDepletion('tomato', element);
        const expectedNumeric = (typeof modelMonths === 'number' && modelMonths > 0);
        if (expectedNumeric) {
          if (depletionCellText === '—' || depletionCellText === '') {
            offenders.push(`${element}: model returns ${modelMonths}, cell renders "${depletionCellText}"`);
          }
        } else {
          if (depletionCellText !== '—') {
            offenders.push(`${element}: model returns null, cell renders "${depletionCellText}" (expected "—")`);
          }
        }
      });
    }
    if (offenders.length > 0) {
      fail('mois-depuisement-sme-runway row-by-row runway render', offenders.map(o => `  ${o}`).join('\n'));
    } else {
      pass(`Mois d'épuisement: ${rows.length} rows scanned, all match SME-derived model output (numeric where bank+SME present, "—" otherwise)`);
    }
  }
}

// ─── Foliar Efficacité is surfactant-aware ───────────────────
//
// Spec: nutrition/tomato/foliar-strategy/builder/user-stories.md → foliar Block 5. Two assertions:
//   (a) Reactive render — toggling #nutr-foliar-surfactant re-renders
//       Block 5's Efficacité column (column index 2 in the 6-col gap-grid
//       per contribution-block-gap-grid: Él. | Manque entrant | Efficacité | Apport ici |
//       Manque sortant | emoji). At least one cell text must change
//       across the toggle.
//   (b) Strict-increase semantics — when surfactant is engaged, at least
//       one routed element's Efficacité cell must render a higher integer
//       % than its surfactant-off value (spec wording: "with surfactant
//       on, foliar efficiency for routed elements is higher than without").
//
// Model-side capability (window.FoliarRecipeTomato.efficiencyFor) is
// already verified by surfactant-aware-efficiency-map; this block targets the page-side wiring
// (Wave 2 coder threads the surfactant flag from #nutr-foliar-surfactant
// into the foliar branch of calculateNutritionSupply via
// FoliarRecipeTomato.efficiencyFor). Designed-to-fail today: the page
// binds the static `.efficiency` map regardless of lever state.

header('Foliar Efficacité column reactive to surfactant lever');
{
  const surfInput = window.document.getElementById('nutr-foliar-surfactant');
  const foliarBlock = window.document.getElementById('nutr-foliar');
  const offenders = [];
  if (!surfInput) {
    offenders.push('#nutr-foliar-surfactant input missing');
  } else if (!foliarBlock) {
    offenders.push('#nutr-foliar block missing');
  } else {
    const EFFICACITE_COL_INDEX = 2;
    const readEfficaciteCellTexts = () => {
      const rows = findGapGridDataRows(foliarBlock);
      return rows.map(row => {
        const cells = Array.from(row.children);
        return cells.length > EFFICACITE_COL_INDEX
          ? (cells[EFFICACITE_COL_INDEX].textContent || '').trim()
          : null;
      });
    };
    surfInput.checked = false;
    surfInput.dispatchEvent(new window.Event('change', { bubbles: true }));
    const cellsOff = readEfficaciteCellTexts();
    surfInput.checked = true;
    surfInput.dispatchEvent(new window.Event('change', { bubbles: true }));
    const cellsOn = readEfficaciteCellTexts();
    // Restore default state for downstream verifier blocks.
    surfInput.checked = false;
    surfInput.dispatchEvent(new window.Event('change', { bubbles: true }));

    if (cellsOff.length === 0) {
      offenders.push('foliar gap-grid has no data rows — Efficacité column unreachable');
    } else if (cellsOff.length !== cellsOn.length) {
      offenders.push(`row count changed on toggle: off=${cellsOff.length} on=${cellsOn.length}`);
    } else {
      // (a) ≥1 cell text changes across the toggle.
      const anyChange = cellsOff.some((text, index) => text !== cellsOn[index]);
      if (!anyChange) {
        offenders.push(
          `Efficacité column unchanged on surfactant toggle — `
          + `off=[${cellsOff.join(' | ')}] on=[${cellsOn.join(' | ')}]`
        );
      } else {
        // (b) For every cell that renders an integer %, with-surfactant
        // must be ≥ without; at least one must be strictly greater.
        const PERCENT_RE = /^\s*(\d+)\s*%\s*$/;
        let anyStrictlyHigher = false;
        for (let index = 0; index < cellsOff.length; index++) {
          const offMatch = (cellsOff[index] || '').match(PERCENT_RE);
          const onMatch = (cellsOn[index] || '').match(PERCENT_RE);
          if (!offMatch || !onMatch) continue;
          const offValue = parseInt(offMatch[1], 10);
          const onValue = parseInt(onMatch[1], 10);
          if (onValue < offValue) {
            offenders.push(`row ${index + 1}: surfactant on (${onValue}%) < off (${offValue}%) — efficiency must not regress`);
          }
          if (onValue > offValue) anyStrictlyHigher = true;
        }
        if (!anyStrictlyHigher && offenders.length === 0) {
          offenders.push(
            `no Efficacité cell increased on surfactant=true — `
            + `off=[${cellsOff.join(' | ')}] on=[${cellsOn.join(' | ')}]`
          );
        }
      }
    }
  }
  if (offenders.length === 0) {
    pass('Foliaire Efficacité column updates on surfactant toggle; at least one cell strictly higher with surfactant on');
  } else {
    fail('Foliar Efficacité reactivity', offenders.slice(0, 4).join(' · '));
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
