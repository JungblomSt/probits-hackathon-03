import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Label, Stepper, SwitchRow } from '../../components/ui';
import { askNotificationPermission, hasNotificationPermission } from '../../lib/notifications';
import { formatTime } from '../../lib/week';
import { useStore } from '../../store/useStore';
import { colors, type } from '../../theme';

const STEP_STATUS = {
  checking: 'Kontrollerar …',
  ok: 'Ansluten',
  denied: 'Ingen behörighet',
  unavailable: 'Finns inte på enheten',
};

export default function SettingsScreen() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const stepStatus = useStore((s) => s.stepStatus);
  const resetAll = useStore((s) => s.resetAll);
  const ensureCurrentWeek = useStore((s) => s.ensureCurrentWeek);
  const [notifOk, setNotifOk] = useState(null);

  useFocusEffect(
    useCallback(() => {
      hasNotificationPermission().then(setNotifOk);
    }, [])
  );

  const enableNotifications = async () => {
    const ok = await askNotificationPermission();
    setNotifOk(ok);
    if (!ok) Linking.openSettings();
  };

  const confirmReset = () =>
    Alert.alert('Rensa all data?', 'Alla veckor och aktiviteter tas bort.', [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Rensa',
        style: 'destructive',
        onPress: () => {
          resetAll();
          ensureCurrentWeek();
        },
      },
    ]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={type.display}>Inställningar</Text>

        <Card style={{ gap: 12 }}>
          <Label>Behörigheter</Label>
          <View style={styles.row}>
            <Text style={styles.text}>Stegräknare</Text>
            <Text style={type.small}>{STEP_STATUS[stepStatus]}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.text}>Notiser</Text>
            <Text style={type.small}>{notifOk === null ? '…' : notifOk ? 'På' : 'Av'}</Text>
          </View>
          {(notifOk === false || stepStatus === 'denied') && (
            <Button title="Öppna behörigheter" variant="outline" onPress={enableNotifications} />
          )}
        </Card>

        <Card style={{ gap: 12 }}>
          <Label>Påminnelser</Label>
          <View style={styles.row}>
            <Text style={[styles.text, { flex: 1 }]}>Kvällen innan, klockan</Text>
            <View style={{ width: 150 }}>
              <Stepper
                label="timme"
                value={settings.eveningBeforeHour}
                onChange={(h) => updateSettings({ eveningBeforeHour: h })}
                min={16}
                max={23}
                format={(h) => formatTime(h, 0)}
              />
            </View>
          </View>
          <SwitchRow
            label="Påminn om utvärdering söndag 19:00"
            labelStyle={{ fontSize: 15 }}
            value={settings.evaluationReminder}
            onChange={(v) => updateSettings({ evaluationReminder: v })}
          />
        </Card>

        <Button title="Rensa all data" variant="outline" onPress={confirmReset} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 14 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  text: { fontSize: 15, color: colors.ink },
});
