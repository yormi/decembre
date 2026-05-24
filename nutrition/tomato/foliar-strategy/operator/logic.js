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

function buildFoliar() {
  const crop = currentCrop === 'tomato' ? 'tomato' : 'lettuce';
  const f = STORED_RECIPE[crop]?.foliaire;
  // Lettuce foliar removed → STORED_RECIPE.lettuce.foliaire is undefined. Skip
  // when not present. (UI never shows the foliar page with lettuce — setPage
  // redirects — but setCrop on other pages still calls buildFoliar, so we
  // need this guard.)
  if (!f) return;

  const spray = f.A;
  // Both crops mix in 1 backpack (15 L) → splitNote stays empty. Multi-backpack
  // branch kept as dead code in case we restore the master-bucket workflow.
  const splitNote = f.backpacks > 1
    ? `Diviser ensuite en <strong>${f.backpacks} sacs à dos de 15 L</strong>.`
    : '';

  document.getElementById('foliar-week-recommendation').textContent = 'Foliaire (oligos)';

  // Compute morning spray window from sunrise:
  //   start = sunrise + 30 min (stomata open)
  //   end   = min(sunrise + 3 h, 10:00) — caps at 10:00 to avoid intense sun in summer
  // Auto-adapts year-round: in June (sunrise ~5:05) window is 5:35–8:05;
  // in December (sunrise ~7:30) window is 8:00–10:00 (capped).
  // Times rounded to nearest 10 min for readability — minute-level precision
  // is noise (sunrise itself shifts ~1 min/day; team can't act on minutes).
  const sun = getSunTimes();
  const startH = sun.sunrise + 0.5;
  const endH = Math.min(sun.sunrise + 3, 10);
  const fmtH = (h) => {
    const totalMinutes = Math.round(h * 60 / 10) * 10; // round to nearest 10 min
    const hr = Math.floor(totalMinutes / 60);
    const mn = totalMinutes % 60;
    return `${hr}h${String(mn).padStart(2, '0')}`;
  };
  document.getElementById('foliar-when').textContent = `Mercredi am · entre ${fmtH(startH)} et ${fmtH(endH)}`;

  let html = (splitNote
    ? `<div style="background:var(--accent-active-light); border:1.5px solid var(--accent-active-border); border-radius:var(--radius-sm); padding:10px 12px; margin-bottom:12px; font-size:12.5px; line-height:1.5;">
        <div style="color:var(--text);">${splitNote}</div>
      </div>`
    : '') + `<div style="margin-top:8px;">`;

  spray.forEach(item => {
    const noteHtml = item.note
      ? `<div style="font-size:11px; color:var(--text-muted); font-style:italic; margin-top:2px;">${item.note}</div>`
      : '';
    html += `<div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border);">
      <div style="flex:1; min-width:0;">
        <div style="font-weight:600; font-size:13px;">${item.name}</div>
        ${noteHtml}
      </div>
      <span class="step-amount" style="margin:0; flex-shrink:0;">${item.master}</span>
    </div>`;
  });
  html += '</div>';

  document.getElementById('foliar-strategy').innerHTML = html;
}
