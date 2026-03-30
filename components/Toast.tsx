import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

interface Props {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
  action?: { label: string; onPress: () => void };
}

export function Toast({ message, visible, onDismiss, duration = 2500, action }: Props) {
  const translateY = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    } else {
      Animated.timing(translateY, { toValue: 100, duration: 200, useNativeDriver: true }).start();
    }
  }, [visible, translateY, onDismiss, duration]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
      <Text style={styles.message}>{message}</Text>
      {action && (
        <TouchableOpacity onPress={action.onPress}>
          <Text style={styles.action}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.text,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    elevation: 6,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  message: {
    flex: 1,
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  action: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});
