import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { setupNotificationChannel, syncReminders } from '../lib/notifications';
import { useStepSync } from '../lib/useStepSync';
import { useCurrentWeek, useStore } from '../store/useStore';
import { colors } from '../theme';

function useHydrated() {
  const [hydrated, setHydrated] = useState(useStore.persist.hasHydrated());
  useEffect(() => useStore.persist.onFinishHydration(() => setHydrated(true)), []);
  return hydrated;
}

// Körs när datan är laddad: steg, notiser och veckohantering
function AppEffects() {
  const ensureCurrentWeek = useStore((s) => s.ensureCurrentWeek);
  const week = useCurrentWeek();
  const settings = useStore((s) => s.settings);

  useEffect(() => {
    ensureCurrentWeek();
    setupNotificationChannel();
  }, [ensureCurrentWeek]);

  useStepSync();

  // Lägg om notiserna när veckan eller inställningarna ändras
  useEffect(() => {
    const t = setTimeout(() => syncReminders(week, settings).catch(() => {}), 500);
    return () => clearTimeout(t);
  }, [week, settings]);

  return null;
}

export default function RootLayout() {
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppEffects />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="ny-aktivitet" options={{ presentation: 'modal' }} />
        <Stack.Screen name="slumpa" options={{ presentation: 'modal' }} />
        <Stack.Screen name="utvardering" />
      </Stack>
    </SafeAreaProvider>
  );
}
