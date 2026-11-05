import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Icon from '../components/Icon';
import ScreenHeader from '../components/ScreenHeader';
import DayPicker from '../components/DayPicker';
import DoneModePicker from '../components/DoneModePicker';
import ReminderCard from '../components/ReminderCard';
import { Button, Label, Segmented, Stepper } from '../components/ui';
import { ensureNotificationPermission } from '../lib/notifications';
import { weekdayIndex } from '../lib/week';
import { useCurrentWeek, useStore } from '../store/useStore';
import { DIFFICULTIES, colors, radius } from '../theme';

/*
  Skapar ny aktivitet, eller redigerar om ?id= skickas med.
  Från slumpskärmen kommer förifyllda värden som params.
*/
export default function ActivityForm() {
  const params = useLocalSearchParams();
  const week = useCurrentWeek();
  const addActivity = useStore((s) => s.addActivity);
  const updateActivity = useStore((s) => s.updateActivity);
  const removeActivity = useStore((s) => s.removeActivity);
  const settings = useStore((s) => s.settings);

  const existing = params.id ? week?.activities.find((a) => a.id === params.id) : null;
  const editing = !!existing;

  const [title, setTitle] = useState(existing?.title ?? params.title ?? '');
  const [days, setDays] = useState(existing ? [existing.weekday] : [weekdayIndex(new Date())]);
  const [durationMin, setDurationMin] = useState(
    existing?.durationMin ?? (params.durationMin ? Number(params.durationMin) : 30)
  );
  const [difficulty, setDifficulty] = useState(existing?.difficulty ?? params.difficulty ?? 'Medel');
  const [mode, setMode] = useState(existing?.mode ?? params.mode ?? 'manual');
  const [stepGoal, setStepGoal] = useState(
    existing?.stepGoal ?? (params.stepGoal ? Number(params.stepGoal) : 4000)
  );
  const [reminderOn, setReminderOn] = useState(existing ? !!existing.reminder : false);
  const [time, setTime] = useState(existing?.reminder ?? { hour: 17, minute: 30 });
  const [eveningBefore, setEveningBefore] = useState(existing?.reminder?.eveningBefore ?? false);

  if (!week) return null;

  const toggleDay = (i) => {
    if (editing) return setDays([i]); // en aktivitet = en dag
    setDays((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i].sort()));
  };

  const toggleReminder = async (on) => {
    if (on && !(await ensureNotificationPermission())) return;
    setReminderOn(on);
  };

  const save = async () => {
    if (!title.trim()) return Alert.alert('Ge aktiviteten ett namn');
    if (days.length === 0) return Alert.alert('Välj minst en dag');
    const reminderAllowed = reminderOn && (await ensureNotificationPermission());

    const data = {
      title: title.trim(),
      durationMin,
      difficulty,
      mode,
      stepGoal,
      reminder: reminderAllowed ? { ...time, eveningBefore } : null,
    };

    if (editing) updateActivity(existing.id, { ...data, weekday: days[0] });
    else days.forEach((weekday) => addActivity({ ...data, weekday }));
    router.dismissTo('/');
  };

  const remove = () =>
    Alert.alert('Ta bort aktiviteten?', existing.title, [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Ta bort',
        style: 'destructive',
        onPress: () => {
          removeActivity(existing.id);
          router.back();
        },
      },
    ]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader
        title={editing ? 'Redigera aktivitet' : 'Ny aktivitet'}
        right={
          editing && (
            <Pressable accessibilityLabel="Ta bort" onPress={remove} hitSlop={8}>
              <Icon name="trash" color={colors.today} />
            </Pressable>
          )
        }
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.field}>
            <Label>Vad ska du göra?</Label>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="T.ex. Löpning i skogen"
              placeholderTextColor="#8A938D"
              style={styles.input}
              returnKeyType="done"
            />
          </View>

          <View style={styles.field}>
            <Label>{editing ? 'Dag' : 'Dag (välj en eller flera)'}</Label>
            <DayPicker selected={days} onToggle={toggleDay} />
          </View>

          <View style={styles.twoCol}>
            <View style={[styles.field, { flex: 1 }]}>
              <Label>Tid</Label>
              <Stepper
                label="tid"
                value={durationMin}
                onChange={setDurationMin}
                step={5}
                min={5}
                max={240}
                format={(v) => `${v} min`}
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Label>Svårighet</Label>
              <Segmented options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} />
            </View>
          </View>

          <View style={styles.field}>
            <Label>Hur blir den klar?</Label>
            <DoneModePicker
              mode={mode}
              onModeChange={setMode}
              stepGoal={stepGoal}
              onStepGoalChange={setStepGoal}
            />
          </View>

          <ReminderCard
            enabled={reminderOn}
            onToggle={toggleReminder}
            time={time}
            onTimeChange={setTime}
            eveningBefore={eveningBefore}
            onEveningBeforeChange={setEveningBefore}
            eveningBeforeHour={settings.eveningBeforeHour}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Button title={editing ? 'Spara' : `Lägg till i vecka ${week.number}`} onPress={save} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 18 },
  field: { gap: 8 },
  input: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.ink,
  },
  twoCol: { flexDirection: 'row', gap: 12 },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
});
