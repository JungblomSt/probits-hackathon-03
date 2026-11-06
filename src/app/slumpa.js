import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenHeader from '../components/ScreenHeader';
import SuggestionCard from '../components/SuggestionCard';
import { Button, ChoiceRow, Label } from '../components/ui';
import { TIME_OPTIONS, filterSuggestions, shuffle } from '../data/suggestions';
import { DIFFICULTIES, colors } from '../theme';

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
      <ScreenHeader title="Förslag på aktivitet" icon="close" />

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
        <SuggestionCard suggestion={s} />
        {deck.length > 0 && (
          <Text style={styles.counter}>
            Förslag {(index % deck.length) + 1} av {deck.length} som passar
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <Button
          title="Nytt förslag"
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
  counter: { textAlign: 'center', fontSize: 12, color: colors.muted, paddingTop: 8 },
  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 12 },
});
