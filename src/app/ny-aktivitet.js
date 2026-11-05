import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Icon from '../components/Icon';
import ScreenHeader from '../components/ScreenHeader';
import { Button, Card, Label, Segmented, Stepper } from '../components/ui';
import { askNotificationPermission } from '../lib/notifications';
import { WEEKDAY_LETTERS, WEEKDAYS, formatSteps, formatTime, weekdayIndex } from '../lib/week';
import { useCurrentWeek, useStore } from '../store/useStore';
import { DIFFICULTIES, colors, radius, type } from '../theme';

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
  const [days, setDays] = useState(
    existing ? [existing.weekday] : [weekdayIndex(new Date())]
  );
  const [durationMin, setDurationMin] = useState(
    existing?.durationMin ?? (params.durationMin ? Number(params.durationMin) : 30)
  );
  const [difficulty, setDifficulty] = useState(existing?.difficulty ?? params.difficulty ?? 'Medel');
  const [mode, setMode] = useState(existing?.mode ?? params.mode ?? 'manual');
  const [stepGoal, setStepGoal] = useState(
    existing?.stepGoal ?? (params.stepGoal ? Number(params.stepGoal) : 4000)
  );
  const [reminderOn, setReminderOn] = useState(existing ? !!existing.reminder : true);
  const [time, setTime] = useState(
    existing?.reminder ?? { hour: 17, minute: 30 }
  );
  const [eveningBefore, setEveningBefore] = useState(existing?.reminder?.eveningBefore ?? false);
  const [showIosPicker, setShowIosPicker] = useState(false);

  if (!week) return null;

  const toggleDay = (i) => {
    if (editing) return setDays([i]); // en aktivitet = en dag
    setDays((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i].sort()));
  };

  const pickerDate = () => {
    const d = new Date();
    d.setHours(time.hour, time.minute, 0, 0);
    return d;
  };

  const onPickTime = (_event, date) => {
    if (date) setTime({ hour: date.getHours(), minute: date.getMinutes() });
  };

  const openTimePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({ value: pickerDate(), mode: 'time', is24Hour: true, onChange: onPickTime });
    } else {
      setShowIosPicker((v) => !v);
    }
  };

  const toggleReminder = async (on) => {
    if (on && !(await askNotificationPermission())) {
      Alert.alert('Notiser är avstängda', 'Slå på notiser för Rörelseplan i telefonens inställningar.');
      return;
    }
    setReminderOn(on);
  };

  const save = async () => {
    if (!title.trim()) return Alert.alert('Ge aktiviteten ett namn');
    if (days.length === 0) return Alert.alert('Välj minst en dag');
    if (reminderOn) await askNotificationPermission();

    const data = {
      title: title.trim(),
      durationMin,
      difficulty,
      mode,
      stepGoal,
      reminder: reminderOn ? { ...time, eveningBefore } : null,
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
            <View style={styles.days}>
              {WEEKDAY_LETTERS.map((letter, i) => {
                const on = days.includes(i);
                return (
                  <Pressable
                    key={i}
                    accessibilityLabel={WEEKDAYS[i]}
                    accessibilityState={{ selected: on }}
                    onPress={() => toggleDay(i)}
                    style={[styles.day, on && styles.dayOn]}
                  >
                    <Text style={[styles.dayText, on && { color: '#FFFFFF' }]}>{letter}</Text>
                  </Pressable>
                );
              })}
            </View>
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
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: mode === 'steps' }}
              onPress={() => setMode('steps')}
              style={[styles.option, mode === 'steps' && styles.optionOn]}
            >
              <View style={[styles.radio, mode === 'steps' && styles.radioOn]} />
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={styles.optionTitle}>Automatiskt via stegräknaren</Text>
                <Text style={type.small}>Markeras klar när du nått stegmålet den dagen.</Text>
                {mode === 'steps' && (
                  <View style={{ marginTop: 4 }}>
                    <Stepper
                      label="stegmål"
                      value={stepGoal}
                      onChange={setStepGoal}
                      step={500}
                      min={500}
                      max={40000}
                      format={(v) => `${formatSteps(v)} steg`}
                    />
                  </View>
                )}
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: mode === 'manual' }}
              onPress={() => setMode('manual')}
              style={[styles.option, mode === 'manual' && styles.optionOn]}
            >
              <View style={[styles.radio, mode === 'manual' && styles.radioOn]} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.optionTitle}>Jag bockar av själv</Text>
                <Text style={type.small}>För yoga, simning, styrka …</Text>
              </View>
            </Pressable>
          </View>

          <Card style={{ gap: 12 }}>
            <View style={styles.reminderHead}>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <Icon name="bell" size={20} color={colors.today} />
                <Text style={styles.optionTitle}>Påminnelse</Text>
              </View>
              <Switch
                value={reminderOn}
                onValueChange={toggleReminder}
                trackColor={{ true: colors.accent, false: colors.lineStrong }}
                thumbColor="#FFFFFF"
              />
            </View>
            {reminderOn && (
              <>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  <Pressable onPress={openTimePicker} style={[styles.pill, styles.pillTime]}>
                    <Text style={styles.pillTimeText}>{formatTime(time.hour, time.minute)}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setEveningBefore((v) => !v)}
                    accessibilityState={{ selected: eveningBefore }}
                    style={[styles.pill, eveningBefore && styles.pillOn]}
                  >
                    <Text style={[styles.pillText, eveningBefore && { color: colors.accentDark }]}>
                      {eveningBefore ? '✓ ' : '+ '}Kvällen innan {formatTime(settings.eveningBeforeHour, 0)}
                    </Text>
                  </Pressable>
                </View>
                {showIosPicker && Platform.OS === 'ios' && (
                  <DateTimePicker value={pickerDate()} mode="time" display="spinner" onChange={onPickTime} locale="sv-SE" />
                )}
              </>
            )}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Button
          title={editing ? 'Spara' : `Lägg till i vecka ${week.number}`}
          onPress={save}
        />
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
  days: { flexDirection: 'row', gap: 6 },
  day: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  dayText: { fontSize: 13, fontWeight: '600', color: colors.ink },
  twoCol: { flexDirection: 'row', gap: 12 },
  option: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.card,
  },
  optionOn: { borderWidth: 2, borderColor: colors.accent },
  optionTitle: { fontSize: 15, fontWeight: '600', color: colors.ink },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#A9B0A3', marginTop: 1 },
  radioOn: { borderWidth: 6, borderColor: colors.accent },
  reminderHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: colors.soft },
  pillOn: { backgroundColor: colors.accentSoft },
  pillText: { fontSize: 14, color: colors.ink },
  pillTime: { backgroundColor: colors.todaySoft },
  pillTimeText: { fontSize: 14, fontWeight: '600', color: colors.todayText },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
});
