import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Icon from '../components/Icon';
import ScreenHeader from '../components/ScreenHeader';
import { Button, ChoiceRow, Label } from '../components/ui';
import { TIME_OPTIONS, filterSuggestions, shuffle } from '../data/suggestions';
import { formatSteps } from '../lib/week';
import { DIFFICULTIES, colors, radius } from '../theme';


export default function RandomScreen() {
  const [time, setTime] = useState(20);
  const [level, setLevel] = useState('Medel');
  const [index, setIndex] = useState(0);

  // Ny blandning varje gång filtret ändras
  const deck = useMemo(() => shuffle(filterSuggestions(time, level)), [time, level]);
  const s = deck.length ? deck[index % deck.length] : null;

  const changeTime = (t) => {
    setTime(t);
    setIndex(0);
  };
  const changeLevel = (l) => {
    setLevel(l);
    setIndex(0);
  };

  const addToWeek = () =>
    router.replace({
      pathname: '/ny-aktivitet',
      params: {
        title: s.title,
        durationMin: String(s.time),
        difficulty: s.level,
        mode: s.mode,
        stepGoal: String(s.stepGoal ?? 4000),
      },
    });

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title="Slumpa aktivitet" icon="close" />

      <View style={styles.filters}>
        <View style={{ gap: 8 }}>
          <Label>Hur mycket tid har du?</Label>
          <ChoiceRow options={TIME_OPTIONS} value={time} onChange={changeTime} />
        </View>
        <View style={{ gap: 8 }}>
          <Label>Svårighetsgrad</Label>
          <ChoiceRow
            options={DIFFICULTIES.map((d) => ({ value: d, label: d }))}
            value={level}
            onChange={changeLevel}
          />
        </View>
      </View>

      <View style={styles.cardWrap}>
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
        {deck.length > 0 && (
          <Text style={styles.counter}>
            Förslag {(index % deck.length) + 1} av {deck.length} som passar
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <Button
          title="Slumpa igen"
          icon="dice"
          variant="outline"
          style={{ flex: 1 }}
          onPress={() => setIndex((i) => i + 1)}
          disabled={deck.length < 2}
        />
        <Button title="Lägg till" style={{ flex: 1 }} onPress={addToWeek} disabled={!s} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  filters: { paddingHorizontal: 20, paddingTop: 8, gap: 16 },
  cardWrap: { flex: 1, paddingHorizontal: 20, paddingTop: 22 },
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
  counter: { textAlign: 'center', fontSize: 12, color: colors.muted, paddingTop: 8 },
  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 12 },
});
