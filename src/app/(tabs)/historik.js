import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/ui';
import { availableMonths, buildMonthReport, monthKey, monthLabel } from '../../lib/coachReport';
import { dateKey, dayDate, formatSteps, weekRangeLabel } from '../../lib/week';
import { useStore } from '../../store/useStore';
import { colors, radius, type } from '../../theme';

const FEELING_LABEL = { lätt: 'För lätt', lagom: 'Lagom', tufft: 'För tufft' };

function formatDuration(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m}` : `${h} h`;
}

function CoachCard({ weeks, stepsByDay }) {
  const months = useMemo(() => availableMonths(weeks), [weeks]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [greeting, setGreeting] = useState('');

  const selected = months.find((m) => monthKey(m) === selectedKey) ?? months[0];
  if (!selected) return null;

  const report = buildMonthReport(weeks, stepsByDay, selected);
  const { summary } = report;

  const share = async () => {
    try {
      await Share.share({
        title: `Rörelseplan – ${monthLabel(selected)}`,
        message: report.text(greeting),
      });
    } catch (e) {
      Alert.alert('Kunde inte dela', 'Försök igen om en stund.');
    }
  };

  return (
    <View style={styles.coachCard}>
      <Text style={styles.coachOverline}>Dela med din coach</Text>
      <Text style={styles.coachTitle}>{monthLabel(selected)}</Text>

      {months.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {months.map((m) => {
            const active = monthKey(m) === monthKey(selected);
            return (
              <Pressable
                key={monthKey(m)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setSelectedKey(monthKey(m))}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && { color: colors.ink }]}>{monthLabel(m)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{summary.done}</Text>
          <Text style={styles.statLabel}>gånger du rört dig</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatDuration(summary.activeMin)}</Text>
          <Text style={styles.statLabel}>tid i rörelse</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {summary.steps >= 1000 ? `${Math.round(summary.steps / 1000)} k` : summary.steps}
          </Text>
          <Text style={styles.statLabel}>steg</Text>
        </View>
      </View>

      <TextInput
        value={greeting}
        onChangeText={setGreeting}
        placeholder="Vill du berätta något för coachen? (valfritt)"
        placeholderTextColor={colors.onDark}
        multiline
        style={styles.input}
      />

      <Button title="Dela" icon="share" variant="outline" onPress={share} />
      <Text style={styles.coachHint}>
        Du väljer själv hur du skickar, till exempel sms eller mejl. Inget delas förrän du trycker.
      </Text>
    </View>
  );
}

export default function HistoryScreen() {
  const weeks = useStore((s) => s.weeks);
  const currentWeekId = useStore((s) => s.currentWeekId);
  const stepsByDay = useStore((s) => s.stepsByDay);
  const sendWeekToCoach = useStore((s) => s.sendWeekToCoach);

  const list = Object.values(weeks).sort((a, b) => (a.start < b.start ? 1 : -1));

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={type.display}>Historik</Text>

        <CoachCard weeks={weeks} stepsByDay={stepsByDay} />

        <Text style={[type.h2, { marginTop: 8 }]}>Veckor</Text>
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
                {done} gånger
                {steps > 0 ? ` · ${formatSteps(steps)} steg` : ''}
                {w.evaluation ? ` · ${FEELING_LABEL[w.evaluation.feeling]}` : ''}
                {w.id === currentWeekId ? ' · pågår' : ''}
              </Text>
              {w.sentToCoachAt ? (
                <Text style={styles.sentStatus}>
                  ✓ Skickad till coach · {new Date(w.sentToCoachAt).toLocaleDateString('sv-SE')}
                </Text>
              ) : (
                <Button title="Skicka till coach" onPress={() => sendWeekToCoach(w.id)} />
              )}
            </View>
          );
        })}
        {list.length <= 1 && (
          <Text style={[type.small, { textAlign: 'center', marginTop: 8 }]}>
            Här samlas dina veckor när du har tittat tillbaka på dem.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 10 },
  coachCard: {
    backgroundColor: colors.ink,
    borderRadius: radius.lg,
    padding: 16,
    gap: 12,
  },
  coachOverline: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.mint,
  },
  coachTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginTop: -6 },
  chips: { gap: 8 },
  chip: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.dark3,
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.mint, borderColor: colors.mint },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.onDark },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, backgroundColor: colors.dark2, borderRadius: radius.md, padding: 10 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  statLabel: { fontSize: 12, color: colors.onDark, marginTop: 2 },
  input: {
    minHeight: 64,
    borderRadius: radius.md,
    backgroundColor: colors.dark2,
    color: '#FFFFFF',
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  coachHint: { fontSize: 12, color: colors.onDark, textAlign: 'center' },
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
