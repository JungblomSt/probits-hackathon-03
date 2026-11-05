import { Pressable, StyleSheet, Text, View } from 'react-native';

import { WEEKDAY_LETTERS, WEEKDAYS } from '../lib/week';
import { colors } from '../theme';

// Rad med veckodagar. selected = lista med valda dagar (0 = måndag)
export default function DayPicker({ selected, onToggle }) {
  return (
    <View style={styles.days}>
      {WEEKDAY_LETTERS.map((letter, i) => {
        const on = selected.includes(i);
        return (
          <Pressable
            key={i}
            accessibilityLabel={WEEKDAYS[i]}
            accessibilityState={{ selected: on }}
            onPress={() => onToggle(i)}
            style={[styles.day, on && styles.dayOn]}
          >
            <Text style={[styles.dayText, on && { color: '#FFFFFF' }]}>{letter}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
});