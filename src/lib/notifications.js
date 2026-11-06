import * as Notifications from 'expo-notifications';
import { Alert, Linking, Platform } from 'react-native';

import { addDays, dayDate, formatTime } from './week';

const CHANNEL_ID = 'paminnelser';

// Visa notiser även när appen är öppen
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function setupNotificationChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Påminnelser',
    importance: Notifications.AndroidImportance.HIGH,
  });
}

export async function hasNotificationPermission() {
  const { granted } = await Notifications.getPermissionsAsync();
  return granted;
}

export async function askNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const { granted } = await Notifications.requestPermissionsAsync();
  return granted;
}

// Frågar om lov och förklarar för användaren om notis är avstängda
export async function ensureNotificationPermission() {
  const ok = await askNotificationPermission();
  if (!ok) {
    Alert.alert('Notiser är avstängda', 'Slå på notiser för Rörelseplan i telefonens inställningar.', [
      { text: 'Inte nu', style: 'cancel' },
      { text: 'Öppna inställningar', onPress: () => Linking.openSettings() },
    ]);
  }
  return ok;
}

function at(date, hour, minute) {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}

/*
  Bygger om alla schemalagda notiser utifrån aktuell vecka.
  Enklast och säkrast: rensa allt och lägg upp på nytt varje gång veckan ändras.
*/
export async function syncReminders(week, settings) {
  if (!week) return;
  if (!(await hasNotificationPermission())) return;

  await Notifications.cancelAllScheduledNotificationsAsync();
  const now = new Date();
  const jobs = [];

  const schedule = (date, title, body) => {
    if (date <= now) return;
    jobs.push(
      Notifications.scheduleNotificationAsync({
        content: { title, body },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date,
          channelId: CHANNEL_ID,
        },
      })
    );
  };

  for (const a of week.activities) {
    if (!a.reminder || a.done) continue;
    const day = dayDate(week, a.weekday);
    const { hour, minute, eveningBefore } = a.reminder;

    schedule(
      at(day, hour, minute),
      `Lust för ${a.title.toLowerCase()}?`,
      a.mode === 'steps'
        ? `Om du vill: ${a.stepGoal} steg idag. Appen bockar av när du är där.`
        : `${a.durationMin} min · ${a.difficulty}. Bocka av när du har gjort det.`
    );

    if (eveningBefore) {
      schedule(
        at(addDays(day, -1), settings.eveningBeforeHour, 0),
        `Imorgon: ${a.title}`,
        `Påminnelse kl ${formatTime(hour, minute)}. Förbered gärna det du behöver redan ikväll.`
      );
    }
  }

  // Söndag kväll: dags att utvärdera veckan
  if (settings.evaluationReminder) {
    schedule(
      at(dayDate(week, 6), 19, 0),
      `Vecka ${week.number} går snart mot sitt slut`,
      'Hur har veckan känts? Titta tillbaka och planera nästa.'
    );
  }

  await Promise.all(jobs);
}
