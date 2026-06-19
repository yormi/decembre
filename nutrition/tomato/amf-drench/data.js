// AMF inoculation drench — operator protocol data.
//
// Source of truth for the AMF week-card on the Fertilisation (sol) page (#amf-week-card).
// Distilled from nutrition/tomato/strategy/protocol/amf-inoculation.md (AGTIV REACH P,
// SG1 interim P-uptake bridge). Render is deterministic from this object —
// no prose lives in the page markup.
//
// Campaign: 5 drench passes, every 10 days, first = Mon 2026-06-08.
// Cadence locked at 10 d (max-flush end of the protocol's 10–14 d range —
// catches the most fresh root flushes in the closing vegetative-root window).
const AMF_DRENCH = {
  product: 'AGTIV REACH P',
  schedule: { start: '2026-06-08', intervalDays: 10, passes: 5 },
  // Steps render in order; a step's `tiles` array (emoji / label / big mono
  // amount / unit) renders inside it, same shape as the fertigation page.
  // One shared barrel for the whole block (7 beds), 2 arrosoirs per bed.
  steps: [
    {
      title: 'Remplir un baril',
      tiles: [
        { name: 'Eau', amount: '170', unit: 'L', emoji: '💧' },
        { name: 'AGTIV REACH P', amount: '14', unit: 'c. à soupe', emoji: '🍄' },
      ],
    },
    {
      title: 'Bien mélanger le baril avant chaque arrosoir',
      note: 'Sinon le produit se dépose au fond du baril.',
    },
    {
      title: 'Arroser de chaque côté des plants',
      tiles: [
        { name: 'Arrosoir', amount: '1', unit: '', emoji: '🪣' },
        { name: 'Plants', amount: '', unit: '', emoji: '🌱' },
        { name: 'Arrosoir', amount: '1', unit: '', emoji: '🪣' },
      ],
    },
    { title: 'Répéter les étapes 2-3 pour chaque planche' },
  ],
  warnings: [
    'Le produit bouche les goutte-à-gouttes. Arrosage à la main seulement.',
    "Pas de fongicide près de l'application — tue l'inoculant.",
  ],
};

// Pure: expand {start, intervalDays, passes} → [{n, date}]. No "now" read here.
function computeAmfPasses(schedule) {
  const [year, month, day] = schedule.start.split('-').map(Number);
  return Array.from({ length: schedule.passes }, (_, index) => ({
    n: index + 1,
    date: new Date(year, month - 1, day + index * schedule.intervalDays),
  }));
}

window.AMF_DRENCH = AMF_DRENCH;
window.computeAmfPasses = computeAmfPasses;
