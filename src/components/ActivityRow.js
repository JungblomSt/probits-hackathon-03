import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { dateKey, dayDate, formatSteps, formatTime, WEEKDAYS } from '../lib/week';
import { colors, type } from '../theme';
import Icon from './Icon';

function getActivityMeta(activity, isToday, stepsThatDay) {
  if (activity.done?.source === 'auto') {
    return `Klar automatiskt · ${formatSteps(activity.done.steps ?? activity.stepGoal)} steg`;
  }
  if (activity.done) return 'Markerad klar själv';

  const parts = [];
  if (isToday) parts.push('Idag');
  if (activity.mode === 'steps') {
    parts.push(
      isToday
        ? `${formatSteps(stepsThatDay)} / ${formatSteps(activity.stepGoal)} steg`
        : `Stegmål ${formatSteps(activity.stepGoal)}`,
    );
  } else {
    parts.push(`${activity.durationMin} min · ${activity.difficulty}`);
  }
  if (activity.reminder) {
    parts.push(
      `Påminnelse ${formatTime(activity.reminder.hour, activity.reminder.minute)}`,
    );
  }
  return parts.join(' · ');
}

export default function ActivityRow({ activity, week, todayKey, stepsByDay, onToggle }) {
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
      <View style={styles.details}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {activity.title}
        </Text>
        <Text style={type.small} numberOfLines={1}>
          {getActivityMeta(activity, isToday, stepsByDay[key] ?? 0)}
        </Text>
      </View>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: !!activity.done }}
        accessibilityLabel={activity.done ? 'Klar – tryck för att ångra' : 'Markera som klar'}
        onPress={() => onToggle(activity.id)}
        hitSlop={6}
        style={[styles.check, activity.done && styles.checkDone]}
      >
        {activity.done && <Icon name="check" size={20} color="#FFFFFF" strokeWidth={2.4} />}
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  details: { flex: 1, gap: 3 },
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
});
