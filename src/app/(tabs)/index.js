import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Icon from '../../components/Icon';
import { Button } from '../../components/ui';
import {
  WEEKDAYS,
  dateKey,
  dayDate,
  formatSteps,
  formatTime,
  isWeekOver,
  weekRangeLabel,
} from '../../lib/week';
import { useCurrentWeek, useStore } from '../../store/useStore';
import { colors, radius, type } from '../../theme';

function metaText(a, isToday, stepsThatDay) {
  if (a.done?.source === 'auto') return `Du gick ${formatSteps(a.done.steps ?? a.stepGoal)} steg`;
  if (a.done) return 'Du gjorde det';
  const parts = [];
  if (isToday) parts.push('Idag');
  if (a.mode === 'steps') {
    parts.push(
      isToday
        ? `${formatSteps(stepsThatDay)} / ${formatSteps(a.stepGoal)} steg`
        : `Stegmål ${formatSteps(a.stepGoal)}`
    );
  } else {
    parts.push(`${a.durationMin} min · ${a.difficulty}`);
  }
  if (a.reminder) parts.push(`Påminnelse ${formatTime(a.reminder.hour, a.reminder.minute)}`);
  return parts.join(' · ');
}

function ActivityRow({ activity, week, todayKey, stepsByDay, onToggle }) {
  const day = dayDate(week, activity.weekday);
  const key = dateKey(day);
  const isToday = key === todayKey;
  const highlight = isToday && !activity.done;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/ny-aktivitet', params: { id: activity.id } })}
      style={[styles.row, highlight && styles.rowToday]}
      accessibilityHint="Öppnar aktiviteten för redigering"
    >
      <View style={styles.dayCol}>
        <Text style={styles.dayName}>{WEEKDAYS[activity.weekday]}</Text>
        <Text style={styles.dayNum}>{day.getDate()}</Text>
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {activity.title}
        </Text>
        <Text style={type.small} numberOfLines={1}>
          {metaText(activity, isToday, stepsByDay[key] ?? 0)}
        </Text>
      </View>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: !!activity.done }}
        accessibilityLabel={activity.done ? 'Gjort – tryck för att ångra' : 'Markera som gjort'}
        onPress={() => onToggle(activity.id)}
        hitSlop={6}
        style={[styles.check, activity.done && styles.checkDone]}
      >
        {activity.done && <Icon name="check" size={20} color="#FFFFFF" strokeWidth={2.4} />}
      </Pressable>
    </Pressable>
  );
}

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
          Du har rört dig {'\n'}
          {doneCount} gånger
        </Text>

        <View style={styles.progress}>
          {Array.from({ length: segments }).map((_, i) => (
            <View key={i} style={[styles.segment, i < doneCount && { backgroundColor: colors.accent }]} />
          ))}
        </View>

        {over && (
          <Pressable style={styles.overBanner} onPress={() => router.push('/utvardering')}>
            <Text style={styles.overTitle}>Vecka {week.number} är över</Text>
            <Text style={styles.overText}>Se hur veckan kändes och planera nästa →</Text>
          </Pressable>
        )}

        <View style={styles.stepsCard}>
          <View style={styles.stepsIcon}>
            <Icon name="steps" color={colors.mint} />
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.stepsTitle}>Dina steg idag</Text>
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
                  ? 'Vill du att appen räknar dina steg? Tillåt det i inställningarna.'
                  : stepStatus === 'unavailable'
                    ? 'Stegräknaren finns inte på den här enheten'
                    : 'Ansluter till stegräknaren …'}
            </Text>
          </View>
        </View>

        <View style={styles.listHeader}>
          <Text style={type.h2}>Det här vill jag göra</Text>
          <Pressable onPress={() => router.push('/utvardering')} hitSlop={10}>
            <Text style={styles.link}>Titta tillbaka</Text>
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
            <Text style={styles.empty}>
              Inget planerat än. Lägg till något du har lust med, eller slumpa fram en idé.
            </Text>
          )}
          {missing > 0 && activities.length > 0 && (
            <Text style={styles.empty}>Det finns plats för {missing} aktiviteter till, om du vill.</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          title="Förslag på aktivitet"
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  rowToday: { borderWidth: 2, borderColor: colors.today },
  dayCol: { width: 40, alignItems: 'center' },
  dayName: { fontSize: 11, fontWeight: '600', color: colors.muted, textTransform: 'uppercase' },
  dayNum: { fontSize: 20, fontWeight: '700', color: colors.ink },
  rowTitle: { fontSize: 15, fontWeight: '600', color: colors.ink },
  check: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#C3C9BD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: colors.accent, borderColor: colors.accent },
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
