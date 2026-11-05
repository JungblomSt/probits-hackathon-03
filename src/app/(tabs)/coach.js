import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Icon from '../../components/Icon';
import { Button, Card } from '../../components/ui';
import { useStore } from '../../store/useStore';
import { colors, radius, type } from '../../theme';

export default function CoachScreen() {
  const weeks = useStore((state) => state.weeks);
  const sharedWeeks = Object.values(weeks).filter((week) => week.sentToCoachAt);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Icon name="chat" color={colors.accent} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.coachName}>Din hälsocoach</Text>
          <Text style={type.small}>Professionellt stöd för din träning</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.messages}>
        <Text style={styles.dateLabel}>DIN COACHCHATT</Text>
        <View style={styles.coachMessage}>
          <Text style={styles.messageText}>
            Hej! Här kommer du kunna prata med en hälsocoach om dina träningsvanor och
            veckans aktiviteter.
          </Text>
        </View>

        <Card style={styles.historyCard}>
          <Text style={styles.historyTitle}>Delad träningshistorik</Text>
          <Text style={type.small}>
            {sharedWeeks.length
              ? `${sharedWeeks.length} ${sharedWeeks.length === 1 ? 'vecka' : 'veckor'} markerade som skickade till coach.`
              : 'Skicka en vecka från Historik så visas den här.'}
          </Text>
          <Text style={styles.localNotice}>
            Delningen är fortfarande en lokal demo. Ingen coach har tagit emot datan.
          </Text>
        </Card>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderTitle}>Chatten är inte ansluten ännu</Text>
          <Text style={styles.placeholderText}>
            Meddelanden kan inte skickas förrän en coach och en chattjänst har kopplats in.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.composer}>
        <TextInput
          accessibilityLabel="Meddelande till coachen"
          editable={false}
          placeholder="Chatten är inte tillgänglig ännu"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <Button title="Skicka" disabled style={styles.sendButton} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
  headerText: { flex: 1, gap: 3 },
  coachName: { fontSize: 17, fontWeight: '700', color: colors.ink },
  messages: { flexGrow: 1, padding: 20, gap: 16 },
  dateLabel: {
    alignSelf: 'center',
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  coachMessage: {
    alignSelf: 'flex-start',
    maxWidth: '88%',
    borderRadius: radius.lg,
    borderBottomLeftRadius: 5,
    backgroundColor: colors.card,
    padding: 14,
  },
  messageText: { color: colors.ink, fontSize: 15, lineHeight: 22 },
  historyCard: { gap: 8, marginTop: 8 },
  historyTitle: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  localNotice: { color: colors.todayText, fontSize: 12, lineHeight: 17 },
  placeholder: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 18, gap: 6 },
  placeholderTitle: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  placeholderText: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 8,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    backgroundColor: colors.soft,
    paddingHorizontal: 16,
    color: colors.ink,
  },
  sendButton: { height: 48, paddingHorizontal: 16 },
});
