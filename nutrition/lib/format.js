// Cross-nutrition mg/g formatters consumed by gap-grid renderers and the
// Bilan/nutrition pages. formatValue: g-promotion above 1 000 mg with unit
// suffix. formatMg (elemental-mass-in-mg): bare-numeric mg, no g-promotion — header
// already carries the unit (column-header-unit-declaration).

// Format a value as g if >= 1000 mg, else mg.
function formatValue(mg) {
  if (mg <= 0) return '0';
  if (mg >= 1000) return (mg / 1000).toFixed(2).replace(/\.?0+$/, '') + ' g';
  if (mg >= 10)   return Math.round(mg) + ' mg';
  if (mg >= 1)    return mg.toFixed(1) + ' mg';
  return mg.toFixed(2) + ' mg';
}

// elemental-mass-in-mg — bare-numeric mg renderer for gap-grid cells. Header carries (mg);
// cells must not duplicate the unit (column-header-unit-declaration). Stays in mg across the full
// range (no g-promotion) so the column reads consistently.
function formatMg(mg) {
  if (mg <= 0) return '0';
  if (mg >= 1000) return Math.round(mg).toLocaleString('fr-CA');
  if (mg >= 10)   return Math.round(mg).toString();
  if (mg >= 1)    return mg.toFixed(1);
  return mg.toFixed(2);
}
