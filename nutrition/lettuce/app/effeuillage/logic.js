// Effeuillage — "feuilles à hauteur des épaules" call. Operator compares a
// shoulder-height leaf to their forearm (majeur tip → elbow = 18 po) and picks
// how far it reaches; the right pruning call shows.
//
// elbow  (≥18 po)        → garder 18 feuilles
// near   (16–18 po)      → ne pas effeuiller cette semaine
// short  (manque 2 po +) → garder les flag leaves
function effeuillageCall(reach) {
  switch (reach) {
    case 'elbow': return { icon: '✂️', text: 'Effeuiller pour garder 18 feuilles', tone: 'go' };
    case 'near':  return { icon: '✋', text: 'Ne pas effeuiller cette semaine', tone: 'hold' };
    case 'short': return { icon: '🌱', text: 'Garder les flag leaves cette semaine', tone: 'hold' };
    default:      return null;
  }
}

const EFFEUILLAGE_TONES = {
  go:   'background:var(--accent-tomato-light); border:1.5px solid var(--accent-tomato-border);',
  hold: 'background:var(--input-bg); border:1.5px solid var(--border);',
};

function setLeafReach(reach) {
  ['elbow', 'near', 'short'].forEach(r => {
    const button = document.getElementById('reach-' + r);
    if (button) button.classList.toggle('active', r === reach);
  });
  const call = effeuillageCall(reach);
  const box = document.getElementById('reach-result');
  if (!box || !call) return;
  box.innerHTML =
    '<div style="' + EFFEUILLAGE_TONES[call.tone] + ' border-radius:var(--radius-sm); padding:14px; font-size:14px; line-height:1.5; font-weight:700; color:var(--text);">' +
    call.icon + ' ' + call.text +
    '</div>';
}

window.setLeafReach = setLeafReach;
