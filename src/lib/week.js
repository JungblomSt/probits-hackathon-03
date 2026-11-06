// Hjälpfunktioner för ISO-veckor (måndag–söndag, lokal tid)

export const WEEKDAYS = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];
export const WEEKDAY_LETTERS = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

const DAY_MS = 24 * 60 * 60 * 1000;

// 0 = måndag … 6 = söndag
export function weekdayIndex(date) {
  return (date.getDay() + 6) % 7;
}

export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfWeek(date) {
  const d = startOfDay(date);
  d.setDate(d.getDate() - weekdayIndex(d));
  return d;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isoWeek(date) {
  const d = startOfDay(date);
  // Torsdagen i samma vecka avgör vilket år veckan tillhör
  d.setDate(d.getDate() + 3 - weekdayIndex(d));
  const firstThursday = new Date(d.getFullYear(), 0, 4);
  firstThursday.setDate(firstThursday.getDate() + 3 - weekdayIndex(firstThursday));
  const number = 1 + Math.round((d - firstThursday) / (7 * DAY_MS));
  return { year: d.getFullYear(), number };
}

export function weekIdFor(date) {
  const { year, number } = isoWeek(date);
  return `${year}-W${String(number).padStart(2, '0')}`;
}

export function dateKey(date) {
  const d = new Date(date);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function dayDate(week, weekday) {
  return addDays(new Date(week.start), weekday);
}

export function weekEnd(week) {
  return addDays(new Date(week.start), 7);
}

export function isWeekOver(week, now = new Date()) {
  return now >= weekEnd(week);
}

export function weekRangeLabel(week) {
  const start = new Date(week.start);
  const end = addDays(start, 6);
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} ${MONTHS[end.getMonth()]}`;
  }
  return `${start.getDate()} ${MONTHS[start.getMonth()]}–${end.getDate()} ${MONTHS[end.getMonth()]}`;
}

export function formatTime(hour, minute) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function formatSteps(n) {
  return Math.round(n).toLocaleString('sv-SE').replace(/,/g, ' ');
}
