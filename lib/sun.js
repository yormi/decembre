// Sunrise/sunset for Quebec City (46.8°N, -71.2°W)
// Monthly lookup table (mid-month values, EDT)
// Source: timeanddate.com data for Quebec City
const SUN_TABLE = [
  // [sunrise_h, sunrise_m, sunset_h, sunset_m]
  [7, 30, 16, 30],  // Jan
  [7, 0,  17, 15],  // Feb
  [6, 15, 18, 0],   // Mar (post DST)
  [6, 10, 19, 15],  // Apr
  [5, 25, 20, 0],   // May
  [5, 5,  20, 30],  // Jun
  [5, 20, 20, 20],  // Jul
  [5, 55, 19, 40],  // Aug
  [6, 35, 18, 45],  // Sep
  [7, 15, 17, 45],  // Oct
  [6, 55, 16, 30],  // Nov (post DST end)
  [7, 30, 16, 15],  // Dec
];

function getSunTimes() {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const day = now.getDate();

  // Interpolate between current and next month for smoother transitions
  const current = SUN_TABLE[month];
  const next = SUN_TABLE[(month + 1) % 12];
  const frac = day / 30; // approximate fraction through month

  function interpolation(a, b, t) { return a + (b - a) * t; }

  const sunriseH = interpolation(current[0] + current[1] / 60, next[0] + next[1] / 60, frac);
  const sunsetH = interpolation(current[2] + current[3] / 60, next[2] + next[3] / 60, frac);

  function hToTime(h) {
    const hr = Math.floor(h);
    const mn = Math.round((h - hr) * 60);
    return `${String(hr).padStart(2, '0')}:${String(mn < 0 ? 0 : mn).padStart(2, '0')}`;
  }

  return { sunrise: sunriseH, sunset: sunsetH, sunriseString: hToTime(sunriseH), sunsetString: hToTime(sunsetH) };
}

function addHours(baseH, offset) {
  const h = baseH + offset;
  const hr = Math.floor(h);
  const mn = Math.round((h - hr) * 60);
  return `${String(hr).padStart(2, '0')}:${String(mn < 0 ? 0 : mn).padStart(2, '0')}`;
}

function getCurrentTimeString() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}
