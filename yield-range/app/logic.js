// ─── yield-range/app/logic.js — page wiring ────────────────────────────────
//
// UI contract: yield-range/app/spec.md (REQ-072 to 078 + REQ-084).
// Math: yield-range/{spec.md, derivation.md} via window.YieldRange.
//
// Page state (4 inputs, REQ-072):
//   yrPlateau   ∈ {32, 50}              (plateau toggle, default 50)
//   yrWeeks     ∈ [1, 10]               (semaines germ→transplant, default 4)
//   yrStrategy  ∈ {actuelle, parfaite}  (stratégie nutritive, default actuelle)
//   yrDLI       ∈ [5, 29]               (DLI banc slider, default 27.5)
//
// REQ-073: every input change triggers renderYieldRange() — no button click.
// REQ-074: stratégie nutritive is binary; map to CE multiplier without
//          forcing a numeric CE input on the operator.
// REQ-077: stratégie optimale auto-sweeps 4 combos via computeBestStrategy.
// REQ-078: info block auto-renders from constants — no hardcoded duplicate
//          numeric values in HTML.

let yrPlateau  = 50;
let yrWeeks    = 4;
let yrStrategy = 'actuelle';
let yrDLI      = 27.5;

// CE per-strategy mapping. "actuelle" matches Décembre's current Acadie-based
// fertigation (cycle-average CE ≈ 1.8 mS/cm via Bluelab pour-through);
// "parfaite" pushes into the luxury plateau (CE 2.4) where f_CE is at the
// upper edge of the optimum band without tipping into salt stress. These
// values must stay aligned with computeBestStrategy() in yield-range/calc.js.
const YR_STRATEGY_CE = { actuelle: 1.8, parfaite: 2.4 };

// Cycle-day mapping: weeks germ→transplant × 7. Spec inputs list cycleDays
// directly; the operator thinks in weeks, so we expose weeks and convert.
function yrCycleDays() { return Math.max(7, yrWeeks * 7); }

// Plateau → cellVolumeML. Stored separately so the page reads spec values:
// 50-cell ≈ 35 mL, 32-cell ≈ 90 mL (RootCap = volume × 1.6 → 56 g / 144 g).
function yrCellVolumeML(plateau) { return plateau === 32 ? 90 : 35; }

function yrFmtG(v)  { if (v == null || !isFinite(v)) return '—'; return v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2); }
function yrFmtKg(v) { if (v == null || !isFinite(v)) return '—'; return v >= 100 ? v.toFixed(0) : v.toFixed(1); }
function yrFmtFr(v) { return String(v).replace('.', ','); }

// REQ-069 → French label for binding constraint output. Kept terse.
const YR_BINDING_LABEL = {
  light:      'lumière',
  Tday:       'T jour',
  Tnight:     'T nuit',
  CE:         'CE',
  VPD:        'VPD',
  CO2:        'CO₂',
  root:       'volume racinaire (RootCap)',
  senescence: 'sénescence',
  none:       '—',
};
const YR_RISK_LABEL = {
  tipburn:      'tipburn',
  etiolation:   'étiolement',
  water_stress: 'stress hydrique',
  disease:      'maladie (VPD bas)',
  bolting:      'montée en fleur',
};
const YR_LEVER_LABEL = {
  Tday:   'T jour',
  Tnight: 'T nuit',
  CE:     'CE',
  VPD:    'VPD',
  CO2:    'CO₂',
};

