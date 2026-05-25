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

// Per-recipe-kind label → operator-facing display name. Kept here (not in
// data.js) because it is operator-surface presentation, not model state.
const FOLIAR_RECIPE_KIND_LABEL = {
  oligo: 'Foliaire (oligos)',
  ca:    'Foliaire (Ca²⁺)',
};

// Per-recipe-kind product-row metadata. Maps the dose-key on
// computeFoliarRecipeForGap output to the human-readable label string that
// matches the STORED recipe naming convention. Kept in sync with the
// recipeAsLabelArray helper inside model/recipe.js.
const FOLIAR_DOSE_LABELS = {
  MnSO4_g:    'MnSO₄ (31,5 % Mn)',
  ZnSO4_g:    'ZnSO₄ (35,5 % Zn)',
  CuSO4_g:    'CuSO₄ (25 % Cu)',
  FeSO4_g:    'FeSO₄·7H₂O (20 % Fe)',
  NaMoO4_g:   'NaMolybdate (39,6 % Mo)',
  Solubore_g: 'Solubore (20,5 % B)',
};

// Convert the model's flat doses object into the label-array shape that
// predictedCE / predictedTankPh consume (and that the operator surface
// renders one row per product).
function foliarDosesToLabelArray(doses) {
  const rows = [];
  for (const key in FOLIAR_DOSE_LABELS) {
    const grams = (doses && doses[key]) || 0;
    if (grams > 0) {
      rows.push({ name: FOLIAR_DOSE_LABELS[key], master: grams + ' g' });
    }
  }
  return rows;
}

// Default operator-surface gap — non-zero on every foliar element so the
// strategy's per-recipe weekly-leaf-tolerance cap binds (sprayCount = cap)
// rather than collapsing to zero. The live gap chain lives in
// shell/contribution-orchestrator.js (FP mode); the operator surface here
// is a read-only view of "the recipe + its weekly cadence" — actual
// gap-closure math runs on the strategy page.
const FOLIAR_OPERATOR_DEFAULT_GAP = { Mn: 1, Zn: 1, Cu: 1, Fe: 1, B: 1, Ca: 1 };

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
  document.getElementById('foliar-when').textContent = `Mercredi am · entre ${fmtH(startH)} et ${fmtH(endH)}`;

  // Strategy = list of recipes the model says are active this week. Today
  // only oligo lands; Ca enters the list when the recipe's data.js entry
  // ships (gated on PO data). The renderer loops generically.
  const stage = (typeof currentStage !== 'undefined' && currentStage) ? currentStage : 'T5';
  const strategy = window.FoliarRecipeTomato.computeFoliarStrategy(stage, FOLIAR_OPERATOR_DEFAULT_GAP);

  // ── Recipe-sheet section — one [data-recipe-sheet] per active recipe ──
  let sheetsHtml = '';
  strategy.recipes.forEach((recipe) => {
    const rows = foliarDosesToLabelArray(recipe.doses);
    const ce  = (typeof predictedCE === 'function')      ? predictedCE(rows, 1.0)       : 0;
    const pH  = (typeof predictedTankPh === 'function')  ? predictedTankPh(rows, 7.0)   : 0;
    const surfactant = !!(recipe.doses && recipe.doses.surfactant);
    const kindLabel = FOLIAR_RECIPE_KIND_LABEL[recipe.kind] || recipe.kind;

    let productRows = '';
    rows.forEach((item) => {
      productRows += `<div data-recipe-product style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border);">
        <div style="flex:1; min-width:0;">
          <div style="font-weight:600; font-size:13px;">${item.name}</div>
        </div>
        <span class="step-amount" style="margin:0; flex-shrink:0;">${item.master}</span>
      </div>`;
    });

    sheetsHtml += `<div data-recipe-sheet data-recipe-kind="${recipe.kind}" style="margin-bottom:14px;">
      <div style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); font-weight:600; margin-bottom:6px;">${kindLabel}</div>
      <div>${productRows}</div>
      <div style="display:flex; gap:12px; flex-wrap:wrap; font-size:12px; color:var(--text-muted); margin-top:8px;">
        <span>CE prévue : <strong data-predicted-ce style="color:var(--text);">${(ce || 0).toFixed(2)} mS/cm</strong></span>
        <span>pH cuve prévu : <strong data-predicted-ph style="color:var(--text);">${(pH || 0).toFixed(1)}</strong></span>
        <span>Tensioactif : <strong data-surfactant style="color:var(--text);">${surfactant ? 'oui' : 'non'}</strong></span>
      </div>
    </div>`;
  });
  document.getElementById('foliar-strategy').innerHTML = sheetsHtml;

  // ── Calendar section — one [data-foliar-calendar-slot] per recipe-day ──
  // Day codes are EN (Mon/Tue/…); display labels are FR. Map for the operator
  // surface; the model stays language-neutral.
  const DAY_LABEL_FR = { Mon: 'Lundi', Tue: 'Mardi', Wed: 'Mercredi', Thu: 'Jeudi', Fri: 'Vendredi' };
  let calendarHtml = '';
  strategy.recipes.forEach((recipe) => {
    const kindLabel = FOLIAR_RECIPE_KIND_LABEL[recipe.kind] || recipe.kind;
    recipe.days.forEach((day) => {
      calendarHtml += `<div data-foliar-calendar-slot style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:var(--accent-active-light); border:1.5px solid var(--accent-active-border); border-radius:var(--radius-sm);">
        <span style="font-weight:600; font-size:13px;">${DAY_LABEL_FR[day] || day}</span>
        <span data-calendar-recipe style="font-size:12px; color:var(--text-muted);">${kindLabel}</span>
      </div>`;
    });
  });
  if (!calendarHtml) {
    calendarHtml = `<div style="font-size:12px; color:var(--text-muted); padding:8px 0;">Aucune pulvérisation cette semaine.</div>`;
  }
  document.getElementById('foliar-calendar').innerHTML = calendarHtml;
}
