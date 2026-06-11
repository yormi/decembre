// AMF inoculation drench — operator protocol data.
//
// Source of truth for the AMF week-card on the Fertilisation (sol) page (#amf-week-card).
// Distilled from nutrition/strategy/protocol/amf-inoculation.md (AGTIV REACH P,
// SG1 interim P-uptake bridge). Render is deterministic from this object —
// no prose lives in the page markup.
//
// Campaign: 5 drench passes, every 10 days, first = Mon 2026-06-08.
// Cadence locked at 10 d (max-flush end of the protocol's 10–14 d range —
// catches the most fresh root flushes in the closing vegetative-root window).
const AMF_DRENCH = {
  product: 'AGTIV REACH P',
  schedule: { start: '2026-06-08', intervalDays: 10, passes: 5 },
  // Practical mix the team executes, rendered as tiles inside the dilution
  // step (mirrors the fertigation page).
  mix: [
    { name: 'AGTIV REACH P', amount: '3', unit: 'c. à soupe', emoji: '🍄' },
  ],
  steps: [
    { title: "Diluer 3 c. à soupe dans 2 tasses d'eau", tiles: true },
    {
      title: "Verser dans l'arrosoir de 12 L et remplir d'eau",
      note: 'La tourbe ne se dissout pas. Brasser fort et garder en agitation pour une application uniforme.',
    },
    {
      title: 'Verser 2 arrosoirs par planche',
      note: 'Un arrosoir à gauche, un arrosoir à droite des plants.',
    },
    {
      title: 'Gratter légèrement la surface',
      note: 'Entraîne la poudre vers les racines et déclenche une nouvelle pousse.',
    },
    { title: 'Irriguer 5 min', note: 'Pour faire pénétrer.' },
  ],
  warnings: [
    'Pas de goutte-à-goutte — la poudre bouche les émetteurs. Arrosage à la main seulement.',
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
