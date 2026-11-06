import { StyleSheet, Text, View } from 'react-native';

import { formatSteps } from '../lib/week';
import { colors, radius } from '../theme';
import Icon from './Icon';

// Mörkt kort med ett aktivitetsförslag. suggestion = null visar ett tomt läge
export default function SuggestionCard({ suggestion: s }) {
  return (
    <View style={styles.card}>
      {s ? (
        <>
          <View style={styles.tags}>
            <Text style={styles.tag}>{s.time === 45 ? '45+' : s.time} min</Text>
            <Text style={styles.tag}>{s.level}</Text>
            <Text style={[styles.tag, { color: colors.mint }]}>
              {s.mode === 'steps' ? 'Stegräknare' : 'Bocka av själv'}
            </Text>
          </View>
          <Text style={styles.title}>{s.title}</Text>
          <Text style={styles.text}>{s.text}</Text>
          <View style={{ flex: 1 }} />
          {s.mode === 'steps' && (
            <View style={styles.extra}>
              <Icon name="steps" size={18} color={colors.mint} />
              <Text style={styles.extraText}>Mål ≈ {formatSteps(s.stepGoal)} steg</Text>
            </View>
          )}
        </>
      ) : (
        <Text style={styles.text}>Inga förslag för den kombinationen. Prova en annan.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: radius.xl, backgroundColor: colors.ink, padding: 24, gap: 14 },
  tags: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.dark2,
    color: colors.onDark,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },
  title: { fontSize: 36, lineHeight: 40, fontWeight: '800', color: '#FFFFFF' },
  text: { fontSize: 15, lineHeight: 22, color: colors.onDark },
  extra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.dark3,
  },
  extraText: { fontSize: 14, color: colors.onDark },
});
