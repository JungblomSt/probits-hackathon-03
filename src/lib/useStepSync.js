import { Pedometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { useStore } from '../store/useStore';
import { addDays, dateKey, startOfDay } from './week';

/*
  Läser stegräknaren och sparar steg per dag i storen.
  Storen bockar själv av stegaktiviteter när målet nås.

  iOS:     getStepCountAsync kan läsa historik, så vi hämtar varje dag i veckan.
  Android: bara watchStepCount finns, som räknar steg medan appen är igång.
           Stegen läggs på dagens summa. (Fullständig historik kräver Health Connect.)
*/
export function useStepSync() {
  const setSteps = useStore((s) => s.setSteps);
  const weekStart = useStore((s) => s.weeks[s.currentWeekId]?.start);
  const [status, setStatus] = useState('checking'); // checking | ok | unavailable | denied
  const lastSeen = useRef(null);

  // Gör statusen tillgänglig för skärmarna (sparas inte)
  useEffect(() => {
    useStore.setState({ stepStatus: status });
  }, [status]);

  // Behörighet och tillgänglighet
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const available = await Pedometer.isAvailableAsync();
        if (!available) return alive && setStatus('unavailable');
        const perm = await Pedometer.requestPermissionsAsync();
        if (alive) setStatus(perm.granted ? 'ok' : 'denied');
      } catch {
        if (alive) setStatus('unavailable');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // iOS: läs veckans dagar när appen öppnas och varje minut medan den är aktiv
  useEffect(() => {
    if (status !== 'ok' || Platform.OS !== 'ios' || !weekStart) return;

    const readWeek = async () => {
      const now = new Date();
      const monday = new Date(weekStart);
      for (let i = 0; i < 7; i++) {
        const dayStart = addDays(monday, i);
        if (dayStart > now) break;
        const dayEnd = addDays(dayStart, 1);
        try {
          const { steps } = await Pedometer.getStepCountAsync(dayStart, dayEnd < now ? dayEnd : now);
          setSteps(dateKey(dayStart), steps);
        } catch {
          // Ingen data för dagen, hoppa över
        }
      }
    };

    readWeek();
    const interval = setInterval(readWeek, 60 * 1000);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && readWeek());
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [status, weekStart, setSteps]);

  // Android: räkna steg live medan appen är öppen
  useEffect(() => {
    if (status !== 'ok' || Platform.OS !== 'android') return;
    lastSeen.current = null;
    const sub = Pedometer.watchStepCount(({ steps }) => {
      const prev = lastSeen.current ?? 0;
      lastSeen.current = steps;
      const delta = Math.max(0, steps - prev);
      if (delta === 0) return;
      const key = dateKey(startOfDay(new Date()));
      const today = useStore.getState().stepsByDay[key] ?? 0;
      setSteps(key, today + delta);
    });
    return () => sub.remove();
  }, [status, setSteps]);

  return status;
}
