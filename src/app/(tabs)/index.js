import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ActivityRow from '../../components/ActivityRow';
import Icon from '../../components/Icon';
import { Button } from '../../components/ui';
import {
  dateKey,
  dayDate,
  formatSteps,
  isWeekOver,
  weekRangeLabel,
} from '../../lib/week';
import { useCurrentWeek, useStore } from '../../store/useStore';
import { colors, radius, type } from '../../theme';

export default function WeekScreen() {
  const week = useCurrentWeek();
  const stepsByDay = useStore((s) => s.stepsByDay);
  const stepStatus = useStore((s) => s.stepStatus);
  const toggleDone = useStore((s) => s.toggleDone);

  if (!week) return null;

  const todayKey = dateKey(new Date());
  const activities = [...week.activities].sort((a, b) => a.weekday - b.weekday);
  const doneCount = activities.filter((a) => a.done).length;
  const segments = Math.max(week.plannedSessions, activities.length);
  const missing = week.plannedSessions - activities.length;
  const over = isWeekOver(week);

  const todaySteps = stepsByDay[todayKey] ?? 0;
  const todayGoals = activities
    .filter((a) => a.mode === 'steps' && dateKey(dayDate(week, a.weekday)) === todayKey)
    .map((a) => a.stepGoal);
  const goal = todayGoals.length ? Math.max(...todayGoals) : null;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={type.overline}>
          Vecka {week.number} · {weekRangeLabel(week)}
        </Text>
        <Text style={[type.display, { marginTop: 10 }]}>
          {doneCount} av {week.plannedSessions} pass{'\n'}klara
        </Text>

        <View style={styles.progress}>
          {Array.from({ length: segments }).map((_, i) => (
            <View key={i} style={[styles.segment, i < doneCount && { backgroundColor: colors.accent }]} />
          ))}
        </View>

        {over && (
          <Pressable style={styles.overBanner} onPress={() => router.push('/utvardering')}>
            <Text style={styles.overTitle}>Vecka {week.number} är slut</Text>
            <Text style={styles.overText}>Utvärdera och planera nästa vecka →</Text>
          </Pressable>
        )}

        <View style={styles.stepsCard}>
          <View style={styles.stepsIcon}>
            <Icon name="steps" color={colors.mint} />
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.stepsTitle}>Steg idag</Text>
              <Text style={styles.stepsValue}>
                {formatSteps(todaySteps)}
                {goal ? ` / ${formatSteps(goal)}` : ''}
              </Text>
            </View>
            {goal && (
              <View style={styles.stepsTrack}>
                <View style={[styles.stepsFill, { width: `${Math.min(100, (todaySteps / goal) * 100)}%` }]} />
              </View>
            )}
            <Text style={styles.stepsNote}>
              {stepStatus === 'ok'
                ? 'Synkas från telefonens stegräknare'
                : stepStatus === 'denied'
                  ? 'Ge appen tillgång till rörelsedata i inställningarna'
                  : stepStatus === 'unavailable'
                    ? 'Stegräknaren finns inte på den här enheten'
                    : 'Ansluter till stegräknaren …'}
            </Text>
          </View>
        </View>

        <View style={styles.listHeader}>
          <Text style={type.h2}>Veckans plan</Text>
          <Pressable onPress={() => router.push('/utvardering')} hitSlop={10}>
            <Text style={styles.link}>Utvärdera</Text>
          </Pressable>
        </View>

        <View style={{ gap: 8 }}>
          {activities.map((a) => (
            <ActivityRow
              key={a.id}
              activity={a}
              week={week}
              todayKey={todayKey}
              stepsByDay={stepsByDay}
              onToggle={toggleDone}
            />
          ))}
          {activities.length === 0 && (
            <Text style={styles.empty}>Inga aktiviteter än. Lägg till en eller slumpa fram ett förslag.</Text>
          )}
          {missing > 0 && activities.length > 0 && (
            <Text style={styles.empty}>
              Ditt mål är {week.plannedSessions} pass – planera {missing} till.
            </Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          title="Slumpa aktivitet"
          icon="dice"
          variant="outline"
          style={{ flex: 1, height: 52 }}
          onPress={() => router.push('/slumpa')}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Lägg till aktivitet"
          onPress={() => router.push('/ny-aktivitet')}
          style={styles.fab}
        >
          <Icon name="plus" color="#FFFFFF" strokeWidth={2.2} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 24 },
  progress: { flexDirection: 'row', gap: 6, marginTop: 14 },
  segment: { flex: 1, height: 10, borderRadius: 5, backgroundColor: colors.lineStrong },
  overBanner: {
    marginTop: 16,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.todaySoft,
  },
  overTitle: { fontSize: 15, fontWeight: '700', color: colors.todayText },
  overText: { fontSize: 14, color: colors.todayText, marginTop: 2 },
  stepsCard: {
    marginTop: 16,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepsIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.dark2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  stepsValue: { color: colors.onDark, fontSize: 14 },
  stepsTrack: { height: 6, borderRadius: 3, backgroundColor: colors.dark3 },
  stepsFill: { height: 6, borderRadius: 3, backgroundColor: colors.mint },
  stepsNote: { color: '#B5C1B9', fontSize: 12 },
  listHeader: {
    marginTop: 20,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  link: { color: colors.accent, fontSize: 14, fontWeight: '600' },
  empty: { ...type.small, fontSize: 14, textAlign: 'center', paddingVertical: 12 },
  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.bg,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
