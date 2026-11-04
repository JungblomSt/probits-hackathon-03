import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, type } from '../theme';
import Icon from './Icon';

export function Button({ title, onPress, variant = 'primary', icon, style, disabled }) {
  const outline = variant === 'outline';
  const fg = outline ? colors.ink : '#FFFFFF';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        outline ? styles.buttonOutline : styles.buttonPrimary,
        (pressed || disabled) && { opacity: disabled ? 0.4 : 0.8 },
        style,
      ]}
    >
      {icon && <Icon name={icon} size={20} color={fg} />}
      <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

export function IconButton({ icon, onPress, label, color = colors.ink, style }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.6 }, style]}
    >
      <Icon name={icon} color={color} />
    </Pressable>
  );
}

// Knapprad där en är vald (t.ex. tid eller svårighetsgrad)
export function ChoiceRow({ options, value, onChange, dark = true }) {
  return (
    <View style={styles.row}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(o.value)}
            style={[
              styles.choice,
              selected && (dark ? styles.choiceSelectedDark : styles.choiceSelectedAccent),
            ]}
          >
            <Text style={[styles.choiceText, selected && { color: '#FFFFFF' }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Segmented({ options, value, onChange }) {
  return (
    <View style={styles.segmented}>
      {options.map((o) => {
        const selected = o === value;
        return (
          <Pressable
            key={o}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(o)}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            <Text style={[styles.segmentText, selected && { fontWeight: '600' }]}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Stepper({ value, onChange, step = 1, min = 0, max = 999, format = (v) => v, label }) {
  return (
    <View style={styles.stepper}>
      <Pressable
        accessibilityLabel={`Minska ${label}`}
        onPress={() => onChange(Math.max(min, value - step))}
        style={styles.stepBtn}
      >
        <Text style={styles.stepBtnText}>−</Text>
      </Pressable>
      <Text style={styles.stepValue}>{format(value)}</Text>
      <Pressable
        accessibilityLabel={`Öka ${label}`}
        onPress={() => onChange(Math.min(max, value + step))}
        style={styles.stepBtn}
      >
        <Text style={styles.stepBtnText}>+</Text>
      </Pressable>
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Label({ children, style }) {
  return <Text style={[type.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  buttonPrimary: { backgroundColor: colors.accent },
  buttonOutline: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.ink },
  buttonText: { fontSize: 16, fontWeight: '600' },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', gap: 8 },
  choice: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceSelectedDark: { backgroundColor: colors.ink, borderColor: colors.ink },
  choiceSelectedAccent: { backgroundColor: colors.accent, borderColor: colors.accent },
  choiceText: { fontSize: 14, fontWeight: '600', color: colors.ink },
  segmented: {
    flexDirection: 'row',
    backgroundColor: '#E4E7DF',
    borderRadius: radius.md,
    padding: 3,
    gap: 3,
    height: 48,
  },
  segment: { flex: 1, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  segmentSelected: {
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  segmentText: { fontSize: 13, color: colors.ink },
  stepper: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { fontSize: 20, color: colors.ink },
  stepValue: { fontSize: 15, fontWeight: '600', color: colors.ink },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
  },
});
