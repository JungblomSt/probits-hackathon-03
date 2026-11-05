import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { addDays, dateKey, dayDate, isoWeek, startOfWeek, weekIdFor } from '../lib/week';

/*
  Datamodell
  week = {
    id: '2026-W45', start: ISO-sträng (måndag 00:00), number: 45,
    plannedSessions: 5,                // veckans mål, antal pass
    activities: [activity],
    evaluation: null | { feeling: 'lätt'|'lagom'|'tufft', at }
  }
  activity = {
    id, title, weekday (0 = mån), durationMin, difficulty,
    mode: 'steps' | 'manual', stepGoal,
    reminder: null | { hour, minute, eveningBefore },
    done: null | { source: 'auto'|'manual', at, steps? },
    skipAuto: bool                     // användaren ångrade en automatisk bock
  }
*/

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

function makeWeek(startDate, plannedSessions, activities = []) {
  const start = startOfWeek(startDate);
  return {
    id: weekIdFor(start),
    start: start.toISOString(),
    number: isoWeek(start).number,
    plannedSessions,
    activities,
    evaluation: null,
  };
}

// Bockar av stegaktiviteter där dagens steg nått målet
function autoComplete(week, stepsByDay) {
  let changed = false;
  const activities = week.activities.map((a) => {
    if (a.mode !== 'steps' || a.done || a.skipAuto) return a;
    const steps = stepsByDay[dateKey(dayDate(week, a.weekday))] ?? 0;
    if (steps >= a.stepGoal) {
      changed = true;
      return { ...a, done: { source: 'auto', at: new Date().toISOString(), steps } };
    }
    return a;
  });
  return changed ? { ...week, activities } : week;
}

export const useStore = create(
  persist(
    (set, get) => {
      // Uppdaterar aktuell vecka och kör auto-avbockning
      const updateCurrent = (fn) =>
        set((s) => {
          const cur = s.weeks[s.currentWeekId];
          if (!cur) return s;
          const next = autoComplete(fn(cur), s.stepsByDay);
          return { weeks: { ...s.weeks, [cur.id]: next } };
        });

      return {
        weeks: {},
        currentWeekId: null,
        stepsByDay: {},
        stepStatus: 'checking', // sätts av useStepSync, sparas inte
        settings: { eveningBeforeHour: 20, evaluationReminder: true },

        currentWeek: () => get().weeks[get().currentWeekId] ?? null,

        ensureCurrentWeek: () => {
          const { weeks, currentWeekId } = get();
          if (currentWeekId && weeks[currentWeekId]) return;
          const week = makeWeek(new Date(), 3);
          set({ weeks: { ...weeks, [week.id]: week }, currentWeekId: week.id });
        },

        addActivity: (data) =>
          updateCurrent((w) => ({
            ...w,
            activities: [...w.activities, { ...data, id: newId(), done: null, skipAuto: false }],
          })),

        updateActivity: (id, data) =>
          updateCurrent((w) => ({
            ...w,
            activities: w.activities.map((a) => (a.id === id ? { ...a, ...data } : a)),
          })),

        removeActivity: (id) =>
          updateCurrent((w) => ({ ...w, activities: w.activities.filter((a) => a.id !== id) })),

        sendWeekToCoach: (weekId) =>
          set((s) => {
            const week = s.weeks[weekId];
            if (!week || week.sentToCoachAt) return s;
            return {
              weeks: {
                ...s.weeks,
                [weekId]: { ...week, sentToCoachAt: new Date().toISOString() },
              },
            };
          }),

        toggleDone: (id) =>
          updateCurrent((w) => ({
            ...w,
            activities: w.activities.map((a) => {
              if (a.id !== id) return a;
              if (a.done) return { ...a, done: null, skipAuto: a.done.source === 'auto' };
              return { ...a, done: { source: 'manual', at: new Date().toISOString() } };
            }),
          })),

        setPlannedSessions: (n) =>
          updateCurrent((w) => ({ ...w, plannedSessions: Math.max(1, Math.min(14, n)) })),

        setSteps: (key, steps) =>
          set((s) => {
            const stepsByDay = { ...s.stepsByDay, [key]: steps };
            // Spara bara de senaste ~60 dagarna
            const cutoff = dateKey(addDays(new Date(), -60));
            for (const k of Object.keys(stepsByDay)) if (k < cutoff) delete stepsByDay[k];
            const cur = s.weeks[s.currentWeekId];
            if (!cur) return { stepsByDay };
            return { stepsByDay, weeks: { ...s.weeks, [cur.id]: autoComplete(cur, stepsByDay) } };
          }),

        updateSettings: (data) => set((s) => ({ settings: { ...s.settings, ...data } })),

        // Avslutar veckan med utvärdering och skapar nästa
        finishWeek: ({ feeling, plannedSessions, keepActivities, raiseGoals }) => {
          const { weeks, currentWeekId } = get();
          const old = weeks[currentWeekId];
          const thisMonday = startOfWeek(new Date());
          const afterOld = addDays(new Date(old.start), 7);
          const nextStart = thisMonday > afterOld ? thisMonday : afterOld;

          const activities = keepActivities
            ? old.activities.map((a) => ({
                ...a,
                id: newId(),
                done: null,
                skipAuto: false,
                stepGoal:
                  raiseGoals && a.mode === 'steps'
                    ? Math.round((a.stepGoal * 1.1) / 100) * 100
                    : a.stepGoal,
              }))
            : [];

          const next = makeWeek(nextStart, plannedSessions, activities);
          set({
            weeks: {
              ...weeks,
              [old.id]: { ...old, evaluation: { feeling, at: new Date().toISOString() } },
              [next.id]: next,
            },
            currentWeekId: next.id,
          });
          return next;
        },

        resetAll: () => set({ weeks: {}, currentWeekId: null, stepsByDay: {} }),
      };
    },
    {
      name: 'rorelseplan',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        weeks: s.weeks,
        currentWeekId: s.currentWeekId,
        stepsByDay: s.stepsByDay,
        settings: s.settings,
      }),
    }
  )
);

// Selektor för aktuell vecka
export const useCurrentWeek = () => useStore((s) => s.weeks[s.currentWeekId] ?? null);
