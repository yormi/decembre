// Foliar-recipe — page renderer (operator-facing).
//
// Owns the weekly oligos-spray rendering on `#page-foliar-content`. Reads
// STORED_RECIPE[crop]?.foliaire — lettuce slot intentionally absent
// (lettuce foliar removed 2026-04-29; Fe moved to nursery fertigation).
//
// Functions: toggleMissedWindow() (chevron expand), buildFoliar().
//
// HISTORY / RATIONALE for the tomato foliar values (preserved here as design
// trace — the live numbers are in STORED_RECIPE.tomato.foliaire):
//   ORIGIN: Climax Conseils (April 2026, `farm info/fertigation oligos éléments tomate avril.pdf`).
//   Original recipe: 45 L master bi-weekly with MnSO₄ 66g, ZnSO₄ 66g, Solubore
//   21g, CuSO₄ 12g, Na molybdate 3g, Fe-EDDHA 33g. Reduced 45 L → 15 L on
//   2026-04-29 (without yucca, larger volumes drip/run off). Doses divided by 3
//   to hold concentration constant: 22/22/7/4/1 g + Fe.
//
//   Cu (CuSO₄ 25% Cu) 4 g/15 L = 67 ppm: conservative — Cu's safety window is
//     narrow. ⚠ Weekly Spray doubles Cu vs original bi-weekly. Annual Cu
//     ~1.3 kg/ha just from tomato (under 4 kg organic cap, but watch).
//     If burn signs (black spots), drop CuSO₄ from every other Spray.
//   Mo (Na₂MoO₄ 39.6% Mo) 1 g/15 L = 26 ppm: standard. Tolerance is wide.
//   Fe (FeSO₄·7H₂O 20% Fe — active source 2026-05-05 onwards):
//     Iron DL (Agro-K polysaccharide-Fe complex) was considered as a
//     pH-stable foliar Fe source but dropped from the program 2026-05-05
//     (decision: not on order). FeSO₄·7H₂O is the active Fe source.
//     Organic-allowed (CAN/CGSB-32.311 lists ferrous sulphate as a
//     permitted iron source).
//     Why FeSO₄ on leaf works while soil FeSO₄ doesn't at pH 7.4: foliar
//     bypasses soil chemistry. Cuticle uptake is not affected by root-zone
//     Ca-saturation; the leaf surface acts as the effective compartment.
//     Dose: 80 g per 15 L master. Math: 80 g × 20% Fe × 30% coverage
//     / 383 m² ≈ 12.5 mg Fe/m²/wk effective vs ~1.2 mg/m²/wk T5 demand
//     (~10× margin, absorbs FeSO₄'s lower per-gram efficacy at pH 7.4).
//
// SPRAY B REMOVED 2026-05-06
//   Was CaCl₂·2H₂O 100 g/15 L (Fri) for BER prevention. Removed because the
//   Teris industrial-grade CaCl₂ Ecocert input listing was never verified
//   (organic cert audit risk — REQ-002). BER prevention now relies on
//   ventilation + humidity management; if BER still shows up on fruit, an
//   external CaCl₂ application stays event-driven and out-of-app until a
//   confirmed-organic CaCl₂ source is sourced.
//
// LETTUCE FOLIAR REMOVED 2026-04-29
//   Fe moved to nursery fertigation (loads seedlings; acidic substrate keeps
//   Fe bioavailable, ~4-8× more efficient than foliar bypass). Production
//   fertigation also gets FeSO₄ for stretched cycles. UI hides lettuce on
//   foliar page; STORED_RECIPE.lettuce absent; buildFoliar guards against
//   undefined.
//
// YUCCA SURFACTANT — not in program (decision 2026-05-05, not on order)
//   Foliar coverage operates at 30% (cert 4) without yucca. Effective doses
//   are ⅓ of label math; recipe (22-22-7-4-1 g + 80 g FeSO₄) already
//   accounts for this. If yucca is reintroduced later, coverage would lift
//   to ~80-90% and doses would need to be re-tuned downward to avoid leaf burn.

function toggleMissedWindow() {
  const content = document.getElementById('missed-window-content');
  const chevron = document.getElementById('missed-window-chevron');
  const isOpen = content.style.display === 'block';
  content.style.display = isOpen ? 'none' : 'block';
  chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
}

// STORED key → operator-facing day list. Mirrors the model's
// foliarDaysForSprayCount output (A=1/sem Wed; B=2/sem Mon+Thu). Kept here
// as a small display map so the selector card can show "Spray X : <jour>"
// without pulling the full computeFoliarStrategy() return.
const FOLIAR_RECIPE_DAYS_LABEL = {
  A: 'mercredi matin',
  B: 'lundi + jeudi matin',
};

