import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatSteps } from '../lib/week';
import { colors, type } from '../theme';
import { Stepper } from './ui';

// Ett alternativ med radioknapp. children visas under texten när det är valt
function RadioOption({ selected, onPress, title, description, disabled, children }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      onPress={onPress}
      disabled={disabled}
      style={[styles.option, selected && styles.optionOn, disabled && { opacity: 0.4 }]}
    >
      <View style={[styles.radio, selected && styles.radioOn]} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={type.small}>{description}</Text>
        {selected && children}
      </View>
    </Pressable>
  );
}

export default function DoneModePicker({
  mode,
  onModeChange,
  stepGoal,
  onStepGoalChange,
  stepsAllowed = true,
}) {
  return (
    <>
      <RadioOption
        selected={mode === 'steps'}
        onPress={() => onModeChange('steps')}
        title="Automatiskt via stegräknaren"
        description={
          stepsAllowed
            ? 'Markeras klar när du nått stegmålet den dagen.'
            : 'Den här aktiviteten ger inga steg, så du bockar av den själv.'
        }
        disabled={!stepsAllowed}
      >
        <View style={{ marginTop: 6 }}>
          <Stepper
            label="stegmål"
            value={stepGoal}
            onChange={onStepGoalChange}
            step={500}
            min={500}
            max={40000}
            format={(v) => `${formatSteps(v)} steg`}
          />
        </View>
      </RadioOption>
      <RadioOption
        selected={mode === 'manual'}
        onPress={() => onModeChange('manual')}
        title="Jag bockar av själv"
        description="För yoga, simning, styrka …"
      />
    </>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.card,
  },
  optionOn: { borderWidth: 2, borderColor: colors.accent },
  optionTitle: { fontSize: 15, fontWeight: '600', color: colors.ink },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#A9B0A3', marginTop: 1 },
  radioOn: { borderWidth: 6, borderColor: colors.accent },
});
