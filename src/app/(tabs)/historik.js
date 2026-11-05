import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/ui';
import { dateKey, dayDate, formatSteps, weekRangeLabel } from '../../lib/week';
import { useStore } from '../../store/useStore';
import { colors, type } from '../../theme';

const FEELING_LABEL = { lätt: 'För lätt', lagom: 'Lagom', tufft: 'För tufft' };

export default function HistoryScreen() {
  const weeks = useStore((s) => s.weeks);
  const currentWeekId = useStore((s) => s.currentWeekId);
  const stepsByDay = useStore((s) => s.stepsByDay);
  const sendWeekToCoach = useStore((s) => s.sendWeekToCoach);

  const list = Object.values(weeks).sort((a, b) => (a.start < b.start ? 1 : -1));

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={type.display}>Historik</Text>
        <Text style={type.small}>Skickningen simuleras; ingen data lämnar enheten.</Text>
        {list.map((w) => {
          const done = w.activities.filter((a) => a.done).length;
          const pct = Math.min(1, done / Math.max(1, w.plannedSessions));
          const steps = Array.from({ length: 7 }).reduce(
            (sum, _, i) => sum + (stepsByDay[dateKey(dayDate(w, i))] ?? 0),
            0
          );
          return (
            <View key={w.id} style={styles.card}>
              <View style={styles.cardHead}>
                <Text style={styles.week}>Vecka {w.number}</Text>
                <Text style={type.small}>{weekRangeLabel(w)}</Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${pct * 100}%` }]} />
              </View>
              <Text style={type.small}>
                {done} av {w.plannedSessions} pass
                {steps > 0 ? ` · ${formatSteps(steps)} steg` : ''}
                {w.evaluation ? ` · ${FEELING_LABEL[w.evaluation.feeling]}` : ''}
                {w.id === currentWeekId ? ' · pågår' : ''}
              </Text>
              {w.sentToCoachAt ? (
                <Text style={styles.sentStatus}>
                  ✓ Skickad till coach · {new Date(w.sentToCoachAt).toLocaleDateString('sv-SE')}
                </Text>
              ) : (
                <Button
                  title="Skicka till coach"
                  variant="outline"
                  onPress={() => sendWeekToCoach(w.id)}
                />
              )}
            </View>
          );
        })}
        {list.length <= 1 && (
          <Text style={[type.small, { textAlign: 'center', marginTop: 8 }]}>
            Här samlas dina veckor när du har utvärderat dem.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 10 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    gap: 8,
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  week: { fontSize: 17, fontWeight: '700', color: colors.ink },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.lineStrong },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.accent },
  sentStatus: { color: colors.accentDark, fontSize: 13, fontWeight: '600' },
});
