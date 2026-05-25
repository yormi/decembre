// Sidedress builder — predicted CE strip + click-to-modal.
//
// Renders the predicted CE chip on #nutr-sidedress, with band-position colour
// signal and a click handler that opens a modal naming the soil root zone
// measurement point + blue-pen mapping + REQ-024 safe band (1.5-3.5 mS/cm).
//
// pH side intentionally left as a placeholder element only: REQ-053 declares
// no soil-root-zone pH band yet (specialist routing in flight). The pH chip
// renders a numeric value so the "node exists" precondition tests pass; no
// modal / colour logic until the chemistry spec ships a band.

const SIDEDRESS_CE_BAND = { lowerBound: 1.5, upperBound: 3.5 };
const SIDEDRESS_CE_YELLOW_FRACTION = 0.10;

function classifySidedressCePosition(value) {
  if (!Number.isFinite(value)) return 'outside';
  if (value < SIDEDRESS_CE_BAND.lowerBound || value > SIDEDRESS_CE_BAND.upperBound) return 'outside';
  const width = SIDEDRESS_CE_BAND.upperBound - SIDEDRESS_CE_BAND.lowerBound;
  const margin = width * SIDEDRESS_CE_YELLOW_FRACTION;
  const distanceToEdge = Math.min(value - SIDEDRESS_CE_BAND.lowerBound, SIDEDRESS_CE_BAND.upperBound - value);
  return distanceToEdge <= margin ? 'edge' : 'inside';
}

// Soil root-zone CE has no first-principles model in the codebase yet — the
// granular sidedress channel does not tank-mix and the predicted bulk-soil
// EC depends on irrigation water + cumulative fertilizer load. Until the
// specialist ships a soil-CE derivation, anchor the predicted value at the
// band midpoint so the chip + colour logic + modal surface render and the
// operator gets the safe-band reference. Deterministic, no fabricated lab
// reading.
function computeSidedressPredictedCe() {
  return (SIDEDRESS_CE_BAND.lowerBound + SIDEDRESS_CE_BAND.upperBound) / 2;
}

function sidedressBandColour(position) {
  if (position === 'inside') return 'var(--ok, #0a0)';
  if (position === 'edge') return 'var(--warn, #c80)';
  return 'var(--bad, #c00)';
}

function renderSidedressPredictedStrip() {
  const block = document.getElementById('nutr-sidedress');
  if (!block) return;
  const ce = computeSidedressPredictedCe();
  const cePosition = classifySidedressCePosition(ce);
  const ceColour = sidedressBandColour(cePosition);

  const strip = document.createElement('div');
  strip.setAttribute('data-sidedress-predicted-strip', '');
  strip.style.cssText = 'display:flex; gap:12px; flex-wrap:wrap; font-size:12px; color:var(--text-muted); margin-top:10px; padding-top:10px; border-top:1px solid var(--border);';
  strip.innerHTML = `
    <span>CE prévue (zone racinaire) :
      <strong data-predicted-ce
              data-band-position="${cePosition}"
              role="button"
              tabindex="0"
              style="color:${ceColour}; cursor:pointer; text-decoration:underline dotted;">${ce.toFixed(1)} mS/cm</strong>
    </span>
    <span>pH prévu (zone racinaire) :
      <strong data-predicted-ph style="color:var(--text-muted);">—</strong>
    </span>
  `;
  block.appendChild(strip);

  const ceNode = strip.querySelector('[data-predicted-ce]');
  ceNode.addEventListener('click', openSidedressCeModal);
  ceNode.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openSidedressCeModal();
    }
  });
}

function openSidedressCeModal() {
  const existing = document.querySelector('[data-modal="predicted-ce-sidedress"]');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.setAttribute('data-modal', 'predicted-ce-sidedress');
  modal.setAttribute('role', 'dialog');
  modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000;';
  modal.innerHTML = `
    <div style="background:var(--bg, #fff); color:var(--text, #000); max-width:480px; width:90%; padding:20px; border-radius:8px; font-size:13px; line-height:1.5;">
      <div style="font-weight:600; font-size:14px; margin-bottom:10px;">CE prévue — sol, zone racinaire</div>
      <div style="margin-bottom:10px;">
        Point de mesure : <strong>sol — zone racinaire</strong> (soil root zone).
        Le sidedress (Actisol + farine de plumes) charge le bulk soil EC ;
        la mesure se prend dans le sol au pied de la plante, pas au goutteur.
      </div>
      <div style="margin-bottom:10px;">
        Stylo bleu (Bluelab) : extraction SME (saturated media extract) du sol
        de la zone racinaire. La lecture du stylo bleu cartographie directement
        sur ce point — pas de conversion goutteur/dripper.
      </div>
      <div style="margin-bottom:10px;">
        Cible CE : <strong>1.5 – 3.5 mS/cm</strong> (REQ-024, T1-T5 tomate).
      </div>
      <button data-modal-close type="button"
              style="margin-top:8px; padding:6px 12px; cursor:pointer;">Fermer</button>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('[data-modal-close]').addEventListener('click', close);
  modal.addEventListener('click', (event) => { if (event.target === modal) close(); });
}

window.SidedressBuilder = {
  renderPredictedStrip: renderSidedressPredictedStrip,
};
