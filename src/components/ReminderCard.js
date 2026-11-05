import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { formatTime } from '../lib/week';
import { colors } from '../theme';
import Icon from './Icon';
import { Card } from './ui';

// Påminnelse för en aktivitet: av/på, klockslag och extra notis kvällen innan
export default function ReminderCard({
  enabled,
  onToggle,
  time,
  onTimeChange,
  eveningBefore,
  onEveningBeforeChange,
  eveningBeforeHour,
}) {
  const [showIosPicker, setShowIosPicker] = useState(false);

  const pickerDate = () => {
    const d = new Date();
    d.setHours(time.hour, time.minute, 0, 0);
    return d;
  };

  const onPickTime = (_event, date) => {
    if (date) onTimeChange({ hour: date.getHours(), minute: date.getMinutes() });
  };

  // Android visar en egen dialog, iOS visar hjulet direkt i kortet
  const openTimePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({ value: pickerDate(), mode: 'time', is24Hour: true, onChange: onPickTime });
    } else {
      setShowIosPicker((v) => !v);
    }
  };

  return (
    <Card style={{ gap: 12 }}>
      <View style={styles.head}>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Icon name="bell" size={20} color={colors.today} />
          <Text style={styles.title}>Påminnelse</Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ true: colors.accent, false: colors.lineStrong }}
          thumbColor="#FFFFFF"
        />
      </View>
      {enabled && (
        <>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Pressable onPress={openTimePicker} style={[styles.pill, styles.pillTime]}>
              <Text style={styles.pillTimeText}>{formatTime(time.hour, time.minute)}</Text>
            </Pressable>
            <Pressable
              onPress={() => onEveningBeforeChange(!eveningBefore)}
              accessibilityState={{ selected: eveningBefore }}
              style={[styles.pill, eveningBefore && styles.pillOn]}
            >
              <Text style={[styles.pillText, eveningBefore && { color: colors.accentDark }]}>
                {eveningBefore ? '✓ ' : '+ '}Kvällen innan {formatTime(eveningBeforeHour, 0)}
              </Text>
            </Pressable>
          </View>
          {showIosPicker && Platform.OS === 'ios' && (
            <DateTimePicker
              value={pickerDate()}
              mode="time"
              display="spinner"
              onChange={onPickTime}
              locale="sv-SE"
            />
          )}
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 15, fontWeight: '600', color: colors.ink },
  pill: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: colors.soft },
  pillOn: { backgroundColor: colors.accentSoft },
  pillText: { fontSize: 14, color: colors.ink },
  pillTime: { backgroundColor: colors.todaySoft },
  pillTimeText: { fontSize: 14, fontWeight: '600', color: colors.todayText },
});
