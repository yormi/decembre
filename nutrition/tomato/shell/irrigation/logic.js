// Tensiometer config: offsets from sunrise/sunset
// morningStart: hours after sunrise to begin irrigation
// pmStart: hours after sunrise to switch to PM threshold
// stopBeforeSunset: hours before sunset when we check if surface is dry
// lastIrrigationBeforeSunset is per vigor level:
//   Low: 3h (minimize afternoon stress on weak plants)
//   Normal: 4h (standard — 2-3h drying time for sandy soil + margin)
//   High: 5h (aggressive dryback — push roots, control vigor)
const TENSIO_CONFIG = {
  tomato: {
    morningStart: 2,
    pmStart: 5,
    stopBeforeSunset: 4,
    shotDuration: '3 min',
    shotPause: '45 min',
    low:    { am: 10, pm: 12, lastStop: 3, sunrise_kpa: '18–22', note: 'Garder le sol humide — les racines affaiblies ne vont pas chercher l\'eau en profondeur. Pas d\'assèchement.' },
    normal: { am: 15, pm: 20, lastStop: 4, sunrise_kpa: '22–25', note: 'Léger assèchement l\'après-midi — encourage l\'enracinement sans stresser les plants.' },
    high:   { am: 20, pm: 25, lastStop: 5, sunrise_kpa: '25–30', note: 'Assèchement marqué — freine la végétation et dirige l\'énergie vers les fruits.' },
  },
  lettuce: {
    morningStart: 1,
    pmStart: 4.5,
    stopBeforeSunset: 3,
    shotDuration: '3 min',
    shotPause: '30 min',
    low:    { am: 8,  pm: 10, lastStop: 2, sunrise_kpa: '12–15', note: 'Racines superficielles — garder très humide pour éviter le flétrissement.' },
    normal: { am: 10, pm: 15, lastStop: 3, sunrise_kpa: '15–18', note: 'Maintenir l\'humidité sans saturer. Léger assèchement en PM acceptable.' },
    high:   { am: 12, pm: 18, lastStop: 4, sunrise_kpa: '18–22', note: 'Assèchement modéré. Ne jamais dépasser 20 kPa — la laitue flétrit irréversiblement dans le sable.' },
  }
};

function buildTensio() {
  const crop = currentCrop === 'tomato' ? 'tomato' : 'lettuce';
  const config = TENSIO_CONFIG[crop];
  const v = config[currentVigor];
  const sun = getSunTimes();
  const now = getCurrentTimeString();

  const amStart = addHours(sun.sunrise, config.morningStart);
  const pmStart = addHours(sun.sunrise, config.pmStart);
  const lastShot = addHours(sun.sunset, -v.lastStop);
  const eveningCheck = addHours(sun.sunset, -config.stopBeforeSunset);

  let html = '';
  // Sun-times + current-time bar removed by user request (info available elsewhere).

  // Shot config — outside the table
  html += `<div style="font-size:12px; color:var(--text-muted); margin-bottom:14px;">
    Shots de <strong style="color:var(--text);">${config.shotDuration}</strong> · pause <strong style="color:var(--text);">${config.shotPause}</strong> entre chaque
  </div>`;

  // 3 periods — midnight to midnight
  const periods = [
    { icon: '🌙', label: 'Nuit', time: `00:00 → ${amStart}`, kpa: 'Stop', active: false },
    { icon: '☀️', label: 'Matin', time: `${amStart} → ${pmStart}`, kpa: `${v.am} kPa`, active: true },
    { icon: '🌤', label: 'Après-midi', time: `${pmStart} → ${lastShot}`, kpa: `${v.pm} kPa`, active: true },
    { icon: '🌅', label: 'Soir', time: `${lastShot} → 00:00`, kpa: 'Stop', active: false },
  ];

  periods.forEach(p => {
    html += `<div style="display:flex; align-items:center; padding:10px 0; border-bottom:1px solid var(--border);">
      <span style="font-size:16px; width:28px;">${p.icon}</span>
      <div style="flex:1;">
        <div style="font-size:13px; font-weight:600;">${p.label}</div>
        <div style="font-size:11px; color:var(--text-muted);">${p.time}</div>
      </div>
      <span style="font-family:'DM Mono',monospace; font-size:13px; font-weight:600; color:${p.active ? 'var(--text)' : 'var(--text-muted)'};">${p.kpa}</span>
    </div>`;
  });

  // Why block
  html += `<div style="font-size:11px; color:var(--text-muted); line-height:1.6; margin:12px 0;">
    <div style="margin-bottom:3px;">☀️ Début ${config.morningStart}h après le lever — laisser les racines s'activer.</div>
    <div style="margin-bottom:3px;">🌤 Seuil plus sec — préparer l'assèchement.</div>
    <div style="margin-bottom:3px;">🌙 Dernier shot ${v.lastStop}h avant le coucher — le 1er cm doit être sec au coucher du soleil.</div>
  </div>`;

  document.getElementById('tensio-params').innerHTML = html;

  // Success criteria — separate card
  let successHTML = `<div style="font-size:12px; color:var(--text-muted); line-height:1.7;">
      <div style="padding:3px 0;">🌅 Au lever : tensiomètre <strong style="color:var(--text);">${v.sunrise_kpa} kPa</strong></div>
      <div style="padding:3px 0;">🌿 À ${eveningCheck} : surface sèche au toucher sur 1 cm</div>
      <div style="padding:3px 0;">💧 Guttation à l'aube : feuilles sèches = ✓ · perles d'eau = trop humide</div>
      ${currentCrop === 'tomato' ?
        '<div style="padding:3px 0;">🍅 Chancres botrytis : secs/durs = ✓ · mous/suintants = trop humide</div>' :
        '<div style="padding:3px 0;">🥬 Tipburn : marges brunes = pas assez d\'eau → baisser kPa</div>'
      }
    </div>`;
  document.getElementById('tensio-success').innerHTML = successHTML;

  // Vigor note — merged into vigor card (tomato only)
  if (currentCrop === 'tomato') {
    document.getElementById('vigor-note').innerHTML =
      `<div style="font-size:12px; color:#8a5a1e; background:var(--warning-bg); border:1.5px solid #f0c899; border-radius:var(--radius-sm); padding:10px 12px; line-height:1.4;">${v.note}</div>`;
  }
}