// Render the 7-item info block (REQ-078). Values come from window.YieldRange
// constants — no hardcoded HTML duplicates of numbers.
function renderYieldRangeInfoBlock() {
  const YR = window.YieldRange;
  if (!YR) return;
  const fmtFloat1 = v => String(Number(v).toFixed(1)).replace('.', ',');
  // Fixed environmental defaults match what the model uses for inputs we
  // don't expose on the page (cycle-average T_day 24, T_night 18, VPD 4.5,
  // CO₂ photoperiod 500 — values traced in yield-range/app/derivation.md).
  // These are model assumptions, not constants in data.js, but they are the
  // exact values predictNurseryYield falls back to — so the info block
  // stays honest when defaults change in calc.js.
  const T_DAY_DEFAULT     = 24;
  const T_NIGHT_DEFAULT   = 18;
  const VPD_DEFAULT_GM3   = 4.5;
  const CO2_DEFAULT_PPM   = 500;
  const items = [
    { label: 'T jour',                       value: `${T_DAY_DEFAULT} °C` },
    { label: 'T nuit',                       value: `${T_NIGHT_DEFAULT} °C` },
    { label: 'VPD photopériode',             value: `${fmtFloat1(VPD_DEFAULT_GM3)} g/m³` },
    { label: 'CO₂ photopériode',             value: `${CO2_DEFAULT_PPM} ppm` },
    { label: 'Seuil bolting',                value: `${YR.BOLTING_TDAY_THRESHOLD_C} °C` },
    { label: 'RootCap 50-cell (35 mL)',      value: `${YR.rootCap(35).toFixed(0)} g` },
    { label: 'RootCap 32-cell (90 mL)',      value: `${YR.rootCap(90).toFixed(0)} g` },
  ];
  const el = document.getElementById('yr-info-block');
  if (!el) return;
  el.innerHTML = items.map(it => `
    <div style="font-weight:500;">${it.label}</div>
    <div style="font-family:'DM Mono',monospace; color:var(--text); font-weight:600;">${it.value}</div>
  `).join('');
}

// Live recompute. Called by every input change (REQ-073).
function renderYieldRange() {
  const YR = window.YieldRange;
  if (!YR) return;

  const cellsPerTray = yrPlateau;
  const cellVolumeML = yrCellVolumeML(yrPlateau);
  const cycleDays    = yrCycleDays();
  const ceAvg        = YR_STRATEGY_CE[yrStrategy] || YR_STRATEGY_CE.actuelle;

  // Single-cohort prediction with operator's chosen inputs. Other env
  // inputs (T_day, T_night, VPD, CO₂) take calc.js defaults so the info
  // block reflects the true model assumptions.
  const r = YR.predictNurseryYield({
    varietyKey:   'salanova',
    cellVolumeML, cellsPerTray,
    traysPerCohort: 50,
    cycleDays,
    dliBenchAvg:  yrDLI,
    ceAvg,
    wInitG:       YR.W_INIT_GERMINATED_G,
  });

  // Output 1 — Rendement par plant + ±15% band (REQ-067)
  const op = document.getElementById('yr-out-perplant');
  const opb = document.getElementById('yr-out-perplant-band');
  if (op)  op.textContent  = `${yrFmtFr(yrFmtG(r.wPredictedG))} g`;
  if (opb) opb.textContent = `bande ${yrFmtFr(yrFmtG(r.wLowG))}–${yrFmtFr(yrFmtG(r.wHighG))} g (±15 %)`;

  // Output 2 — Jour de pic de croissance (REQ-075)
  const opd = document.getElementById('yr-out-peakday');
  const opdNote = document.getElementById('yr-out-peakday-note');
  if (opd) opd.textContent = r.optimalHarvestDay > 0 ? `j ${r.optimalHarvestDay}` : '—';
  if (opdNote) {
    if (r.regressionWarning) {
      opdNote.innerHTML = `<span style="color:#8a3e1e;">cycle ${cycleDays} j > pic — récolte tardive</span>`;
    } else {
      opdNote.textContent = 'depuis germination';
    }
  }

  // Output 3 — Rendement par m² par an (REQ-076)
  // gPerM2PerYear from calc; show in kg/m²/an for readability.
  const oy = document.getElementById('yr-out-yearly');
  const oyNote = document.getElementById('yr-out-yearly-note');
  const kgPerM2 = r.gPerM2PerYear / 1000;
  if (oy) oy.textContent = `${yrFmtFr(yrFmtKg(kgPerM2))} kg`;
  if (oyNote) {
    const pPerM2 = (cellsPerTray / YR.TRAY_AREA_M2).toFixed(0);
    const cycles = (52 / r.cycleWeeks).toFixed(1);
    oyNote.textContent = `${pPerM2} plants/m² × ${yrFmtFr(yrFmtG(r.wPredictedG))} g × ${yrFmtFr(cycles)} cycles/an`;
  }

  // Output 4 — Stratégie optimale (REQ-077)
  const best = YR.computeBestStrategy(yrDLI, 50);
  const ob = document.getElementById('yr-out-best');
  const obNote = document.getElementById('yr-out-best-note');
  if (ob) {
    const w = best.winner;
    const kg = (w.gPerM2PerYear / 1000);
    ob.innerHTML = `${w.plateau}-cell · ${w.strategy}<br>`
                 + `${w.weeksAtPeak} sem → <span style="color:var(--text);">${yrFmtFr(yrFmtKg(kg))} kg/m²/an</span>`;
  }
  if (obNote) {
    const allStr = best.all4.map(c =>
      `${c.plateau}·${c.strategy.slice(0,3)} ${(c.gPerM2PerYear/1000).toFixed(1)}`
    ).join(' · ');
    obNote.textContent = allStr;
  }

  // Context: binding constraint + risk flags + top levers
  const ctx = document.getElementById('yr-context');
  if (ctx) {
    const bind = YR_BINDING_LABEL[r.bindingConstraint] || r.bindingConstraint;
    const risks = (r.riskFlags || []).map(k => YR_RISK_LABEL[k] || k);
    const levers = (r.topLevers || []).map(l => YR_LEVER_LABEL[l.key] || l.key);
    let html = `<div><strong style="color:var(--text);">Contrainte limitante :</strong> ${bind}`;
    if (r.bindingConstraint === 'root') {
      html += ` · cellule pleine à j ${isFinite(r.daysToRootCap) ? r.daysToRootCap : '—'} (RootCap ${r.rootCapG.toFixed(0)} g)`;
    }
    html += `</div>`;
    if (levers.length) {
      html += `<div style="margin-top:4px;"><strong style="color:var(--text);">Top leviers :</strong> ${levers.join(' · ')}</div>`;
    }
    if (risks.length) {
      html += `<div style="margin-top:4px;"><strong style="color:#8a3e1e;">Risques :</strong> ${risks.join(' · ')}</div>`;
    } else {
      html += `<div style="margin-top:4px;">Aucun signal de risque déclenché.</div>`;
    }
    ctx.innerHTML = html;
  }
}

