import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

interface Props {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
}

export function QuantityStepper({ quantity, onIncrement, onDecrement, min = 1, max = 99 }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, quantity <= min && styles.buttonDisabled]}
        onPress={onDecrement}
        disabled={quantity <= min}
      >
        <Ionicons name="remove" size={18} color={quantity <= min ? Colors.textLight : Colors.text} />
      </TouchableOpacity>
      <Text style={styles.quantity}>{quantity}</Text>
      <TouchableOpacity
        style={[styles.button, quantity >= max && styles.buttonDisabled]}
        onPress={onIncrement}
        disabled={quantity >= max}
      >
        <Ionicons name="add" size={18} color={quantity >= max ? Colors.textLight : Colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  button: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  quantity: {
    width: 40,
    textAlign: 'center',
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
});
