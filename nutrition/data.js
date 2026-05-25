// Cross-crop nutrition constants.
//
// Spec: nutrition/spec.md § farm-working-days — the set of weekdays
// Décembre's operator is on-farm and may execute recipe sprays.
// Procedure-layer specs that schedule operator actions across the week
// draw their day-of-week pool from this single source of truth.

const FARM_WORKING_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

// Browser-globals export — single source-of-truth runtime constant.
window.Nutrition = window.Nutrition || {};
window.Nutrition.FARM_WORKING_DAYS = FARM_WORKING_DAYS;