// Render once + wire input handlers (REQ-073). Idempotent — guarded so
// repeated setPage('rendement') calls don't double-bind.
let _yrInputsWired = false;
function setupYieldRangeInputs() {
  if (_yrInputsWired) return;
  _yrInputsWired = true;

  // Plateau toggle (REQ-072 input #1)
  document.querySelectorAll('#yr-plateau-selector [data-plateau]').forEach(b => {
    b.addEventListener('click', () => {
      const v = parseInt(b.dataset.plateau, 10);
      if (v !== 32 && v !== 50) return;
      yrPlateau = v;
      document.querySelectorAll('#yr-plateau-selector [data-plateau]').forEach(x =>
        x.classList.toggle('active', parseInt(x.dataset.plateau, 10) === yrPlateau)
      );
      renderYieldRange();
    });
  });

  // Stratégie nutritive toggle (REQ-074)
  document.querySelectorAll('#yr-strategy-selector [data-strategy]').forEach(b => {
    b.addEventListener('click', () => {
      const v = b.dataset.strategy;
      if (v !== 'actuelle' && v !== 'parfaite') return;
      yrStrategy = v;
      document.querySelectorAll('#yr-strategy-selector [data-strategy]').forEach(x =>
        x.classList.toggle('active', x.dataset.strategy === yrStrategy)
      );
      renderYieldRange();
    });
  });

  // Semaines germ→transplant (REQ-072 input #2)
  const wEl = document.getElementById('yr-weeks');
  if (wEl) {
    wEl.addEventListener('input', () => {
      const v = parseInt(wEl.value, 10);
      if (!isNaN(v) && v >= 1 && v <= 10) yrWeeks = v;
      renderYieldRange();
    });
  }

  // DLI banc slider (REQ-084) — live label + recompute on every move.
  const dliEl   = document.getElementById('yr-dli');
  const dliLab  = document.getElementById('yr-dli-label');
  if (dliEl) {
    dliEl.addEventListener('input', () => {
      const v = parseFloat(dliEl.value);
      if (!isNaN(v)) yrDLI = v;
      if (dliLab) dliLab.textContent = yrFmtFr(yrDLI.toString());
      renderYieldRange();
    });
  }
}

// Build entry point — called when the page is shown via setPage('rendement').
// Mirrors buildNutriment / buildBanqueSol patterns.
function buildYieldRange() {
  setupYieldRangeInputs();
  renderYieldRangeInfoBlock();
  renderYieldRange();
}
