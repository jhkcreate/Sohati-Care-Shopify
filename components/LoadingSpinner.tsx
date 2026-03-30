import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';

interface Props {
  size?: 'small' | 'large';
}

export function LoadingSpinner({ size = 'large' }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