// Selector state — restored 2026-05-28 with Spray B re-introduction.
// null at boot; first buildFoliar() resolves it via getRecommendedFoliarSpray().
// Operator can override via setSpray().
let currentFoliarSpray = null;

function setSpray(kind) {
  currentFoliarSpray = kind;
  document.querySelectorAll('[data-spray]').forEach(b =>
    b.classList.toggle('active', b.dataset.spray === kind));
  buildFoliar();
}

// Pick the spray that fires today (or fall back to A on idle days).
// Mon (1) or Thu (4) → B; else → A. Lines up with the model day map above.
function getRecommendedFoliarSpray() {
  const day = new Date().getDay(); // Sun=0..Sat=6
  return (day === 1 || day === 4) ? 'B' : 'A';
}

function buildFoliar() {
  const crop = currentCrop === 'tomato' ? 'tomato' : 'lettuce';
  // Lettuce foliar removed → only the tomato surface renders. The page is
  // hidden when currentCrop=lettuce (setPage redirects); guard for other
  // pages calling buildFoliar via setCrop.
  if (crop !== 'tomato') return;

  // Morning spray window (kept from prior renderer — sunrise-derived):
  //   start = sunrise + 30 min (stomata open)
  //   end   = min(sunrise + 3 h, 10:00)
  const sun = getSunTimes();
  const startH = sun.sunrise + 0.5;
  const endH = Math.min(sun.sunrise + 3, 10);
  const fmtH = (h) => {
    const totalMinutes = Math.round(h * 60 / 10) * 10;
    const hr = Math.floor(totalMinutes / 60);
    const mn = totalMinutes % 60;
    return `${hr}h${String(mn).padStart(2, '0')}`;
  };
  // Recipe-sheet section — read directly from STORED (same pattern as
  // fertigation + sidedress operator pages). A = oligos, B = Ca²⁺.
  // Strip the "(XX.X% El)" assay parentheses on the operator surface — the
  // % is audit-trail info, not weighing-relevant; STORED stays canonical.
  const stripAssay = (name) => name.replace(/\s*\([^)]*\)\s*/g, '').trim();
  const stored = (window.STORED_RECIPE && window.STORED_RECIPE.tomato && window.STORED_RECIPE.tomato.foliaire) || {};
  const presentKinds = ['A', 'B'].filter(k => Array.isArray(stored[k]) && stored[k].length > 0);

  // Selector visibility — hide the whole card when only one kind exists.
  // Force currentFoliarSpray to a present kind on first paint (or if the
  // active one was retired).
  const selectorCard = document.getElementById('spray-selector-card');
  if (selectorCard) selectorCard.style.display = presentKinds.length > 1 ? '' : 'none';
  if (!presentKinds.includes(currentFoliarSpray)) {
    currentFoliarSpray = presentKinds.includes(getRecommendedFoliarSpray())
      ? getRecommendedFoliarSpray() : (presentKinds[0] || 'A');
    document.querySelectorAll('[data-spray]').forEach(b =>
      b.classList.toggle('active', b.dataset.spray === currentFoliarSpray));
  }

  // Schedule note on the selector card.
  const scheduleNoteParts = presentKinds.map(k =>
    `Spray ${k} ${FOLIAR_RECIPE_DAYS_LABEL[k] || ''}`.trim());
  const scheduleNote = document.getElementById('spray-schedule-note');
  if (scheduleNote) scheduleNote.textContent = scheduleNoteParts.join(' · ');

  // Day label for the active spray, in the "Quand pulvériser" card.
  const activeDayLabel = FOLIAR_RECIPE_DAYS_LABEL[currentFoliarSpray] || '';
  document.getElementById('foliar-when').textContent =
    `${activeDayLabel ? activeDayLabel.charAt(0).toUpperCase() + activeDayLabel.slice(1) : ''} · entre ${fmtH(startH)} et ${fmtH(endH)}`;

  let sheetsHtml = '';
  presentKinds.forEach((kind) => {
    const rows = stored[kind];
    const visible = (kind === currentFoliarSpray);

    let productRows = '';
    rows.forEach((item) => {
      productRows += `<div data-recipe-product style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border);">
        <div style="flex:1; min-width:0;">
          <div style="font-weight:600; font-size:13px;">${stripAssay(item.name)}</div>
        </div>
        <span class="step-amount" style="margin:0; flex-shrink:0;">${item.master}</span>
      </div>`;
    });

    sheetsHtml += `<div data-recipe-sheet data-recipe-kind="${kind}" style="margin-bottom:14px; ${visible ? '' : 'display:none;'}">
      <div>${productRows}</div>
    </div>`;
  });
  document.getElementById('foliar-strategy').innerHTML = sheetsHtml;
}
