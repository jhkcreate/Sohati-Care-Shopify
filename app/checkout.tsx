import { StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Colors } from '../constants/theme';

export default function CheckoutScreen() {
  const { url } = useLocalSearchParams<{ url: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {url ? (
        <WebView source={{ uri: url }} style={styles.webview} />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
