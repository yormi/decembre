// Weekly schedule — single source of truth for what happens when.
// Each task: { day (0=Mon..6=Sun), title, time, page }
function getWeekSchedule() {
  const sun = getSunTimes();
  const startH = sun.sunrise + 0.5;
  const endH = Math.min(sun.sunrise + 3, 10);
  const fmtH = (h) => {
    const totalMinutes = Math.round(h * 60 / 10) * 10;
    const hr = Math.floor(totalMinutes / 60);
    const mn = totalMinutes % 60;
    return `${hr}h${String(mn).padStart(2, '0')}`;
  };
  const sprayWindow = `${fmtH(startH)}–${fmtH(endH)}`;

  return [
    { day: 0, title: 'Préparer la solution de fertigation', time: 'Matin', page: 'fertigation' },
    { day: 1, title: 'Vérifier le baril de fertigation', time: 'Matin', page: 'fertigation' },
    { day: 2, title: 'Vérifier le baril de fertigation', time: 'Matin', page: 'fertigation' },
    { day: 2, title: 'Spray foliaire A', time: sprayWindow, page: 'foliar' },
    { day: 3, title: 'Vérifier le baril de fertigation', time: 'Matin', page: 'fertigation' },
    { day: 4, title: 'Vérifier le baril de fertigation', time: 'Matin', page: 'fertigation' },
    { day: 4, title: 'Spray foliaire B', time: sprayWindow, page: 'foliar' },
  ];
}

// Open a task from the week view: just navigate to the page.
// User picks the crop (if needed) via the in-page sub-toggle.
function openWeekTask(page) {
  setPage(page);
}

function buildWeek() {
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const tasks = getWeekSchedule();
  // JS Date.getDay(): 0=Sunday..6=Saturday → convert to our 0=Monday..4=Friday
  // Weekend days have no index in our 5-day view, so todayIndex is -1 on Sat/Sun
  const jsDay = new Date().getDay();
  const todayIndex = (jsDay === 0 || jsDay === 6) ? -1 : jsDay - 1;

  let html = '';
  for (let i = 0; i < 5; i++) {
    const dayTasks = tasks.filter(t => t.day === i);
    const isToday = i === todayIndex;
    html += `<div class="week-day ${isToday ? 'is-today' : ''}">
      <div class="week-day-label">${days[i].slice(0, 3)}${isToday ? ' •' : ''}</div>
      <div class="week-day-tasks">`;
    if (dayTasks.length === 0) {
      html += `<div class="week-task-empty">Rien de planifié</div>`;
    } else {
      dayTasks.forEach(t => {
        html += `<button class="week-task ${isToday ? 'is-today' : ''}" onclick="openWeekTask('${t.page}')">
          <div class="week-task-title">${t.title}</div>
          <div class="week-task-meta">${t.time}</div>
        </button>`;
      });
    }
    html += `</div></div>`;
  }
  document.getElementById('week-schedule').innerHTML = html;
}
