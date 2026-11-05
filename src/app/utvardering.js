import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Icon from '../components/Icon';
import { Button, ChoiceRow, Label, Stepper } from '../components/ui';
import { WEEKDAYS, addDays, dateKey, dayDate, formatSteps, isWeekOver, isoWeek } from '../lib/week';
import { useCurrentWeek, useStore } from '../store/useStore';
import { colors, radius, type } from '../theme';
import { MOODS } from '../data/moods';

const FEELINGS = [
  { value: 'lätt', label: 'För lätt' },
  { value: 'lagom', label: 'Lagom' },
  { value: 'tufft', label: 'För tufft' },
];

function Stat({ value, label, accent }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, accent && { color: colors.accent }]}>{value}</Text>
      <Text style={type.small}>{label}</Text>
    </View>
  );
}

function ToggleRow({ label, value, onChange }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={{ fontSize: 14, color: colors.ink, flex: 1 }}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.accent, false: colors.lineStrong }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

function resultText(a) {
  if (!a.done) return 'Missad'; // mjukas upp i steg 3
  const mood = MOODS.find((m) => m.value === a.done.mood)?.label;
  if (mood) return mood;
  return a.done.source === 'auto' ? `Auto · ${formatSteps(a.done.steps ?? a.stepGoal)} steg` : 'Manuell';
}

export default function EvaluationScreen() {
  const week = useCurrentWeek();
  const stepsByDay = useStore((s) => s.stepsByDay);
  const finishWeek = useStore((s) => s.finishWeek);

  const [feeling, setFeeling] = useState('lagom');
  const [planned, setPlanned] = useState(week?.plannedSessions ?? 3);
  const [keep, setKeep] = useState(true);
  const [raiseGoals, setRaiseGoals] = useState(false);

  if (!week) return null;

  const activities = [...week.activities].sort((a, b) => a.weekday - b.weekday);
  const done = activities.filter((a) => a.done);
  const minutes = done.reduce((sum, a) => sum + a.durationMin, 0);
  const totalSteps = Array.from({ length: 7 }).reduce(
    (sum, _, i) => sum + (stepsByDay[dateKey(dayDate(week, i))] ?? 0),
    0
  );
  const over = isWeekOver(week);
  const hasStepActivities = activities.some((a) => a.mode === 'steps');

  // Förslag utifrån känslan
  const changeFeeling = (f) => {
    setFeeling(f);
    if (f === 'lätt') {
      setPlanned(week.plannedSessions + 1);
      setRaiseGoals(hasStepActivities);
    } else if (f === 'tufft') {
      setPlanned(Math.max(1, week.plannedSessions - 1));
      setRaiseGoals(false);
    } else {
      setPlanned(week.plannedSessions);
      setRaiseGoals(false);
    }
  };

  const start = () => {
    finishWeek({ feeling, plannedSessions: planned, keepActivities: keep, raiseGoals });
    router.dismissTo('/');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable accessibilityLabel="Tillbaka" onPress={() => router.back()} style={styles.back}>
          <Icon name="back" strokeWidth={2} />
        </Pressable>
        <Text style={type.overline}>
          {over ? `Vecka ${week.number} är slut` : `Vecka ${week.number} pågår`}
        </Text>
        <Text style={[type.display, { fontSize: 32, marginTop: 6 }]}>Hur gick det?</Text>

        <View style={styles.stats}>
          <Stat value={`${done.length}/${week.plannedSessions}`} label="pass klara" accent />
          <Stat
            value={totalSteps >= 10000 ? `${Math.round(totalSteps / 1000)} k` : formatSteps(totalSteps)}
            label="steg totalt"
          />
          <Stat
            value={minutes >= 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60}` : `${minutes} min`}
            label="aktiv tid"
          />
        </View>

        <View style={{ gap: 6, marginTop: 14 }}>
          {activities.map((a) => {
            const ok = !!a.done;
            return (
              <View key={a.id} style={styles.result}>
                <View style={[styles.dot, { backgroundColor: ok ? colors.accent : colors.today }]}>
                  <Icon name={ok ? 'check' : 'close'} size={12} color="#FFFFFF" strokeWidth={3} />
                </View>
                <Text style={{ flex: 1, fontSize: 14, color: colors.ink }} numberOfLines={1}>
                  {WEEKDAYS[a.weekday]} · {a.title}
                </Text>
                <Text style={type.small}>{resultText(a)}</Text>
              </View>
            );
          })}
          {activities.length === 0 && (
            <Text style={type.small}>Inga aktiviteter planerades den här veckan.</Text>
          )}
        </View>

        <View style={{ gap: 8, marginTop: 18 }}>
          <Label>Hur kändes veckan?</Label>
          <ChoiceRow options={FEELINGS} value={feeling} onChange={changeFeeling} />
        </View>

        <View style={styles.adjust}>
          <Text style={styles.adjustTitle}>
            Justera vecka {isoWeek(addDays(new Date(week.start), 7)).number}
          </Text>
          <View style={styles.toggleRow}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: colors.ink, flex: 1 }}>Antal pass</Text>
            <View style={{ width: 150 }}>
              <Stepper label="antal pass" value={planned} onChange={setPlanned} min={1} max={14} />
            </View>
          </View>
          <ToggleRow label="Behåll samma aktiviteter och dagar" value={keep} onChange={setKeep} />
          {keep && hasStepActivities && (
            <ToggleRow label="Höj stegmålen med 10 %" value={raiseGoals} onChange={setRaiseGoals} />
          )}
          {keep && (
            <Text style={type.small}>Du kan flytta, ändra eller ta bort pass i veckovyn efteråt.</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Starta nästa vecka" onPress={start} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 8 },
  back: { width: 44, height: 44, marginLeft: -12, alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', gap: 8, marginTop: 14 },
  stat: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    gap: 2,
  },
  statValue: { fontSize: 24, fontWeight: '800', color: colors.ink },
  result: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  dot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  adjust: {
    marginTop: 18,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    padding: 16,
    gap: 12,
  },
  adjustTitle: { fontSize: 18, fontWeight: '700', color: colors.accentDark },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, borderRadius: radius.lg },
});
