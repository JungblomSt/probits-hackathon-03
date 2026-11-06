import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { MOODS } from '../data/moods';
import { useCurrentWeek, useStore } from '../store/useStore';
import { colors, radius, type } from '../theme';

// Visas när en aktivitet precis blivit klar (manuellt eller automatiskt)
export default function CompletionSheet() {
  const id = useStore((s) => s.justCompleted);
  const week = useCurrentWeek();
  const setMood = useStore((s) => s.setMood);
  const dismiss = useStore((s) => s.dismissCompleted);

  const activity = week?.activities.find((a) => a.id === id);

  const choose = (mood) => {
    setMood(id, mood);
    console.log(useStore.getState().currentWeek().activities); // tillfälligt
    dismiss();
  };

  return (
    <Modal visible={!!activity} transparent animationType="slide" onRequestClose={dismiss}>
      <Pressable style={styles.backdrop} onPress={dismiss} accessibilityLabel="Stäng">
        {/* Tom onPress hindrar att tryck på kortet stänger det */}
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={type.overline}>{activity?.title}</Text>
          <Text style={styles.title}>Fint att du rörde på dig.</Text>

          <Text style={type.label}>Hur kändes det?</Text>
          <View style={styles.moods}>
            {MOODS.map((m) => (
              <Pressable
                key={m.value}
                accessibilityRole="button"
                onPress={() => choose(m.value)}
                style={({ pressed }) => [styles.mood, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.moodText}>{m.label}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable accessibilityRole="button" onPress={dismiss} style={styles.skip}>
            <Text style={styles.skipText}>Inte nu</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(21, 32, 26, 0.4)' },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 24,
    paddingBottom: 32,
    gap: 14,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.ink },
  moods: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mood: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.soft,
  },
  moodText: { fontSize: 15, fontWeight: '600', color: colors.ink },
  skip: { alignSelf: 'center', padding: 12 },
  skipText: { fontSize: 14, color: colors.muted },
});
