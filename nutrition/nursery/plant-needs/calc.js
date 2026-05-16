// Nursery plant-needs — derivation function.
//
// Spec:        nutrition/nursery/plant-needs/spec.md
// Derivation:  nutrition/nursery/plant-needs/derivation.md
//
// Pure function: same inputs (targetG, cycleDays, cellsPerTray) → same
// output. No DOM access, no side effects. Cycle is treated as flat —
// no T1/T2 sub-stages for nursery (deliberate; deferred until tissue-
// stratified data lands).
//
// Formula (per element):
//   dwPerPlantPerWk_g = targetG × DM × (7 / cycleDays)
//   perPlant_mg       = dwPerPlantPerWk_g × tissue_conc × 1000
//   perTray_mg        = perPlant_mg × cellsPerTray
//
// Seed mass treated as 0 (~1 mg per Salanova seed, negligible vs the
// 90 g target). The formula is **linear in targetG** (REQ-090) and the
// per-week term is **inverse-linear in cycleDays** (REQ-091) — both
// asserted by the verifier.

function calculateNurseryDemand(targetG, cycleDays, cellsPerTray) {
  const days = Math.max(1, cycleDays);
  const cells = Math.max(0, cellsPerTray);
  const targetSafe = Math.max(0, targetG);
  const dwPerPlantPerWk_g = targetSafe * LETTUCE_NURSERY_DM_FRACTION * (7 / days);
  const out = {};
  Object.keys(LETTUCE_NURSERY_TISSUE_DW).forEach(el => {
    const perPlant_mg = dwPerPlantPerWk_g * LETTUCE_NURSERY_TISSUE_DW[el] * 1000;
    out[el] = {
      perPlant_mg,
      perTray_mg: perPlant_mg * cells,
    };
  });
  return out;
}
