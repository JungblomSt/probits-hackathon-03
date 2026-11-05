// Sammanställer en månads data till en rapport som kan delas med coachen

import { addDays, dateKey, dayDate, formatSteps, WEEKDAYS, weekRangeLabel } from './week';

export const MONTH_NAMES = [
  'januari',
  'februari',
  'mars',
  'april',
  'maj',
  'juni',
  'juli',
  'augusti',
  'september',
  'oktober',
  'november',
  'december',
];

const MOOD_TEXT = {
  glad: 'glad',
  energi: 'full av energi',
  lugn: 'lugn',
  nojd: 'trött men nöjd',
  tungt: 'tungt',
};

const FEELING_TEXT = { lätt: 'för lätt', lagom: 'lagom', tufft: 'för tufft' };

// En vecka hör till den månad där veckans torsdag ligger (samma regel som ISO-veckor)
export function monthOfWeek(week) {
  const thursday = addDays(new Date(week.start), 3);
  return { year: thursday.getFullYear(), month: thursday.getMonth() };
}

export const monthKey = ({ year, month }) => `${year}-${String(month + 1).padStart(2, '0')}`;

export function monthLabel({ year, month }) {
  const name = MONTH_NAMES[month];
  return `${name[0].toUpperCase()}${name.slice(1)} ${year}`;
}

// Alla månader som har minst en vecka, nyast först
export function availableMonths(weeks) {
  const map = {};
  for (const w of Object.values(weeks)) {
    const m = monthOfWeek(w);
    map[monthKey(m)] = m;
  }
  return Object.keys(map)
    .sort()
    .reverse()
    .map((k) => map[k]);
}

function formatDuration(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function buildMonthReport(weeks, stepsByDay, { year, month }) {
  const monthWeeks = Object.values(weeks)
    .filter((w) => {
      const m = monthOfWeek(w);
      return m.year === year && m.month === month;
    })
    .sort((a, b) => (a.start < b.start ? -1 : 1));

  let done = 0;
  let planned = 0;
  let activeMin = 0;

  const weekRows = monthWeeks.map((w) => {
    const doneActs = w.activities.filter((a) => a.done);
    done += doneActs.length;
    planned += w.plannedSessions;
    activeMin += doneActs.reduce((s, a) => s + (a.durationMin || 0), 0);
    const steps = Array.from({ length: 7 }).reduce(
      (sum, _, i) => sum + (stepsByDay[dateKey(dayDate(w, i))] ?? 0),
      0
    );
    return { week: w, done: doneActs.length, steps };
  });

  // Steg för alla dagar i månaden som finns sparade
  const prefix = monthKey({ year, month });
  const steps = Object.entries(stepsByDay)
    .filter(([k]) => k.startsWith(prefix))
    .reduce((s, [, v]) => s + v, 0);

  const summary = { done, planned, activeMin, steps, weekCount: monthWeeks.length };

  const text = (greeting = '') => {
    const lines = [];
    lines.push(`Min månad i Rörelseplan – ${monthLabel({ year, month })}`);
    lines.push('');
    lines.push(`Genomförda pass: ${done} (planerade ${planned})`);
    lines.push(`Aktiv tid: ${formatDuration(activeMin)}`);
    if (steps > 0) lines.push(`Steg: ${formatSteps(steps)}`);

    for (const r of weekRows) {
      const w = r.week;
      lines.push('');
      let head = `Vecka ${w.number} (${weekRangeLabel(w)}): ${r.done} av ${w.plannedSessions} pass`;
      if (w.evaluation) head += ` · kändes ${FEELING_TEXT[w.evaluation.feeling]}`;
      lines.push(head);
      const acts = [...w.activities].sort((a, b) => a.weekday - b.weekday);
      for (const a of acts) {
        const mark = a.done ? '✓' : '–';
        let row = `  ${mark} ${WEEKDAYS[a.weekday]}: ${a.title}, ${a.durationMin} min`;
        if (a.done?.steps) row += ` (${formatSteps(a.done.steps)} steg)`;
        if (a.done?.mood) row += ` · kändes ${MOOD_TEXT[a.done.mood]}`;
        if (!a.done) row += ' (blev inte av)';
        lines.push(row);
      }
      if (r.steps > 0) lines.push(`  Steg under veckan: ${formatSteps(r.steps)}`);
    }

    const g = greeting.trim();
    if (g) {
      lines.push('');
      lines.push('Till dig som coach:');
      lines.push(g);
    }
    return lines.join('\n');
  };

  return { summary, weekRows, text };
}
